/**
 * Centralized i18n / Localization Registry
 * 
 * Mirrors the structure defined in `/src/config/locales/en.yml` for zero-build-step
 * TypeScript autocomplete and simple localization extensibility.
 * All hardcoded UI labels across the AutoRCA suite should reference this module.
 */

export interface AppLocale {
  app: {
    title: string;
    subtitle: string;
  };
  headerBar: {
    appTitle: string;
    ossTag: string;
    libraryVersion: string;
    subtitle: string;
    modelLabel: string;
    tokenBurnLabel: string;
    testAlertButton: string;
    testAlertTitle: string;
    loopInProgressButton: string;
    deployHarnessButton: string;
  };
  navTabs: {
    loopControl: string;
    kbAndBugTracker: string;
    githubPluginAndCi: string;
    modelsAndGuardrails: string;
    agentsAndSkills: string;
    openSourceSdk: string;
  };
  footerBar: {
    limitGuardrailPrefix: string;
    atLabel: string;
    tokensAndMaxLabel: string;
    iterationsLabel: string;
    alertSentPrefix: string;
    viewLabel: string;
    autoFixModeLabel: string;
    supervisedDraftPrLabel: string;
    worktreeSandboxLabel: string;
  };
  header: {
    enterpriseBadge: string;
    liveModeBadge: string;
    docsButton: string;
    securityButton: string;
    exportReportButton: string;
  };
  tabs: {
    prerequisites: string;
    framework: string;
    guardrails: string;
    workbench: string;
    ciPipeline: string;
  };
  tabDescriptions: {
    prerequisites: string;
    framework: string;
    guardrails: string;
    workbench: string;
    ciPipeline: string;
  };
  workbench: {
    selectTargetBug: string;
    manualModeCheckbox: string;
    manualModeActive: string;
    manualModeDisabledNotice: string;
    searchIssuesButton: string;
    searchIssuesModalTitle: string;
    queryRemoteApi: string;
    queryingRemoteApi: string;
    noBugsFound: string;
    runLoopButton: string;
    loopActiveButton: string;
    resetWorkbenchButton: string;
    customIssueTitleLabel: string;
    customIssueDescLabel: string;
    customIssueTitlePlaceholder: string;
    customIssueDescPlaceholder: string;
  };
  connectors: {
    title: string;
    issueTracker: string;
    githubRepo: string;
    kbSources: string;
    connected: string;
    notConnected: string;
    connectionError: string;
  };
  loopStatus: {
    title: string;
    worktreePrefix: string;
    iterationLabel: string;
    depthLimit: string;
  };
  guardrails: {
    title: string;
    emailAlertPrefix: string;
    tokenLimit: string;
  };
  swarmPanel: {
    title: string;
    agentsCount: string;
    tokensLabel: string;
    harnessRoleLabel: string;
  };
  executionView: {
    logsTab: string;
    diffTab: string;
    rcaPrTab: string;
    totalBurn: string;
    avgLatency: string;
    harnessStatus: string;
    prDrafted: string;
    ciLabel: string;
  };
}

