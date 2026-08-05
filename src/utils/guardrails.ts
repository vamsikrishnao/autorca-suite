export function clampTemperature(val: number): number {
  return Number(Math.max(0.0, Math.min(1.0, val)).toFixed(2));
}

export function validateAlertEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export interface GuardrailBreachResult {
  tripped: boolean;
  reasons: string[];
}

export function checkGuardrails(
  tokensBurnt: number,
  costUsd: number,
  maxTokens: number,
  maxCost: number
): GuardrailBreachResult {
  const tokenBreach = tokensBurnt > maxTokens;
  const costBreach = costUsd > maxCost;

  if (tokenBreach || costBreach) {
    return {
      tripped: true,
      reasons: [
        ...(tokenBreach ? [`Token limit breached: ${tokensBurnt} > ${maxTokens}`] : []),
        ...(costBreach ? [`Cost limit breached: $${costUsd} > $${maxCost}`] : []),
      ],
    };
  }
  return { tripped: false, reasons: [] };
}

export const AUTO_SAVE_DEBOUNCE_MS = 800;
