import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  MilestoneSchema,
  MilestoneInputSchema,
  MilestoneUpdateSchema,
  MilestoneListFiltersSchema
} from '../types/kiket.js';
import { KiketClient } from '../clients/kiket.js';

// Helper to produce flat JSON schemas without $ref
function toFlatSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  const result = zodToJsonSchema(schema, { $refStrategy: 'none' });
  const { $schema, ...rest } = result as Record<string, unknown>;
  return rest;
}

export type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
};

const listMilestonesInputSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe('Project ID or project key'),
  status: z.enum(['planning', 'active', 'completed', 'cancelled']).optional()
});

const getMilestoneInputSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe('Project ID or project key'),
  milestone_id: z.number()
});

const createMilestoneInputSchema = MilestoneInputSchema.extend({
  project_id: z.union([z.number(), z.string()]).describe('Project ID or project key')
});

const updateMilestoneInputSchema = MilestoneUpdateSchema.extend({
  project_id: z.union([z.number(), z.string()]).describe('Project ID or project key'),
  milestone_id: z.number()
});

const deleteMilestoneInputSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe('Project ID or project key'),
  milestone_id: z.number()
});

export class MilestoneTools {
  private tools: ToolDefinition[];

  constructor(private client: KiketClient) {
    this.tools = [
      {
        name: 'listMilestones',
        description: 'List all milestones for a project. Returns milestone name, status, progress, target date, and issue counts.',
        inputSchema: toFlatSchema(listMilestonesInputSchema)
      },
      {
        name: 'getMilestone',
        description: 'Get details of a specific milestone by ID.',
        inputSchema: toFlatSchema(getMilestoneInputSchema)
      },
      {
        name: 'createMilestone',
        description: 'Create a new milestone for a project. Milestones help track releases and group related issues.',
        inputSchema: toFlatSchema(createMilestoneInputSchema)
      },
      {
        name: 'updateMilestone',
        description: 'Update an existing milestone. Can change name, description, target date, status, or version.',
        inputSchema: toFlatSchema(updateMilestoneInputSchema)
      },
      {
        name: 'deleteMilestone',
        description: 'Delete a milestone. Issues associated with the milestone will have their milestone cleared.',
        inputSchema: toFlatSchema(deleteMilestoneInputSchema)
      }
    ];
  }

  listToolDefinitions(): ToolDefinition[] {
    return this.tools;
  }

  async call(toolName: string, args: unknown) {
    switch (toolName) {
      case 'listMilestones':
        return this.listMilestones(args);
      case 'getMilestone':
        return this.getMilestone(args);
      case 'createMilestone':
        return this.createMilestone(args);
      case 'updateMilestone':
        return this.updateMilestone(args);
      case 'deleteMilestone':
        return this.deleteMilestone(args);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private async listMilestones(args: unknown) {
    const { project_id, ...filters } = listMilestonesInputSchema.parse(args);
    const milestones = await this.client.listMilestones(project_id, filters);
    return { milestones };
  }

  private async getMilestone(args: unknown) {
    const { project_id, milestone_id } = getMilestoneInputSchema.parse(args);
    const milestone = await this.client.getMilestone(project_id, milestone_id);
    return { milestone };
  }

  private async createMilestone(args: unknown) {
    const { project_id, ...payload } = createMilestoneInputSchema.parse(args);
    const milestone = await this.client.createMilestone(project_id, payload);
    return { milestone };
  }

  private async updateMilestone(args: unknown) {
    const { project_id, milestone_id, ...payload } = updateMilestoneInputSchema.parse(args);
    const milestone = await this.client.updateMilestone(project_id, milestone_id, payload);
    return { milestone };
  }

  private async deleteMilestone(args: unknown) {
    const { project_id, milestone_id } = deleteMilestoneInputSchema.parse(args);
    await this.client.deleteMilestone(project_id, milestone_id);
    return { success: true };
  }
}

export const milestoneOutputSchema = zodToJsonSchema(
  z.object({ milestone: MilestoneSchema, milestones: z.array(MilestoneSchema).optional() }),
  'milestoneToolOutput'
);
