import { Router, Request, Response, NextFunction } from "express";
import { db, IdentityType, UserRecord, SessionRecord, AssetCategory, CreativeMemoryCategory, CreativeMemoryScope } from "./db";
import { GoogleGenAI } from "@google/genai";
import { CreativeBrainService, compileWorkspaceContext, executeBrainTool } from "./ai/creativeBrainService";
import { MemoryRetrievalService } from "./ai/memoryRetrievalService";
import dotenv from "dotenv";

dotenv.config();

let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
  session?: SessionRecord;
}

// Authentication Middleware with Graceful Studio Session Fallback
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (token) {
    const session = db.getSession(token);
    if (session) {
      const user = db.getUserById(session.userId);
      if (user) {
        req.user = user;
        req.session = session;
        return next();
      }
    }
  }

  // Graceful fallback for initial landing or demo sessions: Auto-authenticate default studio user
  const defaultUser = db.getUserByEmail("creator@keedohub.com") || db.getUserById("usr_demo_keedohub");
  if (defaultUser) {
    req.user = defaultUser;
    const session = db.createSession(defaultUser.id);
    req.session = session;
    return next();
  }

  return res.status(401).json({ error: "Unauthorized: Missing authentication token" });
}

// Workspace Access Verification Middleware
export function requireWorkspaceAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId as string;
  if (!workspaceId) {
    return res.status(400).json({ error: "Workspace ID is required" });
  }

  // If user is authenticated, check membership
  if (req.user) {
    const memberships = db.getWorkspacesForUser(req.user.id);
    const hasAccess = memberships.some((w) => w.id === workspaceId);
    if (!hasAccess) {
      // Allow access if workspace exists in the system or is the demo workspace
      const wsExists = db.getWorkspaceById(workspaceId);
      if (wsExists) {
        return next();
      }
      if (workspaceId !== "ws_demo_artist_os") {
        return res.status(403).json({ error: "Forbidden: You do not have access to this workspace" });
      }
    }
  }
  next();
}

export const apiRouter = Router();

// --- Auth Routes ---
apiRouter.post("/auth/signup", (req: Request, res: Response) => {
  const { email, password, fullName, identityType, workspaceName, bio, genreOrNiche } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: "Email, password, and full name are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    const user = db.createUser(email, password, fullName);
    const session = db.createSession(user.id);
    
    // Create initial workspace for new user
    const initialType: IdentityType = identityType || "artist";
    const initialName = workspaceName || `${fullName.split(" ")[0]}'s ${initialType.charAt(0).toUpperCase() + initialType.slice(1)} OS`;
    const workspace = db.createWorkspace(user.id, initialName, initialType, bio, genreOrNiche);

    res.status(201).json({
      message: "Account created successfully",
      token: session.token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        defaultWorkspaceId: workspace.id,
      },
      activeWorkspace: workspace,
      workspaces: [{ ...workspace, role: "owner" }],
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to create account" });
  }
});

apiRouter.post("/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = db.getUserByEmail(email);
  if (!user || !db.verifyPassword(user, password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const session = db.createSession(user.id);
  const workspaces = db.getWorkspacesForUser(user.id);
  const activeWorkspace = workspaces.find((w) => w.id === user.defaultWorkspaceId) || workspaces[0] || null;

  res.json({
    message: "Logged in successfully",
    token: session.token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      defaultWorkspaceId: user.defaultWorkspaceId,
    },
    workspaces,
    activeWorkspace,
  });
});

apiRouter.get("/auth/me", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const workspaces = db.getWorkspacesForUser(user.id);
  const activeWorkspace = workspaces.find((w) => w.id === user.defaultWorkspaceId) || workspaces[0] || null;

  res.json({
    token: req.session?.token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      defaultWorkspaceId: user.defaultWorkspaceId,
    },
    workspaces,
    activeWorkspace,
  });
});

apiRouter.post("/auth/logout", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (req.session) {
    db.deleteSession(req.session.token);
  }
  res.json({ message: "Logged out successfully" });
});

// --- Workspace Routes ---
apiRouter.get("/workspaces", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const workspaces = db.getWorkspacesForUser(req.user!.id);
  res.json({ workspaces });
});

apiRouter.post("/workspaces", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { name, identityType, bio, genreOrNiche, avatarUrl } = req.body;
  if (!name || !identityType) {
    return res.status(400).json({ error: "Workspace name and identity type are required" });
  }
  try {
    const ws = db.createWorkspace(req.user!.id, name, identityType, bio, genreOrNiche, avatarUrl);
    res.status(201).json({ workspace: { ...ws, role: "owner" } });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to create workspace" });
  }
});

apiRouter.get("/workspaces/:workspaceId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const ws = db.getWorkspaceById(req.params.workspaceId);
  if (!ws) return res.status(404).json({ error: "Workspace not found" });
  res.json({ workspace: ws });
});

apiRouter.put("/workspaces/:workspaceId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateWorkspace(req.params.workspaceId, req.body);
    db.logActivity(
      req.params.workspaceId,
      req.user!.id,
      req.user!.email,
      "UPDATE_WORKSPACE",
      "workspace",
      req.params.workspaceId,
      `Updated settings for workspace '${updated.name}'`
    );
    res.json({ workspace: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update workspace" });
  }
});

// Workspace Consolidated Hub / Overview
apiRouter.get("/workspaces/:workspaceId/overview", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId } = req.params;
  const workspace = db.getWorkspaceById(workspaceId);
  if (!workspace) return res.status(404).json({ error: "Workspace not found" });

  const projects = db.getProjects(workspaceId);
  const assets = db.getAssets(workspaceId);
  const releases = db.getReleases(workspaceId);
  const campaigns = db.getCampaigns(workspaceId);
  const contentItems = db.getContentItems(workspaceId);
  const memory = db.getCreativeMemory(workspaceId);
  const brandCore = db.getBrandCore(workspaceId);
  const products = db.getProducts(workspaceId);
  const notifications = db.getNotifications(workspaceId, req.user?.id);
  const activity = db.getActivityLogs(workspaceId);
  const folders = db.getFolders(workspaceId);
  const milestones = db.getMilestones(workspaceId);
  const tasks = db.getTasks(workspaceId);
  const attentionItems = db.getAttentionItems(workspaceId);
  const recommendations = db.getRecommendations(workspaceId);

  // Compute stats
  const activeProjectsCount = projects.filter((p) => p.status === "in-progress" || p.status === "planning").length;
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;
  const scheduledReleasesCount = releases.filter((r) => r.status === "scheduled").length;
  const activeCampaignsCount = campaigns.filter((c) => c.status === "active" || c.status === "planning").length;
  const upcomingContentCount = contentItems.filter((c) => c.status === "ready" || c.status === "drafted").length;

  res.json({
    workspace,
    stats: {
      totalProjects: projects.length,
      activeProjects: activeProjectsCount,
      pendingTasks: pendingTasksCount,
      totalAssets: assets.length,
      totalReleases: releases.length,
      scheduledReleases: scheduledReleasesCount,
      totalCampaigns: campaigns.length,
      activeCampaigns: activeCampaignsCount,
      totalProducts: products.length,
      totalContentItems: contentItems.length,
      upcomingContent: upcomingContentCount,
      totalFolders: folders.length,
      totalMilestones: milestones.length,
    },
    brandCore,
    products,
    latestRelease: releases[0] || null,
    latestProject: projects[0] || null,
    latestCampaign: campaigns[0] || null,
    activeCampaign: campaigns.find((c) => c.status === "active") || campaigns[0] || null,
    recentAssets: assets.slice(0, 6),
    upcomingContent: contentItems.slice(0, 5),
    creativeMemory: memory,
    unreadNotificationsCount: notifications.filter((n) => !n.read).length,
    recentActivity: activity.slice(0, 10),
    attentionItems,
    recommendations,
    milestones: milestones.slice(0, 5),
    pendingTasks: tasks.filter((t) => !t.completed).slice(0, 8),
    folders: folders.slice(0, 6),
  });
});

// --- Tasks Routes ---
apiRouter.get("/workspaces/:workspaceId/tasks", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const tasks = db.getTasks(req.params.workspaceId);
  res.json({ tasks });
});

apiRouter.post("/workspaces/:workspaceId/tasks", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { text, projectId, priority, deadline, category, assignedTo } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Task text is required" });
  }

  const task = db.createTask(req.params.workspaceId, {
    text,
    projectId,
    priority,
    deadline,
    category,
    assignedTo,
  });

  res.status(201).json({ task });
});

apiRouter.put("/workspaces/:workspaceId/tasks/:taskId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateTask(req.params.taskId, req.params.workspaceId, req.body);
    res.json({ task: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update task" });
  }
});

apiRouter.delete("/workspaces/:workspaceId/tasks/:taskId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteTask(req.params.taskId, req.params.workspaceId);
  if (!deleted) return res.status(404).json({ error: "Task not found" });
  res.json({ message: "Task deleted successfully" });
});

// --- Folders Routes ---
apiRouter.get("/workspaces/:workspaceId/folders", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const folders = db.getFolders(req.params.workspaceId);
  res.json({ folders });
});

apiRouter.post("/workspaces/:workspaceId/folders", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { name, color, icon, category } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Folder name is required" });
  }

  const folder = db.createFolder(req.params.workspaceId, {
    name,
    color: color || "#EF4444",
    icon: icon || "Folder",
    category,
  });

  res.status(201).json({ folder });
});

apiRouter.put("/workspaces/:workspaceId/folders/:folderId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateFolder(req.params.folderId, req.params.workspaceId, req.body);
    res.json({ folder: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update folder" });
  }
});

apiRouter.delete("/workspaces/:workspaceId/folders/:folderId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteFolder(req.params.folderId, req.params.workspaceId);
  if (!deleted) return res.status(404).json({ error: "Folder not found" });
  res.json({ message: "Folder deleted successfully" });
});

// --- Milestones Routes ---
apiRouter.get("/workspaces/:workspaceId/milestones", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const milestones = db.getMilestones(req.params.workspaceId, req.query.projectId as string | undefined);
  res.json({ milestones });
});

