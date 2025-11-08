/**
 * MCP protocol message handler.
 */

import { IssueTools } from './tools/issues.js';
import { errorToJsonRpcCode, JSON_RPC_ERRORS } from './errors/index.js';

export class MCPHandler {
  constructor(private issueTools: IssueTools) {}

  async handleMessage(message: any): Promise<any> {
    const { id, method, params } = message;

    if (!method) {
      return;
    }

    try {
      switch (method) {
        case 'initialize':
          return {
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
          };

        case 'tools/list':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              tools: this.issueTools.listToolDefinitions()
            }
          };

        case 'tools/call': {
          const { name, arguments: args } = params ?? {};
          try {
            const result = await this.issueTools.call(name, args ?? {});
            return {
              jsonrpc: '2.0',
              id,
              result
            };
          } catch (error) {
            const errorCode =
              error instanceof Error ? errorToJsonRpcCode(error) : JSON_RPC_ERRORS.INTERNAL_ERROR;
            const errorMessage = error instanceof Error ? error.message : 'Tool execution failed';
            const errorData =
              error instanceof Error && 'details' in error ? (error as any).details : undefined;

            return {
              jsonrpc: '2.0',
              id,
              error: {
                code: errorCode,
                message: errorMessage,
                data: errorData
              }
            };
          }
        }

        case 'ping':
          return { jsonrpc: '2.0', id, result: 'pong' };

        default:
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: JSON_RPC_ERRORS.METHOD_NOT_FOUND,
              message: `Method ${method} not implemented`
            }
          };
      }
    } catch (error) {
      console.error('Handler error:', error);
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: JSON_RPC_ERRORS.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Internal error'
        }
      };
    }
  }
}
