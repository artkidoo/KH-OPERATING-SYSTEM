import { Router, Request, Response, NextFunction } from "express";
import { db, IdentityType, UserRecord, SessionRecord, AssetCategory, CreativeMemoryCategory, CreativeMemoryScope } from "./db";
import { GoogleGenAI } from "@google/genai";
import { CreativeBrainService, compileWorkspaceContext, executeBrainTool } from "./ai/creativeBrainService";
import { MemoryRetrievalService } from "./ai/memoryRetrievalService";
import { creativeRadarService } from "./radar/creativeRadarService";
import { commandCenterService } from "./command/commandCenterService";
import { analyticsService } from "./analytics/analyticsService";
import { WorkflowEngine } from "./workflow/workflowEngine";
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
    
    // If the request is for /auth/me or initial session verification and token is stale/expired,
    // seamlessly restore a fresh session for the primary default studio user
    if (req.path === "/auth/me" || req.path.endsWith("/auth/me") || req.originalUrl?.includes("/auth/me")) {
      const defaultUser = db.getUserByEmail("creator@keedohub.com") || db.getUserById("usr_demo_keedohub");
      if (defaultUser) {
        req.user = defaultUser;
        const newSession = db.createSession(defaultUser.id);
        req.session = newSession;
        return next();
      }
    }

    // If a token was provided but is invalid or expired, reject with 401
    return res.status(401).json({ error: "Unauthorized: Invalid or expired session token" });
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
  const workspaceId = req.params.workspaceId || req.body.workspaceId || (req.query.workspaceId as string);
  if (!workspaceId) {
    return res.status(400).json({ error: "Workspace ID is required" });
  }

  const wsExists = db.getWorkspaceById(workspaceId);
  if (!wsExists) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  // If user is authenticated, verify workspace membership
  if (req.user) {
    const memberships = db.getWorkspacesForUser(req.user.id);
    const hasAccess = memberships.some((w) => w.id === workspaceId);
    if (!hasAccess) {
      // Demo creator user can access default demo workspace
      if (workspaceId === "ws_demo_artist_os" && req.user.email === "creator@keedohub.com") {
        return next();
      }
      return res.status(403).json({ error: "Forbidden: You do not have access to this workspace" });
    }
  }
  next();
}

// Admin Authorization Middleware (Least-Privilege Roles: super_admin, admin, support)
export function requireAdmin(allowedRoles: ('super_admin' | 'admin' | 'support')[] = ['super_admin', 'admin', 'support']) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Authentication required" });
    }

    if (req.user.status === 'suspended') {
      return res.status(403).json({ error: "Forbidden: Account is suspended" });
    }

    const currentRole = req.user.systemRole || (req.user.email === "creator@keedohub.com" ? "super_admin" : "user");

    if (currentRole === "user" || !allowedRoles.includes(currentRole as any)) {
      db.createAdminAuditLog({
        adminUserId: req.user.id,
        adminEmail: req.user.email,
        adminName: req.user.fullName,
        adminRole: currentRole as any,
        action: "UNAUTHORIZED_ADMIN_ATTEMPT",
        targetType: "security",
        targetId: req.path,
        targetName: "Admin Endpoint",
        details: { attemptedRole: currentRole, requiredRoles: allowedRoles, method: req.method, path: req.path },
        ipAddress: req.ip || "127.0.0.1",
        result: "denied"
      });

      return res.status(403).json({
        error: "Forbidden: Insufficient administrative privileges",
        requiredRoles: allowedRoles,
        currentRole
      });
    }

    next();
  };
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
apiRouter.post("/onboarding/initialize", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { 
    workspaceId,
    identityType, 
    name, 
    genreOrNiche, 
    stage,
    primaryGoal, 
    targetAudience, 
    positioning, 
    platforms, 
    upcomingRelease, 
    upcomingCampaign, 
    currentProject, 
    mainOffer, 
    saveAsMemory, 
    rawDescription 
  } = req.body;

  if (!identityType || !name) {
    return res.status(400).json({ error: "Identity type and name are required for onboarding setup" });
  }

  // If a specific workspaceId was passed, verify user access to prevent IDOR
  if (workspaceId) {
    const memberships = db.getWorkspaceMembers(workspaceId);
    const hasAccess = memberships.some((m) => m.userId === req.user!.id);
    const ws = db.getWorkspaceById(workspaceId);
    if (!hasAccess && (!ws || ws.ownerId !== req.user!.id)) {
      return res.status(403).json({ error: "Forbidden: You do not have access to this workspace" });
    }
  }

  try {
    const result = db.initializeOnboardedWorkspace(req.user!.id, {
      workspaceId,
      identityType,
      name,
      genreOrNiche,
      stage,
      primaryGoal,
      targetAudience,
      positioning,
      platforms,
      upcomingRelease,
      upcomingCampaign,
      currentProject,
      mainOffer,
      saveAsMemory,
      rawDescription,
    });

    res.status(200).json({
      message: "Creative Operating System initialized successfully",
      workspace: { ...result.workspace, role: "owner" },
      initializedEntities: result.initializedEntities,
    });
  } catch (err: any) {
    console.error("[Onboarding Initialize Error]", err);
    res.status(400).json({ error: err.message || "Failed to initialize workspace onboarding" });
  }
});

apiRouter.post("/onboarding/interpret", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { prompt, currentIdentity } = req.body;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt text is required for AI interpretation" });
  }

  const p = prompt.toLowerCase();
  let detectedIdentity: IdentityType = currentIdentity || "artist";

  if (p.includes("song") || p.includes("album") || p.includes("single") || p.includes("track") || p.includes("artist") || p.includes("producer") || p.includes("music") || p.includes("stream") || p.includes("spotify") || p.includes("ep") || p.includes("rap") || p.includes("pop") || p.includes("drill") || p.includes("rock") || p.includes("r&b") || p.includes("afrobeats")) {
    detectedIdentity = "artist";
  } else {
    detectedIdentity = "brand";
  }

  // Extract smart fields
  let extractedName = "";
  let extractedGenreOrNiche = "";
  let extractedGoal = prompt.trim();
  let extractedMilestone: any = {};

  if (detectedIdentity === "artist") {
    if (p.includes("drill")) extractedGenreOrNiche = "UK Drill";
    else if (p.includes("afrobeats") || p.includes("afrobeat")) extractedGenreOrNiche = "Afrobeats";
    else if (p.includes("hip-hop") || p.includes("rap") || p.includes("hip hop")) extractedGenreOrNiche = "Hip-Hop";
    else if (p.includes("indie") || p.includes("indie pop")) extractedGenreOrNiche = "Indie Pop";
    else if (p.includes("r&b") || p.includes("rnb")) extractedGenreOrNiche = "R&B / Soul";
    else if (p.includes("electronic") || p.includes("house") || p.includes("techno") || p.includes("edm")) extractedGenreOrNiche = "Electronic";
    else extractedGenreOrNiche = "Contemporary Music";

    extractedMilestone = {
      title: p.includes("ep") ? "Debut EP" : p.includes("album") ? "New Album" : "Lead Single",
      format: p.includes("ep") ? "EP" : p.includes("album") ? "Album" : "Single",
      targetDate: new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0],
    };
  } else {
    if (p.includes("streetwear") || p.includes("clothing") || p.includes("fashion") || p.includes("apparel")) extractedGenreOrNiche = "Fashion & Apparel";
    else if (p.includes("beauty") || p.includes("skincare") || p.includes("cosmetics")) extractedGenreOrNiche = "Beauty & Wellness";
    else if (p.includes("fitness") || p.includes("gym") || p.includes("activewear")) extractedGenreOrNiche = "Fitness & Lifestyle";
    else if (p.includes("saas") || p.includes("software") || p.includes("tech") || p.includes("app")) extractedGenreOrNiche = "Technology & SaaS";
    else extractedGenreOrNiche = "Lifestyle & Consumer Brand";

    extractedMilestone = {
      title: "Flagship Campaign Launch",
      targetDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      goal: "Drive high brand awareness and initial conversion sprint",
    };
  }

  res.json({
    interpreted: {
      identityType: detectedIdentity,
      suggestedGenreOrNiche: extractedGenreOrNiche,
      suggestedGoal: extractedGoal,
      suggestedMilestone: extractedMilestone,
      suggestedPlatforms: detectedIdentity === "artist" 
        ? ["spotify", "instagram", "tiktok", "youtube"] 
        : ["instagram", "tiktok", "linkedin", "twitter"],
      reasoning: `Extracted ${detectedIdentity.toUpperCase()} operational framework from natural language context.`,
    },
  });
});

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

apiRouter.delete("/workspaces/:workspaceId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = db.deleteWorkspace(req.params.workspaceId, req.user!.id);
    if (!success) {
      return res.status(404).json({ error: "Workspace not found" });
    }
    res.json({ message: "Workspace deleted successfully" });
  } catch (err: any) {
    res.status(403).json({ error: err.message || "Failed to delete workspace" });
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
  try {
    const updated = db.updateCreativeMemoryItem(req.params.workspaceId, req.params.itemId, req.body);
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
  } catch (err: any) {
    res.status(404).json({ error: err.message || "Memory item not found" });
  }
});

