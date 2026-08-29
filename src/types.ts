export type ActiveTab = 
  | 'overview'
  | 'artist-os'
  | 'content-engine'
  | 'studio'
  | 'creative-memory'
  | 'creative-radar'
  | 'workspace-hub'
  | 'artist-brain'
  | 'creative-brain'
  | 'cover-studio'
  | 'lyrics-studio'
  | 'dsp-pitcher'
  | 'mastering-suite'
  | 'splits-calculator'
  | 'presave-hub'
  | 'brand-os'
  | 'creator-os'
  | 'epk-builder'
  | 'project-console'
  | 'resource-vault'
  | 'intel-hub';

export type IdentityType = 'artist' | 'creator' | 'brand' | 'business' | 'startup';
export type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';
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

export type ReleaseStage = 'Planning' | 'Preparing' | 'Ready' | 'Launching' | 'Released' | 'Post-Release';

export interface ReadinessRequirement {
  id: string;
  label: string;
  description: string;
  weight: number;
  completed: boolean;
  category: 'artwork' | 'audio' | 'dsp-pitch' | 'presave' | 'lyrics' | 'splits' | 'epk' | 'content' | 'metadata';
  actionTab: ActiveTab;
  actionLabel: string;
  detail?: string;
}

export interface ReleaseReadinessSummary {
  score: number;
  stage: ReleaseStage;
  stageColor: string;
  requirements: ReadinessRequirement[];
  completedCount: number;
  totalCount: number;
  missingItems: {
    id: string;
    label: string;
    actionTab: ActiveTab;
    actionLabel: string;
    reason: string;
    priority: 'critical' | 'high' | 'medium';
  }[];
  daysUntilRelease: number | null;
  formattedDays: string;
}
export interface CampaignRequirement {
  id: string;
  label: string;
  description: string;
  weight: number;
  completed: boolean;
  category: 'brand-core' | 'product' | 'creative-direction' | 'hero-asset' | 'content-pipeline' | 'sprint-tasks' | 'approvals';
  actionTab: ActiveTab;
  actionLabel: string;
  detail?: string;
}

