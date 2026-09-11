import React from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../context/AuthContext";
import { createShareLink, listShareLinks, revokeShareLink, shareUrl, ShareLink } from "../../domain/shareLinks";
import { Share2, Ban } from "lucide-react";
export function SharePanel({ onNotify }: { onNotify: (m: string, t?: "success"|"info"|"error") => void }) {
  const { activeWorkspace } = useAuth();
  const { assets, projects } = useWorkspace();
  const wsId = activeWorkspace?.id || "";
  const [links, setLinks] = React.useState<ShareLink[]>([]);
  const [target, setTarget] = React.useState("");
  const [dl, setDl] = React.useState(true);
  const [pw, setPw] = React.useState("");
  React.useEffect(() => { if (wsId) setLinks(listShareLinks(wsId)); }, [wsId, assets.length, projects.length]);
  const make = () => {
    if (!wsId || !target) { onNotify("Pick an asset or project to share.", "error"); return; }
    const [kind, id] = target.split(":");
    const name = kind === "asset" ? (assets.find((a) => a.id === id)?.name || id) : (projects.find((p) => p.id === id)?.title || id);
    const link = createShareLink(wsId, { targetKind: kind as ShareLink["targetKind"], targetId: id, targetName: name, allowDownload: dl, expiresAt: null, password: pw });
    setLinks(listShareLinks(wsId)); setPw("");
    onNotify(`Share link ready: ${shareUrl(link)}`, "success");
  };
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3">
      <div className="flex items-center gap-2"><Share2 className="w-4 h-4 text-sky-400" /><p className="text-sm font-bold text-white">Secure sharing</p></div>
      <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-2 py-2 text-xs text-white cursor-pointer">
        <option value="">Select asset / project…</option>
        {assets.slice(0, 30).map((a) => (<option key={a.id} value={`asset:${a.id}`}>Asset — {a.name}</option>))}
        {projects.map((p) => (<option key={p.id} value={`project:${p.id}`}>Project — {p.title}</option>))}
      </select>
      <div className="flex gap-2">
        <input value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password (optional)" className="flex-1 rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white" />
        <button onClick={() => setDl(!dl)} className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-200 cursor-pointer">{dl ? "Download ON" : "View only"}</button>
        <button onClick={make} className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white cursor-pointer">Create link</button>
      </div>
      <div className="space-y-1">
        {links.slice(0, 8).map((l) => (
          <div key={l.id} className="flex items-center justify-between gap-2 rounded-xl bg-zinc-900/70 border border-zinc-800 px-3 py-2">
            <p className="text-[11px] text-zinc-300 truncate">{l.targetName} · {l.allowDownload ? "download" : "view-only"} · {l.revoked ? "revoked" : "active"} · {l.views.length} views</p>
            {!l.revoked && (<button onClick={() => { revokeShareLink(wsId, l.id); setLinks(listShareLinks(wsId)); onNotify("Link revoked.", "success"); }} className="flex items-center gap-1 text-[11px] font-bold text-red-400 cursor-pointer"><Ban className="w-3 h-3" /> Revoke</button>)}
          </div>
        ))}
        {links.length === 0 && <p className="text-[11px] text-zinc-600">No share links yet — links never expose raw storage URLs.</p>}
      </div>
    </div>
  );
}

