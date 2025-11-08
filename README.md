# Kiket MCP Server

Model Context Protocol (MCP) server that provides AI tools to interact with Kiket issues, comments, projects, and users. Enables Claude, GitHub Copilot, OpenAI Codex, Gemini, and other AI assistants to manage Kiket programmatically.

## Features

- **17 MCP Tools** for comprehensive Kiket management:
  - **Issues** (5 tools):
    - `listIssues` - List issues with filters
    - `getIssue` - Fetch single issue
    - `createIssue` - Create new issue
    - `updateIssue` - Update issue fields
    - `transitionIssue` - Move issue through workflow
  - **Comments** (4 tools):
    - `listComments` - List comments on issue
    - `createComment` - Add comment to issue
    - `updateComment` - Update existing comment
    - `deleteComment` - Delete comment
  - **Projects** (5 tools):
    - `listProjects` - List all visible projects
    - `getProject` - Fetch single project
    - `createProject` - Create new project
    - `updateProject` - Update project settings
    - `deleteProject` - Archive/delete project
  - **Users** (3 tools):
    - `listUsers` - List project members
    - `getUser` - Fetch user details
    - `getCurrentUser` - Get authenticated user
- **Dual Transport Support**: WebSocket (Claude Desktop) and stdio (Codex, Copilot, Gemini)
- **Robust Error Handling**: Detailed JSON-RPC error codes with helpful messages
- **Health Checks**: HTTP endpoints for monitoring and Kubernetes readiness probes
- **Type-Safe**: Full TypeScript with Zod validation
- **Comprehensive Tests**: 55+ test cases with Vitest

## Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your KIKET_API_URL and KIKET_API_KEY
npm run dev
```

The server starts on:
- **WebSocket**: `ws://localhost:3001` (MCP protocol)
- **Health checks**: `http://localhost:8080` (HTTP)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `KIKET_API_URL` | - | Base URL of Kiket instance (e.g. `https://www.kiket.dev`) |
| `KIKET_API_KEY` | - | Personal access token with issue permissions |
| `KIKET_PROJECT_KEY` | - | Default project for operations (optional) |
| `KIKET_VERIFY_SSL` | `true` | Set to `false` to skip TLS verification in dev |
| `MCP_TRANSPORT` | `websocket` | Transport mode: `websocket` or `stdio` |
| `MCP_PORT` | `3001` | WebSocket port (websocket mode only) |
| `HEALTH_PORT` | `8080` | Health check HTTP port (websocket mode only) |

## Transport Modes

### WebSocket Mode (Default)

For clients like Claude Desktop that connect via WebSocket:

```bash
MCP_TRANSPORT=websocket npm run dev
```

### Stdio Mode

For clients like OpenAI Codex, Gemini, GitHub Copilot that use stdin/stdout:

```bash
MCP_TRANSPORT=stdio npm run dev
```

## Available Tools

### Issue Management

**`listIssues`**
```json
{
  "status": "open",
  "assignee_id": 42,
  "label": "bug",
  "project_key": "BACKEND",
  "search": "authentication",
  "page": 1,
  "per_page": 50
}
```

**`getIssue`**
```json
{
  "id": 123  // or "PROJ-45"
}
```

**`createIssue`**
```json
{
  "title": "Fix login bug",
  "description": "Users cannot log in",
  "project_key": "BACKEND",
  "priority": "high",
  "assignee_id": 42,
  "labels": ["bug", "security"]
}
```

**`updateIssue`**
```json
{
  "id": 123,
  "title": "Updated title",
  "priority": "critical",
  "assignee_id": 99
}
```

**`transitionIssue`**
```json
{
  "id": 123,
  "transition": "start_progress"
}
```

### Comment Management

**`listComments`**
```json
{
  "issue_id": 123
}
```

**`createComment`**
```json
{
  "issue_id": 123,
  "body": "This is fixed in PR #456"
}
```

**`updateComment`**
```json
{
  "issue_id": 123,
  "comment_id": 789,
  "body": "Updated comment text"
}
```

**`deleteComment`**
```json
{
  "issue_id": 123,
  "comment_id": 789
}
```

### Project Management

**`listProjects`**
```json
{
  "page": 1,
  "per_page": 50
}
```

**`getProject`**
```json
{
  "id": 5
}
```

**`createProject`**
```json
{
  "name": "Platform Redesign",
  "description": "Complete platform UI/UX overhaul",
  "project_key": "REDESIGN",
  "github_repo_url": "https://github.com/org/platform-redesign",
  "visibility": "private",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "lead_id": 42
}
```

**`updateProject`**
```json
{
  "id": 5,
  "name": "Updated Project Name",
  "description": "Updated description",
  "visibility": "team"
}
```

