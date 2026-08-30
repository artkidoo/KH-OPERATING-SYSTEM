import { db, ActivityLogRecord, ReleaseRecord, CampaignRecord, ProjectRecord, ContentItemRecord, AssetRecord, TaskItem, MilestoneRecord, StudioRequestRecord, ProductServiceRecord, BrandCoreRecord } from "../db";
import { CreativeRadarService } from "../radar/creativeRadarService";

export interface NextActionItem {
  id: string;
  title: string;
  reason: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  category: 'release' | 'campaign' | 'studio' | 'project' | 'content' | 'asset' | 'system';
  actionTab: string;
  actionLabel: string;
  entityId?: string;
  entityType?: string;
  badge: string;
}

export interface CommandCenterItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'release' | 'campaign' | 'project' | 'content' | 'task' | 'milestone' | 'studio' | 'radar';
  status: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  dueDate?: string;
  actionTab: string;
  actionLabel: string;
  entityId?: string;
  progress?: number;
  badge?: string;
}

export interface EntityRelationConnection {
  targetType: 'release' | 'campaign' | 'project' | 'content' | 'asset' | 'task' | 'studio_request' | 'radar_signal';
  targetId: string;
  targetTitle: string;
  relationship: string;
  actionTab: string;
  status?: string;
}

export interface EntityRelationNode {
  id: string;
  entityType: 'release' | 'campaign' | 'product' | 'project';
  title: string;
  subtitle?: string;
  status: string;
  actionTab: string;
  connections: EntityRelationConnection[];
}

export interface GlobalSearchResultItem {
  id: string;
  type: 'release' | 'campaign' | 'project' | 'content' | 'asset' | 'task' | 'milestone' | 'studio_request' | 'product' | 'service' | 'memory';
  title: string;
  subtitle: string;
  badge: string;
  actionTab: string;
  actionLabel: string;
  matchReason?: string;
  data?: any;
}

export class CommandCenterService {
  private radarService: CreativeRadarService;

  constructor() {
    this.radarService = new CreativeRadarService();
  }

  /**
   * Main Unified Command Center Aggregator.
   * Returns consolidated operational intelligence for the workspace.
   */
  public async getCommandCenterData(workspaceId: string, _userId: string) {
    const workspace = db.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }

    // Refresh Radar signals proactively
    const radarEvaluation = await this.radarService.evaluateWorkspace(workspaceId);
    const activeSignals = radarEvaluation.signals.filter(
      (s) => s.status === "new" || s.status === "acknowledged"
    );

    // Retrieve Workspace Entities securely
    const releases = db.getReleases(workspaceId);
    const campaigns = db.getCampaigns(workspaceId);
    const projects = db.getProjects(workspaceId);
    const contentItems = db.getContentItems(workspaceId);
    const assets = db.getAssets(workspaceId);
    const tasks = db.getTasks(workspaceId);
    const milestones = db.getMilestones(workspaceId);
    const studioRequests = db.getStudioRequests(workspaceId);
    const studioDeliverables = db.getStudioDeliverables(workspaceId);
    const studioQuotes = db.getStudioQuotes(workspaceId);
    const productServices = db.getProducts(workspaceId);
    const brandCore = db.getBrandCore(workspaceId);
    const activityLogs = db.getActivityLogs(workspaceId).slice(0, 25);

    const now = Date.now();

    // 1. Resolve Active Primary Release & Campaign
    const activeRelease = releases.find((r) => r.status !== "released") || releases[0] || undefined;
    const activeCampaign = campaigns.find((c) => c.status !== "completed") || campaigns[0] || undefined;

