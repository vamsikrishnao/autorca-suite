export type BugPlatform = 'Jira' | 'Freshrelease' | 'Zoho Sprints' | 'CSV Upload';

export interface StructuredNote {
  timestamp: string;
  author: string;
  rcaSummary: string;
  patchHash: string;
  statusAtTime: string;
}

export interface BugItem {
  id: string;
  title: string;
  description: string;
  stackTrace: string;
  platform: BugPlatform;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'RCA Complete' | 'Fix Verified' | 'Draft PR Created' | 'RESOLVED';
  assignee?: string;
  createdAt: string;
  repoPath: string;
  affectedFiles: string[];
  fileLocation?: string;
  trackerProvider?: BugPlatform;
  structuredNotes?: StructuredNote[];
}

export interface KnowledgeSource {
  id: string;
  type: 'Confluence' | 'Support Article' | 'PDF Document' | 'JSON KB' | 'GitHub Wiki' | 'SupportFolder';
  name: string;
  urlOrFilename: string;
  contentSnippet: string;
  lastIndexed: string;
  status: 'Connected' | 'Indexed' | 'Not Connected' | 'Connection Error' | 'Error';
}

export type KnowledgeBaseSource = KnowledgeSource;

export interface TestHarnessConfig {
  framework: 'Jest' | 'PyTest' | 'JUnit' | 'GoTest';
  testCommand: string;
  worktreeSandboxEnabled: boolean;
  requireCleanExitCode: boolean;
  timeoutSeconds: number;
}

export interface TrackerConfig {
  platform: BugPlatform;
  baseUrl: string;
  apiKeyOrToken: string;
  projectKey: string;
  searchUrl?: string;
  rcaNoteTemplate: string;
  autoPostNote: boolean;
  useManualInput?: boolean;
  manualIssue?: {
    title: string;
    description: string;
    stackTrace: string;
    severity?: 'Critical' | 'High' | 'Medium' | 'Low';
  };
}

export interface GitHubPluginConfig {
  repository: string;
  repoUrl?: string;
  personalAccessToken: string;
  baseBranch: string;
  createDraftPR: boolean;
  verifyExistingCI: boolean;
  autoLabel: string;
}

export type GitHubIntegrationConfig = GitHubPluginConfig;

export interface ModelConfig {
  provider: 'Gemini' | 'Custom OpenAI' | 'Custom Anthropic' | 'Custom Local LLM';
  modelId: string;
  customEndpointUrl?: string;
  customApiKey?: string;
  temperature: number;
}

export interface GuardrailConfig {
  maxTokensPerRun: number;
  maxLoopIterations: number;
  maxCostUsd: number;
  alertEmailAddress: string;
  preventDestructiveSQL: boolean;
  requireTestHarnessPass: boolean;
  autoSendEmailOnLimit: boolean;
}

export type SubAgentRole =
  | 'RCA Analyst'
  | 'KB Retriever'
  | 'Code Repair Specialist'
  | 'Harness Verifier'
  | 'CI & Draft PR Coordinator'
  | 'Guardrail Auditor'
  | 'CI Coordinator';

export interface SubAgentInfo {
  role: SubAgentRole;
  name: string;
  description: string;
  status: 'Idle' | 'Active' | 'Completed' | 'Alert / Blocked' | 'WORKING' | 'COMPLETED' | 'IDLE';
  tokensUsed: number;
  lastAction?: string;
}

export type SubAgentStatus = SubAgentInfo;

export interface LogEntry {
  id: string;
  timestamp: string;
  subAgent: SubAgentRole | string;
  action: string;
  message: string;
  tokensBurnt: {
    prompt?: number;
    completion?: number;
    input?: number;
    output?: number;
    total: number;
  };
  status?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'GUARDRAIL_TRIPPED';
  metadata?: Record<string, any>;
}

export interface LoopIteration {
  iteration?: number;
  iterationNumber?: number;
  subAgentRole?: SubAgentRole | string;
  status?: 'PASSED' | 'FAILED' | 'IN_PROGRESS';
  synthesizedDiff?: string;
  harnessCommand?: string;
  harnessPassed?: boolean;
  harnessOutput: string;
  compilerErrors?: string[];
  tokensConsumed?: number;
  tokensBurnt?: number;
  timestamp: string;
}

export interface WorktreeState {
  worktreeId: string;
  branchName: string;
  baseCommit: string;
  status: 'Clean' | 'Modified' | 'Staged' | 'PR Created';
  filesChanged: {
    filename: string;
    oldContent: string;
    newContent: string;
    diffString: string;
  }[];
}

export interface RcaNoteResult {
  bugId: string;
  title: string;
  rootCauseSummary: string;
  technicalDetails: string;
  kbReferences: string[];
  remediationSteps: string[];
  formattedCommentText: string;
  postedToTracker: boolean;
  postedTimestamp?: string;
}

export interface DraftPrResult {
  prNumber: number;
  prTitle: string;
  prUrl: string;
  branchName: string;
  isDraft: boolean;
  ciStatus: 'Pending' | 'Success' | 'Failed' | 'Running';
  ciJobName: string;
  createdAt: string;
}

export interface RunExecutionResult {
  runId: string;
  bugId: string;
  status: 'SUCCESS' | 'GUARDRAIL_REACHED' | 'FAILED' | 'RUNNING';
  totalTokensBurnt: number;
  totalCostUsd: number;
  iterations: LoopIteration[];
  rcaNote: RcaNoteResult;
  worktree: WorktreeState;
  draftPr?: DraftPrResult;
  logs: LogEntry[];
  alertEmailSent?: {
    recipient: string;
    subject: string;
    reason: string;
    timestamp: string;
  };
}

export interface AgentsMdDoc {
  title: string;
  description: string;
  content: string;
}

export interface SkillsMdDoc {
  title: string;
  description: string;
  content: string;
}
