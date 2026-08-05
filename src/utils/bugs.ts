import { BugItem } from '../types';

export function filterBugsByQuery(bugs: BugItem[], query: string): BugItem[] {
  if (!query.trim()) return bugs;
  const q = query.toLowerCase();
  return bugs.filter(
    (b) =>
      b.id.toLowerCase().includes(q) ||
      b.title.toLowerCase().includes(q) ||
      b.repoPath.toLowerCase().includes(q) ||
      b.platform.toLowerCase().includes(q)
  );
}

export function getSeverityBadgeClass(severity: BugItem['severity']): string {
  switch (severity) {
    case 'Critical':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'High':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Medium':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Low':
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}
