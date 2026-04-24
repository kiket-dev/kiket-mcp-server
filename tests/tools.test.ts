import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { describe, expect, it } from 'vitest';
import { registerTools } from '../src/tools/register-tools.js';

type RegisteredTool = {
  name: string;
  description: string;
  handler: () => unknown;
};

function createFakeServer() {
  const tools: RegisteredTool[] = [];
  const server = {
    tool(name: string, description: string, _schema: unknown, handler: () => unknown) {
      tools.push({ name, description, handler });
    },
  };
  return { server: server as unknown as McpServer, tools };
}

describe('registerTools', () => {
  it('registers the expanded safe MCP surface', () => {
    const { server, tools } = createFakeServer();

    registerTools(server, {
      baseUrl: 'https://example.test',
      apiKey: 'kiket_test',
      organizationId: 'test-org',
    });

    expect(tools.map((tool) => tool.name).sort()).toEqual(
      [
        'add_issue_comment',
        'check_issue_transition',
        'create_issue',
        'create_project',
        'get_audit_log',
        'get_compliance_report',
        'get_current_context',
        'get_current_user',
        'get_definition',
        'get_issue',
        'get_issue_history',
        'get_issue_reachable_transitions',
        'get_knowledge_document',
        'get_organization',
        'get_project',
        'get_repository',
        'get_repository_diff',
        'get_repository_file',
        'get_repository_log',
        'get_repository_tree',
        'get_workflow',
        'get_workflow_yaml',
        'list_audit_logs',
        'list_definitions',
        'list_issue_comments',
        'list_issue_types',
        'list_issues',
        'list_knowledge_documents',
        'list_milestones',
        'list_organizations',
        'list_projects',
        'list_repositories',
        'list_workflows',
        'search',
        'semantic_search',
        'transition_issue',
        'validate_workflow',
      ].sort(),
    );
  });

  it('does not expose high-risk management tools by default', () => {
    const { server, tools } = createFakeServer();

    registerTools(server, {
      baseUrl: 'https://example.test',
      apiKey: 'kiket_test',
      organizationId: 'test-org',
    });

    const names = tools.map((tool) => tool.name);

    expect(names).not.toContain('create_api_key');
    expect(names).not.toContain('delete_api_key');
    expect(names).not.toContain('admin_list_users');
    expect(names).not.toContain('export_audit_logs');
    expect(names).not.toContain('commit_repository_file');
    expect(names).not.toContain('push_repository');
  });
});
