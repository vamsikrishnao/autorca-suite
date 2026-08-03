import React, { useState } from 'react';
import { GitBranch, ExternalLink, FileText, Check, Copy } from 'lucide-react';
import { DraftPrResult, RcaNoteResult, TrackerConfig, BugItem } from '../../types';

export interface DraftPrViewerProps {
  draftPr?: DraftPrResult;
  rcaNote?: RcaNoteResult;
  selectedBug: BugItem;
  trackerConfig: TrackerConfig;
}

export const DraftPrViewer: React.FC<DraftPrViewerProps> = ({
  draftPr,
  rcaNote,
  selectedBug,
  trackerConfig,
}) => {
  const [copiedNote, setCopiedNote] = useState(false);

  const handleCopyNote = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto max-h-[480px] space-y-4">
      {/* Draft PR Card */}
      {draftPr ? (
        <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">
                GitHub Draft PR #{draftPr.prNumber}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-sm uppercase font-mono">
                DRAFT
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-300">
              CI Status:{' '}
              <strong className="text-emerald-400 uppercase">{draftPr.ciStatus}</strong>
            </span>
          </div>
          <p className="text-xs text-slate-200 font-medium">{draftPr.prTitle}</p>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-700/60">
            <span>Branch: {draftPr.branchName}</span>
            <a
              href={draftPr.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              <span>Open on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg text-xs text-slate-400 italic">
          Draft Pull Request not created yet for {selectedBug.id}.
        </div>
      )}

      {/* RCA Note inside same bug tracker */}
      {rcaNote ? (
        <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase">
                RCA Analysis Note ({trackerConfig.platform} Bug #{rcaNote.bugId})
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-sm font-mono">
                POSTED TO TRACKER
              </span>
            </div>
            <button
              onClick={() => handleCopyNote(rcaNote.formattedCommentText)}
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-sm bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
            >
              {copiedNote ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Note</span>
                </>
              )}
            </button>
          </div>

          <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3 rounded-md overflow-x-auto whitespace-pre-wrap border border-slate-800">
            {rcaNote.formattedCommentText}
          </pre>
        </div>
      ) : (
        <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg text-xs text-slate-400 italic">
          RCA analysis note will be synthesized and posted automatically upon completion of Sub-Agent RCA loop.
        </div>
      )}
    </div>
  );
};
