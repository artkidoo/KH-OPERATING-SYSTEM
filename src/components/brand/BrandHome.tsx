// Brand Home — Phase 3 S1: Your Brand dashboard
import React, { useMemo } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../context/AuthContext";
import { ArrowRight, CheckCircle2, Circle, Send, FolderKanban } from "lucide-react";
import { brandProfileCompletion } from "../../domain/brandProfile";
import { BRAND_KITS, deriveKitStatus, kitStatusColor } from "../../domain/brandKits";

export function BrandHome({ onNotify, onNavigateSection, onOpenProject }: {
  onNotify: (m: string, t?: "success" | "info" | "error") => void;
  onNavigateSection: (s: string) => void;
  onOpenProject: (id: string) => void;
}) {
  const { activeWorkspace } = useAuth();
  const w = useWorkspace();
  const ws = w.workspace || activeWorkspace;
  const [dna, setDna] = React.useState<any>(null);
  React.useEffect(() => {
    let live = true;
    w.loadBrandDNA().then((d) => { if (live) setDna(d); }).catch(() => {});
    return () => { live = false; };
  }, [ws?.id]);
  const bc: any = w.brandCore;
  const completion = useMemo(() => brandProfileCompletion({
    hasName: Boolean(bc?.brandName || dna?.identity || ws?.name),
    hasIndustry: Boolean(bc?.industry || dna?.businessCategory),
    hasContact: Boolean((ws as any)?.email || dna?.email || bc?.brandName),
    hasPrimaryColor: Boolean(bc?.colorPalette?.length),
    hasLogo: Boolean(bc?.logoAssets?.primaryLogoUrl || dna?.logoUrl),
    hasTypography: Boolean(bc?.typographyPairing?.heading || bc?.typography?.heading),
    hasVoice: Boolean(bc?.voiceAndTone?.traits?.length || dna?.voice),
    hasOfferOrDoc: Boolean(w.businessDocuments.length > 0),
  }), [bc, dna, ws, w.businessDocuments.length]);
  const kitRows = useMemo(() => BRAND_KITS.map((kit) => {
    const rel = w.creativeRequests.filter((r: any) =>
      (r.requestType === kit.requestType || r.serviceName === kit.requestType));
    const hasReq = rel.length > 0;
    const inRev = rel.some((r: any) => ["IN_REVIEW", "REVIEWING", "REVISION_REQUESTED"].includes(String(r.lifecycleStatus || r.status)));
    const appr = rel.some((r: any) => ["COMPLETED", "DELIVERED", "APPROVED_FOR_PRODUCTION"].includes(String(r.lifecycleStatus || r.status)));
    const del = w.assets.filter((a: any) => (a.tags || []).some((t: string) => t.toLowerCase().includes(kit.id.split("-")[0]))).length > 0;
    return { kit, status: deriveKitStatus({ profileComplete: completion.pct >= 60, hasRequest: hasReq, requestInReview: inRev, requestApproved: appr, hasDeliveredAsset: del }) };
  }), [w.creativeRequests, w.assets, completion.pct]);
  const active = w.projects.filter((p) => p.status !== "completed").slice(0, 4);
  const pending = w.creativeRequests.filter((r: any) => !["DELIVERED", "COMPLETED", "CANCELLED"].includes(String(r.lifecycleStatus || r.status || "SUBMITTED"))).slice(0, 4);
  const recent = [...w.assets].slice(0, 4);
  const nextStep = completion.missing[0] || (pending[0] as any)?.title || (active[0] as any)?.title || "Request your first kit";
  void onNotify;
  const brandName = (bc?.brandName as string) || dna?.identity || (ws as any)?.name || "Your Brand";
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/30 p-6">
        <p className="text-[11px] font-bold tracking-[0.2em] text-red-400">YOUR BRAND</p>
        <h1 className="mt-1 text-2xl font-bold text-white">{brandName}</h1>
        <p className="mt-1 text-xs text-zinc-400">Everything your brand needs to look professional and ready.</p>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs"><span className="text-zinc-400">Brand Profile {completion.done}/{completion.total}</span><span className="font-bold text-white">{completion.pct}%</span></div>
          <div className="mt-1 h-2 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${completion.pct}%` }} /></div>
          {completion.missing.length > 0 && <p className="mt-1 text-[11px] text-zinc-500">Missing: {completion.missing.slice(0, 3).join(" · ")}</p>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => onNavigateSection("brand-profile")} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 cursor-pointer">Complete My Brand</button>
          <button onClick={() => onNavigateSection("requests")} className="flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-xs font-bold text-white cursor-pointer"><Send className="w-3.5 h-3.5" /> Request Creative Work</button>
          <button onClick={() => onNavigateSection("brand-kits")} className="rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-xs font-bold text-white cursor-pointer">View Brand Kits</button>
        </div>
        <p className="mt-3 text-[11px] text-zinc-500">Next: <span className="text-zinc-200 font-semibold">{nextStep}</span></p>
      </div>
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
        <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-white">Readiness</h2><button onClick={() => onNavigateSection("brand-kits")} className="flex items-center gap-1 text-xs font-bold text-red-400 cursor-pointer">All kits <ArrowRight className="w-3.5 h-3.5" /></button></div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {kitRows.map(({ kit, status }) => (
            <button key={kit.id} onClick={() => onNavigateSection("brand-kits")} className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-left cursor-pointer">
              {status === "Delivered" || status === "Approved" ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <Circle className="w-4 h-4 text-zinc-600 shrink-0" />}
              <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-white">{kit.name}</span></span>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${kitStatusColor(status)}`}>{status}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <p className="text-[11px] font-bold tracking-widest text-zinc-500">ACTIVE PROJECTS</p>
          <div className="mt-2 space-y-2">{active.map((p) => (<button key={p.id} onClick={() => onOpenProject(p.id)} className="w-full text-left rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 cursor-pointer"><p className="text-sm font-bold text-white flex items-center gap-1.5"><FolderKanban className="w-3.5 h-3.5 text-red-400" />{p.title}</p><p className="text-[11px] text-zinc-500">{p.status}</p></button>))}{active.length === 0 && <p className="text-xs text-zinc-600 py-3">No active projects yet.</p>}</div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <p className="text-[11px] font-bold tracking-widest text-zinc-500">OUTSTANDING REQUESTS</p>
          <div className="mt-2 space-y-2">{pending.map((r: any) => (<div key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3"><p className="text-xs font-bold text-white">{r.title || r.serviceName}</p><p className="text-[11px] text-amber-300">{String(r.lifecycleStatus || r.status)}</p></div>))}{pending.length === 0 && <p className="text-xs text-zinc-600 py-3">Nothing outstanding.</p>}</div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <p className="text-[11px] font-bold tracking-widest text-zinc-500">RECENT DELIVERIES</p>
          <div className="mt-2 space-y-2">{recent.map((a: any) => (<div key={a.id} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3"><p className="text-xs font-bold text-white truncate">{a.name || a.title}</p><p className="text-[11px] text-zinc-500 capitalize">{a.category}</p></div>))}{recent.length === 0 && <p className="text-xs text-zinc-600 py-3">Deliveries will appear here.</p>}</div>
        </div>
      </div>
    </div>
  );
}
export default BrandHome;

