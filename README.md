# Kiket MCP Server

Model Context Protocol (MCP) server that lets tools manipulate Kiket issues (list, fetch, create, update, transition) through a WebSocket interface.

## Quick Start

```bash
cd mcp-server
cp .env.example .env.local
# fill in KIKET_API_URL and KIKET_API_KEY (can be a personal access token)

npm install
npm run dev
```

The server listens on `ws://localhost:3001` by default. Configure a MCP client to connect and invoke the following tools:

| Tool | Description |
| --- | --- |
| `listIssues` | List issues with optional filters (`status`, `assignee_id`, `label`, `project_key`). |
| `getIssue` | Fetch a single issue by ID or key. |
| `createIssue` | Create a new issue. `title` is required; if `project_key` is omitted the default from env is used. |
| `updateIssue` | Update fields on an existing issue. Provide `id` and any fields to change. |
| `transitionIssue` | Apply a workflow transition (`transition` key) to an issue. |

### Environment Variables

- `KIKET_API_URL` – Base URL of your Kiket instance (e.g. `https://app.kiket.dev`).
- `KIKET_API_KEY` – API token with issue read/write permissions.
- `KIKET_PROJECT_KEY` *(optional)* – Default project key when creating or listing issues.
- `KIKET_VERIFY_SSL` *(optional, default `true`)* – Set to `false` to skip TLS verification in development.
- `MCP_PORT` *(optional)* – WebSocket port (defaults to `3001`).

### MCP Manifest

`mcp.json` advertises:

```json
{
  "name": "kiket-mcp-server",
  "version": "0.1.0",
  "capabilities": { "tools": true },
  "defaultPort": 3001
}
```

Configure your MCP client to load this manifest and connect to the server.

## Scripts

- `npm run dev` – start the MCP WebSocket server (ts-node, auto recompilation friendly).
- `npm run lint` – run ESLint.
- `npm run test` – execute Vitest unit tests.
- `npm run build` – compile TypeScript to `dist/`.

## Testing

Vitest covers the Kiket client and tool behaviors. Tests run offline by mocking the Kiket REST API, so no external dependency is required.

```bash
npm test
```

## MCP Client Configuration Examples

### OpenAI Codex / `o3-mini` CLI

Add the manifest to `~/.config/openai/mcp.json` (create the file if it does not exist):

```json
{
  "servers": {
    "kiket": {
      "command": "node",
      "args": [
        "--loader",
        "ts-node/esm",
        "/path/to/kiket/mcp-server/src/server.ts"
      ],
      "env": {
        "KIKET_API_URL": "https://app.kiket.dev",
        "KIKET_API_KEY": "sk-...",
        "KIKET_PROJECT_KEY": "KIKET"
      }
    }
  }
}
```

Restart the Codex CLI and run `@tools list` to confirm the Kiket tools are available.

### Claude Desktop / `claude_app_config.json`

Update Claude’s MCP configuration (macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "kiket": {
      "type": "websocket",
      "transport": {
        "type": "websocket",
        "url": "ws://localhost:3001"
      },
      "env": {
        "KIKET_API_URL": "https://app.kiket.dev",
        "KIKET_API_KEY": "sk-...",
        "KIKET_PROJECT_KEY": "KIKET"
      }
    }
  }
}
```

Run `npm run dev` beforehand so the WebSocket server is listening.

### Gemini CLI (`aistudio`)

Create or update `~/.config/aistudio/mcp_servers.json`:

```json
{
  "kiket": {
    "command": "node",
    "args": [
      "--loader",
      "ts-node/esm",
      "/path/to/kiket/mcp-server/src/server.ts"
    ],
    "env": {
      "KIKET_API_URL": "https://app.kiket.dev",
      "KIKET_API_KEY": "sk-..."
    }
  }
}
```

Run `aistudio mcp list` to ensure the server registers correctly.

### GitHub Copilot CLI

Edit `~/.config/github-copilot/mcp.json`:

```json
{
  "servers": {
    "kiket": {
      "command": "node",
      "args": [
        "--loader",
        "ts-node/esm",
        "/path/to/kiket/mcp-server/src/server.ts"
      ],
      "env": {
        "KIKET_API_URL": "https://app.kiket.dev",
        "KIKET_API_KEY": "ghp_...",
        "KIKET_PROJECT_KEY": "KIKET"
      }
    }
  }
}
```

Restart the Copilot CLI (`copilot logout && copilot login`) or run `copilot mcp list` to refresh the session.
