# `@kiket/mcp`

Modern TypeScript MCP server for Kiket. This repository replaces the older implementation with a standalone server that targets the current API only.

## Strategy

The server is designed around a simple rule: only expose MCP tools for real, stable API capabilities.

- no legacy path compatibility
- no Rails-era snake_case DTO assumptions
- no fake tools for endpoints that do not exist
- one typed in-repo client contract layer shared by runtime and tests

## Future Vision

- generated contract types from the API OpenAPI document
- HTTP transport support for hosted MCP deployments if needed
- stronger integration tests against a real local Kiket API

## Current Tool Surface

- context and orgs: `get_current_user`, `get_current_context`, `list_organizations`, `get_organization`
- projects: `list_projects`, `get_project`, `create_project`
- issues: `list_issues`, `get_issue`, `create_issue`, `get_issue_reachable_transitions`, `check_issue_transition`, `transition_issue`, `get_issue_history`
- comments: `list_issue_comments`, `add_issue_comment`
- planning metadata: `list_milestones`, `list_issue_types`
- workflows: `list_workflows`, `get_workflow`, `get_workflow_yaml`, `validate_workflow`
- search and knowledge: `search`, `semantic_search`, `list_knowledge_documents`, `get_knowledge_document`
- compliance and audit: `list_audit_logs`, `get_audit_log`, `get_compliance_report`
- repositories, read-only: `list_repositories`, `get_repository`, `get_repository_tree`, `get_repository_file`, `get_repository_diff`, `get_repository_log`
- template definitions: `list_definitions`, `get_definition`

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
