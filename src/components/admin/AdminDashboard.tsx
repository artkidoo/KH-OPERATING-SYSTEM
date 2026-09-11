import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  LayoutDashboard,
  Users,
  HardDrive,
  Activity,
  LifeBuoy,
  Cpu,
  Sliders,
  Settings,
  RefreshCw,
  Sparkles,
  Lock,
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  FileText,
  Factory,
  PanelLeftClose,
  PanelLeftOpen,
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
import { hasAdminAccess, hasFullAdminAccess } from "../../utils/adminAccess";

interface AdminDashboardProps {
  onBackToApp?: () => void;
}

type AdminSubTab =
  | "overview"
  | "production-jobs"
  | "users"
  | "workspaces"
  | "activity"
  | "support"
  | "system-health"
  | "feature-flags"
  | "settings"
  | "document-templates"
  | "production-config";

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToApp }) => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>("overview");
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // System role is derived strictly from the authenticated user's assigned role.
  // There is no demo-mode role switching — least privilege is enforced.
  // Read the role from the current authenticated user on every render. A state
  // initializer runs before auth hydration and permanently captured "user".
  const effectiveRole: SystemAdminRole = user?.systemRole || "user";
  const canAccessProduction = hasFullAdminAccess(effectiveRole);

  if (!hasAdminAccess(effectiveRole)) {
    return (
      <main className="min-h-screen bg-theme-main text-theme-main flex items-center justify-center p-6">
        <section className="bento-card w-full max-w-lg p-8 text-center">
          <Lock className="mx-auto mb-4 size-10 text-theme-accent" aria-hidden="true" />
          <h1 className="text-2xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-theme-muted">
            This control center is restricted to authorized Keedohub operations roles.
          </p>
          {onBackToApp && (
            <button onClick={onBackToApp} className="mt-6 rounded-xl bg-theme-accent px-4 py-2 text-sm font-semibold">
              Return to workspace
            </button>
          )}
        </section>
      </main>
    );
  }

  const fetchOverviewStats = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getOverviewStats();
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Failed to fetch admin stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  const navGroups: { label: string; items: { id: AdminSubTab; label: string; icon: React.ReactNode; badge?: string }[] }[] = [
    { label: "Overview", items: [{ id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> }] },
    { label: "Workspace", items: [
      { id: "users", label: "Users", icon: <Users className="w-4 h-4" />, badge: stats ? `${stats.totalUsers}` : undefined },
      { id: "workspaces", label: "Workspaces", icon: <HardDrive className="w-4 h-4" />, badge: stats ? `${stats.totalWorkspaces}` : undefined },
      { id: "document-templates", label: "Documents & Templates", icon: <FileText className="w-4 h-4" /> },
    ] },
    { label: "Creative", items: [
      { id: "production-jobs", label: "Production Center", icon: <Factory className="w-4 h-4" />, badge: "LIVE" },
      { id: "production-config", label: "Services, Plans & Usage", icon: <Sparkles className="w-4 h-4" /> },
    ] },
    { label: "System", items: [
      { id: "activity", label: "Logs & Activity", icon: <Activity className="w-4 h-4" /> },
      { id: "support", label: "Support", icon: <LifeBuoy className="w-4 h-4" />, badge: stats && stats.openSupportTickets > 0 ? `${stats.openSupportTickets}` : undefined },
      { id: "system-health", label: "System Health", icon: <Cpu className="w-4 h-4" /> },
      { id: "feature-flags", label: "Feature Flags", icon: <Sliders className="w-4 h-4" /> },
      { id: "settings", label: "Platform Settings", icon: <Settings className="w-4 h-4" /> },
    ] },
  ];

  const getRoleBadge = (role: SystemAdminRole) => {
    switch (role) {
      case "super_admin":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center gap-1.5 shadow-sm">
            <ShieldAlert className="w-3.5 h-3.5" /> SUPER ADMIN
          </span>
        );
      case "admin":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center gap-1.5 shadow-sm">
            <Shield className="w-3.5 h-3.5" /> ADMIN
          </span>
        );
      case "support":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" /> SUPPORT TIER
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono text-muted-foreground bg-accent/40 border border-border/40">
            STANDARD USER
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-theme-main text-theme-main flex flex-col">
      {/* Top Admin Control Header Bar */}
      <div className="sticky top-0 z-40 border-b border-theme-main bg-theme-card/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="p-2 rounded-xl border border-theme-main hover:bg-theme-elevated text-theme-muted hover:text-theme-main transition-colors flex items-center gap-1.5 text-xs font-semibold mr-1"
              title="Return to Keedohub Workspace"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Workspace OS</span>
            </button>
          )}

          <div className="w-8 h-8 rounded-xl bg-theme-accent flex items-center justify-center font-bold shadow-md">
            <ShieldAlert className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-theme-main">
                KEEDOHUB ADMIN
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                PHASE 16
              </span>
            </div>
            <p className="text-[11px] text-theme-muted">
              Internal operations control center
            </p>
          </div>
        </div>

        {/* Right Side: Actual Authority Role Badge (no demo mode role switching) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-accent/30 p-1.5 rounded-xl border border-border/50 text-xs">
            <span className="text-[11px] text-theme-muted font-medium pl-1 hidden sm:inline">
              Authority Role:
            </span>
            {getRoleBadge(effectiveRole)}
          </div>
        </div>
      </div>

      {/* Admin Body Container */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Left Sidebar Navigation */}
        <aside className={`${sidebarCollapsed ? "lg:w-16" : "lg:w-64"} w-full flex-shrink-0 space-y-1 bg-theme-card border border-theme-main rounded-2xl p-3 h-fit transition-[width]`}>
          <div className="flex items-center justify-between px-2 py-2">
            {!sidebarCollapsed && <div className="text-[10px] font-bold uppercase tracking-wider text-theme-muted">Admin Navigation</div>}
            <button onClick={() => setSidebarCollapsed((collapsed) => !collapsed)} className="ml-auto rounded-lg p-1.5 text-theme-muted hover:bg-theme-elevated hover:text-theme-main" aria-label={sidebarCollapsed ? "Expand admin navigation" : "Collapse admin navigation"}>
              {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => canAccessProduction || item.id !== "production-jobs");
            if (!visibleItems.length) return null;
            return (
              <div key={group.label} className="flex flex-col gap-1">
                {!sidebarCollapsed && <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-theme-muted">{group.label}</div>}
                {visibleItems.map((tab) => {
                  const isActive = activeSubTab === tab.id;
                  return (
                    <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} aria-current={isActive ? "page" : undefined}
                      title={sidebarCollapsed ? tab.label : undefined}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-colors ${isActive ? "bg-theme-accent shadow-md" : "text-theme-muted hover:bg-theme-elevated hover:text-theme-main"}`}>
                      <span className="flex items-center gap-2.5">{tab.icon}{!sidebarCollapsed && <span>{tab.label}</span>}</span>
                      {!sidebarCollapsed && tab.badge && <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${isActive ? "bg-white/20" : "bg-theme-elevated text-theme-muted"}`}>{tab.badge}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* Role Least Privilege Summary */}
          {!sidebarCollapsed && <div className="pt-4 mt-4 border-t border-theme-main px-3 text-[11px] text-theme-muted space-y-1.5">
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Role Scope
            </div>
            <p className="leading-relaxed">
              {effectiveRole === "super_admin" &&
                "Full Root access: user management, feature flags, diagnostics & global settings."}
              {effectiveRole === "admin" &&
                "Standard administrative control: user/workspace status, support resolution & feature flags."}
              {effectiveRole === "support" &&
                "Support tier: non-destructive telemetry, diagnostics & ticket resolution."}
            </p>
          </div>}
        </aside>

        {/* Right Active Tab Content */}
        <div className="flex-1 min-w-0">
          {activeSubTab === "overview" && (
            <AdminOverviewTab
              stats={stats}
              loading={loading}
              onRefresh={fetchOverviewStats}
              onNavigateTab={(tabId) => setActiveSubTab(tabId as AdminSubTab)}
            />
          )}

          {activeSubTab === "production-jobs" && (
            <ProductionCenter onNotify={(_m, _t) => {}} />
          )}

          {activeSubTab === "users" && (
            <UserManagementTab
              currentUserRole={effectiveRole}
              onRefreshStats={fetchOverviewStats}
            />
          )}

          {activeSubTab === "workspaces" && (
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
      </div>
    </div>
  );
};
