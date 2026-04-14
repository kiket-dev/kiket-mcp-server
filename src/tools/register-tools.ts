import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createRuntimeClient } from '../lib.js';

export function registerTools(server: McpServer, runtime: { baseUrl: string; authToken?: string; apiKey?: string; organizationId?: string }) {
  const client = createRuntimeClient(runtime);

  server.tool('get_current_user', 'Get the authenticated user', {}, async () => {
    const user = await client.getCurrentUser();
    return {
      content: [{ type: 'text', text: JSON.stringify(user, null, 2) }],
    };
  });

  server.tool(
    'list_projects',
    'List projects for the active organization',
    {},
    async () => {
      if (!runtime.organizationId) {
        return { content: [{ type: 'text', text: 'No organization configured.' }] };
      }
      const projects = await client.listProjects(runtime.organizationId);
      return {
        content: [{ type: 'text', text: JSON.stringify(projects, null, 2) }],
      };
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
      return {
        content: [{ type: 'text', text: JSON.stringify(issues, null, 2) }],
      };
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
      return {
        content: [{ type: 'text', text: JSON.stringify(issue, null, 2) }],
      };
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
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
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
      return {
        content: [{ type: 'text', text: JSON.stringify(milestones, null, 2) }],
      };
    },
  );

  server.tool(
    'list_issue_types',
    'List issue types for the active organization',
    {},
    async () => {
      const issueTypes = await client.listIssueTypes();
      return {
        content: [{ type: 'text', text: JSON.stringify(issueTypes, null, 2) }],
      };
    },
  );
}
