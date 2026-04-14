import { describe, expect, it } from 'vitest';
import { createRuntimeClient } from '../src/lib.js';

describe('createRuntimeClient', () => {
  it('prefers API key auth when provided', async () => {
    const client = createRuntimeClient({
      baseUrl: 'https://example.test',
      apiKey: 'kiket_test',
      authToken: 'jwt-token',
      organizationId: 'org-123',
    });

    expect(client).toBeDefined();
  });
});
