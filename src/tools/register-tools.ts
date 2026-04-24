import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createRuntimeClient } from '../lib.js';

function jsonContent(value: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
  };
}

function textContent(text: string) {
  return {
    content: [{ type: 'text' as const, text }],
  };
}

function activeOrganizationId(runtime: { organizationId?: string }, input?: { organizationId?: string }) {
  return input?.organizationId ?? runtime.organizationId;
}

export function registerTools(
  server: McpServer,
  runtime: { baseUrl: string; authToken?: string; apiKey?: string; organizationId?: string },
) {
  const client = createRuntimeClient(runtime);

  server.tool('get_current_user', 'Get the authenticated user', {}, async () => {
    const user = await client.getCurrentUser();
    return jsonContent(user);
  });

  server.tool('get_current_context', 'Get current MCP connection context and authenticated user', {}, async () => {
    const user = await client.getCurrentUser();
    return jsonContent({
      baseUrl: runtime.baseUrl,
      organizationId: runtime.organizationId ?? null,
      authMode: runtime.apiKey ? 'api_key' : runtime.authToken ? 'jwt' : 'anonymous',
      user,
    });
  });

  server.tool('list_organizations', 'List organizations available to the authenticated user', {}, async () => {
    const organizations = await client.listOrganizations();
    return jsonContent(organizations);
  });

  server.tool(
    'get_organization',
    'Get one organization by UUID or slug',
    {
      organizationId: z.string(),
    },
    async ({ organizationId }) => {
      const organization = await client.getOrganization(organizationId);
      return jsonContent(organization);
    },
  );

  server.tool(
    'list_projects',
    'List projects for an organization. Uses KIKET_ORGANIZATION_ID when organizationId is omitted.',
    {
      organizationId: z.string().optional(),
    },
    async (input) => {
      const organizationId = activeOrganizationId(runtime, input);
      if (!organizationId) {
        return textContent('No organization configured. Pass organizationId or set KIKET_ORGANIZATION_ID.');
      }
      const projects = await client.listProjects(organizationId);
      return jsonContent(projects);
    },
  );

  server.tool(
    'get_project',
    'Get a project by organization and project ID',
    {
      organizationId: z.string().optional(),
      projectId: z.string().uuid(),
    },
    async (input) => {
      const organizationId = activeOrganizationId(runtime, input);
      if (!organizationId) {
        return textContent('No organization configured. Pass organizationId or set KIKET_ORGANIZATION_ID.');
      }
      const project = await client.getProject(organizationId, input.projectId);
      return jsonContent(project);
    },
  );

  server.tool(
    'create_project',
    'Create a project in an organization',
    {
      organizationId: z.string().optional(),
      name: z.string(),
      key: z.string(),
      description: z.string().optional(),
    },
    async (input) => {
      const organizationId = activeOrganizationId(runtime, input);
      if (!organizationId) {
        return textContent('No organization configured. Pass organizationId or set KIKET_ORGANIZATION_ID.');
      }
      const project = await client.createProject(organizationId, {
        name: input.name,
        key: input.key,
        description: input.description,
      });
      return jsonContent(project);
    },
  );

  server.tool(
    'list_issues',
    'List issues using current API filters',
    {
      projectId: z.string().uuid().optional(),
      state: z.string().optional(),
      assigneeId: z.string().uuid().optional(),
    },
    async (input) => {
      const issues = await client.listIssues(input);
      return jsonContent(issues);
    },
  );

  server.tool(
    'get_issue',
    'Get one issue with workflow, SLA, and transition context',
    {
      issueId: z.string().uuid(),
    },
    async ({ issueId }) => {
      const issue = await client.getIssue(issueId);
      return jsonContent(issue);
    },
  );

  server.tool(
    'create_issue',
    'Create a new issue',
    {
      workflowKey: z.string(),
      projectId: z.string().uuid().optional(),
      title: z.string(),
      description: z.string().optional(),
      issueType: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    },
    async (input) => {
      const issue = await client.createIssue(input);
      return jsonContent(issue);
    },
  );

  server.tool(
    'get_issue_reachable_transitions',
    'Get allowed and blocked transitions for an issue',
    {
      issueId: z.string().uuid(),
    },
    async ({ issueId }) => {
      const transitions = await client.getIssueReachableStates(issueId);
      return jsonContent(transitions);
    },
  );

  server.tool(
    'check_issue_transition',
    'Check whether an issue transition is allowed without executing it',
    {
      issueId: z.string().uuid(),
      targetState: z.string(),
    },
    async ({ issueId, targetState }) => {
      const result = await client.checkIssueTransition(issueId, targetState);
      return jsonContent(result);
    },
  );

  server.tool(
    'transition_issue',
    'Transition an issue to a new state',
    {
      issueId: z.string().uuid(),
      targetState: z.string(),
    },
    async ({ issueId, targetState }) => {
      const result = await client.transitionIssue(issueId, targetState);
      return jsonContent(result);
    },
  );

  server.tool(
    'get_issue_history',
    'Get workflow event history for an issue',
    {
      issueId: z.string().uuid(),
    },
    async ({ issueId }) => {
      const history = await client.getIssueHistory(issueId);
      return jsonContent(history);
    },
  );

  server.tool(
    'list_issue_comments',
    'List comments for an issue',
    {
      issueId: z.string().uuid(),
    },
    async ({ issueId }) => {
      const comments = await client.listComments(issueId);
      return jsonContent(comments);
    },
  );

  server.tool(
    'add_issue_comment',
    'Add a comment to an issue',
    {
      issueId: z.string().uuid(),
      body: z.string().min(1),
      parentId: z.string().uuid().optional(),
    },
    async ({ issueId, body, parentId }) => {
      const comment = await client.createComment(issueId, body, parentId);
      return jsonContent(comment);
    },
  );

  server.tool(
    'list_milestones',
    'List milestones for a project',
    {
      projectId: z.string().uuid(),
    },
    async ({ projectId }) => {
      const milestones = await client.listMilestones(projectId);
      return jsonContent(milestones);
    },
  );

  server.tool('list_issue_types', 'List issue types for the active organization', {}, async () => {
    const issueTypes = await client.listIssueTypes();
    return jsonContent(issueTypes);
  });

  server.tool(
    'list_workflows',
    'List workflows for the active organization, optionally scoped to a project',
    {
      projectId: z.string().uuid().optional(),
    },
    async ({ projectId }) => {
      const workflows = await client.listWorkflows(projectId);
      return jsonContent(workflows);
    },
  );

  server.tool(
    'get_workflow',
    'Get workflow metadata and parsed definition',
    {
      workflowId: z.string(),
    },
    async ({ workflowId }) => {
      const workflow = await client.getWorkflow(workflowId);
      return jsonContent(workflow);
    },
  );

  server.tool(
    'get_workflow_yaml',
    'Get the source YAML for a workflow',
    {
      workflowId: z.string(),
    },
    async ({ workflowId }) => {
      const yaml = await client.getWorkflowYaml(workflowId);
      return textContent(yaml);
    },
  );

  server.tool(
    'validate_workflow',
    'Validate workflow YAML without saving it',
    {
      yaml: z.string().min(1),
    },
    async ({ yaml }) => {
      const result = await client.validateWorkflow(yaml);
      return jsonContent(result);
    },
  );

  server.tool(
    'search',
    'Search issues, workflows, and comments by text query',
    {
      query: z.string().min(1),
    },
    async ({ query }) => {
      const results = await client.search(query);
      return jsonContent(results);
    },
  );

  server.tool(
    'semantic_search',
    'Semantic search across issues and knowledge documents',
    {
      query: z.string().min(1),
      limit: z.number().int().min(1).max(50).optional(),
    },
    async ({ query, limit }) => {
      const results = await client.semanticSearch(query, limit);
      return jsonContent(results);
    },
  );

  server.tool(
    'list_knowledge_documents',
    'List or text-search knowledge documents in the active organization',
    {
      search: z.string().optional(),
    },
    async ({ search }) => {
      const documents = await client.listKnowledgeDocuments(search);
      return jsonContent(documents);
    },
  );

  server.tool(
    'get_knowledge_document',
    'Get one knowledge document by ID',
    {
      documentId: z.string().uuid(),
    },
    async ({ documentId }) => {
      const document = await client.getKnowledgeDocument(documentId);
      return jsonContent(document);
    },
  );

  server.tool(
    'list_audit_logs',
    'List recent audit logs for the active organization. This is read-only and does not export bulk data.',
    {
      action: z.string().optional(),
      resourceType: z.string().optional(),
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async (input) => {
      const logs = await client.listAuditLogs(input);
      return jsonContent(logs);
    },
  );

  server.tool(
    'get_audit_log',
    'Get one audit log entry by ID',
    {
      auditLogId: z.string().uuid(),
    },
    async ({ auditLogId }) => {
      const log = await client.getAuditLog(auditLogId);
      return jsonContent(log);
    },
  );

  server.tool(
    'get_compliance_report',
    'Get a JSON compliance report. Export/download formats are intentionally not exposed through MCP.',
    {
      type: z.enum(['sla', 'audit', 'gdpr']).optional(),
    },
    async ({ type }) => {
      const report = await client.getComplianceReport(type);
      return jsonContent(report);
    },
  );

  server.tool(
    'list_repositories',
    'List connected repositories for the active organization',
    {
      projectId: z.string().uuid().optional(),
    },
    async ({ projectId }) => {
      const repositories = await client.listRepositories(projectId);
      return jsonContent(repositories);
    },
  );

  server.tool(
    'get_repository',
    'Get one connected repository by ID',
    {
      repositoryId: z.string().uuid(),
    },
    async ({ repositoryId }) => {
      const repository = await client.getRepository(repositoryId);
      return jsonContent(repository);
    },
  );

  server.tool(
    'get_repository_tree',
    'Get the file tree for a connected repository',
    {
      repositoryId: z.string().uuid(),
    },
    async ({ repositoryId }) => {
      const tree = await client.getRepositoryTree(repositoryId);
      return jsonContent(tree);
    },
  );

  server.tool(
    'get_repository_file',
    'Read one file from a connected repository',
    {
      repositoryId: z.string().uuid(),
      path: z.string().min(1),
    },
    async ({ repositoryId, path }) => {
      const file = await client.getRepositoryFile(repositoryId, path);
      return jsonContent(file);
    },
  );

  server.tool(
    'get_repository_diff',
    'List changed files for a connected repository',
    {
      repositoryId: z.string().uuid(),
    },
    async ({ repositoryId }) => {
      const diff = await client.getRepositoryDiff(repositoryId);
      return jsonContent(diff);
    },
  );

  server.tool(
    'get_repository_log',
    'Get commit history for a connected repository, optionally scoped to one file path',
    {
      repositoryId: z.string().uuid(),
      path: z.string().optional(),
    },
    async ({ repositoryId, path }) => {
      const log = await client.getRepositoryLog(repositoryId, path);
      return jsonContent(log);
    },
  );

  server.tool(
    'get_definition',
    'Get one template definition by key',
    {
      key: z.string(),
    },
    async ({ key }) => {
      const definition = await client.getDefinition(key);
      return jsonContent(definition);
    },
  );

  server.tool('list_definitions', 'List available template definitions', {}, async () => {
    const definitions = await client.listDefinitions();
    return jsonContent(definitions);
  });
}
