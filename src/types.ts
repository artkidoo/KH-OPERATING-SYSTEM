export type ActiveTab = 
  | 'overview'
  | 'artist-os'
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
export type ContentStatus = 'idea' | 'drafted' | 'ready' | 'published';

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

export interface ContentItem {
  id: string;
  workspaceId: string;
  releaseId?: string;
  campaignId?: string;
  projectId?: string;
  assetId?: string;
  title: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'spotify' | 'linkedin';
  contentType: string;
  concept: string;
  captionHook: string;
  soundSnippet?: string;
  scheduledDate?: string;
  status: ContentStatus;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  createdAt: string;
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

