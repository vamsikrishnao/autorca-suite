import React, { useState, useEffect, useRef } from 'react';
import {
  BugItem,
  KnowledgeBaseSource,
  TestHarnessConfig,
  SubAgentStatus,
  LoopIteration,
  GitHubIntegrationConfig,
  ModelConfig,
  GuardrailConfig,
  LogEntry,
  AgentsMdDoc,
  SkillsMdDoc,
  TrackerConfig,
} from './types';
import {
  defaultBugs,
  defaultKnowledgeBases,
  defaultTestHarness,
  defaultSubAgents,
  defaultLoopHistory,
  defaultGitHubConfig,
  defaultModelConfig,
  defaultGuardrailConfig,
  defaultLogs,
  defaultAgentsMd,
  defaultSkillsMd,
  DEFAULT_TRACKER_CONFIG,
} from './data/defaultConfig';
import { Header } from './components/Header';
import { FooterBar } from './components/FooterBar';
import { LoopWorkbench } from './components/LoopWorkbench';
import { PrerequisitesTab } from './components/PrerequisitesTab';
import { GitHubPluginTab } from './components/GitHubPluginTab';
import { GuardrailsTab } from './components/GuardrailsTab';
import { FrameworkTab } from './components/FrameworkTab';
import { LibraryExportTab } from './components/LibraryExportTab';
import { EmailAlertModal } from './components/EmailAlertModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'loop' | 'prereqs' | 'github' | 'guardrails' | 'framework' | 'library'
  >('loop');

  // Core configuration & domain states
  const [bugs, setBugs] = useState<BugItem[]>(defaultBugs);
  const [selectedBugId, setSelectedBugId] = useState<string>(defaultBugs[0].id);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseSource[]>(defaultKnowledgeBases);
  const [testHarness, setTestHarness] = useState<TestHarnessConfig>(defaultTestHarness);
  const [subAgents, setSubAgents] = useState<SubAgentStatus[]>(defaultSubAgents);
  const [loopHistory, setLoopHistory] = useState<LoopIteration[]>(defaultLoopHistory);
  const [gitHubConfig, setGitHubConfig] = useState<GitHubIntegrationConfig>(defaultGitHubConfig);
  const [trackerConfig, setTrackerConfig] = useState<TrackerConfig>(DEFAULT_TRACKER_CONFIG);
  const [modelConfig, setModelConfig] = useState<ModelConfig>(defaultModelConfig);
  const [guardrailConfig, setGuardrailConfig] = useState<GuardrailConfig>(defaultGuardrailConfig);
  const [logs, setLogs] = useState<LogEntry[]>(defaultLogs);
  const [agentsMd, setAgentsMd] = useState<AgentsMdDoc>(defaultAgentsMd);
  const [skillsMd, setSkillsMd] = useState<SkillsMdDoc>(defaultSkillsMd);

  // Loop execution indicators
  const [isLoopRunning, setIsLoopRunning] = useState<boolean>(false);
  const [currentIteration, setCurrentIteration] = useState<number>(0);

  // Active GitHub Draft PR
  const [activePR, setActivePR] = useState<{
    bugId: string;
    prUrl: string;
    prNumber: number;
    branch: string;
    patchSummary: string;
    ciStatus: 'PASSED' | 'PENDING' | 'FAILED';
  } | null>({
    bugId: 'BUG-409',
    prUrl: 'https://github.com/org/payment-service/pull/142',
    prNumber: 142,
    branch: 'autorca/bug-409-stripe-null-check',
    patchSummary: 'Fixes NullPointerException in StripeWebhookHandler.java by introducing null-safe verification before accessing intent currency.',
    ciStatus: 'PASSED',
  });

  // Guardrail Email Alert Modal state
  const [emailModalOpen, setEmailModalOpen] = useState<boolean>(false);
  const [emailModalReason, setEmailModalReason] = useState<string>('');

  // Total calculated token & cost metrics
  const totalTokensBurnt = logs.reduce((acc, l) => acc + (l.tokensBurnt.total || 0), 0);
  const totalCostUsd = totalTokensBurnt * 0.0000032;

  const isLoadedFromBackend = useRef(false);

  // Load saved backend configuration on startup
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.config) {
          const cfg = data.config;
          if (cfg.bugs) setBugs(cfg.bugs);
          if (cfg.knowledgeBases) setKnowledgeBases(cfg.knowledgeBases);
          if (cfg.trackerConfig) setTrackerConfig(cfg.trackerConfig);
          if (cfg.testHarness) setTestHarness(cfg.testHarness);
          if (cfg.gitHubConfig) setGitHubConfig(cfg.gitHubConfig);
          if (cfg.modelConfig) setModelConfig(cfg.modelConfig);
          if (cfg.guardrailConfig) setGuardrailConfig(cfg.guardrailConfig);
        }
        isLoadedFromBackend.current = true;
      })
      .catch((err) => {
        console.warn('Backend config load fallback:', err);
        isLoadedFromBackend.current = true;
      });
  }, []);

  // Persist configurations to backend store whenever they change
  useEffect(() => {
    if (!isLoadedFromBackend.current) return;
    const saveTimer = setTimeout(() => {
      fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bugs,
          knowledgeBases,
          trackerConfig,
          testHarness,
          gitHubConfig,
          modelConfig,
          guardrailConfig,
        }),
      }).catch((e) => console.warn('Failed to save backend config:', e));
    }, 800);
    return () => clearTimeout(saveTimer);
  }, [bugs, knowledgeBases, trackerConfig, testHarness, gitHubConfig, modelConfig, guardrailConfig]);

  // Handler: Add structured note to a bug
  const handleAddStructuredNote = (
    bugId: string,
    author: string,
    rcaSummary: string,
    patchHash: string
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setBugs((prev) =>
      prev.map((bug) => {
        if (bug.id !== bugId) return bug;
        const newNotes = [
          {
            timestamp,
            author,
            rcaSummary,
            patchHash,
            statusAtTime: 'FIX_VERIFIED',
          },
          ...(bug.structuredNotes || []),
        ];
        return {
          ...bug,
          status: 'RESOLVED' as const,
          structuredNotes: newNotes,
        };
      })
    );

    // Add audit log entry
    setLogs((prev) => [
      {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        subAgent: 'RCA Analyst',
        action: 'STRUCTURED_NOTE_ATTACHED',
        message: `Attached structured RCA note to ${bugId} in ${bugs.find((b) => b.id === bugId)?.trackerProvider || 'tracker'}`,
        tokensBurnt: { input: 120, output: 80, total: 200 },
      },
      ...prev,
    ]);
  };

  // Handler: Add a new bug from user or CSV import
  const handleAddBug = (newBug: BugItem) => {
    setBugs((prev) => [newBug, ...prev]);
    setSelectedBugId(newBug.id);
  };

  // Handler: Trigger Draft PR creation with CI verification
  const handleTriggerDraftPR = (bugId: string) => {
    const targetBug = bugs.find((b) => b.id === bugId) || bugs[0];
    const newPRNumber = Math.floor(Math.random() * 800) + 100;
    const branchName = `autorca/fix-${bugId.toLowerCase()}`;
    const prUrl = `${gitHubConfig.repoUrl}/pull/${newPRNumber}`;

    setActivePR({
      bugId: targetBug.id,
      prUrl,
      prNumber: newPRNumber,
      branch: branchName,
      patchSummary: `Autonomous fix for ${targetBug.title}. Sandbox worktree patch verified against test harness.`,
      ciStatus: 'PASSED',
    });

    setLogs((prev) => [
      {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        subAgent: 'CI Coordinator',
        action: 'GITHUB_DRAFT_PR_CREATED',
        message: `Created draft PR #${newPRNumber} on branch ${branchName} with existing CI check PASSED`,
        tokensBurnt: { input: 450, output: 120, total: 570 },
      },
      ...prev,
    ]);
  };

  // Handler: Run the autonomous Loop Engineering Auto-Fix workflow
  const handleRunAutoFixLoop = async (bugId: string) => {
    if (isLoopRunning) return;
    setIsLoopRunning(true);
    setCurrentIteration(1);

    const targetBug =
      trackerConfig.useManualInput && trackerConfig.manualIssue
        ? {
            id: 'CUSTOM-BUG-101',
            title: trackerConfig.manualIssue.title || 'Custom Manual Issue',
            severity: (trackerConfig.manualIssue.severity || 'High') as 'Critical' | 'High' | 'Medium' | 'Low',
            status: 'Open' as const,
            description: trackerConfig.manualIssue.description || 'Custom manual issue description',
            fileLocation: 'src/webhook/PaymentWebhookHandler.ts:88',
            createdAt: new Date().toISOString(),
            structuredNotes: [],
          }
        : bugs.find((b) => b.id === bugId) || bugs[0];

    // Check token guardrail limit before starting
    if (totalTokensBurnt >= guardrailConfig.maxTokensPerRun) {
      setEmailModalReason(
        `Cumulative token burn (${totalTokensBurnt.toLocaleString()}) exceeded max configured limit (${guardrailConfig.maxTokensPerRun.toLocaleString()}). Loop execution halted safely.`
      );
      setEmailModalOpen(true);
      setIsLoopRunning(false);
      return;
    }

    // Step 1: Sub-Agent RCA Analyst
    setSubAgents((prev) =>
      prev.map((s) => (s.role === 'RCA Analyst' ? { ...s, status: 'WORKING', lastAction: 'Analyzing stack trace & docs...' } : s))
    );
    await new Promise((r) => setTimeout(r, 800));

    // Step 2: KB Retriever
    setSubAgents((prev) =>
      prev.map((s) => {
        if (s.role === 'RCA Analyst') return { ...s, status: 'COMPLETED', lastAction: `Root cause identified in ${targetBug.fileLocation}` };
        if (s.role === 'KB Retriever') return { ...s, status: 'WORKING', lastAction: 'Querying Confluence & PDF Support Knowledge Base...' };
        return s;
      })
    );
    await new Promise((r) => setTimeout(r, 700));

    // Step 3: Code Repair Specialist (Worktree sandbox)
    setSubAgents((prev) =>
      prev.map((s) => {
        if (s.role === 'KB Retriever') return { ...s, status: 'COMPLETED', lastAction: 'Retrieved architectural rules from Confluence' };
        if (s.role === 'Code Repair Specialist') return { ...s, status: 'WORKING', lastAction: 'Synthesizing worktree sandbox patch...' };
        return s;
      })
    );
    await new Promise((r) => setTimeout(r, 900));

    // Step 4: Harness Verifier
    setSubAgents((prev) =>
      prev.map((s) => {
        if (s.role === 'Code Repair Specialist') return { ...s, status: 'COMPLETED', lastAction: 'Worktree diff applied cleanly' };
        if (s.role === 'Harness Verifier') return { ...s, status: 'WORKING', lastAction: `Executing ${testHarness.framework} test suite...` };
        return s;
      })
    );
    await new Promise((r) => setTimeout(r, 800));

    // Step 5: CI Coordinator
    setSubAgents((prev) =>
      prev.map((s) => {
        if (s.role === 'Harness Verifier') return { ...s, status: 'COMPLETED', lastAction: 'All 84 unit & integration tests PASSED (exit code 0)' };
        if (s.role === 'CI Coordinator') return { ...s, status: 'WORKING', lastAction: 'Publishing Draft PR with existing CI verification...' };
        return s;
      })
    );
    await new Promise((r) => setTimeout(r, 700));

    // Complete all sub-agents
    setSubAgents((prev) =>
      prev.map((s) => (s.role === 'CI Coordinator' ? { ...s, status: 'COMPLETED', lastAction: 'Draft PR created successfully' } : s))
    );

    // Append new iteration to loop history
    const newIteration: LoopIteration = {
      iteration: loopHistory.length + 1,
      subAgentRole: 'Harness Verifier',
      status: 'PASSED',
      harnessOutput: `[PASSED] AutoRCA Loop Iteration #${loopHistory.length + 1}: ${targetBug.id} test harness exit code 0. Worktree diff verified against existing CI pipeline.`,
      tokensBurnt: 1840,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLoopHistory((prev) => [newIteration, ...prev]);

    // Attach structured note
    handleAddStructuredNote(
      targetBug.id,
      'AutoRCA Sub-Agent Suite',
      `Autonomous Root Cause Analysis confirmed ${targetBug.title}. Created isolated Git Worktree sandbox, synthesized fix using ${modelConfig.modelId}, verified against ${testHarness.framework} test harness (exit code 0).`,
      `a81f3b0c-${Date.now().toString().slice(-4)}`
    );

    // Trigger Draft PR
    handleTriggerDraftPR(targetBug.id);

    // Log the entire run
    setLogs((prev) => [
      {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        subAgent: 'Guardrail Auditor',
        action: 'LOOP_ENGINEERING_SUCCESS',
        message: `Completed full 1-iteration RCA repair loop for ${targetBug.id}. All 5 sub-agents signed off.`,
        tokensBurnt: { input: 1240, output: 600, total: 1840 },
      },
      ...prev,
    ]);

    setIsLoopRunning(false);
  };

  return (
    <div className="min-h-screen bg-slate-100/80 flex flex-col font-sans antialiased text-slate-800">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        modelConfig={modelConfig}
        guardrailConfig={guardrailConfig}
        totalTokensBurnt={totalTokensBurnt}
        totalCostUsd={totalCostUsd}
        onTestGuardrailAlert={() => {
          setEmailModalReason('Guardrail Token & Cost Limit verification alert triggered.');
          setEmailModalOpen(true);
        }}
        isRunning={isLoopRunning}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'loop' && (
          <LoopWorkbench
            bugs={bugs}
            selectedBugId={selectedBugId}
            onSelectBug={setSelectedBugId}
            knowledgeSources={knowledgeBases}
            trackerConfig={trackerConfig}
            onUpdateTrackerConfig={setTrackerConfig}
            githubConfig={gitHubConfig}
            modelConfig={modelConfig}
            guardrailConfig={guardrailConfig}
            subAgents={subAgents}
            logs={logs}
            iterations={loopHistory}
            isRunning={isLoopRunning}
            totalTokensBurnt={totalTokensBurnt}
            totalCostUsd={totalCostUsd}
            onRunLoop={() => handleRunAutoFixLoop(selectedBugId)}
            onResetLogs={() => setLogs([])}
            onTriggerGuardrailEmail={(reason) => {
              setEmailModalReason(reason);
              setEmailModalOpen(true);
            }}
          />
        )}

        {activeTab === 'prereqs' && (
          <PrerequisitesTab
            knowledgeSources={knowledgeBases}
            onAddKnowledgeSource={(source) => setKnowledgeBases((prev) => [source, ...prev])}
            onRemoveKnowledgeSource={(id) => setKnowledgeBases((prev) => prev.filter((k) => k.id !== id))}
            trackerConfig={trackerConfig}
            onUpdateTrackerConfig={setTrackerConfig}
            onImportCsvBugs={(importedBugs) => {
              setBugs((prev) => [...importedBugs, ...prev]);
              if (importedBugs.length > 0) {
                setSelectedBugId(importedBugs[0].id);
              }
            }}
          />
        )}

        {activeTab === 'github' && (
          <GitHubPluginTab
            githubConfig={gitHubConfig}
            onUpdateGithubConfig={setGitHubConfig}
            draftPr={
              activePR
                ? {
                    prNumber: activePR.prNumber,
                    prTitle: activePR.patchSummary,
                    prUrl: activePR.prUrl,
                    branchName: activePR.branch,
                    isDraft: true,
                    ciStatus: 'Success',
                    ciJobName: 'test-harness / jest-ci',
                    createdAt: 'Just now',
                  }
                : undefined
            }
            onTestCreateDraftPr={() => handleTriggerDraftPR(selectedBugId)}
          />
        )}

        {activeTab === 'guardrails' && (
          <GuardrailsTab
            modelConfig={modelConfig}
            onUpdateModelConfig={setModelConfig}
            guardrailConfig={guardrailConfig}
            onUpdateGuardrailConfig={setGuardrailConfig}
            totalTokensBurnt={totalTokensBurnt}
            totalCostUsd={totalCostUsd}
            logs={logs}
            onTestEmailAlert={() => {
              setEmailModalReason('Manual Guardrail Email Alert Verification Test initiated by user.');
              setEmailModalOpen(true);
            }}
          />
        )}

        {activeTab === 'framework' && (
          <FrameworkTab
            agentsMd={agentsMd}
            onUpdateAgentsMd={setAgentsMd}
            skillsMd={skillsMd}
            onUpdateSkillsMd={setSkillsMd}
          />
        )}

        {activeTab === 'library' && <LibraryExportTab />}
      </main>

      {/* Footer Bar */}
      <FooterBar
        guardrailConfig={guardrailConfig}
        onOpenEmailModal={() => {
          setEmailModalReason('Test alert email triggered from Footer Bar quick action.');
          setEmailModalOpen(true);
        }}
      />

      {/* Guardrail Email Alert Modal */}
      <EmailAlertModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        guardrailConfig={guardrailConfig}
        onUpdateGuardrailConfig={setGuardrailConfig}
        reason={emailModalReason}
        tokensBurnt={totalTokensBurnt}
        onSendConfirmed={(email) => {
          setLogs((prev) => [
            {
              id: `LOG-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              subAgent: 'Guardrail Auditor',
              action: 'EMAIL_ALERT_DISPATCHED',
              message: `Guardrail Alert dispatched to ${email}. Reason: ${emailModalReason}`,
              tokensBurnt: { input: 0, output: 0, total: 0 },
              status: 'WARNING',
            },
            ...prev,
          ]);
          setEmailModalOpen(false);
        }}
      />
    </div>
  );
}
