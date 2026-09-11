import React, { useState, useEffect } from "react";
import {
  HardDrive,
  Search,
  Filter,
  Building2,
  Disc3,
  Layers,
  Sparkles,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  Stethoscope,
  X,
  Archive,
  Ban,
  Check,
  Briefcase,
  BrainCircuit,
  Radio,
} from "lucide-react";
import { api } from "../../services/api";
import { IdentityType, SystemAdminRole } from "../../types";

interface WorkspaceManagementTabProps {
  currentUserRole: SystemAdminRole;
  onRefreshStats: () => void;
}

export const WorkspaceManagementTab: React.FC<WorkspaceManagementTabProps> = ({
  currentUserRole,
  onRefreshStats,
}) => {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [identityFilter, setIdentityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Inspector Modal State
  const [selectedWs, setSelectedWs] = useState<any | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Diagnostic Modal State
  const [diagnosticReport, setDiagnosticReport] = useState<any | null>(null);
  const [diagnosticModalOpen, setDiagnosticModalOpen] = useState(false);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);

  // Status Change Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetWs, setTargetWs] = useState<any | null>(null);
  const [nextStatus, setNextStatus] = useState<"active" | "archived" | "suspended">("active");
  const [statusReason, setStatusReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getWorkspaces({
        search: searchQuery,
        identityType: identityFilter,
        status: statusFilter,
      });
      if (res.workspaces) {
        setWorkspaces(res.workspaces);
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to load workspaces" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [identityFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWorkspaces();
  };

  const handleInspectWorkspace = async (ws: any) => {
    setInspectLoading(true);
    setInspectModalOpen(true);
    try {
      const res = await api.admin.getWorkspace(ws.id);
      if (res.workspace) {
        setSelectedWs(res.workspace);
      } else {
        setSelectedWs({ workspace: ws, counts: {} });
      }
    } catch (err: any) {
      setSelectedWs({ workspace: ws, counts: {} });
    } finally {
      setInspectLoading(false);
    }
  };

  const handleRunDiagnostic = async (wsId: string) => {
    setDiagnosticLoading(true);
    setDiagnosticModalOpen(true);
    try {
      const res = await api.admin.runWorkspaceDiagnostic(wsId);
      if (res.report) {
        setDiagnosticReport(res.report);
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to run workspace diagnostic" });
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const handleOpenStatusModal = (ws: any, status: "active" | "archived" | "suspended") => {
    setTargetWs(ws);
    setNextStatus(status);
    setStatusReason("");
    setStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!targetWs) return;
    setActionLoading(true);
    try {
      const res = await api.admin.updateWorkspaceStatus(targetWs.id, nextStatus, statusReason);
      if (res.success) {
        setNotification({
          type: "success",
          message: `Workspace "${targetWs.name}" status updated to ${nextStatus}`,
        });
        setStatusModalOpen(false);
        fetchWorkspaces();
        onRefreshStats();
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to update workspace status" });
    } finally {
      setActionLoading(false);
    }
  };

  const getIdentityBadge = (type?: IdentityType) => {
    switch (type) {
      case "artist":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">ARTIST OS</span>;
      case "brand":
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">BRAND OS</span>;
    }
  };

  const canModifyWorkspaces = currentUserRole === "super_admin" || currentUserRole === "admin";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:opacity-70">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-500" />
            Workspace & Tenant Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor tenant health, inspect asset storage integrity, review active releases, and perform operational interventions
          </p>
        </div>

        {/* Search & Filter Controls */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search workspace name, slug, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border/60 bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={identityFilter}
            onChange={(e) => setIdentityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border/60 bg-card text-xs text-foreground focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Identities</option>
            <option value="artist">Artist OS</option>
            <option value="brand">Brand OS</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border/60 bg-card text-xs text-foreground focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="suspended">Suspended</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Filter
          </button>
        </form>
      </div>

      {/* Workspaces Table */}
      <div className="rounded-2xl border border-border/60 bg-card/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground font-semibold">
                <th className="py-3 px-4">Workspace</th>
                <th className="py-3 px-4">Identity</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Assets & Releases</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-foreground">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    Loading workspace tenants...
                  </td>
                </tr>
              ) : workspaces.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No workspaces matching filter found.
                  </td>
                </tr>
              ) : (
                workspaces.map((ws) => (
                  <tr key={ws.id} className="hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs flex-shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{ws.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            /{ws.slug} • {ws.memberCount} member(s)
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">{getIdentityBadge(ws.identityType)}</td>

                    <td className="py-3 px-4">
                      <div className="text-foreground font-medium">{ws.ownerName}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{ws.ownerEmail}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-[11px] font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-accent/40 text-foreground">
                          {ws.releaseCount} rel
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-accent/40 text-foreground">
                          {ws.deliverableCount} studio
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-accent/40 text-foreground">
                          {ws.assetCount} assets
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {ws.status === "suspended" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          SUSPENDED
                        </span>
                      ) : ws.status === "archived" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          ARCHIVED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          ACTIVE
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Run Health Diagnostic */}
                        <button
                          onClick={() => handleRunDiagnostic(ws.id)}
                          title="Run Health Diagnostic Check"
                          className="px-2.5 py-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-medium flex items-center gap-1 transition-colors"
                        >
                          <Stethoscope className="w-3 h-3" /> Diagnostic
                        </button>

                        {/* Inspect Workspace */}
                        <button
                          onClick={() => handleInspectWorkspace(ws)}
                          title="Inspect Workspace"
                          className="px-2.5 py-1 rounded-md border border-border/60 hover:bg-accent text-[11px] font-medium flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3 text-muted-foreground" /> Inspect
                        </button>

                        {/* Status Controls */}
                        {canModifyWorkspaces && (
                          <>
                            {ws.status === "active" ? (
                              <button
                                onClick={() => handleOpenStatusModal(ws, "suspended")}
                                title="Suspend Workspace"
                                className="px-2 py-1 rounded-md border border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-[11px] font-medium transition-colors"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenStatusModal(ws, "active")}
                                title="Reactivate Workspace"
                                className="px-2 py-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-medium transition-colors"
                              >
                                Activate
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT WORKSPACE MODAL */}
      {inspectModalOpen && selectedWs && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card border border-border/80 rounded-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    {selectedWs.workspace?.name || "Workspace Details"}
                    {getIdentityBadge(selectedWs.workspace?.identityType)}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    ID: {selectedWs.workspace?.id} • Slug: /{selectedWs.workspace?.slug}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="p-1.5 rounded-lg border border-border/60 hover:bg-accent text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Entity Counts Grid */}
            {selectedWs.counts && (
              <div className="grid grid-cols-4 gap-2.5 text-xs text-center">
                <div className="p-2.5 rounded-xl border border-border/40 bg-accent/20">
                  <span className="text-muted-foreground block text-[10px]">Members</span>
                  <span className="font-mono text-base font-bold text-foreground">
                    {selectedWs.counts.members || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-border/40 bg-accent/20">
                  <span className="text-muted-foreground block text-[10px]">Releases</span>
                  <span className="font-mono text-base font-bold text-foreground">
                    {selectedWs.counts.releases || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-border/40 bg-accent/20">
                  <span className="text-muted-foreground block text-[10px]">Deliverables</span>
                  <span className="font-mono text-base font-bold text-foreground">
                    {selectedWs.counts.deliverables || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-border/40 bg-accent/20">
                  <span className="text-muted-foreground block text-[10px]">Approvals</span>
                  <span className="font-mono text-base font-bold text-amber-400">
                    {selectedWs.counts.approvalRequests || 0}
                  </span>
                </div>
              </div>
            )}

            {/* Owner & Team Roster */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Team Roster & Members
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {(selectedWs.members || []).map((m: any) => (
                  <div
                    key={m.userId || m.id}
                    className="p-2.5 rounded-lg border border-border/40 bg-card flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-foreground font-mono">{m.userId}</span>
                      <span className="text-muted-foreground ml-2 text-[11px]">Role: {m.role}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-accent text-foreground font-bold">
                      {m.role?.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => {
                  setInspectModalOpen(false);
                  handleRunDiagnostic(selectedWs.workspace.id);
                }}
                className="px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-semibold flex items-center gap-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5" /> Run Diagnostic Suite
              </button>

              <button
                onClick={() => setInspectModalOpen(false)}
                className="px-4 py-1.5 rounded-xl border border-border/60 bg-card hover:bg-accent text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIAGNOSTIC REPORT MODAL */}
      {diagnosticModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card border border-border/80 rounded-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    Tenant Health Diagnostic
                    {diagnosticReport && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          diagnosticReport.overallHealth === "healthy"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : diagnosticReport.overallHealth === "warning"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {(diagnosticReport.overallHealth || "HEALTHY").toUpperCase()}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {diagnosticReport?.workspaceName} • Generated at{" "}
                    {diagnosticReport?.generatedAt ? new Date(diagnosticReport.generatedAt).toLocaleTimeString() : "..."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDiagnosticModalOpen(false)}
                className="p-1.5 rounded-lg border border-border/60 hover:bg-accent text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {diagnosticLoading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                <div className="text-xs text-muted-foreground font-mono">
                  Inspecting owner integrity, storage pointers, and approval pipelines...
                </div>
              </div>
            ) : diagnosticReport ? (
              <div className="space-y-5">
                {/* Checks List */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Integrity Checks ({diagnosticReport.checks?.length || 0})
                  </h4>
                  {diagnosticReport.checks?.map((check: any) => (
                    <div
                      key={check.id}
                      className="p-3 rounded-xl border border-border/40 bg-accent/10 flex items-start gap-3 text-xs"
                    >
                      {check.status === "pass" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      ) : check.status === "warning" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-foreground flex items-center justify-between">
                          <span>{check.title}</span>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
                            {check.status}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-[11px] mt-0.5">{check.details}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                {diagnosticReport.recommendations?.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 space-y-1.5">
                    <h5 className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Diagnostic Recommendations
                    </h5>
                    <ul className="text-xs text-muted-foreground space-y-1 pl-4 list-disc">
                      {diagnosticReport.recommendations.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setDiagnosticModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border/60 bg-card hover:bg-accent text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE STATUS MODAL */}
      {statusModalOpen && targetWs && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-6 space-y-4 shadow-2xl animate-scaleUp">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Update Workspace Status
            </h3>

            <p className="text-xs text-muted-foreground">
              Changing status of <strong>{targetWs.name}</strong> to{" "}
              <span className="uppercase font-bold text-foreground">{nextStatus}</span>.
            </p>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Reason / Administrative Notes
              </label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl border border-border/60 bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
                placeholder="e.g., Scheduled workspace archive upon project completion..."
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setStatusModalOpen(false)}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-xl border border-border/60 hover:bg-accent text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={actionLoading}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Confirm Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