    // 2. Compute Release Readiness Breakdown
    let releaseReadiness: any = undefined;
    if (activeRelease) {
      const daysUntilRelease = activeRelease.releaseDate
        ? Math.ceil((new Date(activeRelease.releaseDate).getTime() - now) / (1000 * 60 * 60 * 24))
        : null;

      const hasArtwork = Boolean(
        activeRelease.coverUrl ||
        activeRelease.coverAssetId ||
        assets.some((a) => a.releaseId === activeRelease.id && a.category === "cover")
      );
      const hasAudio = Boolean(
        activeRelease.audioUrl ||
        activeRelease.audioAssetId ||
        assets.some((a) => a.releaseId === activeRelease.id && a.category === "audio")
      );
      const hasDspPitch = Boolean(
        activeRelease.dspPitch &&
        activeRelease.dspPitch.editorialNote &&
        activeRelease.dspPitch.editorialNote.length > 20
      );
      const hasPresave = Boolean(
        activeRelease.presaveSlug ||
        (activeRelease.presaveData && activeRelease.presaveData.artistName)
      );
      const hasLyrics = Boolean(
        activeRelease.lyrics &&
        Array.isArray(activeRelease.lyrics.lines) &&
        activeRelease.lyrics.lines.length > 0
      );
      const hasSplits = Boolean(
        activeRelease.splits &&
        Array.isArray(activeRelease.splits.collaborators) &&
        activeRelease.splits.collaborators.length > 0
      );
      const hasEpk = Boolean(
        activeRelease.epkData ||
        assets.some((a) => a.releaseId === activeRelease.id && a.category === "epk")
      );

      const requirements = [
        { id: "artwork", label: "3000x3000px Cover Artwork", completed: hasArtwork, weight: 20, actionTab: "cover-studio", actionLabel: "Open Cover Studio", category: "artwork" },
        { id: "audio", label: "Master WAV Audio & LUFS Calibration", completed: hasAudio, weight: 20, actionTab: "mastering-suite", actionLabel: "Audit in Mastering Suite", category: "audio" },
        { id: "dsp-pitch", label: "DSP Editorial Pitch Letter", completed: hasDspPitch, weight: 20, actionTab: "dsp-pitcher", actionLabel: "Write DSP Pitch", category: "dsp-pitch" },
        { id: "presave", label: "Smart Pre-Save Campaign Hub", completed: hasPresave, weight: 10, actionTab: "presave-hub", actionLabel: "Configure Pre-Save", category: "presave" },
        { id: "lyrics", label: "Synced .LRC 9:16 Lyrics", completed: hasLyrics, weight: 10, actionTab: "lyrics-studio", actionLabel: "Sync in Lyric Studio", category: "lyrics" },
        { id: "splits", label: "100% Executed Royalty Splits", completed: hasSplits, weight: 10, actionTab: "splits-calculator", actionLabel: "Calculate Splits", category: "splits" },
        { id: "epk", label: "Press Kit & EPK Suite", completed: hasEpk, weight: 10, actionTab: "epk-builder", actionLabel: "Build EPK", category: "epk" },
      ];

      const completedWeight = requirements.filter((r) => r.completed).reduce((acc, r) => acc + r.weight, 0);
      const missingItems = requirements.filter((r) => !r.completed).map((r) => ({
        id: r.id,
        label: r.label,
        actionTab: r.actionTab,
        actionLabel: r.actionLabel,
        reason: `Missing required ${r.label} before release date.`,
        priority: r.weight >= 20 ? ("critical" as const) : ("high" as const),
      }));

      releaseReadiness = {
        score: completedWeight,
        stage: completedWeight >= 90 ? "Ready" : completedWeight >= 50 ? "Preparing" : "Planning",
        stageColor: completedWeight >= 90 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-amber-400 bg-amber-500/10 border-amber-500/30",
        requirements,
        completedCount: requirements.filter((r) => r.completed).length,
        totalCount: requirements.length,
        missingItems,
        daysUntilRelease,
        formattedDays: daysUntilRelease === null ? "Date not set" : daysUntilRelease <= 0 ? "Dropping Today / Past" : `In ${daysUntilRelease} days`,
      };
    }

    // 3. Compute Campaign Readiness Breakdown
    let campaignReadiness: any = undefined;
    if (activeCampaign) {
      const daysUntilLaunch = activeCampaign.startDate
        ? Math.ceil((new Date(activeCampaign.startDate).getTime() - now) / (1000 * 60 * 60 * 24))
        : null;

      const hasObjective = Boolean(activeCampaign.goal && activeCampaign.goal.length > 5);
      const hasProduct = Boolean(activeCampaign.productId || productServices.length > 0);
      const hasCreativeDirection = Boolean(
        activeCampaign.creativeDirection?.themeName ||
        brandCore?.visualDirection?.aestheticKeywords?.length
      );
      const hasHeroAsset = Boolean(
        activeCampaign.heroAssetUrl ||
        activeCampaign.heroAssetId ||
        assets.some((a) => a.campaignId === activeCampaign.id)
      );
      const linkedContent = contentItems.filter((c) => c.campaignId === activeCampaign.id);
      const hasContent = linkedContent.length >= 2;
      const hasMilestones = Boolean(activeCampaign.milestones && activeCampaign.milestones.length >= 1);
      const hasApproval = Boolean(activeCampaign.approvals?.creativeApproved);

      const requirements = [
        { id: "objective", label: "Campaign Objective & KPI Targets", completed: hasObjective, weight: 15, actionTab: "brand-os", actionLabel: "Set Objectives", category: "brand-core" },
        { id: "product", label: "Product / Service Linked", completed: hasProduct, weight: 15, actionTab: "brand-os", actionLabel: "Link Catalog Item", category: "product" },
        { id: "creative-dir", label: "Creative Direction & Hook", completed: hasCreativeDirection, weight: 15, actionTab: "brand-os", actionLabel: "Set Visual Direction", category: "creative-direction" },
        { id: "hero-asset", label: "Hero Visual Asset Attached", completed: hasHeroAsset, weight: 20, actionTab: "resource-vault", actionLabel: "Attach Hero Asset", category: "hero-asset" },
        { id: "content", label: "Multi-Channel Content Pipeline", completed: hasContent, weight: 15, actionTab: "content-engine", actionLabel: "Schedule Content", category: "content-pipeline" },
        { id: "milestones", label: "Sprint Milestones Scheduled", completed: hasMilestones, weight: 10, actionTab: "brand-os", actionLabel: "Add Milestones", category: "sprint-tasks" },
        { id: "approval", label: "Creative & Budget Sign-off", completed: hasApproval, weight: 10, actionTab: "brand-os", actionLabel: "Approve Campaign", category: "approvals" },
      ];

      const completedWeight = requirements.filter((r) => r.completed).reduce((acc, r) => acc + r.weight, 0);
      const missingItems = requirements.filter((r) => !r.completed).map((r) => ({
        id: r.id,
        label: r.label,
        actionTab: r.actionTab,
        actionLabel: r.actionLabel,
        reason: `Missing ${r.label} for launch sprint.`,
        priority: r.weight >= 20 ? ("critical" as const) : ("high" as const),
      }));

      campaignReadiness = {
        score: completedWeight,
        stage: completedWeight >= 85 ? "Ready" : completedWeight >= 45 ? "Preparing" : "Planning",
        stageColor: completedWeight >= 85 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-amber-400 bg-amber-500/10 border-amber-500/30",
        requirements,
        completedCount: requirements.filter((r) => r.completed).length,
        totalCount: requirements.length,
        missingItems,
        daysUntilLaunch,
        formattedDays: daysUntilLaunch === null ? "Date not set" : daysUntilLaunch <= 0 ? "Launching Today" : `In ${daysUntilLaunch} days`,
      };
    }

