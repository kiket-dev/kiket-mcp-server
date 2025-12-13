/**
 * MCP protocol message handler.
 */

import { IssueTools } from './tools/issues.js';
import { ProjectTools } from './tools/projects.js';
import { UserTools } from './tools/users.js';
import { MilestoneTools } from './tools/milestones.js';
import { PromptsHandler } from './prompts/index.js';
import { errorToJsonRpcCode, JSON_RPC_ERRORS } from './errors/index.js';
import { log } from './utils/logger.js';
import { randomUUID } from 'crypto';

export class MCPHandler {
  private promptsHandler: PromptsHandler;

  constructor(
    private issueTools: IssueTools,
    private projectTools: ProjectTools,
    private userTools: UserTools,
    private milestoneTools: MilestoneTools
  ) {
    this.promptsHandler = new PromptsHandler();
  }

  async handleMessage(message: Record<string, unknown>): Promise<Record<string, unknown> | undefined> {
    const { id, method, params } = message;
    const requestId = randomUUID();
    const startTime = Date.now();

    if (!method || typeof method !== 'string') {
      return;
    }

    log.request('Incoming MCP request', {
      requestId,
      method,
      params: method === 'tools/call' && params && typeof params === 'object' ? { name: (params as Record<string, unknown>).name } : undefined
    });

    try {
      switch (method) {
        case 'initialize':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: '2024-11-05',
              serverInfo: {
                name: 'kiket-mcp-server',
                version: '0.1.0'
              },
              capabilities: {
                tools: {
                  list: true,
                  call: true
                },
                prompts: {
                  list: true,
                  get: true
                }
              }
            }
          };

        case 'notifications/initialized':
          // Notification - no response needed
          return undefined;

        case 'tools/list':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              tools: [
                ...this.issueTools.listToolDefinitions(),
                ...this.projectTools.listToolDefinitions(),
                ...this.userTools.listToolDefinitions(),
                ...this.milestoneTools.listToolDefinitions()
              ]
            }
          };

        case 'tools/call': {
          const toolParams = (params as Record<string, unknown>) ?? {};
          const { name, arguments: args } = toolParams;
          const toolName = name as string;
          const toolArgs = args ?? {};
          try {
            // Try each tool handler in order
            let result;
            try {
              result = await this.issueTools.call(toolName, toolArgs);
            } catch (e) {
              if (e instanceof Error && e.message.includes('Unknown tool')) {
                try {
                  result = await this.projectTools.call(toolName, toolArgs);
                } catch (e2) {
                  if (e2 instanceof Error && e2.message.includes('Unknown tool')) {
                    try {
                      result = await this.userTools.call(toolName, toolArgs);
                    } catch (e3) {
                      if (e3 instanceof Error && e3.message.includes('Unknown tool')) {
                        result = await this.milestoneTools.call(toolName, toolArgs);
                      } else {
                        throw e3;
                      }
                    }
                  } else {
                    throw e2;
                  }
                }
              } else {
                throw e;
              }
            }

            return {
              jsonrpc: '2.0',
              id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                  }
                ]
              }
            };
          } catch (error) {
            const errorCode =
              error instanceof Error ? errorToJsonRpcCode(error) : JSON_RPC_ERRORS.INTERNAL_ERROR;
            const errorMessage = error instanceof Error ? error.message : 'Tool execution failed';
            const errorData =
              error instanceof Error && 'details' in error ? (error as Record<string, unknown>).details : undefined;

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

        case 'prompts/list':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              prompts: this.promptsHandler.listPrompts()
            }
          };

        case 'prompts/get': {
          const promptParams = (params as Record<string, unknown>) ?? {};
          const { name, arguments: promptArgs } = promptParams;
          const promptName = name as string;
          const promptArguments = (promptArgs as Record<string, string>) ?? {};

          if (!promptName) {
            return {
              jsonrpc: '2.0',
              id,
              error: {
                code: JSON_RPC_ERRORS.INVALID_PARAMS,
                message: 'Prompt name is required'
              }
            };
          }

          const result = this.promptsHandler.getPrompt(promptName, promptArguments);

          if (!result) {
            return {
              jsonrpc: '2.0',
              id,
              error: {
                code: JSON_RPC_ERRORS.INVALID_PARAMS,
                message: `Unknown prompt: ${promptName}`
              }
            };
          }

          return {
            jsonrpc: '2.0',
            id,
            result
          };
        }

        case 'ping':
          log.debug('Ping request', { requestId });
          return { jsonrpc: '2.0', id: id as string, result: 'pong' };

        default:
          log.warn('Unknown method', { requestId, method });
          return {
            jsonrpc: '2.0',
            id: id as string,
            error: {
              code: JSON_RPC_ERRORS.METHOD_NOT_FOUND,
              message: `Method ${method} not implemented`
            }
          };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      log.requestError('Handler error', {
        requestId,
        method,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: JSON_RPC_ERRORS.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Internal error'
        }
      };
    } finally {
      const duration = Date.now() - startTime;
      log.request('Request completed', {
        requestId,
        method,
        duration,
        toolName: method === 'tools/call' && params && typeof params === 'object' ? (params as Record<string, unknown>).name as string | undefined : undefined
      });
    }
  }
}
