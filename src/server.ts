import { WebSocketServer } from 'ws';
import { loadEnv } from './utils/env.js';
import { KiketClient } from './clients/kiket.js';
import { IssueTools } from './tools/issues.js';

const env = loadEnv();
const port = Number(process.env.MCP_PORT || 3001);

const client = new KiketClient({
  baseUrl: env.apiUrl,
  apiKey: env.apiKey,
  verifySSL: env.verifySSL
});

const issueTools = new IssueTools(client, env.projectKey);

const server = new WebSocketServer({ port });
console.log(`Kiket MCP server listening on ws://localhost:${port}`);

server.on('connection', (socket) => {
  socket.on('message', async (raw) => {
    try {
      const message = JSON.parse(raw.toString());
      const { id, method, params } = message;

      if (!method) {
        return;
      }

      switch (method) {
        case 'initialize':
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id,
              result: {
                protocolVersion: '0.1',
                serverInfo: {
                  name: 'kiket-mcp-server',
                  version: '0.1.0'
                },
                capabilities: {
                  tools: {
                    list: true,
                    call: true
                  }
                }
              }
            })
          );
          break;
        case 'tools/list':
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id,
              result: {
                tools: issueTools.listToolDefinitions()
              }
            })
          );
          break;
        case 'tools/call': {
          const { name, arguments: args } = params ?? {};
          try {
            const result = await issueTools.call(name, args ?? {});
            socket.send(
              JSON.stringify({
                jsonrpc: '2.0',
                id,
                result
              })
            );
          } catch (error) {
            socket.send(
              JSON.stringify({
                jsonrpc: '2.0',
                id,
                error: {
                  code: -32001,
                  message: error instanceof Error ? error.message : 'Tool execution failed'
                }
              })
            );
          }
          break;
        }
        case 'ping':
          socket.send(JSON.stringify({ jsonrpc: '2.0', id, result: 'pong' }));
          break;
        default:
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id,
              error: {
                code: -32601,
                message: `Method ${method} not implemented`
              }
            })
          );
      }
    } catch (error) {
      console.error('Failed to process message', error);
    }
  });
});

server.on('error', (err) => {
  console.error('WebSocket server error', err);
});
