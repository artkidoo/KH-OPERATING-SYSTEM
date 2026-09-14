import React from "react";
import { api } from "../../services/api";
import { CreativeRequest, ProductionJob, ProductionJobStatus } from "../../types";
import { useOpsData } from "./useOpsData";
import { OpsEmpty, OpsPill } from "./opsBits";

// ============================================================
// KEEDOHUB OPERATIONS CONSOLE (§7/§27)
// One canonical internal ops environment inside the Admin shell.
// Sections: command / customers / workspaces / requests / projects /
// queue / review / deliveries / library / studio / audio / attention.
// Real data only — no fake stats. Admin authorization is enforced server-side
// on every endpoint used here (requireAdmin) and by the Admin shell.
// ============================================================

export type OpsSection =
  | "operations"
  | "customers"
  | "workspaces"
  | "requests"
  | "projects"
  | "queue"
  | "review"
  | "deliveries"
  | "library"
  | "studio"
  | "audio"
  | "attention"
  | "search";

// Enriched request rows (server enrichProductionRequest adds context fields).
export type OpsReq = CreativeRequest & {
  customerName?: string;
  workspaceName?: string;
  workspaceIdentity?: string;
  projectTitle?: string | null;
  revisions?: Array<{ id: string; revisionNumber: number; reason: string; instructions?: string; status: string; createdAt: string }>;
  deliveries?: Array<{ deliveredAt?: string; deliveredByName?: string; note?: string; assetIds?: string[] }>;
};

// Mirror of the server-side PRODUCTION_NEXT transition graph (requests).
const REQ_NEXT: Record<string, string[]> = {
  SUBMITTED: ["REVIEWING", "CANCELLED"],
  REVIEWING: ["APPROVED_FOR_PRODUCTION", "CANCELLED"],
  APPROVED_FOR_PRODUCTION: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["IN_PRODUCTION", "CANCELLED"],
  IN_PRODUCTION: ["INTERNAL_QC", "CANCELLED"],
  INTERNAL_QC: ["CLIENT_REVIEW", "IN_PRODUCTION", "CANCELLED"],
  CLIENT_REVIEW: ["REVISION", "FINAL_APPROVAL", "CANCELLED"],
  REVISION: ["IN_PRODUCTION", "CANCELLED"],
  FINAL_APPROVAL: ["DELIVERY", "CANCELLED"],
  DELIVERY: ["LIBRARY"],
  LIBRARY: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
  IN_REVIEW: ["REVISION_REQUESTED", "READY_FOR_DELIVERY", "REVIEWING"],
  REVISION_REQUESTED: ["IN_PRODUCTION", "APPROVED_FOR_PRODUCTION"],
  READY_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
};

const STUDIOS = ["artwork", "content", "motion", "lyrics", "epk", "document", "brand_asset", "template_engine", "export_engine"];

interface WsMeta {
  id: string;
  name: string;
  identityType: string;
  status?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface WsSummary {
  workspace: WsMeta;
  owner: { id: string; email: string; fullName: string } | null;
  members: unknown[];
  artistDNA: Record<string, unknown> | null;
  brandDNA: Record<string, unknown> | null;
  requests: OpsReq[];
  projects: Array<{ id: string; title: string; status?: string; createdAt?: string }>;
  assets: Array<{ id: string; name: string; category?: string; createdAt?: string; folderName?: string }>;
  counts: Record<string, number>;
  recentActivity: Array<{ id: string; action?: string; description?: string; createdAt?: string; actorEmail?: string }>;
}

const DNA_KEYS_ARTIST = ["identity", "artistName", "stageName", "artistStory", "story", "genre", "visualIdentity", "colours", "colorPalette", "typography", "photography", "mood", "references", "creativePreferences", "preferences", "contentTone", "tone"];
const DNA_KEYS_BRAND = ["identity", "brandName", "businessIdentity", "visualIdentity", "colours", "colorPalette", "typography", "logo", "photography", "illustration", "motion", "brandVoice", "voice", "audience", "mission", "vision", "values", "creativeReferences", "references", "businessInfo"];

function Card({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {right}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function DnaGrid({ dna, keys }: { dna: Record<string, unknown> | null; keys: string[] }) {
  const [showAll, setShowAll] = React.useState(false);
  if (!dna) return <p className="text-[11px] text-zinc-500">No DNA profile yet for this workspace.</p>;
  const entries = keys
    .filter((k) => k in dna && dna[k] !== undefined && dna[k] !== null && dna[k] !== "")
    .map((k) => [k, dna[k]] as const);
  const shown = showAll ? entries : entries.slice(0, 8);
  return (
    <div className="space-y-2">
      {entries.length === 0 ? (
        <p className="text-[11px] text-zinc-500">DNA profile exists but has no populated fields yet.</p>
      ) : (
        shown.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[140px_1fr] gap-2 rounded-lg bg-zinc-900/60 px-2.5 py-1.5">
            <span className="text-[10px] font-bold uppercase text-zinc-500">{String(k).replace(/([A-Z])/g, " $1").trim()}</span>
            <span className="text-[11px] text-zinc-200 break-words">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
          </div>
        ))
      )}
      {entries.length > 8 && (
        <button onClick={() => setShowAll((s) => !s)} className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] font-bold text-zinc-300">
          {showAll ? "Show less" : `Show all ${entries.length} fields`}
        </button>
      )}
    </div>
  );
}