    // 4. DETERMINISTIC NEXT ACTION ENGINE
    // Combines Radar signals, readiness blockers, pending approvals, deadlines, and content gaps
    const nextActions: NextActionItem[] = [];

    // 4a. Critical Radar Signals First
    for (const sig of activeSignals.filter((s) => s.severity === "critical" || s.severity === "high").slice(0, 3)) {
      nextActions.push({
        id: `na_sig_${sig.id}`,
        title: sig.title,
        reason: sig.explanation,
        urgency: sig.severity === "critical" ? "critical" : "high",
        category: (sig.category as any) || "system",
        actionTab: (sig.recommendedAction.targetTab as any) || "creative-radar",
        actionLabel: sig.recommendedAction.label || "Resolve Issue",
        entityId: sig.affectedEntity.id,
        entityType: sig.affectedEntity.type,
        badge: "RADAR",
      });
    }

    // 4b. Missing Release Readiness Blockers (if active release has high-priority gaps)
    if (releaseReadiness && releaseReadiness.missingItems.length > 0) {
      for (const missing of releaseReadiness.missingItems.slice(0, 2)) {
        if (!nextActions.some((na) => na.title.includes(missing.label))) {
          nextActions.push({
            id: `na_rel_${missing.id}`,
            title: `Complete ${missing.label}`,
            reason: `Blocks Release Readiness for "${activeRelease?.title}". Current score: ${releaseReadiness.score}%.`,
            urgency: releaseReadiness.daysUntilRelease !== null && releaseReadiness.daysUntilRelease <= 14 ? "critical" : "high",
            category: "release",
            actionTab: missing.actionTab,
            actionLabel: missing.actionLabel,
            entityId: activeRelease?.id,
            entityType: "release",
            badge: "READINESS",
          });
        }
      }
    }

    // 4c. Missing Campaign Readiness Blockers
    if (campaignReadiness && campaignReadiness.missingItems.length > 0) {
      for (const missing of campaignReadiness.missingItems.slice(0, 2)) {
        if (!nextActions.some((na) => na.title.includes(missing.label))) {
          nextActions.push({
            id: `na_camp_${missing.id}`,
            title: `Complete ${missing.label}`,
            reason: `Blocks Campaign Readiness for "${activeCampaign?.title}". Launch readiness: ${campaignReadiness.score}%.`,
            urgency: campaignReadiness.daysUntilLaunch !== null && campaignReadiness.daysUntilLaunch <= 7 ? "critical" : "high",
            category: "campaign",
            actionTab: missing.actionTab,
            actionLabel: missing.actionLabel,
            entityId: activeCampaign?.id,
            entityType: "campaign",
            badge: "CAMPAIGN",
          });
        }
      }
    }

    // 4d. Pending Studio Deliverables & Quotes
    const pendingQuotes = studioQuotes.filter((q) => q.status === "SENT" || q.status === "VIEWED");
    for (const q of pendingQuotes) {
      nextActions.push({
        id: `na_quote_${q.id}`,
        title: `Approve Studio Quote: ${q.serviceName || q.scopeSummary}`,
        reason: `Studio quote for $${(q.price || 0).toLocaleString()} is waiting for your approval to start production.`,
        urgency: "high",
        category: "studio",
        actionTab: "studio",
        actionLabel: "Review Quote in Studio",
        entityId: q.id,
        entityType: "studio_quote",
        badge: "STUDIO",
      });
    }

    const pendingDeliverables = studioDeliverables.filter(
      (d) => d.approvalStatus === "pending" || d.status === "ready_for_review"
    );
    for (const del of pendingDeliverables.slice(0, 2)) {
      nextActions.push({
        id: `na_del_${del.id}`,
        title: `Review Deliverable: ${del.name}`,
        reason: `Creative asset deliverable is ready for review and sign-off.`,
        urgency: "high",
        category: "studio",
        actionTab: "studio",
        actionLabel: "Review in Studio",
        entityId: del.id,
        entityType: "studio_deliverable",
        badge: "DELIVERABLE",
      });
    }

