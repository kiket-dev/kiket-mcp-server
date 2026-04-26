import type { KiketClient } from '@kiket/api-client';

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export const tools: McpTool[] = [
  listTool('kiket_list_workspaces', 'List operational workspaces visible to the authenticated tenant.'),
  listTool('kiket_list_processes', 'List monitored processes visible to the authenticated tenant.'),
  listTool('kiket_list_cases', 'List operational cases visible to the authenticated tenant.'),
  listTool('kiket_list_findings', 'List compliance findings with lifecycle status and explanations.'),
  listTool('kiket_list_evidence', 'List normalized evidence records for audit and investigation.'),
  listTool('kiket_list_scanner_runs', 'List scanner runs for compliance monitoring visibility.'),
  listTool('kiket_list_reports', 'List generated audit report snapshots.'),
  listTool('kiket_list_anchor_proofs', 'List local and submitted audit anchor proofs.'),
  listTool('kiket_list_ingestion_failures', 'List failed or quarantined ingestion records without raw payloads.'),
  {
    name: 'kiket_validate_config',
    description: 'Validate process configuration through the authenticated platform API.',
    inputSchema: objectSchema({ yaml: { type: 'string' } }, ['yaml']),
  },
  {
    name: 'kiket_run_simulation',
    description: 'Run process simulation through the authenticated platform API.',
    inputSchema: objectSchema(
      {
        originalYaml: { type: 'string' },
        modifiedYaml: { type: 'string' },
        instances: { type: 'array', items: {} },
      },
      ['originalYaml', 'modifiedYaml'],
    ),
  },
  {
    name: 'kiket_trigger_scan',
    description: 'Trigger a scanner run through the authorized platform API.',
    inputSchema: objectSchema({
      workspaceId: { type: 'string' },
      processId: { type: 'string' },
      caseId: { type: 'string' },
      trigger: { type: 'string', enum: ['event', 'scheduled', 'backfill', 'manual', 'simulation'] },
      idempotencyKey: { type: 'string' },
      eventId: { type: 'string' },
    }),
  },
  {
    name: 'kiket_import_evidence',
    description: 'Import normalized evidence through the authorized platform API.',
    inputSchema: objectSchema(
      {
        workspaceId: { type: 'string' },
        processId: { type: 'string' },
        caseId: { type: 'string' },
        evidenceType: { type: 'string' },
        title: { type: 'string' },
        sourceSystem: { type: 'string' },
        sourceObjectId: { type: 'string' },
        capturedAt: { type: 'string' },
        payload: { type: 'object' },
        retentionPolicy: { type: 'object' },
        dedupeKey: { type: 'string' },
      },
      ['evidenceType', 'title', 'sourceSystem', 'dedupeKey'],
    ),
  },
  {
    name: 'kiket_generate_report',
    description: 'Generate an audit report snapshot through the authorized platform API.',
    inputSchema: objectSchema(
      {
        workspaceId: { type: 'string' },
        processId: { type: 'string' },
        caseId: { type: 'string' },
        reportKey: { type: 'string' },
        title: { type: 'string' },
        periodStart: { type: 'string' },
        periodEnd: { type: 'string' },
        metadata: { type: 'object' },
      },
      ['reportKey', 'title'],
    ),
  },
  {
    name: 'kiket_verify_report',
    description: 'Verify an audit report hash through the authorized platform API.',
    inputSchema: objectSchema({ reportId: { type: 'string' } }, ['reportId']),
  },
  {
    name: 'kiket_create_anchor_proof',
    description:
      'Create a local or submitted audit anchor proof for report, evidence, or finding integrity through the authorized platform API.',
    inputSchema: objectSchema(
      {
        workspaceId: { type: 'string' },
        subjectType: { type: 'string' },
        subjectId: { type: 'string' },
        subjectHash: { type: 'string' },
        hashAlgorithm: { type: 'string' },
        chain: { type: 'string' },
        network: { type: 'string' },
        requestSubmission: { type: 'boolean' },
      },
      ['subjectType', 'subjectId', 'subjectHash'],
    ),
  },
  {
    name: 'kiket_verify_anchor',
    description: 'Verify an audit anchor proof through the authorized platform API.',
    inputSchema: objectSchema({ anchorId: { type: 'string' } }, ['anchorId']),
  },
];

