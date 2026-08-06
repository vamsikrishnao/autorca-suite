import {
  BugItem,
  KnowledgeSource,
  TrackerConfig,
  GitHubPluginConfig,
  ModelConfig,
  GuardrailConfig,
  AgentsMdDoc,
  SkillsMdDoc,
  TestHarnessConfig,
  SubAgentInfo,
  LoopIteration,
  LogEntry,
} from '../types';

export const defaultBugs: BugItem[] = [
  {
    id: 'JIRA-4892',
    title: 'NullPointerException in AuthTokenRefresher during race condition on concurrent JWT renewal',
    description: 'When multiple background requests trigger JWT refresh simultaneously, the AuthTokenRefresher throws NullPointerException if cachedToken is cleared before write lock is acquired.',
    stackTrace: `java.lang.NullPointerException: Cannot invoke "String.getBytes()" because "this.cachedToken" is null
    at com.autorca.security.AuthTokenRefresher.refreshAndSign(AuthTokenRefresher.java:142)
    at com.autorca.security.AuthTokenRefresher.getValidToken(AuthTokenRefresher.java:88)
    at com.autorca.api.GatewayFilter.doFilterInternal(GatewayFilter.java:54)`,
    platform: 'Jira',
    severity: 'Critical',
    status: 'Open',
    assignee: 'Alex Chen',
    createdAt: '2026-07-30T14:22:00Z',
    repoPath: 'src/main/java/com/autorca/security/AuthTokenRefresher.java',
    fileLocation: 'src/main/java/com/autorca/security/AuthTokenRefresher.java:142',
    trackerProvider: 'Jira',
    affectedFiles: [
      'src/main/java/com/autorca/security/AuthTokenRefresher.java',
      'src/test/java/com/autorca/security/AuthTokenRefresherTest.java',
    ],
    structuredNotes: [
      {
        timestamp: '2026-07-30 15:10:00',
        author: 'AutoRCA Sub-Agent Suite',
        rcaSummary: 'Root cause: unprotected null assignment to cachedToken during concurrent thread race in AuthTokenRefresher.java:142. Resolved by wrapping token check in ReentrantLock block.',
        patchHash: 'f4e9103c',
        statusAtTime: 'FIX_VERIFIED',
      },
    ],
  },
  {
    id: 'FR-1049',
    title: 'Memory leak in EventDispatcher when unsubscribe() is called inside active listener callback',
    description: 'In Freshrelease report FR-1049: EventDispatcher array mutation during iteration causes skipped indices and retains dangling listener references in memory.',
    stackTrace: `TypeError: Cannot read properties of undefined (reading 'call')
    at EventDispatcher.emit (src/core/EventDispatcher.ts:84:19)
    at WebSocketClient.onMessage (src/net/WebSocketClient.ts:112:28)`,
    platform: 'Freshrelease',
    severity: 'High',
    status: 'Open',
    assignee: 'Sarah Jenkins',
    createdAt: '2026-07-30T18:15:00Z',
    repoPath: 'src/core/EventDispatcher.ts',
    fileLocation: 'src/core/EventDispatcher.ts:84',
    trackerProvider: 'Freshrelease',
    affectedFiles: [
      'src/core/EventDispatcher.ts',
      'tests/core/EventDispatcher.test.ts',
    ],
  },
  {
    id: 'ZOHO-993',
    title: 'Rate limiter bucket overflow allows burst traffic bypass when interval < 10ms',
    description: 'Zoho Sprints ticket #993: TokenBucketLimiter floating point rounding error causes token count to exceed capacity when requests burst under 10ms interval.',
    stackTrace: `AssertionError [ERR_ASSERTION]: Bucket token balance exceeded max_capacity (104.2 > 100)
    at TokenBucketLimiter.acquire (/src/middleware/TokenBucketLimiter.ts:63:12)
    at RateLimitHandler.handle (/src/middleware/RateLimitHandler.ts:29:18)`,
    platform: 'Zoho Sprints',
    severity: 'Medium',
    status: 'Open',
    assignee: 'David K.',
    createdAt: '2026-07-31T08:04:00Z',
    repoPath: 'src/middleware/TokenBucketLimiter.ts',
    fileLocation: 'src/middleware/TokenBucketLimiter.ts:63',
    trackerProvider: 'Zoho Sprints',
    affectedFiles: [
      'src/middleware/TokenBucketLimiter.ts',
      'src/middleware/RateLimitHandler.ts',
    ],
  },
  {
    id: 'CSV-001',
    title: 'CSV Uploaded Bug: Infinite loop in DAG topological sort with self-referential edge',
    description: 'When a graph has a self-referential cycle A -> A, TopoSortGraph.resolve() enters an infinite while loop and times out CI build.',
    stackTrace: `TimeoutError: Execution exceeded 5000ms threshold in TopoSortGraph.resolve()
    at TopoSortGraph.resolve (src/graph/TopoSortGraph.ts:121:11)`,
    platform: 'CSV Upload',
    severity: 'High',
    status: 'Open',
    assignee: 'CSV Importer',
    createdAt: '2026-07-31T09:00:00Z',
    repoPath: 'src/graph/TopoSortGraph.ts',
    fileLocation: 'src/graph/TopoSortGraph.ts:121',
    trackerProvider: 'CSV Upload',
    affectedFiles: [
      'src/graph/TopoSortGraph.ts',
    ],
  },
  {
    id: 'JIRA-104',
    title: 'Unhandled Stripe API timeout causes transaction rollback failure in PaymentService',
    description: 'When Stripe webhook response delays > 3000ms, database transaction remains open and deadlocks concurrent charges.',
    stackTrace: `com.autorca.exception.PaymentTimeoutException: Stripe API timeout exceeded 3000ms
    at com.autorca.payment.StripeClient.executeCharge(StripeClient.java:94)`,
    platform: 'Jira',
    severity: 'Critical',
    status: 'Open',
    assignee: 'Alex Chen',
    createdAt: '2026-08-01T11:00:00Z',
    repoPath: 'src/main/java/com/autorca/payment/StripeClient.java',
    fileLocation: 'src/main/java/com/autorca/payment/StripeClient.java:94',
    trackerProvider: 'Jira',
    affectedFiles: ['src/main/java/com/autorca/payment/StripeClient.java'],
  },
  {
    id: 'JIRA-201',
    title: 'OAuth2 state parameter mismatch on callback redirect from Okta provider',
    description: 'Users experience 400 Bad Request during SSO login if CSRF state token expires during multi-factor prompt.',
    stackTrace: `com.autorca.auth.InvalidStateTokenException: State token mismatch or expired
    at com.autorca.auth.OAuth2CallbackController.verifyState(OAuth2CallbackController.java:58)`,
    platform: 'Jira',
    severity: 'High',
    status: 'Open',
    assignee: 'Sarah Jenkins',
    createdAt: '2026-08-01T14:30:00Z',
    repoPath: 'src/main/java/com/autorca/auth/OAuth2CallbackController.java',
    fileLocation: 'src/main/java/com/autorca/auth/OAuth2CallbackController.java:58',
    trackerProvider: 'Jira',
    affectedFiles: ['src/main/java/com/autorca/auth/OAuth2CallbackController.java'],
  },
  {
    id: 'LIN-204',
    title: 'Linear Issue: Null safety violation in UserAvatarImage when CDN returns 404',
    description: 'When avatar CDN URL is unreachable, fallback image resolver fails to catch HTTP error and crashes React render tree.',
    stackTrace: `TypeError: Cannot read properties of null (reading 'src')
    at UserAvatarImage.render (src/components/UserAvatarImage.tsx:41:14)`,
    platform: 'Jira', // Also accessible as ticket search
    severity: 'Medium',
    status: 'Open',
    assignee: 'David K.',
    createdAt: '2026-08-02T09:15:00Z',
    repoPath: 'src/components/UserAvatarImage.tsx',
    fileLocation: 'src/components/UserAvatarImage.tsx:41',
    trackerProvider: 'Jira',
    affectedFiles: ['src/components/UserAvatarImage.tsx'],
  },
  {
    id: 'GH-819',
    title: 'GitHub Issue: Race condition in WebSocket reconnection loop causing duplicate subscription events',
    description: 'On unstable networks, WebSocketClient launches two concurrent reconnection timers that duplicate message handlers.',
    stackTrace: `Error: Duplicate subscription handler registered for topic "orders.update"
    at WebSocketManager.subscribe (src/net/WebSocketManager.ts:112:15)`,
    platform: 'Jira',
    severity: 'High',
    status: 'Open',
    assignee: 'Alex Chen',
    createdAt: '2026-08-02T16:00:00Z',
    repoPath: 'src/net/WebSocketManager.ts',
    fileLocation: 'src/net/WebSocketManager.ts:112',
    trackerProvider: 'Jira',
    affectedFiles: ['src/net/WebSocketManager.ts'],
  },
];

