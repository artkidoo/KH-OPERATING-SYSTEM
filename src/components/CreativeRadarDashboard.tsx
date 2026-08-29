import React, { useState, useEffect } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  RadarSignal,
  RadarDigest,
  RadarSignalStatus,
  RadarSignalPriority,
  RadarSignalType,
} from "../../types";
import {
  Radar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Bell,
  BellOff,
  MoreVertical,
  ChevronRight,
  Disc3,
  Target,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Zap,
  Brain,
  Plus,
  Calendar,
  Filter,
  RefreshCw,
  Settings,
  TrendingUp,
  AlertCircle,
  Info,
} from "lucide-react";

type RadarFilter = "all" | "critical" | "releases" | "campaigns" | "projects" | "content" | "studio" | "resolved";

export const CreativeRadarDashboard: React.FC = () => {
  const {
    radarSignals,
    radarDigest,
    fetchRadarSignals,
    acknowledgeRadarSignal,
    actionRadarSignal,
    dismissRadarSignal,
    resolveRadarSignal,
    snoozeRadarSignal,
    fetchRadarDigest,
    triggerRadarScan,
  } = useWorkspace();

  const [filter, setFilter] = useState<RadarFilter>("all");
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<RadarSignal | null>(null);
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [snoozeUntil, setSnoozeUntil] = useState<string>("");

  useEffect(() => {
    fetchRadarSignals();
    fetchRadarDigest();
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await triggerRadarScan();
    } finally {
      setIsScanning(false);
    }
  };

  const getPriorityColor = (priority: RadarSignalPriority) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "HIGH":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "MEDIUM":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "LOW":
        return "bg-neutral-500/20 text-neutral-400 border-neutral-500/30";
      default:
        return "bg-neutral-500/20 text-neutral-400 border-neutral-500/30";
    }
  };

  const getStatusIcon = (status: RadarSignalStatus) => {
    switch (status) {
      case "NEW":
        return <Bell className="w-4 h-4 text-blue-400" />;
      case "ACKNOWLEDGED":
        return <Info className="w-4 h-4 text-cyan-400" />;
      case "ACTIONED":
        return <Zap className="w-4 h-4 text-amber-400" />;
      case "RESOLVED":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "DISMISSED":
        return <XCircle className="w-4 h-4 text-neutral-500" />;
      case "EXPIRED":
        return <Clock className="w-4 h-4 text-neutral-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getTypeIcon = (type: RadarSignalType) => {
    if (type.includes("release")) return <Disc3 className="w-4 h-4" />;
    if (type.includes("campaign")) return <Target className="w-4 h-4" />;
    if (type.includes("project")) return <FolderOpen className="w-4 h-4" />;
    if (type.includes("content")) return <FileText className="w-4 h-4" />;
    if (type.includes("asset")) return <ImageIcon className="w-4 h-4" />;
    if (type.includes("studio")) return <Zap className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const filteredSignals = radarSignals.filter((signal) => {
    if (filter === "all") return signal.status !== "RESOLVED" && signal.status !== "DISMISSED";
    if (filter === "critical") return signal.priority === "CRITICAL" && signal.status !== "RESOLVED";
    if (filter === "releases") return signal.affectedEntity.type === "release";
    if (filter === "campaigns") return signal.affectedEntity.type === "campaign";
    if (filter === "projects") return signal.affectedEntity.type === "project";
    if (filter === "content") return signal.affectedEntity.type === "content";
    if (filter === "studio") return signal.affectedEntity.type.includes("studio");
    if (filter === "resolved") return signal.status === "RESOLVED";
    return true;
  });

  const handleAction = async (signal: RadarSignal, actionType: string) => {
    switch (actionType) {
      case "acknowledge":
        await acknowledgeRadarSignal(signal.id);
        break;
      case "action":
        await actionRadarSignal(signal.id);
        break;
      case "dismiss":
        await dismissRadarSignal(signal.id);
        break;
      case "resolve":
        await resolveRadarSignal(signal.id);
        break;
      case "snooze":
        setShowSnoozeModal(true);
        setSelectedSignal(signal);
        break;
    }
  };

  const handleSnoozeConfirm = async () => {
    if (selectedSignal && snoozeUntil) {
      await snoozeRadarSignal(selectedSignal.id, snoozeUntil);
      setShowSnoozeModal(false);
      setSnoozeUntil("");
      setSelectedSignal(null);
    }
  };

  const criticalCount = radarSignals.filter((s) => s.priority === "CRITICAL" && s.status !== "RESOLVED").length;
  const highCount = radarSignals.filter((s) => s.priority === "HIGH" && s.status !== "RESOLVED").length;
  const newCount = radarSignals.filter((s) => s.status === "NEW").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-red-950/30 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <Radar className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-100">Creative Radar</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                PROACTIVE INTELLIGENCE
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Keedohub is watching. Here are the most important things happening in your creative operation right now.
            </p>
          </div>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-950/50 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
          <span>{isScanning ? "Scanning..." : "Scan Now"}</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Active Signals</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-neutral-100">{filteredSignals.length}</span>
            <span className="text-[10px] text-neutral-500">need attention</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Critical</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-red-400">{criticalCount}</span>
            <span className="text-[10px] text-neutral-500">urgent issues</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">High Priority</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-400">{highCount}</span>
            <span className="text-[10px] text-neutral-500">important</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">New Today</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-400">{newCount}</span>
            <span className="text-[10px] text-neutral-500">fresh alerts</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            filter === "all"
              ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          All Active ({radarSignals.filter((s) => s.status !== "RESOLVED" && s.status !== "DISMISSED").length})
        </button>
        <button
          onClick={() => setFilter("critical")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            filter === "critical"
              ? "bg-red-900/30 text-red-400 border border-red-700"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Critical ({criticalCount})
        </button>
        <button
          onClick={() => setFilter("releases")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            filter === "releases"
              ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Releases
        </button>
        <button
          onClick={() => setFilter("campaigns")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            filter === "campaigns"
              ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Campaigns
        </button>
        <button
          onClick={() => setFilter("projects")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            filter === "projects"
              ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Projects
        </button>
        <button
          onClick={() => setFilter("content")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            filter === "content"
              ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Content
        </button>
        <button
          onClick={() => setFilter("studio")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            filter === "studio"
              ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Studio
        </button>
        <button
          onClick={() => setFilter("resolved")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            filter === "resolved"
              ? "bg-emerald-900/30 text-emerald-400 border border-emerald-700"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Resolved
        </button>
      </div>

      {/* Signals List */}
      {filteredSignals.length === 0 ? (
        <div className="p-12 rounded-2xl bg-neutral-900/30 border border-neutral-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-neutral-200">All Clear</h3>
          <p className="text-sm text-neutral-400 max-w-md mx-auto">
            {filter === "resolved"
              ? "No resolved signals yet. As you address radar alerts, they'll appear here."
              : "No active signals detected. Your creative operation is running smoothly."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSignals.map((signal) => (
            <div
              key={signal.id}
              className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col gap-4"
            >
              {/* Signal Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${getPriorityColor(signal.priority)} shrink-0`}>
                    {getTypeIcon(signal.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-neutral-100">{signal.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${getPriorityColor(signal.priority)}`}>
                        {signal.priority}
                      </span>
                      <span className="flex items-center gap-1 text-[9px] text-neutral-500">
                        {getStatusIcon(signal.status)}
                        {signal.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">{signal.explanation}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-500">
                      <span className="px-2 py-0.5 rounded bg-neutral-800">{signal.affectedEntity.type.toUpperCase()}</span>
                      {signal.affectedEntity.title && (
                        <span className="truncate max-w-[200px]">{signal.affectedEntity.title}</span>
                      )}
                      {signal.createdAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(signal.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1.5">
                  {signal.status === "NEW" && (
                    <>
                      <button
                        onClick={() => handleAction(signal, "acknowledge")}
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
                        title="Acknowledge"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleAction(signal, "action")}
                        className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs transition-colors cursor-pointer"
                        title="Take Action"
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  {signal.status === "ACKNOWLEDGED" && (
                    <button
                      onClick={() => handleAction(signal, "resolve")}
                      className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs transition-colors cursor-pointer"
                      title="Mark Resolved"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleAction(signal, "snooze")}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
                    title="Snooze"
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleAction(signal, "dismiss")}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
                    title="Dismiss"
                  >
                    <BellOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Recommended Actions */}
              {signal.recommendedAction && signal.recommendedAction.length > 0 && (
                <div className="pt-3 border-t border-neutral-800/60">
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Recommended Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {signal.recommendedAction.map((action, idx) => (
                      <button
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700"
                      >
                        {action.actionType === "open_entity" && <FolderOpen className="w-3.5 h-3.5" />}
                        {action.actionType === "create_task" && <Plus className="w-3.5 h-3.5" />}
                        {action.actionType === "generate_content" && <FileText className="w-3.5 h-3.5" />}
                        {action.actionType === "request_studio" && <Zap className="w-3.5 h-3.5" />}
                        {action.actionType === "ask_brain" && <Brain className="w-3.5 h-3.5" />}
                        {action.actionType === "fix_readiness" && <TrendingUp className="w-3.5 h-3.5" />}
                        <span>{action.label}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Snooze Modal */}
      {showSnoozeModal && selectedSignal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-neutral-100">Snooze Signal</h3>
            <p className="text-sm text-neutral-400">How long would you like to snooze this alert?</p>
            <select
              value={snoozeUntil}
              onChange={(e) => setSnoozeUntil(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select duration...</option>
              <option value={new Date(Date.now() + 30 * 60 * 1000).toISOString()}>30 minutes</option>
              <option value={new Date(Date.now() + 60 * 60 * 1000).toISOString()}>1 hour</option>
              <option value={new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()}>2 hours</option>
              <option value={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}>24 hours</option>
              <option value={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}>7 days</option>
            </select>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowSnoozeModal(false);
                  setSnoozeUntil("");
                  setSelectedSignal(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSnoozeConfirm}
                disabled={!snoozeUntil}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Snooze
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
