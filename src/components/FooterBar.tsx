import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { GuardrailConfig } from '../types';
import { I18N } from '../config/i18n';

interface FooterBarProps {
  guardrailConfig: GuardrailConfig;
  onOpenEmailModal: () => void;
  lastSentAlertEmail?: {
    recipient: string;
    subject: string;
    reason: string;
    timestamp: string;
  };
}

export const FooterBar: React.FC<FooterBarProps> = ({
  guardrailConfig,
  onOpenEmailModal,
  lastSentAlertEmail,
}) => {
  return (
    <footer className="h-8 bg-amber-500 text-amber-950 px-4 flex items-center justify-between shrink-0 font-sans border-t border-amber-600/30">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-900" />
        <span className="text-[10px] font-bold uppercase tracking-tight">
          {I18N.footerBar.limitGuardrailPrefix} "{guardrailConfig.alertEmailAddress}" {I18N.footerBar.atLabel}{' '}
          {guardrailConfig.maxTokensPerRun.toLocaleString()} {I18N.footerBar.tokensAndMaxLabel}{' '}
          {guardrailConfig.maxLoopIterations} {I18N.footerBar.iterationsLabel}
        </span>
        {lastSentAlertEmail && (
          <button
            onClick={onOpenEmailModal}
            className="ml-2 px-2 py-0.5 bg-amber-950 text-amber-100 rounded text-[9px] font-bold hover:bg-amber-900 transition-colors cursor-pointer"
          >
            {I18N.footerBar.alertSentPrefix} {lastSentAlertEmail.timestamp} {I18N.footerBar.viewLabel}
          </button>
        )}
      </div>
      <div className="text-[10px] font-medium flex items-center gap-3">
        <span>
          {I18N.footerBar.autoFixModeLabel} <span className="underline font-bold">{I18N.footerBar.supervisedDraftPrLabel}</span>
        </span>
        <span className="text-amber-900/60">|</span>
        <span>
          {I18N.footerBar.worktreeSandboxLabel} <span className="font-mono font-bold">autorca/fix-ephemeral</span>
        </span>
      </div>
    </footer>
  );
};
