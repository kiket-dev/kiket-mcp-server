import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserTools } from '../src/tools/users.js';
import { KiketClient } from '../src/clients/kiket.js';

vi.mock('../src/clients/kiket.js');

const MockedClient = KiketClient as unknown as vi.Mock;

describe('UserTools', () => {
  const client = new MockedClient();
  const tools = new UserTools(client);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists tool definitions', () => {
    const list = tools.listToolDefinitions();
    expect(list.map((t) => t.name)).toEqual(['listUsers', 'getUser', 'getCurrentUser']);
  });

  it('calls listUsers', async () => {
    const users = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];
    client.listUsers = vi.fn().mockResolvedValue(users);
    await expect(tools.call('listUsers', {})).resolves.toEqual({ users });
    expect(client.listUsers).toHaveBeenCalledWith({});
  });

  it('calls listUsers with pagination', async () => {
    client.listUsers = vi.fn().mockResolvedValue([]);
    await tools.call('listUsers', { page: 2, per_page: 20 });
    expect(client.listUsers).toHaveBeenCalledWith({ page: 2, per_page: 20 });
  });

  it('calls getUser', async () => {
    const user = { id: 1, name: 'John Doe', email: 'john@example.com' };
    client.getUser = vi.fn().mockResolvedValue(user);
    await expect(tools.call('getUser', { id: 1 })).resolves.toEqual({ user });
    expect(client.getUser).toHaveBeenCalledWith(1);
  });

  it('calls getCurrentUser', async () => {
    const user = { id: 42, name: 'Current User', email: 'current@example.com' };
    client.getCurrentUser = vi.fn().mockResolvedValue(user);
    await expect(tools.call('getCurrentUser', {})).resolves.toEqual({ user });
    expect(client.getCurrentUser).toHaveBeenCalled();
  });

  it('throws for unknown tool', async () => {
    await expect(tools.call('unknown', {})).rejects.toThrow('Unknown tool');
  });

  it('validates user ID is a number', async () => {
    client.getUser = vi.fn();
    await expect(
      tools.call('getUser', { id: 'not-a-number' })
    ).rejects.toThrow();
  });
});
