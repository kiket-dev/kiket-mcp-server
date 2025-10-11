import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IssueTools } from '../src/tools/issues.js';
import { KiketClient } from '../src/clients/kiket.js';

vi.mock('../src/clients/kiket.js');

const MockedClient = KiketClient as unknown as vi.Mock;

describe('IssueTools', () => {
  const client = new MockedClient();
  const tools = new IssueTools(client, 'KIKET');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists tool definitions', () => {
    const list = tools.listToolDefinitions();
    expect(list.map((t) => t.name)).toEqual([
      'listIssues',
      'getIssue',
      'createIssue',
      'updateIssue',
      'transitionIssue'
    ]);
  });

  it('calls listIssues with default project', async () => {
    client.listIssues = vi.fn().mockResolvedValue([]);
    await expect(tools.call('listIssues', {})).resolves.toEqual({ issues: [] });
    expect(client.listIssues).toHaveBeenCalledWith({ project_key: 'KIKET' });
  });

  it('calls getIssue', async () => {
    client.getIssue = vi.fn().mockResolvedValue({ id: 1 });
    await expect(tools.call('getIssue', { id: 1 })).resolves.toEqual({ issue: { id: 1 } });
    expect(client.getIssue).toHaveBeenCalledWith(1);
  });

  it('calls createIssue and injects project key', async () => {
    client.createIssue = vi.fn().mockResolvedValue({ id: 2 });
    await tools.call('createIssue', { title: 'Test' });
    expect(client.createIssue).toHaveBeenCalledWith({ title: 'Test', project_key: 'KIKET' });
  });

  it('calls updateIssue', async () => {
    client.updateIssue = vi.fn().mockResolvedValue({ id: 3 });
    await tools.call('updateIssue', { id: 3, title: 'Updated' });
    expect(client.updateIssue).toHaveBeenCalledWith(3, { title: 'Updated' });
  });

  it('calls transitionIssue', async () => {
    client.transitionIssue = vi.fn().mockResolvedValue({ id: 4 });
    await tools.call('transitionIssue', { id: 4, transition: 'approve' });
    expect(client.transitionIssue).toHaveBeenCalledWith(4, 'approve');
  });

  it('throws for unknown tool', async () => {
    await expect(tools.call('unknown', {})).rejects.toThrow('Unknown tool');
  });
});
