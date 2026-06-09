#!/usr/bin/env node
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { createMcpClient } from './client.js';
import { handleMcpRequest, type JsonRpcRequest } from './protocol.js';
import { callTool, tools } from './tools.js';

const client = createMcpClient();
const lines = createInterface({ input, output: process.stderr });

for await (const line of lines) {
  if (!line.trim()) continue;

  const request = JSON.parse(line) as JsonRpcRequest;
  const response = await handleMcpRequest(request, {
    tools,
    callTool: (name, args) => callTool(client, name, args),
  });

  if (!response) continue;

  output.write(`${JSON.stringify(response)}\n`);
}