    // 4e. Overdue / Urgent Tasks
    const urgentTasks = tasks.filter((t) => !t.completed && (t.priority === "urgent" || t.priority === "high"));
    for (const t of urgentTasks.slice(0, 2)) {
      if (!nextActions.some((na) => na.title.includes(t.text))) {
        nextActions.push({
          id: `na_task_${t.id}`,
          title: `Task: ${t.text}`,
          reason: `High priority task in ${t.projectTitle || "Workspace"}. Deadline: ${t.deadline || "ASAP"}.`,
          urgency: "high",
          category: "project",
          actionTab: "workspace-hub",
          actionLabel: "Complete Task",
          entityId: t.id,
          entityType: "task",
          badge: "TASK",
        });
      }
    }

    // 4f. Fallback Action if list is empty
    if (nextActions.length === 0) {
      if (workspace.identityType === "artist") {
        nextActions.push({
          id: "na_default_artist",
          title: "Schedule 30-Day Rollout Content in Content Engine",
          reason: "Consistent social posting cadence drives discovery across TikTok and Instagram Reels.",
          urgency: "medium",
          category: "content",
          actionTab: "content-engine",
          actionLabel: "Open Content Engine",
          badge: "GROWTH",
        });
      } else {
        nextActions.push({
          id: "na_default_brand",
          title: "Align Brand Core Narrative & Typography",
          reason: "Synchronize visual direction and messaging principles with Creative Memory.",
          urgency: "medium",
          category: "campaign",
          actionTab: "brand-os",
          actionLabel: "Review Brand Core",
          badge: "BRAND",
        });
      }
    }

    // 5. TODAY VIEW: Priority, Upcoming, Blocked, Recently Completed
    const todayPriority: CommandCenterItem[] = [];
    const todayUpcoming: CommandCenterItem[] = [];
    const todayBlocked: CommandCenterItem[] = [];
    const todayCompleted: CommandCenterItem[] = [];

    // Populate Priority Items
    for (const sig of activeSignals.filter((s) => s.severity === "critical" || s.severity === "high")) {
      todayPriority.push({
        id: `item_sig_${sig.id}`,
        title: sig.title,
        subtitle: sig.explanation,
        type: (sig.category as any) || "radar",
        status: "attention_required",
        urgency: sig.severity === "critical" ? "critical" : "high",
        actionTab: (sig.recommendedAction.targetTab as any) || "creative-radar",
        actionLabel: sig.recommendedAction.label || "Review Signal",
        entityId: sig.affectedEntity.id,
        badge: sig.severity.toUpperCase(),
      });
    }

    for (const t of urgentTasks) {
      todayPriority.push({
        id: `item_task_${t.id}`,
        title: t.text,
        subtitle: `Priority: ${t.priority?.toUpperCase()} • Category: ${t.category || "General"}`,
        type: "task",
        status: "pending",
        urgency: "high",
        dueDate: t.deadline,
        actionTab: "workspace-hub",
        actionLabel: "View in Tasks",
        entityId: t.id,
        badge: "URGENT",
      });
    }

    // Populate Upcoming Items (Releases, Campaigns, Milestones, Scheduled Content)
    for (const rel of releases.filter((r) => r.status !== "released" && r.releaseDate)) {
      const days = Math.ceil((new Date(rel.releaseDate).getTime() - now) / (1000 * 60 * 60 * 24));
      if (days >= 0 && days <= 30) {
        todayUpcoming.push({
          id: `item_rel_${rel.id}`,
          title: `Release: ${rel.title} (${rel.artistName})`,
          subtitle: `${rel.genre} • Drop: ${rel.releaseDate} (${days === 0 ? "Today" : `In ${days} days`})`,
          type: "release",
          status: rel.status,
          urgency: days <= 7 ? "critical" : "medium",
          dueDate: rel.releaseDate,
          actionTab: "artist-os",
          actionLabel: "Open Release Hub",
          entityId: rel.id,
          badge: `${days}D DROP`,
        });
      }
    }

    for (const camp of campaigns.filter((c) => c.status !== "completed" && c.startDate)) {
      const days = Math.ceil((new Date(camp.startDate).getTime() - now) / (1000 * 60 * 60 * 24));
      if (days >= 0 && days <= 30) {
        todayUpcoming.push({
          id: `item_camp_${camp.id}`,
          title: `Campaign: ${camp.title}`,
          subtitle: `Goal: ${camp.goal || "Growth"} • Launch: ${camp.startDate} (${days === 0 ? "Today" : `In ${days} days`})`,
          type: "campaign",
          status: camp.status,
          urgency: days <= 5 ? "high" : "medium",
          dueDate: camp.startDate,
          actionTab: "brand-os",
          actionLabel: "Open Campaign Hub",
          entityId: camp.id,
          badge: `${days}D LAUNCH`,
        });
      }
    }

