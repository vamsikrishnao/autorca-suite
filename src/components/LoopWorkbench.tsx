import React, { useState } from 'react';
import { Terminal, FileCode, FileText } from 'lucide-react';
import {
  BugItem,
  KnowledgeSource,
  TrackerConfig,
  GitHubPluginConfig,
  ModelConfig,
  GuardrailConfig,
  SubAgentInfo,
  LogEntry,
  LoopIteration,
  WorktreeState,
  RcaNoteResult,
  DraftPrResult,
} from '../types';
import {
  ConnectorsPanel,
  LoopStatusCard,
  GuardrailStatusBar,
  BugSelectorBar,
  SwarmAgentsPanel,
  LogStreamViewer,
  WorktreeSandboxViewer,
  DraftPrViewer,
} from './workbench';
import { I18N } from '../config/i18n';

interface LoopWorkbenchProps {
  bugs: BugItem[];
  selectedBugId: string;
  onSelectBug: (id: string) => void;
  knowledgeSources: KnowledgeSource[];
  trackerConfig: TrackerConfig;
  githubConfig: GitHubPluginConfig;
  modelConfig: ModelConfig;
  guardrailConfig: GuardrailConfig;
  subAgents: SubAgentInfo[];
  logs: LogEntry[];
  iterations: LoopIteration[];
  worktree?: WorktreeState;
  rcaNote?: RcaNoteResult;
  draftPr?: DraftPrResult;
  isRunning: boolean;
  totalTokensBurnt: number;
  totalCostUsd: number;
  onRunLoop: () => void;
  onResetLogs: () => void;
  onTriggerGuardrailEmail: (reason: string) => void;
  onUpdateTrackerConfig?: (config: TrackerConfig) => void;
}

export const LoopWorkbench: React.FC<LoopWorkbenchProps> = ({
  bugs,
  selectedBugId,
  onSelectBug,
  knowledgeSources,
  trackerConfig,
  onUpdateTrackerConfig,
  githubConfig,
  modelConfig,
  guardrailConfig,
  subAgents,
  logs,
  iterations,
  worktree,
  rcaNote,
  draftPr,
  isRunning,
  totalTokensBurnt,
  totalCostUsd,
  onRunLoop,
  onResetLogs,
  onTriggerGuardrailEmail,
}) => {
  const [rightView, setRightView] = useState<'LOGS' | 'DIFF' | 'RCA_PR'>('LOGS');

  const platformBugs = bugs.filter((b) => b.platform === trackerConfig.platform);
  const displayBugs = platformBugs.length > 0 ? platformBugs : bugs;
  const selectedBug = displayBugs.find((b) => b.id === selectedBugId) || displayBugs[0];

  return (
    <div className="space-y-6">
      {/* Top 3-Column Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ConnectorsPanel
          knowledgeSources={knowledgeSources}
          trackerConfig={trackerConfig}
          githubConfig={githubConfig}
        />
        <LoopStatusCard
          selectedBug={selectedBug}
          iterationsCount={iterations.length}
          maxLoopIterations={guardrailConfig.maxLoopIterations}
        />
        <GuardrailStatusBar
          totalTokensBurnt={totalTokensBurnt}
          guardrailConfig={guardrailConfig}
          iterationsCount={iterations.length}
          onTriggerGuardrailEmail={onTriggerGuardrailEmail}
        />
      </div>

      {/* Target Bug Selector & Actions */}
      <BugSelectorBar
        bugs={displayBugs}
        selectedBug={selectedBug}
        onSelectBug={onSelectBug}
        trackerConfig={trackerConfig}
        onUpdateTrackerConfig={onUpdateTrackerConfig}
        isRunning={isRunning}
        onRunLoop={onRunLoop}
        onResetLogs={onResetLogs}
      />

      {/* Main Execution View - 5 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[500px]">
        {/* Sub-Agent Swarm Activity (2 Columns) */}
        <SwarmAgentsPanel subAgents={subAgents} />

        {/* Right Panel: Execution Logs, Worktree Diff, or RCA Note / PR (3 Columns) */}
        <div className="lg:col-span-3 bg-slate-900 rounded-xl flex flex-col overflow-hidden shadow-lg border border-slate-800">
          {/* Top Panel Bar with View Switcher */}
          <div className="p-3 bg-slate-800/90 border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-md border border-slate-700">
              <button
                onClick={() => setRightView('LOGS')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                  rightView === 'LOGS'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{I18N.executionView.logsTab}</span>
              </button>
              <button
                onClick={() => setRightView('DIFF')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                  rightView === 'DIFF'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{I18N.executionView.diffTab} ({worktree ? '1 file' : '0'})</span>
              </button>
              <button
                onClick={() => setRightView('RCA_PR')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                  rightView === 'RCA_PR'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{I18N.executionView.rcaPrTab}</span>
              </button>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
              <span>T: {totalTokensBurnt.toLocaleString()} tok</span>
              <span>Model: {modelConfig.modelId}</span>
            </div>
          </div>

          {/* Dynamic Content: LOGS / DIFF / RCA_PR */}
          {rightView === 'LOGS' && (
            <LogStreamViewer logs={logs} isRunning={isRunning} />
          )}

          {rightView === 'DIFF' && (
            <WorktreeSandboxViewer worktree={worktree} />
          )}

          {rightView === 'RCA_PR' && (
            <DraftPrViewer
              draftPr={draftPr}
              rcaNote={rcaNote}
              selectedBug={selectedBug}
              trackerConfig={trackerConfig}
            />
          )}

          {/* Bottom Terminal Metric Bar */}
          <div className="p-3 bg-indigo-950/40 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-6">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase text-slate-400 font-bold">{I18N.executionView.totalBurn}</span>
                <span className="text-xs font-bold text-white font-mono">
                  ${totalCostUsd.toFixed(4)} USD ({totalTokensBurnt.toLocaleString()} tok)
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase text-slate-400 font-bold">{I18N.executionView.avgLatency}</span>
                <span className="text-xs font-bold text-white font-mono">4.2s / loop</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase text-slate-400 font-bold">{I18N.executionView.harnessStatus}</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {iterations.some((it) => it.harnessPassed)
                    ? 'PASSED (Exit 0)'
                    : isRunning
                    ? 'VERIFYING...'
                    : 'READY'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-300 font-mono">
              <span>PR #{draftPr ? draftPr.prNumber : '---'} {I18N.executionView.prDrafted}</span>
              <span className="text-slate-600">|</span>
              <span>
                {I18N.executionView.ciLabel}{' '}
                <span className="text-amber-400 font-semibold">
                  {draftPr ? draftPr.ciStatus : 'Waiting'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