export const SAMPLE_BUGS = defaultBugs;

export const SAMPLE_CSV_TEMPLATE = `id,title,description,stackTrace,platform,severity,repoPath,affectedFiles
CSV-101,"SQL syntax error on date formatting in postgres adapter","Postgres date string parse error when locale is set to DE-DE","error: invalid input syntax for type timestamp: '31.07.2026'
    at Parser.parseErrorMessage (/node_modules/pg-protocol/dist/parser.js:287:9)","CSV Upload","High","src/db/PostgresAdapter.ts","src/db/PostgresAdapter.ts;src/db/DateHelper.ts"
CSV-102,"Cache invalidation failure on Redis reconnect","When Redis connection drops and reconnects, local LRU cache does not flush stale keys","Error: Cache sync timeout after reconnect
    at RedisCache.onReconnect (/src/cache/RedisCache.ts:145:15)","CSV Upload","Medium","src/cache/RedisCache.ts","src/cache/RedisCache.ts"`;

export const DEFAULT_TRACKER_CONFIG: TrackerConfig = {
  platform: 'Jira',
  baseUrl: 'https://myorg.atlassian.net',
  apiKeyOrToken: 'jira_pat_sec_****************',
  projectKey: 'AUTORCA',
  searchUrl: 'https://myorg.atlassian.net/rest/api/3/search?jql=project=AUTORCA+AND+status=Open',
  rcaNoteTemplate: `### 🤖 AutoRCA Automated Root Cause Analysis
**Root Cause Summary:**
{{rootCauseSummary}}

**Technical Root Cause Details:**
{{technicalDetails}}

**Knowledge Base Citations:**
{{kbReferences}}

**Remediation Steps & Verified Worktree Diff:**
{{remediationSteps}}
---
*Automated by AutoRCA & Fix Suite • Loop Iterations: {{iterations}} • Harness Verified: ✅*`,
  autoPostNote: true,
  useManualInput: false,
  manualIssue: {
    title: 'Custom Bug: Unhandled NullPointerException in payment service callback',
    description: 'When webhook payload lacks transactionId field, the callback handler throws NPE and leaves database order state as pending.',
    stackTrace: `NullPointerException: Cannot read property 'toString' of undefined
    at PaymentWebhookHandler.process (src/webhook/PaymentWebhookHandler.ts:88:14)`,
    severity: 'High',
  },
};


