import { db, NotificationRecord, ActivityLogRecord } from "../db";
import { 
  TaskItem, 
  TaskPriority, 
  TaskStatus, 
  NotificationItem, 
  NotificationCategory, 
  NotificationSeverity, 
  DeadlineReminder, 
  WorkflowSummary, 
  ActiveTab 
} from "../../src/types";

export class WorkflowEngine {
  /**
   * Generates or syncs proactive workflow notifications from radar signals, 
   * approaching deadlines, pending approvals, and studio items without spam or duplication.
   */
  public static syncWorkspaceNotifications(workspaceId: string): NotificationItem[] {
    const existingNotifs = db.getNotifications(workspaceId);
    const existingFingerprints = new Set(
      existingNotifs.filter(n => !n.resolved).map(n => n.fingerprint || n.id)
    );

    const now = Date.now();
    const newNotifications: NotificationRecord[] = [];

    // 1. Check Proactive Radar Signals (Critical & High severity)
    const radarSignals = db.getRadarSignals(workspaceId);
    for (const signal of radarSignals) {
      if (signal.status === 'dismissed' || signal.status === 'actioned' || signal.status === 'expired') {
        // Auto-resolve any existing notification matching this signal fingerprint
        const matching = existingNotifs.find(n => n.fingerprint === `radar:${signal.id}` && !n.resolved);
        if (matching) {
          matching.resolved = true;
          matching.resolvedAt = new Date().toISOString();
        }
        continue;
      }

      if (signal.severity === 'critical' || signal.severity === 'high') {
        const fp = `radar:${signal.id}`;
        if (!existingFingerprints.has(fp)) {
          const notif: NotificationRecord = {
            id: "notif_" + crypto.randomUUID().substring(0, 8),
            workspaceId,
            fingerprint: fp,
            title: `Radar Alert: ${signal.title}`,
            message: signal.explanation || "Creative Radar flagged an actionable operational bottleneck.",
            category: "radar",
            severity: signal.severity === 'critical' ? 'critical' : 'high',
            type: signal.severity === 'critical' ? 'critical' : 'warning',
            read: false,
            resolved: false,
            actionTab: (signal.recommendedAction?.targetTab as ActiveTab) || 'creative-radar',
            actionLabel: signal.recommendedAction?.label || 'Review Radar Signal',
            entityType: signal.affectedEntity?.type || 'radar',
            entityId: signal.affectedEntity?.id || signal.id,
            entityTitle: signal.affectedEntity?.name || signal.title,
            createdAt: signal.createdAt || new Date().toISOString(),
          };
          newNotifications.push(notif);
          existingFingerprints.add(fp);
        }
      }
    }

    // 2. Check Approvals Needed (Studio Quotes & Deliverables)
    const studioQuotes = db.getStudioQuotes(workspaceId);
    for (const quote of studioQuotes) {
      if (quote.status === 'sent' || quote.status === 'under_review') {
        const fp = `studio_quote_approval:${quote.id}`;
        if (!existingFingerprints.has(fp)) {
          const notif: NotificationRecord = {
            id: "notif_" + crypto.randomUUID().substring(0, 8),
            workspaceId,
            fingerprint: fp,
            title: `Quote Approval Required: ${quote.serviceName}`,
            message: `Studio proposal (${quote.currency} ${quote.finalTotalAmount.toLocaleString()}) requires approval to kick off production.`,
            category: "approval",
            severity: "high",
            type: "request",
            read: false,
            resolved: false,
            actionTab: "studio",
            actionLabel: "Review Quote & Approve",
            entityType: "studio_quote",
            entityId: quote.id,
            entityTitle: quote.serviceName,
            createdAt: quote.createdAt,
          };
          newNotifications.push(notif);
          existingFingerprints.add(fp);
        }
      } else if (quote.status === 'approved' || quote.status === 'declined') {
        // Auto-resolve
        const matching = existingNotifs.find(n => n.fingerprint === `studio_quote_approval:${quote.id}` && !n.resolved);
        if (matching) {
          matching.resolved = true;
          matching.resolvedAt = new Date().toISOString();
        }
      }
    }

    // 3. Check Studio Deliverables Ready for Review
    const deliverables = db.getStudioDeliverables(workspaceId);
    for (const d of deliverables) {
      if (d.status === 'review_ready') {
        const fp = `studio_deliverable_review:${d.id}`;
        if (!existingFingerprints.has(fp)) {
          const notif: NotificationRecord = {
            id: "notif_" + crypto.randomUUID().substring(0, 8),
            workspaceId,
            fingerprint: fp,
            title: `Deliverable Ready for Review: ${d.name}`,
            message: `Version ${d.currentVersion || 1} has been uploaded and awaits your sign-off or revision notes.`,
            category: "studio",
            severity: "high",
            type: "request",
            read: false,
            resolved: false,
            actionTab: "studio",
            actionLabel: "Review Asset in Studio",
            entityType: "studio_deliverable",
            entityId: d.id,
            entityTitle: d.name,
            createdAt: d.updatedAt || new Date().toISOString(),
          };
          newNotifications.push(notif);
          existingFingerprints.add(fp);
        }
      } else if (d.status === 'approved') {
        // Auto-resolve
        const matching = existingNotifs.find(n => n.fingerprint === `studio_deliverable_review:${d.id}` && !n.resolved);
        if (matching) {
          matching.resolved = true;
          matching.resolvedAt = new Date().toISOString();
        }
      }
    }

    // 4. Check Approaching & Overdue Release Deadlines
    const releases = db.getReleases(workspaceId);
    for (const rel of releases) {
      if (!rel.releaseDate) continue;
      const targetTime = new Date(rel.releaseDate).getTime();
      const diffHours = (targetTime - now) / (1000 * 60 * 60);

      if (diffHours < 0 && rel.status !== 'released') {
        // Overdue release drop
        const fp = `deadline_overdue:release:${rel.id}`;
        if (!existingFingerprints.has(fp)) {
          const notif: NotificationRecord = {
            id: "notif_" + crypto.randomUUID().substring(0, 8),
            workspaceId,
            fingerprint: fp,
            title: `Target Release Date Passed: ${rel.title}`,
            message: `Scheduled drop date (${rel.releaseDate}) has passed. Update release status or reschedule rollout.`,
            category: "release",
            severity: "critical",
            type: "critical",
            read: false,
            resolved: false,
            actionTab: "artist-os",
            actionLabel: "Inspect Release Rollout",
            entityType: "release",
            entityId: rel.id,
            entityTitle: rel.title,
            createdAt: new Date().toISOString(),
          };
          newNotifications.push(notif);
          existingFingerprints.add(fp);
        }
      } else if (diffHours >= 0 && diffHours <= 48 && rel.status !== 'released') {
        // Drop in <= 48 hours
        const fp = `deadline_imminent:release:${rel.id}`;
        if (!existingFingerprints.has(fp)) {
          const notif: NotificationRecord = {
            id: "notif_" + crypto.randomUUID().substring(0, 8),
            workspaceId,
            fingerprint: fp,
            title: `Release Drop in ${Math.ceil(diffHours / 24)}d: ${rel.title}`,
            message: `Finalize DSP pitch, verify audio master, and trigger rollout sprint assets.`,
            category: "release",
            severity: "high",
            type: "warning",
            read: false,
            resolved: false,
            actionTab: "dsp-pitcher",
            actionLabel: "Check DSP Pitch & Masters",
            entityType: "release",
            entityId: rel.id,
            entityTitle: rel.title,
            createdAt: new Date().toISOString(),
          };
          newNotifications.push(notif);
          existingFingerprints.add(fp);
        }
      } else if (rel.status === 'released') {
        // Auto-resolve any open release deadline notifications
        for (const n of existingNotifs) {
          if (n.entityId === rel.id && n.category === 'release' && !n.resolved) {
            n.resolved = true;
            n.resolvedAt = new Date().toISOString();
          }
        }
      }
    }

    // 5. Check Approaching Campaign Sprints & Approvals
    const campaigns = db.getCampaigns(workspaceId);
    for (const c of campaigns) {
      if (c.approvals && (!c.approvals.creativeApproved || !c.approvals.budgetApproved || !c.approvals.launchApproved)) {
        if (c.status === 'preparing' || c.status === 'ready') {
          const fp = `campaign_approval:${c.id}`;
          if (!existingFingerprints.has(fp)) {
            const notif: NotificationRecord = {
              id: "notif_" + crypto.randomUUID().substring(0, 8),
              workspaceId,
              fingerprint: fp,
              title: `Campaign Approval Pending: ${c.title}`,
              message: `Sign-off required for ${!c.approvals.creativeApproved ? 'Creative Direction' : !c.approvals.budgetApproved ? 'Budget allocation' : 'Launch authorization'}.`,
              category: "approval",
              severity: "high",
              type: "request",
              read: false,
              resolved: false,
              actionTab: "brand-os",
              actionLabel: "Approve Campaign Sprint",
              entityType: "campaign",
              entityId: c.id,
              entityTitle: c.title,
              createdAt: c.createdAt,
            };
            newNotifications.push(notif);
            existingFingerprints.add(fp);
          }
        }
      } else if (c.approvals?.launchApproved && c.status === 'active') {
        // Auto-resolve
        const matching = existingNotifs.find(n => n.fingerprint === `campaign_approval:${c.id}` && !n.resolved);
        if (matching) {
          matching.resolved = true;
          matching.resolvedAt = new Date().toISOString();
        }
      }
    }

    // 6. Check Urgent / Overdue Tasks
    const tasks = db.getTasks(workspaceId);
    for (const t of tasks) {
      if (!t.completed && t.deadline) {
        const deadlineTime = new Date(t.deadline).getTime();
        const diffDays = (deadlineTime - now) / (1000 * 60 * 60 * 24);

        if (diffDays < 0) {
          // Overdue task
          const fp = `task_overdue:${t.id}`;
          if (!existingFingerprints.has(fp)) {
            const notif: NotificationRecord = {
              id: "notif_" + crypto.randomUUID().substring(0, 8),
              workspaceId,
              fingerprint: fp,
              title: `Overdue Task: ${t.text}`,
              message: `Deadline (${t.deadline}) has passed. Assignee: ${t.assignedTo || 'Unassigned'}.`,
              category: "task",
              severity: t.priority === 'urgent' ? 'critical' : 'warning',
              type: t.priority === 'urgent' ? 'critical' : 'warning',
              read: false,
              resolved: false,
              actionTab: "workflow",
              actionLabel: "View & Complete Task",
              entityType: "task",
              entityId: t.id,
              entityTitle: t.text,
              createdAt: new Date().toISOString(),
            };
            newNotifications.push(notif);
            existingFingerprints.add(fp);
          }
        }
      } else if (t.completed) {
        // Auto-resolve task notification
        const matching = existingNotifs.find(n => (n.fingerprint === `task_overdue:${t.id}` || n.entityId === t.id) && !n.resolved);
        if (matching) {
          matching.resolved = true;
          matching.resolvedAt = new Date().toISOString();
        }
      }
    }

    // Persist new notifications
    if (newNotifications.length > 0) {
      for (const n of newNotifications) {
        (db as any).data.notifications.unshift(n);
      }
      db.save();
    }

    return db.getNotifications(workspaceId) as NotificationItem[];
  }