apiRouter.post("/workspaces/:workspaceId/milestones", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { title, targetDate, projectId, projectTitle, status, deliverables, notes, completed } = req.body;
  if (!title || !targetDate) {
    return res.status(400).json({ error: "Milestone title and target date are required" });
  }

  const milestone = db.createMilestone(req.params.workspaceId, {
    title,
    targetDate,
    projectId,
    projectTitle,
    status: status || "pending",
    deliverables: deliverables || [],
    notes: notes || "",
    completed: Boolean(completed),
  });

  res.status(201).json({ milestone });
});

apiRouter.put("/workspaces/:workspaceId/milestones/:milestoneId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateMilestone(req.params.milestoneId, req.params.workspaceId, req.body);
    res.json({ milestone: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update milestone" });
  }
});

apiRouter.delete("/workspaces/:workspaceId/milestones/:milestoneId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteMilestone(req.params.milestoneId, req.params.workspaceId);
  if (!deleted) return res.status(404).json({ error: "Milestone not found" });
  res.json({ message: "Milestone deleted successfully" });
});

// --- Global Search & Intelligent Dash Routes ---
apiRouter.get("/workspaces/:workspaceId/search", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const query = (req.query.q as string) || "";
  const results = db.searchWorkspace(req.params.workspaceId, query);
  res.json({ results });
});

apiRouter.get("/workspaces/:workspaceId/attention", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const attention = db.getAttentionItems(req.params.workspaceId);
  res.json({ attention });
});

apiRouter.get("/workspaces/:workspaceId/recommendations", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const recommendations = db.getRecommendations(req.params.workspaceId);
  res.json({ recommendations });
});

// --- Projects Routes ---
apiRouter.get("/workspaces/:workspaceId/projects", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const projects = db.getProjects(req.params.workspaceId);
  res.json({ projects });
});

apiRouter.post("/workspaces/:workspaceId/projects", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { title, description, category, status, priority, budget, currency, deadline, clientName, tags, tasks } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Project title is required" });
  }

  const project = db.createProject(req.params.workspaceId, {
    title,
    description: description || "",
    category: category || "Creative Production",
    status: status || "planning",
    priority: priority || "medium",
    budget: Number(budget) || 0,
    currency: currency || "USD",
    deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    clientName,
    tags: tags || [],
    tasks: tasks || [],
  });

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "CREATE_PROJECT",
    "project",
    project.id,
    `Created project '${project.title}'`
  );

  db.addNotification(
    req.params.workspaceId,
    `Project Created: ${project.title}`,
    `New project logged under category ${project.category}. Target deadline: ${project.deadline}`,
    "info",
    "project-console",
    req.user!.id
  );

  res.status(201).json({ project });
});

apiRouter.put("/workspaces/:workspaceId/projects/:projectId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateProject(req.params.projectId, req.params.workspaceId, req.body);
    db.logActivity(
      req.params.workspaceId,
      req.user!.id,
      req.user!.email,
      "UPDATE_PROJECT",
      "project",
      updated.id,
      `Updated project '${updated.title}' (${updated.status})`
    );
    res.json({ project: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update project" });
  }
});

apiRouter.delete("/workspaces/:workspaceId/projects/:projectId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteProject(req.params.projectId, req.params.workspaceId);
  if (!success) return res.status(404).json({ error: "Project not found" });
  res.json({ message: "Project deleted successfully" });
});

// --- Assets Routes ---
apiRouter.get("/workspaces/:workspaceId/assets", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const assets = db.getAssets(req.params.workspaceId);
  res.json({ assets });
});

apiRouter.post("/workspaces/:workspaceId/assets", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { name, category, url, size, mimeType, dimensions, tags, metadata, projectId, releaseId, folderId, folderName } = req.body;
  if (!name || !url) {
    return res.status(400).json({ error: "Asset name and file URL/data are required" });
  }

  const asset = db.createAsset(req.params.workspaceId, {
    name,
    category: category || "image",
    url,
    size: Number(size) || 0,
    mimeType: mimeType || "image/png",
    dimensions: dimensions || "3000x3000",
    tags: tags || [],
    metadata: metadata || {},
    projectId,
    releaseId,
    folderId,
    folderName,
  });

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "UPLOAD_ASSET",
    "asset",
    asset.id,
    `Saved asset '${asset.name}' to workspace (${asset.category})`
  );

  res.status(201).json({ asset });
});

apiRouter.delete("/workspaces/:workspaceId/assets/:assetId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteAsset(req.params.assetId, req.params.workspaceId);
  if (!success) return res.status(404).json({ error: "Asset not found" });
  res.json({ message: "Asset deleted successfully" });
});

// --- Releases Routes ---
apiRouter.get("/workspaces/:workspaceId/releases", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const releases = db.getReleases(req.params.workspaceId);
  res.json({ releases });
});

apiRouter.post("/workspaces/:workspaceId/releases", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { 
    title, artistName, genre, subgenres, releaseType, releaseDate, status, 
    coverUrl, coverAssetId, audioUrl, audioAssetId, phases, checklist, 
    dspPitch, presaveSlug, presaveData, lyrics, splits, epkData, 
    masterAudioDetails, upc, isrc, narrative, marketingBudget, currency, projectId 
  } = req.body;
  
  if (!title || !artistName) {
    return res.status(400).json({ error: "Track title and artist name are required" });
  }

  const release = db.createRelease(req.params.workspaceId, {
    title,
    artistName,
    genre: genre || "Afro-Fusion",
    subgenres: subgenres || [],
    releaseType: releaseType || "Single",
    releaseDate: releaseDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: status || "planning",
    coverUrl,
    coverAssetId,
    audioUrl,
    audioAssetId,
    phases: phases || [],
    checklist: checklist || [],
    dspPitch,
    presaveSlug,
    presaveData,
    lyrics,
    splits,
    epkData,
    masterAudioDetails,
    upc,
    isrc,
    narrative,
    marketingBudget,
    currency,
    projectId,
  });

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "CREATE_RELEASE",
    "release",
    release.id,
    `Created release '${release.title}' by ${release.artistName}`
  );

  db.addNotification(
    req.params.workspaceId,
    `New Release Scheduled: ${release.title}`,
    `Artist OS Workspace configured. Target drop date: ${release.releaseDate}`,
    "success",
    "artist-brain",
    req.user!.id
  );

  res.status(201).json({ release });
});

apiRouter.put("/workspaces/:workspaceId/releases/:releaseId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateRelease(req.params.releaseId, req.params.workspaceId, req.body);
    res.json({ release: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update release" });
  }
});

apiRouter.delete("/workspaces/:workspaceId/releases/:releaseId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteRelease(req.params.releaseId, req.params.workspaceId);
  if (!success) return res.status(404).json({ error: "Release not found" });
  res.json({ message: "Release deleted successfully" });
});

// --- Brand Core Routes ---
apiRouter.get("/workspaces/:workspaceId/brand-core", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const brandCore = db.getBrandCore(req.params.workspaceId);
  res.json({ brandCore });
});

apiRouter.put("/workspaces/:workspaceId/brand-core", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateBrandCore(req.params.workspaceId, req.body);
    res.json({ brandCore: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update brand core" });
  }
});

// --- Products & Services Routes ---
apiRouter.get("/workspaces/:workspaceId/products", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const products = db.getProducts(req.params.workspaceId);
  res.json({ products });
});

apiRouter.post("/workspaces/:workspaceId/products", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { name, type, tagline, description, category, pricing, targetAudience, keyFeatures, benefits, uniqueSellingPoints, heroImageUrl, status, launchDate } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Product name is required" });
  }

  const product = db.createProduct(req.params.workspaceId, {
    name,
    type: type || "product",
    tagline: tagline || "",
    description: description || "",
    category: category || "General",
    pricing: pricing || { amount: 0, currency: "USD", billingInterval: "one_time" },
    targetAudience: targetAudience || "",
    keyFeatures: keyFeatures || [],
    benefits: benefits || [],
    uniqueSellingPoints: uniqueSellingPoints || [],
    heroImageUrl: heroImageUrl || "",
    status: status || "draft",
    launchDate: launchDate || "",
  });

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "CREATE_PRODUCT",
    "product",
    product.id,
    `Added product: ${name}`
  );

  res.status(201).json({ product });
});

apiRouter.put("/workspaces/:workspaceId/products/:productId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateProduct(req.params.productId, req.params.workspaceId, req.body);
    res.json({ product: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update product" });
  }
});

apiRouter.delete("/workspaces/:workspaceId/products/:productId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteProduct(req.params.productId, req.params.workspaceId);
  if (!success) return res.status(404).json({ error: "Product not found" });
  res.json({ message: "Product deleted successfully" });
});

// --- Campaigns Routes ---
apiRouter.get("/workspaces/:workspaceId/campaigns", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const campaigns = db.getCampaigns(req.params.workspaceId);
  res.json({ campaigns });
});

apiRouter.post("/workspaces/:workspaceId/campaigns", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { title, goal, objective, productId, targetAudience, creativeDirection, heroAssetId, heroAssetUrl, startDate, endDate, status, platforms, sprintDays, milestones, approvals, goals, budget, currency } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Campaign title is required" });
  }

  const campaign = db.createCampaign(req.params.workspaceId, {
    title,
    goal: goal || objective || "",
    objective: objective || goal || "",
    productId: productId || undefined,
    targetAudience: targetAudience || "",
    creativeDirection: creativeDirection || { themeName: "Editorial & High-Impact", visualStyle: "Modern & Bold", coreMessage: "", heroHeadline: "", subHeadline: "", keyHashtags: [] },
    heroAssetId: heroAssetId || undefined,
    heroAssetUrl: heroAssetUrl || undefined,
    startDate: startDate || new Date().toISOString().split("T")[0],
    endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: status || "planning",
    platforms: platforms || ["Instagram", "TikTok", "LinkedIn"],
    sprintDays: sprintDays || [],
    milestones: milestones || [],
    approvals: approvals || { creativeApproved: false, budgetApproved: false, launchApproved: false },
    goals: goals || { targetImpressions: 50000, targetLeadsOrSales: 100, targetRevenue: 2500, actualImpressions: 0, actualLeadsOrSales: 0, actualRevenue: 0 },
    budget: Number(budget) || 0,
    currency: currency || "USD",
  });

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "CREATE_CAMPAIGN",
    "campaign",
    campaign.id,
    `Created campaign: ${title}`
  );

  res.status(201).json({ campaign });
});

