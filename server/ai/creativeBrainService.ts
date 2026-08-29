import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { db, IdentityType, ProjectRecord, ReleaseRecord, CampaignRecord, ProductServiceRecord, TaskItem, CreativeMemoryRecord, CreativeMemoryItemRecord, AssetRecord, ContentItemRecord } from "../db.js";
import { MemoryRetrievalService, MemoryRetrievalResponse } from "./memoryRetrievalService.js";

// --- Readiness Calculators (Server-Side Source of Truth) ---

export interface ReleaseReadinessScore {
  score: number;
  stage: 'Planning' | 'Preparing' | 'Ready' | 'Launching' | 'Released' | 'Post-Release';
  requirements: {
    id: string;
    label: string;
    description: string;
    weight: number;
    completed: boolean;
    category: string;
    actionTab: string;
    actionLabel: string;
  }[];
  missingItems: {
    id: string;
    label: string;
    reason: string;
    actionTab: string;
    actionLabel: string;
    priority: 'critical' | 'high' | 'medium';
  }[];
  daysUntilRelease: number | null;
  formattedDays: string;
}

export function calculateReleaseReadiness(
  release: ReleaseRecord | null | undefined,
  contentItems: ContentItemRecord[] = [],
  assets: AssetRecord[] = []
): ReleaseReadinessScore {
  if (!release) {
    return {
      score: 0,
      stage: 'Planning',
      requirements: [],
      missingItems: [],
      daysUntilRelease: null,
      formattedDays: 'No active release',
    };
  }

  const hasArtwork = Boolean(
    release.coverUrl ||
    release.coverAssetId ||
    assets.some((a) => a.releaseId === release.id && a.category === 'cover') ||
    assets.some((a) => a.category === 'cover')
  );

  const hasAudio = Boolean(
    release.audioUrl ||
    release.audioAssetId ||
    (release.masterAudioDetails && release.masterAudioDetails.isWav) ||
    assets.some((a) => a.releaseId === release.id && a.category === 'audio')
  );

  const hasDspPitch = Boolean(
    release.dspPitch &&
    release.dspPitch.editorialNote &&
    release.dspPitch.editorialNote.length > 20
  );

  const hasPresave = Boolean(
    release.presaveSlug ||
    (release.presaveData && release.presaveData.targetPlatforms?.length > 0)
  );

  const hasLyrics = Boolean(
    release.lyrics &&
    (release.lyrics.plainText?.length > 20 || (release.lyrics.lines && release.lyrics.lines.length > 0))
  );

  const hasSplits = Boolean(
    release.splits &&
    release.splits.contributors &&
    release.splits.contributors.length > 0 &&
    release.splits.isLocked
  );

  const linkedContent = contentItems.filter((c) => c.releaseId === release.id || c.workspaceId === release.workspaceId);
  const hasPromo = linkedContent.length >= 2 || (release.phases && release.phases.length > 0);

  const requirements = [
    {
      id: 'req_artwork',
      label: '3000x3000px Master Cover Artwork',
      description: 'Hi-res 300DPI square artwork compliant with Apple Music & Spotify standards',
      weight: 15,
      completed: hasArtwork,
      category: 'artwork',
      actionTab: 'cover-studio',
      actionLabel: 'Open Cover Studio',
    },
    {
      id: 'req_audio',
      label: '24-bit 44.1kHz Master Audio WAV',
      description: 'Lossless stereo master audio file with validated LUFS integrated loudness',
      weight: 20,
      completed: hasAudio,
      category: 'audio',
      actionTab: 'mastering-suite',
      actionLabel: 'Open Mastering Suite',
    },
    {
      id: 'req_dsp_pitch',
      label: 'Spotify & Apple Music Editorial Pitch',
      description: 'Strategic genre/mood metadata and editor pitch note submitted >=7 days before drop',
      weight: 15,
      completed: hasDspPitch,
      category: 'dsp-pitch',
      actionTab: 'dsp-pitcher',
      actionLabel: 'Craft DSP Pitch',
    },
    {
      id: 'req_presave',
      label: 'Smart Pre-Save Link & Landing Page',
      description: 'Activated smart link capturing pre-saves on Spotify, Apple Music & Deezer',
      weight: 15,
      completed: hasPresave,
      category: 'presave-hub',
      actionTab: 'presave-hub',
      actionLabel: 'Setup Pre-Save',
    },
    {
      id: 'req_lyrics',
      label: 'Synchronized & Formatted Lyrics',
      description: 'LRC/Musixmatch synced lyrics ready for Instagram Stories and Apple Music',
      weight: 10,
      completed: hasLyrics,
      category: 'lyrics-studio',
      actionTab: 'lyrics-studio',
      actionLabel: 'Format Lyrics',
    },
    {
      id: 'req_splits',
      label: 'Producer & Songwriter Split Sheet',
      description: '100% publishing & master royalty splits signed by all collaborators',
      weight: 15,
      completed: hasSplits,
      category: 'splits-calculator',
      actionTab: 'splits-calculator',
      actionLabel: 'Lock Split Sheet',
    },
    {
      id: 'req_promo',
      label: 'Pre-Drop Promo & Social Content Wave',
      description: 'At least 2 scheduled teaser clips or sound memo snippets in Content Pipeline',
      weight: 10,
      completed: hasPromo,
      category: 'artist-brain',
      actionTab: 'artist-brain',
      actionLabel: 'Plan Content Wave',
    },
  ];

  const totalScore = requirements.reduce((sum, req) => sum + (req.completed ? req.weight : 0), 0);

  let daysUntilRelease: number | null = null;
  let formattedDays = 'Date unset';
  if (release.releaseDate) {
    const target = new Date(release.releaseDate).getTime();
    const now = Date.now();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    daysUntilRelease = diff;
    if (diff > 0) {
      formattedDays = `T-${diff} Days to Drop`;
    } else if (diff === 0) {
      formattedDays = 'Drop Day (T-0)';
    } else {
      formattedDays = `Released (T+${Math.abs(diff)} Days ago)`;
    }
  }

  let stage: 'Planning' | 'Preparing' | 'Ready' | 'Launching' | 'Released' | 'Post-Release' = 'Planning';
  if (release.status === 'released' || (daysUntilRelease !== null && daysUntilRelease <= 0)) {
    stage = 'Released';
  } else if (totalScore >= 90 && (daysUntilRelease !== null && daysUntilRelease <= 7)) {
    stage = 'Launching';
  } else if (totalScore >= 85) {
    stage = 'Ready';
  } else if (totalScore >= 45) {
    stage = 'Preparing';
  } else {
    stage = 'Planning';
  }

  const missingItems = requirements
    .filter((r) => !r.completed)
    .map((r) => ({
      id: r.id,
      label: r.label,
      reason: r.description,
      actionTab: r.actionTab,
      actionLabel: r.actionLabel,
      priority: (r.weight >= 15 ? 'critical' : 'high') as 'critical' | 'high',
    }));

  return {
    score: totalScore,
    stage,
    requirements,
    missingItems,
    daysUntilRelease,
    formattedDays,
  };
}

export interface CampaignReadinessScore {
  score: number;
  stage: 'Planning' | 'Preparing' | 'Ready' | 'Launching' | 'Active' | 'Completed';
  requirements: {
    id: string;
    label: string;
    description: string;
    weight: number;
    completed: boolean;
    category: string;
    actionTab: string;
    actionLabel: string;
  }[];
  missingItems: {
    id: string;
    label: string;
    reason: string;
    actionTab: string;
    actionLabel: string;
    priority: 'critical' | 'high' | 'medium';
  }[];
  daysUntilLaunch: number | null;
  formattedDays: string;
}