export const defaultKnowledgeBases: KnowledgeSource[] = [
  {
    id: 'kb-1',
    type: 'Confluence',
    name: 'Confluence: Engineering Best Practices & Concurrency Guardrails',
    urlOrFilename: 'https://confluence.internal.autorca.io/display/ENG/Concurrency+Locking+Patterns',
    contentSnippet: 'Always acquire a ReentrantLock or ReadWriteLock before checking token nullability in AuthTokenRefresher. Never mutate cachedToken without double-checked locking.',
    lastIndexed: '2026-07-30 11:30 AM',
    status: 'Not Connected',
  },
  {
    id: 'kb-2',
    type: 'Support Article',
    name: 'Support Knowledge Base: EventDispatcher Array Mutation Safe Loop',
    urlOrFilename: 'https://support.autorca.io/articles/kb-8821-safe-event-listeners',
    contentSnippet: 'When iterating over listener callbacks in TypeScript/JavaScript, always iterate over a shallow copy of the listeners array (listeners.slice()) to prevent skip bugs when unsubscribe is called inside the loop.',
    lastIndexed: '2026-07-29 04:15 PM',
    status: 'Connection Error',
  },
  {
    id: 'kb-3',
    type: 'JSON KB',
    name: 'TokenBucket KB Guide (json_rules.json)',
    urlOrFilename: 'docs/kb/token_bucket_rules.json',
    contentSnippet: '{"rule": "RateLimiter floating point math must use Math.min(max_capacity, current_tokens + refill) to prevent rounding overflow above max capacity."}',
    lastIndexed: '2026-07-31 08:30 AM',
    status: 'Connected',
  },
  {
    id: 'kb-4',
    type: 'SharePoint',
    name: 'SharePoint Site: Enterprise Security & Auth Architecture Docs',
    urlOrFilename: 'https://acmecorp.sharepoint.com/sites/engineering/docs/Security_Guidelines.docx',
    contentSnippet: 'SharePoint Document Library Index: OAuth token refreshers must validate cached token state and handle null values with defensive locking in multi-tenant environments.',
    lastIndexed: '2026-08-05 09:15 AM',
    status: 'Connected',
  },
];

export const DEFAULT_KNOWLEDGE_SOURCES = defaultKnowledgeBases;

