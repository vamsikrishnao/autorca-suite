import React from 'react';
import { Layers } from 'lucide-react';
import { SubAgentInfo } from '../../types';
import { SwarmAgentCard } from './SwarmAgentCard';
import { I18N } from '../../config/i18n';

export interface SwarmAgentsPanelProps {
  subAgents: SubAgentInfo[];
}

export const SwarmAgentsPanel: React.FC<SwarmAgentsPanelProps> = ({ subAgents }) => {
  return (
    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-xs">
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-800 uppercase">
            {I18N.swarmPanel.title}
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-sm font-bold">
          {subAgents.length} {I18N.swarmPanel.agentsCount}
        </span>
      </div>
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 max-h-[560px]">
        {subAgents.map((agent, idx) => (
          <SwarmAgentCard key={`${agent.role}-${idx}`} agent={agent} index={idx} />
        ))}
      </div>
    </div>
  );
};

