import type { McpTool } from './tools.js';

const SUPPORTED_PROTOCOL_VERSIONS = ['2024-11-05', '2025-03-26', '2025-06-18'] as const;
const SERVER_NAME = '@kiket/mcp';
const SERVER_VERSION = '0.1.0';

export interface JsonRpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcSuccess {
  jsonrpc: '2.0';
  id: string | number | null | undefined;
  result: Record<string, unknown>;
}

export interface JsonRpcFailure {
  jsonrpc: '2.0';
  id: string | number | null | undefined;
  error: { code: number; message: string };
}

export type JsonRpcResponse = JsonRpcSuccess | JsonRpcFailure;

export interface McpRequestContext {
  tools: McpTool[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

export function isNotification(request: JsonRpcRequest): boolean {
  return request.id === undefined || request.id === null;
}

export async function handleMcpRequest(
  request: JsonRpcRequest,
  context: McpRequestContext,
): Promise<JsonRpcResponse | null> {
  const method = request.method ?? '';

  if (method.startsWith('notifications/') || isNotification(request)) {
    return null;
  }

  try {
    const result = await dispatchMethod(method, request.params ?? {}, context);
    return { jsonrpc: '2.0', id: request.id, result };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32000,
        message: error instanceof Error ? error.message : 'MCP request failed',
      },
    };
  }
}

async function dispatchMethod(
  method: string,
  params: Record<string, unknown>,
  context: McpRequestContext,
): Promise<Record<string, unknown>> {
  switch (method) {
    case 'initialize':
      return handleInitialize(params);
    case 'ping':
      return {};
    case 'tools/list':
      return { tools: context.tools };
    case 'tools/call':
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              await context.callTool(
                String(params.name ?? ''),
                (params.arguments as Record<string, unknown> | undefined) ?? {},
              ),
              null,
              2,
            ),
          },
        ],
      };
    case 'resources/list':
      return { resources: [] };
    case 'prompts/list':
      return { prompts: [] };
    default:
      throw new Error(`Unsupported MCP method "${method}".`);
  }
}

function handleInitialize(params: Record<string, unknown>): Record<string, unknown> {
  const requestedVersion = typeof params.protocolVersion === 'string' ? params.protocolVersion : '';
  const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(
    requestedVersion as (typeof SUPPORTED_PROTOCOL_VERSIONS)[number],
  )
    ? requestedVersion
    : SUPPORTED_PROTOCOL_VERSIONS[0];

  return {
    protocolVersion,
    capabilities: {
      tools: {},
    },
    serverInfo: {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
  };
}
