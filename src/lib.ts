import { KiketClient } from './kiket-client/index.js';

export interface McpRuntimeConfig {
  baseUrl: string;
  authToken?: string;
  apiKey?: string;
  organizationId?: string;
}

export function createRuntimeClient(config: McpRuntimeConfig): KiketClient {
  const auth = config.apiKey
    ? { kind: 'apiKey' as const, apiKey: config.apiKey }
    : config.authToken
      ? { kind: 'jwt' as const, token: config.authToken }
      : undefined;

  return new KiketClient({
    baseUrl: config.baseUrl,
    auth,
    organizationId: config.organizationId,
    userAgent: '@kiket/mcp',
  });
}
