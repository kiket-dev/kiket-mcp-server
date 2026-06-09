import type { McpTool } from './tools.js';

const SUPPORTED_PROTOCOL_VERSIONS = ['2024-11-05', '2025-03-26', '2025-06-18'] as const;
const SERVER_NAME = '@kiket/mcp';
const SERVER_VERSION = '0.1.0';

const INVESTIGATION_PROMPTS = [
  {
    name: 'kiket_investigate_case',
    description: 'Grounded case investigation playbook for agents using Kiket context bundles and proof primitives.',
    arguments: [{ name: 'caseId', description: 'Operational case UUID', required: true }],
  },
] as const;

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
      return { prompts: INVESTIGATION_PROMPTS };
    case 'prompts/get': {
      const name = String(params.name ?? '');
      if (name !== 'kiket_investigate_case') {
        throw new Error(`Unknown MCP prompt "${name}".`);
      }
      const caseId = String((params.arguments as Record<string, unknown> | undefined)?.caseId ?? '');
      if (!caseId) throw new Error('Missing required prompt argument "caseId".');
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: [
                'Investigate this Kiket operational case using deterministic platform APIs only.',
                `Case id: ${caseId}`,
                '',
                'Steps:',
                '1. Call kiket_get_case_context for workflow, SLA, open findings, and evidence summary.',
                '2. Call kiket_get_case_graph for linked evidence, findings, and events.',
                '3. For each open finding, call kiket_get_finding_context and cite finding IDs.',
                '4. When proof is required, call kiket_generate_proof_packet and reference packetHash.',
                '5. Never present model prose as compliance fact — cite record IDs and deep links.',
              ].join('\n'),
            },
          },
        ],
      };
    }
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
      prompts: {},
    },
    serverInfo: {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
  };
}
