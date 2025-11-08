/**
 * WebSocket transport for MCP server.
 * Used by clients like Claude Desktop.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Transport, MessageHandler } from './base.js';

export class WebSocketTransport implements Transport {
  private wss?: WebSocketServer;
  private handler?: MessageHandler;
  private sockets: Set<WebSocket> = new Set();

  constructor(private port: number) {}

  async start(handler: MessageHandler): Promise<void> {
    this.handler = handler;

    this.wss = new WebSocketServer({ port: this.port });

    console.log(`Kiket MCP server listening on ws://localhost:${this.port}`);

    this.wss.on('connection', (socket) => {
      this.sockets.add(socket);

      socket.on('message', async (raw) => {
        try {
          const message = JSON.parse(raw.toString());
          const response = await handler(message);
          socket.send(JSON.stringify(response));
        } catch (error) {
          console.error('Failed to process message:', error);
        }
      });

      socket.on('close', () => {
        this.sockets.delete(socket);
      });
    });

    this.wss.on('error', (err) => {
      console.error('WebSocket server error:', err);
    });
  }

  async stop(): Promise<void> {
    // Close all client connections
    for (const socket of this.sockets) {
      socket.close();
    }
    this.sockets.clear();

    // Close server
    return new Promise((resolve, reject) => {
      if (this.wss) {
        this.wss.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }

  send(message: any): void {
    // Broadcast to all connected clients
    for (const socket of this.sockets) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    }
  }
}