    for (const m of milestones.filter((m) => !m.completed && m.targetDate)) {
      const days = Math.ceil((new Date(m.targetDate).getTime() - now) / (1000 * 60 * 60 * 24));
      if (days >= 0 && days <= 14) {
        todayUpcoming.push({
          id: `item_mls_${m.id}`,
          title: `Milestone: ${m.title}`,
          subtitle: `Project: ${m.projectTitle || "Workspace"} • Target: ${m.targetDate}`,
          type: "milestone",
          status: m.status,
          urgency: days <= 3 ? "high" : "low",
          dueDate: m.targetDate,
          actionTab: "workspace-hub",
          actionLabel: "View Milestones",
          entityId: m.id,
          badge: "TARGET",
        });
      }
    }

    const scheduledContent = contentItems.filter(
      (c) => c.status === "scheduled" || (c.scheduledDate && new Date(c.scheduledDate).getTime() > now)
    );
    for (const cont of scheduledContent.slice(0, 4)) {
      todayUpcoming.push({
        id: `item_cont_${cont.id}`,
        title: `Content: ${cont.title || "Scheduled Post"}`,
        subtitle: `Platform: ${cont.platform.toUpperCase()} • Type: ${cont.contentType || "Post"} • Date: ${cont.scheduledDate || "Upcoming"}`,
        type: "content",
        status: cont.status,
        urgency: "low",
        dueDate: cont.scheduledDate,
        actionTab: "content-engine",
        actionLabel: "Open Content Engine",
        entityId: cont.id,
        badge: cont.platform.toUpperCase(),
      });
    }

    // Populate Blocked Items
    if (releaseReadiness && releaseReadiness.score < 70 && releaseReadiness.daysUntilRelease !== null && releaseReadiness.daysUntilRelease <= 14) {
      todayBlocked.push({
        id: `item_blk_rel_${activeRelease?.id}`,
        title: `Release Readiness Deficit: "${activeRelease?.title}"`,
        subtitle: `Readiness is at ${releaseReadiness.score}%. ${releaseReadiness.missingItems.length} core requirements incomplete before launch.`,
        type: "release",
        status: "blocked",
        urgency: "critical",
        actionTab: "artist-os",
        actionLabel: "Fix Readiness",
        entityId: activeRelease?.id,
        badge: `${releaseReadiness.score}% READY`,
      });
    }

    if (campaignReadiness && campaignReadiness.score < 60 && campaignReadiness.daysUntilLaunch !== null && campaignReadiness.daysUntilLaunch <= 10) {
      todayBlocked.push({
        id: `item_blk_camp_${activeCampaign?.id}`,
        title: `Campaign Readiness Deficit: "${activeCampaign?.title}"`,
        subtitle: `Campaign launch readiness is at ${campaignReadiness.score}%. Missing hero assets or content pipeline.`,
        type: "campaign",
        status: "blocked",
        urgency: "critical",
        actionTab: "brand-os",
        actionLabel: "Resolve Blockers",
        entityId: activeCampaign?.id,
        badge: `${campaignReadiness.score}% READY`,
      });
    }

    for (const sig of activeSignals.filter((s) => s.type.includes("blocker") || s.type.includes("missing"))) {
      todayBlocked.push({
        id: `item_blk_sig_${sig.id}`,
        title: sig.title,
        subtitle: sig.explanation,
        type: "radar",
        status: "blocked",
        urgency: "high",
        actionTab: (sig.recommendedAction.targetTab as any) || "creative-radar",
        actionLabel: sig.recommendedAction.label || "Fix Blocker",
        entityId: sig.affectedEntity.id,
        badge: "BLOCKER",
      });
    }

    // Populate Recently Completed Items
    const completedTasks = tasks.filter((t) => t.completed).slice(0, 4);
    for (const t of completedTasks) {
      todayCompleted.push({
        id: `item_comp_task_${t.id}`,
        title: t.text,
        subtitle: `Completed task in ${t.projectTitle || "Workspace"}`,
        type: "task",
        status: "completed",
        urgency: "low",
        actionTab: "workspace-hub",
        actionLabel: "View Tasks",
        entityId: t.id,
        badge: "DONE",
      });
    }

    const achievedMilestones = milestones.filter((m) => m.completed).slice(0, 3);
    for (const m of achievedMilestones) {
      todayCompleted.push({
        id: `item_comp_mls_${m.id}`,
        title: `Milestone Achieved: ${m.title}`,
        subtitle: `Project: ${m.projectTitle || "Workspace"}`,
        type: "milestone",
        status: "completed",
        urgency: "low",
        actionTab: "workspace-hub",
        actionLabel: "View Milestones",
        entityId: m.id,
        badge: "ACHIEVED",
      });
    }

    const approvedDeliverables = studioDeliverables.filter((d) => d.approvalStatus === "approved").slice(0, 3);
    for (const d of approvedDeliverables) {
      todayCompleted.push({
        id: `item_comp_del_${d.id}`,
        title: `Deliverable Approved: ${d.name}`,
        subtitle: `Format: ${d.format || "Asset"} • Version: v${d.version}`,
        type: "studio",
        status: "completed",
        urgency: "low",
        actionTab: "studio",
        actionLabel: "View in Studio",
        entityId: d.id,
        badge: "SIGNED OFF",
      });
    }

