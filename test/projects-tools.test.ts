import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectTools } from '../src/tools/projects.js';
import { KiketClient } from '../src/clients/kiket.js';

vi.mock('../src/clients/kiket.js');

const MockedClient = KiketClient as unknown as vi.Mock;

describe('ProjectTools', () => {
  const client = new MockedClient();
  const tools = new ProjectTools(client);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists tool definitions', () => {
    const list = tools.listToolDefinitions();
    expect(list.map((t) => t.name)).toEqual([
      'listProjects',
      'getProject',
      'createProject',
      'updateProject',
      'deleteProject'
    ]);
  });

  it('calls listProjects', async () => {
    client.listProjects = vi.fn().mockResolvedValue([]);
    await expect(tools.call('listProjects', {})).resolves.toEqual({ projects: [] });
    expect(client.listProjects).toHaveBeenCalledWith({});
  });

  it('calls getProject', async () => {
    const project = { id: 1, name: 'Test Project', project_key: 'TEST' };
    client.getProject = vi.fn().mockResolvedValue(project);
    await expect(tools.call('getProject', { id: 1 })).resolves.toEqual({ project });
    expect(client.getProject).toHaveBeenCalledWith(1);
  });

  it('calls createProject', async () => {
    const project = { id: 2, name: 'New Project', project_key: 'NEW' };
    client.createProject = vi.fn().mockResolvedValue(project);
    await tools.call('createProject', {
      name: 'New Project',
      project_key: 'NEW'
    });
    expect(client.createProject).toHaveBeenCalledWith({
      name: 'New Project',
      project_key: 'NEW'
    });
  });

  it('calls updateProject', async () => {
    const project = { id: 3, name: 'Updated Project', project_key: 'UPD' };
    client.updateProject = vi.fn().mockResolvedValue(project);
    await tools.call('updateProject', { id: 3, name: 'Updated Project' });
    expect(client.updateProject).toHaveBeenCalledWith(3, { name: 'Updated Project' });
  });

  it('calls deleteProject', async () => {
    client.deleteProject = vi.fn().mockResolvedValue(undefined);
    await expect(tools.call('deleteProject', { id: 4 })).resolves.toEqual({ success: true });
    expect(client.deleteProject).toHaveBeenCalledWith(4);
  });

  it('throws for unknown tool', async () => {
    await expect(tools.call('unknown', {})).rejects.toThrow('Unknown tool');
  });

  it('validates project_key format', async () => {
    client.createProject = vi.fn();
    await expect(
      tools.call('createProject', {
        name: 'Test',
        project_key: 'invalid-key' // Should fail - lowercase and hyphens not allowed
      })
    ).rejects.toThrow();
  });

  it('validates required fields for createProject', async () => {
    client.createProject = vi.fn();
    await expect(
      tools.call('createProject', {
        name: 'Test'
        // Missing project_key
      })
    ).rejects.toThrow();
  });
});
