import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { I18N } from '../config/i18n';
import { THEME_COLORS } from '../config/theme';
import { BugSelectorBar } from '../components/workbench/BugSelectorBar';
import { SwarmAgentsPanel } from '../components/workbench/SwarmAgentsPanel';
import { GuardrailStatusBar } from '../components/workbench/GuardrailStatusBar';
import { LoopStatusCard } from '../components/workbench/LoopStatusCard';
import { BugItem, TrackerConfig, GuardrailConfig, SubAgentInfo } from '../types';

describe('AutoRCA & Fix Suite E2E Use Cases', () => {
  const mockTrackerConfig: TrackerConfig = {
    platform: 'Jira',
    projectKey: 'ENG',
    apiKeyOrToken: 'secret-token',
    baseUrl: 'https://jira.enterprise.internal',
    rcaNoteTemplate: '### RCA Report\n**Root Cause**: {root_cause}',
    autoPostNote: true,
    useManualInput: false,
  };

  const mockGuardrailConfig: GuardrailConfig = {
    maxTokensPerRun: 45000,
    maxLoopIterations: 5,
    maxCostUsd: 10.0,
    alertEmailAddress: 'security-alerts@enterprise.internal',
    preventDestructiveSQL: true,
    requireTestHarnessPass: true,
    autoSendEmailOnLimit: true,
  };

  const mockBugs: BugItem[] = [
    {
      id: 'ENG-409',
      title: 'NullPointerException in payment gateway checkout',
      description: 'Unhandled NPE thrown when credit card token is null.',
      stackTrace: 'PaymentService.java:142 -> CheckoutController.java:88',
      platform: 'Jira',
      severity: 'Critical',
      status: 'Open',
      createdAt: '2026-08-01',
      repoPath: 'src/services',
      affectedFiles: ['PaymentService.java'],
    },
    {
      id: 'ENG-388',
      title: 'Race condition in cache invalidation queue',
      description: 'Stale cache entries persist after update event.',
      stackTrace: 'WARN [CacheWorker] Concurrent modification detected.',
      platform: 'Jira',
      severity: 'High',
      status: 'In Progress',
      createdAt: '2026-08-02',
      repoPath: 'src/workers',
      affectedFiles: ['CacheWorker.java'],
    },
  ];

  const mockSubAgents: SubAgentInfo[] = [
    {
      role: 'RCA Analyst',
      name: 'RCA Analyst',
      description: 'Parses exception stack trace and correlates with codebase.',
      status: 'Active',
      tokensUsed: 420,
    },
    {
      role: 'Code Repair Specialist',
      name: 'Code Repair Specialist',
      description: 'Synthesizes multi-file Git diff inside worktree sandbox.',
      status: 'Active',
      tokensUsed: 890,
    },
  ];

  it('1. Verifies zero-build localization (I18N) and centralized theme color tokens', () => {
    expect(I18N.app.title).toContain('AutoRCA & Fix Enterprise Suite');
    expect(I18N.headerBar.appTitle).toBe('AutoRCA');
    expect(THEME_COLORS.brand.primary).toBe('indigo-600');
    expect(THEME_COLORS.status.error.text).toBe('text-rose-700');
  });

  it('2. Renders BugSelectorBar with platform target bug list and supports Manual Issue Mode toggle', () => {
    const onSelectBug = vi.fn();
    const onRunLoop = vi.fn();
    const onReset = vi.fn();
    const onUpdateTrackerConfig = vi.fn();

    const { rerender } = render(
      <BugSelectorBar
        bugs={mockBugs}
        selectedBug={mockBugs[0]}
        onSelectBug={onSelectBug}
        isRunning={false}
        onRunLoop={onRunLoop}
        onReset={onReset}
        trackerConfig={mockTrackerConfig}
        onUpdateTrackerConfig={onUpdateTrackerConfig}
      />
    );

    // Ensure localized bug selector label is rendered
    expect(screen.getByText(/Select Target Bug/i)).toBeDefined();
    expect(screen.getByText(/Manual Issue Mode/i)).toBeDefined();

    // Test toggling checkbox to enable manual issue mode
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDefined();
    fireEvent.click(checkbox);
    expect(onUpdateTrackerConfig).toHaveBeenCalledWith({
      ...mockTrackerConfig,
      useManualInput: true,
    });

    // Re-render with manual mode active
    rerender(
      <BugSelectorBar
        bugs={mockBugs}
        selectedBug={mockBugs[0]}
        onSelectBug={onSelectBug}
        isRunning={false}
        onRunLoop={onRunLoop}
        onReset={onReset}
        trackerConfig={{ ...mockTrackerConfig, useManualInput: true }}
        onUpdateTrackerConfig={onUpdateTrackerConfig}
      />
    );

    expect(screen.getByText(/Manual Issue Mode Active/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/e.g. Unhandled NullPointerException/i)).toBeDefined();
  });

  it('3. Renders SwarmAgentsPanel with active sub-agents and localized token burn counts', () => {
    render(<SwarmAgentsPanel subAgents={mockSubAgents} />);
    expect(screen.getByText(/Active Sub-Agents Swarm/i)).toBeDefined();
    expect(screen.getByText(/RCA Analyst/i)).toBeDefined();
    expect(screen.getByText(/Code Repair Specialist/i)).toBeDefined();
    expect(screen.getByText(/Tokens: 420/i)).toBeDefined();
    expect(screen.getByText(/Tokens: 890/i)).toBeDefined();
  });

  it('4. Renders GuardrailStatusBar with token budget meters and triggers email alerts', () => {
    const onTriggerEmail = vi.fn();
    render(
      <GuardrailStatusBar
        totalTokensBurnt={18500}
        guardrailConfig={mockGuardrailConfig}
        iterationsCount={2}
        onTriggerGuardrailEmail={onTriggerEmail}
      />
    );

    expect(screen.getByText(/Guardrails & Tokens/i)).toBeDefined();
    const alertBtn = screen.getByText(/Email Alert: security-alerts@enterprise.internal/i);
    expect(alertBtn).toBeDefined();

    fireEvent.click(alertBtn);
    expect(onTriggerEmail).toHaveBeenCalledWith(
      'Token burn threshold (18,500 tokens) or manual test trigger activated.'
    );
  });

  it('5. Renders LoopStatusCard with Git worktree sandbox path and iteration depth', () => {
    render(
      <LoopStatusCard
        selectedBug={mockBugs[0]}
        iterationsCount={1}
        maxLoopIterations={5}
        worktree={{
          branchName: 'autorca/fix-ENG-409',
          path: '/app/worktrees/autorca-ENG-409',
          created: true,
          filesChanged: ['src/services/PaymentService.java'],
          diffPatch: 'diff --git a/src/services/PaymentService.java...',
        }}
      />
    );

    expect(screen.getByText(/Engineering Loop Status/i)).toBeDefined();
    expect(screen.getByText(/Worktree: autorca\/fix-ENG-409/i)).toBeDefined();
    expect(screen.getByText(/Iteration #2/i)).toBeDefined();
    expect(screen.getByText(/1\/5 DEPTH LIMIT/i)).toBeDefined();
  });
});
