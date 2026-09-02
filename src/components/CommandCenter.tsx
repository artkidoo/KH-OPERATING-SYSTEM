import React, { useState, useEffect, useCallback } from "react";
import { 
  ActiveTab, 
  CommandCenterData, 
  NextActionItem, 
  CommandCenterItem, 
  EntityRelationNode,
  IdentityType
} from "../types";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCreativeBrain } from "../context/CreativeBrainContext";
import { useTheme } from "../context/ThemeContext";
import { 
  Radio, 
  Disc3, 
  Sparkles, 
  Layers, 
  Palette, 
  BrainCircuit, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  Clock, 
  HardDrive, 
  CheckSquare, 
  Target, 
  Plus, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Activity, 
  ShieldAlert, 
  Zap, 
  TrendingUp, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Music, 
  Briefcase, 
  Video, 
  Award,
  Layers3,
  Network,
  ListTodo,
  Rocket
} from "lucide-react";
import { ActivationChecklist } from "./onboarding/ActivationChecklist";

interface CommandCenterProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenBriefModal: () => void;
  onNotify: (text: string, type?: "success" | "info" | "error") => void;
}

type TodayFilter = "next-actions" | "priority" | "upcoming" | "blocked" | "completed";

export const CommandCenter: React.FC<CommandCenterProps> = ({
  onNavigateTab,
  onOpenBriefModal,
  onNotify,
}) => {
  const { activeWorkspace } = useAuth();
  const { openBrainWithContext } = useCreativeBrain();
  const { currentThemeConfig } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CommandCenterData | null>(null);
  const [todayFilter, setTodayFilter] = useState<TodayFilter>("next-actions");
  const [selectedGraphNodeId, setSelectedGraphNodeId] = useState<string | null>(null);
  const [showGraphModal, setShowGraphModal] = useState(false);

  const loadData = useCallback(async (isSilent = false) => {
    if (!activeWorkspace) return;
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      setError(null);
      const res = await api.commandCenter.get(activeWorkspace.id);
      setData(res.data);
      if (res.data.relationshipGraph.length > 0 && !selectedGraphNodeId) {
        setSelectedGraphNodeId(res.data.relationshipGraph[0].id);
      }
    } catch (err: any) {
      console.error("[Command Center Load Error]", err);
      setError(err.message || "Failed to load command center");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeWorkspace, selectedGraphNodeId]);

  useEffect(() => {
    loadData();
  }, [activeWorkspace?.id]);

  const handleAskBrainAbout = (title: string, details?: any) => {
    openBrainWithContext(
      activeWorkspace?.identityType === "artist" ? "release" : "campaign",
      details?.id || "active",
      title,
      details
    );
    onNotify(`Creative Brain opened with context: "${title}"`, "info");
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse py-4">
        {/* Skeleton Top Bar */}
        <div className="h-14 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl"></div>
        {/* Skeleton Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl"></div>
          ))}
        </div>
        {/* Skeleton Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl"></div>
          <div className="h-96 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-3xl bg-zinc-950 border border-red-500/30 text-center space-y-4 my-6">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Failed to connect to Command Center</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">{error || "Unable to aggregate workspace data."}</p>
        <button
          onClick={() => loadData()}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs cursor-pointer inline-flex items-center gap-2 shadow-lg transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const { identityType, summary, today, activeEntities, radarDigest, recentActivity, relationshipGraph } = data;
  const activeRelease = activeEntities.activeRelease;
  const releaseReadiness = activeEntities.releaseReadiness;
  const activeCampaign = activeEntities.activeCampaign;
  const campaignReadiness = activeEntities.campaignReadiness;

  const selectedGraphNode = relationshipGraph.find((n) => n.id === selectedGraphNodeId) || relationshipGraph[0];

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-['Plus_Jakarta_Sans']">
      {/* ========================================================= */}
      {/* 1. CROSS-OS BREADCRUMB & SYSTEM STATUS BAR */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3.5 px-4 sm:px-6 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-xs backdrop-blur-md">
        {/* Left: OS Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 overflow-x-auto max-w-full py-1">
          <span className="font-mono font-bold text-zinc-300 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {data.workspaceName}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <span className="font-semibold text-zinc-200 uppercase tracking-wider shrink-0">
            {identityType ? identityType.toUpperCase() : "CREATIVE"} OS
          </span>
          {activeRelease && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              <span className="text-red-400 font-bold truncate max-w-[140px] sm:max-w-[200px]">
                {activeRelease.title}
              </span>
            </>
          )}
          {activeCampaign && !activeRelease && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              <span className="text-blue-400 font-bold truncate max-w-[140px] sm:max-w-[200px]">
                {activeCampaign.title}
              </span>
            </>
          )}
        </div>

        {/* Right: Contextual OS Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={() => handleAskBrainAbout(
              activeRelease ? `Release: ${activeRelease.title}` : activeCampaign ? `Campaign: ${activeCampaign.title}` : "Command Center Overview",
              activeRelease || activeCampaign
            )}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
            <span>Ask Brain</span>
          </button>

          <button
            onClick={() => onOpenBriefModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-accent text-white text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Request Studio</span>
          </button>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            title="Refresh Command Center Data"
            className="p-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-red-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1B. ACTIVATION CHECKLIST & ONBOARDING ROADMAP */}
      {/* ========================================================= */}
      <ActivationChecklist
        workspace={activeWorkspace}
        onNavigateTab={onNavigateTab}
        releasesCount={summary.releases}
        campaignsCount={summary.campaigns}
        assetsCount={summary.assets}
        contentCount={summary.contentItems}
      />

      {/* ========================================================= */}
      {/* 2. OPERATIONAL PULSE & METRIC SUMMARY */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Health Score Card */}
        <div className="p-4 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">System Health</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-['Space_Grotesk'] text-white">
              {summary.healthScore}%
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              summary.healthScore >= 80 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
            }`}>
              {summary.healthScore >= 80 ? "OPTIMAL" : "NEEDS ACTION"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400 truncate">
            {summary.activeBlockers === 0 ? "Zero operational blockers detected" : `${summary.activeBlockers} active blockers pending`}
          </p>
        </div>

        {/* Next Drop / Launch Pulse */}
        <div 
          onClick={() => onNavigateTab(identityType === "artist" ? "artist-os" : "brand-os")}
          className="p-4 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] hover:border-red-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">
              {identityType === "artist" ? "Active Release" : "Active Campaign"}
            </span>
            <Rocket className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2">
            <div className="text-sm sm:text-base font-bold text-white truncate">
              {activeRelease?.title || activeCampaign?.title || "No active launch"}
            </div>
            <div className="mt-1 text-[11px] font-semibold flex items-center gap-1.5 text-red-400">
              <span>{releaseReadiness?.formattedDays || campaignReadiness?.formattedDays || "Ready for planning"}</span>
              {releaseReadiness && (
                <span className="text-zinc-500">• {releaseReadiness.score}% Ready</span>
              )}
            </div>
          </div>
        </div>

        {/* Creative Radar Live Signals */}
        <div 
          onClick={() => onNavigateTab("creative-radar")}
          className="p-4 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">Creative Radar</span>
            <Radio className="w-4 h-4 text-amber-400 group-hover:animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-['Space_Grotesk'] text-white">
              {summary.activeRadarSignals}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400">
              LIVE SIGNALS
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400 truncate">
            {radarDigest ? radarDigest.headline : "Proactive evaluation online"}
          </p>
        </div>

        {/* Content & Studio Pipeline */}
        <div 
          onClick={() => onNavigateTab("content-engine")}
          className="p-4 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] hover:border-blue-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">Content & Studio</span>
            <Layers className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-['Space_Grotesk'] text-white">
              {summary.contentItems}
            </span>
            <span className="text-xs text-zinc-400">posts •</span>
            <span className="text-sm font-bold text-zinc-200">{summary.studioRequests}</span>
            <span className="text-xs text-zinc-400">requests</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400 truncate">
            {summary.assets} assets stored in Vault
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2B. PERFORMANCE & GROWTH PULSE (PHASE 11 ANALYTICS) */}
      {/* ========================================================= */}
      {data.performancePulse && (
        <div 
          onClick={() => onNavigateTab("analytics")}
          className="p-4 sm:p-5 rounded-2xl bg-[var(--bento-card)] border border-purple-500/30 hover:border-purple-500/60 shadow-sm transition-all cursor-pointer group space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider">
                    Performance Pulse • Phase 11
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                    data.performancePulse.status === "strong"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}>
                    {data.performancePulse?.status ? data.performancePulse.status.toUpperCase() : "OPTIMAL"}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  {data.performancePulse.headline}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-purple-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>View Full Analytics Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Quick Signals & Top Insight Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
            {(data.performancePulse?.signals || []).slice(0, 2).map((sig: any, idx: number) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center gap-2 text-zinc-300"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  sig.type === "positive" ? "bg-emerald-400" : sig.type === "warning" ? "bg-amber-400" : "bg-blue-400"
                }`} />
                <span className="truncate"><strong>{sig.label}:</strong> {sig.detail}</span>
              </div>
            ))}

            {data.performancePulse.topInsight && (
              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-200 truncate flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate"><strong>Insight:</strong> {data.performancePulse.topInsight.title}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PRIMARY SPLIT: TODAY ENGINE & IDENTITY HERO WORKSTATION */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT / CENTER (7 cols): TODAY VIEW & DETERMINISTIC NEXT ACTIONS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-sm space-y-5">
            {/* Header & Filter Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
              <div className="flex items-center justify-between w-full sm:w-auto">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-500" />
                    <span>Today View & Next Actions</span>
                  </h2>
                  <p className="text-xs text-zinc-400">
                    What needs your attention, what is blocked, and deterministic recommendations.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab("workflow")}
                  className="sm:hidden px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:border-red-500/40 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-red-400" />
                  <span>Tasks</span>
                </button>
              </div>

              {/* Filter Pills and Hub Link */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 overflow-x-auto max-w-full">
                  <button
                    onClick={() => setTodayFilter("next-actions")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      todayFilter === "next-actions"
                        ? "bg-red-600 text-white font-bold shadow-xs"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Next Actions ({today.nextActions.length})
                  </button>
                  <button
                    onClick={() => setTodayFilter("priority")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      todayFilter === "priority"
                        ? "bg-red-600 text-white font-bold shadow-xs"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Priority ({today.priority.length})
                  </button>
                  <button
                    onClick={() => setTodayFilter("upcoming")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      todayFilter === "upcoming"
                        ? "bg-red-600 text-white font-bold shadow-xs"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Upcoming ({today.upcoming.length})
                  </button>
                  <button
                    onClick={() => setTodayFilter("blocked")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      todayFilter === "blocked"
                        ? "bg-red-600 text-white font-bold shadow-xs"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Blocked ({today.blocked.length})
                  </button>
                  <button
                    onClick={() => setTodayFilter("completed")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      todayFilter === "completed"
                        ? "bg-red-600 text-white font-bold shadow-xs"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Completed ({today.recentlyCompleted.length})
                  </button>
                </div>

                <button
                  onClick={() => onNavigateTab("workflow")}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-red-500/40 text-xs font-bold text-zinc-200 hover:text-white transition-all cursor-pointer whitespace-nowrap shadow-xs"
                  title="Open full Kanban Workflow & Tasks Hub"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-red-400" />
                  <span>Workflow Hub</span>
                  <ArrowRight className="w-3 h-3 text-zinc-500" />
                </button>
              </div>
            </div>

            {/* TAB CONTENT: NEXT ACTIONS */}
            {todayFilter === "next-actions" && (
              <div className="space-y-3">
                {today.nextActions.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-950/60 rounded-2xl border border-zinc-800/60">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-white">All Priority Items Clear</h4>
                    <p className="text-xs text-zinc-400 mt-1">No critical blockers or gaps detected right now.</p>
                  </div>
                ) : (
                  today.nextActions.map((action, idx) => (
                    <div
                      key={action.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-red-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center font-mono font-black text-xs text-red-400 shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-white group-hover:text-red-400 transition-colors">
                              {action.title}
                            </span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                              action.urgency === "critical"
                                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                            }`}>
                              {action.badge}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-2">
                            {action.reason}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onNavigateTab(action.actionTab)}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-red-600 hover:text-white border border-zinc-800 hover:border-red-600 text-xs font-semibold text-zinc-200 transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>{action.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: PRIORITY */}
            {todayFilter === "priority" && (
              <div className="space-y-3">
                {today.priority.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-950/60 rounded-2xl border border-zinc-800/60">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-white">No Urgent Priority Items</h4>
                    <p className="text-xs text-zinc-400 mt-1">Your release timeline and tasks are on track.</p>
                  </div>
                ) : (
                  today.priority.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{item.title}</span>
                          {item.badge && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400">{item.subtitle}</p>
                      </div>
                      <button
                        onClick={() => onNavigateTab(item.actionTab)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-200 shrink-0 cursor-pointer"
                      >
                        {item.actionLabel}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: UPCOMING */}
            {todayFilter === "upcoming" && (
              <div className="space-y-3">
                {today.upcoming.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-950/60 rounded-2xl border border-zinc-800/60">
                    <Calendar className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-white">No Upcoming Drops Scheduled</h4>
                    <p className="text-xs text-zinc-400 mt-1">Schedule a release or campaign to populate the rollout timeline.</p>
                  </div>
                ) : (
                  today.upcoming.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{item.title}</span>
                          {item.badge && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400">{item.subtitle}</p>
                      </div>
                      <button
                        onClick={() => onNavigateTab(item.actionTab)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-200 shrink-0 cursor-pointer"
                      >
                        {item.actionLabel}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: BLOCKED */}
            {todayFilter === "blocked" && (
              <div className="space-y-3">
                {today.blocked.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-950/60 rounded-2xl border border-zinc-800/60">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-white">Zero Blockers</h4>
                    <p className="text-xs text-zinc-400 mt-1">Everything is unblocked and clear for execution.</p>
                  </div>
                ) : (
                  today.blocked.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-red-950/10 border border-red-500/30 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                          <span className="font-bold text-sm text-white">{item.title}</span>
                        </div>
                        <p className="text-xs text-zinc-400">{item.subtitle}</p>
                      </div>
                      <button
                        onClick={() => onNavigateTab(item.actionTab)}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shrink-0 cursor-pointer"
                      >
                        {item.actionLabel}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: COMPLETED */}
            {todayFilter === "completed" && (
              <div className="space-y-3">
                {today.recentlyCompleted.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-950/60 rounded-2xl border border-zinc-800/60">
                    <CheckSquare className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-white">No Completed Tasks Yet</h4>
                    <p className="text-xs text-zinc-400 mt-1">Check off tasks and approve deliverables to see your accomplishments.</p>
                  </div>
                ) : (
                  today.recentlyCompleted.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between gap-3 opacity-90"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="font-semibold text-sm text-zinc-200 line-through">{item.title}</span>
                          {item.badge && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500">{item.subtitle}</p>
                      </div>
                      <button
                        onClick={() => onNavigateTab(item.actionTab)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-400 shrink-0 cursor-pointer"
                      >
                        {item.actionLabel}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* 4. CROSS-OS RELATIONSHIP GRAPH PREVIEW */}
          {/* ========================================================= */}
          <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Cross-OS Relationship Graph</h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 font-semibold">
                {relationshipGraph.length} Root Nodes Active
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Live linkage engine connecting Releases, Campaigns, Content, Studio Services, Assets, Tasks, and Radar.
            </p>

            {/* Tree Nodes Selector */}
            {relationshipGraph.length === 0 ? (
              <div className="p-6 text-center bg-zinc-950/60 rounded-2xl border border-zinc-800/60 text-xs text-zinc-400">
                Create a Release or Campaign to visualize your cross-OS architecture tree.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Node Pill Switcher */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {relationshipGraph.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => setSelectedGraphNodeId(node.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        selectedGraphNode?.id === node.id
                          ? "bg-indigo-600 text-white font-bold shadow-xs"
                          : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800"
                      }`}
                    >
                      {node.entityType === "release" ? <Disc3 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>{node.title}</span>
                      <span className="text-[10px] opacity-75">({node.connections.length})</span>
                    </button>
                  ))}
                </div>

                {/* Selected Node Visual Tree Card */}
                {selectedGraphNode && (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                          {selectedGraphNode.entityType}
                        </span>
                        <span className="font-bold text-sm text-white">{selectedGraphNode.title}</span>
                      </div>
                      <button
                        onClick={() => onNavigateTab(selectedGraphNode.actionTab)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Workstation</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Connected Children Leaves */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {selectedGraphNode.connections.map((conn, cIdx) => (
                        <div
                          key={cIdx}
                          onClick={() => onNavigateTab(conn.actionTab)}
                          className="p-2.5 rounded-xl bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between gap-2 group"
                        >
                          <div className="min-w-0">
                            <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                              {conn.relationship}
                            </span>
                            <span className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate block">
                              {conn.targetTitle}
                            </span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-indigo-400 shrink-0 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT (5 cols): PERSONALIZED IDENTITY WORKSTATION & ACTIVITY */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 5A. IDENTITY SPECIFIC HERO CARD */}
          {identityType === "artist" && (
            <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Disc3 className="w-5 h-5 text-red-500" />
                  <h3 className="text-base font-bold text-white">Artist Release Readiness</h3>
                </div>
                <button
                  onClick={() => onNavigateTab("artist-os")}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Launch Artist OS</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {activeRelease && releaseReadiness ? (
                <div className="space-y-4">
                  {/* Title & Countdown */}
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white truncate">{activeRelease.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${releaseReadiness.stageColor}`}>
                        {releaseReadiness.stage ? releaseReadiness.stage.toUpperCase() : "PLANNING"}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400">
                      Artist: <strong className="text-zinc-200">{activeRelease.artistName}</strong> • Drop:{" "}
                      <strong className="text-red-400">{releaseReadiness.formattedDays}</strong>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-zinc-400">7-Pillar Launch Readiness</span>
                        <span className="text-red-400 font-bold">{releaseReadiness.score}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className="h-full bg-linear-to-r from-red-600 to-amber-500 transition-all duration-500 rounded-full"
                          style={{ width: `${releaseReadiness.score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Missing Requirements Checklist */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                      Readiness Verification ({releaseReadiness.completedCount}/{releaseReadiness.totalCount})
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {releaseReadiness.requirements.map((req: any) => (
                        <div
                          key={req.id}
                          onClick={() => onNavigateTab(req.actionTab)}
                          className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            req.completed
                              ? "bg-zinc-950/40 border-zinc-800/60 text-zinc-400"
                              : "bg-red-950/20 border-red-500/30 text-zinc-200 hover:border-red-500/60"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {req.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-red-500/60 shrink-0" />
                            )}
                            <span className={`truncate ${req.completed ? "line-through text-zinc-500" : "font-semibold"}`}>
                              {req.label}
                            </span>
                          </div>
                          {!req.completed && (
                            <span className="text-[10px] text-red-400 font-bold shrink-0 flex items-center gap-1">
                              <span>{req.actionLabel}</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-zinc-950/60 rounded-2xl border border-zinc-800/60 space-y-3">
                  <Music className="w-8 h-8 text-red-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No Active Release Drafted</h4>
                  <p className="text-xs text-zinc-400">
                    Create your first release to initialize the 7-Pillar readiness and rollout pipeline.
                  </p>
                  <button
                    onClick={() => onNavigateTab("artist-os")}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer shadow-md inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create First Release</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 5B. BRAND / BUSINESS / STARTUP HERO CARD */}
          {identityType !== "artist" && (
            <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold text-white">
                    {identityType === "brand" ? "Brand Campaign Readiness" : identityType === "startup" ? "Startup Launch Hub" : "Business Operations"}
                  </h3>
                </div>
                <button
                  onClick={() => onNavigateTab("brand-os")}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Hub</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {activeCampaign && campaignReadiness ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white truncate">{activeCampaign.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${campaignReadiness.stageColor}`}>
                        {campaignReadiness.stage ? campaignReadiness.stage.toUpperCase() : "PLANNING"}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400">
                      Goal: <strong className="text-zinc-200">{activeCampaign.goal || "Growth Sprint"}</strong> • Launch:{" "}
                      <strong className="text-blue-400">{campaignReadiness.formattedDays}</strong>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-zinc-400">Campaign Launch Score</span>
                        <span className="text-blue-400 font-bold">{campaignReadiness.score}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className="h-full bg-linear-to-r from-blue-600 to-indigo-500 transition-all duration-500 rounded-full"
                          style={{ width: `${campaignReadiness.score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                      Launch Requirements ({campaignReadiness.completedCount}/{campaignReadiness.totalCount})
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {campaignReadiness.requirements.map((req: any) => (
                        <div
                          key={req.id}
                          onClick={() => onNavigateTab(req.actionTab)}
                          className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            req.completed
                              ? "bg-zinc-950/40 border-zinc-800/60 text-zinc-400"
                              : "bg-blue-950/20 border-blue-500/30 text-zinc-200 hover:border-blue-500/60"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {req.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-blue-500/60 shrink-0" />
                            )}
                            <span className={`truncate ${req.completed ? "line-through text-zinc-500" : "font-semibold"}`}>
                              {req.label}
                            </span>
                          </div>
                          {!req.completed && (
                            <span className="text-[10px] text-blue-400 font-bold shrink-0 flex items-center gap-1">
                              <span>{req.actionLabel}</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-zinc-950/60 rounded-2xl border border-zinc-800/60 space-y-3">
                  <Briefcase className="w-8 h-8 text-blue-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No Active Campaign Initialized</h4>
                  <p className="text-xs text-zinc-400">
                    Create a campaign to link your product offers, hero visual mockups, and multi-channel sprint.
                  </p>
                  <button
                    onClick={() => onNavigateTab("brand-os")}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-md inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Campaign</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 5C. REAL RECENT ACTIVITY STREAM */}
          <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Recent Activity Stream</h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">Real-Time Events</span>
            </div>

            {recentActivity.length === 0 ? (
              <div className="p-6 text-center bg-zinc-950/60 rounded-2xl border border-zinc-800/60 text-xs text-zinc-400">
                No recent activity logged yet.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {(recentActivity || []).slice(0, 8).map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-start gap-3 text-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-zinc-200 truncate">{act.action.replace(/_/g, " ")}</span>
                        <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                          {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-zinc-400 line-clamp-2">{act.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