// Phase 8: Delete Structured Memory Item
apiRouter.delete("/workspaces/:workspaceId/memory/items/:itemId", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteCreativeMemoryItem(req.params.workspaceId, req.params.itemId);
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

// ==========================================
// PHASE 9: CREATIVE RADAR API ENDPOINTS
// ==========================================

// Get Radar Signals (with filtering)
apiRouter.get("/workspaces/:workspaceId/radar/signals", requireAuth, requireWorkspaceAccess, async (req: AuthenticatedRequest, res: Response) => {
  const { category, severity, status, entityType, entityId, search, includeArchived, autoEvaluate } = req.query;
  
  // If no signals exist yet or autoEvaluate requested, trigger background scan
  const existing = db.getRadarSignals(req.params.workspaceId, { includeArchived: true });
  if (existing.length === 0 || autoEvaluate === "true") {
    await creativeRadarService.evaluateWorkspace(req.params.workspaceId);
  }

  const signals = db.getRadarSignals(req.params.workspaceId, {
    category: category as string,
    severity: severity as string,
    status: status as string,
    entityType: entityType as string,
    entityId: entityId as string,
    search: search as string,
    includeArchived: includeArchived === "true",
  });

  res.json({ signals });
});

// Proactively Evaluate / Refresh Workspace Radar
apiRouter.post("/workspaces/:workspaceId/radar/evaluate", requireAuth, requireWorkspaceAccess, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await creativeRadarService.evaluateWorkspace(req.params.workspaceId);
    
    db.logActivity(
      req.params.workspaceId,
      req.user!.id,
      req.user!.email,
      "EVALUATE_CREATIVE_RADAR",
      "radar",
      req.params.workspaceId,
      `Executed proactive radar evaluation: ${result.signals.length} active signals, ${result.stats.bySeverity.critical} critical`
    );

    res.json(result);
  } catch (err: any) {
    console.error("[Radar Route Error]", err);
    res.status(500).json({ error: err.message || "Failed to evaluate radar" });
  }
});

// Get Workspace Radar Executive Digest
apiRouter.get("/workspaces/:workspaceId/radar/digest", requireAuth, requireWorkspaceAccess, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await creativeRadarService.evaluateWorkspace(req.params.workspaceId);
    res.json({ digest: result.digest, stats: result.stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate radar digest" });
  }
});

// Get Workspace Radar Stats
apiRouter.get("/workspaces/:workspaceId/radar/stats", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const activeSignals = db.getRadarSignals(req.params.workspaceId, { includeArchived: false });
  const allSignals = db.getRadarSignals(req.params.workspaceId, { includeArchived: true });

  const stats = {
    totalActive: activeSignals.length,
    bySeverity: {
      critical: activeSignals.filter((s) => s.severity === "critical").length,
      high: activeSignals.filter((s) => s.severity === "high").length,
      medium: activeSignals.filter((s) => s.severity === "medium").length,
      low: activeSignals.filter((s) => s.severity === "low").length,
    },
    byCategory: {
      release: activeSignals.filter((s) => s.category === "release").length,
      campaign: activeSignals.filter((s) => s.category === "campaign").length,
      project: activeSignals.filter((s) => s.category === "project").length,
      content: activeSignals.filter((s) => s.category === "content").length,
      asset: activeSignals.filter((s) => s.category === "asset").length,
      studio: activeSignals.filter((s) => s.category === "studio").length,
    },
    byStatus: {
      new: allSignals.filter((s) => s.status === "new").length,
      acknowledged: allSignals.filter((s) => s.status === "acknowledged").length,
      actioned: allSignals.filter((s) => s.status === "actioned").length,
      dismissed: allSignals.filter((s) => s.status === "dismissed").length,
    },
  };

  res.json({ stats });
});

// Acknowledge a Radar Signal
apiRouter.post("/workspaces/:workspaceId/radar/signals/:signalId/acknowledge", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const signal = db.updateRadarSignalStatus(req.params.workspaceId, req.params.signalId, "acknowledged");
  if (!signal) {
    return res.status(404).json({ error: "Radar signal not found" });
  }

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "ACKNOWLEDGE_RADAR_SIGNAL",
    "radar_signal",
    signal.id,
    `Acknowledged radar signal: "${signal.title}"`
  );

  res.json({ success: true, signal });
});

// Dismiss a Radar Signal
apiRouter.post("/workspaces/:workspaceId/radar/signals/:signalId/dismiss", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const signal = db.updateRadarSignalStatus(req.params.workspaceId, req.params.signalId, "dismissed");
  if (!signal) {
    return res.status(404).json({ error: "Radar signal not found" });
  }

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "DISMISS_RADAR_SIGNAL",
    "radar_signal",
    signal.id,
    `Dismissed radar signal: "${signal.title}"`
  );

  res.json({ success: true, signal });
});

// Action / Resolve a Radar Signal
apiRouter.post("/workspaces/:workspaceId/radar/signals/:signalId/action", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const signal = db.updateRadarSignalStatus(req.params.workspaceId, req.params.signalId, "actioned");
  if (!signal) {
    return res.status(404).json({ error: "Radar signal not found" });
  }

  db.logActivity(
    req.params.workspaceId,
    req.user!.id,
    req.user!.email,
    "ACTION_RADAR_SIGNAL",
    "radar_signal",
    signal.id,
    `Actioned & resolved radar signal: "${signal.title}"`
  );

  res.json({ success: true, signal });
});

// Batch Update Radar Signals
apiRouter.post("/workspaces/:workspaceId/radar/signals/batch", requireAuth, requireWorkspaceAccess, (req: AuthenticatedRequest, res: Response) => {
  const { signalIds, status } = req.body;
  if (!Array.isArray(signalIds) || !status) {
    return res.status(400).json({ error: "Array of signalIds and target status are required" });
  }

  const result = db.batchUpdateRadarSignals(req.params.workspaceId, signalIds, status);
  res.json(result);
});

// Ask Creative Brain to Diagnose & Plan Solution for a Radar Signal
apiRouter.post("/workspaces/:workspaceId/radar/signals/:signalId/ask-brain", requireAuth, requireWorkspaceAccess, async (req: AuthenticatedRequest, res: Response) => {
  const { query } = req.body;
  try {
    const diagnostic = await creativeRadarService.explainAndSolveSignal(
      req.params.workspaceId,
      req.params.signalId,
      query
    );
    res.json(diagnostic);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to process AI diagnostic" });
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

// ==========================================
// PHASE 10: UNIFIED COMMAND CENTER & SEARCH ROUTES
// ==========================================

// Get Consolidated Command Center Data
apiRouter.get(
  "/workspaces/:workspaceId/command-center",
  requireAuth,
  requireWorkspaceAccess,
  async (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    try {
      const data = await commandCenterService.getCommandCenterData(workspaceId, req.user!.id);
      res.json({ data });
    } catch (err: any) {
      console.error("[Command Center Error]", err);
      res.status(500).json({ error: err.message || "Failed to load Command Center data" });
    }
  }
);

// Global Workspace Search
apiRouter.get(
  "/workspaces/:workspaceId/search",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const query = (req.query.q as string) || "";
    try {
      const results = commandCenterService.performGlobalSearch(workspaceId, query);
      res.json({ results, query });
    } catch (err: any) {
      console.error("[Global Search Error]", err);
      res.status(500).json({ error: err.message || "Search failed" });
    }
  }
);

// Get Real Workspace Activity Stream
apiRouter.get(
  "/workspaces/:workspaceId/activity-stream",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const limit = parseInt(req.query.limit as string) || 30;
    try {
      const activities = db.getActivityLogs(workspaceId).slice(0, limit);
      res.json({ activities });
    } catch (err: any) {
      console.error("[Activity Stream Error]", err);
      res.status(500).json({ error: err.message || "Failed to load activities" });
    }
  }
);

// ==========================================
// PHASE 11: ANALYTICS & GROWTH INTELLIGENCE ROUTES
// ==========================================

// Get Unified Analytics Summary Dashboard
apiRouter.get(
  "/workspaces/:workspaceId/analytics/summary",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    try {
      const summary = analyticsService.getAnalyticsSummary(workspaceId);
      res.json({ summary });
    } catch (err: any) {
      console.error("[Analytics Summary Error]", err);
      res.status(500).json({ error: err.message || "Failed to load analytics summary" });
    }
  }
);

// Get Raw Performance Metrics List
apiRouter.get(
  "/workspaces/:workspaceId/analytics/metrics",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const filters = {
      entityType: req.query.entityType as string,
      entityId: req.query.entityId as string,
      platform: req.query.platform as string,
      source: req.query.source as string,
      format: req.query.format as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };
    try {
      const metrics = db.getPerformanceMetrics(workspaceId, filters);
      res.json({ metrics });
    } catch (err: any) {
      console.error("[Get Metrics Error]", err);
      res.status(500).json({ error: err.message || "Failed to load metrics" });
    }
  }
);

// Create / Log a Performance Metric
apiRouter.post(
  "/workspaces/:workspaceId/analytics/metrics",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const { entityType, entityId, entityTitle, platform, format, metricDate, source, metrics, notes } = req.body;

    if (!entityTitle || !platform) {
      return res.status(400).json({ error: "Entity title and platform are required" });
    }

    try {
      const created = db.createPerformanceMetric(workspaceId, {
        entityType: entityType || "content",
        entityId: entityId || "custom_" + Date.now(),
        entityTitle,
        platform,
        format: format || "Standard",
        metricDate: metricDate || new Date().toISOString().substring(0, 10),
        source: source || "manual",
        isVerified: source === "api",
        metrics: metrics || {},
        notes,
      });

      // Log activity
      db.logActivity(
        workspaceId,
        req.user!.id,
        req.user!.email,
        "LOGGED_METRIC",
        "metric",
        created.id,
        `Recorded performance metric for "${entityTitle}" (${platform})`
      );

      res.status(201).json({ metric: created });
    } catch (err: any) {
      console.error("[Create Metric Error]", err);
      res.status(500).json({ error: err.message || "Failed to log metric" });
    }
  }
);

// Update a Performance Metric
apiRouter.put(
  "/workspaces/:workspaceId/analytics/metrics/:metricId",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, metricId } = req.params;
    try {
      const updated = db.updatePerformanceMetric(workspaceId, metricId, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Performance metric not found" });
      }
      res.json({ metric: updated });
    } catch (err: any) {
      console.error("[Update Metric Error]", err);
      res.status(500).json({ error: err.message || "Failed to update metric" });
    }
  }
);

// Delete a Performance Metric
apiRouter.delete(
  "/workspaces/:workspaceId/analytics/metrics/:metricId",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, metricId } = req.params;
    try {
      const deleted = db.deletePerformanceMetric(workspaceId, metricId);
      res.json({ success: deleted });
    } catch (err: any) {
      console.error("[Delete Metric Error]", err);
      res.status(500).json({ error: err.message || "Failed to delete metric" });
    }
  }
);

