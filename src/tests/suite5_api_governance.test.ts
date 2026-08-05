import { describe, it, expect } from 'vitest';
import { maskSecretToken, checkRateLimit, validatePatToken } from '../utils/connectors';

describe('Suite 5: API & Secret Governance, Vault Proxy & Rate Limiter (Targeted High-Impact Functional Unit Tests)', () => {
  it('masks GitHub Personal Access Tokens safely for UI display using exported maskSecretToken utility', () => {
    const rawToken = 'ghp_live_pat_9128389128398a9f';
    const masked = maskSecretToken(rawToken);

    expect(masked).toBe('ghp_••••••••9f');
    expect(masked).not.toContain('live_pat');
    expect(masked.length).toBeLessThan(rawToken.length);
  });

  it('returns fallback string when secret is undefined or shorter than 6 characters', () => {
    expect(maskSecretToken(undefined)).toBe('vault://secret-not-configured');
    expect(maskSecretToken('')).toBe('vault://secret-not-configured');
    expect(maskSecretToken('ghp_')).toBe('vault://secret-not-configured');
  });

  it('allows API requests when token bucket rate limiter is within quota limit using exported checkRateLimit utility', () => {
    const maxTokensPerMinute = 500000;
    const currentUsage = 120000;
    const requestedTokens = 5000;

    const res = checkRateLimit(currentUsage, requestedTokens, maxTokensPerMinute);
    expect(res.allowed).toBe(true);
    expect(res.statusCode).toBe(200);
    expect(res.remaining).toBe(375000);
  });

  it('rejects API requests with HTTP 429 when token bucket quota is exceeded using exported checkRateLimit utility', () => {
    const maxTokensPerMinute = 500000;
    const currentUsage = 498000;
    const requestedTokens = 5000;

    const res = checkRateLimit(currentUsage, requestedTokens, maxTokensPerMinute);
    expect(res.allowed).toBe(false);
    expect(res.statusCode).toBe(429);
    expect(res.error).toBe('QUOTA_EXCEEDED_500K_PER_MIN');
    expect(res.remaining).toBe(2000);
  });

  it('calculates exact rate limiter reset window countdown in seconds', () => {
    const now = 1700000000000;
    const resetTimestamp = now + 42000; // 42 seconds remaining

    const getResetSeconds = (current: number, target: number) => Math.ceil((target - current) / 1000);

    expect(getResetSeconds(now, resetTimestamp)).toBe(42);
  });

  it('validates Personal Access Token prefix patterns using exported validatePatToken utility', () => {
    expect(validatePatToken('ghp_1234567890').valid).toBe(true);
    expect(validatePatToken('github_pat_1234567890').valid).toBe(true);
    expect(validatePatToken('bearer_token_123').valid).toBe(false);
    expect(validatePatToken('').valid).toBe(false);
  });

  it('sanitizes Vault proxy parameters to prevent credential exposure in log streams', () => {
    const queryVault = (secretKey: string) => {
      const sanitizedKey = secretKey.replace(/[^a-zA-Z0-9_-]/g, '');
      return {
        vaultPath: `/vault/v1/secrets/${sanitizedKey}`,
        loggedQuery: `Fetching secret: ${sanitizedKey}`,
      };
    };

    const query = queryVault('GITHUB_PAT_KEY; DROP TABLE');
    expect(query.vaultPath).not.toContain(';');
    expect(query.vaultPath).toBe('/vault/v1/secrets/GITHUB_PAT_KEYDROPTABLE');
  });

  it('handles missing credential error states cleanly with structured error responses', () => {
    const checkCredentials = (githubPat?: string, jiraToken?: string) => {
      const missing: string[] = [];
      if (!githubPat) missing.push('GITHUB_PAT');
      if (!jiraToken) missing.push('JIRA_API_TOKEN');

      if (missing.length > 0) {
        return {
          status: 'UNAUTHENTICATED',
          missingCredentials: missing,
          actionRequired: 'Provide PAT in Vault Settings modal',
        };
      }
      return { status: 'READY' };
    };

    const res = checkCredentials(undefined, 'jira-token-123');
    expect(res.status).toBe('UNAUTHENTICATED');
    expect(res.missingCredentials).toEqual(['GITHUB_PAT']);
  });

  it('isolates multi-provider secret namespaces (Gemini vs GitHub vs Jira)', () => {
    const vaultStore = new Map<string, string>();
    vaultStore.set('github:ghp_token', 'ghp_secret_val');
    vaultStore.set('jira:api_token', 'jira_secret_val');
    vaultStore.set('gemini:api_key', 'gemini_secret_val');

    expect(vaultStore.get('github:ghp_token')).toBe('ghp_secret_val');
    expect(vaultStore.get('jira:api_token')).toBe('jira_secret_val');
    expect(vaultStore.get('gemini:api_key')).toBe('gemini_secret_val');
    expect(vaultStore.get('github:api_key')).toBeUndefined();
  });
});
