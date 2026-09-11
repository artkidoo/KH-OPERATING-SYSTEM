import React, { useState, useEffect } from "react";
import { 
  RadarSignal, 
  RadarDigest, 
  RadarStats, 
  RadarSeverity, 
  RadarCategory, 
  RadarSignalStatus, 
  ActiveTab 
} from "../types";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { api } from "../services/api";
import { 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Search, 
  Filter, 
  RefreshCw, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  BrainCircuit, 
  Layers, 
  Disc3, 
  Briefcase, 
  Palette, 
  ShieldAlert, 
  TrendingUp, 
  ChevronRight, 
  HelpCircle, 
  Send, 
  Flame, 
  Activity, 
  CheckCheck,
  Zap,
  Info
} from "lucide-react";

interface CreativeRadarDashboardProps {
  onNotify?: (text: string, type?: "success" | "info" | "error") => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const CreativeRadarDashboard: React.FC<CreativeRadarDashboardProps> = ({
  onNotify,
  onNavigateTab,
}) => {
  const { activeWorkspace } = useAuth();
  const { themeMode } = useTheme();

  const [signals, setSignals] = useState<RadarSignal[]>([]);
  const [digest, setDigest] = useState<RadarDigest | null>(null);
  const [stats, setStats] = useState<RadarStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("active");
  const [searchQuery, setSearchQuery] = useState("");

  // AI Diagnostic Modal state
  const [selectedSignalForBrain, setSelectedSignalForBrain] = useState<RadarSignal | null>(null);
  const [brainDiagnostic, setBrainDiagnostic] = useState<{
    explanation: string;
    rootCause: string;
    actionPlan: string[];
    aiGuidance: string;
    affectedEntityName: string;
  } | null>(null);
  const [isBrainLoading, setIsBrainLoading] = useState(false);
  const [userFollowUpQuery, setUserFollowUpQuery] = useState("");

  const fetchRadarData = async (triggerScan = false) => {
    if (!activeWorkspace?.id) return;
    try {
      if (triggerScan) setIsScanning(true);
      else setIsLoading(true);

      if (triggerScan) {
        const data = await api.radar.evaluate(activeWorkspace.id);
        setSignals(data.signals || []);
        setDigest(data.digest || null);
        setStats(data.stats || null);
        if (onNotify) {
          onNotify(`Radar sweep completed: ${data.signals.length} active operational signals detected`, "success");
        }
      } else {
        const data = await api.radar.getSignals(activeWorkspace.id, {
          includeArchived: true,
          autoEvaluate: true,
        });
        setSignals(data.signals || []);

        try {
          const digestData = await api.radar.getDigest(activeWorkspace.id);
          setDigest(digestData.digest || null);
          setStats(digestData.stats || null);
        } catch (digestErr) {
          console.warn("[Radar Dashboard] Digest sync notice:", digestErr);
        }
      }
    } catch (err: any) {
      console.error("[Radar Dashboard] Error loading data:", err);
      if (onNotify) onNotify(err?.message || "Failed to synchronize Radar intelligence", "error");
    } finally {
      setIsLoading(false);
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (activeWorkspace?.id) {
      fetchRadarData(false);
    }
  }, [activeWorkspace?.id]);

  const handleAcknowledge = async (signalId: string) => {
    if (!activeWorkspace?.id) return;
    try {
      await api.radar.acknowledgeSignal(activeWorkspace.id, signalId);
      setSignals((prev) =>
        prev.map((s) => (s.id === signalId ? { ...s, status: "acknowledged" as RadarSignalStatus } : s))
      );
      if (onNotify) onNotify("Signal acknowledged and tracked", "info");
    } catch (err) {
      console.error("Error acknowledging signal:", err);
    }
  };

  const handleDismiss = async (signalId: string) => {
    if (!activeWorkspace?.id) return;
    try {
      await api.radar.dismissSignal(activeWorkspace.id, signalId);
      setSignals((prev) =>
        prev.map((s) => (s.id === signalId ? { ...s, status: "dismissed" as RadarSignalStatus } : s))
      );
      if (onNotify) onNotify("Signal dismissed", "info");
    } catch (err) {
      console.error("Error dismissing signal:", err);
    }
  };

  const handleActioned = async (signalId: string) => {
    if (!activeWorkspace?.id) return;
    try {
      await api.radar.actionSignal(activeWorkspace.id, signalId);
      setSignals((prev) =>
        prev.map((s) => (s.id === signalId ? { ...s, status: "actioned" as RadarSignalStatus } : s))
      );
      if (onNotify) onNotify("Signal marked as resolved and actioned", "success");
    } catch (err) {
      console.error("Error actioning signal:", err);
    }
  };

  const handleExecuteRecommendedAction = (signal: RadarSignal) => {
    if (signal.recommendedAction?.targetTab && onNavigateTab) {
      onNavigateTab(signal.recommendedAction.targetTab as ActiveTab);
      if (onNotify) {
        onNotify(`Navigating to ${signal.recommendedAction.label}...`, "info");
      }
    }
  };

  const handleAskBrain = async (signal: RadarSignal, customQuery?: string) => {
    if (!activeWorkspace?.id) return;
    setSelectedSignalForBrain(signal);
    setIsBrainLoading(true);
    setBrainDiagnostic(null);

    try {
      const data = await api.radar.askBrain(activeWorkspace.id, signal.id, customQuery);
      setBrainDiagnostic(data);
    } catch (err) {
      console.error("Ask Brain error:", err);
      if (onNotify) onNotify("Creative Brain diagnostic could not be completed", "error");
    } finally {
      setIsBrainLoading(false);
    }
  };

  // Filter signals
  const filteredSignals = signals.filter((signal) => {
    if (selectedCategory !== "all" && signal.category !== selectedCategory) {
      return false;
    }
    if (selectedSeverity !== "all" && signal.severity !== selectedSeverity) {
      return false;
    }
    if (selectedStatus === "active") {
      if (signal.status !== "new" && signal.status !== "acknowledged") return false;
    } else if (selectedStatus !== "all" && signal.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        signal.title.toLowerCase().includes(q) ||
        signal.explanation.toLowerCase().includes(q) ||
        signal.affectedEntity.name.toLowerCase().includes(q) ||
        (signal.details && signal.details.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const getSeverityBadge = (severity: RadarSeverity) => {
    switch (severity) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-950/80 text-red-400 border border-red-500/50 shadow-sm shadow-red-950/50 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            CRITICAL
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-400 border border-amber-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            HIGH PRIORITY
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-950/60 text-blue-300 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            ATTENTION
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            OPPORTUNITY
          </span>
        );
    }
  };

  const getCategoryIcon = (category: RadarCategory) => {
    switch (category) {
      case "release":
        return <Disc3 className="w-4 h-4 text-red-400" />;
      case "campaign":
        return <Flame className="w-4 h-4 text-amber-400" />;
      case "project":
        return <Briefcase className="w-4 h-4 text-purple-400" />;
      case "content":
        return <Layers className="w-4 h-4 text-blue-400" />;
      case "asset":
        return <Palette className="w-4 h-4 text-emerald-400" />;
      case "studio":
        return <Sparkles className="w-4 h-4 text-pink-400" />;
      default:
        return <Activity className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div id="creative-radar-root" className="space-y-6 animate-fade-in">
      {/* 1. Header Banner & Proactive Intelligence Command Bar */}
      <div className="p-6 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-600/10 via-amber-500/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--bento-text)] font-['Space_Grotesk']">
                    CREATIVE RADAR
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-widest">
                    PROACTIVE INTELLIGENCE
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--bento-muted)] mt-0.5">
                  Autonomous operational scanner detecting release blockers, campaign gaps, and workflow momentum across {activeWorkspace?.name || "your workspace"}.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats & Sweep Action */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="radar-rescan-btn"
              onClick={() => fetchRadarData(true)}
              disabled={isScanning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-red-950/40 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
              <span>{isScanning ? "Evaluating Workspace..." : "Run Radar Sweep"}</span>
            </button>
          </div>
        </div>

        {/* 2. Executive Digest Banner */}
        {digest && (
          <div className="mt-5 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
                  EXECUTIVE RADAR DIGEST
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                Updated {new Date(digest.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <div className="text-sm font-semibold text-white tracking-tight">
              {digest.headline}
            </div>

            {digest.recommendationsSummary && digest.recommendationsSummary.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-zinc-800/60">
                {(digest.recommendationsSummary || []).slice(0, 4).map((rec, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    <span className="truncate">{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Stat Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-mono font-bold text-[var(--bento-muted)] uppercase tracking-wider">
              ACTIVE SIGNALS
            </div>
            <div className="text-2xl font-black text-[var(--bento-text)]">
              {stats?.totalActive ?? signals.filter((s) => s.status === "new" || s.status === "acknowledged").length}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-wider">
              CRITICAL BLOCKERS
            </div>
            <div className="text-2xl font-black text-red-500">
              {stats?.bySeverity.critical ?? signals.filter((s) => s.severity === "critical" && s.status !== "dismissed" && s.status !== "actioned").length}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-red-950/80 text-red-500 border border-red-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
              HIGH PRIORITY
            </div>
            <div className="text-2xl font-black text-amber-500">
              {stats?.bySeverity.high ?? signals.filter((s) => s.severity === "high" && s.status !== "dismissed" && s.status !== "actioned").length}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-500/30">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
              RESOLVED / ACTIONED
            </div>
            <div className="text-2xl font-black text-emerald-500">
              {stats?.byStatus.actioned ?? signals.filter((s) => s.status === "actioned").length}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
            <CheckCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. Filter Toolbar & Search */}
      <div className="p-4 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              selectedCategory === "all"
                ? "bg-zinc-800 text-white font-bold"
                : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
            }`}
          >
            All Categories ({signals.length})
          </button>
          <button
            onClick={() => setSelectedCategory("release")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              selectedCategory === "release"
                ? "bg-red-950 text-red-300 border border-red-500/50 font-bold"
                : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
            }`}
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span>Releases</span>
          </button>
          <button
            onClick={() => setSelectedCategory("campaign")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              selectedCategory === "campaign"
                ? "bg-amber-950 text-amber-300 border border-amber-500/50 font-bold"
                : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Campaigns</span>
          </button>
          <button
            onClick={() => setSelectedCategory("content")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              selectedCategory === "content"
                ? "bg-blue-950 text-blue-300 border border-blue-500/50 font-bold"
                : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Content</span>
          </button>
          <button
            onClick={() => setSelectedCategory("studio")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              selectedCategory === "studio"
                ? "bg-pink-950 text-pink-300 border border-pink-500/50 font-bold"
                : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>
          <button
            onClick={() => setSelectedCategory("project")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              selectedCategory === "project"
                ? "bg-purple-950 text-purple-300 border border-purple-500/50 font-bold"
                : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Projects</span>
          </button>
        </div>

        {/* Severity & Search */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search radar signals..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">🔴 Critical Only</option>
            <option value="high">🟠 High Priority</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🔵 Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="active">Active Only</option>
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="actioned">Resolved / Actioned</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* 5. Signals List */}
      {isLoading ? (
        <div className="p-16 text-center space-y-4 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)]">
          <Radio className="w-10 h-10 text-red-500 animate-spin mx-auto opacity-70" />
          <div className="text-sm font-semibold text-[var(--bento-text)]">
            Scanning workspace records and calculating readiness vectors...
          </div>
        </div>
      ) : filteredSignals.length === 0 ? (
        <div className="p-16 text-center space-y-3 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)]">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-[var(--bento-text)]">
            All Clear — No Radar Signals Found
          </h3>
          <p className="text-xs text-[var(--bento-muted)] max-w-md mx-auto">
            {selectedStatus === "active"
              ? "All releases, campaigns, content pipelines, and studio deliverables are currently aligned with zero detected blockers."
              : "No signals match the current filter selection."}
          </p>
          <button
            onClick={() => fetchRadarData(true)}
            className="mt-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Run Deep Re-evaluation
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredSignals.map((signal) => {
            const isResolved = signal.status === "actioned";
            const isDismissed = signal.status === "dismissed";
            const isAcknowledged = signal.status === "acknowledged";

            return (
              <div
                key={signal.id}
                id={`radar-signal-card-${signal.id}`}
                className={`p-5 rounded-2xl border transition-all duration-200 shadow-md ${
                  signal.severity === "critical" && !isResolved && !isDismissed
                    ? "bg-red-950/20 border-red-500/40 hover:border-red-500/60"
                    : signal.severity === "high" && !isResolved && !isDismissed
                    ? "bg-amber-950/15 border-amber-500/30 hover:border-amber-500/50"
                    : isResolved
                    ? "bg-emerald-950/10 border-emerald-500/20 opacity-75"
                    : isDismissed
                    ? "bg-zinc-900/40 border-zinc-800 opacity-60"
                    : "bg-[var(--bento-card)] border-[var(--bento-border)] hover:border-zinc-700"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left content */}
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getSeverityBadge(signal.severity)}
                      
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                        {getCategoryIcon(signal.category)}
                        <span className="capitalize">{signal.category}</span>
                      </span>

                      {/* Affected Entity Tag */}
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800">
                        Target: {signal.affectedEntity.name}
                        {signal.affectedEntity.secondaryInfo ? ` (${signal.affectedEntity.secondaryInfo})` : ""}
                      </span>

                      {isAcknowledged && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          ACKNOWLEDGED
                        </span>
                      )}

                      {isResolved && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          RESOLVED
                        </span>
                      )}

                      <span className="text-[11px] font-mono text-zinc-500 ml-auto">
                        Priority: {signal.priority}/100
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-[var(--bento-text)] tracking-tight">
                        {signal.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-[var(--bento-muted)] mt-1 leading-relaxed">
                        {signal.explanation}
                      </p>
                    </div>

                    {signal.details && (
                      <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs font-mono text-zinc-400 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                        <span>{signal.details}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-800/60">
                    {/* Primary Recommended Action Button */}
                    <button
                      id={`radar-action-btn-${signal.id}`}
                      onClick={() => handleExecuteRecommendedAction(signal)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      title={signal.recommendedAction?.actionDescription}
                    >
                      <span>{signal.recommendedAction?.label || "Resolve Issue"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Secondary Actions Row */}
                    <div className="flex items-center justify-end gap-1.5 w-full">
                      {/* Ask Creative Brain Button */}
                      <button
                        onClick={() => handleAskBrain(signal)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] font-semibold text-red-300 hover:text-white transition-colors cursor-pointer"
                        title="Ask Creative Brain for root-cause diagnosis and remediation plan"
                      >
                        <BrainCircuit className="w-3.5 h-3.5 text-red-400" />
                        <span>Diagnose</span>
                      </button>

                      {/* Acknowledge */}
                      {!isAcknowledged && !isResolved && !isDismissed && (
                        <button
                          onClick={() => handleAcknowledge(signal.id)}
                          className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title="Acknowledge signal (Track in review)"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Mark Actioned/Resolved */}
                      {!isResolved && (
                        <button
                          onClick={() => handleActioned(signal.id)}
                          className="p-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 text-emerald-400 transition-colors cursor-pointer"
                          title="Mark as Actioned / Resolved"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Dismiss */}
                      {!isDismissed && (
                        <button
                          onClick={() => handleDismiss(signal.id)}
                          className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Dismiss signal"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Creative Brain AI Diagnostic Modal */}
      {selectedSignalForBrain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40">
                  <BrainCircuit className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Creative Brain Diagnostic
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400">
                      PROACTIVE AI
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Analyzing signal: "{selectedSignalForBrain.title}"
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedSignalForBrain(null);
                  setBrainDiagnostic(null);
                  setUserFollowUpQuery("");
                }}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            {isBrainLoading ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto" />
                <div className="text-sm font-semibold text-zinc-200">
                  Consulting Creative Memory and synthesizing operational action plan...
                </div>
              </div>
            ) : brainDiagnostic ? (
              <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
                {/* Executive Diagnosis */}
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-red-400 font-bold font-mono uppercase tracking-wider text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Executive Diagnosis & Root Cause</span>
                  </div>
                  <p className="text-zinc-200 text-sm whitespace-pre-line">
                    {brainDiagnostic.explanation}
                  </p>
                </div>

                {/* 3-Step Action Plan */}
                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold font-mono uppercase tracking-wider text-[11px]">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Recommended Resolution Steps</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {brainDiagnostic.actionPlan.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-zinc-200">
                        <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 font-mono font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Follow-up Question Input */}
                <div className="pt-2">
                  <label className="block text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Ask Follow-up Question to Creative Brain:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={userFollowUpQuery}
                      onChange={(e) => setUserFollowUpQuery(e.target.value)}
                      placeholder="e.g. How do I pitch this to Spotify curators with 0 followers?"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && userFollowUpQuery.trim()) {
                          handleAskBrain(selectedSignalForBrain, userFollowUpQuery);
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                    <button
                      onClick={() => handleAskBrain(selectedSignalForBrain, userFollowUpQuery)}
                      disabled={!userFollowUpQuery.trim() || isBrainLoading}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
                  <button
                    onClick={() => {
                      handleActioned(selectedSignalForBrain.id);
                      setSelectedSignalForBrain(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>

                  <button
                    onClick={() => {
                      handleExecuteRecommendedAction(selectedSignalForBrain);
                      setSelectedSignalForBrain(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-950/40"
                  >
                    <span>Execute {selectedSignalForBrain.recommendedAction?.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// Contextual Radar Banner Component (Embeddable into Artist OS, Brand OS, etc.)
// =========================================================================
export const ContextualRadarBanner: React.FC<{
  category: RadarCategory;
  entityId?: string;
  onNavigateTab?: (tab: ActiveTab) => void;
}> = ({ category, entityId, onNavigateTab }) => {
  const { activeWorkspace } = useAuth();
  const [signals, setSignals] = useState<RadarSignal[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!activeWorkspace?.id) return;
    let isCancelled = false;
    const fetchContextualSignals = async () => {
      try {
        const data = await api.radar.getSignals(activeWorkspace.id, {
          category,
          entityId,
          status: "active",
        });
        if (!isCancelled) {
          setSignals(data.signals || []);
        }
      } catch (err) {
        console.error("Failed to load contextual radar signals:", err);
      }
    };
    fetchContextualSignals();
    return () => {
      isCancelled = true;
    };
  }, [activeWorkspace?.id, category, entityId]);

  if (isDismissed || signals.length === 0) return null;

  const topSignal = signals[0];
  const isCritical = topSignal.severity === "critical";

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md animate-fade-in ${
        isCritical
          ? "bg-red-950/40 border-red-500/50 text-red-200"
          : "bg-amber-950/30 border-amber-500/40 text-amber-200"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2 rounded-xl shrink-0 ${isCritical ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>
          <Radio className="w-4 h-4 animate-pulse" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-black/40">
              RADAR SIGNAL ({signals.length})
            </span>
            <span className="text-xs font-bold truncate">{topSignal.title}</span>
          </div>
          <p className="text-[11px] opacity-80 truncate mt-0.5">
            {topSignal.explanation}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab("creative-radar")}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View Radar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 rounded-lg hover:bg-black/30 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