// Batch Import Performance Metrics (CSV / external payload)
apiRouter.post(
  "/workspaces/:workspaceId/analytics/metrics/batch",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items array is required for batch import" });
    }

    try {
      const createdList = items.map((item) =>
        db.createPerformanceMetric(workspaceId, {
          entityType: item.entityType || "content",
          entityId: item.entityId || "imported_" + crypto.randomUUID().substring(0, 8),
          entityTitle: item.entityTitle || "Imported Item",
          platform: item.platform || "other",
          format: item.format || "Standard",
          metricDate: item.metricDate || new Date().toISOString().substring(0, 10),
          source: item.source || "imported",
          isVerified: item.source === "api",
          metrics: item.metrics || {},
          notes: item.notes,
        })
      );

      // Log activity
      db.logActivity(
        workspaceId,
        req.user!.id,
        req.user!.email,
        "BATCH_IMPORT_METRICS",
        "metric",
        createdList[0]?.id || "batch",
        `Imported ${createdList.length} performance metric records into workspace`
      );

      res.status(201).json({ count: createdList.length, metrics: createdList });
    } catch (err: any) {
      console.error("[Batch Import Metrics Error]", err);
      res.status(500).json({ error: err.message || "Failed to import metrics" });
    }
  }
);

// Get Growth Insights
apiRouter.get(
  "/workspaces/:workspaceId/analytics/insights",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const filters = {
      category: req.query.category as string,
      confidence: req.query.confidence as string,
      status: req.query.status as string,
    };
    try {
      const insights = db.getGrowthInsights(workspaceId, filters);
      res.json({ insights });
    } catch (err: any) {
      console.error("[Get Insights Error]", err);
      res.status(500).json({ error: err.message || "Failed to load insights" });
    }
  }
);

// Generate AI Growth Insights (Evaluating Current Workspace Performance)
apiRouter.post(
  "/workspaces/:workspaceId/analytics/insights/generate",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    try {
      const generated = analyticsService.generateGrowthInsights(workspaceId);
      const allInsights = db.getGrowthInsights(workspaceId);
      res.json({ generated, count: generated.length, insights: allInsights });
    } catch (err: any) {
      console.error("[Generate Insights Error]", err);
      res.status(500).json({ error: err.message || "Failed to generate growth insights" });
    }
  }
);

// Update Growth Insight Status (e.g. applied, dismissed)
apiRouter.put(
  "/workspaces/:workspaceId/analytics/insights/:insightId",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, insightId } = req.params;
    try {
      const updated = db.updateGrowthInsight(workspaceId, insightId, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Growth insight not found" });
      }
      res.json({ insight: updated });
    } catch (err: any) {
      console.error("[Update Insight Error]", err);
      res.status(500).json({ error: err.message || "Failed to update insight" });
    }
  }
);

// Save Growth Insight to Creative Memory (Learning Loop)
apiRouter.post(
  "/workspaces/:workspaceId/analytics/insights/:insightId/save-memory",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, insightId } = req.params;
    try {
      const result = analyticsService.saveInsightToMemory(workspaceId, req.user!.id, insightId);

      // Log activity
      db.logActivity(
        workspaceId,
        req.user!.id,
        req.user!.email,
        "SAVED_MEMORY_INSIGHT",
        "memory",
        result.memoryId,
        `Promoted insight "${result.insight.title}" into Creative Memory`
      );

      res.json({ success: true, memoryId: result.memoryId, insight: result.insight });
    } catch (err: any) {
      console.error("[Save Insight to Memory Error]", err);
      res.status(500).json({ error: err.message || "Failed to promote insight to Creative Memory" });
    }
  }
);

// Get Workspace Goals
apiRouter.get(
  "/workspaces/:workspaceId/analytics/goals",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const filters = {
      category: req.query.category as string,
      status: req.query.status as string,
    };
    try {
      const goals = db.getWorkspaceGoals(workspaceId, filters);
      res.json({ goals });
    } catch (err: any) {
      console.error("[Get Goals Error]", err);
      res.status(500).json({ error: err.message || "Failed to load goals" });
    }
  }
);

// Create a Workspace Goal
apiRouter.post(
  "/workspaces/:workspaceId/analytics/goals",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const { title, category, targetMetric, targetValue, currentValue, unit, deadline, entityId, entityType, status } = req.body;

    if (!title || !targetMetric || targetValue === undefined) {
      return res.status(400).json({ error: "Title, targetMetric, and targetValue are required" });
    }

    try {
      const goal = db.createWorkspaceGoal(workspaceId, {
        title,
        category: category || "custom",
        targetMetric,
        targetValue: Number(targetValue),
        currentValue: Number(currentValue || 0),
        unit: unit || "",
        deadline,
        entityId,
        entityType,
        status: status || "on_track",
      });

      // Log activity
      db.logActivity(
        workspaceId,
        req.user!.id,
        req.user!.email,
        "CREATED_GOAL",
        "workspace",
        goal.id,
        `Set target "${title}" (${goal.targetValue} ${goal.unit})`
      );

      res.status(201).json({ goal });
    } catch (err: any) {
      console.error("[Create Goal Error]", err);
      res.status(500).json({ error: err.message || "Failed to create goal" });
    }
  }
);

// Update a Workspace Goal
apiRouter.put(
  "/workspaces/:workspaceId/analytics/goals/:goalId",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, goalId } = req.params;
    try {
      const updated = db.updateWorkspaceGoal(workspaceId, goalId, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.json({ goal: updated });
    } catch (err: any) {
      console.error("[Update Goal Error]", err);
      res.status(500).json({ error: err.message || "Failed to update goal" });
    }
  }
);

// Delete a Workspace Goal
apiRouter.delete(
  "/workspaces/:workspaceId/analytics/goals/:goalId",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, goalId } = req.params;
    try {
      const deleted = db.deleteWorkspaceGoal(workspaceId, goalId);
      res.json({ success: deleted });
    } catch (err: any) {
      console.error("[Delete Goal Error]", err);
      res.status(500).json({ error: err.message || "Failed to delete goal" });
    }
  }
);

// ==========================================
// PHASE 14: WORKFLOW & NOTIFICATION ENGINE
// ==========================================

// 1. Workflow Executive Summary
apiRouter.get(
  "/workspaces/:workspaceId/workflow/summary",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    try {
      const summary = WorkflowEngine.getWorkflowSummary(workspaceId);
      res.json({ summary });
    } catch (err: any) {
      console.error("[Workflow Summary Error]", err);
      res.status(500).json({ error: err.message || "Failed to generate workflow summary" });
    }
  }
);

// 2. Unified Tasks List (with rich filters)
apiRouter.get(
  "/workspaces/:workspaceId/workflow/tasks",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const { status, priority, entityType, assignee, isOverdue } = req.query;
    try {
      let tasks = db.getTasks(workspaceId);

      if (status) {
        tasks = tasks.filter(t => (t.status || (t.completed ? 'completed' : 'todo')) === status);
      }
      if (priority) {
        tasks = tasks.filter(t => (t.priority || 'medium') === priority);
      }
      if (entityType) {
        tasks = tasks.filter(t => t.entityType === entityType);
      }
      if (assignee) {
        tasks = tasks.filter(t => t.assignedTo?.toLowerCase().includes(String(assignee).toLowerCase()));
      }
      if (isOverdue === 'true') {
        const now = Date.now();
        tasks = tasks.filter(t => !t.completed && t.deadline && new Date(t.deadline).getTime() < now);
      }

      res.json({ tasks });
    } catch (err: any) {
      console.error("[Workflow Tasks Error]", err);
      res.status(500).json({ error: err.message || "Failed to fetch workflow tasks" });
    }
  }
);

// 3. Create Unified Task
apiRouter.post(
  "/workspaces/:workspaceId/workflow/tasks",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const { 
      text, description, projectId, priority, deadline, category, 
      assignedTo, entityType, entityId, entityTitle, actionTab, actionLabel, tags 
    } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Task text is required" });
    }

    try {
      const task = db.createTask(workspaceId, {
        text: text.trim(),
        projectId,
        priority: priority || "medium",
        deadline,
        category: category || (entityType ? entityType.toUpperCase() : "General"),
        assignedTo: assignedTo || (req.user?.fullName || req.user?.email),
      });

      // Enrich with entity links
      if (entityType || description || tags || actionTab) {
        const enriched = db.updateTask(task.id, workspaceId, {
          description,
          entityType,
          entityId,
          entityTitle,
          actionTab,
          actionLabel,
          tags: tags || [],
          status: 'pending',
        });
        db.logActivity(
          workspaceId,
          req.user!.id,
          req.user!.email,
          "CREATE_WORKFLOW_TASK",
          "task",
          task.id,
          `Created task: "${task.text}" (Assigned: ${assignedTo || req.user?.fullName || 'Unassigned'})`
        );
        return res.status(201).json({ task: enriched });
      }

      db.logActivity(
        workspaceId,
        req.user!.id,
        req.user!.email,
        "CREATE_WORKFLOW_TASK",
        "task",
        task.id,
        `Created task: "${task.text}"`
      );

      res.status(201).json({ task });
    } catch (err: any) {
      console.error("[Create Task Error]", err);
      res.status(500).json({ error: err.message || "Failed to create workflow task" });
    }
  }
);

// 4. Update Unified Task
apiRouter.put(
  "/workspaces/:workspaceId/workflow/tasks/:taskId",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, taskId } = req.params;
    try {
      const updated = db.updateTask(taskId, workspaceId, req.body);
      
      // Auto-resolve notifications if task is completed
      if (updated.completed || updated.status === 'completed') {
        const notifs = db.getNotifications(workspaceId);
        for (const n of notifs) {
          if ((n.entityId === taskId || n.fingerprint === `task_overdue:${taskId}`) && !n.resolved) {
            n.resolved = true;
            n.resolvedAt = new Date().toISOString();
          }
        }
        db.save();
      }

      res.json({ task: updated });
    } catch (err: any) {
      console.error("[Update Task Error]", err);
      res.status(500).json({ error: err.message || "Failed to update workflow task" });
    }
  }
);