export const enLocale: AppLocale = {
  app: {
    title: "AutoRCA & Fix Enterprise Suite",
    subtitle: "Autonomous Multi-Agent Bug Triage, Root Cause Analysis & Git Patch Synthesis",
  },
  headerBar: {
    appTitle: "AutoRCA",
    ossTag: "OSS",
    libraryVersion: "Library v1.2",
    subtitle: "Autonomous RCA & Loop Engineering Suite",
    modelLabel: "Model:",
    tokenBurnLabel: "Token Burn (Limit:",
    testAlertButton: "Test Alert Email",
    testAlertTitle: "Test configurable email guardrail alert",
    loopInProgressButton: "LOOP IN PROGRESS...",
    deployHarnessButton: "DEPLOY HARNESS",
  },
  navTabs: {
    loopControl: "Loop Control",
    kbAndBugTracker: "KB & Bug Tracker",
    githubPluginAndCi: "GitHub Plugin & CI",
    modelsAndGuardrails: "Models & Guardrails",
    agentsAndSkills: "Agents.md & Skills.md",
    openSourceSdk: "Open Source SDK",
  },
  footerBar: {
    limitGuardrailPrefix: "Limit Guardrail: Email alert configured for",
    atLabel: "at",
    tokensAndMaxLabel: "tokens & max",
    iterationsLabel: "iterations",
    alertSentPrefix: "Alert Email Sent at",
    viewLabel: "(View)",
    autoFixModeLabel: "Auto-Fix Mode:",
    supervisedDraftPrLabel: "Supervised Draft PR",
    worktreeSandboxLabel: "Worktree Sandbox:",
  },
  header: {
    enterpriseBadge: "ENTERPRISE HARNESS",
    liveModeBadge: "LIVE AUTONOMOUS MODE",
    docsButton: "Enterprise Docs",
    securityButton: "Security & Guardrails",
    exportReportButton: "Export Audit Report",
  },
  tabs: {
    prerequisites: "1. Prerequisites & Integrations",
    framework: "2. Framework & Swarm Config",
    guardrails: "3. Enterprise Guardrails",
    workbench: "4. Autonomous Loop Workbench",
    ciPipeline: "5. GitHub Actions / CI Pipeline",
  },
  tabDescriptions: {
    prerequisites: "Configure Jira / Freshrelease credentials, GitHub tokens & PDF/Confluence knowledge sources.",
    framework: "Select LLM model engines, temperature, and customize sub-agent roles in the swarm.",
    guardrails: "Set hard token burn limits, loop depth caps, human-in-the-loop approvals, and security alerts.",
    workbench: "Select target issues, trigger AutoRCA swarm, inspect diffs, and generate draft pull requests.",
    ciPipeline: "Configure GitHub Actions CI workflows, automated PR testing, and worktree isolation harnesses.",
  },
  workbench: {
    selectTargetBug: "Select Target Bug",
    manualModeCheckbox: "Manual Issue Mode",
    manualModeActive: "Manual Issue Mode Active",
    manualModeDisabledNotice: "(Platform bug selection disabled)",
    searchIssuesButton: "Search Issues...",
    searchIssuesModalTitle: "Search & Select from",
    queryRemoteApi: "Query Remote API",
    queryingRemoteApi: "Querying...",
    noBugsFound: "No bugs matching query",
    runLoopButton: "RUN AUTORCA & FIX",
    loopActiveButton: "LOOP ACTIVE...",
    resetWorkbenchButton: "Reset Workbench",
    customIssueTitleLabel: "Custom Issue Title / Summary",
    customIssueDescLabel: "Custom Issue Description & Symptoms",
    customIssueTitlePlaceholder: "e.g. Unhandled NullPointerException in payment service",
    customIssueDescPlaceholder: "Describe bug behavior or reproduction steps...",
  },
  connectors: {
    title: "Connectors & Knowledge Base",
    issueTracker: "Issue Tracker",
    githubRepo: "GitHub Repo",
    kbSources: "Knowledge Base Sources",
    connected: "Connected",
    notConnected: "Not Connected",
    connectionError: "Connection Error",
  },
  loopStatus: {
    title: "Engineering Loop Status",
    worktreePrefix: "Worktree:",
    iterationLabel: "Iteration",
    depthLimit: "DEPTH LIMIT",
  },
  guardrails: {
    title: "Guardrails & Tokens",
    emailAlertPrefix: "Email Alert:",
    tokenLimit: "TOKEN LIMIT",
  },
  swarmPanel: {
    title: "Active Sub-Agents Swarm",
    agentsCount: "Agents",
    tokensLabel: "Tokens:",
    harnessRoleLabel: "Harness Role: SubAgent",
  },
  executionView: {
    logsTab: "SYSTEM_LOG_STREAM",
    diffTab: "WORKTREE_DIFF",
    rcaPrTab: "RCA NOTE & DRAFT PR",
    totalBurn: "Total Burn",
    avgLatency: "Avg Latency",
    harnessStatus: "Harness Status",
    prDrafted: "Drafted",
    ciLabel: "CI:",
  },
};

/**
 * Current Active Locale (Defaults to English; can be switched dynamically)
 */
export const I18N = enLocale;
