import { db, TaskPriority, TaskStatus } from "./db";

/**
 * PHASE 14 - WORKFLOW & NOTIFICATION ENGINE
 * 
 * Unified workflow management with priority, status, assignee, due date and entity links.
 * Notifications Center for important Radar, task, approval, Studio, release and campaign events.
 * Reminders for approaching and overdue deadlines.
 * Activity timeline connected to real workspace events.
 * Workflow states: Pending → In Progress → Review → Approved → Completed.
 */

export type WorkflowState = 'pending' | 'in_progress' | 'review' | 'approved' | 'completed';
export type NotificationCategory = 'radar' | 'task' | 'approval' | 'studio' | 'release' | 'campaign' | 'content' | 'system';
export type ReminderType = 'deadline_approaching' | 'deadline_overdue' | 'milestone_approaching' | 'review_pending';

export interface UnifiedTask {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  workflowState: WorkflowState;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  completedAt?: string;
  
  // Entity Links
  entityType?: 'release' | 'campaign' | 'project' | 'content' | 'studio_request' | 'asset';
  entityId?: string;
  entityTitle?: string;
  
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationCenterItem {
  id: string;
  workspaceId: string;
  userId?: string;
  title: string;
  message: string;
  category: NotificationCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'info' | 'success' | 'warning' | 'request' | 'action_required';
  read: boolean;
  resolved: boolean;
  
  // Action Links
  actionLabel?: string;
  actionTab?: string;
  actionPayload?: Record<string, any>;
  
  // Entity Context
  entityType?: 'release' | 'campaign' | 'project' | 'content' | 'studio_request' | 'approval' | 'radar_signal';
  entityId?: string;
  entityTitle?: string;
  
  // Auto-resolution tracking
  autoResolveEnabled: boolean;
  resolveCondition?: {
    entityType: string;
    entityId: string;
    statusField: string;
    expectedValue: string;
  };
  
  createdAt: string;
  expiresAt?: string;
  readAt?: string;
  resolvedAt?: string;
}

export interface Reminder {
  id: string;
  workspaceId: string;
  userId?: string;
  type: ReminderType;
  title: string;
  message: string;
  relatedEntityType?: 'task' | 'milestone' | 'release' | 'campaign' | 'project';
  relatedEntityId?: string;
  targetDate: string;
  remindedAt?: string;
  dismissed: boolean;
  createdAt: string;
}

export interface ActivityTimelineItem {
  id: string;
  workspaceId: string;
  userId: string;
  userEmail: string;
  userAvatar?: string;
  action: string;
  actionDescription: string;
  entityType: 'release' | 'campaign' | 'project' | 'content' | 'asset' | 'task' | 'studio_request' | 'approval' | 'workspace';
  entityId: string;
  entityTitle?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

class WorkflowService {
  /**
   * Get unified tasks for a workspace with filtering
   */
  public getUnifiedTasks(workspaceId: string, filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    entityType?: string;
    entityId?: string;
    workflowState?: WorkflowState;
  }): UnifiedTask[] {
    const allTasks = db.getTasks(workspaceId);
    
    let filtered = allTasks.map(t => ({
      id: t.id,
      workspaceId: t.workspaceId || workspaceId,
      title: t.text,
      description: undefined,
      priority: t.priority || 'medium',
      status: t.status || 'todo',
      workflowState: this.mapStatusToWorkflowState(t.status || 'todo', t.completed) as WorkflowState,
      assigneeId: t.assignedTo,
      assigneeName: undefined,
      dueDate: t.deadline,
      completedAt: t.completed ? t.createdAt : undefined,
      entityType: t.releaseId ? 'release' : t.projectId ? 'project' : undefined,
      entityId: t.releaseId || t.projectId,
      entityTitle: t.projectTitle,
      category: t.category,
      tags: [],
      createdAt: t.createdAt || new Date().toISOString(),
      updatedAt: t.createdAt || new Date().toISOString(),
    }));
    
    if (filters) {
      if (filters.status) {
        filtered = filtered.filter(t => t.status === filters.status);
      }
      if (filters.priority) {
        filtered = filtered.filter(t => t.priority === filters.priority);
      }
      if (filters.assigneeId) {
        filtered = filtered.filter(t => t.assigneeId === filters.assigneeId);
      }
      if (filters.entityType) {
        filtered = filtered.filter(t => t.entityType === filters.entityType);
      }
      if (filters.entityId) {
        filtered = filtered.filter(t => t.entityId === filters.entityId);
      }
      if (filters.workflowState) {
        filtered = filtered.filter(t => t.workflowState === filters.workflowState);
      }
    }
    
    // Sort by priority and due date
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    filtered.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });
    
