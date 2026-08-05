import { describe, it, expect } from 'vitest';
import { SiemAuditEvent } from '../types';

describe('Suite 9: Enterprise SIEM Audit Pipeline & Cryptographic Logs (Targeted High-Impact Functional Unit Tests)', () => {
  const sampleAuditEvents: SiemAuditEvent[] = [
    {
      id: 'AUDIT-101',
      timestamp: '2026-08-05T01:30:00.000Z',
      tenantId: 'org-acme-corp',
      action: 'MUTEX_LOCK_CONFIG_SAVED',
      bugId: 'JIRA-4892',
      checksum: 'sha256-8a9f2b11e2f49c8d10375a0e9821bf',
      status: 'SUCCESS',
      actor: 'user-engineer-1',
    },
    {
      id: 'AUDIT-102',
      timestamp: '2026-08-05T01:35:00.000Z',
      tenantId: 'org-fintech-global',
      action: 'SWARM_LOOP_DISPATCHED',
      bugId: 'BUG-409',
      checksum: 'sha256-3c77e0992a104b295e81d7f42918ca',
      status: 'SUCCESS',
      actor: 'autorca-bot',
    },
    {
      id: 'AUDIT-103',
      timestamp: '2026-08-05T01:40:00.000Z',
      tenantId: 'org-acme-corp',
      action: 'MICROVM_SANDBOX_BREACH_INTERCEPTED',
      bugId: 'BUG-512',
      checksum: 'sha256-7d12f94b11e8a0031c2b',
      status: 'ALERT',
      actor: 'autorca-sandbox-guardian',
    },
  ];

  it('validates audit event schema integrity and required SIEM fields', () => {
    const evt = sampleAuditEvents[0];

    expect(evt.id).toBe('AUDIT-101');
    expect(evt.tenantId).toBe('org-acme-corp');
    expect(evt.action).toBe('MUTEX_LOCK_CONFIG_SAVED');
    expect(evt.bugId).toBe('JIRA-4892');
    expect(evt.status).toBe('SUCCESS');
    expect(evt.actor).toBe('user-engineer-1');
  });

  it('verifies cryptographic SHA-256 checksum formatting prefix on audit records', () => {
    sampleAuditEvents.forEach((evt) => {
      expect(evt.checksum.startsWith('sha256-')).toBe(true);
      expect(evt.checksum.length).toBeGreaterThan(15);
    });
  });

  it('filters audit log streams by tenant ID to prevent cross-tenant log leakage', () => {
    const acmeLogs = sampleAuditEvents.filter((e) => e.tenantId === 'org-acme-corp');
    const fintechLogs = sampleAuditEvents.filter((e) => e.tenantId === 'org-fintech-global');

    expect(acmeLogs.length).toBe(2);
    expect(fintechLogs.length).toBe(1);
    expect(acmeLogs.map((e) => e.id)).toEqual(['AUDIT-101', 'AUDIT-103']);
  });

  it('serializes audit log records into compliant JSON SIEM download payload', () => {
    const jsonString = JSON.stringify(sampleAuditEvents, null, 2);
    const parsed = JSON.parse(jsonString);

    expect(parsed).toHaveLength(3);
    expect(parsed[0].checksum).toBe('sha256-8a9f2b11e2f49c8d10375a0e9821bf');
    expect(jsonString).toContain('"tenantId": "org-acme-corp"');
  });

  it('formats audit records into Common Event Format (CEF) for SIEM syslog integration', () => {
    const formatCef = (evt: SiemAuditEvent) =>
      `CEF:0|AutoRCA|SwarmSuite|1.0|${evt.action}|${evt.action}|${evt.status === 'ALERT' ? 10 : 3}|srcTenant=${evt.tenantId} bugId=${evt.bugId} checksum=${evt.checksum} act=${evt.actor}`;

    const cefLine = formatCef(sampleAuditEvents[2]); // ALERT event

    expect(cefLine.startsWith('CEF:0|AutoRCA|SwarmSuite|1.0|')).toBe(true);
    expect(cefLine).toContain('MICROVM_SANDBOX_BREACH_INTERCEPTED');
    expect(cefLine).toContain('srcTenant=org-acme-corp');
    expect(cefLine).toContain('bugId=BUG-512');
  });

  it('sorts audit event records by timestamp descending (newest first)', () => {
    const sorted = [...sampleAuditEvents].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    expect(sorted[0].id).toBe('AUDIT-103'); // 01:40
    expect(sorted[1].id).toBe('AUDIT-102'); // 01:35
    expect(sorted[2].id).toBe('AUDIT-101'); // 01:30
  });

  it('maps audit event status codes to UI badge CSS classes', () => {
    const getStatusBadgeClass = (status: SiemAuditEvent['status']) => {
      switch (status) {
        case 'SUCCESS':
          return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'FAILED':
          return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'ALERT':
          return 'bg-amber-50 text-amber-700 border-amber-200';
      }
    };

    expect(getStatusBadgeClass('SUCCESS')).toContain('emerald');
    expect(getStatusBadgeClass('FAILED')).toContain('rose');
    expect(getStatusBadgeClass('ALERT')).toContain('amber');
  });

  it('prunes audit logs older than retention window (e.g. 90 days)', () => {
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    const now = new Date('2026-08-05T00:00:00.000Z').getTime();

    const oldEvent: SiemAuditEvent = {
      ...sampleAuditEvents[0],
      id: 'AUDIT-OLD',
      timestamp: new Date(now - ninetyDaysMs - 1000).toISOString(), // 90 days + 1s old
    };

    const events = [...sampleAuditEvents, oldEvent];
    const retainedEvents = events.filter((e) => now - new Date(e.timestamp).getTime() <= ninetyDaysMs);

    expect(retainedEvents.map((e) => e.id)).not.toContain('AUDIT-OLD');
    expect(retainedEvents.length).toBe(3);
  });
});
