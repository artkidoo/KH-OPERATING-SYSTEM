import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { useMembership } from "../hooks/useMembership";
import { api } from "../services/api";
import { CreativeRequest } from "../types";
import {
  Inbox,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Send,
  Calendar,
  Link as LinkIcon,
  RefreshCw,
  FolderKanban,
  FileText,
  Palette,
  Film,
  Newspaper,
  Layers,
} from "lucide-react";

const REQUEST_TYPES = [
  { id: "single_artwork", label: "Single Artwork", icon: Palette, desc: "3000×3000 master cover & social cuts" },
  { id: "full_release_package", label: "Full Release Package", icon: Layers, desc: "Artwork + 25 social, DSP & motion assets" },
  { id: "brand_identity", label: "Brand Identity", icon: Sparkles, desc: "Logos, brand guidelines & typography" },
  { id: "motion_visualizer", label: "Motion Visualizer", icon: Film, desc: "9:16 vertical loops & YouTube canvas" },
  { id: "social_content_pack", label: "Social Content Pack", icon: FolderKanban, desc: "10x promotional carousels & stories" },
  { id: "press_epk", label: "Press / EPK Materials", icon: Newspaper, desc: "Electronic Press Kit & one-sheet PDF" },
  { id: "custom_request", label: "Custom Request", icon: FileText, desc: "Tailored agency scope & production" },
];

const TIMELINES = [
  { id: "express", label: "Express (24–48 Hours)", badge: "Priority" },
  { id: "standard", label: "Standard (3–5 Days)", badge: "Included" },
  { id: "planned", label: "Future Rollout (1–2 Weeks)", badge: "Flexible" },
];

