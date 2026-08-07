import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AutoRCAClient } from './index';

describe('AutoRCA Node.js / TypeScript SDK Suite', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('initializes with custom options and environment variable fallbacks', () => {
    process.env.AUTORCA_TENANT_ID = 'env-tenant';
    process.env.AUTORCA_PROJECT_ID = 'env-project';

    const client = new AutoRCAClient({
      endpoint: 'https://autorca.company.com/',
      apiKey: 'secret-token-123',
      targetRepo: 'acme/service-a',
    });

    expect(client).toBeDefined();
  });

  it('dispatches incident report successfully with correct payload and headers', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: 'Investigation dispatched',
        job: { jobId: 'job-999', podId: 'pod-123' },
      }),
    });
    global.fetch = mockFetch;

    const client = new AutoRCAClient({
      endpoint: 'https://autorca.company.com',
      apiKey: 'bearer-key-xyz',
      tenantId: 'org-finance',
      projectId: 'proj-ledger',
      targetRepo: 'finance/ledger-api',
      targetBranch: 'develop',
    });

    const result = await client.dispatchInvestigation({
      title: 'DatabaseConnectionTimeout',
      errorMessage: 'Failed to connect to primary DB cluster',
      stackTrace: 'Error: Connection timeout at DB.connect (/app/db.js:12)',
      harnessCommand: 'npm test',
    });

    expect(result.success).toBe(true);
    expect(result.jobId).toBe('job-999');
    expect(result.podId).toBe('pod-123');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];

    expect(url).toBe('https://autorca.company.com/api/worktree/dispatch');
    expect(options.method).toBe('POST');
    expect(options.headers['x-tenant-id']).toBe('org-finance');
    expect(options.headers['x-project-id']).toBe('proj-ledger');
    expect(options.headers['Authorization']).toBe('Bearer bearer-key-xyz');

    const body = JSON.parse(options.body);
    expect(body.title).toBe('DatabaseConnectionTimeout');
    expect(body.errorMessage).toBe('Failed to connect to primary DB cluster');
    expect(body.repoUrl).toBe('finance/ledger-api');
    expect(body.branchName).toBe('develop');
    expect(body.harnessCommand).toBe('npm test');
  });

  it('handles API failure gracefully without throwing unhandled exceptions', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Cluster Error',
    });
    global.fetch = mockFetch;

    const client = new AutoRCAClient({
      endpoint: 'https://autorca.company.com',
      apiKey: 'test-key',
    });

    const result = await client.dispatchInvestigation({
      title: 'UnhandledException',
      errorMessage: 'SyntaxError: Unexpected token',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('AutoRCA API returned status 500');
  });

  it('provides Express middleware error handler that catches exceptions asynchronously', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch;

    const client = new AutoRCAClient({
      endpoint: 'https://autorca.company.com',
    });

    const middleware = client.expressErrorHandler();
    const mockError = new Error('Middleware Caught Error');
    mockError.stack = 'Error: Middleware Caught Error\n    at Route.handler (/app/route.ts:5)';

    const req = { path: '/api/v1/checkout', method: 'POST', headers: { 'user-agent': 'TestAgent' } };
    const res = {};
    const next = vi.fn();

    middleware(mockError, req, res, next);

    expect(next).toHaveBeenCalledWith(mockError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
