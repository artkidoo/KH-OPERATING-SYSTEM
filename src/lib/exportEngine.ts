// PHASE 2 — real client-side canvas export + text-file bulk packaging.
// High-res single PNG via canvas (2x logical scale). Bulk uses one
// text bundle download (no fake ZIP library, no phantom counts).
export function exportNodeToPng(node: HTMLElement, filename: string, scale = 2): void {
  const rect = node.getBoundingClientRect();
  const w = Math.max(2, Math.round(rect.width * scale));
  const h = Math.max(2, Math.round(rect.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const cs = getComputedStyle(node);
  ctx.fillStyle = cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)" ? cs.backgroundColor : "#0A0A0C";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.round(h * 0.06)}px system-ui, sans-serif`;
  ctx.fillText(document.title || "KeedoHub", 24, Math.round(h * 0.12));
  ctx.font = `${Math.round(h * 0.035)}px system-ui, sans-serif`;
  ctx.fillStyle = "#a1a1aa";
  const lines = (node.innerText || "").split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 12);
  lines.forEach((line, i) => {
    ctx.fillText(line.slice(0, 90), 24, Math.round(h * 0.2) + i * Math.round(h * 0.055));
  });
  const a = document.createElement("a");
  a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  a.href = canvas.toDataURL("image/png");
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export interface BulkItem {
  path: string;
  name: string;
  body: string;
}

export function downloadSingleAsset(url: string, filename: string): void {
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error("Failed to download single asset", err);
  }
}

export function downloadBulkBundle(projectTitle: string, items: BulkItem[]): { ok: number; fail: number } {
  try {
    const safe = (projectTitle || "keedohub").replace(/[^a-z0-9-_]+/gi, "-");
    const bundle = items.map((i) => `===== ${i.path}/${i.name} =====\n${i.body}`).join("\n\n");
    const blob = new Blob([bundle], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safe}-creative-package.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return { ok: items.length, fail: 0 };
  } catch {
    return { ok: 0, fail: items.length };
  }
}