const STATUS_ORDER = [
  "SUBMITTED",
  "ACCEPTED",
  "IN_PRODUCTION",
  "IN_REVIEW",
  "COMPLETED",
  "DELIVERED",
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  SUBMITTED: { label: "Requested", color: "text-zinc-400 bg-zinc-800" },
  ACCEPTED: { label: "Accepted", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  IN_PRODUCTION: { label: "In Production", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  APPROVED_FOR_PRODUCTION: { label: "In Production", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  IN_REVIEW: { label: "In Review", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  REVISION_REQUESTED: { label: "Revision", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  COMPLETED: { label: "Completed", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  DELIVERED: { label: "Delivered", color: "text-emerald-300 bg-emerald-500/20 border-emerald-500/30" },
};

export function RequestsView({
  onNotify,
}: {
  onNotify: (m: string, t?: "success" | "info" | "error") => void;
}) {
  const { activeWorkspace } = useAuth();
  const { workspace, projects, assets, brandCore } = useWorkspace();
  const { identity, plan } = useMembership();
  const wsId = workspace?.id || activeWorkspace?.id || "";

  const [items, setItems] = useState<CreativeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  // Form states
  const [selectedType, setSelectedType] = useState("single_artwork");
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "");
  const [title, setTitle] = useState("");
  const [creativeDirection, setCreativeDirection] = useState("");
  const [timeline, setTimeline] = useState("standard");
  const [referenceLinks, setReferenceLinks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Revision state
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [revisionNote, setRevisionNote] = useState("");

  const loadRequests = async () => {
    if (!wsId) return;
    setLoading(true);
    try {
      const res = await api.creativeRequests.list(wsId);
      setItems(res.requests || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [wsId]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      onNotify("Please provide a request title.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const autoContext = `Identity: ${identity.toUpperCase()} | Plan: ${plan.toUpperCase()} | Project: ${
        projects.find((p) => p.id === selectedProjectId)?.title || "General"
      } | Timeline: ${timeline.toUpperCase()}`;

      const fullDescription = `${creativeDirection}\n\n[References]\n${referenceLinks || "None provided"}\n\n[Production Specs]\n${autoContext}`;

      await api.creativeRequests.create(wsId, {
        title: title.trim(),
        requestType: selectedType,
        serviceName: selectedType,
        projectId: selectedProjectId || undefined,
        description: fullDescription,
        briefDetails: fullDescription,
        lifecycleStatus: "SUBMITTED",
        membershipEntitlement: plan,
      } as Partial<CreativeRequest>);

      setTitle("");
      setCreativeDirection("");
      setReferenceLinks("");
      setShowNewModal(false);
      onNotify("Creative request dispatched to KeedoHub Studio.", "success");
      loadRequests();
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : "Failed to submit request", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestRevision = async (r: CreativeRequest) => {
    if (!revisionNote.trim()) {
      onNotify("Please detail what adjustments are needed.", "error");
      return;
    }
    try {
      await api.creativeRequests.requestRevision(wsId, r.id, {
        reason: revisionNote.trim(),
        instructions: revisionNote.trim(),
      });
      setRevisionNote("");
      onNotify("Revision sent to KeedoHub production team.", "success");
      loadRequests();
    } catch (err: unknown) {
      onNotify("Failed to submit revision.", "error");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase">
              KeedoHub Production Services
            </span>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold text-white tracking-tight">
              Creative Request Desk
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Request bespoke agency deliverables, track real-time production lifecycle, and review staging assets before final approval.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-500 transition-colors cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              Request New Work
            </button>
            <button
              onClick={loadRequests}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh requests"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {items.map((req) => {
          const isExpanded = expandedRequestId === req.id;
          const statusInfo =
            STATUS_LABELS[req.lifecycleStatus || "SUBMITTED"] || {
              label: req.lifecycleStatus || "Submitted",
              color: "text-zinc-400 bg-zinc-800",
            };
          const project = projects.find((p) => p.id === req.projectId);

          return (
            <div
              key={req.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-950/80 overflow-hidden shadow-sm transition-all"
            >
              <div
                onClick={() => setExpandedRequestId(isExpanded ? null : req.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-zinc-900/40"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                    {project && (
                      <span className="text-[11px] font-semibold text-zinc-400">
                        Project: {project.title}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white">{req.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {req.description?.split("\n")[0] || "Agency production request"}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-[11px] font-mono text-zinc-500">
                    {new Date(req.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
              </div>

              {/* Expanded Production Timeline & Review Panel */}
              {isExpanded && (
                <div className="border-t border-zinc-800/80 bg-zinc-900/30 p-5 space-y-5">
                  {/* Visual Production Timeline Bar */}
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
                      Production Pipeline
                    </span>
                    <div className="grid grid-cols-6 gap-1">
                      {STATUS_ORDER.map((s, idx) => {
                        const currentIdx = STATUS_ORDER.indexOf(
                          req.lifecycleStatus === "APPROVED_FOR_PRODUCTION"
                            ? "IN_PRODUCTION"
                            : req.lifecycleStatus || "SUBMITTED"
                        );
                        const isDone = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div
                            key={s}
                            className={`rounded-lg p-2 text-center border text-[10px] font-bold uppercase transition-all ${
                              isCurrent
                                ? "bg-red-500/20 border-red-500 text-red-300"
                                : isDone
                                ? "bg-zinc-900 border-emerald-500/30 text-emerald-400"
                                : "bg-zinc-950/60 border-zinc-800 text-zinc-600"
                            }`}
                          >
                            <span className="block truncate">{s.replace("_", " ")}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Creative Scope Detail */}
                  <div className="rounded-2xl bg-zinc-950 border border-zinc-800/80 p-4">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Brief & Directives
                    </span>
                    <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                      {req.description}
                    </p>
                  </div>

                  {/* Feedback / Revision Action */}
                  <div className="rounded-2xl bg-zinc-950 border border-zinc-800/80 p-4 space-y-3">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-red-400" />
                      Request Revision / Feedback to Production
                    </span>
                    <textarea
                      value={revisionNote}
                      onChange={(e) => setRevisionNote(e.target.value)}
                      placeholder="Specify font modifications, color balancing, or asset variant requests..."
                      rows={2}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleRequestRevision(req)}
                        className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-500 transition-colors cursor-pointer shadow-sm"
                      >
                        Submit Revision
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {items.length === 0 && !loading && (
          <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center space-y-3">
            <Inbox className="mx-auto w-10 h-10 text-zinc-600" />
            <h3 className="text-base font-bold text-white">No active creative requests</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Need custom cover art, motion visualizers, branding, or marketing suites? Dispatch a request directly to KeedoHub.
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Submit First Request
            </button>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                  KeedoHub Production Desk
                </span>
                <h3 className="text-lg font-bold text-white">Request Creative Work</h3>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="rounded-xl border border-zinc-800 p-1.5 text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Select Type */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                1. Select Request Type
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                {REQUEST_TYPES.map((rt) => {
                  const active = selectedType === rt.id;
                  const Icon = rt.icon;
                  return (
                    <button
                      key={rt.id}
                      type="button"
                      onClick={() => setSelectedType(rt.id)}
                      className={`flex items-start gap-2.5 rounded-2xl p-3 text-left border transition-all cursor-pointer ${
                        active
                          ? "bg-red-500/15 border-red-500 shadow-sm"
                          : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="rounded-xl bg-zinc-800 p-2 text-zinc-300">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{rt.label}</p>
                        <p className="text-[10px] text-zinc-400">{rt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Project Association */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  2. Associate Project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="">General (No specific project)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      Project: {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Required Timeline
                </label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  {TIMELINES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 3: Title & Creative Direction */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Request Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Single Artwork & 3D Typography for LIGHT"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Creative Direction & Notes
                </label>
                <textarea
                  value={creativeDirection}
                  onChange={(e) => setCreativeDirection(e.target.value)}
                  placeholder="Detail mood, key visual elements, color desires, and delivery requirements..."
                  rows={3}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Reference Links / Moodboard URLs (Pinterest, Dropbox, Behance)
                </label>
                <input
                  type="text"
                  value={referenceLinks}
                  onChange={(e) => setReferenceLinks(e.target.value)}
                  placeholder="https://pinterest.com/..., https://drive.google.com/..."
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50 transition-colors cursor-pointer shadow-md"
              >
                {isSubmitting ? "Submitting..." : "Submit to KeedoHub"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
