import { TenantContext } from '../types';

export function buildTenantHeaders(ctx: TenantContext): Record<string, string> {
  return {
    'x-tenant-id': ctx.tenantId,
    'x-team-id': ctx.teamId,
    'x-project-id': ctx.projectId,
    'x-user-id': ctx.userId,
  };
}

export function buildSafeTenantHeaders(ctx: Partial<TenantContext>): Record<string, string> {
  return {
    'x-tenant-id': ctx.tenantId || 'default-org',
    'x-team-id': ctx.teamId || 'default-team',
    'x-project-id': ctx.projectId || 'default-project',
    'x-user-id': ctx.userId || 'anonymous',
  };
}

export function resolveTenantKey(tenantId: string, projectId: string): string {
  return `${tenantId}:${projectId}`;
}

export function checkOptimisticConcurrency(
  clientVersion: number,
  serverVersion: number
): { status: number; success?: boolean; updatedVersion?: number; error?: string; serverVersion?: number } {
  if (clientVersion < serverVersion) {
    return { status: 409, error: 'STALE_STATE_CONFLICT', serverVersion };
  }
  return { status: 200, success: true, updatedVersion: serverVersion + 1 };
}

export function sanitizeTenantId(rawId: string): string {
  return rawId.toLowerCase().replace(/[^a-z0-9-]/g, '');
}
