# `@kiket/mcp`

Modern TypeScript MCP server for Kiket. It exposes agent-facing tools over the authorized operational compliance platform API.

## Strategy

The server is designed around a simple rule: only expose MCP tools for real, stable API capabilities.

- no legacy path compatibility
- no stale DTO assumptions
- no fake tools for endpoints that do not exist
- one shared `@kiket/api-client` contract layer

## Future Vision

- generated contract types from the API OpenAPI document
- HTTP transport support for hosted MCP deployments if needed
- stronger integration tests against a real local Kiket API

## Current Tool Surface

- `kiket_list_workspaces`
- `kiket_list_processes`
- `kiket_list_cases`
- `kiket_list_findings`
- `kiket_list_evidence`
- `kiket_list_scanner_runs`
- `kiket_list_reports`
- `kiket_list_anchor_proofs`
- `kiket_list_ingestion_failures`
- `kiket_validate_config`
- `kiket_run_simulation`
- `kiket_trigger_scan`
- `kiket_import_evidence`
- `kiket_generate_report`
- `kiket_verify_report`
- `kiket_create_anchor_proof`
- `kiket_verify_anchor`

## Security Boundaries

The MCP server intentionally avoids broad access to high-risk API surfaces:

- no auth, password, TOTP, or session management tools
- no API key creation/revocation tools
- no admin tools
- no billing or Stripe tools
- no raw export/download tools
- no webhook receiver tools
- no repository write, commit, push, or pull-request tools

This keeps the default MCP useful for day-to-day assistant workflows while minimizing GDPR and credential exposure risk.

## Development

```bash
pnpm install
pnpm test
pnpm check
pnpm lint
pnpm build
```
