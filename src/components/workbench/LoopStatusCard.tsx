import React from 'react';
import { BugItem, GuardrailConfig } from '../../types';
import { Badge } from '../common';
import { I18N } from '../../config/i18n';

export interface LoopStatusCardProps {
  selectedBug: BugItem;
  iterationsCount: number;
  maxLoopIterations: number;
}

export const LoopStatusCard: React.FC<LoopStatusCardProps> = ({
  selectedBug,
  iterationsCount,
  maxLoopIterations,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase">{I18N.loopStatus.title}</h3>
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-200">
          {I18N.loopStatus.worktreePrefix} autorca/fix-{selectedBug.id}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-800">{selectedBug.id}</span>
            <Badge label={selectedBug.severity} variant="severity" />
          </div>
          <p className="text-[11px] text-slate-600 mt-1 font-medium truncate">
            {selectedBug.title}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-bold text-slate-800">
            {I18N.loopStatus.iterationLabel} #{iterationsCount + 1}
          </div>
          <span className="text-[10px] font-bold text-slate-600 shrink-0 font-mono">
            {iterationsCount}/{maxLoopIterations} {I18N.loopStatus.depthLimit}
          </span>
        </div>
      </div>
    </div>
  );
};

