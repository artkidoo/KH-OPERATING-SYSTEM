import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Lock,
  Globe,
  CheckCircle2,
  Smile,
  Paperclip,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronRight,
  UserCheck,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { CommentItem, MemberRole, FeedbackSummaryResult } from "../../types";
import { api } from "../../services/api";

interface CommentsSectionProps {
  workspaceId: string;
  entityType: CommentItem["entityType"];
  entityId: string;
  entityTitle: string;
  currentUser?: {
    id: string;
    email: string;
    name?: string;
    role?: MemberRole;
  };
  onCommentsCountChange?: (count: number) => void;
  compact?: boolean;
}

const EMOJI_OPTIONS = ["👍", "❤️", "🔥", "🎯", "👀", "🙌"];

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  workspaceId,
  entityType,
  entityId,
  entityTitle,
  currentUser,
  onCommentsCountChange,
  compact = false,
}) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [isInternalOnly, setIsInternalOnly] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "client_visible" | "internal" | "unresolved">("all");
  const [isBrainSummarizing, setIsBrainSummarizing] = useState(false);
  const [brainSummary, setBrainSummary] = useState<FeedbackSummaryResult | null>(null);
  const [showBrainSummaryModal, setShowBrainSummaryModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isClientRole = currentUser?.role === "client" || currentUser?.role === "collaborator";

  const loadComments = async () => {
    if (!workspaceId || !entityId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.comments.list(workspaceId, entityType, entityId);
      const fetched = res.comments || [];
      setComments(fetched);
      if (onCommentsCountChange) {
        onCommentsCountChange(fetched.length);
      }
    } catch (err: any) {
      console.error("Failed to load comments", err);
      setError(err.message || "Failed to load discussion thread");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [workspaceId, entityType, entityId]);

  const handleCreateComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCommentText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await api.comments.create(workspaceId, {
        entityType,
        entityId,
        entityTitle,
        content: newCommentText.trim(),
        isInternal: isClientRole ? false : isInternalOnly,
      });

      setComments((prev) => [res.comment, ...prev]);
      setNewCommentText("");
      if (onCommentsCountChange) {
        onCommentsCountChange(comments.length + 1);
      }
    } catch (err: any) {
      console.error("Failed to post comment", err);
      setError(err.message || "Could not post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateReply = async (parentId: string) => {
    if (!replyText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const parentComment = comments.find((c) => c.id === parentId);
      const res = await api.comments.create(workspaceId, {
        entityType,
        entityId,
        entityTitle,
        parentId,
        content: replyText.trim(),
        isInternal: parentComment?.isInternal || false,
      });

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), res.comment],
            };
          }
          return c;
        })
      );
      setReplyToId(null);
      setReplyText("");
    } catch (err: any) {
      console.error("Failed to post reply", err);
      setError(err.message || "Could not post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleResolve = async (commentId: string, currentResolved: boolean) => {
    try {
      const res = await api.comments.resolve(workspaceId, commentId, !currentResolved);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, resolved: res.comment.resolved, resolvedAt: res.comment.resolvedAt } : c))
      );
    } catch (err: any) {
      console.error("Failed to resolve comment", err);
    }
  };

  const handleReact = async (commentId: string, emoji: string) => {
    try {
      const res = await api.comments.react(workspaceId, commentId, emoji);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, reactions: res.comment.reactions } : c))
      );
    } catch (err: any) {
      console.error("Failed to react to comment", err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await api.comments.delete(workspaceId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      if (onCommentsCountChange) {
        onCommentsCountChange(Math.max(0, comments.length - 1));
      }
    } catch (err: any) {
      console.error("Failed to delete comment", err);
    }
  };

  const handleSummarizeWithBrain = async () => {
    if (!comments.length) return;
    try {
      setIsBrainSummarizing(true);
      const res = await api.collaboration.summarizeFeedbackWithBrain(workspaceId, {
        entityType,
        entityId,
        entityTitle,
        comments,
      });
      setBrainSummary(res.summary);
      setShowBrainSummaryModal(true);
    } catch (err: any) {
      console.error("Failed to summarize feedback with brain", err);
      setError("Creative Brain could not summarize feedback at this moment.");
    } finally {
      setIsBrainSummarizing(false);
    }
  };

  const filteredComments = comments.filter((c) => {
    if (filterMode === "unresolved" && c.resolved) return false;
    if (filterMode === "internal" && !c.isInternal) return false;
    if (filterMode === "client_visible" && c.isInternal) return false;
    return true;
  });

  return (
    <div id={`comments-section-${entityId}`} className="flex flex-col h-full bg-zinc-950/40 rounded-xl border border-zinc-800/80 overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-100">Discussion & Feedback</h3>
              <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                {comments.length}
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate max-w-[280px]">
              {entityTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Creative Brain Feedback Summarizer */}
          {comments.length >= 2 && (
            <button
              id="summarize-feedback-brain-btn"
              onClick={handleSummarizeWithBrain}
              disabled={isBrainSummarizing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
              title="Creative Brain analyzes feedback and provides an objective digest without making approval decisions"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isBrainSummarizing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Summarize Feedback</span>
            </button>
          )}

          {/* Filter Pills */}
          <div className="flex items-center p-0.5 bg-zinc-900 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-2 py-1 rounded-md transition-colors ${
                filterMode === "all" ? "bg-zinc-800 text-zinc-100 font-medium" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode("client_visible")}
              className={`px-2 py-1 rounded-md transition-colors ${
                filterMode === "client_visible" ? "bg-zinc-800 text-zinc-100 font-medium" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Client
            </button>
            {!isClientRole && (
              <button
                onClick={() => setFilterMode("internal")}
                className={`px-2 py-1 rounded-md transition-colors ${
                  filterMode === "internal" ? "bg-zinc-800 text-amber-400 font-medium" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Internal
              </button>
            )}
            <button
              onClick={() => setFilterMode("unresolved")}
              className={`px-2 py-1 rounded-md transition-colors ${
                filterMode === "unresolved" ? "bg-zinc-800 text-emerald-400 font-medium" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Open
            </button>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="px-4 py-2.5 bg-red-950/40 border-b border-red-900/50 flex items-center justify-between text-xs text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 font-bold px-1">✕</button>
        </div>
      )}

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[220px] max-h-[500px]">
        {isLoading && comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500 space-y-2">
            <div className="w-5 h-5 border-2 border-zinc-600 border-t-red-500 rounded-full animate-spin" />
            <p className="text-xs">Loading discussion thread...</p>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 space-y-2">
            <MessageSquare className="w-8 h-8 text-zinc-600 stroke-[1.5]" />
            <p className="text-sm font-medium text-zinc-400">No comments yet</p>
            <p className="text-xs max-w-xs text-zinc-500">
              Start the conversation by sharing review notes, timestamped feedback, or client approval updates.
            </p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              id={`comment-item-${comment.id}`}
              className={`group p-3.5 rounded-xl border transition-all ${
                comment.resolved
                  ? "bg-zinc-900/20 border-zinc-800/40 opacity-75"
                  : comment.isInternal
                  ? "bg-amber-950/10 border-amber-500/20"
                  : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-200">
                    {comment.authorAvatar ? (
                      <img src={comment.authorAvatar} alt={comment.authorName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      comment.authorName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-zinc-200">{comment.authorName}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          comment.authorRole === "owner" || comment.authorRole === "admin"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : comment.authorRole === "client"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {comment.authorRole.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(comment.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {comment.isInternal ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md">
                      <Lock className="w-2.5 h-2.5" /> Internal Team
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-md">
                      <Globe className="w-2.5 h-2.5" /> Client Visible
                    </span>
                  )}

                  {comment.resolved && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Resolved
                    </span>
                  )}

                  {/* Actions */}
                  <button
                    onClick={() => handleToggleResolve(comment.id, comment.resolved)}
                    className="p-1 text-zinc-400 hover:text-emerald-400 rounded transition-colors"
                    title={comment.resolved ? "Reopen comment" : "Mark resolved"}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>

                  {(currentUser?.id === comment.authorId || currentUser?.role === "owner" || currentUser?.role === "admin") && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Comment Content */}
              <div className="text-xs text-zinc-300 leading-relaxed pl-9 mb-2 whitespace-pre-wrap">
                {comment.content}
              </div>

              {/* Reactions Bar */}
              <div className="pl-9 flex items-center flex-wrap gap-1.5 pt-1">
                {(comment.reactions || []).map((rxn, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleReact(comment.id, rxn.emoji)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border transition-colors ${
                      currentUser && rxn.userIds.includes(currentUser.id)
                        ? "bg-red-500/10 border-red-500/30 text-red-300"
                        : "bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                    }`}
                  >
                    <span>{rxn.emoji}</span>
                    <span className="text-[10px] font-bold">{rxn.count}</span>
                  </button>
                ))}

                {/* Add reaction picker */}
                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReact(comment.id, emoji)}
                      className="p-1 hover:bg-zinc-800 rounded text-xs transition-colors"
                      title={`React with ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                  className="ml-auto text-xs text-zinc-400 hover:text-zinc-200 font-medium transition-colors"
                >
                  {replyToId === comment.id ? "Cancel Reply" : "Reply"}
                </button>
              </div>

              {/* Threaded Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-9 mt-3 pl-3 border-l-2 border-zinc-800 space-y-2.5">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-zinc-200">{reply.authorName}</span>
                          <span className="text-[9px] px-1 py-0.1 bg-zinc-800 text-zinc-400 rounded">
                            {reply.authorRole}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(reply.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Reply Input */}
              {replyToId === comment.id && (
                <div className="ml-9 mt-3 p-2.5 rounded-lg bg-zinc-950 border border-zinc-700/80">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${comment.authorName}...`}
                    rows={2}
                    className="w-full bg-transparent border-none text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none"
                    autoFocus
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <span className="text-[10px] text-zinc-500">
                      Replies inherit parent visibility ({comment.isInternal ? "Internal" : "Client Visible"})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setReplyToId(null)}
                        className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleCreateReply(comment.id)}
                        disabled={!replyText.trim() || isSubmitting}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-md text-xs font-semibold transition-colors"
                      >
                        Post Reply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Comment Input Box */}
      <form onSubmit={handleCreateComment} className="p-3 bg-zinc-900/90 border-t border-zinc-800">
        <div className="space-y-2">
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder={
              isInternalOnly
                ? "Add internal team note (hidden from clients)..."
                : "Add feedback or comment (visible to team and clients)..."
            }
            rows={2}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40 resize-none transition-all"
          />

          <div className="flex items-center justify-between gap-2">
            {/* Visibility Toggle */}
            {!isClientRole ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsInternalOnly(false)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    !isInternalOnly
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Globe className="w-3 h-3" /> Client Visible
                </button>
                <button
                  type="button"
                  onClick={() => setIsInternalOnly(true)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    isInternalOnly
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Lock className="w-3 h-3" /> Internal Team Only
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <Globe className="w-3 h-3 text-blue-400" /> Client feedback thread
              </span>
            )}

            {/* Post Button */}
            <button
              type="submit"
              disabled={!newCommentText.trim() || isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Send className="w-3 h-3" />
              <span>{isSubmitting ? "Posting..." : "Post"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Creative Brain Feedback Summary Modal */}
      {showBrainSummaryModal && brainSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Creative Brain • Feedback Synthesis</h3>
                  <p className="text-xs text-zinc-400">Objective summary of team & client discussion</p>
                </div>
              </div>
              <button
                onClick={() => setShowBrainSummaryModal(false)}
                className="text-zinc-400 hover:text-zinc-200 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Disclaimer pill */}
            <div className="px-3 py-2 bg-amber-950/30 border border-amber-500/30 rounded-lg text-xs text-amber-300/90 leading-snug">
              ⚠️ {brainSummary.disclaimer}
            </div>

            {/* Core Summary */}
            <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Synthesis</h4>
              <p className="text-xs text-zinc-200 leading-relaxed">{brainSummary.summary}</p>
            </div>

            {/* Highlights & Changes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-1.5">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Positive Highlights
                </h4>
                <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                  {brainSummary.positiveHighlights.length > 0 ? (
                    brainSummary.positiveHighlights.map((h, i) => <li key={i}>{h}</li>)
                  ) : (
                    <li className="text-zinc-500">None identified</li>
                  )}
                </ul>
              </div>

              <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl space-y-1.5">
                <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Changes Requested
                </h4>
                <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                  {brainSummary.actionableChangesRequested.length > 0 ? (
                    brainSummary.actionableChangesRequested.map((c, i) => <li key={i}>{c}</li>)
                  ) : (
                    <li className="text-zinc-500">No revisions requested</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Recommended Next Step */}
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                🎯
              </div>
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Recommended Operational Action</span>
                <p className="text-xs text-zinc-200 mt-0.5">{brainSummary.recommendedNextStep}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowBrainSummaryModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
