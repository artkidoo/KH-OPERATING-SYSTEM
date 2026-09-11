// ==============================================================================
// KEEDOHUB ENTERPRISE DATA MODELS & REPOSITORY INTERFACES
// Compatible with PostgreSQL / Supabase Core Entities
// ==============================================================================

export type SystemRole = 'user' | 'support' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'suspended' | 'deactivated';
export type IdentityType = 'artist' | 'brand';
export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'collaborator';
export type ReleaseStage = 'Idea' | 'Production' | 'Preparation' | 'Launch' | 'Post-Release';
export type CampaignStatus = 'planning' | 'active' | 'paused' | 'completed';
export type ContentStatus = 'idea' | 'in_production' | 'ready' | 'scheduled' | 'published';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type DocumentType = 'proposal' | 'quotation' | 'contract' | 'company_letter' | 'brief' | 'agreement';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// 1. User
export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  avatarUrl?: string;
  systemRole: SystemRole;
  status: UserStatus;
  defaultWorkspaceId?: string;
  createdAt: string;
  updatedAt: string;
}

// 2. Workspace
export interface WorkspaceEntity {
  id: string;
  ownerId: string;
  name: string;
  identityType: IdentityType;
  bio?: string;
  genreOrNiche?: string;
  stage?: string;
  primaryGoal?: string;
  targetAudience?: string;
  positioning?: string;
  platforms: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 3. Workspace Member
export interface WorkspaceMemberEntity {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
}

// 4. Artist DNA
export interface ArtistDNAEntity {
  id: string;
  workspaceId: string;
  artistIdentity: string;
  story: string;
  genre: string;
  soundDescription: string;
  audienceDemographics: string;
  voiceAndLanguage: string;
  visualDirection: string;
  contentPillars: string[];
  recurringThemes: string[];
  goals: string;
  positioning: string;
  platforms: string[];
  preferences: Record<string, any>;
  thingsToAvoid: string[];
  createdAt: string;
  updatedAt: string;
}

// 5. Brand DNA
export interface BrandDNAEntity {
  id: string;
  workspaceId: string;
  identity: string;
  positioning: string;
  businessCategory: string;
  audience: string;
  valueProposition: string;
  offers: Array<{ id: string; name: string; price: number; description?: string }>;
  voice: string;
  visualIdentity: string;
  competitivePositioning: string;
  contentPillars: string[];
  growthGoals: string[];
  businessModel: string;
  createdAt: string;
  updatedAt: string;
}

// 6. Release
export interface ReleaseEntity {
  id: string;
  workspaceId: string;
  title: string;
  type: 'single' | 'ep' | 'album';
  stage: ReleaseStage;
  status: string;
  targetDate?: string;
  genre?: string;
  upc?: string;
  isrc?: string;
  label?: string;
  distributor?: string;
  dspPitch?: Record<string, any>;
  presave?: Record<string, any>;
  lyrics?: Record<string, any>;
  splits?: Array<{ collaborator: string; role: string; percentage: number }>;
  epk?: Record<string, any>;
  launchChecklist?: Array<{ id: string; task: string; completed: boolean; phase: string }>;
  coverAssetId?: string;
  masterAssetId?: string;
  createdAt: string;
  updatedAt: string;
}

// 7. Campaign
export interface CampaignEntity {
  id: string;
  workspaceId: string;
  title: string;
  objective: string;
  targetAudience?: string;
  status: CampaignStatus;
  startDate?: string;
  endDate?: string;
  budget: number;
  offers: any[];
  readinessScore: number;
  strategySummary?: string;
  createdAt: string;
  updatedAt: string;
}

// 8. Project
export interface ProjectEntity {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  category?: string;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// 9. Content Pillar
export interface ContentPillarEntity {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  color?: string;
  targetPercentage: number;
  createdAt: string;
}

// 10. Content Item
export interface ContentItemEntity {
  id: string;
  workspaceId: string;
  releaseId?: string;
  campaignId?: string;
  pillarId?: string;
  title: string;
  platform: string;
  format: string;
  status: ContentStatus;
  scheduledDate?: string;
  caption?: string;
  hook?: string;
  callToAction?: string;
  mediaUrl?: string;
  contentTier?: string;
  createdAt: string;
  updatedAt: string;
}

// 11. Asset
export interface AssetEntity {
  id: string;
  workspaceId: string;
  releaseId?: string;
  projectId?: string;
  name: string;
  fileType: string;
  fileSize: number;
  url: string;
  folderPath: string;
  tags: string[];
  isMaster: boolean;
  isArtwork: boolean;
  createdAt: string;
}

// 12. Task
export interface TaskEntity {
  id: string;
  workspaceId: string;
  releaseId?: string;
  campaignId?: string;
  projectId?: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

// 13. Milestone
export interface MilestoneEntity {
  id: string;
  workspaceId: string;
  releaseId?: string;
  title: string;
  targetDate: string;
  completed: boolean;
  category?: string;
  createdAt: string;
}

// 14. Products & Services
export interface ProductServiceEntity {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  type: 'product' | 'service' | 'subscription' | 'package';
  price: number;
  billingPeriod?: string;
  features: string[];
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// 15. Business Documents
export interface BusinessDocumentEntity {
  id: string;
  workspaceId: string;
  title: string;
  documentType: DocumentType;
  recipientName?: string;
  recipientCompany?: string;
  recipientEmail?: string;
  contentPayload: Record<string, any>;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  updatedAt: string;
}

// 16. Invoice
export interface InvoiceEntity {
  id: string;
  workspaceId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  lineItems: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  subtotal: number;
  taxRate: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 17. Approval
export interface ApprovalEntity {
  id: string;
  workspaceId: string;
  entityType: 'release' | 'campaign' | 'document' | 'asset' | 'split' | 'invoice';
  entityId: string;
  title: string;
  requesterId: string;
  approverId?: string;
  status: ApprovalStatus;
  notes?: string;
  createdAt: string;
  resolvedAt?: string;
}

// 18. Creative Memory
export interface CreativeMemoryEntity {
  id: string;
  workspaceId: string;
  memoryKey: string;
  category: 'voice' | 'strategy' | 'audience' | 'sound' | 'asset_reference' | 'rule';
  content: string;
  importance: number;
  source: string;
  createdAt: string;
  updatedAt: string;
}

// 19. Activity Log
export interface ActivityLogEntity {
  id: string;
  workspaceId: string;
  userId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetName?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// 20. Notification
export interface NotificationEntity {
  id: string;
  workspaceId: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'action_required';
  link?: string;
  isRead: boolean;
  createdAt: string;
}
