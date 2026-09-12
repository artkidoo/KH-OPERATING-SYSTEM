// Brand Kits — Phase 3 S4 good-to-go (part 1)
import React, { useMemo } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { CheckCircle2, Send } from "lucide-react";
import { BRAND_KITS, deriveKitStatus, kitStatusColor } from "../../domain/brandKits";
export function BrandKitsView({ onNotify, onRequest }: { onNotify: (m: string, t?: "success" | "info" | "error") => void; onRequest: (reqType: string, title: string) => void; }) {
  const w = useWorkspace();
  const [sel, setSel] = React.useState(BRAND_KITS[0].id);
  const rows = useMemo(() => BRAND_KITS.map((kit) => {
    const rel = w.creativeRequests.filter((r: any) => r.requestType === kit.requestType || r.serviceName === kit.requestType);
    const hasReq = rel.length > 0;
    const inRev = rel.some((r: any) => ["IN_REVIEW", "REVIEWING", "REVISION_REQUESTED"].includes(String(r.lifecycleStatus || r.status)));
    const appr = rel.some((r: any) => ["COMPLETED", "DELIVERED", "APPROVED_FOR_PRODUCTION"].includes(String(r.lifecycleStatus || r.status)));
    const del = w.assets.filter((a: any) => (a.tags || []).some((t: string) => t.toLowerCase().includes(kit.id.split("-")[0]))).length > 0;
    return { kit, status: deriveKitStatus({ profileComplete: true, hasRequest: hasReq, requestInReview: inRev, requestApproved: appr, hasDeliveredAsset: del }) };
  }), [w.creativeRequests, w.assets]);
  const current = rows.find((r) => r.kit.id === sel) || rows[0];
  void onNotify;
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
        <p className="text-[11px] font-bold tracking-[0.2em] text-red-400">I AM GOOD TO GO</p>
        <h1 className="text-xl font-bold text-white">Brand Kits</h1>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ kit, status }) => (
            <button key={kit.id} onClick={() => setSel(kit.id)} className={`rounded-xl border p-3 text-left cursor-pointer ${sel === kit.id ? "border-red-500 bg-red-500/10" : "border-zinc-800 bg-zinc-900/60"}`}>
              <span className="flex items-center justify-between"><span className="text-xs font-bold text-white">{kit.name}</span><span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${kitStatusColor(status)}`}>{status}</span></span>
              <span className="mt-0.5 block text-[11px] text-zinc-500">{kit.tagline}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
        <h2 className="text-sm font-bold text-white">{current.kit.name}</h2>
        <p className="mt-1 text-xs text-zinc-400">{current.kit.description}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">{current.kit.deliverables.map((d) => (<div key={d} className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-zinc-200">{d}</span></div>))}</div>
        <button onClick={() => onRequest(current.kit.requestType, current.kit.name)} className="mt-4 flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 cursor-pointer"><Send className="w-3.5 h-3.5" /> Request {current.kit.name}</button>
      </div>
    </div>
  );
}
export default BrandKitsView;