    return filtered;
  }
  
  private mapStatusToWorkflowState(status: TaskStatus, completed: boolean): WorkflowState {
    if (completed || status === 'completed') return 'completed';
    if (status === 'in_progress') return 'in_progress';
    return 'pending';
  }
  
  /**
   * Create a unified task with full workflow support
   */
  public createUnifiedTask(workspaceId: string, data: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: string;
    assigneeId?: string;
    assigneeName?: string;
    entityType?: 'release' | 'campaign' | 'project' | 'content' | 'studio_request' | 'asset';
    entityId?: string;
    entityTitle?: string;
    category?: string;
    tags?: string[];
  }): UnifiedTask {
    const task = db.createTask(workspaceId, {
      text: data.title,
      priority: data.priority,
      deadline: data.dueDate,
      assignedTo: data.assigneeId,
      category: data.category,
    });
    
    // Create notification for task assignment
    if (data.assigneeId) {
      db.addNotification(
        workspaceId,
        "New Task Assigned",
        `You have been assigned to: ${data.title}`,
        'request',
        undefined,
        data.assigneeId
      );
    }
    
    // Log activity
    db.logActivity(
      workspaceId,
      "system",
      "system@keedohub.com",
      "CREATE_TASK",
      "task",
      task.id,
      `Created task: ${data.title}`
    );
    
    return {
      id: task.id,
      workspaceId,
      title: task.text,
      description: data.description,
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      workflowState: 'pending',
      assigneeId: data.assigneeId,
      assigneeName: data.assigneeName,
      dueDate: data.dueDate,
      entityType: data.entityType,
      entityId: data.entityId,
      entityTitle: data.entityTitle,
      category: data.category,
      tags: data.tags || [],
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  
  /**
   * Update task workflow state
   */
  public updateTaskWorkflow(taskId: string, workspaceId: string, updates: {
    status?: TaskStatus;
    workflowState?: WorkflowState;
    completed?: boolean;
  }): UnifiedTask | null {
    const dbUpdates: Partial<typeof updates> = {};
    
    if (updates.completed !== undefined) {
      dbUpdates.completed = updates.completed;
    }
    
    const updated = db.updateTask(taskId, workspaceId, dbUpdates);
    
    // If task is completed, auto-resolve related notifications
    if (updates.completed || updates.status === 'completed') {
      this.autoResolveNotifications(workspaceId, 'task', taskId);
    }
    
    // Log activity
    db.logActivity(
      workspaceId,
      "system",
      "system@keedohub.com",
      "UPDATE_TASK_WORKFLOW",
      "task",
      taskId,
      `Updated task workflow state${updates.completed ? ' - COMPLETED' : ''}`
    );
    
    return {
      id: updated.id,
      workspaceId: updated.workspaceId || workspaceId,
      title: updated.text,
      priority: updated.priority || 'medium',
      status: updated.status || 'todo',
      workflowState: this.mapStatusToWorkflowState(updated.status || 'todo', updated.completed),
      assigneeId: updated.assignedTo,
      dueDate: updated.deadline,
      completedAt: updated.completed ? updated.createdAt : undefined,
      entityType: updated.releaseId ? 'release' : updated.projectId ? 'project' : undefined,
      entityId: updated.releaseId || updated.projectId,
      entityTitle: updated.projectTitle,
      category: updated.category,
      tags: [],
      createdAt: updated.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  
  /**
   * Get notifications center items with deduplication
   */
  public getNotificationCenter(workspaceId: string, userId?: string, limit: number = 50): NotificationCenterItem[] {
    const notifications = db.getNotifications(workspaceId, userId);
    
    // Map to enhanced notification format
    const mapped = notifications.map(n => ({
      id: n.id,
      workspaceId: n.workspaceId,
      userId: n.userId,
      title: n.title,
      message: n.message,
      category: this.inferNotificationCategory(n.title, n.message) as NotificationCategory,
      severity: this.inferNotificationSeverity(n.type) as 'low' | 'medium' | 'high' | 'critical',
      type: n.type as 'info' | 'success' | 'warning' | 'request' | 'action_required',
      read: n.read,
      resolved: false,
      actionLabel: 'View Details',
      actionTab: n.link ? this.extractTabFromLink(n.link) : undefined,
      actionPayload: n.link ? { url: n.link } : undefined,
      entityType: undefined,
      entityId: undefined,
      entityTitle: undefined,
      autoResolveEnabled: false,
      createdAt: n.createdAt,
    }));
    
    // Deduplicate by fingerprint (title + entityId pattern)
    const seen = new Set<string>();
    const deduplicated = mapped.filter(n => {
      const fingerprint = `${n.title}-${n.entityId || 'global'}`;
      if (seen.has(fingerprint)) return false;
      seen.add(fingerprint);
      return true;
    });
    
    // Sort by recency
    deduplicated.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return deduplicated.slice(0, limit);
  }
  
  private inferNotificationCategory(title: string, message: string): NotificationCategory {
    const text = `${title} ${message}`.toLowerCase();
    if (text.includes('radar') || text.includes('signal') || text.includes('alert')) return 'radar';
    if (text.includes('task') || text.includes('assigned')) return 'task';
    if (text.includes('approval') || text.includes('approve')) return 'approval';
    if (text.includes('studio') || text.includes('design') || text.includes('creative')) return 'studio';
    if (text.includes('release') || text.includes('launch')) return 'release';
    if (text.includes('campaign')) return 'campaign';
    if (text.includes('content') || text.includes('post')) return 'content';
    return 'system';
  }
  
  private inferNotificationSeverity(type: string): string {
    switch (type) {
      case 'warning': return 'high';
      case 'request': return 'medium';
      case 'success': return 'low';
      default: return 'low';
    }
  }
  
  private extractTabFromLink(link: string): string {
    if (link.includes('/releases/')) return 'artist-os';
    if (link.includes('/campaigns/')) return 'content-engine';
    if (link.includes('/projects/')) return 'project-console';
    if (link.includes('/studio/')) return 'studio';
    if (link.includes('/content/')) return 'content-engine';
    return 'command-center';
  }
  
  /**
   * Mark notification as read
   */
  public markNotificationRead(notifId: string, workspaceId: string): boolean {
    return db.markNotificationRead(notifId, workspaceId);
  }
  
  /**
   * Auto-resolve notifications when underlying issue is completed
   */
  public autoResolveNotifications(workspaceId: string, entityType: string, entityId: string): void {
    const notifications = db.getNotifications(workspaceId);
    
    notifications.forEach(n => {
      // Check if notification is related to the completed entity
      if (n.link && n.link.includes(entityId)) {
        db.markNotificationRead(n.id, workspaceId);
      }
    });
  }
  
  /**
   * Get reminders for approaching/overdue deadlines
   */
  public getReminders(workspaceId: string, userId?: string): Reminder[] {
    const now = new Date();
    const soonThreshold = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
    const overdueThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
    
    const tasks = db.getTasks(workspaceId);
    const reminders: Reminder[] = [];
    
    tasks.forEach(task => {
      if (!task.deadline || task.completed) return;
      
      const deadline = new Date(task.deadline);
      
      // Overdue tasks
      if (deadline < now) {
        reminders.push({
          id: `rem_overdue_${task.id}`,
          workspaceId,
          userId: task.assignedTo || userId,
          type: 'deadline_overdue',
          title: 'Overdue Task',
          message: `Task "${task.text}" is overdue since ${deadline.toLocaleDateString()}`,
          relatedEntityType: 'task',
          relatedEntityId: task.id,
          targetDate: task.deadline,
          dismissed: false,
          createdAt: new Date().toISOString(),
        });
      }
      // Approaching deadlines (within 3 days)
      else if (deadline <= soonThreshold) {
        reminders.push({
          id: `rem_approach_${task.id}`,
          workspaceId,
          userId: task.assignedTo || userId,
          type: 'deadline_approaching',
          title: 'Deadline Approaching',
          message: `Task "${task.text}" is due on ${deadline.toLocaleDateString()}`,
          relatedEntityType: 'task',
          relatedEntityId: task.id,
          targetDate: task.deadline,
          dismissed: false,
          createdAt: new Date().toISOString(),
        });
      }
    });
    
    return reminders;
  }
  
  /**
   * Dismiss a reminder
   */
  public dismissReminder(reminderId: string, workspaceId: string): boolean {
    // Reminders are ephemeral, just log the dismissal
    db.logActivity(
      workspaceId,
      "system",
      "system@keedohub.com",
      "DISMISS_REMINDER",
      "reminder",
      reminderId,
      `Dismissed reminder: ${reminderId}`
    );
    return true;
  }
  
  /**
   * Get activity timeline for workspace
   */
  public getActivityTimeline(workspaceId: string, limit: number = 100): ActivityTimelineItem[] {
    const logs = db.getActivityLogs(workspaceId);
    
    return logs.slice(0, limit).map(log => ({
      id: log.id,
      workspaceId: log.workspaceId,
      userId: log.userId,
      userEmail: log.userEmail,
      userAvatar: undefined, // Could be populated from user record
      action: log.action,
      actionDescription: log.details,
      entityType: log.entityType as ActivityTimelineItem['entityType'],
      entityId: log.entityId,
      entityTitle: undefined,
      metadata: {},
      timestamp: log.createdAt,
    }));
  }
  
  /**
   * Log activity to timeline
   */
  public logActivity(workspaceId: string, userId: string, userEmail: string, action: string, entityType: string, entityId: string, details: string): ActivityTimelineItem {
    const log = db.logActivity(workspaceId, userId, userEmail, action, entityType, entityId, details);
    
    return {
      id: log.id,
      workspaceId: log.workspaceId,
      userId: log.userId,
      userEmail: log.userEmail,
      action: log.action,
      actionDescription: log.details,
      entityType: log.entityType as ActivityTimelineItem['entityType'],
      entityId: log.entityId,
      timestamp: log.createdAt,
    };
  }
  
  /**
   * Create notification with smart deduplication
   */
  public createNotification(workspaceId: string, data: {
    title: string;
    message: string;
    category: NotificationCategory;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    type?: 'info' | 'success' | 'warning' | 'request' | 'action_required';
    userId?: string;
    entityType?: string;
    entityId?: string;
    entityTitle?: string;
    actionLabel?: string;
    actionTab?: string;
    actionPayload?: Record<string, any>;
    autoResolveEnabled?: boolean;
    resolveCondition?: NotificationCenterItem['resolveCondition'];
  }): NotificationCenterItem {
    // Check for duplicate active notifications
    const existing = db.getNotifications(workspaceId, data.userId);
    const isDuplicate = existing.some(n => 
      !n.read && 
      n.title === data.title && 
      n.message === data.message
    );
    
    if (isDuplicate) {
      // Skip creating duplicate notification
      return null as any;
    }
    
    const notif = db.addNotification(
      workspaceId,
      data.title,
      data.message,
      data.type === 'action_required' ? 'request' : data.type || 'info',
      undefined,
      data.userId
    );
    
    return {
      id: notif.id,
      workspaceId: notif.workspaceId,
      userId: notif.userId,
      title: notif.title,
      message: notif.message,
      category: data.category,
      severity: data.severity || 'medium',
      type: data.type || 'info',
      read: notif.read,
      resolved: false,
      actionLabel: data.actionLabel,
      actionTab: data.actionTab,
      actionPayload: data.actionPayload,
      entityType: data.entityType as any,
      entityId: data.entityId,
      entityTitle: data.entityTitle,
      autoResolveEnabled: data.autoResolveEnabled || false,
      resolveCondition: data.resolveCondition,
      createdAt: notif.createdAt,
    };
  }
  
  /**
   * Get workflow statistics
   */
  public getWorkflowStats(workspaceId: string): {
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    overdueTasks: number;
    unreadNotifications: number;
    activeReminders: number;
  } {
    const tasks = db.getTasks(workspaceId);
    const notifications = db.getNotifications(workspaceId);
    const now = new Date();
    
    const pendingTasks = tasks.filter(t => !t.completed && t.status === 'todo').length;
    const inProgressTasks = tasks.filter(t => !t.completed && t.status === 'in_progress').length;
    const completedTasks = tasks.filter(t => t.completed || t.status === 'completed').length;
    const overdueTasks = tasks.filter(t => 
      !t.completed && 
      t.deadline && 
      new Date(t.deadline) < now
    ).length;
    const unreadNotifications = notifications.filter(n => !n.read).length;
    
    return {
      totalTasks: tasks.length,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      unreadNotifications,
      activeReminders: 0, // Would need separate storage
    };
  }
}

export const workflowService = new WorkflowService();
