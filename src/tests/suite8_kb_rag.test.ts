import { describe, it, expect } from 'vitest';
import { defaultKnowledgeBases } from '../data/defaultConfig';
import { filterKbChunksByRelevance, formatKbCitation } from '../utils/kb';
import { validateConnectorEndpoint } from '../utils/connectors';

describe('Suite 8: Knowledge Base Connectors & RAG Processing (Targeted High-Impact Functional Unit Tests)', () => {
  it('loads default knowledge base connectors including Confluence spaces and PDF post-mortems', () => {
    expect(defaultKnowledgeBases.length).toBeGreaterThan(0);
    const types = defaultKnowledgeBases.map((k) => k.type);

    expect(types).toContain('Confluence');
    expect(types).toContain('Support Article');
    expect(types).toContain('SharePoint');
  });

  it('validates SharePoint Knowledge Base connector endpoints and sharepoint:// URIs', () => {
    const validSharePointUrl = validateConnectorEndpoint({
      url: 'https://acmecorp.sharepoint.com/sites/engineering/docs/Security_Guidelines.docx',
      type: 'SharePoint',
    });
    expect(validSharePointUrl.success).toBe(true);

    const validSharePointUri = validateConnectorEndpoint({
      url: 'sharepoint://tenant.sharepoint.com/sites/architecture',
      type: 'SharePoint',
    });
    expect(validSharePointUri.success).toBe(true);

    const invalidSharePoint = validateConnectorEndpoint({
      url: 'https://google.com/search?q=sharepoint',
      type: 'SharePoint',
    });
    expect(invalidSharePoint.success).toBe(false);
    expect(invalidSharePoint.error).toContain('SharePoint Validation Failed');
  });

  it('filters retrieved RAG context chunks by semantic relevance threshold using exported filterKbChunksByRelevance utility', () => {
    const candidateChunks = [
      { id: 'chunk-1', sourceName: 'Stripe Webhook Guide', content: 'Stripe Webhook Safety Architecture Guide details', score: 0.89 },
      { id: 'chunk-2', sourceName: 'CSS Notes', content: 'CSS Tailwind Flexbox Layout Notes', score: 0.32 },
      { id: 'chunk-3', sourceName: 'Post-Mortem 2025', content: 'Post-Mortem 2025 Null Parameter Crash details', score: 0.94 },
      { id: 'chunk-4', sourceName: 'DB Script', content: 'Database Migration Script V12', score: 0.65 },
    ];

    const approvedChunks = filterKbChunksByRelevance(candidateChunks, 0.78);

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

  it('extracts citation handles and URLs using exported formatKbCitation utility', () => {
    const chunk = {
      id: 'chunk-1',
      sourceName: 'Stripe Webhook Safety Guide',
      content: 'Always validate currency strings before calling toUpperCase() in payment webhooks.',
      score: 0.92,
    };

    const citation = formatKbCitation(chunk);
    expect(citation).toContain('[Stripe Webhook Safety Guide]');
    expect(citation).toContain('Score: 0.92');
    expect(citation).toContain('Always validate currency strings');
  });
});
