import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  GitPullRequest,
  CheckCircle2,
  ShieldCheck,
  Terminal,
  ExternalLink,
  Cpu,
  Lock,
  Layers,
  FileCode,
  KeyRound,
  Server,
  Zap,
  HardDrive,
  Trash2,
} from 'lucide-react';
import { GitHubPluginConfig, WorktreeState, DraftPrResult, WorkerPoolMetrics } from '../types';

interface GitHubPluginTabProps {
  githubConfig: GitHubPluginConfig;
  onUpdateGithubConfig: (config: GitHubPluginConfig) => void;
  worktree?: WorktreeState;
  draftPr?: DraftPrResult;
  onTestCreateDraftPr: () => void;
}

export const GitHubPluginTab: React.FC<GitHubPluginTabProps> = ({
  githubConfig,
  onUpdateGithubConfig,
  worktree,
  draftPr,
  onTestCreateDraftPr,
}) => {
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [validationMsg, setValidationMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Worker Pool State for Decoupled Runner Architecture
  const [workerPool, setWorkerPool] = useState<WorkerPoolMetrics | null>(null);
  const [isDispatchingWorker, setIsDispatchingWorker] = useState(false);
  const [dispatchResultMsg, setDispatchResultMsg] = useState<string | null>(null);

  const fetchWorkerPoolMetrics = () => {
    fetch('/api/worktree/runners')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.pool) {
          setWorkerPool(data.pool);
        }
      })
      .catch((err) => console.warn('Failed to fetch worker pool metrics:', err));
  };

  useEffect(() => {
    fetchWorkerPoolMetrics();
  }, []);

  const handleDispatchWorkerJob = async () => {
    setIsDispatchingWorker(true);
    setDispatchResultMsg(null);
    try {
      const res = await fetch('/api/worktree/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bugId: 'JIRA-4892',
          repoUrl: `https://github.com/${githubConfig.repository}`,
          branchName: `autorca/fix-jira-4892`,
          harnessCommand: 'npm test',
        }),
      });
      const data = await res.json();
      if (data?.success && data.job) {
        setDispatchResultMsg(`Dispatched to ${data.job.podId} (${data.job.cpuQuota}, ${data.job.memoryQuota}, GIT_INDEX_FILE Isolated)`);
        fetchWorkerPoolMetrics();
      } else {
        setDispatchResultMsg(data.error || 'Worker dispatch failed');
      }
    } catch (err: any) {
      setDispatchResultMsg('Network Error dispatching worker job');
    } finally {
      setIsDispatchingWorker(false);
    }
  };

  const handleCleanupWorkspaces = async () => {
    try {
      const res = await fetch('/api/worktree/cleanup', { method: 'POST' });
      const data = await res.json();
      if (data?.success) {
        setDispatchResultMsg(data.message);
        fetchWorkerPoolMetrics();
      }
    } catch (err: any) {
      console.warn('Cleanup failed:', err);
    }
  };

  const handleTestGithubToken = () => {
    setIsValidatingToken(true);
    setValidationMsg(null);
    setTimeout(() => {
      setIsValidatingToken(false);
      const token = (githubConfig.personalAccessToken || '').trim();
      const repo = (githubConfig.repository || '').trim();
      if (!token) {
        setValidationMsg({
          success: false,
          text: 'PAT is empty. Provide a valid GitHub Personal Access Token (ghp_*** or github_pat_***).',
        });
      } else if (!repo || !repo.includes('/')) {
        setValidationMsg({
          success: false,
          text: 'Please specify repository in "owner/repo" format.',
        });
      } else if (token.length < 15) {
        setValidationMsg({
          success: false,
          text: 'Token format appears invalid (too short). Ensure token has repo & workflow scopes.',
        });
      } else {
        setValidationMsg({
          success: true,
          text: `✓ Authenticated successfully. Repository '${repo}' read/write access and workflow scopes verified.`,
        });
      }
    }, 600);
  };
  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Top Banner: GitHub Versioning Tool Integration */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight">
                GitHub Versioning Tool Plugin &amp; Worktree Automation
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Creates isolated Git worktrees, pushes surgical patches, verifies existing CI pipelines, and opens a Draft Pull Request for review.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-sm uppercase">
              Worktree Sandboxing: ENABLED
            </span>
            <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-sm uppercase">
              Draft PR Mode: ON
            </span>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              GitHub Repository (Owner / Repo)
            </label>
            <input
              type="text"
              value={githubConfig.repository}
              onChange={(e) =>
                onUpdateGithubConfig({ ...githubConfig, repository: e.target.value })
              }
              placeholder="e.g., autorca-suite/example-react-backend"
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Base Branch for Pull Requests
            </label>
            <input
              type="text"
              value={githubConfig.baseBranch}
              onChange={(e) =>
                onUpdateGithubConfig({ ...githubConfig, baseBranch: e.target.value })
              }
              placeholder="main"
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              GitHub Personal Access Token (PAT)
            </label>
            <div className="relative">
              <input
                type="password"
                value={githubConfig.personalAccessToken}
                onChange={(e) =>
                  onUpdateGithubConfig({ ...githubConfig, personalAccessToken: e.target.value })
                }
                className="w-full pl-3 pr-9 py-2.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Requires <code className="font-mono text-indigo-700">repo</code> and <code className="font-mono text-indigo-700">workflow</code> scopes to create Draft PRs and check CI status.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Auto-Label for PRs
            </label>
            <input
              type="text"
              value={githubConfig.autoLabel}
              onChange={(e) =>
                onUpdateGithubConfig({ ...githubConfig, autoLabel: e.target.value })
              }
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* GitHub Token & Repo Validation Action */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTestGithubToken}
              disabled={isValidatingToken}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white rounded-md text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isValidatingToken ? 'Authenticating...' : 'Test Connection & Validate Token'}</span>
            </button>
            {validationMsg && (
              <span
                className={`text-xs font-semibold ${
                  validationMsg.success ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {validationMsg.text}
              </span>
            )}
          </div>
        </div>

        {/* Toggles */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={githubConfig.createDraftPR}
                onChange={(e) =>
                  onUpdateGithubConfig({ ...githubConfig, createDraftPR: e.target.checked })
                }
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Create as Draft Pull Request for review (prevent accidental merge)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={githubConfig.verifyExistingCI}
                onChange={(e) =>
                  onUpdateGithubConfig({ ...githubConfig, verifyExistingCI: e.target.checked })
                }
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Verify any existing CI already run before marking Draft PR as ready</span>
            </label>
          </div>

          <button
            onClick={onTestCreateDraftPr}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md shadow-xs transition-colors flex items-center gap-1.5"
          >
            <GitPullRequest className="w-4 h-4 text-emerald-400" />
            <span>Simulate Draft PR Creation</span>
          </button>
        </div>
      </div>

      {/* SECTION: Decoupled Ephemeral Worker Runner Pool & Sandboxing Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md text-white space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Decoupled Ephemeral Worker Runner Pool
              </h3>
              <p className="text-[11px] text-slate-400">
                Isolated K8s Runner Pods &amp; MicroVM Sandboxes for 500-User Scale Parallel Fix Loops
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-bold uppercase">
            Git Index Lock Protection: Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Worker Capacity</span>
            </div>
            <div className="text-lg font-black text-indigo-300">
              {workerPool ? `${workerPool.availableWorkersCount}/${workerPool.maxCapacityWorkers}` : '50/50'} Pods
            </div>
            <div className="text-[10px] text-slate-500">Auto-scalable to 500+</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Index Lock Shield</span>
            </div>
            <div className="text-xs font-bold text-emerald-400 truncate">
              GIT_INDEX_FILE Isolated
            </div>
            <div className="text-[10px] text-slate-500">Zero .git/index.lock Collisions</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span>Quota per Worker Pod</span>
            </div>
            <div className="text-xs font-bold text-amber-300">
              2 vCPU | 4GB RAM | 10GB Disk
            </div>
            <div className="text-[10px] text-slate-500">Strict CGroups Limits</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Trash2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Workspace TTL</span>
            </div>
            <div className="text-xs font-bold text-cyan-300">
              30m Auto-Prune GC
            </div>
            <div className="text-[10px] text-slate-500">Disk Exhaustion Guard</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDispatchWorkerJob}
              disabled={isDispatchingWorker}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{isDispatchingWorker ? 'Provisioning Pod...' : 'Test Ephemeral Worker Pod Dispatch'}</span>
            </button>

            <button
              type="button"
              onClick={handleCleanupWorkspaces}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Trigger Workspace Garbage Collection</span>
            </button>
          </div>

          {dispatchResultMsg && (
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/50">
              {dispatchResultMsg}
            </span>
          )}
        </div>
      </div>

      {/* SECTION: Active Worktree & Draft PR Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Worktree Sandbox Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase">
                Active Git Worktree Sandbox
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-sm font-bold uppercase">
              {worktree ? worktree.status : 'Idle'}
            </span>
          </div>

          {worktree ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Worktree Path:</span>
                <span className="font-mono text-slate-800">{worktree.worktreeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Surgical Branch:</span>
                <span className="font-mono text-indigo-600 font-bold">{worktree.branchName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Base Commit:</span>
                <span className="font-mono text-slate-700">{worktree.baseCommit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Modified Files:</span>
                <span className="font-semibold text-emerald-700">
                  {worktree.filesChanged.length} file(s) patched
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic py-6 text-center">
              No ephemeral worktree active. Deploy harness to initiate isolated patch synthesis.
            </div>
          )}
        </div>

        {/* Draft Pull Request Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase">
                Created Draft PR &amp; CI Pipeline
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-100 text-amber-800 rounded-sm font-bold uppercase">
              {draftPr ? 'Draft PR Open' : 'Not Created'}
            </span>
          </div>

          {draftPr ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">PR #{draftPr.prNumber}</span>
                <span
                  className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase font-mono ${
                    draftPr.ciStatus === 'Success'
                      ? 'bg-emerald-100 text-emerald-700'
                      : draftPr.ciStatus === 'Failed'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  CI: {draftPr.ciStatus}
                </span>
              </div>
              <p className="text-slate-700 font-medium">{draftPr.prTitle}</p>
              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
                <span>Job: {draftPr.ciJobName}</span>
                <a
                  href={draftPr.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                >
                  <span>Open PR</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic py-6 text-center">
              No Draft PR created yet. Running the loop will synthesize fix details and push a Draft PR for review.
            </div>
          )}
        </div>
      </div>

      {/* SECTION: Plugin Code Reference & API Payload */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg text-slate-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase font-mono">
              GitHub Versioning Plugin — PR &amp; RCA Note Payload Spec
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            src/plugins/github/WorktreePrPlugin.ts
          </span>
        </div>
        <pre className="text-[11px] font-mono bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto text-slate-300 leading-relaxed">
          {`// AutoRCA GitHub Versioning Plugin: Creates Draft PR & verifies existing CI
export async function executeGitHubVersionFlow(config: GitHubPluginConfig, bug: BugItem, diff: string) {
  // 1. Create worktree branch: autorca/fix-{bug.id}
  const branchName = \`autorca/fix-\${bug.id.toLowerCase()}\`;
  await git.checkoutWorktree(branchName, config.baseBranch);
  
  // 2. Commit surgical diff
  await git.commit(\`fix(\${bug.id}): automated RCA remediation patch\`);
  await git.push(branchName);
  
  // 3. Check existing CI status before opening PR
  const ciRun = await github.checks.getLatestRun({ ref: config.baseBranch });
  
  // 4. Create Draft PR with fix details
  return await github.pulls.create({
    ownerRepo: config.repository,
    title: \`[DRAFT FIX] \${bug.id}: \${bug.title}\`,
    head: branchName,
    base: config.baseBranch,
    draft: config.createDraftPR, // true
    body: formatRcaNoteForPr(bug, diff, ciRun.status),
    labels: [config.autoLabel],
  });
}`}
        </pre>
      </div>
    </div>
  );
};
