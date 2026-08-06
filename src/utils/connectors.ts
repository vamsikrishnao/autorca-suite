export function maskSecretToken(token?: string): string {
  if (!token || token.length < 6) return 'vault://secret-not-configured';
  return `${token.substring(0, 4)}••••••••${token.substring(token.length - 2)}`;
}

export function validateConnectorEndpoint(req: {
  type?: string;
  platform?: string;
  url?: string;
  baseUrl?: string;
  apiKeyOrToken?: string;
}): { success: boolean; error?: string; status?: string } {
  const targetUrl = (req.url || req.baseUrl || '').trim();
  const token = (req.apiKeyOrToken || '').trim();

  if (!targetUrl) {
    return { success: false, error: 'Validation Error: Endpoint URL or Path cannot be empty.' };
  }

  const isHttp = targetUrl.startsWith('http://') || targetUrl.startsWith('https://');

  if (req.type === 'Confluence') {
    if (!isHttp) {
      return { success: false, error: 'Confluence Validation Failed: Must be a valid HTTP/HTTPS URL.' };
    }
    if (!targetUrl.includes('.atlassian.net') && !targetUrl.includes('confluence') && !targetUrl.includes('internal')) {
      return { success: false, error: 'Confluence Validation Failed: Hostname does not match an Atlassian Confluence instance domain.' };
    }
  } else if (req.type === 'SharePoint') {
    const isSharePointUri = targetUrl.startsWith('sharepoint://');
    if (!isHttp && !isSharePointUri) {
      return { success: false, error: 'SharePoint Validation Failed: Must be a valid HTTP/HTTPS URL or sharepoint:// URI.' };
    }
    const hasSharePointDomain =
      targetUrl.includes('.sharepoint.com') ||
      targetUrl.includes('.sharepoint-df.com') ||
      targetUrl.includes('office.com/launch/sharepoint') ||
      isSharePointUri;
    if (!hasSharePointDomain) {
      return { success: false, error: 'SharePoint Validation Failed: Domain must match a SharePoint or Office365 site (e.g. https://tenant.sharepoint.com/sites/...).' };
    }
  } else if (req.platform === 'Jira') {
    if (!isHttp) {
      return { success: false, error: 'Jira Validation Failed: Must start with https:// or http://.' };
    }
    if (!targetUrl.includes('.atlassian.net') && !targetUrl.includes('jira')) {
      return { success: false, error: "Jira Validation Failed: URL hostname must match your organization's Jira Atlassian domain." };
    }
    if (!token || token.length < 8) {
      return { success: false, error: 'Jira Authentication Failed: API token is missing or too short (must be a valid Atlassian PAT/token).' };
    }
  }

  return { success: true, status: 'Connected' };
}

export function checkRateLimit(
  currentUsage: number,
  requestedTokens: number,
  maxTokensPerMinute: number = 500000
): {
  allowed: boolean;
  remaining: number;
  statusCode: number;
  error?: string | null;
} {
  const isExceeded = currentUsage + requestedTokens > maxTokensPerMinute;
  return {
    allowed: !isExceeded,
    remaining: Math.max(0, maxTokensPerMinute - (currentUsage + (isExceeded ? 0 : requestedTokens))),
    statusCode: isExceeded ? 429 : 200,
    error: isExceeded ? 'QUOTA_EXCEEDED_500K_PER_MIN' : null,
  };
}

export function validatePatToken(token: string): { valid: boolean; message?: string } {
  if (!token) return { valid: false, message: 'Token cannot be empty' };
  if (token.startsWith('ghp_') || token.startsWith('github_pat_')) {
    return { valid: true };
  }
  return { valid: false, message: 'Invalid token format. Must start with ghp_ or github_pat_' };
}