// §10 Workspace Operations — explicit admin inspection context (§11: never
// mutates the admin's identity; banner makes the context unambiguous).
export function WorkspaceInspect({ wsId, onClose, openRequest }: { wsId: string; onClose: () => void; openRequest: (r: OpsReq) => void }) {
  const [data, setData] = React.useState<WsSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    api.admin.getWorkspace(wsId).then((r: any) => {
      if (!alive) return;
      setData((r.workspace || null) as WsSummary | null);
      setLoading(false);
    }).catch((e: any) => {
      if (!alive) return;
      setError(e?.message || "Failed to inspect workspace");
      setLoading(false);
    });
    return () => { alive = false; };
  }, [wsId]);
  const ws = data?.workspace;
  const identity = ws?.identityType === "brand" ? "brand" : "artist";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs">
        <span className="font-semibold text-amber-300">
          Viewing workspace: {ws?.name || wsId} · {identity.toUpperCase()} — admin session unchanged
        </span>
        <button onClick={onClose} className="rounded-lg bg-zinc-800 px-3 py-1 font-bold text-white">Return to Admin Operations</button>
      </div>
      {loading && <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-xs text-zinc-400">Loading workspace context…</p>}
      {error && <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">{error}</div>}
      {data && ws && (
        <>
          <Card title="Workspace">
            <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 md:grid-cols-4">
              <div><span className="block text-zinc-500">Customer</span>{data.owner?.fullName || "—"}</div>
              <div><span className="block text-zinc-500">Email</span>{data.owner?.email || "—"}</div>
              <div><span className="block text-zinc-500">Type</span>{identity}</div>
              <div><span className="block text-zinc-500">Status</span><OpsPill v={ws.status || "active"} /></div>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-zinc-400">
              {Object.entries(data.counts || {}).map(([k, v]) => <span key={k} className="rounded-lg bg-zinc-900 px-2 py-0.5">{k}: <strong className="text-zinc-200">{v}</strong></span>)}
            </div>
          </Card>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title={identity === "brand" ? "Brand DNA (§21)" : "Artist DNA (§22)"}>
              <DnaGrid dna={identity === "brand" ? data.brandDNA : data.artistDNA} keys={identity === "brand" ? DNA_KEYS_BRAND : DNA_KEYS_ARTIST} />
            </Card>
            <Card title="Requests">
              {(data.requests || []).length === 0 ? <OpsEmpty title="No requests yet." hint="When this customer submits creative requests, they will appear here." /> : (
                <div className="space-y-2">
                  {data.requests.slice(0, 8).map((r) => (
                    <button key={r.id} onClick={() => openRequest(r)} className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-left">
                      <span className="min-w-0"><span className="block truncate text-xs font-bold text-white">{r.title || r.serviceName}</span><span className="block truncate text-[11px] text-zinc-500">{r.serviceName}</span></span>
                      <OpsPill v={r.lifecycleStatus || r.status || "SUBMITTED"} />
                    </button>
                  ))}
                </div>
              )}
            </Card>
            <Card title="Projects">
              {(data.projects || []).length === 0 ? <p className="text-[11px] text-zinc-500">No projects yet.</p> : (
                <div className="space-y-2">{data.projects.slice(0, 8).map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                    <span className="truncate text-xs text-zinc-200">{p.title}</span><OpsPill v={p.status || "planning"} />
                  </div>
                ))}</div>
              )}
            </Card>
            <Card title="Assets / Library">
              {(data.assets || []).length === 0 ? <p className="text-[11px] text-zinc-500">No assets delivered yet.</p> : (
                <div className="space-y-2">{data.assets.slice(0, 8).map((a) => (
                  <div key={a.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200">
                    {a.name} <span className="text-zinc-500">· {a.folderName || a.category || "asset"}</span>
                  </div>
                ))}</div>
              )}
            </Card>
            <Card title="Recent Activity">
              {(data.recentActivity || []).length === 0 ? <p className="text-[11px] text-zinc-500">No activity recorded.</p> : (
                <ul className="space-y-1.5 text-[11px] text-zinc-300">
                  {data.recentActivity.slice(0, 10).map((l) => (
                    <li key={l.id} className="rounded-lg bg-zinc-900/60 px-2.5 py-1.5">
                      <span className="font-bold text-zinc-100">{l.action || "EVENT"}</span> — {l.description || ""} <span className="text-zinc-500">{l.createdAt ? new Date(l.createdAt).toLocaleString() : ""}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// §12/§15 Production Detail — everything Admin needs to produce the work:
// customer, workspace, DNA, request, project, brief, references, requirements,
// notes, transitions, assignment, revisions, approvals, delivery.
export function RequestDetail({ req, onClose, onRefresh, onError, openWorkspace }: {
  req: OpsReq;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onError: (m: string) => void;
  openWorkspace: (wsId: string) => void;
}) {
  const prod = api.production as unknown as OpsProdApi;
  const status = req.lifecycleStatus || "SUBMITTED";
  const nexts = REQ_NEXT[status] || [];
  const identity = req.workspaceIdentity === "brand" ? "brand" : "artist";
  const [wsData, setWsData] = React.useState<WsSummary | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [deliverOpen, setDeliverOpen] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    api.admin.getWorkspace(req.workspaceId).then((r: any) => {
      if (alive) setWsData((r.workspace || null) as WsSummary | null);
    }).catch(() => { /* DNA is production context, not a blocker */ });
    return () => { alive = false; };
  }, [req.workspaceId]);

  const run = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    try { await fn(); await onRefresh(); }
    catch (e: any) { onError(e?.message || "Action failed"); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{req.title || req.serviceName}</p>
          <p className="text-[11px] text-zinc-500">{req.customerName} · {req.workspaceName} · {identity} {req.projectTitle ? `· project: ${req.projectTitle}` : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <OpsPill v={status} />
          <button onClick={() => openWorkspace(req.workspaceId)} className="rounded-lg bg-zinc-800 px-2.5 py-1 text-[11px] font-bold text-white">Open workspace</button>
          <button onClick={onClose} className="rounded-lg bg-zinc-800 px-2.5 py-1 text-[11px] font-bold text-white">Close</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Brief & Requirements">
          <div className="space-y-2 text-[11px] text-zinc-300">
            <p><span className="font-bold text-zinc-100">Service:</span> {req.serviceName}</p>
            <p><span className="font-bold text-zinc-100">Brief:</span> {req.briefDetails || req.description || "— (missing brief — see attention queue)"}</p>
            {req.instructions && <p><span className="font-bold text-zinc-100">Requirements:</span> {req.instructions}</p>}
            {req.deadline && <p><span className="font-bold text-zinc-100">Deadline:</span> {req.deadline}</p>}
            <p><span className="font-bold text-zinc-100">Priority:</span> <OpsPill v={req.priority || "medium"} /></p>
          </div>
          {(req.references || []).length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] font-bold uppercase text-zinc-500">Creative references</p>
              <ul className="mt-1 space-y-1">{req.references!.map((u, i) => (
                <li key={i} className="truncate text-[11px] text-cyan-300"><a href={u} target="_blank" rel="noreferrer" className="hover:underline">{u}</a></li>
              ))}</ul>
            </div>
          )}
        </Card>

        <Card title={identity === "brand" ? "Brand DNA (§21)" : "Artist DNA (§22)"}>
          <DnaGrid dna={identity === "brand" ? wsData?.brandDNA || null : wsData?.artistDNA || null} keys={identity === "brand" ? DNA_KEYS_BRAND : DNA_KEYS_ARTIST} />
        </Card>

        <Card title="Lifecycle (§12 statuses)">
          <div className="flex flex-wrap gap-2">
            {nexts.length === 0 && <p className="text-[11px] text-zinc-500">Request is terminal ({status}).</p>}
            {nexts.map((s) => (
              <button key={s} disabled={busy !== null} onClick={() => run(`t-${s}`, () => prod.transition(req.id, s))}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold ${s === "CANCELLED" ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-zinc-700 bg-zinc-800 text-white"} disabled:opacity-50`}>
                {busy?.startsWith("t-") && busy === `t-${s}` ? "…" : `→ ${s}`}
              </button>
            ))}
          </div>
          {(req.approvals || []).length > 0 && (
            <div className="mt-3 space-y-1 text-[11px] text-zinc-400">
              <p className="text-[10px] font-bold uppercase text-zinc-500">Approvals</p>
              {req.approvals!.map((a, i) => <p key={i}>Approved by <strong className="text-zinc-200">{a.by}</strong> · {a.at ? new Date(a.at).toLocaleString() : ""}{a.note ? ` · ${a.note}` : ""}</p>)}
            </div>
          )}
        </Card>

        <Card title="Assignment (§16)">
          <AssignmentRow req={req} busy={busy} run={run} />
        </Card>

        <NotesCard req={req} busy={busy} run={run} />

        <Card title="Review & Changes (§17)">
          <ReviewCard req={req} busy={busy} run={run} />
          <button disabled={busy !== null || (req.deliveries || []).length > 0} onClick={() => setDeliverOpen(true)}
            className="mt-3 w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
            {(req.deliveries || []).length > 0 ? "Delivered — see delivery record" : "Deliver to customer Library (§18)"}
          </button>
        </Card>
      </div>

      {deliverOpen && <DeliverModal req={req} onClose={() => setDeliverOpen(false)} onRefresh={async () => { await onRefresh(); setDeliverOpen(false); }} onError={onError} />}
    </div>
  );
}

// Typed surface of api.production used by the ops console (no `any` shortcuts).
interface OpsProdApi {
  list: (f?: Record<string, string>) => Promise<{ requests: OpsReq[] }>;
  get: (id: string) => Promise<{ request: OpsReq }>;
  transition: (id: string, to: string) => Promise<unknown>;
  assign: (id: string, d: { assignedStudio: string; assignedProducer?: string; assignedAdminId?: string }) => Promise<unknown>;
  notes: (id: string, d: { internalNotes?: string; clientVisibleNotes?: string }) => Promise<unknown>;
  requestRevision: (id: string, d: { reason: string; instructions?: string }) => Promise<unknown>;
  deliver: (id: string, d: { assets: Array<{ name: string; url: string; category?: string; size?: number; mimeType?: string; tags?: string[]; metadata?: Record<string, unknown> }>; note?: string }) => Promise<{ assets: Array<{ id: string; name: string }>; request: OpsReq }>;
  jobs: {
    list: (f?: Record<string, string>) => Promise<{ jobs: OpsJob[] }>;
    get: (id: string) => Promise<{ job: OpsJob }>;
    update: (id: string, d: Record<string, unknown>) => Promise<unknown>;
    transition: (id: string, status: string) => Promise<unknown>;
    createDeliverable: (id: string, d: { title: string; category?: string; format?: string; specs?: string }) => Promise<unknown>;
    uploadVersion: (id: string, delId: string, d: { title?: string; previewUrl?: string; fileUrl?: string; notes?: string; status?: string }) => Promise<unknown>;
    resolveRevision: (id: string, revId: string) => Promise<unknown>;
    deliver: (id: string, note?: string) => Promise<{ job: OpsJob; createdAssets: Array<{ id: string; name: string }> }>;
  };
}

type RunFn = (key: string, fn: () => Promise<unknown>) => Promise<void>;

// §16 Assignment — internal studios + assigned person (no HR system).
function AssignmentRow({ req, busy, run }: { req: OpsReq; busy: string | null; run: RunFn }) {
  const prod = api.production as unknown as OpsProdApi;
  const [studio, setStudio] = React.useState(req.assignedStudio || "");
  const [producer, setProducer] = React.useState(req.assignedProducer || "");
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <select value={studio} onChange={(e) => setStudio(e.target.value)} className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-[11px] text-zinc-200">
          <option value="">Route to internal studio…</option>
          {STUDIOS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={producer} onChange={(e) => setProducer(e.target.value)} placeholder="Assigned person" className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-[11px] text-zinc-200" />
        <button disabled={!studio || busy !== null} onClick={() => run("assign", () => prod.assign(req.id, { assignedStudio: studio, assignedProducer: producer || undefined }))}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-50">Assign</button>
      </div>
      {(req.assignedProducer || req.assignedStudio) && (
        <p className="mt-2 text-[11px] text-zinc-500">Currently: {req.assignedProducer || "—"} @ {req.assignedStudio || "—"}</p>
      )}
    </>
  );
}

function NotesCard({ req, busy, run }: { req: OpsReq; busy: string | null; run: RunFn }) {
  const prod = api.production as unknown as OpsProdApi;
  const [internalNotes, setInternalNotes] = React.useState(req.internalNotes || "");
  const [clientNotes, setClientNotes] = React.useState(req.clientVisibleNotes || "");
  return (
    <>
      <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Internal notes (never customer-visible)" className="h-16 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-[11px] text-zinc-200" />
      <textarea value={clientNotes} onChange={(e) => setClientNotes(e.target.value)} placeholder="Client-visible notes" className="mt-2 h-12 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-[11px] text-zinc-200" />
      <button disabled={busy !== null} onClick={() => run("notes", () => prod.notes(req.id, { internalNotes, clientVisibleNotes: clientNotes }))}
        className="mt-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-[11px] font-bold text-white">Save notes</button>
    </>
  );
}

export type OpsJob = ProductionJob & {
  deliverables: Array<{ id: string; title: string; category?: string; format?: string; specs?: string; status?: string; currentVersionNumber?: number; versions?: Array<{ id: string; versionNumber: number; title: string; previewUrl?: string; fileUrl?: string; status?: string; uploadedBy?: string; uploadedAt?: string }> }>;
  revisions?: Array<{ id: string; reason?: string; status: string; deliverableTitle?: string; createdAt?: string }>;
};

function ReviewCard({ req, busy, run }: { req: OpsReq; busy: string | null; run: RunFn }) {
  const prod = api.production as unknown as OpsProdApi;
  const [reason, setReason] = React.useState("");
  return (
    <>
      <div className="space-y-1 text-[11px] text-zinc-400">
        {(req.revisions || []).length === 0 ? <p className="text-zinc-500">No revisions yet.</p> : req.revisions!.map((r) => (
          <p key={r.id} className="rounded-lg bg-zinc-900/60 px-2.5 py-1.5">
            <strong className="text-zinc-200">R{r.revisionNumber}</strong> · {r.reason} · <OpsPill v={r.status} />
          </p>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Request changes — reason" className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-[11px] text-zinc-200" />
        <button disabled={!reason.trim() || busy !== null} onClick={() => run("rev", () => prod.requestRevision(req.id, { reason: reason.trim() }).then(() => setReason("")))}
          className="rounded-lg bg-amber-600 px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-50">Request changes</button>
      </div>
    </>
  );
}

// §18 Delivery modal — requires at least one valid asset (name + url), which is
// exactly what the server requires. Fixes delivering with an empty asset list.
function DeliverModal({ req, onClose, onRefresh, onError }: {
  req: OpsReq;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onError: (m: string) => void;
}) {
  const prod = api.production as unknown as OpsProdApi;
  interface Row { name: string; url: string; category: string }
  const [rows, setRows] = React.useState<Row[]>([{ name: "", url: "", category: "artwork" }]);
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const valid = rows.filter((r) => r.name.trim() && r.url.trim());
  const submit = async () => {
    if (valid.length === 0) return;
    setBusy(true);
    try {
      const res = await prod.deliver(req.id, {
        assets: valid.map((r) => ({ name: r.name.trim(), url: r.url.trim(), category: r.category, tags: ["delivery"], metadata: { deliveredFromRequestId: req.id } })),
        note: note.trim() || undefined,
      });
      await onRefresh();
      onError(`__ok__: Delivered ${res.assets.length} asset(s) to customer Library.`);
      onClose();
    } catch (e: any) {
      onError(e?.message || "Delivery failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <h4 className="text-sm font-bold text-white">Delivery (§18) — {(req.deliveries || []).length > 0 ? "delivery record" : "new delivery"}</h4>
      {(req.deliveries || []).length > 0 && (
        <div className="mt-2 space-y-1 text-[11px] text-zinc-300">
          {req.deliveries!.map((d, i) => (
            <p key={i} className="rounded-lg bg-zinc-900/60 px-2.5 py-1.5">
              Delivered {(d.assetIds || []).length} asset(s){d.deliveredByName ? ` by ${d.deliveredByName}` : ""}{d.deliveredAt ? ` · ${new Date(d.deliveredAt).toLocaleString()}` : ""}
              {d.note ? ` · ${d.note}` : ""}
            </p>
          ))}
        </div>
      )}
      {(req.deliveries || []).length === 0 && (
        <>
          <p className="mt-1 text-[11px] text-zinc-400">Final assets become available in the customer&apos;s Library and are recorded with Delivered At / By.</p>
          <div className="mt-2 space-y-2">
            {rows.map((r, i) => (
              <div key={i} className="flex flex-wrap gap-2">
                <input value={r.name} onChange={(e) => setRows((rs) => rs.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Asset name" className="w-40 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-[11px] text-zinc-200" />
                <input value={r.url} onChange={(e) => setRows((rs) => rs.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} placeholder="File URL (secure storage)" className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-[11px] text-zinc-200" />
                <select value={r.category} onChange={(e) => setRows((rs) => rs.map((x, j) => j === i ? { ...x, category: e.target.value } : x))} className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-[11px] text-zinc-200">
                  {["artwork", "motion", "document", "brand_asset", "social", "epk"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {rows.length > 1 && <button onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} className="rounded-lg border border-zinc-800 px-2 text-[11px] font-bold text-red-300">✕</button>}
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button onClick={() => setRows((rs) => [...rs, { name: "", url: "", category: "artwork" }])} className="rounded-lg border border-zinc-800 px-2.5 py-1.5 text-[11px] font-bold text-zinc-300">+ asset</button>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Delivery note (optional)" className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-[11px] text-zinc-200" />
            <button disabled={valid.length === 0 || busy} onClick={submit} className="rounded-lg bg-emerald-600 px-4 py-1.5 text-[11px] font-bold text-white disabled:opacity-50">
              {busy ? "Delivering…" : `Deliver ${valid.length} asset(s)`}
            </button>
          </div>
        </>
      )}
      <button onClick={onClose} className="mt-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-[11px] font-bold text-white">Close</button>
    </div>
  );
}

// §24 Mastering Inspector / Loudness Radar — internal Studio audio QA ONLY
// (Admin → Studio → Music Production → Audio QA). Never a customer tool.
export function OpsAudio() {
  const [audio, setAudio] = React.useState<Record<string, unknown> | null>(null);
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300">
      <h3 className="text-sm font-bold text-white">Audio QA — internal Studio only (§24)</h3>
      <p className="mt-1 text-zinc-500">Path: Admin → Studio → Music Production → Audio QA. Not in Brand workspace. Not a customer Artist tool.</p>
      <input type="file" accept="audio/*" className="mt-3 text-xs" onChange={(e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        void (async () => {
          try {
            const Ctx = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext });
            const AC = Ctx.AudioContext || Ctx.webkitAudioContext;
            if (!AC) throw new Error("WebAudio unavailable in this browser");
            const ctx = new AC();
            const dec = await ctx.decodeAudioData((await f.arrayBuffer()).slice(0));
            const ch = dec.getChannelData(0);
            let peak = 0;
            for (let i = 0; i < ch.length; i += 7) { const v = Math.abs(ch[i] || 0); if (v > peak) peak = v; }
            setAudio({
              fileName: f.name, mimeType: f.type, sizeBytes: f.size,
              sampleRateHz: dec.sampleRate,
              channels: dec.numberOfChannels, durationSeconds: Number(dec.duration.toFixed(2)),
              peakSample: Number(peak.toFixed(4)),
              clipping: peak >= 0.999,
              technicalWarnings: peak >= 0.999 ? ["Sample peak at or above 0dBFS — check clipping"] : [],
            });
            try { await ctx.close(); } catch { /* noop */ }
          } catch (err) {
            setAudio({ error: err instanceof Error ? err.message : "Decode failed" });
          }
        })();
      }} />
      {audio ? (
        <div className="mt-3 space-y-1 text-[11px]">
          {Object.entries(audio).map(([k, v]) => (
            <div key={k} className="grid grid-cols-[140px_1fr] gap-2 rounded-lg bg-zinc-900/60 px-2.5 py-1.5">
              <span className="font-bold uppercase text-zinc-500">{k}</span>
              <span className="text-zinc-200 break-words">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
            </div>
          ))}
        </div>
      ) : <p className="mt-3 text-[11px] text-zinc-500">Select an audio file to inspect format, sample rate, peak, duration & clipping.</p>}
    </div>
  );
}

// §13 Projects — global authorized project ledger.
function ProjectsSection() {
  const [projects, setProjects] = React.useState<Array<{ id: string; title?: string; status?: string; workspaceId: string; workspaceName?: string; workspaceIdentity?: string; customerName?: string }> | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const [identity, setIdentity] = React.useState("ALL");
  const load = React.useCallback(() => {
    setError(null);
    api.admin.getProjects().then((r: any) => setProjects(r.projects || [])).catch((e: any) => setError(e?.message || "Failed to load projects"));
  }, []);
  React.useEffect(() => { load(); }, [load]);
  const list = (projects || []).filter((p) =>
    (identity === "ALL" || (p.workspaceIdentity || "artist") === identity) &&
    (q === "" || (p.title || "").toLowerCase().includes(q.toLowerCase()) || (p.workspaceName || "").toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects…" className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 outline-none" />
        <select value={identity} onChange={(e) => setIdentity(e.target.value)} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200">
          {["ALL", "artist", "brand"].map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div className="mt-3 space-y-2">
        {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">{error}</div>}
        {projects === null && !error && <p className="p-6 text-center text-xs text-zinc-500">Loading projects…</p>}
        {projects !== null && list.length === 0 && <OpsEmpty title="No projects yet." hint="Customer projects (and request executions) will appear here." />}
        {list.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{p.title || "Untitled project"}</p>
              <p className="text-[11px] text-zinc-500">{p.customerName} · {p.workspaceName} · {p.workspaceIdentity || "artist"}</p>
            </div>
            <OpsPill v={p.status || "planning"} />
          </div>
        ))}
      </div>
    </div>
  );
}

// §27 LIBRARY → Assets — global delivery ledger with ownership context.
function AssetsSection() {
  const [assets, setAssets] = React.useState<Array<{ id: string; name: string; category?: string; folderName?: string; workspaceId: string; workspaceName?: string; workspaceIdentity?: string; customerName?: string; createdAt?: string }> | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const load = React.useCallback(() => {
    setError(null);
    api.admin.getAssets().then((r: any) => setAssets(r.assets || [])).catch((e: any) => setError(e?.message || "Failed to load assets"));
  }, []);
  React.useEffect(() => { load(); }, [load]);
  const list = (assets || []).filter((a) => q === "" || (a.name || "").toLowerCase().includes(q.toLowerCase()) || (a.workspaceName || "").toLowerCase().includes(q.toLowerCase()) || (a.customerName || "").toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search delivered assets / customer…" className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 outline-none" />
      <div className="mt-3 space-y-2">
        {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">{error}</div>}
        {assets === null && !error && <p className="p-6 text-center text-xs text-zinc-500">Loading assets…</p>}
        {assets !== null && list.length === 0 && <OpsEmpty title="No assets yet." hint="Delivered work flows here (Approved → Delivery → Library)." />}
        {list.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">{a.name}</p>
              <p className="text-[11px] text-zinc-500">{a.customerName} · {a.workspaceName} · {a.workspaceIdentity || "artist"} · {a.folderName || a.category || "asset"}{a.createdAt ? ` · ${new Date(a.createdAt).toLocaleDateString()}` : ""}</p>
            </div>
            <span className="rounded-lg bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-emerald-300">IN LIBRARY</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Shared context passed to each ops section (typed, no `any` leaks).
interface OpsCtx {
  requests: OpsReq[];
  jobs: OpsJob[];
  customers: OpsCustomer[];
  workspaces: OpsWorkspaceRow[];
  loading: boolean;
  refresh: () => Promise<void>;
  setError: (m: string) => void;
  openRequest: (r: OpsReq) => void;
  openWorkspace: (id: string) => void;
  openProduction?: (jobId: string) => void;
}
interface OpsCustomer { id: string; email: string; fullName?: string; status?: string }
interface OpsWorkspaceRow {
  id: string; name: string; identityType: string; status?: string; ownerEmail?: string;
  projectCount?: number; requestCount?: number; assetCount?: number; customerName?: string; updatedAt?: string;
}

function briefMissing(r: OpsReq): boolean { return !r.briefDetails && !r.description; }
function isToday(iso?: string): boolean { return !!iso && new Date(iso).toDateString() === new Date().toDateString(); }

// §8 Command Center — operational overview from real data. Empty states shown
// when there is genuinely no data.
function CommandCenter({ ctx }: { ctx: OpsCtx }) {
  const { requests, jobs } = ctx;
  const activeJobs = jobs.filter((j) => !["DELIVERED", "COMPLETED", "CANCELLED"].includes(j.status));
  const pendingRevs = requests.filter((r) => ["REVISION_REQUESTED", "REVISION"].includes(r.lifecycleStatus || "")).length;
  const kpis: Array<[string, number]> = [
    ["Requests Today", requests.filter((r) => isToday(r.createdAt)).length],
    ["Active Projects", activeJobs.length],
    ["Awaiting Brief", requests.filter((r) => briefMissing(r) && ["SUBMITTED", "REVIEWING"].includes(r.lifecycleStatus || "")).length],
    ["In Production", jobs.filter((j) => ["ASSIGNED", "IN_PRODUCTION", "SUBMITTED", "TRIAGED"].includes(j.status)).length],
    ["Internal QA", jobs.filter((j) => ["INTERNAL_QC", "INTERNAL_REVIEW"].includes(j.status)).length],
    ["Client Review", jobs.filter((j) => j.status === "CLIENT_REVIEW").length],
    ["Changes Requested", pendingRevs],
    ["Ready for Delivery", jobs.filter((j) => ["APPROVED", "FINAL_APPROVAL"].includes(j.status)).length],
    ["Delivered", jobs.filter((j) => ["DELIVERED", "COMPLETED"].includes(j.status)).length],
  ];
  const deadlines = jobs.filter((j) => j.dueDate && !["DELIVERED", "COMPLETED"].includes(j.status)).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6);
  const activity = jobs.slice().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")).slice(0, 6);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="text-sm font-bold text-white">COMMAND CENTER</h3>
        <p className="text-[11px] text-zinc-500 mt-1">Live operational pulse. Refresh reloads from the admin API.</p>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
          {kpis.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
              <p className="text-[10px] uppercase text-zinc-500">{label}</p>
              <p className="mt-1 text-2xl font-black text-white">{ctx.loading ? "…" : value}</p>
            </div>
          ))}
        </div>
        {ctx.loading && <p className="mt-2 text-[11px] text-zinc-500">Refreshing…</p>}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Recent Requests">
          {(requests).length === 0 ? <OpsEmpty title="No requests yet." hint="When customers submit creative requests, they will appear here." /> : requests.slice(0, 8).map((r) => (
            <button key={r.id} onClick={() => ctx.openRequest(r)} className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-left">
              <span className="min-w-0"><span className="block truncate text-xs font-bold text-white">{r.title || r.serviceName}</span><span className="block truncate text-[11px] text-zinc-500">{r.customerName} · {r.serviceName}</span></span>
              <OpsPill v={r.lifecycleStatus || r.status || "SUBMITTED"} />
            </button>
          ))}
        </Card>
        <Card title="Production Activity">
          {activity.length === 0 ? <p className="text-[11px] text-zinc-500">No production activity yet.</p> : activity.map((j) => (
            <div key={j.id} className="flex items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2">
              <span className="min-w-0"><span className="block truncate text-xs text-zinc-200">{j.serviceName}</span><span className="block truncate text-[11px] text-zinc-500">{j.customerName}</span></span>
              <OpsPill v={j.status} />
            </div>
          ))}
        </Card>
        <Card title="Upcoming Deadlines & Attention">
          <div className="space-y-1.5 text-[11px] text-zinc-300">
            <p className="font-bold text-amber-300">Awaiting admin action: {requests.filter((r) => briefMissing(r)).length} missing brief / {pendingRevs} changes</p>
            {deadlines.length === 0 && <p className="text-zinc-500">No upcoming deadlines in production.</p>}
            {deadlines.map((j) => <p key={j.id} className="rounded-lg bg-zinc-900/60 px-2.5 py-1.5">{j.serviceName} · <span className="text-amber-300">{new Date(j.dueDate).toLocaleDateString()}</span> · <OpsPill v={j.status} /></p>)}
          </div>
        </Card>
      </div>
    </div>
  );
}

// §12 Requests queue — search/filter + open full production detail.
function RequestsSection({ ctx }: { ctx: OpsCtx }) {
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("ALL");
  const [identity, setIdentity] = React.useState("ALL");
  const list = ctx.requests.filter((r) => {
    const s = r.lifecycleStatus || r.status || "SUBMITTED";
    return (status === "ALL" || s === status) &&
      (identity === "ALL" || (r.workspaceIdentity || "artist") === identity) &&
      (q === "" || [r.title, r.serviceName, r.customerName, r.workspaceName].some((v) => v && v.toLowerCase().includes(q.toLowerCase())));
  });
  const statuses = ["ALL", ...Object.keys(REQ_NEXT)];
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer / request / service…" className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 outline-none" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200">
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={identity} onChange={(e) => setIdentity(e.target.value)} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200">
          {["ALL", "artist", "brand"].map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div className="mt-3 space-y-2">
        {list.length === 0 ? <OpsEmpty title="No requests yet." hint="When customers submit creative requests, they will appear here." /> : list.map((r) => (
          <div key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{r.title || r.serviceName}</p>
                <p className="text-[11px] text-zinc-500">{r.customerName} · {r.serviceName} · {r.workspaceName} · {r.workspaceIdentity || "artist"}</p>
              </div>
              <div className="flex items-center gap-2"><OpsPill v={r.lifecycleStatus || r.status || "SUBMITTED"} /><button onClick={() => ctx.openRequest(r)} className="rounded-lg bg-red-600 px-2.5 py-1.5 text-[11px] font-bold text-white">Open</button></div>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">{r.briefDetails || r.description || <span className="text-red-400">Missing brief</span>}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// §14 Production Queue — filterable (type/status/assigned) with queue actions.
function QueueSection({ ctx }: { ctx: OpsCtx }) {
  const prod = api.production as unknown as OpsProdApi;
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("ALL");
  const [identity, setIdentity] = React.useState("ALL");
  const list = ctx.jobs.filter((j) =>
    (status === "ALL" || j.status === status) &&
    (identity === "ALL" || (j.identity || "artist") === identity) &&
    (q === "" || [j.serviceName, j.customerName, j.assignedProducer, j.assignedStudio].some((v) => v && v.toLowerCase().includes(q.toLowerCase())))
  );
  const nextStatuses = (s: string): string[] => ({
    SUBMITTED: ["TRIAGED"], TRIAGED: ["ASSIGNED"], ASSIGNED: ["IN_PRODUCTION"], IN_PRODUCTION: ["INTERNAL_REVIEW"],
    INTERNAL_REVIEW: ["CLIENT_REVIEW"], CLIENT_REVIEW: ["APPROVED", "REVISION_REQUESTED"], REVISION_REQUESTED: ["IN_PRODUCTION"],
    APPROVED: ["DELIVERED"], DELIVERED: [],
  } as Record<string, string[]>)[s] || [];
  const run = (j: OpsJob, s: string) => prod.jobs.transition(j.id, s).then(ctx.refresh).catch((e: any) => ctx.setError(e?.message || "Transition failed"));
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jobs…" className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 outline-none" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200">
          {["ALL", "SUBMITTED", "TRIAGED", "ASSIGNED", "IN_PRODUCTION", "INTERNAL_REVIEW", "CLIENT_REVIEW", "REVISION_REQUESTED", "APPROVED", "DELIVERED"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={identity} onChange={(e) => setIdentity(e.target.value)} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200">
          {["ALL", "artist", "brand"].map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {list.length === 0 ? <OpsEmpty title="No production items." hint="Approved requests become jobs that appear here." /> : list.map((j) => {
          const nexts = nextStatuses(j.status);
          return (
            <div key={j.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{j.serviceName}</p>
                  <p className="text-[11px] text-zinc-500">{j.customerName} · {j.identity || "artist"} · {j.assignedStudio || "Unassigned"} / {j.assignedProducer || "Unassigned"}</p>
                </div>
                <OpsPill v={j.status} />
              </div>
              <div className="mt-1 text-[11px] text-zinc-400">{j.deliverables?.length || 0} deliverable(s){j.dueDate ? ` · due ${new Date(j.dueDate).toLocaleDateString()}` : ""}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {nexts.map((s) => <button key={s} onClick={() => run(j, s)} className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-bold text-white">→ {s}</button>)}
                {j.status === "DELIVERED" ? (
                  <span className="rounded-lg bg-zinc-800 px-2 py-1 text-[11px] font-bold text-emerald-300">
                    {(j.deliverables || []).reduce((acc, d) => acc + (d.versions || []).length, 0)} version(s) · delivered
                  </span>
                ) : (
                  <button onClick={() => prod.jobs.deliver(j.id).then(ctx.refresh).catch((e: any) => ctx.setError(e?.message || "Deliver failed"))} className="rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white">Deliver</button>
                )}
              </div>
              {ctx.openProduction && nexts.length === 0 && (
                <button onClick={() => { if (ctx.openProduction) ctx.openProduction(j.id); }} className="mt-1 w-full rounded-lg bg-zinc-800 px-2 py-1 text-[11px] font-bold text-white">Open production engine</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// §17 Review — work awaiting internal/client review with transition actions.
function ReviewSection({ ctx }: { ctx: OpsCtx }) {
  const prod = api.production as unknown as OpsProdApi;
  const reviewReq = ctx.requests.filter((r) => ["IN_REVIEW", "REVISION_REQUESTED", "CLIENT_REVIEW", "INTERNAL_QC", "REVISION"].includes(r.lifecycleStatus || ""));
  const reviewJobs = ctx.jobs.filter((j) => ["INTERNAL_REVIEW", "CLIENT_REVIEW", "REVISION_REQUESTED", "APPROVED"].includes(j.status));
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Requests in review">
        {reviewReq.length === 0 ? <OpsEmpty title="Nothing in review." hint="ADC requests awaiting internal or client review appear here." /> : reviewReq.map((r) => (
          <div key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="flex items-center justify-between gap-2"><p className="truncate text-xs font-bold text-white">{r.title || r.serviceName}</p><OpsPill v={r.lifecycleStatus || "SUBMITTED"} /></div>
            <button onClick={() => ctx.openRequest(r)} className="mt-1 rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white">Open for review</button>
          </div>
        ))}
      </Card>
      <Card title="Production review queue">
        {reviewJobs.length === 0 ? <OpsEmpty title="Queue clear." hint="QA, reviews and revisions surface here." /> : reviewJobs.map((j) => (
          <div key={j.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="flex items-center gap-2 justify-between"><p className="truncate text-xs font-bold text-white">{j.serviceName}</p><OpsPill v={j.status} /></div>
            <div className="mt-1 flex flex-wrap gap-2">
              {(j.status === "CLIENT_REVIEW" ? ["APPROVED", "REVISION_REQUESTED"] : j.status === "INTERNAL_REVIEW" ? ["CLIENT_REVIEW"] : j.status === "REVISION_REQUESTED" ? ["IN_PRODUCTION"] : ["DELIVERED"]).map((s) => (
                <button key={s} onClick={() => prod.jobs.transition(j.id, s).then(ctx.refresh).catch((e: any) => ctx.setError(e?.message))} className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-bold text-white">→ {s}</button>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// §18 Deliveries — delivered work with Delivered At / By / version records.
function DeliveriesSection({ ctx }: { ctx: OpsCtx }) {
  const deliveredJobs = ctx.jobs.filter((j) => ["DELIVERED", "COMPLETED"].includes(j.status)).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  return (
    <Card title="Deliveries (§18 → Library)">
      {deliveredJobs.length === 0 ? <OpsEmpty title="No deliveries yet." hint="Approved production that has been delivered appears here, and the assets land in the customer's Library." /> : deliveredJobs.map((j) => {
        const del = (j as OpsJob).finalDelivery;
        const versions = (j.deliverables || []).reduce((acc, d) => acc + (d.versions || []).length, 0);
        return (
          <div key={j.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">{j.serviceName}</p>
                <p className="text-[11px] text-zinc-500">{j.customerName} · {j.identity || "artist"} · {versions} version(s) · {(j.deliverables || []).length} deliverable(s)</p>
              </div>
              <OpsPill v={j.status} />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              {del ? `Delivered ${del.createdAssetIds?.length || 0} asset(s)` : ""}
              {del?.deliveredByName ? ` by ${del.deliveredByName}` : ""}
              {del?.deliveredAt ? ` · ${new Date(del.deliveredAt).toLocaleString()}` : ""}
            </p>
          </div>
        );
      })}
    </Card>
  );
}

// §23 Internal Studio Engines — registry only; operated by Studio via the queue.
function StudioSection() {
  const engines: Array<[string, string]> = [
    ["Cover Renderer", "Artwork engine for artist cover art (internal)"],
    ["Lyrics Renderer", "Typographic lyric visuals (internal)"],
    ["Motion Generator", "Motion & video output (internal)"],
    ["Document Generator", "Business documents / contracts (internal)"],
    ["Presentation Generator", "Brand presentations (internal)"],
    ["Brand Kit Generator", "Brand identity kits (internal)"],
    ["Asset Packager", "Release/brand asset kits (internal)"],
    ["Audio QA / Loudness Radar", "Mastering inspection — see Audio QA section (§24)"],
  ];
  return (
    <Card title="Studio — Creative Engines">
      <p className="text-[11px] text-zinc-500 mb-3">Admin → Studio. Engines are operated internally through the production queue (create deliverables → versions → review → deliver). No customer DIY exposure.</p>
      <div className="grid gap-2 md:grid-cols-2">
        {engines.map(([name, desc]) => (
          <div key={name} className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5">
            <p className="text-xs font-bold text-white">{name}</p>
            <p className="text-[11px] text-zinc-500">{desc}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// §30 Attention queue — actionable operational items.
function AttentionSection({ ctx }: { ctx: OpsCtx }) {
  const newReqs = ctx.requests.filter((r) => ["SUBMITTED", "REVIEWING"].includes(r.lifecycleStatus || ""));
  const missingBrief = ctx.requests.filter((r) => briefMissing(r));
  const unassigned = ctx.jobs.filter((j) => ["SUBMITTED", "TRIAGED"].includes(j.status) || !j.assignedProducer);
  const awaitingQa = ctx.jobs.filter((j) => ["INTERNAL_QC", "INTERNAL_REVIEW"].includes(j.status));
  const clientReview = ctx.jobs.filter((j) => j.status === "CLIENT_REVIEW");
  const changes = ctx.requests.filter((r) => ["REVISION_REQUESTED", "REVISION"].includes(r.lifecycleStatus || ""));
  const ready = ctx.jobs.filter((j) => j.status === "APPROVED");
  const counts: Array<[string, number]> = [["New requests", newReqs.length], ["Missing brief", missingBrief.length], ["Awaiting assignment", unassigned.length], ["Awaiting QA", awaitingQa.length], ["Awaiting client review", clientReview.length], ["Changes requested", changes.length], ["Ready to deliver", ready.length]];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Attention Queue">
        <ul className="space-y-1.5 text-[11px] text-zinc-300">
          {counts.map(([label, n]) => (
            <li key={label} className="rounded-lg bg-zinc-900/60 px-2.5 py-1.5 flex justify-between">
              <span>{label}</span><span className={`font-bold ${label.startsWith("Missing") || label.startsWith("Changes") ? "text-amber-300" : label.startsWith("Ready") ? "text-emerald-300" : "text-zinc-100"}`}>{n}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Needs a brief (§12)">
        {missingBrief.length === 0 ? <p className="text-[11px] text-zinc-500">All requests have briefs.</p> : missingBrief.slice(0, 10).map((r) => (
          <button key={r.id} onClick={() => ctx.openRequest(r)} className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-left">
            <span className="min-w-0"><span className="block truncate text-xs text-zinc-200">{r.title || r.serviceName}</span><span className="block truncate text-[11px] text-zinc-500">{r.customerName}</span></span>
            <OpsPill v={r.lifecycleStatus || "SUBMITTED"} />
          </button>
        ))}
      </Card>
    </div>
  );
}

// §9 Customer Operations — join customers to their workspaces for a live
// operational table (Customer, Workspace, Type, Status, counts, latest activity).
function CustomersSection({ ctx }: { ctx: OpsCtx }) {
  const rows = ctx.customers.map((c) => ({ c, ws: ctx.workspaces.find((w) => w.ownerEmail === c.email) }));
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 overflow-auto">
      <h3 className="text-sm font-bold text-white">Customers</h3>
      <table className="mt-2 w-full min-w-[720px] text-left text-[11px]">
        <thead><tr className="text-zinc-500 border-b border-zinc-800">
          <th className="py-1.5 px-2">Customer</th><th className="px-2">Workspace</th><th className="px-2">Type</th><th className="px-2">Status</th>
          <th className="px-2 text-right">Proj</th><th className="px-2 text-right">Req</th><th className="px-2 text-right">Assets</th><th className="px-2 text-right">Latest</th><th className="px-2"></th>
        </tr></thead>
        <tbody>
          {rows.length === 0 ? <tr><td colSpan={9} className="py-6 text-center text-zinc-500">No customers yet. Sign-ups appear here.</td></tr> : rows.map(({ c, ws: w }) => (
            <tr key={c.id} className="border-b border-zinc-800/60 hover:bg-zinc-900/60">
              <td className="py-2 px-2"><strong className="text-white">{c.fullName || c.email}</strong><br /><span className="text-zinc-500">{c.email}</span></td>
              <td className="py-2 px-2 text-zinc-300">{w?.name || "—"}</td>
              <td className="py-2 px-2 text-zinc-300">{w?.identityType || "—"}</td>
              <td className="py-2 px-2"><OpsPill v={w?.status || c.status || "active"} /></td>
              <td className="py-2 px-2 text-right text-zinc-300">{w?.projectCount || 0}</td>
              <td className="py-2 px-2 text-right text-zinc-300">{w?.requestCount || 0}</td>
              <td className="py-2 px-2 text-right text-zinc-300">{w?.assetCount || 0}</td>
              <td className="py-2 px-2 text-right text-zinc-400">{w?.updatedAt ? new Date(w.updatedAt).toLocaleDateString() : "—"}</td>
              <td className="py-2 px-2">{w ? <button onClick={() => ctx.openWorkspace(w.id)} className="rounded-lg bg-red-600 px-2 py-1 text-[10px] font-bold text-white">Inspect</button> : <span className="text-zinc-500">no ws</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// §10 Workspace register — list + Inspect (opens WorkspaceInspect overlay).
function WorkspacesSection({ ctx }: { ctx: OpsCtx }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 overflow-auto">
      <h3 className="text-sm font-bold text-white">Workspaces <span className="text-zinc-500">(isolated by workspaceId)</span></h3>
      <table className="mt-2 w-full min-w-[640px] text-left text-[11px]">
        <thead><tr className="text-zinc-500 border-b border-zinc-800">
          <th className="py-1.5 px-2">Workspace</th><th className="px-2">Type</th><th className="px-2">Owner</th><th className="px-2">Status</th><th className="px-2 text-right">Counts</th><th className="px-2"></th>
        </tr></thead>
        <tbody>
          {ctx.workspaces.length === 0 ? <tr><td colSpan={6} className="py-6 text-center text-zinc-500">No workspaces. Customer workspaces appear here.</td></tr> : ctx.workspaces.map((w) => (
            <tr key={w.id} className="border-b border-zinc-800/60 hover:bg-zinc-900/60">
              <td className="py-2 px-2 text-white">{w.name}</td>
              <td className="py-2 px-2 text-zinc-300">{w.identityType}</td>
              <td className="py-2 px-2 text-zinc-300">{w.customerName || w.ownerEmail || "—"}</td>
              <td className="py-2 px-2"><OpsPill v={w.status || "active"} /></td>
              <td className="py-2 px-2 text-right text-zinc-400">{w.projectCount || 0} proj · {w.requestCount || 0} req · {w.assetCount || 0} assets</td>
              <td className="py-2 px-2"><button onClick={() => ctx.openWorkspace(w.id)} className="rounded-lg bg-red-600 px-2 py-1 text-[10px] font-bold text-white">Inspect</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// §28 Scoped Admin Search — authorization-respecting, limited result sets.
function SearchSection({ ctx }: { ctx: OpsCtx }) {
  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<{ requests: any[]; projects: any[]; workspaces: any[]; users: any[]; assets: any[] } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const submit = async (query: string) => {
    setQ(query);
    if (!query.trim()) { setResults(null); return; }
    setError(null);
    try { const r: any = await api.admin.search(query.trim()); setResults(r.results); }
    catch (e: any) { setError(e?.message || "Search failed"); }
  };
  const gCount = (k: string) => ((results && results[k as keyof typeof results]) || []).length;
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <h3 className="text-sm font-bold text-white">Admin Search §28</h3>
      <div className="mt-2 flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void submit(q); }} placeholder="Search customers, workspaces, requests, projects, assets…" className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 outline-none" />
        <button onClick={() => void submit(q)} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white">Search</button>
      </div>
      {error && <div className="mt-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">{error}</div>}
      {results && (
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <Card title={`Requests (${gCount("requests")})`}>{results.requests.length === 0 ? <p className="text-[11px] text-zinc-500">None.</p> : results.requests.map((r) => <button key={r.id} onClick={() => ctx.openRequest(ctx.requests.find((x) => x.id === r.id) || r)} className="flex w-full items-center justify-between gap-2 rounded-lg bg-zinc-900/60 px-2.5 py-1.5 text-left"><span className="truncate text-[11px] text-zinc-200">{r.title}</span><OpsPill v={r.status} /></button>)}</Card>
          <Card title={`Workspaces (${gCount("workspaces")})`}>{results.workspaces.length === 0 ? <p className="text-[11px] text-zinc-500">None.</p> : results.workspaces.map((w) => <button key={w.id} onClick={() => ctx.openWorkspace(w.id)} className="flex w-full items-center justify-between gap-2 rounded-lg bg-zinc-900/60 px-2.5 py-1.5 text-left"><span className="truncate text-[11px] text-zinc-200">{w.name}</span><span className="text-zinc-500">{w.identity}</span></button>)}</Card>
          <Card title={`Projects (${gCount("projects")})`}>{results.projects.length === 0 ? <p className="text-[11px] text-zinc-500">None.</p> : results.projects.map((p) => <div key={p.id} className="rounded-lg bg-zinc-900/60 px-2.5 py-1.5 text-[11px] text-zinc-200">{p.title} <span className="text-zinc-500">· {p.workspaceName}</span></div>)}</Card>
          <Card title={`Assets (${gCount("assets")})`}>{results.assets.length === 0 ? <p className="text-[11px] text-zinc-500">None.</p> : results.assets.map((a) => <div key={a.id} className="rounded-lg bg-zinc-900/60 px-2.5 py-1.5 text-[11px] text-zinc-200">{a.name} <span className="text-zinc-500">· {a.workspaceName}</span></div>)}</Card>
        </div>
      )}
      {!results && <p className="mt-3 text-[11px] text-zinc-500">Search is scoped and authorization-aware — never a raw database dump.</p>}
    </div>
  );
}

// ============================================================
// OpsConsole — the canonical Admin Studio Operations environment.
// Rendered INSIDE the Admin shell as the production-facing workspace
// (§40 Admin → Customer → Workspace → Project flow, return anytime).
// ============================================================
export function OpsConsole({ section, canProduction, openProduction }: {
  section: OpsSection;
  canProduction: boolean;
  openProduction?: (jobId: string) => void;
}) {
  const ops = useOpsData();
  const [detailReq, setDetailReq] = React.useState<OpsReq | null>(null);
  const [viewWs, setViewWs] = React.useState<string | null>(null);
  const [flash, setFlash] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const setNotice = (m: string) => {
    if (m.startsWith("__ok__")) { setFlash({ kind: "ok", text: m.replace("__ok__: ", "") }); }
    else setFlash({ kind: "err", text: m });
  };

  const ctx: OpsCtx = {
    requests: ops.requests as OpsReq[],
    jobs: ops.jobs as OpsJob[],
    customers: ops.customers as OpsCustomer[],
    workspaces: ops.workspaces as OpsWorkspaceRow[],
    loading: ops.loading,
    refresh: async () => { await (ops.load as () => Promise<void>)(); },
    setError: setNotice,
    openRequest: (r) => { setFlash(null); setDetailReq(r); },
    openWorkspace: (id) => { setFlash(null); setDetailReq(null); setViewWs(id); },
    openProduction,
  };

  const openWorkspaceFromDetail = (id: string) => { setDetailReq(null); setViewWs(id); };

  return (
    <div className="min-w-0 flex-1 space-y-4">
      {flash && <div className={`rounded-2xl border px-4 py-2.5 text-xs ${flash.kind === "ok" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>{flash.text}</div>}
      {ops.error && <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">{ops.error} <button onClick={() => void ops.load()} className="ml-2 underline">Retry</button></div>}

      {detailReq ? (
        <RequestDetail req={detailReq} onClose={() => setDetailReq(null)} onRefresh={async () => { await (ops.load as () => Promise<void>)(); }} onError={setNotice} openWorkspace={openWorkspaceFromDetail} />
      ) : viewWs ? (
        <WorkspaceInspect wsId={viewWs} onClose={() => setViewWs(null)} openRequest={(r) => { setViewWs(null); setDetailReq(r); }} />
      ) : section === "operations" ? (
        <CommandCenter ctx={ctx} />
      ) : section === "requests" ? (
        <RequestsSection ctx={ctx} />
      ) : section === "queue" ? (
        canProduction ? <QueueSection ctx={ctx} /> : <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-xs text-zinc-400">The production queue requires a full operations (admin/super_admin) role.</div>
      ) : section === "review" ? (
        <ReviewSection ctx={ctx} />
      ) : section === "deliveries" ? (
        <DeliveriesSection ctx={ctx} />
      ) : section === "customers" ? (
        <CustomersSection ctx={ctx} />
      ) : section === "workspaces" ? (
        <WorkspacesSection ctx={ctx} />
      ) : section === "projects" ? (
        <ProjectsSection />
      ) : section === "library" ? (
        <AssetsSection />
      ) : section === "studio" ? (
        <StudioSection />
      ) : section === "audio" ? (
        <OpsAudio />
      ) : section === "attention" ? (
        <AttentionSection ctx={ctx} />
      ) : section === "search" ? (
        <SearchSection ctx={ctx} />
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-xs text-zinc-400">Select an operations section.</div>
      )}
    </div>
  );
}