export const defaultTestHarness: TestHarnessConfig = {
  framework: 'Jest',
  testCommand: 'npm test -- --runInBand --detectOpenHandles',
  worktreeSandboxEnabled: true,
  requireCleanExitCode: true,
  timeoutSeconds: 300,
};

export const defaultSubAgents: SubAgentInfo[] = [
  {
    role: 'RCA Analyst',
    name: 'Stack Trace & RCA Analyzer',
    description: 'Parses exception logs and isolates faulty lines',
    status: 'IDLE',
    tokensUsed: 420,
    lastAction: 'Ready to analyze stack traces',
  },
  {
    role: 'KB Retriever',
    name: 'Knowledge Base Searcher',
    description: 'Retrieves architecture rules from Confluence/Support docs',
    status: 'IDLE',
    tokensUsed: 310,
    lastAction: 'Connected to 3 knowledge base sources',
  },
  {
    role: 'Code Repair Specialist',
    name: 'Surgical Diff Generator',
    description: 'Synthesizes minimal patch diffs in worktree sandbox',
    status: 'IDLE',
    tokensUsed: 890,
    lastAction: 'Worktree sandbox initialized',
  },
  {
    role: 'Harness Verifier',
    name: 'Test Harness Runner',
    description: 'Executes Jest/PyTest/JUnit inside worktree',
    status: 'IDLE',
    tokensUsed: 190,
    lastAction: 'Test harness ready (exit code 0 required)',
  },
  {
    role: 'CI & Draft PR Coordinator',
    name: 'GitHub CI & PR Manager',
    description: 'Verifies existing CI status and opens Draft PR',
    status: 'IDLE',
    tokensUsed: 230,
    lastAction: 'GitHub integration verified',
  },
  {
    role: 'Guardrail Auditor',
    name: 'Token & Security Auditor',
    description: 'Monitors token burn and sends alert emails',
    status: 'IDLE',
    tokensUsed: 110,
    lastAction: 'Guardrail limits active',
  },
];

export const defaultLoopHistory: LoopIteration[] = [
  {
    iteration: 1,
    subAgentRole: 'Harness Verifier',
    status: 'PASSED',
    harnessOutput: '[PASSED] Previous automated RCA run for JIRA-4892: AuthTokenRefresher concurrency fix verified (exit code 0).',
    tokensBurnt: 1640,
    timestamp: '2026-07-30 15:11:00',
  },
];

export const defaultGitHubConfig: GitHubPluginConfig = {
  repository: 'autorca-suite/example-react-backend',
  repoUrl: 'https://github.com/autorca-suite/example-react-backend',
  personalAccessToken: 'ghp_sampleTokenForAutoRCAWorktree1234',
  baseBranch: 'main',
  createDraftPR: true,
  verifyExistingCI: true,
  autoLabel: 'auto-fix-rca',
};

export const DEFAULT_GITHUB_CONFIG = defaultGitHubConfig;

export const defaultModelConfig: ModelConfig = {
  provider: 'Gemini',
  modelId: 'gemini-2.5-pro',
  temperature: 0.2,
};

export const DEFAULT_MODEL_CONFIG = defaultModelConfig;

export const defaultGuardrailConfig: GuardrailConfig = {
  maxTokensPerRun: 15000,
  maxLoopIterations: 3,
  maxCostUsd: 0.45,
  alertEmailAddress: 'devops-alerts@autorca.io',
  preventDestructiveSQL: true,
  requireTestHarnessPass: true,
  autoSendEmailOnLimit: true,
};

export const DEFAULT_GUARDRAIL_CONFIG = defaultGuardrailConfig;

export const defaultLogs: LogEntry[] = [
  {
    id: 'LOG-1',
    timestamp: '15:10:02',
    subAgent: 'RCA Analyst',
    action: 'STACK_TRACE_PARSED',
    message: 'Parsed NullPointerException stack trace for JIRA-4892 and located AuthTokenRefresher.java:142',
    tokensBurnt: { input: 300, output: 120, total: 420 },
    status: 'INFO',
  },
  {
    id: 'LOG-2',
    timestamp: '15:10:04',
    subAgent: 'KB Retriever',
    action: 'CONFLUENCE_QUERY_HIT',
    message: 'Retrieved locking rule: "Always acquire a ReentrantLock before checking token nullability"',
    tokensBurnt: { input: 210, output: 100, total: 310 },
    status: 'SUCCESS',
  },
  {
    id: 'LOG-3',
    timestamp: '15:10:08',
    subAgent: 'Code Repair Specialist',
    action: 'WORKTREE_PATCH_APPLIED',
    message: 'Synthesized surgical patch and applied diff to temporary worktree autorca/fix-jira-4892',
    tokensBurnt: { input: 580, output: 310, total: 890 },
    status: 'SUCCESS',
  },
  {
    id: 'LOG-4',
    timestamp: '15:10:14',
    subAgent: 'Harness Verifier',
    action: 'TEST_HARNESS_PASSED',
    message: 'Executed ./mvnw test -Dtest=AuthTokenRefresherTest -> exit code 0 (14 tests passed)',
    tokensBurnt: { input: 140, output: 50, total: 190 },
    status: 'SUCCESS',
  },
];

