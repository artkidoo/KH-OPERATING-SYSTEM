// PHASE 2 — useMembership: central entitlement hook (additive).
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { hasCapability, Capability } from "../domain/membership";
import { resolveMembershipPlan } from "../domain/membershipPlan";

export function useMembership() {
  const { activeWorkspace } = useAuth();
  const { workspace } = useWorkspace();
  const identity = (workspace?.identityType || activeWorkspace?.identityType || "artist") as "artist" | "brand";
  const plan = useMemo(
    () => resolveMembershipPlan(identity, (workspace || activeWorkspace) as { settings?: Record<string, unknown> }),
    [identity, workspace, activeWorkspace]
  );
  const can = (cap: Capability) => hasCapability(plan, cap);
  const tier = plan.endsWith("_pro") ? "pro" : "free";
  return { plan, tier, identity, can };
}
