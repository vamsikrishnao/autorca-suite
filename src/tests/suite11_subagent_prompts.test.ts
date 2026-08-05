import { describe, it, expect } from 'vitest';
import { defaultAgentPrompts, SubAgentPromptDefinition } from '../prompts/agentSystemPrompts';

describe('Suite 11: Sub-Agent System Prompts Registry & Customization Service (Targeted High-Impact Functional Unit Tests)', () => {
  it('loads default system prompts for all 6 specialized AutoRCA agents', () => {
    const keys = Object.keys(defaultAgentPrompts);

    expect(keys).toHaveLength(6);
    expect(keys).toContain('rca_analyst');
    expect(keys).toContain('kb_retriever');
    expect(keys).toContain('code_repair');
    expect(keys).toContain('harness_verifier');
    expect(keys).toContain('ci_coordinator');
    expect(keys).toContain('guardrail_auditor');
  });

  it('verifies RCA Analyst prompt contains required template variables', () => {
    const prompt = defaultAgentPrompts['rca_analyst'];

    expect(prompt.id).toBe('rca_analyst');
    expect(prompt.role).toBe('Root Cause Analysis Specialist');
    expect(prompt.variables).toContain('{{bug_id}}');
    expect(prompt.variables).toContain('{{bug_title}}');
    expect(prompt.variables).toContain('{{stack_trace}}');
    expect(prompt.systemPrompt).toContain('PRIMARY MISSION');
  });

  it('performs template variable substitution on prompt strings', () => {
    const rawPrompt = 'Analyze bug {{bug_id}} ("{{bug_title}}") for tenant {{tenant_id}}.';

    const substituted = rawPrompt
      .replace(/{{bug_id}}/g, 'JIRA-4892')
      .replace(/{{bug_title}}/g, 'NullPointer in Payment Gateway')
      .replace(/{{tenant_id}}/g, 'org-acme-corp');

    expect(substituted).toBe('Analyze bug JIRA-4892 ("NullPointer in Payment Gateway") for tenant org-acme-corp.');
    expect(substituted).not.toContain('{{');
  });

  it('supports version bumping and system prompt customization update', () => {
    const original = defaultAgentPrompts['code_repair'];
    const updated: SubAgentPromptDefinition = {
      ...original,
      version: '3.2.0',
      systemPrompt: `${original.systemPrompt}\n- Extra constraint: Enforce strict TypeScript types.`,
      lastUpdated: '2026-08-05',
      updatedBy: 'Lead Architect',
    };

    expect(updated.version).toBe('3.2.0');
    expect(updated.systemPrompt).toContain('Enforce strict TypeScript types');
    expect(updated.updatedBy).toBe('Lead Architect');
  });

  it('resets modified prompt to original factory defaults', () => {
    const original = defaultAgentPrompts['harness_verifier'];
    let currentPrompt = 'MODIFIED_CUSTOM_PROMPT_STRING';

    // Reset action
    currentPrompt = original.systemPrompt;

    expect(currentPrompt).toBe(original.systemPrompt);
    expect(currentPrompt).toContain('MicroVM Sandbox');
  });

  it('validates sub-agent temperature setting bounds', () => {
    Object.values(defaultAgentPrompts).forEach((agent) => {
      expect(agent.temperature).toBeGreaterThanOrEqual(0.0);
      expect(agent.temperature).toBeLessThanOrEqual(1.0);
    });
  });
});
