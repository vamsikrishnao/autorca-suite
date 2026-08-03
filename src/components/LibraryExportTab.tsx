import React, { useState } from 'react';
import { Package, Terminal, Copy, Check, ExternalLink, Code2, ShieldAlert, Cpu } from 'lucide-react';

export const LibraryExportTab: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const npmInstallCmd = `npm install --save-dev @autorca/suite \n# Or via yarn / pnpm\npnpm add -D @autorca/suite`;

  const nodeExampleCode = `import { AutoBugRCA, GitHubConnector, GuardrailEngine } from '@autorca/suite';

const rcaSuite = new AutoBugRCA({
  bugTracker: {
    provider: 'Jira',
    domain: 'https://myorg.atlassian.net',
    apiToken: process.env.JIRA_API_TOKEN,
  },
  knowledgeBase: [
    { type: 'Confluence', url: 'https://myorg.atlassian.net/wiki/spaces/ARCH' },
    { type: 'SupportFolder', path: './docs/support/' },
  ],
  guardrails: {
    maxTokensPerRun: 50000,
    maxCostUsd: 1.50,
    alertEmailAddress: 'devops-alerts@myorg.com',
  },
});

// Run loop-engineered RCA & auto-repair with isolated worktree
await rcaSuite.runAutoFixLoop({
  bugId: 'BUG-409',
  maxIterations: 3,
  createDraftPR: true,
});`;

  const githubActionYaml = `name: AutoRCA Automated Bug Fix Loop
on:
  issues:
    types: [labeled]

jobs:
  autorca_fix_loop:
    if: \${{ github.event.label.name == 'auto-rca-repair' }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Run AutoRCA Sub-Agent Suite
        uses: autorca/suite-action@v1
        with:
          bug_id: \${{ github.event.issue.number }}
          llm_provider: 'gemini-2.5-pro'
          gemini_api_key: \${{ secrets.GEMINI_API_KEY }}
          alert_email: 'security-team@myorg.com'
          auto_pr_draft: true`;

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              <span>Open Source Library Export — @autorca/suite</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Integrate this autonomous loop engineering framework directly into your codebase, CI/CD pipelines, or microservices.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
            v1.2.0 Stable
          </span>
        </div>

        {/* NPM Command */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700 uppercase">1. Package Installation</span>
            <button
              onClick={() => handleCopy('npm', npmInstallCmd)}
              className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {copiedSection === 'npm' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Command</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono border border-slate-800 overflow-x-auto">
            {npmInstallCmd}
          </pre>
        </div>

        {/* Node.js SDK Usage */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700 uppercase">
              2. Programmatic Node.js / TypeScript SDK Usage
            </span>
            <button
              onClick={() => handleCopy('sdk', nodeExampleCode)}
              className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {copiedSection === 'sdk' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied Snippet</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono border border-slate-800 overflow-x-auto leading-relaxed">
            {nodeExampleCode}
          </pre>
        </div>

        {/* GitHub Actions YAML */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700 uppercase">
              3. Automated GitHub Actions Worktree &amp; Draft PR Workflow
            </span>
            <button
              onClick={() => handleCopy('github', githubActionYaml)}
              className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {copiedSection === 'github' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied Workflow</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy YAML</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono border border-slate-800 overflow-x-auto leading-relaxed">
            {githubActionYaml}
          </pre>
        </div>
      </div>
    </div>
  );
};
