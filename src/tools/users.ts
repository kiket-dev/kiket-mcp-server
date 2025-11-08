import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { UserSchema, UserListFiltersSchema } from '../types/kiket.js';
import { KiketClient } from '../clients/kiket.js';

export type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: ReturnType<typeof zodToJsonSchema>;
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
        inputSchema: zodToJsonSchema(UserListFiltersSchema, 'listUsersInput')
      },
      {
        name: 'getUser',
        description: 'Fetch a single user by ID.',
        inputSchema: zodToJsonSchema(identifierSchema, 'getUserInput')
      },
      {
        name: 'getCurrentUser',
        description: 'Get the currently authenticated user profile.',
        inputSchema: zodToJsonSchema(z.object({}), 'getCurrentUserInput')
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
        return this.getCurrentUser(args);
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

  private async getCurrentUser(_args: unknown) {
    const user = await this.client.getCurrentUser();
    return { user };
  }
}

export const userOutputSchema = zodToJsonSchema(
  z.object({ user: UserSchema, users: z.array(UserSchema).optional() }),
  'userToolOutput'
);
