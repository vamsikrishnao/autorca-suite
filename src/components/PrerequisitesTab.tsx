import React, { useState } from 'react';
import {
  Database,
  Globe,
  FileText,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  KnowledgeSource,
  TrackerConfig,
  BugPlatform,
  BugItem,
} from '../types';
import { SAMPLE_CSV_TEMPLATE } from '../data/defaultConfig';

interface PrerequisitesTabProps {
  knowledgeSources: KnowledgeSource[];
  onAddKnowledgeSource: (source: KnowledgeSource) => void;
  onRemoveKnowledgeSource: (id: string) => void;
  trackerConfig: TrackerConfig;
  onUpdateTrackerConfig: (config: TrackerConfig) => void;
  onImportCsvBugs: (bugs: BugItem[]) => void;
}

export const PrerequisitesTab: React.FC<PrerequisitesTabProps> = ({
  knowledgeSources,
  onAddKnowledgeSource,
  onRemoveKnowledgeSource,
  trackerConfig,
  onUpdateTrackerConfig,
  onImportCsvBugs,
}) => {
  // New KB source state
  const [newType, setNewType] = useState<KnowledgeSource['type']>('Confluence');
  const [newName, setNewName] = useState('');
  const [newUrlOrFilename, setNewUrlOrFilename] = useState('');
  const [newSnippet, setNewSnippet] = useState('');

  // Validation states
  const [isValidatingKb, setIsValidatingKb] = useState(false);
  const [kbValidationError, setKbValidationError] = useState<string | null>(null);
  const [isValidatingTracker, setIsValidatingTracker] = useState(false);
  const [trackerValidationMsg, setTrackerValidationMsg] = useState<{
    success: boolean;
    text: string;
  } | null>(null);

  // CSV importer state
  const [csvText, setCsvText] = useState(SAMPLE_CSV_TEMPLATE);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const handleAddKb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrlOrFilename.trim()) return;

    setIsValidatingKb(true);
    setKbValidationError(null);

    try {
      const res = await fetch('/api/connectors/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newType,
          url: newUrlOrFilename,
          name: newName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setKbValidationError(
          data.error || 'Authentication & URL validation failed for endpoint.'
        );
        setIsValidatingKb(false);
        return;
      }

      const source: KnowledgeSource = {
        id: `kb-${Date.now()}`,
        type: newType,
        name: newName,
        urlOrFilename: newUrlOrFilename,
        contentSnippet:
          newSnippet || 'No custom embedding snippet provided. System will index URL automatically.',
        lastIndexed: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Connected',
      };

      onAddKnowledgeSource(source);
      setNewName('');
      setNewUrlOrFilename('');
      setNewSnippet('');
    } catch (err: any) {
      setKbValidationError('Network Error: Could not reach backend authenticator.');
    } finally {
      setIsValidatingKb(false);
    }
  };

  const handleTestBugTracker = async () => {
    setIsValidatingTracker(true);
    setTrackerValidationMsg(null);

    try {
      const res = await fetch('/api/connectors/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: trackerConfig.platform,
          baseUrl: trackerConfig.baseUrl,
          apiKeyOrToken: trackerConfig.apiKeyOrToken,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setTrackerValidationMsg({
          success: false,
          text: data.error || 'Tracker authentication & URL validation failed.',
        });
      } else {
        setTrackerValidationMsg({
          success: true,
          text: data.details || 'Successfully authenticated tracker API & token!',
        });
      }
    } catch (err: any) {
      setTrackerValidationMsg({
        success: false,
        text: 'Network Error: Failed to contact backend authentication endpoint.',
      });
    } finally {
      setIsValidatingTracker(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType: KnowledgeSource['type'] = file.name.endsWith('.json')
      ? 'JSON KB'
      : file.name.endsWith('.pdf')
      ? 'PDF Document'
      : 'Support Article';

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const snippet = content ? content.slice(0, 200) + '...' : 'Indexed file contents';
      const source: KnowledgeSource = {
        id: `file-${Date.now()}`,
        type: fileType,
        name: `Uploaded File: ${file.name}`,
        urlOrFilename: `local/${file.name}`,
        contentSnippet: snippet,
        lastIndexed: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Indexed',
      };
      onAddKnowledgeSource(source);
    };
    reader.readAsText(file);
  };

  const handleDownloadCsvTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'autorca_bug_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleParseCsv = () => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        setImportMessage('Error: CSV must contain header and at least 1 row.');
        return;
      }
      const newBugs: BugItem[] = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        // Simple regex parse for quoted CSV cells
        const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(',');
        if (matches.length >= 7) {
          const clean = (val: string) => val.replace(/^"|"$/g, '').trim();
          newBugs.push({
            id: clean(matches[0] || `CSV-${100 + i}`),
            title: clean(matches[1] || 'Imported CSV Bug'),
            description: clean(matches[2] || 'No description provided'),
            stackTrace: clean(matches[3] || 'Error in execution'),
            platform: 'CSV Upload',
            severity: (clean(matches[5]) as any) || 'High',
            status: 'Open',
            assignee: 'CSV Importer',
            createdAt: new Date().toISOString(),
            repoPath: clean(matches[6] || 'src/main.ts'),
            affectedFiles: (clean(matches[7] || '')).split(';').filter(Boolean),
          });
        }
      }
      onImportCsvBugs(newBugs);
      setImportMessage(`Successfully imported ${newBugs.length} bugs from predetermined CSV format!`);
      setTimeout(() => setImportMessage(null), 4000);
    } catch (err: any) {
      setImportMessage(`CSV Parse error: ${err.message}`);
    }
  };

  const platforms: BugPlatform[] = ['Jira', 'Freshrelease', 'Zoho Sprints', 'CSV Upload'];

  const handlePlatformSelect = (plat: BugPlatform) => {
    let newBaseUrl = trackerConfig.baseUrl;
    let newProjectKey = trackerConfig.projectKey;
    let newSearchUrl = trackerConfig.searchUrl || '';

    if (plat === 'Jira') {
      newBaseUrl = 'https://myorg.atlassian.net';
      newProjectKey = 'AUTORCA';
      newSearchUrl = 'https://myorg.atlassian.net/rest/api/3/search?jql=project=AUTORCA+AND+status=Open';
    } else if (plat === 'Freshrelease') {
      newBaseUrl = 'https://mycompany.freshrelease.com/api/v1';
      newProjectKey = 'FR';
      newSearchUrl = 'https://mycompany.freshrelease.com/api/v1/issues?query=status:Open';
    } else if (plat === 'Zoho Sprints') {
      newBaseUrl = 'https://sprintsapi.zoho.com/rest/ownerid/projects';
      newProjectKey = 'ZOHO';
      newSearchUrl = 'https://sprintsapi.zoho.com/rest/ownerid/projects/search?status=Open';
    } else if (plat === 'CSV Upload') {
      newBaseUrl = '';
      newProjectKey = '';
      newSearchUrl = '';
    }

    onUpdateTrackerConfig({
      ...trackerConfig,
      platform: plat,
      baseUrl: newBaseUrl,
      projectKey: newProjectKey,
      searchUrl: newSearchUrl,
    });
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* SECTION 1: Knowledge Base Prerequisites */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <span>Knowledge Base Connectors &amp; Custom Input Files</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Connect Confluence URLs, Support article folders, custom PDF documents, or JSON rules for Sub-Agent RAG grounding.
            </p>
          </div>
          <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-bold cursor-pointer shadow-xs transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF / JSON KB</span>
            <input
              type="file"
              accept=".pdf,.json,.txt,.md"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Existing Knowledge Sources Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Source Type</th>
                <th className="p-3">Name &amp; Identifier</th>
                <th className="p-3">URL / File Path</th>
                <th className="p-3">Indexed Content Snippet</th>
                <th className="p-3 text-right">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {knowledgeSources.map((source) => (
                <tr key={source.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 font-semibold">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-[11px]">
                      <Globe className="w-3 h-3" />
                      {source.type}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-800">{source.name}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-500 max-w-xs truncate">
                    {source.urlOrFilename}
                  </td>
                  <td className="p-3 text-slate-600 max-w-sm truncate italic">
                    "{source.contentSnippet}"
                  </td>
                  <td className="p-3 text-right">
                    {source.status === 'Not Connected' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-300">
                        <AlertCircle className="w-3 h-3 text-slate-500" />
                        Not Connected
                      </span>
                    ) : source.status === 'Connection Error' || source.status === 'Error' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-sm border border-rose-200">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        Connection Error
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {source.status}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onRemoveKnowledgeSource(source.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add new KB URL Form */}
        <form onSubmit={handleAddKb} className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Add Knowledge Base URL / Support Article Folder</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                KB Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full p-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Confluence">Confluence URL</option>
                <option value="Support Article">Support Article Folder URL</option>
                <option value="PDF Document">PDF Document URL</option>
                <option value="JSON KB">JSON KB Rule URL</option>
                <option value="GitHub Wiki">GitHub Wiki</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Source Title
              </label>
              <input
                type="text"
                placeholder="e.g. Confluence: Concurrency Locking Rules"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                URL / Folder Path
              </label>
              <input
                type="text"
                placeholder="https://confluence.company.internal/docs/..."
                value={newUrlOrFilename}
                onChange={(e) => setNewUrlOrFilename(e.target.value)}
                className="w-full p-2 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Guardrail Rule Snippet
              </label>
              <input
                type="text"
                placeholder="e.g. Use double-checked locking..."
                value={newSnippet}
                onChange={(e) => setNewSnippet(e.target.value)}
                className="w-full p-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          {kbValidationError && (
            <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{kbValidationError}</span>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 italic">
              * Validates URL syntax and Atlassian/GitHub domain hostname
            </span>
            <button
              type="submit"
              disabled={isValidatingKb}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-md text-xs font-bold transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isValidatingKb ? 'Authenticating & Validating...' : 'Connect & Validate Source'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: Bug Tracker Platform & RCA Note Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bug Tracker Config */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              <span>Bug Tracker Platform Integration</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your platform (Jira, Freshrelease, Zoho Sprints, or predetermined CSV format).
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Active Bug Tracker Platform
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {platforms.map((plat) => (
                  <button
                    key={plat}
                    onClick={() => handlePlatformSelect(plat)}
                    className={`px-3 py-2 rounded-md text-xs font-bold transition-all border ${
                      trackerConfig.platform === plat
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            {trackerConfig.platform === 'CSV Upload' ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                    <span>CSV Bug File Import (No API credentials required)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadCsvTemplate}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-white px-2.5 py-1 rounded border border-indigo-200 hover:bg-indigo-50"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download CSV Template</span>
                  </button>
                </div>
                <p className="text-xs text-slate-600">
                  Upload a <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">.csv</code> file or use the CSV Bug Importer below. Required columns: <span className="font-mono text-xs">id, title, description, stackTrace, platform, severity, repoPath, affectedFiles</span>.
                </p>
                <div className="pt-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-md cursor-pointer transition-colors shadow-xs">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Upload & Parse .csv File...</span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const r = new FileReader();
                        r.onload = (ev) => {
                          const text = ev.target?.result as string;
                          if (text) {
                            setCsvText(text);
                            setTimeout(handleParseCsv, 100);
                          }
                        };
                        r.readAsText(f);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Base Tracker API URL
                  </label>
                  <input
                    type="text"
                    value={trackerConfig.baseUrl}
                    onChange={(e) =>
                      onUpdateTrackerConfig({ ...trackerConfig, baseUrl: e.target.value })
                    }
                    placeholder={
                      trackerConfig.platform === 'Freshrelease'
                        ? 'https://mycompany.freshrelease.com/api/v1'
                        : trackerConfig.platform === 'Zoho Sprints'
                        ? 'https://sprintsapi.zoho.com/rest/ownerid/projects'
                        : 'https://myorg.atlassian.net'
                    }
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Search / Query Endpoint URL (Used for searching issues in loop workbench)
                  </label>
                  <input
                    type="text"
                    value={trackerConfig.searchUrl || ''}
                    onChange={(e) =>
                      onUpdateTrackerConfig({ ...trackerConfig, searchUrl: e.target.value })
                    }
                    placeholder={
                      trackerConfig.platform === 'Freshrelease'
                        ? 'https://mycompany.freshrelease.com/api/v1/issues?query=status:Open'
                        : trackerConfig.platform === 'Zoho Sprints'
                        ? 'https://sprintsapi.zoho.com/rest/ownerid/projects/search?status=Open'
                        : 'https://myorg.atlassian.net/rest/api/3/search?jql=project=AUTORCA+AND+status=Open'
                    }
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Custom query endpoint called when searching target bugs in the engineering loop workbench.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Project Key / Prefix
                    </label>
                    <input
                      type="text"
                      value={trackerConfig.projectKey}
                      onChange={(e) =>
                        onUpdateTrackerConfig({ ...trackerConfig, projectKey: e.target.value })
                      }
                      placeholder={
                        trackerConfig.platform === 'Freshrelease'
                          ? 'FR'
                          : trackerConfig.platform === 'Zoho Sprints'
                          ? 'ZOHO'
                          : 'AUTORCA'
                      }
                      className="w-full p-2 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      API Token / PAT
                    </label>
                    <input
                      type="password"
                      value={trackerConfig.apiKeyOrToken}
                      onChange={(e) =>
                        onUpdateTrackerConfig({ ...trackerConfig, apiKeyOrToken: e.target.value })
                      }
                      placeholder="Enter platform API key or PAT..."
                      className="w-full p-2 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestBugTracker}
                      disabled={isValidatingTracker}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white rounded-md text-xs font-bold transition-colors shadow-xs"
                    >
                      {isValidatingTracker ? 'Authenticating...' : 'Test Connection & Validate Token'}
                    </button>
                    {trackerValidationMsg && (
                      <span
                        className={`text-xs font-semibold ${
                          trackerValidationMsg.success ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {trackerValidationMsg.text}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="pt-2 space-y-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trackerConfig.autoPostNote}
                  onChange={(e) =>
                    onUpdateTrackerConfig({ ...trackerConfig, autoPostNote: e.target.checked })
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  Automatically post RCA analysis note inside same bug tracker ticket upon loop completion
                </span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-indigo-700 cursor-pointer bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100">
                <input
                  type="checkbox"
                  checked={!!trackerConfig.useManualInput}
                  onChange={(e) =>
                    onUpdateTrackerConfig({ ...trackerConfig, useManualInput: e.target.checked })
                  }
                  className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  Enable Manual Input (Choose Custom Issue Subject & Description for Auto RCA)
                </span>
              </label>

              {trackerConfig.useManualInput && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase">
                    Default Custom Issue Configuration
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Issue Subject / Title
                    </label>
                    <input
                      type="text"
                      value={trackerConfig.manualIssue?.title || ''}
                      onChange={(e) =>
                        onUpdateTrackerConfig({
                          ...trackerConfig,
                          manualIssue: {
                            ...(trackerConfig.manualIssue || {
                              title: '',
                              description: '',
                              stackTrace: '',
                            }),
                            title: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Unhandled NullPointerException in payment service"
                      className="w-full p-2 text-xs bg-white border border-slate-300 rounded-md font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Issue Description
                    </label>
                    <textarea
                      rows={2}
                      value={trackerConfig.manualIssue?.description || ''}
                      onChange={(e) =>
                        onUpdateTrackerConfig({
                          ...trackerConfig,
                          manualIssue: {
                            ...(trackerConfig.manualIssue || {
                              title: '',
                              description: '',
                              stackTrace: '',
                            }),
                            description: e.target.value,
                          },
                        })
                      }
                      placeholder="Describe the bug behavior..."
                      className="w-full p-2 text-xs bg-white border border-slate-300 rounded-md font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Stack Trace / Log Snippet
                    </label>
                    <textarea
                      rows={2}
                      value={trackerConfig.manualIssue?.stackTrace || ''}
                      onChange={(e) =>
                        onUpdateTrackerConfig({
                          ...trackerConfig,
                          manualIssue: {
                            ...(trackerConfig.manualIssue || {
                              title: '',
                              description: '',
                              stackTrace: '',
                            }),
                            stackTrace: e.target.value,
                          },
                        })
                      }
                      placeholder="Paste error stack trace..."
                      className="w-full p-2 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RCA Note Template Editor */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>RCA Analysis Note Template</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Format string posted directly into Jira / Freshrelease / Zoho Sprints comment thread.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Markdown Note Template (with Mustache placeholders)
            </label>
            <textarea
              rows={8}
              value={trackerConfig.rcaNoteTemplate}
              onChange={(e) =>
                onUpdateTrackerConfig({ ...trackerConfig, rcaNoteTemplate: e.target.value })
              }
              className="w-full p-3 text-xs bg-slate-900 text-slate-200 font-mono rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-500 font-mono">
              <span className="px-2 py-0.5 bg-slate-100 rounded-sm">{'{{rootCauseSummary}}'}</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded-sm">{'{{technicalDetails}}'}</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded-sm">{'{{kbReferences}}'}</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded-sm">{'{{remediationSteps}}'}</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded-sm">{'{{iterations}}'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: CSV Bug Importer in predetermined format */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <span>Predetermined CSV Format Bug Importer</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload or paste CSV bugs in the standard schema: <code className="font-mono text-[11px] text-indigo-700">id,title,description,stackTrace,platform,severity,repoPath,affectedFiles</code>
            </p>
          </div>
          <button
            onClick={handleDownloadCsvTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Template</span>
          </button>
        </div>

        <div>
          <textarea
            rows={5}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full p-3 text-xs font-mono bg-slate-900 text-slate-200 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="mt-3 flex items-center justify-between">
            {importMessage ? (
              <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-200">
                {importMessage}
              </div>
            ) : (
              <span className="text-xs text-slate-400">
                Paste CSV data or edit above to import custom test cases into the loop workbench.
              </span>
            )}
            <button
              onClick={handleParseCsv}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md shadow-xs transition-colors"
            >
              Import CSV Bugs to Workbench
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
