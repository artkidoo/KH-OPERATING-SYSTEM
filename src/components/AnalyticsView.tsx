import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ActiveTab } from "../types";
import { 
  TrendingUp, 
  Sparkles, 
  BarChart3, 
  Layers, 
  Disc3, 
  Radio, 
  Plus, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Target, 
  ShieldCheck, 
  HelpCircle, 
  Clock, 
  Eye, 
  Share2, 
  DollarSign, 
  Flame, 
  Search, 
  Filter, 
  FileText, 
  BrainCircuit, 
  Trash2, 
  Edit3, 
  ExternalLink,
  ChevronRight,
  Zap,
  Tag
} from "lucide-react";

interface AnalyticsViewProps {
  onNotify?: (text: string, type?: "success" | "info" | "error") => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onNotify, onNavigateTab }) => {
  const { activeWorkspace } = useAuth();
  const workspaceId = activeWorkspace?.id || "ws_demo_artist_os";

  const [activeSubTab, setActiveSubTab] = useState<"overview" | "content_format" | "platforms" | "campaigns_releases" | "goals" | "data_log">("overview");
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Form states
  const [metricForm, setMetricForm] = useState({
    entityType: "content",
    entityId: "",
    entityTitle: "",
    platform: "instagram",
    format: "Short Video",
    metricDate: new Date().toISOString().substring(0, 10),
    source: "manual",
    views: "",
    reach: "",
    impressions: "",
    engagement: "",
    streams: "",
    conversions: "",
    revenue: "",
    spend: "",
    notes: "",
  });

  const [goalForm, setGoalForm] = useState({
    title: "",
    category: "content",
    targetMetric: "views",
    targetValue: "",
    currentValue: "",
    unit: "views",
    deadline: "",
    status: "on_track",
  });

  const [importText, setImportText] = useState("");

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/workspaces/${workspaceId}/analytics/summary`);
      if (res.ok) {
        const json = await res.json();
        setSummaryData(json.summary);
      } else {
        if (onNotify) onNotify("Failed to fetch analytics summary", "error");
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
      if (onNotify) onNotify("Network error while loading analytics", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [workspaceId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSummary();
  };

  const handleGenerateInsights = async () => {
    try {
      setIsGeneratingInsights(true);
      const res = await fetch(`/api/workspaces/${workspaceId}/analytics/insights/generate`, {
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        if (onNotify) onNotify(`Generated ${json.count} new AI Growth Insights based on workspace performance`, "success");
        fetchSummary();
      } else {
        if (onNotify) onNotify("Could not generate insights", "error");
      }
    } catch (err) {
      console.error(err);
      if (onNotify) onNotify("Error generating growth insights", "error");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleSaveInsightToMemory = async (insightId: string) => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/analytics/insights/${insightId}/save-memory`, {
        method: "POST",
      });
      if (res.ok) {
        if (onNotify) onNotify("Promoted insight to Creative Memory! Brain and Content Engine now inherit this learning.", "success");
        fetchSummary();
      } else {
        if (onNotify) onNotify("Failed to save insight to memory", "error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricForm.entityTitle) {
      if (onNotify) onNotify("Please enter a title or entity name", "error");
      return;
    }

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/analytics/metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: metricForm.entityType,
          entityId: metricForm.entityId || "custom_" + Date.now(),
          entityTitle: metricForm.entityTitle,
          platform: metricForm.platform,
          format: metricForm.format,
          metricDate: metricForm.metricDate,
          source: metricForm.source,
          metrics: {
            views: metricForm.views ? Number(metricForm.views) : undefined,
            reach: metricForm.reach ? Number(metricForm.reach) : undefined,
            impressions: metricForm.impressions ? Number(metricForm.impressions) : undefined,
            engagement: metricForm.engagement ? Number(metricForm.engagement) : undefined,
            streams: metricForm.streams ? Number(metricForm.streams) : undefined,
            conversions: metricForm.conversions ? Number(metricForm.conversions) : undefined,
            revenue: metricForm.revenue ? Number(metricForm.revenue) : undefined,
            spend: metricForm.spend ? Number(metricForm.spend) : undefined,
          },
          notes: metricForm.notes,
        }),
      });

      if (res.ok) {
        if (onNotify) onNotify(`Recorded metric for "${metricForm.entityTitle}"`, "success");
        setIsRecordModalOpen(false);
        setMetricForm({
          entityType: "content",
          entityId: "",
          entityTitle: "",
          platform: "instagram",
          format: "Short Video",
          metricDate: new Date().toISOString().substring(0, 10),
          source: "manual",
          views: "",
          reach: "",
          impressions: "",
          engagement: "",
          streams: "",
          conversions: "",
          revenue: "",
          spend: "",
          notes: "",
        });
        fetchSummary();
      } else {
        if (onNotify) onNotify("Failed to record metric", "error");
      }
    } catch (err) {
      console.error(err);
      if (onNotify) onNotify("Error recording metric", "error");
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.title || !goalForm.targetValue) {
      if (onNotify) onNotify("Title and target value are required", "error");
      return;
    }

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/analytics/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: goalForm.title,
          category: goalForm.category,
          targetMetric: goalForm.targetMetric,
          targetValue: Number(goalForm.targetValue),
          currentValue: Number(goalForm.currentValue || 0),
          unit: goalForm.unit,
          deadline: goalForm.deadline || undefined,
          status: goalForm.status,
        }),
      });

      if (res.ok) {
        if (onNotify) onNotify(`Created goal: "${goalForm.title}"`, "success");
        setIsGoalModalOpen(false);
        setGoalForm({
          title: "",
          category: "content",
          targetMetric: "views",
          targetValue: "",
          currentValue: "",
          unit: "views",
          deadline: "",
          status: "on_track",
        });
        fetchSummary();
      } else {
        if (onNotify) onNotify("Failed to create goal", "error");
      }
    } catch (err) {
      console.error(err);
      if (onNotify) onNotify("Error creating goal", "error");
    }
  };

  const handleBatchImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) {
      if (onNotify) onNotify("Please paste JSON or CSV data", "error");
      return;
    }

    try {
      let items: any[] = [];
      // Try parsing as JSON first
      try {
        items = JSON.parse(importText);
        if (!Array.isArray(items)) {
          items = [items];
        }
      } catch {
        // Fallback: simple CSV line parser
        const lines = importText.trim().split("\n");
        items = lines.map((line, idx) => {
          const parts = line.split(",").map((p) => p.trim());
          return {
            entityTitle: parts[0] || `Imported Item #${idx + 1}`,
            platform: parts[1] || "instagram",
            format: parts[2] || "Short Video",
            metrics: {
              views: parts[3] ? Number(parts[3]) : undefined,
              engagement: parts[4] ? Number(parts[4]) : undefined,
              conversions: parts[5] ? Number(parts[5]) : undefined,
            },
            source: "imported",
          };
        });
      }

      const res = await fetch(`/api/workspaces/${workspaceId}/analytics/metrics/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (res.ok) {
        const json = await res.json();
        if (onNotify) onNotify(`Successfully imported ${json.count} metrics records!`, "success");
        setIsImportModalOpen(false);
        setImportText("");
        fetchSummary();
      } else {
        if (onNotify) onNotify("Failed to import batch", "error");
      }
    } catch (err) {
      console.error(err);
      if (onNotify) onNotify("Error processing batch import", "error");
    }
  };

  const handleDeleteMetric = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this metric record?")) return;
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/analytics/metrics/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (onNotify) onNotify("Metric deleted", "info");
        fetchSummary();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this goal?")) return;
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/analytics/goals/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (onNotify) onNotify("Goal removed", "info");
        fetchSummary();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading && !summaryData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-4">
        <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
        <p className="text-zinc-400 text-sm font-medium">Aggregating workspace analytics & growth intelligence...</p>
      </div>
    );
  }

  const overall = summaryData?.overall || {};
  const platformPerf = summaryData?.platformPerformance || [];
  const formatPerf = summaryData?.formatPerformance || [];
  const pillarPerf = summaryData?.pillarPerformance || [];
  const campaignPerf = summaryData?.campaignPerformance || [];
  const releasePerf = summaryData?.releasePerformance || [];
  const topContent = summaryData?.topContent || [];
  const underperformingContent = summaryData?.underperformingContent || [];
  const insights = summaryData?.insights || [];
  const goals = summaryData?.goals || [];
  const sourceBreakdown = summaryData?.sourceBreakdown || { manual: 0, imported: 0, api: 0, calculated: 0 };
  const totalRecords = (sourceBreakdown.manual || 0) + (sourceBreakdown.imported || 0) + (sourceBreakdown.api || 0) + (sourceBreakdown.calculated || 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Control Bar */}
      <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Analytics & Growth Intelligence</h1>
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 uppercase">
                  Phase 11
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400">
                Data-driven growth engine connecting content cadence, campaign execution, and creative resonance.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
          <button
            onClick={handleGenerateInsights}
            disabled={isGeneratingInsights}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold cursor-pointer transition-all hover:scale-105"
            title="Scan workspace metrics and generate actionable growth recommendations"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingInsights ? "animate-spin" : ""}`} />
            <span>{isGeneratingInsights ? "Evaluating..." : "Run AI Growth Scan"}</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bento-bg)] hover:bg-zinc-800 text-zinc-300 border border-[var(--bento-border)] text-xs font-medium cursor-pointer transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span>Import Data</span>
          </button>

          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-red-950/40 transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Metric</span>
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-[var(--bento-bg)] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-[var(--bento-border)] cursor-pointer"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Provenance & Data Integrity Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[var(--bento-card)] border border-[var(--bento-border)] rounded-xl p-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Proven Source Breakdown:</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          <span>Manual Input: <strong>{sourceBreakdown.manual || 0}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          <span>CSV / JSON Imported: <strong>{sourceBreakdown.imported || 0}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Verified API / Calculated: <strong>{(sourceBreakdown.api || 0) + (sourceBreakdown.calculated || 0)}</strong></span>
        </div>
      </div>

      {/* Top High-Impact Overview KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Views / Reach */}
        <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Views / Reach</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {(overall.totalViews || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3 h-3" /> {(overall.totalReach || 0).toLocaleString()}
            </span>
            <span>unique reach</span>
          </div>
        </div>

        {/* Avg Engagement Rate */}
        <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Engagement</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {overall.averageEngagementRate || 0}%
          </div>
          <div className="text-[11px] text-zinc-400">
            Across {overall.totalContentPublished || 0} active content items
          </div>
        </div>

        {/* Total Conversions / Pre-saves */}
        <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider">Direct Conversions</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {(overall.totalConversions || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400">
            Pre-saves, bookings & newsletter leads
          </div>
        </div>

        {/* Total Streams & Tracked Revenue */}
        <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider">Streams / Revenue</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {overall.totalStreams > 0 ? `${(overall.totalStreams).toLocaleString()} Streams` : `$${(overall.totalRevenue || 0).toLocaleString()}`}
          </div>
          <div className="text-[11px] text-zinc-400">
            {overall.totalSpend > 0 ? `Spend: $${overall.totalSpend.toLocaleString()}` : `${overall.releasesTrackedCount || 0} releases tracked`}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 border-b border-[var(--bento-border)]">
        {[
          { id: "overview", label: "Insights & Goals", icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: "content_format", label: "Content & Formats", icon: <BarChart3 className="w-3.5 h-3.5" /> },
          { id: "platforms", label: "Platform Distribution", icon: <Share2 className="w-3.5 h-3.5" /> },
          { id: "campaigns_releases", label: "Campaigns & Releases", icon: <Disc3 className="w-3.5 h-3.5" /> },
          { id: "data_log", label: `Data Vault (${totalRecords})`, icon: <FileText className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeSubTab === tab.id
                ? "bg-red-500/15 text-red-400 border border-red-500/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW & GROWTH INSIGHTS SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {/* AI Growth Insights Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <h3 className="text-base font-bold text-white">Actionable Growth Insights</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold">
                  {insights.length} active
                </span>
              </div>
              <button
                onClick={handleGenerateInsights}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Re-scan workspace</span>
              </button>
            </div>

            {insights.length === 0 ? (
              <div className="p-8 border border-[var(--bento-border)] rounded-2xl bg-[var(--bento-card)] text-center space-y-3">
                <Sparkles className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-sm text-zinc-400">No active growth insights found yet.</p>
                <button
                  onClick={handleGenerateInsights}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Generate Insights Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight: any) => (
                  <div
                    key={insight.id}
                    className="p-5 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] hover:border-purple-500/30 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          insight.confidence === "high"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {insight.confidence.toUpperCase()} CONFIDENCE • {insight.category.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {insight.relatedEntity?.name}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                        {insight.title}
                      </h4>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {insight.explanation}
                      </p>
                      <div className="p-2.5 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] text-[11px] text-zinc-400 font-mono">
                        Evidence: {insight.evidence}
                      </div>
                    </div>

                    {/* Action Footers */}
                    <div className="pt-2 border-t border-[var(--bento-border)] flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {insight.status !== "saved_to_memory" ? (
                          <button
                            onClick={() => handleSaveInsightToMemory(insight.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer border border-zinc-700 transition-colors"
                            title="Save this key rule to Creative Memory so the AI Brain remembers it"
                          >
                            <BrainCircuit className="w-3 h-3 text-purple-400" />
                            <span>Save to Memory</span>
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-purple-300 bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20">
                            <CheckCircle2 className="w-3 h-3 text-purple-400" />
                            <span>Saved to Brain Memory</span>
                          </span>
                        )}
                      </div>

                      {insight.recommendedAction && (
                        <button
                          onClick={() => {
                            if (onNavigateTab && insight.recommendedAction.targetTab) {
                              onNavigateTab(insight.recommendedAction.targetTab);
                            }
                          }}
                          className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer ml-auto"
                        >
                          <span>{insight.recommendedAction.label}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Performance Goals Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Active Workspace Goals</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                  {goals.length} goals
                </span>
              </div>
              <button
                onClick={() => setIsGoalModalOpen(true)}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Goal</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {goals.map((goal: any) => {
                const percent = Math.min(100, Math.round((goal.currentValue / (goal.targetValue || 1)) * 100));
                return (
                  <div
                    key={goal.id}
                    className="p-4 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          goal.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : goal.status === "at_risk" || goal.status === "behind"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}>
                          {goal.status.replace("_", " ")}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{goal.title}</h4>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-zinc-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>Progress: {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()} {goal.unit}</span>
                        <span className="font-bold text-white">{percent}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percent >= 100
                              ? "bg-emerald-500"
                              : percent < 40
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {goal.deadline && (
                      <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Deadline: {goal.deadline}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CONTENT & FORMATS SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === "content_format" && (
        <div className="space-y-6">
          {/* Format Diagnostics */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Format Efficiency Diagnostics</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formatPerf.map((fmt: any, idx: number) => (
                <div
                  key={fmt.format || idx}
                  className="p-4 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700">
                      {fmt.format}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      {fmt.avgEngagementRate}% Avg Eng.
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-white">
                      {fmt.avgViews.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">avg views</span>
                    </div>
                    <div className="text-xs text-zinc-400">
                      Sample Volume: {fmt.contentCount} assets tested
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--bento-bg)] border border-[var(--bento-border)] text-[11px] text-zinc-400 truncate">
                    Top sample: "{fmt.topPerformingSample}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Pillar Resonance */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" />
              <span>Content Pillar Resonance</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pillarPerf.map((pil: any, idx: number) => (
                <div
                  key={pil.pillarName || idx}
                  className="p-4 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{pil.pillarName}</span>
                    <span className="text-xs text-zinc-400">{pil.contentCount} posts</span>
                  </div>
                  <div className="text-lg font-bold text-purple-400">
                    {pil.avgViews.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">avg views</span>
                  </div>
                  <div className="text-xs text-zinc-400">
                    Engagement: {pil.avgEngagementRate}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 10 Best Performing Content Items */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Top 10 High-Yield Content Items</span>
            </h3>
            <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900/60 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-[var(--bento-border)]">
                    <tr>
                      <th className="py-3 px-4">Content Item</th>
                      <th className="py-3 px-3">Platform</th>
                      <th className="py-3 px-3">Format</th>
                      <th className="py-3 px-3">Views</th>
                      <th className="py-3 px-3">Engagement</th>
                      <th className="py-3 px-3">Conversions</th>
                      <th className="py-3 px-3">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--bento-border)]">
                    {topContent.map((item: any, idx: number) => (
                      <tr key={item.contentId || idx} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white max-w-[200px] truncate">
                          {item.title}
                        </td>
                        <td className="py-3 px-3 capitalize">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-[10px]">
                            {item.platform}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-zinc-400">{item.format}</td>
                        <td className="py-3 px-3 font-bold text-white">{item.views.toLocaleString()}</td>
                        <td className="py-3 px-3 text-emerald-400 font-semibold">{item.engagementRate}%</td>
                        <td className="py-3 px-3 text-purple-300">{item.conversions || 0}</td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            item.source === "api"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : item.source === "imported"
                              ? "bg-purple-500/10 text-purple-400"
                              : "bg-zinc-800 text-zinc-400"
                          }`}>
                            {item.source}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Underperforming Content Watchlist */}
          {underperformingContent.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Underperforming Watchlist (Hook & Pacing Iteration Opportunities)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {underperformingContent.map((item: any, idx: number) => (
                  <div
                    key={item.contentId || idx}
                    className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{item.title}</span>
                      <span className="text-amber-400 font-semibold">{item.engagementRate}% Eng.</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Platform: {item.platform} • Format: {item.format} • Views: {item.views.toLocaleString()}
                    </p>
                    <div className="text-[11px] text-amber-300/80 italic">
                      Recommendation: Tighten visual hook in first 2 seconds or swap thumbnail creative.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PLATFORM DISTRIBUTION SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === "platforms" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformPerf.map((plat: any) => (
              <div
                key={plat.platform}
                className="p-5 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">
                    {plat.platform}
                  </span>
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                    {plat.shareOfTotalViews}% of reach
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-extrabold text-white">
                    {plat.totalViews.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">views</span>
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center justify-between">
                    <span>Engagement: <strong className="text-emerald-400">{plat.avgEngagementRate}%</strong></span>
                    <span>Conversions: <strong className="text-purple-300">{plat.totalConversions}</strong></span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] text-xs text-zinc-400">
                  <span className="text-zinc-500 block text-[10px] uppercase">Top Performing Title</span>
                  <p className="font-medium text-zinc-300 truncate mt-0.5">"{plat.topPerformingTitle}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CAMPAIGNS & RELEASES SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === "campaigns_releases" && (
        <div className="space-y-6">
          {/* Release Performance */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Disc3 className="w-4 h-4 text-red-400" />
              <span>Release Momentum & Performance Trackers</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {releasePerf.map((rel: any) => (
                <div
                  key={rel.releaseId}
                  className="p-5 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{rel.title}</h4>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {rel.momentumScore}% Momentum
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
                      <span className="text-[10px] text-zinc-500 block">Streams</span>
                      <strong className="text-sm text-white">{rel.streams.toLocaleString()}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
                      <span className="text-[10px] text-zinc-500 block">Saves</span>
                      <strong className="text-sm text-purple-300">{rel.saves.toLocaleString()}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
                      <span className="text-[10px] text-zinc-500 block">Content Rollout</span>
                      <strong className="text-sm text-blue-400">{rel.contentCount} items</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campaign Performance */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span>Campaign ROI & Funnel Conversions</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaignPerf.map((camp: any) => (
                <div
                  key={camp.campaignId}
                  className="p-5 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{camp.title}</h4>
                    <span className="text-xs uppercase px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300">
                      {camp.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
                      <span className="text-[10px] text-zinc-500 block">Impressions</span>
                      <strong className="text-white">{camp.impressions.toLocaleString()}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
                      <span className="text-[10px] text-zinc-500 block">Leads/Sales</span>
                      <strong className="text-emerald-400">{camp.leadsOrSales}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
                      <span className="text-[10px] text-zinc-500 block">Revenue</span>
                      <strong className="text-purple-300">${camp.revenue.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DATA VAULT / PROVENANCE LOG SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === "data_log" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Workspace Metric Records ({totalRecords})</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 cursor-pointer"
              >
                Batch Import
              </button>
              <button
                onClick={() => setIsRecordModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white cursor-pointer"
              >
                Add Single Metric
              </button>
            </div>
          </div>

          <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900/60 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-[var(--bento-border)]">
                  <tr>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-3">Platform</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Views</th>
                    <th className="py-3 px-3">Engagement</th>
                    <th className="py-3 px-3">Streams/Conv</th>
                    <th className="py-3 px-3">Source & Verification</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--bento-border)]">
                  {topContent.map((metric: any) => (
                    <tr key={metric.contentId} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white max-w-[200px] truncate">
                        {metric.title}
                      </td>
                      <td className="py-3 px-3 capitalize">{metric.platform}</td>
                      <td className="py-3 px-3 text-zinc-400 font-mono text-[11px]">{metric.metricDate}</td>
                      <td className="py-3 px-3 font-bold text-white">{metric.views.toLocaleString()}</td>
                      <td className="py-3 px-3 text-emerald-400 font-semibold">{metric.engagementRate}%</td>
                      <td className="py-3 px-3 text-purple-300">{metric.conversions || 0}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          metric.source === "api"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : metric.source === "imported"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                        }`}>
                          {metric.source.toUpperCase()} {metric.isVerified ? "✓ Verified" : "• Self-reported"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteMetric(metric.contentId)}
                          className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
                          title="Delete metric"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECORD PERFORMANCE METRIC */}
      {/* ========================================================================= */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-400" />
                <span>Record Performance Data</span>
              </h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMetric} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Entity / Content Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Studio Vocal Session Reel #1"
                  value={metricForm.entityTitle}
                  onChange={(e) => setMetricForm({ ...metricForm, entityTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Entity Type</label>
                  <select
                    value={metricForm.entityType}
                    onChange={(e) => setMetricForm({ ...metricForm, entityType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] text-white text-sm focus:outline-none"
                  >
                    <option value="content">Content Item</option>
                    <option value="campaign">Campaign</option>
                    <option value="release">Release</option>
                    <option value="project">Project</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Platform</label>
                  <select
                    value={metricForm.platform}
                    onChange={(e) => setMetricForm({ ...metricForm, platform: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] text-white text-sm focus:outline-none"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="spotify">Spotify</option>
                    <option value="apple_music">Apple Music</option>
                    <option value="twitter">X / Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Format</label>
                  <input
                    type="text"
                    placeholder="Short Video, Carousel, Master Audio"
                    value={metricForm.format}
                    onChange={(e) => setMetricForm({ ...metricForm, format: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={metricForm.metricDate}
                    onChange={(e) => setMetricForm({ ...metricForm, metricDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Views</label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={metricForm.views}
                    onChange={(e) => setMetricForm({ ...metricForm, views: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Engagement (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="8.5"
                    value={metricForm.engagement}
                    onChange={(e) => setMetricForm({ ...metricForm, engagement: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Conversions</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={metricForm.conversions}
                    onChange={(e) => setMetricForm({ ...metricForm, conversions: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Source Provenance</label>
                <select
                  value={metricForm.source}
                  onChange={(e) => setMetricForm({ ...metricForm, source: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] text-white text-sm focus:outline-none"
                >
                  <option value="manual">Manual Entry (Self-Reported)</option>
                  <option value="imported">CSV / Tool Export</option>
                  <option value="api">Live Platform API (Verified)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Save Metric Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BATCH IMPORT */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-400" />
                <span>Batch Import Analytics</span>
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Paste JSON or CSV lines formatted as: <br />
              <code className="font-mono text-purple-300 text-[11px]">Title, Platform, Format, Views, EngagementRate, Conversions</code>
            </p>

            <form onSubmit={handleBatchImport} className="space-y-4">
              <textarea
                rows={6}
                required
                placeholder={`Reel 1 Acoustic Snippet, instagram, Short Video, 45000, 9.4, 210
Single Teaser Video, tiktok, Short Video, 120000, 11.2, 540
DSP Release Stream Tracker, spotify, Master Audio, 85000, 4.2, 0`}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] text-white text-xs font-mono focus:outline-none focus:border-purple-500"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Import Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD GOAL */}
      {/* ========================================================================= */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <span>Create Workspace Goal</span>
              </h3>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reach 500k Total Reel Views"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] text-white text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Value *</label>
                  <input
                    type="number"
                    required
                    placeholder="500000"
                    value={goalForm.targetValue}
                    onChange={(e) => setGoalForm({ ...goalForm, targetValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Current Value</label>
                  <input
                    type="number"
                    placeholder="120000"
                    value={goalForm.currentValue}
                    onChange={(e) => setGoalForm({ ...goalForm, currentValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="views, saves, leads"
                    value={goalForm.unit}
                    onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={goalForm.deadline}
                    onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
