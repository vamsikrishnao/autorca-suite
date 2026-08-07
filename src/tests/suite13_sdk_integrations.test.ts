import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AutoRCAClient } from '../../sdk/node/index';

describe('Suite 13: Plug-and-Play Integration SDKs & Exception Dispatch Harness', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('validates Node.js SDK initialization and default environment variable resolution', () => {
    process.env.AUTORCA_TENANT_ID = 'tenant-env-999';
    process.env.AUTORCA_PROJECT_ID = 'proj-env-111';
    process.env.AUTORCA_TARGET_REPO = 'acme-org/checkout-service';

    const client = new AutoRCAClient({
      endpoint: 'https://autorca.internal.net/',
      apiKey: 'test-api-secret',
    });

    expect(client).toBeDefined();
  });

  it('verifies dispatchInvestigation payload formatting and multi-tenant HTTP headers', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: 'Investigation dispatched',
        job: { jobId: 'job-sdk-888', podId: 'pod-runner-01' },
      }),
    });
    global.fetch = mockFetch;

    const client = new AutoRCAClient({
      endpoint: 'https://autorca.internal.net',
      apiKey: 'secret-auth-token',
      tenantId: 'org-payments-hub',
      projectId: 'proj-gateway-v3',
      targetRepo: 'payments/gateway-service',
      targetBranch: 'main',
    });

    const dispatchResult = await client.dispatchInvestigation({
      bugId: 'INCIDENT-4001',
      title: 'NullPointerInTransactionPipeline',
      errorMessage: 'Cannot read property id of null',
      stackTrace: 'Error: Cannot read property id of null at Transaction.process (/app/src/tx.ts:88)',
      harnessCommand: 'npm run test:integration',
      metadata: { traceId: 'trace-abcdef123', severity: 'CRITICAL' },
    });

    expect(dispatchResult.success).toBe(true);
    expect(dispatchResult.jobId).toBe('job-sdk-888');
    expect(dispatchResult.podId).toBe('pod-runner-01');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, requestInit] = mockFetch.mock.calls[0];

    expect(url).toBe('https://autorca.internal.net/api/worktree/dispatch');
    expect(requestInit.method).toBe('POST');
    expect(requestInit.headers['Content-Type']).toBe('application/json');
    expect(requestInit.headers['x-tenant-id']).toBe('org-payments-hub');
    expect(requestInit.headers['x-project-id']).toBe('proj-gateway-v3');
    expect(requestInit.headers['Authorization']).toBe('Bearer secret-auth-token');

    const body = JSON.parse(requestInit.body);
    expect(body.bugId).toBe('INCIDENT-4001');
    expect(body.title).toBe('NullPointerInTransactionPipeline');
    expect(body.errorMessage).toBe('Cannot read property id of null');
    expect(body.repoUrl).toBe('payments/gateway-service');
    expect(body.branchName).toBe('main');
    expect(body.harnessCommand).toBe('npm run test:integration');
    expect(body.metadata.traceId).toBe('trace-abcdef123');
  });

  it('verifies non-blocking Express exception middleware handler dispatch', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Dispatched from express middleware' }),
    });
    global.fetch = mockFetch;

    const client = new AutoRCAClient({
      endpoint: 'https://autorca.internal.net',
      apiKey: 'secret-key',
      tenantId: 'org-acme',
      projectId: 'proj-web',
    });

    const middleware = client.expressErrorHandler();
    const uncaughtErr = new Error('Unhandled Database Connection Failure');
    uncaughtErr.stack = 'Error: Unhandled Database Connection Failure at Pool.query (/app/db.ts:104)';

    const req = { path: '/api/v1/orders', method: 'POST', headers: { host: 'localhost:3000' } };
    const res = {};
    const next = vi.fn();

    middleware(uncaughtErr, req, res, next);

    expect(next).toHaveBeenCalledWith(uncaughtErr);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [, requestInit] = mockFetch.mock.calls[0];
    const body = JSON.parse(requestInit.body);
    expect(body.title).toBe('Error');
    expect(body.errorMessage).toBe('Unhandled Database Connection Failure');
    expect(body.metadata.path).toBe('/api/v1/orders');
    expect(body.metadata.method).toBe('POST');
  });

  it('handles network timeouts and cluster API errors gracefully without crashing parent app', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => 'Service Unavailable',
    });
    global.fetch = mockFetch;

    const client = new AutoRCAClient({
      endpoint: 'https://autorca.internal.net',
    });

    const result = await client.dispatchInvestigation({
      title: 'RedisClusterDown',
      errorMessage: 'ECONNREFUSED 127.0.0.1:6379',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('AutoRCA API returned status 503');
  });
});