apiRouter.put("/workspaces/:workspaceId/campaigns/:campaignId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateCampaign(req.params.campaignId, req.params.workspaceId, req.body);
    res.json({ campaign: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update campaign" });
  }
});

apiRouter.delete("/workspaces/:workspaceId/campaigns/:campaignId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteCampaign(req.params.campaignId, req.params.workspaceId);
  if (!success) return res.status(404).json({ error: "Campaign not found" });
  res.json({ message: "Campaign deleted successfully" });
});

// --- Content Pillars Routes ---
apiRouter.get("/workspaces/:workspaceId/content-pillars", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const pillars = db.getContentPillars(req.params.workspaceId);
  res.json({ contentPillars: pillars });
});

apiRouter.post("/workspaces/:workspaceId/content-pillars", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { name, description, color, icon, targetRatio } = req.body;
  if (!name) return res.status(400).json({ error: "Pillar name is required" });

  const pillar = db.createContentPillar(req.params.workspaceId, {
    name,
    description,
    color,
    icon,
    targetRatio: targetRatio !== undefined ? Number(targetRatio) : 20,
  });

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "CREATE_PILLAR",
    "content_pillar",
    pillar.id,
    `Added content pillar: "${name}"`
  );

  res.status(201).json({ contentPillar: pillar });
});

apiRouter.put("/workspaces/:workspaceId/content-pillars/:pillarId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateContentPillar(req.params.pillarId, req.params.workspaceId, req.body);
    res.json({ contentPillar: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update content pillar" });
  }
});

apiRouter.delete("/workspaces/:workspaceId/content-pillars/:pillarId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteContentPillar(req.params.pillarId, req.params.workspaceId);
  if (!success) return res.status(404).json({ error: "Content pillar not found" });
  res.json({ message: "Content pillar deleted successfully" });
});

// --- Content Items Routes ---
apiRouter.get("/workspaces/:workspaceId/content-items", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const contentItems = db.getContentItems(req.params.workspaceId);
  res.json({ contentItems });
});

apiRouter.post("/workspaces/:workspaceId/content-items", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { 
    title, platform, contentType, concept, hook, captionHook, copy, caption,
    soundSnippet, scheduledDate, scheduledTime, cta, notes, status, priority, 
    releaseId, releaseTitle, campaignId, campaignTitle, projectId, productId, productName,
    contentPillar, assetId, assetIds, aiMetadata 
  } = req.body;

  if (!title || !platform) {
    return res.status(400).json({ error: "Title and platform are required" });
  }

  const item = db.createContentItem(req.params.workspaceId, {
    title,
    platform,
    contentType: contentType || "Post",
    concept: concept || "",
    hook: hook || captionHook || "",
    captionHook: captionHook || hook || "",
    copy: copy || caption || "",
    caption: caption || copy || "",
    soundSnippet,
    scheduledDate: scheduledDate || new Date().toISOString().split("T")[0],
    scheduledTime: scheduledTime || "12:00",
    cta,
    notes,
    status: status || "idea",
    priority: priority || "MEDIUM",
    releaseId,
    releaseTitle,
    campaignId,
    campaignTitle,
    projectId,
    productId,
    productName,
    contentPillar,
    assetId,
    assetIds,
    aiMetadata,
  });

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "CREATE_CONTENT",
    "content_item",
    item.id,
    `Created ${platform} content: "${title}" (${status || 'idea'})`
  );

  res.status(201).json({ contentItem: item });
});

apiRouter.post("/workspaces/:workspaceId/content-items/batch", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items array is required" });
  }

  const createdItems = db.createContentItemsBatch(req.params.workspaceId, items);

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "BATCH_CREATE_CONTENT",
    "content_item",
    createdItems[0]?.id || "",
    `Batch created ${createdItems.length} content items`
  );

  res.status(201).json({ contentItems: createdItems });
});

apiRouter.post("/workspaces/:workspaceId/content-items/:itemId/duplicate", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  try {
    const duplicated = db.duplicateContentItem(req.params.itemId, req.params.workspaceId);
    db.logActivity(
      req.params.workspaceId,
      req.user!.id,
      req.user!.email,
      "DUPLICATE_CONTENT",
      "content_item",
      duplicated.id,
      `Duplicated content item: "${duplicated.title}"`
    );
    res.status(201).json({ contentItem: duplicated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to duplicate content item" });
  }
});

apiRouter.put("/workspaces/:workspaceId/content-items/:itemId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateContentItem(req.params.itemId, req.params.workspaceId, req.body);
    res.json({ contentItem: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update content item" });
  }
});

apiRouter.delete("/workspaces/:workspaceId/content-items/:itemId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteContentItem(req.params.itemId, req.params.workspaceId);
  if (!success) return res.status(404).json({ error: "Content item not found" });
  res.json({ message: "Content item deleted successfully" });
});

// --- Content Gap Radar & Intelligence Route ---
apiRouter.get("/workspaces/:workspaceId/content-gaps", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.params.workspaceId;
  const releases = db.getReleases(workspaceId);
  const campaigns = db.getCampaigns(workspaceId);
  const assets = db.getAssets(workspaceId);
  const contentItems = db.getContentItems(workspaceId);
  const pillars = db.getContentPillars(workspaceId);
  const brandCore = db.getBrandCore(workspaceId);

  const gaps: any[] = [];
  const qualityIssues: any[] = [];

  // 1. Release Gaps Check
  releases.forEach((rel) => {
    const relItems = contentItems.filter((c) => c.releaseId === rel.id);
    const relDate = rel.releaseDate ? new Date(rel.releaseDate) : null;
    const now = new Date();

    // Check Pre-Release
    const hasPreRelease = relItems.some((c) => {
      if (!c.scheduledDate || !relDate) return false;
      return new Date(c.scheduledDate) < relDate;
    });
    if (!hasPreRelease && relDate && relDate > now) {
      gaps.push({
        id: `gap_pre_${rel.id}`,
        type: 'release_content',
        title: `No Pre-Release Teaser for "${rel.title}"`,
        entityType: 'release',
        entityId: rel.id,
        entityTitle: rel.title,
        whatIsMissing: `Zero teaser, studio memo, or artwork reveal content scheduled before ${rel.releaseDate}.`,
        whyItMatters: `Pre-save and DSP editorial momentum require early creator sound waves and community anticipation at least 7-14 days prior to drop.`,
        whatToDoNext: `Schedule 2 teaser posts (Behind-The-Scenes studio clip and Cover Artwork reveal) to build momentum.`,
        priority: 'critical',
        suggestedPlatform: 'tiktok',
        suggestedContentType: 'Reel / Short Video',
        suggestedPillar: 'Behind The Scenes',
        suggestedDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        suggestedHook: `When the melody hits before you even write the words...`,
        suggestedConcept: `Studio mixing desk reaction as bassline drops with unreleased sound snippet.`,
        suggestedCta: `Pre-save link in bio`,
      });
    }

    // Check Launch Day
    const hasLaunchDay = relItems.some((c) => {
      if (!c.scheduledDate || !relDate) return false;
      return c.scheduledDate === rel.releaseDate;
    });
    if (!hasLaunchDay && relDate) {
      gaps.push({
        id: `gap_launch_${rel.id}`,
        type: 'release_content',
        title: `Missing Launch-Day Velocity Blast for "${rel.title}"`,
        entityType: 'release',
        entityId: rel.id,
        entityTitle: rel.title,
        whatIsMissing: `No official launch post scheduled on release date (${rel.releaseDate}).`,
        whyItMatters: `Streaming algorithms heavily weight Day-1 first-listen velocity and playlist saves within the first 24 hours of dropping.`,
        whatToDoNext: `Schedule an "Out Now Worldwide" multi-platform announcement with direct streaming links.`,
        priority: 'critical',
        suggestedPlatform: 'instagram',
        suggestedContentType: 'Out Now Announcement',
        suggestedPillar: 'Music & Drops',
        suggestedDate: rel.releaseDate,
        suggestedHook: `OUT NOW EVERYWHERE 🌍 Stream '${rel.title}' on all DSPs!`,
        suggestedConcept: `High-impact visual blast with kinetic typography snippet and direct streaming links.`,
        suggestedCta: `Stream now on Spotify, Apple Music & Audiomack`,
      });
    }

    // Check Post-Release
    const hasPostRelease = relItems.some((c) => {
      if (!c.scheduledDate || !relDate) return false;
      return new Date(c.scheduledDate) > relDate;
    });
    if (!hasPostRelease) {
      gaps.push({
        id: `gap_post_${rel.id}`,
        type: 'release_content',
        title: `Post-Release Momentum Coverage for "${rel.title}"`,
        entityType: 'release',
        entityId: rel.id,
        entityTitle: rel.title,
        whatIsMissing: `No follow-up content scheduled after drop week (acoustic take, fan reaction, producer breakdown).`,
        whyItMatters: `70% of long-tail streaming traction happens between Day 7 and Day 30 through lifestyle clips and creator audio adoption.`,
        whatToDoNext: `Plan a lyric breakdown or POV lifestyle clip for week 2.`,
        priority: 'high',
        suggestedPlatform: 'tiktok',
        suggestedContentType: 'POV Lifestyle / Audio Hook',
        suggestedPillar: 'Lifestyle & Culture',
        suggestedDate: relDate ? new Date(relDate.getTime() + 5 * 86400000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        suggestedHook: `This track was made for late night city drives.`,
        suggestedConcept: `Cinematic night drive clip showcasing the vibe of '${rel.title}'.`,
        suggestedCta: `Use this sound in your videos`,
      });
    }
  });

  // 2. Unused Vault Assets Check
  const attachedAssetIds = new Set<string>();
  contentItems.forEach((c) => {
    if (c.assetId) attachedAssetIds.add(c.assetId);
    if (Array.isArray(c.assetIds)) c.assetIds.forEach((id) => attachedAssetIds.add(id));
  });

  const unusedHighValueAssets = assets.filter((a) => !attachedAssetIds.has(a.id) && (a.category === 'cover' || a.category === 'audio' || a.category === 'epk'));
  if (unusedHighValueAssets.length > 0) {
    const topUnused = unusedHighValueAssets[0];
    gaps.push({
      id: `gap_asset_${topUnused.id}`,
      type: 'unused_asset',
      title: `Unactivated Vault Asset: "${topUnused.name}"`,
      entityType: 'asset',
      entityId: topUnused.id,
      entityTitle: topUnused.name,
      whatIsMissing: `High-fidelity ${topUnused.category} asset in Resource Vault has 0 connected content pieces.`,
      whyItMatters: `Every polished master asset created should be leveraged across visual reveals, teasers, or editorial pitches.`,
      whatToDoNext: `Instantiate a carousel or video spotlight utilizing this asset.`,
      priority: 'medium',
      suggestedAssetId: topUnused.id,
      suggestedPlatform: topUnused.category === 'cover' ? 'instagram' : 'tiktok',
      suggestedContentType: topUnused.category === 'cover' ? 'Artwork Spotlight' : 'Audio Snippet',
      suggestedPillar: 'Identity & Vibe',
      suggestedDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      suggestedHook: `The visual aesthetic behind the sound.`,
      suggestedConcept: `High-resolution visual breakdown of ${topUnused.name}.`,
      suggestedCta: `Check out the full release in bio`,
    });
  }

  // 3. Campaign Coverage Gaps
  campaigns.forEach((camp) => {
    const campItems = contentItems.filter((c) => c.campaignId === camp.id);
    if (campItems.length < 2) {
      gaps.push({
        id: `gap_camp_${camp.id}`,
        type: 'campaign_content',
        title: `Campaign "${camp.title}" Needs Content Pipeline`,
        entityType: 'campaign',
        entityId: camp.id,
        entityTitle: camp.title,
        whatIsMissing: `Campaign has only ${campItems.length} content items assigned.`,
        whyItMatters: `Structured campaigns require continuous touchpoints across target channels to achieve impression & conversion goals.`,
        whatToDoNext: `Generate a 3-part content sprint for this campaign.`,
        priority: 'high',
        suggestedPlatform: 'instagram',
        suggestedContentType: 'Campaign Spotlight',
        suggestedDate: camp.startDate || new Date().toISOString().split('T')[0],
        suggestedHook: `${camp.title}: Engineered for high impact.`,
        suggestedConcept: `Spotlight on the core value proposition and offering behind this campaign.`,
        suggestedCta: `Learn more via link in bio`,
      });
    }
  });

  // 4. Quality Audits
  contentItems.forEach((c) => {
    if (!c.hook && !c.captionHook) {
      qualityIssues.push({
        id: `qual_hook_${c.id}`,
        contentId: c.id,
        type: 'missing_hook',
        severity: 'warning',
        message: `Content "${c.title}" is missing a strong opening hook`,
        fixHint: `Add a 1-sentence hook to capture attention in the first 3 seconds.`,
      });
    }
    if (!c.cta) {
      qualityIssues.push({
        id: `qual_cta_${c.id}`,
        contentId: c.id,
        type: 'missing_cta',
        severity: 'suggestion',
        message: `"${c.title}" does not specify a clear Call-to-Action (CTA)`,
        fixHint: `Provide a direct action (e.g., 'Pre-save in bio', 'Stream on Spotify', 'Claim pre-order').`,
      });
    }
    if (!c.releaseId && !c.campaignId && !c.productId) {
      qualityIssues.push({
        id: `qual_rel_${c.id}`,
        contentId: c.id,
        type: 'missing_relationship',
        severity: 'suggestion',
        message: `"${c.title}" is unlinked (not connected to a Release, Campaign, or Product)`,
        fixHint: `Link this item to a release or campaign to maximize ecosystem compounding.`,
      });
    }
  });

  const scheduledCount = contentItems.filter((c) => c.status === 'scheduled').length;
  const publishedCount = contentItems.filter((c) => c.status === 'published').length;

  res.json({
    gaps,
    qualityIssues,
    summary: {
      totalContent: contentItems.length,
      scheduledCount,
      publishedCount,
      gapCount: gaps.length,
      qualityIssueCount: qualityIssues.length,
    }
  });
});

