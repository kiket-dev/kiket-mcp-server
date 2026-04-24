# `@kiket/mcp`

Modern TypeScript MCP server for Kiket. This repository replaces the older implementation with a standalone server that targets the current API only.

## Strategy

The server is designed around a simple rule: only expose MCP tools for real, stable API capabilities.

- no legacy path compatibility
- no Rails-era snake_case DTO assumptions
- no fake tools for endpoints that do not exist
- one shared typed client package (`@kiket/api-client`) used by runtime and tests

## Future Vision

- generated contract types from the API OpenAPI document
- richer prompts for issue triage, workflow review, and operational reporting
- HTTP transport support for hosted MCP deployments if needed
- stronger integration tests against a real local Kiket API

## Current Tool Surface

- current user
- projects
- issues
- issue transition
- milestones
- issue types
- definitions

## Development

```bash
pnpm install
pnpm test
pnpm check
pnpm lint
pnpm build
```
