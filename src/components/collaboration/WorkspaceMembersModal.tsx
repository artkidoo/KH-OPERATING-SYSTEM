import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle2,
  Lock,
  Globe,
  Trash2,
  Edit2,
  AlertCircle,
  FolderLock,
  Mail,
  Building,
  Briefcase,
  Key,
} from "lucide-react";
import {
  WorkspaceMember,
  MemberRole,
  MemberPermissions,
  MemberAccessScope,
  Project,
  Release,
  Campaign,
} from "../../types";
import { api } from "../../services/api";

interface WorkspaceMembersModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    id: string;
    email: string;
    role?: MemberRole;
  };
}

const DEFAULT_PERMISSIONS: Record<MemberRole, MemberPermissions> = {
  owner: {
    canManageWorkspace: true,
    canManageMembers: true,
    canEditEntities: true,
    canApprove: true,
    canRequestChanges: true,
    canComment: true,
    canViewInternalNotes: true,
    canAccessStudio: true,
    canAccessBilling: true,
  },
  admin: {
    canManageWorkspace: true,
    canManageMembers: true,
    canEditEntities: true,
    canApprove: true,
    canRequestChanges: true,
    canComment: true,
    canViewInternalNotes: true,
    canAccessStudio: true,
    canAccessBilling: true,
  },
  editor: {
    canManageWorkspace: false,
    canManageMembers: false,
    canEditEntities: true,
    canApprove: false,
    canRequestChanges: true,
    canComment: true,
    canViewInternalNotes: true,
    canAccessStudio: true,
    canAccessBilling: false,
  },
  member: {
    canManageWorkspace: false,
    canManageMembers: false,
    canEditEntities: true,
    canApprove: false,
    canRequestChanges: true,
    canComment: true,
    canViewInternalNotes: true,
    canAccessStudio: true,
    canAccessBilling: false,
  },
  collaborator: {
    canManageWorkspace: false,
    canManageMembers: false,
    canEditEntities: false,
    canApprove: false,
    canRequestChanges: true,
    canComment: true,
    canViewInternalNotes: false,
    canAccessStudio: true,
    canAccessBilling: false,
  },
  client: {
    canManageWorkspace: false,
    canManageMembers: false,
    canEditEntities: false,
    canApprove: true,
    canRequestChanges: true,
    canComment: true,
    canViewInternalNotes: false,
    canAccessStudio: false,
    canAccessBilling: false,
  },
  viewer: {
    canManageWorkspace: false,
    canManageMembers: false,
    canEditEntities: false,
    canApprove: false,
    canRequestChanges: false,
    canComment: true,
    canViewInternalNotes: false,
    canAccessStudio: false,
    canAccessBilling: false,
  },
};