**`deleteProject`**
```json
{
  "id": 5
}
```

### User Management

**`listUsers`**
```json
{
  "page": 1,
  "per_page": 50
}
```

**`getUser`**
```json
{
  "id": 42
}
```

**`getCurrentUser`**
```json
{}
```

## Client Configuration

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "kiket": {
      "command": "node",
      "args": [
        "--loader",
        "ts-node/esm",
        "/path/to/kiket/mcp-server/src/server.ts"
      ],
      "env": {
        "KIKET_API_URL": "https://www.kiket.dev",
        "KIKET_API_KEY": "sk-...",
        "KIKET_PROJECT_KEY": "BACKEND"
      }
    }
  }
}
```

### OpenAI Codex / o3-mini CLI

Edit `~/.config/openai/mcp.json`:

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
        "MCP_TRANSPORT": "stdio",
        "KIKET_API_URL": "https://www.kiket.dev",
        "KIKET_API_KEY": "sk-..."
      }
    }
  }
}
```

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
        "MCP_TRANSPORT": "stdio",
        "KIKET_API_URL": "https://www.kiket.dev",
        "KIKET_API_KEY": "ghp_..."
      }
    }
  }
}
```

### Gemini CLI (aistudio)

Edit `~/.config/aistudio/mcp_servers.json`:

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
      "MCP_TRANSPORT": "stdio",
      "KIKET_API_URL": "https://www.kiket.dev",
      "KIKET_API_KEY": "sk-..."
    }
  }
}
```

## Health Checks

The health check server (WebSocket mode only) provides endpoints for monitoring:

**Liveness Probe** - Is the server running?
```bash
curl http://localhost:8080/health
```
```json
{
  "status": "ok",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "uptime": 3600.5
}
```

**Readiness Probe** - Can the server handle requests?
```bash
curl http://localhost:8080/ready
```
```json
{
  "ready": true,
  "timestamp": "2025-01-10T12:00:00.000Z"
}
```

**Detailed Health Check**
```bash
curl http://localhost:8080/health/details
```
```json
{
  "status": "healthy",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "checks": {
    "api": {
      "healthy": true,
      "latency": 45
    }
  }
}
```

## Error Handling

The server provides detailed JSON-RPC error codes:

| Code | Error Type | Description |
|------|------------|-------------|
| `-32001` | Authentication Error | Invalid or missing API key |
| `-32002` | Authorization Error | Insufficient permissions |
| `-32003` | Not Found | Resource doesn't exist |
| `-32004` | Validation Error | Invalid input data |
| `-32005` | Rate Limit | Too many requests |
| `-32006` | Server Error | Kiket API error |
| `-32603` | Internal Error | Unexpected server error |

Example error response:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32003,
    "message": "Issue not found: 999",
    "data": null
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Lint code
npm run lint

# Build TypeScript
npm run build

# Start in dev mode
npm run dev
```

## Docker Deployment

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001 8080

CMD ["node", "dist/server.js"]
```

```bash
docker build -t kiket-mcp-server .
docker run -p 3001:3001 -p 8080:8080 \
  -e KIKET_API_URL=https://www.kiket.dev \
  -e KIKET_API_KEY=sk-... \
  kiket-mcp-server
```

## Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kiket-mcp-server
spec:
  replicas: 2
  selector:
    matchLabels:
      app: kiket-mcp-server
  template:
    metadata:
      labels:
        app: kiket-mcp-server
    spec:
      containers:
      - name: mcp-server
        image: kiket-mcp-server:latest
        ports:
        - containerPort: 3001
          name: websocket
        - containerPort: 8080
          name: health
        env:
        - name: KIKET_API_URL
          valueFrom:
            secretKeyRef:
              name: kiket-credentials
              key: api-url
        - name: KIKET_API_KEY
          valueFrom:
            secretKeyRef:
              name: kiket-credentials
              key: api-key
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
```

## Testing

The server includes comprehensive tests:

- **Error handling** (19 tests)
- **MCP protocol** (10 tests)
- **Kiket client** (3 tests)
- **Issue tools** (7 tests)
- **Project tools** (9 tests)
- **User tools** (7 tests)

Run tests:
```bash
npm test
```

## CI/CD

GitHub Actions automatically:
- Runs tests on push/PR
- Lints code
- Builds TypeScript
- Publishes to GitHub Packages on release
- Attaches tarball to GitHub releases

## License

MIT

## Support

- Documentation: https://docs.kiket.dev/extensions/mcp-server
- Issues: https://github.com/kiket-dev/kiket/issues
- Slack: https://kiket.dev/slack
