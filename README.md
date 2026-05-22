# `@kiket/mcp`

Model Context Protocol server for Kiket — agent-facing tools over the authorized operational compliance platform API.

## Role in the monorepo

Exposes only stable, real API capabilities (no legacy paths or fake tools). Uses `@kiket/api-client` for contract alignment. Submodule checkout: see [docs/architecture/submodules.md](../docs/architecture/submodules.md).

## Current tool surface

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

## Commands

```bash
pnpm --filter @kiket/mcp test
pnpm --filter @kiket/mcp check
pnpm --filter @kiket/mcp lint
pnpm --filter @kiket/mcp build
```

## Related docs

- [CLI](../cli/README.md)
- [API client](../packages/api-client/README.md)
- [CLI/MCP/SDK skill](../.cursor/skills/kiket-cli-mcp-sdk/SKILL.md)
- [Cursor MCP config](../.cursor/README.md)
