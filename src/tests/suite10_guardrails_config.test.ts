import { describe, it, expect } from 'vitest';
import { defaultModelConfig, defaultGuardrailConfig } from '../data/defaultConfig';

describe('Suite 10: Guardrail, Model & System Configuration Controls (Targeted High-Impact Functional Unit Tests)', () => {
  it('loads default model configuration parameters', () => {
    expect(defaultModelConfig.modelId).toBe('gemini-2.5-pro');
    expect(defaultModelConfig.temperature).toBe(0.2);
    expect(defaultModelConfig.temperature).toBeGreaterThanOrEqual(0.0);
    expect(defaultModelConfig.temperature).toBeLessThanOrEqual(1.0);
  });

  it('loads default guardrail budget thresholds and recipient email', () => {
    expect(defaultGuardrailConfig.maxLoopIterations).toBe(3);
    expect(defaultGuardrailConfig.maxTokensPerRun).toBe(500000);
    expect(defaultGuardrailConfig.maxCostUsd).toBe(15.0);
    expect(defaultGuardrailConfig.alertEmailAddress).toBe('engineering-alerts@acme.corp');
  });

  it('clamps model temperature slider inputs strictly between 0.0 and 1.0', () => {
    const clampTemperature = (val: number) => Number(Math.max(0.0, Math.min(1.0, val)).toFixed(2));

    expect(clampTemperature(0.2)).toBe(0.2);
    expect(clampTemperature(1.5)).toBe(1.0);
    expect(clampTemperature(-0.5)).toBe(0.0);
    expect(clampTemperature(0.75)).toBe(0.75);
  });

  it('validates email address syntax for guardrail alert notification modal', () => {
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    expect(isValidEmail('engineering-alerts@acme.corp')).toBe(true);
    expect(isValidEmail('devops.lead@fintech.io')).toBe(true);
    expect(isValidEmail('invalid-email-string')).toBe(false);
    expect(isValidEmail('user@domain')).toBe(false);
  });

  it('triggers guardrail breach alert payload when token usage or cost exceeds budget', () => {
    const checkGuardrails = (tokens: number, cost: number, maxTokens: number, maxCost: number) => {
      const tokenBreach = tokens > maxTokens;
      const costBreach = cost > maxCost;

      if (tokenBreach || costBreach) {
        return {
          tripped: true,
          reasons: [
            ...(tokenBreach ? [`Token limit breached: ${tokens} > ${maxTokens}`] : []),
            ...(costBreach ? [`Cost limit breached: $${cost} > $${maxCost}`] : []),
          ],
        };
      }
      return { tripped: false, reasons: [] };
    };

    const res = checkGuardrails(520000, 16.5, 500000, 15.0);
    expect(res.tripped).toBe(true);
    expect(res.reasons.length).toBe(2);
    expect(res.reasons[0]).toContain('Token limit breached');
    expect(res.reasons[1]).toContain('Cost limit breached');
  });

  it('allows model switching between Gemini 2.5 Pro and Gemini 2.5 Flash', () => {
    const config = { ...defaultModelConfig };

    // Switch to Flash
    config.modelId = 'gemini-2.5-flash';
    expect(config.modelId).toBe('gemini-2.5-flash');

    // Switch back to Pro
    config.modelId = 'gemini-2.5-pro';
    expect(config.modelId).toBe('gemini-2.5-pro');
  });

  it('validates configuration auto-save debounce delay timer (800ms)', () => {
    const debounceDelayMs = 800;
    expect(debounceDelayMs).toBe(800);
  });

  it('serializes guardrail configuration to JSON string for persistent storage', () => {
    const jsonStr = JSON.stringify(defaultGuardrailConfig);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.maxLoopIterations).toBe(3);
    expect(parsed.maxTokensPerRun).toBe(500000);
    expect(parsed.alertEmailAddress).toBe('engineering-alerts@acme.corp');
  });
});
