import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MCPHandler } from '../src/mcp-handler.js';
import { IssueTools } from '../src/tools/issues.js';
import { JSON_RPC_ERRORS } from '../src/errors/index.js';

vi.mock('../src/tools/issues.js');

describe('MCPHandler', () => {
  let handler: MCPHandler;
  let mockIssueTools: any;

  beforeEach(() => {
    mockIssueTools = {
      listToolDefinitions: vi.fn().mockReturnValue([
        { name: 'listIssues', description: 'List issues', inputSchema: {} },
        { name: 'createIssue', description: 'Create issue', inputSchema: {} }
      ]),
      call: vi.fn()
    };

    handler = new MCPHandler(mockIssueTools);
  });

  describe('initialize', () => {
    it('should handle initialize request', async () => {
      const message = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {}
      };

      const response = await handler.handleMessage(message);

      expect(response).toEqual({
        jsonrpc: '2.0',
        id: 1,
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
      });
    });
  });

  describe('tools/list', () => {
    it('should list available tools', async () => {
      const message = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      };

      const response = await handler.handleMessage(message);

      expect(response).toEqual({
        jsonrpc: '2.0',
        id: 2,
        result: {
          tools: mockIssueTools.listToolDefinitions()
        }
      });
      expect(mockIssueTools.listToolDefinitions).toHaveBeenCalled();
    });
  });

  describe('tools/call', () => {
    it('should call a tool successfully', async () => {
      const toolResult = { issues: [{ id: 1, title: 'Test' }] };
      mockIssueTools.call.mockResolvedValue(toolResult);

      const message = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'listIssues',
          arguments: { status: 'open' }
        }
      };

      const response = await handler.handleMessage(message);

      expect(response).toEqual({
        jsonrpc: '2.0',
        id: 3,
        result: toolResult
      });
      expect(mockIssueTools.call).toHaveBeenCalledWith('listIssues', { status: 'open' });
    });

    it('should handle tool errors', async () => {
      mockIssueTools.call.mockRejectedValue(new Error('Tool failed'));

      const message = {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'createIssue',
          arguments: {}
        }
      };

      const response = await handler.handleMessage(message);

      expect(response).toMatchObject({
        jsonrpc: '2.0',
        id: 4,
        error: {
          code: JSON_RPC_ERRORS.INTERNAL_ERROR,
          message: 'Tool failed'
        }
      });
    });

    it('should use empty object for missing arguments', async () => {
      mockIssueTools.call.mockResolvedValue({ issues: [] });

      const message = {
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'listIssues'
        }
      };

      await handler.handleMessage(message);

      expect(mockIssueTools.call).toHaveBeenCalledWith('listIssues', {});
    });
  });

  describe('ping', () => {
    it('should respond to ping', async () => {
      const message = {
        jsonrpc: '2.0',
        id: 6,
        method: 'ping'
      };

      const response = await handler.handleMessage(message);

      expect(response).toEqual({
        jsonrpc: '2.0',
        id: 6,
        result: 'pong'
      });
    });
  });

  describe('unknown method', () => {
    it('should return method not found error', async () => {
      const message = {
        jsonrpc: '2.0',
        id: 7,
        method: 'unknown/method'
      };

      const response = await handler.handleMessage(message);

      expect(response).toMatchObject({
        jsonrpc: '2.0',
        id: 7,
        error: {
          code: JSON_RPC_ERRORS.METHOD_NOT_FOUND,
          message: expect.stringContaining('unknown/method')
        }
      });
    });
  });

  describe('missing method', () => {
    it('should ignore message without method', async () => {
      const message = {
        jsonrpc: '2.0',
        id: 8
      };

      const response = await handler.handleMessage(message);

      expect(response).toBeUndefined();
    });
  });
});