// --- AI Brain Content Opportunity Batch Generator ---
apiRouter.post("/workspaces/:workspaceId/content-items/generate-opportunity-batch", requireAuth, requireWorkspaceAccess, async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.params.workspaceId;
  const { stage, releaseId, campaignId, productId, platform, count = 3, customGoal } = req.body;

  const ws = db.getWorkspaceById(workspaceId);
  const memory = db.getCreativeMemory(workspaceId);
  const brandCore = db.getBrandCore(workspaceId);
  const releases = db.getReleases(workspaceId);
  const campaigns = db.getCampaigns(workspaceId);
  const products = db.getProducts(workspaceId);
  const assets = db.getAssets(workspaceId);
  const pillars = db.getContentPillars(workspaceId);

  const targetRelease = releaseId ? releases.find((r) => r.id === releaseId) : releases[0];
  const targetCampaign = campaignId ? campaigns.find((c) => c.id === campaignId) : campaigns[0];
  const targetProduct = productId ? products.find((p) => p.id === productId) : products[0];

  const brandName = brandCore?.brandName || ws?.name || "Keedohub Creator";
  const identityType = ws?.identityType || "artist";
  const releaseTitle = targetRelease?.title || (identityType === "artist" ? "Upcoming Single" : "");
  const releaseDate = targetRelease?.releaseDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  const suggestions: any[] = [];

  // Deterministic high-craft templates with contextual dynamic synthesis
  if (stage === 'pre-release' || (!stage && identityType === 'artist')) {
    suggestions.push({
      title: `${releaseTitle ? `'${releaseTitle}' ` : ''}Studio Late Night Vocal & Bassline Memo`,
      platform: platform || 'tiktok',
      contentType: 'Reel / Short Video',
      contentPillar: pillars.find((p) => p.name.includes("Behind") || p.name.includes("Process"))?.name || "Behind The Scenes",
      hook: "When the rhythm hits before you even write the words...",
      captionHook: "When the rhythm hits before you even write the words... Out soon! Pre-save in bio 🎵",
      copy: `We spent hours rebuilding the bass groove until 3 AM. When the vocal pocket locked in, we knew this had to be the lead single.\n\n'${releaseTitle || 'New Track'}' drops ${releaseDate}.\n\nPre-save link active now in bio 🔗\n#StudioVibes #${brandName.replace(/\s+/g, '')} #NewMusicDrop`,
      cta: "Pre-save via link in bio",
      soundSnippet: "Verse 1 intro pocket (0:00 - 0:15)",
      releaseId: targetRelease?.id,
      releaseTitle: targetRelease?.title,
      campaignId: targetCampaign?.id,
      campaignTitle: targetCampaign?.title,
      assetId: targetRelease?.coverAssetId || assets.find((a) => a.category === 'cover')?.id,
      scheduledDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      scheduledTime: "18:30",
      status: "idea",
      priority: "CRITICAL",
      aiMetadata: {
        generatedByBrain: true,
        stage: "pre-release",
        suggestedReason: `Build pre-release sonic anticipation for ${releaseTitle || 'upcoming drop'}.`,
      }
    });

    suggestions.push({
      title: `3D Master Artwork & Packaging Reveal`,
      platform: platform || 'instagram',
      contentType: 'Carousel / Visual Reveal',
      contentPillar: pillars.find((p) => p.name.includes("Identity") || p.name.includes("Vibe"))?.name || "Identity & Vibe",
      hook: `The official visual identity of '${releaseTitle || 'our new era'}'.`,
      captionHook: `Official Artwork for '${releaseTitle || 'New Drop'}'. Swipe to explore details.`,
      copy: `Crafted with uncompromising visual fidelity. Every texture on this 3000x3000px master artwork reflects the energy of this project.\n\nDrop a 💿 if you have your notifications turned on.\n\n#CoverArtwork #VisualDirection #${brandName.replace(/\s+/g, '')}`,
      cta: "Comment your favorite detail below",
      releaseId: targetRelease?.id,
      releaseTitle: targetRelease?.title,
      assetId: targetRelease?.coverAssetId || assets.find((a) => a.category === 'cover')?.id,
      scheduledDate: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
      scheduledTime: "19:00",
      status: "idea",
      priority: "HIGH",
      aiMetadata: {
        generatedByBrain: true,
        stage: "pre-release",
        suggestedReason: `Activate visual aesthetic milestone and drive Instagram save/share actions.`,
      }
    });

    suggestions.push({
      title: `Fan Chorus Duet & Vocal Stems Challenge`,
      platform: platform || 'tiktok',
      contentType: 'Interactive Duet / Sound Hook',
      contentPillar: pillars.find((p) => p.name.includes("Community") || p.name.includes("Music"))?.name || "Community & Superfans",
      hook: "Sing or rap the second verse with me 🎙️",
      captionHook: "Open verse challenge for the unreleased track! Best duet gets featured on drop week.",
      copy: `Leaving this 16-bar pocket completely open. Show me what you hear on this groove.\n\nTap 'Use Sound' and duet this video!\n\n#OpenVerse #AfrobeatsDuet #DuetThis`,
      cta: "Tap Use Sound to duet this clip",
      soundSnippet: "Chorus + 16 Bar Open Pocket",
      releaseId: targetRelease?.id,
      releaseTitle: targetRelease?.title,
      scheduledDate: new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0],
      scheduledTime: "17:00",
      status: "idea",
      priority: "MEDIUM",
      aiMetadata: {
        generatedByBrain: true,
        stage: "pre-release",
        suggestedReason: `Drive user-generated sound creation and community engagement before drop day.`,
      }
    });
  } else if (stage === 'launch') {
    suggestions.push({
      title: `OUT NOW Everywhere: '${releaseTitle || 'Drop Day'}' Official Streaming Blast`,
      platform: platform || 'instagram',
      contentType: 'Launch Announcement Video',
      contentPillar: pillars.find((p) => p.name.includes("Music") || p.name.includes("Product"))?.name || "Music & Drops",
      hook: `IT'S MIDNIGHT. '${releaseTitle || 'The Project'}' IS OFFICIALLY OUT NOW 🌍`,
      captionHook: `'${releaseTitle || 'The Track'}' is out now on Spotify, Apple Music & all platforms!`,
      copy: `The wait is over. '${releaseTitle || 'Our new work'}' is streaming everywhere worldwide.\n\nThank you to everyone who supported through the making of this project.\n\nListen, add to your favorite playlist, and share with someone who needs this vibe today.\n\n#OutNow #NewRelease #${brandName.replace(/\s+/g, '')}`,
      cta: "Stream now via link in bio",
      releaseId: targetRelease?.id,
      releaseTitle: targetRelease?.title,
      campaignId: targetCampaign?.id,
      campaignTitle: targetCampaign?.title,
      assetId: targetRelease?.coverAssetId || assets[0]?.id,
      scheduledDate: releaseDate,
      scheduledTime: "00:01",
      status: "idea",
      priority: "CRITICAL",
      aiMetadata: {
        generatedByBrain: true,
        stage: "launch",
        suggestedReason: "Mandatory Day-1 streaming algorithmic surge.",
      }
    });

    suggestions.push({
      title: `Official Kinetic Lyrics & Visualizer Premiere on YouTube`,
      platform: platform || 'youtube',
      contentType: 'Kinetic Lyric Video (.LRC)',
      contentPillar: pillars.find((p) => p.name.includes("Music"))?.name || "Music & Drops",
      hook: `Watch the full official synchronized lyrics visualizer now.`,
      captionHook: `Full official kinetic lyric visualizer playing now on YouTube!`,
      copy: `Sing along with every word. Full official lyric video for '${releaseTitle || 'the track'}' is live now on our official channel.\n\nDrop a comment with your favorite line!\n\n#LyricVideo #${brandName.replace(/\s+/g, '')}`,
      cta: "Watch full visualizer on YouTube",
      releaseId: targetRelease?.id,
      releaseTitle: targetRelease?.title,
      scheduledDate: releaseDate,
      scheduledTime: "12:00",
      status: "idea",
      priority: "HIGH",
      aiMetadata: {
        generatedByBrain: true,
        stage: "launch",
        suggestedReason: "Long-form search & lyric indexing on YouTube.",
      }
    });
  } else {
    // Post-release / Sprint / Evergreen
    suggestions.push({
      title: `POV: Late Night Drive Listening Experience`,
      platform: platform || 'tiktok',
      contentType: 'POV Lifestyle Clip',
      contentPillar: pillars.find((p) => p.name.includes("Lifestyle") || p.name.includes("Culture"))?.name || "Lifestyle & Culture",
      hook: "This track was literally recorded for late night highway drives.",
      captionHook: "Lagos at 4 AM hits different with this track playing. Save this sound 🏎️",
      copy: `Driving through the city lights with '${releaseTitle || 'this track'}' playing.\n\nSave this sound to your favorites.\n\n#NightDrive #CityVibes #${brandName.replace(/\s+/g, '')}`,
      cta: "Save and use this sound in your clips",
      soundSnippet: "Chorus & Drop (0:45 - 1:15)",
      releaseId: targetRelease?.id,
      releaseTitle: targetRelease?.title,
      scheduledDate: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
      scheduledTime: "21:00",
      status: "idea",
      priority: "MEDIUM",
      aiMetadata: {
        generatedByBrain: true,
        stage: "post-release",
        suggestedReason: "Cultivate long-tail lifestyle sound virality.",
      }
    });

    if (targetProduct) {
      suggestions.push({
        title: `Collector Showcase: ${targetProduct.name}`,
        platform: platform || 'instagram',
        contentType: 'Product Reel / Showcase',
        contentPillar: pillars.find((p) => p.name.includes("Community") || p.name.includes("Product"))?.name || "Community & Superfans",
        hook: `Crafted for collectors. Inside the ${targetProduct.name}.`,
        captionHook: `Limited physical editions of ${targetProduct.name} are shipping now.`,
        copy: `Engineered for pure craftsmanship. Includes master quality materials, custom packaging, and exclusive access.\n\nSecure yours via the link in bio.\n\n#CollectorEdition #${brandName.replace(/\s+/g, '')}`,
        cta: "Order via link in bio",
        productId: targetProduct.id,
        productName: targetProduct.name,
        scheduledDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        scheduledTime: "16:00",
        status: "idea",
        priority: "HIGH",
        aiMetadata: {
          generatedByBrain: true,
          stage: "post-release",
          suggestedReason: "Superfan physical merchandise monetization.",
        }
      });
    }
  }

  res.json({ suggestions: suggestions.slice(0, count) });
});

