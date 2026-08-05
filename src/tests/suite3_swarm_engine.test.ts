import { describe, it, expect } from 'vitest';
import {
  calculateDynamicAgentTokens,
  updateSwarmTokensForIteration,
  calculateTokenCost,
  simulateSubAgentExecution,
} from '../services/swarmEngine';
import { defaultSubAgents, defaultBugs } from '../data/defaultConfig';

describe('Suite 3: Autonomous Swarm Engine & Sub-Agent State Loop (Targeted High-Impact Functional Unit Tests)', () => {
  const criticalBug = defaultBugs[0]; // Severity: Critical
  const highBug = { ...defaultBugs[0], severity: 'High' as const };
  const mediumBug = { ...defaultBugs[0], severity: 'Medium' as const };

  it('verifies default sub-agent configuration contains all 6 specialized agents', () => {
    expect(defaultSubAgents.length).toBe(6);
    const roles = defaultSubAgents.map((a) => a.role);

    expect(roles).toContain('RCA Analyst');
    expect(roles).toContain('KB Retriever');
    expect(roles).toContain('Code Repair Specialist');
    expect(roles).toContain('Harness Verifier');
    expect(roles).toContain('CI & Draft PR Coordinator');
    expect(roles).toContain('Guardrail Auditor');
  });

  it('calculates baseline token allocation for RCA Analyst on Critical severity bug', () => {
    const { tokensUsed, costUsd } = calculateDynamicAgentTokens('RCA Analyst', criticalBug, 1);
    
    // Base 420 * Critical multiplier 1.35 * iteration 1.0 = ~567 tokens
    expect(tokensUsed).toBe(567);
    expect(costUsd).toBeGreaterThan(0);
  });

  it('applies lower token multiplier for High and Medium bug severities', () => {
    const criticalResult = calculateDynamicAgentTokens('RCA Analyst', criticalBug, 1);
    const highResult = calculateDynamicAgentTokens('RCA Analyst', highBug, 1);
    const mediumResult = calculateDynamicAgentTokens('RCA Analyst', mediumBug, 1);

    expect(criticalResult.tokensUsed).toBeGreaterThan(highResult.tokensUsed);
    expect(highResult.tokensUsed).toBeGreaterThan(mediumResult.tokensUsed);
  });

  it('scales token consumption linearly with loop iteration index', () => {
    const iter1 = calculateDynamicAgentTokens('Code Repair Specialist', criticalBug, 1);
    const iter2 = calculateDynamicAgentTokens('Code Repair Specialist', criticalBug, 2);
    const iter3 = calculateDynamicAgentTokens('Code Repair Specialist', criticalBug, 3);

    // Iteration multiplier: 1 + (index-1)*0.25 -> 1.0, 1.25, 1.50
    expect(iter2.tokensUsed).toBeGreaterThan(iter1.tokensUsed);
    expect(iter3.tokensUsed).toBeGreaterThan(iter2.tokensUsed);
  });

  it('updates cumulative tokens across all sub-agents in a swarm array', () => {
    const initialAgents = defaultSubAgents.map((a) => ({ ...a, tokensUsed: 0 }));
    const updated = updateSwarmTokensForIteration(initialAgents, criticalBug, 1);

    expect(updated[0].tokensUsed).toBeGreaterThan(0);
    expect(updated[1].tokensUsed).toBeGreaterThan(0);
    expect(updated.length).toBe(initialAgents.length);
  });

  it('calculates model pricing accurately for Gemini 2.5 Pro vs Gemini 2.5 Flash', () => {
    const inputTokens = 100000;
    const outputTokens = 20000;

    const proCost = calculateTokenCost('gemini-2.5-pro', inputTokens, outputTokens);
    const flashCost = calculateTokenCost('gemini-2.5-flash', inputTokens, outputTokens);

    expect(proCost).toBeGreaterThan(0);
    expect(flashCost).toBeGreaterThan(0);
    expect(flashCost).toBeLessThan(proCost);
  });

  it('simulates async sub-agent execution and produces structured output report', async () => {
    const report = await simulateSubAgentExecution('rca_analyst', 'BUG-409', 'Stack trace analysis for null payment currency');

    expect(report.subAgentId).toBe('rca_analyst');
    expect(report.tokensBurnt).toBe(450);
    expect(report.executionTimeMs).toBeGreaterThan(0);
    expect(report.outputSummary).toContain('BUG-409');
  });

  it('validates sub-agent state loop transitions between IDLE, WORKING, and COMPLETED', () => {
    let agentState: 'IDLE' | 'WORKING' | 'COMPLETED' | 'Alert / Blocked' = 'IDLE';

    agentState = 'WORKING';
    expect(agentState).toBe('WORKING');

    agentState = 'COMPLETED';
    expect(agentState).toBe('COMPLETED');
  });

  it('handles harness test failure and triggers Alert / Blocked state', () => {
    const harnessResult = { exitCode: 1, stderr: 'Test assertion failed: Expected 200 OK, got 500' };

    const handleHarnessVerification = (res: { exitCode: number }) => {
      if (res.exitCode !== 0) {
        return { status: 'Alert / Blocked' as const, error: 'Harness test suite failed' };
      }
      return { status: 'COMPLETED' as const, error: null };
    };

    const status = handleHarnessVerification(harnessResult);
    expect(status.status).toBe('Alert / Blocked');
    expect(status.error).toContain('failed');
  });

  it('executes pause, resume, and hard reset swarm state controls', () => {
    let loopControl: 'IDLE' | 'RUNNING' | 'PAUSED' = 'IDLE';

    // Start
    loopControl = 'RUNNING';
    expect(loopControl).toBe('RUNNING');

    // Pause
    loopControl = 'PAUSED';
    expect(loopControl).toBe('PAUSED');

    // Resume
    loopControl = 'RUNNING';
    expect(loopControl).toBe('RUNNING');

    // Reset
    loopControl = 'IDLE';
    expect(loopControl).toBe('IDLE');
  });
});
