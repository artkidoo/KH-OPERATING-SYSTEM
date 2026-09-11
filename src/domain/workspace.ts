// ============================================================
// KEEDOHUB PHASE 1 — CORE DOMAIN MODEL
// USER → WORKSPACE → PROJECT → CREATIVE REQUEST / OUTPUT
//        → ASSETS / DOCUMENTS / DELIVERABLES
// ============================================================

export type WorkspaceIdentity = 'artist' | 'brand';

export interface WorkspaceModel {
  id: string;
  ownerId: string;
  name: string;
  identity: WorkspaceIdentity;
  bio?: string;
  genreOrNiche?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectModel {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  /** Logical sections inside a project, e.g. Artwork / Photos / Brief / Final Deliverables */
  sections: string[];
  campaignMigratedFromId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreativeOutputRef {
  id: string;
  workspaceId: string;
  projectId?: string;
  requestId?: string;
  kind: 'asset' | 'document' | 'deliverable';
  title: string;
}

export function isArtistWorkspace(identity: string | undefined | null): boolean {
  return identity === 'artist';
}

export function isBrandWorkspace(identity: string | undefined | null): boolean {
  return identity === 'brand';
}

/** Default project sections per identity (Step 4). */
export function defaultProjectSections(identity: WorkspaceIdentity): string[] {
  if (identity === 'artist') {
    return [
      'Release Information',
      'Artwork',
      'Photos',
      'Social Assets',
      'Motion',
      'Press',
      'EPK',
      'Copy',
      'Downloads',
    ];
  }
  return [
    'Brief',
    'Brand Direction',
    'Logos',
    'Social Assets',
    'Presentations',
    'Business Documents',
    'Final Deliverables',
  ];
}

/** Customer-facing workspace nav per identity (Step 3 + Step 10). */
export function workspaceNav(identity: WorkspaceIdentity): string[] {
  if (identity === 'artist') {
    return ['home', 'projects', 'music', 'content', 'library', 'requests', 'membership', 'profile'];
  }
  return ['home', 'projects', 'brand', 'creative', 'business', 'library', 'documents', 'requests', 'membership', 'profile'];
}
