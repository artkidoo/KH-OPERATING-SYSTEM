import React from "react";
import { PLAN_CAPABILITIES, MembershipPlan, hasCapability } from "../domain/membership";
import { useMembership } from "../hooks/useMembership";
import { useWorkspace } from "../context/WorkspaceContext";
import { Crown, Check, Zap } from "lucide-react";
export function MembershipView({ onNotify }: { onNotify?: (m: string, t?: "success"|"info"|"error") => void }) {
  const { plan, tier } = useMembership();
  const { updateCurrentWorkspace, workspace } = useWorkspace();
  const plans: MembershipPlan[] = ["artist_free","artist_pro","brand_free","brand_pro"];
  const upgrade = async () => {
    try {
      await updateCurrentWorkspace({ settings: { ...(workspace?.settings || {}), membershipTier: tier === "pro" ? "free" : "pro" } });
      onNotify?.(tier === "pro" ? "Switched to Free." : "Welcome to Pro.", "success");
    } catch (e: unknown) { onNotify?.(e instanceof Error ? e.message : "Failed.", "error"); }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center"><Crown className="w-5 h-5 text-amber-400" /></div>
          <div><h1 className="text-xl font-bold text-white">Membership</h1><p className="text-xs text-zinc-400">Current: {plan.replace("_"," ").toUpperCase()} · every gate reads this one plan.</p></div>
        </div>
        <button onClick={upgrade} className="flex items-center gap-1 rounded-xl bg-amber-500/15 border border-amber-500/30 px-4 py-2 text-xs font-bold text-amber-200 cursor-pointer"><Zap className="w-3.5 h-3.5" />{tier === "pro" ? "Switch to Free" : "Try Pro"}</button>
      </div>
      <p className="hidden">{hasCapability(plan, "basic_workspace")}</p>
      <div className="grid gap-3 md:grid-cols-4">
        {plans.map((p) => (
          <div key={p} className={`rounded-2xl border p-4 ${p === plan ? "border-amber-500/50 bg-amber-500/5" : "border-zinc-800 bg-zinc-950/60"}`}>
            <p className="text-sm font-bold text-white">{p.replace("_"," ").toUpperCase()}{p === plan ? " · YOU" : ""}</p>
            <div className="mt-2 space-y-1">
              {PLAN_CAPABILITIES[p].map((c) => (
                <p key={c} className="text-[11px] text-zinc-400 flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" />{c.replaceAll("_"," ")}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default MembershipView;
