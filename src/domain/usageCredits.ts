// ============================================================
// PHASE 3 — USAGE / CREDITS + MEMBERSHIP CONFIG (additive)
// Central, configurable — never hardcoded per-studio pricing.
// ============================================================

export type UsageKind = 'generation' | 'export' | 'storage_mb' | 'premium_tool' | 'production_request';

export interface UsageCounters {
  generation: number;
  export: number;
  storageMB: number;
  premiumTool: number;
  productionRequest: number;
}

export interface PlanLimits {
  storageMB: number;
  generations: number;
  exports: number;
  productionRequests: number;
  revisions: number;
}

export const DEFAULT_PLAN_LIMITS: Record<string, PlanLimits> = {
  artist_free: { storageMB: 2048, generations: 20, exports: 20, productionRequests: 3, revisions: 2 },
  artist_pro: { storageMB: 51200, generations: 1000, exports: 1000, productionRequests: 100, revisions: 5 },
  brand_free: { storageMB: 2048, generations: 20, exports: 20, productionRequests: 3, revisions: 2 },
  brand_pro: { storageMB: 51200, generations: 1000, exports: 1000, productionRequests: 100, revisions: 5 },
  team: { storageMB: 204800, generations: 5000, exports: 5000, productionRequests: 500, revisions: 8 },
  agency: { storageMB: 512000, generations: 20000, exports: 20000, productionRequests: 2000, revisions: 10 },
  label: { storageMB: 512000, generations: 20000, exports: 20000, productionRequests: 2000, revisions: 10 },
  enterprise: { storageMB: 2097152, generations: 100000, exports: 100000, productionRequests: 10000, revisions: 15 },
};

const KEY = 'kh_usage_v1';

function loadAll(): Record<string, UsageCounters> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function getUsage(wsId: string): UsageCounters {
  const all = loadAll();
  return all[wsId] || { generation: 0, export: 0, storageMB: 0, premiumTool: 0, productionRequest: 0 };
}

export function recordUsage(wsId: string, kind: UsageKind, amount = 1): UsageCounters {
  const all = loadAll();
  const cur = getUsage(wsId);
  const key = kind === 'storage_mb' ? 'storageMB' : kind === 'premium_tool' ? 'premiumTool' : kind === 'production_request' ? 'productionRequest' : kind;
  (cur as unknown as Record<string, number>)[key] = ((cur as unknown as Record<string, number>)[key] || 0) + amount;
  all[wsId] = cur;
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* noop */ }
  return cur;
}

export function usageAgainst(plan: string, usage: UsageCounters): { ok: boolean; over: string[] } {
  const lim = DEFAULT_PLAN_LIMITS[plan] || DEFAULT_PLAN_LIMITS.artist_free;
  const over: string[] = [];
  if (usage.generation > lim.generations) over.push('generations');
  if (usage.export > lim.exports) over.push('exports');
  if (usage.productionRequest > lim.productionRequests) over.push('production requests');
  if (usage.storageMB > lim.storageMB) over.push('storage');
  return { ok: over.length === 0, over };
}
