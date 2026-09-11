import React, { useState, useEffect } from "react";
import { Settings, Save, RefreshCw, Factory, Crown, Loader2, Check } from "lucide-react";
import { api } from "../../services/api";

export function ProductionConfigTab({ currentUserRole }: { currentUserRole: string }) {
  const [planConfigs, setPlanConfigs] = useState<any[]>([]);
  const [productionConfig, setProductionConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"plans" | "production" | null>(null);
  const [note, setNote] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const canEdit = currentUserRole === "super_admin" || currentUserRole === "admin";

  const load = async () => {
    setLoading(true);
    try {
      const [plans, prod] = await Promise.all([api.platform.getPlanConfig(), api.platform.getProductionConfig()]);
      setPlanConfigs(plans.planConfigs || []);
      setProductionConfig(prod.productionConfig || { studios: [], priorities: [], requestCategories: [], assetDefinitionHints: [], revisionLimits: [] });
    } catch (e: any) {
      setNote({ type: "error", msg: e.message || "Failed to load config." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const savePlans = async () => {
    setSaving("plans");
    try {
      await api.platform.updatePlanConfig(planConfigs);
      setNote({ type: "success", msg: "Plan configuration saved." });
    } catch (e: any) {
      setNote({ type: "error", msg: e.message || "Failed to save plans." });
    } finally {
      setSaving(null);
    }
  };

  const saveProduction = async () => {
    setSaving("production");
    try {
      await api.platform.updateProductionConfig(productionConfig);
      setNote({ type: "success", msg: "Production configuration saved." });
    } catch (e: any) {
      setNote({ type: "error", msg: e.message || "Failed to save production config." });
    } finally {
      setSaving(null);
    }
  };

  const updatePlan = (idx: number, key: string, value: any) => {
    setPlanConfigs((prev) => prev.map((p, i) => (i === idx ? { ...p, [key]: value } : p)));
  };

  if (loading) return <div className="p-8 flex items-center justify-center text-zinc-500"><Loader2 className="w-5 h-5 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center"><Settings className="w-5 h-5 text-white" /></div>
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Production & Plan Configuration</h2>
            <p className="text-xs text-muted-foreground">Admin-configurable entitlements, studios, priorities and request categories.</p>
          </div>
        </div>
        <button onClick={load} className="p-2 rounded-xl border border-border hover:bg-accent text-muted-foreground"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {note && (
        <div className={`rounded-xl p-3 text-xs font-bold flex items-center gap-2 ${note.type === "success" ? "bg-emerald-600/20 text-emerald-300" : "bg-rose-600/20 text-rose-300"}`}>
          {note.type === "success" ? <Check className="w-4 h-4" /> : null}{note.msg}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card/40 overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2"><Crown className="w-4 h-4 text-amber-400" /><p className="text-sm font-bold text-foreground">Membership Plans & Entitlements</p></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-accent/30 text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2">Plan</th>
                <th className="text-left px-3 py-2">Label</th>
                <th className="text-right px-3 py-2">Storage (MB)</th>
                <th className="text-right px-3 py-2">Generations</th>
                <th className="text-right px-3 py-2">Exports</th>
                <th className="text-right px-3 py-2">Requests</th>
                <th className="text-right px-3 py-2">Revisions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {planConfigs.map((p, idx) => (
                <tr key={p.plan} className="hover:bg-accent/20">
                  <td className="px-3 py-2 font-mono text-foreground">{p.plan}</td>
                  <td className="px-3 py-2"><input disabled={!canEdit} value={p.label || ""} onChange={(e) => updatePlan(idx, "label", e.target.value)} className="w-full bg-transparent border-b border-transparent hover:border-border focus:border-amber-500 outline-none text-foreground py-0.5" /></td>
                  <td className="px-3 py-2"><input disabled={!canEdit} type="number" value={p.storageMB || 0} onChange={(e) => updatePlan(idx, "storageMB", Number(e.target.value))} className="w-24 bg-transparent border-b border-transparent hover:border-border focus:border-amber-500 outline-none text-foreground text-right py-0.5" /></td>
                  <td className="px-3 py-2"><input disabled={!canEdit} type="number" value={p.generations || 0} onChange={(e) => updatePlan(idx, "generations", Number(e.target.value))} className="w-20 bg-transparent border-b border-transparent hover:border-border focus:border-amber-500 outline-none text-foreground text-right py-0.5" /></td>
                  <td className="px-3 py-2"><input disabled={!canEdit} type="number" value={p.exports || 0} onChange={(e) => updatePlan(idx, "exports", Number(e.target.value))} className="w-20 bg-transparent border-b border-transparent hover:border-border focus:border-amber-500 outline-none text-foreground text-right py-0.5" /></td>
                  <td className="px-3 py-2"><input disabled={!canEdit} type="number" value={p.productionRequests || 0} onChange={(e) => updatePlan(idx, "productionRequests", Number(e.target.value))} className="w-20 bg-transparent border-b border-transparent hover:border-border focus:border-amber-500 outline-none text-foreground text-right py-0.5" /></td>
                  <td className="px-3 py-2"><input disabled={!canEdit} type="number" value={p.revisions || 0} onChange={(e) => updatePlan(idx, "revisions", Number(e.target.value))} className="w-16 bg-transparent border-b border-transparent hover:border-border focus:border-amber-500 outline-none text-foreground text-right py-0.5" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {canEdit && (
          <div className="px-4 py-3 border-t border-border">
            <button onClick={savePlans} disabled={saving === "plans"} className="flex items-center gap-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-white px-4 py-2 rounded-xl">
              {saving === "plans" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save plan config
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card/40 overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2"><Factory className="w-4 h-4 text-rose-400" /><p className="text-sm font-bold text-foreground">Production Studios</p></div>
        <div className="p-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(productionConfig.studios || []).map((s: any) => (
            <div key={s.studio} className="rounded-xl border border-border bg-accent/20 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-foreground">{s.label}</p>
                <span className="text-[10px] font-mono text-muted-foreground">{s.studio}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{s.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">{(s.categories || []).map((c: string) => <span key={c} className="text-[9px] font-bold bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">{c}</span>)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/40 p-4 space-y-3">
        <p className="text-sm font-bold text-foreground">Request categories & priorities</p>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Priorities</p>
          <div className="flex flex-wrap gap-1.5">{(productionConfig.priorities || []).map((p: string) => <span key={p} className="text-[10px] font-bold bg-indigo-600/20 text-indigo-300 px-2 py-0.5 rounded">{p}</span>)}</div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Request categories</p>
          <div className="flex flex-wrap gap-1.5">{(productionConfig.requestCategories || []).map((c: string) => <span key={c} className="text-[10px] font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">{c}</span>)}</div>
        </div>
        {canEdit && (
          <button onClick={saveProduction} disabled={saving === "production"} className="flex items-center gap-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-700 text-white px-4 py-2 rounded-xl">
            {saving === "production" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save production config
          </button>
        )}
      </div>
    </div>
  );
}
