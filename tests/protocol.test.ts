import { describe, expect, it, vi } from 'vitest';
import { handleMcpRequest, isNotification } from '../src/protocol.js';
import { tools } from '../src/tools.js';

describe('MCP protocol', () => {
  it('treats requests without ids as notifications', () => {
    expect(isNotification({ method: 'notifications/initialized' })).toBe(true);
    expect(isNotification({ id: 1, method: 'tools/list' })).toBe(false);
  });

  it('does not respond to notifications', async () => {
    const response = await handleMcpRequest(
      { jsonrpc: '2.0', method: 'notifications/initialized' },
      { tools, callTool: vi.fn() },
    );
    expect(response).toBeNull();
  });

  it('handles initialize with negotiated protocol version', async () => {
    const response = await handleMcpRequest(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-03-26',
          capabilities: {},
          clientInfo: { name: 'cursor', version: '1.0.0' },
        },
      },
      { tools, callTool: vi.fn() },
    );

    expect(response).toMatchObject({
      jsonrpc: '2.0',
      id: 1,
      result: {
        protocolVersion: '2025-03-26',
        capabilities: { tools: {} },
        serverInfo: { name: '@kiket/mcp', version: '0.1.0' },
      },
    });
  });

  it('handles ping, tools/list, and empty capability lists', async () => {
    const context = { tools, callTool: vi.fn() };

    await expect(handleMcpRequest({ id: 2, method: 'ping' }, context)).resolves.toEqual({
      jsonrpc: '2.0',
      id: 2,
      result: {},
    });
    await expect(handleMcpRequest({ id: 3, method: 'tools/list' }, context)).resolves.toMatchObject({
      result: { tools },
    });
    await expect(handleMcpRequest({ id: 4, method: 'resources/list' }, context)).resolves.toEqual({
      jsonrpc: '2.0',
      id: 4,
      result: { resources: [] },
    });
    await expect(handleMcpRequest({ id: 5, method: 'prompts/list' }, context)).resolves.toMatchObject({
      result: {
        prompts: expect.arrayContaining([expect.objectContaining({ name: 'kiket_investigate_case' })]),
      },
    });
  });

  it('serializes tool call results into MCP content blocks', async () => {
    const callTool = vi.fn(async () => [{ id: 'workspace-1' }]);
    const response = await handleMcpRequest(
      {
        id: 6,
        method: 'tools/call',
        params: { name: 'kiket_list_workspaces', arguments: {} },
      },
      { tools, callTool },
    );

    expect(callTool).toHaveBeenCalledWith('kiket_list_workspaces', {});
    expect(response).toEqual({
      jsonrpc: '2.0',
      id: 6,
      result: {
        content: [{ type: 'text', text: JSON.stringify([{ id: 'workspace-1' }], null, 2) }],
      },
    });
  });
});
