#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { strategyPrompt } from './prompts/strategy.js';
import { registerTools } from './tools/register-tools.js';

const server = new McpServer({
  name: '@kiket/mcp',
  version: '0.1.0',
});

registerTools(server, {
  baseUrl: process.env.KIKET_API_URL ?? 'http://localhost:3000',
  authToken: process.env.KIKET_API_TOKEN,
  apiKey: process.env.KIKET_API_KEY,
  organizationId: process.env.KIKET_ORGANIZATION_ID,
});

server.prompt('kiket_strategy', 'Explain the strategy and future vision of the Kiket MCP server.', {}, async () => ({
  messages: [
    {
      role: 'user',
      content: {
        type: 'text',
        text: strategyPrompt,
      },
    },
  ],
}));

const transport = new StdioServerTransport();
await server.connect(transport);
