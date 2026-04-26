import { KiketClient } from '@kiket/api-client';

export type McpEnv = Record<string, string | undefined>;

export function createMcpClient(env: McpEnv = process.env, fetchImpl?: typeof fetch): KiketClient {
  const token = env.KIKET_API_TOKEN;
  const apiKey = env.KIKET_API_KEY;
  const auth = token ? { kind: 'jwt' as const, token } : apiKey ? { kind: 'apiKey' as const, apiKey } : undefined;

  if (!auth) throw new Error('Set KIKET_API_TOKEN or KIKET_API_KEY before starting the Kiket MCP server.');
  if (!env.KIKET_ORGANIZATION_ID) {
    throw new Error('Set KIKET_ORGANIZATION_ID so MCP tools run in an explicit tenant context.');
  }

  return new KiketClient({
    baseUrl: env.KIKET_API_URL ?? 'http://localhost:3000',
    auth,
    organizationId: env.KIKET_ORGANIZATION_ID,
    userAgent: '@kiket/mcp',
    fetchImpl,
  });
}
