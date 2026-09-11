// PHASE 2 — secure sharing foundation (additive).
// Local-first share links: view/download flags, expiry, password gate,
// revoke, access history. Stored per-workspace in localStorage; asset
// payloads stay in the app (no raw private URLs exposed in links).
export interface ShareLink {
  id: string;
  workspaceId: string;
  targetKind: "asset" | "document" | "project" | "package";
  targetId: string;
  targetName: string;
  allowDownload: boolean;
  expiresAt: string | null;
  passwordHash: string | null;
  revoked: boolean;
  views: { at: string; note: string }[];
  createdAt: string;
}

function key(ws: string) { return `kh_shares_${ws}`; }
function load(ws: string): ShareLink[] {
  try { return JSON.parse(localStorage.getItem(key(ws)) || "[]"); }
  catch { return []; }
}
function persist(ws: string, links: ShareLink[]) {
  localStorage.setItem(key(ws), JSON.stringify(links));
}
function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return `h${h.toString(36)}`;
}

export function listShareLinks(ws: string): ShareLink[] { return load(ws); }

export function createShareLink(ws: string, input: {
  targetKind: ShareLink["targetKind"]; targetId: string; targetName: string;
  allowDownload: boolean; expiresAt: string | null; password: string;
}): ShareLink {
  const links = load(ws);
  const link: ShareLink = {
    id: `sh_${Math.random().toString(36).slice(2, 10)}`,
    workspaceId: ws,
    targetKind: input.targetKind,
    targetId: input.targetId,
    targetName: input.targetName,
    allowDownload: input.allowDownload,
    expiresAt: input.expiresAt,
    passwordHash: input.password ? hash(input.password) : null,
    revoked: false,
    views: [],
    createdAt: new Date().toISOString(),
  };
  links.unshift(link);
  persist(ws, links);
  return link;
}

export function revokeShareLink(ws: string, id: string): void {
  persist(ws, load(ws).map((l) => (l.id === id ? { ...l, revoked: true } : l)));
}

export function recordShareView(ws: string, id: string, note: string): void {
  persist(ws, load(ws).map((l) =>
    l.id === id ? { ...l, views: [...l.views, { at: new Date().toISOString(), note }] } : l
  ));
}

export function verifySharePassword(link: ShareLink, password: string): boolean {
  if (!link.passwordHash) return true;
  return hash(password) === link.passwordHash;
}

export function shareLinkExpired(link: ShareLink): boolean {
  if (!link.expiresAt) return false;
  return new Date(link.expiresAt).getTime() < Date.now();
}

export function shareUrl(link: ShareLink): string {
  return `${location.origin}/share/${link.id}`;
}
