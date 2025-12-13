import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  IssueListFiltersSchema,
  IssueInputSchema,
  IssueSchema,
  IssueUpdateSchema
} from '../types/kiket.js';
import { KiketClient } from '../clients/kiket.js';

// Helper to produce flat JSON schemas without $ref
function toFlatSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  const result = zodToJsonSchema(schema, { $refStrategy: 'none' });
  // Remove $schema key as MCP doesn't need it
  const { $schema: _, ...rest } = result as Record<string, unknown>;
  return rest;
}

const transitionInputSchema = z.object({
  id: z.union([z.string(), z.number()]),
  transition: z.string().min(1)
});

const identifierSchema = z.object({
  id: z.union([z.string(), z.number()])
});

const commentListSchema = z.object({
  issue_id: z.union([z.string(), z.number()])
});

const commentCreateSchema = z.object({
  issue_id: z.union([z.string(), z.number()]),
  body: z.string().min(1)
});

const commentUpdateSchema = z.object({
  issue_id: z.union([z.string(), z.number()]),
  comment_id: z.number(),
  body: z.string().min(1)
});

const commentDeleteSchema = z.object({
  issue_id: z.union([z.string(), z.number()]),
  comment_id: z.number()
});

const issueSchemaInputSchema = z.object({
  project_key: z.string().optional()
});

export type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
};

const createIssueInputSchema = IssueInputSchema.extend({ project_key: z.string().optional() });
const updateIssueInputSchema = IssueUpdateSchema.extend({ id: z.union([z.string(), z.number()]) });

export class IssueTools {
  private tools: ToolDefinition[];

  constructor(private client: KiketClient, private defaultProjectKey?: string) {
    this.tools = [
      {
        name: 'listIssues',
        description: 'List issues filtered by status, assignee, label, or project.',
        inputSchema: toFlatSchema(IssueListFiltersSchema)
      },
      {
        name: 'getIssue',
        description: 'Fetch a single issue by numeric ID or issue key.',
        inputSchema: toFlatSchema(identifierSchema)
      },
      {
        name: 'createIssue',
        description:
          'Create a new issue in the selected project. ' +
          'Defaults: status="backlog", issue_type="Task". ' +
          'Priority values: low, medium, high, critical (lowercase). ' +
          'Common issue types: Epic, UserStory, Task, Bug (PascalCase). ' +
          'Use parent_id to link child issues to parent (e.g., UserStory under Epic, Task under UserStory).',
        inputSchema: toFlatSchema(createIssueInputSchema)
      },
      {
        name: 'updateIssue',
        description: 'Update fields on an existing issue.',
        inputSchema: toFlatSchema(updateIssueInputSchema)
      },
      {
        name: 'transitionIssue',
        description: 'Move an issue to a different workflow state using a transition key.',
        inputSchema: toFlatSchema(transitionInputSchema)
      },
      {
        name: 'listComments',
        description: 'List all comments on an issue.',
        inputSchema: toFlatSchema(commentListSchema)
      },
      {
        name: 'createComment',
        description: 'Add a comment to an issue.',
        inputSchema: toFlatSchema(commentCreateSchema)
      },
      {
        name: 'updateComment',
        description: 'Update an existing comment on an issue.',
        inputSchema: toFlatSchema(commentUpdateSchema)
      },
      {
        name: 'deleteComment',
        description: 'Delete a comment from an issue.',
        inputSchema: toFlatSchema(commentDeleteSchema)
      },
      {
        name: 'getIssueSchema',
        description:
          'Get issue schema for the organization/project. ' +
          'Returns available issue types, custom field definitions, priorities, and statuses. ' +
          'Use this to discover valid values for creating/updating issues.',
        inputSchema: toFlatSchema(issueSchemaInputSchema)
      }
    ];
  }

  listToolDefinitions(): ToolDefinition[] {
    return this.tools;
  }

  async call(toolName: string, args: unknown) {
    switch (toolName) {
      case 'listIssues':
        return this.listIssues(args);
      case 'getIssue':
        return this.getIssue(args);
      case 'createIssue':
        return this.createIssue(args);
      case 'updateIssue':
        return this.updateIssue(args);
      case 'transitionIssue':
        return this.transitionIssue(args);
      case 'listComments':
        return this.listComments(args);
      case 'createComment':
        return this.createComment(args);
      case 'updateComment':
        return this.updateComment(args);
      case 'deleteComment':
        return this.deleteComment(args);
      case 'getIssueSchema':
        return this.getIssueSchema(args);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private async listIssues(args: unknown) {
    const filters = IssueListFiltersSchema.parse(
      typeof args === 'object' && args !== null ? args : {}
    );
    const mergedFilters = {
      ...filters,
      project_key: filters.project_key ?? this.defaultProjectKey
    };
    const issues = await this.client.listIssues(mergedFilters);
    return { issues };
  }

  private async getIssue(args: unknown) {
    const { id } = identifierSchema.parse(args);
    const issue = await this.client.getIssue(id);
    return { issue };
  }

  private async createIssue(args: unknown) {
    const payload = createIssueInputSchema.parse(args);
    const issue = await this.client.createIssue({
      ...payload,
      project_key: payload.project_key ?? this.defaultProjectKey
    });
    return { issue };
  }

  private async updateIssue(args: unknown) {
    const { id, ...rest } = updateIssueInputSchema.parse(args);
    const issue = await this.client.updateIssue(id, rest);
    return { issue };
  }

  private async transitionIssue(args: unknown) {
    const { id, transition } = transitionInputSchema.parse(args);
    const issue = await this.client.transitionIssue(id, transition);
    return { issue };
  }

  private async listComments(args: unknown) {
    const { issue_id } = commentListSchema.parse(args);
    const comments = await this.client.listComments(issue_id);
    return { comments };
  }

  private async createComment(args: unknown) {
    const { issue_id, body } = commentCreateSchema.parse(args);
    const comment = await this.client.createComment(issue_id, { body });
    return { comment };
  }

  private async updateComment(args: unknown) {
    const { issue_id, comment_id, body } = commentUpdateSchema.parse(args);
    const comment = await this.client.updateComment(issue_id, comment_id, { body });
    return { comment };
  }

  private async deleteComment(args: unknown) {
    const { issue_id, comment_id } = commentDeleteSchema.parse(args);
    await this.client.deleteComment(issue_id, comment_id);
    return { success: true };
  }

  private async getIssueSchema(args: unknown) {
    const { project_key } = issueSchemaInputSchema.parse(args);
    const projectIdOrKey = project_key ?? this.defaultProjectKey;
    const schema = await this.client.getIssueSchema(projectIdOrKey);
    return { schema };
  }
}

export const issueOutputSchema = zodToJsonSchema(
  z.object({ issue: IssueSchema, issues: z.array(IssueSchema).optional() }),
  'issueToolOutput'
);
