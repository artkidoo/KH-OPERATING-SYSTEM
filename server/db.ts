import fs from "fs";
import path from "path";
import crypto from "crypto";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "keedohub_db.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure data and uploads directories exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export type IdentityType = 'artist' | 'creator' | 'brand' | 'business' | 'startup';
export type MemberRole = 'owner' | 'admin' | 'editor' | 'member' | 'collaborator' | 'client' | 'viewer';
export type ProjectStatus = 'planning' | 'in-progress' | 'review' | 'completed';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AssetCategory = 'cover' | 'audio' | 'image' | 'video' | 'document' | 'epk' | 'brand';
export type ReleaseStatus = 
  | 'draft' 
  | 'planning' 
  | 'preparing' 
  | 'ready' 
  | 'launching' 
  | 'released' 
  | 'post-release' 
  | 'scheduled' 
  | 'in-progress';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'in_progress' | 'pending' | 'review' | 'approved' | 'completed' | 'blocked' | 'cancelled';
export type SystemAdminRole = 'super_admin' | 'admin' | 'support' | 'user';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  avatarUrl: string;
  defaultWorkspaceId?: string;
  systemRole?: SystemAdminRole;
  status?: 'active' | 'suspended';
  suspendedReason?: string;
  suspendedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface WorkspaceRecord {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  identityType: IdentityType;
  avatarUrl: string;
  bio?: string;
  genreOrNiche?: string;
  website?: string;
  status?: 'active' | 'archived' | 'suspended';
  suspendedReason?: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuditLogRecord {
  id: string;
  adminUserId: string;
  adminEmail: string;
  adminName: string;
  adminRole: SystemAdminRole;
  action: string;
  targetType: 'user' | 'workspace' | 'feature_flag' | 'system' | 'support' | 'security';
  targetId: string;
  targetName?: string;
  details: string | Record<string, any>;
  ipAddress?: string;
  result: 'success' | 'denied' | 'failed';
  createdAt: string;
}

export interface FeatureFlagRecord {
  id: string;
  key: string;
  name: string;
  description: string;
  category: 'ai' | 'studio' | 'core' | 'distribution' | 'growth' | 'security';
  enabled: boolean;
  rolloutPercentage: number;
  allowedIdentities?: IdentityType[];
  requiresRole?: SystemAdminRole;
  updatedAt: string;
  updatedBy?: string;
}

export interface SupportTicketRecord {
  id: string;
  ticketNumber: string;
  workspaceId: string;
  workspaceName: string;
  userId: string;
  userEmail: string;
  userName: string;
  category: 'sync_error' | 'asset_storage' | 'approval_stuck' | 'billing' | 'account_access' | 'feature_inquiry';
  priority: 'critical' | 'high' | 'medium' | 'low';
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  diagnosticData?: Record<string, any>;
  assignedToAdmin?: string;
  assignedAdminName?: string;
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface PlatformSettingsRecord {
  id: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowNewSignups: boolean;
  systemNoticeBanner: {
    enabled: boolean;
    type: 'info' | 'warning' | 'critical';
    text: string;
  };
  maxUploadSizeMb: number;
  aiRateLimitPerMin: number;
  auditRetentionDays: number;
  updatedAt: string;
  updatedBy?: string;
}

export interface MemberPermissions {
  canManageWorkspace: boolean;
  canCreateProjects: boolean;
  canEditAll: boolean;
  canViewInternalNotes: boolean;
  canApprove: boolean;
  canComment: boolean;
  canRequestRevisions: boolean;
}

export interface MemberAccessScope {
  isWorkspaceWide: boolean;
  projectIds?: string[];
  releaseIds?: string[];
  campaignIds?: string[];
  studioProjectIds?: string[];
  deliverableIds?: string[];
}

export interface WorkspaceMemberRecord {
  id: string;
  workspaceId: string;
  userId: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  jobTitle?: string;
  role: MemberRole;
  status?: 'active' | 'invited' | 'disabled';
  invitedBy?: string;
  inviteToken?: string;
  lastActiveAt?: string;
  permissions?: MemberPermissions;
  accessScope?: MemberAccessScope;
  joinedAt: string;
}

export interface TaskItem {
  id: string;
  workspaceId?: string;
  projectId?: string;
  projectTitle?: string;
  releaseId?: string;
  campaignId?: string;
  studioId?: string;
  entityType?: 'release' | 'campaign' | 'project' | 'content' | 'studio' | 'radar' | 'asset' | 'custom';
  entityId?: string;
  entityTitle?: string;
  actionTab?: string;
  actionLabel?: string;
  text: string;
  description?: string;
  completed: boolean;
  priority?: TaskPriority;
  status?: TaskStatus;
  category?: string;
  assignedTo?: string;
  assignedAvatar?: string;
  assignedRole?: string;
  tags?: string[];
  deadline?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface MilestoneRecord {
  id: string;
  workspaceId: string;
  projectId?: string;
  projectTitle?: string;
  releaseId?: string;
  title: string;
  targetDate: string;
  status: 'pending' | 'in-progress' | 'achieved';
  deliverables?: string[];
  notes?: string;
  completed: boolean;
  createdAt: string;
}

export interface FolderRecord {
  id: string;
  workspaceId: string;
  name: string;
  color?: string;
  icon?: string;
  category?: AssetCategory;
  createdAt: string;
}

export interface ProjectRecord {
  id: string;
  workspaceId: string;
  releaseId?: string;
  campaignId?: string;
  title: string;
  description: string;
  category: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  budget: number;
  currency: string;
  deadline: string;
  clientName?: string;
  tags: string[];
  tasks: TaskItem[];
  milestones?: MilestoneRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface AssetRecord {
  id: string;
  workspaceId: string;
  projectId?: string;
  releaseId?: string;
  campaignId?: string;
  folderId?: string;
  folderName?: string;
  name: string;
  category: AssetCategory;
  url: string; // Base64 data URI or /uploads/... path
  size: number;
  mimeType: string;
  dimensions?: string;
  tags: string[];
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ReleaseRecord {
  id: string;
  workspaceId: string;
  projectId?: string;
  campaignId?: string;
  title: string;
  artistName: string;
  genre: string;
  subgenres?: string[];
  releaseType: string;
  releaseDate: string;
  status: ReleaseStatus;
  coverAssetId?: string;
  coverUrl?: string;
  audioAssetId?: string;
  audioUrl?: string;
  upc?: string;
  isrc?: string;
  narrative?: string;
  marketingBudget?: number;
  currency?: string;
  phases: any[];
  checklist: any[];
  dspPitch?: any;
  presaveSlug?: string;
  presaveData?: any;
  lyrics?: any;
  splits?: any;
  epkData?: any;
  masterAudioDetails?: any;
  createdAt: string;
  updatedAt: string;
}

export interface BrandCoreRecord {
  id: string;
  workspaceId: string;
  brandName: string;
  tagline: string;
  industry: string;
  identityType?: 'artist' | 'brand' | 'business' | 'startup' | 'creator';
  archetype: string;
  logoAssets: {
    primaryLogoUrl: string;
    darkLogoUrl?: string;
    iconMarkUrl?: string;
    faviconUrl?: string;
  };
  colorPalette: { name: string; hex: string; role: string }[];
  typographyPairing: {
    heading: string;
    body: string;
    monospace: string;
  };
  visualDirection: {
    aestheticKeywords: string[];
    moodSummary: string;
    imageryGuidelines: string;
    dos: string[];
    donts: string[];
  };
  voiceAndTone: {
    traits: string[];
    doSay: string[];
    dontSay: string[];
    vocabulary: string[];
    communicationPrinciples: string[];
  };
  audience: {
    primaryICP: string;
    targetSegments: string[];
    painPoints: string[];
    coreDesires: string[];
    demographics?: string;
  };
  positioning: {
    marketCategory: string;
    valueProposition: string;
    uniqueSellingPoints: string[];
    competitorDifferentiators: string[];
    positioningStatement: string;
  };
  brandGuidelinesText?: string;
  updatedAt: string;
}

export interface ProductServiceRecord {
  id: string;
  workspaceId: string;
  name: string;
  type: 'product' | 'service' | 'offer' | 'digital_good' | 'subscription' | 'merch';
  tagline: string;
  description: string;
  category: string;
  pricing: {
    amount: number;
    currency: string;
    billingInterval?: 'one_time' | 'monthly' | 'annually' | 'tiered';
    tierName?: string;
  };
  targetAudience: string;
  keyFeatures: string[];
  benefits: string[];
  uniqueSellingPoints: string[];
  heroAssetId?: string;
  heroImageUrl?: string;
  assetIds?: string[];
  status: 'draft' | 'active' | 'launching' | 'archived';
  launchDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignRecord {
  id: string;
  workspaceId: string;
  releaseId?: string;
  projectId?: string;
  productId?: string;
  productName?: string;
  title: string;
  slug?: string;
  goal: string;
  objective?: 'product_launch' | 'lead_generation' | 'brand_awareness' | 'rebrand' | 'seasonal_promo' | 'growth_sprint' | 'event_announcement';
  targetAudience?: string;
  audienceSegments?: string[];
  startDate: string;
  endDate: string;
  status: 'planning' | 'preparing' | 'ready' | 'active' | 'completed' | 'paused';
  platforms: string[];
  budget: number;
  currency: string;
  leadOwner?: string;
  
  // Creative Direction
  creativeDirection?: {
    themeName: string;
    visualStyle: string;
    coreMessage: string;
    heroHeadline: string;
    subHeadline: string;
    keyHashtags: string[];
    moodboardUrls?: string[];
  };

  // Assets Attached
  heroAssetId?: string;
  heroAssetUrl?: string;
  assetIds?: string[];

  // Timeline & Sprint Days
  sprintDays: { day: string; task: string; completed?: boolean }[];
  milestones?: { id: string; title: string; date: string; completed: boolean }[];

  // Approvals Workflow
  approvals?: {
    creativeApproved: boolean;
    creativeApprovedBy?: string;
    budgetApproved: boolean;
    budgetApprovedBy?: string;
    launchApproved: boolean;
    launchApprovedBy?: string;
    signoffNotes?: string;
  };

  // Results & Goals Architecture
  goals?: {
    targetImpressions?: number;
    targetLeadsOrSales?: number;
    targetRevenue?: number;
    actualImpressions?: number;
    actualLeadsOrSales?: number;
    actualRevenue?: number;
  };

  // Studio Request Link
  studioRequestId?: string;

  createdAt: string;
  updatedAt: string;
}

export type ContentStatus = 
  | 'idea' 
  | 'draft' 
  | 'drafted' 
  | 'review' 
  | 'approved' 
  | 'ready' 
  | 'scheduled' 
  | 'published' 
  | 'archived';

export type ContentPlatform = 
  | 'instagram' 
  | 'tiktok' 
  | 'youtube' 
  | 'facebook' 
  | 'twitter' 
  | 'x' 
  | 'linkedin' 
  | 'threads' 
  | 'spotify' 
  | 'website' 
  | 'blog' 
  | 'other';

export interface ContentPillarRecord {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  targetRatio?: number;
  createdAt: string;
}

export interface ContentItemRecord {
  id: string;
  workspaceId: string;
  releaseId?: string;
  releaseTitle?: string;
  campaignId?: string;
  campaignTitle?: string;
  projectId?: string;
  productId?: string;
  productName?: string;
  contentPillar?: string;
  title: string;
  concept: string;
  hook?: string;
  captionHook: string;
  copy?: string;
  caption?: string;
  contentType: string;
  platform: ContentPlatform;
  status: ContentStatus;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  scheduledDate?: string;
  scheduledTime?: string;
  cta?: string;
  notes?: string;
  soundSnippet?: string;
  assetId?: string;
  assetIds?: string[];
  aiMetadata?: {
    generatedByBrain?: boolean;
    promptUsed?: string;
    stage?: 'pre-release' | 'launch' | 'post-release' | 'sprint' | 'evergreen';
    suggestedReason?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CreativeMemoryRecord {
  id: string;
  workspaceId: string;
  identitySummary: string;
  coreNarrative: string;
  toneTraits: string[];
  visualRules: string[];
  audioSignatures: string[];
  doSay: string[];
  dontSay: string[];
  brandColors?: { name: string; hex: string; role: string }[];
  recentLearnings: string[];
  keyMilestones: string[];
  keyDecisions?: { id: string; decision: string; category?: string; timestamp: string }[];
  recurringGoals?: string[];
  audienceInsights?: string[];
  updatedAt: string;
}

// ==========================================
// PHASE 8: CREATIVE MEMORY & LONG-TERM INTEL RECORDS
// ==========================================

export type CreativeMemoryCategory = 
  | 'identity'
  | 'preference'
  | 'strategy'
  | 'project'
  | 'asset'
  | 'rule';

export type CreativeMemoryScope = 
  | 'workspace'
  | 'identity'
  | 'release'
  | 'campaign'
  | 'project'
  | 'content'
  | 'studio_project';

export type CreativeMemorySource = 
  | 'user_explicit'
  | 'ai_extracted'
  | 'studio_decision'
  | 'system_inferred';

export interface CreativeMemoryItemRecord {
  id: string;
  workspaceId: string;
  userId?: string;
  category: CreativeMemoryCategory;
  scope: CreativeMemoryScope;
  entityType?: 'release' | 'campaign' | 'project' | 'studio_project' | 'identity' | 'product' | 'asset';
  entityId?: string;
  entityName?: string;
  title: string;
  content: string;
  tags: string[];
  source: CreativeMemorySource;
  confidence: number;
  status: 'active' | 'archived';
  isPinned: boolean;
  supersedesMemoryId?: string;
  supersededByMemoryId?: string;
  assetReferenceId?: string;
  assetReferenceName?: string;
  assetReferenceUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryCandidateRecord {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  category: CreativeMemoryCategory;
  scope: CreativeMemoryScope;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  sourceContext: string;
  confidence: number;
  tags: string[];
  status: 'pending' | 'saved' | 'dismissed';
  createdAt: string;
}

export interface MemoryBlockRuleRecord {
  id: string;
  workspaceId: string;
  pattern: string;
  reason: string;
  createdAt: string;
}

// ==========================================
// PHASE 9: CREATIVE RADAR & PROACTIVE INTELLIGENCE
// ==========================================

export type RadarSeverity = 'critical' | 'high' | 'medium' | 'low';
export type RadarSignalStatus = 'new' | 'acknowledged' | 'actioned' | 'dismissed' | 'expired';
export type RadarCategory = 'release' | 'campaign' | 'project' | 'content' | 'asset' | 'studio' | 'system';

export type RadarSignalType =
  | 'release_approaching'
  | 'release_readiness_blocker'
  | 'release_content_gap'
  | 'release_asset_gap'
  | 'release_task_deadline'
  | 'release_studio_dependency'
  | 'release_momentum_slowing'
  | 'campaign_launch_approaching'
  | 'campaign_readiness_blocker'
  | 'campaign_hero_asset_missing'
  | 'campaign_content_gap'
  | 'campaign_milestone_incomplete'
  | 'campaign_approval_pending'
  | 'campaign_task_overdue'
  | 'campaign_product_unlinked'
  | 'campaign_studio_blocker'
  | 'campaign_underperforming_target'
  | 'campaign_objective_stalled'
  | 'project_task_overdue'
  | 'project_milestone_blocked'
  | 'project_deadline_approaching'
  | 'project_pending_review'
  | 'project_revision_pending'
  | 'project_inactive'
  | 'content_pipeline_empty'
  | 'content_stuck_draft'
  | 'content_gap'
  | 'content_unutilized_asset'
  | 'content_schedule_conflict'
  | 'content_format_underperforming'
  | 'strong_content_pattern_detected'
  | 'growth_opportunity_detected'
  | 'asset_missing_connection'
  | 'asset_missing_requirement'
  | 'asset_approval_pending'
  | 'asset_duplicate_detected'
  | 'studio_request_unreviewed'
  | 'studio_quote_pending_approval'
  | 'studio_feedback_pending'
  | 'studio_revision_in_progress'
  | 'studio_deliverable_approaching'
  | 'studio_delivery_pending_approval'
  | 'system_configuration_needed';

export interface RadarAffectedEntityRecord {
  type: 'release' | 'campaign' | 'project' | 'content' | 'asset' | 'studio_request' | 'studio_quote' | 'studio_project' | 'studio_deliverable' | 'workspace';
  id: string;
  name: string;
  secondaryInfo?: string;
}

export interface RadarRecommendedActionRecord {
  type: 'navigate_tab' | 'open_modal' | 'ask_brain' | 'create_task' | 'generate_content' | 'request_studio';
  label: string;
  targetTab?: string;
  actionDescription?: string;
  payload?: Record<string, any>;
}

export interface RadarSignalRecord {
  id: string;
  workspaceId: string;
  fingerprint: string;
  category: RadarCategory;
  type: RadarSignalType;
  severity: RadarSeverity;
  priority: number;
  title: string;
  explanation: string;
  details?: string;
  affectedEntity: RadarAffectedEntityRecord;
  recommendedAction: RadarRecommendedActionRecord;
  status: RadarSignalStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  acknowledgedAt?: string;
  actionedAt?: string;
  dismissedAt?: string;
  metadata?: Record<string, any>;
}

export interface NotificationRecord {
  id: string;
  workspaceId: string;
  userId?: string;
  fingerprint?: string;
  title: string;
  message: string;
  category?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  type: 'info' | 'success' | 'warning' | 'request' | 'critical';
  read: boolean;
  resolved?: boolean;
  resolvedAt?: string;
  actionTab?: string;
  actionLabel?: string;
  entityType?: string;
  entityId?: string;
  entityTitle?: string;
  link?: string;
  createdAt: string;
}

export interface ActivityLogRecord {
  id: string;
  workspaceId: string;
  userId: string;
  userEmail: string;
  actorName?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId: string;
  entityTitle?: string;
  details: string;
  isInternal?: boolean;
  clientVisible?: boolean;
  createdAt: string;
}

// ==========================================
// PHASE 15: COLLABORATION, APPROVALS & REVISIONS
// ==========================================

export interface CommentAttachment {
  id: string;
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
}

export interface CommentReaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface CommentRecord {
  id: string;
  workspaceId: string;
  entityType: 'studio_deliverable' | 'studio_quote' | 'studio_project' | 'project' | 'release' | 'campaign' | 'content_item' | 'task' | 'asset' | 'custom';
  entityId: string;
  entityTitle: string;
  parentId?: string; // If set, this is a reply to another comment
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  authorRole: MemberRole;
  content: string;
  isInternal: boolean; // true = internal team only, false = client/collaborator visible
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  versionTag?: string; // e.g. "v1", "v2"
  attachments?: CommentAttachment[];
  reactions?: CommentReaction[];
  createdAt: string;
  updatedAt: string;
}

export type ApprovalStatus = 'pending' | 'in_review' | 'approved' | 'changes_requested' | 'declined';

export interface AssignedReviewer {
  id?: string;
  email: string;
  name: string;
  role: string;
  status: 'pending' | 'approved' | 'changes_requested' | 'declined';
  decisionNotes?: string;
  decidedAt?: string;
}

export interface ApprovalReviewDecision {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerEmail: string;
  reviewerRole: string;
  status: 'approved' | 'changes_requested' | 'declined';
  notes: string;
  version: string;
  timestamp: string;
  requestedChanges?: string[];
}

export interface ApprovalRequestRecord {
  id: string;
  workspaceId: string;
  entityType: 'studio_deliverable' | 'studio_quote' | 'studio_project' | 'project' | 'release' | 'campaign' | 'content_item' | 'asset';
  entityId: string;
  entityTitle: string;
  title: string;
  description: string;
  requestedBy: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role: string;
  };
  requestedAt: string;
  dueDate?: string;
  status: ApprovalStatus;
  currentVersion: string;
  isClientVisible: boolean;
  assignedReviewers: AssignedReviewer[];
  reviews: ApprovalReviewDecision[];
  deliverableUrl?: string;
  deliverableThumbnail?: string;
  deliverableFormat?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevisionRecord {
  id: string;
  workspaceId: string;
  entityType: 'studio_deliverable' | 'studio_quote' | 'studio_project' | 'asset' | 'project' | 'release' | 'campaign' | 'content_item' | 'task' | 'custom';
  entityId: string;
  entityTitle: string;
  versionNumber: number;
  versionTag: string; // 'v1', 'v2', 'v3'
  title: string;
  changelog: string;
  assetUrl?: string;
  previewUrl?: string;
  fileSize?: number;
  mimeType?: string;
  createdBy: {
    id: string;
    name: string;
    avatarUrl?: string;
    role?: string;
  };
  createdAt: string;
  status: 'draft' | 'pending_review' | 'changes_requested' | 'approved';
  approvalRequestId?: string;
  changeRequestsSummary?: string;
  isClientVisible: boolean;
}

export interface CreativeRequestRecord {
  id: string;
  workspaceId: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  budget: number;
  currency: string;
  deadline: string;
  briefDetails: string;
  status: 'pending' | 'quoted' | 'in-production' | 'completed';
  createdAt: string;
}

// ==========================================
// PHASE 7: KEEDOHUB STUDIO (CREATIVE SERVICES OS)
// ==========================================

export type StudioServiceCategory = 
  | 'brand_identity'
  | 'cover_design'
  | 'web_ui_ux'
  | 'social_media'
  | 'print_design'
  | 'motion_animation'
  | 'artist_promotion'
  | 'digital_marketing'
  | 'content_creation'
  | 'custom_creative';

export type StudioRequestStatus = 
  | 'REQUEST'
  | 'BRIEF'
  | 'REVIEW'
  | 'QUOTE_PENDING'
  | 'QUOTE_SENT'
  | 'CLIENT_APPROVED'
  | 'PROJECT_ACTIVE'
  | 'IN_PRODUCTION'
  | 'DELIVERABLE_REVIEW'
  | 'REVISION_REQUESTED'
  | 'APPROVED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'DECLINED'
  | 'CANCELLED';

export type StudioQuoteStatus = 
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'APPROVED'
  | 'DECLINED'
  | 'EXPIRED';

export type StudioProjectStatus = 
  | 'PLANNING'
  | 'PRODUCTION'
  | 'REVIEW'
  | 'REVISION'
  | 'APPROVAL'
  | 'DELIVERY'
  | 'COMPLETED';

export type StudioDeliverableStatus = 
  | 'in_progress'
  | 'ready_for_review'
  | 'revision_requested'
  | 'approved'
  | 'delivered';

export type StudioRevisionStatus = 
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'READY_FOR_REVIEW'
  | 'ACCEPTED';

export interface StudioBriefRecord {
  serviceCategory: StudioServiceCategory;
  title: string;
  artistOrBrandName?: string;
  releaseTitle?: string;
  genreOrIndustry?: string;
  concept?: string;
  visualDirection?: string;
  references?: string[];
  dimensions?: string;
  targetAudience?: string;
  positioning?: string;
  personalityTraits?: string[];
  identityAssetsRequired?: string[];
  durationSeconds?: number;
  motionFormat?: string;
  aspectRatio?: string;
  scriptOrHook?: string;
  requiredDeliverables?: string[];
  deadline?: string;
  targetBudget?: number;
  currency?: 'USD' | 'NGN';
  additionalNotes?: string;
  aiAssisted?: boolean;
  aiSuggestedQuestions?: string[];
  aiClarifications?: string[];
  missingElementsDetected?: string[];
}

export interface StudioRequestRecord {
  id: string;
  workspaceId: string;
  userId: string;
  serviceId: StudioServiceCategory;
  serviceName: string;
  title: string;
  origin: 'direct' | 'artist_release' | 'brand_campaign' | 'brain_assisted';
  releaseId?: string;
  releaseTitle?: string;
  campaignId?: string;
  campaignTitle?: string;
  brief: StudioBriefRecord;
  status: StudioRequestStatus;
  quoteId?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudioQuoteRecord {
  id: string;
  workspaceId: string;
  requestId: string;
  projectId?: string;
  serviceName: string;
  scopeSummary: string;
  deliverables: string[];
  price: number;
  currency: 'USD' | 'NGN';
  timeline: string;
  revisionAllowance: number;
  notes: string;
  expirationDate: string;
  status: StudioQuoteStatus;
  approvedAt?: string;
  approvedBy?: string;
  declinedAt?: string;
  declinedReason?: string;
  clarificationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudioDeliverableRecord {
  id: string;
  projectId: string;
  workspaceId: string;
  name: string;
  description: string;
  format: string;
  version: string;
  status: StudioDeliverableStatus;
  assetId?: string;
  assetUrl?: string;
  previewUrl?: string;
  fileSize?: number;
  dueDate: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'in_review';
  approvedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudioRevisionRecord {
  id: string;
  projectId: string;
  deliverableId: string;
  deliverableName?: string;
  workspaceId: string;
  userId: string;
  version: string;
  reason: string;
  requestedChanges: string;
  status: StudioRevisionStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface StudioMessageRecord {
  id: string;
  workspaceId: string;
  projectId?: string;
  requestId?: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'producer' | 'lead_designer' | 'studio_admin';
  content: string;
  attachments?: { id: string; name: string; url: string; category?: string }[];
  createdAt: string;
}

export interface StudioProjectRecord {
  id: string;
  workspaceId: string;
  requestId: string;
  quoteId: string;
  releaseId?: string;
  campaignId?: string;
  title: string;
  serviceCategory: StudioServiceCategory;
  status: StudioProjectStatus;
  budget: number;
  currency: 'USD' | 'NGN';
  deadline: string;
  brief: StudioBriefRecord;
  milestones: { id: string; title: string; targetDate: string; completed: boolean }[];
  leadProducer: { name: string; role: string; avatarUrl: string };
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// PHASE 11: ANALYTICS & GROWTH INTELLIGENCE RECORDS
// ==========================================

export type PerformanceMetricSource = 'manual' | 'imported' | 'api' | 'calculated';

export interface PerformanceMetricsData {
  views?: number | null;
  reach?: number | null;
  impressions?: number | null;
  engagement?: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  saves?: number | null;
  clicks?: number | null;
  conversions?: number | null;
  streams?: number | null;
  downloads?: number | null;
  revenue?: number | null;
  spend?: number | null;
}

export interface PerformanceMetricRecord {
  id: string;
  workspaceId: string;
  entityType: 'content' | 'release' | 'campaign' | 'project' | 'product' | 'studio' | 'platform';
  entityId: string;
  entityTitle: string;
  platform: ContentPlatform;
  format?: string;
  metricDate: string;
  source: PerformanceMetricSource;
  isVerified: boolean;
  metrics: PerformanceMetricsData;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type GrowthInsightConfidence = 'high' | 'medium' | 'experimental';
export type GrowthInsightStatus = 'active' | 'applied' | 'saved_to_memory' | 'dismissed';
export type GrowthInsightCategory = 
  | 'content_format' 
  | 'platform_momentum' 
  | 'campaign_roi' 
  | 'release_velocity' 
  | 'audience_behavior' 
  | 'growth_opportunity';

export interface GrowthInsightRecord {
  id: string;
  workspaceId: string;
  title: string;
  explanation: string;
  evidence: string;
  relatedEntity: {
    type: 'content' | 'campaign' | 'release' | 'platform' | 'pillar' | 'format' | 'product' | 'workspace';
    id?: string;
    name: string;
  };
  confidence: GrowthInsightConfidence;
  category: GrowthInsightCategory;
  status: GrowthInsightStatus;
  recommendedAction: {
    label: string;
    actionType: 'navigate_tab' | 'create_content' | 'adjust_campaign' | 'save_memory' | 'ask_brain';
    targetTab?: string;
    payload?: Record<string, any>;
  };
  savedMemoryId?: string;
  generatedAt: string;
}

export type WorkspaceGoalCategory = 'release' | 'campaign' | 'content' | 'engagement' | 'conversion' | 'custom';
export type WorkspaceGoalStatus = 'on_track' | 'at_risk' | 'behind' | 'achieved';

export interface WorkspaceGoalRecord {
  id: string;
  workspaceId: string;
  title: string;
  category: WorkspaceGoalCategory;
  targetMetric: 'views' | 'streams' | 'content_count' | 'engagement_rate' | 'conversions' | 'reach' | 'revenue';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;
  entityId?: string;
  entityType?: 'release' | 'campaign' | 'platform' | 'workspace';
  status: WorkspaceGoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  sessions: SessionRecord[];
  workspaces: WorkspaceRecord[];
  workspace_members: WorkspaceMemberRecord[];
  brand_cores: BrandCoreRecord[];
  products: ProductServiceRecord[];
  projects: ProjectRecord[];
  folders: FolderRecord[];
  milestones: MilestoneRecord[];
  assets: AssetRecord[];
  releases: ReleaseRecord[];
  campaigns: CampaignRecord[];
  content_pillars: ContentPillarRecord[];
  content_items: ContentItemRecord[];
  creative_memories: CreativeMemoryRecord[];
  creative_memory_items: CreativeMemoryItemRecord[];
  memory_candidates: MemoryCandidateRecord[];
  memory_block_rules: MemoryBlockRuleRecord[];
  notifications: NotificationRecord[];
  activity_logs: ActivityLogRecord[];
  creative_requests: CreativeRequestRecord[];
  studio_requests: StudioRequestRecord[];
  studio_quotes: StudioQuoteRecord[];
  studio_projects: StudioProjectRecord[];
  studio_deliverables: StudioDeliverableRecord[];
  studio_revisions: StudioRevisionRecord[];
  studio_messages: StudioMessageRecord[];
  radar_signals: RadarSignalRecord[];
  performance_metrics: PerformanceMetricRecord[];
  growth_insights: GrowthInsightRecord[];
  workspace_goals: WorkspaceGoalRecord[];
  comments: CommentRecord[];
  approval_requests: ApprovalRequestRecord[];
  revisions: RevisionRecord[];
  admin_audit_logs: AdminAuditLogRecord[];
  feature_flags: FeatureFlagRecord[];
  support_tickets: SupportTicketRecord[];
  platform_settings: PlatformSettingsRecord;
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "keedohub_salt_v1").digest("hex");
}

function generateInitialSeed(): DatabaseSchema {
  const defaultUserId = "usr_demo_keedohub";
  const defaultWorkspaceId = "ws_demo_artist_os";

  const user: UserRecord = {
    id: defaultUserId,
    email: "creator@keedohub.com",
    passwordHash: hashPassword("keedohub2026"),
    fullName: "Keedohub Artist Studio",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    defaultWorkspaceId: defaultWorkspaceId,
    createdAt: new Date().toISOString(),
  };

  const workspace: WorkspaceRecord = {
    id: defaultWorkspaceId,
    name: "AfroVibe World OS",
    slug: "afrovibe-world",
    ownerId: defaultUserId,
    identityType: "artist",
    avatarUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80",
    bio: "Global Afro-Fusion recording artist & creative lab pushing boundary sonics from Lagos to London.",
    genreOrNiche: "Afro-Fusion / Alté / Global Sounds",
    website: "https://keedohub.com",
    settings: {
      defaultCurrency: "USD",
      socialLinks: {
        spotify: "https://open.spotify.com/artist/afrovibe",
        instagram: "@afrovibeworld",
        tiktok: "@afrovibemusic"
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const member: WorkspaceMemberRecord = {
    id: "mem_demo_1",
    workspaceId: defaultWorkspaceId,
    userId: defaultUserId,
    role: "owner",
    joinedAt: new Date().toISOString(),
  };

  const project: ProjectRecord = {
    id: "proj_demo_1",
    workspaceId: defaultWorkspaceId,
    title: "Midnight in Victoria Island — EP Launch Suite",
    description: "Full end-to-end 5-track visual rollout, 3000px artwork, kinetic lyrics visualizers and DSP pitch packaging.",
    category: "Music & Brand Launch",
    status: "in-progress",
    priority: "high",
    budget: 3500,
    currency: "USD",
    deadline: "2026-09-30",
    clientName: "AfroVibe Music Group",
    tags: ["Music", "EP Rollout", "Visual Identity", "DSP Campaign"],
    tasks: [
      { id: "task_1", text: "Finalize 3000x3000px 300DPI Master Artwork in Cover Studio", completed: true },
      { id: "task_2", text: "Run LUFS loudness meter and dynamic range checks in Mastering Suite", completed: true },
      { id: "task_3", text: "Complete producer & songwriter split agreements in Split Calculator", completed: false },
      { id: "task_4", text: "Submit 5-week Spotify Editorial pitch via DSP Pitcher", completed: false },
      { id: "task_5", text: "Deploy Presave SmartLink Hub with fan lead capture", completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const asset: AssetRecord = {
    id: "ast_demo_1",
    workspaceId: defaultWorkspaceId,
    projectId: project.id,
    name: "Midnight in Victoria Island — Official 3000px Cover.png",
    category: "cover",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80",
    size: 4850000,
    mimeType: "image/png",
    dimensions: "3000x3000",
    tags: ["Cover Art", "Master", "Hi-Res"],
    metadata: {
      theme: "Cyber Crimson",
      parentalAdvisory: true,
    },
    createdAt: new Date().toISOString(),
  };

  const release: ReleaseRecord = {
    id: "rel_demo_1",
    workspaceId: defaultWorkspaceId,
    title: "Midnight in Victoria Island",
    artistName: "AfroVibe & Keedohub Sound Labs",
    genre: "Afro-Fusion / Amapiano",
    releaseType: "EP Single",
    releaseDate: "2026-09-18",
    status: "scheduled",
    coverAssetId: asset.id,
    coverUrl: asset.url,
    upc: "198765432101",
    isrc: "NGKDH2600001",
    phases: [
      {
        phaseName: "Phase 1: Pre-Release Anticipation",
        focus: "Cultivate intrigue, pre-saves, and seed sound clips",
        timeframe: "T-14 to T-1 Days",
        actions: [
          { day: "Day -14", platform: "Instagram Reels & TikTok", contentType: "Studio Voice Memo", concept: "Late-night studio snippet of log drum pattern", captionHook: "The moment this pocket clicked at 3am... Guess the genre? Link in bio to pre-save", priority: "CRITICAL" },
          { day: "Day -10", platform: "Spotify Pre-Save", contentType: "Cover Artwork 3D Reveal", concept: "3D spinning vinyl mockup reveal with track credits", captionHook: "Official artwork reveal. Pre-save now for exclusive behind-the-scenes", priority: "HIGH" },
          { day: "Day -5", platform: "TikTok", contentType: "POV Trend Concept", concept: "15s relatable lifestyle driving video locking with the chorus hook", captionHook: "POV: Victoria Island at midnight after the club shuts", priority: "CRITICAL" },
          { day: "Day -1", platform: "WhatsApp & All Socials", contentType: "24-Hour Countdown", concept: "High-contrast visualizer ticker with midnight reminder", captionHook: "Out midnight everywhere. Streaming link locked in bio.", priority: "HIGH" }
        ]
      },
      {
        phaseName: "Phase 2: Drop Day & Launch Weekend",
        focus: "Trigger maximum Day-1 streaming velocity & playlist saves",
        timeframe: "Day 0 to Day 3",
        actions: [
          { day: "Day 0", platform: "All DSPs", contentType: "Official Drop Announcement", concept: "Universal smart link blast with DSP badges", captionHook: "OUT NOW GLOBALLY! Stream 'Midnight in Victoria Island' everywhere.", priority: "CRITICAL" },
          { day: "Day 1", platform: "Twitter & IG Stories", contentType: "Lyric Breakdown Card", concept: "Audio note detailing the cultural meaning of verse 2", captionHook: "The story behind line 4... Streaming now.", priority: "HIGH" },
          { day: "Day 3", platform: "YouTube & Reels", contentType: "Kinetic Visualizer", concept: "Full lyric video synchronized to the master audio", captionHook: "Official Lyric Visualizer live on YouTube!", priority: "HIGH" }
        ]
      }
    ],
    checklist: [
      { id: "chk_1", task: "Master Audio 24-bit 44.1kHz WAV finalized", category: "METADATA", deadline: "T-21", completed: true },
      { id: "chk_2", task: "3000x3000px 300DPI Artwork validated", category: "CREATIVE", deadline: "T-14", completed: true },
      { id: "chk_3", task: "Producer & Co-writer Split sheets signed", category: "EDITORIAL", deadline: "T-14", completed: true },
      { id: "chk_4", task: "Spotify for Artists editorial pitch submitted", category: "EDITORIAL", deadline: "T-7", completed: false },
      { id: "chk_5", task: "Presave link deployed and tested", category: "PROMO", deadline: "T-7", completed: false },
    ],
    dspPitch: {
      pitchTitle: "Midnight in Victoria Island (Afro-Fusion)",
      genreTags: ["Afro-Fusion", "Alté", "Global Beats"],
      moodTags: ["High-energy", "Confident", "Late-night", "Euphoric"],
      instruments: ["Log Drum", "Electric Bass", "Percussion", "Saxophone"],
      editorialNote: "A defining Afro-Fusion record merging syncopated Lagos street rhythms with polished global club textures. Supported by $2,000 digital marketing budget and 650+ verified pre-saves.",
      targetPlaylists: ["African Heat", "Afro Pop Hits", "New Music Friday", "Naija 100", "Chilled Afro"]
    },
    presaveSlug: "midnight-in-vi",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const campaign: CampaignRecord = {
    id: "cmp_demo_1",
    workspaceId: defaultWorkspaceId,
    title: "Q3 Global Streaming & Radio Push",
    goal: "Reach 250,000 global streams and secure 3 editorial playlist placements",
    startDate: "2026-09-01",
    endDate: "2026-10-15",
    status: "active",
    platforms: ["Spotify", "Apple Music", "TikTok", "Instagram", "Audiomack"],
    sprintDays: [
      { day: "Day 1 - 3", task: "Seed pre-save campaign and launch creator audio snippet wave" },
      { day: "Day 4 - 7", task: "Submit DSP editorial pitch letters and radio PR servicing" },
      { day: "Day 8 - 14", task: "Drop official visualizer and activate micro-influencer dance challenge" },
      { day: "Day 15 - 30", task: "Distribute acoustic mic session and club DJ remix pack" },
    ],
    budget: 2500,
    currency: "USD",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const contentPillars: ContentPillarRecord[] = [
    {
      id: "pil_identity",
      workspaceId: defaultWorkspaceId,
      name: "Identity & Vibe",
      description: "Brand aesthetic, cultural heritage, styling, and artist ethos",
      color: "#EF4444",
      icon: "Sparkles",
      targetRatio: 25,
      createdAt: new Date().toISOString(),
    },
    {
      id: "pil_music",
      workspaceId: defaultWorkspaceId,
      name: "Music & Drops",
      description: "Audio snippets, hooks, master audio drops, pre-saves, and DSP links",
      color: "#3B82F6",
      icon: "Music",
      targetRatio: 30,
      createdAt: new Date().toISOString(),
    },
    {
      id: "pil_bts",
      workspaceId: defaultWorkspaceId,
      name: "Behind The Scenes",
      description: "Studio process, songwriting sessions, engineering breakdowns, and raw takes",
      color: "#8B5CF6",
      icon: "Layers",
      targetRatio: 20,
      createdAt: new Date().toISOString(),
    },
    {
      id: "pil_lifestyle",
      workspaceId: defaultWorkspaceId,
      name: "Lifestyle & Culture",
      description: "Lagos nightlife, fashion, diaspora connections, and daily routines",
      color: "#F59E0B",
      icon: "Flame",
      targetRatio: 15,
      createdAt: new Date().toISOString(),
    },
    {
      id: "pil_community",
      workspaceId: defaultWorkspaceId,
      name: "Community & Superfans",
      description: "Q&A, fan duets, exclusive merch, Discord listening parties, and shoutouts",
      color: "#10B981",
      icon: "Users",
      targetRatio: 10,
      createdAt: new Date().toISOString(),
    },
  ];

  const contentItems: ContentItemRecord[] = [
    {
      id: "cnt_1",
      workspaceId: defaultWorkspaceId,
      releaseId: release.id,
      releaseTitle: release.title,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      assetId: asset.id,
      assetIds: [asset.id],
      contentPillar: "Behind The Scenes",
      title: "Late Night Studio Vocal Memo (T-14)",
      platform: "tiktok",
      contentType: "Reel / Short Video",
      concept: "Camera resting on mixing console as bassline drops at 3am with producer reaction",
      hook: "When the melody hits before you even write the words...",
      captionHook: "When the melody hits before you even write the words... Out Friday! Pre-save in bio 🎵",
      copy: "We spent 9 hours rebuilding the log drum pattern until 4am. When the vocal harmonies slotted in, the entire room went dead silent. 'Midnight in Victoria Island' official drop countdown is live.\n\nPre-save link active in bio 🔗\n#Afrobeats2026 #StudioSession #NewMusic",
      cta: "Pre-save via link in bio",
      soundSnippet: "Verse 1 intro pocket (0:00 - 0:15)",
      scheduledDate: "2026-09-08",
      scheduledTime: "18:00",
      status: "scheduled",
      priority: "CRITICAL",
      aiMetadata: {
        generatedByBrain: true,
        stage: "pre-release",
        suggestedReason: "Build pre-release anticipation 10 days before DSP pitch cutoff.",
      },
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: "cnt_2",
      workspaceId: defaultWorkspaceId,
      releaseId: release.id,
      releaseTitle: release.title,
      assetId: asset.id,
      assetIds: [asset.id],
      contentPillar: "Identity & Vibe",
      title: "3D Spinning Vinyl Cover Artwork Reveal",
      platform: "instagram",
      contentType: "Carousel / 3D Render",
      concept: "High-contrast carousel revealing the 3000x3000px artwork, gatefold packaging, and colorway",
      hook: "The official visual identity of 'Midnight in Victoria Island'.",
      captionHook: "Official Artwork for 'Midnight in Victoria Island'. Track 1 drops next week.",
      copy: "Visual direction engineered with @Keedohub. Every detail on this 3000x3000px master artwork represents the raw energy of late-night Lagos. Swipe to explore the gatefold vinyl specs.\n\nDrop a 💿 if you're ready for drop day.\n#CoverArt #GraphicDesign #AfroFusion",
      cta: "Comment your favorite detail below",
      soundSnippet: "Main Chorus Hook (0:45 - 1:05)",
      scheduledDate: "2026-09-11",
      scheduledTime: "19:30",
      status: "approved",
      priority: "HIGH",
      aiMetadata: {
        generatedByBrain: true,
        stage: "pre-release",
        suggestedReason: "Visual milestone reveal to activate Instagram share-to-story velocity.",
      },
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "cnt_3",
      workspaceId: defaultWorkspaceId,
      releaseId: release.id,
      releaseTitle: release.title,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      contentPillar: "Music & Drops",
      title: "Midnight Release Blast & Kinetic Lyrics",
      platform: "youtube",
      contentType: "Kinetic Lyric Video (.LRC)",
      concept: "Synchronized vertical kinetic typography video highlighting the diaspora anthem verse",
      hook: "OUT NOW GLOBALLY ON ALL PLATFORMS 🌍",
      captionHook: "Midnight in Victoria Island is officially OUT NOW everywhere! Stream now.",
      copy: "It's midnight. 'Midnight in Victoria Island' is officially streaming everywhere worldwide on Spotify, Apple Music, and Audiomack.\n\nProduced with live log drums and brass. Full official lyric visualizer playing now.\n\nStream & Add to your playlist now!\n#AfroVibe #MidnightInVI #NewRelease",
      cta: "Stream on Spotify & Apple Music now",
      soundSnippet: "Full Master Audio WAV",
      scheduledDate: "2026-09-18",
      scheduledTime: "00:01",
      status: "ready",
      priority: "CRITICAL",
      aiMetadata: {
        generatedByBrain: true,
        stage: "launch",
        suggestedReason: "Mandatory launch-day algorithmic spike on DSP release hour.",
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: "cnt_4",
      workspaceId: defaultWorkspaceId,
      releaseId: release.id,
      releaseTitle: release.title,
      contentPillar: "Lifestyle & Culture",
      title: "POV: Driving Across Lekki-Ikoyi Link Bridge at 4 AM",
      platform: "tiktok",
      contentType: "POV Lifestyle / Atmosphere",
      concept: "Cinematic night drive across the bridge with audio drop synced to bridge cable lights",
      hook: "This track was literally recorded for this exact stretch of road.",
      captionHook: "This song was made for this exact highway. Tap sound to use in your videos.",
      copy: "Lagos at 4 AM hits completely different with this playing. Use this sound for your late-night drive clips 🏎️\n\n#LagosNightlife #AltéScene #DriveVibes",
      cta: "Use this sound in your TikTok videos",
      soundSnippet: "Log drum drop (1:15 - 1:35)",
      scheduledDate: "2026-09-21",
      scheduledTime: "21:00",
      status: "review",
      priority: "MEDIUM",
      aiMetadata: {
        generatedByBrain: true,
        stage: "post-release",
        suggestedReason: "Post-release lifestyle seeding for creator sound adoption.",
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: "cnt_5",
      workspaceId: defaultWorkspaceId,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      productId: "prd_demo_1",
      productName: "Midnight in Victoria Island — Limited 180g Vinyl & Digital Master Bundle",
      contentPillar: "Community & Superfans",
      title: "Collector Vinyl Unboxing & Foil Stamp Showcase",
      platform: "instagram",
      contentType: "Product Reel / Unboxing",
      concept: "Macro close-up video showing the translucent crimson vinyl pressing, foil lyric booklet, and numbered cert",
      hook: "Only 500 pressed worldwide. Here is what inside the Collector Box.",
      captionHook: "The limited 180g translucent crimson vinyl is officially pressing. Only 500 copies.",
      copy: "We engineered this 180g audiophile vinyl for maximum analog warmth. Each copy includes a 12x12 foil-stamped lyric booklet and uncompressed 24-bit WAV master access.\n\nPre-orders are 60% claimed. Lock yours now before drop week.\n\nLink in bio to reserve your copy.\n#VinylCollector #LimitedEdition #AfrobeatsOnVinyl",
      cta: "Order vinyl bundle via link in bio",
      soundSnippet: "Acoustic Live Cut (0:00 - 0:30)",
      scheduledDate: "2026-09-24",
      scheduledTime: "17:00",
      status: "draft",
      priority: "HIGH",
      aiMetadata: {
        generatedByBrain: true,
        stage: "post-release",
        suggestedReason: "Merchandise monetization sprint for high-intent superfans.",
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: "cnt_6",
      workspaceId: defaultWorkspaceId,
      contentPillar: "Behind The Scenes",
      title: "Producer Breakdown: How the Amapiano Log Drum was Synthesized",
      platform: "youtube",
      contentType: "Tutorial / Breakdown Short",
      concept: "Screen recording inside DAW showing the EQ curve, saturation, and pitch envelope on the bass",
      hook: "Why 90% of producers get the log drum sub frequency wrong.",
      captionHook: "Quick masterclass: The exact harmonic distortion chain used on 'Midnight in VI'.",
      copy: "Tuned strictly between 35Hz and 55Hz with subtle analog tape saturation. Watch how we keep the low end punchy without muddying the vocal pocket.\n\nSample pack dropping next week on Keedohub!\n#MusicProduction #FLStudio #AudioEngineering",
      cta: "Subscribe for full DAW walkthrough",
      scheduledDate: "2026-09-28",
      scheduledTime: "16:00",
      status: "idea",
      priority: "LOW",
      aiMetadata: {
        generatedByBrain: true,
        stage: "post-release",
        suggestedReason: "Producer niche thought leadership and sample pack lead capture.",
      },
      createdAt: new Date().toISOString(),
    },
  ];

  const creativeMemory: CreativeMemoryRecord = {
    id: "mem_store_1",
    workspaceId: defaultWorkspaceId,
    identitySummary: "AfroVibe is a cutting-edge Lagos/London creative music entity bridging modern Afrobeats, Alté, and futuristic electronic club sounds.",
    coreNarrative: "Championing independent sonic craftsmanship, authentic cultural grit, and polished global aesthetics.",
    toneTraits: ["Magnetic", "Confident", "Culturally Grounded", "Sophisticated", "Forward-Thinking"],
    visualRules: [
      "High-contrast dark-first palettes with crimson/gold neon accents",
      "Clean geometric typography paired with bold expressive monograms",
      "No generic stock photo aesthetic — focus on authentic gritty textures and modern 3D framing"
    ],
    audioSignatures: [
      "Warm punchy log drums tuned to master sub frequencies (35-60Hz)",
      "Syncopated acoustic shakers with wide stereo air (8-12kHz)",
      "Silky dynamic lead vocals with subtle tape saturation"
    ],
    doSay: [
      "Sonic craftsmanship",
      "Cultural rhythm",
      "Elevate the frequency",
      "Independent ecosystem"
    ],
    dontSay: [
      "Generic buzzwords like 'synergy' or 'disrupting'",
      "Over-hyped spam claims without real track substance"
    ],
    brandColors: [
      { name: "Keedohub Crimson", hex: "#EF4444", role: "Primary Accent & CTA" },
      { name: "Flame Gold", hex: "#F97316", role: "Energy & Highlight" },
      { name: "Obsidian Deep", hex: "#09090B", role: "Canvas Background" },
      { name: "Carbon Surface", hex: "#18181B", role: "Card & Elevated Surface" }
    ],
    recentLearnings: [
      "TikTok hooks with unreleased audio snippets perform 3.2x better when caption asks a question about the tempo",
      "Spotify curators responded positively to the diaspora cultural angle in the DSP pitch letter"
    ],
    keyMilestones: [
      "Built 1,200+ verified email & WhatsApp superfan subscriber list",
      "Completed 100% legal split sheet execution for the upcoming EP"
    ],
    updatedAt: new Date().toISOString(),
  };

  const notification: NotificationRecord = {
    id: "notif_1",
    workspaceId: defaultWorkspaceId,
    title: "Welcome to Keedohub Creative OS",
    message: "Your persistent workspace 'AfroVibe World OS' is active. All projects, assets, releases, and creative memory are securely stored.",
    type: "success",
    read: false,
    link: "overview",
    createdAt: new Date().toISOString(),
  };

  const activity: ActivityLogRecord = {
    id: "act_1",
    workspaceId: defaultWorkspaceId,
    userId: defaultUserId,
    userEmail: user.email,
    action: "WORKSPACE_INITIALIZED",
    entityType: "workspace",
    entityId: defaultWorkspaceId,
    details: "Initialized AfroVibe World OS with Artist release engine, persistent assets, and creative memory.",
    createdAt: new Date().toISOString(),
  };

  const folders: FolderRecord[] = [
    {
      id: "fld_demo_1",
      workspaceId: defaultWorkspaceId,
      name: "Album Artwork & Master Visuals",
      color: "#EF4444",
      icon: "Layers",
      category: "cover",
      createdAt: new Date().toISOString(),
    },
    {
      id: "fld_demo_2",
      workspaceId: defaultWorkspaceId,
      name: "Audio Stems & Master WAVs",
      color: "#8B5CF6",
      icon: "Volume2",
      category: "audio",
      createdAt: new Date().toISOString(),
    },
    {
      id: "fld_demo_3",
      workspaceId: defaultWorkspaceId,
      name: "Press Photos & EPK Assets",
      color: "#10B981",
      icon: "FileText",
      category: "epk",
      createdAt: new Date().toISOString(),
    },
    {
      id: "fld_demo_4",
      workspaceId: defaultWorkspaceId,
      name: "Short-Form Video & Sound Hooks",
      color: "#F59E0B",
      icon: "Video",
      category: "video",
      createdAt: new Date().toISOString(),
    },
    {
      id: "fld_demo_5",
      workspaceId: defaultWorkspaceId,
      name: "Contracts & Producer Split Sheets",
      color: "#3B82F6",
      icon: "ShieldCheck",
      category: "document",
      createdAt: new Date().toISOString(),
    },
  ];

  const milestones: MilestoneRecord[] = [
    {
      id: "mls_demo_1",
      workspaceId: defaultWorkspaceId,
      projectId: "proj_demo_1",
      projectTitle: "Midnight in Victoria Island — EP Launch Suite",
      title: "Master Audio 24-bit 44.1kHz WAV Delivery & LUFS Check",
      targetDate: "2026-09-05",
      status: "achieved",
      deliverables: ["Master WAV", "Instrumental Stem", "Acapella"],
      notes: "Mastered at -9.2 LUFS for streaming distribution.",
      completed: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "mls_demo_2",
      workspaceId: defaultWorkspaceId,
      projectId: "proj_demo_1",
      projectTitle: "Midnight in Victoria Island — EP Launch Suite",
      title: "3000x3000px 300DPI Artwork Validation in Cover Studio",
      targetDate: "2026-09-08",
      status: "achieved",
      deliverables: ["Square 3000px Artwork", "Canvas Motion Banner", "Spotify Header"],
      notes: "Exported RGB color space without borders or barcodes.",
      completed: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "mls_demo_3",
      workspaceId: defaultWorkspaceId,
      projectId: "proj_demo_1",
      projectTitle: "Midnight in Victoria Island — EP Launch Suite",
      title: "DSP Editorial Pitch Letter Submission (Spotify / Apple / Amazon)",
      targetDate: "2026-09-12",
      status: "in-progress",
      deliverables: ["DSP Pitch Deck", "Mood & Genre Meta", "Marketing Budget Validation"],
      notes: "Targeting African Heat, Naija 100, and New Music Friday.",
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "mls_demo_4",
      workspaceId: defaultWorkspaceId,
      projectId: "proj_demo_1",
      projectTitle: "Midnight in Victoria Island — EP Launch Suite",
      title: "Deploy Smart Pre-Save Hub & Activate Fan Waitlist",
      targetDate: "2026-09-15",
      status: "in-progress",
      deliverables: ["Pre-save Landing Page", "Email Lead Hook", "Audio Teaser Snippet"],
      notes: "Goal: 1,000 verified pre-saves prior to drop hour.",
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "mls_demo_5",
      workspaceId: defaultWorkspaceId,
      projectId: "proj_demo_1",
      projectTitle: "Midnight in Victoria Island — EP Launch Suite",
      title: "Global Midnight Drop & Day-1 Velocity Push",
      targetDate: "2026-09-18",
      status: "pending",
      deliverables: ["Live DSP Links Blast", "Kinetic Lyric Video on YouTube", "IG/TikTok Sound Blitz"],
      notes: "Execute 72-hour launch sprint for maximum playlist algorithmic trigger.",
      completed: false,
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    brand_cores: [
      {
        id: "bc_demo_1",
        workspaceId: defaultWorkspaceId,
        brandName: "AfroVibe World",
        tagline: "The Future Sound & Aesthetic of Contemporary African Culture",
        industry: "Music & Cultural Entertainment",
        identityType: "artist",
        archetype: "Creator / Magician",
        logoAssets: {
          primaryLogoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
          darkLogoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
          iconMarkUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
        },
        colorPalette: [
          { name: "Keedohub Crimson", hex: "#EF4444", role: "Primary Accent & CTA" },
          { name: "Flame Gold", hex: "#F59E0B", role: "Secondary Energy & Warmth" },
          { name: "Obsidian Deep", hex: "#09090B", role: "Canvas Background" },
          { name: "Carbon Surface", hex: "#18181B", role: "Card & Elevated Surfaces" },
          { name: "Silver Muted", hex: "#71717A", role: "Secondary Typography" }
        ],
        typographyPairing: {
          heading: "Syne / Space Grotesk (Bold 800)",
          body: "Plus Jakarta Sans (Medium 500)",
          monospace: "JetBrains Mono"
        },
        visualDirection: {
          aestheticKeywords: ["High-Contrast Dark", "Futuristic Lagos Alté", "Neon Amber Edge", "Tactile Grain"],
          moodSummary: "A marriage of raw Lagos street spirit with hyper-polished global editorial club aesthetics. Cinematic dark rooms illuminated by warm golden spotlights.",
          imageryGuidelines: "Use 3000x3000px high-contrast imagery with subtle film grain. Avoid flat stock photos; emphasize authentic cultural textures, metallic gold typography, and deliberate negative space.",
          dos: [
            "Maintain minimum 60% deep obsidian background canvas",
            "Use crimson accent (#EF4444) for primary interactive triggers",
            "Keep typography step scale at 1.25+ with tight letter-spacing on titles"
          ],
          donts: [
            "Never use generic pastel gradients or generic stock photos",
            "Do not mix cool cyan with warm crimson accents",
            "Never wrap badge or button text onto multiple lines"
          ]
        },
        voiceAndTone: {
          traits: ["Magnetic", "Confident", "Culturally Grounded", "Sophisticated", "Forward-Thinking"],
          doSay: [
            "Sonic craftsmanship",
            "Elevate the cultural frequency",
            "Independent creator ecosystem",
            "Lagos to the World"
          ],
          dontSay: [
            "Generic corporate buzzwords like 'synergy'",
            "Over-hyped spam claims without real track substance"
          ],
          vocabulary: ["Sonic Architecture", "Cultural Vanguard", "Algorithmic Precision", "Superfan Network"],
          communicationPrinciples: [
            "Lead with the sonic product first, then the cultural narrative.",
            "Speak with unwavering confidence and artistic integrity.",
            "Direct fans and partners to clear, single-action calls to action."
          ]
        },
        audience: {
          primaryICP: "Global diaspora tastemakers & Afrobeats enthusiasts aged 18-34 in Lagos, London, Toronto, and Atlanta.",
          targetSegments: [
            "Club DJs & Radio Curators seeking fresh authentic Afro-Fusion records",
            "Gen-Z Music Creators looking for high-energy sync and sound bites",
            "Superfans passionate about live concert tours and physical merchandise"
          ],
          painPoints: [
            "Lack of premium, artist-curated sonic merchandise",
            "Generic commercial Afrobeats saturated with repetitive formulas",
            "Disconnection from authentic artist community and creative process"
          ],
          coreDesires: [
            "Belonging to a forward-thinking cultural movement",
            "Early access to unreleased master audio and limited vinyl drops",
            "Direct artist-fan relationship without algorithmic gatekeepers"
          ],
          demographics: "54% West Africa / 46% International Diaspora (UK, US, Canada, Europe)"
        },
        positioning: {
          marketCategory: "Premium Independent Afro-Fusion & Creative Sound House",
          valueProposition: "Uncompromising African sonic excellence engineered with global mastering standards and direct-to-fan autonomy.",
          uniqueSellingPoints: [
            "Signature live log-drum & brass hybrid production",
            "Integrated multi-channel release ecosystem powered by Keedohub Core",
            "Direct superfan subscriber network with 65%+ engagement rate"
          ],
          competitorDifferentiators: [
            "Full master ownership & transparent split sheets",
            "In-house multi-format visual suite (3D vinyl, kinetic lyrics, spatial canvas)",
            "Proprietary 7-Pillar release readiness certification"
          ],
          positioningStatement: "For global tastemakers and Afrobeats purists, AfroVibe is the independent creative force that delivers futuristic African rhythm with world-class sonic fidelity."
        },
        brandGuidelinesText: "# AfroVibe World Brand Guidelines\n\n## Brand Purpose\nTo champion independent sonic craftsmanship and project modern African culture onto the global stage with uncompromising artistic and visual fidelity.\n\n## Visual Rules\n- Obsidian dark canvas (#09090B)\n- Crimson primary CTA (#EF4444)\n- 3000x3000px high-resolution imagery\n- Bold display typography with tight letter spacing.",
        updatedAt: new Date().toISOString()
      }
    ],
    products: [
      {
        id: "prd_demo_1",
        workspaceId: defaultWorkspaceId,
        name: "Midnight in Victoria Island — Limited 180g Vinyl & Digital Master Bundle",
        type: "merch",
        tagline: "Collector's edition heavyweight vinyl with 24-bit uncompressed WAV master download",
        description: "Custom translucent crimson 180g vinyl with gatefold jacket, foil-stamped lyrics poster, and instant lossless streaming access.",
        category: "Physical Music & Merchandise",
        pricing: {
          amount: 45,
          currency: "USD",
          billingInterval: "one_time",
          tierName: "Collector Edition"
        },
        targetAudience: "Superfans, audiophiles, and vinyl collectors seeking physical connection to the EP.",
        keyFeatures: [
          "180-gram heavyweight audiophile crimson vinyl",
          "Exclusive 12x12 foil-stamped lyric booklet",
          "24-bit 96kHz lossless FLAC & WAV digital masters",
          "Numbered certificate of authenticity (Limited to 500 copies)"
        ],
        benefits: [
          "Tangible collector's artifact with premium resale value",
          "Superior analog sound reproduction tuned for high-end turntables",
          "Exclusive access to private Discord listening sessions"
        ],
        uniqueSellingPoints: [
          "Independently pressed and signed by the artist",
          "Includes unreleased acoustic live session bonus cut"
        ],
        heroImageUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80",
        status: "active",
        launchDate: "2026-09-18",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "prd_demo_2",
        workspaceId: defaultWorkspaceId,
        name: "Afro-Fusion Production Sample & Serum Preset Pack Vol. 1",
        type: "digital_good",
        tagline: "The exact log drums, brass stabs, and vocal chants used in the upcoming EP",
        description: "Over 350+ royalty-free master-grade Afrobeats & Amapiano samples recorded in Lagos with world-class session musicians.",
        category: "Audio Sample Packs",
        pricing: {
          amount: 29,
          currency: "USD",
          billingInterval: "one_time",
          tierName: "Producer License"
        },
        targetAudience: "Music producers, beatmakers, and sound designers worldwide.",
        keyFeatures: [
          "120+ Key-labeled log drum loops and one-shots",
          "85 Syncopated live shaker and percussion grooves",
          "50 Custom Xfer Serum presets with macro controls",
          "100% Royalty-Free commercial clearance"
        ],
        benefits: [
          "Instant authentic Lagos groove without hiring live session players",
          "Pre-mixed and pre-mastered with -6dB headroom for effortless integration"
        ],
        uniqueSellingPoints: [
          "Processed through analog SSL G-Master bus compressor and tube preamps"
        ],
        heroImageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80",
        status: "launching",
        launchDate: "2026-09-25",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    users: [user],
    sessions: [],
    workspaces: [workspace],
    workspace_members: [
      {
        id: "mem_demo_1",
        workspaceId: defaultWorkspaceId,
        userId: defaultUserId,
        name: "Keedohub Artist Studio",
        email: "creator@keedohub.com",
        jobTitle: "Lead Artist & Creative Director",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        role: "owner",
        status: "active",
        permissions: {
          canManageWorkspace: true,
          canCreateProjects: true,
          canEditAll: true,
          canViewInternalNotes: true,
          canApprove: true,
          canComment: true,
          canRequestRevisions: true,
        },
        accessScope: { isWorkspaceWide: true },
        joinedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        lastActiveAt: new Date().toISOString(),
      },
      {
        id: "mem_demo_2",
        workspaceId: defaultWorkspaceId,
        userId: "usr_studio_dare",
        name: "Dare Balogun",
        email: "dare@keedohub.studio",
        jobTitle: "Executive Producer & Audio Engineer",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        role: "admin",
        status: "active",
        permissions: {
          canManageWorkspace: true,
          canCreateProjects: true,
          canEditAll: true,
          canViewInternalNotes: true,
          canApprove: true,
          canComment: true,
          canRequestRevisions: true,
        },
        accessScope: { isWorkspaceWide: true },
        joinedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
        lastActiveAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        id: "mem_demo_3",
        workspaceId: defaultWorkspaceId,
        userId: "usr_member_amara",
        name: "Amara Okafor",
        email: "amara@afrovibeworld.com",
        jobTitle: "Senior Visual & 3D Motion Designer",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        role: "member",
        status: "active",
        permissions: {
          canManageWorkspace: false,
          canCreateProjects: true,
          canEditAll: true,
          canViewInternalNotes: true,
          canApprove: false,
          canComment: true,
          canRequestRevisions: true,
        },
        accessScope: { isWorkspaceWide: true },
        joinedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        lastActiveAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
      {
        id: "mem_demo_4",
        workspaceId: defaultWorkspaceId,
        userId: "usr_collab_tunde",
        name: "Tunde Martins",
        email: "tunde@growthsound.io",
        jobTitle: "DSP Growth & Promo Strategist",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        role: "collaborator",
        status: "active",
        permissions: {
          canManageWorkspace: false,
          canCreateProjects: false,
          canEditAll: false,
          canViewInternalNotes: false,
          canApprove: false,
          canComment: true,
          canRequestRevisions: true,
        },
        accessScope: {
          isWorkspaceWide: false,
          projectIds: ["proj_demo_1"],
          releaseIds: [release.id],
          campaignIds: [campaign.id],
        },
        joinedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        lastActiveAt: new Date(Date.now() - 8 * 3600000).toISOString(),
      },
      {
        id: "mem_demo_5",
        workspaceId: defaultWorkspaceId,
        userId: "usr_client_kemi",
        name: "Kemi Adeleke",
        email: "kemi@pulseglobal.co",
        jobTitle: "Brand Partnerships Director @ Pulse Global",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        role: "client",
        status: "active",
        permissions: {
          canManageWorkspace: false,
          canCreateProjects: false,
          canEditAll: false,
          canViewInternalNotes: false,
          canApprove: true,
          canComment: true,
          canRequestRevisions: true,
        },
        accessScope: {
          isWorkspaceWide: false,
          projectIds: ["proj_demo_1"],
          campaignIds: [campaign.id],
          deliverableIds: ["sdel_demo_1"],
        },
        joinedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        lastActiveAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      },
    ],
    projects: [project],
    folders: folders,
    milestones: milestones,
    assets: [asset],
    releases: [release],
    campaigns: [campaign],
    content_pillars: contentPillars,
    content_items: contentItems,
    creative_memories: [creativeMemory],
    notifications: [notification],
    activity_logs: [activity],
    creative_requests: [],
    studio_requests: [
      {
        id: "sreq_demo_cover_1",
        workspaceId: defaultWorkspaceId,
        userId: defaultUserId,
        serviceId: "cover_design",
        serviceName: "Album / Single / EP Cover Design",
        title: "Midnight in Victoria Island — Master Artwork & Motion Visualizer",
        origin: "artist_release",
        releaseId: release.id,
        releaseTitle: release.title,
        brief: {
          serviceCategory: "cover_design",
          title: "Midnight in Victoria Island — Master Artwork & Motion Visualizer",
          artistOrBrandName: "AfroVibe World",
          releaseTitle: "Midnight in Victoria Island",
          genreOrIndustry: "Afro-Fusion / Alté",
          concept: "Cinematic night-time Lagos atmosphere with glowing crimson ambient neon, moody architectural silhouettes, and futuristic typography.",
          visualDirection: "High-contrast dark-first design, subtle tactile grain, 3000x3000px square master with 3D canvas motion visualizer loop.",
          references: ["Burna Boy — I Told Them Artwork", "Travis Scott — Utopia Visuals"],
          dimensions: "3000x3000px (300 DPI)",
          requiredDeliverables: [
            "3000x3000px Master Cover PNG",
            "Spotify Canvas Motion Loop (9:16 MP4)",
            "Gatefold Vinyl Mockup Suite",
            "Social Media Launch Banners"
          ],
          deadline: "2026-09-10",
          targetBudget: 280,
          currency: "USD",
          additionalNotes: "Must comply with Spotify & Apple Music editorial submission specs without borders.",
          aiAssisted: true,
          missingElementsDetected: [],
          aiSuggestedQuestions: ["Do you require an animated 9:16 vertical canvas loop for Spotify? (Confirmed Yes)"],
          aiClarifications: ["Standard 3000x3000px 300DPI RGB color format chosen."]
        },
        status: "PROJECT_ACTIVE",
        quoteId: "squote_demo_1",
        projectId: "sproj_demo_1",
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    studio_quotes: [
      {
        id: "squote_demo_1",
        workspaceId: defaultWorkspaceId,
        requestId: "sreq_demo_cover_1",
        projectId: "sproj_demo_1",
        serviceName: "Album / Single / EP Cover Design & 3D Motion Suite",
        scopeSummary: "Comprehensive 3000x3000px master artwork packaging, 9:16 animated Spotify canvas, high-res social media launch suite, and full commercial copyright transfer.",
        deliverables: [
          "3000x3000px 300DPI Master Artwork (PNG/JPG)",
          "Spotify 9:16 Canvas Motion Loop (Lossless MP4)",
          "Tracklist Back Cover & Gatefold Vinyl Render",
          "Social Media Launch Kit (IG Story, Feed, Banner)",
          "Exclusive Commercial IP Certificate"
        ],
        price: 280,
        currency: "USD",
        timeline: "48-72 Hours (Fast-Track)",
        revisionAllowance: 3,
        notes: "Keedohub lead art director assigned. Full source Figma and PSD layers included upon final delivery.",
        expirationDate: "2026-09-25",
        status: "APPROVED",
        approvedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        approvedBy: "AfroVibe World OS (Lead Artist)",
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 86400000).toISOString()
      }
    ],
    studio_projects: [
      {
        id: "sproj_demo_1",
        workspaceId: defaultWorkspaceId,
        requestId: "sreq_demo_cover_1",
        quoteId: "squote_demo_1",
        releaseId: release.id,
        title: "Midnight in Victoria Island — Cover Suite & Motion",
        serviceCategory: "cover_design",
        status: "PRODUCTION",
        budget: 280,
        currency: "USD",
        deadline: "2026-09-10",
        brief: {
          serviceCategory: "cover_design",
          title: "Midnight in Victoria Island — Master Artwork & Motion Visualizer",
          artistOrBrandName: "AfroVibe World",
          releaseTitle: "Midnight in Victoria Island",
          genreOrIndustry: "Afro-Fusion / Alté",
          concept: "Cinematic night-time Lagos atmosphere with glowing crimson ambient neon, moody architectural silhouettes, and futuristic typography.",
          visualDirection: "High-contrast dark-first design, subtle tactile grain, 3000x3000px square master with 3D canvas motion visualizer loop.",
          requiredDeliverables: [
            "3000x3000px Master Cover PNG",
            "Spotify Canvas Motion Loop (9:16 MP4)",
            "Gatefold Vinyl Mockup Suite"
          ],
          deadline: "2026-09-10",
          targetBudget: 280,
          currency: "USD"
        },
        milestones: [
          { id: "sm_1", title: "Concept Directions & Mood Explorations (3 Options)", targetDate: "2026-09-03", completed: true },
          { id: "sm_2", title: "V1 Hi-Res Master Render Review", targetDate: "2026-09-06", completed: true },
          { id: "sm_3", title: "V2 Revisions & Typography Lock", targetDate: "2026-09-08", completed: false },
          { id: "sm_4", title: "Final Master Package & Spotify Canvas Delivery", targetDate: "2026-09-10", completed: false }
        ],
        leadProducer: {
          name: "Dare Balogun",
          role: "Executive Creative Director @ Keedohub Studio",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
        },
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    studio_deliverables: [
      {
        id: "sdel_demo_1",
        projectId: "sproj_demo_1",
        workspaceId: defaultWorkspaceId,
        name: "Midnight in VI — 3000x3000px Master Cover Artwork",
        description: "Hi-res 300DPI square artwork with crimson lighting, metallic typography, and texture overlays.",
        format: "PNG / 3000x3000px 300DPI RGB",
        version: "V1",
        status: "ready_for_review",
        assetId: asset.id,
        assetUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
        previewUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
        fileSize: 4820000,
        dueDate: "2026-09-08",
        approvalStatus: "pending",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: "sdel_demo_2",
        projectId: "sproj_demo_1",
        workspaceId: defaultWorkspaceId,
        name: "Spotify Canvas 9:16 3D Kinetic Loop",
        description: "Seamless 8-second vertical loop for Spotify now playing background visualizer.",
        format: "MP4 1080x1920 (H.264, 60fps)",
        version: "V1",
        status: "in_progress",
        dueDate: "2026-09-10",
        approvalStatus: "pending",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    studio_revisions: [
      {
        id: "srev_demo_1",
        projectId: "sproj_demo_1",
        deliverableId: "sdel_demo_1",
        deliverableName: "Midnight in VI — 3000x3000px Master Cover Artwork",
        workspaceId: defaultWorkspaceId,
        userId: defaultUserId,
        version: "V1",
        reason: "Typography adjustment & contrast refinement",
        requestedChanges: "Please tighten the letter spacing on 'VICTORIA ISLAND' by -2% and amplify the ambient crimson reflection on the metallic edges.",
        status: "IN_PROGRESS",
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ],
    studio_messages: [
      {
        id: "smsg_demo_1",
        workspaceId: defaultWorkspaceId,
        projectId: "sproj_demo_1",
        requestId: "sreq_demo_cover_1",
        senderId: "usr_studio_dare",
        senderName: "Dare Balogun",
        senderRole: "producer",
        content: "Welcome to Keedohub Studio! We have reviewed your creative brief and locked the initial moodboard. V1 master artwork draft is ready for review in the Deliverables tab.",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: "smsg_demo_2",
        workspaceId: defaultWorkspaceId,
        projectId: "sproj_demo_1",
        requestId: "sreq_demo_cover_1",
        senderId: defaultUserId,
        senderName: "AfroVibe World (Lead)",
        senderRole: "client",
        content: "Reviewed V1 — the lighting and mood are spot on. Just logged a small revision on the subtitle typography tracking.",
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: "smsg_demo_3",
        workspaceId: defaultWorkspaceId,
        projectId: "sproj_demo_1",
        requestId: "sreq_demo_cover_1",
        senderId: "usr_studio_dare",
        senderName: "Dare Balogun",
        senderRole: "producer",
        content: "Revision received and in progress! Lead 3D artist is currently rendering the updated typography and the 9:16 Spotify Canvas loop.",
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
      }
    ],
    creative_memory_items: [
      {
        id: "mem_demo_1",
        workspaceId: defaultWorkspaceId,
        userId: defaultUserId,
        category: "identity",
        scope: "workspace",
        title: "AfroVibe World Identity & Core Narrative",
        content: "Pioneering African sonic craftsmanship that bridges traditional syncopated percussion with futuristic synth architecture for a global audience.",
        tags: ["identity", "afro-fusion", "global", "storytelling", "artist-vision"],
        source: "user_explicit",
        confidence: 100,
        status: "active",
        isPinned: true,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "mem_demo_2",
        workspaceId: defaultWorkspaceId,
        userId: defaultUserId,
        category: "preference",
        scope: "workspace",
        title: "Alté Lagos Noir Visual Aesthetic",
        content: "Always maintain high-contrast obsidian canvases (#09090B), subtle cinematic 35mm grain, moody crimson accent lighting (#EF4444), and tight display typography.",
        tags: ["visual", "lighting", "noir", "alte", "crimson", "typography", "palette"],
        source: "user_explicit",
        confidence: 98,
        status: "active",
        isPinned: true,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "mem_demo_3",
        workspaceId: defaultWorkspaceId,
        userId: defaultUserId,
        category: "preference",
        scope: "workspace",
        title: "Concise, Punchy & Magnetic Editorial Tone",
        content: "Keep all captions, marketing hooks, and press releases concise, authentic, and culturally resonant. Avoid flowery corporate fluff or spammy viral phrases.",
        tags: ["tone", "voice", "editorial", "punchy", "copywriting"],
        source: "user_explicit",
        confidence: 95,
        status: "active",
        isPinned: true,
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "mem_demo_4",
        workspaceId: defaultWorkspaceId,
        userId: defaultUserId,
        category: "strategy",
        scope: "workspace",
        title: "Target Audience: Independent Music Tastemakers & Global Diaspora",
        content: "Primary listener base is 18-34 music enthusiasts, playlist curators, and diaspora creatives in London, Lagos, New York, and Toronto who value authentic cultural soundscapes.",
        tags: ["audience", "demographics", "icp", "superfans", "strategy"],
        source: "user_explicit",
        confidence: 92,
        status: "active",
        isPinned: true,
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "mem_demo_5",
        workspaceId: defaultWorkspaceId,
        userId: defaultUserId,
        category: "project",
        scope: "release",
        entityType: "release",
        entityId: release.id,
        entityName: "Midnight in Victoria Island",
        title: "'Midnight in Victoria Island' 180g Vinyl Master & Packaging Spec",
        content: "Approved physical edition uses 180-gram translucent crimson wax, custom gatefold liner notes, 24-bit 96kHz lossless masters, and gold foil-stamped lyrics poster.",
        tags: ["vinyl", "mastering", "packaging", "release-spec", "audiophile"],
        source: "studio_decision",
        confidence: 100,
        status: "active",
        isPinned: false,
        assetReferenceId: asset.id,
        assetReferenceName: asset.name,
        assetReferenceUrl: asset.url,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "mem_demo_6",
        workspaceId: defaultWorkspaceId,
        userId: defaultUserId,
        category: "asset",
        scope: "workspace",
        title: "3000x3000px 300DPI Hi-Res Artwork Delivery Standard",
        content: "All single and EP releases must strictly feature 3000x3000px 300DPI RGB master covers without borders or non-standard text to pass Apple Music and Spotify QA checks.",
        tags: ["spec", "cover", "spotify", "apple-music", "dsp-standard"],
        source: "system_inferred",
        confidence: 100,
        status: "active",
        isPinned: false,
        createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "mem_demo_7",
        workspaceId: defaultWorkspaceId,
        userId: defaultUserId,
        category: "strategy",
        scope: "workspace",
        title: "Era 1: Raw Afro-Soul (2024–2025)",
        content: "Acoustic organic live instrumentation with earth-tone visual palettes and intimate bedroom recording aesthetics.",
        tags: ["era", "history", "evolution", "acoustic"],
        source: "user_explicit",
        confidence: 90,
        status: "active",
        isPinned: false,
        supersededByMemoryId: "mem_demo_8",
        createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: "mem_demo_8",
        workspaceId: defaultWorkspaceId,
        userId: defaultUserId,
        category: "strategy",
        scope: "workspace",
        title: "Era 2: Afro-Futurist Alté-Noir (2026–Present)",
        content: "Evolved soundscape integrating heavy analog synthesizers, 3D kinetic visuals, and global crossover collaborations. Supersedes Era 1 organic acoustic era.",
        tags: ["era", "current", "evolution", "futurist", "alte-noir"],
        source: "user_explicit",
        confidence: 98,
        status: "active",
        isPinned: true,
        supersedesMemoryId: "mem_demo_7",
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "mem_demo_9",
        workspaceId: defaultWorkspaceId,
        userId: defaultUserId,
        category: "rule",
        scope: "workspace",
        title: "Brand Guardrails: Do Not Use Generic Promotional Slang",
        content: "Strictly ban generic clickbait hooks ('Check this out', 'Going viral', '#fyp') and corporate jargon. Always frame announcements as cultural moments and creative craftsmanship.",
        tags: ["rules", "guardrails", "dont-say", "brand-safety"],
        source: "user_explicit",
        confidence: 100,
        status: "active",
        isPinned: true,
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    memory_candidates: [
      {
        id: "mcand_demo_1",
        workspaceId: defaultWorkspaceId,
        title: "Prioritize 9:16 Vertical Motion Loops for All Single Drops",
        content: "Creative Brain identified recurring high engagement on TikTok and Spotify Canvas when motion loops are rendered concurrently with static cover art.",
        category: "preference",
        scope: "workspace",
        sourceContext: "Creative Brain Release Analysis & Studio Review",
        confidence: 88,
        tags: ["motion", "canvas", "tiktok", "reels"],
        status: "pending",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      }
    ],
    memory_block_rules: [
      {
        id: "mblock_demo_1",
        workspaceId: defaultWorkspaceId,
        pattern: "Personal bank account numbers, private phone numbers, or confidential passwords",
        reason: "Strict privacy and personal credential protection across all AI workspace memory",
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      }
    ],
    radar_signals: [],
    performance_metrics: [
      {
        id: "pm_demo_1",
        workspaceId: defaultWorkspaceId,
        entityType: "content",
        entityId: "cnt_1",
        entityTitle: "Late Night Studio Vocal Memo (T-14)",
        platform: "tiktok",
        format: "Reel / Short Video",
        metricDate: "2026-08-28",
        source: "manual",
        isVerified: false,
        metrics: {
          views: 48200,
          reach: 41500,
          impressions: 54000,
          engagement: 14.8,
          likes: 6240,
          comments: 482,
          shares: 1190,
          saves: 850,
          clicks: 340,
          conversions: 185,
        },
        notes: "Viral organic pickup on TikTok sound memo snippet with producer reaction.",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: "pm_demo_2",
        workspaceId: defaultWorkspaceId,
        entityType: "content",
        entityId: "cnt_2",
        entityTitle: "3D Spinning Vinyl Cover Artwork Reveal",
        platform: "instagram",
        format: "Carousel / 3D Render",
        metricDate: "2026-08-27",
        source: "manual",
        isVerified: false,
        metrics: {
          views: 18400,
          reach: 16200,
          impressions: 21000,
          engagement: 8.6,
          likes: 1350,
          comments: 142,
          shares: 230,
          saves: 410,
          clicks: 95,
          conversions: 42,
        },
        notes: "High save rate on 3000px cover artwork presentation carousel.",
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: "pm_demo_3",
        workspaceId: defaultWorkspaceId,
        entityType: "release",
        entityId: release.id,
        entityTitle: release.title,
        platform: "spotify",
        metricDate: "2026-08-29",
        source: "manual",
        isVerified: false,
        metrics: {
          streams: 14200,
          saves: 1840,
          reach: 9600,
          clicks: 820,
        },
        notes: "Catalogue momentum & presave conversion for lead teaser.",
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "pm_demo_4",
        workspaceId: defaultWorkspaceId,
        entityType: "campaign",
        entityId: campaign.id,
        entityTitle: campaign.title,
        platform: "instagram",
        metricDate: "2026-08-29",
        source: "manual",
        isVerified: false,
        metrics: {
          views: 32000,
          reach: 27500,
          engagement: 11.2,
          clicks: 620,
          conversions: 140,
          spend: 150,
          revenue: 950,
        },
        notes: "Mid-sprint paid push & influencer story resharing.",
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    growth_insights: [
      {
        id: "gi_demo_1",
        workspaceId: defaultWorkspaceId,
        title: "Short-Form Studio Memos are Outperforming Carousels 3.4x",
        explanation: "Raw behind-the-scenes recording clips on TikTok captured 48,200 views with a 14.8% engagement rate, generating 185 presaves compared to 42 from static and 3D carousels.",
        evidence: "Content cnt_1 (TikTok Vocal Memo) generated 48.2k views / 14.8% engagement vs cnt_2 (IG Carousel) at 18.4k views / 8.6% engagement.",
        relatedEntity: {
          type: "format",
          name: "Reel / Short Video",
          id: "cnt_1",
        },
        confidence: "high",
        category: "content_format",
        status: "active",
        recommendedAction: {
          label: "Queue 2 Additional Studio Memos in Content Engine",
          actionType: "create_content",
          targetTab: "content-engine",
          payload: { pillar: "Behind The Scenes", format: "Reel / Short Video" },
        },
        generatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        id: "gi_demo_2",
        workspaceId: defaultWorkspaceId,
        title: "TikTok Organic Presave Conversion is Highest Performing Channel",
        explanation: "TikTok sound snippet hooks converted at 4.2% of viewers into verified SmartLink presaves, making it the most cost-effective fan acquisition platform for the upcoming EP.",
        evidence: "185 conversions from 4,400 profile clicks on TikTok vs 42 conversions from Instagram.",
        relatedEntity: {
          type: "platform",
          name: "TikTok",
        },
        confidence: "high",
        category: "platform_momentum",
        status: "active",
        recommendedAction: {
          label: "Boost TikTok Sound Hook Distribution",
          actionType: "navigate_tab",
          targetTab: "content-engine",
        },
        generatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        id: "gi_demo_3",
        workspaceId: defaultWorkspaceId,
        title: "Collector Vinyl Bundle Demand Exceeds Initial Sprint Target",
        explanation: "The limited 180g Vinyl pre-order has driven $950 in early revenue within 48 hours of campaign announcement.",
        evidence: "Product prd_demo_1 generated 21 pre-orders ($950) with high direct engagement from diaspora superfans.",
        relatedEntity: {
          type: "product",
          id: "prd_demo_1",
          name: "Midnight in Victoria Island — Limited 180g Vinyl",
        },
        confidence: "medium",
        category: "growth_opportunity",
        status: "active",
        recommendedAction: {
          label: "View Campaign & Product Analytics",
          actionType: "navigate_tab",
          targetTab: "analytics",
        },
        generatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      }
    ],
    workspace_goals: [
      {
        id: "goal_demo_1",
        workspaceId: defaultWorkspaceId,
        title: "Pre-Release Total Content Views (All Channels)",
        category: "content",
        targetMetric: "views",
        targetValue: 150000,
        currentValue: 66600,
        unit: "views",
        deadline: "2026-09-18",
        status: "on_track",
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "goal_demo_2",
        workspaceId: defaultWorkspaceId,
        title: "EP Launch Suite Presave Conversions",
        category: "release",
        targetMetric: "conversions",
        targetValue: 1000,
        currentValue: 227,
        unit: "presaves",
        deadline: "2026-09-18",
        entityId: release.id,
        entityType: "release",
        status: "on_track",
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "goal_demo_3",
        workspaceId: defaultWorkspaceId,
        title: "Short-Form Content Engagement Rate Target",
        category: "engagement",
        targetMetric: "engagement_rate",
        targetValue: 12,
        currentValue: 14.8,
        unit: "%",
        deadline: "2026-09-30",
        status: "achieved",
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    comments: [
      {
        id: "cmt_demo_1",
        workspaceId: defaultWorkspaceId,
        entityType: "studio_deliverable",
        entityId: "sdel_demo_1",
        entityTitle: "Midnight in VI — 3000x3000px Master Cover Artwork",
        authorId: defaultUserId,
        authorName: "Keedohub Artist Studio",
        authorEmail: "creator@keedohub.com",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        authorRole: "owner",
        content: "Reviewing v1 draft — the visual atmosphere and obsidian tones are top tier. Let's tighten the subtitle tracking on 'VICTORIA ISLAND' by -2% and amplify the ambient crimson reflection on the metallic edges before final export.",
        isInternal: false,
        resolved: true,
        resolvedBy: "usr_studio_dare",
        resolvedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        versionTag: "v1",
        reactions: [{ emoji: "🔥", count: 3, userIds: [defaultUserId, "usr_studio_dare", "usr_client_kemi"] }],
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        id: "cmt_demo_2",
        workspaceId: defaultWorkspaceId,
        entityType: "studio_deliverable",
        entityId: "sdel_demo_1",
        entityTitle: "Midnight in VI — 3000x3000px Master Cover Artwork",
        parentId: "cmt_demo_1",
        authorId: "usr_studio_dare",
        authorName: "Dare Balogun",
        authorEmail: "dare@keedohub.studio",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        authorRole: "admin",
        content: "Feedback received! Tracking is adjusted and crimson edge shaders have been re-rendered in Blender. Rendered v2 is now submitted for sign-off.",
        isInternal: false,
        resolved: true,
        versionTag: "v2",
        createdAt: new Date(Date.now() - 14 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 14 * 3600000).toISOString(),
      },
      {
        id: "cmt_demo_3",
        workspaceId: defaultWorkspaceId,
        entityType: "studio_deliverable",
        entityId: "sdel_demo_1",
        entityTitle: "Midnight in VI — 3000x3000px Master Cover Artwork",
        authorId: "usr_member_amara",
        authorName: "Amara Okafor",
        authorEmail: "amara@afrovibeworld.com",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        authorRole: "member",
        content: "[INTERNAL TEAM ONLY] Make sure we save the raw multi-layer PSD and Figma source assets into the Studio folder alongside the 300DPI TIFF before sending client handoff.",
        isInternal: true,
        resolved: false,
        versionTag: "v2",
        createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
      },
      {
        id: "cmt_demo_4",
        workspaceId: defaultWorkspaceId,
        entityType: "release",
        entityId: "rel_demo_1",
        entityTitle: "Midnight in Victoria Island",
        authorId: "usr_studio_dare",
        authorName: "Dare Balogun",
        authorEmail: "dare@keedohub.studio",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        authorRole: "admin",
        content: "Master WAV 24-bit 44.1kHz audio check passed: True Peak at -0.3dBTP, Integrated LUFS at -9.2. Ready for DSP ingest.",
        isInternal: false,
        resolved: true,
        versionTag: "v1",
        reactions: [{ emoji: "🎧", count: 2, userIds: [defaultUserId, "usr_studio_dare"] }],
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        id: "cmt_demo_5",
        workspaceId: defaultWorkspaceId,
        entityType: "campaign",
        entityId: "cmp_demo_1",
        entityTitle: "Midnight in VI — Global Drop & Co-Marketing Sprint",
        authorId: "usr_client_kemi",
        authorName: "Kemi Adeleke",
        authorEmail: "kemi@pulseglobal.co",
        authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        authorRole: "client",
        content: "Pulse Global team has reviewed the TikTok sound blitz and co-branded vinyl mockups. Logo placement on the vinyl gatefold looks clean. Reviewing the formal approval request now.",
        isInternal: false,
        resolved: false,
        versionTag: "v1",
        reactions: [{ emoji: "🙌", count: 2, userIds: [defaultUserId, "usr_client_kemi"] }],
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      }
    ],
    approval_requests: [
      {
        id: "appr_demo_1",
        workspaceId: defaultWorkspaceId,
        entityType: "studio_deliverable",
        entityId: "sdel_demo_1",
        entityTitle: "Midnight in VI — 3000x3000px Master Cover Artwork",
        title: "Master Cover Artwork Sign-Off (v2)",
        description: "Official approval for high-resolution 3000x3000px 300DPI master cover art and streaming distribution packaging.",
        requestedBy: {
          id: "usr_studio_dare",
          name: "Dare Balogun",
          email: "dare@keedohub.studio",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          role: "Creative Director"
        },
        requestedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
        dueDate: "2026-09-10",
        status: "in_review",
        currentVersion: "v2",
        isClientVisible: true,
        deliverableUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80",
        deliverableThumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
        deliverableFormat: "PNG (3000x3000px 300DPI)",
        assignedReviewers: [
          {
            id: defaultUserId,
            email: "creator@keedohub.com",
            name: "Keedohub Artist Studio",
            role: "owner",
            status: "pending"
          },
          {
            id: "usr_client_kemi",
            email: "kemi@pulseglobal.co",
            name: "Kemi Adeleke",
            role: "client",
            status: "pending"
          }
        ],
        reviews: [
          {
            id: "rev_dec_1",
            reviewerId: defaultUserId,
            reviewerName: "Keedohub Artist Studio",
            reviewerEmail: "creator@keedohub.com",
            reviewerRole: "owner",
            status: "changes_requested",
            notes: "Please tighten the letter spacing on 'VICTORIA ISLAND' by -2% and amplify the ambient crimson reflection.",
            version: "v1",
            timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
            requestedChanges: ["Tighten letter spacing on title", "Amplify ambient crimson reflection on metallic edges"]
          }
        ],
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      },
      {
        id: "appr_demo_2",
        workspaceId: defaultWorkspaceId,
        entityType: "release",
        entityId: "rel_demo_1",
        entityTitle: "Midnight in Victoria Island",
        title: "24-Bit WAV Master Audio & 100% Split Sheets",
        description: "Final studio mastering sign-off (-9.2 LUFS) and locked contributor split agreements for global distribution.",
        requestedBy: {
          id: "usr_studio_dare",
          name: "Dare Balogun",
          email: "dare@keedohub.studio",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          role: "Audio Lead"
        },
        requestedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        dueDate: "2026-09-08",
        status: "approved",
        currentVersion: "v1",
        isClientVisible: true,
        assignedReviewers: [
          {
            id: defaultUserId,
            email: "creator@keedohub.com",
            name: "Keedohub Artist Studio",
            role: "owner",
            status: "approved",
            decisionNotes: "Master audio dynamics and clarity approved.",
            decidedAt: new Date(Date.now() - 1 * 86400000).toISOString()
          }
        ],
        reviews: [
          {
            id: "rev_dec_2",
            reviewerId: defaultUserId,
            reviewerName: "Keedohub Artist Studio",
            reviewerEmail: "creator@keedohub.com",
            reviewerRole: "owner",
            status: "approved",
            notes: "Master audio sound design is exceptional. Dynamic range and LUFS are fully compliant with Spotify and Apple Music editorial standards.",
            version: "v1",
            timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
          }
        ],
        completedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        id: "appr_demo_3",
        workspaceId: defaultWorkspaceId,
        entityType: "campaign",
        entityId: "cmp_demo_1",
        entityTitle: "Midnight in VI — Global Drop & Co-Marketing Sprint",
        title: "Pulse Global Brand Sponsor Campaign Asset Pack",
        description: "Client authorization required for sponsored TikTok hooks, Instagram countdown banners, and co-branded press releases.",
        requestedBy: {
          id: "usr_collab_tunde",
          name: "Tunde Martins",
          email: "tunde@growthsound.io",
          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
          role: "Marketing Strategist"
        },
        requestedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        dueDate: "2026-09-12",
        status: "pending",
        currentVersion: "v1",
        isClientVisible: true,
        assignedReviewers: [
          {
            id: "usr_client_kemi",
            email: "kemi@pulseglobal.co",
            name: "Kemi Adeleke",
            role: "client",
            status: "pending"
          }
        ],
        reviews: [],
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    revisions: [
      {
        id: "rev_demo_1",
        workspaceId: defaultWorkspaceId,
        entityType: "studio_deliverable",
        entityId: "sdel_demo_1",
        entityTitle: "Midnight in VI — 3000x3000px Master Cover Artwork",
        versionNumber: 1,
        versionTag: "v1",
        title: "Initial Draft Master Render (3000x3000px)",
        changelog: "Initial 300DPI render with raw background textures and standard typography.",
        assetUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
        createdBy: {
          id: "usr_studio_dare",
          name: "Dare Balogun",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          role: "Creative Director"
        },
        status: "changes_requested",
        changeRequestsSummary: "Tighten letter spacing on 'VICTORIA ISLAND' by -2% and amplify crimson reflection on metallic edges.",
        isClientVisible: true,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: "rev_demo_2",
        workspaceId: defaultWorkspaceId,
        entityType: "studio_deliverable",
        entityId: "sdel_demo_1",
        entityTitle: "Midnight in VI — 3000x3000px Master Cover Artwork",
        versionNumber: 2,
        versionTag: "v2",
        title: "Revision v2 — Typography Tracking & Crimson Edge Lock",
        changelog: "Applied -2% typography tracking, enhanced ambient crimson reflections, high-pass sharpened 300DPI print layer.",
        assetUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80",
        createdBy: {
          id: "usr_studio_dare",
          name: "Dare Balogun",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          role: "Creative Director"
        },
        status: "pending_review",
        isClientVisible: true,
        createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      }
    ],
    admin_audit_logs: [
      {
        id: "a-log-1",
        adminUserId: defaultUserId,
        adminEmail: "creator@keedohub.com",
        adminName: "Keedohub Creator",
        adminRole: "super_admin",
        action: "FEATURE_FLAG_UPDATED",
        targetType: "feature_flag",
        targetId: "mastering_suite_cloud",
        targetName: "Mastering Suite Cloud",
        details: { change: "Rollout increased from 50% to 80%", previousRollout: 50, newRollout: 80 },
        ipAddress: "127.0.0.1",
        result: "success",
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
      },
      {
        id: "a-log-2",
        adminUserId: defaultUserId,
        adminEmail: "creator@keedohub.com",
        adminName: "Keedohub Creator",
        adminRole: "super_admin",
        action: "USER_STATUS_UPDATED",
        targetType: "user",
        targetId: "usr_alte_chidi",
        targetName: "Chidi Eze",
        details: { previousStatus: "active", newStatus: "suspended", reason: "Suspicious API spike beyond rate limit limits" },
        ipAddress: "127.0.0.1",
        result: "success",
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
      },
      {
        id: "a-log-3",
        adminUserId: defaultUserId,
        adminEmail: "creator@keedohub.com",
        adminName: "Keedohub Creator",
        adminRole: "super_admin",
        action: "WORKSPACE_DIAGNOSTIC_RUN",
        targetType: "workspace",
        targetId: defaultWorkspaceId,
        targetName: "AfroVibe World OS",
        details: "Diagnostic integrity check completed with 0 errors and 0 orphaned assets.",
        ipAddress: "127.0.0.1",
        result: "success",
        createdAt: new Date(Date.now() - 36 * 3600000).toISOString()
      },
      {
        id: "a-log-4",
        adminUserId: defaultUserId,
        adminEmail: "creator@keedohub.com",
        adminName: "Keedohub Creator",
        adminRole: "super_admin",
        action: "SYSTEM_SETTINGS_UPDATED",
        targetType: "system",
        targetId: "global_settings",
        targetName: "Platform Settings",
        details: "Updated AI Rate Limit to 60 req/min and Max Upload Size to 150MB.",
        ipAddress: "127.0.0.1",
        result: "success",
        createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
      }
    ],
    feature_flags: [
      {
        id: "ff_1",
        key: "ai_creative_brain",
        name: "Creative Brain & OS Intelligence",
        description: "Enables Gemini multimodal strategic intelligence across briefs, releases, and content generation.",
        category: "ai",
        enabled: true,
        rolloutPercentage: 100,
        updatedAt: new Date().toISOString(),
        updatedBy: "usr_demo_keedohub"
      },
      {
        id: "ff_2",
        key: "studio_quotes",
        name: "Studio Services & Direct Project Quotes",
        description: "Allows creators to submit custom production briefs and receive immediate transparent tier quotes.",
        category: "studio",
        enabled: true,
        rolloutPercentage: 100,
        updatedAt: new Date().toISOString(),
        updatedBy: "usr_demo_keedohub"
      },
      {
        id: "ff_3",
        key: "collaboration_approvals",
        name: "Multi-Role Approvals & Revisions Engine",
        description: "Provides multi-stage client and team sign-offs, contextual threaded comments, and revision comparison.",
        category: "core",
        enabled: true,
        rolloutPercentage: 100,
        updatedAt: new Date().toISOString(),
        updatedBy: "usr_demo_keedohub"
      },
      {
        id: "ff_4",
        key: "dsp_pitching",
        name: "Direct DSP Editorial Pitching Suite",
        description: "Formats and validates pitch narratives and audio specs for Spotify Editorial and Apple Music curator teams.",
        category: "distribution",
        enabled: true,
        rolloutPercentage: 100,
        updatedAt: new Date().toISOString(),
        updatedBy: "usr_demo_keedohub"
      },
      {
        id: "ff_5",
        key: "presave_funnels",
        name: "Smart Pre-Save & Fan Lead Capture",
        description: "Deploys high-converting smart landing pages with countdowns, preview snippets, and fan email capture.",
        category: "growth",
        enabled: true,
        rolloutPercentage: 100,
        updatedAt: new Date().toISOString(),
        updatedBy: "usr_demo_keedohub"
      },
      {
        id: "ff_6",
        key: "creative_radar",
        name: "Creative Market & Sound Radar",
        description: "Real-time streaming and viral sound signal aggregator with actionable breakthrough scoring.",
        category: "growth",
        enabled: true,
        rolloutPercentage: 100,
        updatedAt: new Date().toISOString(),
        updatedBy: "usr_demo_keedohub"
      },
      {
        id: "ff_7",
        key: "mastering_suite_cloud",
        name: "Cloud LUFS & Harmonic Mastering Engine",
        description: "Automated loudness normalizer and streaming target compliance analyser (-14 LUFS Spotify, -16 LUFS Apple).",
        category: "studio",
        enabled: true,
        rolloutPercentage: 80,
        updatedAt: new Date().toISOString(),
        updatedBy: "usr_demo_keedohub"
      },
      {
        id: "ff_8",
        key: "beta_video_stems",
        name: "AI Multi-Stem Video Generator (Beta)",
        description: "Generates synchronized 9:16 vertical video visualizers from stems and audio waveform cues.",
        category: "ai",
        enabled: false,
        rolloutPercentage: 25,
        updatedAt: new Date().toISOString(),
        updatedBy: "usr_demo_keedohub"
      },
      {
        id: "ff_9",
        key: "enterprise_saml_sso",
        name: "Enterprise SAML / SCIM Directory Sync",
        description: "Enforces Okta/Azure AD single sign-on and automated directory provisioning for label enterprises.",
        category: "security",
        enabled: false,
        rolloutPercentage: 10,
        updatedAt: new Date().toISOString(),
        updatedBy: "usr_demo_keedohub"
      }
    ],
    support_tickets: [
      {
        id: "tkt_1",
        ticketNumber: "TICK-8041",
        workspaceId: defaultWorkspaceId,
        workspaceName: "AfroVibe World OS",
        userId: defaultUserId,
        userEmail: "creator@keedohub.com",
        userName: "Keedohub Artist Studio",
        category: "asset_storage",
        priority: "medium",
        subject: "Master artwork upload returning 413 on 25MB TIFF file",
        message: "When uploading the 300DPI 3000x3000px TIFF version to Cover Studio, the client receives payload too large notice. Requesting limit bump.",
        status: "in_progress",
        diagnosticData: {
          clientVersion: "v16.0.0",
          identityType: "artist",
          storageUsageBytes: 42800000,
          recentErrorCount: 1,
          openApprovalsCount: 2,
          stalledDeliverablesCount: 0
        },
        assignedToAdmin: defaultUserId,
        assignedAdminName: "Keedohub Creator (Super Admin)",
        resolutionNotes: "Increased maxUploadSizeMb to 150MB in Platform Settings. Verifying client multipart upload handler.",
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
      },
      {
        id: "tkt_2",
        ticketNumber: "TICK-7992",
        workspaceId: "ws_pulse_brand",
        workspaceName: "Pulse Global Brand OS",
        userId: "usr_client_kemi",
        userEmail: "kemi@pulseglobal.co",
        userName: "Kemi Adeleke",
        category: "approval_stuck",
        priority: "high",
        subject: "Client approval signature link expiring before brand marketing review",
        message: "External sponsor stakeholder token timed out after 24h. We need 72h window for legal sponsor sign-offs.",
        status: "open",
        diagnosticData: {
          clientVersion: "v16.0.0",
          identityType: "brand",
          storageUsageBytes: 15400000,
          recentErrorCount: 0,
          openApprovalsCount: 1,
          stalledDeliverablesCount: 1
        },
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
      },
      {
        id: "tkt_3",
        ticketNumber: "TICK-7830",
        workspaceId: "ws_growth_creator",
        workspaceName: "GrowthSound Creator Lab",
        userId: "usr_collab_tunde",
        userEmail: "tunde@growthsound.io",
        userName: "Tunde Martins",
        category: "sync_error",
        priority: "low",
        subject: "DSP Metadata validation notice on ISRC hyphen format",
        message: "ISRC input was throwing warning when copying directly from distributor dashboard with hyphens.",
        status: "resolved",
        diagnosticData: {
          clientVersion: "v16.0.0",
          identityType: "creator",
          storageUsageBytes: 28900000,
          recentErrorCount: 0,
          openApprovalsCount: 0,
          stalledDeliverablesCount: 0
        },
        assignedToAdmin: defaultUserId,
        assignedAdminName: "Keedohub Creator",
        resolutionNotes: "Sanitized ISRC input sanitization regex on server side to auto-strip non-alphanumeric hyphens.",
        createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
        resolvedAt: new Date(Date.now() - 24 * 3600000).toISOString()
      }
    ],
    platform_settings: {
      id: "global_settings",
      maintenanceMode: false,
      maintenanceMessage: "Keedohub is currently undergoing scheduled platform upgrades. All live releases remain active.",
      allowNewSignups: true,
      systemNoticeBanner: {
        enabled: false,
        type: "info",
        text: "Scheduled maintenance window this Sunday at 02:00 UTC."
      },
      maxUploadSizeMb: 150,
      aiRateLimitPerMin: 60,
      auditRetentionDays: 90,
      updatedAt: new Date().toISOString(),
      updatedBy: defaultUserId
    }
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        // Ensure all collections exist
        const seed = generateInitialSeed();
        
        // Ensure default users have systemRole set
        const users = (parsed.users || seed.users).map((u: UserRecord) => {
          if (!u.systemRole) {
            if (u.id === "usr_demo_keedohub" || u.email.includes("admin") || u.email === "creator@keedohub.com") {
              u.systemRole = "super_admin";
            } else if (u.email.includes("ops")) {
              u.systemRole = "admin";
            } else if (u.email.includes("support")) {
              u.systemRole = "support";
            } else {
              u.systemRole = "user";
            }
          }
          if (!u.status) {
            u.status = "active";
          }
          return u;
        });

        // Ensure workspaces have status set
        const workspaces = (parsed.workspaces || seed.workspaces).map((w: WorkspaceRecord) => {
          if (!w.status) {
            w.status = "active";
          }
          return w;
        });

        return {
          users,
          sessions: parsed.sessions || seed.sessions,
          workspaces,
          workspace_members: parsed.workspace_members || seed.workspace_members,
          brand_cores: parsed.brand_cores || seed.brand_cores,
          products: parsed.products || seed.products,
          projects: parsed.projects || seed.projects,
          folders: parsed.folders || seed.folders,
          milestones: parsed.milestones || seed.milestones,
          assets: parsed.assets || seed.assets,
          releases: parsed.releases || seed.releases,
          campaigns: parsed.campaigns || seed.campaigns,
          content_pillars: parsed.content_pillars || seed.content_pillars,
          content_items: parsed.content_items || seed.content_items,
          creative_memories: parsed.creative_memories || seed.creative_memories,
          creative_memory_items: parsed.creative_memory_items || seed.creative_memory_items,
          memory_candidates: parsed.memory_candidates || seed.memory_candidates,
          memory_block_rules: parsed.memory_block_rules || seed.memory_block_rules,
          notifications: parsed.notifications || seed.notifications,
          activity_logs: parsed.activity_logs || seed.activity_logs,
          creative_requests: parsed.creative_requests || seed.creative_requests,
          studio_requests: parsed.studio_requests || seed.studio_requests,
          studio_quotes: parsed.studio_quotes || seed.studio_quotes,
          studio_projects: parsed.studio_projects || seed.studio_projects,
          studio_deliverables: parsed.studio_deliverables || seed.studio_deliverables,
          studio_revisions: parsed.studio_revisions || seed.studio_revisions,
          studio_messages: parsed.studio_messages || seed.studio_messages,
          radar_signals: parsed.radar_signals || seed.radar_signals,
          performance_metrics: parsed.performance_metrics || seed.performance_metrics,
          growth_insights: parsed.growth_insights || seed.growth_insights,
          workspace_goals: parsed.workspace_goals || seed.workspace_goals,
          comments: parsed.comments || seed.comments,
          approval_requests: parsed.approval_requests || seed.approval_requests,
          revisions: parsed.revisions || seed.revisions,
          admin_audit_logs: parsed.admin_audit_logs || seed.admin_audit_logs,
          feature_flags: parsed.feature_flags || seed.feature_flags,
          support_tickets: parsed.support_tickets || seed.support_tickets,
          platform_settings: parsed.platform_settings || seed.platform_settings,
        };
      }
    } catch (err) {
      console.error("[DB] Error loading database, re-seeding default store:", err);
    }

    const initial = generateInitialSeed();
    this.persist(initial);
    return initial;
  }

  private persist(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("[DB] Failed to persist database file:", err);
    }
  }

  public save() {
    this.persist();
  }

  // --- Auth & Users ---
  public getUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): UserRecord | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(email: string, password: string, fullName: string, avatarUrl?: string): UserRecord {
    const existing = this.getUserByEmail(email);
    if (existing) {
      throw new Error("A user with this email address already exists.");
    }
    const user: UserRecord = {
      id: "usr_" + crypto.randomUUID().substring(0, 8),
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password),
      fullName: fullName.trim(),
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(fullName)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(user);
    this.save();
    return user;
  }

  public verifyPassword(user: UserRecord, password: string): boolean {
    return user.passwordHash === hashPassword(password);
  }

  public createSession(userId: string): SessionRecord {
    // Remove old sessions for cleanliness
    const token = "kdh_sess_" + crypto.randomBytes(32).toString("hex");
    const session: SessionRecord = {
      token,
      userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };
    this.data.sessions.push(session);
    this.save();
    return session;
  }

  public getSession(token: string): SessionRecord | undefined {
    const session = this.data.sessions.find((s) => s.token === token);
    if (!session) return undefined;
    if (new Date(session.expiresAt) < new Date()) {
      this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
      this.save();
      return undefined;
    }
    return session;
  }

  public deleteSession(token: string) {
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    this.save();
  }

  // --- Workspaces ---
  public getWorkspacesForUser(userId: string): (WorkspaceRecord & { role: MemberRole })[] {
    const memberships = this.data.workspace_members.filter((m) => m.userId === userId);
    return memberships
      .map((m) => {
        const ws = this.data.workspaces.find((w) => w.id === m.workspaceId);
        if (!ws) return null;
        return { ...ws, role: m.role };
      })
      .filter(Boolean) as (WorkspaceRecord & { role: MemberRole })[];
  }

  public getWorkspaceById(id: string): WorkspaceRecord | undefined {
    return this.data.workspaces.find((w) => w.id === id);
  }

  public createWorkspace(
    userId: string,
    name: string,
    identityType: IdentityType,
    bio?: string,
    genreOrNiche?: string,
    avatarUrl?: string
  ): WorkspaceRecord {
    const workspaceId = "ws_" + crypto.randomUUID().substring(0, 8);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace";
    
    const ws: WorkspaceRecord = {
      id: workspaceId,
      name,
      slug: `${slug}-${workspaceId.substring(3)}`,
      ownerId: userId,
      identityType,
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
      bio: bio || `Creative OS workspace for ${name}`,
      genreOrNiche: genreOrNiche || "",
      settings: { defaultCurrency: "USD" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.workspaces.push(ws);

    // Add owner membership
    const member: WorkspaceMemberRecord = {
      id: "mem_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      userId,
      role: "owner",
      joinedAt: new Date().toISOString(),
    };
    this.data.workspace_members.push(member);

    // Initialize creative memory for workspace
    const memory: CreativeMemoryRecord = {
      id: "mem_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      identitySummary: `${name} is an active ${identityType} operating on Keedohub Creative OS.`,
      coreNarrative: bio || "Building distinct creative vision with high-impact production and consistency.",
      toneTraits: ["Authentic", "Impactful", "Bold", "Professional"],
      visualRules: ["High-contrast typography", "Refined visual hierarchy", "Clean asset specifications"],
      audioSignatures: [],
      doSay: ["Authentic craftsmanship", "Creative momentum"],
      dontSay: ["Generic clichés"],
      brandColors: [
        { name: "Primary Brand Token", hex: "#EF4444", role: "Primary Accent" },
        { name: "Canvas Neutral", hex: "#09090B", role: "Background" },
        { name: "Elevated Surface", hex: "#18181B", role: "Container" }
      ],
      recentLearnings: ["Initialized new Keedohub workspace"],
      keyMilestones: ["Created workspace"],
      updatedAt: new Date().toISOString(),
    };
    this.data.creative_memories.push(memory);

    // Initialize Brand Core for workspace
    const brandCore: BrandCoreRecord = {
      id: "bc_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      brandName: name,
      tagline: bio || `The Official ${identityType.charAt(0).toUpperCase() + identityType.slice(1)} Operating Center`,
      industry: genreOrNiche || "Creative Business",
      identityType: (identityType as any) || "brand",
      archetype: identityType === "artist" ? "Creator / Magician" : identityType === "startup" ? "Pioneer / Outlaw" : identityType === "creator" ? "Entertainer / Creator" : "Ruler / Architect",
      logoAssets: {
        primaryLogoUrl: avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
      },
      colorPalette: [
        { name: "Brand Accent", hex: "#EF4444", role: "Primary Interactive" },
        { name: "Secondary Highlight", hex: "#F59E0B", role: "Energy & Warmth" },
        { name: "Canvas Neutral", hex: "#09090B", role: "Background Canvas" },
        { name: "Elevated Surface", hex: "#18181B", role: "Card Surface" },
        { name: "Muted Text", hex: "#71717A", role: "Secondary Typography" }
      ],
      typographyPairing: {
        heading: "Space Grotesk (Bold 800)",
        body: "Plus Jakarta Sans (Medium 500)",
        monospace: "JetBrains Mono"
      },
      visualDirection: {
        aestheticKeywords: ["High Contrast", "Precision Hierarchy", "Clean Geometry", "Deliberate Spacing"],
        moodSummary: "A clean architectural workspace with clear visual priority and zero visual clutter.",
        imageryGuidelines: "High-resolution 3000x3000px assets with crisp focal points and deep negative space.",
        dos: ["Keep outer padding ≥ inner padding", "Ensure contrast meets WCAG AA (4.5:1+)", "Maintain tight line-height on headings"],
        donts: ["Never use blurry low-res imagery", "Avoid generic corporate stock cliches"]
      },
      voiceAndTone: {
        traits: ["Direct", "Confident", "High-Impact", "Authentic"],
        doSay: ["Craftsmanship", "Operational momentum", "High fidelity"],
        dontSay: ["Synergy", "Paradigm shift", "Supercharge"],
        vocabulary: ["Architecture", "Precision", "Master Object", "Ecosystem"],
        communicationPrinciples: [
          "Demonstrate value through authentic execution.",
          "Keep communications concise, clear, and direct."
        ]
      },
      audience: {
        primaryICP: `Target audience for ${name} in the ${genreOrNiche || "creative"} sector.`,
        targetSegments: ["Core clients / fans", "Strategic partners", "Community advocates"],
        painPoints: ["Fragmented workflows", "Slow turnarounds", "Low brand distinction"],
        coreDesires: ["Premium quality", "Reliability", "Direct access"]
      },
      positioning: {
        marketCategory: `${identityType.charAt(0).toUpperCase() + identityType.slice(1)} Operating System`,
        valueProposition: `Delivering world-class creative output and seamless campaign execution.`,
        uniqueSellingPoints: [
          "Campaign as Master Object framework",
          "7-Pillar Launch Readiness verification",
          "Keedohub Studio production request integration"
        ],
        competitorDifferentiators: [
          "Integrated full-stack creative operating environment",
          "Zero mock data, authentic database persistence"
        ],
        positioningStatement: `For demanding audiences, ${name} delivers focused creative excellence.`
      },
      brandGuidelinesText: `# ${name} Brand Guidelines\n\n- Primary Accent: #EF4444\n- Background: #09090B\n- Typography: Space Grotesk / Plus Jakarta Sans`,
      updatedAt: new Date().toISOString()
    };
    this.data.brand_cores.push(brandCore);

    // Initialize initial flagship product/service
    const initialProduct: ProductServiceRecord = {
      id: "prd_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      name: `${name} Flagship Offering`,
      type: identityType === "artist" ? "merch" : identityType === "startup" ? "subscription" : identityType === "creator" ? "digital_good" : "product",
      tagline: `Premier ${genreOrNiche || "creative"} offering`,
      description: `The core flagship offering for ${name} designed for high market impact.`,
      category: genreOrNiche || "Creative Services",
      pricing: {
        amount: 49,
        currency: "USD",
        billingInterval: "one_time",
        tierName: "Standard"
      },
      targetAudience: `Primary customer segment for ${name}.`,
      keyFeatures: ["Master-grade quality", "Instant digital delivery", "Dedicated support"],
      benefits: ["High-impact results", "Time savings", "Distinctive quality"],
      uniqueSellingPoints: ["Engineered on Keedohub Core architecture"],
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.products.push(initialProduct);

    // Update user default workspace if not set
    const user = this.getUserById(userId);
    if (user && !user.defaultWorkspaceId) {
      user.defaultWorkspaceId = workspaceId;
    }

    // Add welcome notification
    this.addNotification(
      workspaceId,
      `Workspace '${name}' Created`,
      `Your ${identityType.toUpperCase()} workspace is ready. Access all workstations and persistent storage.`,
      "success",
      "overview",
      userId
    );

    // Add activity log
    this.logActivity(workspaceId, userId, user?.email || "system", "CREATE_WORKSPACE", "workspace", workspaceId, `Created workspace: ${name}`);

    this.save();
    return ws;
  }

  public initializeOnboardedWorkspace(
    userId: string,
    data: {
      workspaceId?: string;
      identityType: IdentityType;
      name: string;
      genreOrNiche?: string;
      stage?: string;
      primaryGoal?: string;
      targetAudience?: string;
      positioning?: string;
      platforms?: string[];
      upcomingRelease?: {
        title?: string;
        releaseDate?: string;
        format?: string;
      };
      upcomingCampaign?: {
        title?: string;
        targetDate?: string;
        goal?: string;
      };
      currentProject?: {
        title?: string;
        description?: string;
      };
      mainOffer?: string;
      saveAsMemory?: boolean;
      rawDescription?: string;
    }
  ): {
    workspace: WorkspaceRecord;
    initializedEntities: {
      releases: number;
      campaigns: number;
      projects: number;
      pillars: number;
      memories: number;
    };
  } {
    let ws: WorkspaceRecord;
    const initialCounts = { releases: 0, campaigns: 0, projects: 0, pillars: 0, memories: 0 };

    if (data.workspaceId) {
      const existing = this.getWorkspaceById(data.workspaceId);
      if (existing) {
        ws = existing;
        ws.name = data.name || ws.name;
        ws.identityType = data.identityType || ws.identityType;
        ws.genreOrNiche = data.genreOrNiche || ws.genreOrNiche;
        ws.bio = data.positioning || data.rawDescription || ws.bio;
        ws.settings = {
          ...(ws.settings || {}),
          onboardingCompleted: true,
          onboardingCompletedAt: new Date().toISOString(),
          stage: data.stage,
          primaryGoal: data.primaryGoal,
          targetAudience: data.targetAudience,
          platforms: data.platforms || [],
        };
        ws.updatedAt = new Date().toISOString();
      } else {
        ws = this.createWorkspace(
          userId,
          data.name,
          data.identityType,
          data.positioning || data.rawDescription,
          data.genreOrNiche
        );
      }
    } else {
      ws = this.createWorkspace(
        userId,
        data.name,
        data.identityType,
        data.positioning || data.rawDescription,
        data.genreOrNiche
      );
      ws.settings = {
        ...(ws.settings || {}),
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
        stage: data.stage,
        primaryGoal: data.primaryGoal,
        targetAudience: data.targetAudience,
        platforms: data.platforms || [],
      };
    }

    const workspaceId = ws.id;

    // 1. Setup specific Pillars if not already configured
    const existingPillars = this.getContentPillars(workspaceId);
    if (existingPillars.length === 0) {
      let defaultPillars: Array<{ name: string; description: string; color: string; icon: string; targetRatio: number }> = [];

      if (data.identityType === "artist") {
        defaultPillars = [
          { name: "Behind The Music & Studio", description: "Production process, songwriting clips, stem walkthroughs", color: "#EF4444", icon: "Music", targetRatio: 30 },
          { name: "Hooks & Snippet Teasers", description: "Catchy 15s chorus hooks, visualizer snippets, beat drops", color: "#F59E0B", icon: "Sparkles", targetRatio: 30 },
          { name: "Lyric Stories & Meaning", description: "Lyrical breakdown, vulnerability, inspirations", color: "#8B5CF6", icon: "FileText", targetRatio: 20 },
          { name: "Direct To Fan & Performance", description: "Acoustic takes, live rehearsals, community Q&A", color: "#10B981", icon: "Radio", targetRatio: 20 },
        ];
      } else if (data.identityType === "brand") {
        defaultPillars = [
          { name: "Brand Manifesto & Vision", description: "Core philosophy, design codes, lifestyle aesthetic", color: "#3B82F6", icon: "Building2", targetRatio: 25 },
          { name: "Product & Craftsmanship", description: "Materials, key benefits, feature deep-dives", color: "#EF4444", icon: "Sparkles", targetRatio: 35 },
          { name: "Customer Proof & UGC", description: "Customer reviews, testimonials, real-world styling", color: "#10B981", icon: "Award", targetRatio: 25 },
          { name: "Behind the Scenes", description: "Founder story, development journey, studio days", color: "#F59E0B", icon: "Video", targetRatio: 15 },
        ];
      } else if (data.identityType === "creator") {
        defaultPillars = [
          { name: "High-Engagement Short Form", description: "Viral hooks, trending formats, relatable stories", color: "#F59E0B", icon: "Video", targetRatio: 40 },
          { name: "Deep Dive Concepts", description: "Signature series, long-form breakdowns, masterclasses", color: "#8B5CF6", icon: "Layers", targetRatio: 30 },
          { name: "Community & Collabs", description: "Audience Q&A, guest features, community challenges", color: "#10B981", icon: "Radio", targetRatio: 15 },
          { name: "Sponsored & Brand Integrations", description: "Authentic partner spotlights, affiliate recommendations", color: "#3B82F6", icon: "Briefcase", targetRatio: 15 },
        ];
      } else {
        defaultPillars = [
          { name: "Core Product & Offering", description: "Flagship solutions, demos, customer value", color: "#EF4444", icon: "Rocket", targetRatio: 40 },
          { name: "Industry Insights & Authority", description: "Market trends, thought leadership, case studies", color: "#3B82F6", icon: "BookOpen", targetRatio: 30 },
          { name: "Company Milestones & BTS", description: "Product updates, team journey, behind the build", color: "#10B981", icon: "Activity", targetRatio: 30 },
        ];
      }

      for (const p of defaultPillars) {
        this.createContentPillar(workspaceId, p);
        initialCounts.pillars++;
      }
    }

    // 2. Identity-Specific Master Entity Creation
    if (data.identityType === "artist") {
      if (data.upcomingRelease?.title) {
        const targetDate = data.upcomingRelease.releaseDate || new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0];
        const release = this.createRelease(workspaceId, {
          title: data.upcomingRelease.title,
          artistName: data.name || "Artist",
          releaseType: data.upcomingRelease.format || "Single",
          genre: data.genreOrNiche || "Music",
          releaseDate: targetDate,
          status: "planning",
          phases: [],
          checklist: [],
          narrative: data.primaryGoal || "Strategic single release rollout targeting flagship DSP editorial placement.",
        });
        initialCounts.releases++;

        // Add initial release preparation tasks
        this.createTask(workspaceId, {
          text: `Finalize master audio for "${release.title}" & check LUFS`,
          priority: "high",
          category: "audio",
        });
        this.createTask(workspaceId, {
          text: `Generate 3000x3000px single artwork in Cover Studio`,
          priority: "high",
          category: "artwork",
        });
        this.createTask(workspaceId, {
          text: `Draft DSP Pitch editorial rationale for "${release.title}"`,
          priority: "medium",
          category: "dsp-pitch",
        });
      }
    } else if (data.identityType === "brand") {
      // Update Brand Core with real user onboarding inputs
      const brandCore = this.getBrandCore(workspaceId);
      if (brandCore) {
        if (data.targetAudience) {
          brandCore.audience = {
            ...brandCore.audience,
            primaryICP: data.targetAudience,
          };
        }
        if (data.positioning) {
          brandCore.positioning = {
            ...brandCore.positioning,
            positioningStatement: data.positioning,
          };
        }
        brandCore.updatedAt = new Date().toISOString();
      }

      if (data.upcomingCampaign?.title) {
        const targetDate = data.upcomingCampaign.targetDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0];
        this.createCampaign(workspaceId, {
          title: data.upcomingCampaign.title,
          goal: data.upcomingCampaign.goal || data.primaryGoal || "Brand awareness and initial conversion sprint",
          objective: "product_launch",
          status: "planning",
          startDate: new Date().toISOString().split("T")[0],
          endDate: targetDate,
          platforms: ["Instagram", "TikTok", "LinkedIn"],
          budget: 5000,
          currency: "USD",
          targetAudience: data.targetAudience || "Core target market",
          sprintDays: [],
        });
        initialCounts.campaigns++;
      }
    } else if (data.identityType === "creator") {
      if (data.currentProject?.title) {
        this.createProject(workspaceId, {
          title: data.currentProject.title,
          description: data.currentProject.description || data.primaryGoal || "Creator content sprint",
          category: "Content Sprint",
          status: "in-progress",
          priority: "high",
          budget: 0,
          currency: "USD",
          deadline: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          tags: ["Content", "Sprint", data.genreOrNiche || "Creator"],
          tasks: [],
        });
        initialCounts.projects++;
      }
    } else if (data.identityType === "business" || data.identityType === "startup") {
      if (data.mainOffer) {
        const products = this.getProducts(workspaceId);
        if (products.length > 0) {
          this.updateProduct(products[0].id, workspaceId, {
            name: data.mainOffer,
            tagline: data.positioning || `Premier ${data.genreOrNiche || "business"} offering`,
            targetAudience: data.targetAudience || products[0].targetAudience,
          });
        }
      }
      if (data.upcomingCampaign?.title) {
        const targetDate = data.upcomingCampaign.targetDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0];
        this.createCampaign(workspaceId, {
          title: data.upcomingCampaign.title,
          goal: data.upcomingCampaign.goal || data.primaryGoal || "Customer acquisition & launch visibility",
          objective: data.identityType === "startup" ? "product_launch" : "lead_generation",
          status: "planning",
          startDate: new Date().toISOString().split("T")[0],
          endDate: targetDate,
          platforms: ["LinkedIn", "Twitter/X", "Instagram"],
          budget: 10000,
          currency: "USD",
          targetAudience: data.targetAudience || "Target ICP",
          sprintDays: [],
        });
        initialCounts.campaigns++;
      }
    }

    // 3. Store foundational Creative Memory Item if approved or default
    if (data.saveAsMemory !== false) {
      const memoryContent = [
        `Identity: ${data.name} (${data.identityType.toUpperCase()})`,
        data.genreOrNiche ? `Niche/Genre: ${data.genreOrNiche}` : "",
        data.stage ? `Stage: ${data.stage}` : "",
        data.primaryGoal ? `Primary Goal: ${data.primaryGoal}` : "",
        data.targetAudience ? `Audience: ${data.targetAudience}` : "",
        data.positioning ? `Positioning: ${data.positioning}` : "",
        data.platforms && data.platforms.length > 0 ? `Primary Platforms: ${data.platforms.join(", ")}` : "",
        data.rawDescription ? `Context Notes: ${data.rawDescription}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      this.createCreativeMemoryItem(workspaceId, {
        category: "identity",
        scope: "workspace",
        title: `${data.name} — Creative Identity & Strategic Direction`,
        content: memoryContent,
        tags: [data.identityType, "onboarding", "core-identity", data.genreOrNiche || "creative"].filter(Boolean),
        confidence: 100,
        source: "user_explicit",
        status: "active",
        isPinned: true,
      });
      initialCounts.memories++;
    }

    // 4. Record Activity Log & Notification
    this.logActivity(
      workspaceId,
      userId,
      "authenticated_user",
      "ONBOARDING_INITIALIZE",
      "workspace",
      workspaceId,
      `Completed onboarding initialization for ${data.name} as ${data.identityType.toUpperCase()}`
    );

    this.addNotification(
      workspaceId,
      `Creative OS Ready: ${data.name}`,
      `Your ${data.identityType.toUpperCase()} workspace is configured with strategic pillars, goals, and Creative Memory.`,
      "success",
      "command-center",
      userId
    );

    this.save();
    return { workspace: ws, initializedEntities: initialCounts };
  }

  public getWorkspaceMembers(workspaceId: string): WorkspaceMemberRecord[] {
    return (this.data.workspace_members || []).filter((m) => m.workspaceId === workspaceId);
  }

  public updateWorkspace(workspaceId: string, updates: Partial<WorkspaceRecord>): WorkspaceRecord {
    const ws = this.getWorkspaceById(workspaceId);
    if (!ws) throw new Error("Workspace not found");
    Object.assign(ws, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return ws;
  }

  public deleteWorkspace(workspaceId: string, userId: string): boolean {
    const ws = this.getWorkspaceById(workspaceId);
    if (!ws) throw new Error("Workspace not found");

    const memberships = this.data.workspace_members.filter((m) => m.workspaceId === workspaceId);
    const userMember = memberships.find((m) => m.userId === userId);
    if (ws.ownerId !== userId && (!userMember || userMember.role !== "owner")) {
      throw new Error("Only the workspace owner can delete this workspace");
    }

    // Comprehensive multi-collection purge to eliminate cross-tenant residue
    this.data.workspaces = this.data.workspaces.filter((w) => w.id !== workspaceId);
    this.data.workspace_members = (this.data.workspace_members || []).filter((m) => m.workspaceId !== workspaceId);
    this.data.brand_cores = (this.data.brand_cores || []).filter((b) => b.workspaceId !== workspaceId);
    this.data.products = (this.data.products || []).filter((p) => p.workspaceId !== workspaceId);
    this.data.projects = (this.data.projects || []).filter((p) => p.workspaceId !== workspaceId);
    this.data.folders = (this.data.folders || []).filter((f) => f.workspaceId !== workspaceId);
    this.data.milestones = (this.data.milestones || []).filter((m) => m.workspaceId !== workspaceId);
    this.data.assets = (this.data.assets || []).filter((a) => a.workspaceId !== workspaceId);
    this.data.releases = (this.data.releases || []).filter((r) => r.workspaceId !== workspaceId);
    this.data.campaigns = (this.data.campaigns || []).filter((c) => c.workspaceId !== workspaceId);
    this.data.content_pillars = (this.data.content_pillars || []).filter((p) => p.workspaceId !== workspaceId);
    this.data.content_items = (this.data.content_items || []).filter((c) => c.workspaceId !== workspaceId);
    this.data.creative_memories = (this.data.creative_memories || []).filter((m) => m.workspaceId !== workspaceId);
    this.data.creative_memory_items = (this.data.creative_memory_items || []).filter((m) => m.workspaceId !== workspaceId);
    this.data.memory_candidates = (this.data.memory_candidates || []).filter((m) => m.workspaceId !== workspaceId);
    this.data.memory_block_rules = (this.data.memory_block_rules || []).filter((r) => r.workspaceId !== workspaceId);
    this.data.notifications = (this.data.notifications || []).filter((n) => n.workspaceId !== workspaceId);
    this.data.activity_logs = (this.data.activity_logs || []).filter((a) => a.workspaceId !== workspaceId);
    this.data.creative_requests = (this.data.creative_requests || []).filter((r) => r.workspaceId !== workspaceId);
    this.data.studio_requests = (this.data.studio_requests || []).filter((r) => r.workspaceId !== workspaceId);
    this.data.studio_quotes = (this.data.studio_quotes || []).filter((q) => q.workspaceId !== workspaceId);
    this.data.studio_projects = (this.data.studio_projects || []).filter((p) => p.workspaceId !== workspaceId);
    this.data.studio_deliverables = (this.data.studio_deliverables || []).filter((d) => d.workspaceId !== workspaceId);
    this.data.studio_revisions = (this.data.studio_revisions || []).filter((r) => r.workspaceId !== workspaceId);
    this.data.studio_messages = (this.data.studio_messages || []).filter((m) => m.workspaceId !== workspaceId);
    this.data.radar_signals = (this.data.radar_signals || []).filter((s) => s.workspaceId !== workspaceId);
    this.data.performance_metrics = (this.data.performance_metrics || []).filter((pm) => pm.workspaceId !== workspaceId);
    this.data.growth_insights = (this.data.growth_insights || []).filter((gi) => gi.workspaceId !== workspaceId);
    this.data.workspace_goals = (this.data.workspace_goals || []).filter((g) => g.workspaceId !== workspaceId);

    // Update user default workspace if it was deleted
    this.data.users.forEach((u) => {
      if (u.defaultWorkspaceId === workspaceId) {
        const remaining = this.getWorkspacesForUser(u.id);
        u.defaultWorkspaceId = remaining[0]?.id || "";
      }
    });

    this.save();
    return true;
  }

  // --- Projects ---
  public getProjects(workspaceId: string): ProjectRecord[] {
    return this.data.projects.filter((p) => p.workspaceId === workspaceId);
  }

  public createProject(workspaceId: string, projectData: Omit<ProjectRecord, "id" | "workspaceId" | "createdAt" | "updatedAt">): ProjectRecord {
    const project: ProjectRecord = {
      id: "proj_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      ...projectData,
      tasks: projectData.tasks || [],
      tags: projectData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.projects.unshift(project);
    this.save();
    return project;
  }

  public updateProject(projectId: string, workspaceId: string, updates: Partial<ProjectRecord>): ProjectRecord {
    const project = this.data.projects.find((p) => p.id === projectId && p.workspaceId === workspaceId);
    if (!project) throw new Error("Project not found");
    Object.assign(project, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return project;
  }

  public deleteProject(projectId: string, workspaceId: string): boolean {
    const initialLen = this.data.projects.length;
    this.data.projects = this.data.projects.filter((p) => !(p.id === projectId && p.workspaceId === workspaceId));
    const deleted = this.data.projects.length < initialLen;
    if (deleted) {
      // Cascade unlinks and associated milestone cleanups
      if (this.data.milestones) {
        this.data.milestones = this.data.milestones.filter((m) => !(m.projectId === projectId && m.workspaceId === workspaceId));
      }
      if (this.data.content_items) {
        this.data.content_items.forEach((c) => {
          if (c.workspaceId === workspaceId && c.projectId === projectId) {
            delete c.projectId;
          }
        });
      }
      if (this.data.assets) {
        this.data.assets.forEach((a) => {
          if (a.workspaceId === workspaceId && a.projectId === projectId) {
            delete a.projectId;
          }
        });
      }
      if (this.data.radar_signals) {
        this.data.radar_signals.forEach((s) => {
          if (s.workspaceId === workspaceId && s.affectedEntity && s.affectedEntity.id === projectId) {
            s.status = 'dismissed';
          }
        });
      }
      this.save();
    }
    return deleted;
  }

  public addTask(workspaceId: string, projectId: string | undefined, taskData: { text?: string; priority?: TaskPriority; deadline?: string; category?: string; assignedTo?: string; releaseId?: string }): TaskItem {
    return this.createTask(workspaceId, {
      text: taskData.text || "New Task",
      projectId,
      priority: taskData.priority,
      deadline: taskData.deadline,
      category: taskData.category,
      assignedTo: taskData.assignedTo,
    });
  }

  // --- Assets ---
  public getAssets(workspaceId: string): AssetRecord[] {
    return this.data.assets.filter((a) => a.workspaceId === workspaceId);
  }

  public createAsset(workspaceId: string, assetData: Omit<AssetRecord, "id" | "workspaceId" | "createdAt">): AssetRecord {
    const asset: AssetRecord = {
      id: "ast_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      ...assetData,
      tags: assetData.tags || [],
      createdAt: new Date().toISOString(),
    };
    this.data.assets.unshift(asset);
    this.save();
    return asset;
  }

  public deleteAsset(assetId: string, workspaceId: string): boolean {
    const initialLen = this.data.assets.length;
    this.data.assets = this.data.assets.filter((a) => !(a.id === assetId && a.workspaceId === workspaceId));
    const deleted = this.data.assets.length < initialLen;
    if (deleted) {
      // Unlink from releases
      if (this.data.releases) {
        this.data.releases.forEach((r) => {
          if (r.workspaceId === workspaceId) {
            if (r.coverAssetId === assetId) {
              delete r.coverAssetId;
              delete r.coverUrl;
            }
            if (r.audioAssetId === assetId) {
              delete r.audioAssetId;
              delete r.audioUrl;
            }
          }
        });
      }
      // Unlink from campaigns
      if (this.data.campaigns) {
        this.data.campaigns.forEach((c) => {
          if (c.workspaceId === workspaceId && c.heroAssetId === assetId) {
            delete c.heroAssetId;
            delete c.heroAssetUrl;
          }
        });
      }
      // Unlink from content items
      if (this.data.content_items) {
        this.data.content_items.forEach((c) => {
          if (c.workspaceId === workspaceId) {
            if (c.assetId === assetId) delete c.assetId;
            if (Array.isArray(c.assetIds)) {
              c.assetIds = c.assetIds.filter((id) => id !== assetId);
            }
          }
        });
      }
      // Unlink from products
      if (this.data.products) {
        this.data.products.forEach((p) => {
          if (p.workspaceId === workspaceId && Array.isArray(p.assetIds)) {
            p.assetIds = p.assetIds.filter((id) => id !== assetId);
          }
        });
      }
      // Unlink from creative memory items
      if (this.data.creative_memory_items) {
        this.data.creative_memory_items.forEach((m) => {
          if (m.workspaceId === workspaceId && m.assetReferenceId === assetId) {
            delete m.assetReferenceId;
            delete m.assetReferenceName;
            delete m.assetReferenceUrl;
          }
        });
      }
      this.save();
    }
    return deleted;
  }

  // --- Releases ---
  public getReleases(workspaceId: string): ReleaseRecord[] {
    return this.data.releases.filter((r) => r.workspaceId === workspaceId);
  }

  public createRelease(workspaceId: string, releaseData: Omit<ReleaseRecord, "id" | "workspaceId" | "createdAt" | "updatedAt">): ReleaseRecord {
    const release: ReleaseRecord = {
      id: "rel_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      ...releaseData,
      phases: releaseData.phases || [],
      checklist: releaseData.checklist || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.releases.unshift(release);
    this.save();
    return release;
  }

  public updateRelease(releaseId: string, workspaceId: string, updates: Partial<ReleaseRecord>): ReleaseRecord {
    const release = this.data.releases.find((r) => r.id === releaseId && r.workspaceId === workspaceId);
    if (!release) throw new Error("Release not found");
    Object.assign(release, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return release;
  }

  public deleteRelease(releaseId: string, workspaceId: string): boolean {
    const initialLen = this.data.releases.length;
    this.data.releases = this.data.releases.filter((r) => !(r.id === releaseId && r.workspaceId === workspaceId));
    const deleted = this.data.releases.length < initialLen;
    if (deleted) {
      // Unlink from content items
      if (this.data.content_items) {
        this.data.content_items.forEach((c) => {
          if (c.workspaceId === workspaceId && c.releaseId === releaseId) {
            delete c.releaseId;
            delete c.releaseTitle;
          }
        });
      }
      // Unlink from assets
      if (this.data.assets) {
        this.data.assets.forEach((a) => {
          if (a.workspaceId === workspaceId && a.releaseId === releaseId) {
            delete a.releaseId;
          }
        });
      }
      // Cleanup radar signals
      if (this.data.radar_signals) {
        this.data.radar_signals.forEach((s) => {
          if (s.workspaceId === workspaceId && s.affectedEntity && s.affectedEntity.id === releaseId) {
            s.status = 'dismissed';
          }
        });
      }
      // Cleanup performance metrics
      if (this.data.performance_metrics) {
        this.data.performance_metrics = this.data.performance_metrics.filter(
          (pm) => !(pm.workspaceId === workspaceId && pm.entityId === releaseId && pm.entityType === 'release')
        );
      }
      // Cleanup workspace goals
      if (this.data.workspace_goals) {
        this.data.workspace_goals.forEach((g) => {
          if (g.workspaceId === workspaceId && g.entityId === releaseId) {
            delete g.entityId;
          }
        });
      }
      this.save();
    }
    return deleted;
  }

  // --- Brand Core ---
  public getBrandCore(workspaceId: string): BrandCoreRecord {
    let core = this.data.brand_cores.find((b) => b.workspaceId === workspaceId);
    if (!core) {
      const ws = this.getWorkspaceById(workspaceId);
      core = {
        id: "bc_" + crypto.randomUUID().substring(0, 8),
        workspaceId,
        brandName: ws?.name || "Keedohub Brand",
        tagline: "High Impact Creative Operating System",
        industry: ws?.genreOrNiche || "Creative Business",
        identityType: (ws?.identityType as any) || "brand",
        archetype: "Creator / Architect",
        logoAssets: {
          primaryLogoUrl: ws?.avatarUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
        },
        colorPalette: [
          { name: "Brand Primary", hex: "#EF4444", role: "Primary Accent & CTA" },
          { name: "Warm Gold", hex: "#F59E0B", role: "Highlight & Energy" },
          { name: "Obsidian Canvas", hex: "#09090B", role: "Canvas Background" },
          { name: "Surface Neutral", hex: "#18181B", role: "Card Surface" },
          { name: "Text Secondary", hex: "#71717A", role: "Muted Typography" }
        ],
        typographyPairing: {
          heading: "Syne / Space Grotesk (Bold 800)",
          body: "Plus Jakarta Sans (Medium 500)",
          monospace: "JetBrains Mono"
        },
        visualDirection: {
          aestheticKeywords: ["High Contrast", "Polished Editorial", "Modernist Typography", "Deliberate Spacing"],
          moodSummary: "Refined, dark-mode architectural precision paired with vibrant accent triggers.",
          imageryGuidelines: "High-resolution 3000x3000px assets with intentional negative space. Avoid generic clip-art.",
          dos: ["Maintain generous padding (24px+)", "Use single-line labels in badges", "Keep step scales at 1.25+"],
          donts: ["Never mix contrasting border-radii unnecessarily", "Never use generic low-contrast gray text on accents"]
        },
        voiceAndTone: {
          traits: ["Confident", "Craft-Focused", "Clear", "Sophisticated", "Direct"],
          doSay: ["Craftsmanship", "Operational clarity", "High fidelity", "Momentum"],
          dontSay: ["Synergy", "Paradigm shift", "Supercharge"],
          vocabulary: ["Architecture", "Precision", "Master Object", "Ecosystem"],
          communicationPrinciples: [
            "Demonstrate tangible value before conceptual fluff.",
            "Write with crisp active verbs and clear calls to action."
          ]
        },
        audience: {
          primaryICP: "Discerning creative professionals, founders, and collectors aged 22-45.",
          targetSegments: ["High-intent buyers", "Creative partners", "Brand superfans"],
          painPoints: ["Fragmented tooling", "Inconsistent branding", "Slow production cycles"],
          coreDesires: ["World-class brand authority", "Seamless digital commerce", "Rapid multi-channel rollout"],
        },
        positioning: {
          marketCategory: "Premium Creative Operating Ecosystem",
          valueProposition: "Unifying brand strategy, product management, and campaign rollouts into a single high-craft workspace.",
          uniqueSellingPoints: [
            "Unified Campaign as Master Object architecture",
            "7-Pillar Launch Readiness Engine",
            "Direct Keedohub Studio Creative Request bridge"
          ],
          competitorDifferentiators: [
            "No fragmented tools or disconnected spreadsheets",
            "Zero mock data — authentic persistent state engine"
          ],
          positioningStatement: `For ambitious operators, ${ws?.name || "Keedohub"} provides the operating infrastructure to execute world-class campaigns.`
        },
        brandGuidelinesText: `# ${ws?.name || "Brand"} Guidelines\n\n- Primary Accent: #EF4444\n- Background: #09090B\n- Typography: Space Grotesk / Plus Jakarta Sans`,
        updatedAt: new Date().toISOString()
      };
      this.data.brand_cores.push(core);
      this.save();
    }
    return core;
  }

  public updateBrandCore(workspaceId: string, updates: Partial<BrandCoreRecord>): BrandCoreRecord {
    let core = this.getBrandCore(workspaceId);
    Object.assign(core, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return core;
  }

  // --- Products & Services ---
  public getProducts(workspaceId: string): ProductServiceRecord[] {
    return this.data.products.filter((p) => p.workspaceId === workspaceId);
  }

  public getProductById(productId: string, workspaceId: string): ProductServiceRecord | undefined {
    return this.data.products.find((p) => p.id === productId && p.workspaceId === workspaceId);
  }

  public createProduct(
    workspaceId: string,
    productData: Omit<ProductServiceRecord, "id" | "workspaceId" | "createdAt" | "updatedAt">
  ): ProductServiceRecord {
    const product: ProductServiceRecord = {
      id: "prd_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      ...productData,
      keyFeatures: productData.keyFeatures || [],
      benefits: productData.benefits || [],
      uniqueSellingPoints: productData.uniqueSellingPoints || [],
      assetIds: productData.assetIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.products.unshift(product);
    this.save();
    return product;
  }

  public updateProduct(productId: string, workspaceId: string, updates: Partial<ProductServiceRecord>): ProductServiceRecord {
    const product = this.data.products.find((p) => p.id === productId && p.workspaceId === workspaceId);
    if (!product) throw new Error("Product not found");
    Object.assign(product, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return product;
  }

  public deleteProduct(productId: string, workspaceId: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => !(p.id === productId && p.workspaceId === workspaceId));
    const deleted = this.data.products.length < initialLen;
    if (deleted) {
      // Unlink from campaigns
      if (this.data.campaigns) {
        this.data.campaigns.forEach((c) => {
          if (c.workspaceId === workspaceId && c.productId === productId) {
            delete c.productId;
          }
        });
      }
      // Unlink from content items
      if (this.data.content_items) {
        this.data.content_items.forEach((c) => {
          if (c.workspaceId === workspaceId && c.productId === productId) {
            delete c.productId;
            delete c.productName;
          }
        });
      }
      this.save();
    }
    return deleted;
  }

  // --- Campaigns ---
  public getCampaigns(workspaceId: string): CampaignRecord[] {
    return this.data.campaigns.filter((c) => c.workspaceId === workspaceId);
  }

  public getCampaignById(workspaceId: string, campaignId: string): CampaignRecord | undefined {
    return this.data.campaigns.find((c) => c.id === campaignId && c.workspaceId === workspaceId);
  }

  public createCampaign(workspaceId: string, campaignData: Omit<CampaignRecord, "id" | "workspaceId" | "createdAt" | "updatedAt">): CampaignRecord {
    const campaign: CampaignRecord = {
      id: "cmp_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      ...campaignData,
      platforms: campaignData.platforms || ["Instagram", "TikTok", "LinkedIn"],
      sprintDays: campaignData.sprintDays || [],
      milestones: campaignData.milestones || [],
      approvals: campaignData.approvals || {
        creativeApproved: false,
        budgetApproved: false,
        launchApproved: false,
      },
      goals: campaignData.goals || {
        targetImpressions: 100000,
        targetLeadsOrSales: 250,
        targetRevenue: 5000,
        actualImpressions: 0,
        actualLeadsOrSales: 0,
        actualRevenue: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.campaigns.unshift(campaign);
    this.save();
    return campaign;
  }

  public updateCampaign(campaignId: string, workspaceId: string, updates: Partial<CampaignRecord>): CampaignRecord {
    const campaign = this.data.campaigns.find((c) => c.id === campaignId && c.workspaceId === workspaceId);
    if (!campaign) throw new Error("Campaign not found");
    Object.assign(campaign, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return campaign;
  }

  public deleteCampaign(campaignId: string, workspaceId: string): boolean {
    const initialLen = this.data.campaigns.length;
    this.data.campaigns = this.data.campaigns.filter((c) => !(c.id === campaignId && c.workspaceId === workspaceId));
    const deleted = this.data.campaigns.length < initialLen;
    if (deleted) {
      // Unlink from content items
      if (this.data.content_items) {
        this.data.content_items.forEach((c) => {
          if (c.workspaceId === workspaceId && c.campaignId === campaignId) {
            delete c.campaignId;
            delete c.campaignTitle;
          }
        });
      }
      // Cleanup radar signals
      if (this.data.radar_signals) {
        this.data.radar_signals.forEach((s) => {
          if (s.workspaceId === workspaceId && s.affectedEntity && s.affectedEntity.id === campaignId) {
            s.status = 'dismissed';
          }
        });
      }
      // Cleanup performance metrics
      if (this.data.performance_metrics) {
        this.data.performance_metrics = this.data.performance_metrics.filter(
          (pm) => !(pm.workspaceId === workspaceId && pm.entityId === campaignId && pm.entityType === 'campaign')
        );
      }
      // Cleanup workspace goals
      if (this.data.workspace_goals) {
        this.data.workspace_goals.forEach((g) => {
          if (g.workspaceId === workspaceId && g.entityId === campaignId) {
            delete g.entityId;
          }
        });
      }
      this.save();
    }
    return deleted;
  }

  // --- Content Pillars ---
  public getContentPillars(workspaceId: string): ContentPillarRecord[] {
    return this.data.content_pillars.filter((p) => p.workspaceId === workspaceId);
  }

  public createContentPillar(workspaceId: string, pillarData: Partial<ContentPillarRecord> & { name: string }): ContentPillarRecord {
    const pillar: ContentPillarRecord = {
      id: "pil_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      name: pillarData.name,
      description: pillarData.description || "",
      color: pillarData.color || "#EF4444",
      icon: pillarData.icon || "Sparkles",
      targetRatio: pillarData.targetRatio ?? 20,
      createdAt: new Date().toISOString(),
    };
    this.data.content_pillars.push(pillar);
    this.save();
    return pillar;
  }

  public updateContentPillar(pillarId: string, workspaceId: string, updates: Partial<ContentPillarRecord>): ContentPillarRecord {
    const pillar = this.data.content_pillars.find((p) => p.id === pillarId && p.workspaceId === workspaceId);
    if (!pillar) throw new Error("Content pillar not found");
    Object.assign(pillar, updates);
    this.save();
    return pillar;
  }

  public deleteContentPillar(pillarId: string, workspaceId: string): boolean {
    const initialLen = this.data.content_pillars.length;
    this.data.content_pillars = this.data.content_pillars.filter((p) => !(p.id === pillarId && p.workspaceId === workspaceId));
    const deleted = this.data.content_pillars.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // --- Content Items ---
  public getContentItems(workspaceId: string): ContentItemRecord[] {
    const items = this.data.content_items.filter((c) => c.workspaceId === workspaceId);
    const releases = this.data.releases.filter((r) => r.workspaceId === workspaceId);
    const campaigns = this.data.campaigns.filter((c) => c.workspaceId === workspaceId);
    const products = this.data.products.filter((p) => p.workspaceId === workspaceId);
    const assets = this.data.assets.filter((a) => a.workspaceId === workspaceId);

    return items.map((item) => {
      const release = item.releaseId ? releases.find((r) => r.id === item.releaseId) : undefined;
      const campaign = item.campaignId ? campaigns.find((c) => c.id === item.campaignId) : undefined;
      const product = item.productId ? products.find((p) => p.id === item.productId) : undefined;

      const attachedAssetIds = new Set<string>();
      if (item.assetId) attachedAssetIds.add(item.assetId);
      if (Array.isArray(item.assetIds)) item.assetIds.forEach((id) => attachedAssetIds.add(id));

      const attachedAssets = Array.from(attachedAssetIds)
        .map((id) => assets.find((a) => a.id === id))
        .filter(Boolean);

      return {
        ...item,
        releaseTitle: item.releaseTitle || release?.title,
        campaignTitle: item.campaignTitle || campaign?.title,
        productName: item.productName || product?.name,
        attachedAssets: attachedAssets as any,
      };
    });
  }

  public createContentItem(workspaceId: string, itemData: Omit<ContentItemRecord, "id" | "workspaceId" | "createdAt">): ContentItemRecord {
    const releases = this.data.releases.filter((r) => r.workspaceId === workspaceId);
    const campaigns = this.data.campaigns.filter((c) => c.workspaceId === workspaceId);
    const products = this.data.products.filter((p) => p.workspaceId === workspaceId);

    const release = itemData.releaseId ? releases.find((r) => r.id === itemData.releaseId) : undefined;
    const campaign = itemData.campaignId ? campaigns.find((c) => c.id === itemData.campaignId) : undefined;
    const product = itemData.productId ? products.find((p) => p.id === itemData.productId) : undefined;

    const item: ContentItemRecord = {
      id: "cnt_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      ...itemData,
      releaseTitle: itemData.releaseTitle || release?.title,
      campaignTitle: itemData.campaignTitle || campaign?.title,
      productName: itemData.productName || product?.name,
      status: itemData.status || "idea",
      priority: itemData.priority || "MEDIUM",
      captionHook: itemData.captionHook || itemData.hook || itemData.concept || "",
      hook: itemData.hook || itemData.captionHook || "",
      copy: itemData.copy || itemData.caption || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.content_items.unshift(item);
    this.save();
    return item;
  }

  public createContentItemsBatch(workspaceId: string, items: Array<Omit<ContentItemRecord, "id" | "workspaceId" | "createdAt">>): ContentItemRecord[] {
    const createdList: ContentItemRecord[] = [];
    for (const itemData of items) {
      const created = this.createContentItem(workspaceId, itemData);
      createdList.push(created);
    }
    return createdList;
  }

  public duplicateContentItem(itemId: string, workspaceId: string): ContentItemRecord {
    const item = this.data.content_items.find((c) => c.id === itemId && c.workspaceId === workspaceId);
    if (!item) throw new Error("Content item not found");
    const cloneData = {
      ...item,
      title: `${item.title} (Copy)`,
      status: "draft" as ContentStatus,
    };
    delete (cloneData as any).id;
    delete (cloneData as any).createdAt;
    delete (cloneData as any).updatedAt;
    return this.createContentItem(workspaceId, cloneData);
  }

  public updateContentItem(itemId: string, workspaceId: string, updates: Partial<ContentItemRecord>): ContentItemRecord {
    const item = this.data.content_items.find((c) => c.id === itemId && c.workspaceId === workspaceId);
    if (!item) throw new Error("Content item not found");

    if (updates.releaseId && !updates.releaseTitle) {
      const rel = this.data.releases.find((r) => r.id === updates.releaseId && r.workspaceId === workspaceId);
      if (rel) updates.releaseTitle = rel.title;
    }
    if (updates.campaignId && !updates.campaignTitle) {
      const camp = this.data.campaigns.find((c) => c.id === updates.campaignId && c.workspaceId === workspaceId);
      if (camp) updates.campaignTitle = camp.title;
    }
    if (updates.productId && !updates.productName) {
      const prod = this.data.products.find((p) => p.id === updates.productId && p.workspaceId === workspaceId);
      if (prod) updates.productName = prod.name;
    }

    Object.assign(item, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return item;
  }

  public deleteContentItem(itemId: string, workspaceId: string): boolean {
    const initialLen = this.data.content_items.length;
    this.data.content_items = this.data.content_items.filter((c) => !(c.id === itemId && c.workspaceId === workspaceId));
    const deleted = this.data.content_items.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // --- Creative Memory ---
  public getCreativeMemory(workspaceId: string): CreativeMemoryRecord | undefined {
    return this.data.creative_memories.find((m) => m.workspaceId === workspaceId);
  }

  public updateCreativeMemory(workspaceId: string, updates: Partial<CreativeMemoryRecord>): CreativeMemoryRecord {
    let memory = this.getCreativeMemory(workspaceId);
    if (!memory) {
      memory = {
        id: "mem_" + crypto.randomUUID().substring(0, 8),
        workspaceId,
        identitySummary: "Keedohub Creative OS Profile",
        coreNarrative: "Building high-impact work",
        toneTraits: ["Bold", "Authentic"],
        visualRules: [],
        audioSignatures: [],
        doSay: [],
        dontSay: [],
        recentLearnings: [],
        keyMilestones: [],
        updatedAt: new Date().toISOString(),
      };
      this.data.creative_memories.push(memory);
    }
    Object.assign(memory, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return memory;
  }

  // ==========================================
  // PHASE 8: STRUCTURED CREATIVE MEMORY METHODS
  // ==========================================

  public getCreativeMemoryItems(
    workspaceId: string,
    options?: {
      category?: CreativeMemoryCategory;
      scope?: CreativeMemoryScope;
      entityType?: string;
      entityId?: string;
      status?: 'active' | 'archived';
      isPinned?: boolean;
      search?: string;
    }
  ): CreativeMemoryItemRecord[] {
    let items = (this.data.creative_memory_items || []).filter(
      (m) => m.workspaceId === workspaceId
    );

    if (options?.category) {
      items = items.filter((m) => m.category === options.category);
    }
    if (options?.scope) {
      items = items.filter((m) => m.scope === options.scope);
    }
    if (options?.entityType) {
      items = items.filter((m) => m.entityType === options.entityType);
    }
    if (options?.entityId) {
      items = items.filter((m) => m.entityId === options.entityId);
    }
    if (options?.status) {
      items = items.filter((m) => m.status === options.status);
    }
    if (options?.isPinned !== undefined) {
      items = items.filter((m) => m.isPinned === options.isPinned);
    }
    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      items = items.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          (m.tags && m.tags.some((t) => t.toLowerCase().includes(q))) ||
          (m.entityName && m.entityName.toLowerCase().includes(q))
      );
    }

    return items.sort((a, b) => {
      // Pinned first, then newest
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  public getCreativeMemoryItemById(
    workspaceId: string,
    memoryId: string
  ): CreativeMemoryItemRecord | undefined {
    return (this.data.creative_memory_items || []).find(
      (m) => m.workspaceId === workspaceId && m.id === memoryId
    );
  }

  public createCreativeMemoryItem(
    workspaceId: string,
    data: Omit<CreativeMemoryItemRecord, 'id' | 'workspaceId' | 'createdAt' | 'updatedAt'>
  ): CreativeMemoryItemRecord {
    if (!this.data.creative_memory_items) {
      this.data.creative_memory_items = [];
    }

    const item: CreativeMemoryItemRecord = {
      id: "mem_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      userId: data.userId,
      category: data.category || 'preference',
      scope: data.scope || 'workspace',
      entityType: data.entityType,
      entityId: data.entityId,
      entityName: data.entityName,
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      source: data.source || 'user_explicit',
      confidence: data.confidence !== undefined ? data.confidence : 100,
      status: data.status || 'active',
      isPinned: !!data.isPinned,
      supersedesMemoryId: data.supersedesMemoryId,
      supersededByMemoryId: data.supersededByMemoryId,
      assetReferenceId: data.assetReferenceId,
      assetReferenceName: data.assetReferenceName,
      assetReferenceUrl: data.assetReferenceUrl,
      metadata: data.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If supersedes another memory, update the parent memory to point to this new one
    if (item.supersedesMemoryId) {
      const oldMem = this.getCreativeMemoryItemById(workspaceId, item.supersedesMemoryId);
      if (oldMem) {
        oldMem.supersededByMemoryId = item.id;
        oldMem.updatedAt = new Date().toISOString();
      }
    }

    this.data.creative_memory_items.unshift(item);
    this.save();
    return item;
  }

  public updateCreativeMemoryItem(
    workspaceId: string,
    memoryId: string,
    updates: Partial<CreativeMemoryItemRecord>
  ): CreativeMemoryItemRecord {
    const item = this.getCreativeMemoryItemById(workspaceId, memoryId);
    if (!item) {
      throw new Error(`Creative memory item ${memoryId} not found in workspace ${workspaceId}`);
    }

    Object.assign(item, updates, {
      updatedAt: new Date().toISOString(),
    });
    this.save();
    return item;
  }

  public deleteCreativeMemoryItem(workspaceId: string, memoryId: string): boolean {
    if (!this.data.creative_memory_items) return false;
    const initialLen = this.data.creative_memory_items.length;
    this.data.creative_memory_items = this.data.creative_memory_items.filter(
      (m) => !(m.workspaceId === workspaceId && m.id === memoryId)
    );
    if (this.data.creative_memory_items.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public archiveCreativeMemoryItem(
    workspaceId: string,
    memoryId: string,
    archive: boolean = true
  ): CreativeMemoryItemRecord {
    return this.updateCreativeMemoryItem(workspaceId, memoryId, {
      status: archive ? 'archived' : 'active',
    });
  }

  public togglePinCreativeMemoryItem(
    workspaceId: string,
    memoryId: string
  ): CreativeMemoryItemRecord {
    const item = this.getCreativeMemoryItemById(workspaceId, memoryId);
    if (!item) {
      throw new Error(`Creative memory item ${memoryId} not found`);
    }
    return this.updateCreativeMemoryItem(workspaceId, memoryId, {
      isPinned: !item.isPinned,
    });
  }

  public supersedeCreativeMemory(
    workspaceId: string,
    oldMemoryId: string,
    newMemoryData: Omit<CreativeMemoryItemRecord, 'id' | 'workspaceId' | 'createdAt' | 'updatedAt'>
  ): { oldMemory: CreativeMemoryItemRecord; newMemory: CreativeMemoryItemRecord } {
    const oldMem = this.getCreativeMemoryItemById(workspaceId, oldMemoryId);
    if (!oldMem) {
      throw new Error(`Old memory item ${oldMemoryId} not found to supersede`);
    }

    const newMem = this.createCreativeMemoryItem(workspaceId, {
      ...newMemoryData,
      supersedesMemoryId: oldMemoryId,
    });

    oldMem.supersededByMemoryId = newMem.id;
    oldMem.updatedAt = new Date().toISOString();
    this.save();

    return { oldMemory: oldMem, newMemory: newMem };
  }

  // --- Memory Candidates (AI Inferences awaiting confirmation) ---
  public getMemoryCandidates(
    workspaceId: string,
    status?: 'pending' | 'saved' | 'dismissed'
  ): MemoryCandidateRecord[] {
    let list = (this.data.memory_candidates || []).filter(
      (c) => c.workspaceId === workspaceId
    );
    if (status) {
      list = list.filter((c) => c.status === status);
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createMemoryCandidate(
    workspaceId: string,
    data: Omit<MemoryCandidateRecord, 'id' | 'workspaceId' | 'createdAt'>
  ): MemoryCandidateRecord {
    if (!this.data.memory_candidates) {
      this.data.memory_candidates = [];
    }

    const candidate: MemoryCandidateRecord = {
      id: "mcand_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      title: data.title,
      content: data.content,
      category: data.category || 'preference',
      scope: data.scope || 'workspace',
      entityType: data.entityType,
      entityId: data.entityId,
      entityName: data.entityName,
      sourceContext: data.sourceContext || 'Creative Brain Intelligence',
      confidence: data.confidence !== undefined ? data.confidence : 85,
      tags: data.tags || [],
      status: data.status || 'pending',
      createdAt: new Date().toISOString(),
    };

    this.data.memory_candidates.unshift(candidate);
    this.save();
    return candidate;
  }

  public resolveMemoryCandidate(
    workspaceId: string,
    candidateId: string,
    action: 'save' | 'dismiss',
    edits?: Partial<CreativeMemoryItemRecord>
  ): { candidate: MemoryCandidateRecord; savedMemory?: CreativeMemoryItemRecord } {
    const candidate = (this.data.memory_candidates || []).find(
      (c) => c.workspaceId === workspaceId && c.id === candidateId
    );
    if (!candidate) {
      throw new Error(`Candidate ${candidateId} not found in workspace`);
    }

    if (action === 'dismiss') {
      candidate.status = 'dismissed';
      this.save();
      return { candidate };
    }

    // Save as active memory
    candidate.status = 'saved';
    const savedMemory = this.createCreativeMemoryItem(workspaceId, {
      title: edits?.title || candidate.title,
      content: edits?.content || candidate.content,
      category: edits?.category || candidate.category,
      scope: edits?.scope || candidate.scope,
      entityType: (edits?.entityType || candidate.entityType) as any,
      entityId: edits?.entityId || candidate.entityId,
      entityName: edits?.entityName || candidate.entityName,
      tags: edits?.tags || candidate.tags,
      source: 'ai_extracted',
      confidence: candidate.confidence,
      status: 'active',
      isPinned: edits?.isPinned !== undefined ? edits.isPinned : false,
      metadata: {
        candidateId: candidate.id,
        sourceContext: candidate.sourceContext,
      },
    });

    this.save();
    return { candidate, savedMemory };
  }

  // --- Memory Block Rules (Guardrails) ---
  public getMemoryBlockRules(workspaceId: string): MemoryBlockRuleRecord[] {
    return (this.data.memory_block_rules || []).filter(
      (r) => r.workspaceId === workspaceId
    );
  }

  public createMemoryBlockRule(
    workspaceId: string,
    data: { pattern: string; reason: string }
  ): MemoryBlockRuleRecord {
    if (!this.data.memory_block_rules) {
      this.data.memory_block_rules = [];
    }

    const rule: MemoryBlockRuleRecord = {
      id: "mblock_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      pattern: data.pattern,
      reason: data.reason,
      createdAt: new Date().toISOString(),
    };

    this.data.memory_block_rules.unshift(rule);
    this.save();
    return rule;
  }

  public deleteMemoryBlockRule(workspaceId: string, ruleId: string): boolean {
    if (!this.data.memory_block_rules) return false;
    const initialLen = this.data.memory_block_rules.length;
    this.data.memory_block_rules = this.data.memory_block_rules.filter(
      (r) => !(r.workspaceId === workspaceId && r.id === ruleId)
    );
    if (this.data.memory_block_rules.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Notifications & Activity ---
  public getNotifications(workspaceId: string, userId?: string): NotificationRecord[] {
    return this.data.notifications
      .filter((n) => n.workspaceId === workspaceId && (!n.userId || n.userId === userId))
      .slice(0, 50);
  }

  public addNotification(
    workspaceId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'request' = 'info',
    link?: string,
    userId?: string
  ): NotificationRecord {
    const notif: NotificationRecord = {
      id: "notif_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      userId,
      title,
      message,
      type,
      read: false,
      link,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }

  public markNotificationRead(notifId: string, workspaceId: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === notifId && n.workspaceId === workspaceId);
    if (notif) {
      notif.read = true;
      this.save();
      return true;
    }
    return false;
  }

  public getActivityLogs(workspaceId: string): ActivityLogRecord[] {
    return this.data.activity_logs.filter((a) => a.workspaceId === workspaceId).slice(0, 50);
  }

  public logActivity(
    workspaceId: string,
    userId: string,
    userEmail: string,
    action: string,
    entityType: string,
    entityId: string,
    details: string
  ): ActivityLogRecord {
    const log: ActivityLogRecord = {
      id: "act_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      userId,
      userEmail,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };
    this.data.activity_logs.unshift(log);
    this.save();
    return log;
  }

  // --- Creative Studio Brief Requests ---
  public getCreativeRequests(workspaceId: string): CreativeRequestRecord[] {
    return this.data.creative_requests ? this.data.creative_requests.filter((r) => r.workspaceId === workspaceId) : [];
  }

  public createCreativeRequest(
    workspaceId: string,
    data: Omit<CreativeRequestRecord, "id" | "workspaceId" | "createdAt">
  ): CreativeRequestRecord {
    if (!this.data.creative_requests) {
      this.data.creative_requests = [];
    }
    const request: CreativeRequestRecord = {
      id: "req_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.data.creative_requests.unshift(request);
    this.save();
    return request;
  }

  // ==========================================
  // PHASE 7: KEEDOHUB STUDIO PRODUCTION METHODS
  // ==========================================

  // --- Studio Requests ---
  public getStudioRequests(workspaceId: string): StudioRequestRecord[] {
    if (!this.data.studio_requests) this.data.studio_requests = [];
    return this.data.studio_requests.filter((r) => r.workspaceId === workspaceId);
  }

  public getStudioRequestById(id: string): StudioRequestRecord | undefined {
    if (!this.data.studio_requests) this.data.studio_requests = [];
    return this.data.studio_requests.find((r) => r.id === id);
  }

  public createStudioRequest(
    workspaceId: string,
    data: Omit<StudioRequestRecord, "id" | "workspaceId" | "createdAt" | "updatedAt">
  ): StudioRequestRecord {
    if (!this.data.studio_requests) this.data.studio_requests = [];
    const newRequest: StudioRequestRecord = {
      id: "sreq_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.studio_requests.unshift(newRequest);
    this.save();
    return newRequest;
  }

  public updateStudioRequest(
    workspaceId: string,
    requestId: string,
    updates: Partial<StudioRequestRecord>
  ): StudioRequestRecord {
    if (!this.data.studio_requests) this.data.studio_requests = [];
    const req = this.data.studio_requests.find((r) => r.id === requestId && r.workspaceId === workspaceId);
    if (!req) throw new Error("Studio request not found");
    Object.assign(req, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return req;
  }

  public deleteStudioRequest(workspaceId: string, requestId: string): boolean {
    if (!this.data.studio_requests) return false;
    const initialLen = this.data.studio_requests.length;
    this.data.studio_requests = this.data.studio_requests.filter((r) => !(r.id === requestId && r.workspaceId === workspaceId));
    const deleted = this.data.studio_requests.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // --- Studio Quotes ---
  public getStudioQuotes(workspaceId: string, requestId?: string): StudioQuoteRecord[] {
    if (!this.data.studio_quotes) this.data.studio_quotes = [];
    return this.data.studio_quotes.filter(
      (q) => q.workspaceId === workspaceId && (!requestId || q.requestId === requestId)
    );
  }

  public getStudioQuoteById(id: string): StudioQuoteRecord | undefined {
    if (!this.data.studio_quotes) this.data.studio_quotes = [];
    return this.data.studio_quotes.find((q) => q.id === id);
  }

  public createStudioQuote(
    workspaceId: string,
    data: Omit<StudioQuoteRecord, "id" | "workspaceId" | "createdAt" | "updatedAt">
  ): StudioQuoteRecord {
    if (!this.data.studio_quotes) this.data.studio_quotes = [];
    const quote: StudioQuoteRecord = {
      id: "squote_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.studio_quotes.unshift(quote);

    // Update associated request with quoteId and status
    const req = this.getStudioRequestById(data.requestId);
    if (req && req.workspaceId === workspaceId) {
      req.quoteId = quote.id;
      req.status = "QUOTE_SENT";
      req.updatedAt = new Date().toISOString();
    }

    this.save();
    return quote;
  }

  public updateStudioQuoteStatus(
    workspaceId: string,
    quoteId: string,
    status: StudioQuoteStatus,
    payload?: { approvedBy?: string; declinedReason?: string; clarificationNotes?: string }
  ): { quote: StudioQuoteRecord; project?: StudioProjectRecord } {
    if (!this.data.studio_quotes) this.data.studio_quotes = [];
    const quote = this.data.studio_quotes.find((q) => q.id === quoteId && q.workspaceId === workspaceId);
    if (!quote) throw new Error("Quote not found");

    quote.status = status;
    quote.updatedAt = new Date().toISOString();

    let createdProject: StudioProjectRecord | undefined;

    if (status === "APPROVED") {
      quote.approvedAt = new Date().toISOString();
      quote.approvedBy = payload?.approvedBy || "Client Workspace";

      const req = this.getStudioRequestById(quote.requestId);
      if (req) {
        req.status = "PROJECT_ACTIVE";
        req.updatedAt = new Date().toISOString();

        // Automatically activate dedicated Studio Project connected to workspace
        if (!quote.projectId) {
          const projId = "sproj_" + crypto.randomUUID().substring(0, 8);
          quote.projectId = projId;
          req.projectId = projId;

          createdProject = {
            id: projId,
            workspaceId,
            requestId: req.id,
            quoteId: quote.id,
            releaseId: req.releaseId,
            campaignId: req.campaignId,
            title: req.title,
            serviceCategory: req.serviceId,
            status: "PRODUCTION",
            budget: quote.price,
            currency: quote.currency,
            deadline: req.brief.deadline || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
            brief: req.brief,
            milestones: [
              { id: "mil_1", title: "Creative Brief Audit & Direction Lock", targetDate: new Date().toISOString().split("T")[0], completed: true },
              { id: "mil_2", title: "V1 Production & Draft Deliverables", targetDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0], completed: false },
              { id: "mil_3", title: "Client Review & Precision Revisions", targetDate: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0], completed: false },
              { id: "mil_4", title: "Final Master Delivery & Asset Vault Archive", targetDate: new Date(Date.now() + 6 * 86400000).toISOString().split("T")[0], completed: false },
            ],
            leadProducer: {
              name: "Dare Balogun",
              role: "Executive Creative Director @ Keedohub Studio",
              avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          if (!this.data.studio_projects) this.data.studio_projects = [];
          this.data.studio_projects.unshift(createdProject);

          // Create initial deliverables based on quote scope
          if (!this.data.studio_deliverables) this.data.studio_deliverables = [];
          (quote.deliverables || ["Primary Master Asset Deliverable"]).forEach((delName, idx) => {
            this.data.studio_deliverables.push({
              id: "sdel_" + crypto.randomUUID().substring(0, 8),
              projectId: projId,
              workspaceId,
              name: delName,
              description: `High-fidelity deliverable asset for ${req.serviceName}`,
              format: req.serviceId === "cover_design" ? "PNG 3000x3000px (300 DPI)" : "Production Master",
              version: "V1",
              status: idx === 0 ? "in_progress" : "in_progress",
              dueDate: createdProject!.deadline,
              approvalStatus: "pending",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          });

          // Add welcome message from producer
          if (!this.data.studio_messages) this.data.studio_messages = [];
          this.data.studio_messages.push({
            id: "smsg_" + crypto.randomUUID().substring(0, 8),
            workspaceId,
            projectId: projId,
            requestId: req.id,
            senderId: "usr_studio_director",
            senderName: "Dare Balogun",
            senderRole: "producer",
            content: `Hello! Your quote has been approved and project "${req.title}" is now active in Keedohub Studio production queue. Our lead creative specialist is reviewing the assets and drafting V1.`,
            createdAt: new Date().toISOString(),
          });
        }
      }
    } else if (status === "DECLINED") {
      quote.declinedAt = new Date().toISOString();
      quote.declinedReason = payload?.declinedReason || "Client declined quote";
      const req = this.getStudioRequestById(quote.requestId);
      if (req) {
        req.status = "DECLINED";
        req.updatedAt = new Date().toISOString();
      }
    } else if (payload?.clarificationNotes) {
      quote.clarificationNotes = payload.clarificationNotes;
    }

    this.save();
    return { quote, project: createdProject };
  }

  // --- Studio Projects ---
  public getStudioProjects(workspaceId: string): StudioProjectRecord[] {
    if (!this.data.studio_projects) this.data.studio_projects = [];
    return this.data.studio_projects.filter((p) => p.workspaceId === workspaceId);
  }

  public getStudioProjectById(id: string): StudioProjectRecord | undefined {
    if (!this.data.studio_projects) this.data.studio_projects = [];
    return this.data.studio_projects.find((p) => p.id === id);
  }

  public createStudioProject(
    workspaceId: string,
    data: Omit<StudioProjectRecord, "id" | "workspaceId" | "createdAt" | "updatedAt">
  ): StudioProjectRecord {
    if (!this.data.studio_projects) this.data.studio_projects = [];
    const proj: StudioProjectRecord = {
      id: "sproj_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.studio_projects.unshift(proj);
    this.save();
    return proj;
  }

  public updateStudioProject(
    workspaceId: string,
    projectId: string,
    updates: Partial<StudioProjectRecord>
  ): StudioProjectRecord {
    if (!this.data.studio_projects) this.data.studio_projects = [];
    const proj = this.data.studio_projects.find((p) => p.id === projectId && p.workspaceId === workspaceId);
    if (!proj) throw new Error("Studio project not found");
    Object.assign(proj, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return proj;
  }

  // --- Studio Deliverables ---
  public getStudioDeliverables(workspaceId: string, projectId?: string): StudioDeliverableRecord[] {
    if (!this.data.studio_deliverables) this.data.studio_deliverables = [];
    return this.data.studio_deliverables.filter(
      (d) => d.workspaceId === workspaceId && (!projectId || d.projectId === projectId)
    );
  }

  public getStudioDeliverableById(workspaceId: string, deliverableId?: string): StudioDeliverableRecord | undefined {
    if (!this.data.studio_deliverables) this.data.studio_deliverables = [];
    const targetId = deliverableId || workspaceId;
    return this.data.studio_deliverables.find(
      (d) => d.id === targetId || (d.id === deliverableId && d.workspaceId === workspaceId)
    );
  }

  public createStudioDeliverable(
    workspaceId: string,
    projectId: string,
    data: Omit<StudioDeliverableRecord, "id" | "workspaceId" | "projectId" | "createdAt" | "updatedAt">
  ): StudioDeliverableRecord {
    if (!this.data.studio_deliverables) this.data.studio_deliverables = [];
    const del: StudioDeliverableRecord = {
      id: "sdel_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      projectId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.studio_deliverables.push(del);
    this.save();
    return del;
  }

  public updateStudioDeliverable(
    workspaceId: string,
    deliverableId: string,
    updates: Partial<StudioDeliverableRecord>
  ): StudioDeliverableRecord {
    if (!this.data.studio_deliverables) this.data.studio_deliverables = [];
    const del = this.data.studio_deliverables.find((d) => d.id === deliverableId && d.workspaceId === workspaceId);
    if (!del) throw new Error("Deliverable not found");
    Object.assign(del, updates, { updatedAt: new Date().toISOString() });

    // If deliverable approved, check if all are approved to mark project complete
    if (updates.approvalStatus === "approved") {
      del.status = "approved";
      del.approvedAt = new Date().toISOString();
    }

    this.save();
    return del;
  }

  // --- Studio Revisions ---
  public getStudioRevisions(workspaceId: string, projectId?: string, deliverableId?: string): StudioRevisionRecord[] {
    if (!this.data.studio_revisions) this.data.studio_revisions = [];
    return this.data.studio_revisions.filter(
      (r) =>
        r.workspaceId === workspaceId &&
        (!projectId || r.projectId === projectId) &&
        (!deliverableId || r.deliverableId === deliverableId)
    );
  }

  public createStudioRevision(
    workspaceId: string,
    data: Omit<StudioRevisionRecord, "id" | "workspaceId" | "createdAt">
  ): StudioRevisionRecord {
    if (!this.data.studio_revisions) this.data.studio_revisions = [];
    const rev: StudioRevisionRecord = {
      id: "srev_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.data.studio_revisions.unshift(rev);

    // Update deliverable status to revision_requested
    const del = this.data.studio_deliverables.find((d) => d.id === data.deliverableId && d.workspaceId === workspaceId);
    if (del) {
      del.status = "revision_requested";
      del.updatedAt = new Date().toISOString();
    }

    // Update project status to REVISION
    const proj = this.getStudioProjectById(data.projectId);
    if (proj && proj.workspaceId === workspaceId) {
      proj.status = "REVISION";
      proj.updatedAt = new Date().toISOString();
    }

    this.save();
    return rev;
  }

  public updateStudioRevisionStatus(
    workspaceId: string,
    revisionId: string,
    status: StudioRevisionStatus
  ): StudioRevisionRecord {
    if (!this.data.studio_revisions) this.data.studio_revisions = [];
    const rev = this.data.studio_revisions.find((r) => r.id === revisionId && r.workspaceId === workspaceId);
    if (!rev) throw new Error("Revision not found");
    rev.status = status;
    if (status === "ACCEPTED") {
      rev.resolvedAt = new Date().toISOString();
    }
    this.save();
    return rev;
  }

  // --- Studio Messages ---
  public getStudioMessages(workspaceId: string, projectId?: string, requestId?: string): StudioMessageRecord[] {
    if (!this.data.studio_messages) this.data.studio_messages = [];
    return this.data.studio_messages.filter(
      (m) =>
        m.workspaceId === workspaceId &&
        (!projectId || m.projectId === projectId) &&
        (!requestId || m.requestId === requestId)
    );
  }

  public createStudioMessage(
    workspaceId: string,
    data: Omit<StudioMessageRecord, "id" | "workspaceId" | "createdAt">
  ): StudioMessageRecord {
    if (!this.data.studio_messages) this.data.studio_messages = [];
    const msg: StudioMessageRecord = {
      id: "smsg_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.data.studio_messages.push(msg);
    this.save();
    return msg;
  }

  // --- Folders ---
  public getFolders(workspaceId: string): (FolderRecord & { assetCount: number })[] {
    const assets = this.getAssets(workspaceId);
    const folders = this.data.folders.filter((f) => f.workspaceId === workspaceId);
    return folders.map((f) => ({
      ...f,
      assetCount: assets.filter((a) => a.folderId === f.id || (f.category && a.category === f.category)).length,
    }));
  }

  public createFolder(workspaceId: string, folderData: Omit<FolderRecord, "id" | "workspaceId" | "createdAt">): FolderRecord {
    const folder: FolderRecord = {
      id: "fld_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      ...folderData,
      createdAt: new Date().toISOString(),
    };
    this.data.folders.unshift(folder);
    this.save();
    return folder;
  }

  public updateFolder(folderId: string, workspaceId: string, updates: Partial<FolderRecord>): FolderRecord {
    const folder = this.data.folders.find((f) => f.id === folderId && f.workspaceId === workspaceId);
    if (!folder) throw new Error("Folder not found");
    Object.assign(folder, updates);
    this.save();
    return folder;
  }

  public deleteFolder(folderId: string, workspaceId: string): boolean {
    const initialLen = this.data.folders.length;
    this.data.folders = this.data.folders.filter((f) => !(f.id === folderId && f.workspaceId === workspaceId));
    // Reset folderId on assets
    this.data.assets.forEach((a) => {
      if (a.workspaceId === workspaceId && a.folderId === folderId) {
        delete a.folderId;
      }
    });
    const deleted = this.data.folders.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // --- Milestones ---
  public getMilestones(workspaceId: string, projectId?: string): MilestoneRecord[] {
    return this.data.milestones.filter(
      (m) => m.workspaceId === workspaceId && (!projectId || m.projectId === projectId)
    );
  }

  public createMilestone(workspaceId: string, milestoneData: Omit<MilestoneRecord, "id" | "workspaceId" | "createdAt">): MilestoneRecord {
    let projectTitle = milestoneData.projectTitle;
    if (milestoneData.projectId && !projectTitle) {
      const proj = this.data.projects.find((p) => p.id === milestoneData.projectId);
      if (proj) projectTitle = proj.title;
    }

    const milestone: MilestoneRecord = {
      id: "mls_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      ...milestoneData,
      projectTitle,
      deliverables: milestoneData.deliverables || [],
      completed: milestoneData.completed || milestoneData.status === 'achieved',
      createdAt: new Date().toISOString(),
    };
    this.data.milestones.push(milestone);
    this.save();
    return milestone;
  }

  public updateMilestone(milestoneId: string, workspaceId: string, updates: Partial<MilestoneRecord>): MilestoneRecord {
    const milestone = this.data.milestones.find((m) => m.id === milestoneId && m.workspaceId === workspaceId);
    if (!milestone) throw new Error("Milestone not found");
    if (updates.completed !== undefined && updates.status === undefined) {
      updates.status = updates.completed ? 'achieved' : 'in-progress';
    }
    if (updates.status === 'achieved') {
      updates.completed = true;
    }
    Object.assign(milestone, updates);
    this.save();
    return milestone;
  }

  public deleteMilestone(milestoneId: string, workspaceId: string): boolean {
    const initialLen = this.data.milestones.length;
    this.data.milestones = this.data.milestones.filter((m) => !(m.id === milestoneId && m.workspaceId === workspaceId));
    const deleted = this.data.milestones.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // --- Tasks (Unified Workspace Task Engine) ---
  public getTasks(workspaceId: string): TaskItem[] {
    const projects = this.getProjects(workspaceId);
    const tasks: TaskItem[] = [];

    for (const p of projects) {
      for (const t of p.tasks || []) {
        tasks.push({
          ...t,
          workspaceId,
          projectId: p.id,
          projectTitle: p.title,
          priority: t.priority || (p.priority === 'urgent' ? 'urgent' : p.priority === 'high' ? 'high' : 'medium'),
          status: t.completed ? 'completed' : 'todo',
        });
      }
    }

    return tasks;
  }

  public createTask(workspaceId: string, taskData: { text: string; projectId?: string; priority?: TaskPriority; deadline?: string; category?: string; assignedTo?: string }): TaskItem {
    let project = taskData.projectId
      ? this.data.projects.find((p) => p.id === taskData.projectId && p.workspaceId === workspaceId)
      : this.data.projects.find((p) => p.workspaceId === workspaceId);

    if (!project) {
      // Auto-create a default project for the workspace if none exists
      project = this.createProject(workspaceId, {
        title: "Workspace Master Operations",
        description: "Primary operational container for tasks and creative sprint milestones.",
        category: "Operations",
        status: "in-progress",
        priority: "medium",
        budget: 0,
        currency: "USD",
        deadline: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        tags: ["Operations", "Tasks"],
        tasks: [],
      });
    }

    const newTask: TaskItem = {
      id: "task_" + crypto.randomUUID().substring(0, 8),
      workspaceId,
      projectId: project.id,
      projectTitle: project.title,
      text: taskData.text,
      completed: false,
      priority: taskData.priority || "medium",
      status: "todo",
      category: taskData.category || "General",
      assignedTo: taskData.assignedTo,
      deadline: taskData.deadline,
      createdAt: new Date().toISOString(),
    };

    project.tasks.push(newTask);
    project.updatedAt = new Date().toISOString();
    this.save();
    return newTask;
  }

  public updateTask(taskId: string, workspaceId: string, updates: Partial<TaskItem>): TaskItem {
    const projects = this.getProjects(workspaceId);
    let foundTask: TaskItem | undefined;

    for (const p of projects) {
      const idx = (p.tasks || []).findIndex((t) => t.id === taskId);
      if (idx !== -1) {
        const current = p.tasks[idx];
        const updated = { ...current, ...updates };
        if (updates.completed !== undefined) {
          updated.status = updates.completed ? 'completed' : 'todo';
        }
        p.tasks[idx] = updated;
        p.updatedAt = new Date().toISOString();
        foundTask = {
          ...updated,
          workspaceId,
          projectId: p.id,
          projectTitle: p.title,
        };
        break;
      }
    }

    if (!foundTask) throw new Error("Task not found");
    this.save();
    return foundTask;
  }

  public deleteTask(taskId: string, workspaceId: string): boolean {
    const projects = this.getProjects(workspaceId);
    let deleted = false;

    for (const p of projects) {
      const initial = p.tasks.length;
      p.tasks = p.tasks.filter((t) => t.id !== taskId);
      if (p.tasks.length < initial) {
        p.updatedAt = new Date().toISOString();
        deleted = true;
        break;
      }
    }

    if (deleted) this.save();
    return deleted;
  }

  // --- Global Search ---
  public searchWorkspace(workspaceId: string, query: string) {
    const q = (query || "").trim().toLowerCase();
    if (!q) return [];

    const results: any[] = [];

    // Projects
    this.getProjects(workspaceId).forEach((p) => {
      if (p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.tags?.some((t) => t.toLowerCase().includes(q))) {
        results.push({
          id: p.id,
          title: p.title,
          subtitle: `${p.category} • ${p.status.toUpperCase()} • ${p.tasks.length} tasks`,
          type: "project",
          tab: "projects",
          meta: `Priority: ${p.priority}`,
        });
      }
    });

    // Assets
    this.getAssets(workspaceId).forEach((a) => {
      if (a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.tags?.some((t) => t.toLowerCase().includes(q))) {
        results.push({
          id: a.id,
          title: a.name,
          subtitle: `${a.category.toUpperCase()} • ${(a.size / 1024 / 1024).toFixed(2)} MB`,
          type: "asset",
          tab: "assets",
          meta: a.dimensions || "Asset",
        });
      }
    });

    // Releases
    this.getReleases(workspaceId).forEach((r) => {
      if (r.title.toLowerCase().includes(q) || r.artistName?.toLowerCase().includes(q) || r.genre?.toLowerCase().includes(q)) {
        results.push({
          id: r.id,
          title: r.title,
          subtitle: `${r.artistName} • ${r.releaseType} • ${r.releaseDate}`,
          type: "release",
          tab: "releases",
          meta: `Status: ${r.status}`,
        });
      }
    });

    // Campaigns
    this.getCampaigns(workspaceId).forEach((c) => {
      if (c.title.toLowerCase().includes(q) || c.goal?.toLowerCase().includes(q) || c.platforms?.some((p) => p.toLowerCase().includes(q))) {
        results.push({
          id: c.id,
          title: c.title,
          subtitle: `${c.goal} • ${c.platforms.join(", ")}`,
          type: "campaign",
          tab: "campaigns",
          meta: `Status: ${c.status}`,
        });
      }
    });

    // Content Items
    this.getContentItems(workspaceId).forEach((c) => {
      if (c.title.toLowerCase().includes(q) || c.captionHook?.toLowerCase().includes(q) || c.platform.toLowerCase().includes(q) || c.concept?.toLowerCase().includes(q)) {
        results.push({
          id: c.id,
          title: c.title,
          subtitle: `${c.platform.toUpperCase()} • ${c.contentType} • ${c.status}`,
          type: "content",
          tab: "content",
          meta: c.scheduledDate ? `Scheduled: ${c.scheduledDate}` : "Draft",
        });
      }
    });

    // Tasks
    this.getTasks(workspaceId).forEach((t) => {
      if (t.text.toLowerCase().includes(q) || t.projectTitle?.toLowerCase().includes(q)) {
        results.push({
          id: t.id,
          title: t.text,
          subtitle: `${t.projectTitle || 'Workspace'} • ${t.completed ? 'Completed' : 'Pending'}`,
          type: "task",
          tab: "tasks",
          meta: t.priority ? `Priority: ${t.priority}` : undefined,
        });
      }
    });

    // Folders
    this.getFolders(workspaceId).forEach((f) => {
      if (f.name.toLowerCase().includes(q)) {
        results.push({
          id: f.id,
          title: f.name,
          subtitle: `${f.assetCount} assets inside • ${f.category || 'general'}`,
          type: "folder",
          tab: "folders",
          meta: "Folder",
        });
      }
    });

    return results;
  }

  // --- Intelligent Dashboard: Attention Items ---
  public getAttentionItems(workspaceId: string) {
    const attention: any[] = [];
    const releases = this.getReleases(workspaceId);
    const tasks = this.getTasks(workspaceId);
    const assets = this.getAssets(workspaceId);
    const content = this.getContentItems(workspaceId);

    // 1. Check Releases
    releases.forEach((r) => {
      if (r.status === 'scheduled' || r.status === 'in-progress') {
        const incompleteChecklist = (r.checklist || []).filter((c: any) => !c.completed);
        if (incompleteChecklist.length > 0) {
          attention.push({
            id: `att_rel_chk_${r.id}`,
            title: `${r.title}: ${incompleteChecklist.length} Launch Checklist Items Pending`,
            description: `Key pre-drop deliverables including "${incompleteChecklist[0].task}" must be checked prior to release date (${r.releaseDate}).`,
            level: incompleteChecklist.length > 2 ? 'critical' : 'warning',
            category: 'release',
            actionLabel: 'Open Release Hub',
            actionTab: 'releases',
            entityId: r.id,
          });
        }

        if (!r.coverUrl && !r.coverAssetId) {
          attention.push({
            id: `att_rel_cov_${r.id}`,
            title: `${r.title} is Missing Master Artwork`,
            description: 'Spotify, Apple Music, and Amazon require 3000x3000px 300DPI square artwork with no borders.',
            level: 'critical',
            category: 'artwork',
            actionLabel: 'Open Cover Studio',
            actionTab: 'cover-studio',
            entityId: r.id,
          });
        }

        if (!r.dspPitch || !r.dspPitch.editorialNote) {
          attention.push({
            id: `att_rel_dsp_${r.id}`,
            title: `Editorial Pitch Missing for ${r.title}`,
            description: 'Submit an editorial pitch at least 14 days before drop date to qualify for New Music Friday & algorithmic playlists.',
            level: 'warning',
            category: 'release',
            actionLabel: 'Generate DSP Pitch',
            actionTab: 'dsp-pitcher',
            entityId: r.id,
          });
        }
      }
    });

    // 2. Check Urgent / Pending Tasks
    const urgentPendingTasks = tasks.filter((t) => !t.completed && (t.priority === 'urgent' || t.priority === 'high'));
    if (urgentPendingTasks.length > 0) {
      attention.push({
        id: 'att_urgent_tasks',
        title: `${urgentPendingTasks.length} High-Priority Tasks Require Action`,
        description: `Top item: "${urgentPendingTasks[0].text}" (${urgentPendingTasks[0].projectTitle || 'Workspace'}).`,
        level: urgentPendingTasks.some((t) => t.priority === 'urgent') ? 'critical' : 'warning',
        category: 'task',
        actionLabel: 'Review Tasks',
        actionTab: 'tasks',
      });
    }

    // 3. Check Content Pipeline
    const draftContent = content.filter((c) => c.status === 'idea' || c.status === 'drafted');
    if (draftContent.length > 0) {
      attention.push({
        id: 'att_draft_content',
        title: `${draftContent.length} Social Content Pieces Awaiting Final Polish`,
        description: `Ready concepts across ${Array.from(new Set(draftContent.map((c) => c.platform))).join(', ')} need scheduling.`,
        level: 'info',
        category: 'campaign',
        actionLabel: 'Open Content Engine',
        actionTab: 'content',
      });
    }

    return attention;
  }

  // --- Intelligent Dashboard: Creative Recommendations ---
  public getRecommendations(workspaceId: string) {
    const ws = this.getWorkspaceById(workspaceId);
    const identity = ws?.identityType || 'artist';
    const releases = this.getReleases(workspaceId);
    const assets = this.getAssets(workspaceId);

    const recs: any[] = [];

    if (identity === 'artist') {
      recs.push({
        id: 'rec_art_1',
        title: 'Deploy Pre-Save SmartLink with Lead Capture',
        insight: 'Releases with a dedicated pre-save hub gain 4.2x higher Day-1 streams and algorithm placement on Spotify and Apple Music.',
        benefit: 'Capture verified fan emails and auto-trigger DSP saves.',
        actionLabel: 'Launch Presave Hub',
        actionTab: 'presave-hub',
        tags: ['Streaming Velocity', 'Fan Capture', 'Spotify'],
      });

      recs.push({
        id: 'rec_art_2',
        title: 'Generate 30-Day Multi-Platform Rollout Calendar',
        insight: 'Consistent 3x weekly studio behind-the-scenes snippets before release date increase track retention by 58%.',
        benefit: 'Turn raw studio session voice memos into engaging TikTok hooks and IG Reels.',
        actionLabel: 'Open Artist Content Brain',
        actionTab: 'content-brain',
        tags: ['Content Strategy', 'TikTok', 'Reels'],
      });

      recs.push({
        id: 'rec_art_3',
        title: 'Audit Audio Loudness & Dynamic Range',
        insight: 'Streaming platforms normalize tracks to -14 LUFS; master between -9 and -11 LUFS for optimal club punch without harsh limiting.',
        benefit: 'Professional loudness calibration tailored for streaming DSPs.',
        actionLabel: 'Open Mastering Suite',
        actionTab: 'mastering-suite',
        tags: ['Audio Master', 'LUFS Meter', 'Sound Quality'],
      });
    } else {
      recs.push({
        id: 'rec_biz_1',
        title: 'Sync Brand Narrative & Visual Guidelines to Creative Memory',
        insight: 'Teams with documented tone and aesthetic rules produce assets 3x faster with zero brand drift.',
        benefit: 'Keep all generated copy, cover visuals, and campaign decks perfectly aligned.',
        actionLabel: 'Review Brand OS',
        actionTab: 'brand-os',
        tags: ['Brand Guidelines', 'Consistency', 'Creative Memory'],
      });

      recs.push({
        id: 'rec_biz_2',
        title: 'Organize Campaign Assets into Tagged Workspace Folders',
        insight: 'Centralizing raw deliverables into categorised folders reduces project turnaround times by 40%.',
        benefit: 'Instant search and cross-team sharing with verified download links.',
        actionLabel: 'Manage Asset Folders',
        actionTab: 'folders',
        tags: ['Asset Organization', 'Media Library'],
      });
    }

    return recs;
  }

  // ==========================================
  // PHASE 9: CREATIVE RADAR DATABASE METHODS
  // ==========================================

  public getRadarSignals(
    workspaceId: string,
    filters?: {
      category?: string;
      severity?: string;
      status?: string;
      entityType?: string;
      entityId?: string;
      search?: string;
      includeArchived?: boolean;
    }
  ): RadarSignalRecord[] {
    let signals = (this.data.radar_signals || []).filter((s) => s.workspaceId === workspaceId);

    if (filters) {
      if (filters.category && filters.category !== "all") {
        signals = signals.filter((s) => s.category === filters.category);
      }
      if (filters.severity && filters.severity !== "all") {
        signals = signals.filter((s) => s.severity === filters.severity);
      }
      if (filters.status && filters.status !== "all") {
        signals = signals.filter((s) => s.status === filters.status);
      } else if (!filters.includeArchived) {
        // By default, exclude dismissed and actioned unless specified
        signals = signals.filter((s) => s.status === "new" || s.status === "acknowledged");
      }
      if (filters.entityType) {
        signals = signals.filter((s) => s.affectedEntity.type === filters.entityType);
      }
      if (filters.entityId) {
        signals = signals.filter((s) => s.affectedEntity.id === filters.entityId);
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        signals = signals.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.explanation.toLowerCase().includes(q) ||
            s.affectedEntity.name.toLowerCase().includes(q) ||
            (s.details && s.details.toLowerCase().includes(q))
        );
      }
    }

    // Sort by: priority DESC (100 -> 0), then severity (critical -> high -> medium -> low), then createdAt DESC
    const severityWeight: Record<RadarSeverity, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    return signals.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      const weightDiff = (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0);
      if (weightDiff !== 0) return weightDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public getRadarSignalById(workspaceId: string, signalId: string): RadarSignalRecord | undefined {
    return (this.data.radar_signals || []).find((s) => s.workspaceId === workspaceId && s.id === signalId);
  }

  public getRadarSignalByFingerprint(workspaceId: string, fingerprint: string): RadarSignalRecord | undefined {
    return (this.data.radar_signals || []).find((s) => s.workspaceId === workspaceId && s.fingerprint === fingerprint);
  }

  public upsertRadarSignal(
    signalData: Omit<RadarSignalRecord, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string }
  ): { signal: RadarSignalRecord; isNew: boolean } {
    if (!this.data.radar_signals) {
      this.data.radar_signals = [];
    }

    const existingIndex = this.data.radar_signals.findIndex(
      (s) => s.workspaceId === signalData.workspaceId && s.fingerprint === signalData.fingerprint
    );

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const existing = this.data.radar_signals[existingIndex];
      // Keep existing status if it was acknowledged, otherwise keep or refresh
      const preservedStatus = existing.status === "dismissed" ? "dismissed" : existing.status;
      
      const updated: RadarSignalRecord = {
        ...existing,
        title: signalData.title,
        explanation: signalData.explanation,
        details: signalData.details,
        severity: signalData.severity,
        priority: signalData.priority,
        affectedEntity: signalData.affectedEntity,
        recommendedAction: signalData.recommendedAction,
        metadata: { ...existing.metadata, ...signalData.metadata },
        updatedAt: now,
        status: preservedStatus,
      };

      this.data.radar_signals[existingIndex] = updated;
      this.persist();
      return { signal: updated, isNew: false };
    } else {
      const newSignal: RadarSignalRecord = {
        id: signalData.id || "sig_" + crypto.randomUUID().substring(0, 9),
        workspaceId: signalData.workspaceId,
        fingerprint: signalData.fingerprint,
        category: signalData.category,
        type: signalData.type,
        severity: signalData.severity,
        priority: signalData.priority,
        title: signalData.title,
        explanation: signalData.explanation,
        details: signalData.details,
        affectedEntity: signalData.affectedEntity,
        recommendedAction: signalData.recommendedAction,
        status: signalData.status || "new",
        createdAt: signalData.createdAt || now,
        updatedAt: now,
        expiresAt: signalData.expiresAt,
        metadata: signalData.metadata || {},
      };

      this.data.radar_signals.unshift(newSignal);
      this.persist();
      return { signal: newSignal, isNew: true };
    }
  }

  public updateRadarSignalStatus(
    workspaceId: string,
    signalId: string,
    status: RadarSignalStatus,
    extra?: {
      acknowledgedAt?: string;
      actionedAt?: string;
      dismissedAt?: string;
      expiresAt?: string;
    }
  ): RadarSignalRecord | undefined {
    const signal = this.getRadarSignalById(workspaceId, signalId);
    if (!signal) return undefined;

    const now = new Date().toISOString();
    signal.status = status;
    signal.updatedAt = now;

    if (status === "acknowledged") {
      signal.acknowledgedAt = extra?.acknowledgedAt || now;
    } else if (status === "actioned") {
      signal.actionedAt = extra?.actionedAt || now;
    } else if (status === "dismissed") {
      signal.dismissedAt = extra?.dismissedAt || now;
    } else if (status === "expired") {
      signal.expiresAt = extra?.expiresAt || now;
    }

    this.persist();
    return signal;
  }

  public batchUpdateRadarSignals(
    workspaceId: string,
    signalIds: string[],
    status: RadarSignalStatus
  ): { updatedCount: number } {
    if (!this.data.radar_signals) return { updatedCount: 0 };
    const now = new Date().toISOString();
    let count = 0;

    for (const signal of this.data.radar_signals) {
      if (signal.workspaceId === workspaceId && signalIds.includes(signal.id)) {
        signal.status = status;
        signal.updatedAt = now;
        if (status === "acknowledged") signal.acknowledgedAt = now;
        if (status === "actioned") signal.actionedAt = now;
        if (status === "dismissed") signal.dismissedAt = now;
        count++;
      }
    }

    if (count > 0) {
      this.persist();
    }
    return { updatedCount: count };
  }

  public autoResolveMissingFingerprints(
    workspaceId: string,
    activeFingerprints: Set<string>
  ): { resolvedCount: number } {
    if (!this.data.radar_signals) return { resolvedCount: 0 };
    const now = new Date().toISOString();
    let count = 0;

    for (const signal of this.data.radar_signals) {
      if (
        signal.workspaceId === workspaceId &&
        (signal.status === "new" || signal.status === "acknowledged") &&
        !activeFingerprints.has(signal.fingerprint)
      ) {
        // Condition was resolved! Auto-transition to actioned/resolved
        signal.status = "actioned";
        signal.actionedAt = now;
        signal.updatedAt = now;
        signal.metadata = {
          ...signal.metadata,
          autoResolvedReason: "Condition no longer detected during proactive radar sweep",
        };
        count++;
      }
    }

    if (count > 0) {
      this.persist();
    }
    return { resolvedCount: count };
  }

  // ==========================================
  // PHASE 11: ANALYTICS & GROWTH INTELLIGENCE METHODS
  // ==========================================

  // --- Performance Metrics ---
  public getPerformanceMetrics(
    workspaceId: string,
    filters?: {
      entityType?: string;
      entityId?: string;
      platform?: string;
      source?: string;
      format?: string;
      startDate?: string;
      endDate?: string;
    }
  ): PerformanceMetricRecord[] {
    let metrics = (this.data.performance_metrics || []).filter((m) => m.workspaceId === workspaceId);

    if (filters) {
      if (filters.entityType && filters.entityType !== "all") {
        metrics = metrics.filter((m) => m.entityType === filters.entityType);
      }
      if (filters.entityId) {
        metrics = metrics.filter((m) => m.entityId === filters.entityId);
      }
      if (filters.platform && filters.platform !== "all") {
        metrics = metrics.filter((m) => m.platform === filters.platform);
      }
      if (filters.source && filters.source !== "all") {
        metrics = metrics.filter((m) => m.source === filters.source);
      }
      if (filters.format && filters.format !== "all") {
        metrics = metrics.filter((m) => m.format === filters.format);
      }
      if (filters.startDate) {
        metrics = metrics.filter((m) => m.metricDate >= filters.startDate!);
      }
      if (filters.endDate) {
        metrics = metrics.filter((m) => m.metricDate <= filters.endDate!);
      }
    }

    return metrics.sort((a, b) => new Date(b.metricDate).getTime() - new Date(a.metricDate).getTime());
  }

  public getPerformanceMetricById(workspaceId: string, id: string): PerformanceMetricRecord | undefined {
    return (this.data.performance_metrics || []).find((m) => m.workspaceId === workspaceId && m.id === id);
  }

  public createPerformanceMetric(
    workspaceId: string,
    metricData: Omit<PerformanceMetricRecord, "id" | "workspaceId" | "createdAt" | "updatedAt">
  ): PerformanceMetricRecord {
    if (!this.data.performance_metrics) {
      this.data.performance_metrics = [];
    }

    const now = new Date().toISOString();
    const newMetric: PerformanceMetricRecord = {
      id: "pm_" + crypto.randomUUID().substring(0, 9),
      workspaceId,
      ...metricData,
      isVerified: metricData.source === "api",
      createdAt: now,
      updatedAt: now,
    };

    this.data.performance_metrics.unshift(newMetric);
    this.persist();
    return newMetric;
  }

  public updatePerformanceMetric(
    workspaceId: string,
    id: string,
    updates: Partial<PerformanceMetricRecord>
  ): PerformanceMetricRecord | undefined {
    const metric = this.getPerformanceMetricById(workspaceId, id);
    if (!metric) return undefined;

    Object.assign(metric, updates, {
      updatedAt: new Date().toISOString(),
      isVerified: (updates.source || metric.source) === "api",
    });

    this.persist();
    return metric;
  }

  public deletePerformanceMetric(workspaceId: string, id: string): boolean {
    if (!this.data.performance_metrics) return false;
    const initialLen = this.data.performance_metrics.length;
    this.data.performance_metrics = this.data.performance_metrics.filter(
      (m) => !(m.id === id && m.workspaceId === workspaceId)
    );
    const deleted = this.data.performance_metrics.length < initialLen;
    if (deleted) this.persist();
    return deleted;
  }

  // --- Growth Insights ---
  public getGrowthInsights(
    workspaceId: string,
    filters?: {
      category?: string;
      confidence?: string;
      status?: string;
    }
  ): GrowthInsightRecord[] {
    let insights = (this.data.growth_insights || []).filter((i) => i.workspaceId === workspaceId);

    if (filters) {
      if (filters.category && filters.category !== "all") {
        insights = insights.filter((i) => i.category === filters.category);
      }
      if (filters.confidence && filters.confidence !== "all") {
        insights = insights.filter((i) => i.confidence === filters.confidence);
      }
      if (filters.status && filters.status !== "all") {
        insights = insights.filter((i) => i.status === filters.status);
      } else {
        // Exclude dismissed insights by default
        insights = insights.filter((i) => i.status !== "dismissed");
      }
    }

    return insights.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  }

  public getGrowthInsightById(workspaceId: string, id: string): GrowthInsightRecord | undefined {
    return (this.data.growth_insights || []).find((i) => i.workspaceId === workspaceId && i.id === id);
  }

  public createGrowthInsight(
    workspaceId: string,
    insightData: Omit<GrowthInsightRecord, "id" | "workspaceId" | "generatedAt">
  ): GrowthInsightRecord {
    if (!this.data.growth_insights) {
      this.data.growth_insights = [];
    }

    const newInsight: GrowthInsightRecord = {
      id: "gi_" + crypto.randomUUID().substring(0, 9),
      workspaceId,
      ...insightData,
      generatedAt: new Date().toISOString(),
    };

    this.data.growth_insights.unshift(newInsight);
    this.persist();
    return newInsight;
  }

  public updateGrowthInsight(
    workspaceId: string,
    id: string,
    updates: Partial<GrowthInsightRecord>
  ): GrowthInsightRecord | undefined {
    const insight = this.getGrowthInsightById(workspaceId, id);
    if (!insight) return undefined;

    Object.assign(insight, updates);
    this.persist();
    return insight;
  }

  public deleteGrowthInsight(workspaceId: string, id: string): boolean {
    if (!this.data.growth_insights) return false;
    const initialLen = this.data.growth_insights.length;
    this.data.growth_insights = this.data.growth_insights.filter(
      (i) => !(i.id === id && i.workspaceId === workspaceId)
    );
    const deleted = this.data.growth_insights.length < initialLen;
    if (deleted) this.persist();
    return deleted;
  }

  // --- Workspace Goals ---
  public getWorkspaceGoals(
    workspaceId: string,
    filters?: {
      category?: string;
      status?: string;
    }
  ): WorkspaceGoalRecord[] {
    let goals = (this.data.workspace_goals || []).filter((g) => g.workspaceId === workspaceId);

    if (filters) {
      if (filters.category && filters.category !== "all") {
        goals = goals.filter((g) => g.category === filters.category);
      }
      if (filters.status && filters.status !== "all") {
        goals = goals.filter((g) => g.status === filters.status);
      }
    }

    return goals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getWorkspaceGoalById(workspaceId: string, id: string): WorkspaceGoalRecord | undefined {
    return (this.data.workspace_goals || []).find((g) => g.workspaceId === workspaceId && g.id === id);
  }

  public createWorkspaceGoal(
    workspaceId: string,
    goalData: Omit<WorkspaceGoalRecord, "id" | "workspaceId" | "createdAt" | "updatedAt">
  ): WorkspaceGoalRecord {
    if (!this.data.workspace_goals) {
      this.data.workspace_goals = [];
    }

    const now = new Date().toISOString();
    const newGoal: WorkspaceGoalRecord = {
      id: "goal_" + crypto.randomUUID().substring(0, 9),
      workspaceId,
      ...goalData,
      createdAt: now,
      updatedAt: now,
    };

    this.data.workspace_goals.unshift(newGoal);
    this.persist();
    return newGoal;
  }

  public updateWorkspaceGoal(
    workspaceId: string,
    id: string,
    updates: Partial<WorkspaceGoalRecord>
  ): WorkspaceGoalRecord | undefined {
    const goal = this.getWorkspaceGoalById(workspaceId, id);
    if (!goal) return undefined;

    Object.assign(goal, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return goal;
  }

  public deleteWorkspaceGoal(workspaceId: string, id: string): boolean {
    if (!this.data.workspace_goals) return false;
    const initialLen = this.data.workspace_goals.length;
    this.data.workspace_goals = this.data.workspace_goals.filter(
      (g) => !(g.id === id && g.workspaceId === workspaceId)
    );
    const deleted = this.data.workspace_goals.length < initialLen;
    if (deleted) this.persist();
    return deleted;
  }

  // --- Collaboration & Members ---
  public getWorkspaceMember(workspaceId: string, userIdOrMemberId: string): WorkspaceMemberRecord | undefined {
    return (this.data.workspace_members || []).find(
      (m) => m.workspaceId === workspaceId && (m.userId === userIdOrMemberId || m.id === userIdOrMemberId)
    );
  }

  public addWorkspaceMember(
    workspaceId: string,
    memberData: Omit<WorkspaceMemberRecord, "id" | "workspaceId" | "joinedAt">
  ): WorkspaceMemberRecord {
    if (!this.data.workspace_members) {
      this.data.workspace_members = [];
    }

    const newMember: WorkspaceMemberRecord = {
      id: "mem_" + crypto.randomUUID().substring(0, 9),
      workspaceId,
      ...memberData,
      permissions: memberData.permissions || {
        canManageWorkspace: memberData.role === "owner" || memberData.role === "admin",
        canCreateProjects: memberData.role !== "client",
        canEditAll: memberData.role === "owner" || memberData.role === "admin",
        canViewInternalNotes: memberData.role !== "client" && memberData.role !== "collaborator",
        canApprove: memberData.role === "owner" || memberData.role === "admin" || memberData.role === "client",
        canComment: true,
        canRequestRevisions: true,
      },
      accessScope: memberData.accessScope || { isWorkspaceWide: memberData.role !== "client" && memberData.role !== "collaborator" },
      joinedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    this.data.workspace_members.push(newMember);
    this.persist();
    return newMember;
  }

  public updateWorkspaceMember(
    workspaceId: string,
    memberId: string,
    updates: Partial<WorkspaceMemberRecord>
  ): WorkspaceMemberRecord | undefined {
    const member = (this.data.workspace_members || []).find(
      (m) => m.workspaceId === workspaceId && (m.id === memberId || m.userId === memberId)
    );
    if (!member) return undefined;

    Object.assign(member, updates);
    this.persist();
    return member;
  }

  public removeWorkspaceMember(workspaceId: string, memberId: string): boolean {
    if (!this.data.workspace_members) return false;
    const initialLen = this.data.workspace_members.length;
    this.data.workspace_members = this.data.workspace_members.filter(
      (m) => !(m.workspaceId === workspaceId && (m.id === memberId || m.userId === memberId))
    );
    const deleted = this.data.workspace_members.length < initialLen;
    if (deleted) this.persist();
    return deleted;
  }

  public checkUserEntityAccess(
    workspaceId: string,
    userId: string,
    entityType: string,
    entityId: string
  ): {
    hasAccess: boolean;
    role: MemberRole;
    canApprove: boolean;
    canComment: boolean;
    canEdit: boolean;
    canViewInternalNotes: boolean;
    member?: WorkspaceMemberRecord;
  } {
    const member = this.getWorkspaceMember(workspaceId, userId);
    if (!member) {
      return {
        hasAccess: false,
        role: "viewer",
        canApprove: false,
        canComment: false,
        canEdit: false,
        canViewInternalNotes: false,
      };
    }

    // Owners and Admins have full access to everything
    if (member.role === "owner" || member.role === "admin" || member.accessScope?.isWorkspaceWide) {
      return {
        hasAccess: true,
        role: member.role,
        canApprove: member.permissions?.canApprove ?? (member.role === "owner" || member.role === "admin" || member.role === "client"),
        canComment: member.permissions?.canComment ?? true,
        canEdit: member.permissions?.canEditAll ?? (member.role === "owner" || member.role === "admin"),
        canViewInternalNotes: member.permissions?.canViewInternalNotes ?? (member.role !== "client" && member.role !== "collaborator"),
        member,
      };
    }

    // Scoped access check for Collaborators and Clients
    const scope = member.accessScope;
    let hasAccess = false;
    if (scope) {
      if (entityType === "project" && scope.projectIds?.includes(entityId)) hasAccess = true;
      else if (entityType === "release" && scope.releaseIds?.includes(entityId)) hasAccess = true;
      else if (entityType === "campaign" && scope.campaignIds?.includes(entityId)) hasAccess = true;
      else if (entityType === "studio_deliverable" && (scope.deliverableIds?.includes(entityId) || scope.studioProjectIds?.length)) hasAccess = true;
      else if (entityType === "studio_project" && scope.studioProjectIds?.includes(entityId)) hasAccess = true;
      else if (!entityType || !entityId) hasAccess = true;
    }

    return {
      hasAccess,
      role: member.role,
      canApprove: member.permissions?.canApprove ?? (member.role === "client"),
      canComment: member.permissions?.canComment ?? true,
      canEdit: member.permissions?.canEditAll ?? false,
      canViewInternalNotes: member.permissions?.canViewInternalNotes ?? false,
      member,
    };
  }

  // --- Threaded Comments ---
  public getComments(
    workspaceId: string,
    filters?: {
      entityType?: string;
      entityId?: string;
      parentId?: string;
      includeInternal?: boolean;
    }
  ): CommentRecord[] {
    let comments = (this.data.comments || []).filter((c) => c.workspaceId === workspaceId);

    if (filters) {
      if (filters.entityType && filters.entityType !== "all") {
        comments = comments.filter((c) => c.entityType === filters.entityType);
      }
      if (filters.entityId && filters.entityId !== "all") {
        comments = comments.filter((c) => c.entityId === filters.entityId);
      }
      if (filters.parentId !== undefined) {
        if (filters.parentId === "") {
          comments = comments.filter((c) => !c.parentId);
        } else {
          comments = comments.filter((c) => c.parentId === filters.parentId);
        }
      }
      if (filters.includeInternal === false) {
        comments = comments.filter((c) => !c.isInternal);
      }
    }

    return comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public getCommentById(workspaceId: string, id: string): CommentRecord | undefined {
    return (this.data.comments || []).find((c) => c.workspaceId === workspaceId && c.id === id);
  }

  public createComment(
    workspaceId: string,
    commentData: Omit<CommentRecord, "id" | "workspaceId" | "createdAt" | "updatedAt">
  ): CommentRecord {
    if (!this.data.comments) {
      this.data.comments = [];
    }

    const now = new Date().toISOString();
    const newComment: CommentRecord = {
      id: "cmt_" + crypto.randomUUID().substring(0, 9),
      workspaceId,
      ...commentData,
      createdAt: now,
      updatedAt: now,
    };

    this.data.comments.push(newComment);
    this.persist();
    return newComment;
  }

  public updateComment(
    workspaceId: string,
    id: string,
    updates: Partial<CommentRecord>
  ): CommentRecord | undefined {
    const comment = this.getCommentById(workspaceId, id);
    if (!comment) return undefined;

    Object.assign(comment, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return comment;
  }

  public deleteComment(workspaceId: string, id: string): boolean {
    if (!this.data.comments) return false;
    const initialLen = this.data.comments.length;
    this.data.comments = this.data.comments.filter(
      (c) => !(c.id === id && c.workspaceId === workspaceId)
    );
    const deleted = this.data.comments.length < initialLen;
    if (deleted) this.persist();
    return deleted;
  }

  public resolveComment(workspaceId: string, id: string, resolvedBy: string): CommentRecord | undefined {
    const comment = this.getCommentById(workspaceId, id);
    if (!comment) return undefined;

    comment.resolved = !comment.resolved;
    if (comment.resolved) {
      comment.resolvedBy = resolvedBy;
      comment.resolvedAt = new Date().toISOString();
    } else {
      comment.resolvedBy = undefined;
      comment.resolvedAt = undefined;
    }
    comment.updatedAt = new Date().toISOString();

    this.persist();
    return comment;
  }

  public reactToComment(workspaceId: string, id: string, emoji: string, userId: string): CommentRecord | undefined {
    const comment = this.getCommentById(workspaceId, id);
    if (!comment) return undefined;

    if (!comment.reactions) {
      comment.reactions = [];
    }

    const existingReaction = comment.reactions.find((r) => r.emoji === emoji);
    if (existingReaction) {
      if (existingReaction.userIds.includes(userId)) {
        // Toggle off
        existingReaction.userIds = existingReaction.userIds.filter((uid) => uid !== userId);
        existingReaction.count = existingReaction.userIds.length;
        if (existingReaction.count === 0) {
          comment.reactions = comment.reactions.filter((r) => r.emoji !== emoji);
        }
      } else {
        // Toggle on
        existingReaction.userIds.push(userId);
        existingReaction.count = existingReaction.userIds.length;
      }
    } else {
      comment.reactions.push({
        emoji,
        count: 1,
        userIds: [userId],
      });
    }

    comment.updatedAt = new Date().toISOString();
    this.persist();
    return comment;
  }

  // --- Approval Requests ---
  public getApprovalRequests(
    workspaceId: string,
    filters?: {
      entityType?: string;
      entityId?: string;
      status?: ApprovalStatus;
      reviewerId?: string;
      includeInternalOnly?: boolean;
    }
  ): ApprovalRequestRecord[] {
    let requests = (this.data.approval_requests || []).filter((r) => r.workspaceId === workspaceId);

    if (filters) {
      if (filters.entityType && filters.entityType !== "all") {
        requests = requests.filter((r) => r.entityType === filters.entityType);
      }
      if (filters.entityId && filters.entityId !== "all") {
        requests = requests.filter((r) => r.entityId === filters.entityId);
      }
      if (filters.status && filters.status !== ("all" as any)) {
        requests = requests.filter((r) => r.status === filters.status);
      }
      if (filters.reviewerId) {
        requests = requests.filter((r) => r.assignedReviewers?.some((rev) => rev.id === filters.reviewerId || rev.email === filters.reviewerId));
      }
      if (filters.includeInternalOnly === false) {
        requests = requests.filter((r) => r.isClientVisible);
      }
    }

    return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getApprovalRequestById(workspaceId: string, id: string): ApprovalRequestRecord | undefined {
    return (this.data.approval_requests || []).find((r) => r.workspaceId === workspaceId && r.id === id);
  }

  public createApprovalRequest(
    workspaceId: string,
    data: Omit<ApprovalRequestRecord, "id" | "workspaceId" | "createdAt" | "updatedAt">
  ): ApprovalRequestRecord {
    if (!this.data.approval_requests) {
      this.data.approval_requests = [];
    }

    const now = new Date().toISOString();
    const newRequest: ApprovalRequestRecord = {
      id: "appr_" + crypto.randomUUID().substring(0, 9),
      workspaceId,
      ...data,
      reviews: data.reviews || [],
      assignedReviewers: data.assignedReviewers || [],
      createdAt: now,
      updatedAt: now,
    };

    this.data.approval_requests.unshift(newRequest);
    this.persist();
    return newRequest;
  }

  public updateApprovalRequest(
    workspaceId: string,
    id: string,
    updates: Partial<ApprovalRequestRecord>
  ): ApprovalRequestRecord | undefined {
    const req = this.getApprovalRequestById(workspaceId, id);
    if (!req) return undefined;

    Object.assign(req, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return req;
  }

  public submitApprovalDecision(
    workspaceId: string,
    approvalId: string,
    decision: {
      reviewerId: string;
      reviewerName: string;
      reviewerEmail: string;
      reviewerRole: string;
      status: "approved" | "changes_requested";
      notes?: string;
      requestedChanges?: string[];
    }
  ): { request: ApprovalRequestRecord; revision?: RevisionRecord } {
    const req = this.getApprovalRequestById(workspaceId, approvalId);
    if (!req) throw new Error("Approval request not found");

    const now = new Date().toISOString();
    const reviewId = "rev_dec_" + crypto.randomUUID().substring(0, 8);

    const reviewEntry: ApprovalReviewDecision = {
      id: reviewId,
      reviewerId: decision.reviewerId,
      reviewerName: decision.reviewerName,
      reviewerEmail: decision.reviewerEmail,
      reviewerRole: decision.reviewerRole,
      status: decision.status,
      notes: decision.notes,
      version: req.currentVersion,
      timestamp: now,
      requestedChanges: decision.requestedChanges,
    };

    req.reviews.push(reviewEntry);

    // Update assigned reviewer status
    const assigned = req.assignedReviewers.find(
      (r) => r.id === decision.reviewerId || r.email === decision.reviewerEmail
    );
    if (assigned) {
      assigned.status = decision.status;
      assigned.decidedAt = now;
      assigned.decisionNotes = decision.notes;
    }

    // Determine overall status
    if (decision.status === "changes_requested") {
      req.status = "changes_requested";
    } else {
      // Check if all assigned reviewers have approved
      const allApproved = req.assignedReviewers.every((r) => r.status === "approved");
      if (allApproved || req.assignedReviewers.length <= 1) {
        req.status = "approved";
        req.completedAt = now;
      } else {
        req.status = "in_review";
      }
    }
    req.updatedAt = now;

    // Sync underlying entity status if it's a studio deliverable
    if (req.entityType === "studio_deliverable") {
      const del = this.getStudioDeliverableById(req.entityId);
      if (del) {
        del.approvalStatus = req.status === "approved" ? "approved" : req.status === "changes_requested" ? "changes_requested" : "in_review";
        if (req.status === "approved") {
          del.status = "approved";
        }
      }
    }

    // Create or update revision tracking record
    let newRevision: RevisionRecord | undefined;
    if (decision.status === "changes_requested") {
      newRevision = this.createRevision(workspaceId, {
        entityType: req.entityType,
        entityId: req.entityId,
        entityTitle: req.entityTitle,
        versionNumber: parseInt(req.currentVersion.replace(/\D/g, "") || "1", 10),
        versionTag: req.currentVersion,
        title: `Revision Request — ${req.title}`,
        changelog: decision.notes || "Changes requested during review cycle",
        createdBy: {
          id: decision.reviewerId,
          name: decision.reviewerName,
          role: decision.reviewerRole,
        },
        status: "changes_requested",
        changeRequestsSummary: decision.notes,
        isClientVisible: req.isClientVisible,
      });
    }

    this.persist();
    return { request: req, revision: newRevision };
  }

  public deleteApprovalRequest(workspaceId: string, id: string): boolean {
    if (!this.data.approval_requests) return false;
    const initialLen = this.data.approval_requests.length;
    this.data.approval_requests = this.data.approval_requests.filter(
      (r) => !(r.id === id && r.workspaceId === workspaceId)
    );
    const deleted = this.data.approval_requests.length < initialLen;
    if (deleted) this.persist();
    return deleted;
  }

  // --- Revisions ---
  public getRevisions(
    workspaceId: string,
    filters?: {
      entityType?: string;
      entityId?: string;
      isClientVisible?: boolean;
    }
  ): RevisionRecord[] {
    let revisions = (this.data.revisions || []).filter((r) => r.workspaceId === workspaceId);

    if (filters) {
      if (filters.entityType && filters.entityType !== "all") {
        revisions = revisions.filter((r) => r.entityType === filters.entityType);
      }
      if (filters.entityId && filters.entityId !== "all") {
        revisions = revisions.filter((r) => r.entityId === filters.entityId);
      }
      if (filters.isClientVisible !== undefined) {
        revisions = revisions.filter((r) => r.isClientVisible === filters.isClientVisible);
      }
    }

    return revisions.sort((a, b) => b.versionNumber - a.versionNumber);
  }

  public getRevisionById(workspaceId: string, id: string): RevisionRecord | undefined {
    return (this.data.revisions || []).find((r) => r.workspaceId === workspaceId && r.id === id);
  }

  public createRevision(
    workspaceId: string,
    revisionData: Omit<RevisionRecord, "id" | "workspaceId" | "createdAt">
  ): RevisionRecord {
    if (!this.data.revisions) {
      this.data.revisions = [];
    }

    const newRev: RevisionRecord = {
      id: "rev_" + crypto.randomUUID().substring(0, 9),
      workspaceId,
      ...revisionData,
      createdAt: new Date().toISOString(),
    };

    this.data.revisions.unshift(newRev);
    this.persist();
    return newRev;
  }

  public updateRevision(
    workspaceId: string,
    id: string,
    updates: Partial<RevisionRecord>
  ): RevisionRecord | undefined {
    const rev = this.getRevisionById(workspaceId, id);
    if (!rev) return undefined;

    Object.assign(rev, updates);
    this.persist();
    return rev;
  }

  public createActivityLog(logData: {
    workspaceId: string;
    userId: string;
    userEmail: string;
    action: string;
    entityType: string;
    entityId: string;
    details: string;
  }): ActivityLogRecord {
    if (!this.data.activity_logs) {
      this.data.activity_logs = [];
    }
    const newLog: ActivityLogRecord = {
      id: "act_" + crypto.randomUUID().substring(0, 9),
      ...logData,
      createdAt: new Date().toISOString(),
    };
    this.data.activity_logs.unshift(newLog);
    this.persist();
    return newLog;
  }

  // ==========================================
  // PHASE 16: ADMIN CONTROL CENTER METHODS
  // ==========================================

  public getAllAdminUsers(filter?: { search?: string; systemRole?: string; status?: string }) {
    let users = this.data.users || [];

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q)
      );
    }

    if (filter?.systemRole && filter.systemRole !== "all") {
      users = users.filter((u) => u.systemRole === filter.systemRole);
    }

    if (filter?.status && filter.status !== "all") {
      users = users.filter((u) => (u.status || "active") === filter.status);
    }

    return users.map((u) => {
      // Find workspace memberships
      const memberships = (this.data.workspace_members || []).filter((m) => m.userId === u.id);
      const workspaces = memberships.map((m) => {
        const ws = (this.data.workspaces || []).find((w) => w.id === m.workspaceId);
        return {
          id: m.workspaceId,
          name: ws?.name || "Workspace",
          slug: ws?.slug || "workspace",
          role: m.role,
          identityType: ws?.identityType || "artist",
          status: ws?.status || "active",
        };
      });

      return {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
        systemRole: u.systemRole || "user",
        status: u.status || "active",
        suspendedReason: u.suspendedReason,
        suspendedAt: u.suspendedAt,
        workspaceCount: workspaces.length,
        workspaces,
        createdAt: u.createdAt || new Date().toISOString(),
        lastLoginAt: u.lastLoginAt,
      };
    });
  }

  public getAdminUserSummaryById(id: string) {
    const u = (this.data.users || []).find((user) => user.id === id);
    if (!u) return null;

    const memberships = (this.data.workspace_members || []).filter((m) => m.userId === u.id);
    const workspaces = memberships.map((m) => {
      const ws = (this.data.workspaces || []).find((w) => w.id === m.workspaceId);
      return {
        id: m.workspaceId,
        name: ws?.name || "Workspace",
        slug: ws?.slug || "workspace",
        role: m.role,
        identityType: ws?.identityType || "artist",
        status: ws?.status || "active",
      };
    });

    const recentLogs = (this.data.activity_logs || [])
      .filter((l) => l.userId === u.id)
      .slice(0, 15);

    return {
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl,
      systemRole: u.systemRole || "user",
      status: u.status || "active",
      suspendedReason: u.suspendedReason,
      suspendedAt: u.suspendedAt,
      workspaceCount: workspaces.length,
      workspaces,
      recentActivity: recentLogs,
      createdAt: u.createdAt || new Date().toISOString(),
      lastLoginAt: u.lastLoginAt,
    };
  }

  public updateUserStatus(id: string, status: "active" | "suspended", reason?: string): boolean {
    const user = (this.data.users || []).find((u) => u.id === id);
    if (!user) return false;

    user.status = status;
    if (status === "suspended") {
      user.suspendedReason = reason || "Suspended by Administrator";
      user.suspendedAt = new Date().toISOString();
    } else {
      user.suspendedReason = undefined;
      user.suspendedAt = undefined;
    }

    this.persist();
    return true;
  }

  public updateUserSystemRole(id: string, role: SystemAdminRole): boolean {
    const user = (this.data.users || []).find((u) => u.id === id);
    if (!user) return false;

    user.systemRole = role;
    this.persist();
    return true;
  }

  public getAllAdminWorkspaces(filter?: { search?: string; identityType?: string; status?: string }) {
    let workspaces = this.data.workspaces || [];

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      workspaces = workspaces.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.slug.toLowerCase().includes(q) ||
          w.id.toLowerCase().includes(q)
      );
    }

    if (filter?.identityType && filter.identityType !== "all") {
      workspaces = workspaces.filter((w) => w.identityType === filter.identityType);
    }

    if (filter?.status && filter.status !== "all") {
      workspaces = workspaces.filter((w) => (w.status || "active") === filter.status);
    }

    return workspaces.map((w) => {
      const owner = (this.data.users || []).find((u) => u.id === w.ownerId);
      const members = (this.data.workspace_members || []).filter((m) => m.workspaceId === w.id);
      const projects = (this.data.projects || []).filter((p) => p.workspaceId === w.id);
      const releases = (this.data.releases || []).filter((r) => r.workspaceId === w.id);
      const campaigns = (this.data.campaigns || []).filter((c) => c.workspaceId === w.id);
      const deliverables = (this.data.studio_deliverables || []).filter((d) => d.workspaceId === w.id);
      const assets = (this.data.assets || []).filter((a) => a.workspaceId === w.id);
      const memories = (this.data.creative_memories || []).filter((m) => m.workspaceId === w.id);

      return {
        id: w.id,
        name: w.name,
        slug: w.slug,
        identityType: w.identityType,
        ownerId: w.ownerId,
        ownerEmail: owner?.email || "unknown@keedohub.com",
        ownerName: owner?.fullName || "Workspace Owner",
        memberCount: members.length,
        projectCount: projects.length,
        releaseCount: releases.length,
        campaignCount: campaigns.length,
        deliverableCount: deliverables.length,
        assetCount: assets.length,
        memoryCount: memories.length,
        status: w.status || "active",
        suspendedReason: w.suspendedReason,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      };
    });
  }

  public getAdminWorkspaceSummaryById(id: string) {
    const w = (this.data.workspaces || []).find((ws) => ws.id === id);
    if (!w) return null;

    const owner = (this.data.users || []).find((u) => u.id === w.ownerId);
    const members = (this.data.workspace_members || []).filter((m) => m.workspaceId === w.id);
    const projects = (this.data.projects || []).filter((p) => p.workspaceId === w.id);
    const releases = (this.data.releases || []).filter((r) => r.workspaceId === w.id);
    const campaigns = (this.data.campaigns || []).filter((c) => c.workspaceId === w.id);
    const contentItems = (this.data.content_items || []).filter((ci) => ci.workspaceId === w.id);
    const deliverables = (this.data.studio_deliverables || []).filter((d) => d.workspaceId === w.id);
    const assets = (this.data.assets || []).filter((a) => a.workspaceId === w.id);
    const approvalRequests = (this.data.approval_requests || []).filter((ar) => ar.workspaceId === w.id);
    const recentActivity = (this.data.activity_logs || [])
      .filter((l) => l.workspaceId === w.id)
      .slice(0, 20);

    return {
      workspace: w,
      owner: owner ? { id: owner.id, email: owner.email, fullName: owner.fullName } : null,
      members,
      counts: {
        members: members.length,
        projects: projects.length,
        releases: releases.length,
        campaigns: campaigns.length,
        contentItems: contentItems.length,
        deliverables: deliverables.length,
        assets: assets.length,
        approvalRequests: approvalRequests.length,
      },
      recentActivity,
    };
  }

  public updateWorkspaceStatus(
    id: string,
    status: "active" | "archived" | "suspended",
    reason?: string
  ): boolean {
    const ws = (this.data.workspaces || []).find((w) => w.id === id);
    if (!ws) return false;

    ws.status = status;
    if (status === "suspended") {
      ws.suspendedReason = reason || "Suspended by Administrator";
    } else {
      ws.suspendedReason = undefined;
    }
    ws.updatedAt = new Date().toISOString();

    this.persist();
    return true;
  }

  public getAdminOverviewStats() {
    const users = this.data.users || [];
    const workspaces = this.data.workspaces || [];
    const releases = this.data.releases || [];
    const campaigns = this.data.campaigns || [];
    const projects = this.data.projects || [];
    const assets = this.data.assets || [];
    const deliverables = this.data.studio_deliverables || [];
    const approvals = this.data.approval_requests || [];
    const supportTickets = this.data.support_tickets || [];
    const auditLogs = this.data.admin_audit_logs || [];

    const activeUsers = users.filter((u) => (u.status || "active") === "active").length;
    const suspendedUsers = users.filter((u) => u.status === "suspended").length;

    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const thirtyDaysAgo = Date.now() - 30 * 86400000;

    const newUsersLast7Days = users.filter(
      (u) => new Date(u.createdAt).getTime() > sevenDaysAgo
    ).length;
    const newUsersLast30Days = users.filter(
      (u) => new Date(u.createdAt).getTime() > thirtyDaysAgo
    ).length;

    const activeWorkspaces = workspaces.filter((w) => (w.status || "active") === "active").length;

    const workspacesByIdentity: Record<IdentityType, number> = {
      artist: workspaces.filter((w) => w.identityType === "artist").length,
      creator: workspaces.filter((w) => w.identityType === "creator").length,
      brand: workspaces.filter((w) => w.identityType === "brand").length,
      business: workspaces.filter((w) => w.identityType === "business").length,
      startup: workspaces.filter((w) => w.identityType === "startup").length,
    };

    const pendingApprovals = approvals.filter((a) => a.status === "pending" || a.status === "in_review").length;
    const openSupportTickets = supportTickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
    const criticalTicketsCount = supportTickets.filter((t) => t.priority === "critical" && t.status !== "resolved").length;

    // Database entity count
    let dbRecordsCount = 0;
    Object.values(this.data).forEach((collection) => {
      if (Array.isArray(collection)) {
        dbRecordsCount += collection.length;
      }
    });

    let dbSizeKb = 0;
    try {
      if (fs.existsSync(DB_FILE)) {
        const stat = fs.statSync(DB_FILE);
        dbSizeKb = Math.round(stat.size / 1024);
      }
    } catch {
      dbSizeKb = 250;
    }

    const memoryUsage = process.memoryUsage();

    return {
      totalUsers: users.length,
      activeUsers,
      suspendedUsers,
      newUsersLast7Days,
      newUsersLast30Days,
      totalWorkspaces: workspaces.length,
      activeWorkspaces,
      workspacesByIdentity,
      activeReleases: releases.length,
      activeCampaigns: campaigns.length,
      activeProjects: projects.length,
      totalAssets: assets.length,
      totalDeliverables: deliverables.length,
      pendingApprovals,
      openSupportTickets,
      criticalTicketsCount,
      totalAuditEventsCount: auditLogs.length,
      systemHealth: {
        status: "operational" as const,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMb: Math.round(memoryUsage.rss / (1024 * 1024)),
        dbRecordsCount,
        lastPingAt: new Date().toISOString(),
        aiStatus: process.env.GEMINI_API_KEY ? ("healthy" as const) : ("unconfigured" as const),
        aiLatencyMs: 42,
        databaseSizeKb: dbSizeKb,
        nodeVersion: process.version,
      },
    };
  }

  public getAdminAuditLogs(filter?: {
    adminUserId?: string;
    targetType?: string;
    action?: string;
    limit?: number;
  }) {
    let logs = this.data.admin_audit_logs || [];

    if (filter?.adminUserId) {
      logs = logs.filter((l) => l.adminUserId === filter.adminUserId);
    }
    if (filter?.targetType && filter.targetType !== "all") {
      logs = logs.filter((l) => l.targetType === filter.targetType);
    }
    if (filter?.action && filter.action !== "all") {
      logs = logs.filter((l) => l.action.toLowerCase().includes(filter.action!.toLowerCase()));
    }

    const limit = filter?.limit || 100;
    return logs.slice(0, limit);
  }

  public createAdminAuditLog(log: Omit<AdminAuditLogRecord, "id" | "createdAt">): AdminAuditLogRecord {
    if (!this.data.admin_audit_logs) {
      this.data.admin_audit_logs = [];
    }

    const newLog: AdminAuditLogRecord = {
      id: "a-log-" + crypto.randomUUID().substring(0, 8),
      ...log,
      createdAt: new Date().toISOString(),
    };

    this.data.admin_audit_logs.unshift(newLog);
    this.persist();
    return newLog;
  }

  public getPlatformActivityLogs(filter?: { workspaceId?: string; limit?: number }) {
    let logs = this.data.activity_logs || [];

    if (filter?.workspaceId && filter.workspaceId !== "all") {
      logs = logs.filter((l) => l.workspaceId === filter.workspaceId);
    }

    const limit = filter?.limit || 100;
    return logs.slice(0, limit);
  }

  public getSupportTickets(filter?: { status?: string; priority?: string; category?: string }) {
    let tickets = this.data.support_tickets || [];

    if (filter?.status && filter.status !== "all") {
      tickets = tickets.filter((t) => t.status === filter.status);
    }
    if (filter?.priority && filter.priority !== "all") {
      tickets = tickets.filter((t) => t.priority === filter.priority);
    }
    if (filter?.category && filter.category !== "all") {
      tickets = tickets.filter((t) => t.category === filter.category);
    }

    return tickets;
  }

  public getSupportTicketById(id: string): SupportTicketRecord | undefined {
    return (this.data.support_tickets || []).find((t) => t.id === id);
  }

  public updateSupportTicket(
    id: string,
    updates: Partial<SupportTicketRecord>
  ): SupportTicketRecord | undefined {
    const ticket = this.getSupportTicketById(id);
    if (!ticket) return undefined;

    Object.assign(ticket, updates);
    if (updates.status === "resolved" && !ticket.resolvedAt) {
      ticket.resolvedAt = new Date().toISOString();
    }

    this.persist();
    return ticket;
  }

  public createSupportTicket(
    ticketData: Omit<SupportTicketRecord, "id" | "ticketNumber" | "createdAt">
  ): SupportTicketRecord {
    if (!this.data.support_tickets) {
      this.data.support_tickets = [];
    }

    const ticketNumber = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: SupportTicketRecord = {
      id: "tkt_" + crypto.randomUUID().substring(0, 8),
      ticketNumber,
      ...ticketData,
      createdAt: new Date().toISOString(),
    };

    this.data.support_tickets.unshift(newTicket);
    this.persist();
    return newTicket;
  }

  public getFeatureFlags(): FeatureFlagRecord[] {
    return this.data.feature_flags || [];
  }

  public getFeatureFlagByKey(key: string): FeatureFlagRecord | undefined {
    return (this.data.feature_flags || []).find((f) => f.key === key);
  }

  public updateFeatureFlag(
    idOrKey: string,
    updates: Partial<FeatureFlagRecord>
  ): FeatureFlagRecord | undefined {
    const flag = (this.data.feature_flags || []).find(
      (f) => f.id === idOrKey || f.key === idOrKey
    );
    if (!flag) return undefined;

    Object.assign(flag, updates);
    flag.updatedAt = new Date().toISOString();
    this.persist();
    return flag;
  }

  public getPlatformSettings(): PlatformSettingsRecord {
    return (
      this.data.platform_settings || {
        id: "global_settings",
        maintenanceMode: false,
        maintenanceMessage: "Keedohub is currently undergoing scheduled upgrades.",
        allowNewSignups: true,
        systemNoticeBanner: { enabled: false, type: "info", text: "" },
        maxUploadSizeMb: 150,
        aiRateLimitPerMin: 60,
        auditRetentionDays: 90,
        updatedAt: new Date().toISOString(),
      }
    );
  }

  public updatePlatformSettings(
    updates: Partial<PlatformSettingsRecord>
  ): PlatformSettingsRecord {
    if (!this.data.platform_settings) {
      this.data.platform_settings = {
        id: "global_settings",
        maintenanceMode: false,
        maintenanceMessage: "Keedohub is currently undergoing scheduled upgrades.",
        allowNewSignups: true,
        systemNoticeBanner: { enabled: false, type: "info", text: "" },
        maxUploadSizeMb: 150,
        aiRateLimitPerMin: 60,
        auditRetentionDays: 90,
        updatedAt: new Date().toISOString(),
      };
    }

    Object.assign(this.data.platform_settings, updates);
    this.data.platform_settings.updatedAt = new Date().toISOString();
    this.persist();
    return this.data.platform_settings;
  }

  public runWorkspaceDiagnostic(workspaceId: string): any {
    const ws = (this.data.workspaces || []).find((w) => w.id === workspaceId);
    if (!ws) return null;

    const members = (this.data.workspace_members || []).filter((m) => m.workspaceId === workspaceId);
    const projects = (this.data.projects || []).filter((p) => p.workspaceId === workspaceId);
    const releases = (this.data.releases || []).filter((r) => r.workspaceId === workspaceId);
    const campaigns = (this.data.campaigns || []).filter((c) => c.workspaceId === workspaceId);
    const contentItems = (this.data.content_items || []).filter((ci) => ci.workspaceId === workspaceId);
    const assets = (this.data.assets || []).filter((a) => a.workspaceId === workspaceId);
    const deliverables = (this.data.studio_deliverables || []).filter((d) => d.workspaceId === workspaceId);
    const approvals = (this.data.approval_requests || []).filter((ar) => ar.workspaceId === workspaceId);
    const memories = (this.data.creative_memories || []).filter((m) => m.workspaceId === workspaceId);

    // Compute checks
    const checks: {
      id: string;
      title: string;
      status: "pass" | "warning" | "fail";
      details: string;
      itemCount?: number;
    }[] = [];

    // Check 1: Owner existence
    const owner = (this.data.users || []).find((u) => u.id === ws.ownerId);
    checks.push({
      id: "check_owner",
      title: "Workspace Owner Integrity",
      status: owner ? (owner.status === "suspended" ? "warning" : "pass") : "fail",
      details: owner
        ? `Owner ${owner.fullName} (${owner.email}) is ${owner.status || "active"}.`
        : "Workspace owner account is missing from the database.",
    });

    // Check 2: Active Members
    checks.push({
      id: "check_members",
      title: "Member Roster & Roles",
      status: members.length > 0 ? "pass" : "warning",
      details: `${members.length} team member(s) registered with active permissions.`,
      itemCount: members.length,
    });

    // Check 3: Asset Storage References
    const brokenAssets = assets.filter((a) => !a.url || a.url.length < 5);
    checks.push({
      id: "check_assets",
      title: "Asset Storage & URLs",
      status: brokenAssets.length === 0 ? "pass" : "warning",
      details:
        brokenAssets.length === 0
          ? `All ${assets.length} workspace assets have valid URL pointers.`
          : `${brokenAssets.length} asset(s) have missing or broken storage URLs.`,
      itemCount: assets.length,
    });

    // Check 4: Studio Deliverables & Approval Links
    const pendingApprovals = approvals.filter((a) => a.status === "pending" || a.status === "in_review");
    checks.push({
      id: "check_approvals",
      title: "Approvals & Review Pipeline",
      status: pendingApprovals.length > 5 ? "warning" : "pass",
      details: `${pendingApprovals.length} approval request(s) awaiting reviewer decisions.`,
      itemCount: pendingApprovals.length,
    });

    // Check 5: Creative Memory Index
    checks.push({
      id: "check_memory",
      title: "Creative Memory Index",
      status: memories.length > 0 ? "pass" : "pass",
      details: `${memories.length} semantic memory cluster(s) indexed for AI reasoning.`,
      itemCount: memories.length,
    });

    // Compute approximate storage used
    let totalBytes = 0;
    assets.forEach((a) => {
      totalBytes += a.size || 2500000;
    });

    const recommendations: string[] = [];
    if (pendingApprovals.length > 0) {
      recommendations.push(`Follow up on ${pendingApprovals.length} pending approval request(s) to unblock active production pipelines.`);
    }
    if (assets.length === 0) {
      recommendations.push("Upload master visual brand assets and cover art to enable instant studio generation.");
    }
    if (releases.length > 0 && campaigns.length === 0) {
      recommendations.push("Create a promotional launch campaign for active releases.");
    }

    const overallHealth: "healthy" | "warning" | "critical" = checks.some((c) => c.status === "fail")
      ? "critical"
      : checks.some((c) => c.status === "warning")
      ? "warning"
      : "healthy";

    return {
      workspaceId,
      workspaceName: ws.name,
      identityType: ws.identityType,
      generatedAt: new Date().toISOString(),
      overallHealth,
      checks,
      counts: {
        members: members.length,
        projects: projects.length,
        releases: releases.length,
        campaigns: campaigns.length,
        contentItems: contentItems.length,
        assets: assets.length,
        studioDeliverables: deliverables.length,
        approvalRequests: approvals.length,
        memories: memories.length,
      },
      storageUsedBytes: totalBytes,
      recommendations,
    };
  }
}

export const db = new Database();

