import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { UserSchema, UserListFiltersSchema } from '../types/kiket.js';
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

export class UserTools {
  private tools: ToolDefinition[];

  constructor(private client: KiketClient) {
    this.tools = [
      {
        name: 'listUsers',
        description: 'List all users/members in the current project or organization.',
        inputSchema: toFlatSchema(UserListFiltersSchema)
      },
      {
        name: 'getUser',
        description: 'Fetch a single user by ID.',
        inputSchema: toFlatSchema(identifierSchema)
      },
      {
        name: 'getCurrentUser',
        description: 'Get the currently authenticated user profile.',
        inputSchema: toFlatSchema(z.object({}))
      }
    ];
  }

  listToolDefinitions(): ToolDefinition[] {
    return this.tools;
  }

  async call(toolName: string, args: unknown) {
    switch (toolName) {
      case 'listUsers':
        return this.listUsers(args);
      case 'getUser':
        return this.getUser(args);
      case 'getCurrentUser':
        return this.getCurrentUser();
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private async listUsers(args: unknown) {
    const filters = UserListFiltersSchema.parse(
      typeof args === 'object' && args !== null ? args : {}
    );
    const users = await this.client.listUsers(filters);
    return { users };
  }

  private async getUser(args: unknown) {
    const { id } = identifierSchema.parse(args);
    const user = await this.client.getUser(id);
    return { user };
  }

  private async getCurrentUser() {
    const user = await this.client.getCurrentUser();
    return { user };
  }
}

export const userOutputSchema = zodToJsonSchema(
  z.object({ user: UserSchema, users: z.array(UserSchema).optional() }),
  'userToolOutput'
);
