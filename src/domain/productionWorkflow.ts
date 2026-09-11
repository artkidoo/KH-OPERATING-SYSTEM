// ============================================================
// PHASE 3 — PRODUCTION WORKFLOW + REVISIONS + DELIVERY (additive)
// Internal states stay server-side; customers only see friendly labels.
// ============================================================

export type ProductionStage =
  | 'SUBMITTED'
  | 'REVIEWING'
  | 'APPROVED_FOR_PRODUCTION'
  | 'ASSIGNED'
  | 'IN_PRODUCTION'
  | 'INTERNAL_QC'
  | 'CLIENT_REVIEW'
  | 'REVISION'
  | 'FINAL_APPROVAL'
  | 'DELIVERY'
  | 'LIBRARY'
  | 'COMPLETED'
  | 'CANCELLED';

export const PRODUCTION_ORDER: ProductionStage[] = [
  'SUBMITTED', 'REVIEWING', 'APPROVED_FOR_PRODUCTION', 'ASSIGNED',
  'IN_PRODUCTION', 'INTERNAL_QC', 'CLIENT_REVIEW', 'REVISION',
  'FINAL_APPROVAL', 'DELIVERY', 'LIBRARY', 'COMPLETED',
];

/** What the customer sees — internal complexity is never exposed. */
export function customerLabelFor(stage: string): string {
  switch (stage) {
    case 'SUBMITTED': return 'Submitted';
    case 'REVIEWING': return 'Reviewing';
    case 'APPROVED_FOR_PRODUCTION':
    case 'ASSIGNED':
    case 'IN_PRODUCTION': return 'In Production';
    case 'INTERNAL_QC':
    case 'CLIENT_REVIEW': return 'Review';
    case 'REVISION': return 'Revision Requested';
    case 'FINAL_APPROVAL':
    case 'DELIVERY': return 'Ready';
    case 'LIBRARY':
    case 'COMPLETED': return 'Completed';
    case 'CANCELLED': return 'Cancelled';
    case 'IN_REVIEW': return 'Review';
    case 'REVISION_REQUESTED': return 'Revision Requested';
    case 'READY_FOR_DELIVERY': return 'Ready';
    case 'DELIVERED': return 'Delivered';
    default: return stage.replaceAll('_', ' ');
  }
}

const NEXT: Record<string, ProductionStage[]> = {
  SUBMITTED: ['REVIEWING', 'CANCELLED'],
  REVIEWING: ['APPROVED_FOR_PRODUCTION', 'CANCELLED'],
  APPROVED_FOR_PRODUCTION: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PRODUCTION', 'CANCELLED'],
  IN_PRODUCTION: ['INTERNAL_QC', 'CANCELLED'],
  INTERNAL_QC: ['CLIENT_REVIEW', 'IN_PRODUCTION'],
  CLIENT_REVIEW: ['REVISION', 'FINAL_APPROVAL', 'CANCELLED'],
  REVISION: ['IN_PRODUCTION', 'CANCELLED'],
  FINAL_APPROVAL: ['DELIVERY', 'CANCELLED'],
  DELIVERY: ['LIBRARY'],
  LIBRARY: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

export function canAdvanceProduction(from: string, to: string): boolean {
  return (NEXT[from] ?? []).includes(to as ProductionStage);
}

export interface RevisionRecord {
  requestId: string;
  revisionNumber: number;
  reason: string;
  instructions: string;
  previousDeliverableId?: string;
  newDeliverableId?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
  resolvedAt?: string;
}

/** Guard against infinite revision loops: cap per plan tier. */
export function revisionLimitForPlan(plan: string): number {
  return plan.endsWith('_pro') ? 5 : 2;
}

export function canRequestRevision(plan: string, used: number): boolean {
  return used < revisionLimitForPlan(plan);
}
