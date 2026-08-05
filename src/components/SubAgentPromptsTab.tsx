import React, { useState } from 'react';
import {
  Bot,
  Edit3,
  RotateCcw,
  Save,
  CheckCircle2,
  Sparkles,
  Sliders,
  Terminal,
  Clock,
  UserCheck,
  Tag,
  Code2,
  FileCode,
  Shield,
  Search,
  Wrench,
  GitPullRequest,
  ShieldAlert,
} from 'lucide-react';
import { defaultAgentPrompts, SubAgentPromptDefinition } from '../prompts/agentSystemPrompts';

export function SubAgentPromptsTab() {
  const [prompts, setPrompts] = useState<Record<string, SubAgentPromptDefinition>>(defaultAgentPrompts);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('rca_analyst');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedPrompt, setEditedPrompt] = useState<string>(prompts['rca_analyst'].systemPrompt);
  const [editedTemp, setEditedTemp] = useState<number>(prompts['rca_analyst'].temperature);
  const [editedVersion, setEditedVersion] = useState<string>(prompts['rca_analyst'].version);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const currentAgent = prompts[selectedAgentId] || prompts['rca_analyst'];

  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'rca_analyst':
        return <Search className="w-5 h-5 text-indigo-600" />;
      case 'kb_retriever':
        return <FileCode className="w-5 h-5 text-cyan-600" />;
      case 'code_repair':
        return <Wrench className="w-5 h-5 text-emerald-600" />;
      case 'harness_verifier':
        return <Shield className="w-5 h-5 text-amber-600" />;
      case 'ci_coordinator':
        return <GitPullRequest className="w-5 h-5 text-purple-600" />;
      case 'guardrail_auditor':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      default:
        return <Bot className="w-5 h-5 text-indigo-600" />;
    }
  };

  const handleSelectAgent = (id: string) => {
    setSelectedAgentId(id);
    setIsEditing(false);
    setEditedPrompt(prompts[id].systemPrompt);
    setEditedTemp(prompts[id].temperature);
    setEditedVersion(prompts[id].version);
    setSaveSuccessMsg(null);
  };

  const handleSavePrompt = () => {
    const today = new Date().toISOString().split('T')[0];
    const updated: SubAgentPromptDefinition = {
      ...currentAgent,
      systemPrompt: editedPrompt,
      temperature: editedTemp,
      version: editedVersion,
      lastUpdated: today,
      updatedBy: 'Lead Team Architect',
    };

    setPrompts((prev) => ({ ...prev, [selectedAgentId]: updated }));
    setIsEditing(false);
    setSaveSuccessMsg(`Successfully saved & version-controlled prompt v${editedVersion} for ${currentAgent.name}`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleResetToDefault = () => {
    const original = defaultAgentPrompts[selectedAgentId];
    if (original) {
      setPrompts((prev) => ({ ...prev, [selectedAgentId]: original }));
      setEditedPrompt(original.systemPrompt);
      setEditedTemp(original.temperature);
      setEditedVersion(original.version);
      setIsEditing(false);
      setSaveSuccessMsg(`Reset ${original.name} system prompt to factory default v${original.version}`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  // Sample variable substitution preview
  const getSubstitutedPreview = (promptText: string) => {
    return promptText
      .replace(/{{bug_id}}/g, 'JIRA-4892')
      .replace(/{{bug_title}}/g, 'NullPointerException in Payment Gateway Handler')
      .replace(/{{stack_trace}}/g, 'at com.acme.payment.WebhookHandler.process(WebhookHandler.java:142)')
      .replace(/{{error_logs}}/g, 'ERROR: Null currency parameter in stripe payload')
      .replace(/{{tenant_id}}/g, 'org-acme-corp')
      .replace(/{{rca_cause}}/g, 'Missing null-check on event.data.object.currency')
      .replace(/{{confluence_urls}}/g, 'https://confluence.acme.internal/display/ARCH/Stripe+Webhook+Safety')
      .replace(/{{support_docs}}/g, 'post-mortem-2025-stripe-nulls.pdf')
      .replace(/{{max_chunks}}/g, '3')
      .replace(/{{source_file}}/g, 'src/main/java/com/acme/payment/WebhookHandler.java')
      .replace(/{{faulty_code}}/g, 'String curr = event.getData().getCurrency().toUpperCase();')
      .replace(/{{fix_strategy}}/g, 'Safely wrap currency retrieval with Optional.ofNullable()')
      .replace(/{{repo_branch}}/g, 'autorca/jira-4892-stripe-null-fix')
      .replace(/{{patch_diff}}/g, 'diff --git a/WebhookHandler.java b/WebhookHandler.java...')
      .replace(/{{test_command}}/g, 'mvn test -Dtest=WebhookHandlerTest')
      .replace(/{{sandbox_type}}/g, 'Firecracker MicroVM Sandbox')
      .replace(/{{timeout_seconds}}/g, '300')
      .replace(/{{test_output}}/g, 'Tests run: 14, Failures: 0, Errors: 0, Elapsed time: 3.41s')
      .replace(/{{git_repo}}/g, 'acme-org/payment-service')
      .replace(/{{pr_branch}}/g, 'autorca/jira-4892-stripe-null-fix')
      .replace(/{{max_tokens}}/g, '500000')
      .replace(/{{max_iterations}}/g, '10')
      .replace(/{{current_tokens}}/g, '42890')
      .replace(/{{current_cost}}/g, '$0.137')
      .replace(/{{alert_email}}/g, 'engineering-alerts@acme.corp');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight">
              Interactive Sub-Agent Prompt Tuning &amp; Version Customizer
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            View, edit, version-control, and tune system prompt rules and behavioral guardrails for all 6 specialized AutoRCA swarm agents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
            6 Active Agent Prompts
          </span>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-mono font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Agent Selector Sidebar + Editor Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: 6 Agents Selector */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-600" />
            <span>Swarm Sub-Agents</span>
          </h3>

          <div className="space-y-1.5">
            {(Object.values(prompts) as SubAgentPromptDefinition[]).map((agent) => {
              const isSelected = agent.id === selectedAgentId;
              return (
                <button
                  key={agent.id}
                  onClick={() => handleSelectAgent(agent.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="p-2 rounded-md bg-white shadow-2xs border border-slate-200 shrink-0">
                    {getAgentIcon(agent.id)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate">{agent.name}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-indigo-500/30 text-indigo-200 font-bold' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        v{agent.version}
                      </span>
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {agent.role}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Prompt Editor & Live Preview */}
        <div className="lg:col-span-8 space-y-6">
          {/* Agent Overview Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                  {getAgentIcon(currentAgent.id)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{currentAgent.name}</h3>
                  <p className="text-xs text-slate-500">{currentAgent.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Factory Default</span>
                </button>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit System Prompt</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSavePrompt}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save &amp; Bump Version</span>
                  </button>
                )}
              </div>
            </div>

            {/* Metadata & Controls Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  Prompt Version:
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedVersion}
                    onChange={(e) => setEditedVersion(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs font-bold text-slate-800"
                  />
                ) : (
                  <span className="font-mono font-bold text-slate-800 block">v{currentAgent.version}</span>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  Temperature (0.0 - 1.0):
                </span>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={editedTemp}
                    onChange={(e) => setEditedTemp(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs font-bold text-slate-800"
                  />
                ) : (
                  <span className="font-mono font-bold text-slate-800 block">{currentAgent.temperature}</span>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Last Modified:
                </span>
                <span className="font-mono text-slate-800 block">
                  {currentAgent.lastUpdated} ({currentAgent.updatedBy})
                </span>
              </div>
            </div>

            {/* Template Variables Schema */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-600" />
                <span>Supported Template Variables:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentAgent.variables.map((v) => (
                  <span
                    key={v}
                    className="px-2 py-1 bg-slate-100 text-indigo-800 font-mono text-xs border border-slate-200 rounded-md font-bold"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {/* System Prompt Code Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-indigo-600" />
                  <span>Exact System Prompt Instructions:</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {isEditing ? 'Editing Mode Active' : 'Read-Only Mode'}
                </span>
              </div>

              {isEditing ? (
                <textarea
                  rows={14}
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  className="w-full p-4 bg-slate-950 text-indigo-200 font-mono text-xs leading-relaxed rounded-xl border border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <pre className="p-4 bg-slate-950 text-indigo-200 font-mono text-xs leading-relaxed rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap max-h-96">
                  {currentAgent.systemPrompt}
                </pre>
              )}
            </div>
          </div>

          {/* Rendered Variable Substitution Live Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md text-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Live Evaluated Prompt Preview (With Injected Context)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                Context Bound
              </span>
            </div>
            <pre className="p-4 bg-slate-950 text-emerald-300/90 font-mono text-[11px] leading-relaxed rounded-lg border border-slate-800 whitespace-pre-wrap max-h-72 overflow-y-auto">
              {getSubstitutedPreview(isEditing ? editedPrompt : currentAgent.systemPrompt)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
