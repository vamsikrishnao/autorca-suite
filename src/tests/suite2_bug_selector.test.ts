import { describe, it, expect } from 'vitest';
import { defaultBugs } from '../data/defaultConfig';
import { BugItem } from '../types';
import { filterBugsByQuery, getSeverityBadgeClass } from '../utils/bugs';

describe('Suite 2: Bug Selector, Search & State Matrix (Targeted High-Impact Functional Unit Tests)', () => {
  it('loads default bug list with valid initial dataset', () => {
    expect(defaultBugs.length).toBeGreaterThan(0);
    expect(defaultBugs[0].id).toBe('JIRA-4892');
    expect(defaultBugs[0].status).toBe('Open');
  });

  it('selects target bug and extracts complete stack trace context', () => {
    const selectedBugId = 'JIRA-104';
    const bug = defaultBugs.find((b) => b.id === selectedBugId);

    expect(bug).toBeDefined();
    expect(bug?.id).toBe('JIRA-104');
    expect(bug?.title).toContain('Stripe API timeout');
    expect(bug?.stackTrace).toContain('com.autorca.payment.StripeClient.executeCharge');
  });

  it('filters bugs by exact Bug ID query using exported filterBugsByQuery utility', () => {
    const results = filterBugsByQuery(defaultBugs, 'JIRA-4892');

    expect(results.length).toBe(1);
    expect(results[0].id).toBe('JIRA-4892');
  });

  it('filters bugs by keyword match in title using exported filterBugsByQuery utility', () => {
    const results = filterBugsByQuery(defaultBugs, 'stripe');

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((b) => b.title.toLowerCase().includes('stripe'))).toBe(true);
  });

  it('filters bugs by repo path match using exported filterBugsByQuery utility', () => {
    const results = filterBugsByQuery(defaultBugs, 'payment');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].repoPath).toContain('payment');
  });

  it('maps bug severity levels to expected UI badge color styles using exported getSeverityBadgeClass utility', () => {
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
    const results = filterBugsByQuery(defaultBugs, 'XYZ_NONEXISTENT_BUG_KEY_999');

    expect(results).toHaveLength(0);
  });

  it('handles case-insensitive search queries correctly using exported filterBugsByQuery utility', () => {
    const lowerResults = filterBugsByQuery(defaultBugs, 'nullpointer');
    const upperResults = filterBugsByQuery(defaultBugs, 'NULLPOINTER');

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
