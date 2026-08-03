import React from 'react';
import { SubAgentInfo } from '../../types';
import { AGENT_STATUS_STYLES } from '../../config/theme';
import { I18N } from '../../config/i18n';

export interface SwarmAgentCardProps {
  agent: SubAgentInfo;
  index: number;
}

export const SwarmAgentCard: React.FC<SwarmAgentCardProps> = ({ agent, index }) => {
  const isAlert = agent.status === 'Alert / Blocked';
  const isActive = agent.status === 'WORKING';
  const isCompleted = agent.status === 'COMPLETED';

  const statusStyle = AGENT_STATUS_STYLES[agent.status] || {
    badge: 'bg-slate-100 text-slate-500',
    border: 'border-slate-200',
    glow: '',
  };

  return (
    <div
      className={`p-3 rounded-md border-l-4 transition-all ${
        isAlert
          ? 'border-l-rose-500 bg-rose-50/60 border border-rose-200'
          : isActive
          ? 'border-l-indigo-600 bg-indigo-50/60 border border-indigo-200 shadow-xs'
          : isCompleted
          ? 'border-l-emerald-500 bg-emerald-50/60 border border-emerald-200'
          : 'border-l-slate-300 bg-slate-50 border border-slate-200 opacity-75'
      }`}
    >
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold uppercase tracking-tight text-slate-800">
          {agent.role}
        </span>
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase font-mono border ${statusStyle.badge}`}
        >
          {agent.status}
        </span>
      </div>
      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
        {agent.description}
      </p>
      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-200/60 pt-1.5">
        <span>{I18N.swarmPanel.tokensLabel} {agent.tokensUsed.toLocaleString()}</span>
        <span>{I18N.swarmPanel.harnessRoleLabel} #{index + 1}</span>
      </div>
    </div>
  );
};

