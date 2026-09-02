import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserX,
  UserCheck,
  Building2,
  Calendar,
  Clock,
  Eye,
  AlertTriangle,
  RefreshCw,
  X,
  Check,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { api } from "../../services/api";
import { AdminUserSummary, SystemAdminRole } from "../../types";

interface UserManagementTabProps {
  currentUserRole: SystemAdminRole;
  onRefreshStats: () => void;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  currentUserRole,
  onRefreshStats,
}) => {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Inspector Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUserSummary | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Suspend/Reactivate Modal State
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<AdminUserSummary | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Role Change Modal State (Super Admin Only)
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<SystemAdminRole>("user");

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getUsers({
        search: searchQuery,
        systemRole: roleFilter,
        status: statusFilter,
      });
      if (res.users) {
        setUsers(res.users);
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to load users" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleInspectUser = async (userSummary: AdminUserSummary) => {
    setInspectLoading(true);
    setInspectModalOpen(true);
    try {
      const res = await api.admin.getUser(userSummary.id);
      if (res.user) {
        setSelectedUser(res.user);
      } else {
        setSelectedUser(userSummary);
      }
    } catch (err: any) {
      setSelectedUser(userSummary);
    } finally {
      setInspectLoading(false);
    }
  };

  const handleOpenSuspendModal = (user: AdminUserSummary) => {
    setTargetUser(user);
    setSuspendReason(
      user.status === "suspended" ? "" : "Administrative suspension for terms violation"
    );
    setSuspendModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!targetUser) return;
    setActionLoading(true);
    const nextStatus = targetUser.status === "suspended" ? "active" : "suspended";
    try {
      const res = await api.admin.updateUserStatus(targetUser.id, nextStatus, suspendReason);
      if (res.success) {
        setNotification({
          type: "success",
          message: `User ${targetUser.fullName} is now ${nextStatus}`,
        });
        setSuspendModalOpen(false);
        fetchUsers();
        onRefreshStats();
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Action failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRoleModal = (user: AdminUserSummary) => {
    setTargetUser(user);
    setNewRole(user.systemRole || "user");
    setRoleModalOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!targetUser) return;
    setActionLoading(true);
    try {
      const res = await api.admin.updateUserRole(targetUser.id, newRole);
      if (res.success) {
        setNotification({
          type: "success",
          message: `Role for ${targetUser.fullName} updated to ${newRole}`,
        });
        setRoleModalOpen(false);
        fetchUsers();
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to update role" });
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role?: SystemAdminRole) => {
    switch (role) {
      case "super_admin":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> SUPER ADMIN
          </span>
        );
      case "admin":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <Shield className="w-3 h-3" /> ADMIN
          </span>
        );
      case "support":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> SUPPORT
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-muted-foreground bg-accent/40 border border-border/40">
            STANDARD USER
          </span>
        );
    }
  };

  const isSuperAdmin = currentUserRole === "super_admin";
  const canModifyUsers = currentUserRole === "super_admin" || currentUserRole === "admin";

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
            <Users className="w-5 h-5 text-purple-500" />
            User Directory & Authorization Control
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Search, inspect workspace memberships, enforce access controls, and assign least-privilege roles
          </p>
        </div>

        {/* Search & Filter Controls */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border/60 bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border/60 bg-card text-xs text-foreground focus:outline-none focus:border-purple-500"
          >
            <option value="all">All System Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="support">Support</option>
            <option value="user">Standard User</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border/60 bg-card text-xs text-foreground focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Filter
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-border/60 bg-card/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground font-semibold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Workspaces</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-foreground">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-500 mb-2" />
                    Loading user directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No users matching the query found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase flex-shrink-0">
                          {u.fullName?.charAt(0) || u.email.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            {u.fullName}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">{getRoleBadge(u.systemRole)}</td>

                    <td className="py-3 px-4">
                      {u.status === "suspended" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
                          <UserX className="w-3 h-3" /> SUSPENDED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <UserCheck className="w-3 h-3" /> ACTIVE
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent/40 text-[11px] font-mono">
                        <Building2 className="w-3 h-3 text-muted-foreground" />
                        {u.workspaceCount} {u.workspaceCount === 1 ? "workspace" : "workspaces"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground text-[11px] font-mono">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Inspect User Profile */}
                        <button
                          onClick={() => handleInspectUser(u)}
                          title="Inspect User Details"
                          className="px-2.5 py-1 rounded-md border border-border/60 hover:bg-accent text-[11px] font-medium flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3 text-muted-foreground" /> Inspect
                        </button>

                        {/* Suspend / Reactivate */}
                        {canModifyUsers && (
                          <button
                            onClick={() => handleOpenSuspendModal(u)}
                            title={u.status === "suspended" ? "Reactivate User" : "Suspend User"}
                            className={`px-2 py-1 rounded-md border text-[11px] font-medium transition-colors ${
                              u.status === "suspended"
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                : "border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                            }`}
                          >
                            {u.status === "suspended" ? "Reactivate" : "Suspend"}
                          </button>
                        )}

                        {/* Promote / Demote Role (Super Admin Only) */}
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleOpenRoleModal(u)}
                            title="Modify System Role"
                            className="px-2 py-1 rounded-md border border-purple-500/40 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-[11px] font-medium transition-colors"
                          >
                            Role
                          </button>
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

      {/* INSPECT USER MODAL */}
      {inspectModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card border border-border/80 rounded-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {selectedUser.fullName?.charAt(0) || selectedUser.email.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    {selectedUser.fullName}
                    {getRoleBadge(selectedUser.systemRole)}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="p-1.5 rounded-lg border border-border/60 hover:bg-accent text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Callout if Suspended */}
            {selectedUser.status === "suspended" && (
              <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Account is Suspended
                </div>
                <div>Reason: {selectedUser.suspendedReason || "Administrative hold"}</div>
                {selectedUser.suspendedAt && (
                  <div className="text-[11px] opacity-80">
                    Suspended on: {new Date(selectedUser.suspendedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {/* Account Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-border/40 bg-accent/20">
                <span className="text-muted-foreground block text-[11px] mb-0.5">User ID</span>
                <span className="font-mono text-foreground font-bold">{selectedUser.id}</span>
              </div>
              <div className="p-3 rounded-xl border border-border/40 bg-accent/20">
                <span className="text-muted-foreground block text-[11px] mb-0.5">Account Created</span>
                <span className="font-mono text-foreground">
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Workspace Memberships */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Workspace Memberships ({selectedUser.workspaces?.length || 0})
              </h4>
              <div className="space-y-2">
                {(selectedUser.workspaces || []).map((ws) => (
                  <div
                    key={ws.id}
                    className="p-3 rounded-xl border border-border/40 bg-card/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-foreground">{ws.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        Slug: /{ws.slug} • Type: {ws.identityType}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent text-foreground">
                        {(ws.role || "member").toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          ws.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {(ws.status || "active").toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Audit / User Activity */}
            {selectedUser.recentActivity && selectedUser.recentActivity.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Recent Platform Actions
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {selectedUser.recentActivity.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg border border-border/30 bg-accent/10 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-medium text-foreground">{log.action}</span>
                        <span className="text-muted-foreground ml-2 text-[11px]">
                          {log.details || log.entityType}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border/60 bg-card hover:bg-accent text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUSPEND / REACTIVATE MODAL */}
      {suspendModalOpen && targetUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-6 space-y-4 shadow-2xl animate-scaleUp">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <AlertTriangle
                className={`w-5 h-5 ${
                  targetUser.status === "suspended" ? "text-emerald-500" : "text-rose-500"
                }`}
              />
              {targetUser.status === "suspended" ? "Reactivate User Account" : "Suspend User Account"}
            </h3>

            <p className="text-xs text-muted-foreground">
              {targetUser.status === "suspended"
                ? `Are you sure you want to restore full access for ${targetUser.fullName} (${targetUser.email})?`
                : `Suspending ${targetUser.fullName} (${targetUser.email}) will immediately revoke session tokens and block workspace actions.`}
            </p>

            {targetUser.status !== "suspended" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Reason for Suspension (Recorded in Audit Log)
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-border/60 bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-rose-500"
                  placeholder="e.g., Investigation into policy violation or chargeback request..."
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSuspendModalOpen(false)}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-xl border border-border/60 hover:bg-accent text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={actionLoading}
                className={`px-4 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 ${
                  targetUser.status === "suspended"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {actionLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : targetUser.status === "suspended" ? (
                  "Confirm Reactivation"
                ) : (
                  "Confirm Suspension"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE ROLE MODAL (SUPER ADMIN ONLY) */}
      {roleModalOpen && targetUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-6 space-y-4 shadow-2xl animate-scaleUp">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-500" />
              Modify System Administrative Role
            </h3>

            <p className="text-xs text-muted-foreground">
              Select the administrative authority level for <strong>{targetUser.fullName}</strong>.
              All role promotions are recorded in the security audit log.
            </p>

            <div className="space-y-2">
              {[
                {
                  role: "user" as SystemAdminRole,
                  title: "Standard User",
                  desc: "Standard platform tenant. No access to /admin control center.",
                },
                {
                  role: "support" as SystemAdminRole,
                  title: "Support Tier",
                  desc: "Can inspect users, workspaces, diagnostic health, and resolve support tickets.",
                },
                {
                  role: "admin" as SystemAdminRole,
                  title: "Administrator",
                  desc: "Can suspend/reactivate users and workspaces, and manage feature flags.",
                },
                {
                  role: "super_admin" as SystemAdminRole,
                  title: "Super Admin",
                  desc: "Full root authority: user role management, system settings, and maintenance controls.",
                },
              ].map((item) => (
                <label
                  key={item.role}
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                    newRole === item.role
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-border/40 hover:bg-accent/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="adminRole"
                    value={item.role}
                    checked={newRole === item.role}
                    onChange={() => setNewRole(item.role)}
                    className="mt-0.5 accent-purple-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-foreground">{item.title}</div>
                    <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setRoleModalOpen(false)}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-xl border border-border/60 hover:bg-accent text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRoleChange}
                disabled={actionLoading}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Save Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
