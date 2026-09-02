import React, { useState, useEffect } from "react";
import {
  Settings,
  ShieldAlert,
  AlertTriangle,
  Radio,
  Lock,
  Upload,
  Zap,
  Check,
  RefreshCw,
  X,
  Megaphone,
} from "lucide-react";
import { api } from "../../services/api";
import { PlatformSettings, SystemAdminRole } from "../../types";

interface PlatformSettingsTabProps {
  currentUserRole: SystemAdminRole;
}

export const PlatformSettingsTab: React.FC<PlatformSettingsTabProps> = ({
  currentUserRole,
}) => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [openSignups, setOpenSignups] = useState(true);
  const [maxUploadSizeMb, setMaxUploadSizeMb] = useState(500);
  const [aiRateLimitPerMin, setAiRateLimitPerMin] = useState(30);
  const [noticeActive, setNoticeActive] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState("");
  const [noticeLevel, setNoticeLevel] = useState<"info" | "warning" | "critical">("info");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getPlatformSettings();
      if (res.settings) {
        setSettings(res.settings);
        setMaintenanceMode(res.settings.maintenanceMode);
        setMaintenanceMessage(res.settings.maintenanceMessage || "");
        setOpenSignups(res.settings.allowNewSignups !== false);
        setMaxUploadSizeMb(res.settings.maxUploadSizeMb);
        setAiRateLimitPerMin(res.settings.aiRateLimitPerMin);
        setNoticeActive(res.settings.systemNoticeBanner?.enabled || false);
        setNoticeMessage(res.settings.systemNoticeBanner?.text || "");
        setNoticeLevel(res.settings.systemNoticeBanner?.type || "info");
      }
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.admin.updatePlatformSettings({
        maintenanceMode,
        maintenanceMessage,
        allowNewSignups: openSignups,
        maxUploadSizeMb: Number(maxUploadSizeMb),
        aiRateLimitPerMin: Number(aiRateLimitPerMin),
        systemNoticeBanner: {
          enabled: noticeActive,
          text: noticeMessage,
          type: noticeLevel,
        },
      });
      if (res.settings) {
        setSettings(res.settings);
        setNotification({ type: "success", message: "Platform settings updated successfully" });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to update platform settings" });
    } finally {
      setSaving(false);
    }
  };

  const isSuperAdmin = currentUserRole === "super_admin";

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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-500" />
            Global Platform Settings & Guardrails
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure system-wide operational limits, maintenance windows, and global broadcast announcements
          </p>
        </div>

        {!isSuperAdmin && (
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Super Admin Authority Required to Modify
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-500 mb-2" />
          <div className="text-xs">Loading platform configuration...</div>
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Maintenance Mode Card */}
          <div className="p-5 rounded-2xl border border-border/60 bg-card/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Platform Maintenance Mode
                </h3>
                <p className="text-xs text-muted-foreground">
                  When enabled, non-admin users will be greeted with a maintenance banner during planned upgrades.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  disabled={!isSuperAdmin}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {maintenanceMode && (
              <div className="pt-2">
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Custom Maintenance Message
                </label>
                <input
                  type="text"
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  disabled={!isSuperAdmin}
                  placeholder="e.g., Keedohub is undergoing scheduled database indexing. Full service resumes at 14:00 UTC."
                  className="w-full p-2.5 rounded-xl border border-border/60 bg-card text-xs text-foreground"
                />
              </div>
            )}
          </div>

          {/* Global Broadcast Notice Banner */}
          <div className="p-5 rounded-2xl border border-border/60 bg-card/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-blue-500" />
                  Global Notice Announcement
                </h3>
                <p className="text-xs text-muted-foreground">
                  Display a top-level alert banner to all active workspace members.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={noticeActive}
                  onChange={(e) => setNoticeActive(e.target.checked)}
                  disabled={!isSuperAdmin}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {noticeActive && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                <div className="md:col-span-3">
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Announcement Banner Text
                  </label>
                  <input
                    type="text"
                    value={noticeMessage}
                    onChange={(e) => setNoticeMessage(e.target.value)}
                    disabled={!isSuperAdmin}
                    placeholder="e.g., Keedohub Phase 16 Admin Control Center is now online!"
                    className="w-full p-2.5 rounded-xl border border-border/60 bg-card text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Notice Severity
                  </label>
                  <select
                    value={noticeLevel}
                    onChange={(e) => setNoticeLevel(e.target.value as any)}
                    disabled={!isSuperAdmin}
                    className="w-full p-2.5 rounded-xl border border-border/60 bg-card text-xs text-foreground"
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="critical">Critical (Rose)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Operational Rate & Storage Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-border/60 bg-card/60 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-400" />
                Max Asset Upload Size
              </h3>
              <p className="text-xs text-muted-foreground">
                Upper limit for lossless audio files, 4K video clips, and EPK assets.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="50"
                  max="5000"
                  step="50"
                  value={maxUploadSizeMb}
                  onChange={(e) => setMaxUploadSizeMb(Number(e.target.value))}
                  disabled={!isSuperAdmin}
                  className="w-32 p-2 rounded-xl border border-border/60 bg-card text-xs text-foreground font-mono"
                />
                <span className="text-xs text-muted-foreground font-mono">Megabytes (MB)</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border/60 bg-card/60 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Gemini AI Rate Limiting
              </h3>
              <p className="text-xs text-muted-foreground">
                Maximum Creative Brain generative prompts permitted per user minute.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={aiRateLimitPerMin}
                  onChange={(e) => setAiRateLimitPerMin(Number(e.target.value))}
                  disabled={!isSuperAdmin}
                  className="w-32 p-2 rounded-xl border border-border/60 bg-card text-xs text-foreground font-mono"
                />
                <span className="text-xs text-muted-foreground font-mono">Requests / Minute</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {isSuperAdmin && (
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Platform Guardrails
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
