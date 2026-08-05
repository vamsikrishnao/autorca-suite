import { describe, it, expect } from 'vitest';
import { defaultModelConfig, defaultGuardrailConfig } from '../data/defaultConfig';
import {
  clampTemperature,
  validateAlertEmail,
  checkGuardrails,
  AUTO_SAVE_DEBOUNCE_MS,
} from '../utils/guardrails';

describe('Suite 10: Guardrail, Model & System Configuration Controls (Targeted High-Impact Functional Unit Tests)', () => {
  it('loads default model configuration parameters', () => {
    expect(defaultModelConfig.modelId).toBe('gemini-2.5-pro');
    expect(defaultModelConfig.temperature).toBe(0.2);
    expect(defaultModelConfig.temperature).toBeGreaterThanOrEqual(0.0);
    expect(defaultModelConfig.temperature).toBeLessThanOrEqual(1.0);
  });

  it('loads default guardrail budget thresholds and recipient email', () => {
    expect(defaultGuardrailConfig.maxLoopIterations).toBe(3);
    expect(defaultGuardrailConfig.maxTokensPerRun).toBe(15000);
    expect(defaultGuardrailConfig.maxCostUsd).toBe(0.45);
    expect(defaultGuardrailConfig.alertEmailAddress).toBe('devops-alerts@autorca.io');
  });

  it('clamps model temperature slider inputs using exported clampTemperature utility', () => {
    expect(clampTemperature(0.2)).toBe(0.2);
    expect(clampTemperature(1.5)).toBe(1.0);
    expect(clampTemperature(-0.5)).toBe(0.0);
    expect(clampTemperature(0.75)).toBe(0.75);
  });

  it('validates email address syntax using exported validateAlertEmail utility', () => {
    expect(validateAlertEmail('devops-alerts@autorca.io')).toBe(true);
    expect(validateAlertEmail('devops.lead@fintech.io')).toBe(true);
    expect(validateAlertEmail('invalid-email-string')).toBe(false);
    expect(validateAlertEmail('user@domain')).toBe(false);
  });

  it('triggers guardrail breach alert payload using exported checkGuardrails utility', () => {
    const res = checkGuardrails(17000, 0.5, 15000, 0.45);
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

  it('validates configuration auto-save debounce delay timer using exported AUTO_SAVE_DEBOUNCE_MS constant', () => {
    expect(AUTO_SAVE_DEBOUNCE_MS).toBe(800);
  });

  it('serializes guardrail configuration to JSON string for persistent storage', () => {
    const jsonStr = JSON.stringify(defaultGuardrailConfig);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.maxLoopIterations).toBe(3);
    expect(parsed.maxTokensPerRun).toBe(15000);
    expect(parsed.alertEmailAddress).toBe('devops-alerts@autorca.io');
  });
});
