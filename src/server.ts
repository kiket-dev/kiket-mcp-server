import { loadEnv } from './utils/env.js';
import { KiketClient } from './clients/kiket.js';
import { IssueTools } from './tools/issues.js';
import { ProjectTools } from './tools/projects.js';
import { UserTools } from './tools/users.js';
import { MCPHandler } from './mcp-handler.js';
import { StdioTransport } from './transports/stdio.js';
import { WebSocketTransport } from './transports/websocket.js';
import { HealthServer } from './health.js';

const env = loadEnv();
const port = Number(process.env.MCP_PORT || 3001);
const healthPort = Number(process.env.HEALTH_PORT || 8080);
const transportType = process.env.MCP_TRANSPORT || 'websocket';

const client = new KiketClient({
  baseUrl: env.apiUrl,
  apiKey: env.apiKey,
  verifySSL: env.verifySSL
});

const issueTools = new IssueTools(client, env.projectKey);
const projectTools = new ProjectTools(client);
const userTools = new UserTools(client);
const handler = new MCPHandler(issueTools, projectTools, userTools);

// Select transport based on environment
const transport =
  transportType === 'stdio' ? new StdioTransport() : new WebSocketTransport(port);

// Start health check server (only for WebSocket mode)
let healthServer: HealthServer | undefined;
if (transportType !== 'stdio') {
  healthServer = new HealthServer(healthPort, client);
  healthServer.start();
}

// Start MCP server
transport
  .start((message) => handler.handleMessage(message))
  .catch((err) => {
    console.error('Failed to start MCP server:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down MCP server...');
  await transport.stop();
  if (healthServer) await healthServer.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down MCP server...');
  await transport.stop();
  if (healthServer) await healthServer.stop();
  process.exit(0);
});
