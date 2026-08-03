import React, { useState } from 'react';
import { BookOpen, FileText, Code2, Save, Check, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { AgentsMdDoc, SkillsMdDoc } from '../types';

interface FrameworkTabProps {
  agentsMd: AgentsMdDoc;
  onUpdateAgentsMd: (doc: AgentsMdDoc) => void;
  skillsMd: SkillsMdDoc;
  onUpdateSkillsMd: (doc: SkillsMdDoc) => void;
}

export const FrameworkTab: React.FC<FrameworkTabProps> = ({
  agentsMd,
  onUpdateAgentsMd,
  skillsMd,
  onUpdateSkillsMd,
}) => {
  const [activeDoc, setActiveDoc] = useState<'AGENTS_MD' | 'SKILLS_MD'>('AGENTS_MD');
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Top Explanation Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight">
                3. Loop Engineering Framework Docs — AGENTS.md &amp; SKILLS.md
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure standard repository agent rules, architectural boundaries, and specialized sub-agent tool skills.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveDoc('AGENTS_MD')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                activeDoc === 'AGENTS_MD'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              AGENTS.md (Operating Manifesto)
            </button>
            <button
              onClick={() => setActiveDoc('SKILLS_MD')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                activeDoc === 'SKILLS_MD'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              SKILLS.md (Sub-Agent Capabilities)
            </button>
          </div>
        </div>

        {/* Editor for Active Doc */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase font-mono">
                {activeDoc === 'AGENTS_MD' ? agentsMd.title : skillsMd.title}
              </h3>
              <p className="text-[11px] text-slate-500">
                {activeDoc === 'AGENTS_MD' ? agentsMd.description : skillsMd.description}
              </p>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md shadow-xs transition-colors"
            >
              {savedMessage ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Saved &amp; Active!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Documentation</span>
                </>
              )}
            </button>
          </div>

          <textarea
            rows={18}
            value={activeDoc === 'AGENTS_MD' ? agentsMd.content : skillsMd.content}
            onChange={(e) => {
              if (activeDoc === 'AGENTS_MD') {
                onUpdateAgentsMd({ ...agentsMd, content: e.target.value });
              } else {
                onUpdateSkillsMd({ ...skillsMd, content: e.target.value });
              }
            }}
            className="w-full p-4 text-xs font-mono bg-slate-900 text-slate-200 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
        </div>
      </div>

      {/* Overview of How Sub-Agents Use AGENTS.md & SKILLS.md */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Why AGENTS.md matters in Loop Engineering</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            When an AI sub-agent operates inside an ephemeral worktree, it reads <strong className="font-mono">AGENTS.md</strong> before synthesizing any fix. This enforces non-destructive SQL rules, prevents formatting churn on untouched lines, and establishes your team's code review standard.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Sub-Agent Tool Calling via SKILLS.md</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="font-mono">SKILLS.md</strong> partitions the workbench into 6 dedicated roles (RCA Analyst, KB Retriever, Code Repair Specialist, Harness Verifier, CI Coordinator, and Guardrail Auditor), each restricted to clean tool interfaces.
          </p>
        </div>
      </div>
    </div>
  );
};
