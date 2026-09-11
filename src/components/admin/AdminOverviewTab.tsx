import React from "react";
import {
  Users,
  HardDrive,
  Disc3,
  Layers,
  Sparkles,
  AlertTriangle,
  LifeBuoy,
  ShieldCheck,
  Activity,
  Cpu,
  Database,
  ArrowUpRight,
  RefreshCw,
  Server,
  Zap,
} from "lucide-react";
import { AdminOverviewStats } from "../../types";

interface AdminOverviewTabProps {
  stats: AdminOverviewStats | null;
  loading: boolean;
  onRefresh: () => void;
  onNavigateTab: (tabId: string) => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  stats,
  loading,
  onRefresh,
  onNavigateTab,
}) => {
  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & Quick Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            Platform Pulse & Executive Telemetry
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time aggregate status across all active tenants, releases, and platform infrastructure
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="self-start md:self-auto px-3.5 py-1.5 rounded-lg border border-border/60 bg-card hover:bg-accent text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-purple-500" : ""}`} />
          Refresh Pulse
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Users */}
        <div
          onClick={() => onNavigateTab("users")}
          className="p-4 rounded-xl border border-border/60 bg-card/60 hover:border-purple-500/50 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Total Users</span>
            <Users className="w-4 h-4 text-purple-400 group-hover:text-purple-500 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <span>+{stats.newUsersLast7Days} this week</span>
          </div>
        </div>

        {/* Workspaces */}
        <div
          onClick={() => onNavigateTab("workspaces")}
          className="p-4 rounded-xl border border-border/60 bg-card/60 hover:border-blue-500/50 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Workspaces</span>
            <HardDrive className="w-4 h-4 text-blue-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.totalWorkspaces}</div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {stats.activeWorkspaces} active tenants
          </div>
        </div>

        {/* Active Releases */}
        <div
          onClick={() => onNavigateTab("workspaces")}
          className="p-4 rounded-xl border border-border/60 bg-card/60 hover:border-emerald-500/50 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Releases</span>
            <Disc3 className="w-4 h-4 text-emerald-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.activeReleases}</div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {stats.activeCampaigns} campaigns
          </div>
        </div>

        {/* Studio Deliverables */}
        <div
          onClick={() => onNavigateTab("workspaces")}
          className="p-4 rounded-xl border border-border/60 bg-card/60 hover:border-amber-500/50 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Studio Assets</span>
            <Layers className="w-4 h-4 text-amber-400 group-hover:text-amber-500 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.totalDeliverables}</div>
          <div className="text-[11px] text-amber-400 font-medium mt-1">
            {stats.pendingApprovals} pending review
          </div>
        </div>

        {/* Support Tickets */}
        <div
          onClick={() => onNavigateTab("support")}
          className="p-4 rounded-xl border border-border/60 bg-card/60 hover:border-rose-500/50 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Support Queue</span>
            <LifeBuoy className="w-4 h-4 text-rose-400 group-hover:text-rose-500 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.openSupportTickets}</div>
          <div className="text-[11px] text-rose-400 font-medium mt-1">
            {stats.criticalTicketsCount} critical
          </div>
        </div>

        {/* System Health */}
        <div
          onClick={() => onNavigateTab("system-health")}
          className="p-4 rounded-xl border border-border/60 bg-card/60 hover:border-emerald-500/50 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Platform Health</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className="text-lg font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Operational
          </div>
          <div className="text-[11px] text-muted-foreground mt-1.5">
            {stats.systemHealth?.dbRecordsCount || 0} db records
          </div>
        </div>
      </div>

      {/* Main Breakdown Section: Workspace Distribution & Operational Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workspace Identity Distribution */}
        <div className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Tenant Identities Breakdown
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              {stats.totalWorkspaces} Total
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(stats.workspacesByIdentity || {}).map(([type, count]) => {
              const numericCount = typeof count === "number" ? count : Number(count) || 0;
              const total = stats.totalWorkspaces || 1;
              const percent = Math.round((numericCount / total) * 100);
              const getIdentityColor = (t: string) => {
                switch (t) {
                  case "artist":
                    return "bg-red-500 text-red-400";
                  case "brand":
                  default:
                    return "bg-blue-500 text-blue-400";
                }
              };

              return (
                <div key={type} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize font-medium text-foreground">{type} OS</span>
                    <span className="text-muted-foreground font-mono">
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-accent overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getIdentityColor(type).split(" ")[0]}`}
                      style={{ width: `${Math.max(percent, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Operational Health & Gemini Engine */}
        <div className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              Operational Health & AI Engine
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 font-bold">
              HEALTHY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-border/40 bg-accent/20">
              <div className="text-muted-foreground text-[11px] mb-1 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-purple-400" /> Uptime
              </div>
              <div className="font-mono font-bold text-foreground">
                {Math.floor((stats.systemHealth?.uptimeSeconds || 0) / 60)} mins
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border/40 bg-accent/20">
              <div className="text-muted-foreground text-[11px] mb-1 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" /> DB Payload
              </div>
              <div className="font-mono font-bold text-foreground">
                {stats.systemHealth?.databaseSizeKb || 0} KB
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border/40 bg-accent/20">
              <div className="text-muted-foreground text-[11px] mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Creative AI
              </div>
              <div className="font-bold text-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Gemini 2.5 Flash
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border/40 bg-accent/20">
              <div className="text-muted-foreground text-[11px] mb-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Latency
              </div>
              <div className="font-mono font-bold text-emerald-400">
                {stats.systemHealth?.aiLatencyMs || 38} ms
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("system-health")}
            className="w-full py-2 rounded-lg border border-border/60 bg-accent/30 hover:bg-accent text-xs font-semibold text-foreground transition-colors flex items-center justify-center gap-1.5"
          >
            Inspect Detailed System Telemetry <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Admin Actions & Feature Controls */}
        <div className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Quick Admin Operations
          </h3>

          <div className="space-y-2">
            <button
              onClick={() => onNavigateTab("users")}
              className="w-full p-2.5 rounded-xl border border-border/40 bg-accent/10 hover:bg-accent/30 text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-semibold text-foreground group-hover:text-purple-400 transition-colors">
                  User & Identity Roster
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Inspect users, role assignments, and workspace links
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-purple-400" />
            </button>

            <button
              onClick={() => onNavigateTab("feature-flags")}
              className="w-full p-2.5 rounded-xl border border-border/40 bg-accent/10 hover:bg-accent/30 text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-semibold text-foreground group-hover:text-blue-400 transition-colors">
                  Feature Flags & Rollouts
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Safely gate AI tools, approval workflows, and new features
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-400" />
            </button>

            <button
              onClick={() => onNavigateTab("activity")}
              className="w-full p-2.5 rounded-xl border border-border/40 bg-accent/10 hover:bg-accent/30 text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-semibold text-foreground group-hover:text-emerald-400 transition-colors">
                  Security & Audit Stream
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {stats.totalAuditEventsCount} auditable actions logged
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
