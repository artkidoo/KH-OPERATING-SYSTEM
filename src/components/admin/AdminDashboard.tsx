import React, { useState, useEffect } from "react";
import {
  ShieldAlert, ShieldCheck, Shield, LayoutDashboard, Users, HardDrive, Activity,
  LifeBuoy, Cpu, Sliders, Settings, RefreshCw, Sparkles, Lock, ArrowLeft, FileText,
  Factory, PanelLeftClose, PanelLeftOpen, Search, FolderOpen, Music, AudioLines,
  Database, Eye, Clock, Boxes,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { AdminOverviewStats, SystemAdminRole } from "../../types";
import { AdminOverviewTab } from "./AdminOverviewTab";
import { UserManagementTab } from "./UserManagementTab";
import { WorkspaceManagementTab } from "./WorkspaceManagementTab";
import { PlatformActivityTab } from "./PlatformActivityTab";
import { SupportViewTab } from "./SupportViewTab";
import { SystemHealthTab } from "./SystemHealthTab";
import { FeatureFlagsTab } from "./FeatureFlagsTab";
import { PlatformSettingsTab } from "./PlatformSettingsTab";
import { DocumentTemplateManagementTab } from "./DocumentTemplateManagementTab";
import { ProductionConfigTab } from "./ProductionConfigTab";
import { ProductionCenter } from "../ProductionCenter";
import { hasAdminAccess, hasFullAdminAccess, getEffectiveAdminRole } from "../../utils/adminAccess";
import { OpsConsole, OpsSection } from "./OpsConsole";

// ============================================================
// KEEDOHUB ADMIN / STUDIO OPERATIONS SHELL
// ONE canonical admin environment (§6-§7). Customer workspace stays separate:
// Admin ≠ customer workspace. Deep-linkable canonical sub-paths (§6).
// ============================================================

export type AdminSubTab =
  | OpsSection
  | "users"
  | "ws-mgmt"
  | "overview"
  | "production-jobs"
  | "production-config"
  | "document-templates"
  | "activity"
  | "support"
  | "system-health"
  | "feature-flags"
  | "settings";

const SUB_TAB_PATH: Record<AdminSubTab, string> = {
  operations: "command-center", customers: "customers", workspaces: "workspaces",
  requests: "requests", projects: "projects", queue: "production", review: "review",
  deliveries: "deliveries", library: "library", studio: "studio", audio: "audio",
  attention: "attention", search: "search", users: "account", "ws-mgmt": "workspace-mgmt",
  overview: "pulse", "production-jobs": "production-engine", "production-config": "services",
  "document-templates": "templates", activity: "activity", support: "support",
  "system-health": "system-health", "feature-flags": "feature-flags", settings: "settings",
};
const PATH_TO_SUB_TAB: Record<string, AdminSubTab> = Object.fromEntries(
  Object.entries(SUB_TAB_PATH).map(([k, v]) => [v, k as AdminSubTab])
);
const OPS_SECTIONS: OpsSection[] = ["operations", "customers", "workspaces", "requests", "projects", "queue", "review", "deliveries", "library", "studio", "audio", "attention", "search"];

function subTabFromPath(path: string): AdminSubTab {
  const slug = path.replace(/^\/+/, "").replace(/\/+$/, "").split("/")[1] || "";
  return PATH_TO_SUB_TAB[slug] || "operations";
}

interface AdminDashboardProps { onBackToApp?: () => void; }

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToApp }) => {
  const { user, isLoading } = useAuth();
  const [activeSubTab, setActiveSubTabState] = useState<AdminSubTab>(() => (typeof window !== "undefined" ? subTabFromPath(window.location.pathname) : "operations"));
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // System role derived strictly from the authenticated user's assigned role.
  const effectiveRole: SystemAdminRole = getEffectiveAdminRole(user?.systemRole);
  const canAccessProduction = hasFullAdminAccess(effectiveRole);

  const setActiveSubTab = (tab: AdminSubTab) => {
    setActiveSubTabState(tab);
    if (typeof window !== "undefined") {
      const target = "/admin/" + SUB_TAB_PATH[tab];
      if (window.location.pathname !== target) window.history.pushState({ tab: "admin", sub: tab }, "", target);
    }
  };
  useEffect(() => {
    const handleBack = (e: PopStateEvent) => {
      const sub = (e.state && e.state.sub) || subTabFromPath(window.location.pathname);
      setActiveSubTabState(sub);
    };
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-theme-main text-theme-main flex items-center justify-center p-6">
        <section className="bento-card w-full max-w-lg p-8 text-center">
          <RefreshCw className="mx-auto mb-4 size-8 text-theme-accent animate-spin" aria-hidden="true" />
          <h1 className="text-xl font-bold">Verifying operations authorization…</h1>
          <p className="mt-2 text-sm text-theme-muted">Checking your staff role with the server.</p>
        </section>
      </main>
    );
  }
  if (!hasAdminAccess(effectiveRole)) {
    return (
      <main className="min-h-screen bg-theme-main text-theme-main flex items-center justify-center p-6">
        <section className="bento-card w-full max-w-lg p-8 text-center">
          <Lock className="mx-auto mb-4 size-10 text-theme-accent" aria-hidden="true" />
          <h1 className="text-2xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-theme-muted">This control center is restricted to authorized Keedohub operations roles.</p>
          <p className="mt-3 text-xs text-theme-muted">
            Signed in as {user?.email || "unknown"} · detected role: <span className="font-mono font-bold">{effectiveRole}</span>.
            Staff access is granted by assigning a super_admin / admin / support role to your account (Admin user management or ADMIN_BOOTSTRAP_EMAIL on first boot) — customer accounts can never enter here.
          </p>
          {onBackToApp && <button onClick={onBackToApp} className="mt-6 rounded-xl bg-theme-accent px-4 py-2 text-sm font-semibold">Return to workspace</button>}
        </section>
      </main>
    );
  }

  const fetchOverviewStats = async () => {
    setLoading(true);
    try { const res = await api.admin.getOverviewStats(); if (res.stats) setStats(res.stats); }
    catch (err) { console.error("Failed to fetch admin stats", err); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (hasAdminAccess(effectiveRole)) void fetchOverviewStats(); }, [effectiveRole]);

  const getRoleBadge = (role: SystemAdminRole) => {
    switch (role) {
      case "super_admin": return (<span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center gap-1.5 shadow-sm"><ShieldAlert className="w-3.5 h-3.5" /> SUPER ADMIN</span>);
      case "admin": return (<span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center gap-1.5 shadow-sm"><Shield className="w-3.5 h-3.5" /> ADMIN</span>);
      case "support": return (<span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1.5 shadow-sm"><ShieldCheck className="w-3.5 h-3.5" /> SUPPORT TIER</span>);
      default: return (<span className="px-2.5 py-1 rounded-full text-xs font-mono text-muted-foreground bg-accent/40 border border-border/40">STANDARD USER</span>);
    }
  };

  const navGroups: { label: string; items: { id: AdminSubTab; label: string; icon: React.ReactNode; badge?: string; productionOnly?: boolean }[] }[] = [
    { label: "Command Center", items: [{ id: "operations", label: "Command Center", icon: <LayoutDashboard className="w-4 h-4" />, badge: "LIVE" }] },
    { label: "Customers", items: [
      { id: "customers", label: "Customers", icon: <Users className="w-4 h-4" />, badge: stats ? `${stats.totalUsers}` : undefined },
      { id: "workspaces", label: "Workspaces", icon: <HardDrive className="w-4 h-4" />, badge: stats ? `${stats.totalWorkspaces}` : undefined },
    ] },
    { label: "Production", items: [
      { id: "requests", label: "Requests", icon: <FolderOpen className="w-4 h-4" /> },
      { id: "projects", label: "Projects", icon: <Eye className="w-4 h-4" /> },
      { id: "queue", label: "Production Queue", icon: <Factory className="w-4 h-4" />, productionOnly: true },
      { id: "review", label: "Review", icon: <Clock className="w-4 h-4" /> },
      { id: "deliveries", label: "Deliveries", icon: <Boxes className="w-4 h-4" /> },
    ] },
    { label: "Studio", items: [
      { id: "studio", label: "Creative Engines", icon: <Music className="w-4 h-4" /> },
      { id: "audio", label: "Audio QA", icon: <AudioLines className="w-4 h-4" /> },
      { id: "search", label: "Admin Search", icon: <Search className="w-4 h-4" /> },
    ] },
    { label: "Library", items: [{ id: "library", label: "Assets", icon: <Database className="w-4 h-4" /> }] },
    { label: "System", items: [
      { id: "overview", label: "Operations Pulse", icon: <Activity className="w-4 h-4" /> },
      { id: "users", label: "Customer Accounts", icon: <Users className="w-4 h-4" /> },
      { id: "ws-mgmt", label: "Workspace Management", icon: <HardDrive className="w-4 h-4" /> },
      { id: "production-config", label: "Services, Plans & Usage", icon: <Sparkles className="w-4 h-4" /> },
      { id: "production-jobs", label: "Version Engine", icon: <Factory className="w-4 h-4" />, productionOnly: true },
      { id: "document-templates", label: "Documents & Templates", icon: <FileText className="w-4 h-4" /> },
      { id: "activity", label: "Logs & Activity", icon: <Activity className="w-4 h-4" /> },
      { id: "support", label: "Support", icon: <LifeBuoy className="w-4 h-4" />, badge: stats && stats.openSupportTickets > 0 ? `${stats.openSupportTickets}` : undefined },
      { id: "system-health", label: "System Health", icon: <Cpu className="w-4 h-4" /> },
      { id: "feature-flags", label: "Feature Flags", icon: <Sliders className="w-4 h-4" /> },
      { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
    ] },
  ];

  return (
    <div className="min-h-screen bg-theme-main text-theme-main flex flex-col">
      <div className="sticky top-0 z-40 border-b border-theme-main bg-theme-card/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToApp && (
            <button onClick={onBackToApp} className="p-2 rounded-xl border border-theme-main hover:bg-theme-elevated text-theme-muted hover:text-theme-main transition-colors flex items-center gap-1.5 text-xs font-semibold mr-1" title="Return to Keedohub Workspace">
              <ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Workspace OS</span>
            </button>
          )}
          <div className="w-8 h-8 rounded-xl bg-theme-accent flex items-center justify-center font-bold shadow-md"><ShieldAlert className="w-4 h-4" /></div>
          <div>
            <div className="flex items-center gap-2"><h1 className="text-base font-extrabold tracking-tight text-theme-main">KEEDOHUB OPERATIONS</h1><span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">ADMIN</span></div>
            <p className="text-[11px] text-theme-muted">Admin / Studio — production control center</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-accent/30 p-1.5 rounded-xl border border-border/50 text-xs">
            <span className="text-[11px] text-theme-muted font-medium pl-1 hidden sm:inline">Authority Role:</span>{getRoleBadge(effectiveRole)}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto p-4 sm:p-6 gap-6">
        <aside className={`${sidebarCollapsed ? "lg:w-16" : "lg:w-64"} w-full flex-shrink-0 space-y-1 bg-theme-card border border-theme-main rounded-2xl p-3 h-fit transition-[width]`}>
          <div className="flex items-center justify-between px-2 py-2">
            {!sidebarCollapsed && <div className="text-[10px] font-bold uppercase tracking-wider text-theme-muted">Admin Navigation</div>}
            <button onClick={() => setSidebarCollapsed((c) => !c)} className="ml-auto rounded-lg p-1.5 text-theme-muted hover:bg-theme-elevated hover:text-theme-main" aria-label={sidebarCollapsed ? "Expand admin navigation" : "Collapse admin navigation"}>
              {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => canAccessProduction || !item.productionOnly);
            if (!visibleItems.length) return null;
            return (
              <div key={group.label} className="flex flex-col gap-1">
                {!sidebarCollapsed && <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-theme-muted">{group.label}</div>}
                {visibleItems.map((tab) => {
                  const isActive = activeSubTab === tab.id;
                  return (
                    <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} aria-current={isActive ? "page" : undefined} title={sidebarCollapsed ? tab.label : undefined}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-colors ${isActive ? "bg-theme-accent shadow-md" : "text-theme-muted hover:bg-theme-elevated hover:text-theme-main"}`}>
                      <span className="flex items-center gap-2.5">{tab.icon}{!sidebarCollapsed && <span>{tab.label}</span>}</span>
                      {!sidebarCollapsed && tab.badge && <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${isActive ? "bg-white/20" : "bg-theme-elevated text-theme-muted"}`}>{tab.badge}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
          <div className="pt-4 mt-4 border-t border-theme-main px-3 text-[11px] text-theme-muted space-y-1.5">
            <div className="font-bold text-foreground flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Role Scope</div>
            <p className="leading-relaxed">
              {effectiveRole === "super_admin" && "Full root access: users, workspaces, production, audits & settings."}
              {effectiveRole === "admin" && "Standard operations control: customers, workspaces, requests, projects, production & delivery."}
              {effectiveRole === "support" && "Support tier: non-destructive telemetry, diagnostics, inspection & ticket resolution."}
            </p>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {OPS_SECTIONS.includes(activeSubTab as OpsSection) && (
            <OpsConsole section={activeSubTab as OpsSection} canProduction={canAccessProduction} openProduction={(jobId) => { setPendingJobId(jobId); setActiveSubTab("production-jobs"); }} />
          )}
          {activeSubTab === "overview" && <AdminOverviewTab stats={stats} loading={loading} onRefresh={fetchOverviewStats} onNavigateTab={(tabId) => setActiveSubTab(tabId as AdminSubTab)} />}
          {activeSubTab === "production-jobs" && <ProductionCenter onNotify={(_m, _t) => {}} initialJobId={pendingJobId} onClearJob={() => setPendingJobId(null)} />}
          {activeSubTab === "users" && <UserManagementTab currentUserRole={effectiveRole} onRefreshStats={fetchOverviewStats} />}
          {activeSubTab === "ws-mgmt" && <WorkspaceManagementTab currentUserRole={effectiveRole} onRefreshStats={fetchOverviewStats} />}
          {activeSubTab === "activity" && <PlatformActivityTab currentUserRole={effectiveRole} />}
          {activeSubTab === "support" && <SupportViewTab currentUserRole={effectiveRole} />}
          {activeSubTab === "system-health" && <SystemHealthTab />}
          {activeSubTab === "feature-flags" && <FeatureFlagsTab currentUserRole={effectiveRole} />}
          {activeSubTab === "settings" && <PlatformSettingsTab currentUserRole={effectiveRole} />}
          {activeSubTab === "document-templates" && <DocumentTemplateManagementTab currentUserRole={effectiveRole} />}
          {activeSubTab === "production-config" && <ProductionConfigTab currentUserRole={effectiveRole} />}
        </div>
      </div>
    </div>
  );
};