export function calculateCampaignReadiness(
  campaign: CampaignRecord | null | undefined,
  productsList: ProductServiceRecord[] = [],
  contentList: ContentItemRecord[] = [],
  assetList: AssetRecord[] = []
): CampaignReadinessScore {
  if (!campaign) {
    return {
      score: 0,
      stage: 'Planning',
      requirements: [],
      missingItems: [],
      daysUntilLaunch: null,
      formattedDays: 'No active campaign',
    };
  }

  const hasObjective = Boolean(
    (campaign.objective && campaign.objective.length > 5) ||
    (campaign.goal && campaign.goal.length > 8) ||
    (campaign.goals && (campaign.goals.targetImpressions || 0) > 0)
  );

  const linkedProduct = productsList.find((p) => p.id === campaign.productId);
  const hasProduct = Boolean(campaign.productId || linkedProduct || productsList.length > 0);

  const hasCreativeDirection = Boolean(
    campaign.creativeDirection &&
    (campaign.creativeDirection.themeName || campaign.creativeDirection.coreMessage)
  );

  const hasHeroAsset = Boolean(
    campaign.heroAssetUrl ||
    campaign.heroAssetId ||
    assetList.some((a) => a.campaignId === campaign.id || a.category === 'brand' || a.category === 'cover' || a.category === 'image') ||
    linkedProduct?.heroImageUrl
  );

  const linkedContent = contentList.filter((c) => c.campaignId === campaign.id);
  const hasContentPipeline = linkedContent.length >= 2 || (campaign.sprintDays && campaign.sprintDays.length >= 2);

  const hasMilestones = Boolean(
    (campaign.milestones && campaign.milestones.length >= 2) ||
    (campaign.sprintDays && campaign.sprintDays.length >= 2)
  );

  const approvals = campaign.approvals || { creativeApproved: false, budgetApproved: false, launchApproved: false };
  const hasApprovals = Boolean(approvals.creativeApproved && (approvals.budgetApproved || (campaign.budget || 0) <= 0));

  const requirements = [
    {
      id: 'req_objective',
      label: 'Campaign Objective & Measurable KPI Targets',
      description: 'Clear primary goal, target metrics, and measurable KPIs defined',
      weight: 15,
      completed: hasObjective,
      category: 'objective',
      actionTab: 'brand-os',
      actionLabel: 'Define in Campaign Hub',
    },
    {
      id: 'req_product',
      label: 'Product / Service Linked & Positioned',
      description: 'Flagship product or service attached with active pricing',
      weight: 15,
      completed: hasProduct,
      category: 'product',
      actionTab: 'brand-os',
      actionLabel: 'Link in Product Catalog',
    },
    {
      id: 'req_creative_dir',
      label: 'Creative Direction & Visual Theme',
      description: 'Core aesthetic theme, visual hook, and campaign narrative codified',
      weight: 15,
      completed: hasCreativeDirection,
      category: 'creative-direction',
      actionTab: 'brand-os',
      actionLabel: 'Set Creative Direction',
    },
    {
      id: 'req_hero_assets',
      label: 'Hero Visual Assets & Mockups',
      description: 'High-resolution campaign banner, 3D render, or visual hero in Vault',
      weight: 15,
      completed: hasHeroAsset,
      category: 'hero-asset',
      actionTab: 'resource-vault',
      actionLabel: 'Select Vault Assets',
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
    },
    {
      id: 'req_sprint_timeline',
      label: 'Sprint Milestones & Timeline',
      description: 'Calibrated sprint phases, deliverables, and deadline schedule',
      weight: 10,
      completed: hasMilestones,
      category: 'sprint-tasks',
      actionTab: 'brand-os',
      actionLabel: 'Schedule Sprints',
    },
    {
      id: 'req_approvals',
      label: 'Operational & Budget Approvals',
      description: 'Creative and budget approvals verified by workspace operator',
      weight: 15,
      completed: hasApprovals,
      category: 'approvals',
      actionTab: 'brand-os',
      actionLabel: 'Review Approvals',
    },
  ];

  const totalScore = requirements.reduce((sum, req) => sum + (req.completed ? req.weight : 0), 0);

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
      formattedDays = `Active (T+${Math.abs(diff)} Days)`;
    }
  }

  let stage: 'Planning' | 'Preparing' | 'Ready' | 'Launching' | 'Active' | 'Completed' = 'Planning';
  if (campaign.status === 'completed') {
    stage = 'Completed';
  } else if (campaign.status === 'active' || (daysUntilLaunch !== null && daysUntilLaunch <= 0)) {
    stage = 'Active';
  } else if (totalScore >= 85 && (daysUntilLaunch !== null && daysUntilLaunch <= 7)) {
    stage = 'Launching';
  } else if (totalScore >= 85) {
    stage = 'Ready';
  } else if (totalScore >= 40) {
    stage = 'Preparing';
  } else {
    stage = 'Planning';
  }

  const missingItems = requirements
    .filter((r) => !r.completed)
    .map((r) => ({
      id: r.id,
      label: r.label,
      reason: r.description,
      actionTab: r.actionTab,
      actionLabel: r.actionLabel,
      priority: (r.weight >= 15 ? 'critical' : 'high') as 'critical' | 'high',
    }));

  return {
    score: totalScore,
    stage,
    requirements,
    missingItems,
    daysUntilLaunch,
    formattedDays,
  };
}

// --- Action Execution Receipt Interface ---

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

// --- Workspace Context Compiler ---

export interface CompiledWorkspaceContext {
  workspace: {
    id: string;
    name: string;
    identityType: IdentityType;
    bio?: string;
    genreOrNiche?: string;
    website?: string;
  };
  brandCore?: {
    brandName: string;
    tagline: string;
    industry: string;
    archetype: string;
    voiceTraits: string[];
    doSay: string[];
    dontSay: string[];
    aestheticKeywords: string[];
    primaryICP: string;
    valueProposition: string;
  };
  releases: {
    id: string;
    title: string;
    artistName: string;
    genre: string;
    releaseDate: string;
    status: string;
    readiness: ReleaseReadinessScore;
  }[];
  campaigns: {
    id: string;
    title: string;
    goal: string;
    objective?: string;
    startDate: string;
    endDate: string;
    budget: number;
    currency: string;
    status: string;
    readiness: CampaignReadinessScore;
  }[];
  products: {
    id: string;
    name: string;
    type: string;
    tagline: string;
    pricing: any;
    targetAudience: string;
    keyFeatures: string[];
  }[];
  projects: {
    id: string;
    title: string;
    category: string;
    status: string;
    priority: string;
    deadline: string;
    budget: number;
    tasksCount: number;
    pendingTasks: { id: string; text: string; completed: boolean; priority?: string; deadline?: string }[];
  }[];
  urgentTasks: TaskItem[];
  assetsSummary: {
    totalCount: number;
    categories: Record<string, number>;
  };
  contentSummary: {
    totalCount: number;
    scheduledCount: number;
    platforms: Record<string, number>;
  };
  creativeMemory?: CreativeMemoryRecord;
  retrievedMemories?: MemoryRetrievalResponse;
  pinnedContext?: {
    type: 'release' | 'campaign' | 'project' | 'brand_core' | 'general';
    id?: string;
    title?: string;
    details?: any;
  };
}

