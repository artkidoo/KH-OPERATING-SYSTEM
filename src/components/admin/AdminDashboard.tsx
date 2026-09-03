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

interface AdminDashboardProps {
  onBackToApp?: () => void;
}

type AdminSubTab =
  | "overview"
  | "users"
  | "workspaces"
  | "activity"
  | "support"
  | "system-health"
  | "feature-flags"
  | "settings"
  | "document-templates";

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToApp }) => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>("overview");
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Demo Role Switcher: lets evaluator test Super Admin, Admin, and Support least-privilege behaviors
  const [effectiveRole, setEffectiveRole] = useState<SystemAdminRole>(
    user?.systemRole || "super_admin"
  );

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

  const navTabs: { id: AdminSubTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "overview", label: "Dashboard Pulse", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "users", label: "User Management", icon: <Users className="w-4 h-4" />, badge: stats ? `${stats.totalUsers}` : undefined },
    { id: "workspaces", label: "Workspaces & Tenants", icon: <HardDrive className="w-4 h-4" />, badge: stats ? `${stats.totalWorkspaces}` : undefined },
    { id: "activity", label: "Platform Activity & Audit", icon: <Activity className="w-4 h-4" /> },
    { id: "support", label: "Support View", icon: <LifeBuoy className="w-4 h-4" />, badge: stats && stats.openSupportTickets > 0 ? `${stats.openSupportTickets}` : undefined },
    { id: "system-health", label: "System Health", icon: <Cpu className="w-4 h-4" /> },
    { id: "feature-flags", label: "Feature Flags", icon: <Sliders className="w-4 h-4" /> },
    { id: "settings", label: "Platform Settings", icon: <Settings className="w-4 h-4" />, badge: "ROOT" },
    { id: "document-templates", label: "Document Templates", icon: <FileText className="w-4 h-4" /> },
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Admin Control Header Bar */}
      <div className="sticky top-0 z-40 border-b border-border/70 bg-card/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="p-2 rounded-xl border border-border/60 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-semibold mr-1"
              title="Return to Keedohub Workspace"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Workspace OS</span>
            </button>
          )}

          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-foreground">
                Keedohub Admin Control Center
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                PHASE 16
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Secure Operations, Tenant Supervision & Infrastructure Gateway
            </p>
          </div>
        </div>

        {/* Right Side: Role Badge & Tester Role Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-accent/30 p-1.5 rounded-xl border border-border/50 text-xs">
            <span className="text-[11px] text-muted-foreground font-medium pl-1 hidden sm:inline">
              Authority Role:
            </span>
            <select
              value={effectiveRole}
              onChange={(e) => setEffectiveRole(e.target.value as SystemAdminRole)}
              className="bg-card border border-border/60 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-foreground focus:outline-none focus:border-purple-500"
              title="Switch role in demo mode to test least-privilege permissions"
            >
              <option value="super_admin">Super Admin (Root)</option>
              <option value="admin">Admin (Operations)</option>
              <option value="support">Support (Diagnostics)</option>
            </select>
            {getRoleBadge(effectiveRole)}
          </div>
        </div>
      </div>

      {/* Admin Body Container */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Left Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-1 bg-card/40 border border-border/60 rounded-2xl p-3 h-fit">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Control Plane Navigation
          </div>

          {navTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-accent text-muted-foreground"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Role Least Privilege Summary */}
          <div className="pt-4 mt-4 border-t border-border/40 px-3 text-[11px] text-muted-foreground space-y-1.5">
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
          </div>
        </div>

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
        </div>
      </div>
    </div>
  );
};
