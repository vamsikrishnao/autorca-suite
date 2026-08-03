import React, { useState } from 'react';
import { ShieldAlert, Mail, Send, CheckCircle2, X, AlertTriangle, Clock } from 'lucide-react';
import { GuardrailConfig } from '../types';

interface EmailAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  guardrailConfig: GuardrailConfig;
  onUpdateGuardrailConfig: (config: GuardrailConfig) => void;
  reason: string;
  tokensBurnt: number;
  onSendConfirmed: (email: string) => void;
  lastSentAlertEmail?: {
    recipient: string;
    subject: string;
    reason: string;
    timestamp: string;
  };
}

export const EmailAlertModal: React.FC<EmailAlertModalProps> = ({
  isOpen,
  onClose,
  guardrailConfig,
  onUpdateGuardrailConfig,
  reason,
  tokensBurnt,
  onSendConfirmed,
  lastSentAlertEmail,
}) => {
  const [targetEmail, setTargetEmail] = useState(guardrailConfig.alertEmailAddress);
  const [customNote, setCustomNote] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    onSendConfirmed(targetEmail);
    if (targetEmail !== guardrailConfig.alertEmailAddress) {
      onUpdateGuardrailConfig({ ...guardrailConfig, alertEmailAddress: targetEmail });
    }
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
      <div
        className="bg-white border border-slate-200 rounded-xl max-w-lg w-full shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-amber-500 text-amber-950 px-6 py-4 flex items-center justify-between border-b border-amber-600/30">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-sm tracking-tight uppercase">
                Guardrail Limit Alert — Email Notification
              </h3>
              <p className="text-[11px] text-amber-900/80">
                AutoRCA &amp; Fix Suite Safety Limit or Token Threshold Reached
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-950/70 hover:text-amber-950 p-1 rounded-md hover:bg-amber-600/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-slate-800">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-amber-900 block mb-0.5">
                Guardrail Event Triggered
              </span>
              <p className="text-amber-800 leading-relaxed">{reason}</p>
              <div className="mt-2 flex items-center gap-4 font-mono text-[11px] text-amber-900">
                <span>
                  Tokens Burnt: <strong>{tokensBurnt.toLocaleString()}</strong>
                </span>
                <span>
                  Limit Cap: <strong>{guardrailConfig.maxTokensPerRun.toLocaleString()}</strong>
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Configurable Alert Mailbox Address
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  placeholder="devops-alerts@company.com"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              An automated email notification will be dispatched to inform the team that the loop engineering limits were reached.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Additional Note for Email Body (Optional)
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Please review worktree diff for JIRA-4892 before overriding token limit..."
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {lastSentAlertEmail && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span>Last Dispatched Alert Email</span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {lastSentAlertEmail.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-mono">
                To: {lastSentAlertEmail.recipient} • Subject: {lastSentAlertEmail.subject}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={handleSend}
            disabled={sentSuccess}
            className={`flex items-center gap-2 px-5 py-2 rounded-md text-xs font-bold text-white transition-all shadow-xs ${
              sentSuccess ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {sentSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>EMAIL ALERT DISPATCHED!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>DISPATCH ALERT EMAIL</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
