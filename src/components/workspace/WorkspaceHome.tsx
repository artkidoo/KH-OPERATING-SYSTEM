import React from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../context/AuthContext";
import { useMembership } from "../../hooks/useMembership";
import { Rocket, FolderKanban, ImagePlus, Send, FileText, Fingerprint, PlusCircle } from "lucide-react";
import { ShellSection } from "./WorkspaceShell";
import { ArtistHome } from "./ArtistHome";

export function WorkspaceHome({ onNav, onOpenProject, onNotify }: {
  onNav: (t: ShellSection) => void;
  onOpenProject: (id: string) => void;
  onNotify: (m: string, t?: "success" | "info" | "error") => void;
}) {
  const { activeWorkspace } = useAuth();
  const { workspace, projects, assets, releases, creativeRequests, businessDocuments } = useWorkspace();
  const { plan, tier, identity } = useMembership();
  const ws = workspace || activeWorkspace;

  // Phase 2: If this is an artist workspace, render the dedicated Artist Home control room
  if (identity === "artist") {
    return (
      <ArtistHome
        onNotify={onNotify}
        onNavigateSection={(sec) => onNav(sec as ShellSection)}
      />
    );
  }

  const active = projects.filter((p) => p.status !== "completed").slice(0, 4);
  const pending = creativeRequests.filter((r) => !["DELIVERED", "COMPLETED", "CANCELLED"].includes((r.lifecycleStatus as string) || "SUBMITTED")).slice(0, 4);
  const usedMB = Math.max(0.2, assets.reduce((n, a) => n + (a.size || 0), 0) / 1048576);
  const quotaMB = tier === "pro" ? 51200 : 2048;
  const isBrand = identity === "brand";
  const next = isBrand
    ? (pending[0]?.title || active[0]?.title || businessDocuments[0]?.title || "Start your first brand project")
    : (pending[0]?.title || active[0]?.title || releases[0]?.title || "Start your first release project");

  return (
    <div className="workspace-page space-y-5">
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/30 p-6">
        <p className="text-[11px] font-bold tracking-[0.2em] text-red-400">
          {isBrand ? "BRAND OPERATING HEADQUARTERS" : "CREATIVE ARTIST HEADQUARTERS"}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">{ws?.name || "Your workspace"}</h1>
        <p className="mt-1 text-xs text-zinc-400">Next: <span className="text-zinc-100 font-semibold">{next}</span></p>
        <div className="mt-4 flex flex-wrap gap-2">
          {isBrand ? (
            <>
              <button onClick={() => onNav("documents")} className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-xs font-bold text-white cursor-pointer hover:bg-white/15 transition-colors">
                <FileText className="w-4 h-4 text-red-400" />Documents
              </button>
              <button onClick={() => onNav("brand")} className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-xs font-bold text-white cursor-pointer hover:bg-white/15 transition-colors">
                <Fingerprint className="w-4 h-4 text-red-400" />Brand Identity
              </button>
              <button onClick={() => onNav("library")} className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-xs font-bold text-white cursor-pointer hover:bg-white/15 transition-colors">
                <ImagePlus className="w-4 h-4 text-red-400" />Upload Asset
              </button>
              <button onClick={() => onNav("projects")} className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-xs font-bold text-white cursor-pointer hover:bg-white/15 transition-colors">
                <FolderKanban className="w-4 h-4 text-red-400" />Open Projects
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onNav("create")} className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-xs font-bold text-white cursor-pointer hover:bg-white/15 transition-colors">
                <Rocket className="w-4 h-4 text-red-400" />Create Release
              </button>
              <button onClick={() => onNav("library")} className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-xs font-bold text-white cursor-pointer hover:bg-white/15 transition-colors">
                <ImagePlus className="w-4 h-4 text-red-400" />Upload Asset
              </button>
              <button onClick={() => onNav("requests")} className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-xs font-bold text-white cursor-pointer hover:bg-white/15 transition-colors">
                <Send className="w-4 h-4 text-red-400" />Request Work
              </button>
              <button onClick={() => onNav("projects")} className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-xs font-bold text-white cursor-pointer hover:bg-white/15 transition-colors">
                <FolderKanban className="w-4 h-4 text-red-400" />Open Projects
              </button>
            </>
          )}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold tracking-widest text-zinc-500">ACTIVE PROJECTS</p>
            <button onClick={() => onNav("projects")} className="text-[10px] font-bold text-red-400 hover:text-red-300">View all</button>
          </div>
          <div className="mt-2 space-y-2">
            {active.map((p) => (<button key={p.id} onClick={() => onOpenProject(p.id)} className="w-full text-left rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 cursor-pointer hover:border-zinc-700 transition-colors"><p className="text-sm font-bold text-white">{p.title}</p><p className="text-[11px] text-zinc-500">{p.status} · {assets.filter((a) => a.projectId === p.id).length} assets</p></button>))}
            {active.length === 0 && <p className="text-xs text-zinc-600 py-3">No active projects yet.</p>}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold tracking-widest text-zinc-500">REQUESTS</p>
            <button onClick={() => onNav("requests")} className="text-[10px] font-bold text-red-400 hover:text-red-300">View all</button>
          </div>
          <div className="mt-2 space-y-2">
            {pending.map((r) => (<div key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3"><p className="text-xs font-bold text-white">{r.title || r.serviceName}</p><p className="text-[11px] text-amber-300">{r.lifecycleStatus || "SUBMITTED"}</p></div>))}
            {pending.length === 0 && <p className="text-xs text-zinc-600 py-3">No pending requests.</p>}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <p className="text-[11px] font-bold tracking-widest text-zinc-500">PLAN · {plan.replace("_", " ").toUpperCase()}</p>
          <div className="mt-2 h-2 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${Math.min(100, (usedMB / quotaMB) * 100)}%` }} /></div>
          <p className="mt-1 text-[11px] text-zinc-500">{usedMB.toFixed(1)} MB of {tier === "pro" ? "50 GB" : "2 GB"}</p>
          <p className="mt-2 text-sm font-bold text-white">
            {isBrand
              ? (businessDocuments[0] ? businessDocuments[0].title : "No documents yet")
              : (releases[0] ? releases[0].title : "No releases yet")}
          </p>
        </div>
      </div>
    </div>
  );
}

