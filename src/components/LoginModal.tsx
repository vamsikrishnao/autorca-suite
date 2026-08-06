import React, { useState } from 'react';
import {
  ShieldCheck,
  Github,
  Mail,
  Building2,
  Lock,
  LogOut,
  User,
  GitBranch,
  FolderGit2,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';

export interface UserSessionData {
  sessionId: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    provider: 'sso' | 'github' | 'email';
    organization: string;
    targetRepo: string;
    targetBranch: string;
  };
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSessionData | null;
  onLoginSuccess: (session: UserSessionData) => void;
  onLogoutSuccess: () => void;
  onUpdateWorkspace: (repo: string, branch: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  session,
  onLoginSuccess,
  onLogoutSuccess,
  onUpdateWorkspace,
}) => {
  const [activeTab, setActiveTab] = useState<'sso' | 'github' | 'email'>('sso');

  // SSO Inputs
  const [ssoDomain, setSsoDomain] = useState('');
  const [ssoEmail, setSsoEmail] = useState('');

  // GitHub Inputs
  const [githubUser, setGithubUser] = useState('');

  // Email Inputs
  const [personalEmail, setPersonalEmail] = useState('');
  const [fullName, setFullName] = useState('');

  // Workspace Repo Inputs
  const [targetRepo, setTargetRepo] = useState(session?.user?.targetRepo || 'autorca-suite/autorca-suite');
  const [targetBranch, setTargetBranch] = useState(session?.user?.targetBranch || 'main');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let email = '';
    let name = '';
    let org = 'Enterprise Workspace';

    if (activeTab === 'sso') {
      email = ssoEmail || `engineer@${ssoDomain || 'enterprise'}.com`;
      name = email.split('@')[0].replace('.', ' ');
      org = ssoDomain ? ssoDomain.split('.')[0].toUpperCase() : 'Acme Enterprise';
    } else if (activeTab === 'github') {
      const username = githubUser || 'octocat';
      email = `${username}@users.noreply.github.com`;
      name = username;
      org = `${username}'s Org`;
    } else {
      email = personalEmail || 'developer@company.com';
      name = fullName || email.split('@')[0];
      org = 'Personal Developer Account';
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: activeTab,
          email,
          name,
          organization: org,
          targetRepo,
          targetBranch,
        }),
      });

      const data = await res.json();
      if (data.success && data.session) {
        onLoginSuccess(data.session);
        onClose();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err: any) {
      setError(err.message || 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      onLogoutSuccess();
      onClose();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWorkspace(targetRepo, targetBranch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-600/30 rounded-lg border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold">User Authentication & Workspace</h2>
              <p className="text-xs text-slate-400">
                {session ? 'Active User Session & Target Repository' : 'Sign in via SSO, GitHub, or Email'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {session ? (
            /* Logged In State */
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                  {session.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{session.user.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {session.user.provider === 'sso' ? 'SSO Authenticated' : session.user.provider.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono truncate">{session.user.email}</p>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    Organization: <strong className="text-slate-800">{session.user.organization}</strong>
                  </p>
                </div>
              </div>

              {/* Workspace Target Config */}
              <form onSubmit={handleSaveWorkspace} className="space-y-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderGit2 className="w-4 h-4 text-emerald-600" />
                  Target Workspace Repository Configuration
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Target GitHub Repository (owner/repo)
                    </label>
                    <input
                      type="text"
                      value={targetRepo}
                      onChange={(e) => setTargetRepo(e.target.value)}
                      placeholder="e.g. autorca-suite/autorca-suite"
                      className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Target Branch
                    </label>
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={targetBranch}
                        onChange={(e) => setTargetBranch(e.target.value)}
                        placeholder="main"
                        className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-lg border border-rose-200 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out Session
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Save Repository Config
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Login Form */
            <div className="space-y-5">
              {/* Login Method Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setActiveTab('sso')}
                  className={`py-2 rounded-md flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'sso' ? 'bg-white text-indigo-600 font-bold shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> Org SSO
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('github')}
                  className={`py-2 rounded-md flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'github' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  <Github className="w-3.5 h-3.5" /> GitHub
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('email')}
                  className={`py-2 rounded-md flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'email' ? 'bg-white text-emerald-600 font-bold shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </button>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                {activeTab === 'sso' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Organization SSO Domain (SAML / Okta / Azure AD)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. acmecorp.com"
                        value={ssoDomain}
                        onChange={(e) => setSsoDomain(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Corporate Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. engineer@acmecorp.com"
                        value={ssoEmail}
                        onChange={(e) => setSsoEmail(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'github' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        GitHub Username / Handle
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. octocat"
                        value={githubUser}
                        onChange={(e) => setGithubUser(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'email' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Jane Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Work / Personal Email</label>
                      <input
                        type="email"
                        placeholder="e.g. jane.doe@company.com"
                        value={personalEmail}
                        onChange={(e) => setPersonalEmail(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Target Repo Quick Option */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Target GitHub Repository
                  </label>
                  <input
                    type="text"
                    value={targetRepo}
                    onChange={(e) => setTargetRepo(e.target.value)}
                    placeholder="autorca-suite/autorca-suite"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2 mt-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {loading ? 'Authenticating Session...' : 'Sign In & Establish User Session'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
