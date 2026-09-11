// ============================================================
// PHASE 3 — CREATIVE MEMORY ENGINE (additive)
// Learns from real workspace activity; controllable + workspace-scoped.
// ============================================================

export interface MemorySignal {
  kind: 'color' | 'typography' | 'voice' | 'approved_asset' | 'favorite' | 'direction' | 'document' | 'request';
  label: string;
  refId?: string;
  at: string;
}

export interface WorkspaceMemorySnapshot {
  identity: string[];
  colors: string[];
  typography: string[];
  voice: string[];
  approvedAssets: { id: string; name: string; url: string }[];
  favorites: { id: string; name: string; url: string }[];
  projectHistory: { id: string; title: string }[];
  recentRequests: { id: string; title: string; type: string }[];
  approvedDirections: string[];
  documentPatterns: { type: string; count: number }[];
  commonRequests: { type: string; count: number }[];
  updatedAt: string;
}

const OPT_OUT_KEY = 'kh_memory_optout';

export function memoryOptedOut(wsId: string): boolean {
  try { return localStorage.getItem(`${OPT_OUT_KEY}_${wsId}`) === '1'; } catch { return false; }
}

export function setMemoryOptOut(wsId: string, off: boolean): void {
  try {
    if (off) localStorage.setItem(`${OPT_OUT_KEY}_${wsId}`, '1');
    else localStorage.removeItem(`${OPT_OUT_KEY}_${wsId}`);
  } catch { /* private mode */ }
}

export function clearWorkspaceMemory(wsId: string): void {
  try { localStorage.removeItem(`kh_memory_signals_${wsId}`); } catch { /* noop */ }
}

export function recordMemorySignal(wsId: string, signal: Omit<MemorySignal, 'at'>): void {
  try {
    if (memoryOptedOut(wsId)) return;
    const k = `kh_memory_signals_${wsId}`;
    const prev: MemorySignal[] = JSON.parse(localStorage.getItem(k) || '[]');
    prev.unshift({ ...signal, at: new Date().toISOString() });
    localStorage.setItem(k, JSON.stringify(prev.slice(0, 200)));
  } catch { /* noop */ }
}

export function readMemorySignals(wsId: string): MemorySignal[] {
  try { return JSON.parse(localStorage.getItem(`kh_memory_signals_${wsId}`) || '[]'); }
  catch { return []; }
}
