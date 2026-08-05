export interface WorkerPoolMetrics {
  activePods: number;
  maxPods: number;
  cpuQuotaPerPod: string;
  memoryQuotaPerPod: string;
  diskQuotaPerPod: string;
  avgPodSpinupTimeMs: number;
  isolationType: string;
  gitIndexFileIsolated: boolean;
}

export function checkTtlExpiration(
  startTimeMs: number,
  ttlMs: number
): { expired: boolean; ageMinutes: number } {
  const age = Date.now() - startTimeMs;
  return { expired: age > ttlMs, ageMinutes: Math.round(age / (60 * 1000)) };
}

export function dispatchPodToPool(pool: WorkerPoolMetrics): { status: number; podId?: string; error?: string } {
  if (pool.activePods >= pool.maxPods) {
    return { status: 503, error: 'WORKER_POOL_CAPACITY_EXCEEDED' };
  }
  return { status: 200, podId: `pod-${Math.random().toString(36).substring(2, 8)}` };
}

export function getPodIndexFilePath(podId: string): string {
  return `/tmp/worktrees/${podId}/.git/index`;
}

export function calculatePoolUtilization(active: number, max: number): number {
  if (max <= 0) return 0;
  return Number(((active / max) * 100).toFixed(1));
}
