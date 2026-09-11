// PHASE 3 — membership config surface (additive).
// Admin-editable plan metadata persisted server-side via platform settings.
import type { MembershipPlan } from "./membership";

export interface PlanConfig {
  plan: MembershipPlan | string;
  label: string;
  blurb: string;
  storageMB: number;
  generations: number;
  exports: number;
  productionRequests: number;
  revisions: number;
}

export const DEFAULT_PLAN_CONFIGS: PlanConfig[] = [
  { plan: "artist_free", label: "Artist Free", blurb: "Workspace, projects, basic tools.", storageMB: 2048, generations: 20, exports: 20, productionRequests: 3, revisions: 2 },
  { plan: "artist_pro", label: "Artist Pro", blurb: "Release builder, packages, motion, EPK, bulk export.", storageMB: 51200, generations: 1000, exports: 1000, productionRequests: 100, revisions: 5 },
  { plan: "brand_free", label: "Brand Free", blurb: "Workspace, library, basic documents.", storageMB: 2048, generations: 20, exports: 20, productionRequests: 3, revisions: 2 },
  { plan: "brand_pro", label: "Brand Pro", blurb: "Advanced library, documents, sharing, collaboration.", storageMB: 51200, generations: 1000, exports: 1000, productionRequests: 100, revisions: 5 },
  { plan: "team", label: "Team (soon)", blurb: "Shared seats + review flows.", storageMB: 204800, generations: 5000, exports: 5000, productionRequests: 500, revisions: 8 },
  { plan: "agency", label: "Agency (soon)", blurb: "Multi-client production.", storageMB: 512000, generations: 20000, exports: 20000, productionRequests: 2000, revisions: 10 },
  { plan: "label", label: "Label (soon)", blurb: "Roster-wide creative ops.", storageMB: 512000, generations: 20000, exports: 20000, productionRequests: 2000, revisions: 10 },
  { plan: "enterprise", label: "Enterprise (soon)", blurb: "SSO, audit, dedicated capacity.", storageMB: 2097152, generations: 100000, exports: 100000, productionRequests: 10000, revisions: 15 },
];
