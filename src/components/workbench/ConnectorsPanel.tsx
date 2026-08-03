import React from 'react';
import { KnowledgeSource, TrackerConfig, GitHubPluginConfig } from '../../types';
import { StatusIndicator } from '../common';
import { I18N } from '../../config/i18n';

export interface ConnectorsPanelProps {
  knowledgeSources: KnowledgeSource[];
  trackerConfig: TrackerConfig;
  githubConfig: GitHubPluginConfig;
}

export const ConnectorsPanel: React.FC<ConnectorsPanelProps> = ({
  knowledgeSources,
  trackerConfig,
  githubConfig,
}) => {
  const hasError = knowledgeSources.some(
    (s) => s.status === 'Connection Error' || s.status === 'Error'
  );
  const hasNotConnected = knowledgeSources.some((s) => s.status === 'Not Connected');

  const overallStatus = hasError
    ? 'Connection Error'
    : hasNotConnected
    ? 'Not Connected'
    : 'Connected';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center justify-between">
        <span>{I18N.connectors.title}</span>
        <StatusIndicator status={overallStatus} />
      </h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">{I18N.connectors.issueTracker} ({trackerConfig.platform})</span>
          <span className="font-mono text-indigo-600 font-semibold">{trackerConfig.projectKey}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">{I18N.connectors.githubRepo}</span>
          <span className="font-mono text-slate-500 truncate max-w-[150px]">
            {githubConfig.repository}
          </span>
        </div>
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {I18N.connectors.kbSources} ({knowledgeSources.length})
          </span>
          {knowledgeSources.map((kb) => (
            <div key={kb.id} className="flex items-center justify-between text-[11px] gap-2">
              <span className="text-slate-600 font-medium truncate max-w-[160px]" title={kb.urlOrFilename}>
                {kb.name}
              </span>
              <StatusIndicator status={kb.status} size="xs" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

