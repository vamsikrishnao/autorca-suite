import React from 'react';
import {
  ShieldAlert,
  Cpu,
  Mail,
  AlertTriangle,
  Lock,
  Globe,
  Sliders,
  DollarSign,
  RefreshCw,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { ModelConfig, GuardrailConfig, LogEntry } from '../types';

interface GuardrailsTabProps {
  modelConfig: ModelConfig;
  onUpdateModelConfig: (config: ModelConfig) => void;
  guardrailConfig: GuardrailConfig;
  onUpdateGuardrailConfig: (config: GuardrailConfig) => void;
  totalTokensBurnt: number;
  totalCostUsd: number;
  logs: LogEntry[];
  onTestEmailAlert: () => void;
}

export const GuardrailsTab: React.FC<GuardrailsTabProps> = ({
  modelConfig,
  onUpdateModelConfig,
  guardrailConfig,
  onUpdateGuardrailConfig,
  totalTokensBurnt,
  totalCostUsd,
  logs,
  onTestEmailAlert,
}) => {
  const modelOptions = [
    { provider: 'Gemini' as const, id: 'gemini-2.5-pro', desc: 'Google DeepMind High-Reasoning Flagship' },
    { provider: 'Gemini' as const, id: 'gemini-2.5-flash', desc: 'Fast, low-latency code fix synthesis' },
    { provider: 'Custom OpenAI' as const, id: 'gpt-4o', desc: 'OpenAI custom endpoint integration' },
    { provider: 'Custom Anthropic' as const, id: 'claude-3-5-sonnet', desc: 'Anthropic custom endpoint' },
    { provider: 'Custom Local LLM' as const, id: 'custom-local-model', desc: 'Self-hosted Ollama / vLLM server' },
  ];

  const tokenPercentage = Math.min(
    100,
    Math.round((totalTokensBurnt / guardrailConfig.maxTokensPerRun) * 100)
  );

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* SECTION 1: Configurable Model Selection & Custom Endpoint Option */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <span>5. Configurable Model Selection &amp; Custom LLM Options</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select standard Gemini flagship models or connect custom OpenAI / Anthropic / Local LLM endpoints.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
            Active: {modelConfig.modelId}
          </span>
        </div>

        {/* Model Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {modelOptions.map((opt) => {
            const isSelected =
              modelConfig.provider === opt.provider && modelConfig.modelId === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() =>
                  onUpdateModelConfig({
                    ...modelConfig,
                    provider: opt.provider,
                    modelId: opt.id,
                  })
                }
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">{opt.id}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase ${
                      opt.provider === 'Gemini'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {opt.provider}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Custom Endpoint Input Fields */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
            <span>Custom Endpoint Configuration (For Self-Hosted / Custom Providers)</span>
            <span className="text-[10px] text-slate-400 font-normal lowercase">
              (Optional override)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Custom Endpoint URL
              </label>
              <input
                type="text"
                value={modelConfig.customEndpointUrl || ''}
                onChange={(e) =>
                  onUpdateModelConfig({ ...modelConfig, customEndpointUrl: e.target.value })
                }
                placeholder="https://my-custom-llm-proxy.internal/v1"
                className="w-full p-2 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Custom API Key / Bearer Token
              </label>
              <input
                type="password"
                value={modelConfig.customApiKey || ''}
                onChange={(e) =>
                  onUpdateModelConfig({ ...modelConfig, customApiKey: e.target.value })
                }
                placeholder="custom-secret-key-************"
                className="w-full p-2 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Temperature ({modelConfig.temperature})
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={modelConfig.temperature}
                onChange={(e) =>
                  onUpdateModelConfig({
                    ...modelConfig,
                    temperature: parseFloat(e.target.value),
                  })
                }
                className="w-full mt-1.5 accent-indigo-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Configurable Guardrails & Email Mailbox Alerts */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>6. Configurable Guardrails, Token Limits &amp; Email Mailbox Alerting</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Defines hard boundaries for loop iterations, cumulative token burn, USD cost, and mailbox alert dispatch.
            </p>
          </div>
          <button
            onClick={onTestEmailAlert}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs transition-colors shadow-xs"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Test Email Alert</span>
          </button>
        </div>

        {/* Live Token & Cost Meter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-slate-900 text-white border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Cumulative Tokens Burnt
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono">
                {totalTokensBurnt.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {guardrailConfig.maxTokensPerRun.toLocaleString()} max
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  tokenPercentage > 80 ? 'bg-rose-500' : 'bg-cyan-400'
                }`}
                style={{ width: `${tokenPercentage}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-900 text-white border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Estimated Total USD Cost
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-emerald-400">
                ${totalCostUsd.toFixed(4)}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / ${guardrailConfig.maxCostUsd.toFixed(2)} limit
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Based on input/output token pricing for {modelConfig.modelId}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900 text-white border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Max Loop Iterations Limit
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-indigo-400">
                {guardrailConfig.maxLoopIterations} Iterations
              </span>
              <span className="text-xs text-slate-400">Auto-stop</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Prevents runaway infinite loops on complex failing tests
            </p>
          </div>
        </div>

        {/* Configurable Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Configurable Alert Email Mailbox
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={guardrailConfig.alertEmailAddress}
                  onChange={(e) =>
                    onUpdateGuardrailConfig({
                      ...guardrailConfig,
                      alertEmailAddress: e.target.value,
                    })
                  }
                  placeholder="devops-alerts@company.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                When token limits or iteration boundaries are reached, an email is dispatched to this mailbox automatically.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Max Tokens Per Run
                </label>
                <input
                  type="number"
                  step="1000"
                  value={guardrailConfig.maxTokensPerRun}
                  onChange={(e) =>
                    onUpdateGuardrailConfig({
                      ...guardrailConfig,
                      maxTokensPerRun: parseInt(e.target.value) || 10000,
                    })
                  }
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Max Loop Iterations
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={guardrailConfig.maxLoopIterations}
                  onChange={(e) =>
                    onUpdateGuardrailConfig({
                      ...guardrailConfig,
                      maxLoopIterations: parseInt(e.target.value) || 3,
                    })
                  }
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={guardrailConfig.autoSendEmailOnLimit}
                onChange={(e) =>
                  onUpdateGuardrailConfig({
                    ...guardrailConfig,
                    autoSendEmailOnLimit: e.target.checked,
                  })
                }
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Automatically prompt/send email when token limit is exceeded</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={guardrailConfig.preventDestructiveSQL}
                onChange={(e) =>
                  onUpdateGuardrailConfig({
                    ...guardrailConfig,
                    preventDestructiveSQL: e.target.checked,
                  })
                }
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Block destructive SQL or shell commands (DROP, TRUNCATE, rm -rf)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={guardrailConfig.requireTestHarnessPass}
                onChange={(e) =>
                  onUpdateGuardrailConfig({
                    ...guardrailConfig,
                    requireTestHarnessPass: e.target.checked,
                  })
                }
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Require Test Harness pass (exit code 0) before opening PR</span>
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 3: Detailed Logging for Every Action Taken & Tokens Burnt */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg text-slate-300">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase font-mono">
              7 &amp; 8. Detailed Action Logging &amp; Token Burn Audit Trail
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {logs.length} logged actions recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] border-b border-slate-700">
              <tr>
                <th className="p-2.5">Time</th>
                <th className="p-2.5">Sub-Agent Role</th>
                <th className="p-2.5">Action</th>
                <th className="p-2.5">Message / Description</th>
                <th className="p-2.5 text-right">Tokens Burnt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-2.5 text-slate-500">{log.timestamp}</td>
                  <td className="p-2.5 font-bold text-indigo-400">{log.subAgent}</td>
                  <td className="p-2.5 font-semibold text-slate-300">{log.action}</td>
                  <td className="p-2.5 text-slate-300">{log.message}</td>
                  <td className="p-2.5 text-right font-bold text-amber-400">
                    {log.tokensBurnt.total > 0 ? `+${log.tokensBurnt.total}` : '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
