import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  ProjectSchema,
  ProjectInputSchema,
  ProjectUpdateSchema,
  ProjectListFiltersSchema
} from '../types/kiket.js';
import { KiketClient } from '../clients/kiket.js';

// Helper to produce flat JSON schemas without $ref
function toFlatSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  const result = zodToJsonSchema(schema, { $refStrategy: 'none' });
  const { $schema: _, ...rest } = result as Record<string, unknown>;
  return rest;
}

export type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
};

const identifierSchema = z.object({
  id: z.number()
});

const updateProjectInputSchema = ProjectUpdateSchema.extend({ id: z.number() });
const deleteProjectInputSchema = z.object({
  id: z.number()
});

export class ProjectTools {
  private tools: ToolDefinition[];

  constructor(private client: KiketClient) {
    this.tools = [
      {
        name: 'listProjects',
        description: 'List all projects visible to the authenticated user.',
        inputSchema: toFlatSchema(ProjectListFiltersSchema)
      },
      {
        name: 'getProject',
        description: 'Fetch a single project by ID.',
        inputSchema: toFlatSchema(identifierSchema)
      },
      {
        name: 'createProject',
        description: 'Create a new project (requires organization admin permissions).',
        inputSchema: toFlatSchema(ProjectInputSchema)
      },
      {
        name: 'updateProject',
        description: 'Update project settings, description, or repository links.',
        inputSchema: toFlatSchema(updateProjectInputSchema)
      },
      {
        name: 'deleteProject',
        description: 'Archive/delete a project (requires admin permissions).',
        inputSchema: toFlatSchema(deleteProjectInputSchema)
      }
    ];
  }

  listToolDefinitions(): ToolDefinition[] {
    return this.tools;
  }

  async call(toolName: string, args: unknown) {
    switch (toolName) {
      case 'listProjects':
        return this.listProjects(args);
      case 'getProject':
        return this.getProject(args);
      case 'createProject':
        return this.createProject(args);
      case 'updateProject':
        return this.updateProject(args);
      case 'deleteProject':
        return this.deleteProject(args);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private async listProjects(args: unknown) {
    const filters = ProjectListFiltersSchema.parse(
      typeof args === 'object' && args !== null ? args : {}
    );
    const projects = await this.client.listProjects(filters);
    return { projects };
  }

  private async getProject(args: unknown) {
    const { id } = identifierSchema.parse(args);
    const project = await this.client.getProject(id);
    return { project };
  }

  private async createProject(args: unknown) {
    const payload = ProjectInputSchema.parse(args);
    const project = await this.client.createProject(payload);
    return { project };
  }

  private async updateProject(args: unknown) {
    const { id, ...rest } = updateProjectInputSchema.parse(args);
    const project = await this.client.updateProject(id, rest);
    return { project };
  }

  private async deleteProject(args: unknown) {
    const { id } = deleteProjectInputSchema.parse(args);
    await this.client.deleteProject(id);
    return { success: true };
  }
}

export const projectOutputSchema = zodToJsonSchema(
  z.object({ project: ProjectSchema, projects: z.array(ProjectSchema).optional() }),
  'projectToolOutput'
);