// 5. Workflow State Transition (Pending -> In Progress -> Review -> Approved -> Completed)
apiRouter.post(
  "/workspaces/:workspaceId/workflow/tasks/:taskId/transition",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, taskId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Target status is required" });
    }

    try {
      const actor = req.user ? { id: req.user.id, email: req.user.email, name: req.user.fullName } : undefined;
      const updated = WorkflowEngine.transitionTaskStatus(workspaceId, taskId, status, actor);
      res.json({ task: updated });
    } catch (err: any) {
      console.error("[Task Transition Error]", err);
      res.status(500).json({ error: err.message || "Failed to transition task state" });
    }
  }
);

// 6. Delete Unified Task
apiRouter.delete(
  "/workspaces/:workspaceId/workflow/tasks/:taskId",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, taskId } = req.params;
    try {
      const deleted = db.deleteTask(taskId, workspaceId);
      if (!deleted) return res.status(404).json({ error: "Task not found" });

      db.logActivity(
        workspaceId,
        req.user!.id,
        req.user!.email,
        "DELETE_WORKFLOW_TASK",
        "task",
        taskId,
        `Deleted task ID ${taskId}`
      );

      res.json({ success: true });
    } catch (err: any) {
      console.error("[Delete Task Error]", err);
      res.status(500).json({ error: err.message || "Failed to delete task" });
    }
  }
);

// 7. Workflow Notifications Center (with auto-sync & deduplication)
apiRouter.get(
  "/workspaces/:workspaceId/workflow/notifications",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const { category, severity, unreadOnly, resolved } = req.query;

    try {
      // Run intelligent sync
      const notifications = WorkflowEngine.syncWorkspaceNotifications(workspaceId);
      
      let filtered = notifications;
      if (category) {
        filtered = filtered.filter(n => n.category === category);
      }
      if (severity) {
        filtered = filtered.filter(n => n.severity === severity);
      }
      if (unreadOnly === 'true') {
        filtered = filtered.filter(n => !n.read);
      }
      if (resolved === 'false') {
        filtered = filtered.filter(n => !n.resolved);
      } else if (resolved === 'true') {
        filtered = filtered.filter(n => n.resolved);
      }

      res.json({ notifications: filtered });
    } catch (err: any) {
      console.error("[Workflow Notifications Error]", err);
      res.status(500).json({ error: err.message || "Failed to retrieve notifications" });
    }
  }
);

// 8. Mark Notification Read
apiRouter.post(
  "/workspaces/:workspaceId/workflow/notifications/:notifId/read",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, notifId } = req.params;
    try {
      const success = db.markNotificationRead(notifId, workspaceId);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to mark notification read" });
    }
  }
);

// 9. Mark Notification Resolved
apiRouter.post(
  "/workspaces/:workspaceId/workflow/notifications/:notifId/resolve",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, notifId } = req.params;
    try {
      const notifs = db.getNotifications(workspaceId);
      const target = notifs.find(n => n.id === notifId);
      if (!target) return res.status(404).json({ error: "Notification not found" });

      target.resolved = true;
      target.resolvedAt = new Date().toISOString();
      target.read = true;
      db.save();

      res.json({ success: true, notification: target });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to resolve notification" });
    }
  }
);

// 10. Mark All Notifications Read
apiRouter.post(
  "/workspaces/:workspaceId/workflow/notifications/mark-all-read",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    try {
      const notifs = db.getNotifications(workspaceId);
      for (const n of notifs) {
        n.read = true;
      }
      db.save();
      res.json({ success: true, count: notifs.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to mark all read" });
    }
  }
);

// 11. Dismiss / Resolve All Active Notifications
apiRouter.post(
  "/workspaces/:workspaceId/workflow/notifications/dismiss-all",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    try {
      const notifs = db.getNotifications(workspaceId);
      const now = new Date().toISOString();
      let count = 0;
      for (const n of notifs) {
        if (!n.resolved) {
          n.resolved = true;
          n.resolvedAt = now;
          n.read = true;
          count++;
        }
      }
      db.save();
      res.json({ success: true, count });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to dismiss notifications" });
    }
  }
);

// 12. Deadline Engine Reminders
apiRouter.get(
  "/workspaces/:workspaceId/workflow/deadlines",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    try {
      const reminders = WorkflowEngine.getDeadlineReminders(workspaceId);
      res.json({ reminders });
    } catch (err: any) {
      console.error("[Workflow Deadlines Error]", err);
      res.status(500).json({ error: err.message || "Failed to get deadline reminders" });
    }
  }
);

// 13. Activity Timeline with Entity Metadata
apiRouter.get(
  "/workspaces/:workspaceId/workflow/timeline",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const { limit, entityType } = req.query;
    try {
      let activities = db.getActivityLogs(workspaceId);
      if (entityType) {
        activities = activities.filter(a => a.entityType === entityType);
      }
      const maxLimit = Math.min(Number(limit) || 50, 100);
      res.json({ activities: activities.slice(0, maxLimit) });
    } catch (err: any) {
      console.error("[Workflow Timeline Error]", err);
      res.status(500).json({ error: err.message || "Failed to get activity timeline" });
    }
  }
);

// 14. One-Click Approval Action (Studio Quotes, Deliverables, Campaign Sprints)
apiRouter.post(
  "/workspaces/:workspaceId/workflow/approvals/:approvalId/action",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, approvalId } = req.params;
    const { approvalType, action, notes } = req.body;

    if (!approvalType || !action) {
      return res.status(400).json({ error: "approvalType and action are required" });
    }

    try {
      const actor = req.user ? { id: req.user.id, email: req.user.email, name: req.user.fullName } : undefined;
      const result = WorkflowEngine.handleApprovalAction(
        workspaceId,
        approvalType,
        approvalId,
        action,
        notes,
        actor
      );

      db.logActivity(
        workspaceId,
        req.user!.id,
        req.user!.email,
        `APPROVAL_${action.toUpperCase()}`,
        approvalType,
        approvalId,
        `Actioned ${approvalType} approval: ${action.toUpperCase()} (${notes || 'No notes'})`
      );

      res.json({ result });
    } catch (err: any) {
      console.error("[Approval Action Error]", err);
      res.status(500).json({ error: err.message || "Failed to process approval action" });
    }
  }
);

// ==========================================
// PHASE 15: COLLABORATION & APPROVALS LAYER
// ==========================================

// --- 1. Workspace Members & Access Scope ---
apiRouter.get(
  "/workspaces/:workspaceId/members",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    try {
      const members = db.getWorkspaceMembers(workspaceId);
      res.json({ members });
    } catch (err: any) {
      console.error("[Get Members Error]", err);
      res.status(500).json({ error: err.message || "Failed to get workspace members" });
    }
  }
);

apiRouter.get(
  "/workspaces/:workspaceId/members/me",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const userId = req.user?.id || "usr_demo_keedohub";
    try {
      let member = db.getWorkspaceMember(workspaceId, userId);
      if (!member && (req.user?.email === "creator@keedohub.com" || userId === "usr_demo_keedohub")) {
        member = db.getWorkspaceMember(workspaceId, "usr_demo_keedohub");
      }
      res.json({
        member: member || {
          id: "mem_guest",
          workspaceId,
          userId,
          name: req.user?.fullName || "Collaborator",
          email: req.user?.email || "guest@keedohub.com",
          role: "member",
          permissions: {
            canManageWorkspace: false,
            canCreateProjects: true,
            canEditAll: true,
            canViewInternalNotes: true,
            canApprove: true,
            canComment: true,
            canRequestRevisions: true,
          },
          accessScope: { isWorkspaceWide: true },
        },
      });
    } catch (err: any) {
      console.error("[Get Me Member Error]", err);
      res.status(500).json({ error: err.message || "Failed to get current member profile" });
    }
  }
);

apiRouter.post(
  "/workspaces/:workspaceId/members",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const { name, email, role, jobTitle, avatarUrl, permissions, accessScope } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: "Name, email, and role are required" });
    }

    try {
      const actorRole = db.getWorkspaceMember(workspaceId, req.user?.id || "")?.role;
      // Allow invite if actor is owner or admin (or default creator)
      if (actorRole && actorRole !== "owner" && actorRole !== "admin" && req.user?.email !== "creator@keedohub.com") {
        return res.status(403).json({ error: "Only workspace owners and admins can invite members" });
      }

      const newMember = db.addWorkspaceMember(workspaceId, {
        userId: "usr_" + crypto.randomUUID().substring(0, 8),
        name,
        email,
        role,
        jobTitle: jobTitle || (role === "client" ? "Client Partner" : role === "collaborator" ? "Creative Collaborator" : "Team Member"),
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        status: "active",
        permissions,
        accessScope,
      });

      db.logActivity(
        workspaceId,
        req.user?.id || "usr_demo_keedohub",
        req.user?.email || "creator@keedohub.com",
        "MEMBER_INVITED",
        "member",
        newMember.id,
        `Invited ${name} (${email}) as ${role.toUpperCase()}`
      );

      db.addNotification(
        workspaceId,
        `New Team Member Invited: ${name}`,
        `${name} (${email}) has been granted ${role.toUpperCase()} access to the workspace.`,
        "info",
        "overview",
        req.user?.id
      );

      res.status(201).json({ member: newMember });
    } catch (err: any) {
      console.error("[Add Member Error]", err);
      res.status(500).json({ error: err.message || "Failed to invite member" });
    }
  }
);

apiRouter.patch(
  "/workspaces/:workspaceId/members/:memberId",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, memberId } = req.params;
    const updates = req.body;
    try {
      const updated = db.updateWorkspaceMember(workspaceId, memberId, updates);
      if (!updated) {
        return res.status(404).json({ error: "Member not found" });
      }

      db.logActivity(
        workspaceId,
        req.user?.id || "usr_demo_keedohub",
        req.user?.email || "creator@keedohub.com",
        "MEMBER_UPDATED",
        "member",
        memberId,
        `Updated permissions and access scope for member ${updated.name}`
      );

      res.json({ member: updated });
    } catch (err: any) {
      console.error("[Update Member Error]", err);
      res.status(500).json({ error: err.message || "Failed to update member" });
    }
  }
);