    // 6. CROSS-OS RELATIONSHIP GRAPH
    // Pre-maps connections across releases, campaigns, products, projects, content, studio, assets, and tasks
    const relationshipGraph: EntityRelationNode[] = [];

    // Release Relationship Tree
    for (const rel of releases.slice(0, 3)) {
      const connections: EntityRelationConnection[] = [];

      // Linked Content
      const relContent = contentItems.filter((c) => c.releaseId === rel.id || (c.aiMetadata && (c.aiMetadata as any).releaseId === rel.id));
      for (const c of relContent) {
        connections.push({
          targetType: "content",
          targetId: c.id,
          targetTitle: c.title || `${c.platform.toUpperCase()} Post`,
          relationship: "Rollout Content",
          actionTab: "content-engine",
          status: c.status,
        });
      }

      // Linked Assets
      const relAssets = assets.filter((a) => a.releaseId === rel.id);
      for (const a of relAssets) {
        connections.push({
          targetType: "asset",
          targetId: a.id,
          targetTitle: a.name,
          relationship: `${a.category.toUpperCase()} Vault Asset`,
          actionTab: "resource-vault",
        });
      }

      // Linked Studio Requests
      const relStudio = studioRequests.filter((s) => s.projectId === rel.projectId || s.title.includes(rel.title));
      for (const s of relStudio) {
        connections.push({
          targetType: "studio_request",
          targetId: s.id,
          targetTitle: s.title,
          relationship: "Studio Creative Service",
          actionTab: "studio",
          status: s.status,
        });
      }

      // Linked Tasks
      const relTasks = tasks.filter((t) => t.releaseId === rel.id || (t.projectTitle && t.projectTitle.includes(rel.title)));
      for (const t of relTasks.slice(0, 4)) {
        connections.push({
          targetType: "task",
          targetId: t.id,
          targetTitle: t.text,
          relationship: "Release Task",
          actionTab: "workspace-hub",
          status: t.completed ? "completed" : "pending",
        });
      }

      // Linked Radar Signals
      const relSignals = activeSignals.filter((s) => s.affectedEntity.id === rel.id || s.affectedEntity.type === "release");
      for (const s of relSignals) {
        connections.push({
          targetType: "radar_signal",
          targetId: s.id,
          targetTitle: s.title,
          relationship: `${s.severity.toUpperCase()} Radar Signal`,
          actionTab: "creative-radar",
          status: s.status,
        });
      }

      relationshipGraph.push({
        id: `graph_rel_${rel.id}`,
        entityType: "release",
        title: rel.title,
        subtitle: `Artist: ${rel.artistName} • Drop: ${rel.releaseDate || "TBD"}`,
        status: rel.status,
        actionTab: "artist-os",
        connections,
      });
    }

    // Campaign Relationship Tree
    for (const camp of campaigns.slice(0, 3)) {
      const connections: EntityRelationConnection[] = [];

      // Linked Product
      if (camp.productId) {
        const prod = productServices.find((p) => p.id === camp.productId);
        if (prod) {
          connections.push({
            targetType: "project",
            targetId: prod.id,
            targetTitle: prod.name,
            relationship: "Flagship Product",
            actionTab: "brand-os",
            status: prod.status,
          });
        }
      }

      // Linked Content
      const campContent = contentItems.filter((c) => c.campaignId === camp.id);
      for (const c of campContent) {
        connections.push({
          targetType: "content",
          targetId: c.id,
          targetTitle: c.title || `${c.platform.toUpperCase()} Campaign Post`,
          relationship: "Campaign Content",
          actionTab: "content-engine",
          status: c.status,
        });
      }

      // Linked Assets
      const campAssets = assets.filter((a) => a.campaignId === camp.id);
      for (const a of campAssets) {
        connections.push({
          targetType: "asset",
          targetId: a.id,
          targetTitle: a.name,
          relationship: "Campaign Hero Visual",
          actionTab: "resource-vault",
        });
      }

      // Linked Studio Requests
      const campStudio = studioRequests.filter((s) => s.campaignId === camp.id);
      for (const s of campStudio) {
        connections.push({
          targetType: "studio_request",
          targetId: s.id,
          targetTitle: s.title,
          relationship: "Studio Creative Service",
          actionTab: "studio",
          status: s.status,
        });
      }

      // Linked Radar Signals
      const campSignals = activeSignals.filter((s) => s.affectedEntity.id === camp.id || s.affectedEntity.type === "campaign");
      for (const s of campSignals) {
        connections.push({
          targetType: "radar_signal",
          targetId: s.id,
          targetTitle: s.title,
          relationship: `${s.severity.toUpperCase()} Radar Signal`,
          actionTab: "creative-radar",
          status: s.status,
        });
      }

      relationshipGraph.push({
        id: `graph_camp_${camp.id}`,
        entityType: "campaign",
        title: camp.title,
        subtitle: `Goal: ${camp.goal || "Growth"} • Launch: ${camp.startDate || "TBD"}`,
        status: camp.status,
        actionTab: "brand-os",
        connections,
      });
    }

