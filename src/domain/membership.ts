// ============================================================
// MEMBERSHIP / ENTITLEMENT LAYER (Step 8)
// Central capability system. Do NOT hardcode feature access in components.
// ============================================================

export type MembershipPlan = 'artist_free' | 'artist_pro' | 'brand_free' | 'brand_pro';

export type Capability =
  | 'basic_workspace'
  | 'project_creation'
  | 'asset_library'
  | 'basic_creative_tools'
  | 'release_builder'
  | 'advanced_templates'
  | 'motion_tools'
  | 'epk_tools'
  | 'bulk_export'
  | 'advanced_documents'
  | 'secure_sharing'
  | 'team_collaboration'
  | 'premium_templates'
  | 'advanced_storage';

const FREE_CAPS: Capability[] = [
  'basic_workspace',
  'project_creation',
  'asset_library',
  'basic_creative_tools',
];

const ARTIST_PRO_EXTRA: Capability[] = [
  'release_builder',
  'advanced_templates',
  'motion_tools',
  'epk_tools',
  'bulk_export',
  'secure_sharing',
  'premium_templates',
  'advanced_storage',
];

const BRAND_PRO_EXTRA: Capability[] = [
  'advanced_templates',
  'advanced_documents',
  'bulk_export',
  'secure_sharing',
  'team_collaboration',
  'premium_templates',
  'advanced_storage',
];

export const PLAN_CAPABILITIES: Record<MembershipPlan, Capability[]> = {
  artist_free: [...FREE_CAPS],
  artist_pro: [...FREE_CAPS, ...ARTIST_PRO_EXTRA],
  brand_free: [...FREE_CAPS],
  brand_pro: [...FREE_CAPS, ...BRAND_PRO_EXTRA],
};

export function planForWorkspace(identity: 'artist' | 'brand', tier: 'free' | 'pro'): MembershipPlan {
  return `${identity}_${tier}` as MembershipPlan;
}

export function hasCapability(plan: MembershipPlan, cap: Capability): boolean {
  return (PLAN_CAPABILITIES[plan] ?? []).includes(cap);
}

export function missingCapabilities(plan: MembershipPlan, required: Capability[]): Capability[] {
  const have = new Set(PLAN_CAPABILITIES[plan] ?? []);
  return required.filter((c) => !have.has(c));
}