  /**
   * Retrieves aggregated deadline reminders across Releases, Campaigns, Tasks, Milestones, and Studio items.
   */
  public static getDeadlineReminders(workspaceId: string): DeadlineReminder[] {
    const now = Date.now();
    const reminders: DeadlineReminder[] = [];

    // Releases
    const releases = db.getReleases(workspaceId);
    for (const r of releases) {
      if (r.releaseDate && r.status !== 'released') {
        const dueTime = new Date(r.releaseDate).getTime();
        const daysDiff = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));
        const isOverdue = daysDiff < 0;

        reminders.push({
          id: `reminder_rel_${r.id}`,
          workspaceId,
          title: `Release: ${r.title}`,
          subtitle: `${r.type.toUpperCase()} • ${r.tracks?.length || 1} track(s)`,
          dueDate: r.releaseDate,
          formattedDate: new Date(r.releaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          daysRemaining: daysDiff,
          isOverdue,
          urgency: isOverdue ? 'critical' : daysDiff <= 3 ? 'high' : daysDiff <= 7 ? 'medium' : 'low',
          category: 'release',
          entityId: r.id,
          entityTitle: r.title,
          actionTab: 'artist-os',
          actionLabel: 'Open Release Hub',
        });
      }
    }

    // Campaigns
    const campaigns = db.getCampaigns(workspaceId);
    for (const c of campaigns) {
      if (c.endDate && c.status !== 'completed') {
        const dueTime = new Date(c.endDate).getTime();
        const daysDiff = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));
        const isOverdue = daysDiff < 0;

