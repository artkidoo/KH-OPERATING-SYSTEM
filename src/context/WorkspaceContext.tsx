import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import {
  Workspace,
  Project,
  Asset,
  Release,
  Campaign,
  ContentItem,
  CreativeMemory,
  NotificationItem,
  ActivityLog,
  CreativeRequest,
  IdentityType,
  Folder,
  Milestone,
  TaskItem,
  AttentionItem,
  CreativeRecommendation,
  GlobalSearchResult,
  ReleaseReadinessSummary,
  ReadinessRequirement,
  ReleaseStage,
  BrandCore,
  ProductService,
  CampaignReadinessSummary,
  CampaignRequirement,
} from "../types";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

export function computeCampaignReadiness(
  campaign: Campaign | null,
  brandCore: BrandCore | null = null,
  productsList: ProductService[] = [],
  contentList: ContentItem[] = [],
  assetList: Asset[] = [],
  _taskList: TaskItem[] = []
): CampaignReadinessSummary {
  if (!campaign) {
    return {
      score: 0,
      stage: 'Planning',
      stageColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      requirements: [],
      completedCount: 0,
      totalCount: 7,
      missingItems: [],
      daysUntilLaunch: null,
      formattedDays: 'No campaign selected',
    };
  }

  // 1. Objective & Measurable KPI Targets
  const hasObjective = Boolean(
    (campaign.objective && campaign.objective.length > 8) ||
    (campaign.goal && campaign.goal.length > 8) ||
    (campaign.goals && (campaign.goals.targetImpressions > 0 || campaign.goals.targetRevenue > 0 || campaign.goals.targetLeadsOrSales > 0))
  );

  // 2. Product / Service Linked & Positioned
  const linkedProduct = productsList.find((p) => p.id === campaign.productId);
  const hasProduct = Boolean(
    campaign.productId ||
    linkedProduct ||
    productsList.length > 0
  );

  // 3. Creative Direction & Theme Codified
  const hasCreativeDirection = Boolean(
    (campaign.creativeDirection && (
      (campaign.creativeDirection.themeName && campaign.creativeDirection.themeName.length > 3) ||
      (campaign.creativeDirection.coreMessage && campaign.creativeDirection.coreMessage.length > 5) ||
      (campaign.creativeDirection.visualStyle && campaign.creativeDirection.visualStyle.length > 3)
    )) ||
    (brandCore?.visualDirection?.aestheticKeywords && brandCore.visualDirection.aestheticKeywords.length > 0)
  );

  // 4. Hero Visual Assets & Mockups Attached
  const hasHeroAsset = Boolean(
    campaign.heroAssetUrl ||
    campaign.heroAssetId ||
    assetList.some((a) => a.campaignId === campaign.id || a.category === 'image' || a.category === 'cover' || a.category === 'brand') ||
    linkedProduct?.heroImageUrl
  );

  // 5. Multi-Channel Content Pipeline
  const linkedContent = contentList.filter((c) => c.campaignId === campaign.id);
  const hasContentPipeline = linkedContent.length >= 2 || (campaign.sprintDays && campaign.sprintDays.length >= 2);

  // 6. Sprint Milestones & Timeline Scheduled
  const hasMilestones = Boolean(
    (campaign.milestones && campaign.milestones.length >= 2) ||
    (campaign.sprintDays && campaign.sprintDays.length >= 2)
  );

  // 7. Executive Operational Approvals
  const approvals = campaign.approvals || { creativeApproved: false, budgetApproved: false, launchApproved: false };
  const hasApprovals = Boolean(approvals.creativeApproved && (approvals.budgetApproved || (campaign.budget || 0) <= 0));

  const requirements: CampaignRequirement[] = [
    {
      id: 'req_objective',
      label: 'Campaign Objective & KPI Targets',
      description: 'Clear primary goal, target metrics, and measurable KPIs defined',
      weight: 15,
      completed: hasObjective,
      category: 'brand-core',
      actionTab: 'brand-os',
      actionLabel: 'Define in Campaign Hub',
      detail: hasObjective ? 'KPI targets locked' : 'Objective required',
    },
    {
      id: 'req_product',
      label: 'Product / Service Linked',
      description: 'Flagship product or service attached with active pricing',
      weight: 15,
      completed: hasProduct,
      category: 'product',
      actionTab: 'brand-os',
      actionLabel: 'Link in Product Catalog',
      detail: linkedProduct ? linkedProduct.name : hasProduct ? 'Catalog item attached' : 'No product linked',
    },
    {
      id: 'req_creative_dir',
      label: 'Creative Direction & Hook',
      description: 'Core aesthetic theme, visual hook, and campaign narrative codified',
      weight: 15,
      completed: hasCreativeDirection,
      category: 'creative-direction',
      actionTab: 'brand-os',
      actionLabel: 'Set Creative Direction',
      detail: hasCreativeDirection ? 'Direction formulated' : 'Theme unassigned',
    },
    {
      id: 'req_hero_assets',
      label: 'Hero Visual Assets & Vault Mockups',
      description: 'High-resolution campaign banner, 3D render, or visual hero in Vault',
      weight: 15,
      completed: hasHeroAsset,
      category: 'hero-asset',
      actionTab: 'resource-vault',
      actionLabel: 'Select Vault Assets',
      detail: hasHeroAsset ? 'Hero visual active' : 'Asset required',
    },
    {
      id: 'req_content_pipeline',
      label: 'Multi-Channel Content Pipeline',
      description: 'At least 2-3 scheduled campaign posts across social channels',
      weight: 15,
      completed: hasContentPipeline,
      category: 'content-pipeline',
      actionTab: 'brand-os',
      actionLabel: 'Plan in Content Engine',
      detail: hasContentPipeline ? `${linkedContent.length} posts scheduled` : 'Pipeline empty',
    },
    {
      id: 'req_sprint_timeline',
      label: 'Sprint Timeline & Milestones',
      description: 'Calibrated sprint phases, deliverables, and deadline schedule',
      weight: 10,
      completed: hasMilestones,
      category: 'sprint-tasks',
      actionTab: 'brand-os',
      actionLabel: 'Schedule Sprints',
      detail: hasMilestones ? 'Sprint roadmap active' : 'Timeline required',
    },
    {
      id: 'req_approvals',
      label: 'Operational Approvals',
      description: 'Creative and budget approvals verified by workspace operator',
      weight: 15,
      completed: hasApprovals,
      category: 'approvals',
      actionTab: 'brand-os',
      actionLabel: 'Review Approvals',
      detail: approvals.launchApproved ? 'Launch authorized' : approvals.creativeApproved ? 'Creative approved' : 'Pending approvals',
    },
  ];

  const totalScore = requirements.reduce((sum, req) => sum + (req.completed ? req.weight : 0), 0);
  const completedCount = requirements.filter((r) => r.completed).length;

  let daysUntilLaunch: number | null = null;
  let formattedDays = 'Date unset';
  if (campaign.startDate) {
    const target = new Date(campaign.startDate).getTime();
    const now = Date.now();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    daysUntilLaunch = diff;
    if (diff > 0) {
      formattedDays = `T-${diff} Days to Launch`;
    } else if (diff === 0) {
      formattedDays = 'Launch Day (T-0)';
    } else {
      formattedDays = `Live (T+${Math.abs(diff)} Days)`;
    }
  }

  let stage: 'Planning' | 'Preparing' | 'Ready' | 'Launching' | 'Active' | 'Completed' = 'Planning';
  let stageColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';

  if (campaign.status === 'completed') {
    stage = 'Completed';
    stageColor = 'text-purple-400 bg-purple-500/10 border-purple-500/30';
  } else if (campaign.status === 'active' || (daysUntilLaunch !== null && daysUntilLaunch <= 0)) {
    stage = 'Active';
    stageColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (totalScore >= 85 && (daysUntilLaunch !== null && daysUntilLaunch <= 7)) {
    stage = 'Launching';
    stageColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  } else if (totalScore >= 85) {
    stage = 'Ready';
    stageColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (totalScore >= 40) {
    stage = 'Preparing';
    stageColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
  } else {
    stage = 'Planning';
    stageColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  }

  const missingItems = requirements
    .filter((r) => !r.completed)
    .map((r) => ({
      id: r.id,
      label: r.label,
      actionTab: r.actionTab,
      actionLabel: r.actionLabel,
      reason: r.description,
      priority: (r.weight >= 15 ? 'critical' : 'high') as 'critical' | 'high',
    }));

  return {
    score: totalScore,
    stage,
    stageColor,
    requirements,
    completedCount,
    totalCount: requirements.length,
    missingItems,
    daysUntilLaunch,
    formattedDays,
  };
}

export function computeReleaseReadiness(
  release: Release | null,
  contentList: ContentItem[] = [],
  assetList: Asset[] = [],
  _taskList: TaskItem[] = []
): ReleaseReadinessSummary {
  if (!release) {
    return {
      score: 0,
      stage: 'Planning',
      stageColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      requirements: [],
      completedCount: 0,
      totalCount: 7,
      missingItems: [],
      daysUntilRelease: null,
      formattedDays: 'No release selected',
    };
  }

  // 1. Artwork check: High-res cover image attached or generated
  const hasArtwork = Boolean(
    (release.coverUrl && release.coverUrl.length > 5) ||
    (release.coverAssetId) ||
    assetList.some((a) => (a.releaseId === release.id || (release.projectId && a.projectId === release.projectId)) && (a.category === 'cover' || a.category === 'image'))
  );

  // 2. Master Audio check: Master audio uploaded or validated
  const hasAudio = Boolean(
    (release.audioUrl && release.audioUrl.length > 5) ||
    (release.audioAssetId) ||
    release.masterAudioDetails?.validated ||
    release.masterAudioDetails?.integratedLufs !== undefined ||
    assetList.some((a) => (a.releaseId === release.id || (release.projectId && a.projectId === release.projectId)) && a.category === 'audio')
  );

  // 3. DSP Editorial Pitch check
  const hasDspPitch = Boolean(
    release.dspPitch && (
      (release.dspPitch.dspPitchShort && release.dspPitch.dspPitchShort.length > 10) ||
      (release.dspPitch.editorialNote && release.dspPitch.editorialNote.length > 10) ||
      (release.dspPitch.pitchTitle && release.dspPitch.pitchTitle.length > 2)
    )
  );

  // 4. Smart Pre-Save check
  const hasPresave = Boolean(
    release.presaveSlug ||
    (release.presaveData && (release.presaveData.vanitySlug || release.presaveData.dspLinks))
  );

  // 5. Synced Lyrics check
  const hasLyrics = Boolean(
    release.lyrics && (
      (release.lyrics.fullText && release.lyrics.fullText.length > 20) ||
      (release.lyrics.lines && release.lyrics.lines.length > 0)
    )
  );

  // 6. Split Sheet & Rights check
  const hasSplits = Boolean(
    release.splits && (
      (release.splits.splitsList && release.splits.splitsList.length > 0) ||
      release.splits.isExecuted
    )
  );

  // 7. Promo Content Pipeline check (at least 2-3 content items linked to this release)
  const linkedContent = contentList.filter((c) => c.releaseId === release.id || (release.campaignId && c.campaignId === release.campaignId));
  const hasContent = linkedContent.length >= 2 || (release.phases && release.phases.length > 0);

  const requirements: ReadinessRequirement[] = [
    {
      id: 'req_artwork',
      label: '3000px Cover Artwork',
      description: 'High-resolution DSP-compliant artwork generated or uploaded',
      weight: 15,
      completed: hasArtwork,
      category: 'artwork',
      actionTab: 'cover-studio',
      actionLabel: 'Design in Cover Studio',
      detail: hasArtwork ? 'Vault verified' : 'Missing 3000x3000px artwork',
    },
    {
      id: 'req_audio',
      label: 'Master Audio & LUFS Check',
      description: '24-bit 44.1kHz master WAV with streaming loudness verified',
      weight: 15,
      completed: hasAudio,
      category: 'audio',
      actionTab: 'mastering-suite',
      actionLabel: 'Check in Mastering Suite',
      detail: hasAudio ? 'Master track attached' : 'Master audio unverified',
    },
    {
      id: 'req_dsp_pitch',
      label: 'DSP Editorial Pitch Letter',
      description: 'Spotify/Apple Music curator angle, subgenres, and marketing hook',
      weight: 15,
      completed: hasDspPitch,
      category: 'dsp-pitch',
      actionTab: 'dsp-pitcher',
      actionLabel: 'Draft DSP Pitch',
      detail: hasDspPitch ? 'Pitch blueprint stored' : 'Editorial pitch required',
    },
    {
      id: 'req_presave',
      label: 'Smart Pre-Save Landing Page',
      description: 'Pre-save link configured with Spotify, Apple & Audiomack hooks',
      weight: 15,
      completed: hasPresave,
      category: 'presave',
      actionTab: 'presave-hub',
      actionLabel: 'Configure Pre-Save Hub',
      detail: hasPresave ? `Linked to /${release.presaveSlug || 'presave'}` : 'Pre-save link not deployed',
    },
    {
      id: 'req_lyrics',
      label: 'Synced Lyrics & Sync LRC',
      description: 'Full lyrics sheet with synced timecode timestamps',
      weight: 10,
      completed: hasLyrics,
      category: 'lyrics',
      actionTab: 'lyrics-studio',
      actionLabel: 'Sync in Lyrics Studio',
      detail: hasLyrics ? 'Lyrics synced' : 'Lyrics unattached',
    },
    {
      id: 'req_splits',
      label: 'Split Sheet & Rights Agreement',
      description: 'Publishing and master percentages signed with collaborators',
      weight: 15,
      completed: hasSplits,
      category: 'splits',
      actionTab: 'splits-calculator',
      actionLabel: 'Calculate Splits',
      detail: hasSplits ? 'Splits documented' : 'Split sheet unfinalized',
    },
    {
      id: 'req_content',
      label: '30-Day Promo Content Pipeline',
      description: 'Scheduled teaser clips, announcement carousels, and drop hooks',
      weight: 15,
      completed: hasContent,
      category: 'content',
      actionTab: 'artist-brain',
      actionLabel: 'Generate in Content Brain',
      detail: hasContent ? `${linkedContent.length} items scheduled` : 'Pipeline empty',
    },
  ];

  const totalScore = requirements.reduce((sum, req) => sum + (req.completed ? req.weight : 0), 0);
  const completedCount = requirements.filter((r) => r.completed).length;

  // Calculate days until release
  let daysUntilRelease: number | null = null;
  let formattedDays = 'Date unset';
  if (release.releaseDate) {
    const target = new Date(release.releaseDate).getTime();
    const now = Date.now();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    daysUntilRelease = diff;
    if (diff > 0) {
      formattedDays = `T-${diff} Days`;
    } else if (diff === 0) {
      formattedDays = 'Drop Day (T-0)';
    } else {
      formattedDays = `T+${Math.abs(diff)} Days (Out Now)`;
    }
  }

  // Determine stage
  let stage: ReleaseStage = 'Planning';
  let stageColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';

  if (daysUntilRelease !== null && daysUntilRelease < 0) {
    stage = 'Post-Release';
    stageColor = 'text-purple-400 bg-purple-500/10 border-purple-500/30';
  } else if (daysUntilRelease === 0 || (release.status === 'released')) {
    stage = 'Released';
    stageColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (totalScore >= 85 && (daysUntilRelease !== null && daysUntilRelease <= 7)) {
    stage = 'Launching';
    stageColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  } else if (totalScore >= 85) {
    stage = 'Ready';
    stageColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (totalScore >= 40) {
    stage = 'Preparing';
    stageColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
  } else {
    stage = 'Planning';
    stageColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  }

  const missingItems = requirements
    .filter((r) => !r.completed)
    .map((r) => ({
      id: r.id,
      label: r.label,
      actionTab: r.actionTab,
      actionLabel: r.actionLabel,
      reason: r.description,
      priority: (r.weight >= 15 ? 'critical' : 'high') as 'critical' | 'high',
    }));

  return {
    score: totalScore,
    stage,
    stageColor,
    requirements,
    completedCount,
    totalCount: requirements.length,
    missingItems,
    daysUntilRelease,
    formattedDays,
  };
}

interface WorkspaceOverview {
  workspace: Workspace;
  stats: {
    totalProjects: number;
    activeProjects: number;
    pendingTasks: number;
    totalAssets: number;
    totalReleases: number;
    scheduledReleases: number;
    totalCampaigns: number;
    activeCampaigns?: number;
    totalProducts?: number;
    totalContentItems: number;
    upcomingContent: number;
    totalFolders: number;
    totalMilestones: number;
  };
  latestRelease: Release | null;
  latestProject: Project | null;
  latestCampaign: Campaign | null;
  brandCore?: BrandCore;
  products?: ProductService[];
  recentAssets: Asset[];
  upcomingContent: ContentItem[];
  creativeMemory: CreativeMemory;
  unreadNotificationsCount: number;
  recentActivity: ActivityLog[];
  attentionItems: AttentionItem[];
  recommendations: CreativeRecommendation[];
  milestones: Milestone[];
  pendingTasks: TaskItem[];
  folders: Folder[];
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  overview: WorkspaceOverview | null;
  projects: Project[];
  assets: Asset[];
  releases: Release[];
  activeReleaseId: string | null;
  activeRelease: Release | null;
  setActiveReleaseId: (id: string | null) => void;
  calculateReleaseReadiness: (release?: Release | null) => ReleaseReadinessSummary;
  
  // Brand & Business Master Objects
  brandCore: BrandCore | null;
  products: ProductService[];
  campaigns: Campaign[];
  activeCampaignId: string | null;
  activeCampaign: Campaign | null;
  setActiveCampaignId: (id: string | null) => void;
  calculateCampaignReadiness: (campaign?: Campaign | null) => CampaignReadinessSummary;

  contentItems: ContentItem[];
  folders: Folder[];
  milestones: Milestone[];
  tasks: TaskItem[];
  attentionItems: AttentionItem[];
  recommendations: CreativeRecommendation[];
  creativeMemory: CreativeMemory | null;
  notifications: NotificationItem[];
  activityLogs: ActivityLog[];
  creativeRequests: CreativeRequest[];
  isLoading: boolean;
  
  // Search state
  searchResults: GlobalSearchResult[];
  isSearching: boolean;
  performSearch: (query: string) => Promise<GlobalSearchResult[]>;
  clearSearch: () => void;

  // Actions
  fetchWorkspaceData: () => Promise<void>;
  createNewWorkspace: (data: { name: string; identityType: IdentityType; bio?: string; genreOrNiche?: string; avatarUrl?: string }) => Promise<Workspace>;
  updateCurrentWorkspace: (updates: Partial<Workspace>) => Promise<void>;
  
  // Projects
  createProject: (project: Partial<Project>) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;

  // Tasks
  createTask: (task: { text: string; projectId?: string; priority?: any; deadline?: string; category?: string }) => Promise<TaskItem>;
  updateTask: (taskId: string, updates: Partial<TaskItem>) => Promise<TaskItem>;
  toggleTask: (taskId: string, currentCompleted: boolean) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  // Folders
  createFolder: (folder: { name: string; color?: string; icon?: string; category?: any }) => Promise<Folder>;
  updateFolder: (folderId: string, updates: Partial<Folder>) => Promise<Folder>;
  deleteFolder: (folderId: string) => Promise<void>;

  // Milestones
  createMilestone: (milestone: { title: string; targetDate: string; projectId?: string; projectTitle?: string; status?: any; deliverables?: string[]; notes?: string }) => Promise<Milestone>;
  updateMilestone: (milestoneId: string, updates: Partial<Milestone>) => Promise<Milestone>;
  toggleMilestone: (milestoneId: string, completed: boolean) => Promise<void>;
  deleteMilestone: (milestoneId: string) => Promise<void>;
  
  // Assets
  saveAsset: (asset: Partial<Asset>) => Promise<Asset>;
  deleteAsset: (assetId: string) => Promise<void>;
  
  // Releases (Artist OS Central Hub)
  createRelease: (release: Partial<Release>) => Promise<Release>;
  updateRelease: (releaseId: string, updates: Partial<Release>) => Promise<Release>;
  saveActiveRelease: (updates: Partial<Release>) => Promise<Release>;
  deleteRelease: (releaseId: string) => Promise<void>;
  
  // Brand Core & Products (Brand/Business OS)
  updateBrandCore: (updates: Partial<BrandCore>) => Promise<BrandCore>;
  createProduct: (product: Partial<ProductService> & { name: string }) => Promise<ProductService>;
  updateProduct: (productId: string, updates: Partial<ProductService>) => Promise<ProductService>;
  deleteProduct: (productId: string) => Promise<void>;

  // Campaigns (Brand/Business OS Master Object)
  createCampaign: (campaign: Partial<Campaign>) => Promise<Campaign>;
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => Promise<Campaign>;
  saveActiveCampaign: (updates: Partial<Campaign>) => Promise<Campaign>;
  deleteCampaign: (campaignId: string) => Promise<void>;
  
  // Content Items
  createContentItem: (item: Partial<ContentItem>) => Promise<ContentItem>;
  updateContentItem: (itemId: string, updates: Partial<ContentItem>) => Promise<ContentItem>;
  deleteContentItem: (itemId: string) => Promise<void>;
  
  // Creative Memory
  updateCreativeMemory: (memory: Partial<CreativeMemory>) => Promise<CreativeMemory>;
  
  // Notifications
  markNotificationAsRead: (notifId: string) => Promise<void>;
  
  // Creative Studio Requests
  submitStudioRequest: (data: Partial<CreativeRequest>) => Promise<CreativeRequest>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { activeWorkspace, refreshUserData, updateActiveWorkspace } = useAuth();
  const [overview, setOverview] = useState<WorkspaceOverview | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [activeReleaseId, setActiveReleaseIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem("keedohub_active_release_id") || null;
    } catch {
      return null;
    }
  });

  const [brandCore, setBrandCore] = useState<BrandCore | null>(null);
  const [products, setProducts] = useState<ProductService[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem("keedohub_active_campaign_id") || null;
    } catch {
      return null;
    }
  });

  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);
  const [recommendations, setRecommendations] = useState<CreativeRecommendation[]>([]);
  const [creativeMemory, setCreativeMemory] = useState<CreativeMemory | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [creativeRequests, setCreativeRequests] = useState<CreativeRequest[]>([]);
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setActiveReleaseId = useCallback((id: string | null) => {
    setActiveReleaseIdState(id);
    try {
      if (id) {
        localStorage.setItem("keedohub_active_release_id", id);
      } else {
        localStorage.removeItem("keedohub_active_release_id");
      }
    } catch {
      // storage unavailable
    }
  }, []);

  const setActiveCampaignId = useCallback((id: string | null) => {
    setActiveCampaignIdState(id);
    try {
      if (id) {
        localStorage.setItem("keedohub_active_campaign_id", id);
      } else {
        localStorage.removeItem("keedohub_active_campaign_id");
      }
    } catch {
      // storage unavailable
    }
  }, []);

  // Compute active release with auto-fallback to first release if none or invalid
  const activeRelease = useMemo(() => {
    if (!releases || releases.length === 0) return null;
    if (activeReleaseId) {
      const match = releases.find((r) => r.id === activeReleaseId);
      if (match) return match;
    }
    return releases[0] || null;
  }, [releases, activeReleaseId]);

  // Compute active campaign with auto-fallback to first campaign if none or invalid
  const activeCampaign = useMemo(() => {
    if (!campaigns || campaigns.length === 0) return null;
    if (activeCampaignId) {
      const match = campaigns.find((c) => c.id === activeCampaignId);
      if (match) return match;
    }
    return campaigns[0] || null;
  }, [campaigns, activeCampaignId]);

  // Keep activeReleaseId in sync if initial load had no selection
  useEffect(() => {
    if (releases.length > 0 && (!activeReleaseId || !releases.some((r) => r.id === activeReleaseId))) {
      setActiveReleaseIdState(releases[0].id);
    }
  }, [releases, activeReleaseId]);

  // Keep activeCampaignId in sync if initial load had no selection
  useEffect(() => {
    if (campaigns.length > 0 && (!activeCampaignId || !campaigns.some((c) => c.id === activeCampaignId))) {
      setActiveCampaignIdState(campaigns[0].id);
    }
  }, [campaigns, activeCampaignId]);

  const calculateReleaseReadiness = useCallback((rel?: Release | null) => {
    const targetRelease = rel !== undefined ? rel : activeRelease;
    return computeReleaseReadiness(targetRelease, contentItems, assets, tasks);
  }, [activeRelease, contentItems, assets, tasks]);

  const calculateCampaignReadiness = useCallback((camp?: Campaign | null) => {
    const targetCampaign = camp !== undefined ? camp : activeCampaign;
    return computeCampaignReadiness(targetCampaign, brandCore, products, contentItems, assets, tasks);
  }, [activeCampaign, brandCore, products, contentItems, assets, tasks]);

  const fetchWorkspaceData = useCallback(async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    try {
      const [
        overviewRes,
        projectsRes,
        assetsRes,
        releasesRes,
        campaignsRes,
        brandCoreRes,
        productsRes,
        contentRes,
        foldersRes,
        milestonesRes,
        tasksRes,
        memoryRes,
        notifRes,
        activityRes,
        reqRes
      ] = await Promise.all([
        api.workspaces.getOverview(activeWorkspace.id).catch(() => null),
        api.projects.list(activeWorkspace.id).catch(() => ({ projects: [] })),
        api.assets.list(activeWorkspace.id).catch(() => ({ assets: [] })),
        api.releases.list(activeWorkspace.id).catch(() => ({ releases: [] })),
        api.campaigns.list(activeWorkspace.id).catch(() => ({ campaigns: [] })),
        api.brandCore.get(activeWorkspace.id).catch(() => ({ brandCore: null })),
        api.products.list(activeWorkspace.id).catch(() => ({ products: [] })),
        api.contentItems.list(activeWorkspace.id).catch(() => ({ contentItems: [] })),
        api.folders.list(activeWorkspace.id).catch(() => ({ folders: [] })),
        api.milestones.list(activeWorkspace.id).catch(() => ({ milestones: [] })),
        api.tasks.list(activeWorkspace.id).catch(() => ({ tasks: [] })),
        api.creativeMemory.get(activeWorkspace.id).catch(() => ({ creativeMemory: null })),
        api.notifications.list(activeWorkspace.id).catch(() => ({ notifications: [] })),
        api.activityLogs.list(activeWorkspace.id).catch(() => ({ activityLogs: [] })),
        api.creativeRequests.list(activeWorkspace.id).catch(() => ({ requests: [] })),
      ]);

      if (overviewRes) {
        setOverview(overviewRes);
        if (overviewRes.attentionItems) setAttentionItems(overviewRes.attentionItems);
        if (overviewRes.recommendations) setRecommendations(overviewRes.recommendations);
      }
      setProjects(projectsRes.projects || []);
      setAssets(assetsRes.assets || []);
      setReleases(releasesRes.releases || []);
      setCampaigns(campaignsRes.campaigns || []);
      if (brandCoreRes.brandCore) setBrandCore(brandCoreRes.brandCore);
      setProducts(productsRes.products || []);
      setContentItems(contentRes.contentItems || []);
      setFolders(foldersRes.folders || []);
      setMilestones(milestonesRes.milestones || []);
      setTasks(tasksRes.tasks || []);
      setCreativeMemory(memoryRes.creativeMemory || null);
      setNotifications(notifRes.notifications || []);
      setActivityLogs(activityRes.activityLogs || []);
      setCreativeRequests(reqRes.requests || []);
    } catch (err) {
      console.error("[WorkspaceContext] Error fetching workspace entities:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    if (activeWorkspace?.id) {
      fetchWorkspaceData();
    }
  }, [activeWorkspace?.id, fetchWorkspaceData]);

  // Global Search
  const performSearch = async (query: string) => {
    if (!activeWorkspace || !query.trim()) {
      setSearchResults([]);
      return [];
    }
    setIsSearching(true);
    try {
      const res = await api.search.query(activeWorkspace.id, query);
      setSearchResults(res.results || []);
      return res.results || [];
    } catch (err) {
      console.error("[WorkspaceContext] Search error:", err);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
  };

  const createNewWorkspace = async (data: { name: string; identityType: IdentityType; bio?: string; genreOrNiche?: string; avatarUrl?: string }) => {
    const res = await api.workspaces.create(data);
    await refreshUserData();
    return res.workspace;
  };

  const updateCurrentWorkspace = async (updates: Partial<Workspace>) => {
    if (!activeWorkspace) return;
    const res = await api.workspaces.update(activeWorkspace.id, updates);
    updateActiveWorkspace(res.workspace);
    await fetchWorkspaceData();
  };

  // Projects
  const createProject = async (project: Partial<Project>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.projects.create(activeWorkspace.id, project);
    setProjects((prev) => [res.project, ...prev]);
    await fetchWorkspaceData();
    return res.project;
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.projects.update(activeWorkspace.id, projectId, updates);
    setProjects((prev) => prev.map((p) => (p.id === projectId ? res.project : p)));
    await fetchWorkspaceData();
    return res.project;
  };

  const deleteProject = async (projectId: string) => {
    if (!activeWorkspace) return;
    await api.projects.delete(activeWorkspace.id, projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    await fetchWorkspaceData();
  };

  // Tasks
  const createTask = async (task: { text: string; projectId?: string; priority?: any; deadline?: string; category?: string }) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.tasks.create(activeWorkspace.id, task);
    setTasks((prev) => [res.task, ...prev]);
    await fetchWorkspaceData();
    return res.task;
  };

  const updateTask = async (taskId: string, updates: Partial<TaskItem>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.tasks.update(activeWorkspace.id, taskId, updates);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? res.task : t)));
    await fetchWorkspaceData();
    return res.task;
  };

  const toggleTask = async (taskId: string, currentCompleted: boolean) => {
    if (!activeWorkspace) return;
    await updateTask(taskId, { completed: !currentCompleted });
  };

  const deleteTask = async (taskId: string) => {
    if (!activeWorkspace) return;
    await api.tasks.delete(activeWorkspace.id, taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await fetchWorkspaceData();
  };

  // Folders
  const createFolder = async (folder: { name: string; color?: string; icon?: string; category?: any }) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.folders.create(activeWorkspace.id, folder);
    setFolders((prev) => [res.folder, ...prev]);
    await fetchWorkspaceData();
    return res.folder;
  };

  const updateFolder = async (folderId: string, updates: Partial<Folder>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.folders.update(activeWorkspace.id, folderId, updates);
    setFolders((prev) => prev.map((f) => (f.id === folderId ? res.folder : f)));
    await fetchWorkspaceData();
    return res.folder;
  };

  const deleteFolder = async (folderId: string) => {
    if (!activeWorkspace) return;
    await api.folders.delete(activeWorkspace.id, folderId);
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    await fetchWorkspaceData();
  };

  // Milestones
  const createMilestone = async (milestone: { title: string; targetDate: string; projectId?: string; projectTitle?: string; status?: any; deliverables?: string[]; notes?: string }) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.milestones.create(activeWorkspace.id, milestone);
    setMilestones((prev) => [...prev, res.milestone]);
    await fetchWorkspaceData();
    return res.milestone;
  };

  const updateMilestone = async (milestoneId: string, updates: Partial<Milestone>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.milestones.update(activeWorkspace.id, milestoneId, updates);
    setMilestones((prev) => prev.map((m) => (m.id === milestoneId ? res.milestone : m)));
    await fetchWorkspaceData();
    return res.milestone;
  };

  const toggleMilestone = async (milestoneId: string, completed: boolean) => {
    await updateMilestone(milestoneId, { completed: !completed, status: !completed ? 'achieved' : 'in-progress' });
  };

  const deleteMilestone = async (milestoneId: string) => {
    if (!activeWorkspace) return;
    await api.milestones.delete(activeWorkspace.id, milestoneId);
    setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
    await fetchWorkspaceData();
  };

  // Assets
  const saveAsset = async (asset: Partial<Asset>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.assets.create(activeWorkspace.id, asset);
    setAssets((prev) => [res.asset, ...prev]);
    await fetchWorkspaceData();
    return res.asset;
  };

  const deleteAsset = async (assetId: string) => {
    if (!activeWorkspace) return;
    await api.assets.delete(activeWorkspace.id, assetId);
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
    await fetchWorkspaceData();
  };

  // Releases
  const createRelease = async (release: Partial<Release>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.releases.create(activeWorkspace.id, release);
    setReleases((prev) => [res.release, ...prev]);
    if (res.release?.id) {
      setActiveReleaseId(res.release.id);
    }
    await fetchWorkspaceData();
    return res.release;
  };

  const updateRelease = async (releaseId: string, updates: Partial<Release>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.releases.update(activeWorkspace.id, releaseId, updates);
    setReleases((prev) => prev.map((r) => (r.id === releaseId ? res.release : r)));
    await fetchWorkspaceData();
    return res.release;
  };

  const saveActiveRelease = async (updates: Partial<Release>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    if (!activeRelease) throw new Error("No active release selected");
    return updateRelease(activeRelease.id, updates);
  };

  const deleteRelease = async (releaseId: string) => {
    if (!activeWorkspace) return;
    await api.releases.delete(activeWorkspace.id, releaseId);
    setReleases((prev) => prev.filter((r) => r.id !== releaseId));
    if (activeReleaseId === releaseId) {
      const remaining = releases.filter((r) => r.id !== releaseId);
      setActiveReleaseId(remaining.length > 0 ? remaining[0].id : null);
    }
    await fetchWorkspaceData();
  };

  // Brand Core
  const updateBrandCore = async (updates: Partial<BrandCore>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.brandCore.update(activeWorkspace.id, updates);
    setBrandCore(res.brandCore);
    await fetchWorkspaceData();
    return res.brandCore;
  };

  // Products
  const createProduct = async (product: Partial<ProductService> & { name: string }) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.products.create(activeWorkspace.id, product);
    setProducts((prev) => [res.product, ...prev]);
    await fetchWorkspaceData();
    return res.product;
  };

  const updateProduct = async (productId: string, updates: Partial<ProductService>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.products.update(activeWorkspace.id, productId, updates);
    setProducts((prev) => prev.map((p) => (p.id === productId ? res.product : p)));
    await fetchWorkspaceData();
    return res.product;
  };

  const deleteProduct = async (productId: string) => {
    if (!activeWorkspace) return;
    await api.products.delete(activeWorkspace.id, productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    await fetchWorkspaceData();
  };

  // Campaigns
  const createCampaign = async (campaign: Partial<Campaign>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.campaigns.create(activeWorkspace.id, campaign);
    setCampaigns((prev) => [res.campaign, ...prev]);
    if (res.campaign?.id) {
      setActiveCampaignId(res.campaign.id);
    }
    await fetchWorkspaceData();
    return res.campaign;
  };

  const updateCampaign = async (campaignId: string, updates: Partial<Campaign>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.campaigns.update(activeWorkspace.id, campaignId, updates);
    setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? res.campaign : c)));
    await fetchWorkspaceData();
    return res.campaign;
  };

  const saveActiveCampaign = async (updates: Partial<Campaign>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    if (!activeCampaign) throw new Error("No active campaign selected");
    return updateCampaign(activeCampaign.id, updates);
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!activeWorkspace) return;
    await api.campaigns.delete(activeWorkspace.id, campaignId);
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    if (activeCampaignId === campaignId) {
      const remaining = campaigns.filter((c) => c.id !== campaignId);
      setActiveCampaignId(remaining.length > 0 ? remaining[0].id : null);
    }
    await fetchWorkspaceData();
  };

  // Content Items
  const createContentItem = async (item: Partial<ContentItem>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.contentItems.create(activeWorkspace.id, item);
    setContentItems((prev) => [res.contentItem, ...prev]);
    await fetchWorkspaceData();
    return res.contentItem;
  };

  const updateContentItem = async (itemId: string, updates: Partial<ContentItem>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.contentItems.update(activeWorkspace.id, itemId, updates);
    setContentItems((prev) => prev.map((c) => (c.id === itemId ? res.contentItem : c)));
    await fetchWorkspaceData();
    return res.contentItem;
  };

  const deleteContentItem = async (itemId: string) => {
    if (!activeWorkspace) return;
    await api.contentItems.delete(activeWorkspace.id, itemId);
    setContentItems((prev) => prev.filter((c) => c.id !== itemId));
    await fetchWorkspaceData();
  };

  // Creative Memory
  const updateCreativeMemory = async (memory: Partial<CreativeMemory>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.creativeMemory.update(activeWorkspace.id, memory);
    setCreativeMemory(res.creativeMemory);
    await fetchWorkspaceData();
    return res.creativeMemory;
  };

  // Notifications
  const markNotificationAsRead = async (notifId: string) => {
    if (!activeWorkspace) return;
    await api.notifications.markRead(activeWorkspace.id, notifId);
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
  };

  // Creative Requests
  const submitStudioRequest = async (data: Partial<CreativeRequest>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.creativeRequests.create(activeWorkspace.id, data);
    setCreativeRequests((prev) => [res.request, ...prev]);
    await fetchWorkspaceData();
    return res.request;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspace: activeWorkspace,
        overview,
        projects,
        assets,
        releases,
        activeReleaseId,
        activeRelease,
        setActiveReleaseId,
        calculateReleaseReadiness,
        brandCore,
        products,
        campaigns,
        activeCampaignId,
        activeCampaign,
        setActiveCampaignId,
        calculateCampaignReadiness,
        contentItems,
        folders,
        milestones,
        tasks,
        attentionItems,
        recommendations,
        creativeMemory,
        notifications,
        activityLogs,
        creativeRequests,
        isLoading,
        searchResults,
        isSearching,
        performSearch,
        clearSearch,
        fetchWorkspaceData,
        createNewWorkspace,
        updateCurrentWorkspace,
        createProject,
        updateProject,
        deleteProject,
        createTask,
        updateTask,
        toggleTask,
        deleteTask,
        createFolder,
        updateFolder,
        deleteFolder,
        createMilestone,
        updateMilestone,
        toggleMilestone,
        deleteMilestone,
        saveAsset,
        deleteAsset,
        createRelease,
        updateRelease,
        saveActiveRelease,
        deleteRelease,
        updateBrandCore,
        createProduct,
        updateProduct,
        deleteProduct,
        createCampaign,
        updateCampaign,
        saveActiveCampaign,
        deleteCampaign,
        createContentItem,
        updateContentItem,
        deleteContentItem,
        updateCreativeMemory,
        markNotificationAsRead,
        submitStudioRequest,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
