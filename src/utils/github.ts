export function formatPrBranchName(bugId: string): string {
  const safeId = bugId.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  return `autorca/fix-${safeId}`;
}

export function generateDraftPrMarkdown(bugId: string, bugTitle: string, rcaSummary: string): string {
  return `## 🤖 AutoRCA Draft Pull Request for ${bugId}\n\n**Title:** ${bugTitle}\n\n### Root Cause Summary\n${rcaSummary}\n\n---\n*Verified in isolated Git worktree sandbox.*`;
}