export const WorkspaceMembersModal: React.FC<WorkspaceMembersModalProps> = ({
  workspaceId,
  isOpen,
  onClose,
  currentUser,
}) => {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("client");
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviteDepartment, setInviteDepartment] = useState("");
  const [accessScopeType, setAccessScopeType] = useState<"all" | "restricted">("all");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [selectedReleaseIds, setSelectedReleaseIds] = useState<string[]>([]);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [customPermissions, setCustomPermissions] = useState<MemberPermissions>(
    DEFAULT_PERMISSIONS["client"]
  );

  const loadData = async () => {
    if (!workspaceId) return;
    try {
      setIsLoading(true);
      setError(null);
      const [membersRes, projRes, relRes, campRes] = await Promise.all([
        api.members.list(workspaceId),
        api.projects.list(workspaceId).catch(() => ({ projects: [] })),
        api.releases.list(workspaceId).catch(() => ({ releases: [] })),
        api.campaigns.list(workspaceId).catch(() => ({ campaigns: [] })),
      ]);

      setMembers(membersRes.members || []);
      setProjects(projRes.projects || []);
      setReleases(relRes.releases || []);
      setCampaigns(campRes.campaigns || []);
    } catch (err: any) {
      console.error("Failed to load workspace members", err);
      setError(err.message || "Failed to load team roster");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, workspaceId]);

  useEffect(() => {
    setCustomPermissions(DEFAULT_PERMISSIONS[inviteRole]);
    if (inviteRole === "client" || inviteRole === "collaborator") {
      setAccessScopeType("restricted");
    } else {
      setAccessScopeType("all");
    }
  }, [inviteRole]);

  if (!isOpen) return null;

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const accessScope: MemberAccessScope = {
        allEntities: accessScopeType === "all",
        projectIds: accessScopeType === "restricted" ? selectedProjectIds : undefined,
        releaseIds: accessScopeType === "restricted" ? selectedReleaseIds : undefined,
        campaignIds: accessScopeType === "restricted" ? selectedCampaignIds : undefined,
      };

      const res = await api.members.invite(workspaceId, {
        email: inviteEmail.trim(),
        name: inviteName.trim() || inviteEmail.split("@")[0],
        role: inviteRole,
        title: inviteTitle.trim() || undefined,
        department: inviteDepartment.trim() || undefined,
        permissions: customPermissions,
        accessScope,
      });

      setMembers([...members, res.member]);
      setShowInviteForm(false);
      setInviteEmail("");
      setInviteName("");
      setInviteTitle("");
      setInviteDepartment("");
      setSelectedProjectIds([]);
      setSelectedReleaseIds([]);
      setSelectedCampaignIds([]);
    } catch (err: any) {
      console.error("Failed to invite member", err);
      setError(err.message || "Failed to send member invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!window.confirm(`Revoke access for ${memberName}?`)) return;
    try {
      await api.members.remove(workspaceId, memberId);
      setMembers(members.filter((m) => m.id !== memberId));
    } catch (err: any) {
      console.error("Failed to remove member", err);
      setError(err.message || "Could not revoke access");
    }
  };

  const handleToggleProject = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleToggleRelease = (id: string) => {
    setSelectedReleaseIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleToggleCampaign = (id: string) => {
    setSelectedCampaignIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-100">Team & Client Access Control</h2>
                <span className="px-2 py-0.5 text-xs font-mono rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {members.length} Member{members.length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Manage roles, granular permissions, and client entity-level access scopes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{showInviteForm ? "View Members" : "Invite Collaborator / Client"}</span>
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

        {showInviteForm ? (
          /* Invite Member / Client Form */
          <form onSubmit={handleInviteMember} className="space-y-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-red-400" /> Invite New Team Member or External Client
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Email Address *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="collaborator@agency.com"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Workspace Role</label>
                <select
                  value={inviteRole}
                  onChange={(e: any) => setInviteRole(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100"
                >
                  <option value="client">Client (Approvals & Reviews Only)</option>
                  <option value="collaborator">External Collaborator</option>
                  <option value="member">Core Team Member</option>
                  <option value="editor">Creative Editor</option>
                  <option value="admin">Workspace Admin</option>
                  <option value="viewer">Viewer (Read Only)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Job Title / Specialty</label>
                <input
                  type="text"
                  value={inviteTitle}
                  onChange={(e) => setInviteTitle(e.target.value)}
                  placeholder="e.g. Brand Director, Mixing Engineer"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Department / Org</label>
                <input
                  type="text"
                  value={inviteDepartment}
                  onChange={(e) => setInviteDepartment(e.target.value)}
                  placeholder="e.g. Universal Music, External Client"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100"
                />
              </div>
            </div>

            {/* Scope Restriction */}
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <FolderLock className="w-3.5 h-3.5 text-amber-400" /> Entity Access Scope
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAccessScopeType("all")}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                      accessScopeType === "all"
                        ? "bg-zinc-800 text-zinc-100 font-bold border border-zinc-700"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    All Entities
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccessScopeType("restricted")}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                      accessScopeType === "restricted"
                        ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Specific Entities Only
                  </button>
                </div>
              </div>

              {accessScopeType === "restricted" && (
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  {/* Select Projects */}
                  {projects.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                        Allowed Projects:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {projects.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleToggleProject(p.id)}
                            className={`px-2 py-1 rounded text-xs border transition-colors ${
                              selectedProjectIds.includes(p.id)
                                ? "bg-red-500/20 border-red-500 text-red-300 font-medium"
                                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                            }`}
                          >
                            📁 {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Select Releases */}
                  {releases.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                        Allowed Releases:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {releases.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => handleToggleRelease(r.id)}
                            className={`px-2 py-1 rounded text-xs border transition-colors ${
                              selectedReleaseIds.includes(r.id)
                                ? "bg-red-500/20 border-red-500 text-red-300 font-medium"
                                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                            }`}
                          >
                            🎵 {r.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Select Campaigns */}
                  {campaigns.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                        Allowed Campaigns:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {campaigns.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleToggleCampaign(c.id)}
                            className={`px-2 py-1 rounded text-xs border transition-colors ${
                              selectedCampaignIds.includes(c.id)
                                ? "bg-red-500/20 border-red-500 text-red-300 font-medium"
                                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                            }`}
                          >
                            📢 {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Permission Flags Checklist */}
            <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800 space-y-2">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-red-400" /> Fine-Grained Permissions
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <label className="flex items-center gap-2 text-zinc-300">
                  <input
                    type="checkbox"
                    checked={customPermissions.canApprove}
                    onChange={(e) =>
                      setCustomPermissions({ ...customPermissions, canApprove: e.target.checked })
                    }
                    className="rounded bg-zinc-950 border-zinc-800 text-red-600 focus:ring-0"
                  />
                  <span>Can Sign-Off / Approve</span>
                </label>

                <label className="flex items-center gap-2 text-zinc-300">
                  <input
                    type="checkbox"
                    checked={customPermissions.canRequestChanges}
                    onChange={(e) =>
                      setCustomPermissions({
                        ...customPermissions,
                        canRequestChanges: e.target.checked,
                      })
                    }
                    className="rounded bg-zinc-950 border-zinc-800 text-red-600 focus:ring-0"
                  />
                  <span>Can Request Changes</span>
                </label>

                <label className="flex items-center gap-2 text-zinc-300">
                  <input
                    type="checkbox"
                    checked={customPermissions.canComment}
                    onChange={(e) =>
                      setCustomPermissions({ ...customPermissions, canComment: e.target.checked })
                    }
                    className="rounded bg-zinc-950 border-zinc-800 text-red-600 focus:ring-0"
                  />
                  <span>Can Comment</span>
                </label>

                <label className="flex items-center gap-2 text-zinc-300">
                  <input
                    type="checkbox"
                    checked={customPermissions.canViewInternalNotes}
                    onChange={(e) =>
                      setCustomPermissions({
                        ...customPermissions,
                        canViewInternalNotes: e.target.checked,
                      })
                    }
                    className="rounded bg-zinc-950 border-zinc-800 text-red-600 focus:ring-0"
                  />
                  <span>View Internal Notes</span>
                </label>

                <label className="flex items-center gap-2 text-zinc-300">
                  <input
                    type="checkbox"
                    checked={customPermissions.canEditEntities}
                    onChange={(e) =>
                      setCustomPermissions({
                        ...customPermissions,
                        canEditEntities: e.target.checked,
                      })
                    }
                    className="rounded bg-zinc-950 border-zinc-800 text-red-600 focus:ring-0"
                  />
                  <span>Edit Projects/Assets</span>
                </label>

                <label className="flex items-center gap-2 text-zinc-300">
                  <input
                    type="checkbox"
                    checked={customPermissions.canAccessStudio}
                    onChange={(e) =>
                      setCustomPermissions({
                        ...customPermissions,
                        canAccessStudio: e.target.checked,
                      })
                    }
                    className="rounded bg-zinc-950 border-zinc-800 text-red-600 focus:ring-0"
                  />
                  <span>Access Studio Hub</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !inviteEmail.trim()}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
              >
                {isSubmitting ? "Inviting..." : "Send Workspace Invitation"}
              </button>
            </div>
          </form>
        ) : (
          /* Members Directory Roster */
          <div className="space-y-3">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-zinc-500">Loading members...</div>
            ) : members.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No collaborators found. Click "Invite Collaborator / Client" to grant access.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/80 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/60">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-zinc-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-200">
                        {m.avatarUrl ? (
                          <img src={m.avatarUrl} alt={m.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          m.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-zinc-100">{m.name}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              m.role === "owner" || m.role === "admin"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : m.role === "client"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : m.role === "collaborator"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {m.role}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500">
                            {m.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                          <span>{m.email}</span>
                          {m.title && <span>• {m.title}</span>}
                          {m.department && <span>• {m.department}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Scope summary pill */}
                      {m.accessScope?.allEntities ? (
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-emerald-400" /> Full Access
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 flex items-center gap-1">
                          <FolderLock className="w-3 h-3 text-amber-400" /> Scoped Access
                        </span>
                      )}

                      {/* Delete button (cannot delete owner) */}
                      {m.role !== "owner" && (
                        <button
                          onClick={() => handleRemoveMember(m.id, m.name)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors"
                          title="Revoke Member Access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
