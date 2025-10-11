import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { KiketClient } from '../src/clients/kiket.js';

vi.mock('axios');

const mockedAxios = axios as unknown as {
  create: vi.Mock;
};

const mockInstance = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn()
};

describe('KiketClient', () => {
  beforeEach(() => {
    mockedAxios.create.mockReturnValue(mockInstance);
    mockInstance.get.mockReset();
    mockInstance.post.mockReset();
    mockInstance.patch.mockReset();
  });

  it('initializes axios with auth header', () => {
    new KiketClient({ baseUrl: 'https://api.example.com', apiKey: 'token', verifySSL: true });
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'https://api.example.com',
        headers: expect.objectContaining({ Authorization: 'Bearer token' })
      })
    );
  });

  const issuePayload = {
    id: 1,
    key: 'KIKET-1',
    title: 'Example Issue',
    description: null,
    status: 'backlog',
    assignee: null,
    priority: null,
    labels: [],
    issue_type: 'Task',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  };

  it('lists issues', async () => {
    const client = new KiketClient({ baseUrl: 'https://api.example.com', apiKey: 'token', verifySSL: true });
    mockInstance.get.mockResolvedValue({ data: { issues: [issuePayload] } });
    await expect(client.listIssues({ status: 'todo' })).resolves.toEqual([issuePayload]);
    expect(mockInstance.get).toHaveBeenCalledWith('/api/v1/ext/issues', { params: { status: 'todo' } });
  });

  it('creates issue and returns data', async () => {
    const client = new KiketClient({ baseUrl: 'https://api.example.com', apiKey: 'token', verifySSL: true });
    mockInstance.post.mockResolvedValue({ data: { issue: issuePayload } });
    await expect(client.createIssue({ title: 'Test' })).resolves.toEqual(issuePayload);
    expect(mockInstance.post).toHaveBeenCalledWith('/api/v1/ext/issues', { issue: { title: 'Test' } });
  });
});
