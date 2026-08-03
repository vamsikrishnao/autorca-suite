/**
 * Centralized Design Theme & Color Tokens
 * 
 * All color codes, badge palettes, severity schemes, and common layout styles
 * are organized here so enterprise teams can modify brand or theme colors in one place.
 */

export const THEME_COLORS = {
  // Primary Brand Colors
  brand: {
    primary: 'indigo-600',
    primaryHover: 'indigo-700',
    primaryLight: 'indigo-50',
    primaryBorder: 'indigo-200',
    text: 'indigo-600',
  },
  // Status Colors
  status: {
    success: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: 'text-emerald-600',
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: 'text-amber-600',
    },
    error: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: 'text-rose-600',
    },
    neutral: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-300',
      icon: 'text-slate-500',
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: 'text-blue-600',
    },
  },
};

/**
 * Connection status styling dictionary
 */
export const CONNECTION_STATUS_STYLES: Record<
  string,
  { bg: string; text: string; border: string; iconColor: string; label: string }
> = {
  Connected: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    label: 'Connected',
  },
  Indexed: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    label: 'Indexed',
  },
  'Not Connected': {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-300',
    iconColor: 'text-slate-500',
    label: 'Not Connected',
  },
  'Connection Error': {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    iconColor: 'text-rose-600',
    label: 'Connection Error',
  },
  Error: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    iconColor: 'text-rose-600',
    label: 'Error',
  },
};

/**
 * Severity badge color maps
 */
export const SEVERITY_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Critical: {
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-300',
  },
  High: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
  },
  Medium: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
  },
  Low: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
  },
};

/**
 * Sub-agent status indicator styles
 */
export const AGENT_STATUS_STYLES: Record<
  string,
  { badge: string; border: string; glow: string }
> = {
  WORKING: {
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-300 animate-pulse',
    border: 'border-indigo-400 shadow-sm',
    glow: 'ring-2 ring-indigo-200',
  },
  COMPLETED: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    border: 'border-emerald-300',
    glow: '',
  },
  FAILED: {
    badge: 'bg-rose-50 text-rose-700 border-rose-300',
    border: 'border-rose-300',
    glow: '',
  },
  IDLE: {
    badge: 'bg-slate-100 text-slate-600 border-slate-300',
    border: 'border-slate-200',
    glow: '',
  },
};

/**
 * Reusable Common CSS Classes
 */
export const UI_CLASSES = {
  card: 'bg-white border border-slate-200 rounded-xl p-4 shadow-xs transition-all',
  cardHeader: 'text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between',
  buttonPrimary: 'flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer',
  buttonSecondary: 'flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer',
  buttonDanger: 'flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer',
  input: 'w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
};
