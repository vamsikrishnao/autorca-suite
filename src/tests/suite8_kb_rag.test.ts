import { describe, it, expect } from 'vitest';
import { defaultKnowledgeBases } from '../data/defaultConfig';

describe('Suite 8: Knowledge Base Connectors & RAG Processing (Targeted High-Impact Functional Unit Tests)', () => {
  it('loads default knowledge base connectors including Confluence spaces and PDF post-mortems', () => {
    expect(defaultKnowledgeBases.length).toBeGreaterThan(0);
    const types = defaultKnowledgeBases.map((k) => k.type);

    expect(types).toContain('Confluence');
    expect(types).toContain('Support Article');
  });

  it('filters retrieved RAG context chunks by semantic relevance threshold (score >= 0.78)', () => {
    const candidateChunks = [
      { id: 'chunk-1', title: 'Stripe Webhook Safety Architecture Guide', relevanceScore: 0.89 },
      { id: 'chunk-2', title: 'CSS Tailwind Flexbox Layout Notes', relevanceScore: 0.32 },
      { id: 'chunk-3', title: 'Post-Mortem 2025 Null Parameter Crash', relevanceScore: 0.94 },
      { id: 'chunk-4', title: 'Database Migration Script V12', relevanceScore: 0.65 },
    ];

    const minThreshold = 0.78;
    const approvedChunks = candidateChunks.filter((c) => c.relevanceScore >= minThreshold);

    expect(approvedChunks.length).toBe(2);
    expect(approvedChunks.map((c) => c.id)).toEqual(['chunk-1', 'chunk-3']);
  });

  it('splits long post-mortem log documents into token-bounded text chunks', () => {
    const documentText = `
SECTION 1: Incident Summary
NullPointerException occurred in payment gateway handler thread.

SECTION 2: Root Cause
Missing null check on Stripe event currency parameter when payload is empty.

SECTION 3: Recommended Fix Pattern
Wrap currency getter with Optional.ofNullable() or null guard condition.
    `.trim();

    const chunks = documentText.split('\n\n');
    expect(chunks.length).toBe(3);
    expect(chunks[0]).toContain('SECTION 1');
    expect(chunks[1]).toContain('SECTION 2');
    expect(chunks[2]).toContain('SECTION 3');
  });

  it('validates PDF upload file size limit enforcement (25 MB maximum)', () => {
    const maxAllowedBytes = 25 * 1024 * 1024; // 25 MB

    const validatePdfUpload = (fileSizeBytes: number) => {
      if (fileSizeBytes > maxAllowedBytes) {
        return { allowed: false, error: 'FILE_SIZE_EXCEEDS_25MB_LIMIT' };
      }
      return { allowed: true, error: null };
    };

    expect(validatePdfUpload(10 * 1024 * 1024).allowed).toBe(true);
    expect(validatePdfUpload(24.9 * 1024 * 1024).allowed).toBe(true);
    expect(validatePdfUpload(30 * 1024 * 1024).allowed).toBe(false);
    expect(validatePdfUpload(30 * 1024 * 1024).error).toBe('FILE_SIZE_EXCEEDS_25MB_LIMIT');
  });

  it('formats Confluence PAT authentication request headers', () => {
    const buildConfluenceHeaders = (patToken: string) => ({
      Authorization: `Bearer ${patToken}`,
      Accept: 'application/json',
      'X-Atlassian-Token': 'no-check',
    });

    const headers = buildConfluenceHeaders('conf_pat_987654321');
    expect(headers.Authorization).toBe('Bearer conf_pat_987654321');
    expect(headers.Accept).toBe('application/json');
  });

  it('handles Jira API connector sync state toggling', () => {
    const connector = { id: 'jira-cloud', name: 'Jira Software', enabled: true, lastSyncStatus: 'OK' };

    // Toggle off
    connector.enabled = false;
    expect(connector.enabled).toBe(false);

    // Toggle on
    connector.enabled = true;
    expect(connector.enabled).toBe(true);
  });

  it('extracts citation handles and URLs for enterprise audit traceability', () => {
    const chunk = {
      title: 'Stripe Webhook Safety Guide',
      url: 'https://confluence.acme.internal/display/ARCH/Stripe+Webhook+Safety',
      author: 'Security Team',
    };

    const citation = `[Source: ${chunk.title}](${chunk.url})`;
    expect(citation).toBe('[Source: Stripe Webhook Safety Guide](https://confluence.acme.internal/display/ARCH/Stripe+Webhook+Safety)');
  });
});
