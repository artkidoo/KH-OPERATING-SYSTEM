// ============================================================
// CAMPAIGN → PROJECT MIGRATION STRATEGY (Steps 1 + 5)
// KEEP / MODIFY / MIGRATE / DEPRECATE / REMOVE / CREATE
//
// - Campaign write-APIs are DEPRECATED (kept read-only for legacy data).
// - Campaign data migrates into Projects + Creative Requests, never destroyed.
// - campaignId remains as an optional legacy link field on content/assets.
// ============================================================

export type Classification = 'KEEP' | 'MODIFY' | 'MIGRATE' | 'DEPRECATE' | 'REMOVE' | 'CREATE';

export const ARCHITECTURE_CLASSIFICATION: { area: string; verdict: Classification; note: string }[] = [
  { area: 'auth / Supabase / storage / exports / canvas / artwork / lyrics / EPK / documents / templates', verdict: 'KEEP', note: 'Working infra; migrate into new workspace architecture.' },
  { area: 'Workspace / Project / Asset / Content / Creative Request / Activity / Notifications', verdict: 'MODIFY', note: 'Re-parent under Workspace → Project; keep campaignId as optional legacy link.' },
  { area: 'Campaign records / campaign_content gaps / sprint days / milestones', verdict: 'MIGRATE', note: 'Migrate each campaign into a Project + linked Creative Requests.' },
  { area: 'Campaign write routes + CampaignBuilder as primary workflow', verdict: 'DEPRECATE', note: 'Reads remain; writes blocked with 410 + migration hint.' },
  { area: 'Campaign-first nav, campaign readiness as gate, campaign analytics as primary', verdict: 'REMOVE', note: 'Replaced by project-first nav and project readiness.' },
  { area: 'domain/workspace, domain/membership, domain/creativeRequests, domain/creativeMemory, workspace nav', verdict: 'CREATE', note: 'New Phase-1 foundation (this change).' },
];

export interface LegacyCampaignLike {
  id: string;
  workspaceId: string;
  title: string;
  goal?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface MigratedProjectDraft {
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed';
  campaignMigratedFromId: string;
}

/** Pure helper: never destroys data, only drafts the target project. */
export function migrateCampaignToProjectDraft(c: LegacyCampaignLike): MigratedProjectDraft {
  const status = c.status === 'active' ? 'in-progress'
    : c.status === 'completed' ? 'completed'
    : 'planning';
  return {
    title: c.title,
    description: c.goal ? `Migrated from campaign "${c.title}". Goal: ${c.goal}` : `Migrated from campaign "${c.title}".`,
    status,
    campaignMigratedFromId: c.id,
  };
}