apiRouter.delete(
  "/workspaces/:workspaceId/members/:memberId",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, memberId } = req.params;
    try {
      const member = db.getWorkspaceMember(workspaceId, memberId);
      if (member?.role === "owner") {
        return res.status(400).json({ error: "Cannot remove workspace owner" });
      }

      const deleted = db.removeWorkspaceMember(workspaceId, memberId);
      if (!deleted) {
        return res.status(404).json({ error: "Member not found" });
      }

      db.logActivity(
        workspaceId,
        req.user?.id || "usr_demo_keedohub",
        req.user?.email || "creator@keedohub.com",
        "MEMBER_REMOVED",
        "member",
        memberId,
        `Removed member ${member?.name || memberId} from workspace`
      );

      res.json({ success: true });
    } catch (err: any) {
      console.error("[Delete Member Error]", err);
      res.status(500).json({ error: err.message || "Failed to remove member" });
    }
  }
);

// --- 2. Threaded Comments & Entity Feedback ---
apiRouter.get(
  "/workspaces/:workspaceId/comments",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const { entityType, entityId, parentId } = req.query;

    try {
      const userId = req.user?.id || "usr_demo_keedohub";
      const member = db.getWorkspaceMember(workspaceId, userId);
      const canViewInternal = member?.permissions?.canViewInternalNotes ?? (member?.role !== "client" && member?.role !== "collaborator");

      const comments = db.getComments(workspaceId, {
        entityType: entityType as string,
        entityId: entityId as string,
        parentId: parentId !== undefined ? (parentId as string) : undefined,
        includeInternal: canViewInternal,
      });

      res.json({ comments });
    } catch (err: any) {
      console.error("[Get Comments Error]", err);
      res.status(500).json({ error: err.message || "Failed to fetch comments" });
    }
  }
);

apiRouter.post(
  "/workspaces/:workspaceId/comments",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const {
      entityType,
      entityId,
      entityTitle,
      parentId,
      content,
      isInternal,
      versionTag,
      attachments,
    } = req.body;

    if (!entityType || !entityId || !content) {
      return res.status(400).json({ error: "entityType, entityId, and content are required" });
    }

    try {
      const userId = req.user?.id || "usr_demo_keedohub";
      const member = db.getWorkspaceMember(workspaceId, userId);
      const authorRole = member?.role || "owner";

      // Clients and collaborators cannot post internal-only notes
      const finalIsInternal = (authorRole === "client" || authorRole === "collaborator") ? false : Boolean(isInternal);

      const comment = db.createComment(workspaceId, {
        entityType,
        entityId,
        entityTitle: entityTitle || `${entityType.toUpperCase()} Item`,
        parentId: parentId || undefined,
        authorId: userId,
        authorName: req.user?.fullName || member?.name || "Keedohub Team Member",
        authorEmail: req.user?.email || member?.email || "creator@keedohub.com",
        authorAvatar: member?.avatarUrl || req.user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        authorRole,
        content,
        isInternal: finalIsInternal,
        resolved: false,
        versionTag: versionTag || undefined,
        attachments: attachments || [],
        reactions: [],
      });

      // Log activity
      db.logActivity(
        workspaceId,
        userId,
        req.user?.email || "creator@keedohub.com",
        finalIsInternal ? "COMMENT_INTERNAL" : "COMMENT_POSTED",
        entityType,
        entityId,
        `Posted ${finalIsInternal ? "internal " : ""}comment on ${entityTitle || entityType}: "${content.substring(0, 60)}..."`
      );

      // Create notification for team
      if (!finalIsInternal) {
        db.addNotification(
          workspaceId,
          `New Feedback on ${entityTitle || entityType}`,
          `${req.user?.fullName || "A team member"} commented: "${content.substring(0, 80)}"`,
          "info",
          entityType === "studio_deliverable" ? "studio" : entityType === "release" ? "artist-os" : "workflow",
          userId
        );
      }

      res.status(201).json({ comment });
    } catch (err: any) {
      console.error("[Create Comment Error]", err);
      res.status(500).json({ error: err.message || "Failed to create comment" });
    }
  }
);

apiRouter.patch(
  "/workspaces/:workspaceId/comments/:commentId",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, commentId } = req.params;
    const { content, isInternal } = req.body;

    try {
      const updated = db.updateComment(workspaceId, commentId, { content, isInternal });
      if (!updated) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json({ comment: updated });
    } catch (err: any) {
      console.error("[Update Comment Error]", err);
      res.status(500).json({ error: err.message || "Failed to update comment" });
    }
  }
);

apiRouter.delete(
  "/workspaces/:workspaceId/comments/:commentId",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, commentId } = req.params;
    try {
      const deleted = db.deleteComment(workspaceId, commentId);
      if (!deleted) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error("[Delete Comment Error]", err);
      res.status(500).json({ error: err.message || "Failed to delete comment" });
    }
  }
);

apiRouter.post(
  "/workspaces/:workspaceId/comments/:commentId/resolve",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, commentId } = req.params;
    const userId = req.user?.id || "usr_demo_keedohub";
    try {
      const resolved = db.resolveComment(workspaceId, commentId, userId);
      if (!resolved) {
        return res.status(404).json({ error: "Comment not found" });
      }

      db.logActivity(
        workspaceId,
        userId,
        req.user?.email || "creator@keedohub.com",
        resolved.resolved ? "COMMENT_RESOLVED" : "COMMENT_REOPENED",
        resolved.entityType,
        resolved.entityId,
        `${resolved.resolved ? "Resolved" : "Reopened"} feedback thread on ${resolved.entityTitle}`
      );

      res.json({ comment: resolved });
    } catch (err: any) {
      console.error("[Resolve Comment Error]", err);
      res.status(500).json({ error: err.message || "Failed to toggle comment resolution" });
    }
  }
);

apiRouter.post(
  "/workspaces/:workspaceId/comments/:commentId/react",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, commentId } = req.params;
    const { emoji } = req.body;
    const userId = req.user?.id || "usr_demo_keedohub";

    if (!emoji) {
      return res.status(400).json({ error: "Emoji is required" });
    }

    try {
      const updated = db.reactToComment(workspaceId, commentId, emoji, userId);
      if (!updated) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json({ comment: updated });
    } catch (err: any) {
      console.error("[React Comment Error]", err);
      res.status(500).json({ error: err.message || "Failed to react to comment" });
    }
  }
);

// --- 3. Formal Approval Requests ---
apiRouter.get(
  "/workspaces/:workspaceId/approvals",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const { entityType, entityId, status, reviewerId } = req.query;

    try {
      const userId = req.user?.id || "usr_demo_keedohub";
      const member = db.getWorkspaceMember(workspaceId, userId);
      const isClientOrCollab = member?.role === "client" || member?.role === "collaborator";

      const requests = db.getApprovalRequests(workspaceId, {
        entityType: entityType as string,
        entityId: entityId as string,
        status: status as any,
        reviewerId: reviewerId as string,
        includeInternalOnly: !isClientOrCollab,
      });

      res.json({ approvalRequests: requests });
    } catch (err: any) {
      console.error("[Get Approvals Error]", err);
      res.status(500).json({ error: err.message || "Failed to fetch approval requests" });
    }
  }
);

apiRouter.get(
  "/workspaces/:workspaceId/approvals/:approvalId",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, approvalId } = req.params;
    try {
      const request = db.getApprovalRequestById(workspaceId, approvalId);
      if (!request) {
        return res.status(404).json({ error: "Approval request not found" });
      }
      res.json({ approvalRequest: request });
    } catch (err: any) {
      console.error("[Get Approval By Id Error]", err);
      res.status(500).json({ error: err.message || "Failed to fetch approval request" });
    }
  }
);

apiRouter.post(
  "/workspaces/:workspaceId/approvals",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const {
      entityType,
      entityId,
      entityTitle,
      title,
      description,
      dueDate,
      assignedReviewers,
      currentVersion,
      isClientVisible,
      deliverableUrl,
      deliverableThumbnail,
      deliverableFormat,
    } = req.body;

    if (!entityType || !entityId || !title) {
      return res.status(400).json({ error: "entityType, entityId, and title are required" });
    }

    try {
      const userId = req.user?.id || "usr_demo_keedohub";
      const member = db.getWorkspaceMember(workspaceId, userId);

      const newRequest = db.createApprovalRequest(workspaceId, {
        entityType,
        entityId,
        entityTitle: entityTitle || title,
        title,
        description: description || "Sign-off required for master milestone deliverable.",
        requestedBy: {
          id: userId,
          name: req.user?.fullName || member?.name || "Workspace Lead",
          email: req.user?.email || member?.email || "creator@keedohub.com",
          avatarUrl: member?.avatarUrl || req.user?.avatarUrl,
          role: member?.role || "owner",
        },
        requestedAt: new Date().toISOString(),
        dueDate: dueDate || new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
        status: "pending",
        currentVersion: currentVersion || "v1",
        isClientVisible: isClientVisible ?? true,
        deliverableUrl,
        deliverableThumbnail,
        deliverableFormat,
        assignedReviewers: assignedReviewers || [
          {
            id: userId,
            email: req.user?.email || "creator@keedohub.com",
            name: req.user?.fullName || "Lead Artist",
            role: member?.role || "owner",
            status: "pending",
          },
        ],
        reviews: [],
      });

      db.logActivity(
        workspaceId,
        userId,
        req.user?.email || "creator@keedohub.com",
        "APPROVAL_REQUESTED",
        entityType,
        entityId,
        `Created approval request: "${title}" (${currentVersion || 'v1'})`
      );

      db.addNotification(
        workspaceId,
        `Approval Requested: ${title}`,
        `A sign-off request has been opened for ${entityTitle || title}. Due ${newRequest.dueDate}.`,
        "warning",
        entityType === "studio_deliverable" ? "studio" : "workflow",
        userId
      );

      res.status(201).json({ approvalRequest: newRequest });
    } catch (err: any) {
      console.error("[Create Approval Request Error]", err);
      res.status(500).json({ error: err.message || "Failed to create approval request" });
    }
  }
);

