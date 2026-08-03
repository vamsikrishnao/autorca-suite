import React, { useState } from 'react';
import { Bug, Search, ChevronDown, X, Play, RotateCcw } from 'lucide-react';
import { BugItem, TrackerConfig } from '../../types';
import { I18N } from '../../config/i18n';

export interface BugSelectorBarProps {
  bugs: BugItem[];
  selectedBug: BugItem;
  onSelectBug: (id: string) => void;
  trackerConfig: TrackerConfig;
  onUpdateTrackerConfig?: (config: TrackerConfig) => void;
  isRunning: boolean;
  onRunLoop: () => void;
  onResetLogs: () => void;
}

export const BugSelectorBar: React.FC<BugSelectorBarProps> = ({
  bugs,
  selectedBug,
  onSelectBug,
  trackerConfig,
  onUpdateTrackerConfig,
  isRunning,
  onRunLoop,
  onResetLogs,
}) => {
  const [isBugSearchOpen, setIsBugSearchOpen] = useState(false);
  const [bugSearchQuery, setBugSearchQuery] = useState('');
  const [isQueryingRemote, setIsQueryingRemote] = useState(false);
  const [remoteQuerySuccess, setRemoteQuerySuccess] = useState<string | null>(null);

  const displayBugs = bugs;
  const filteredSearchBugs = displayBugs.filter((bug) => {
    const q = bugSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      bug.id.toLowerCase().includes(q) ||
      bug.title.toLowerCase().includes(q) ||
      (bug.assignee && bug.assignee.toLowerCase().includes(q)) ||
      bug.severity.toLowerCase().includes(q)
    );
  });

  const handleRunRemoteQuery = () => {
    setIsQueryingRemote(true);
    setRemoteQuerySuccess(null);
    setTimeout(() => {
      setIsQueryingRemote(false);
      const url = trackerConfig.searchUrl || `${trackerConfig.baseUrl}/rest/api/3/search`;
      setRemoteQuerySuccess(`✓ Queried endpoint [${url}] — ${filteredSearchBugs.length} issues returned`);
    }, 450);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase">
              {I18N.workbench.selectTargetBug} ({trackerConfig.platform}):
            </span>

            {/* Manual Issue Mode Checkbox / Toggle */}
            {onUpdateTrackerConfig && (
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer select-none transition-colors border border-slate-300">
                <input
                  type="checkbox"
                  checked={!!trackerConfig.useManualInput}
                  onChange={(e) =>
                    onUpdateTrackerConfig({
                      ...trackerConfig,
                      useManualInput: e.target.checked,
                    })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                />
                <Bug className="w-3.5 h-3.5 text-indigo-600" />
                <span>{I18N.workbench.manualModeCheckbox}</span>
              </label>
            )}
          </div>

          {trackerConfig.useManualInput ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <Bug className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{I18N.workbench.manualModeActive}</span>
              <span className="text-[10px] text-amber-600 font-normal hidden xl:inline">
                {I18N.workbench.manualModeDisabledNotice}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              {displayBugs.slice(0, 4).map((bug) => {
                const isSelected = bug.id === selectedBug.id;
                return (
                  <button
                    key={bug.id}
                    onClick={() => onSelectBug(bug.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-mono">{bug.id}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        bug.severity === 'Critical'
                          ? 'bg-rose-500'
                          : bug.severity === 'High'
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                    />
                  </button>
                );
              })}

              {/* Extensible Search & Pick Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsBugSearchOpen(!isBugSearchOpen)}
                  className="px-3 py-1.5 rounded-md text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{I18N.workbench.searchIssuesButton}</span>
                  <ChevronDown className="w-3 h-3 text-indigo-500" />
                </button>

                {isBugSearchOpen && (
                  <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-700">
                        {I18N.workbench.searchIssuesModalTitle} {trackerConfig.platform}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsBugSearchOpen(false)}
                        className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={bugSearchQuery}
                          onChange={(e) => setBugSearchQuery(e.target.value)}
                          placeholder="Search by Ticket ID, subject, severity..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          autoFocus
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        <span className="truncate max-w-[200px] font-mono">
                          URL: {trackerConfig.searchUrl || `${trackerConfig.baseUrl}/search`}
                        </span>
                        <button
                          type="button"
                          onClick={handleRunRemoteQuery}
                          disabled={isQueryingRemote}
                          className="font-bold text-indigo-600 hover:text-indigo-800 shrink-0 ml-1 underline cursor-pointer"
                        >
                          {isQueryingRemote
                            ? I18N.workbench.queryingRemoteApi
                            : I18N.workbench.queryRemoteApi}
                        </button>
                      </div>
                      {remoteQuerySuccess && (
                        <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          {remoteQuerySuccess}
                        </div>
                      )}

                      <div className="max-h-60 overflow-y-auto space-y-1.5 divide-y divide-slate-100 pt-1">
                        {filteredSearchBugs.length === 0 ? (
                          <div className="text-center py-4 text-xs text-slate-400 font-medium">
                            {I18N.workbench.noBugsFound} "{bugSearchQuery}"
                          </div>
                        ) : (
                          filteredSearchBugs.map((bug) => {
                            const isSelected = bug.id === selectedBug.id;
                            return (
                              <div
                                key={bug.id}
                                onClick={() => {
                                  onSelectBug(bug.id);
                                  setIsBugSearchOpen(false);
                                }}
                                className={`p-2.5 rounded-lg cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                                  isSelected
                                    ? 'bg-indigo-50/80 border border-indigo-200'
                                    : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                                      {bug.id}
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        bug.severity === 'Critical'
                                          ? 'bg-rose-100 text-rose-700'
                                          : bug.severity === 'High'
                                          ? 'bg-amber-100 text-amber-700'
                                          : 'bg-indigo-100 text-indigo-700'
                                      }`}
                                    >
                                      {bug.severity}
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                                    {bug.title}
                                  </p>
                                  <p className="text-[10px] text-slate-500">
                                    Assignee: {bug.assignee || 'Unassigned'} • Status: {bug.status}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={onRunLoop}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>
              {isRunning
                ? I18N.workbench.loopActiveButton
                : `${I18N.workbench.runLoopButton} (${
                    trackerConfig.useManualInput ? 'CUSTOM ISSUE' : selectedBug.id
                  })`}
            </span>
          </button>
          <button
            onClick={onResetLogs}
            className="flex items-center gap-1.5 px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-600 transition-colors whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>{I18N.workbench.resetWorkbenchButton}</span>
          </button>
        </div>
      </div>

      {/* Manual Issue Custom Inputs */}
      {trackerConfig.useManualInput && onUpdateTrackerConfig && (
        <div className="pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              {I18N.workbench.customIssueTitleLabel}
            </label>
            <input
              type="text"
              value={trackerConfig.manualIssue?.title || ''}
              onChange={(e) =>
                onUpdateTrackerConfig({
                  ...trackerConfig,
                  manualIssue: {
                    ...(trackerConfig.manualIssue || {
                      title: '',
                      description: '',
                      stackTrace: '',
                    }),
                    title: e.target.value,
                  },
                })
              }
              placeholder={I18N.workbench.customIssueTitlePlaceholder}
              className="w-full p-2 text-xs bg-white border border-slate-300 rounded-md font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              {I18N.workbench.customIssueDescLabel}
            </label>
            <input
              type="text"
              value={trackerConfig.manualIssue?.description || ''}
              onChange={(e) =>
                onUpdateTrackerConfig({
                  ...trackerConfig,
                  manualIssue: {
                    ...(trackerConfig.manualIssue || {
                      title: '',
                      description: '',
                      stackTrace: '',
                    }),
                    description: e.target.value,
                  },
                })
              }
              placeholder={I18N.workbench.customIssueDescPlaceholder}
              className="w-full p-2 text-xs bg-white border border-slate-300 rounded-md font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
