/**
 * Standard I/O transport for MCP server.
 * Used by clients like OpenAI Codex, Gemini, GitHub Copilot.
 */

import { Transport, MessageHandler } from './base.js';
import * as readline from 'readline';

export class StdioTransport implements Transport {
  private rl?: readline.Interface;
  private handler?: MessageHandler;

  async start(handler: MessageHandler): Promise<void> {
    this.handler = handler;

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    this.rl.on('line', async (line) => {
      try {
        const message = JSON.parse(line);
        const response = await handler(message);
        this.send(response);
      } catch (error) {
        console.error('Failed to process message:', error);
      }
    });

    // Keep process alive
    process.stdin.resume();
  }

  async stop(): Promise<void> {
    if (this.rl) {
      this.rl.close();
    }
  }

  send(message: any): void {
    process.stdout.write(JSON.stringify(message) + '\n');
  }
}