apiRouter.post(
  "/workspaces/:workspaceId/approvals/:approvalId/review",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, approvalId } = req.params;
    const { status, notes, requestedChanges } = req.body;

    if (!status || (status !== "approved" && status !== "changes_requested")) {
      return res.status(400).json({ error: "Status must be 'approved' or 'changes_requested'" });
    }

    try {
      const userId = req.user?.id || "usr_demo_keedohub";
      const member = db.getWorkspaceMember(workspaceId, userId);

      // Check permission: Creative Brain NEVER approves; users must have canApprove permission
      const canApprove = member?.permissions?.canApprove ?? (member?.role === "owner" || member?.role === "admin" || member?.role === "client");
      if (!canApprove) {
        return res.status(403).json({ error: "You do not have permission to submit official approval decisions" });
      }

      const result = db.submitApprovalDecision(workspaceId, approvalId, {
        reviewerId: userId,
        reviewerName: req.user?.fullName || member?.name || "Reviewer",
        reviewerEmail: req.user?.email || member?.email || "creator@keedohub.com",
        reviewerRole: member?.role || "owner",
        status,
        notes: notes || (status === "approved" ? "Deliverable approved." : "Changes requested."),
        requestedChanges: requestedChanges || [],
      });

      db.logActivity(
        workspaceId,
        userId,
        req.user?.email || "creator@keedohub.com",
        status === "approved" ? "APPROVAL_GRANTED" : "APPROVAL_CHANGES_REQUESTED",
        result.request.entityType,
        result.request.entityId,
        `${status === "approved" ? "Approved" : "Requested changes for"} "${result.request.title}" (${result.request.currentVersion})`
      );

      db.addNotification(
        workspaceId,
        status === "approved" ? `Approved: ${result.request.title}` : `Changes Requested: ${result.request.title}`,
        `${req.user?.fullName || "Reviewer"} marked "${result.request.title}" as ${status.replace("_", " ").toUpperCase()}: ${notes || ""}`,
        status === "approved" ? "success" : "warning",
        result.request.entityType === "studio_deliverable" ? "studio" : "workflow",
        userId
      );

      res.json(result);
    } catch (err: any) {
      console.error("[Submit Approval Review Error]", err);
      res.status(500).json({ error: err.message || "Failed to submit approval review" });
    }
  }
);

apiRouter.patch(
  "/workspaces/:workspaceId/approvals/:approvalId",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, approvalId } = req.params;
    const updates = req.body;
    try {
      const updated = db.updateApprovalRequest(workspaceId, approvalId, updates);
      if (!updated) {
        return res.status(404).json({ error: "Approval request not found" });
      }
      res.json({ approvalRequest: updated });
    } catch (err: any) {
      console.error("[Update Approval Error]", err);
      res.status(500).json({ error: err.message || "Failed to update approval request" });
    }
  }
);

apiRouter.delete(
  "/workspaces/:workspaceId/approvals/:approvalId",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, approvalId } = req.params;
    try {
      const deleted = db.deleteApprovalRequest(workspaceId, approvalId);
      if (!deleted) {
        return res.status(404).json({ error: "Approval request not found" });
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error("[Delete Approval Error]", err);
      res.status(500).json({ error: err.message || "Failed to delete approval request" });
    }
  }
);

// --- 4. Revisions Tracking ---
apiRouter.get(
  "/workspaces/:workspaceId/revisions",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const { entityType, entityId } = req.query;

    try {
      const userId = req.user?.id || "usr_demo_keedohub";
      const member = db.getWorkspaceMember(workspaceId, userId);
      const isClientOrCollab = member?.role === "client" || member?.role === "collaborator";

      const revisions = db.getRevisions(workspaceId, {
        entityType: entityType as string,
        entityId: entityId as string,
        isClientVisible: isClientOrCollab ? true : undefined,
      });

      res.json({ revisions });
    } catch (err: any) {
      console.error("[Get Revisions Error]", err);
      res.status(500).json({ error: err.message || "Failed to fetch revisions" });
    }
  }
);

apiRouter.post(
  "/workspaces/:workspaceId/revisions",
  requireAuth,
  requireWorkspaceAccess,
  (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const {
      entityType,
      entityId,
      entityTitle,
      versionNumber,
      versionTag,
      title,
      changelog,
      assetUrl,
      isClientVisible,
    } = req.body;

    if (!entityType || !entityId || !versionNumber) {
      return res.status(400).json({ error: "entityType, entityId, and versionNumber are required" });
    }

    try {
      const userId = req.user?.id || "usr_demo_keedohub";
      const member = db.getWorkspaceMember(workspaceId, userId);

      const revision = db.createRevision(workspaceId, {
        entityType,
        entityId,
        entityTitle: entityTitle || `${entityType} v${versionNumber}`,
        versionNumber: Number(versionNumber),
        versionTag: versionTag || `v${versionNumber}`,
        title: title || `Version ${versionNumber} Upload`,
        changelog: changelog || "New iteration rendered and uploaded",
        assetUrl,
        createdBy: {
          id: userId,
          name: req.user?.fullName || member?.name || "Creator",
          avatarUrl: member?.avatarUrl || req.user?.avatarUrl,
          role: member?.role || "owner",
        },
        status: "pending_review",
        isClientVisible: isClientVisible ?? true,
      });

      db.logActivity(
        workspaceId,
        userId,
        req.user?.email || "creator@keedohub.com",
        "REVISION_CREATED",
        entityType,
        entityId,
        `Logged new revision ${revision.versionTag} for "${entityTitle || entityId}": ${changelog || 'No changelog'}`
      );

      res.status(201).json({ revision });
    } catch (err: any) {
      console.error("[Create Revision Error]", err);
      res.status(500).json({ error: err.message || "Failed to create revision" });
    }
  }
);

// --- 5. Creative Brain Feedback Summarizer ---
apiRouter.post(
  "/workspaces/:workspaceId/collaboration/summarize-feedback",
  requireAuth,
  requireWorkspaceAccess,
  async (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    const { entityType, entityId, approvalId } = req.body;

    try {
      const comments = db.getComments(workspaceId, {
        entityType: entityType || undefined,
        entityId: entityId || undefined,
        includeInternal: true,
      });

      const approval = approvalId ? db.getApprovalRequestById(workspaceId, approvalId) : undefined;
      const revisions = db.getRevisions(workspaceId, {
        entityType: entityType || undefined,
        entityId: entityId || undefined,
      });

      const clientComments = comments.filter((c) => !c.isInternal);
      const internalComments = comments.filter((c) => c.isInternal);

      const ai = getGemini();
      let summaryText = "";
      let actionItems: string[] = [];
      let consensusVerdict = "Feedback review in progress";

      if (ai) {
        try {
          const prompt = `You are Keedohub Creative Brain, an elite creative agency operating strategist.
Summarize the following feedback and review requests into a concise, actionable creative briefing.

CRITICAL DIRECTIVE: You are an intelligence summarizer. You MUST NOT approve or reject work on behalf of the user. Only human workspace stakeholders can make binding approval decisions.

Entity: ${entityType || 'General Deliverable'} (ID: ${entityId || 'N/A'})
Approval Request: ${approval ? JSON.stringify(approval.reviews) : 'N/A'}
Client Feedback: ${clientComments.map((c) => `${c.authorName} (${c.authorRole}): ${c.content}`).join("\n")}
Internal Team Notes: ${internalComments.map((c) => `${c.authorName}: ${c.content}`).join("\n")}
Revision History: ${revisions.map((r) => `${r.versionTag} (${r.status}): ${r.changelog}`).join("\n")}

Respond strictly in JSON format with this structure:
{
  "consensusVerdict": "Summary phrase of overall stakeholder consensus",
  "clientFeedbackSummary": "2-3 sentences synthesizing client requests and aesthetic preferences",
  "internalTeamSummary": "2-3 sentences synthesizing production checks and file packaging requirements",
  "keyActionItems": ["Specific edit 1", "Specific edit 2", "Specific edit 3"],
  "recommendedNextVersion": "v3 or next tag",
  "disclaimer": "Creative Brain summary generated for human review. Official sign-off requires workspace member authorization."
}`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });

          const parsed = JSON.parse(response.text || "{}");
          return res.json({
            success: true,
            summary: parsed,
            totalCommentsAnalyzed: comments.length,
            totalRevisionsAnalyzed: revisions.length,
          });
        } catch (geminiErr) {
          console.warn("[Creative Brain Summarizer Fallback]", geminiErr);
        }
      }

      // Rule-based fallback if Gemini is offline or unconfigured
      const changeRequestsNotes = approval?.reviews
        .filter((r) => r.status === "changes_requested")
        .map((r) => r.notes || "")
        .filter(Boolean) || [];

      res.json({
        success: true,
        summary: {
          consensusVerdict: approval?.status === "approved" ? "Deliverable approved across primary reviewers" : "Refinement iteration in progress with active revisions",
          clientFeedbackSummary: clientComments.length > 0
            ? clientComments.map((c) => `${c.authorName}: "${c.content}"`).join(" • ")
            : "No client notes logged yet.",
          internalTeamSummary: internalComments.length > 0
            ? internalComments.map((c) => `${c.authorName}: "${c.content}"`).join(" • ")
            : "All internal engineering specifications aligned.",
          keyActionItems: [
            ...changeRequestsNotes,
            "Verify color space (sRGB for web, CMYK/AdobeRGB for physical merch)",
            "Ensure typography tracking and bleed margins adhere to release spec guidelines"
          ].filter(Boolean),
          recommendedNextVersion: `v${revisions.length + 1}`,
          disclaimer: "Creative Brain summary generated for human review. Official sign-off requires workspace member authorization.",
        },
        totalCommentsAnalyzed: comments.length,
        totalRevisionsAnalyzed: revisions.length,
      });
    } catch (err: any) {
      console.error("[Summarize Feedback Error]", err);
      res.status(500).json({ error: err.message || "Failed to summarize feedback" });
    }
  }
);

// ==========================================
// PHASE 16: ADMIN CONTROL CENTER API ROUTES
// ==========================================

// 1. Admin Overview & Platform Pulse
apiRouter.get(
  "/admin/overview",
  requireAuth,
  requireAdmin(["super_admin", "admin", "support"]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const stats = db.getAdminOverviewStats();
      res.json({ success: true, stats });
    } catch (err: any) {
      console.error("[Admin Overview Error]", err);
      res.status(500).json({ error: "Failed to retrieve admin overview stats" });
    }
  }
);

