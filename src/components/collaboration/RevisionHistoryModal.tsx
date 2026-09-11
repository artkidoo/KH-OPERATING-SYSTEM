import React, { useState, useEffect } from "react";
import {
  History,
  GitBranch,
  FileCode,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Eye,
  Download,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { RevisionItem, MemberRole } from "../../types";
import { api } from "../../services/api";

interface RevisionHistoryModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  entityType?: RevisionItem["entityType"];
  entityId?: string;
  entityTitle?: string;
  currentUser?: {
    id: string;
    email: string;
    name?: string;
    role?: MemberRole;
  };
  onRevisionCreated?: (revision: RevisionItem) => void;
}

export const RevisionHistoryModal: React.FC<RevisionHistoryModalProps> = ({
  workspaceId,
  isOpen,
  onClose,
  entityType = "studio_deliverable",
  entityId = "",
  entityTitle = "",
  currentUser,
  onRevisionCreated,
}) => {
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<RevisionItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New revision form state
  const [versionLabel, setVersionLabel] = useState("");
  const [summaryOfChanges, setSummaryOfChanges] = useState("");
  const [assetUrl, setAssetUrl] = useState("");
  const [diffSummary, setDiffSummary] = useState("");

  const loadRevisions = async () => {
    if (!workspaceId || !entityId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.revisions.list(workspaceId, entityType, entityId);
      const revs = res.revisions || [];
      setRevisions(revs);
      if (revs.length > 0) {
        setSelectedRevision(revs[0]);
      }
      setVersionLabel(`V${revs.length + 1}`);
    } catch (err: any) {
      console.error("Failed to load revisions", err);
      setError(err.message || "Failed to load revision history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRevisions();
    }
  }, [isOpen, workspaceId, entityId, entityType]);

  if (!isOpen) return null;

  const handleCreateRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summaryOfChanges.trim() || isCreating) return;

    try {
      setIsCreating(true);
      setError(null);
      const res = await api.revisions.create(workspaceId, {
        entityType,
        entityId,
        entityTitle,
        versionLabel: versionLabel || `V${revisions.length + 1}`,
        previousVersionLabel: revisions.length > 0 ? revisions[0].versionLabel : undefined,
        summaryOfChanges: summaryOfChanges.trim(),
        assetUrl: assetUrl.trim() || undefined,
        diffSummary: diffSummary.trim() || undefined,
        status: "in_review",
      });

      setRevisions([res.revision, ...revisions]);
      setSelectedRevision(res.revision);
      setShowCreateForm(false);
      setSummaryOfChanges("");
      setAssetUrl("");
      setDiffSummary("");
      if (onRevisionCreated) {
        onRevisionCreated(res.revision);
      }
    } catch (err: any) {
      console.error("Failed to create revision", err);
      setError(err.message || "Could not save revision");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-100">Revision History & Deliverable Log</h2>
                <span className="px-2 py-0.5 text-xs font-mono rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {revisions.length} Version{revisions.length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate max-w-md">
                Tracking iterations for: {entityTitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showCreateForm ? "View History" : "Log New Revision"}</span>
            </button>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {showCreateForm ? (
          /* Create Revision Form */
          <form onSubmit={handleCreateRevision} className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-red-400" /> Log Deliverable Revision (V{revisions.length + 1})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Version Label</label>
                <input
                  type="text"
                  value={versionLabel}
                  onChange={(e) => setVersionLabel(e.target.value)}
                  placeholder={`V${revisions.length + 1}`}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Asset URL / Preview Link (Optional)</label>
                <input
                  type="url"
                  value={assetUrl}
                  onChange={(e) => setAssetUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Summary of Changes & Adjustments</label>
              <textarea
                value={summaryOfChanges}
                onChange={(e) => setSummaryOfChanges(e.target.value)}
                placeholder="Detail what was revised based on client or lead feedback (e.g. corrected typography hierarchy, balanced kick loudness to -14 LUFS, updated hero lighting)..."
                rows={3}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Comparison Notes / Diff Summary (Optional)</label>
              <input
                type="text"
                value={diffSummary}
                onChange={(e) => setDiffSummary(e.target.value)}
                placeholder="e.g. V1 (Flat colors) → V2 (Dynamic grain + golden hour accent)"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !summaryOfChanges.trim()}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
              >
                {isCreating ? "Recording..." : "Save Revision"}
              </button>
            </div>
          </form>
        ) : (
          /* Timeline of Revisions */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Versions List Sidebar */}
            <div className="space-y-2 border-r border-zinc-800 pr-3 md:col-span-1">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Versions Timeline
              </h4>

              {isLoading ? (
                <div className="py-8 text-center text-xs text-zinc-500">Loading history...</div>
              ) : revisions.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No revisions logged yet. Click "Log New Revision" to add the initial baseline.
                </div>
              ) : (
                revisions.map((rev) => (
                  <button
                    key={rev.id}
                    onClick={() => setSelectedRevision(rev)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedRevision?.id === rev.id
                        ? "bg-zinc-800 border-red-500/50 shadow-md"
                        : "bg-zinc-950/60 border-zinc-800 hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-zinc-100">{rev.versionLabel}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
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
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{rev.summaryOfChanges}</p>
                    <span className="text-[9px] text-zinc-500 block mt-1">
                      {new Date(rev.createdAt).toLocaleDateString()} by {rev.authorName}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Selected Version Detail Card */}
            <div className="md:col-span-2 space-y-4">
              {selectedRevision ? (
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-4">
                  <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-zinc-100">
                          {selectedRevision.versionLabel} Release Spec
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                          {selectedRevision.entityType}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Logged on {new Date(selectedRevision.createdAt).toLocaleString()} by{" "}
                        <strong className="text-zinc-200">{selectedRevision.authorName}</strong>
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase border ${
                        selectedRevision.status === "approved"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                      }`}
                    >
                      {selectedRevision.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Summary of Changes */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Summary of Modifications
                    </h4>
                    <p className="text-xs text-zinc-200 leading-relaxed bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 whitespace-pre-wrap">
                      {selectedRevision.summaryOfChanges}
                    </p>
                  </div>

                  {/* Comparison / Diff */}
                  {selectedRevision.diffSummary && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Comparative Evolution
                      </h4>
                      <div className="p-2.5 bg-zinc-900/40 rounded-lg border border-zinc-800 flex items-center gap-2 text-xs text-amber-300">
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        <span>{selectedRevision.diffSummary}</span>
                      </div>
                    </div>
                  )}

                  {/* Asset URL / Preview */}
                  {selectedRevision.assetUrl && (
                    <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Attached Deliverable Asset
                      </h4>
                      <a
                        href={selectedRevision.assetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                        <span>Open Revision Asset ({selectedRevision.versionLabel})</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center text-zinc-500 border border-zinc-800 rounded-xl">
                  Select a version to inspect changes.
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};
