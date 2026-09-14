import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import {
  Workspace,
  Project,
  Asset,
  Release,
  ContentItem,
  ContentPillar,
  ContentGapRecommendation,
  ContentQualityIssue,
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
} from "../types";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

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

  // 3. Studio Production check
  const hasStudioProduction = Boolean(
    release.studioProduction && release.studioProduction.status === "submitted"
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
      actionTab: 'command-center',
      actionLabel: 'Design Cover Artwork',
      detail: hasArtwork ? 'Vault verified' : 'Missing 3000x3000px artwork',
    },
    {
      id: 'req_audio',
      label: 'Master Audio & LUFS Check',
      description: '24-bit 44.1kHz master WAV with streaming loudness verified',
      weight: 15,
      completed: hasAudio,
      category: 'audio',
      actionTab: 'studio',
      actionLabel: 'Request Audio Mastering',
      detail: hasAudio ? 'Master track attached' : 'Master audio unverified',
    },
    {
      id: 'req_asset_kit',
      label: 'Release Asset Kit & Motion Package',
      description: 'Master artwork, canvas, animated cover, and social distribution assets',
      weight: 15,
      completed: hasStudioProduction || hasArtwork,
      category: 'artwork',
      actionTab: 'command-center',
      actionLabel: 'Review Asset Kit',
      detail: hasArtwork ? 'Master artwork and kit linked' : 'Asset kit in preparation',
    },
    {
      id: 'req_presave',
      label: 'Smart Pre-Save Landing Page',
      description: 'Pre-save link configured with Spotify, Apple & Audiomack hooks',
      weight: 15,
      completed: hasPresave,
      category: 'presave',
      actionTab: 'command-center',
      actionLabel: 'Setup Pre-Save Campaign',
      detail: hasPresave ? `Linked to /${release.presaveSlug || 'presave'}` : 'Pre-save link not deployed',
    },
    {
      id: 'req_lyrics',
      label: 'Synced Lyrics & Sync LRC',
      description: 'Full lyrics sheet with synced timecode timestamps',
      weight: 10,
      completed: hasLyrics,
      category: 'lyrics',
      actionTab: 'studio',
      actionLabel: 'Request Lyrics Production',
      detail: hasLyrics ? 'Lyrics synced' : 'Lyrics unattached',
    },
    {
      id: 'req_splits',
      label: 'Split Sheet & Rights Agreement',
      description: 'Publishing and master percentages signed with collaborators',
      weight: 15,
      completed: hasSplits,
      category: 'splits',
      actionTab: 'command-center',
      actionLabel: 'Document Splits',
      detail: hasSplits ? 'Splits documented' : 'Split sheet unfinalized',
    },
    {
      id: 'req_content',
      label: '30-Day Promo Content Pipeline',
      description: 'Scheduled teaser clips, announcement carousels, and drop hooks',
      weight: 15,
      completed: hasContent,
      category: 'content',
      actionTab: 'command-center',
      actionLabel: 'Plan Content Pipeline',
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
  releaseReadiness: ReleaseReadinessSummary;
  
  // Brand & Business Master Objects
  brandCore: BrandCore | null;
  products: ProductService[];

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
  createAsset: (asset: Partial<Asset>) => Promise<Asset>;
  updateAsset: (assetId: string, updates: Partial<Asset>) => Promise<Asset>;
  deleteAsset: (assetId: string) => Promise<void>;
  
  // Releases (Artist OS Central Hub)
  createRelease: (release: Partial<Release>) => Promise<Release>;
  updateRelease: (releaseId: string, updates: Partial<Release>) => Promise<Release>;
  saveActiveRelease: (updates: Partial<Release>) => Promise<Release>;
  deleteRelease: (releaseId: string) => Promise<void>;
  
  // Artist DNA & Brand DNA (Core Context Layers)
  loadArtistDNA: () => Promise<any>;
  saveArtistDNA: (data: any) => Promise<any>;
  loadBrandDNA: () => Promise<any>;
  saveBrandDNA: (data: any) => Promise<any>;

  // Brand Core & Products (Brand/Business OS)
  updateBrandCore: (updates: Partial<BrandCore>) => Promise<BrandCore>;
  saveBrandCore: (updates: Partial<BrandCore>) => Promise<BrandCore>;
  createProduct: (product: Partial<ProductService> & { name: string }) => Promise<ProductService>;
  updateProduct: (productId: string, updates: Partial<ProductService>) => Promise<ProductService>;
  deleteProduct: (productId: string) => Promise<void>;

  // Business Documents (Brand/Business OS)
  businessDocuments: any[];
  createBusinessDocument: (document: any) => Promise<any>;
  updateBusinessDocument: (documentId: string, updates: any) => Promise<any>;
  deleteBusinessDocument: (documentId: string) => Promise<void>;

  // Content Items & Pillars (Phase 6 Content Operating System)
  contentPillars: ContentPillar[];
  contentGaps: ContentGapRecommendation[];
  qualityIssues: ContentQualityIssue[];
  createContentPillar: (pillar: Partial<ContentPillar> & { name: string }) => Promise<ContentPillar>;
  updateContentPillar: (pillarId: string, updates: Partial<ContentPillar>) => Promise<ContentPillar>;
  deleteContentPillar: (pillarId: string) => Promise<void>;
  createContentItem: (item: Partial<ContentItem>) => Promise<ContentItem>;
  createContentItemBatch: (items: Partial<ContentItem>[]) => Promise<ContentItem[]>;
  duplicateContentItem: (itemId: string) => Promise<ContentItem>;
  updateContentItem: (itemId: string, updates: Partial<ContentItem>) => Promise<ContentItem>;
  deleteContentItem: (itemId: string) => Promise<void>;
  fetchContentGaps: () => Promise<{ gaps: ContentGapRecommendation[]; qualityIssues: ContentQualityIssue[] }>;
  generateOpportunityBatch: (params: { stage?: string; releaseId?: string; productId?: string; platform?: string; count?: number; customGoal?: string }) => Promise<Partial<ContentItem>[]>;
  
  // Creative Memory
  updateCreativeMemory: (memory: Partial<CreativeMemory>) => Promise<CreativeMemory>;
  
  // Notifications
  markNotificationAsRead: (notifId: string) => Promise<void>;
  
  // Creative Studio Requests
  submitStudioRequest: (data: Partial<CreativeRequest>) => Promise<CreativeRequest>;

  // Data sync
  refreshWorkspace: () => Promise<void>;
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

  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [contentPillars, setContentPillars] = useState<ContentPillar[]>([]);
  const [contentGaps, setContentGaps] = useState<ContentGapRecommendation[]>([]);
  const [qualityIssues, setQualityIssues] = useState<ContentQualityIssue[]>([]);
  const [businessDocuments, setBusinessDocuments] = useState<any[]>([]);
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

  // Compute active release with auto-fallback to first release if none or invalid
  const activeRelease = useMemo(() => {
    if (!releases || releases.length === 0) return null;
    if (activeReleaseId) {
      const match = releases.find((r) => r.id === activeReleaseId);
      if (match) return match;
    }
    return releases[0] || null;
  }, [releases, activeReleaseId]);

  const calculateReleaseReadiness = useCallback((rel?: Release | null) => {
    const targetRelease = rel !== undefined ? rel : activeRelease;
    return computeReleaseReadiness(targetRelease, contentItems, assets, tasks);
  }, [activeRelease, contentItems, assets, tasks]);

  const releaseReadiness = useMemo(() => {
    return calculateReleaseReadiness(activeRelease);
  }, [calculateReleaseReadiness, activeRelease]);

  const fetchWorkspaceData = useCallback(async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    try {
      const [
        overviewRes,
        projectsRes,
        assetsRes,
        releasesRes,
        brandCoreRes,
        productsRes,
        contentRes,
        pillarsRes,
        gapsRes,
        foldersRes,
        milestonesRes,
        tasksRes,
        memoryRes,
        notifRes,
        activityRes,
        reqRes,
        docsRes
      ] = await Promise.all([
        api.workspaces.getOverview(activeWorkspace.id).catch(() => null),
        api.projects.list(activeWorkspace.id).catch(() => ({ projects: [] })),
        api.assets.list(activeWorkspace.id).catch(() => ({ assets: [] })),
        api.releases.list(activeWorkspace.id).catch(() => ({ releases: [] })),
        api.brandCore.get(activeWorkspace.id).catch(() => ({ brandCore: null })),
        api.products.list(activeWorkspace.id).catch(() => ({ products: [] })),
        api.contentItems.list(activeWorkspace.id).catch(() => ({ contentItems: [] })),
        api.contentPillars.list(activeWorkspace.id).catch(() => ({ contentPillars: [] })),
        api.contentItems.getGaps(activeWorkspace.id).catch(() => ({ gaps: [], qualityIssues: [] })),
        api.folders.list(activeWorkspace.id).catch(() => ({ folders: [] })),
        api.milestones.list(activeWorkspace.id).catch(() => ({ milestones: [] })),
        api.tasks.list(activeWorkspace.id).catch(() => ({ tasks: [] })),
        api.creativeMemory.get(activeWorkspace.id).catch(() => ({ creativeMemory: null })),
        api.notifications.list(activeWorkspace.id).catch(() => ({ notifications: [] })),
        api.activityLogs.list(activeWorkspace.id).catch(() => ({ activityLogs: [] })),
        api.creativeRequests.list(activeWorkspace.id).catch(() => ({ requests: [] })),
        api.businessDocuments.list(activeWorkspace.id).catch(() => ({ documents: [] })),
      ]);

      if (overviewRes) {
        setOverview(overviewRes);
        if (overviewRes.attentionItems) setAttentionItems(overviewRes.attentionItems);
        if (overviewRes.recommendations) setRecommendations(overviewRes.recommendations);
      }
      setProjects(projectsRes.projects || []);
      setAssets(assetsRes.assets || []);
      setReleases(releasesRes.releases || []);
      if (brandCoreRes.brandCore) setBrandCore(brandCoreRes.brandCore);
      setProducts(productsRes.products || []);
      setContentItems(contentRes.contentItems || []);
      setContentPillars(pillarsRes.contentPillars || []);
      setContentGaps(gapsRes.gaps || []);
      setQualityIssues(gapsRes.qualityIssues || []);
      setFolders(foldersRes.folders || []);
      setMilestones(milestonesRes.milestones || []);
      setTasks(tasksRes.tasks || []);
      setCreativeMemory(memoryRes.creativeMemory || null);
      setNotifications(notifRes.notifications || []);
      setActivityLogs(activityRes.activityLogs || []);
      setCreativeRequests(reqRes.requests || []);
      setBusinessDocuments(docsRes.documents || []);
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

  const createAsset = saveAsset;

  const updateAsset = async (assetId: string, updates: Partial<Asset>) => {
    setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a, ...updates } : a)));
    return { id: assetId, ...updates } as Asset;
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

  // Artist DNA & Brand DNA
  const loadArtistDNA = async () => {
    if (!activeWorkspace) return null;
    try {
      const res = await api.artistDNA.get(activeWorkspace.id);
      return res.artistDNA;
    } catch {
      return null;
    }
  };

  const saveArtistDNA = async (data: any) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.artistDNA.update(activeWorkspace.id, data);
    await fetchWorkspaceData();
    return res.artistDNA;
  };

  const loadBrandDNA = async () => {
    if (!activeWorkspace) return null;
    try {
      const res = await api.brandDNA.get(activeWorkspace.id);
      return res.brandDNA;
    } catch {
      return null;
    }
  };

  const saveBrandDNA = async (data: any) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.brandDNA.update(activeWorkspace.id, data);
    await fetchWorkspaceData();
    return res.brandDNA;
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

  // Business Documents
  const createBusinessDocument = async (document: any) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.businessDocuments.create(activeWorkspace.id, document);
    setBusinessDocuments((prev) => [res.document, ...prev]);
    await fetchWorkspaceData();
    return res.document;
  };

  const updateBusinessDocument = async (documentId: string, updates: any) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.businessDocuments.update(activeWorkspace.id, documentId, updates);
    setBusinessDocuments((prev) => prev.map((d) => (d.id === documentId ? res.document : d)));
    await fetchWorkspaceData();
    return res.document;
  };

  const deleteBusinessDocument = async (documentId: string) => {
    if (!activeWorkspace) return;
    await api.businessDocuments.delete(activeWorkspace.id, documentId);
    setBusinessDocuments((prev) => prev.filter((d) => d.id !== documentId));
    await fetchWorkspaceData();
  };

  // Content Pillars & Items
  const createContentPillar = async (pillar: Partial<ContentPillar> & { name: string }) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.contentPillars.create(activeWorkspace.id, pillar);
    setContentPillars((prev) => [...prev, res.contentPillar]);
    await fetchWorkspaceData();
    return res.contentPillar;
  };

  const updateContentPillar = async (pillarId: string, updates: Partial<ContentPillar>) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.contentPillars.update(activeWorkspace.id, pillarId, updates);
    setContentPillars((prev) => prev.map((p) => (p.id === pillarId ? res.contentPillar : p)));
    await fetchWorkspaceData();
    return res.contentPillar;
  };

  const deleteContentPillar = async (pillarId: string) => {
    if (!activeWorkspace) return;
    await api.contentPillars.delete(activeWorkspace.id, pillarId);
    setContentPillars((prev) => prev.filter((p) => p.id !== pillarId));
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

  const createContentItemBatch = async (items: Partial<ContentItem>[]) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.contentItems.createBatch(activeWorkspace.id, items);
    setContentItems((prev) => [...(res.contentItems || []), ...prev]);
    await fetchWorkspaceData();
    return res.contentItems || [];
  };

  const duplicateContentItem = async (itemId: string) => {
    if (!activeWorkspace) throw new Error("No active workspace");
    const res = await api.contentItems.duplicate(activeWorkspace.id, itemId);
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

  const fetchContentGaps = async () => {
    if (!activeWorkspace) return { gaps: [], qualityIssues: [] };
    const res = await api.contentItems.getGaps(activeWorkspace.id);
    setContentGaps(res.gaps || []);
    setQualityIssues(res.qualityIssues || []);
    return { gaps: res.gaps || [], qualityIssues: res.qualityIssues || [] };
  };

  const generateOpportunityBatch = async (params: {
    stage?: string;
    releaseId?: string;
    campaignId?: string;
    productId?: string;
    platform?: string;
    count?: number;
    customGoal?: string;
  }) => {
    if (!activeWorkspace) return [];
    const res = await api.contentItems.generateOpportunityBatch(activeWorkspace.id, params);
    return res.suggestions || [];
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
        releaseReadiness,
        brandCore,
        products,
        contentItems,
        contentPillars,
        contentGaps,
        qualityIssues,
        createContentPillar,
        updateContentPillar,
        deleteContentPillar,
        createContentItemBatch,
        duplicateContentItem,
        fetchContentGaps,
        generateOpportunityBatch,
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
        createAsset,
        updateAsset,
        deleteAsset,
        createRelease,
        updateRelease,
        saveActiveRelease,
        deleteRelease,
        loadArtistDNA,
        saveArtistDNA,
        loadBrandDNA,
        saveBrandDNA,
        updateBrandCore,
        saveBrandCore: updateBrandCore,
        createProduct,
        updateProduct,
        deleteProduct,
        businessDocuments,
        createBusinessDocument,
        updateBusinessDocument,
        deleteBusinessDocument,
        createContentItem,
        updateContentItem,
        deleteContentItem,
        updateCreativeMemory,
        markNotificationAsRead,
        submitStudioRequest,
        refreshWorkspace: fetchWorkspaceData,
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
