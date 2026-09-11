import React from "react";
import { useMembership } from "../hooks/useMembership";
import type { Capability } from "../domain/membership";

export function ProGate({ require, fallback, children }: {
  require: Capability | Capability[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { can } = useMembership();
  const needs = Array.isArray(require) ? require : [require];
  const ok = needs.every((c) => can(c));
  if (ok) return <>{children}</>;
  if (fallback) return <>{fallback}</>;
  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 text-center">
      <p className="text-sm font-bold text-amber-200">Pro feature</p>
      <p className="mt-1 text-xs text-zinc-400">
        This needs {needs.join(", ").replaceAll("_", " ")}. Upgrade in Membership for the full creative package.
      </p>
    </div>
  );
}
export default ProGate;
