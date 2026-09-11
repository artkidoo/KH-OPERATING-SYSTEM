// PHASE 2 — membership resolution + demo seeding (additive).
// planForWorkspace + demo content helpers. Additive only.
import { planForWorkspace, MembershipPlan } from "./membership";

export type MembershipTier = "free" | "pro";

export function resolveMembershipPlan(
  identity: "artist" | "brand" | string | undefined,
  workspace: { settings?: Record<string, unknown> } | null | undefined
): MembershipPlan {
  const id = identity === "brand" ? "brand" : "artist";
  const raw = (workspace?.settings as Record<string, unknown> | undefined)?.membershipTier;
  const tier: MembershipTier = raw === "pro" ? "pro" : "free";
  return planForWorkspace(id, tier);
}

export interface DemoSeedSummary {
  kind: "artist" | "brand";
  projectTitle: string;
  sections: string[];
  highlights: string[];
}

export function demoSeedFor(identity: "artist" | "brand"): DemoSeedSummary {
  if (identity === "brand") {
    return {
      kind: "brand",
      projectTitle: "Brand Refresh",
      sections: ["Brief", "Brand Assets", "Social Content", "Presentations", "Documents", "Final Deliverables"],
      highlights: ["logos", "social assets", "presentation", "business documents"],
    };
  }
  return {
    kind: "artist",
    projectTitle: "LIGHT",
    sections: ["Release Information", "Artwork", "Photos", "Social Assets", "Motion", "Press", "Copy", "Downloads"],
    highlights: ["release information", "artwork", "social assets", "press", "downloads"],
  };
}