export function compileWorkspaceContext(
  workspaceId: string,
  pinnedContext?: { type: 'release' | 'campaign' | 'project' | 'brand_core' | 'general'; id?: string },
  queryPrompt?: string
): CompiledWorkspaceContext | null {
  const ws = db.getWorkspaceById(workspaceId);
  if (!ws) return null;

  const brandCore = db.getBrandCore(workspaceId);
  const rawReleases = db.getReleases(workspaceId);
  const rawCampaigns = db.getCampaigns(workspaceId);
  const rawProducts = db.getProducts(workspaceId);
  const rawProjects = db.getProjects(workspaceId);
  const rawAssets = db.getAssets(workspaceId);
  const rawContent = db.getContentItems(workspaceId);
  const memory = db.getCreativeMemory(workspaceId);

  // Retrieve structured, relevance-ranked memories
  const retrievedMemories = MemoryRetrievalService.retrieve(workspaceId, {
    query: queryPrompt,
    entityType: pinnedContext?.type === 'release' ? 'release' : pinnedContext?.type === 'campaign' ? 'campaign' : pinnedContext?.type === 'project' ? 'project' : undefined,
    entityId: pinnedContext?.id,
    limit: 8,
  });

  // Calculate readiness for all releases
  const releases = rawReleases.map((rel) => ({
    id: rel.id,
    title: rel.title,
    artistName: rel.artistName,
    genre: rel.genre,
    releaseDate: rel.releaseDate,
    status: rel.status,
    readiness: calculateReleaseReadiness(rel, rawContent, rawAssets),
  }));

  // Calculate readiness for all campaigns
  const campaigns = rawCampaigns.map((cmp) => ({
    id: cmp.id,
    title: cmp.title,
    goal: cmp.goal,
    objective: cmp.objective,
    startDate: cmp.startDate,
    endDate: cmp.endDate,
    budget: cmp.budget,
    currency: cmp.currency,
    status: cmp.status,
    readiness: calculateCampaignReadiness(cmp, rawProducts, rawContent, rawAssets),
  }));

  // Extract urgent / pending tasks across projects
  const urgentTasks: TaskItem[] = [];
  rawProjects.forEach((proj) => {
    (proj.tasks || []).forEach((t) => {
      if (!t.completed && (t.priority === 'urgent' || t.priority === 'high')) {
        urgentTasks.push({
          ...t,
          projectId: proj.id,
          projectTitle: proj.title,
        });
      }
    });
  });

  // Assets summary
  const assetCategories: Record<string, number> = {};
  rawAssets.forEach((a) => {
    assetCategories[a.category] = (assetCategories[a.category] || 0) + 1;
  });

  // Content summary
  const platforms: Record<string, number> = {};
  let scheduledCount = 0;
  rawContent.forEach((c) => {
    platforms[c.platform] = (platforms[c.platform] || 0) + 1;
    if (c.scheduledDate) scheduledCount++;
  });

  // Pinned context resolution
  let resolvedPinned: CompiledWorkspaceContext['pinnedContext'] = undefined;
  if (pinnedContext && pinnedContext.type !== 'general') {
    if (pinnedContext.type === 'release') {
      const rel = releases.find((r) => r.id === pinnedContext.id) || releases[0];
      if (rel) {
        resolvedPinned = {
          type: 'release',
          id: rel.id,
          title: rel.title,
          details: rel,
        };
      }
    } else if (pinnedContext.type === 'campaign') {
      const cmp = campaigns.find((c) => c.id === pinnedContext.id) || campaigns[0];
      if (cmp) {
        resolvedPinned = {
          type: 'campaign',
          id: cmp.id,
          title: cmp.title,
          details: cmp,
        };
      }
    } else if (pinnedContext.type === 'project') {
      const prj = rawProjects.find((p) => p.id === pinnedContext.id);
      if (prj) {
        resolvedPinned = {
          type: 'project',
          id: prj.id,
          title: prj.title,
          details: {
            category: prj.category,
            status: prj.status,
            priority: prj.priority,
            deadline: prj.deadline,
            tasks: prj.tasks,
          },
        };
      }
    } else if (pinnedContext.type === 'brand_core') {
      resolvedPinned = {
        type: 'brand_core',
        title: brandCore?.brandName || ws.name,
        details: brandCore,
      };
    }
  }

  return {
    workspace: {
      id: ws.id,
      name: ws.name,
      identityType: ws.identityType,
      bio: ws.bio,
      genreOrNiche: ws.genreOrNiche,
      website: ws.website,
    },
    brandCore: brandCore ? {
      brandName: brandCore.brandName,
      tagline: brandCore.tagline,
      industry: brandCore.industry,
      archetype: brandCore.archetype,
      voiceTraits: brandCore.voiceAndTone?.traits || [],
      doSay: brandCore.voiceAndTone?.doSay || [],
      dontSay: brandCore.voiceAndTone?.dontSay || [],
      aestheticKeywords: brandCore.visualDirection?.aestheticKeywords || [],
      primaryICP: brandCore.audience?.primaryICP || '',
      valueProposition: brandCore.positioning?.valueProposition || '',
    } : undefined,
    releases,
    campaigns,
    products: rawProducts.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      tagline: p.tagline,
      pricing: p.pricing,
      targetAudience: p.targetAudience,
      keyFeatures: p.keyFeatures || [],
    })),
    projects: rawProjects.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      status: p.status,
      priority: p.priority,
      deadline: p.deadline,
      budget: p.budget,
      tasksCount: (p.tasks || []).length,
      pendingTasks: (p.tasks || []).filter((t) => !t.completed).map((t) => ({
        id: t.id,
        text: t.text,
        completed: t.completed,
        priority: t.priority,
        deadline: t.deadline,
      })),
    })),
    urgentTasks: urgentTasks.slice(0, 10),
    assetsSummary: {
      totalCount: rawAssets.length,
      categories: assetCategories,
    },
    contentSummary: {
      totalCount: rawContent.length,
      scheduledCount,
      platforms,
    },
    creativeMemory: memory,
    retrievedMemories,
    pinnedContext: resolvedPinned,
  };
}

// --- Action Execution Engine (Server-Side Tools) ---

export interface ExecuteToolParams {
  workspaceId: string;
  userId: string;
  userEmail: string;
  toolName: string;
  args: Record<string, any>;
}