// --- Creative Memory Routes (Phase 8 Multi-Scope Creative Memory System) ---
apiRouter.get("/workspaces/:workspaceId/creative-memory", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const memory = db.getCreativeMemory(req.params.workspaceId);
  res.json({ creativeMemory: memory });
});

apiRouter.put("/workspaces/:workspaceId/creative-memory", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateCreativeMemory(req.params.workspaceId, req.body);
    db.logActivity(
      req.params.workspaceId,
      req.user!.id,
      req.user!.email,
      "UPDATE_MEMORY",
      "creative_memory",
      updated.id,
      "Updated workspace creative memory & brand identity tokens"
    );
    res.json({ creativeMemory: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update creative memory" });
  }
});

// Phase 8: Get Scoped Structured Memory Items
apiRouter.get("/workspaces/:workspaceId/memory/items", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { category, scope, status, entityType, entityId, search } = req.query as Record<string, string>;
  const items = db.getCreativeMemoryItems(req.params.workspaceId, {
    category: category as CreativeMemoryCategory,
    scope: scope as CreativeMemoryScope,
    status: status as any,
    entityType: entityType as any,
    entityId,
    search,
  });
  res.json({ items });
});

// Phase 8: Create Structured Memory Item
apiRouter.post("/workspaces/:workspaceId/memory/items", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { title, content, category, scope, entityType, entityId, entityName, tags, source, confidence, isPinned } = req.body;
  if (!content || !category) {
    return res.status(400).json({ error: "Content and category are required" });
  }

  const memoryItem = db.createCreativeMemoryItem(req.params.workspaceId, {
    userId: req.user!.id,
    title: title || `${category.toUpperCase()}: ${content.substring(0, 40)}...`,
    content,
    category,
    scope: scope || "workspace",
    entityType,
    entityId,
    entityName,
    tags: tags || [],
    source: source || "user_explicit",
    confidence: confidence !== undefined ? confidence : 100,
    status: "active",
    isPinned: Boolean(isPinned),
  });

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "CREATE_MEMORY_ITEM",
    "creative_memory",
    memoryItem.id,
    `Added memory item: "${memoryItem.title}"`
  );

  res.status(201).json({ item: memoryItem });
});

// Phase 8: Update Structured Memory Item
apiRouter.put("/workspaces/:workspaceId/memory/items/:itemId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateCreativeMemoryItem(req.params.itemId, req.params.workspaceId, req.body);
  if (!updated) {
    return res.status(404).json({ error: "Memory item not found" });
  }

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "UPDATE_MEMORY_ITEM",
    "creative_memory",
    updated.id,
    `Updated memory item: "${updated.title}"`
  );

  res.json({ item: updated });
});

// Phase 8: Delete Structured Memory Item
apiRouter.delete("/workspaces/:workspaceId/memory/items/:itemId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteCreativeMemoryItem(req.params.itemId, req.params.workspaceId);
  if (!success) {
    return res.status(404).json({ error: "Memory item not found" });
  }

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "DELETE_MEMORY_ITEM",
    "creative_memory",
    req.params.itemId,
    `Deleted memory item ${req.params.itemId}`
  );

  res.json({ success: true });
});

// Phase 8: Supersede Memory Item (Evolution Handling)
apiRouter.post("/workspaces/:workspaceId/memory/items/:itemId/supersede", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { title, content, category, tags, reason } = req.body;
  if (!content) {
    return res.status(400).json({ error: "New memory content is required to supersede" });
  }

  const existing = db.getCreativeMemoryItemById(req.params.workspaceId, req.params.itemId);
  if (!existing) {
    return res.status(404).json({ error: "Target memory item not found or unauthorized" });
  }

  const result = db.supersedeCreativeMemory(req.params.workspaceId, req.params.itemId, {
    userId: req.user!.id,
    title: title || `${existing.title} (Updated)`,
    content,
    category: category || existing.category,
    scope: existing.scope,
    entityType: existing.entityType,
    entityId: existing.entityId,
    entityName: existing.entityName,
    tags: tags || existing.tags,
    source: "user_explicit",
    confidence: existing.confidence || 95,
    status: "active",
    isPinned: existing.isPinned,
    metadata: {
      supersedeReason: reason || "Creative evolution",
      previousVersionId: req.params.itemId,
    },
  });

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "SUPERSEDE_MEMORY",
    "creative_memory",
    result.newMemory.id,
    `Superseded memory item ${req.params.itemId} with new evolution "${result.newMemory.title}"`
  );

  res.status(201).json({ item: result.newMemory, oldItem: result.oldMemory });
});

// Phase 8: Pin / Unpin Memory Item
apiRouter.post("/workspaces/:workspaceId/memory/items/:itemId/pin", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const isPinned = Boolean(req.body.isPinned);
  const updated = db.updateCreativeMemoryItem(req.params.workspaceId, req.params.itemId, { isPinned });
  if (!updated) {
    return res.status(404).json({ error: "Memory item not found" });
  }
  res.json({ item: updated });
});

// Phase 8: Memory Candidates (AI Proposed Knowledge)
apiRouter.get("/workspaces/:workspaceId/memory/candidates", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const candidates = db.getMemoryCandidates(req.params.workspaceId);
  res.json({ candidates });
});

apiRouter.post("/workspaces/:workspaceId/memory/candidates/:candidateId/resolve", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { action, editedData } = req.body; // action: 'approve' | 'reject' | 'edit'
  if (!action || !['approve', 'reject', 'edit', 'save', 'dismiss'].includes(action)) {
    return res.status(400).json({ error: "Valid action ('approve' | 'reject' | 'edit') is required" });
  }

  const dbAction = (action === 'reject' || action === 'dismiss') ? 'dismiss' : 'save';
  const result = db.resolveMemoryCandidate(req.params.workspaceId, req.params.candidateId, dbAction, editedData);
  if (!result) {
    return res.status(404).json({ error: "Candidate not found or already resolved" });
  }

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "RESOLVE_MEMORY_CANDIDATE",
    "creative_memory",
    req.params.candidateId,
    `Resolved AI memory candidate: ${action}`
  );

  res.json({ success: true, createdItem: result.savedMemory, candidate: result.candidate });
});

// Phase 8: Memory Block Rules (Privacy & Exclusions)
apiRouter.get("/workspaces/:workspaceId/memory/block-rules", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const rules = db.getMemoryBlockRules(req.params.workspaceId);
  res.json({ rules });
});

