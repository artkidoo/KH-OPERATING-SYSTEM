import {
  User,
  Workspace,
  Project,
  Asset,
  Release,
  Campaign,
  BrandCore,
  ProductService,
  BrandStrategy,
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
  CreativeBrainRecommendation,
  BrainActionReceipt,
  GlobalSearchResult,
  StudioRequest,
  StudioQuote,
  StudioProject,
  StudioDeliverable,
  StudioRevision,
  StudioMessage,
  StudioBrief,
  StudioQuoteStatus,
  StudioRevisionStatus,
} from "../types";

const TOKEN_KEY = "keedohub_session_token";

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.error("Failed to store token", e);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Clear token if invalid to prevent repeated auth failures
      setStoredToken(null);
    }
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  auth: {
    signup: async (data: {
      email: string;
      password: string;
      fullName: string;
      identityType?: IdentityType;
      workspaceName?: string;
      bio?: string;
      genreOrNiche?: string;
    }) => {
      const res = await request<{
        token: string;
        user: User;
        activeWorkspace: Workspace;
        workspaces: Workspace[];
      }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setStoredToken(res.token);
      return res;
    },

    login: async (credentials: { email: string; password: string }) => {
      const res = await request<{
        token: string;
        user: User;
        workspaces: Workspace[];
        activeWorkspace: Workspace;
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      setStoredToken(res.token);
      return res;
    },

    me: async () => {
      const res = await request<{
        token?: string;
        user: User;
        workspaces: Workspace[];
        activeWorkspace: Workspace;
      }>("/api/auth/me");
      if (res.token) {
        setStoredToken(res.token);
      }
      return res;
    },

    logout: async () => {
      try {
        await request("/api/auth/logout", { method: "POST" });
      } finally {
        setStoredToken(null);
      }
    },
  },

  workspaces: {
    list: async () => {
      return request<{ workspaces: Workspace[] }>("/api/workspaces");
    },

    create: async (data: {
      name: string;
      identityType: IdentityType;
      bio?: string;
      genreOrNiche?: string;
      avatarUrl?: string;
    }) => {
      return request<{ workspace: Workspace }>("/api/workspaces", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    getOverview: async (workspaceId: string) => {
      return request<{
        workspace: Workspace;
        stats: {
          totalProjects: number;
          activeProjects: number;
          pendingTasks: number;
          totalAssets: number;
          totalReleases: number;
          scheduledReleases: number;
          totalCampaigns: number;
          totalContentItems: number;
          upcomingContent: number;
          totalFolders: number;
          totalMilestones: number;
        };
        latestRelease: Release | null;
        latestProject: Project | null;
        latestCampaign: Campaign | null;
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
      }>(`/api/workspaces/${workspaceId}/overview`);
    },

    update: async (workspaceId: string, updates: Partial<Workspace>) => {
      return request<{ workspace: Workspace }>(`/api/workspaces/${workspaceId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },
  },

  tasks: {
    list: async (workspaceId: string) => {
      return request<{ tasks: TaskItem[] }>(`/api/workspaces/${workspaceId}/tasks`);
    },

    create: async (workspaceId: string, task: Partial<TaskItem> & { text: string }) => {
      return request<{ task: TaskItem }>(`/api/workspaces/${workspaceId}/tasks`, {
        method: "POST",
        body: JSON.stringify(task),
      });
    },

    update: async (workspaceId: string, taskId: string, updates: Partial<TaskItem>) => {
      return request<{ task: TaskItem }>(`/api/workspaces/${workspaceId}/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },

    delete: async (workspaceId: string, taskId: string) => {
      return request<{ message: string }>(`/api/workspaces/${workspaceId}/tasks/${taskId}`, {
        method: "DELETE",
      });
    },
  },

  folders: {
    list: async (workspaceId: string) => {
      return request<{ folders: Folder[] }>(`/api/workspaces/${workspaceId}/folders`);
    },

    create: async (workspaceId: string, folder: Partial<Folder> & { name: string }) => {
      return request<{ folder: Folder }>(`/api/workspaces/${workspaceId}/folders`, {
        method: "POST",
        body: JSON.stringify(folder),
      });
    },

    update: async (workspaceId: string, folderId: string, updates: Partial<Folder>) => {
      return request<{ folder: Folder }>(`/api/workspaces/${workspaceId}/folders/${folderId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },

    delete: async (workspaceId: string, folderId: string) => {
      return request<{ message: string }>(`/api/workspaces/${workspaceId}/folders/${folderId}`, {
        method: "DELETE",
      });
    },
  },

  milestones: {
    list: async (workspaceId: string, projectId?: string) => {
      const url = projectId
        ? `/api/workspaces/${workspaceId}/milestones?projectId=${encodeURIComponent(projectId)}`
        : `/api/workspaces/${workspaceId}/milestones`;
      return request<{ milestones: Milestone[] }>(url);
    },

    create: async (workspaceId: string, milestone: Partial<Milestone> & { title: string; targetDate: string }) => {
      return request<{ milestone: Milestone }>(`/api/workspaces/${workspaceId}/milestones`, {
        method: "POST",
        body: JSON.stringify(milestone),
      });
    },

    update: async (workspaceId: string, milestoneId: string, updates: Partial<Milestone>) => {
      return request<{ milestone: Milestone }>(`/api/workspaces/${workspaceId}/milestones/${milestoneId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },

    delete: async (workspaceId: string, milestoneId: string) => {
      return request<{ message: string }>(`/api/workspaces/${workspaceId}/milestones/${milestoneId}`, {
        method: "DELETE",
      });
    },
  },

  search: {
    query: async (workspaceId: string, q: string) => {
      return request<{ results: GlobalSearchResult[] }>(`/api/workspaces/${workspaceId}/search?q=${encodeURIComponent(q)}`);
    },
  },

  intelligence: {
    getAttention: async (workspaceId: string) => {
      return request<{ attention: AttentionItem[] }>(`/api/workspaces/${workspaceId}/attention`);
    },
    getRecommendations: async (workspaceId: string) => {
      return request<{ recommendations: CreativeRecommendation[] }>(`/api/workspaces/${workspaceId}/recommendations`);
    },
  },

  projects: {
    list: async (workspaceId: string) => {
      return request<{ projects: Project[] }>(`/api/workspaces/${workspaceId}/projects`);
    },

    create: async (workspaceId: string, project: Partial<Project>) => {
      return request<{ project: Project }>(`/api/workspaces/${workspaceId}/projects`, {
        method: "POST",
        body: JSON.stringify(project),
      });
    },

    update: async (workspaceId: string, projectId: string, updates: Partial<Project>) => {
      return request<{ project: Project }>(`/api/workspaces/${workspaceId}/projects/${projectId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },

    delete: async (workspaceId: string, projectId: string) => {
      return request<{ message: string }>(`/api/workspaces/${workspaceId}/projects/${projectId}`, {
        method: "DELETE",
      });
    },
  },

  assets: {
    list: async (workspaceId: string) => {
      return request<{ assets: Asset[] }>(`/api/workspaces/${workspaceId}/assets`);
    },

    create: async (workspaceId: string, asset: Partial<Asset>) => {
      return request<{ asset: Asset }>(`/api/workspaces/${workspaceId}/assets`, {
        method: "POST",
        body: JSON.stringify(asset),
      });
    },

    delete: async (workspaceId: string, assetId: string) => {
      return request<{ message: string }>(`/api/workspaces/${workspaceId}/assets/${assetId}`, {
        method: "DELETE",
      });
    },
  },

  releases: {
    list: async (workspaceId: string) => {
      return request<{ releases: Release[] }>(`/api/workspaces/${workspaceId}/releases`);
    },

    create: async (workspaceId: string, release: Partial<Release>) => {
      return request<{ release: Release }>(`/api/workspaces/${workspaceId}/releases`, {
        method: "POST",
        body: JSON.stringify(release),
      });
    },

    update: async (workspaceId: string, releaseId: string, updates: Partial<Release>) => {
      return request<{ release: Release }>(`/api/workspaces/${workspaceId}/releases/${releaseId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },

    delete: async (workspaceId: string, releaseId: string) => {
      return request<{ message: string }>(`/api/workspaces/${workspaceId}/releases/${releaseId}`, {
        method: "DELETE",
      });
    },
  },

  brandCore: {
    get: async (workspaceId: string) => {
      return request<{ brandCore: BrandCore }>(`/api/workspaces/${workspaceId}/brand-core`);
    },
    update: async (workspaceId: string, updates: Partial<BrandCore>) => {
      return request<{ brandCore: BrandCore }>(`/api/workspaces/${workspaceId}/brand-core`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },
  },

  products: {
    list: async (workspaceId: string) => {
      return request<{ products: ProductService[] }>(`/api/workspaces/${workspaceId}/products`);
    },
    create: async (workspaceId: string, product: Partial<ProductService> & { name: string }) => {
      return request<{ product: ProductService }>(`/api/workspaces/${workspaceId}/products`, {
        method: "POST",
        body: JSON.stringify(product),
      });
    },
    update: async (workspaceId: string, productId: string, updates: Partial<ProductService>) => {
      return request<{ product: ProductService }>(`/api/workspaces/${workspaceId}/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },
    delete: async (workspaceId: string, productId: string) => {
      return request<{ message: string }>(`/api/workspaces/${workspaceId}/products/${productId}`, {
        method: "DELETE",
      });
    },
  },

  campaigns: {
    list: async (workspaceId: string) => {
      return request<{ campaigns: Campaign[] }>(`/api/workspaces/${workspaceId}/campaigns`);
    },

    create: async (workspaceId: string, campaign: Partial<Campaign>) => {
      return request<{ campaign: Campaign }>(`/api/workspaces/${workspaceId}/campaigns`, {
        method: "POST",
        body: JSON.stringify(campaign),
      });
    },

    update: async (workspaceId: string, campaignId: string, updates: Partial<Campaign>) => {
      return request<{ campaign: Campaign }>(`/api/workspaces/${workspaceId}/campaigns/${campaignId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },

    delete: async (workspaceId: string, campaignId: string) => {
      return request<{ message: string }>(`/api/workspaces/${workspaceId}/campaigns/${campaignId}`, {
        method: "DELETE",
      });
    },
  },

  contentPillars: {
    list: async (workspaceId: string) => {
      return request<{ contentPillars: any[] }>(`/api/workspaces/${workspaceId}/content-pillars`);
    },
    create: async (workspaceId: string, pillar: any) => {
      return request<{ contentPillar: any }>(`/api/workspaces/${workspaceId}/content-pillars`, {
        method: "POST",
        body: JSON.stringify(pillar),
      });
    },
    update: async (workspaceId: string, pillarId: string, updates: any) => {
      return request<{ contentPillar: any }>(`/api/workspaces/${workspaceId}/content-pillars/${pillarId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },
    delete: async (workspaceId: string, pillarId: string) => {
      return request<{ message: string }>(`/api/workspaces/${workspaceId}/content-pillars/${pillarId}`, {
        method: "DELETE",
      });
    },
  },

  contentItems: {
    list: async (workspaceId: string) => {
      return request<{ contentItems: ContentItem[] }>(`/api/workspaces/${workspaceId}/content-items`);
    },

    create: async (workspaceId: string, item: Partial<ContentItem>) => {
      return request<{ contentItem: ContentItem }>(`/api/workspaces/${workspaceId}/content-items`, {
        method: "POST",
        body: JSON.stringify(item),
      });
    },

    createBatch: async (workspaceId: string, items: Partial<ContentItem>[]) => {
      return request<{ contentItems: ContentItem[] }>(`/api/workspaces/${workspaceId}/content-items/batch`, {
        method: "POST",
        body: JSON.stringify({ items }),
      });
    },

    duplicate: async (workspaceId: string, itemId: string) => {
      return request<{ contentItem: ContentItem }>(`/api/workspaces/${workspaceId}/content-items/${itemId}/duplicate`, {
        method: "POST",
      });
    },

    update: async (workspaceId: string, itemId: string, updates: Partial<ContentItem>) => {
      return request<{ contentItem: ContentItem }>(`/api/workspaces/${workspaceId}/content-items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },

    delete: async (workspaceId: string, itemId: string) => {
      return request<{ message: string }>(`/api/workspaces/${workspaceId}/content-items/${itemId}`, {
        method: "DELETE",
      });
    },

    getGaps: async (workspaceId: string) => {
      return request<{
        gaps: any[];
        qualityIssues: any[];
        summary: {
          totalContent: number;
          scheduledCount: number;
          publishedCount: number;
          gapCount: number;
          qualityIssueCount: number;
        };
      }>(`/api/workspaces/${workspaceId}/content-gaps`);
    },

    generateOpportunityBatch: async (workspaceId: string, params: {
      stage?: string;
      releaseId?: string;
      campaignId?: string;
      productId?: string;
      platform?: string;
      count?: number;
      customGoal?: string;
    }) => {
      return request<{ suggestions: Partial<ContentItem>[] }>(`/api/workspaces/${workspaceId}/content-items/generate-opportunity-batch`, {
        method: "POST",
        body: JSON.stringify(params),
      });
    },
  },

  creativeMemory: {
    get: async (workspaceId: string) => {
      return request<{ creativeMemory: CreativeMemory }>(`/api/workspaces/${workspaceId}/creative-memory`);
    },

    update: async (workspaceId: string, memory: Partial<CreativeMemory>) => {
      return request<{ creativeMemory: CreativeMemory }>(`/api/workspaces/${workspaceId}/creative-memory`, {
        method: "PUT",
        body: JSON.stringify(memory),
      });
    },
  },

  notifications: {
    list: async (workspaceId: string) => {
      return request<{ notifications: NotificationItem[] }>(`/api/workspaces/${workspaceId}/notifications`);
    },

    markRead: async (workspaceId: string, notifId: string) => {
      return request<{ success: boolean }>(`/api/workspaces/${workspaceId}/notifications/${notifId}/read`, {
        method: "POST",
      });
    },
  },

  activityLogs: {
    list: async (workspaceId: string) => {
      return request<{ activityLogs: ActivityLog[] }>(`/api/workspaces/${workspaceId}/activity-logs`);
    },
  },

  creativeRequests: {
    list: async (workspaceId: string) => {
      return request<{ requests: CreativeRequest[] }>(`/api/workspaces/${workspaceId}/creative-requests`);
    },

    create: async (workspaceId: string, data: Partial<CreativeRequest>) => {
      return request<{ request: CreativeRequest }>(`/api/workspaces/${workspaceId}/creative-requests`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },

  ai: {
    creativeBrain: async (
      workspaceId: string,
      message: string,
      conversationHistory?: any[],
      pinnedContext?: { type: 'release' | 'campaign' | 'project' | 'brand_core' | 'general'; id?: string },
      directActionRequest?: { toolName: string; args: Record<string, any> }
    ) => {
      return request<{
        response: string;
        suggestedActions: { label: string; actionTab: string }[];
        executedActions?: BrainActionReceipt[];
        contextAnalyzed: any;
      }>("/api/ai/creative-brain", {
        method: "POST",
        body: JSON.stringify({ workspaceId, message, conversationHistory, pinnedContext, directActionRequest }),
      });
    },

    executeAction: async (workspaceId: string, toolName: string, args: Record<string, any>) => {
      return request<{ receipt: BrainActionReceipt }>("/api/ai/creative-brain/action", {
        method: "POST",
        body: JSON.stringify({ workspaceId, toolName, args }),
      });
    },

    getRecommendations: async (workspaceId: string) => {
      return request<{ recommendations: CreativeBrainRecommendation[] }>(
        `/api/ai/creative-brain/recommendations?workspaceId=${encodeURIComponent(workspaceId)}`
      );
    },

    getContext: async (workspaceId: string, contextType?: string, contextId?: string) => {
      let url = `/api/ai/creative-brain/context?workspaceId=${encodeURIComponent(workspaceId)}`;
      if (contextType) url += `&contextType=${encodeURIComponent(contextType)}`;
      if (contextId) url += `&contextId=${encodeURIComponent(contextId)}`;
      return request<{ context: any }>(url);
    },

    brandStrategy: async (workspaceId: string, prompt?: string, focusArea?: string) => {
      return request<{ strategy: any }>("/api/ai/brand-strategy", {
        method: "POST",
        body: JSON.stringify({ workspaceId, prompt, focusArea }),
      });
    },

    campaignBuilder: async (
      workspaceId: string,
      data: {
        campaignObjective?: string;
        selectedProductId?: string;
        targetBudget?: number;
        platforms?: string[];
      }
    ) => {
      return request<{ plan: any }>("/api/ai/campaign-builder", {
        method: "POST",
        body: JSON.stringify({ workspaceId, ...data }),
      });
    },
  },

  studio: {
    requests: {
      getAll: async (workspaceId: string) => {
        return request<{ requests: StudioRequest[] }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/studio/requests`);
      },
      getById: async (workspaceId: string, requestId: string) => {
        return request<{ request: StudioRequest }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/studio/requests/${encodeURIComponent(requestId)}`);
      },
      create: async (workspaceId: string, data: Partial<StudioRequest> & { serviceId: string; serviceName: string; title: string; brief: StudioBrief }) => {
        return request<{ request: StudioRequest; quote?: StudioQuote }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/studio/requests`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      update: async (workspaceId: string, requestId: string, updates: Partial<StudioRequest>) => {
        return request<{ request: StudioRequest }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/studio/requests/${encodeURIComponent(requestId)}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        });
      },
      delete: async (workspaceId: string, requestId: string) => {
        return request<{ success: boolean }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/studio/requests/${encodeURIComponent(requestId)}`, {
          method: "DELETE",
        });
      },
    },

    quotes: {
      getAll: async (workspaceId: string, requestId?: string) => {
        let url = `/api/workspaces/${encodeURIComponent(workspaceId)}/studio/quotes`;
        if (requestId) url += `?requestId=${encodeURIComponent(requestId)}`;
        return request<{ quotes: StudioQuote[] }>(url);
      },
      create: async (workspaceId: string, data: Partial<StudioQuote>) => {
        return request<{ quote: StudioQuote }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/studio/quotes`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      updateStatus: async (
        workspaceId: string,
        quoteId: string,
        status: StudioQuoteStatus,
        payload?: { approvedBy?: string; declinedReason?: string; clarificationNotes?: string }
      ) => {
        return request<{ quote: StudioQuote; project?: StudioProject }>(
          `/api/workspaces/${encodeURIComponent(workspaceId)}/studio/quotes/${encodeURIComponent(quoteId)}/status`,
          {
            method: "POST",
            body: JSON.stringify({ status, ...payload }),
          }
        );
      },
    },

    projects: {
      getAll: async (workspaceId: string) => {
        return request<{ projects: StudioProject[] }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/studio/projects`);
      },
      getById: async (workspaceId: string, projectId: string) => {
        return request<{ project: StudioProject }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/studio/projects/${encodeURIComponent(projectId)}`);
      },
      update: async (workspaceId: string, projectId: string, updates: Partial<StudioProject>) => {
        return request<{ project: StudioProject }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/studio/projects/${encodeURIComponent(projectId)}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        });
      },
    },

    deliverables: {
      getAll: async (workspaceId: string, projectId?: string) => {
        let url = `/api/workspaces/${encodeURIComponent(workspaceId)}/studio/deliverables`;
        if (projectId) url += `?projectId=${encodeURIComponent(projectId)}`;
        return request<{ deliverables: StudioDeliverable[] }>(url);
      },
      create: async (workspaceId: string, data: Partial<StudioDeliverable> & { projectId: string; name: string }) => {
        return request<{ deliverable: StudioDeliverable }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/studio/deliverables`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      update: async (workspaceId: string, deliverableId: string, updates: Partial<StudioDeliverable>) => {
        return request<{ deliverable: StudioDeliverable }>(
          `/api/workspaces/${encodeURIComponent(workspaceId)}/studio/deliverables/${encodeURIComponent(deliverableId)}`,
          {
            method: "PUT",
            body: JSON.stringify(updates),
          }
        );
      },
      syncToVault: async (workspaceId: string, deliverableId: string) => {
        return request<{ success: boolean; asset: Asset }>(
          `/api/workspaces/${encodeURIComponent(workspaceId)}/studio/deliverables/${encodeURIComponent(deliverableId)}/sync-to-vault`,
          {
            method: "POST",
          }
        );
      },
    },

    revisions: {
      getAll: async (workspaceId: string, projectId?: string, deliverableId?: string) => {
        let url = `/api/workspaces/${encodeURIComponent(workspaceId)}/studio/revisions`;
        const params: string[] = [];
        if (projectId) params.push(`projectId=${encodeURIComponent(projectId)}`);
        if (deliverableId) params.push(`deliverableId=${encodeURIComponent(deliverableId)}`);
        if (params.length > 0) url += `?${params.join("&")}`;
        return request<{ revisions: StudioRevision[] }>(url);
      },
      create: async (
        workspaceId: string,
        data: { projectId: string; deliverableId: string; deliverableName?: string; version?: string; reason: string; requestedChanges: string }
      ) => {
        return request<{ revision: StudioRevision }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/studio/revisions`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      updateStatus: async (workspaceId: string, revisionId: string, status: StudioRevisionStatus) => {
        return request<{ revision: StudioRevision }>(
          `/api/workspaces/${encodeURIComponent(workspaceId)}/studio/revisions/${encodeURIComponent(revisionId)}/status`,
          {
            method: "PUT",
            body: JSON.stringify({ status }),
          }
        );
      },
    },

    messages: {
      getAll: async (workspaceId: string, projectId?: string, requestId?: string) => {
        let url = `/api/workspaces/${encodeURIComponent(workspaceId)}/studio/messages`;
        const params: string[] = [];
        if (projectId) params.push(`projectId=${encodeURIComponent(projectId)}`);
        if (requestId) params.push(`requestId=${encodeURIComponent(requestId)}`);
        if (params.length > 0) url += `?${params.join("&")}`;
        return request<{ messages: StudioMessage[] }>(url);
      },
      send: async (
        workspaceId: string,
        data: { projectId?: string; requestId?: string; content: string; attachments?: any[] }
      ) => {
        return request<{ message: StudioMessage }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/studio/messages`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
    },

    aiBriefAssist: async (workspaceId: string, serviceCategory: string, draftBrief: Partial<StudioBrief>) => {
      return request<{
        assist: {
          refinedConcept: string;
          suggestedVisualDirection: string;
          suggestedDeliverables: string[];
          missingElements: string[];
          clarifyingQuestions: string[];
          estimatedDays: string;
          confidenceScore: number;
        };
      }>(`/api/workspaces/${encodeURIComponent(workspaceId)}/studio/ai-brief-assist`, {
        method: "POST",
        body: JSON.stringify({ serviceCategory, draftBrief }),
      });
    },
  },
};