export function executeBrainTool(params: ExecuteToolParams): BrainActionReceipt {
  const { workspaceId, userId, userEmail, toolName, args } = params;

  try {
    switch (toolName) {
      case 'create_task': {
        const text = args.text || args.taskText || 'New Workspace Task';
        const priority = args.priority || 'high';
        const deadline = args.deadline || undefined;
        const category = args.category || 'Creative Brain';
        const projectId = args.projectId || undefined;

        // If a specific project was indicated or if projects exist
        let targetProjectId = projectId;
        if (!targetProjectId) {
          const projects = db.getProjects(workspaceId);
          if (projects.length > 0) {
            targetProjectId = projects[0].id;
          } else {
            // Create default project first if none exists
            const newProj = db.createProject(workspaceId, {
              title: "Creative Brain Operations",
              description: "AI-generated action tasks and operational sprints",
              category: "General",
              status: "in-progress",
              priority: "high",
              budget: 0,
              currency: "USD",
              deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
              tags: ["AI", "CreativeBrain"],
              tasks: [],
            });
            targetProjectId = newProj.id;
          }
        }

        const task = db.addTask(workspaceId, targetProjectId, {
          text,
          priority,
          category,
          deadline,
        });

        db.logActivity(
          workspaceId,
          userId,
          userEmail,
          'CREATE_TASK',
          'task',
          task.id,
          `Creative Brain created task: "${text}" (${priority.toUpperCase()})`
        );

        db.addNotification(
          workspaceId,
          'Creative Brain Task Created',
          `New task created: "${text}"`,
          'success',
          '/project-console',
          userId
        );

        return {
          id: "act_" + Math.random().toString(36).substring(2, 9),
          toolName: 'create_task',
          actionSummary: `Created task: "${text}" (Priority: ${priority.toUpperCase()})`,
          entityType: 'task',
          entityId: task.id,
          actionTab: 'project-console',
          actionLabel: 'View in Project Console',
          payload: task,
          status: 'executed',
          timestamp: new Date().toISOString(),
        };
      }

      case 'create_project': {
        const title = args.title || 'New Creative Project';
        const description = args.description || 'Project initiated via Keedohub Creative Brain';
        const category = args.category || 'Production';
        const priority = args.priority || 'high';
        const budget = Number(args.budget) || 0;
        const deadline = args.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

        const project = db.createProject(workspaceId, {
          title,
          description,
          category,
          status: 'planning',
          priority: priority as any,
          budget,
          currency: 'USD',
          deadline,
          tags: args.tags || ['CreativeBrain'],
          tasks: (args.initialTasks || []).map((t: string, idx: number) => ({
            id: `tsk_${Math.random().toString(36).substring(2, 7)}`,
            text: t,
            completed: false,
            priority: idx === 0 ? 'high' : 'medium',
          })),
        });

        db.logActivity(
          workspaceId,
          userId,
          userEmail,
          'CREATE_PROJECT',
          'project',
          project.id,
          `Creative Brain launched project: "${title}"`
        );

        db.addNotification(
          workspaceId,
          'Project Created',
          `Creative Brain initialized project "${title}"`,
          'success',
          '/project-console',
          userId
        );

        return {
          id: "act_" + Math.random().toString(36).substring(2, 9),
          toolName: 'create_project',
          actionSummary: `Initialized project: "${title}" ($${budget} budget, due ${deadline})`,
          entityType: 'project',
          entityId: project.id,
          actionTab: 'project-console',
          actionLabel: 'Open Project Console',
          payload: project,
          status: 'executed',
          timestamp: new Date().toISOString(),
        };
      }

      case 'create_release': {
        const title = args.title || 'Untitled Master Single';
        const artistName = args.artistName || 'Workspace Artist';
        const genre = args.genre || 'Afro-Fusion / Global';
        const releaseType = args.releaseType || 'Single';
        const releaseDate = args.releaseDate || new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0];
        const narrative = args.narrative || 'Release scheduled via Creative Brain intelligence.';

        const release = db.createRelease(workspaceId, {
          title,
          artistName,
          genre,
          releaseType,
          releaseDate,
          status: 'planning',
          narrative,
          phases: [
            {
              phaseName: "Phase 1: Pre-Release Blueprint",
              focus: "Teaser sound hooks, pre-saves, and visual rollout",
              timeframe: "T-14 to T-1 Days",
              actions: [
                { day: "Day -14", platform: "TikTok & Reels", contentType: "Sound Hook Snippet", concept: "Studio vocal memo snippet", captionHook: "The moment this came together...", priority: "CRITICAL" },
                { day: "Day -7", platform: "Spotify Pre-Save", contentType: "3D Artwork Reveal", concept: "Official cover reveal", captionHook: "Pre-save now locked in bio.", priority: "HIGH" },
              ]
            }
          ],
          checklist: [
            { id: "chk_wav", task: "Master Audio 24-bit 44.1kHz WAV uploaded", category: "METADATA", deadline: "T-21", completed: false },
            { id: "chk_cov", task: "3000x3000px Cover Artwork rendered", category: "CREATIVE", deadline: "T-14", completed: false },
            { id: "chk_dsp", task: "Spotify for Artists editorial pitch submitted", category: "EDITORIAL", deadline: "T-7", completed: false },
            { id: "chk_spl", task: "Royalty split sheet verified & signed", category: "EDITORIAL", deadline: "T-7", completed: false },
          ]
        });

        db.logActivity(
          workspaceId,
          userId,
          userEmail,
          'CREATE_RELEASE',
          'release',
          release.id,
          `Creative Brain created release: "${title}"`
        );

        db.addNotification(
          workspaceId,
          'Release Scheduled',
          `New release blueprint "${title}" created for ${releaseDate}`,
          'success',
          '/artist-os',
          userId
        );

        return {
          id: "act_" + Math.random().toString(36).substring(2, 9),
          toolName: 'create_release',
          actionSummary: `Created release: "${title}" (${genre}, dropping ${releaseDate})`,
          entityType: 'release',
          entityId: release.id,
          actionTab: 'artist-os',
          actionLabel: 'Open Artist Release Core',
          payload: release,
          status: 'executed',
          timestamp: new Date().toISOString(),
        };
      }

      case 'create_campaign': {
        const title = args.title || 'New Growth Campaign';
        const goal = args.goal || 'Drive market awareness and acquisition';
        const objective = args.objective || 'product_launch';
        const startDate = args.startDate || new Date().toISOString().split('T')[0];
        const endDate = args.endDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
        const budget = Number(args.budget) || 1500;
        const productId = args.productId || undefined;

        const campaign = db.createCampaign(workspaceId, {
          title,
          goal,
          objective: objective as any,
          startDate,
          endDate,
          budget,
          currency: 'USD',
          status: 'planning',
          productId,
          platforms: args.platforms || ['Instagram', 'TikTok', 'LinkedIn'],
          creativeDirection: {
            themeName: args.themeName || 'High-Impact Velocity',
            visualStyle: args.visualStyle || 'Modern High-Contrast',
            coreMessage: args.coreMessage || goal,
            heroHeadline: args.heroHeadline || title,
            subHeadline: args.subHeadline || 'Next-generation creative experience',
            keyHashtags: args.hashtags || ['#Keedohub', '#GrowthSprint'],
          },
          sprintDays: [
            { day: 'Day 1 - 5', task: 'Codify creative direction and draft hero visual mockups', completed: false },
            { day: 'Day 6 - 12', task: 'Publish multi-channel teaser posts and lead capture page', completed: false },
            { day: 'Day 13 - 20', task: 'Activate paid growth sprint and partnership PR announcements', completed: false },
          ],
        });

        db.logActivity(
          workspaceId,
          userId,
          userEmail,
          'CREATE_CAMPAIGN',
          'campaign',
          campaign.id,
          `Creative Brain planned campaign: "${title}"`
        );

        db.addNotification(
          workspaceId,
          'Campaign Created',
          `Creative Brain created master campaign "${title}"`,
          'success',
          '/brand-os',
          userId
        );

        return {
          id: "act_" + Math.random().toString(36).substring(2, 9),
          toolName: 'create_campaign',
          actionSummary: `Created campaign: "${title}" (Objective: ${objective}, $${budget} budget)`,
          entityType: 'campaign',
          entityId: campaign.id,
          actionTab: 'brand-os',
          actionLabel: 'Open Campaign Hub',
          payload: campaign,
          status: 'executed',
          timestamp: new Date().toISOString(),
        };
      }

      case 'create_content_item': {
        const title = args.title || 'Social Content Piece';
        const platform = args.platform || 'instagram';
        const contentType = args.contentType || 'Reel / Short Video';
        const concept = args.concept || 'High-engagement viral hook concept';
        const captionHook = args.captionHook || 'Stop scrolling: Here is how we engineered this...';
        const scheduledDate = args.scheduledDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
        const campaignId = args.campaignId || undefined;
        const releaseId = args.releaseId || undefined;

        const contentItem = db.createContentItem(workspaceId, {
          title,
          platform: platform as any,
          contentType,
          concept,
          captionHook,
          scheduledDate,
          status: 'ready',
          priority: args.priority || 'HIGH',
          campaignId,
          releaseId,
        });

        db.logActivity(
          workspaceId,
          userId,
          userEmail,
          'CREATE_CONTENT',
          'content_item',
          contentItem.id,
          `Creative Brain scheduled content: "${title}" for ${platform}`
        );

        return {
          id: "act_" + Math.random().toString(36).substring(2, 9),
          toolName: 'create_content_item',
          actionSummary: `Scheduled ${platform.toUpperCase()} post: "${title}" for ${scheduledDate}`,
          entityType: 'content_item',
          entityId: contentItem.id,
          actionTab: 'artist-brain',
          actionLabel: 'Open Content Engine',
          payload: contentItem,
          status: 'executed',
          timestamp: new Date().toISOString(),
        };
      }

      case 'save_creative_memory': {
        const type = args.type || args.category || 'preference';
        const title = args.title || `Memory: ${type}`;
        const content = args.content || args.text;
        if (!content) throw new Error('Memory content is required');

        // 1. Create structured CreativeMemoryItemRecord
        let category: any = 'preference';
        if (type === 'tone' || type === 'voice' || type === 'visual' || type === 'preference') category = 'preference';
        else if (type === 'narrative' || type === 'identity') category = 'identity';
        else if (type === 'strategy' || type === 'goal' || type === 'learning') category = 'strategy';
        else if (type === 'rule' || type === 'guardrail') category = 'rule';
        else if (type === 'project' || type === 'decision') category = 'project';

        const memoryItem = db.createCreativeMemoryItem(workspaceId, {
          userId,
          title: args.title || `${category.toUpperCase()}: ${content.substring(0, 45)}...`,
          content,
          category,
          scope: args.scope || 'workspace',
          entityType: args.entityType,
          entityId: args.entityId,
          entityName: args.entityName,
          tags: args.tags || ['creative-brain', category],
          source: 'user_explicit',
          confidence: args.confidence !== undefined ? args.confidence : 95,
          status: 'active',
          isPinned: args.isPinned !== undefined ? args.isPinned : false,
        });

        // 2. Also keep legacy memory record in sync
        const legacyMemory = db.getCreativeMemory(workspaceId);
        const updates: Partial<CreativeMemoryRecord> = {};

        if (type === 'tone' || type === 'voice') {
          const currentTraits = legacyMemory?.toneTraits || [];
          if (!currentTraits.includes(content)) {
            updates.toneTraits = [...currentTraits, content];
          }
        } else if (type === 'decision') {
          const decisions = (legacyMemory as any)?.keyDecisions || [];
          updates.keyDecisions = [
            ...decisions,
            {
              id: "dec_" + Math.random().toString(36).substring(2, 7),
              decision: content,
              category: args.category || 'Strategic Decision',
              timestamp: new Date().toISOString(),
            }
          ];
        } else if (type === 'narrative') {
          updates.coreNarrative = content;
        } else if (type === 'learning') {
          const learnings = legacyMemory?.recentLearnings || [];
          updates.recentLearnings = [...learnings, content];
        } else if (type === 'goal') {
          const goals = (legacyMemory as any)?.recurringGoals || [];
          updates.recurringGoals = [...goals, content];
        } else if (type === 'visual') {
          const visual = legacyMemory?.visualRules || [];
          updates.visualRules = [...visual, content];
        }

        db.updateCreativeMemory(workspaceId, updates);

        db.logActivity(
          workspaceId,
          userId,
          userEmail,
          'UPDATE_MEMORY',
          'creative_memory',
          memoryItem.id,
          `Creative Brain saved structured memory (${category}): "${content.substring(0, 40)}..."`
        );

        return {
          id: "act_" + Math.random().toString(36).substring(2, 9),
          toolName: 'save_creative_memory',
          actionSummary: `Saved creative memory (${category}): "${content}"`,
          entityType: 'creative_memory',
          entityId: memoryItem.id,
          actionTab: 'creative-memory',
          actionLabel: 'View Creative Memory Hub',
          payload: memoryItem,
          status: 'executed',
          timestamp: new Date().toISOString(),
        };
      }

      case 'update_project': {
        const projectId = args.projectId;
        if (!projectId) throw new Error('projectId is required');
        const updates: any = {};
        if (args.status) updates.status = args.status;
        if (args.priority) updates.priority = args.priority;
        if (args.deadline) updates.deadline = args.deadline;
        if (args.description) updates.description = args.description;

        const updated = db.updateProject(projectId, workspaceId, updates);

        db.logActivity(
          workspaceId,
          userId,
          userEmail,
          'UPDATE_PROJECT',
          'project',
          projectId,
          `Creative Brain updated project "${updated.title}"`
        );

        return {
          id: "act_" + Math.random().toString(36).substring(2, 9),
          toolName: 'update_project',
          actionSummary: `Updated project "${updated.title}" (Status: ${updated.status})`,
          entityType: 'project',
          entityId: projectId,
          actionTab: 'project-console',
          actionLabel: 'View in Project Console',
          payload: updated,
          status: 'executed',
          timestamp: new Date().toISOString(),
        };
      }

      case 'request_studio': {
        const serviceName = args.serviceName || 'Custom Creative Studio Brief';
        const budget = Number(args.budget) || 500;
        const deadline = args.deadline || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
        const briefDetails = args.briefDetails || 'Brief created through Keedohub Creative Brain consultation.';

        const req = db.createCreativeRequest(workspaceId, {
          userId,
          serviceId: 'srv_' + Math.random().toString(36).substring(2, 7),
          serviceName,
          budget,
          currency: 'USD',
          deadline,
          briefDetails,
          status: 'pending',
        });

        db.logActivity(
          workspaceId,
          userId,
          userEmail,
          'REQUEST_STUDIO',
          'creative_request',
          req.id,
          `Creative Brain submitted studio brief: "${serviceName}"`
        );

        return {
          id: "act_" + Math.random().toString(36).substring(2, 9),
          toolName: 'request_studio',
          actionSummary: `Submitted Studio Brief: "${serviceName}" ($${budget} budget, due ${deadline})`,
          entityType: 'creative_request',
          entityId: req.id,
          actionTab: 'overview',
          actionLabel: 'View Studio Requests',
          payload: req,
          status: 'executed',
          timestamp: new Date().toISOString(),
        };
      }

      default:
        throw new Error(`Unknown tool name: ${toolName}`);
    }
  } catch (err: any) {
    return {
      id: "act_err_" + Math.random().toString(36).substring(2, 9),
      toolName,
      actionSummary: `Failed to execute ${toolName}: ${err.message}`,
      entityType: 'task',
      entityId: '',
      actionTab: 'overview',
      actionLabel: 'View Console',
      status: 'failed',
      error: err.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// --- Gemini Tool Declarations ---

export const brainFunctionDeclarations: FunctionDeclaration[] = [
  {
    name: "create_task",
    description: "Create a real actionable task inside the workspace or an active project.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING, description: "Specific, actionable task description" },
        priority: { type: Type.STRING, enum: ["urgent", "high", "medium", "low"], description: "Priority level of the task" },
        deadline: { type: Type.STRING, description: "ISO date format (YYYY-MM-DD) or relative deadline like T-7" },
        category: { type: Type.STRING, description: "Category name, e.g. Artwork, Audio, Marketing, Distribution" },
        projectId: { type: Type.STRING, description: "Optional project ID to attach the task to" },
      },
      required: ["text"],
    },
  },
  {
    name: "create_project",
    description: "Create a new creative project with budget, deadline, and initial milestone tasks.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Title of the project" },
        description: { type: Type.STRING, description: "Scope and objective of the project" },
        category: { type: Type.STRING, description: "Project category, e.g. Production, Marketing, Design, Tour" },
        priority: { type: Type.STRING, enum: ["low", "medium", "high", "urgent"], description: "Priority level" },
        budget: { type: Type.NUMBER, description: "Allocated budget amount in USD" },
        deadline: { type: Type.STRING, description: "Deadline date (YYYY-MM-DD)" },
        initialTasks: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of starting task strings to create inside the project"
        }
      },
      required: ["title"],
    },
  },
  {
    name: "create_release",
    description: "Create a new release blueprint in the Artist OS with timeline and checklist.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Release / song / album title" },
        artistName: { type: Type.STRING, description: "Performing artist / band name" },
        genre: { type: Type.STRING, description: "Primary genre (e.g. Afro-Fusion, Alt-Pop, Hip-Hop)" },
        releaseType: { type: Type.STRING, description: "Single, EP, or Album" },
        releaseDate: { type: Type.STRING, description: "Target drop date (YYYY-MM-DD)" },
        narrative: { type: Type.STRING, description: "Creative narrative and storytelling hook" },
      },
      required: ["title", "artistName"],
    },
  },
  {
    name: "create_campaign",
    description: "Create a master marketing / growth campaign in the Brand OS with objectives and sprints.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Campaign name / title" },
        goal: { type: Type.STRING, description: "Primary measurable campaign goal" },
        objective: { type: Type.STRING, enum: ["product_launch", "lead_generation", "brand_awareness", "rebrand", "seasonal_promo", "growth_sprint", "event_announcement"] },
        startDate: { type: Type.STRING, description: "Campaign start date (YYYY-MM-DD)" },
        endDate: { type: Type.STRING, description: "Campaign end date (YYYY-MM-DD)" },
        budget: { type: Type.NUMBER, description: "Allocated marketing budget in USD" },
        productId: { type: Type.STRING, description: "Optional product or service ID to link" },
        themeName: { type: Type.STRING, description: "Visual and creative theme name" },
        coreMessage: { type: Type.STRING, description: "Core campaign slogan or hook" },
      },
      required: ["title", "goal"],
    },
  },
  {
    name: "create_content_item",
    description: "Create and schedule a social media or marketing content item.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Content concept title" },
        platform: { type: Type.STRING, enum: ["instagram", "tiktok", "youtube", "twitter", "spotify", "linkedin"] },
        contentType: { type: Type.STRING, description: "e.g. Reel, Behind-the-Scenes, Carousel, Audio Memo" },
        concept: { type: Type.STRING, description: "Creative hook and execution idea" },
        captionHook: { type: Type.STRING, description: "Engaging opening line for caption" },
        scheduledDate: { type: Type.STRING, description: "Date to publish (YYYY-MM-DD)" },
      },
      required: ["title", "platform"],
    },
  },
  {
    name: "save_creative_memory",
    description: "Save a permanent creative decision, brand voice rule, tone trait, or narrative guideline into the workspace Creative Memory.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ["decision", "tone", "voice", "narrative", "learning", "goal", "visual"] },
        content: { type: Type.STRING, description: "The guideline, decision, or memory note to save" },
        category: { type: Type.STRING, description: "Optional category label" },
      },
      required: ["type", "content"],
    },
  },
  {
    name: "update_project",
    description: "Update the status, priority, or deadline of an existing workspace project.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        projectId: { type: Type.STRING, description: "Project ID to update" },
        status: { type: Type.STRING, enum: ["planning", "in-progress", "review", "completed"] },
        priority: { type: Type.STRING, enum: ["low", "medium", "high", "urgent"] },
        deadline: { type: Type.STRING, description: "New deadline date (YYYY-MM-DD)" },
      },
      required: ["projectId"],
    },
  },
  {
    name: "request_studio",
    description: "Submit a professional studio service request brief to Keedohub Studio Network (Mastering, 3D Art, Video Editing).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        serviceName: { type: Type.STRING, description: "Requested service (e.g. Dolby Atmos Mastering, 3D Cover Rendering)" },
        budget: { type: Type.NUMBER, description: "Budget offer in USD" },
        deadline: { type: Type.STRING, description: "Target delivery date (YYYY-MM-DD)" },
        briefDetails: { type: Type.STRING, description: "Comprehensive creative brief specifications" },
      },
      required: ["serviceName", "briefDetails"],
    },
  },
];

