import React from 'react';
import { GuardrailConfig } from '../../types';
import { I18N } from '../../config/i18n';

export interface GuardrailStatusBarProps {
  totalTokensBurnt: number;
  guardrailConfig: GuardrailConfig;
  iterationsCount: number;
  onTriggerGuardrailEmail: (reason: string) => void;
}

export const GuardrailStatusBar: React.FC<GuardrailStatusBarProps> = ({
  totalTokensBurnt,
  guardrailConfig,
  iterationsCount,
  onTriggerGuardrailEmail,
}) => {
  const tokenPercentage = Math.min(
    100,
    Math.round((totalTokensBurnt / guardrailConfig.maxTokensPerRun) * 100)
  );
  const loopPercentage = Math.min(
    100,
    Math.round((iterationsCount / guardrailConfig.maxLoopIterations) * 100)
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase">{I18N.guardrails.title}</h3>
        <button
          onClick={() =>
            onTriggerGuardrailEmail(
              `Token burn threshold (${totalTokensBurnt.toLocaleString()} tokens) or manual test trigger activated.`
            )
          }
          className="text-[10px] font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
        >
          {I18N.guardrails.emailAlertPrefix} {guardrailConfig.alertEmailAddress}
        </button>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${tokenPercentage}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-600 shrink-0 font-mono">
            {tokenPercentage}% {I18N.guardrails.tokenLimit}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${loopPercentage}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-600 shrink-0 font-mono">
            {iterationsCount}/{guardrailConfig.maxLoopIterations} {I18N.loopStatus.depthLimit}
          </span>
        </div>
      </div>
    </div>
  );
};