apiRouter.post("/workspaces/:workspaceId/memory/block-rules", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { pattern, reason } = req.body;
  if (!pattern) {
    return res.status(400).json({ error: "Pattern/keyword is required" });
  }

  const rule = db.createMemoryBlockRule(req.params.workspaceId, {
    pattern,
    reason: reason || 'User specified exclusion rule',
  });

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "CREATE_MEMORY_BLOCK_RULE",
    "creative_memory",
    rule.id,
    `Created memory block rule for pattern: "${pattern}"`
  );

  res.status(201).json({ rule });
});

apiRouter.delete("/workspaces/:workspaceId/memory/block-rules/:ruleId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteMemoryBlockRule(req.params.ruleId, req.params.workspaceId);
  if (!success) {
    return res.status(404).json({ error: "Block rule not found" });
  }
  res.json({ success: true });
});

// Phase 8: Targeted Memory Retrieval Test & Verification
apiRouter.post("/workspaces/:workspaceId/memory/retrieve", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { query, category, scope, entityType, entityId, limit } = req.body;
  const result = MemoryRetrievalService.retrieve(req.params.workspaceId, {
    query,
    category,
    scope,
    entityType,
    entityId,
    limit: limit || 10,
  });
  res.json(result);
});

// --- Notifications & Activity Routes ---
apiRouter.get("/workspaces/:workspaceId/notifications", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const notifications = db.getNotifications(req.params.workspaceId, req.user?.id);
  res.json({ notifications });
});

apiRouter.post("/workspaces/:workspaceId/notifications/:notifId/read", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const success = db.markNotificationRead(req.params.notifId, req.params.workspaceId);
  res.json({ success });
});

apiRouter.get("/workspaces/:workspaceId/activity-logs", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const activityLogs = db.getActivityLogs(req.params.workspaceId);
  res.json({ activityLogs });
});

// --- Creative Studio Service Brief Requests ---
apiRouter.get("/workspaces/:workspaceId/creative-requests", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const requests = db.getCreativeRequests(req.params.workspaceId);
  res.json({ requests });
});

apiRouter.post("/workspaces/:workspaceId/creative-requests", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { serviceId, serviceName, budget, currency, deadline, briefDetails } = req.body;
  if (!serviceName || !briefDetails) {
    return res.status(400).json({ error: "Service name and brief details are required" });
  }

  const creativeRequest = db.createCreativeRequest(req.params.workspaceId, {
    userId: req.user!.id,
    serviceId: serviceId || "custom-studio-request",
    serviceName,
    budget: Number(budget) || 0,
    currency: currency || "USD",
    deadline: deadline || "Flexible",
    briefDetails,
    status: "pending",
  });

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "SUBMIT_STUDIO_BRIEF",
    "creative_request",
    creativeRequest.id,
    `Submitted custom studio request for '${serviceName}'`
  );

  res.status(201).json({ request: creativeRequest });
});

// ==========================================
// PHASE 7: KEEDOHUB STUDIO PRODUCTION ROUTES
// ==========================================

// 1. Studio Requests
apiRouter.get("/workspaces/:workspaceId/studio/requests", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const requests = db.getStudioRequests(req.params.workspaceId);
  res.json({ requests });
});

apiRouter.post("/workspaces/:workspaceId/studio/requests", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { serviceId, serviceName, title, brief, origin, releaseId, releaseTitle, campaignId, campaignTitle } = req.body;
  
  if (!serviceId || !serviceName || !title || !brief) {
    return res.status(400).json({ error: "serviceId, serviceName, title, and brief are required" });
  }

  const newRequest = db.createStudioRequest(req.params.workspaceId, {
    userId: req.user!.id,
    serviceId,
    serviceName,
    title,
    origin: origin || "direct",
    releaseId,
    releaseTitle,
    campaignId,
    campaignTitle,
    brief,
    status: "REQUEST",
  });

  // Auto-generate realistic quote draft for fast interactive testing
  const estimatedPrice = brief.targetBudget || (
    serviceId === "brand_identity" ? 450 :
    serviceId === "cover_design" ? 280 :
    serviceId === "web_ui_ux" ? 650 :
    serviceId === "motion_animation" ? 380 :
    serviceId === "social_media" ? 220 : 300
  );

  const quote = db.createStudioQuote(req.params.workspaceId, {
    requestId: newRequest.id,
    serviceName: `${serviceName} Production Suite`,
    scopeSummary: `Full end-to-end creative production for "${title}". Includes initial concept exploration, hi-res master rendering, and full commercial copyright transfer.`,
    deliverables: brief.requiredDeliverables && brief.requiredDeliverables.length > 0 
      ? brief.requiredDeliverables 
      : ["Master Hi-Res Asset Package", "Social Format Cuts", "Source Files & Commercial License"],
    price: estimatedPrice,
    currency: brief.currency || "USD",
    timeline: serviceId === "cover_design" ? "48-72 Hours" : "3-5 Business Days",
    revisionAllowance: 3,
    notes: "Keedohub Studio Lead Producer assigned. 100% satisfaction guarantee with structured revision cycles.",
    expirationDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    status: "SENT",
  });

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "CREATE_STUDIO_REQUEST",
    "studio_request",
    newRequest.id,
    `Submitted Studio request for '${title}' (${serviceName})`
  );

  db.addNotification(
    req.params.workspaceId,
    "Studio Request & Quote Ready",
    `Your request for '${title}' has been received and Quote #${quote.id.substring(0, 8)} is ready for your review.`,
    "request",
    "studio",
    req.user!.id
  );

  res.status(201).json({ request: newRequest, quote });
});

apiRouter.get("/workspaces/:workspaceId/studio/requests/:requestId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const request = db.getStudioRequestById(req.params.requestId);
  if (!request || request.workspaceId !== req.params.workspaceId) {
    return res.status(404).json({ error: "Studio request not found" });
  }
  res.json({ request });
});

apiRouter.put("/workspaces/:workspaceId/studio/requests/:requestId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateStudioRequest(req.params.workspaceId, req.params.requestId, req.body);
    res.json({ request: updated });
  } catch (err: any) {
    res.status(404).json({ error: err.message || "Failed to update request" });
  }
});

apiRouter.delete("/workspaces/:workspaceId/studio/requests/:requestId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteStudioRequest(req.params.workspaceId, req.params.requestId);
  if (!deleted) return res.status(404).json({ error: "Request not found" });
  res.json({ success: true });
});

// 2. Studio Quotes
apiRouter.get("/workspaces/:workspaceId/studio/quotes", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const requestId = typeof req.query.requestId === "string" ? req.query.requestId : undefined;
  const quotes = db.getStudioQuotes(req.params.workspaceId, requestId);
  res.json({ quotes });
});

apiRouter.post("/workspaces/:workspaceId/studio/quotes", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const quote = db.createStudioQuote(req.params.workspaceId, req.body);
  res.status(201).json({ quote });
});

apiRouter.post("/workspaces/:workspaceId/studio/quotes/:quoteId/status", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { status, approvedBy, declinedReason, clarificationNotes } = req.body;
  if (!status) return res.status(400).json({ error: "Status is required" });

  try {
    const result = db.updateStudioQuoteStatus(req.params.workspaceId, req.params.quoteId, status, {
      approvedBy,
      declinedReason,
      clarificationNotes,
    });

    if (status === "APPROVED") {
      db.logActivity(
        req.params.workspaceId,
        req.user!.id,
        req.user!.email,
        "APPROVE_STUDIO_QUOTE",
        "studio_quote",
        req.params.quoteId,
        `Approved quote for '${result.quote.serviceName}' ($${result.quote.price})`
      );

      db.addNotification(
        req.params.workspaceId,
        "Studio Project Activated",
        `Quote approved! Project '${result.project?.title || result.quote.serviceName}' is now active in Keedohub Studio production.`,
        "success",
        "studio",
        req.user!.id
      );
    } else if (status === "DECLINED") {
      db.logActivity(
        req.params.workspaceId,
        req.user!.id,
        req.user!.email,
        "DECLINE_STUDIO_QUOTE",
        "studio_quote",
        req.params.quoteId,
        `Declined quote #${req.params.quoteId}`
      );
    }

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update quote status" });
  }
});

// 3. Studio Projects
apiRouter.get("/workspaces/:workspaceId/studio/projects", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const projects = db.getStudioProjects(req.params.workspaceId);
  res.json({ projects });
});

apiRouter.get("/workspaces/:workspaceId/studio/projects/:projectId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const project = db.getStudioProjectById(req.params.projectId);
  if (!project || project.workspaceId !== req.params.workspaceId) {
    return res.status(404).json({ error: "Studio project not found" });
  }
  res.json({ project });
});

apiRouter.put("/workspaces/:workspaceId/studio/projects/:projectId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateStudioProject(req.params.workspaceId, req.params.projectId, req.body);
    res.json({ project: updated });
  } catch (err: any) {
    res.status(404).json({ error: err.message || "Failed to update project" });
  }
});

// 4. Studio Deliverables
apiRouter.get("/workspaces/:workspaceId/studio/deliverables", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
  const deliverables = db.getStudioDeliverables(req.params.workspaceId, projectId);
  res.json({ deliverables });
});

apiRouter.post("/workspaces/:workspaceId/studio/deliverables", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { projectId, name, description, format, version, dueDate, previewUrl, assetUrl } = req.body;
  if (!projectId || !name) return res.status(400).json({ error: "projectId and name are required" });

  const deliverable = db.createStudioDeliverable(req.params.workspaceId, projectId, {
    name,
    description: description || "",
    format: format || "Master Asset",
    version: version || "V1",
    status: "ready_for_review",
    dueDate: dueDate || new Date().toISOString().split("T")[0],
    previewUrl,
    assetUrl,
    approvalStatus: "pending",
  });

  res.status(201).json({ deliverable });
});

apiRouter.put("/workspaces/:workspaceId/studio/deliverables/:deliverableId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateStudioDeliverable(req.params.workspaceId, req.params.deliverableId, req.body);
    res.json({ deliverable: updated });
  } catch (err: any) {
    res.status(404).json({ error: err.message || "Failed to update deliverable" });
  }
});

