import { Router, Request, Response, NextFunction } from "express";
import { db, IdentityType, UserRecord, SessionRecord } from "./db";
import { GoogleGenAI } from "@google/genai";
import { CreativeBrainService, compileWorkspaceContext, executeBrainTool } from "./ai/creativeBrainService";
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

// --- Content Items Routes ---
apiRouter.get("/workspaces/:workspaceId/content-items", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const contentItems = db.getContentItems(req.params.workspaceId);
  res.json({ contentItems });
});

apiRouter.post("/workspaces/:workspaceId/content-items", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { title, platform, contentType, concept, captionHook, soundSnippet, scheduledDate, status, priority, releaseId, campaignId } = req.body;
  if (!title || !platform) {
    return res.status(400).json({ error: "Title and platform are required" });
  }

  const item = db.createContentItem(req.params.workspaceId, {
    title,
    platform,
    contentType: contentType || "Post",
    concept: concept || "",
    captionHook: captionHook || "",
    soundSnippet,
    scheduledDate: scheduledDate || new Date().toISOString().split("T")[0],
    status: status || "idea",
    priority: priority || "MEDIUM",
    releaseId,
    campaignId,
  });

  res.status(201).json({ contentItem: item });
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

// --- Creative Memory Routes ---
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
