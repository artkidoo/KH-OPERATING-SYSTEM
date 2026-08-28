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
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  avatarUrl: string;
  defaultWorkspaceId?: string;
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
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMemberRecord {
  id: string;
  workspaceId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
}

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

export interface NotificationRecord {
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

export interface ActivityLogRecord {
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
  notifications: NotificationRecord[];
  activity_logs: ActivityLogRecord[];
  creative_requests: CreativeRequestRecord[];
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
    workspace_members: [member],
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
        return {
          users: parsed.users || seed.users,
          sessions: parsed.sessions || seed.sessions,
          workspaces: parsed.workspaces || seed.workspaces,
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
          notifications: parsed.notifications || seed.notifications,
          activity_logs: parsed.activity_logs || seed.activity_logs,
          creative_requests: parsed.creative_requests || seed.creative_requests,
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

  public updateWorkspace(workspaceId: string, updates: Partial<WorkspaceRecord>): WorkspaceRecord {
    const ws = this.getWorkspaceById(workspaceId);
    if (!ws) throw new Error("Workspace not found");
    Object.assign(ws, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return ws;
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
    if (deleted) this.save();
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
    if (deleted) this.save();
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
    if (deleted) this.save();
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
    if (deleted) this.save();
    return deleted;
  }

  // --- Campaigns ---
  public getCampaigns(workspaceId: string): CampaignRecord[] {
    return this.data.campaigns.filter((c) => c.workspaceId === workspaceId);
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
    if (deleted) this.save();
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
}

export const db = new Database();