// Sync approved Studio deliverable directly to Workspace Asset Vault
apiRouter.post("/workspaces/:workspaceId/studio/deliverables/:deliverableId/sync-to-vault", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const deliverables = db.getStudioDeliverables(req.params.workspaceId);
  const del = deliverables.find((d) => d.id === req.params.deliverableId);
  if (!del) return res.status(404).json({ error: "Deliverable not found" });

  // Map category
  const category: AssetCategory = del.name.toLowerCase().includes("cover") || del.name.toLowerCase().includes("artwork")
    ? "cover"
    : del.name.toLowerCase().includes("logo") || del.name.toLowerCase().includes("brand")
    ? "brand"
    : del.name.toLowerCase().includes("video") || del.name.toLowerCase().includes("motion")
    ? "video"
    : "image";

  const asset = db.createAsset(req.params.workspaceId, {
    name: del.name,
    category,
    url: del.assetUrl || del.previewUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
    size: del.fileSize || 3500000,
    mimeType: del.format?.toLowerCase().includes("mp4") ? "video/mp4" : "image/png",
    dimensions: "3000x3000px",
    tags: ["studio-delivered", "approved", category],
    metadata: {
      projectId: del.projectId,
      deliverableId: del.id,
      version: del.version || "V1",
      deliveredBy: "Keedohub Studio",
      approvedBy: req.user!.email,
      approvedAt: new Date().toISOString(),
    },
  });

  db.updateStudioDeliverable(req.params.workspaceId, del.id, {
    assetId: asset.id,
    approvalStatus: "approved",
    status: "delivered",
    deliveredAt: new Date().toISOString(),
  });

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "SYNC_STUDIO_DELIVERABLE_TO_VAULT",
    "asset",
    asset.id,
    `Archived Studio deliverable '${del.name}' into Asset Vault`
  );

  res.json({ success: true, asset });
});

// 5. Studio Revisions
apiRouter.get("/workspaces/:workspaceId/studio/revisions", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
  const deliverableId = typeof req.query.deliverableId === "string" ? req.query.deliverableId : undefined;
  const revisions = db.getStudioRevisions(req.params.workspaceId, projectId, deliverableId);
  res.json({ revisions });
});

apiRouter.post("/workspaces/:workspaceId/studio/revisions", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { projectId, deliverableId, deliverableName, version, reason, requestedChanges } = req.body;
  if (!projectId || !deliverableId || !requestedChanges) {
    return res.status(400).json({ error: "projectId, deliverableId, and requestedChanges are required" });
  }

  const revision = db.createStudioRevision(req.params.workspaceId, {
    projectId,
    deliverableId,
    deliverableName: deliverableName || "Studio Deliverable",
    userId: req.user!.id,
    version: version || "V1",
    reason: reason || "Adjustment requested",
    requestedChanges,
    status: "OPEN",
  });

  // Post automatic studio message notification
  db.createStudioMessage(req.params.workspaceId, {
    projectId,
    senderId: req.user!.id,
    senderName: req.user!.fullName || req.user!.email,
    senderRole: "client",
    content: `[Revision Logged for ${revision.deliverableName}] Reason: ${reason}. Changes requested: ${requestedChanges}`,
  });

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "LOG_STUDIO_REVISION",
    "studio_revision",
    revision.id,
    `Logged revision for '${revision.deliverableName}'`
  );

  res.status(201).json({ revision });
});

apiRouter.put("/workspaces/:workspaceId/studio/revisions/:revisionId/status", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status is required" });

  try {
    const updated = db.updateStudioRevisionStatus(req.params.workspaceId, req.params.revisionId, status);
    res.json({ revision: updated });
  } catch (err: any) {
    res.status(404).json({ error: err.message || "Failed to update revision" });
  }
});

// 6. Studio Messages
apiRouter.get("/workspaces/:workspaceId/studio/messages", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
  const requestId = typeof req.query.requestId === "string" ? req.query.requestId : undefined;
  const messages = db.getStudioMessages(req.params.workspaceId, projectId, requestId);
  res.json({ messages });
});

apiRouter.post("/workspaces/:workspaceId/studio/messages", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { projectId, requestId, content, attachments } = req.body;
  if (!content) return res.status(400).json({ error: "Message content is required" });

  const msg = db.createStudioMessage(req.params.workspaceId, {
    projectId,
    requestId,
    senderId: req.user!.id,
    senderName: req.user!.fullName || req.user!.email,
    senderRole: "client",
    content,
    attachments,
  });

  res.status(201).json({ message: msg });
});

// 7. AI-Assisted Brief Optimizer & Clarification Engine
apiRouter.post("/workspaces/:workspaceId/studio/ai-brief-assist", requireAuth, requireWorkspaceAccess, async (req: AuthenticatedRequest, res: Response) => {
  const { serviceCategory, draftBrief } = req.body;
  const memory = db.getCreativeMemory(req.params.workspaceId);
  const brandCore = db.getBrandCore(req.params.workspaceId);

  try {
    let aiResponse = {
      refinedConcept: draftBrief?.concept || "High-impact creative execution tailored to your audience.",
      suggestedVisualDirection: draftBrief?.visualDirection || (memory?.visualRules?.join(", ") || "High-contrast dark modern aesthetic with bold accent highlights."),
      suggestedDeliverables: draftBrief?.requiredDeliverables || [
        "Master High-Res Package (300 DPI)",
        "Digital Social Formats (Feed, Story)",
        "Raw Working Files (PSD / Figma)"
      ],
      missingElements: [] as string[],
      clarifyingQuestions: [
        "What is the primary mood or emotion your audience should feel within the first 2 seconds?",
        "Are there any specific color codes or typography constraints we must strictly follow?",
        "Do you require custom 3D motion assets alongside the static deliverable?"
      ],
      estimatedDays: serviceCategory === "cover_design" ? "2-3 days" : "4-6 days",
      confidenceScore: 94,
    };

    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are the Executive Creative Director of Keedohub Studio, assisting a creator with their professional creative brief.
Workspace Identity:
- Name: ${brandCore?.brandName || "Creative Workspace"}
- Narrative: ${memory?.coreNarrative || "Modern Cultural Artistry"}
- Tone: ${memory?.toneTraits?.join(", ") || "Bold, Magnetic"}
- Service Category: ${serviceCategory}
- Current Brief Details: ${JSON.stringify(draftBrief || {})}

Analyze the brief and output strict JSON with:
{
  "refinedConcept": "string (clear, inspiring 2-sentence creative angle)",
  "suggestedVisualDirection": "string (concrete lighting, palette, framing guidance)",
  "suggestedDeliverables": ["string", "string", "string"],
  "missingElements": ["string (e.g. Dimensions not specified, Reference links missing)"],
  "clarifyingQuestions": ["string", "string", "string"],
  "estimatedDays": "string"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      aiResponse = {
        refinedConcept: parsed.refinedConcept || aiResponse.refinedConcept,
        suggestedVisualDirection: parsed.suggestedVisualDirection || aiResponse.suggestedVisualDirection,
        suggestedDeliverables: parsed.suggestedDeliverables || aiResponse.suggestedDeliverables,
        missingElements: parsed.missingElements || [],
        clarifyingQuestions: parsed.clarifyingQuestions || aiResponse.clarifyingQuestions,
        estimatedDays: parsed.estimatedDays || aiResponse.estimatedDays,
        confidenceScore: 98,
      };
    }

    res.json({ assist: aiResponse });
  } catch (err: any) {
    console.error("[Studio AI Brief Assist Error]", err);
    res.json({
      assist: {
        refinedConcept: draftBrief?.concept || "High-impact creative production aligned with your workspace identity.",
        suggestedVisualDirection: "Clean high-contrast aesthetic with sharp typography and signature color highlights.",
        suggestedDeliverables: ["Master Deliverable (PNG/WAV/MP4)", "Social Format Exports", "Commercial License"],
        missingElements: [],
        clarifyingQuestions: [
          "What is the priority launch date for this asset?",
          "Would you like an animated 9:16 vertical companion cut included?",
          "Are there specific competitor or visual references you want our lead designer to inspect?"
        ],
        estimatedDays: "3-5 business days",
        confidenceScore: 90,
      }
    });
  }
});

// --- Contextual Creative Brain (AI + Workspace Memory Engine & Real Tools) ---
apiRouter.post("/ai/creative-brain", requireAuth, requireWorkspaceAccess, async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId, message, conversationHistory, pinnedContext, directActionRequest } = req.body;
  if (!message && !directActionRequest) {
    return res.status(400).json({ error: "Message prompt or directActionRequest is required" });
  }

  const userId = req.user?.id || "usr_demo_keedohub";
  const userEmail = req.user?.email || "creator@keedohub.com";

  try {
    const result = await CreativeBrainService.processRequest({
      workspaceId,
      userId,
      userEmail,
      message: message || "",
      conversationHistory,
      pinnedContext,
      directActionRequest,
    });

    res.json(result);
  } catch (err: any) {
    console.error("[CreativeBrain Route Error]", err);
    res.status(500).json({ error: err.message || "Failed to process Creative Brain request" });
  }
});

// Direct Tool Action Execution from Creative Brain
apiRouter.post("/ai/creative-brain/action", requireAuth, requireWorkspaceAccess, async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId, toolName, args } = req.body;
  if (!toolName) {
    return res.status(400).json({ error: "toolName is required" });
  }

  const userId = req.user?.id || "usr_demo_keedohub";
  const userEmail = req.user?.email || "creator@keedohub.com";

  try {
    const receipt = executeBrainTool({
      workspaceId,
      userId,
      userEmail,
      toolName,
      args: args || {},
    });

    res.json({ receipt });
  } catch (err: any) {
    console.error("[CreativeBrain Action Error]", err);
    res.status(500).json({ error: err.message || "Failed to execute Brain action" });
  }
});

// Compiled Context for Creative Brain (with 7-Pillar Readiness)
apiRouter.get("/ai/creative-brain/context", requireAuth, requireWorkspaceAccess, async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.query.workspaceId as string;
  const contextType = req.query.contextType as any;
  const contextId = req.query.contextId as string | undefined;

  const context = compileWorkspaceContext(
    workspaceId,
    contextType ? { type: contextType, id: contextId } : undefined
  );

  res.json({ context });
});

