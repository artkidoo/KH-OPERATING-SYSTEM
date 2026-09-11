import React, { useState, useEffect } from "react";
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  Eye,
  X,
  FileCode,
  Globe,
} from "lucide-react";
import { api } from "../../services/api";
import { ActivityLog, AdminAuditLogItem, SystemAdminRole } from "../../types";

interface PlatformActivityTabProps {
  currentUserRole: SystemAdminRole;
}

export const PlatformActivityTab: React.FC<PlatformActivityTabProps> = ({
  currentUserRole,
}) => {
  const [viewMode, setViewMode] = useState<"admin_audit" | "all_events">("admin_audit");
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogItem[]>([]);
  const [platformLogs, setPlatformLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");
  const [actionSearch, setActionSearch] = useState("");

  // Inspect Log Detail Modal
  const [selectedLog, setSelectedLog] = useState<AdminAuditLogItem | null>(null);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      if (viewMode === "admin_audit") {
        const res = await api.admin.getAuditLogs({
          targetType: targetTypeFilter,
          action: actionSearch,
        });
        if (res.logs) {
          setAuditLogs(res.logs);
        }
      } else {
        const res = await api.admin.getActivity();
        if (res.activityLogs) {
          setPlatformLogs(res.activityLogs);
        }
        if (res.auditLogs) {
          setAuditLogs(res.auditLogs);
        }
      }
    } catch (err) {
      console.error("Failed to fetch activity", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [viewMode, targetTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchActivity();
  };

  const getAuditBadge = (action: string) => {
    if (action.includes("SUSPEND") || action.includes("DENIED") || action.includes("FAIL")) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
          {action}
        </span>
      );
    }
    if (action.includes("ROLE") || action.includes("FLAG") || action.includes("SETTING")) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            Platform Activity & Security Audit Trail
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable log stream recording administrative operations, role promotions, and critical platform actions
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-card border border-border/60 flex items-center">
            <button
              onClick={() => setViewMode("admin_audit")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "admin_audit"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Admin Audit Log
            </button>
            <button
              onClick={() => setViewMode("all_events")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "all_events"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Tenant Events
            </button>
          </div>

          <button
            onClick={fetchActivity}
            disabled={loading}
            className="p-2 rounded-xl border border-border/60 bg-card hover:bg-accent text-foreground disabled:opacity-50"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar (for Admin Audit) */}
      {viewMode === "admin_audit" && (
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search action, target name..."
              value={actionSearch}
              onChange={(e) => setActionSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border/60 bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border/60 bg-card text-xs text-foreground focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Target Types</option>
            <option value="user">User</option>
            <option value="workspace">Workspace</option>
            <option value="feature_flag">Feature Flag</option>
            <option value="support">Support</option>
            <option value="system">System / Settings</option>
            <option value="security">Security</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            Filter Logs
          </button>
        </form>
      )}

      {/* Log Feed List */}
      <div className="rounded-2xl border border-border/60 bg-card/60 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-500" />
            <div className="text-xs">Streaming audit telemetry...</div>
          </div>
        ) : viewMode === "admin_audit" ? (
          auditLogs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs">
              No admin audit logs recorded matching this filter.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 hover:bg-accent/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mt-0.5 flex-shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getAuditBadge(log.action)}
                        <span className="font-semibold text-foreground">
                          {log.targetName || log.targetId}
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          by <strong>{log.adminName}</strong> ({log.adminRole})
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px] mt-1 font-mono">
                        {typeof log.details === "object"
                          ? JSON.stringify(log.details)
                          : log.details}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto text-[11px] text-muted-foreground font-mono flex-shrink-0">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-muted-foreground" /> {log.ipAddress}
                    </span>
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1 rounded-md border border-border/60 hover:bg-accent text-muted-foreground hover:text-foreground"
                      title="Inspect full audit payload"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Tenant Activity Stream */
          platformLogs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs">
              No tenant activity recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {platformLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 hover:bg-accent/20 transition-colors flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span>{log.action}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
                          {log.entityType}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        {log.userEmail}: {log.details}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* INSPECT LOG DETAIL MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border/80 rounded-2xl p-6 space-y-4 shadow-2xl animate-scaleUp text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-400" />
                Audit Record Details
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg border border-border/60 hover:bg-accent text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 font-mono">
              <div className="p-2.5 rounded-lg bg-accent/20 border border-border/40">
                <span className="text-muted-foreground text-[11px] block">Event ID</span>
                <span className="text-foreground font-bold">{selectedLog.id}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-accent/20 border border-border/40">
                <span className="text-muted-foreground text-[11px] block">Action & Target</span>
                <span className="text-purple-400 font-bold">{selectedLog.action}</span> •{" "}
                <span className="text-foreground">{selectedLog.targetName} ({selectedLog.targetId})</span>
              </div>
              <div className="p-2.5 rounded-lg bg-accent/20 border border-border/40">
                <span className="text-muted-foreground text-[11px] block">Operator</span>
                <span className="text-foreground">
                  {selectedLog.adminName} ({selectedLog.adminEmail}) • Role: {selectedLog.adminRole}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-accent/20 border border-border/40">
                <span className="text-muted-foreground text-[11px] block">Structured Payload</span>
                <pre className="text-[11px] text-muted-foreground mt-1 overflow-x-auto p-2 rounded bg-black/40">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-xl border border-border/60 bg-card hover:bg-accent text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
