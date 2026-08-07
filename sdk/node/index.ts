/**
 * AutoRCA Node.js & TypeScript Plug-and-Play Client SDK
 * Lightweight wrapper to dispatch automated RCA investigations and fixes directly from your Node.js application.
 */

export interface AutoRCAOptions {
  /** Base URL of your AutoRCA cluster server (e.g., https://autorca.company.com) */
  endpoint: string;
  /** API secret token for authenticating with the AutoRCA cluster */
  apiKey?: string;
  /** Target Organization Tenant ID */
  tenantId?: string;
  /** Target Project ID */
  projectId?: string;
  /** Target GitHub repository (e.g., my-org/my-service) */
  targetRepo?: string;
  /** Target branch for worktree fixes */
  targetBranch?: string;
  /** Environment name (e.g., production, staging) */
  environment?: string;
}

export interface IncidentReport {
  bugId?: string;
  title: string;
  errorMessage: string;
  stackTrace?: string;
  serviceName?: string;
  metadata?: Record<string, any>;
  harnessCommand?: string;
}

export interface DispatchResult {
  success: boolean;
  jobId?: string;
  podId?: string;
  message?: string;
  sseStreamUrl?: string;
  error?: string;
}

export class AutoRCAClient {
  private endpoint: string;
  private apiKey?: string;
  private tenantId: string;
  private projectId: string;
  private targetRepo: string;
  private targetBranch: string;
  private environment: string;

  constructor(options: AutoRCAOptions) {
    this.endpoint = options.endpoint.replace(/\/$/, '');
    this.apiKey = options.apiKey || process.env.AUTORCA_API_KEY;
    this.tenantId = options.tenantId || process.env.AUTORCA_TENANT_ID || 'org-acme-corp';
    this.projectId = options.projectId || process.env.AUTORCA_PROJECT_ID || 'proj-main';
    this.targetRepo = options.targetRepo || process.env.AUTORCA_TARGET_REPO || '';
    this.targetBranch = options.targetBranch || process.env.AUTORCA_TARGET_BRANCH || 'main';
    this.environment = options.environment || process.env.NODE_ENV || 'production';
  }

  /**
   * Dispatch an automated RCA and code repair investigation job to AutoRCA.
   */
  public async dispatchInvestigation(incident: IncidentReport): Promise<DispatchResult> {
    try {
      const payload = {
        bugId: incident.bugId || `INC-${Date.now()}`,
        title: incident.title,
        errorMessage: incident.errorMessage,
        stackTrace: incident.stackTrace,
        repoUrl: this.targetRepo,
        branchName: this.targetBranch,
        tenantId: this.tenantId,
        projectId: this.projectId,
        environment: this.environment,
        harnessCommand: incident.harnessCommand || 'npm test',
        metadata: incident.metadata,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-tenant-id': this.tenantId,
        'x-project-id': this.projectId,
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.endpoint}/api/worktree/dispatch`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`AutoRCA API returned status ${response.status}: ${errText}`);
      }

      const data = await response.json();
      return {
        success: true,
        jobId: data.job?.jobId,
        podId: data.job?.podId,
        message: data.message,
      };
    } catch (err: any) {
      console.error('[AutoRCA SDK] Failed to dispatch incident investigation:', err.message);
      return {
        success: false,
        error: err.message || String(err),
      };
    }
  }

  /**
   * Express Middleware to automatically catch unhandled exceptions and trigger AutoRCA.
   */
  public expressErrorHandler() {
    return (err: any, req: any, res: any, next: any) => {
      // Fire-and-forget background investigation dispatch
      this.dispatchInvestigation({
        title: err.name || 'UnhandledExpressException',
        errorMessage: err.message || String(err),
        stackTrace: err.stack,
        metadata: {
          path: req.path,
          method: req.method,
          headers: req.headers,
        },
      }).catch((e) => console.warn('[AutoRCA Express Middleware] Dispatch background error:', e));

      next(err);
    };
  }
}

export default AutoRCAClient;
