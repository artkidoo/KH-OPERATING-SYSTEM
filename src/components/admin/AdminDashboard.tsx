import React, { useState, useEffect } from "react";
import {
  ShieldAlert, ShieldCheck, Shield, LayoutDashboard, Users, HardDrive, Activity,
  LifeBuoy, Cpu, Sliders, Settings, RefreshCw, Sparkles, Lock, ArrowLeft, FileText,
  Factory, PanelLeftClose, PanelLeftOpen, Search, FolderOpen, Music, AudioLines,
  Database, Eye, Clock, Boxes, LogIn, LogOut, Info, KeyRound, CheckCircle2,
  Menu, X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { AdminOverviewStats, SystemAdminRole } from "../../types";
import { AuthModal } from "../AuthModal";
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
  const { user, isLoading, demoLogin, logout } = useAuth();
  const [activeSubTab, setActiveSubTabState] = useState<AdminSubTab>(() => (typeof window !== "undefined" ? subTabFromPath(window.location.pathname) : "operations"));
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSwitchingAdmin, setIsSwitchingAdmin] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  const handleSwitchToAdminDemo = async () => {
    setIsSwitchingAdmin(true);
    setSwitchError(null);
    try {
      await demoLogin("admin");
    } catch (err: any) {
      setSwitchError(err?.message || "Failed to start Admin Demo session.");
    } finally {
      setIsSwitchingAdmin(false);
    }
  };

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
      <main className="min-h-screen bg-theme-main text-theme-main flex items-center justify-center p-4 sm:p-6">
        <section className="bento-card w-full max-w-xl p-6 sm:p-8 text-center space-y-6 border-amber-500/30 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
            <Lock className="size-8" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>OPERATIONS GATEWAY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] tracking-tight">
              Admin Access Required
            </h1>
            <p className="text-sm text-theme-muted max-w-md mx-auto">
              This control center is restricted to authorized Keedohub operations roles (<span className="font-mono text-zinc-300">super_admin</span>, <span className="font-mono text-zinc-300">admin</span>, <span className="font-mono text-zinc-300">support</span>).
            </p>
          </div>

          {/* Current Session Banner */}
          <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 text-left text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-theme-muted font-medium">Currently signed in:</span>
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                role: {effectiveRole}
              </span>
            </div>
            <div className="font-mono text-zinc-200 truncate font-semibold">
              {user?.email || "anonymous / no active session"}
            </div>
          </div>

          {switchError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs text-left">
              {switchError}
            </div>
          )}

          {/* Primary Action: 1-Click Instant Admin Demo */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleSwitchToAdminDemo}
              disabled={isSwitchingAdmin}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSwitchingAdmin ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Provisioning Super Admin session…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Login as Admin Demo (Super Admin)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-theme-muted">
              Instant 1-click preview: grants full Super Admin privileges to test operations, user management, production queues & telemetry.
            </p>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-theme-elevated hover:bg-theme-border border border-theme-border text-xs sm:text-sm font-semibold text-theme-main flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-theme-accent" />
              <span>Sign In with Staff Account</span>
            </button>

            <button
              onClick={async () => {
                await logout();
              }}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-xs font-semibold text-zinc-400 hover:text-red-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {onBackToApp && (
            <div className="pt-2 border-t border-theme-border/60">
              <button
                onClick={onBackToApp}
                className="text-xs text-theme-muted hover:text-theme-main flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Customer Workspace</span>
              </button>
            </div>
          )}

          {/* How Admin Authentication Works Guide */}
          <div className="pt-4 border-t border-theme-border/40 text-left">
            <h2 className="text-xs font-bold uppercase tracking-wider text-theme-muted mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-theme-accent" />
              <span>How to Authenticate as Admin</span>
            </h2>
            <ul className="text-xs text-theme-muted space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-theme-elevated text-center shrink-0 font-mono font-bold text-[10px] text-theme-main flex items-center justify-center mt-0.5">1</span>
                <span><strong>Instant Testing:</strong> Click <em>&ldquo;Login as Admin Demo&rdquo;</em> above for zero-configuration, full Super Admin operations privileges.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-theme-elevated text-center shrink-0 font-mono font-bold text-[10px] text-theme-main flex items-center justify-center mt-0.5">2</span>
                <span><strong>Promoting Your Own Account:</strong> From the Admin Demo, go to <em>Customer Accounts</em> (<code className="text-amber-400">/admin/account</code>), search your email, and promote your role to <code className="text-purple-400">super_admin</code> or <code className="text-blue-400">admin</code>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-theme-elevated text-center shrink-0 font-mono font-bold text-[10px] text-theme-main flex items-center justify-center mt-0.5">3</span>
                <span><strong>Production Environment Bootstrap:</strong> Set <code className="text-emerald-400">ADMIN_BOOTSTRAP_EMAIL</code> and <code className="text-emerald-400">ADMIN_BOOTSTRAP_PASSWORD</code> in your <code className="text-zinc-300">.env</code> file. On startup/login, Keedohub guarantees that account is an active Super Admin.</span>
              </li>
            </ul>
          </div>
        </section>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          adminContext={true}
        />
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

  const TAB_METADATA: Record<string, { title: string; category: string; description: string }> = {
    operations: { title: "Command Center", category: "Command Center", description: "Real-time production pipeline, live requests & operations telemetry" },
    customers: { title: "Customers", category: "Customers", description: "Customer roster, user profiles & subscription tier tracking" },
    workspaces: { title: "Workspaces", category: "Customers", description: "Multi-tenant studio & brand workspaces overview" },
    requests: { title: "Creative Requests", category: "Production", description: "Client project and asset requests pending operations triage" },
    projects: { title: "Production Projects", category: "Production", description: "Active multi-discipline artist & brand production initiatives" },
    queue: { title: "Production Queue", category: "Production", description: "Live jobs passing through automated & engineer production pipelines" },
    review: { title: "Quality Review", category: "Production", description: "Asset approvals, QA checks, client revisions & final sign-offs" },
    deliveries: { title: "Deliveries", category: "Production", description: "Delivered releases, brand kits and client asset bundles" },
    library: { title: "Asset Vault", category: "Library", description: "Centralized repository of master audio, vectors, covers & documents" },
    studio: { title: "Creative Engines", category: "Studio", description: "Internal operations tooling: audio engine, stems & cover automation" },
    audio: { title: "Audio QA & DSP", category: "Studio", description: "LUFS normalization, True Peak analysis & delivery validation" },
    attention: { title: "Needs Attention", category: "Operations", description: "Bottlenecks, stale revisions, unassigned jobs & SLA alerts" },
    search: { title: "Admin Search", category: "Studio", description: "Global operational index across users, workspaces, requests and files" },
    users: { title: "Customer Accounts", category: "System", description: "User system roles, elevation, suspension & access control" },
    "ws-mgmt": { title: "Workspace Management", category: "System", description: "Tenant administration, storage quotas & member governance" },
    overview: { title: "Operations Pulse", category: "System", description: "Macro platform analytics, resource utilization & performance metrics" },
    "production-jobs": { title: "Version Engine", category: "System", description: "Automated engine orchestration, builds & job distribution" },
    "production-config": { title: "Services, Plans & Usage", category: "System", description: "Service catalogue, pricing rules & workspace quota ceilings" },
    "document-templates": { title: "Documents & Templates", category: "System", description: "Official contracts, brand guidelines & document generator presets" },
    activity: { title: "Logs & Activity", category: "System", description: "Immutable audit trail of staff actions, role updates & file events" },
    support: { title: "Support Console", category: "System", description: "Ticket queues, customer inquiries & operations dispute resolution" },
    "system-health": { title: "System Health", category: "System", description: "API gateways, database connectivity & service worker heartbeats" },
    "feature-flags": { title: "Feature Flags", category: "System", description: "Runtime operational toggles and canary rollout toggles" },
    settings: { title: "Platform Settings", category: "System", description: "Global environment variables, branding and studio constants" },
  };

  const currentMeta = TAB_METADATA[activeSubTab] || {
    title: activeSubTab,
    category: "Operations",
    description: "Operational management and system administration",
  };

  return (
    <div className="min-h-screen bg-theme-main text-theme-main flex flex-col antialiased">
      {/* 1. TOP HEADER BAR */}
      <header className="sticky top-0 z-40 border-b border-theme-main bg-theme-card/95 backdrop-blur-md px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Mobile Hamburger to expand drawer */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-2 rounded-xl border border-theme-main hover:bg-theme-elevated text-theme-muted hover:text-theme-main lg:hidden transition-colors cursor-pointer shrink-0"
            aria-label="Open navigation menu"
            title="Browse all admin sections"
          >
            <Menu className="w-4 h-4 text-theme-accent" />
          </button>

          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-theme-main hover:bg-theme-elevated text-theme-muted hover:text-theme-main transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
              title="Return to Keedohub Workspace"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Workspace OS</span>
            </button>
          )}

          <div className="w-8 h-8 rounded-xl bg-theme-accent flex items-center justify-center font-bold shadow-md text-white shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-sm font-extrabold tracking-tight text-theme-main uppercase font-['Space_Grotesk'] truncate">
                KEEDOHUB OPERATIONS
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-theme-muted truncate hidden sm:block">
              Internal studio production control & system console
            </p>
          </div>
        </div>

        {/* Header Right: Active view pill + Role badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-theme-card border border-theme-main text-[11px] text-theme-main">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-theme-muted">Tab:</span>
            <span className="font-semibold text-theme-main">{currentMeta.title}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-theme-card p-1 sm:px-2 sm:py-1 rounded-xl border border-theme-main text-xs">
            {getRoleBadge(effectiveRole)}
          </div>
        </div>
      </header>

      {/* 2. MAIN ADMIN GRID: DEDICATED SIDE-NAVIGATION COLUMN AND MAIN CONTENT AREA */}
      <div
        id="admin-container"
        className={`flex-1 w-full overflow-hidden grid transition-all duration-200 ${
          sidebarCollapsed
            ? "grid-cols-[3.5rem_1fr] sm:grid-cols-[4rem_1fr]"
            : "grid-cols-[3.5rem_1fr] sm:grid-cols-[4rem_1fr] lg:grid-cols-[16rem_1fr]"
        }`}
      >
        {/* DEDICATED SIDE-NAVIGATION COLUMN */}
        <aside
          id="admin-sidebar"
          className="w-full min-w-0 border-r border-theme-main bg-theme-card flex flex-col h-[calc(100vh-57px)] sticky top-[57px] overflow-hidden z-20"
        >
          {/* Top of Sidebar: Expand/Collapse button on Desktop */}
          <div className="p-2 sm:p-2.5 border-b border-theme-main flex items-center justify-between gap-1">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden w-full flex items-center justify-center p-2 rounded-xl text-theme-muted hover:text-theme-main hover:bg-theme-elevated transition-colors cursor-pointer"
              title="Open full navigation list"
            >
              <Menu className="w-4 h-4 text-theme-accent" />
            </button>

            <div className="hidden lg:flex items-center justify-between w-full">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-theme-muted pl-1">
                  Ops Navigation
                </span>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 rounded-lg text-theme-muted hover:text-theme-main hover:bg-theme-elevated transition-colors ml-auto cursor-pointer"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={sidebarCollapsed ? "Expand admin navigation" : "Collapse admin navigation"}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Nav Items List: Always on the left, scrollable */}
          <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-4 scrollbar-thin">
            {navGroups.map((group) => {
              const visibleItems = group.items.filter(
                (item) => canAccessProduction || !item.productionOnly
              );
              if (!visibleItems.length) return null;

              return (
                <div key={group.label} className="space-y-1">
                  {!sidebarCollapsed && (
                    <div className="hidden lg:block px-2.5 pt-2 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-theme-muted">
                      {group.label}
                    </div>
                  )}

                  {visibleItems.map((tab) => {
                    const isActive = activeSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        title={tab.label}
                        aria-current={isActive ? "page" : undefined}
                        className={`w-full group flex items-center rounded-xl transition-all cursor-pointer ${
                          sidebarCollapsed
                            ? "justify-center p-2.5"
                            : "justify-center p-2.5 lg:justify-between lg:px-3 lg:py-2.5"
                        } ${
                          isActive
                            ? "bg-theme-accent text-white shadow-md font-semibold"
                            : "text-theme-muted hover:text-theme-main hover:bg-theme-elevated"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`shrink-0 transition-transform group-hover:scale-105 ${
                              isActive ? "text-white" : "text-theme-muted group-hover:text-theme-main"
                            }`}
                          >
                            {tab.icon}
                          </span>
                          {!sidebarCollapsed && (
                            <span className="hidden lg:inline text-xs font-medium truncate">
                              {tab.label}
                            </span>
                          )}
                        </div>

                        {!sidebarCollapsed && tab.badge && (
                          <span
                            className={`hidden lg:inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-theme-elevated text-theme-muted group-hover:text-theme-main"
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Authority Scope summary on Desktop */}
          {!sidebarCollapsed && (
            <div className="hidden lg:block p-3 border-t border-theme-main bg-theme-card/60 text-[11px] text-theme-muted space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-theme-main">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Role Scope</span>
              </div>
              <p className="text-[10px] text-theme-muted leading-tight">
                {effectiveRole === "super_admin" && "Full root operations access active."}
                {effectiveRole === "admin" && "Standard production operations control."}
                {effectiveRole === "support" && "Telemetry and support tier inspection."}
              </p>
            </div>
          )}
        </aside>

        {/* DEDICATED MAIN CONTENT AREA (GRID COLUMN 2) */}
        <main
          id="admin-main-content"
          className="w-full min-w-0 h-[calc(100vh-57px)] overflow-y-auto bg-theme-main flex flex-col"
        >
          {/* Top Breadcrumb & Section Header of Display */}
          <div className="border-b border-theme-main bg-theme-card/40 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-theme-muted font-medium">
                <span>Operations</span>
                <span>/</span>
                <span className="text-theme-muted">{currentMeta.category}</span>
                <span>/</span>
                <span className="text-theme-accent font-semibold">{currentMeta.title}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-['Space_Grotesk'] text-theme-main mt-0.5 tracking-tight flex items-center gap-2">
                <span>{currentMeta.title}</span>
                {activeSubTab === "operations" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    LIVE PIPELINE
                  </span>
                )}
              </h2>
              <p className="text-xs text-theme-muted mt-0.5">
                {currentMeta.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchOverviewStats()}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl border border-theme-main hover:bg-theme-elevated text-xs font-semibold text-theme-muted hover:text-theme-main flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Refresh operations stats"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-theme-accent" : ""}`} />
                <span className="hidden sm:inline">Refresh Data</span>
              </button>
            </div>
          </div>

          {/* Active Tab View Body */}
          <div className="flex-1 p-3 sm:p-6 lg:p-8 space-y-6">
            {OPS_SECTIONS.includes(activeSubTab as OpsSection) && (
              <OpsConsole
                section={activeSubTab as OpsSection}
                canProduction={canAccessProduction}
                openProduction={(jobId) => {
                  setPendingJobId(jobId);
                  setActiveSubTab("production-jobs");
                }}
              />
            )}
            {activeSubTab === "overview" && (
              <AdminOverviewTab
                stats={stats}
                loading={loading}
                onRefresh={fetchOverviewStats}
                onNavigateTab={(tabId) => setActiveSubTab(tabId as AdminSubTab)}
              />
            )}
            {activeSubTab === "production-jobs" && (
              <ProductionCenter
                onNotify={(_m, _t) => {}}
                initialJobId={pendingJobId}
                onClearJob={() => setPendingJobId(null)}
              />
            )}
            {activeSubTab === "users" && (
              <UserManagementTab
                currentUserRole={effectiveRole}
                onRefreshStats={fetchOverviewStats}
              />
            )}
            {activeSubTab === "ws-mgmt" && (
              <WorkspaceManagementTab
                currentUserRole={effectiveRole}
                onRefreshStats={fetchOverviewStats}
              />
            )}
            {activeSubTab === "activity" && (
              <PlatformActivityTab currentUserRole={effectiveRole} />
            )}
            {activeSubTab === "support" && (
              <SupportViewTab currentUserRole={effectiveRole} />
            )}
            {activeSubTab === "system-health" && <SystemHealthTab />}
            {activeSubTab === "feature-flags" && (
              <FeatureFlagsTab currentUserRole={effectiveRole} />
            )}
            {activeSubTab === "settings" && (
              <PlatformSettingsTab currentUserRole={effectiveRole} />
            )}
            {activeSubTab === "document-templates" && (
              <DocumentTemplateManagementTab currentUserRole={effectiveRole} />
            )}
            {activeSubTab === "production-config" && (
              <ProductionConfigTab currentUserRole={effectiveRole} />
            )}
          </div>
        </main>
      </div>

      {/* 3. MOBILE SLIDE-OVER DRAWER (For full labels & search on phone/tablet) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-72 max-w-[85vw] bg-theme-card border-r border-theme-main flex flex-col h-full shadow-2xl z-10">
            <div className="p-4 border-b border-theme-main flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-theme-accent flex items-center justify-center text-white font-bold">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-['Space_Grotesk'] text-theme-main">
                    ADMIN NAVIGATION
                  </h3>
                  <p className="text-[10px] text-theme-muted">All Operations Sections</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-theme-muted hover:text-theme-main hover:bg-theme-elevated transition-colors cursor-pointer"
                title="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick search inside mobile drawer */}
            <div className="p-3 border-b border-theme-main">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-theme-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder="Filter sections…"
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-theme-input border border-theme-main text-xs text-theme-main placeholder:text-theme-muted focus:outline-none focus:border-theme-accent"
                />
              </div>
            </div>

            {/* Drawer Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {navGroups.map((group) => {
                const visibleItems = group.items.filter(
                  (item) =>
                    (canAccessProduction || !item.productionOnly) &&
                    (!navSearch || item.label.toLowerCase().includes(navSearch.toLowerCase()))
                );
                if (!visibleItems.length) return null;

                return (
                  <div key={group.label} className="space-y-1">
                    <div className="px-2 pt-1 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-theme-muted">
                      {group.label}
                    </div>
                    {visibleItems.map((tab) => {
                      const isActive = activeSubTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveSubTab(tab.id);
                            setIsMobileDrawerOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                              ? "bg-theme-accent text-white shadow-md font-bold"
                              : "text-theme-muted hover:text-theme-main hover:bg-theme-elevated"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={isActive ? "text-white" : "text-theme-muted"}>
                              {tab.icon}
                            </span>
                            <span>{tab.label}</span>
                          </div>
                          {tab.badge && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-theme-elevated text-theme-muted"
                              }`}
                            >
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};