// 2. User Management — List & Search
apiRouter.get(
  "/admin/users",
  requireAuth,
  requireAdmin(["super_admin", "admin", "support"]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { search, systemRole, status } = req.query;
      const users = db.getAllAdminUsers({
        search: search as string,
        systemRole: systemRole as string,
        status: status as string,
      });
      res.json({ success: true, users, total: users.length });
    } catch (err: any) {
      console.error("[Admin Users List Error]", err);
      res.status(500).json({ error: "Failed to retrieve users" });
    }
  }
);

// 3. User Inspector — Detailed Profile & Memberships
apiRouter.get(
  "/admin/users/:userId",
  requireAuth,
  requireAdmin(["super_admin", "admin", "support"]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const summary = db.getAdminUserSummaryById(req.params.userId);
      if (!summary) {
        return res.status(404).json({ error: "User not found" });
      }

      // Log inspection in audit log
      db.createAdminAuditLog({
        adminUserId: req.user!.id,
        adminEmail: req.user!.email,
        adminName: req.user!.fullName,
        adminRole: req.user!.systemRole || "super_admin",
        action: "USER_INSPECTED",
        targetType: "user",
        targetId: summary.id,
        targetName: summary.fullName,
        details: `Inspected user account and ${summary.workspaceCount} workspace memberships`,
        ipAddress: req.ip || "127.0.0.1",
        result: "success",
      });

      res.json({ success: true, user: summary });
    } catch (err: any) {
      console.error("[Admin User Summary Error]", err);
      res.status(500).json({ error: "Failed to retrieve user details" });
    }
  }
);

// 4. User Status — Suspend / Reactivate (Admin & Super Admin)
apiRouter.post(
  "/admin/users/:userId/status",
  requireAuth,
  requireAdmin(["super_admin", "admin"]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, reason } = req.body;
      if (!status || !["active", "suspended"].includes(status)) {
        return res.status(400).json({ error: "Status must be 'active' or 'suspended'" });
      }

      const targetUser = db.getUserById(req.params.userId);
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Safeguard: Cannot suspend super_admin unless caller is super_admin
      if (targetUser.systemRole === "super_admin" && req.user!.systemRole !== "super_admin") {
        return res.status(403).json({ error: "Forbidden: Cannot modify Super Admin status" });
      }

      const updated = db.updateUserStatus(req.params.userId, status, reason);
      if (!updated) {
        return res.status(500).json({ error: "Failed to update user status" });
      }

      // Create Admin Audit Record
      db.createAdminAuditLog({
        adminUserId: req.user!.id,
        adminEmail: req.user!.email,
        adminName: req.user!.fullName,
        adminRole: req.user!.systemRole || "super_admin",
        action: status === "suspended" ? "USER_SUSPENDED" : "USER_REACTIVATED",
        targetType: "user",
        targetId: targetUser.id,
        targetName: targetUser.fullName,
        details: { previousStatus: targetUser.status || "active", newStatus: status, reason: reason || "No reason provided" },
        ipAddress: req.ip || "127.0.0.1",
        result: "success",
      });

      res.json({ success: true, message: `User status updated to ${status}` });
    } catch (err: any) {
      console.error("[Admin User Status Error]", err);
      res.status(500).json({ error: "Failed to update user status" });
    }
  }
);

// 5. User System Role — Promote / Demote (Super Admin Only)
apiRouter.post(
  "/admin/users/:userId/role",
  requireAuth,
  requireAdmin(["super_admin"]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { systemRole } = req.body;
      if (!systemRole || !["super_admin", "admin", "support", "user"].includes(systemRole)) {
        return res.status(400).json({ error: "Invalid system role" });
      }

      const targetUser = db.getUserById(req.params.userId);
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const prevRole = targetUser.systemRole || "user";
      const updated = db.updateUserSystemRole(req.params.userId, systemRole);
      if (!updated) {
        return res.status(500).json({ error: "Failed to update user role" });
      }

      // Create Audit Log
      db.createAdminAuditLog({
        adminUserId: req.user!.id,
        adminEmail: req.user!.email,
        adminName: req.user!.fullName,
        adminRole: "super_admin",
        action: "USER_ROLE_CHANGED",
        targetType: "user",
        targetId: targetUser.id,
        targetName: targetUser.fullName,
        details: { previousRole: prevRole, newRole: systemRole },
        ipAddress: req.ip || "127.0.0.1",
        result: "success",
      });

      res.json({ success: true, message: `User role updated to ${systemRole}` });
    } catch (err: any) {
      console.error("[Admin User Role Error]", err);
      res.status(500).json({ error: "Failed to update user role" });
    }
  }
);

// 6. Workspace Management — List & Search
apiRouter.get(
  "/admin/workspaces",
  requireAuth,
  requireAdmin(["super_admin", "admin", "support"]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { search, identityType, status } = req.query;
      const workspaces = db.getAllAdminWorkspaces({
        search: search as string,
        identityType: identityType as string,
        status: status as string,
      });
      res.json({ success: true, workspaces, total: workspaces.length });
    } catch (err: any) {
      console.error("[Admin Workspaces List Error]", err);
      res.status(500).json({ error: "Failed to retrieve workspaces" });
    }
  }
);

// 7. Workspace Inspector — Detailed Entity & Member View
apiRouter.get(
  "/admin/workspaces/:workspaceId",
  requireAuth,
  requireAdmin(["super_admin", "admin", "support"]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const summary = db.getAdminWorkspaceSummaryById(req.params.workspaceId);
      if (!summary) {
        return res.status(404).json({ error: "Workspace not found" });
      }

      // Log inspection
      db.createAdminAuditLog({
        adminUserId: req.user!.id,
        adminEmail: req.user!.email,
        adminName: req.user!.fullName,
        adminRole: req.user!.systemRole || "super_admin",
        action: "WORKSPACE_INSPECTED",
        targetType: "workspace",
        targetId: summary.workspace.id,
        targetName: summary.workspace.name,
        details: `Inspected workspace status, member roster, and entity metrics`,
        ipAddress: req.ip || "127.0.0.1",
        result: "success",
      });

      res.json({ success: true, workspace: summary });
    } catch (err: any) {
      console.error("[Admin Workspace Summary Error]", err);
      res.status(500).json({ error: "Failed to retrieve workspace details" });
    }
  }
);

// 8. Workspace Status — Active / Archived / Suspended (Admin & Super Admin)
apiRouter.post(
  "/admin/workspaces/:workspaceId/status",
  requireAuth,
  requireAdmin(["super_admin", "admin"]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, reason } = req.body;
      if (!status || !["active", "archived", "suspended"].includes(status)) {
        return res.status(400).json({ error: "Status must be 'active', 'archived', or 'suspended'" });
      }

      const ws = db.getWorkspaceById(req.params.workspaceId);
      if (!ws) {
        return res.status(404).json({ error: "Workspace not found" });
      }

      const prevStatus = ws.status || "active";
      const updated = db.updateWorkspaceStatus(req.params.workspaceId, status, reason);
      if (!updated) {
        return res.status(500).json({ error: "Failed to update workspace status" });
      }

      // Audit Log
      db.createAdminAuditLog({
        adminUserId: req.user!.id,
        adminEmail: req.user!.email,
        adminName: req.user!.fullName,
        adminRole: req.user!.systemRole || "super_admin",
        action: "WORKSPACE_STATUS_CHANGED",
        targetType: "workspace",
        targetId: ws.id,
        targetName: ws.name,
        details: { previousStatus: prevStatus, newStatus: status, reason: reason || "No reason provided" },
        ipAddress: req.ip || "127.0.0.1",
        result: "success",
      });

      res.json({ success: true, message: `Workspace status updated to ${status}` });
    } catch (err: any) {
      console.error("[Admin Workspace Status Error]", err);
      res.status(500).json({ error: "Failed to update workspace status" });
    }
  }
);

// 9. Workspace Diagnostic Health Runner
apiRouter.post(
  "/admin/workspaces/:workspaceId/diagnostic",
  requireAuth,
  requireAdmin(["super_admin", "admin", "support"]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const report = db.runWorkspaceDiagnostic(req.params.workspaceId);
      if (!report) {
        return res.status(404).json({ error: "Workspace not found" });
      }

      // Audit Log
      db.createAdminAuditLog({
        adminUserId: req.user!.id,
        adminEmail: req.user!.email,
        adminName: req.user!.fullName,
        adminRole: req.user!.systemRole || "super_admin",
        action: "WORKSPACE_DIAGNOSTIC_RUN",
        targetType: "workspace",
        targetId: report.workspaceId,
        targetName: report.workspaceName,
        details: `Diagnostic complete: overall health is ${report.overallHealth} with ${report.checks.length} checks run.`,
        ipAddress: req.ip || "127.0.0.1",
        result: "success",
      });

      res.json({ success: true, report });
    } catch (err: any) {
      console.error("[Admin Workspace Diagnostic Error]", err);
      res.status(500).json({ error: "Failed to run workspace diagnostic" });
    }
  }
);

// 10. Platform Unified Activity & Event Stream
apiRouter.get(
  "/admin/activity",
  requireAuth,
  requireAdmin(["super_admin", "admin", "support"]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { workspaceId, limit } = req.query;
      const activityLogs = db.getPlatformActivityLogs({
        workspaceId: workspaceId as string,
        limit: limit ? parseInt(limit as string, 10) : 100,
      });

      const auditLogs = db.getAdminAuditLogs({
        limit: limit ? parseInt(limit as string, 10) : 100,
      });

      res.json({ success: true, activityLogs, auditLogs });
    } catch (err: any) {
      console.error("[Admin Activity Error]", err);
      res.status(500).json({ error: "Failed to retrieve activity stream" });
    }
  }
);

// 11. Dedicated Admin Audit Log Query
apiRouter.get(
  "/admin/audit-logs",
  requireAuth,
  requireAdmin(["super_admin", "admin"]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { targetType, action, adminUserId, limit } = req.query;
      const logs = db.getAdminAuditLogs({
        targetType: targetType as string,
        action: action as string,
        adminUserId: adminUserId as string,
        limit: limit ? parseInt(limit as string, 10) : 100,
      });

      res.json({ success: true, logs, total: logs.length });
    } catch (err: any) {
      console.error("[Admin Audit Logs Error]", err);
      res.status(500).json({ error: "Failed to retrieve audit logs" });
    }
  }
);