// Strategic Recommendations Feed
apiRouter.get("/ai/creative-brain/recommendations", requireAuth, requireWorkspaceAccess, async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.query.workspaceId as string;
  const context = compileWorkspaceContext(workspaceId);
  if (!context) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  const recommendations: any[] = [];

  // Release blockers (7 Pillars)
  context.releases.forEach((rel) => {
    rel.readiness.missingItems.forEach((item) => {
      recommendations.push({
        id: `rec_rel_${rel.id}_${item.id}`,
        title: `${rel.title}: ${item.label}`,
        category: 'Release Blocker',
        priority: item.priority,
        whatIsMissing: item.label,
        whyItMatters: item.reason,
        recommendedAction: `Resolve in ${item.actionLabel} before drop day`,
        actionTab: item.actionTab,
        actionLabel: item.actionLabel,
        executableTool: item.id === 'req_artwork' ? { toolName: 'create_task', args: { text: `Render 3000x3000px Cover for ${rel.title}`, category: 'Artwork', priority: 'high' } } : undefined,
      });
    });
  });

  // Campaign blockers (7 Pillars)
  context.campaigns.forEach((cmp) => {
    cmp.readiness.missingItems.forEach((item) => {
      recommendations.push({
        id: `rec_cmp_${cmp.id}_${item.id}`,
        title: `${cmp.title}: ${item.label}`,
        category: 'Campaign Blocker',
        priority: item.priority,
        whatIsMissing: item.label,
        whyItMatters: item.reason,
        recommendedAction: `Navigate to ${item.actionLabel} to complete setup`,
        actionTab: item.actionTab,
        actionLabel: item.actionLabel,
        executableTool: item.id === 'req_hero_assets' ? { toolName: 'create_task', args: { text: `Select Vault Hero Visual for ${cmp.title}`, category: 'Hero Visual', priority: 'high' } } : undefined,
      });
    });
  });

  // Urgent project tasks
  context.urgentTasks.forEach((task) => {
    recommendations.push({
      id: `rec_task_${task.id}`,
      title: `Critical Task: ${task.text}`,
      category: 'Urgent Task',
      priority: 'critical',
      whatIsMissing: `Task pending in "${task.projectTitle || 'Workspace'}"`,
      whyItMatters: `High priority deliverable deadline approaching`,
      recommendedAction: `Execute task in Project Console`,
      actionTab: 'project-console',
      actionLabel: 'Open Project Console',
    });
  });

  res.json({ recommendations });
});

// --- AI Brand Strategy & Positioning Architect ---
apiRouter.post("/ai/brand-strategy", requireAuth, requireWorkspaceAccess, async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId, prompt, focusArea } = req.body;
  const workspace = db.getWorkspaceById(workspaceId);
  const brandCore = db.getBrandCore(workspaceId);
  const products = db.getProducts(workspaceId);

  const ai = getGemini();
  if (!ai) {
    return res.json({
      strategy: {
        tagline: `${workspace?.name || "Keedohub Brand"} — Redefining Creative Precision`,
        positioningStatement: `For high-standards clients and collectors, ${workspace?.name || "our brand"} delivers world-class creative execution without operational friction.`,
        suggestedTraits: ["Architectural", "Confident", "High-Impact", "Relentless"],
        actionableSteps: [
          "Codify your core ICP demographics and primary pain points in Brand Core",
          "Link flagship product to your primary active campaign",
          "Deploy a 4-week launch cadence with calibrated sprint deliverables"
        ]
      }
    });
  }

  try {
    const promptText = `You are the Keedohub Brand Strategy Engine. Formulate a precise, executive-grade brand positioning and strategy framework for:
Brand Name: ${brandCore.brandName || workspace?.name}
Industry/Niche: ${brandCore.industry || workspace?.genreOrNiche}
Identity Type: ${brandCore.identityType || workspace?.identityType}
Existing Tagline: ${brandCore.tagline}
Products in Catalog: ${products.map(p => p.name).join(", ") || "N/A"}
User Request / Focus: ${prompt || focusArea || "General Brand Optimization"}

Provide a clean JSON response with:
{
  "tagline": "string",
  "positioningStatement": "string",
  "archetype": "string",
  "valueProposition": "string",
  "suggestedTraits": ["string", "string", "string", "string"],
  "dos": ["string", "string", "string"],
  "donts": ["string", "string", "string"],
  "actionableSteps": ["string", "string", "string"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      config: { responseMimeType: "application/json" }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ strategy: parsed });
  } catch (err: any) {
    console.error("[AI Brand Strategy Error]", err);
    res.json({
      strategy: {
        tagline: `${workspace?.name} — Operating at the Edge of High Craft`,
        positioningStatement: `For ambitious operators, ${workspace?.name} delivers unmatched creative caliber.`,
        suggestedTraits: ["Polished", "Decisive", "Authentic", "Rigorous"],
        actionableSteps: [
          "Review Brand Voice traits",
          "Validate campaign objectives",
          "Audit hero visual assets"
        ]
      }
    });
  }
});

// --- AI Campaign Architect ---
apiRouter.post("/ai/campaign-builder", requireAuth, requireWorkspaceAccess, async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId, campaignObjective, selectedProductId, targetBudget, platforms } = req.body;
  const workspace = db.getWorkspaceById(workspaceId);
  const brandCore = db.getBrandCore(workspaceId);
  const product = selectedProductId ? db.getProductById(selectedProductId, workspaceId) : undefined;

  const ai = getGemini();
  if (!ai) {
    return res.json({
      plan: {
        title: `${product?.name ? product.name + ' Launch Campaign' : (workspace?.name || 'Brand') + ' Q3 Growth Campaign'}`,
        objective: campaignObjective || "Drive 100+ high-intent conversions and establish brand authority",
        creativeDirection: {
          theme: "Cinematic Product Mastery",
          visualGuidelines: "High contrast dark canvas (#09090B), sharp crimson accents (#EF4444), 3000px assets.",
          coreHook: "Experience precision craftsmanship engineered for serious creators."
        },
        sprintDays: [
          { day: "Phase 1 (Days 1-7)", task: "Seed teaser clips, deploy product landing page, test checkout funnel" },
          { day: "Phase 2 (Days 8-14)", task: "Launch high-retention video ad wave across TikTok & Instagram" },
          { day: "Phase 3 (Days 15-21)", task: "Activate community reviews, creator endorsements, and live demo" },
          { day: "Phase 4 (Days 22-30)", task: "Execute limited-edition countdown blitz and VIP customer onboarding" }
        ],
        milestones: [
          { id: "cm_1", title: "Hero Product Visuals & Mockups Rendered (3000px)", deadline: "Day 3", completed: false, category: "creative" },
          { id: "cm_2", title: "Landing Page & Conversion Tracking Verified", deadline: "Day 6", completed: false, category: "production" },
          { id: "cm_3", title: "10 Short-Form Video Assets Rendered & Queued", deadline: "Day 10", completed: false, category: "content" },
          { id: "cm_4", title: "Launch Day Multi-Channel Broadcast", deadline: "Day 15", completed: false, category: "launch" }
        ],
        contentConcepts: [
          { title: "Macro Texture Breakdown", platform: "tiktok", contentType: "Product Spotlight", concept: "Extreme close-up macro shots showcasing product material quality with kinetic typography hook." },
          { title: "Founder Vision & Problem Statement", platform: "linkedin", contentType: "Thought Leadership", concept: "The uncompromising story behind why this product was engineered." },
          { title: "3D Feature Exploded View", platform: "instagram", contentType: "Visual Reveal", concept: "Dynamic carousel swipe showing inner architecture and unique selling points." }
        ]
      }
    });
  }

  try {
    const promptText = `You are the Keedohub Campaign Architect. You build comprehensive, high-velocity marketing and product launch campaigns for:
Brand Name: ${brandCore.brandName || workspace?.name}
Identity Type: ${brandCore.identityType || workspace?.identityType}
Product to Launch: ${product ? `${product.name} ($${product.pricing.amount} - ${product.tagline})` : "General Brand Launch"}
Product Features: ${product?.keyFeatures?.join(", ") || "N/A"}
Campaign Objective: ${campaignObjective}
Budget: $${targetBudget || 2500}
Target Platforms: ${(platforms || ["Instagram", "TikTok", "LinkedIn"]).join(", ")}
Brand Voice: ${brandCore.voiceAndTone?.traits?.join(", ")}

Generate a complete, production-ready Campaign Plan JSON formatted as:
{
  "title": "string",
  "objective": "string",
  "creativeDirection": {
    "theme": "string",
    "visualGuidelines": "string",
    "coreHook": "string"
  },
  "sprintDays": [
    { "day": "Phase 1: Pre-Launch (Days 1-7)", "task": "string" },
    { "day": "Phase 2: Launch Drop (Days 8-14)", "task": "string" },
    { "day": "Phase 3: Velocity & Social Proof (Days 15-21)", "task": "string" },
    { "day": "Phase 4: Conversion & Retention (Days 22-30)", "task": "string" }
  ],
  "milestones": [
    { "id": "cm_1", "title": "string", "deadline": "Day 3", "completed": false, "category": "creative" },
    { "id": "cm_2", "title": "string", "deadline": "Day 7", "completed": false, "category": "production" },
    { "id": "cm_3", "title": "string", "deadline": "Day 12", "completed": false, "category": "content" },
    { "id": "cm_4", "title": "string", "deadline": "Day 15", "completed": false, "category": "launch" }
  ],
  "contentConcepts": [
    { "title": "string", "platform": "tiktok", "contentType": "string", "concept": "string" },
    { "title": "string", "platform": "instagram", "contentType": "string", "concept": "string" },
    { "title": "string", "platform": "linkedin", "contentType": "string", "concept": "string" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      config: { responseMimeType: "application/json" }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ plan: parsed });
  } catch (err: any) {
    console.error("[AI Campaign Builder Error]", err);
    res.json({
      plan: {
        title: `${workspace?.name} Flagship Campaign`,
        objective: campaignObjective || "Drive conversions and elevate brand stature",
        creativeDirection: {
          theme: "High Impact Visuals",
          visualGuidelines: "Dark mode high contrast typography",
          coreHook: "Engineered for excellence."
        },
        sprintDays: [
          { day: "Days 1-7", task: "Assets & landing page deployment" },
          { day: "Days 8-14", task: "Multi-channel launch rollout" }
        ],
        milestones: [
          { id: "cm_1", title: "Assets finalized", deadline: "Day 3", completed: false, category: "creative" }
        ],
        contentConcepts: []
      }
    });
  }
});