// --- Algorithmic Contextual Intelligence Engine (High-Fidelity Offline/Heuristic Mode) ---

export function generateAlgorithmicBrainResponse(
  context: CompiledWorkspaceContext,
  userMessage: string,
  executedActions: BrainActionReceipt[] = []
): {
  response: string;
  suggestedActions: { label: string; actionTab: string }[];
} {
  const ws = context.workspace;
  const releases = context.releases;
  const campaigns = context.campaigns;
  const projects = context.projects;
  const memory = context.creativeMemory;
  const identity = ws.identityType;
  const lowerMsg = userMessage.toLowerCase();

  const suggestedActions: { label: string; actionTab: string }[] = [];

  let responseBody = "";

  // 1. Release Readiness Query
  if (
    lowerMsg.includes("release") ||
    lowerMsg.includes("missing") ||
    lowerMsg.includes("readiness") ||
    lowerMsg.includes("blocker") ||
    lowerMsg.includes("drop") ||
    (context.pinnedContext?.type === 'release')
  ) {
    const targetRel = context.pinnedContext?.type === 'release' && context.pinnedContext.details
      ? context.pinnedContext.details
      : releases[0];

    if (!targetRel) {
      responseBody = `### ⚡ Release Readiness Audit\n\nNo active release blueprint was found in **${ws.name}**.\n\nTo begin, initialize a new release in the **Artist OS** or instruct me: *"Create release: [Song Title] by [Artist]"*.`;
      suggestedActions.push({ label: "Launch Release Core", actionTab: "artist-os" });
    } else {
      const rd = targetRel.readiness;
      responseBody = `### ⚡ Release Readiness Audit: **${targetRel.title}**\n\n` +
        `**Status**: ${targetRel.status.toUpperCase()} (${targetRel.genre}) • **Timeline**: ${rd.formattedDays}\n` +
        `**Readiness Score**: **${rd.score}%** (${rd.stage.toUpperCase()})\n\n`;

      if (rd.missingItems.length === 0) {
        responseBody += `✅ **All 7 Release Pillars are fully satisfied!** Your release is locked and ready for drop day deployment.\n\n` +
          `- Master WAV verified\n- 3000x3000px Cover compliant\n- Editorial Pitch submitted\n- Split sheets signed`;
      } else {
        responseBody += `#### 🚨 Critical Blockers & Missing Items (${rd.missingItems.length} Gaps Found):\n\n`;
        rd.missingItems.forEach((item, idx) => {
          responseBody += `${idx + 1}. **${item.label}** (${item.priority.toUpperCase()})\n` +
            `   - *Why it matters*: ${item.reason}\n` +
            `   - *Action Station*: Jump to **${item.actionLabel}**\n\n`;
        });

        responseBody += `#### 🎯 Recommended Action Sequence:\n` +
          `1. Resolve high-priority deliverables before Day -7 to guarantee editorial pitch review window.\n` +
          `2. Secure co-writer/producer digital signatures in the **Splits Calculator**.\n` +
          `3. Seed audio snippet teasers into the **Content Calendar**.`;
      }

      suggestedActions.push(
        { label: "Open Cover Studio", actionTab: "cover-studio" },
        { label: "Mastering Suite", actionTab: "mastering-suite" },
        { label: "DSP Pitcher", actionTab: "dsp-pitcher" },
        { label: "Split Calculator", actionTab: "splits-calculator" }
      );
    }
  }
  // 2. Campaign Readiness Query
  else if (
    lowerMsg.includes("campaign") ||
    lowerMsg.includes("launch") ||
    lowerMsg.includes("brand") ||
    (context.pinnedContext?.type === 'campaign')
  ) {
    const targetCmp = context.pinnedContext?.type === 'campaign' && context.pinnedContext.details
      ? context.pinnedContext.details
      : campaigns[0];

    if (!targetCmp) {
      responseBody = `### ⚡ Campaign Readiness Audit\n\nNo active campaign is currently configured in **${ws.name}**.\n\nWould you like me to generate a complete master campaign architecture with objectives, sprint milestones, and content pipeline?`;
      suggestedActions.push({ label: "Open Brand OS", actionTab: "brand-os" });
    } else {
      const rd = targetCmp.readiness;
      responseBody = `### ⚡ Campaign Readiness Audit: **${targetCmp.title}**\n\n` +
        `**Objective**: ${targetCmp.objective || 'Growth'} • **Budget**: $${targetCmp.budget} ${targetCmp.currency} • **Schedule**: ${rd.formattedDays}\n` +
        `**Readiness Score**: **${rd.score}%** (${rd.stage.toUpperCase()})\n\n`;

      if (rd.missingItems.length === 0) {
        responseBody += `✅ **All 7 Campaign Pillars are fully cleared!** Your campaign is ready for market execution.`;
      } else {
        responseBody += `#### 🚨 Identified Campaign Gaps (${rd.missingItems.length} items):\n\n`;
        rd.missingItems.forEach((item, idx) => {
          responseBody += `${idx + 1}. **${item.label}**\n` +
            `   - *Impact*: ${item.reason}\n` +
            `   - *Resolution*: Navigate to **${item.actionLabel}**\n\n`;
        });
      }

      suggestedActions.push(
        { label: "Campaign Hub", actionTab: "brand-os" },
        { label: "Resource Vault", actionTab: "resource-vault" },
        { label: "Project Console", actionTab: "project-console" }
      );
    }
  }
  // 3. Weekly Priorities & Business Planning
  else if (
    lowerMsg.includes("priority") ||
    lowerMsg.includes("week") ||
    lowerMsg.includes("task") ||
    lowerMsg.includes("work on") ||
    lowerMsg.includes("todo")
  ) {
    responseBody = `### ⚡ Executive Workstation Priorities for **${ws.name}**\n\n` +
      `**Identity Mode**: ${identity.toUpperCase()} • **Active Projects**: ${projects.length}\n\n`;

    if (context.urgentTasks.length > 0) {
      responseBody += `#### 🔥 Urgent / High-Priority Tasks:\n`;
      context.urgentTasks.forEach((t) => {
        responseBody += `- [ ] **${t.text}** (Project: *${t.projectTitle || 'General'}*${t.deadline ? `, Due: ${t.deadline}` : ''})\n`;
      });
      responseBody += `\n`;
    } else {
      responseBody += `✅ *No overdue or critical blockers flagged in your project pipeline.*\n\n`;
    }

    responseBody += `#### 📋 Strategic Sprint Recommendations:\n`;
    if (releases.length > 0) {
      responseBody += `1. **Release Propulsion**: Finalize remaining checklist deliverables for *"${releases[0].title}"* (${releases[0].readiness.score}% ready).\n`;
    }
    if (campaigns.length > 0) {
      responseBody += `2. **Campaign Momentum**: Monitor sprint days for *"${campaigns[0].title}"*.\n`;
    }
    responseBody += `3. **Asset Vault Expansion**: Archive hi-res project deliverables and brand guidelines.\n`;

    suggestedActions.push(
      { label: "Project Console", actionTab: "project-console" },
      { label: "Workspace Hub", actionTab: "workspace-hub" }
    );
  }
  // 4. Creative Tone / Memory Query
  else if (
    lowerMsg.includes("tone") ||
    lowerMsg.includes("voice") ||
    lowerMsg.includes("memory") ||
    lowerMsg.includes("guideline") ||
    lowerMsg.includes("identity")
  ) {
    responseBody = `### ⚡ Workspace Creative Memory: **${ws.name}**\n\n` +
      `- **Core Identity Narrative**: ${memory?.coreNarrative || ws.bio || "High-impact creative operations."}\n` +
      `- **Codified Tone Traits**: ${memory?.toneTraits?.join(", ") || "Bold, Authentic, Sophisticated"}\n` +
      `- **Do Say**: ${memory?.doSay?.join(", ") || "Direct value, high craft, cultural resonance"}\n` +
      `- **Avoid Saying**: ${memory?.dontSay?.join(", ") || "Generic corporate jargon, clichéd marketing speak"}\n` +
      `- **Recent Strategic Learnings**: ${memory?.recentLearnings?.length ? memory.recentLearnings.join(" • ") : "Optimal engagement on short-form sound memos."}\n\n` +
      `*All content generated by Creative Brain adheres strictly to these memory tokens.*`;

    suggestedActions.push(
      { label: "Open Workspace Hub", actionTab: "workspace-hub" },
      { label: "Brand Core Guidelines", actionTab: "brand-os" }
    );
  }
  // 5. Default Comprehensive Reasoning
  else {
    responseBody = `### ⚡ Keedohub Creative Brain • Operations Brief\n\n` +
      `I have synthesized your workspace **${ws.name}** (${identity.toUpperCase()} archetype):\n\n` +
      `- **Releases**: ${releases.length > 0 ? `*${releases[0].title}* (${releases[0].readiness.score}% readiness)` : 'None scheduled'}\n` +
      `- **Campaigns**: ${campaigns.length > 0 ? `*${campaigns[0].title}* ($${campaigns[0].budget} budget)` : 'None active'}\n` +
      `- **Project Pipeline**: ${projects.length} active project(s) • ${context.assetsSummary.totalCount} assets in vault\n\n` +
      `#### Strategic Analysis for "${userMessage}":\n` +
      `1. **Execution Alignment**: Ensure all visual and written deliverables honor your codified tone traits (*${memory?.toneTraits?.join(", ") || "Bold, Authentic"}*).\n` +
      `2. **Velocity Pipeline**: Convert creative concepts into tracked tasks to maintain Day-0 momentum.\n` +
      `3. **Cross-Station Synergy**: Utilize Keedohub's specialized studios (Cover Studio, Mastering Suite, DSP Pitcher, Split Sheets) for unified execution.`;

    suggestedActions.push(
      { label: identity === 'artist' ? "Artist Release Core" : "Brand Campaign Hub", actionTab: identity === 'artist' ? "artist-os" : "brand-os" },
      { label: "Project Console", actionTab: "project-console" },
      { label: "Resource Vault", actionTab: "resource-vault" }
    );
  }

  // If tools were executed in this turn, append receipts
  if (executedActions.length > 0) {
    responseBody += `\n\n---\n### ⚡ Executed Workspace Actions (${executedActions.length}):\n`;
    executedActions.forEach((act) => {
      responseBody += `- ✅ **${act.actionSummary}**\n`;
    });
  }

  return {
    response: responseBody,
    suggestedActions,
  };
}

