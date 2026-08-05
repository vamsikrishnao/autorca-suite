import { describe, it, expect } from 'vitest';
import { TenantContext } from '../types';
import {
  buildTenantHeaders,
  buildSafeTenantHeaders,
  resolveTenantKey,
  checkOptimisticConcurrency,
  sanitizeTenantId,
} from '../utils/tenant';

describe('Suite 1: Multi-Tenant & Multi-Project Context Isolation (Targeted High-Impact Functional Unit Tests)', () => {
  const primaryTenant: TenantContext = {
    tenantId: 'org-acme-corp',
    teamId: 'team-payments',
    projectId: 'proj-autorca-suite',
    userId: 'user-engineer-1',
  };

  const secondaryTenant: TenantContext = {
    tenantId: 'org-fintech-global',
    teamId: 'team-core-banking',
    projectId: 'proj-ledger-service',
    userId: 'user-fintech-dev',
  };

  it('verifies primary tenant context structure contains valid organization and project identifiers', () => {
    expect(primaryTenant.tenantId).toBe('org-acme-corp');
    expect(primaryTenant.teamId).toBe('team-payments');
    expect(primaryTenant.projectId).toBe('proj-autorca-suite');
    expect(primaryTenant.userId).toBe('user-engineer-1');
  });

  it('verifies secondary tenant context isolation from primary tenant', () => {
    expect(secondaryTenant.tenantId).not.toBe(primaryTenant.tenantId);
    expect(secondaryTenant.projectId).not.toBe(primaryTenant.projectId);
    expect(secondaryTenant.teamId).not.toBe(primaryTenant.teamId);
  });

  it('generates unique composite isolation keys using exported resolveTenantKey utility', () => {
    const keyA = resolveTenantKey(primaryTenant.tenantId, primaryTenant.projectId);
    const keyB = resolveTenantKey(secondaryTenant.tenantId, secondaryTenant.projectId);

    expect(keyA).toBe('org-acme-corp:proj-autorca-suite');
    expect(keyB).toBe('org-fintech-global:proj-ledger-service');
    expect(keyA).not.toBe(keyB);
  });

  it('constructs correct HTTP isolation headers using exported buildTenantHeaders utility', () => {
    const headersA = buildTenantHeaders(primaryTenant);
    expect(headersA['x-tenant-id']).toBe('org-acme-corp');
    expect(headersA['x-team-id']).toBe('team-payments');
    expect(headersA['x-project-id']).toBe('proj-autorca-suite');
    expect(headersA['x-user-id']).toBe('user-engineer-1');
  });

  it('enforces header fallback defaults using exported buildSafeTenantHeaders utility', () => {
    const safeHeaders = buildSafeTenantHeaders({ tenantId: 'org-partial' });
    expect(safeHeaders['x-tenant-id']).toBe('org-partial');
    expect(safeHeaders['x-team-id']).toBe('default-team');
    expect(safeHeaders['x-project-id']).toBe('default-project');
    expect(safeHeaders['x-user-id']).toBe('anonymous');
  });

  it('prevents cross-tenant data leakage in in-memory state stores', () => {
    const store = new Map<string, { bugs: string[] }>();
    store.set(resolveTenantKey(primaryTenant.tenantId, primaryTenant.projectId), { bugs: ['BUG-409', 'BUG-512'] });
    store.set(resolveTenantKey(secondaryTenant.tenantId, secondaryTenant.projectId), { bugs: ['JIRA-4892'] });

    const acmeBugs = store.get('org-acme-corp:proj-autorca-suite')?.bugs;
    const fintechBugs = store.get('org-fintech-global:proj-ledger-service')?.bugs;
    const leakedBugs = store.get('org-acme-corp:proj-ledger-service')?.bugs;

    expect(acmeBugs).toEqual(['BUG-409', 'BUG-512']);
    expect(fintechBugs).toEqual(['JIRA-4892']);
    expect(leakedBugs).toBeUndefined();
  });

  it('detects optimistic concurrency conflicts (HTTP 409) using exported checkOptimisticConcurrency utility', () => {
    const staleResult = checkOptimisticConcurrency(1, 2);
    expect(staleResult.status).toBe(409);
    expect(staleResult.error).toBe('STALE_STATE_CONFLICT');
    expect(staleResult.serverVersion).toBe(2);
  });

  it('resolves optimistic concurrency using exported checkOptimisticConcurrency utility', () => {
    const validResult = checkOptimisticConcurrency(2, 2);
    expect(validResult.status).toBe(200);
    expect(validResult.success).toBe(true);
    expect(validResult.updatedVersion).toBe(3);
  });

  it('supports seamless project switching within the same organization context', () => {
    let activeContext = { ...primaryTenant };
    activeContext = { ...activeContext, projectId: 'proj-payment-webhooks' };

    expect(activeContext.tenantId).toBe('org-acme-corp');
    expect(activeContext.projectId).toBe('proj-payment-webhooks');
  });

  it('sanitizes organization string parameters using exported sanitizeTenantId utility', () => {
    expect(sanitizeTenantId('Org-Acme_Corp!')).toBe('org-acmecorp');
    expect(sanitizeTenantId('Tenant<script>')).toBe('tenantscript');
  });
});