export async function callTool(client: KiketClient, name: string, input: Record<string, unknown> = {}) {
  switch (name) {
    case 'kiket_list_workspaces':
      return client.listWorkspaces();
    case 'kiket_list_processes':
      return client.listProcesses();
    case 'kiket_list_cases':
      return client.listCases();
    case 'kiket_list_findings':
      return client.listFindings();
    case 'kiket_list_evidence':
      return client.listEvidence();
    case 'kiket_list_scanner_runs':
      return client.listScannerRuns();
    case 'kiket_list_reports':
      return client.listReports();
    case 'kiket_list_anchor_proofs':
      return client.listAnchorProofs();
    case 'kiket_list_ingestion_failures':
      return client.listIngestionFailures();
    case 'kiket_validate_config':
      return client.validateConfig(requiredString(input, 'yaml'));
    case 'kiket_run_simulation':
      return client.runSimulation({
        originalYaml: requiredString(input, 'originalYaml'),
        modifiedYaml: requiredString(input, 'modifiedYaml'),
        instances: Array.isArray(input.instances) ? input.instances : [],
      });
    case 'kiket_trigger_scan':
      return client.triggerScannerRun({
        workspaceId: optionalString(input, 'workspaceId'),
        processId: optionalString(input, 'processId'),
        caseId: optionalString(input, 'caseId'),
        trigger: (optionalString(input, 'trigger') ?? 'manual') as
          | 'event'
          | 'scheduled'
          | 'backfill'
          | 'manual'
          | 'simulation',
        idempotencyKey: optionalString(input, 'idempotencyKey') ?? `mcp:${crypto.randomUUID()}`,
        eventId: optionalString(input, 'eventId'),
      });
    case 'kiket_import_evidence':
      return client.importEvidence({
        workspaceId: optionalString(input, 'workspaceId'),
        processId: optionalString(input, 'processId'),
        caseId: optionalString(input, 'caseId'),
        evidenceType: requiredString(input, 'evidenceType'),
        title: requiredString(input, 'title'),
        sourceSystem: requiredString(input, 'sourceSystem'),
        sourceObjectId: optionalString(input, 'sourceObjectId'),
        capturedAt: optionalString(input, 'capturedAt'),
        payload: objectInput(input.payload),
        retentionPolicy: objectInput(input.retentionPolicy),
        dedupeKey: requiredString(input, 'dedupeKey'),
      });
    case 'kiket_generate_report':
      return client.generateReport({
        workspaceId: optionalString(input, 'workspaceId'),
        processId: optionalString(input, 'processId'),
        caseId: optionalString(input, 'caseId'),
        reportKey: requiredString(input, 'reportKey'),
        title: requiredString(input, 'title'),
        periodStart: optionalString(input, 'periodStart'),
        periodEnd: optionalString(input, 'periodEnd'),
        metadata: objectInput(input.metadata),
      });
    case 'kiket_verify_report':
      return client.verifyReport(requiredString(input, 'reportId'));
    case 'kiket_create_anchor_proof':
      return client.createAnchorProof({
        workspaceId: optionalString(input, 'workspaceId'),
        subjectType: requiredString(input, 'subjectType'),
        subjectId: requiredString(input, 'subjectId'),
        subjectHash: requiredString(input, 'subjectHash'),
        hashAlgorithm: optionalString(input, 'hashAlgorithm'),
        chain: optionalString(input, 'chain'),
        network: optionalString(input, 'network'),
        requestSubmission: typeof input.requestSubmission === 'boolean' ? input.requestSubmission : false,
      });
    case 'kiket_verify_anchor':
      return client.verifyAnchor(requiredString(input, 'anchorId'));
    default:
      throw new Error(`Unknown Kiket MCP tool "${name}".`);
  }
}

function listTool(name: string, description: string): McpTool {
  return { name, description, inputSchema: objectSchema({}) };
}

function objectSchema(properties: Record<string, unknown>, required?: string[]): McpTool['inputSchema'] {
  return { type: 'object', properties, required };
}

function requiredString(input: Record<string, unknown>, key: string) {
  const value = input[key];
  if (typeof value !== 'string' || value.length === 0) throw new Error(`Missing required input "${key}".`);
  return value;
}

function optionalString(input: Record<string, unknown>, key: string) {
  const value = input[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function objectInput(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}
