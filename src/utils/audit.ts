export interface SiemAuditEvent {
  id: string;
  timestamp: string;
  tenantId: string;
  action: string;
  bugId: string;
  jobId?: string;
  checksum: string;
  status: string;
  actor: string;
}

export function generateAuditChecksum(tenantId: string, action: string, bugId: string): string {
  return `sha256-${Math.abs(
    (tenantId + action + bugId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ).toString(16)}`;
}

export function createSiemAuditEvent(evt: Partial<SiemAuditEvent>): SiemAuditEvent {
  return {
    id: `AUDIT-${Date.now()}`,
    timestamp: new Date().toISOString(),
    tenantId: evt.tenantId || 'org-acme-corp',
    action: evt.action || 'SYSTEM_EVENT',
    bugId: evt.bugId || 'GENERAL',
    jobId: evt.jobId,
    checksum: evt.checksum || generateAuditChecksum(evt.tenantId || 'org-acme-corp', evt.action || 'SYSTEM_EVENT', evt.bugId || 'GENERAL'),
    status: evt.status || 'SUCCESS',
    actor: evt.actor || 'autorca-agent',
  };
}

export function formatCef(evt: SiemAuditEvent): string {
  const severity = evt.status === 'ALERT' ? 10 : evt.status === 'FAILED' ? 7 : 3;
  return `CEF:0|AutoRCA|SwarmSuite|1.0|${evt.action}|${evt.action}|${severity}|srcTenant=${evt.tenantId} bugId=${evt.bugId} checksum=${evt.checksum} act=${evt.actor}`;
}

export function getSiemStatusBadgeClass(status: string): string {
  switch (status) {
    case 'SUCCESS':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'FAILED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'ALERT':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}
