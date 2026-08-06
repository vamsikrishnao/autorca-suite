import React from 'react';
import {
  ShieldAlert,
  Cpu,
  GitBranch,
  Database,
  BookOpen,
  Code2,
  PackageCheck,
  Zap,
  Play,
  Building2,
  FolderGit2,
  Sparkles,
} from 'lucide-react';
import { ModelConfig, GuardrailConfig, TenantContext } from '../types';
import { I18N } from '../config/i18n';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  modelConfig: ModelConfig;
  guardrailConfig: GuardrailConfig;
  totalTokensBurnt: number;
  totalCostUsd: number;
  onTestGuardrailAlert: () => void;
  onRunHarness?: () => void;
  isRunning?: boolean;
  tenantContext?: TenantContext;
  onTenantChange?: (tenantId: string, projectId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  modelConfig,
  guardrailConfig,
  totalTokensBurnt,
  totalCostUsd,
  onTestGuardrailAlert,
  onRunHarness,
  isRunning = false,
  tenantContext = {
    tenantId: 'org-acme-corp',
    teamId: 'team-payments',
    projectId: 'proj-autorca-suite',
    userId: 'user-engineer-1',
  },
  onTenantChange,
}) => {
  const tokenPercentage = Math.min(
    100,
    Math.round((totalTokensBurnt / guardrailConfig.maxTokensPerRun) * 100)
  );

  const isTokenWarning = tokenPercentage > 80;

  const tabs = [
    { id: 'loop', label: I18N.navTabs.loopControl, icon: Zap },
    { id: 'prereqs', label: I18N.navTabs.kbAndBugTracker, icon: Database },
    { id: 'github', label: I18N.navTabs.githubPluginAndCi, icon: GitBranch },
    { id: 'prompts', label: 'Sub-Agent Prompts', icon: Sparkles },
    { id: 'guardrails', label: I18N.navTabs.modelsAndGuardrails, icon: ShieldAlert },
    { id: 'framework', label: I18N.navTabs.agentsAndSkills, icon: BookOpen },
    { id: 'library', label: I18N.navTabs.openSourceSdk, icon: PackageCheck },
  ];

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 shrink-0 sticky top-0 z-40 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 py-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center shadow-xs">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-800 uppercase">
                {I18N.headerBar.appTitle} <span className="text-indigo-600">{I18N.headerBar.ossTag}</span>
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-sm bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold uppercase tracking-wider">
                {I18N.headerBar.libraryVersion}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">
              {I18N.headerBar.subtitle}
            </p>
          </div>
        </div>

        {/* Multi-Tenant Organization & Project Context Selector */}
        <div className="flex flex-wrap items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <select
              value={tenantContext.tenantId}
              onChange={(e) => {
                const nextTenant = e.target.value;
                const defaultProject = nextTenant === 'org-acme-corp' ? 'proj-autorca-suite' : 'proj-fraud-detection';
                if (onTenantChange) onTenantChange(nextTenant, defaultProject);
              }}
              className="bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="org-acme-corp">Acme Corp [Org-101]</option>
              <option value="org-fintech-global">FinTech Global [Org-202]</option>
            </select>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
            <FolderGit2 className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={tenantContext.projectId}
              onChange={(e) => onTenantChange && onTenantChange(tenantContext.tenantId, e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {tenantContext.tenantId === 'org-acme-corp' ? (
                <>
                  <option value="proj-autorca-suite">autorca-suite</option>
                  <option value="proj-payment-gateway">payment-gateway-v2</option>
                  <option value="proj-ios-app">acme-mobile-ios</option>
                </>
              ) : (
                <option value="proj-fraud-detection">fraud-detection-engine</option>
              )}
            </select>
          </div>
          <span className="ml-1 text-[10px] bg-indigo-100 text-indigo-700 font-mono px-1.5 py-0.5 rounded">
            Tenant Isolated
          </span>
        </div>

        {/* Right Session Token Burn & Harness Action */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[11px] font-medium text-slate-500">{I18N.headerBar.modelLabel}</span>
            <span className="text-xs font-bold font-mono text-slate-800">{modelConfig.modelId}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {I18N.headerBar.tokenBurnLabel} {guardrailConfig.maxTokensPerRun.toLocaleString()})
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  isTokenWarning ? 'text-rose-600' : 'text-slate-700'
                }`}
              >
                {totalTokensBurnt.toLocaleString()} / {guardrailConfig.maxTokensPerRun.toLocaleString()}
              </span>
            </div>
            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-500 ${
                  isTokenWarning ? 'bg-rose-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${tokenPercentage}%` }}
              />
            </div>
          </div>

          <button
            onClick={onTestGuardrailAlert}
            title={I18N.headerBar.testAlertTitle}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">{I18N.headerBar.testAlertButton}</span>
          </button>

          {onRunHarness && (
            <button
              onClick={onRunHarness}
              disabled={isRunning}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? I18N.headerBar.loopInProgressButton : I18N.headerBar.deployHarnessButton}</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs - Always visible & horizontally scrollable on small/iframe viewports */}
      <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-2 pt-1 border-t border-slate-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};

