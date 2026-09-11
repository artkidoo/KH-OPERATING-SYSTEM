import React from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { smartSearch, SearchDoc } from "../../domain/smartSearch";
import { Search } from "lucide-react";
export function SmartSearch({ onOpenProject }: { onOpenProject?: (id: string) => void }) {
  const { projects, assets, releases, creativeRequests, businessDocuments } = useWorkspace();
  const [q, setQ] = React.useState("");
  const docs: SearchDoc[] = React.useMemo(() => [
    ...projects.map((p): SearchDoc => ({ kind: "project", id: p.id, title: p.title, subtitle: p.category, tags: p.tags || [], meta: `${p.status} ${p.description || ""}`, at: p.updatedAt })),
    ...assets.map((a): SearchDoc => ({ kind: ((a.metadata as { favorite?: boolean } | undefined)?.favorite ? "favorite" : "asset"), id: a.projectId ? `${a.projectId}:${a.id}` : a.id, title: a.name, subtitle: a.category, tags: a.tags || [], meta: `${a.category} ${(a.metadata as { approved?: boolean } | undefined)?.approved ? "approved" : ""}`, at: a.createdAt })),
    ...businessDocuments.map((d: { id: string; title: string; documentType: string }): SearchDoc => ({ kind: "document", id: d.id, title: d.title, subtitle: d.documentType, tags: [d.documentType], meta: `${d.documentType} document`, at: new Date().toISOString() })),
    ...releases.map((r): SearchDoc => ({ kind: "release", id: r.id, title: r.title, subtitle: r.artistName, tags: [r.genre || ""], meta: `${r.releaseType} release`, at: r.releaseDate || "" })),
    ...creativeRequests.map((r): SearchDoc => ({ kind: "request", id: r.id, title: r.title || r.serviceName, subtitle: r.requestType, tags: [r.requestType || ""], meta: `${r.lifecycleStatus || "SUBMITTED"} delivery`, at: r.createdAt })),
  ], [projects, assets, releases, creativeRequests, businessDocuments]);
  const hits = q.trim().length > 1 ? smartSearch(q, docs, 12) : [];
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-700 px-3">
        <Search className="w-4 h-4 text-zinc-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search: "LIGHT artwork", "approved logo", "January invoice"…' className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none" aria-label="Search library" />
      </div>
      {hits.length > 0 && (
        <div className="mt-2 space-y-1">
          {hits.map((h) => (
            <button key={`${h.kind}:${h.id}`} onClick={() => { if (h.kind === "project" && onOpenProject) onOpenProject(h.id); }} className="w-full text-left rounded-xl px-3 py-2 hover:bg-zinc-900 cursor-pointer">
              <p className="text-xs font-bold text-white">{h.title} <span className="ml-1 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400">{h.kind}</span></p>
              <p className="text-[11px] text-zinc-500">{h.why.slice(0, 3).join(" · ")}</p>
            </button>
          ))}
        </div>
      )}
      {q.trim().length > 1 && hits.length === 0 && (<p className="mt-2 text-[11px] text-zinc-500">No matches — try "artwork", "invoice", "approved" or a project name.</p>)}
    </div>
  );
}

