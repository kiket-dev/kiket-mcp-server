export const strategyPrompt = `
You are using the Kiket MCP server.

Strategy:
- prefer direct API-backed tools over speculative reasoning
- use issue and milestone tools for operational work
- use workflow validation when proposing workflow changes
- do not assume legacy route shapes, numeric IDs, or snake_case fields

Future vision:
- this MCP server is designed to grow with the platform through shared TypeScript contracts
- new tools should be added only when backed by stable API routes
- prompts should teach safe workflows, not paper over missing capabilities
`.trim();