export const defaultAgentsMd: AgentsMdDoc = {
  title: 'AGENTS.md - Repository Agent Instructions & Operating Manifesto',
  description: 'Standard instructions loaded into every worktree run to guide sub-agents on architectural rules, safety boundaries, and code style.',
  content: `# AGENTS.md — AutoBug RCA & Fix Library Manifest

## 1. Prime Directive
You are part of the automated **AutoBug RCA & Fix Suite**. Your job is to analyze bug stack traces, query the repository knowledge base (Confluence/Support docs), synthesize minimal surgical patches, and verify them inside an isolated Git worktree.

## 2. Worktree & Git Discipline
- NEVER modify the main branch directly.
- All code modifications MUST occur inside the temporary worktree branch (\`autorca/fix-{bugId}\`).
- Keep diffs surgical: do not reformat untouched lines or introduce unrequested features.

## 3. Loop Engineering Rules
- **Iteration Limit:** Maximum 3 feedback loops per bug.
- **Harness Verification:** Run the test harness (\`npm test\` / \`pytest\`) after every patch.
- **If Harness Fails:** Extract compiler or test error output, feed it back to the Code Repair sub-agent, and attempt iteration N+1.
- **Exit Condition:** When test harness exits with code \`0\` OR when token/cost guardrail limit is reached.

## 4. Guardrail & Security Constraints
- Do NOT execute SQL \`DROP\`, \`TRUNCATE\`, or shell \`rm -rf\` commands.
- If cumulative token burn exceeds \`maxTokensPerRun\`, IMMEDIATELY stop and emit an email alert to the configurable mailbox.
`,
};

export const DEFAULT_AGENTS_MD = defaultAgentsMd;

export const defaultSkillsMd: SkillsMdDoc = {
  title: 'SKILLS.md - Sub-Agent Skills & Tool Calling Definitions',
  description: 'Specialized capabilities assigned to each sub-agent in the Loop Engineering harness.',
  content: `# SKILLS.md — AutoRCA Sub-Agent Skill Registry

## Skill 1: RCA-Analyst (stack_trace_analyzer)
- **Role:** Analyzes stack traces, identifies line numbers, file paths, and concurrency or memory leak patterns.
- **Tools:** \`parse_stack_trace\`, \`locate_affected_files\`.

## Skill 2: KB-Retriever (knowledge_base_searcher)
- **Role:** Queries connected Confluence URLs, Support articles, and JSON/PDF knowledge sources for matching architectural guardrails.
- **Tools:** \`search_confluence\`, \`query_kb_embeddings\`, \`fetch_support_doc\`.

## Skill 3: Code-Repair-Specialist (surgical_diff_generator)
- **Role:** Synthesizes minimal patch diffs adhering to KB rules and AGENTS.md guidelines.
- **Tools:** \`generate_unified_diff\`, \`apply_patch_to_worktree\`.

## Skill 4: Harness-Verifier (test_suite_runner)
- **Role:** Executes test suites and static analyzers inside the isolated worktree sandbox.
- **Tools:** \`run_test_harness\`, \`parse_test_failures\`.

## Skill 5: CI-Draft-Coordinator (github_pr_manager)
- **Role:** Verifies existing CI builds, pushes the worktree branch, and creates a Draft Pull Request on GitHub.
- **Tools:** \`verify_ci_status\`, \`create_draft_pull_request\`, \`post_rca_comment\`.

## Skill 6: Guardrail-Auditor (token_and_security_monitor)
- **Role:** Tracks prompt and completion token burn, monitors USD cost, enforces security rules, and triggers configurable alert emails.
- **Tools:** \`meter_tokens\`, \`check_security_rules\`, \`send_guardrail_email_alert\`.
`,
};

export const DEFAULT_SKILLS_MD = defaultSkillsMd;
