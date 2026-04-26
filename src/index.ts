#!/usr/bin/env node
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { createMcpClient } from './client.js';
import { callTool, tools } from './tools.js';

const client = createMcpClient();
const lines = createInterface({ input, output: process.stderr });

for await (const line of lines) {
  if (!line.trim()) continue;
  const request = JSON.parse(line) as { id?: unknown; method?: string; params?: Record<string, unknown> };
  try {
    const result =
      request.method === 'tools/list'
        ? { tools }
        : request.method === 'tools/call'
          ? {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await callTool(
                      client,
                      String(request.params?.name ?? ''),
                      (request.params?.arguments as Record<string, unknown> | undefined) ?? {},
                    ),
                    null,
                    2,
                  ),
                },
              ],
            }
          : (() => {
              throw new Error(`Unsupported MCP method "${request.method ?? ''}".`);
            })();
    output.write(`${JSON.stringify({ jsonrpc: '2.0', id: request.id, result })}\n`);
  } catch (error) {
    output.write(
      `${JSON.stringify({
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32000, message: error instanceof Error ? error.message : 'MCP request failed' },
      })}\n`,
    );
  }
}
