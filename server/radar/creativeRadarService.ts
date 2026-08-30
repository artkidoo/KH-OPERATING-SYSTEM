import { db, RadarSignalRecord, RadarSeverity, RadarCategory, RadarSignalType, RadarAffectedEntityRecord, RadarRecommendedActionRecord } from "../db";
import { GoogleGenAI } from "@google/genai";

export interface RadarDigest {
  workspaceId: string;
  generatedAt: string;
  headline: string;
  totalActiveSignals: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  topAttentionItems: RadarSignalRecord[];
  recommendationsSummary: string[];
}

export interface RadarStats {
  totalActive: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byCategory: {
    release: number;
    campaign: number;
    project: number;
    content: number;
    asset: number;
    studio: number;
  };
  byStatus: {
    new: number;
    acknowledged: number;
    actioned: number;
    dismissed: number;
  };
}

export class CreativeRadarService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  /**
   * Main proactive evaluation engine for a specific workspace.
   * Deterministic, high-performance rule scanner that inspects actual state.
   */
  public async evaluateWorkspace(workspaceId: string): Promise<{
    signals: RadarSignalRecord[];
    digest: RadarDigest;
    stats: RadarStats;
  }> {
    const workspace = db.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const activeFingerprints = new Set<string>();
    const generatedSignals: (Omit<RadarSignalRecord, "id" | "createdAt" | "updatedAt"> & { id?: string })[] = [];

    const now = Date.now();
    const isArtistWorkspace = workspace.identityType === "artist";

    // -------------------------------------------------------------
    // 1. ARTIST / RELEASE RADAR EVALUATION
    // -------------------------------------------------------------
    const releases = db.getReleases(workspaceId);
    const contentItems = db.getContentItems(workspaceId);
    const studioRequests = db.getStudioRequests(workspaceId);
    const studioQuotes = db.getStudioQuotes(workspaceId);
    const studioDeliverables = db.getStudioDeliverables(workspaceId);
    const studioProjects = db.getStudioProjects(workspaceId);
    const assets = db.getAssets(workspaceId);
    const projects = db.getProjects(workspaceId);

    for (const rel of releases) {
      if (!rel.releaseDate) continue;

      const targetTime = new Date(rel.releaseDate).getTime();
      const daysUntilRelease = Math.ceil((targetTime - now) / (1000 * 60 * 60 * 24));

      // Release approaching check (within 14 days)
      if (daysUntilRelease >= 0 && daysUntilRelease <= 14) {
        const missingPillars: string[] = [];
        if (!rel.coverAssetId && !rel.coverUrl) missingPillars.push("Cover Artwork");
        if (!rel.audioAssetId && !rel.audioUrl) missingPillars.push("Master WAV Audio");
        if (!rel.dspPitch?.pitchText || rel.dspPitch.pitchText.length < 40) missingPillars.push("DSP Editorial Pitch");
        if (!rel.presaveSlug && !rel.presaveData?.isPublished) missingPillars.push("Pre-Save SmartLink");
        if (!rel.lyrics?.synced || !rel.lyrics?.lines?.length) missingPillars.push("Synced Lyrics (.LRC)");
        if (!rel.splits?.isExecuted) missingPillars.push("Signed Royalty Splits");

        const fingerprint = `sig:release:approaching:${rel.id}`;
        activeFingerprints.add(fingerprint);

        const severity: RadarSeverity = daysUntilRelease <= 3 ? "critical" : daysUntilRelease <= 7 ? "high" : "medium";
        const priority = Math.max(50, 100 - daysUntilRelease * 4);

        generatedSignals.push({
          workspaceId,
          fingerprint,
          category: "release",
          type: "release_approaching",
          severity,
          priority,
          title: `Release "${rel.title}" drops in ${daysUntilRelease === 0 ? "today" : `${daysUntilRelease} day${daysUntilRelease > 1 ? "s" : ""}`}`,
          explanation: missingPillars.length > 0
            ? `Release date is imminent with ${missingPillars.length} unresolved readiness requirement${missingPillars.length > 1 ? "s" : ""}: ${missingPillars.join(", ")}.`
            : `All primary readiness pillars verified. Prepare for day-1 release rollout push.`,
          details: `Release target: ${rel.releaseDate} (${rel.genre || "Afro-Fusion"}). Checklist readiness status: ${missingPillars.length === 0 ? "100% READY" : `${6 - missingPillars.length}/6 Pillars Complete`}.`,
          affectedEntity: {
            type: "release",
            id: rel.id,
            name: rel.title,
            secondaryInfo: `Target: ${rel.releaseDate}`,
          },
          recommendedAction: {
            type: "navigate_tab",
            label: "Open Release Core",
            targetTab: "artist-os",
            actionDescription: "Review readiness checklist and execute final launch tasks",
          },
          status: "new",
        });
      }

      // Check specific blockers regardless of timeline if in active planning/preparing state
      if (rel.status !== "released" && rel.status !== "post-release") {
        // Missing Artwork Blocker
        if (!rel.coverAssetId && !rel.coverUrl) {
          const fingerprint = `sig:release:blocker:artwork:${rel.id}`;
          activeFingerprints.add(fingerprint);
          const isUrgent = daysUntilRelease >= 0 && daysUntilRelease <= 7;

          generatedSignals.push({
            workspaceId,
            fingerprint,
            category: "release",
            type: "release_readiness_blocker",
            severity: isUrgent ? "critical" : "high",
            priority: isUrgent ? 95 : 82,
            title: `Missing Master Artwork for "${rel.title}"`,
            explanation: "High-resolution 3000x3000px cover artwork is required for DSP distribution (Spotify, Apple Music) and promo visual generation.",
            details: "DSP ingestion requires 1:1 square lossless PNG/JPG. Upload existing asset or request Keedohub Studio cover commission.",
            affectedEntity: {
              type: "release",
              id: rel.id,
              name: rel.title,
              secondaryInfo: "Artwork Pillar Incomplete",
            },
            recommendedAction: {
              type: "navigate_tab",
              label: "Open Cover Studio",
              targetTab: "cover-studio",
              actionDescription: "Generate or customize 3000x3000px artwork in Cover Studio",
            },
            status: "new",
          });
        }

        // Missing Master Audio Blocker
        if (!rel.audioAssetId && !rel.audioUrl) {
          const fingerprint = `sig:release:blocker:audio:${rel.id}`;
          activeFingerprints.add(fingerprint);
          const isUrgent = daysUntilRelease >= 0 && daysUntilRelease <= 5;

          generatedSignals.push({
            workspaceId,
            fingerprint,
            category: "release",
            type: "release_readiness_blocker",
            severity: isUrgent ? "critical" : "high",
            priority: isUrgent ? 98 : 88,
            title: `Master WAV Audio not linked for "${rel.title}"`,
            explanation: "No 24-bit/44.1kHz or 48kHz lossless master audio file is attached to the release core.",
            details: "Master audio is the cornerstone of distribution and streaming loudness compliance (-14 to -9 LUFS).",
            affectedEntity: {
              type: "release",
              id: rel.id,
              name: rel.title,
              secondaryInfo: "Master Audio Missing",
            },
            recommendedAction: {
              type: "navigate_tab",
              label: "Open Mastering Suite",
              targetTab: "mastering-suite",
              actionDescription: "Validate audio loudness, true peak, and attach Master WAV",
            },
            status: "new",
          });
        }

        // DSP Pitch Submission Gap
        if ((!rel.dspPitch?.pitchText || rel.dspPitch.pitchText.length < 40) && daysUntilRelease >= 0 && daysUntilRelease <= 21) {
          const fingerprint = `sig:release:blocker:dsppitch:${rel.id}`;
          activeFingerprints.add(fingerprint);
          const isUrgent = daysUntilRelease <= 7;

          generatedSignals.push({
            workspaceId,
            fingerprint,
            category: "release",
            type: "release_readiness_blocker",
            severity: isUrgent ? "high" : "medium",
            priority: isUrgent ? 85 : 72,
            title: `DSP Editorial Pitch incomplete for "${rel.title}"`,
            explanation: "Spotify for Artists and Apple Music editorial curators recommend submitting pitch decks 14–21 days prior to release date for playlist consideration.",
            details: `Target drop: ${rel.releaseDate}. Current editorial pitch text is incomplete or not formatted.`,
            affectedEntity: {
              type: "release",
              id: rel.id,
              name: rel.title,
              secondaryInfo: "DSP Pitch Gap",
            },
            recommendedAction: {
              type: "navigate_tab",
              label: "Open DSP Pitcher",
              targetTab: "dsp-pitcher",
              actionDescription: "Generate AI-assisted editorial curator pitch deck",
            },
            status: "new",
          });
        }

        // Pre-Save Gap
        if (!rel.presaveSlug && !rel.presaveData?.isPublished && daysUntilRelease >= 0 && daysUntilRelease <= 14) {
          const fingerprint = `sig:release:blocker:presave:${rel.id}`;
          activeFingerprints.add(fingerprint);

          generatedSignals.push({
            workspaceId,
            fingerprint,
            category: "release",
            type: "release_readiness_blocker",
            severity: "medium",
            priority: 68,
            title: `Pre-Save SmartLink inactive for "${rel.title}"`,
            explanation: "Pre-save campaigns capture early fan saves and email addresses, boosting day-1 algorithmic velocity on Spotify Release Radar.",
            details: "Deploy your dedicated branded pre-save hub with countdown timer and one-click DSP authorization.",
            affectedEntity: {
              type: "release",
              id: rel.id,
              name: rel.title,
              secondaryInfo: "Pre-Save Hub",
            },
            recommendedAction: {
              type: "navigate_tab",
              label: "Launch Pre-Save Hub",
              targetTab: "presave-hub",
              actionDescription: "Publish branded smart pre-save page",
            },
            status: "new",
          });
        }

        // Content Gap for upcoming release
        const relContent = contentItems.filter((c) => c.releaseId === rel.id || (c.title && c.title.toLowerCase().includes(rel.title.toLowerCase())));
        if (daysUntilRelease >= 0 && daysUntilRelease <= 14 && relContent.length < 3) {
          const fingerprint = `sig:release:contentgap:${rel.id}`;
          activeFingerprints.add(fingerprint);

          generatedSignals.push({
            workspaceId,
            fingerprint,
            category: "content",
            type: "release_content_gap",
            severity: daysUntilRelease <= 5 ? "high" : "medium",
            priority: daysUntilRelease <= 5 ? 80 : 65,
            title: `Content Gap: Only ${relContent.length} planned clip${relContent.length === 1 ? "" : "s"} for "${rel.title}"`,
            explanation: `Release drops in ${daysUntilRelease} days but only ${relContent.length} short-form content piece${relContent.length === 1 ? " is" : "s are"} scheduled. Recommend minimum 4-6 rollout assets.`,
            details: "Key missing formats: 15s studio snippet hook, lyric visualizer, pre-save reminder countdown.",
            affectedEntity: {
              type: "release",
              id: rel.id,
              name: rel.title,
              secondaryInfo: `${relContent.length} items scheduled`,
            },
            recommendedAction: {
              type: "navigate_tab",
              label: "Open Content Engine",
              targetTab: "content-engine",
              actionDescription: "Generate 30-day multi-platform release rollout calendar",
            },
            status: "new",
          });
        }
      }
    }

    // -------------------------------------------------------------
    // 2. BRAND / CAMPAIGN RADAR EVALUATION
    // -------------------------------------------------------------
    const campaigns = db.getCampaigns(workspaceId);

    for (const camp of campaigns) {
      const launchDateStr = camp.startDate || camp.createdAt;
      const targetTime = new Date(launchDateStr).getTime();
      const daysUntilLaunch = Math.ceil((targetTime - now) / (1000 * 60 * 60 * 24));

      // Campaign launch approaching
      if (daysUntilLaunch >= 0 && daysUntilLaunch <= 14 && camp.status !== "completed") {
        const fingerprint = `sig:campaign:approaching:${camp.id}`;
        activeFingerprints.add(fingerprint);

        const severity: RadarSeverity = daysUntilLaunch <= 3 ? "critical" : daysUntilLaunch <= 7 ? "high" : "medium";
        const priority = Math.max(45, 95 - daysUntilLaunch * 4);

        generatedSignals.push({
          workspaceId,
          fingerprint,
          category: "campaign",
          type: "campaign_launch_approaching",
          severity,
          priority,
          title: `Campaign "${camp.title}" launches in ${daysUntilLaunch === 0 ? "today" : `${daysUntilLaunch} day${daysUntilLaunch > 1 ? "s" : ""}`}`,
          explanation: `Brand campaign launch window approaching. Goal: ${camp.goal || "Growth Sprint"}.`,
          details: `Target launch date: ${launchDateStr}. Readiness check: ${camp.heroAssetUrl || camp.heroAssetId ? "Hero visual ready" : "Hero visual missing"}.`,
          affectedEntity: {
            type: "campaign",
            id: camp.id,
            name: camp.title,
            secondaryInfo: `Objective: ${camp.objective || "Brand Awareness"}`,
          },
          recommendedAction: {
            type: "navigate_tab",
            label: "Open Brand OS",
            targetTab: "brand-os",
            actionDescription: "Review campaign deliverables and channel readiness",
          },
          status: "new",
        });
      }

      // Campaign Hero Asset Missing
      if (!camp.heroAssetId && !camp.heroAssetUrl && camp.status !== "completed") {
        const fingerprint = `sig:campaign:blocker:hero:${camp.id}`;
        activeFingerprints.add(fingerprint);
        const isUrgent = daysUntilLaunch >= 0 && daysUntilLaunch <= 7;

        generatedSignals.push({
          workspaceId,
          fingerprint,
          category: "campaign",
          type: "campaign_hero_asset_missing",
          severity: isUrgent ? "critical" : "high",
          priority: isUrgent ? 90 : 78,
          title: `Missing Hero Creative Asset for Campaign "${camp.title}"`,
          explanation: "Campaign lacks a primary high-resolution hero visual banner or brand deck deliverable.",
          details: "Hero visual is required for landing page headers, paid social ad creative, and PR distribution.",
          affectedEntity: {
            type: "campaign",
            id: camp.id,
            name: camp.title,
            secondaryInfo: "Missing Hero Asset",
          },
          recommendedAction: {
            type: "navigate_tab",
            label: "Open Brand OS",
            targetTab: "brand-os",
            actionDescription: "Upload hero asset or link existing brand visual from Asset Vault",
          },
          status: "new",
        });
      }

      // Campaign Content Gap
      const campContent = contentItems.filter((c) => c.campaignId === camp.id);
      if (daysUntilLaunch >= 0 && daysUntilLaunch <= 10 && campContent.length < 2 && camp.status !== "completed") {
        const fingerprint = `sig:campaign:contentgap:${camp.id}`;
        activeFingerprints.add(fingerprint);

        generatedSignals.push({
          workspaceId,
          fingerprint,
          category: "content",
          type: "campaign_content_gap",
          severity: daysUntilLaunch <= 4 ? "high" : "medium",
          priority: daysUntilLaunch <= 4 ? 82 : 64,
          title: `Campaign "${camp.title}" has insufficient planned content`,
          explanation: `Campaign launches in ${daysUntilLaunch} days with only ${campContent.length} scheduled promo post${campContent.length === 1 ? "" : "s"}.`,
          details: "Recommend scheduling launch announcement, problem/solution hook, and product spotlight.",
          affectedEntity: {
            type: "campaign",
            id: camp.id,
            name: camp.title,
            secondaryInfo: `${campContent.length} posts configured`,
          },
          recommendedAction: {
            type: "navigate_tab",
            label: "Open Content Engine",
            targetTab: "content-engine",
            actionDescription: "Generate multi-channel campaign content schedule",
          },
          status: "new",
        });
      }

      // Campaign unlinked product
      if (!camp.productId && camp.status !== "completed") {
        const fingerprint = `sig:campaign:unlinked:product:${camp.id}`;
        activeFingerprints.add(fingerprint);

        generatedSignals.push({
          workspaceId,
          fingerprint,
          category: "campaign",
          type: "campaign_product_unlinked",
          severity: "low",
          priority: 40,
          title: `Campaign "${camp.title}" is not linked to a Product/Service`,
          explanation: "Connecting a specific product or service offer allows automated value proposition extraction in Creative Brain copy generation.",
          details: "Select an existing offering from your Product Catalog to optimize ROI tracking.",
          affectedEntity: {
            type: "campaign",
            id: camp.id,
            name: camp.title,
            secondaryInfo: "Offer Unlinked",
          },
          recommendedAction: {
            type: "navigate_tab",
            label: "Link Product in Brand OS",
            targetTab: "brand-os",
            actionDescription: "Attach target product/service to campaign",
          },
          status: "new",
        });
      }
    }

    // -------------------------------------------------------------
    // 3. PROJECT & TASK RADAR EVALUATION
    // -------------------------------------------------------------
    for (const project of projects) {
      if (project.status === "completed") continue;

      // Project deadline approaching
      if (project.deadline) {
        const targetTime = new Date(project.deadline).getTime();
        const daysUntilDue = Math.ceil((targetTime - now) / (1000 * 60 * 60 * 24));

        if (daysUntilDue >= 0 && daysUntilDue <= 5) {
          const incompleteTasks = (project.tasks || []).filter((t) => !t.completed).length;
          const fingerprint = `sig:project:approaching:${project.id}`;
          activeFingerprints.add(fingerprint);

          const severity: RadarSeverity = daysUntilDue <= 2 ? "high" : "medium";
          const priority = daysUntilDue <= 2 ? 84 : 68;

          generatedSignals.push({
            workspaceId,
            fingerprint,
            category: "project",
            type: "project_deadline_approaching",
            severity,
            priority,
            title: `Project "${project.title}" deadline in ${daysUntilDue === 0 ? "today" : `${daysUntilDue} day${daysUntilDue > 1 ? "s" : ""}`}`,
            explanation: `Project has ${incompleteTasks} uncompleted task${incompleteTasks === 1 ? "" : "s"} remaining before target deadline (${project.deadline}).`,
            details: `Category: ${project.category || "General"}. Priority: ${project.priority || "Medium"}.`,
            affectedEntity: {
              type: "project",
              id: project.id,
              name: project.title,
              secondaryInfo: `Due: ${project.deadline}`,
            },
            recommendedAction: {
              type: "navigate_tab",
              label: "Open Project Console",
              targetTab: "project-console",
              actionDescription: "Review task deliverables and milestones",
            },
            status: "new",
          });
        }
      }

      // Check overdue tasks in project
      const overdueTasks = (project.tasks || []).filter(
        (t) => !t.completed && t.deadline && new Date(t.deadline).getTime() < now
      );

      if (overdueTasks.length > 0) {
        const fingerprint = `sig:project:overdue_tasks:${project.id}`;
        activeFingerprints.add(fingerprint);

        generatedSignals.push({
          workspaceId,
          fingerprint,
          category: "project",
          type: "project_task_overdue",
          severity: overdueTasks.length >= 3 ? "critical" : "high",
          priority: overdueTasks.length >= 3 ? 92 : 80,
          title: `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? "s" : ""} in "${project.title}"`,
          explanation: `Tasks overdue: ${overdueTasks.map((t) => `"${t.text}"`).slice(0, 2).join(", ")}${overdueTasks.length > 2 ? ` (+${overdueTasks.length - 2} more)` : ""}.`,
          details: "Overdue tasks disrupt dependent release milestones and campaign schedules.",
          affectedEntity: {
            type: "project",
            id: project.id,
            name: project.title,
            secondaryInfo: `${overdueTasks.length} tasks past deadline`,
          },
          recommendedAction: {
            type: "navigate_tab",
            label: "Open Project Console",
            targetTab: "project-console",
            actionDescription: "Mark tasks completed or reschedule target dates",
          },
          status: "new",
        });
      }
    }

    // -------------------------------------------------------------
    // 4. CONTENT ENGINE RADAR EVALUATION
    // -------------------------------------------------------------
    const scheduledContent = contentItems.filter((c) => c.status === "scheduled" && c.scheduledDate);
    const futureScheduled = scheduledContent.filter((c) => new Date(c.scheduledDate!).getTime() >= now);

    // Empty content pipeline check (if active operations exist but 0 scheduled posts in next 7 days)
    if (futureScheduled.length === 0 && (releases.length > 0 || campaigns.length > 0)) {
      const fingerprint = `sig:content:pipeline_empty:${workspaceId}`;
      activeFingerprints.add(fingerprint);

      generatedSignals.push({
        workspaceId,
        fingerprint,
        category: "content",
        type: "content_pipeline_empty",
        severity: "medium",
        priority: 62,
        title: "Content Pipeline Empty: No upcoming scheduled posts",
        explanation: "Your active workspace has zero short-form or social content items scheduled for publishing over the next 7 days.",
        details: "Consistent 3x–5x weekly posting maintains algorithmic reach across TikTok, Instagram Reels, and YouTube Shorts.",
        affectedEntity: {
          type: "workspace",
          id: workspaceId,
          name: workspace.name,
          secondaryInfo: "Content Pipeline",
        },
        recommendedAction: {
          type: "navigate_tab",
          label: "Open Content Engine",
          targetTab: "content-engine",
          actionDescription: "Use AI Content Brain to generate batch publishing schedule",
        },
        status: "new",
      });
    }

    // Content stuck in draft for long period
    const staleDrafts = contentItems.filter((c) => {
      if (c.status !== "draft" && c.status !== "idea") return false;
      const createdTime = new Date(c.createdAt).getTime();
      return now - createdTime > 7 * 86400000; // > 7 days old
    });

    if (staleDrafts.length >= 3) {
      const fingerprint = `sig:content:stale_drafts:${workspaceId}`;
      activeFingerprints.add(fingerprint);

      generatedSignals.push({
        workspaceId,
        fingerprint,
        category: "content",
        type: "content_stuck_draft",
        severity: "low",
        priority: 45,
        title: `${staleDrafts.length} Content Drafts pending review or schedule`,
        explanation: `Multiple content concepts created over a week ago remain in Draft status without scheduled delivery dates.`,
        details: `Top drafts: ${staleDrafts.slice(0, 2).map((d) => `"${d.title}"`).join(", ")}.`,
        affectedEntity: {
          type: "workspace",
          id: workspaceId,
          name: workspace.name,
          secondaryInfo: `${staleDrafts.length} stale drafts`,
        },
        recommendedAction: {
          type: "navigate_tab",
          label: "Review Content Drafts",
          targetTab: "content-engine",
          actionDescription: "Schedule or refine pending content items",
        },
        status: "new",
      });
    }

    // -------------------------------------------------------------
    // 5. KEEDOHUB STUDIO RADAR EVALUATION
    // -------------------------------------------------------------
    // Unreviewed Studio Requests
    const unreviewedRequests = studioRequests.filter(
      (r) => r.status === "REQUEST" || r.status === "BRIEF" || r.status === "REVIEW" || r.status === "QUOTE_PENDING"
    );
    for (const req of unreviewedRequests) {
      const fingerprint = `sig:studio:request_unreviewed:${req.id}`;
      activeFingerprints.add(fingerprint);

      generatedSignals.push({
        workspaceId,
        fingerprint,
        category: "studio",
        type: "studio_request_unreviewed",
        severity: "medium",
        priority: 70,
        title: `Studio Request "${req.title}" awaiting quote assignment`,
        explanation: `Creative brief for ${req.serviceName} has been submitted and is currently being assessed by Keedohub Studio producers.`,
        details: `Service category: ${req.serviceId}. Requested timeline: ${req.brief?.deadline || "Flexible"}.`,
        affectedEntity: {
          type: "studio_request",
          id: req.id,
          name: req.title,
          secondaryInfo: `Service: ${req.serviceName}`,
        },
        recommendedAction: {
          type: "navigate_tab",
          label: "Open Studio Hub",
          targetTab: "studio",
          actionDescription: "View creative brief and quote status",
        },
        status: "new",
      });
    }

    // Studio Quotes Pending Client Approval
    const pendingQuotes = studioQuotes.filter((q) => q.status === "SENT" || q.status === "VIEWED");
    for (const quote of pendingQuotes) {
      const fingerprint = `sig:studio:quote_pending:${quote.id}`;
      activeFingerprints.add(fingerprint);

      generatedSignals.push({
        workspaceId,
        fingerprint,
        category: "studio",
        type: "studio_quote_pending_approval",
        severity: "high",
        priority: 86,
        title: `Studio Quote for "${quote.serviceName}" awaits your approval`,
        explanation: `Official production quote ($${quote.price.toLocaleString()} ${quote.currency}) is ready. Production will initiate immediately upon client approval.`,
        details: `Timeline: ${quote.timeline}. Deliverables included: ${quote.deliverables?.length || 1} items. Revisions: ${quote.revisionAllowance}.`,
        affectedEntity: {
          type: "studio_quote",
          id: quote.id,
          name: quote.serviceName,
          secondaryInfo: `$${quote.price} ${quote.currency}`,
        },
        recommendedAction: {
          type: "navigate_tab",
          label: "Review & Approve Quote",
          targetTab: "studio",
          actionDescription: "Accept quote to commence Studio production pipeline",
        },
        status: "new",
      });
    }

    // Studio Deliverables Awaiting Review / Approval
    const pendingDeliverables = studioDeliverables.filter(
      (d) => d.approvalStatus === "pending" || d.status === "ready_for_review"
    );
    for (const del of pendingDeliverables) {
      const fingerprint = `sig:studio:deliverable_review:${del.id}`;
      activeFingerprints.add(fingerprint);

      generatedSignals.push({
        workspaceId,
        fingerprint,
        category: "studio",
        type: "studio_delivery_pending_approval",
        severity: "high",
        priority: 88,
        title: `Studio Deliverable "${del.name}" (${del.version}) ready for sign-off`,
        explanation: "Studio producers have completed the creative asset. Review and approve delivery or request revisions.",
        details: `Format: ${del.format}. Due date: ${del.dueDate}. Asset reference: ${del.assetUrl ? "Preview available" : "File attached"}.`,
        affectedEntity: {
          type: "studio_deliverable",
          id: del.id,
          name: del.name,
          secondaryInfo: `${del.version} (${del.format})`,
        },
        recommendedAction: {
          type: "navigate_tab",
          label: "Review Deliverable in Studio",
          targetTab: "studio",
          actionDescription: "Inspect asset and approve or submit revision notes",
        },
        status: "new",
      });
    }

    // -------------------------------------------------------------
    // 6. ASSET RADAR EVALUATION
    // -------------------------------------------------------------
    // Check for high-value hero assets not linked to any project or release
    const unlinkedAssets = assets.filter((a) => {
      const isHighValue = a.category === "cover" || a.tags?.includes("hero") || a.tags?.includes("cover");
      return isHighValue && !a.releaseId && !a.campaignId && !a.projectId;
    });

    if (unlinkedAssets.length >= 2) {
      const fingerprint = `sig:asset:unlinked_highvalue:${workspaceId}`;
      activeFingerprints.add(fingerprint);

      generatedSignals.push({
        workspaceId,
        fingerprint,
        category: "asset",
        type: "asset_missing_connection",
        severity: "low",
        priority: 38,
        title: `${unlinkedAssets.length} Unlinked Visual Assets in Media Library`,
        explanation: "High-resolution cover and hero assets exist in your Asset Vault but are not connected to active releases or campaigns.",
        details: `Unlinked files: ${unlinkedAssets.slice(0, 2).map((a) => `"${a.name}"`).join(", ")}.`,
        affectedEntity: {
          type: "workspace",
          id: workspaceId,
          name: workspace.name,
          secondaryInfo: `${unlinkedAssets.length} unattached assets`,
        },
        recommendedAction: {
          type: "navigate_tab",
          label: "Organize Asset Library",
          targetTab: "resource-vault",
          actionDescription: "Tag or assign assets to projects & release cores",
        },
        status: "new",
      });
    }

    // -------------------------------------------------------------
    // 7. PERSISTENCE, DEDUPLICATION & AUTO-RESOLUTION
    // -------------------------------------------------------------
    // Auto-resolve any existing signals that are no longer detected in activeFingerprints
    db.autoResolveMissingFingerprints(workspaceId, activeFingerprints);

    // Upsert all generated signals
    for (const sigData of generatedSignals) {
      db.upsertRadarSignal(sigData);
    }

    // Fetch active signals
    const activeSignals = db.getRadarSignals(workspaceId, { includeArchived: false });
    const allSignals = db.getRadarSignals(workspaceId, { includeArchived: true });

    // Build stats
    const stats: RadarStats = {
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

    // Generate Executive Digest
    const topAttentionItems = activeSignals.slice(0, 4);
    const criticalCount = stats.bySeverity.critical;
    const highCount = stats.bySeverity.high;

    let headline = "Creative operations running smoothly across all workstations.";
    if (criticalCount > 0) {
      headline = `${criticalCount} critical blocker${criticalCount > 1 ? "s" : ""} require immediate executive intervention.`;
    } else if (highCount > 0) {
      headline = `${highCount} high-priority item${highCount > 1 ? "s" : ""} need attention before upcoming deadlines.`;
    } else if (stats.totalActive > 0) {
      headline = `${stats.totalActive} proactive recommendation${stats.totalActive > 1 ? "s" : ""} detected to elevate workspace momentum.`;
    }

    const recommendationsSummary: string[] = topAttentionItems.map((item) => {
      const prefix = item.severity === "critical" ? "🔴 [CRITICAL]" : item.severity === "high" ? "🟠 [HIGH]" : "🟡 [ATTENTION]";
      return `${prefix} ${item.title} — ${item.recommendedAction.label}`;
    });

    const digest: RadarDigest = {
      workspaceId,
      generatedAt: new Date().toISOString(),
      headline,
      totalActiveSignals: stats.totalActive,
      criticalCount: stats.bySeverity.critical,
      highCount: stats.bySeverity.high,
      mediumCount: stats.bySeverity.medium,
      lowCount: stats.bySeverity.low,
      topAttentionItems,
      recommendationsSummary,
    };

    return {
      signals: activeSignals,
      digest,
      stats,
    };
  }

  /**
   * Deep AI Diagnostic Connection to Creative Brain.
   * Explains why an issue was flagged and generates an actionable step-by-step resolution plan.
   */
  public async explainAndSolveSignal(
    workspaceId: string,
    signalId: string,
    userQuery?: string
  ): Promise<{
    explanation: string;
    rootCause: string;
    actionPlan: string[];
    aiGuidance: string;
    affectedEntityName: string;
  }> {
    const signal = db.getRadarSignalById(workspaceId, signalId);
    if (!signal) {
      throw new Error("Signal not found");
    }

    const workspace = db.getWorkspaceById(workspaceId);
    const memories = db.getCreativeMemoryItems(workspaceId, { status: "active" });

    // If Gemini AI is available, generate rich contextual advice
    if (this.ai) {
      try {
        const memoryDirectives = memories.slice(0, 4).map((m) => `- [${m.category.toUpperCase()}] ${m.title}: ${m.content}`).join("\n");
        const prompt = `You are the Keedohub Creative Brain & Proactive Intelligence Radar diagnostic advisor.
A critical operational signal has been flagged on the user's creative operating system:

SIGNAL DETAILS:
- Title: ${signal.title}
- Severity: ${signal.severity.toUpperCase()} (Priority: ${signal.priority}/100)
- Category: ${signal.category.toUpperCase()}
- Affected Entity: ${signal.affectedEntity.name} (${signal.affectedEntity.type})
- Explanation: ${signal.explanation}
- Details: ${signal.details || "None"}
- Recommended Action: ${signal.recommendedAction.label}

WORKSPACE CONTEXT:
- Workspace Name: ${workspace?.name} (${workspace?.identityType})
- Genre/Niche: ${workspace?.genreOrNiche || "General"}

ACTIVE CREATIVE MEMORY DIRECTIVES:
${memoryDirectives || "Standard creative operations"}

USER SPECIFIC QUERY (if any):
"${userQuery || "Why was this flagged and what is the exact step-by-step resolution plan?"}"

Please provide a structured, razor-sharp executive response with:
1. Executive Diagnosis (Why this matters for algorithmic velocity, release readiness, or brand conversion)
2. Operational Root Cause
3. Exact 3-step action plan to resolve this signal immediately
4. Proactive Advice for future-proofing this workflow.

Keep the response concise, authoritative, professional, and directly actionable. Avoid fluff.`;

        const response = await this.ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        const text = response.text || "";
        return {
          explanation: text,
          rootCause: `Detected during deterministic workspace sweep: ${signal.explanation}`,
          actionPlan: [
            `Navigate to ${signal.recommendedAction.targetTab || "relevant workstation"}.`,
            `Complete ${signal.recommendedAction.label}.`,
            `Run Radar re-evaluation to auto-resolve signal.`,
          ],
          aiGuidance: text,
          affectedEntityName: signal.affectedEntity.name,
        };
      } catch (err) {
        console.error("[RadarService] Gemini AI explanation failed, using fallback:", err);
      }
    }

    // High quality deterministic fallback
    return {
      explanation: `Signal "${signal.title}" was proactively flagged because ${signal.explanation}. In Keedohub OS, complete readiness and timely content pipelines directly govern your DSP editorial placement and audience retention.`,
      rootCause: signal.details || signal.explanation,
      actionPlan: [
        `Click "${signal.recommendedAction.label}" to open the ${signal.recommendedAction.targetTab || "designated"} workstation.`,
        `Fulfill the missing requirement (${signal.affectedEntity.secondaryInfo || "deliverable"}).`,
        `Re-scan Radar to verify zero blockers remaining.`,
      ],
      aiGuidance: `Immediate action is recommended: ${signal.recommendedAction.actionDescription || "Review entity and complete remaining items"}.`,
      affectedEntityName: signal.affectedEntity.name,
    };
  }
}

export const creativeRadarService = new CreativeRadarService();