        reminders.push({
          id: `reminder_camp_${c.id}`,
          workspaceId,
          title: `Campaign: ${c.title}`,
          subtitle: `${c.platforms.join(", ")} • Goal: ${c.goal}`,
          dueDate: c.endDate,
          formattedDate: new Date(c.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          daysRemaining: daysDiff,
          isOverdue,
          urgency: isOverdue ? 'critical' : daysDiff <= 3 ? 'high' : daysDiff <= 7 ? 'medium' : 'low',
          category: 'campaign',
          entityId: c.id,
          entityTitle: c.title,
          actionTab: 'brand-os',
          actionLabel: 'Manage Campaign',
        });
      }
    }

    // Studio Deliverables
    const deliverables = db.getStudioDeliverables(workspaceId);
    for (const d of deliverables) {
      if (d.dueDate && d.status !== 'approved') {
        const dueTime = new Date(d.dueDate).getTime();
        const daysDiff = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));
        const isOverdue = daysDiff < 0;

        reminders.push({
          id: `reminder_del_${d.id}`,
          workspaceId,
          title: `Deliverable: ${d.name}`,
          subtitle: `Studio Asset • Status: ${d.status.replace("_", " ").toUpperCase()}`,
          dueDate: d.dueDate,
          formattedDate: new Date(d.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          daysRemaining: daysDiff,
          isOverdue,
          urgency: isOverdue ? 'critical' : daysDiff <= 2 ? 'high' : 'medium',
          category: 'studio_deliverable',
          entityId: d.id,
          entityTitle: d.name,
          actionTab: 'studio',
          actionLabel: 'Inspect in Studio',
        });
      }
    }

    // Tasks
    const tasks = db.getTasks(workspaceId);
    for (const t of tasks) {
      if (t.deadline && !t.completed) {
        const dueTime = new Date(t.deadline).getTime();
        const daysDiff = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));
        const isOverdue = daysDiff < 0;

        reminders.push({
          id: `reminder_task_${t.id}`,
          workspaceId,
          title: `Task: ${t.text}`,
          subtitle: `Assigned: ${t.assignedTo || 'Unassigned'} • Priority: ${(t.priority || 'medium').toUpperCase()}`,
          dueDate: t.deadline,
          formattedDate: new Date(t.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          daysRemaining: daysDiff,
          isOverdue,
          urgency: isOverdue ? 'critical' : t.priority === 'urgent' ? 'critical' : daysDiff <= 2 ? 'high' : 'medium',
          category: 'task',
          entityId: t.id,
          entityTitle: t.text,
          actionTab: 'workflow',
          actionLabel: 'Complete Task',
        });
      }
    }

    // Milestones
    const milestones = db.getMilestones(workspaceId);
    for (const m of milestones) {
      if (m.targetDate && !m.completed && m.status !== 'achieved') {
        const dueTime = new Date(m.targetDate).getTime();
        const daysDiff = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));
        const isOverdue = daysDiff < 0;

        reminders.push({
          id: `reminder_m_${m.id}`,
          workspaceId,
          title: `Milestone: ${m.title}`,
          subtitle: `Target Achievement Date`,
          dueDate: m.targetDate,
          formattedDate: new Date(m.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          daysRemaining: daysDiff,
          isOverdue,
          urgency: isOverdue ? 'critical' : daysDiff <= 3 ? 'high' : 'medium',
          category: 'milestone',
          entityId: m.id,
          entityTitle: m.title,
          actionTab: 'project-console',
          actionLabel: 'View Milestone',
        });
      }
    }

    // Sort: overdue first, then by daysRemaining ascending
    return reminders.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return a.daysRemaining - b.daysRemaining;
    });
  }

  /**
   * Generates a comprehensive workflow executive summary.
   */
  public static getWorkflowSummary(workspaceId: string): WorkflowSummary {
    this.syncWorkspaceNotifications(workspaceId);
    const tasks = db.getTasks(workspaceId);
    const notifications = db.getNotifications(workspaceId);
    const reminders = this.getDeadlineReminders(workspaceId);
    const radar = db.getRadarSignals(workspaceId);
    const quotes = db.getStudioQuotes(workspaceId);
    const deliverables = db.getStudioDeliverables(workspaceId);
    const campaigns = db.getCampaigns(workspaceId);

    const pendingApprovalsCount = 
      quotes.filter(q => q.status === 'sent' || q.status === 'under_review').length +
      deliverables.filter(d => d.status === 'review_ready').length +
      campaigns.filter(c => c.approvals && (!c.approvals.creativeApproved || !c.approvals.launchApproved)).length;

    const byStatus = {
      pending: 0,
      in_progress: 0,
      review: 0,
      approved: 0,
      completed: 0,
      blocked: 0,
    };

    const byPriority = {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const t of tasks) {
      const st = (t.status || (t.completed ? 'completed' : 'todo')).toLowerCase();
      if (st === 'completed') byStatus.completed++;
      else if (st === 'in-progress' || st === 'in_progress') byStatus.in_progress++;
      else if (st === 'review') byStatus.review++;
      else if (st === 'approved') byStatus.approved++;
      else if (st === 'blocked') byStatus.blocked++;
      else byStatus.pending++;

      const pr = (t.priority || 'medium').toLowerCase() as TaskPriority;
      if (byPriority[pr] !== undefined) {
        byPriority[pr]++;
      } else {
        byPriority.medium++;
      }
    }

    return {
      workspaceId,
      totalTasks: tasks.length,
      completedTasks: byStatus.completed,
      pendingTasks: tasks.length - byStatus.completed,
      byStatus,
      byPriority,
      approvalsPending: pendingApprovalsCount,
      overdueDeadlinesCount: reminders.filter(r => r.isOverdue).length,
      approachingDeadlinesCount: reminders.filter(r => !r.isOverdue && r.daysRemaining <= 7).length,
      unreadNotificationsCount: notifications.filter(n => !n.read && !n.resolved).length,
      activeRadarSignalsCount: radar.filter(r => r.status === 'new' || r.status === 'acknowledged').length,
    };
  }

  /**
   * Transitions a task through the workflow lifecycle:
   * pending -> in_progress -> review -> approved -> completed
   */
  public static transitionTaskStatus(
    workspaceId: string, 
    taskId: string, 
    newStatus: TaskStatus, 
    actorUser?: { id: string; email: string; name?: string }
  ): TaskItem {
    const isCompleted = newStatus === 'completed';
    const updates: Partial<TaskItem> = {
      status: newStatus,
      completed: isCompleted,
      updatedAt: new Date().toISOString(),
    };

    if (isCompleted) {
      updates.completedAt = new Date().toISOString();
    }

    const updatedTask = db.updateTask(taskId, workspaceId, updates);

    // Auto-resolve any open notifications linked to this task if marked completed
    if (isCompleted) {
      const allNotifs = db.getNotifications(workspaceId);
      for (const n of allNotifs) {
        if ((n.entityId === taskId || n.fingerprint === `task_overdue:${taskId}`) && !n.resolved) {
          n.resolved = true;
          n.resolvedAt = new Date().toISOString();
        }
      }
      db.save();
    }

    // Log Activity
    if (actorUser) {
      db.logActivity(
        workspaceId,
        actorUser.id,
        actorUser.email,
        `task_${newStatus}`,
        "task",
        taskId,
        `Task "${updatedTask.text}" transitioned to ${newStatus.toUpperCase()}`
      );
    }

    return updatedTask;
  }

  /**
   * One-click approval resolution for Studio Quotes, Deliverables, and Campaign Sprints.
   */
  public static handleApprovalAction(
    workspaceId: string,
    approvalType: 'studio_quote' | 'studio_deliverable' | 'campaign_sprint',
    entityId: string,
    action: 'approve' | 'reject' | 'request_revision',
    notes?: string,
    actorUser?: { id: string; email: string; name?: string }
  ) {
    if (approvalType === 'studio_quote') {
      const quote = db.getStudioQuoteById(workspaceId, entityId);
      if (!quote) throw new Error("Studio quote not found");
      
      const newStatus = action === 'approve' ? 'approved' : 'declined';
      db.updateStudioQuoteStatus(workspaceId, entityId, newStatus, {
        approvedBy: actorUser?.email || "Workspace Lead",
        declinedReason: notes,
      });

      // Auto-resolve matching notifications
      const notifs = db.getNotifications(workspaceId);
      for (const n of notifs) {
        if (n.entityId === entityId && n.category === 'approval') {
          n.resolved = true;
          n.resolvedAt = new Date().toISOString();
          n.read = true;
        }
      }
      db.save();

      return { success: true, entityType: 'studio_quote', entityId, status: newStatus };
    }

    if (approvalType === 'studio_deliverable') {
      const deliverable = db.getStudioDeliverableById(workspaceId, entityId);
      if (!deliverable) throw new Error("Studio deliverable not found");

      let newStatus = deliverable.status;
      if (action === 'approve') {
        newStatus = 'approved';
        db.updateStudioDeliverable(workspaceId, entityId, {
          status: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy: actorUser?.email || "Workspace Lead",
        });
      } else {
        newStatus = 'revision_requested';
        db.updateStudioDeliverable(workspaceId, entityId, { status: 'revision_requested' });
        // Create revision entry
        db.createStudioRevision(workspaceId, {
          projectId: deliverable.projectId,
          deliverableId: entityId,
          deliverableName: deliverable.name,
          version: `v${(deliverable.currentVersion || 1) + 1}`,
          reason: notes || "Review feedback requested revisions",
          requestedChanges: notes || "Adjust creative composition per sign-off notes",
        });
      }

      // Auto-resolve notifications
      const notifs = db.getNotifications(workspaceId);
      for (const n of notifs) {
        if (n.entityId === entityId && (n.category === 'studio' || n.category === 'approval')) {
          n.resolved = true;
          n.resolvedAt = new Date().toISOString();
          n.read = true;
        }
      }
      db.save();

      return { success: true, entityType: 'studio_deliverable', entityId, status: newStatus };
    }

    if (approvalType === 'campaign_sprint') {
      const campaign = db.getCampaignById(workspaceId, entityId);
      if (!campaign) throw new Error("Campaign not found");

      const approvals = campaign.approvals || {
        creativeApproved: false,
        budgetApproved: false,
        launchApproved: false,
      };

      if (action === 'approve') {
        approvals.creativeApproved = true;
        approvals.budgetApproved = true;
        approvals.launchApproved = true;
        approvals.launchApprovedBy = actorUser?.email || "Workspace Lead";
        approvals.signoffNotes = notes || "Approved for active deployment";
        db.updateCampaign(entityId, workspaceId, { approvals, status: 'active' });
      }

      // Auto-resolve notifications
      const notifs = db.getNotifications(workspaceId);
      for (const n of notifs) {
        if (n.entityId === entityId && n.category === 'approval') {
          n.resolved = true;
          n.resolvedAt = new Date().toISOString();
          n.read = true;
        }
      }
      db.save();

      return { success: true, entityType: 'campaign_sprint', entityId, status: 'approved' };
    }

    throw new Error("Unsupported approval type");
  }
}