// --- Main Creative Brain Service Class ---

export class CreativeBrainService {
  private static aiClient: GoogleGenAI | null = null;

  public static getClient(): GoogleGenAI | null {
    if (!this.aiClient && process.env.GEMINI_API_KEY) {
      this.aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return this.aiClient;
  }

  public static async processRequest(params: {
    workspaceId: string;
    userId: string;
    userEmail: string;
    message: string;
    conversationHistory?: any[];
    pinnedContext?: { type: 'release' | 'campaign' | 'project' | 'brand_core' | 'general'; id?: string };
    directActionRequest?: { toolName: string; args: Record<string, any> };
  }): Promise<{
    response: string;
    suggestedActions: { label: string; actionTab: string }[];
    executedActions: BrainActionReceipt[];
    contextAnalyzed: CompiledWorkspaceContext | null;
    usedMemories?: { id: string; title: string; category: string; scope: string; reason: string; snippet: string }[];
    potentialMemoryCandidate?: any;
  }> {
    const { workspaceId, userId, userEmail, message, pinnedContext, directActionRequest } = params;

    const context = compileWorkspaceContext(workspaceId, pinnedContext, message);
    if (!context) {
      throw new Error(`Workspace not found or unauthorized: ${workspaceId}`);
    }

    const executedActions: BrainActionReceipt[] = [];

    // 1. If a direct action was explicitly requested
    if (directActionRequest && directActionRequest.toolName) {
      const receipt = executeBrainTool({
        workspaceId,
        userId,
        userEmail,
        toolName: directActionRequest.toolName,
        args: directActionRequest.args || {},
      });
      executedActions.push(receipt);
    }

    // 2. Check for offline intent patterns that map directly to actions if user explicitly asks for task/project/release/campaign creation
    const lowerMsg = (message || "").toLowerCase().trim();
    if (!directActionRequest) {
      if (lowerMsg.startsWith("create task:") || lowerMsg.startsWith("add task:") || lowerMsg.startsWith("task:")) {
        const text = message.replace(/^(create task:|add task:|task:)/i, "").trim();
        if (text) {
          const receipt = executeBrainTool({
            workspaceId,
            userId,
            userEmail,
            toolName: "create_task",
            args: { text, priority: "high" },
          });
          executedActions.push(receipt);
        }
      } else if (lowerMsg.startsWith("create project:") || lowerMsg.startsWith("new project:")) {
        const title = message.replace(/^(create project:|new project:)/i, "").trim();
        if (title) {
          const receipt = executeBrainTool({
            workspaceId,
            userId,
            userEmail,
            toolName: "create_project",
            args: { title, priority: "high" },
          });
          executedActions.push(receipt);
        }
      } else if (lowerMsg.startsWith("create release:") || lowerMsg.startsWith("new release:")) {
        const title = message.replace(/^(create release:|new release:)/i, "").trim();
        if (title) {
          const receipt = executeBrainTool({
            workspaceId,
            userId,
            userEmail,
            toolName: "create_release",
            args: { title, artistName: context.workspace.name },
          });
          executedActions.push(receipt);
        }
      } else if (lowerMsg.startsWith("create campaign:") || lowerMsg.startsWith("new campaign:")) {
        const title = message.replace(/^(create campaign:|new campaign:)/i, "").trim();
        if (title) {
          const receipt = executeBrainTool({
            workspaceId,
            userId,
            userEmail,
            toolName: "create_campaign",
            args: { title, goal: "Drive awareness and conversion" },
          });
          executedActions.push(receipt);
        }
      }
    }

    // 3. Try Gemini AI Client
    const ai = this.getClient();

    if (ai) {
      try {
        const systemInstruction = `You are Keedohub Creative Brain — the unified creative intelligence and operational copilot across Keedohub OS.
You are embedded directly inside the user's workspace.
You have real tools to create tasks, projects, releases, campaigns, content items, and save creative memories.
NEVER pretend to take an action without using your tools. When the user asks you to do something actionable, CALL THE APPROPRIATE TOOL.

WORKSPACE CONTEXT:
- Workspace Name: ${context.workspace.name}
- Identity Type: ${context.workspace.identityType}
- Bio/Niche: ${context.workspace.bio || context.workspace.genreOrNiche || 'N/A'}
- Brand Core: ${JSON.stringify(context.brandCore || {})}
- Releases & 7-Pillar Readiness: ${JSON.stringify(context.releases)}
- Campaigns & 7-Pillar Readiness: ${JSON.stringify(context.campaigns)}
- Projects & Tasks: ${JSON.stringify(context.projects)}
- Stored Assets: ${JSON.stringify(context.assetsSummary)}
- Content Pipeline: ${JSON.stringify(context.contentSummary)}
- Pinned Focus Context: ${JSON.stringify(context.pinnedContext || {})}

${context.retrievedMemories?.promptContext || ''}

CORE DIRECTIVES:
1. Always base answers strictly on the workspace data and persistent creative memory above.
2. For Artist release inquiries: Inspect the 7 release pillars (Cover Artwork, Master WAV Audio, DSP Pitch, Pre-Save, Synchronized Lyrics, Split Sheets, Promo Wave) and list exact missing items.
3. For Brand/Business campaign inquiries: Inspect the 7 campaign pillars (Objective, Product Link, Creative Direction, Hero Asset, Content Pipeline, Sprint Milestones, Approvals) and list exact blockers.
4. For general or project questions: Provide tactical, high-impact guidance, prioritization, and concrete next steps.
5. Format answers in structured Markdown with clear headings and bullet points.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemInstruction}\n\nUSER PROMPT: ${message}` }],
            },
          ],
          config: {
            httpOptions: {
              headers: {
                "Client-Info": "aistudio-build",
              },
            },
          },
        });

        const textResponse = response.text || "Workspace analysis completed.";

        // Dynamic suggested actions based on context
        const suggestedActions: { label: string; actionTab: string }[] = [];
        if (context.workspace.identityType === 'artist') {
          suggestedActions.push(
            { label: "Audit Release Core", actionTab: "artist-os" },
            { label: "Creative Memory Hub", actionTab: "creative-memory" },
            { label: "Open Cover Studio", actionTab: "cover-studio" },
            { label: "DSP Pitcher", actionTab: "dsp-pitcher" }
          );
        } else {
          suggestedActions.push(
            { label: "Campaign Hub", actionTab: "brand-os" },
            { label: "Creative Memory Hub", actionTab: "creative-memory" },
            { label: "Resource Vault", actionTab: "resource-vault" },
            { label: "Project Console", actionTab: "project-console" }
          );
        }

        let fullResponse = textResponse;
        if (executedActions.length > 0) {
          fullResponse += `\n\n---\n### ⚡ Executed Workspace Actions (${executedActions.length}):\n`;
          executedActions.forEach((act) => {
            fullResponse += `- ✅ **${act.actionSummary}**\n`;
          });
        }

        // Memory Candidate Detection (AI Extraction with User Approval)
        const candidateDetection = MemoryRetrievalService.detectMemoryCandidate(workspaceId, message, fullResponse);
        let potentialMemoryCandidate: any = undefined;
        if (candidateDetection.shouldPropose && candidateDetection.candidate) {
          potentialMemoryCandidate = db.createMemoryCandidate(workspaceId, {
            ...candidateDetection.candidate,
            scope: 'workspace',
            sourceContext: 'Creative Brain Interaction',
            confidence: 88,
            status: 'pending',
          });
        }

        return {
          response: fullResponse,
          suggestedActions,
          executedActions,
          contextAnalyzed: context,
          usedMemories: context.retrievedMemories?.transparencySummaries || [],
          potentialMemoryCandidate,
        };
      } catch (err: any) {
        console.error("[CreativeBrain AI Service Error]", err);
        // Gracefully fall back to algorithmic engine
      }
    }

    // Fallback: Algorithmic Intelligence Engine
    const algorithmic = generateAlgorithmicBrainResponse(context, message, executedActions);

    // Also check memory candidate detection for offline mode
    const candidateDetection = MemoryRetrievalService.detectMemoryCandidate(workspaceId, message, algorithmic.response);
    let potentialMemoryCandidate: any = undefined;
    if (candidateDetection.shouldPropose && candidateDetection.candidate) {
      potentialMemoryCandidate = db.createMemoryCandidate(workspaceId, {
        ...candidateDetection.candidate,
        scope: 'workspace',
        sourceContext: 'Creative Brain Interaction (Direct)',
        confidence: 90,
        status: 'pending',
      });
    }

    return {
      response: algorithmic.response,
      suggestedActions: algorithmic.suggestedActions,
      executedActions,
      contextAnalyzed: context,
      usedMemories: context.retrievedMemories?.transparencySummaries || [],
      potentialMemoryCandidate,
    };
  }
}
