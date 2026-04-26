import { describe, expect, it, vi } from 'vitest';
import { callTool, tools } from '../src/tools.js';

describe('Kiket MCP tools', () => {
  it('exposes platform resource tools without legacy project or issue semantics', () => {
    const names = tools.map((tool) => tool.name);
    const publicText = tools
      .map((tool) => `${tool.name} ${tool.description}`)
      .join('\n')
      .toLowerCase();

    expect(names).toContain('kiket_list_workspaces');
    expect(names).toContain('kiket_list_cases');
    expect(names).toContain('kiket_list_findings');
    expect(names).toContain('kiket_import_evidence');
    expect(names).toContain('kiket_generate_report');
    expect(names).toContain('kiket_create_anchor_proof');
    expect(names).toContain('kiket_verify_anchor');
    expect(names.some((name) => name.includes('project') || name.includes('issue'))).toBe(false);
    expect(publicText).not.toMatch(/\b(project|projects|issue|issues|task|tasks)\b/);
  });

  it('routes tool calls through the authorized API client', async () => {
    const client = {
      listWorkspaces: vi.fn(async () => [{ id: 'workspace-1' }]),
      validateConfig: vi.fn(async () => ({ valid: true, errors: [] })),
      triggerScannerRun: vi.fn(async () => ({ run: { id: 'scan-1' }, findings: [] })),
      importEvidence: vi.fn(async () => ({ id: 'evidence-1' })),
      generateReport: vi.fn(async () => ({ id: 'report-1' })),
      verifyReport: vi.fn(async () => ({ valid: true })),
      createAnchorProof: vi.fn(async () => ({ id: 'anchor-1', status: 'local_only' })),
      verifyAnchor: vi.fn(async () => ({ valid: true })),
    };

    await callTool(client as never, 'kiket_list_workspaces');
    await callTool(client as never, 'kiket_validate_config', { yaml: 'model_version: 2' });
    await callTool(client as never, 'kiket_trigger_scan', { idempotencyKey: 'mcp:test' });
    await callTool(client as never, 'kiket_import_evidence', {
      evidenceType: 'approval',
      title: 'Approval',
      sourceSystem: 'github',
      dedupeKey: 'approval:1',
    });
    await callTool(client as never, 'kiket_generate_report', { reportKey: 'audit', title: 'Audit' });
    await callTool(client as never, 'kiket_verify_report', { reportId: 'report-1' });
    await callTool(client as never, 'kiket_create_anchor_proof', {
      subjectType: 'evidence',
      subjectId: 'evidence-1',
      subjectHash: 'abc123',
      requestSubmission: true,
    });
    await callTool(client as never, 'kiket_verify_anchor', { anchorId: 'anchor-1' });

    expect(client.listWorkspaces).toHaveBeenCalled();
    expect(client.validateConfig).toHaveBeenCalledWith('model_version: 2');
    expect(client.triggerScannerRun).toHaveBeenCalledWith({ trigger: 'manual', idempotencyKey: 'mcp:test' });
    expect(client.importEvidence).toHaveBeenCalled();
    expect(client.generateReport).toHaveBeenCalledWith({ reportKey: 'audit', title: 'Audit' });
    expect(client.verifyReport).toHaveBeenCalledWith('report-1');
    expect(client.createAnchorProof).toHaveBeenCalledWith({
      subjectType: 'evidence',
      subjectId: 'evidence-1',
      subjectHash: 'abc123',
      requestSubmission: true,
    });
    expect(client.verifyAnchor).toHaveBeenCalledWith('anchor-1');
  });
});
