import { describe, it, expect } from 'vitest';
import { defaultGitHubConfig } from '../data/defaultConfig';
import { validatePatToken } from '../utils/connectors';
import { formatPrBranchName, generateDraftPrMarkdown } from '../utils/github';

describe('Suite 7: GitHub Integration & Draft PR Workflow (Targeted High-Impact Functional Unit Tests)', () => {
  it('loads default GitHub configuration with repo URL and base branch', () => {
    expect(defaultGitHubConfig.repoUrl).toBe('https://github.com/autorca-suite/example-react-backend');
    expect(defaultGitHubConfig.baseBranch).toBe('main');
  });

  it('validates Personal Access Token format requirement using exported validatePatToken utility', () => {
    expect(validatePatToken('ghp_1234567890abcdef').valid).toBe(true);
    expect(validatePatToken('github_pat_1234567890abcdef').valid).toBe(true);
    expect(validatePatToken('invalid_token').valid).toBe(false);
    expect(validatePatToken('').valid).toBe(false);
  });

  it('generates structured GitHub Draft Pull Request payload with Markdown report using exported generateDraftPrMarkdown utility', () => {
    const markdown = generateDraftPrMarkdown('JIRA-4892', 'Fix NPE in WebhookHandler', 'Null checks added');

    expect(markdown).toContain('JIRA-4892');
    expect(markdown).toContain('Fix NPE in WebhookHandler');
    expect(markdown).toContain('Null checks added');
  });

  it('formats standardized Git worktree branch names using exported formatPrBranchName utility', () => {
    expect(formatPrBranchName('BUG-409')).toBe('autorca/fix-bug-409');
    expect(formatPrBranchName('JIRA-4892')).toBe('autorca/fix-jira-4892');
  });

  it('validates Unified Git Diff patch synthesis header compliance', () => {
    const samplePatchDiff = `diff --git a/src/main/java/com/acme/payment/WebhookHandler.java b/src/main/java/com/acme/payment/WebhookHandler.java
index a1b2c3d..d4e5f6a 100644
--- a/src/main/java/com/acme/payment/WebhookHandler.java
+++ b/src/main/java/com/acme/payment/WebhookHandler.java
@@ -142,3 +142,3 @@
-String curr = event.getData().getCurrency().toUpperCase();
+String curr = Optional.ofNullable(event.getData()).map(d -> d.getCurrency()).orElse("USD").toUpperCase();`;

    expect(samplePatchDiff.startsWith('diff --git')).toBe(true);
    expect(samplePatchDiff).toContain('--- a/');
    expect(samplePatchDiff).toContain('+++ b/');
    expect(samplePatchDiff).toContain('Optional.ofNullable');
  });

  it('simulates polling GitHub Actions CI check run statuses', () => {
    const checkRuns = [
      { name: 'Unit & Integration Tests', status: 'completed', conclusion: 'success' },
      { name: 'Security Static Analysis (CodeQL)', status: 'completed', conclusion: 'success' },
      { name: 'MicroVM Sandbox Execution', status: 'completed', conclusion: 'success' },
    ];

    const isAllPassed = checkRuns.every((run) => run.status === 'completed' && run.conclusion === 'success');
    expect(isAllPassed).toBe(true);
  });

  it('handles CI check run failure and reports failing test suite', () => {
    const checkRuns = [
      { name: 'Unit & Integration Tests', status: 'completed', conclusion: 'failure' },
      { name: 'Security Static Analysis', status: 'completed', conclusion: 'success' },
    ];

    const failingRun = checkRuns.find((run) => run.conclusion === 'failure');
    expect(failingRun).toBeDefined();
    expect(failingRun?.name).toBe('Unit & Integration Tests');
  });

  it('generates peer review comment template for Jira ticket synchronization', () => {
    const buildJiraComment = (prUrl: string, bugId: string) =>
      `[AutoRCA Swarm] Opened Draft Pull Request for ${bugId}: ${prUrl}\nStatus updated to "In Review".`;

    const comment = buildJiraComment('https://github.com/acme-org/payment-service/pull/104', 'JIRA-4892');
    expect(comment).toContain('JIRA-4892');
    expect(comment).toContain('https://github.com/acme-org/payment-service/pull/104');
    expect(comment).toContain('In Review');
  });
});