export interface CampaignReadinessSummary {
  score: number;
  stage: 'Planning' | 'Preparing' | 'Ready' | 'Launching' | 'Active' | 'Completed';
  stageColor: string;
  requirements: CampaignRequirement[];
  completedCount: number;
  totalCount: number;
  missingItems: {
    id: string;
    label: string;
    actionTab: ActiveTab;
    actionLabel: string;
    reason: string;
    priority: 'critical' | 'high' | 'medium';
  }[];
  daysUntilLaunch: number | null;
  formattedDays: string;
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

export interface ContentPillar {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  targetRatio?: number; // e.g. 25 (%)
  createdAt?: string;
}

export interface ContentQualityIssue {
  id: string;
  contentId: string;
  type: 'missing_hook' | 'missing_cta' | 'missing_asset' | 'missing_objective' | 'platform_mismatch' | 'missing_relationship';
  severity: 'warning' | 'suggestion';
  message: string;
  fixHint: string;
}

export interface ContentGapRecommendation {
  id: string;
  type: 'release_content' | 'campaign_content' | 'unused_asset' | 'calendar_gap' | 'milestone_coverage' | 'quality_alert';
  title: string;
  entityType?: 'release' | 'campaign' | 'asset' | 'milestone' | 'product';
  entityId?: string;
  entityTitle?: string;
  whatIsMissing: string;
  whyItMatters: string;
  whatToDoNext: string;
  priority: 'critical' | 'high' | 'medium';
  suggestedPlatform?: ContentPlatform;
  suggestedContentType?: string;
  suggestedPillar?: string;
  suggestedDate?: string;
  suggestedAssetId?: string;
  suggestedHook?: string;
  suggestedConcept?: string;
  suggestedCta?: string;
}

export interface ContentItem {
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
  captionHook: string; // backwards compatibility
  copy?: string; // full post copy / body text
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
  attachedAssets?: Asset[];
  aiMetadata?: {
    generatedByBrain?: boolean;
    promptUsed?: string;
    stage?: 'pre-release' | 'launch' | 'post-release' | 'sprint' | 'evergreen';
    suggestedReason?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  defaultWorkspaceId?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  identityType: IdentityType;
  avatarUrl: string;
  bio?: string;
  genreOrNiche?: string;
  website?: string;
  role?: MemberRole;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export interface TaskItem {
  id: string;
  workspaceId?: string;
  projectId?: string;
  projectTitle?: string;
  releaseId?: string;
  text: string;
  completed: boolean;
  priority?: TaskPriority;
  status?: TaskStatus;
  category?: string;
  assignedTo?: string;
  deadline?: string;
  createdAt?: string;
}

export interface Milestone {
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
}

export interface Folder {
  id: string;
  workspaceId: string;
  name: string;
  color?: string;
  icon?: string;
  category?: AssetCategory;
  assetCount?: number;
  createdAt: string;
}

export interface AttentionItem {
  id: string;
  title: string;
  description: string;
  level: 'critical' | 'warning' | 'info';
  category: 'release' | 'task' | 'artwork' | 'campaign' | 'legal';
  actionLabel: string;
  actionTab: ActiveTab;
  entityId?: string;
  severity?: 'critical' | 'warning' | 'info';
  type?: string;
  message?: string;
}

export interface CreativeRecommendation {
  id: string;
  title: string;
  insight: string;
  benefit: string;
  actionLabel: string;
  actionTab: ActiveTab;
  tags: string[];
  recommendation?: string;
  suggestedWorkstation?: ActiveTab;
  impact?: string;
  category?: string;
}

export interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'project' | 'asset' | 'release' | 'campaign' | 'content' | 'task' | 'folder';
  tab: ActiveTab;
  meta?: string;
}

export interface Project {
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
  milestones?: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  workspaceId: string;
  projectId?: string;
  releaseId?: string;
  campaignId?: string;
  folderId?: string;
  folderName?: string;
  name: string;
  category: AssetCategory;
  url: string;
  size: number;
  mimeType: string;
  dimensions?: string;
  tags: string[];
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Release {
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
  phases: RolloutPhase[];
  checklist: { id: string; task: string; category: string; deadline: string; completed: boolean }[];
  dspPitch?: DSPPitchData | any;
  presaveSlug?: string;
  presaveData?: Partial<PresavePageData>;
  lyrics?: {
    fullText?: string;
    lines?: LyricLine[];
    bpm?: number;
    synced?: boolean;
    writers?: string[];
    producers?: string[];
  };
  splits?: {
    splitsList?: CollaboratorSplit[];
    isExecuted?: boolean;
    totalMaster?: number;
    totalPublishing?: number;
  };
  epkData?: Partial<EPKData>;
  masterAudioDetails?: {
    sampleRate?: string;
    bitDepth?: string;
    integratedLufs?: number;
    truePeakDbfs?: number;
    format?: string;
    validated?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductService {
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

export type CampaignObjective = 
  | 'product_launch' 
  | 'lead_generation' 
  | 'brand_awareness' 
  | 'rebrand' 
  | 'seasonal_promo' 
  | 'growth_sprint' 
  | 'event_announcement';

export interface Campaign {
  id: string;
  workspaceId: string;
  releaseId?: string;
  projectId?: string;
  productId?: string;
  productName?: string;
  title: string;
  slug?: string;
  goal: string;
  objective?: CampaignObjective;
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

export interface CreativeMemoryDecision {
  id: string;
  decision: string;
  category?: string;
  timestamp: string;
}

export interface CreativeMemory {
  id: string;
  workspaceId: string;
  identitySummary: string;
  coreNarrative: string;
  toneTraits: string[];
  visualRules: string[];
  audioSignatures: string[];
  doSay: string[];
  dontSay: string[];
  brandColors?: BrandColor[];
  recentLearnings: string[];
  keyMilestones: string[];
  keyDecisions?: CreativeMemoryDecision[];
  recurringGoals?: string[];
  audienceInsights?: string[];
  updatedAt: string;
}

export interface BrainActionReceipt {
  id: string;
  toolName: string;
  actionSummary: string;
  entityType: 'task' | 'project' | 'release' | 'campaign' | 'content_item' | 'creative_memory' | 'creative_request';
  entityId: string;
  actionTab: string;
  actionLabel: string;
  payload?: any;
  status: 'executed' | 'failed';
  error?: string;
  timestamp: string;
}

export interface PinnedBrainContext {
  type: 'release' | 'campaign' | 'project' | 'brand_core' | 'general';
  id?: string;
  title?: string;
  details?: any;
}

export interface CreativeBrainRecommendation {
  id: string;
  title: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  whatIsMissing: string;
  whyItMatters: string;
  recommendedAction: string;
  actionTab: ActiveTab;
  actionLabel: string;
  executableTool?: {
    toolName: string;
    args: Record<string, any>;
  };
}

export interface NotificationItem {
  id: string;
  workspaceId: string;
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'request';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  workspaceId: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

export interface CreativeRequest {
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

export type ColorTheme = 'keedohub-red' | 'flame-gold' | 'neon-emerald' | 'royal-amethyst';
export type ThemeMode = 'dark' | 'light';

export interface ThemeOption {
  id: ColorTheme;
  name: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  badgeBg: string;
  badgeText: string;
  glowColor: string;
}

export interface RolloutDayAction {
  day: string;
  platform: string;
  contentType: string;
  concept: string;
  captionHook: string;
  timeToPost?: string;
  algorithmTip?: string;
  soundSnippet?: string;
  hashtags?: string[];
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface RolloutPhase {
  phaseName: string;
  focus: string;
  timeframe: string;
  actions: RolloutDayAction[];
}

export interface RolloutPlan {
  tagline: string;
  diasporaAngle: string;
  phases: RolloutPhase[];
  dspPitch: {
    pitchTitle: string;
    genreTags: string[];
    moodTags: string[];
    instruments: string[];
    editorialNote: string;
    targetPlaylists?: string[];
    curatorAngle?: string;
  };
  pressReleaseExcerpt: string;
  contentHooks: string[];
  hashtags?: string[];
  algorithmStrategy?: {
    soundBiteRule: string;
    retentionMetric: string;
    postingCadence: string;
    smartLinkTactic: string;
  };
  releaseChecklist?: {
    id: string;
    task: string;
    category: 'METADATA' | 'CREATIVE' | 'EDITORIAL' | 'PROMO';
    deadline: string;
    completed: boolean;
  }[];
}

export interface CoverStudioState {
  title: string;
  artist: string;
  subtitle: string;
  genreTag: string;
  themePreset: string;
  bgGradient: string;
  textColor: string;
  accentColor: string;
  showParentalAdvisory: boolean;
  parentalAdvisoryStyle: 'white' | 'black' | 'minimal' | 'red';
  showStreamingBadges: boolean;
  showBarcode: boolean;
  showAudioWave: boolean;
  textureOverlay: 'none' | 'vinyl-dust' | 'plastic-wrap' | 'grain' | 'grid';
  previewMode: 'canvas' | 'vinyl' | 'cd-jewel' | 'billboard' | 'phone';
}

export interface BrandColor {
  name: string;
  hex: string;
  role: string;
}

export interface BrandCore {
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
  colorPalette: BrandColor[];
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

export interface BrandStrategy {
  brandTagline: string;
  brandArchetype: string;
  voiceAndTone: {
    traits: string[];
    doSay: string[];
    dontSay: string[];
  };
  colorPalette: BrandColor[];
  typographyPairing: {
    heading: string;
    body: string;
    monospace: string;
  };
  marketPositioningStatement: string;
  launchSprint: {
    day: string;
    task: string;
  }[];
}

export interface EPKData {
  artistName: string;
  genre: string;
  hometown: string;
  tagline: string;
  bioShort: string;
  bioFull: string;
  monthlyListeners: string;
  totalStreams: string;
  instagramFollowers: string;
  tiktokFollowers: string;
  keyTracks: { title: string; duration: string; streams: string; dsp: string }[];
  pressQuotes: { quote: string; source: string }[];
  bookingEmail: string;
  management: string;
}

export interface LegalContract {
  id: string;
  title: string;
  category: 'Music' | 'Design' | 'Business' | 'Creator';
  description: string;
  templateText: string;
}

export interface IntelArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  summary: string;
  tags: string[];
  content: string[];
}

// 1. Lyric Studio Types
export interface LyricLine {
  id: string;
  timeMs: number; // e.g. 14500 (14.5s)
  timeFormatted: string; // "00:14.50"
  text: string;
  section?: 'intro' | 'verse' | 'pre-chorus' | 'chorus' | 'hook' | 'bridge' | 'outro';
}

export interface LyricProject {
  title: string;
  artist: string;
  bpm: number;
  genre: string;
  lines: LyricLine[];
  theme: 'cyber-crimson' | 'golden-afro' | 'neon-midnight' | 'minimal-noir' | 'cassette-lofi' | 'acid-green';
  fontStyle: 'space-grotesk' | 'cinematic-serif' | 'mono-terminal' | 'bold-impact';
  showWaveform: boolean;
  glowIntensity: 'subtle' | 'vibrant' | 'hyper';
}

// 2. DSP Pitcher Types
export interface DSPPitchData {
  trackTitle: string;
  artistName: string;
  featuredArtists: string;
  releaseDate: string;
  primaryGenre: string;
  subGenres: string[];
  moods: string[];
  instruments: string[];
  language: string;
  isExplicit: boolean;
  recordingLocation: string;
  culturalStory: string;
  marketingBudgetUSD: number;
  preSaveCount: number;
  dspPitchShort: string;
  pressPitchFull: string;
  curatorDMEmail: string;
  pitchScore: number;
}

export interface PlaylistTarget {
  id: string;
  name: string;
  dsp: 'Spotify' | 'Apple Music' | 'Audiomack' | 'Boomplay';
  followerCount: string;
  vibe: string;
  idealTrackArchetype: string;
  curatorTip: string;
}

// 3. Audio Mastering & Loudness Types
export interface MasteringReport {
  integratedLufs: number; // e.g. -14.2
  truePeakDbfs: number; // e.g. -0.8
  dynamicRangeDr: number; // e.g. 9
  stereoWidthPct: number; // e.g. 110%
  lowEndMonoCheck: 'PASS' | 'WARNING' | 'FAIL';
  clippingAlert: boolean;
  dspCompatibility: {
    spotify: 'OPTIMAL' | 'TOO_LOUD' | 'TOO_QUIET';
    appleMusic: 'OPTIMAL' | 'TOO_LOUD' | 'TOO_QUIET';
    youtube: 'OPTIMAL' | 'TOO_LOUD' | 'TOO_QUIET';
    clubDJ: 'OPTIMAL' | 'TOO_LOUD' | 'TOO_QUIET';
  };
  recommendations: string[];
}

// 4. Splits & Royalty Calculator Types
export interface CollaboratorSplit {
  id: string;
  name: string;
  role: 'Primary Artist' | 'Music Producer' | 'Featured Artist' | 'Songwriter / Topliner' | 'Mixing / Mastering' | 'Executive Producer';
  masterPercentage: number;
  publishingPercentage: number;
  ipiNumber: string;
  proAffiliation: 'BMI' | 'ASCAP' | 'PRS' | 'SAMRO' | 'MCSN' | 'SOCAN' | 'Other';
  payoutWallet: string;
}

// 5. Smart Link & Pre-Save Hub Types
export interface PresavePageData {
  title: string;
  artist: string;
  releaseDate: string;
  coverArtUrl: string;
  bioSnippet: string;
  audioPreviewUrl?: string;
  vanitySlug: string;
  themeStyle: 'dark-crimson' | 'emerald-glow' | 'sunset-gold' | 'glass-minimal';
  dspLinks: {
    spotify: string;
    appleMusic: string;
    audiomack: string;
    youtubeMusic: string;
    boomplay: string;
    deezer: string;
    tidal: string;
    soundcloud: string;
  };
}

export interface FanLead {
  id: string;
  email: string;
  phone: string;
  country: string;
  subscribedAt: string;
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

export interface StudioBrief {
  serviceCategory: StudioServiceCategory;
  title: string;
  // Specific to category
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
  // AI assist metadata
  aiAssisted?: boolean;
  aiSuggestedQuestions?: string[];
  aiClarifications?: string[];
  missingElementsDetected?: string[];
}

export interface StudioRequest {
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
  brief: StudioBrief;
  status: StudioRequestStatus;
  quoteId?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudioQuote {
  id: string;
  workspaceId: string;
  requestId: string;
  projectId?: string;
  serviceName: string;
  scopeSummary: string;
  deliverables: string[];
  price: number;
  currency: 'USD' | 'NGN';
  timeline: string; // e.g. "48-72 Hours", "3-5 Business Days"
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

export interface StudioDeliverable {
  id: string;
  projectId: string;
  workspaceId: string;
  name: string;
  description: string;
  format: string; // e.g. "PNG (3000x3000px)", "MP4 4K", "Figma Design System", "PDF Manual"
  version: string; // e.g. "V1", "V2", "Final Master"
  status: StudioDeliverableStatus;
  assetId?: string; // Connected to Asset Vault
  assetUrl?: string;
  previewUrl?: string;
  fileSize?: number;
  dueDate: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudioRevision {
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

export interface StudioMessage {
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

export interface StudioProject {
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
  brief: StudioBrief;
  deliverables: StudioDeliverable[];
  revisions: StudioRevision[];
  messages: StudioMessage[];
  milestones: { id: string; title: string; targetDate: string; completed: boolean }[];
  leadProducer: { name: string; role: string; avatarUrl: string };
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// PHASE 8: CREATIVE MEMORY & LONG-TERM INTELLIGENCE
// ==========================================

export type CreativeMemoryCategory = 
  | 'identity'      // artist, creator, brand, business, startup identity
  | 'preference'    // visual preferences, tone, writing style, recurring formats
  | 'strategy'      // audience ICP, positioning, recurring objectives, playbooks
  | 'project'       // key decisions, approved directions, requirements
  | 'asset'         // relationships to vault assets, color palettes, cover specs
  | 'rule';         // do say, don't say, guardrails, non-negotiable standards

export type CreativeMemoryScope = 
  | 'workspace'     // global to workspace
  | 'identity'      // identity-specific
  | 'release'       // release-specific
  | 'campaign'      // campaign-specific
  | 'project'       // project-specific
  | 'content'       // content-specific
  | 'studio_project'; // studio order/deliverable specific

export type CreativeMemorySource = 
  | 'user_explicit'    // created directly by user
  | 'ai_extracted'     // proposed by AI and approved by user
  | 'studio_decision'  // derived from studio production decisions
  | 'system_inferred'; // verified system pattern

export interface CreativeMemoryItem {
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
  confidence: number; // 0 - 100
  status: 'active' | 'archived';
  isPinned: boolean; // Marked as Key Memory
  supersedesMemoryId?: string; // Creative evolution: old era/positioning
  supersededByMemoryId?: string;
  assetReferenceId?: string;
  assetReferenceName?: string;
  assetReferenceUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryCandidate {
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

export interface MemoryBlockRule {
  id: string;
  workspaceId: string;
  pattern: string;
  reason: string;
  createdAt: string;
}

export interface MemoryRetrievalResult {
  memories: CreativeMemoryItem[];
  relevanceScores: Record<string, number>;
  usedMemorySummaries: string[];
  retrievalReasons: Record<string, string>;
}

// ==========================================
// PHASE 9: CREATIVE RADAR & PROACTIVE INTELLIGENCE
// ==========================================

export type RadarSeverity = 'critical' | 'high' | 'medium' | 'low';
export type RadarSignalStatus = 'new' | 'acknowledged' | 'actioned' | 'dismissed' | 'expired';
export type RadarCategory = 'release' | 'campaign' | 'project' | 'content' | 'asset' | 'studio' | 'system';

export type RadarSignalType =
  // Artist / Release Signals
  | 'release_approaching'
  | 'release_readiness_blocker'
  | 'release_content_gap'
  | 'release_asset_gap'
  | 'release_task_deadline'
  | 'release_studio_dependency'
  // Brand / Campaign Signals
  | 'campaign_launch_approaching'
  | 'campaign_readiness_blocker'
  | 'campaign_hero_asset_missing'
  | 'campaign_content_gap'
  | 'campaign_milestone_incomplete'
  | 'campaign_approval_pending'
  | 'campaign_task_overdue'
  | 'campaign_product_unlinked'
  | 'campaign_studio_blocker'
  // Project Signals
  | 'project_task_overdue'
  | 'project_milestone_blocked'
  | 'project_deadline_approaching'
  | 'project_pending_review'
  | 'project_revision_pending'
  | 'project_inactive'
  // Content Signals
  | 'content_pipeline_empty'
  | 'content_stuck_draft'
  | 'content_gap'
  | 'content_unutilized_asset'
  | 'content_schedule_conflict'
  // Asset Signals
  | 'asset_missing_connection'
  | 'asset_missing_requirement'
  | 'asset_approval_pending'
  | 'asset_duplicate_detected'
  // Studio Signals
  | 'studio_request_unreviewed'
  | 'studio_quote_pending_approval'
  | 'studio_feedback_pending'
  | 'studio_revision_in_progress'
  | 'studio_deliverable_approaching'
  | 'studio_delivery_pending_approval'
  // System / General
  | 'system_configuration_needed';

export interface RadarAffectedEntity {
  type: 'release' | 'campaign' | 'project' | 'content' | 'asset' | 'studio_request' | 'studio_quote' | 'studio_project' | 'studio_deliverable' | 'workspace';
  id: string;
  name: string;
  secondaryInfo?: string;
}

export interface RadarRecommendedAction {
  type: 'navigate_tab' | 'open_modal' | 'ask_brain' | 'create_task' | 'generate_content' | 'request_studio';
  label: string;
  targetTab?: ActiveTab;
  actionDescription?: string;
  payload?: Record<string, any>;
}

export interface RadarSignal {
  id: string;
  workspaceId: string;
  fingerprint: string; // Deterministic deduplication key
  category: RadarCategory;
  type: RadarSignalType;
  severity: RadarSeverity;
  priority: number; // 0 to 100 calculated score
  title: string;
  explanation: string;
  details?: string;
  affectedEntity: RadarAffectedEntity;
  recommendedAction: RadarRecommendedAction;
  status: RadarSignalStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  acknowledgedAt?: string;
  actionedAt?: string;
  dismissedAt?: string;
  metadata?: Record<string, any>;
}

export interface RadarDigest {
  workspaceId: string;
  generatedAt: string;
  headline: string;
  totalActiveSignals: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  topAttentionItems: RadarSignal[];
  recommendationsSummary: string[];
}

export interface RadarStats {
  totalActive: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byCategory: {
    release: number;
    campaign: number;
    project: number;
    content: number;
    asset: number;
    studio: number;
  };
  byStatus: {
    new: number;
    acknowledged: number;
    actioned: number;
    dismissed: number;
  };
}



