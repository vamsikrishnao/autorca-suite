import React from 'react';
import { GitBranch } from 'lucide-react';
import { WorktreeState } from '../../types';

export interface WorktreeSandboxViewerProps {
  worktree?: WorktreeState;
}

export const WorktreeSandboxViewer: React.FC<WorktreeSandboxViewerProps> = ({ worktree }) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto max-h-[480px]">
      {worktree && worktree.filesChanged.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded-md border border-slate-700">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-mono font-bold text-white">
                {worktree.branchName}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-sm font-mono uppercase">
              Worktree Isolated Sandbox
            </span>
          </div>

          {worktree.filesChanged.map((fc, i) => (
            <div key={i} className="border border-slate-800 rounded-md overflow-hidden">
              <div className="bg-slate-800 px-3 py-2 text-xs font-mono text-slate-300 border-b border-slate-700">
                {fc.filename}
              </div>
              <pre className="p-3 text-[11px] font-mono leading-relaxed bg-slate-950 overflow-x-auto text-slate-300">
                {fc.diffString.split('\n').map((line, idx) => {
                  const isAdd = line.startsWith('+');
                  const isSub = line.startsWith('-');
                  const isHeader =
                    line.startsWith('@@') ||
                    line.startsWith('---') ||
                    line.startsWith('+++');
                  return (
                    <div
                      key={idx}
                      className={
                        isAdd
                          ? 'bg-emerald-950/40 text-emerald-300'
                          : isSub
                          ? 'bg-rose-950/40 text-rose-300'
                          : isHeader
                          ? 'text-cyan-400 font-bold'
                          : 'text-slate-400'
                      }
                    >
                      {line}
                    </div>
                  );
                })}
              </pre>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-slate-500 text-xs italic flex items-center justify-center h-48">
          No worktree diff generated yet. Run the AutoRCA &amp; Fix loop to inspect synthesized surgical patches.
        </div>
      )}
    </div>
  );
};
