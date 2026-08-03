import { describe, it, expect } from 'vitest';
import { calculateTokenCost, simulateSubAgentExecution } from '../services/swarmEngine';

describe('SwarmEngine Token Calculation & Cost Modeling', () => {
  it('correctly calculates USD cost based on token consumption and LLM model pricing', () => {
    // gemini-2.5-pro baseline rate testing ($3.00 / 1M input, $15.00 / 1M output approx)
    const costPro = calculateTokenCost('gemini-2.5-pro', 10000, 5000);
    expect(costPro).toBeGreaterThan(0);

    const costFlash = calculateTokenCost('gemini-2.5-flash', 10000, 5000);
    expect(costFlash).toBeGreaterThan(0);
    expect(costFlash).toBeLessThan(costPro);
  });

  it('simulateSubAgentExecution generates realistic token budgets and latency estimates', async () => {
    const result = await simulateSubAgentExecution('rca_analyst', 'ENG-409', 'NullPointerException in PaymentService');
    expect(result.subAgentId).toBe('rca_analyst');
    expect(result.tokensBurnt).toBeGreaterThan(0);
    expect(result.executionTimeMs).toBeGreaterThan(0);
    expect(result.outputSummary).toContain('rca_analyst');
  });
});
