// ============================================================
// PHASE 3 — SMART STRUCTURED SEARCH (additive, no fake AI)
// Token + metadata matching across projects/assets/documents/
// releases/requests/deliveries/favorites with ranked scoring.
// ============================================================

export interface SearchDoc {
  kind: 'project' | 'asset' | 'document' | 'release' | 'request' | 'favorite';
  id: string;
  title: string;
  subtitle?: string;
  tags: string[];
  meta: string;
  at: string;
}

export interface SearchHit extends SearchDoc { score: number; why: string[] }

function tokens(q: string): string[] {
  return q.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1);
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

export function smartSearch(query: string, docs: SearchDoc[], limit = 25): SearchHit[] {
  const toks = tokens(query);
  if (toks.length === 0) return [];
  const monthHit = MONTHS.find((m) => toks.includes(m.slice(0, 3)) || toks.includes(m));
  const out: SearchHit[] = [];
  for (const d of docs) {
    const hay = `${d.title} ${d.subtitle || ''} ${d.tags.join(' ')} ${d.meta}`.toLowerCase();
    let score = 0;
    const why: string[] = [];
    for (const t of toks) {
      if (d.title.toLowerCase().includes(t)) { score += 5; why.push(`title:${t}`); }
      else if (hay.includes(t)) { score += 2; why.push(`meta:${t}`); }
    }
    if (monthHit && hay.includes(monthHit)) { score += 3; why.push(`month:${monthHit}`); }
    if ((toks.includes('approved') || toks.includes('approve')) && hay.includes('approv')) { score += 3; why.push('approved'); }
    if (toks.includes('favorite') || toks.includes('favourite') || toks.includes('fav')) {
      if (d.kind === 'favorite' || hay.includes('favorite')) { score += 4; why.push('favorite'); }
      else continue;
    }
    if (score > 0) out.push({ ...d, score, why });
  }
  return out.sort((a, b) => b.score - a.score || b.at.localeCompare(a.at)).slice(0, limit);
}
