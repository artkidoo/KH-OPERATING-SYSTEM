import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ProductionJob, ProductionDeliverable, ProductionJobStatus } from "../types";
import {
  ShieldCheck,
  Factory,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Plus,
  Send,
  Upload,
  Eye,
  FileText,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  Lock,
  Calendar,
  User,
  Layers,
  Check,
} from "lucide-react";

const PRODUCTION_STATUSES: { id: ProductionJobStatus; label: string; color: string }[] = [
  { id: "SUBMITTED", label: "Submitted", color: "bg-zinc-800 text-zinc-300 border-zinc-700" },
  { id: "TRIAGED", label: "Triaged", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { id: "ASSIGNED", label: "Assigned", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { id: "IN_PRODUCTION", label: "In Production", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  { id: "INTERNAL_REVIEW", label: "Internal Review", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  { id: "CLIENT_REVIEW", label: "Client Review", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { id: "REVISION_REQUESTED", label: "Revision Requested", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  { id: "APPROVED", label: "Approved", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { id: "DELIVERED", label: "Delivered", color: "bg-emerald-600/20 text-emerald-300 border-emerald-500/40" },
];

const STUDIOS = [
  "Visual Art & Artwork",
  "Motion & Video",
  "Music & Audio",
  "Brand Identity",
  "EPK & Editorial",
  "Creative Marketing",
];

export function ProductionCenter({
  onNotify,
}: {
  onNotify: (m: string, t?: "success" | "info" | "error") => void;
}) {
  const { token, user } = useAuth();

  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [studioFilter, setStudioFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Edit fields for selected job
  const [assignedStudio, setAssignedStudio] = useState("");
  const [assignedProducer, setAssignedProducer] = useState("");
  const [priority, setPriority] = useState("normal");
  const [dueDate, setDueDate] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [clientVisibleNotes, setClientVisibleNotes] = useState("");
  const [savingJob, setSavingJob] = useState(false);

  // Deliverable version upload form state
  const [activeUploadDelId, setActiveUploadDelId] = useState<string | null>(null);
  const [newVerTitle, setNewVerTitle] = useState("");
  const [newVerPreviewUrl, setNewVerPreviewUrl] = useState("");
  const [newVerFileUrl, setNewVerFileUrl] = useState("");
  const [newVerNotes, setNewVerNotes] = useState("");
  const [newVerStatus, setNewVerStatus] = useState<"client_review" | "internal">("client_review");
  const [submittingVersion, setSubmittingVersion] = useState(false);

  // New deliverable package form
  const [showAddDeliverable, setShowAddDeliverable] = useState(false);
  const [newDelTitle, setNewDelTitle] = useState("");
  const [newDelCategory, setNewDelCategory] = useState("artwork");
  const [newDelFormat, setNewDelFormat] = useState("JPG / PNG");
  const [newDelSpecs, setNewDelSpecs] = useState("3000x3000px 300DPI");
  const [creatingDeliverable, setCreatingDeliverable] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/production/jobs", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        const loaded: ProductionJob[] = data.jobs || [];
        setJobs(loaded);
        if (loaded.length > 0 && !selectedJobId) {
          setSelectedJobId(loaded[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load production jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0] || null;

  // Sync edit form when selected job changes
  useEffect(() => {
    if (selectedJob) {
      setAssignedStudio(selectedJob.assignedStudio || "Visual Art & Artwork");
      setAssignedProducer(selectedJob.assignedProducer || user?.fullName || "Studio Producer");
      setPriority(selectedJob.priority || "normal");
      setDueDate(selectedJob.dueDate || "");
      setInternalNotes(selectedJob.internalNotes || "");
      setClientVisibleNotes(selectedJob.clientVisibleNotes || "");
    }
  }, [selectedJob?.id]);

  // Handle status transition
  const handleTransition = async (newStatus: ProductionJobStatus) => {
    if (!selectedJob) return;
    try {
      const res = await fetch(`/api/admin/production/jobs/${selectedJob.id}/transition`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      onNotify(`Job status moved to ${newStatus}.`, "success");
      await fetchJobs();
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : "Error updating status", "error");
    }
  };

  // Handle saving assignment, metadata and notes
  const handleSaveJobMetadata = async () => {
    if (!selectedJob) return;
    try {
      setSavingJob(true);
      const res = await fetch(`/api/admin/production/jobs/${selectedJob.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          assignedStudio,
          assignedProducer,
          priority,
          dueDate,
          internalNotes,
          clientVisibleNotes,
        }),
      });
      if (!res.ok) throw new Error("Failed to save changes");

      onNotify("Production job updated.", "success");
      await fetchJobs();
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSavingJob(false);
    }
  };

  // Handle adding a new deliverable version
  const handleAddVersion = async (deliverableId: string) => {
    if (!selectedJob) return;
    if (!newVerPreviewUrl.trim() && !newVerFileUrl.trim()) {
      onNotify("Please provide a preview or file URL.", "error");
      return;
    }

    try {
      setSubmittingVersion(true);
      const res = await fetch(
        `/api/admin/production/jobs/${selectedJob.id}/deliverables/${deliverableId}/versions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            title: newVerTitle.trim() || undefined,
            previewUrl: newVerPreviewUrl.trim(),
            fileUrl: newVerFileUrl.trim() || newVerPreviewUrl.trim(),
            notes: newVerNotes.trim() || undefined,
            status: newVerStatus,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to attach version");

      onNotify(
        newVerStatus === "client_review"
          ? "Version uploaded and published for Client Review."
          : "Internal work version attached.",
        "success"
      );

      setActiveUploadDelId(null);
      setNewVerTitle("");
      setNewVerPreviewUrl("");
      setNewVerFileUrl("");
      setNewVerNotes("");
      await fetchJobs();
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : "Error attaching version", "error");
    } finally {
      setSubmittingVersion(false);
    }
  };

  // Handle creating a new deliverable package
  const handleCreateDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !newDelTitle.trim()) return;

    try {
      setCreatingDeliverable(true);
      const res = await fetch(`/api/admin/production/jobs/${selectedJob.id}/deliverables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: newDelTitle.trim(),
          category: newDelCategory,
          format: newDelFormat,
          specs: newDelSpecs,
        }),
      });

      if (!res.ok) throw new Error("Failed to add deliverable");

      onNotify(`Deliverable package '${newDelTitle}' added to job.`, "success");
      setShowAddDeliverable(false);
      setNewDelTitle("");
      await fetchJobs();
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : "Failed to add deliverable", "error");
    } finally {
      setCreatingDeliverable(false);
    }
  };

  // Handle resolving a revision
  const handleResolveRevision = async (revisionId: string) => {
    if (!selectedJob) return;
    try {
      const res = await fetch(
        `/api/admin/production/jobs/${selectedJob.id}/revisions/${revisionId}/resolve`,
        {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (res.ok) {
        onNotify("Revision marked as resolved.", "success");
        await fetchJobs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle final delivery
  const handleFinalDelivery = async () => {
    if (!selectedJob) return;
    try {
      const res = await fetch(`/api/admin/production/jobs/${selectedJob.id}/deliver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          note: "Production completed by Studio Lead. Deliverables dispatched to Project & Library.",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to finalize delivery");

      onNotify(
        `Final delivery completed! ${data.createdAssets?.length || 0} master assets dispatched to customer project & library.`,
        "success"
      );
      await fetchJobs();
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : "Error delivering job", "error");
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter((j) => {
    if (statusFilter !== "ALL" && j.status !== statusFilter) return false;
    if (studioFilter !== "ALL" && j.assignedStudio !== studioFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        j.serviceName.toLowerCase().includes(q) ||
        (j.customerName || "").toLowerCase().includes(q) ||
        (j.projectTitle || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-zinc-900 border border-red-500/30 shadow-lg">
            <Factory className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Admin Production Center
              </h1>
              <span className="rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3" /> Agency Internal
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Unified agency production pipeline managing Studio Service requests, asset creation,
              iterative versioning, client reviews, and final delivery.
            </p>
          </div>
        </div>

        <button
          onClick={fetchJobs}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Queue
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Jobs</p>
          <p className="text-xl font-bold text-white mt-1">{jobs.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">In Production</p>
          <p className="text-xl font-bold text-white mt-1">
            {jobs.filter((j) => j.status === "IN_PRODUCTION" || j.status === "ASSIGNED").length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Client Review</p>
          <p className="text-xl font-bold text-white mt-1">
            {jobs.filter((j) => j.status === "CLIENT_REVIEW").length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Revisions</p>
          <p className="text-xl font-bold text-white mt-1">
            {jobs.filter((j) => j.status === "REVISION_REQUESTED").length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Delivered</p>
          <p className="text-xl font-bold text-white mt-1">
            {jobs.filter((j) => j.status === "DELIVERED" || j.status === "APPROVED").length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service, client, project..."
            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Statuses</option>
            {PRODUCTION_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={studioFilter}
            onChange={(e) => setStudioFilter(e.target.value)}
            className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Studios</option>
            {STUDIOS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Job Queue List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Active Queue ({filteredJobs.length})
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredJobs.map((job) => {
              const isSelected = job.id === selectedJob?.id;
              const statusCfg =
                PRODUCTION_STATUSES.find((s) => s.id === job.status) || PRODUCTION_STATUSES[0];

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                    isSelected
                      ? "border-red-500/80 bg-zinc-900 shadow-md ring-1 ring-red-500/50"
                      : "border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-900/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                        {job.identity} · {job.customerName || "Customer"}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{job.serviceName}</h4>
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border shrink-0 ${statusCfg.color}`}
                    >
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span className="truncate max-w-[150px]">
                      {job.projectTitle ? `Project: ${job.projectTitle}` : "No Project Linked"}
                    </span>
                    <span>{job.deliverables.length} Deliverables</span>
                  </div>

                  {job.revisions && job.revisions.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
                      <RefreshCw className="w-3 h-3" />
                      {job.revisions.length} Revision Request{job.revisions.length > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredJobs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center text-xs text-zinc-500">
                No production jobs matching this filter.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Job Action Station */}
        {selectedJob ? (
          <div className="lg:col-span-7 space-y-6">
            {/* Header & Status Stepper */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
                      {selectedJob.identity} Production Job
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-xs font-mono text-zinc-400">ID: {selectedJob.id}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">{selectedJob.serviceName}</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Client: <span className="text-white font-semibold">{selectedJob.customerName}</span>{" "}
                    (Workspace: {selectedJob.workspaceId})
                  </p>
                </div>

                {/* Submit for Review or Final Deliver Action */}
                <div className="flex items-center gap-2">
                  {selectedJob.status !== "CLIENT_REVIEW" && selectedJob.status !== "DELIVERED" && (
                    <button
                      onClick={() => handleTransition("CLIENT_REVIEW")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit for Client Review
                    </button>
                  )}

                  {selectedJob.status !== "DELIVERED" && (
                    <button
                      onClick={handleFinalDelivery}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Finalize Delivery
                    </button>
                  )}
                </div>
              </div>

              {/* Status Transition Pills */}
              <div className="pt-4 border-t border-zinc-800/80">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Lifecycle Stage Transition
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PRODUCTION_STATUSES.map((st) => {
                    const isCurrent = selectedJob.status === st.id;
                    return (
                      <button
                        key={st.id}
                        onClick={() => handleTransition(st.id)}
                        className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-red-600 text-white shadow-xs scale-105"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assignment & Metadata Form */}
              <div className="pt-4 border-t border-zinc-800/80 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Assigned Studio
                  </label>
                  <select
                    value={assignedStudio}
                    onChange={(e) => setAssignedStudio(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    {STUDIOS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Assigned Producer
                  </label>
                  <input
                    type="text"
                    value={assignedProducer}
                    onChange={(e) => setAssignedProducer(e.target.value)}
                    placeholder="Producer Name"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Priority Tier
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="normal">Normal / Standard</option>
                    <option value="high">High Priority</option>
                    <option value="rush">Rush / Critical (48h)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Due Date Target
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Notes Fields */}
              <div className="pt-4 border-t border-zinc-800/80 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-purple-400 mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Internal Production Notes (Confidential to Studio)
                  </label>
                  <textarea
                    rows={2}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Private production details, stems location, internal review comments..."
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-cyan-400 mb-1 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Client-Visible Notes (Visible in Project Review Room)
                  </label>
                  <textarea
                    rows={2}
                    value={clientVisibleNotes}
                    onChange={(e) => setClientVisibleNotes(e.target.value)}
                    placeholder="Instructions or remarks the client will see in their project..."
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveJobMetadata}
                    disabled={savingJob}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {savingJob ? "Saving..." : "Save Job Settings & Notes"}
                  </button>
                </div>
              </div>
            </div>

            {/* Deliverables & Versions Section */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-red-500" />
                    Deliverables & Versions ({selectedJob.deliverables.length})
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Upload iterative versions without overwriting previous work.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddDeliverable(!showAddDeliverable)}
                  className="inline-flex items-center gap-1 rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:text-white cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Package
                </button>
              </div>

              {/* Add Deliverable Form if toggled */}
              {showAddDeliverable && (
                <form
                  onSubmit={handleCreateDeliverable}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3"
                >
                  <h4 className="text-xs font-bold text-white">New Deliverable Package</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      required
                      value={newDelTitle}
                      onChange={(e) => setNewDelTitle(e.target.value)}
                      placeholder="Title (e.g. Master Cover Artwork)"
                      className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="text"
                      value={newDelSpecs}
                      onChange={(e) => setNewDelSpecs(e.target.value)}
                      placeholder="Specs (e.g. 3000x3000px 300DPI)"
                      className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddDeliverable(false)}
                      className="rounded-xl px-3 py-1 text-xs text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingDeliverable}
                      className="rounded-xl bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-500 cursor-pointer"
                    >
                      {creatingDeliverable ? "Adding..." : "Add Deliverable"}
                    </button>
                  </div>
                </form>
              )}

              {/* Deliverables List */}
              <div className="space-y-4">
                {selectedJob.deliverables.map((del) => (
                  <div
                    key={del.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{del.title}</span>
                          <span className="text-[10px] font-mono text-zinc-500">({del.format})</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          Specs: {del.specs || "Standard release format"}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setActiveUploadDelId(activeUploadDelId === del.id ? null : del.id)
                        }
                        className="inline-flex items-center gap-1 rounded-xl bg-red-600 hover:bg-red-500 text-white px-3 py-1 text-xs font-bold transition-colors cursor-pointer shadow-sm"
                      >
                        <Upload className="w-3 h-3" />
                        Upload Version v{(del.versions?.length || 0) + 1}
                      </button>
                    </div>

                    {/* Version Upload Form if active */}
                    {activeUploadDelId === del.id && (
                      <div className="rounded-xl border border-red-500/30 bg-zinc-950 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-red-400">
                            Attach New Version v{(del.versions?.length || 0) + 1} for '{del.title}'
                          </h5>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            Never overwrites previous versions
                          </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 mb-0.5">
                              Preview Image URL *
                            </label>
                            <input
                              type="text"
                              value={newVerPreviewUrl}
                              onChange={(e) => setNewVerPreviewUrl(e.target.value)}
                              placeholder="https://images.unsplash.com/... or cloud storage URL"
                              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 mb-0.5">
                              Master File Download URL
                            </label>
                            <input
                              type="text"
                              value={newVerFileUrl}
                              onChange={(e) => setNewVerFileUrl(e.target.value)}
                              placeholder="Direct download URL (or leave blank to use preview)"
                              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 mb-0.5">
                            Version Description / Notes
                          </label>
                          <input
                            type="text"
                            value={newVerNotes}
                            onChange={(e) => setNewVerNotes(e.target.value)}
                            placeholder="e.g. Master color grade, typographic alignment fixed."
                            className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-zinc-300 font-bold">Publish to:</label>
                            <select
                              value={newVerStatus}
                              onChange={(e) => setNewVerStatus(e.target.value as any)}
                              className="rounded-lg bg-zinc-900 border border-zinc-700 px-2 py-1 text-xs text-white"
                            >
                              <option value="client_review">Client Review (Visible to Client)</option>
                              <option value="internal">Internal Team Only</option>
                            </select>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setActiveUploadDelId(null)}
                              className="rounded-xl px-3 py-1 text-xs text-zinc-400 hover:text-white cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleAddVersion(del.id)}
                              disabled={submittingVersion}
                              className="rounded-xl bg-red-600 px-4 py-1 text-xs font-bold text-white hover:bg-red-500 cursor-pointer disabled:opacity-50"
                            >
                              {submittingVersion ? "Uploading..." : "Save & Publish Version"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Versions History Timeline */}
                    {del.versions && del.versions.length > 0 ? (
                      <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                        {del.versions.map((ver) => (
                          <div
                            key={ver.id}
                            className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="rounded-lg bg-zinc-800 px-2 py-0.5 text-xs font-bold font-mono text-zinc-200">
                                v{ver.versionNumber}
                              </span>
                              {ver.previewUrl && (
                                <img
                                  src={ver.previewUrl}
                                  alt={ver.title}
                                  className="h-9 w-9 rounded-lg object-cover border border-zinc-700"
                                />
                              )}
                              <div>
                                <p className="font-bold text-white">{ver.title}</p>
                                <p className="text-[10px] text-zinc-500 font-mono">
                                  by {ver.uploadedBy} · {new Date(ver.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                  ver.status === "approved"
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : ver.status === "client_review"
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-zinc-800 text-zinc-400"
                                }`}
                              >
                                {ver.status}
                              </span>
                              <a
                                href={ver.fileUrl || ver.previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-zinc-400 hover:text-white"
                                title="Open preview"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-500 italic">No versions uploaded yet.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Revision Management Section */}
            {selectedJob.revisions && selectedJob.revisions.length > 0 && (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-xl">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-orange-400" />
                  Client Revision Requests ({selectedJob.revisions.length})
                </h3>

                <div className="space-y-3">
                  {selectedJob.revisions.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">
                          {rev.deliverableTitle || "Package"} (Target: v{rev.versionNumber || 1})
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                              rev.status === "RESOLVED"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-orange-500/10 text-orange-400"
                            }`}
                          >
                            {rev.status}
                          </span>
                          {rev.status !== "RESOLVED" && (
                            <button
                              onClick={() => handleResolveRevision(rev.id)}
                              className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 text-[10px] font-bold text-emerald-400 cursor-pointer"
                            >
                              Mark Resolved
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-zinc-300">
                        <span className="font-bold text-zinc-400">Reason:</span> {rev.reason}
                      </p>
                      {rev.requestedChanges && (
                        <p className="text-zinc-300">
                          <span className="font-bold text-zinc-400">Requested Changes:</span>{" "}
                          {rev.requestedChanges}
                        </p>
                      )}
                      {rev.referenceUrl && (
                        <a
                          href={rev.referenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-red-400 hover:underline text-[11px]"
                        >
                          <ExternalLink className="w-3 h-3" /> Reference link
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center">
            <Factory className="h-10 w-10 text-zinc-600 mb-2" />
            <p className="text-sm font-bold text-zinc-400">No Production Job Selected</p>
            <p className="text-xs text-zinc-500 max-w-sm mt-1">
              Select a job from the queue on the left to inspect brief details, assign team leads,
              upload version deliverables, and manage client reviews.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductionCenter;
