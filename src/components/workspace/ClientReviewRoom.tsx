import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  ProductionJob,
  ProductionDeliverable,
  ProductionDeliverableVersion,
} from "../../types";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Download,
  Maximize2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Send,
  FileText,
  Film,
  Image as ImageIcon,
  ChevronRight,
  X,
  Eye,
  Check,
  Lock,
} from "lucide-react";

interface ClientReviewRoomProps {
  projectId: string;
  projectTitle: string;
  onNotify: (message: string, type?: "success" | "info" | "error") => void;
  onRefreshAssets?: () => void;
}

export function ClientReviewRoom({
  projectId,
  projectTitle,
  onNotify,
  onRefreshAssets,
}: ClientReviewRoomProps) {
  const { activeWorkspace, token } = useAuth();
  const { refreshWorkspace } = useWorkspace();

  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Version selection per deliverable ID (mapping deliverableId -> versionIndex)
  const [activeVersionIndex, setActiveVersionIndex] = useState<Record<string, number>>({});

  // Revision Modal State
  const [revisionModal, setRevisionModal] = useState<{
    open: boolean;
    jobId: string;
    deliverableId?: string;
    deliverableTitle?: string;
    versionNumber?: number;
  }>({ open: false, jobId: "" });

  const [revisionReason, setRevisionReason] = useState<string>("");
  const [revisionChanges, setRevisionChanges] = useState<string>("");
  const [revisionRefUrl, setRevisionRefUrl] = useState<string>("");
  const [submittingRevision, setSubmittingRevision] = useState<boolean>(false);

  // Deliverable Approval State
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvalNote, setApprovalNote] = useState<string>("");
  const [showApprovalModal, setShowApprovalModal] = useState<{
    open: boolean;
    jobId: string;
    deliverableId?: string;
    deliverableTitle?: string;
    versionNumber?: number;
    isFinalAll?: boolean;
  }>({ open: false, jobId: "" });

  // Comment draft per deliverable ID
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  // Fullscreen Preview Lightbox
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    url: string;
    title: string;
    type: "image" | "video" | "document";
  } | null>(null);

  // Fetch production jobs for current workspace and project
  const fetchJobs = async () => {
    if (!activeWorkspace?.id) return;
    try {
      setLoading(true);
      const res = await fetch(
        `/api/workspaces/${activeWorkspace.id}/production-jobs?projectId=${encodeURIComponent(
          projectId
        )}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (res.ok) {
        const data = await res.json();
        const loadedJobs: ProductionJob[] = data.jobs || [];
        setJobs(loadedJobs);
        if (loadedJobs.length > 0 && !activeJobId) {
          setActiveJobId(loadedJobs[0].id);
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
  }, [activeWorkspace?.id, projectId]);

  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0] || null;

  // Handle requesting a revision
  const handleOpenRevisionModal = (
    jobId: string,
    deliverable?: ProductionDeliverable,
    verNum?: number
  ) => {
    setRevisionModal({
      open: true,
      jobId,
      deliverableId: deliverable?.id,
      deliverableTitle: deliverable?.title,
      versionNumber: verNum,
    });
    setRevisionReason("");
    setRevisionChanges("");
    setRevisionRefUrl("");
  };

  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace?.id || !revisionModal.jobId) return;
    if (!revisionReason.trim()) {
      onNotify("Please provide a reason for the revision request.", "error");
      return;
    }

    try {
      setSubmittingRevision(true);
      const res = await fetch(
        `/api/workspaces/${activeWorkspace.id}/production-jobs/${revisionModal.jobId}/revision`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            deliverableId: revisionModal.deliverableId,
            deliverableTitle: revisionModal.deliverableTitle,
            versionNumber: revisionModal.versionNumber,
            reason: revisionReason.trim(),
            requestedChanges: revisionChanges.trim() || revisionReason.trim(),
            referenceUrl: revisionRefUrl.trim() || undefined,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit revision");
      }

      onNotify(
        "Revision request sent to studio production. Our team is updating your asset.",
        "success"
      );
      setRevisionModal({ open: false, jobId: "" });
      await fetchJobs();
      if (refreshWorkspace) refreshWorkspace();
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : "Error submitting revision", "error");
    } finally {
      setSubmittingRevision(false);
    }
  };

  // Handle deliverable approval
  const handleConfirmApproval = async () => {
    if (!activeWorkspace?.id || !showApprovalModal.jobId) return;

    try {
      setApprovingId(showApprovalModal.deliverableId || showApprovalModal.jobId);
      const res = await fetch(
        `/api/workspaces/${activeWorkspace.id}/production-jobs/${showApprovalModal.jobId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            deliverableId: showApprovalModal.deliverableId,
            versionNumber: showApprovalModal.versionNumber,
            note: approvalNote.trim() || undefined,
            finalizeNow: showApprovalModal.isFinalAll,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to approve deliverable");
      }

      onNotify(
        showApprovalModal.isFinalAll
          ? "All deliverables approved! Production is completed and master assets have been added to your Project & Library."
          : `Deliverable approved successfully!`,
        "success"
      );

      setShowApprovalModal({ open: false, jobId: "" });
      setApprovalNote("");
      await fetchJobs();
      if (onRefreshAssets) onRefreshAssets();
      if (refreshWorkspace) refreshWorkspace();
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : "Error approving deliverable", "error");
    } finally {
      setApprovingId(null);
    }
  };

  // Handle adding comments to a deliverable version
  const handleAddComment = async (deliverableId: string, versionNumber: number) => {
    if (!activeWorkspace?.id || !activeJob) return;
    const text = commentDrafts[deliverableId]?.trim();
    if (!text) return;

    try {
      setSubmittingComment((prev) => ({ ...prev, [deliverableId]: true }));
      const res = await fetch(
        `/api/workspaces/${activeWorkspace.id}/production-jobs/${activeJob.id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            deliverableId,
            versionNumber,
            content: text,
          }),
        }
      );

      if (res.ok) {
        setCommentDrafts((prev) => ({ ...prev, [deliverableId]: "" }));
        onNotify("Feedback note posted.", "success");
        await fetchJobs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [deliverableId]: false }));
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-8 text-center backdrop-blur-md">
        <RefreshCw className="mx-auto h-6 w-6 animate-spin text-zinc-500 mb-2" />
        <p className="text-xs font-semibold text-zinc-400">Loading Studio Review Room...</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/40 p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-500 mb-3">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-bold text-white">Client Review Room</h4>
        <p className="mt-1 text-xs text-zinc-400 max-w-md mx-auto">
          When you request creative services (cover art, EPK, lyric video, brand kit) for this
          project, you will review, request revisions, and approve final master files here.
        </p>
      </div>
    );
  }

  // Count deliverables requiring review
  const pendingReviewCount = jobs.reduce((acc, job) => {
    return (
      acc +
      job.deliverables.filter(
        (d) => d.status === "client_review" || job.status === "CLIENT_REVIEW"
      ).length
    );
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-zinc-950 p-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                <Sparkles className="w-3 h-3" />
                Client Review & Approval Room
              </span>
              {pendingReviewCount > 0 && (
                <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 animate-pulse">
                  {pendingReviewCount} Deliverable{pendingReviewCount > 1 ? "s" : ""} Awaiting Review
                </span>
              )}
            </div>
            <h2 className="mt-2 text-xl md:text-2xl font-bold text-white tracking-tight">
              Production Deliverables & Master Approvals
            </h2>
            <p className="mt-1 text-xs text-zinc-400 max-w-2xl">
              Inspect creative deliverables from the studio, review full-resolution versions, request
              iterative revisions, and finalize master assets directly into this project.
            </p>
          </div>

          {/* Job Selector if multiple jobs exist for this project */}
          {jobs.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              {jobs.map((job) => {
                const isSelected = job.id === activeJob?.id;
                return (
                  <button
                    key={job.id}
                    onClick={() => setActiveJobId(job.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-red-600 text-white shadow-sm"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {job.serviceName}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Job Status Bar */}
        {activeJob && (
          <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-white">{activeJob.serviceName}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400">
                Studio:{" "}
                <span className="font-bold text-zinc-200 capitalize">
                  {activeJob.assignedStudio || "Creative Production"}
                </span>
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400">
                Lead:{" "}
                <span className="font-bold text-zinc-200">
                  {activeJob.assignedProducer || "Dare Balogun"}
                </span>
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400">
                Due: <span className="font-bold text-zinc-200">{activeJob.dueDate}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                  activeJob.status === "DELIVERED"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : activeJob.status === "APPROVED"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : activeJob.status === "CLIENT_REVIEW"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : activeJob.status === "REVISION_REQUESTED"
                    ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                }`}
              >
                Status: {activeJob.status.replace("_", " ")}
              </span>

              {/* Approve All Quick Action if in client review */}
              {(activeJob.status === "CLIENT_REVIEW" || activeJob.status === "APPROVED") && (
                <button
                  onClick={() =>
                    setShowApprovalModal({
                      open: true,
                      jobId: activeJob.id,
                      isFinalAll: true,
                      deliverableTitle: "All Project Deliverables",
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {activeJob.status === "APPROVED" ? "Finalize To Library" : "Approve All & Deliver"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Client Visible Studio Message */}
      {activeJob?.clientVisibleNotes && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-start gap-3">
          <MessageSquare className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-zinc-300">Studio Production Note:</p>
            <p className="text-zinc-400 mt-0.5">{activeJob.clientVisibleNotes}</p>
          </div>
        </div>
      )}

      {/* Deliverables Grid */}
      {activeJob && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span>Deliverable Packages ({activeJob.deliverables.length})</span>
            </h3>
            <span className="text-xs text-zinc-500">
              Each package maintains independent version history and approval sign-off
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {activeJob.deliverables.map((del) => {
              const totalVersions = del.versions.length;
              const selectedIdx =
                activeVersionIndex[del.id] !== undefined
                  ? activeVersionIndex[del.id]
                  : totalVersions > 0
                  ? totalVersions - 1
                  : 0;

              const currentVersion = del.versions[selectedIdx] || null;
              const isDelivered = del.status === "delivered" || activeJob.status === "DELIVERED";
              const isApproved = del.status === "approved" || isDelivered;
              const isUnderRevision = del.status === "revision_requested";

              const isVideo =
                del.category === "video" ||
                del.category === "motion" ||
                currentVersion?.fileType?.includes("video");

              const isDoc =
                del.category === "document" ||
                del.category === "epk" ||
                currentVersion?.fileType?.includes("pdf");

              return (
                <div
                  key={del.id}
                  className={`rounded-3xl border transition-all overflow-hidden flex flex-col justify-between shadow-md ${
                    isApproved
                      ? "border-emerald-500/30 bg-zinc-950/90"
                      : isUnderRevision
                      ? "border-orange-500/30 bg-zinc-950/90"
                      : del.status === "client_review"
                      ? "border-amber-500/40 bg-zinc-950"
                      : "border-zinc-800 bg-zinc-950/70"
                  }`}
                >
                  {/* Top Bar */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                            {del.category || "Creative Deliverable"}
                          </span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {del.specs || del.format}
                          </span>
                        </div>
                        <h4 className="mt-1 text-base font-bold text-white tracking-tight">
                          {del.title}
                        </h4>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                          isDelivered
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : isApproved
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : isUnderRevision
                            ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                            : del.status === "client_review"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {isDelivered
                          ? "Delivered to Project"
                          : isApproved
                          ? "Approved"
                          : isUnderRevision
                          ? "Revision Requested"
                          : del.status === "client_review"
                          ? "Review Ready"
                          : "In Production"}
                      </span>
                    </div>

                    {/* Version Pills Switcher */}
                    {totalVersions > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-zinc-400">Versions:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {del.versions.map((ver, idx) => {
                            const isVerActive = selectedIdx === idx;
                            return (
                              <button
                                key={ver.id}
                                onClick={() =>
                                  setActiveVersionIndex((prev) => ({
                                    ...prev,
                                    [del.id]: idx,
                                  }))
                                }
                                className={`rounded-lg px-2.5 py-0.5 text-xs font-bold font-mono transition-all cursor-pointer ${
                                  isVerActive
                                    ? "bg-red-600 text-white shadow-xs scale-105"
                                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                                }`}
                              >
                                v{ver.versionNumber}
                                {ver.status === "approved" && " ✓"}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Media Preview Container */}
                  <div className="px-5 py-2">
                    {currentVersion ? (
                      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/90 group">
                        {isVideo ? (
                          <div className="aspect-video w-full bg-black flex items-center justify-center">
                            <video
                              src={currentVersion.fileUrl || currentVersion.previewUrl}
                              controls
                              playsInline
                              className="h-full w-full object-contain"
                              poster={currentVersion.previewUrl}
                            />
                          </div>
                        ) : isDoc ? (
                          <div className="p-8 text-center bg-zinc-900/60 flex flex-col items-center justify-center min-h-[220px]">
                            <FileText className="w-12 h-12 text-red-400 mb-2" />
                            <p className="text-xs font-bold text-white max-w-xs truncate">
                              {currentVersion.title}
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                              {del.format} · {currentVersion.fileSize || "PDF Master Document"}
                            </p>
                            <a
                              href={currentVersion.fileUrl || currentVersion.previewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Open Document
                            </a>
                          </div>
                        ) : (
                          <div className="relative aspect-video w-full overflow-hidden bg-zinc-900 flex items-center justify-center">
                            <img
                              src={currentVersion.previewUrl || currentVersion.fileUrl}
                              alt={currentVersion.title}
                              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                              <button
                                onClick={() =>
                                  setPreviewModal({
                                    open: true,
                                    url: currentVersion.fileUrl || currentVersion.previewUrl,
                                    title: currentVersion.title,
                                    type: "image",
                                  })
                                }
                                className="rounded-xl bg-zinc-900/90 border border-white/20 p-2 text-white hover:bg-zinc-800 cursor-pointer transition-colors shadow-lg"
                                title="Fullscreen Preview"
                              >
                                <Maximize2 className="w-4 h-4" />
                              </button>
                              <a
                                href={currentVersion.fileUrl || currentVersion.previewUrl}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl bg-zinc-900/90 border border-white/20 p-2 text-white hover:bg-zinc-800 cursor-pointer transition-colors shadow-lg"
                                title="Download High-Res"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Version info footer */}
                        <div className="p-3 bg-zinc-950/80 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                          <span>
                            v{currentVersion.versionNumber} uploaded by {currentVersion.uploadedBy}
                          </span>
                          <span>{currentVersion.fileSize || del.format}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center">
                        <Clock className="mx-auto w-6 h-6 text-zinc-600 mb-1" />
                        <p className="text-xs font-semibold text-zinc-400">
                          Initial version being crafted by studio
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                          Spec: {del.specs}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Version Notes / Instructions */}
                  {currentVersion?.notes && (
                    <div className="px-5 py-2">
                      <p className="text-xs text-zinc-400 italic bg-zinc-900/40 rounded-xl p-2.5 border border-zinc-800/50">
                        "{currentVersion.notes}"
                      </p>
                    </div>
                  )}

                  {/* Threaded Comments & Feedback for this Version */}
                  {currentVersion && (
                    <div className="px-5 py-2 space-y-2">
                      {currentVersion.comments && currentVersion.comments.length > 0 && (
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {currentVersion.comments.map((comm) => (
                            <div
                              key={comm.id}
                              className={`rounded-xl p-2 text-xs ${
                                comm.authorRole === "client"
                                  ? "bg-red-500/10 border border-red-500/20 text-zinc-300 ml-4"
                                  : "bg-zinc-900 border border-zinc-800 text-zinc-300 mr-4"
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 mb-0.5">
                                <span>{comm.authorName}</span>
                                <span className="uppercase text-[9px] text-zinc-500">
                                  {comm.authorRole}
                                </span>
                              </div>
                              <p className="text-zinc-200 text-xs">{comm.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={commentDrafts[del.id] || ""}
                          onChange={(e) =>
                            setCommentDrafts((prev) => ({
                              ...prev,
                              [del.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddComment(del.id, currentVersion.versionNumber);
                            }
                          }}
                          placeholder={`Comment on v${currentVersion.versionNumber}...`}
                          className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                        <button
                          onClick={() => handleAddComment(del.id, currentVersion.versionNumber)}
                          disabled={submittingComment[del.id] || !commentDrafts[del.id]?.trim()}
                          className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1.5 text-xs font-bold text-zinc-300 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Review Action Controls */}
                  <div className="p-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-zinc-500 font-mono">
                      {isApproved ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Approved
                        </span>
                      ) : (
                        <span>Review v{currentVersion?.versionNumber || 1}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Revision Button */}
                      {!isDelivered && (
                        <button
                          onClick={() =>
                            handleOpenRevisionModal(
                              activeJob.id,
                              del,
                              currentVersion?.versionNumber
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Request Revision
                        </button>
                      )}

                      {/* Approve Button */}
                      {!isApproved && currentVersion && (
                        <button
                          onClick={() =>
                            setShowApprovalModal({
                              open: true,
                              jobId: activeJob.id,
                              deliverableId: del.id,
                              deliverableTitle: del.title,
                              versionNumber: currentVersion.versionNumber,
                            })
                          }
                          disabled={approvingId === del.id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {approvingId === del.id ? "Approving..." : "Approve"}
                        </button>
                      )}

                      {isDelivered && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                          <ShieldCheck className="w-3.5 h-3.5" /> Final Master in Project
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Previous Revisions History */}
          {activeJob.revisions && activeJob.revisions.length > 0 && (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
                Revision History ({activeJob.revisions.length})
              </h4>
              <div className="space-y-2">
                {activeJob.revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-200">
                          {rev.deliverableTitle || "Package Revision"}
                        </span>
                        {rev.versionNumber && (
                          <span className="text-[10px] font-mono text-zinc-400">
                            (Target: v{rev.versionNumber})
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            rev.status === "RESOLVED"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-orange-500/10 text-orange-400"
                          }`}
                        >
                          {rev.status}
                        </span>
                      </div>
                      <p className="text-zinc-400 mt-1">
                        <span className="text-zinc-500">Reason:</span> {rev.reason}
                      </p>
                      {rev.requestedChanges && (
                        <p className="text-zinc-300 mt-0.5">{rev.requestedChanges}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Revision Modal Dialog */}
      {revisionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                  Iterative Creative Revision
                </span>
                <h3 className="text-base font-bold text-white">
                  Request Revision for {revisionModal.deliverableTitle || "Package"}
                </h3>
              </div>
              <button
                onClick={() => setRevisionModal({ open: false, jobId: "" })}
                className="rounded-xl p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRevision} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Revision Reason *
                </label>
                <input
                  type="text"
                  required
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  placeholder="e.g. Adjust typography contrast, color tone adjustment, typo in lyrics"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Specific Requested Changes *
                </label>
                <textarea
                  required
                  rows={4}
                  value={revisionChanges}
                  onChange={(e) => setRevisionChanges(e.target.value)}
                  placeholder="Describe in detail what adjustments our studio production team should make for the next version..."
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Visual Reference URL (Optional)
                </label>
                <input
                  type="url"
                  value={revisionRefUrl}
                  onChange={(e) => setRevisionRefUrl(e.target.value)}
                  placeholder="https://pinterest.com/... or cloud link with reference"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRevisionModal({ open: false, jobId: "" })}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRevision}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${submittingRevision ? "animate-spin" : ""}`}
                  />
                  {submittingRevision ? "Submitting..." : "Submit Revision Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Confirmation Modal */}
      {showApprovalModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Approval</h3>
                <p className="text-xs text-zinc-400">
                  {showApprovalModal.deliverableTitle || "Creative Asset"}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300">
              {showApprovalModal.isFinalAll
                ? "Approving this delivery will finalize all master assets, record client sign-off, and automatically create the deliverable files in your Project and Workspace Library."
                : "Approving this deliverable signals that you are satisfied with this version. You can add a sign-off note below."}
            </p>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                Approval Sign-off Note (Optional)
              </label>
              <input
                type="text"
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="e.g. Master approved for DSP distribution release."
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowApprovalModal({ open: false, jobId: "" })}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Confirm Sign-Off
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Media Lightbox */}
      {previewModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <button
            onClick={() => setPreviewModal(null)}
            className="absolute top-4 right-4 rounded-xl bg-zinc-900/80 p-2 text-white hover:bg-zinc-800 cursor-pointer z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl flex flex-col items-center">
            <img
              src={previewModal.url}
              alt={previewModal.title}
              className="max-h-[80vh] max-w-[85vw] object-contain rounded-xl shadow-2xl"
            />
            <div className="mt-3 flex items-center justify-between w-full px-4 text-xs text-zinc-300">
              <span className="font-bold">{previewModal.title}</span>
              <a
                href={previewModal.url}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1 text-white hover:bg-zinc-700"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