    // 7. Calculate Workspace Health Score
    // Math: Based on completion of tasks, readiness of active release/campaign, and low blocker count
    let healthScore = 85;
    if (activeSignals.some((s) => s.severity === "critical")) healthScore -= 20;
    if (activeSignals.filter((s) => s.severity === "high").length > 2) healthScore -= 10;
    if (releaseReadiness && releaseReadiness.score < 50) healthScore -= 15;
    if (campaignReadiness && campaignReadiness.score < 50) healthScore -= 10;
    if (healthScore < 20) healthScore = 20;
    if (healthScore > 100) healthScore = 100;

    return {
      workspaceId,
      identityType: workspace.identityType || "artist",
      workspaceName: workspace.name,
      summary: {
        healthScore,
        counts: {
          releases: releases.length,
          campaigns: campaigns.length,
          projects: projects.length,
          contentItems: contentItems.length,
          studioRequests: studioRequests.length,
          assets: assets.length,
          tasks: tasks.length,
          milestones: milestones.length,
          activeRadarSignals: activeSignals.length,
          activeBlockers: todayBlocked.length,
        },
      },
      today: {
        priority: todayPriority,
        upcoming: todayUpcoming,
        blocked: todayBlocked,
        recentlyCompleted: todayCompleted,
        nextActions,
      },
      activeEntities: {
        activeRelease,
        releaseReadiness,
        activeCampaign,
        campaignReadiness,
        activeProjects: projects.filter((p) => p.status !== "completed"),
        activeStudioRequests: studioRequests.filter((r) => r.status !== "COMPLETED" && r.status !== "CANCELLED" && r.status !== "DECLINED"),
        upcomingContent: scheduledContent.slice(0, 6),
      },
      radarDigest: radarEvaluation.digest,
      recentActivity: activityLogs,
      relationshipGraph,
    };
  }

  /**
   * Universal Global Search Engine.
   * Searches across all workspace entities: releases, campaigns, projects, content, assets, tasks, milestones, studio, products, and memories.
   */
  public performGlobalSearch(workspaceId: string, rawQuery: string): GlobalSearchResultItem[] {
    if (!rawQuery || !rawQuery.trim()) {
      return [];
    }

    const q = rawQuery.toLowerCase().trim();
    const results: GlobalSearchResultItem[] = [];

    // 1. Releases
    const releases = db.getReleases(workspaceId);
    for (const r of releases) {
      if (
        r.title.toLowerCase().includes(q) ||
        r.artistName.toLowerCase().includes(q) ||
        r.genre.toLowerCase().includes(q) ||
        (r.upc && r.upc.toLowerCase().includes(q)) ||
        (r.isrc && r.isrc.toLowerCase().includes(q)) ||
        (r.narrative && r.narrative.toLowerCase().includes(q))
      ) {
        results.push({
          id: `res_rel_${r.id}`,
          type: "release",
          title: r.title,
          subtitle: `Artist Release • ${r.artistName} • ${r.genre} • Drop: ${r.releaseDate}`,
          badge: "RELEASE",
          actionTab: "artist-os",
          actionLabel: "Open in Artist OS",
          matchReason: `Matched title/metadata in Artist Release`,
          data: r,
        });
      }
    }

    // 2. Campaigns
    const campaigns = db.getCampaigns(workspaceId);
    for (const c of campaigns) {
      if (
        c.title.toLowerCase().includes(q) ||
        (c.goal && c.goal.toLowerCase().includes(q)) ||
        (c.objective && c.objective.toLowerCase().includes(q)) ||
        (c.creativeDirection?.themeName && c.creativeDirection.themeName.toLowerCase().includes(q))
      ) {
        results.push({
          id: `res_camp_${c.id}`,
          type: "campaign",
          title: c.title,
          subtitle: `Brand Campaign • Goal: ${c.goal || "Growth Sprint"} • Status: ${c.status.toUpperCase()}`,
          badge: "CAMPAIGN",
          actionTab: "brand-os",
          actionLabel: "Open Campaign Hub",
          matchReason: `Matched campaign goal/objective`,
          data: c,
        });
      }
    }

    // 3. Projects
    const projects = db.getProjects(workspaceId);
    for (const p of projects) {
      if (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.clientName && p.clientName.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      ) {
        results.push({
          id: `res_proj_${p.id}`,
          type: "project",
          title: p.title,
          subtitle: `Project • ${p.category} • Budget: $${p.budget.toLocaleString()} • Status: ${p.status}`,
          badge: "PROJECT",
          actionTab: "workspace-hub",
          actionLabel: "Open in Projects",
          matchReason: `Matched project description/tags`,
          data: p,
        });
      }
    }

    // 4. Content Items
    const contentItems = db.getContentItems(workspaceId);
    for (const cont of contentItems) {
      if (
        (cont.title && cont.title.toLowerCase().includes(q)) ||
        (cont.caption && cont.caption.toLowerCase().includes(q)) ||
        cont.platform.toLowerCase().includes(q) ||
        (cont.hook && cont.hook.toLowerCase().includes(q)) ||
        (cont.contentType && cont.contentType.toLowerCase().includes(q))
      ) {
        results.push({
          id: `res_cont_${cont.id}`,
          type: "content",
          title: cont.title || `${cont.platform.toUpperCase()} Post`,
          subtitle: `Content Engine • ${cont.platform.toUpperCase()} • ${cont.contentType || "Post"} • Status: ${cont.status}`,
          badge: cont.platform.toUpperCase(),
          actionTab: "content-engine",
          actionLabel: "Open Content Engine",
          matchReason: `Matched caption/hook text`,
          data: cont,
        });
      }
    }

    // 5. Assets
    const assets = db.getAssets(workspaceId);
    for (const a of assets) {
      if (
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.mimeType && a.mimeType.toLowerCase().includes(q)) ||
        (a.tags && a.tags.some((t) => t.toLowerCase().includes(q)))
      ) {
        results.push({
          id: `res_ast_${a.id}`,
          type: "asset",
          title: a.name,
          subtitle: `Resource Vault • ${a.category.toUpperCase()} • ${(a.size / (1024 * 1024)).toFixed(2)} MB`,
          badge: "VAULT ASSET",
          actionTab: "resource-vault",
          actionLabel: "View in Vault",
          matchReason: `Matched filename/category`,
          data: a,
        });
      }
    }

    // 6. Tasks
    const tasks = db.getTasks(workspaceId);
    for (const t of tasks) {
      if (
        t.text.toLowerCase().includes(q) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.projectTitle && t.projectTitle.toLowerCase().includes(q))
      ) {
        results.push({
          id: `res_task_${t.id}`,
          type: "task",
          title: t.text,
          subtitle: `Task • Priority: ${t.priority?.toUpperCase()} • Project: ${t.projectTitle || "General"}`,
          badge: "TASK",
          actionTab: "workspace-hub",
          actionLabel: "Open Task List",
          matchReason: `Matched task requirement`,
          data: t,
        });
      }
    }

    // 7. Milestones
    const milestones = db.getMilestones(workspaceId);
    for (const m of milestones) {
      if (
        m.title.toLowerCase().includes(q) ||
        (m.notes && m.notes.toLowerCase().includes(q)) ||
        (m.deliverables && m.deliverables.some((d) => d.toLowerCase().includes(q)))
      ) {
        results.push({
          id: `res_mls_${m.id}`,
          type: "milestone",
          title: m.title,
          subtitle: `Milestone • Target: ${m.targetDate} • Status: ${m.status}`,
          badge: "MILESTONE",
          actionTab: "workspace-hub",
          actionLabel: "View Milestone",
          matchReason: `Matched target deliverable`,
          data: m,
        });
      }
    }

    // 8. Studio Requests
    const studioRequests = db.getStudioRequests(workspaceId);
    for (const s of studioRequests) {
      if (
        s.title.toLowerCase().includes(q) ||
        (s.brief?.concept && s.brief.concept.toLowerCase().includes(q)) ||
        s.serviceId.toLowerCase().includes(q) ||
        (s.serviceName && s.serviceName.toLowerCase().includes(q))
      ) {
        results.push({
          id: `res_std_${s.id}`,
          type: "studio_request",
          title: s.title,
          subtitle: `Keedohub Studio • ${s.serviceName || s.serviceId} • Status: ${s.status}`,
          badge: "STUDIO",
          actionTab: "studio",
          actionLabel: "Open in Studio",
          matchReason: `Matched creative brief request`,
          data: s,
        });
      }
    }

    // 9. Products & Services
    const products = db.getProducts(workspaceId);
    for (const p of products) {
      if (
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      ) {
        results.push({
          id: `res_prod_${p.id}`,
          type: "product",
          title: p.name,
          subtitle: `Catalog Item • ${p.type.toUpperCase()} • ${p.pricing.currency} ${p.pricing.amount.toLocaleString()} • Status: ${p.status}`,
          badge: "PRODUCT",
          actionTab: "brand-os",
          actionLabel: "Open in Catalog",
          matchReason: `Matched product name/pricing`,
          data: p,
        });
      }
    }

    // 10. Creative Memory
    const memory = db.getCreativeMemory(workspaceId);
    if (memory) {
      if (
        memory.identitySummary.toLowerCase().includes(q) ||
        memory.coreNarrative.toLowerCase().includes(q) ||
        (memory.toneTraits && memory.toneTraits.some((t) => t.toLowerCase().includes(q))) ||
        (memory.recentLearnings && memory.recentLearnings.some((l) => l.toLowerCase().includes(q)))
      ) {
        results.push({
          id: `res_mem_${memory.id}`,
          type: "memory",
          title: `Creative Memory: ${memory.identitySummary.slice(0, 60)}...`,
          subtitle: `Learnings, visual guidelines, and persistent narrative tone rules`,
          badge: "MEMORY",
          actionTab: "creative-memory",
          actionLabel: "Open Creative Memory",
          matchReason: `Matched persistent narrative rules`,
          data: memory,
        });
      }
    }

    return results;
  }
}

export const commandCenterService = new CommandCenterService();
