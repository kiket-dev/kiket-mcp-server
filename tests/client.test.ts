import { describe, expect, it } from 'vitest';
import { KiketClient } from '../src/kiket-client/client.js';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('KiketClient', () => {
  it('sends JWT auth and organization header', async () => {
    let captured: Request | undefined;
    const client = new KiketClient({
      baseUrl: 'https://example.test',
      auth: { kind: 'jwt', token: 'jwt-token' },
      organizationId: 'org-123',
      fetchImpl: async (input, init) => {
        captured = new Request(input, init);
        return jsonResponse({
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'test@example.com',
          name: 'Test User',
          locale: 'en',
          createdAt: '2026-01-01T00:00:00.000Z',
        });
      },
    });

    await client.getCurrentUser();

    expect(captured?.headers.get('authorization')).toBe('Bearer jwt-token');
    expect(captured?.headers.get('x-organization-id')).toBe('org-123');
  });

  it('sends API key using X-API-Key', async () => {
    let captured: Request | undefined;
    const client = new KiketClient({
      baseUrl: 'https://example.test',
      auth: { kind: 'apiKey', apiKey: 'kiket_test' },
      fetchImpl: async (input, init) => {
        captured = new Request(input, init);
        return jsonResponse({
          data: [],
        });
      },
    });

    await client.listIssueTypes();

    expect(captured?.headers.get('x-api-key')).toBe('kiket_test');
    expect(captured?.headers.get('authorization')).toBeNull();
  });

  it('serializes query params using current contract field names', async () => {
    let capturedUrl = '';
    const client = new KiketClient({
      baseUrl: 'https://example.test',
      fetchImpl: async (input) => {
        capturedUrl = String(input);
        return jsonResponse({ data: [] });
      },
    });

    await client.listIssues({
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      state: 'in_progress',
      assigneeId: '660e8400-e29b-41d4-a716-446655440000',
    });

    expect(capturedUrl).toContain('projectId=550e8400-e29b-41d4-a716-446655440000');
    expect(capturedUrl).toContain('state=in_progress');
    expect(capturedUrl).toContain('assigneeId=660e8400-e29b-41d4-a716-446655440000');
  });

  it('uses canonical milestones by-id endpoint', async () => {
    let capturedUrl = '';
    const client = new KiketClient({
      baseUrl: 'https://example.test',
      fetchImpl: async (input) => {
        capturedUrl = String(input);
        return jsonResponse({
          id: '550e8400-e29b-41d4-a716-446655440000',
          organizationId: '770e8400-e29b-41d4-a716-446655440000',
          projectId: '880e8400-e29b-41d4-a716-446655440000',
          title: 'Milestone',
          description: null,
          dueDate: null,
          status: 'open',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        });
      },
    });

    await client.getMilestone('550e8400-e29b-41d4-a716-446655440000');
    expect(capturedUrl).toContain('/api/v1/milestones/550e8400-e29b-41d4-a716-446655440000');
  });

  it('uses canonical org-scoped projects endpoint', async () => {
    let captured: Request | undefined;
    const client = new KiketClient({
      baseUrl: 'https://example.test',
      fetchImpl: async (input, init) => {
        captured = new Request(input, init);
        return jsonResponse({ data: [] });
      },
    });

    await client.listProjects('770e8400-e29b-41d4-a716-446655440000');
    expect(captured?.method).toBe('GET');
    expect(captured?.url).toContain('/api/v1/organizations/770e8400-e29b-41d4-a716-446655440000/projects');
  });

  it('uses canonical transition endpoint and payload', async () => {
    let captured: Request | undefined;
    const client = new KiketClient({
      baseUrl: 'https://example.test',
      fetchImpl: async (input, init) => {
        captured = new Request(input, init);
        return jsonResponse({
          issue: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            projectId: '550e8400-e29b-41d4-a716-446655440111',
            workflowKey: 'kanban',
            workflowRepoId: null,
            number: 1,
            title: 'Issue',
            description: null,
            currentState: 'done',
            assigneeId: null,
            assigneeName: null,
            reporterId: '550e8400-e29b-41d4-a716-446655440222',
            reporterName: null,
            priority: 'medium',
            issueType: null,
            dueDate: null,
            milestoneId: null,
            milestoneName: null,
            labels: [],
            customFields: {},
            parentId: null,
            subtaskIds: [],
            workflow: null,
            sla: null,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          from: 'in_progress',
          to: 'done',
          intents: [],
        });
      },
    });

    await client.transitionIssue('550e8400-e29b-41d4-a716-446655440000', 'done');
    expect(captured?.method).toBe('POST');
    expect(captured?.url).toContain('/api/v1/issues/550e8400-e29b-41d4-a716-446655440000/transition');
    const body = (await captured?.json()) as { targetState: string };
    expect(body.targetState).toBe('done');
  });

  it('uses workflow validation endpoint and payload', async () => {
    let captured: Request | undefined;
    const client = new KiketClient({
      baseUrl: 'https://example.test',
      fetchImpl: async (input, init) => {
        captured = new Request(input, init);
        return jsonResponse({ valid: true, errors: [], definition: { key: 'support' } });
      },
    });

    await client.validateWorkflow('workflow: support');

    expect(captured?.method).toBe('POST');
    expect(captured?.url).toContain('/api/v1/workflows/validate');
    const body = (await captured?.json()) as { yaml: string };
    expect(body.yaml).toBe('workflow: support');
  });

  it('uses transition guard endpoints without mutating issues', async () => {
    const urls: string[] = [];
    const client = new KiketClient({
      baseUrl: 'https://example.test',
      fetchImpl: async (input, init) => {
        const request = new Request(input, init);
        urls.push(`${request.method} ${request.url}`);
        if (request.url.includes('check-transition')) {
          const body = (await request.json()) as { targetState: string };
          expect(body.targetState).toBe('done');
          return jsonResponse({ allowed: true, blockers: [] });
        }
        return jsonResponse({
          states: ['done'],
          transitions: [{ name: 'Done', targetState: 'done', targetStateLabel: 'Done', allowed: true, blockers: [] }],
        });
      },
    });

    await client.getIssueReachableStates('550e8400-e29b-41d4-a716-446655440000');
    await client.checkIssueTransition('550e8400-e29b-41d4-a716-446655440000', 'done');

    expect(urls[0]).toContain(
      'GET https://example.test/api/v1/issues/550e8400-e29b-41d4-a716-446655440000/reachable-states',
    );
    expect(urls[1]).toContain(
      'POST https://example.test/api/v1/issues/550e8400-e29b-41d4-a716-446655440000/check-transition',
    );
  });

  it('uses search and semantic search endpoints', async () => {
    const urls: string[] = [];
    const client = new KiketClient({
      baseUrl: 'https://example.test',
      fetchImpl: async (input) => {
        urls.push(String(input));
        return jsonResponse({
          results: [{ type: 'issue', id: 'issue-1', title: 'Issue', snippet: 'Snippet', score: 1 }],
        });
      },
    });

    await client.search('risk');
    await client.semanticSearch('risk controls', 5);

    expect(urls[0]).toContain('/api/v1/search?q=risk');
    expect(urls[1]).toContain('/api/v1/search/semantic?q=risk+controls&limit=5');
  });

  it('uses knowledge, audit, compliance, and repository read endpoints', async () => {
    const urls: string[] = [];
    const client = new KiketClient({
      baseUrl: 'https://example.test',
      fetchImpl: async (input) => {
        const url = String(input);
        urls.push(url);
        if (url.includes('/knowledge/550e')) {
          return jsonResponse({
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Runbook',
            body: 'Body',
            category: null,
            tags: [],
            createdBy: null,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          });
        }
        if (url.includes('/repos/550e') && url.includes('/file')) {
          return jsonResponse({ path: '.kiket/workflows/support.yaml', content: 'name: Support', type: 'workflow' });
        }
        if (url.includes('/repos/550e') && url.includes('/diff')) {
          return jsonResponse({ data: [{ path: '.kiket/workflows/support.yaml', status: 'modified' }] });
        }
        if (url.includes('/compliance/report')) {
          return jsonResponse({ data: { totalIssues: 1 } });
        }
        return jsonResponse({ data: [] });
      },
    });

    await client.listKnowledgeDocuments('runbook');
    await client.getKnowledgeDocument('550e8400-e29b-41d4-a716-446655440000');
    await client.listAuditLogs({ resourceType: 'issue', limit: 25 });
    await client.getComplianceReport('gdpr');
    await client.getRepositoryFile('550e8400-e29b-41d4-a716-446655440000', '.kiket/workflows/support.yaml');
    await client.getRepositoryDiff('550e8400-e29b-41d4-a716-446655440000');

    expect(urls[0]).toContain('/api/v1/knowledge?search=runbook');
    expect(urls[1]).toContain('/api/v1/knowledge/550e8400-e29b-41d4-a716-446655440000');
    expect(urls[2]).toContain('/api/v1/audit-logs?resourceType=issue&limit=25');
    expect(urls[3]).toContain('/api/v1/compliance/report?type=gdpr&format=json');
    expect(urls[4]).toContain(
      '/api/v1/repos/550e8400-e29b-41d4-a716-446655440000/file?path=.kiket%2Fworkflows%2Fsupport.yaml',
    );
    expect(urls[5]).toContain('/api/v1/repos/550e8400-e29b-41d4-a716-446655440000/diff');
  });
});
