import React, { useState, useEffect } from "react";
import {
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Percent,
  Sparkles,
  RefreshCw,
  X,
  Check,
  Tag,
  Sliders,
} from "lucide-react";
import { api } from "../../services/api";
import { FeatureFlag, IdentityType, SystemAdminRole } from "../../types";

interface FeatureFlagsTabProps {
  currentUserRole: SystemAdminRole;
}

export const FeatureFlagsTab: React.FC<FeatureFlagsTabProps> = ({
  currentUserRole,
}) => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingFlagId, setSavingFlagId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getFeatureFlags();
      if (res.flags) {
        setFlags(res.flags);
      }
    } catch (err) {
      console.error("Failed to load feature flags", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleToggleFlag = async (flag: FeatureFlag) => {
    setSavingFlagId(flag.id);
    const newEnabled = !flag.enabled;
    try {
      const res = await api.admin.updateFeatureFlag(flag.id, {
        enabled: newEnabled,
      });
      if (res.flag) {
        setFlags((prev) => prev.map((f) => (f.id === flag.id ? res.flag : f)));
        setNotification({
          type: "success",
          message: `Feature flag "${flag.name}" is now ${newEnabled ? "ENABLED" : "DISABLED"}`,
        });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to update feature flag" });
    } finally {
      setSavingFlagId(null);
    }
  };

  const handleRolloutChange = async (flag: FeatureFlag, newPercentage: number) => {
    setSavingFlagId(flag.id);
    try {
      const res = await api.admin.updateFeatureFlag(flag.id, {
        rolloutPercentage: newPercentage,
      });
      if (res.flag) {
        setFlags((prev) => prev.map((f) => (f.id === flag.id ? res.flag : f)));
        setNotification({
          type: "success",
          message: `Rollout for "${flag.name}" updated to ${newPercentage}%`,
        });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to update rollout" });
    } finally {
      setSavingFlagId(null);
    }
  };

  const canModifyFlags = currentUserRole === "super_admin" || currentUserRole === "admin";

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
            <Sliders className="w-5 h-5 text-blue-500" />
            Feature Flags & Gradual Rollouts
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Safely toggle experimental capabilities, control percentage rollouts, and restrict features by tenant identity type
          </p>
        </div>

        <button
          onClick={fetchFlags}
          disabled={loading}
          className="p-2 rounded-xl border border-border/60 bg-card hover:bg-accent text-foreground disabled:opacity-50 self-start md:self-auto"
          title="Refresh flags"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-500" : ""}`} />
        </button>
      </div>

      {/* Flag Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
            Loading feature flag configurations...
          </div>
        ) : (
          flags.map((flag) => (
            <div
              key={flag.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 ${
                flag.enabled
                  ? "border-border/60 bg-card/60 shadow-sm"
                  : "border-border/40 bg-card/20 opacity-80"
              }`}
            >
              {/* Flag Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-accent text-muted-foreground">
                      {flag.key}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono uppercase">
                      {flag.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{flag.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{flag.description}</p>
                </div>

                {/* Enable/Disable Toggle */}
                {canModifyFlags && (
                  <button
                    onClick={() => handleToggleFlag(flag)}
                    disabled={savingFlagId === flag.id}
                    className="flex-shrink-0 focus:outline-none transition-transform active:scale-95"
                    title={flag.enabled ? "Disable Feature Flag" : "Enable Feature Flag"}
                  >
                    {flag.enabled ? (
                      <ToggleRight className="w-8 h-8 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-muted-foreground/50" />
                    )}
                  </button>
                )}
              </div>

              {/* Rollout Percentage Slider */}
              <div className="space-y-1.5 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <Percent className="w-3 h-3" /> Rollout Percentage
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {flag.rolloutPercentage}%
                  </span>
                </div>
                {canModifyFlags ? (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={flag.rolloutPercentage}
                    onChange={(e) => handleRolloutChange(flag, parseInt(e.target.value, 10))}
                    disabled={!flag.enabled || savingFlagId === flag.id}
                    className="w-full h-1.5 bg-accent rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-40"
                  />
                ) : (
                  <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${flag.rolloutPercentage}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Target Identities */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-muted-foreground mr-1">Tenants:</span>
                {flag.allowedIdentities && flag.allowedIdentities.length > 0 ? (
                  flag.allowedIdentities.map((id) => (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-accent text-foreground font-semibold"
                    >
                      {id}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-emerald-400 font-medium">All Identity Types</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
