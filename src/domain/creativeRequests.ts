// ============================================================
// CREATIVE REQUEST LIFECYCLE (Step 6) + INTERNAL PRODUCTION (Step 7)
// ============================================================

export type CreativeRequestStatus =
  | 'SUBMITTED'
  | 'REVIEWING'
  | 'APPROVED_FOR_PRODUCTION'
  | 'IN_PRODUCTION'
  | 'IN_REVIEW'
  | 'REVISION_REQUESTED'
  | 'READY_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type InternalStudio =
  | 'artwork'
  | 'content'
  | 'motion'
  | 'lyrics'
  | 'epk'
  | 'document'
  | 'brand_asset'
  | 'template_engine'
  | 'export_engine';

export interface CreativeRequestModel {
  id: string;
  workspaceId: string;
  projectId?: string;
  requesterId: string;
  requestType: string;
  title: string;
  description: string;
  instructions?: string;
  references?: string[];
  assetIds?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  membershipEntitlement?: string;
  status: CreativeRequestStatus;
  assignedStudio?: InternalStudio;
  assignedAdminId?: string;
  internalNotes?: string;
  clientVisibleNotes?: string;
  revisionCount: number;
  approvals: { by: string; at: string; note?: string }[];
  deliverableIds: string[];
  createdAt: string;
  updatedAt: string;
}

export const REQUEST_STATUS_ORDER: CreativeRequestStatus[] = [
  'SUBMITTED',
  'REVIEWING',
  'APPROVED_FOR_PRODUCTION',
  'IN_PRODUCTION',
  'IN_REVIEW',
  'REVISION_REQUESTED',
  'READY_FOR_DELIVERY',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
];

/** Allowed forward transitions for the customer-visible request pipeline. */
const ALLOWED: Record<CreativeRequestStatus, CreativeRequestStatus[]> = {
  SUBMITTED: ['REVIEWING', 'CANCELLED'],
  REVIEWING: ['APPROVED_FOR_PRODUCTION', 'CANCELLED'],
  APPROVED_FOR_PRODUCTION: ['IN_PRODUCTION', 'CANCELLED'],
  IN_PRODUCTION: ['IN_REVIEW', 'CANCELLED'],
  IN_REVIEW: ['REVISION_REQUESTED', 'READY_FOR_DELIVERY', 'CANCELLED'],
  REVISION_REQUESTED: ['IN_PRODUCTION', 'CANCELLED'],
  READY_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransitionRequest(from: CreativeRequestStatus, to: CreativeRequestStatus): boolean {
  return (ALLOWED[from] ?? []).includes(to);
}

/** Route a request to an internal studio. Customers never see studio nav. */
export function routeToStudio(requestType: string): InternalStudio {
  const t = requestType.toLowerCase();
  if (t.includes('artwork') || t.includes('cover')) return 'artwork';
  if (t.includes('motion') || t.includes('video') || t.includes('anim')) return 'motion';
  if (t.includes('lyric')) return 'lyrics';
  if (t.includes('epk') || t.includes('press kit')) return 'epk';
  if (t.includes('document') || t.includes('contract') || t.includes('proposal') || t.includes('invoice')) return 'document';
  if (t.includes('brand') || t.includes('logo')) return 'brand_asset';
  if (t.includes('template')) return 'template_engine';
  if (t.includes('export')) return 'export_engine';
  return 'content';
}

/** Internal pipeline: CUSTOMER REQUEST → ADMIN → PRODUCTION QUEUE → … → CLIENT LIBRARY */
export const INTERNAL_PIPELINE_STAGES = [
  'CUSTOMER_REQUEST',
  'ADMIN',
  'PRODUCTION_QUEUE',
  'STUDIO_ROUTING',
  'PRODUCTION',
  'QUALITY_CONTROL',
  'CLIENT_DELIVERY',
  'CLIENT_LIBRARY',
] as const;
