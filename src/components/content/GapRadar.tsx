import React, { useState } from "react";
import {
  ContentGapRecommendation,
  ContentQualityIssue,
  ContentItem,
  Release,
  Campaign,
  Asset,
} from "../../types";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  Radar,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Disc3,
  Target,
  Image as ImageIcon,
  Calendar,
  ArrowRight,
  Plus,
  Zap,
  Layers,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

interface GapRadarProps {
  onOpenItemEditorWithDraft: (draft: Partial<ContentItem>) => void;
  onOpenBatchGenerator: (initialGoal?: string, releaseId?: string, campaignId?: string) => void;
}

export const GapRadar: React.FC<GapRadarProps> = ({
  onOpenItemEditorWithDraft,
  onOpenBatchGenerator,
}) => {
  const {
    contentGaps,
    qualityIssues,
    contentItems,
    releases,
    campaigns,
    assets,
    fetchContentGaps,
  } = useWorkspace();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "release" | "campaign" | "asset" | "quality">("all");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchContentGaps();
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredGaps = contentGaps.filter((gap) => {
    if (filterType === "all") return true;
    if (filterType === "release" && gap.entityType === "release") return true;
    if (filterType === "campaign" && gap.entityType === "campaign") return true;
    if (filterType === "asset" && gap.entityType === "asset") return true;
    return false;
  });

  const handleInstantiateGap = (gap: ContentGapRecommendation) => {
    // Convert gap recommendation into pre-populated draft content item
    const draft: Partial<ContentItem> = {
      title: gap.title,
      concept: gap.whyItMatters,
      hook: gap.suggestedHook || gap.whatToDoNext,
      captionHook: gap.suggestedHook || gap.whatToDoNext,
      copy: `${gap.suggestedConcept || gap.whatToDoNext}\n\n${gap.suggestedCta || ""}`,
      caption: `${gap.suggestedConcept || gap.whatToDoNext}\n\n${gap.suggestedCta || ""}`,
      cta: gap.suggestedCta || "",
      platform: gap.suggestedPlatform || "tiktok",
      contentType: gap.suggestedContentType || "Short-Form Video (Reel/TikTok/Short)",
      contentPillar: gap.suggestedPillar || "Behind The Scenes",
      priority: gap.priority === "critical" ? "CRITICAL" : gap.priority === "high" ? "HIGH" : "MEDIUM",
      status: "idea",
      releaseId: gap.entityType === "release" ? gap.entityId : undefined,
      campaignId: gap.entityType === "campaign" ? gap.entityId : undefined,
      assetIds: gap.suggestedAssetId ? [gap.suggestedAssetId] : undefined,
      assetId: gap.suggestedAssetId,
      scheduledDate: gap.suggestedDate || new Date().toISOString().split("T")[0],
    };

    onOpenItemEditorWithDraft(draft);
  };

  return (
    <div className="space-y-6">
      {/* Gap Radar Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-red-950/30 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <Radar className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-100">Content Gap Radar & Strategy Scanner</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                LIVE INTEL
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Continuously answers: <strong className="text-neutral-200">What should you create next, why, and which release/vault assets to attach?</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs border border-neutral-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Rescan Workspace Gaps"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Rescan</span>
          </button>

          <button
            onClick={() => onOpenBatchGenerator("Fill strategic release and campaign content gaps")}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-950/50 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Strategy Batch</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Strategic Gaps</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-neutral-100">{contentGaps.length}</span>
            <span className="text-[10px] text-neutral-500">unaddressed opportunities</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Quality Audits</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-amber-400">{qualityIssues.length}</span>
            <span className="text-[10px] text-neutral-500">items need hook / CTA polish</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Active Releases</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-red-400">{releases.length}</span>
            <span className="text-[10px] text-neutral-500">in catalog</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Unused Vault Assets</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-cyan-400">
              {assets.filter((a) => !contentItems.some((ci) => ci.assetIds?.includes(a.id) || ci.assetId === a.id)).length}
            </span>
            <span className="text-[10px] text-neutral-500">ready to repurpose</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setFilterType("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            filterType === "all"
              ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          All Gaps ({contentGaps.length})
        </button>
        <button
          onClick={() => setFilterType("release")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            filterType === "release"
              ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Release Coverage
        </button>
        <button
          onClick={() => setFilterType("campaign")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            filterType === "campaign"
              ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Campaign Sprints
        </button>
        <button
          onClick={() => setFilterType("asset")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            filterType === "asset"
              ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Unused Vault Assets
        </button>
      </div>

      {/* Strategic Gap Cards Grid */}
      {filteredGaps.length === 0 ? (
        <div className="p-8 rounded-2xl bg-neutral-900/30 border border-neutral-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-200">No Content Gaps Detected</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Your active releases, campaigns, and vault assets have healthy content coverage scheduled across your platforms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGaps.map((gap) => (
            <div
              key={gap.id}
              className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {gap.entityType === "release" ? (
                      <span className="p-1.5 rounded-lg bg-red-950/60 text-red-400 border border-red-900/50">
                        <Disc3 className="w-4 h-4" />
                      </span>
                    ) : gap.entityType === "campaign" ? (
                      <span className="p-1.5 rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-900/50">
                        <Target className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-1.5 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-900/50">
                        <ImageIcon className="w-4 h-4" />
                      </span>
                    )}

                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                        {gap.entityType?.toUpperCase()} OPPORTUNITY
                      </span>
                      <h3 className="text-sm font-bold text-neutral-100">{gap.title}</h3>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                      gap.priority === "critical"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : gap.priority === "high"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    }`}
                  >
                    {gap.priority}
                  </span>
                </div>

                <div className="text-xs text-neutral-300 space-y-1.5 bg-neutral-950/50 p-3 rounded-lg border border-neutral-800/80">
                  <p>
                    <strong className="text-neutral-400">Context:</strong> {gap.whatIsMissing}
                  </p>
                  <p>
                    <strong className="text-neutral-400">Impact:</strong> {gap.whyItMatters}
                  </p>
                  {gap.suggestedHook && (
                    <div className="mt-2 pt-2 border-t border-neutral-800">
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-0.5">
                        Recommended Hook:
                      </span>
                      <p className="text-neutral-200 italic font-serif text-[11px]">"{gap.suggestedHook}"</p>
                    </div>
                  )}
                </div>

                {gap.suggestedPlatform && (
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                    <span>Target:</span>
                    <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 font-medium">
                      {gap.suggestedPlatform.toUpperCase()}
                    </span>
                    {gap.suggestedPillar && (
                      <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 font-medium">
                        {gap.suggestedPillar}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                <span className="text-[11px] text-neutral-400">Actionable step</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleInstantiateGap(gap)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 flex items-center gap-1.5 transition-colors border border-neutral-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Piece</span>
                  </button>
                  <button
                    onClick={() => onOpenBatchGenerator(gap.title, gap.entityType === "release" ? gap.entityId : undefined, gap.entityType === "campaign" ? gap.entityId : undefined)}
                    className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold flex items-center gap-1 transition-colors border border-red-500/30 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Batch Sprint</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quality Issues Section */}
      {qualityIssues.length > 0 && (
        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                Content Quality & Retention Audits ({qualityIssues.length})
              </h3>
            </div>
            <span className="text-xs text-neutral-400">Auto-detected formatting alerts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {qualityIssues.map((issue) => {
              const targetItem = contentItems.find((c) => c.id === issue.contentId);
              return (
                <div
                  key={issue.id}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-semibold text-neutral-200 truncate">
                      {targetItem?.title || "Content Item"}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 shrink-0">
                      {issue.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">{issue.message}</p>
                  <p className="text-[10px] text-amber-300/80 italic font-mono">{issue.fixHint}</p>
                  {targetItem && (
                    <button
                      onClick={() => onOpenItemEditorWithDraft(targetItem)}
                      className="text-[11px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      Fix Item in Editor <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
