import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Send,
  Users,
  ShieldCheck,
  FileText,
  Calendar,
  MessageSquare,
  ArrowRight,
  Plus,
  Trash2,
} from "lucide-react";
import { ApprovalRequest, MemberRole, ApprovalDecisionType } from "../../types";
import { api } from "../../services/api";

interface ApprovalModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  entityType?: ApprovalRequest["entityType"];
  entityId?: string;
  entityTitle?: string;
  existingApproval?: ApprovalRequest | null;
  onApprovalUpdated?: (approval: ApprovalRequest) => void;
  currentUser?: {
    id: string;
    email: string;
    name?: string;
    role?: MemberRole;
  };
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  workspaceId,
  isOpen,
  onClose,
  entityType = "studio_deliverable",
  entityId = "",
  entityTitle = "",
  existingApproval = null,
  onApprovalUpdated,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<"review" | "create">("review");
  const [approval, setApproval] = useState<ApprovalRequest | null>(existingApproval);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Review Decision Form State
  const [decisionType, setDecisionType] = useState<ApprovalDecisionType>("approved");
  const [decisionFeedback, setDecisionFeedback] = useState("");
  const [actionItems, setActionItems] = useState<string[]>([""]);

  // Create Request Form State
  const [title, setTitle] = useState(entityTitle ? `Sign-off: ${entityTitle}` : "");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"critical" | "high" | "medium" | "low">("high");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0]
  );
  const [version, setVersion] = useState("V1");
  const [reviewerEmails, setReviewerEmails] = useState<string[]>([""]);

  useEffect(() => {
    if (existingApproval) {
      setApproval(existingApproval);
      setActiveTab("review");
    } else if (entityId) {
      // Check if there is an existing approval for this entity
      loadEntityApproval();
    }
  }, [existingApproval, entityId, workspaceId]);

  const loadEntityApproval = async () => {
    if (!workspaceId || !entityId) return;
    try {
      setIsLoading(true);
      const res = await api.approvals.list(workspaceId, entityType, entityId);
      if (res.approvals && res.approvals.length > 0) {
        setApproval(res.approvals[0]);
        setActiveTab("review");
      } else {
        setApproval(null);
        setActiveTab("create");
        setTitle(`Sign-off: ${entityTitle}`);
      }
    } catch (err: any) {
      console.error("Failed to load approval", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCreateApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const cleanReviewers = reviewerEmails
        .filter((e) => e.trim().length > 0)
        .map((email) => ({
          email: email.trim(),
          role: "client" as MemberRole,
        }));

      const res = await api.approvals.create(workspaceId, {
        entityType,
        entityId,
        entityTitle,
        title: title.trim(),
        description: description.trim(),
        urgency,
        dueDate,
        version,
        reviewers: cleanReviewers.length > 0 ? cleanReviewers : undefined,
      });

      setApproval(res.approval);
      setActiveTab("review");
      if (onApprovalUpdated) {
        onApprovalUpdated(res.approval);
      }
    } catch (err: any) {
      console.error("Failed to request approval", err);
      setError(err.message || "Failed to create approval request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approval || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const filteredActions = actionItems.filter((item) => item.trim().length > 0);

      const res = await api.approvals.submitDecision(workspaceId, approval.id, {
        decision: decisionType,
        feedback: decisionFeedback.trim() || undefined,
        actionItems: filteredActions.length > 0 ? filteredActions : undefined,
      });

      setApproval(res.approval);
      if (onApprovalUpdated) {
        onApprovalUpdated(res.approval);
      }
    } catch (err: any) {
      console.error("Failed to submit decision", err);
      setError(err.message || "Could not record approval decision");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddActionItem = () => {
    setActionItems([...actionItems, ""]);
  };

  const handleActionItemChange = (index: number, val: string) => {
    const updated = [...actionItems];
    updated[index] = val;
    setActionItems(updated);
  };

  const handleRemoveActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold rounded-full text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case "changes_requested":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold rounded-full text-xs">
            <AlertTriangle className="w-3.5 h-3.5" /> Changes Requested
          </span>
        );
      case "declined":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold rounded-full text-xs">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold rounded-full text-xs">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Approval & Sign-Off Portal</h2>
              <p className="text-xs text-zinc-400">
                Formal review pipeline: Pending → Approved → Changes Requested
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation if no active approval or creating new */}
        {(!approval || approval.status === "approved" || approval.status === "declined") && (
          <div className="flex items-center gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setActiveTab("review")}
              disabled={!approval}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-colors ${
                activeTab === "review"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 disabled:opacity-30"
              }`}
            >
              Current Request ({approval?.status || "None"})
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-colors ${
                activeTab === "create"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              + Create New Sign-Off Request
            </button>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Review Existing Approval Request */}
        {activeTab === "review" && approval ? (
          <div className="space-y-5">
            {/* Request Summary Card */}
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {approval.entityType.replace("_", " ")}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">{approval.version || "V1"}</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-100">{approval.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{approval.entityTitle}</p>
                </div>
                <div>{getStatusBadge(approval.status)}</div>
              </div>

              {approval.description && (
                <p className="text-xs text-zinc-300 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                  {approval.description}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-800/80 text-xs">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Requested By</span>
                  <span className="font-semibold text-zinc-300">{approval.requestedBy.name}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Target Due Date</span>
                  <span className="font-semibold text-zinc-300">
                    {approval.dueDate ? new Date(approval.dueDate).toLocaleDateString() : "No deadline"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Urgency</span>
                  <span className="font-semibold text-amber-400 capitalize">{approval.urgency}</span>
                </div>
              </div>
            </div>

            {/* Reviewers Matrix */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Assigned Reviewers
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {approval.requiredReviewers.map((rev, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-zinc-950/60 rounded-lg border border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-zinc-200 block">{rev.name || rev.email}</span>
                      <span className="text-[10px] text-zinc-500">{(rev.role || "reviewer").toUpperCase()}</span>
                    </div>
                    <div>
                      {rev.hasDecided ? (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            rev.decision === "approved"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : rev.decision === "changes_requested"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {(rev.decision || "").replace("_", " ").toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                          PENDING
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Decisions Log */}
            {approval.decisions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Recorded Decision Log
                </h4>
                <div className="space-y-2">
                  {approval.decisions.map((dec) => (
                    <div
                      key={dec.id}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                        dec.decision === "approved"
                          ? "bg-emerald-950/10 border-emerald-500/20 text-emerald-300"
                          : dec.decision === "changes_requested"
                          ? "bg-amber-950/10 border-amber-500/20 text-amber-300"
                          : "bg-red-950/10 border-red-500/20 text-red-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{dec.userName} ({(dec.userRole || "member").toUpperCase()})</span>
                        <span className="text-[10px] text-zinc-400">
                          {new Date(dec.decidedAt).toLocaleString()}
                        </span>
                      </div>
                      {dec.feedback && <p className="text-zinc-200">{dec.feedback}</p>}
                      {dec.actionItems && dec.actionItems.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] font-bold uppercase block text-zinc-400">
                            Required Action Items:
                          </span>
                          <ul className="list-disc list-inside text-zinc-300 space-y-0.5">
                            {dec.actionItems.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Decision Form (if pending or revision requested) */}
            <form
              onSubmit={handleSubmitDecision}
              className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-4"
            >
              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                Submit Your Sign-Off Decision
              </h4>

              {/* Decision Type Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDecisionType("approved")}
                  className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                    decisionType === "approved"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs">Approve</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecisionType("changes_requested")}
                  className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                    decisionType === "changes_requested"
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs">Request Changes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecisionType("declined")}
                  className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                    decisionType === "declined"
                      ? "bg-red-500/20 border-red-500 text-red-300 font-bold"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-xs">Decline</span>
                </button>
              </div>

              {/* Rationale Feedback */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Review Feedback / Notes</label>
                <textarea
                  value={decisionFeedback}
                  onChange={(e) => setDecisionFeedback(e.target.value)}
                  placeholder={
                    decisionType === "approved"
                      ? "Sign-off rationale (e.g. Master approved for DSP delivery)..."
                      : "Specific creative changes or fixes requested before approval..."
                  }
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Action items if changes requested */}
              {decisionType === "changes_requested" && (
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 flex items-center justify-between">
                    <span>Actionable Revision Checklist</span>
                    <button
                      type="button"
                      onClick={handleAddActionItem}
                      className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
                    >
                      + Add Item
                    </button>
                  </label>
                  {actionItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleActionItemChange(idx, e.target.value)}
                        placeholder={`Change request item #${idx + 1}`}
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100"
                      />
                      {actionItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveActionItem(idx)}
                          className="text-zinc-500 hover:text-red-400 p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                >
                  {isSubmitting ? "Recording..." : `Confirm ${(decisionType || "").replace("_", " ").toUpperCase()}`}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Create New Approval Request Form */
          <form onSubmit={handleCreateApproval} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Approval Request Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Cover Artwork V2 Sign-off"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Entity Type</label>
                <input
                  type="text"
                  value={entityType}
                  disabled
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Version Label</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="V1, V2, Final"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Urgency</label>
                <select
                  value={urgency}
                  onChange={(e: any) => setUrgency(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100"
                >
                  <option value="critical">Critical (Blocking)</option>
                  <option value="high">High (48 Hours)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="low">Low (Flexible)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Target Sign-off Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Review Instructions & Context</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail what is required from the reviewer (e.g. check typography spelling, verify high-resolution rendering, approve budget)..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span>Reviewer Email Invites (Leave blank to notify all workspace leads)</span>
                <button
                  type="button"
                  onClick={() => setReviewerEmails([...reviewerEmails, ""])}
                  className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
                >
                  + Add Reviewer
                </button>
              </label>
              {reviewerEmails.map((email, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const updated = [...reviewerEmails];
                      updated[idx] = e.target.value;
                      setReviewerEmails(updated);
                    }}
                    placeholder="reviewer@domain.com"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100"
                  />
                  {reviewerEmails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setReviewerEmails(reviewerEmails.filter((_, i) => i !== idx))}
                      className="text-zinc-500 hover:text-red-400 p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
              >
                {isSubmitting ? "Dispatching..." : "Dispatch Sign-Off Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
