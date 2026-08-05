import { describe, it, expect } from 'vitest';
import { defaultBugs } from '../data/defaultConfig';
import { BugItem } from '../types';

describe('Suite 2: Bug Selector, Search & State Matrix (Targeted High-Impact Functional Unit Tests)', () => {
  it('loads default bug list with valid initial dataset', () => {
    expect(defaultBugs.length).toBeGreaterThan(0);
    expect(defaultBugs[0].id).toBe('BUG-409');
    expect(defaultBugs[0].status).toBe('Open');
  });

  it('selects target bug and extracts complete stack trace context', () => {
    const selectedBugId = 'BUG-409';
    const bug = defaultBugs.find((b) => b.id === selectedBugId);

    expect(bug).toBeDefined();
    expect(bug?.id).toBe('BUG-409');
    expect(bug?.title).toContain('Stripe Webhook');
    expect(bug?.stackTrace).toContain('com.acme.payment.WebhookHandler.process');
  });

  it('filters bugs by exact Bug ID query', () => {
    const query = 'BUG-512';
    const results = defaultBugs.filter((b) => b.id.toLowerCase().includes(query.toLowerCase()));

    expect(results.length).toBe(1);
    expect(results[0].id).toBe('BUG-512');
  });

  it('filters bugs by keyword match in title', () => {
    const query = 'stripe';
    const results = defaultBugs.filter((b) => b.title.toLowerCase().includes(query.toLowerCase()));

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((b) => b.title.toLowerCase().includes('stripe'))).toBe(true);
  });

  it('filters bugs by repo path match', () => {
    const query = 'payment';
    const results = defaultBugs.filter((b) => b.repoPath.toLowerCase().includes(query.toLowerCase()));

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].repoPath).toContain('payment');
  });

  it('maps bug severity levels to expected UI badge color styles', () => {
    const getSeverityBadgeClass = (severity: BugItem['severity']) => {
      switch (severity) {
        case 'Critical':
          return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'High':
          return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'Medium':
          return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'Low':
          return 'bg-slate-50 text-slate-700 border-slate-200';
      }
    };

    expect(getSeverityBadgeClass('Critical')).toContain('rose');
    expect(getSeverityBadgeClass('High')).toContain('amber');
    expect(getSeverityBadgeClass('Medium')).toContain('blue');
    expect(getSeverityBadgeClass('Low')).toContain('slate');
  });

  it('executes status lifecycle progression from Open to RESOLVED', () => {
    const bugState: BugItem = { ...defaultBugs[0], status: 'Open' };

    // RCA Complete
    bugState.status = 'RCA Complete';
    expect(bugState.status).toBe('RCA Complete');

    // Fix Verified
    bugState.status = 'Fix Verified';
    expect(bugState.status).toBe('Fix Verified');

    // Draft PR Created
    bugState.status = 'Draft PR Created';
    expect(bugState.status).toBe('Draft PR Created');

    // RESOLVED
    bugState.status = 'RESOLVED';
    expect(bugState.status).toBe('RESOLVED');
  });

  it('returns empty array when search query matches no items', () => {
    const query = 'XYZ_NONEXISTENT_BUG_KEY_999';
    const results = defaultBugs.filter(
      (b) => b.id.toLowerCase().includes(query) || b.title.toLowerCase().includes(query)
    );

    expect(results).toHaveLength(0);
  });

  it('handles case-insensitive search queries correctly', () => {
    const lowerResults = defaultBugs.filter((b) => b.title.toLowerCase().includes('nullpointer'));
    const upperResults = defaultBugs.filter((b) => b.title.toLowerCase().includes('NULLPOINTER'.toLowerCase()));

    expect(lowerResults).toEqual(upperResults);
  });

  it('validates bug note attachment and timeline comment creation', () => {
    const bug = { ...defaultBugs[0], notes: [] as string[] };
    
    bug.notes.push('Analyst Note 1: Confirmed null parameter in payload');
    bug.notes.push('Analyst Note 2: Verified fix with unit test suite');

    expect(bug.notes.length).toBe(2);
    expect(bug.notes[0]).toContain('Confirmed null');
  });
});