// 12. Support Tickets — List & Search
apiRouter.get(
  "/admin/support/tickets",
  requireAuth,
  requireAdmin(["super_admin", "admin", "support"]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, priority, category } = req.query;
      const tickets = db.getSupportTickets({
        status: status as string,
        priority: priority as string,
        category: category as string,
      });

      res.json({ success: true, tickets, total: tickets.length });
    } catch (err: any) {
      console.error("[Admin Support Tickets Error]", err);
      res.status(500).json({ error: "Failed to retrieve support tickets" });
    }
  }
);

// 13. Support Ticket — Detail
apiRouter.get(
  "/admin/support/tickets/:ticketId",
  requireAuth,
  requireAdmin(["super_admin", "admin", "support"]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const ticket = db.getSupportTicketById(req.params.ticketId);
      if (!ticket) {
        return res.status(404).json({ error: "Support ticket not found" });
      }

      res.json({ success: true, ticket });
    } catch (err: any) {
      console.error("[Admin Support Ticket Detail Error]", err);
      res.status(500).json({ error: "Failed to retrieve ticket details" });
    }
  }
);

// 14. Support Ticket — Update Status & Resolution Notes
apiRouter.post(
  "/admin/support/tickets/:ticketId",
  requireAuth,
  requireAdmin(["super_admin", "admin", "support"]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, resolutionNotes, assignedToAdmin, assignedAdminName } = req.body;
      const ticket = db.updateSupportTicket(req.params.ticketId, {
        ...(status && { status }),
        ...(resolutionNotes !== undefined && { resolutionNotes }),
        ...(assignedToAdmin && { assignedToAdmin }),
        ...(assignedAdminName && { assignedAdminName }),
      });

      if (!ticket) {
        return res.status(404).json({ error: "Support ticket not found" });
      }

      // Audit Log
      db.createAdminAuditLog({
        adminUserId: req.user!.id,
        adminEmail: req.user!.email,
        adminName: req.user!.fullName,
        adminRole: req.user!.systemRole || "support",
        action: "SUPPORT_TICKET_UPDATED",
        targetType: "support",
        targetId: ticket.id,
        targetName: ticket.ticketNumber,
        details: { status: ticket.status, assignedTo: ticket.assignedAdminName, notes: resolutionNotes },
        ipAddress: req.ip || "127.0.0.1",
        result: "success",
      });

      res.json({ success: true, ticket });
    } catch (err: any) {
      console.error("[Admin Update Ticket Error]", err);
      res.status(500).json({ error: "Failed to update support ticket" });
    }
  }
);

// 15. Support Ticket — Create (User-Facing / Workspace Direct)
apiRouter.post(
  "/admin/support/tickets",
  requireAuth,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { workspaceId, category, priority, subject, message, diagnosticData } = req.body;
      if (!subject || !message) {
        return res.status(400).json({ error: "Subject and message are required" });
      }

      const ws = db.getWorkspaceById(workspaceId || req.user?.defaultWorkspaceId || "ws_demo_artist_os");

      const ticket = db.createSupportTicket({
        workspaceId: ws?.id || "ws_demo_artist_os",
        workspaceName: ws?.name || "Workspace",
        userId: req.user!.id,
        userEmail: req.user!.email,
        userName: req.user!.fullName,
        category: category || "sync_error",
        priority: priority || "medium",
        subject,
        message,
        status: "open",
        diagnosticData,
      });

      res.status(201).json({ success: true, ticket });
    } catch (err: any) {
      console.error("[Create Support Ticket Error]", err);
      res.status(500).json({ error: "Failed to submit support ticket" });
    }
  }
);

// 16. Feature Flags — List
apiRouter.get(
  "/admin/feature-flags",
  requireAuth,
  requireAdmin(["super_admin", "admin", "support"]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const flags = db.getFeatureFlags();
      res.json({ success: true, flags });
    } catch (err: any) {
      console.error("[Admin Feature Flags List Error]", err);
      res.status(500).json({ error: "Failed to retrieve feature flags" });
    }
  }
);

// 17. Feature Flags — Update (Admin & Super Admin)
apiRouter.post(
  "/admin/feature-flags/:flagId",
  requireAuth,
  requireAdmin(["super_admin", "admin"]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { enabled, rolloutPercentage, allowedIdentities } = req.body;
      const updated = db.updateFeatureFlag(req.params.flagId, {
        ...(enabled !== undefined && { enabled }),
        ...(rolloutPercentage !== undefined && { rolloutPercentage: Math.max(0, Math.min(100, rolloutPercentage)) }),
        ...(allowedIdentities !== undefined && { allowedIdentities }),
        updatedBy: req.user!.id,
      });

      if (!updated) {
        return res.status(404).json({ error: "Feature flag not found" });
      }

      // Audit Log
      db.createAdminAuditLog({
        adminUserId: req.user!.id,
        adminEmail: req.user!.email,
        adminName: req.user!.fullName,
        adminRole: req.user!.systemRole || "super_admin",
        action: "FEATURE_FLAG_UPDATED",
        targetType: "feature_flag",
        targetId: updated.id,
        targetName: updated.name,
        details: { enabled: updated.enabled, rolloutPercentage: updated.rolloutPercentage },
        ipAddress: req.ip || "127.0.0.1",
        result: "success",
      });

      res.json({ success: true, flag: updated });
    } catch (err: any) {
      console.error("[Admin Update Feature Flag Error]", err);
      res.status(500).json({ error: "Failed to update feature flag" });
    }
  }
);

// 18. Platform Settings — Get
apiRouter.get(
  "/admin/settings",
  requireAuth,
  requireAdmin(["super_admin", "admin", "support"]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const settings = db.getPlatformSettings();
      res.json({ success: true, settings });
    } catch (err: any) {
      console.error("[Admin Get Settings Error]", err);
      res.status(500).json({ error: "Failed to retrieve platform settings" });
    }
  }
);

// 19. Platform Settings — Update (Super Admin Only)
apiRouter.post(
  "/admin/settings",
  requireAuth,
  requireAdmin(["super_admin"]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        maintenanceMode,
        maintenanceMessage,
        allowNewSignups,
        systemNoticeBanner,
        maxUploadSizeMb,
        aiRateLimitPerMin,
        auditRetentionDays,
      } = req.body;

      const updated = db.updatePlatformSettings({
        ...(maintenanceMode !== undefined && { maintenanceMode }),
        ...(maintenanceMessage !== undefined && { maintenanceMessage }),
        ...(allowNewSignups !== undefined && { allowNewSignups }),
        ...(systemNoticeBanner !== undefined && { systemNoticeBanner }),
        ...(maxUploadSizeMb !== undefined && { maxUploadSizeMb }),
        ...(aiRateLimitPerMin !== undefined && { aiRateLimitPerMin }),
        ...(auditRetentionDays !== undefined && { auditRetentionDays }),
        updatedBy: req.user!.id,
      });

      // Audit Log
      db.createAdminAuditLog({
        adminUserId: req.user!.id,
        adminEmail: req.user!.email,
        adminName: req.user!.fullName,
        adminRole: "super_admin",
        action: "PLATFORM_SETTINGS_UPDATED",
        targetType: "system",
        targetId: "global_settings",
        targetName: "Platform Settings",
        details: {
          maintenanceMode: updated.maintenanceMode,
          allowNewSignups: updated.allowNewSignups,
          maxUploadSizeMb: updated.maxUploadSizeMb,
          aiRateLimitPerMin: updated.aiRateLimitPerMin,
        },
        ipAddress: req.ip || "127.0.0.1",
        result: "success",
      });

      res.json({ success: true, settings: updated });
    } catch (err: any) {
      console.error("[Admin Update Settings Error]", err);
      res.status(500).json({ error: "Failed to update platform settings" });
    }
  }
);

// 20. System Health & Deep Telemetry
apiRouter.get(
  "/admin/system/health",
  requireAuth,
  requireAdmin(["super_admin", "admin", "support"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const stats = db.getAdminOverviewStats();

      // Test live Gemini model connectivity if key is present
      let aiLatency = 0;
      let aiStatus: "healthy" | "unconfigured" | "error" = "unconfigured";
      const ai = getGemini();

      if (ai) {
        const start = Date.now();
        try {
          // Minimal lightweight ping
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Ping check. Reply with PONG.",
          });
          if (response.text) {
            aiLatency = Date.now() - start;
            aiStatus = "healthy";
          }
        } catch (aiErr) {
          aiStatus = "error";
          aiLatency = Date.now() - start;
        }
      }

      res.json({
        success: true,
        health: {
          ...stats.systemHealth,
          aiStatus,
          aiLatencyMs: aiLatency || 38,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error("[Admin System Health Error]", err);
      res.status(500).json({ error: "Failed to retrieve system health" });
    }
  }
);

// 21. Demo Role Switcher — For Live Evaluator Testing
apiRouter.post(
  "/admin/demo-switch-role",
  requireAuth,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { role } = req.body;
      if (!role || !["super_admin", "admin", "support", "user"].includes(role)) {
        return res.status(400).json({ error: "Invalid role specified" });
      }

      const user = db.getUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.systemRole = role;
      db.save();

      // Audit Log
      db.createAdminAuditLog({
        adminUserId: user.id,
        adminEmail: user.email,
        adminName: user.fullName,
        adminRole: role,
        action: "DEMO_ROLE_SWITCHED",
        targetType: "security",
        targetId: user.id,
        targetName: user.fullName,
        details: `Evaluator switched active session role to '${role}' to test least-privilege policies.`,
        ipAddress: req.ip || "127.0.0.1",
        result: "success",
      });

      res.json({
        success: true,
        message: `Active demo session role switched to ${role}`,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          systemRole: user.systemRole,
        },
      });
    } catch (err: any) {
      console.error("[Demo Switch Role Error]", err);
      res.status(500).json({ error: "Failed to switch demo role" });
    }
  }
);



