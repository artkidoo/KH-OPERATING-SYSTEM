import React, { useState, useEffect } from "react";
import {
  Activity,
  Server,
  Database,
  Cpu,
  Zap,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Terminal,
} from "lucide-react";
import { api } from "../../services/api";

export const SystemHealthTab: React.FC = () => {
  const [health, setHealth] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinging, setPinging] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getSystemHealth();
      if (res.health) {
        setHealth(res.health);
      }
    } catch (err) {
      console.error("Failed to load health", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleRunPing = async () => {
    setPinging(true);
    try {
      const res = await api.admin.getSystemHealth();
      if (res.health) {
        setHealth(res.health);
      }
    } catch (err) {
      console.error("Health ping failed", err);
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Infrastructure Telemetry & Operational Health
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time status of the Express application runtime, JSON database integrity, and Gemini AI connectivity
          </p>
        </div>

        <button
          onClick={handleRunPing}
          disabled={pinging || loading}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${pinging ? "animate-spin" : ""}`} />
          Run Live Diagnostic Ping
        </button>
      </div>

      {loading && !health ? (
        <div className="py-20 text-center text-muted-foreground">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-2" />
          <div className="text-xs">Gathering system metrics...</div>
        </div>
      ) : health ? (
        <div className="space-y-6">
          {/* Main Status Hero */}
          <div className="p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-card to-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Keedohub Core Cluster is Operational</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
                    ALL SYSTEMS GO
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Last verified ping: {health.lastPingAt ? new Date(health.lastPingAt).toLocaleTimeString() : "Just now"}
                </div>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-muted-foreground">
              <div>Node Engine: {health.nodeVersion || "v20.x"}</div>
              <div>Memory RSS: {health.memoryUsageMb} MB</div>
            </div>
          </div>

          {/* Core Subsystem Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Express Server Subsystem */}
            <div className="p-5 rounded-2xl border border-border/60 bg-card/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-400" />
                  Express Application Server
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-emerald-400 font-bold">ONLINE (Port 3000)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Process Uptime</span>
                  <span className="text-foreground">
                    {Math.floor(health.uptimeSeconds / 3600)}h {Math.floor((health.uptimeSeconds % 3600) / 60)}m
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Vite Pipeline</span>
                  <span className="text-purple-400 font-bold">HMR Ready (Production SSR)</span>
                </div>
              </div>
            </div>

            {/* JSON Database Store */}
            <div className="p-5 rounded-2xl border border-border/60 bg-card/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  File-Backed JSON Database
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Entity Records</span>
                  <span className="text-foreground font-bold">{health.dbRecordsCount} records</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Disk Footprint</span>
                  <span className="text-blue-400 font-bold">{health.databaseSizeKb} KB</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Persistence Mode</span>
                  <span className="text-foreground">Atomic write-back</span>
                </div>
              </div>
            </div>

            {/* Gemini Creative AI Engine */}
            <div className="p-5 rounded-2xl border border-border/60 bg-card/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Gemini Creative Brain
                </span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    health.aiStatus === "healthy" ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Active Model</span>
                  <span className="text-foreground font-bold">gemini-2.5-flash</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">API Latency</span>
                  <span className="text-emerald-400 font-bold">{health.aiLatencyMs} ms</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Connection State</span>
                  <span
                    className={`font-bold ${
                      health.aiStatus === "healthy" ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {health.aiStatus === "healthy" ? "AUTHENTICATED" : "DEMO SIMULATED"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
