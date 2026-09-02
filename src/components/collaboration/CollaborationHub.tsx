import React, { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  MessageSquare,
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Plus,
  Sparkles,
  Lock,
  Globe,
  ArrowUpRight,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  WorkspaceMember,
  CommentItem,
  ApprovalRequest,
  RevisionItem,
  CollaborationSummary,
  MemberRole,
} from "../../types";
import { api } from "../../services/api";
import { CommentsSection } from "./CommentsSection";
import { ApprovalModal } from "./ApprovalModal";
import { RevisionHistoryModal } from "./RevisionHistoryModal";
import { WorkspaceMembersModal } from "./WorkspaceMembersModal";

interface CollaborationHubProps {
  workspaceId: string;
  currentUser?: {
    id: string;
    email: string;
    name?: string;
    role?: MemberRole;
  };
  onNavigateTab?: (tab: any, entityId?: string) => void;
}

export const CollaborationHub: React.FC<CollaborationHubProps> = ({
  workspaceId,
  currentUser,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "approvals" | "comments" | "revisions" | "members"
  >("approvals");
  const [summary, setSummary] = useState<CollaborationSummary | null>(null);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [activeApprovalModal, setActiveApprovalModal] = useState<ApprovalRequest | null>(null);
  const [showNewApprovalModal, setShowNewApprovalModal] = useState(false);
  const [activeRevisionModal, setActiveRevisionModal] = useState<{
    entityType: RevisionItem["entityType"];
    entityId: string;
    entityTitle: string;
  } | null>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedThreadEntity, setSelectedThreadEntity] = useState<{
    entityType: CommentItem["entityType"];
    entityId: string;
    entityTitle: string;
  } | null>(null);

  const loadAllCollaborationData = async () => {
    if (!workspaceId) return;
    try {
      setIsLoading(true);
      const [sumRes, appRes, comRes, revRes, memRes] = await Promise.all([
        api.collaboration.getSummary(workspaceId).catch(() => ({ summary: null })),
        api.approvals.list(workspaceId).catch(() => ({ approvals: [] })),
        api.comments.list(workspaceId).catch(() => ({ comments: [] })),
        api.revisions.list(workspaceId).catch(() => ({ revisions: [] })),
        api.members.list(workspaceId).catch(() => ({ members: [] })),
      ]);

      if (sumRes.summary) setSummary(sumRes.summary);
      if (appRes.approvals) setApprovals(appRes.approvals);
      if (comRes.comments) setComments(comRes.comments);
      if (revRes.revisions) setRevisions(revRes.revisions);
      if (memRes.members) setMembers(memRes.members);
    } catch (err) {
      console.error("Failed to load collaboration hub data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllCollaborationData();
  }, [workspaceId]);

  const filteredApprovals = approvals.filter((app) => {
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        app.title.toLowerCase().includes(q) ||
        app.entityTitle.toLowerCase().includes(q) ||
        app.entityType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredComments = comments.filter((c) => {
    if (statusFilter === "unresolved" && c.resolved) return false;
    if (statusFilter === "internal" && !c.isInternal) return false;
    if (statusFilter === "client" && c.isInternal) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.content.toLowerCase().includes(q) ||
        c.authorName.toLowerCase().includes(q) ||
        c.entityTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredRevisions = revisions.filter((rev) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rev.entityTitle.toLowerCase().includes(q) ||
        rev.summaryOfChanges.toLowerCase().includes(q) ||
        rev.versionLabel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-6 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              Collaboration & Approvals Layer
            </span>
            <span className="text-xs text-zinc-500 font-mono">Phase 15</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight">
            Collaboration Hub
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Streamline client reviews, threaded feedback, revision diffs, and multi-party sign-offs across Studio, Releases, Projects, and Campaigns.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => loadAllCollaborationData()}
            className="p-2.5 text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-colors"
            title="Refresh Collaboration Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setShowMembersModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl transition-colors"
          >
            <Users className="w-4 h-4 text-red-400" />
            <span>Manage Access ({members.length})</span>
          </button>

          <button
            onClick={() => setShowNewApprovalModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Request Sign-Off</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Pending Sign-Offs
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">
              {summary?.pendingApprovalsCount ?? approvals.filter((a) => a.status === "pending").length}
            </span>
            <span className="text-[10px] text-zinc-500">Need Review</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Changes Requested
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-400">
              {summary?.changesRequestedCount ?? approvals.filter((a) => a.status === "changes_requested").length}
            </span>
            <span className="text-[10px] text-zinc-500">Action Required</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Approved Deliverables
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">
              {summary?.approvedCount ?? approvals.filter((a) => a.status === "approved").length}
            </span>
            <span className="text-[10px] text-zinc-500">Cleared</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Open Feedback
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-400">
              {summary?.unresolvedComments ?? comments.filter((c) => !c.resolved).length}
            </span>
            <span className="text-[10px] text-zinc-500">Comments</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Revisions Tracked
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-400">
              {summary?.totalRevisions ?? revisions.length}
            </span>
            <span className="text-[10px] text-zinc-500">Versions</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Active Members
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-200">
              {summary?.activeMembersCount ?? members.length}
            </span>
            <span className="text-[10px] text-zinc-500">
              ({summary?.clientMembersCount ?? members.filter((m) => m.role === "client").length} Clients)
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Controls & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-900/40 p-2 rounded-2xl border border-zinc-800/80">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto p-1">
          <button
            onClick={() => {
              setActiveSubTab("approvals");
              setStatusFilter("all");
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeSubTab === "approvals"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-red-400" />
            <span>Sign-Off Requests</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-900 text-zinc-300">
              {approvals.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("comments");
              setStatusFilter("all");
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeSubTab === "comments"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>Discussion Feed</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-900 text-zinc-300">
              {comments.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("revisions");
              setStatusFilter("all");
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeSubTab === "revisions"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>Revision History</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-900 text-zinc-300">
              {revisions.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("members");
              setStatusFilter("all");
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeSubTab === "members"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Team & Clients</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-900 text-zinc-300">
              {members.length}
            </span>
          </button>
        </div>

        {/* Search & Filter bar */}
        <div className="flex items-center gap-2 px-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {activeSubTab === "approvals" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="changes_requested">Changes Requested</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
            </select>
          )}

          {activeSubTab === "comments" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="all">All Comments</option>
              <option value="unresolved">Open / Unresolved</option>
              <option value="client">Client Visible</option>
              <option value="internal">Internal Team Only</option>
            </select>
          )}
        </div>
      </div>

      {/* Subtab 1: Approvals & Sign-Offs */}
      {activeSubTab === "approvals" && (
        <div className="space-y-4">
          {filteredApprovals.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900/30 border border-zinc-800 rounded-2xl space-y-3">
              <ShieldCheck className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-zinc-300">No Sign-Off Requests Found</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                All deliverables and quotes are up to date. Click "Request Sign-Off" to dispatch an asset for client or lead review.
              </p>
              <button
                onClick={() => setShowNewApprovalModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Request First Sign-Off
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApprovals.map((app) => (
                <div
                  key={app.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    app.status === "approved"
                      ? "bg-zinc-900/40 border-emerald-500/20"
                      : app.status === "changes_requested"
                      ? "bg-zinc-900/60 border-amber-500/30 shadow-sm"
                      : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {app.entityType.replace("_", " ")}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 ml-1.5">
                          {app.version || "V1"}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          app.status === "approved"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : app.status === "changes_requested"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : app.status === "declined"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {app.status.replace("_", " ")}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-zinc-100 line-clamp-1">{app.title}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{app.entityTitle}</p>
                    </div>

                    {app.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80">
                        {app.description}
                      </p>
                    )}

                    {/* Reviewers status row */}
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Requested by: <strong className="text-zinc-300">{app.requestedBy.name}</strong></span>
                      {app.dueDate && (
                        <span className="text-amber-400 font-medium">
                          Due {new Date(app.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() =>
                        setSelectedThreadEntity({
                          entityType: app.entityType as any,
                          entityId: app.entityId,
                          entityTitle: app.entityTitle,
                        })
                      }
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Comments</span>
                    </button>

                    <button
                      onClick={() => setActiveApprovalModal(app)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-lg transition-colors"
                    >
                      <span>Review / Sign-Off</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Discussion Feed */}
      {activeSubTab === "comments" && (
        <div className="space-y-4">
          {filteredComments.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900/30 border border-zinc-800 rounded-2xl space-y-3">
              <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-zinc-300">No Feedback Comments Found</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Discussion comments attached to deliverables, releases, campaigns, or tasks will stream here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/60">
              {filteredComments.map((c) => (
                <div
                  key={c.id}
                  className="p-4 hover:bg-zinc-900/40 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-zinc-200">{c.authorName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded">
                        {(c.authorRole || "member").toUpperCase()}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                      {c.isInternal ? (
                        <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded inline-flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Internal
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded inline-flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5" /> Client Visible
                        </span>
                      )}
                      {c.resolved && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded inline-flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Resolved
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {c.content}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-1">
                      <span>Attached to: <strong className="text-zinc-400">{c.entityTitle}</strong></span>
                      <span>({c.entityType})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        setSelectedThreadEntity({
                          entityType: c.entityType,
                          entityId: c.entityId,
                          entityTitle: c.entityTitle,
                        })
                      }
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Open Full Thread
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subtab 3: Revisions & Version History */}
      {activeSubTab === "revisions" && (
        <div className="space-y-4">
          {filteredRevisions.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900/30 border border-zinc-800 rounded-2xl space-y-3">
              <History className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-zinc-300">No Revisions Logged Yet</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Track creative revisions across artwork, master files, campaigns, and brief deliverables.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/60">
              {filteredRevisions.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 hover:bg-zinc-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-100">{rev.versionLabel}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                        {rev.entityType}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          rev.status === "approved"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : rev.status === "in_review"
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {rev.status.replace("_", " ")}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-zinc-200">{rev.entityTitle}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-2">{rev.summaryOfChanges}</p>
                    <span className="text-[10px] text-zinc-500 block">
                      Logged on {new Date(rev.createdAt).toLocaleDateString()} by {rev.authorName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        setActiveRevisionModal({
                          entityType: rev.entityType,
                          entityId: rev.entityId,
                          entityTitle: rev.entityTitle,
                        })
                      }
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-colors"
                    >
                      View Version Timeline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subtab 4: Team & Clients Access Directory */}
      {activeSubTab === "members" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-200">Workspace Members & Access Scopes</h3>
              <p className="text-xs text-zinc-400">
                Grant scoped entity access to external clients and collaborators.
              </p>
            </div>
            <button
              onClick={() => setShowMembersModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Invite Collaborator / Client
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {members.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-200">
                    {(m.name || m.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">{m.name}</h4>
                    <span className="text-[10px] text-zinc-400 block">{m.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      m.role === "client"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : m.role === "collaborator"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {m.role}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {m.accessScope?.allEntities ? "All Entities" : "Scoped Entities"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Embedded Floating Thread Viewer Modal */}
      {selectedThreadEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full p-4 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Attached Discussion Thread</h3>
                <p className="text-xs text-zinc-400">{selectedThreadEntity.entityTitle}</p>
              </div>
              <button
                onClick={() => setSelectedThreadEntity(null)}
                className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CommentsSection
                workspaceId={workspaceId}
                entityType={selectedThreadEntity.entityType}
                entityId={selectedThreadEntity.entityId}
                entityTitle={selectedThreadEntity.entityTitle}
                currentUser={currentUser}
              />
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {activeApprovalModal && (
        <ApprovalModal
          workspaceId={workspaceId}
          isOpen={!!activeApprovalModal}
          onClose={() => setActiveApprovalModal(null)}
          entityType={activeApprovalModal.entityType}
          entityId={activeApprovalModal.entityId}
          entityTitle={activeApprovalModal.entityTitle}
          existingApproval={activeApprovalModal}
          onApprovalUpdated={(updated) => {
            setApprovals((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
            setActiveApprovalModal(updated);
          }}
          currentUser={currentUser}
        />
      )}

      {/* New Sign-Off Modal */}
      {showNewApprovalModal && (
        <ApprovalModal
          workspaceId={workspaceId}
          isOpen={showNewApprovalModal}
          onClose={() => setShowNewApprovalModal(false)}
          onApprovalUpdated={(created) => {
            setApprovals([created, ...approvals]);
            setShowNewApprovalModal(false);
          }}
          currentUser={currentUser}
        />
      )}

      {/* Revisions History Modal */}
      {activeRevisionModal && (
        <RevisionHistoryModal
          workspaceId={workspaceId}
          isOpen={!!activeRevisionModal}
          onClose={() => setActiveRevisionModal(null)}
          entityType={activeRevisionModal.entityType}
          entityId={activeRevisionModal.entityId}
          entityTitle={activeRevisionModal.entityTitle}
          currentUser={currentUser}
          onRevisionCreated={(created) => {
            setRevisions([created, ...revisions]);
          }}
        />
      )}

      {/* Workspace Members Modal */}
      {showMembersModal && (
        <WorkspaceMembersModal
          workspaceId={workspaceId}
          isOpen={showMembersModal}
          onClose={() => {
            setShowMembersModal(false);
            loadAllCollaborationData();
          }}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};
