import React, { useState, useEffect, useMemo } from "react";
import {
  CheckSquare,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Disc3,
  Flame,
  Palette,
  Briefcase,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Trash2,
  Edit2,
  User,
  Tag,
  ExternalLink,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  FlameKindling,
  Activity,
  Check,
  X,
  MessageSquare,
} from "lucide-react";
import {
  TaskItem,
  TaskStatus,
  NotificationItem,
  DeadlineReminder,
  WorkflowSummary,
  ActivityLog,
  ActiveTab,
  Release,
  Campaign,
  Project,
  ProductService,
} from "../types";
import { api } from "../services/api";

interface WorkflowHubProps {
  workspaceId?: string;
  onNavigateTab: (tab: ActiveTab, entityId?: string) => void;
}

export const WorkflowHub: React.FC<WorkflowHubProps> = ({
  workspaceId,
  onNavigateTab,
}) => {
  // State
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [summary, setSummary] = useState<WorkflowSummary | null>(null);
  const [deadlines, setDeadlines] = useState<DeadlineReminder[]>([]);
  const [timeline, setTimeline] = useState<ActivityLog[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Views
  const [activeView, setActiveView] = useState<"kanban" | "list" | "deadlines" | "approvals" | "timeline">("kanban");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Create/Edit Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskForm, setTaskForm] = useState({
    text: "",
    description: "",
    priority: "medium",
    status: "pending" as TaskStatus,
    deadline: "",
    assignedTo: "",
    entityType: "" as "" | "release" | "campaign" | "project" | "studio" | "content",
    entityId: "",
    entityTitle: "",
    actionTab: "" as ActiveTab | "",
    actionLabel: "",
    tags: "",
  });

  // Approval Modal State
  const [activeApproval, setActiveApproval] = useState<{
    id: string;
    type: "studio_quote" | "studio_deliverable" | "campaign_sprint";
    title: string;
    description: string;
  } | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");

  const loadWorkflowData = async () => {
    if (!workspaceId) return;
    try {
      setIsLoading(true);
      const [sumRes, tasksRes, deadRes, timeRes, relRes, campRes, projRes] = await Promise.all([
        api.workflow.getSummary(workspaceId).catch(() => ({ summary: null })),
        api.workflow.getTasks(workspaceId).catch(() => ({ tasks: [] })),
        api.workflow.getDeadlines(workspaceId).catch(() => ({ reminders: [] })),
        api.workflow.getTimeline(workspaceId, undefined, 40).catch(() => ({ activities: [] })),
        api.releases.list(workspaceId).catch(() => ({ releases: [] })),
        api.campaigns.list(workspaceId).catch(() => ({ campaigns: [] })),
        api.projects.list(workspaceId).catch(() => ({ projects: [] })),
      ]);

      if (sumRes.summary) setSummary(sumRes.summary);
      if (tasksRes.tasks) setTasks(tasksRes.tasks);
      if (deadRes.reminders) setDeadlines(deadRes.reminders);
      if (timeRes.activities) setTimeline(timeRes.activities);
      if (relRes.releases) setReleases(relRes.releases);
      if (campRes.campaigns) setCampaigns(campRes.campaigns);
      if (projRes.projects) setProjects(projRes.projects);
    } catch (err) {
      console.error("Failed to load workflow data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflowData();
  }, [workspaceId]);

  // Handle task status transition
  const handleTransition = async (taskId: string, newStatus: TaskStatus) => {
    if (!workspaceId) return;
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: newStatus,
                completed: newStatus === "completed",
                completedAt: newStatus === "completed" ? new Date().toISOString() : undefined,
              }
            : t
        )
      );

      const res = await api.workflow.transitionTask(workspaceId, taskId, newStatus);
      if (res.task) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? res.task : t)));
      }
      // Reload summary
      const sumRes = await api.workflow.getSummary(workspaceId);
      if (sumRes.summary) setSummary(sumRes.summary);
    } catch (err) {
      console.error("Failed to transition task", err);
      loadWorkflowData();
    }
  };

  // Handle Task Save
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !taskForm.text.trim()) return;

    try {
      const tagList = taskForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        text: taskForm.text.trim(),
        description: taskForm.description.trim(),
        priority: taskForm.priority,
        status: taskForm.status,
        deadline: taskForm.deadline || undefined,
        assignedTo: taskForm.assignedTo.trim() || undefined,
        entityType: taskForm.entityType || undefined,
        entityId: taskForm.entityId || undefined,
        entityTitle: taskForm.entityTitle || undefined,
        actionTab: taskForm.actionTab || undefined,
        actionLabel: taskForm.actionLabel || undefined,
        tags: tagList,
      };

      if (editingTask) {
        const res = await api.workflow.updateTask(workspaceId, editingTask.id, payload);
        if (res.task) {
          setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? res.task : t)));
        }
      } else {
        const res = await api.workflow.createTask(workspaceId, payload);
        if (res.task) {
          setTasks((prev) => [res.task, ...prev]);
        }
      }

      setIsTaskModalOpen(false);
      setEditingTask(null);
      resetTaskForm();
      const sumRes = await api.workflow.getSummary(workspaceId);
      if (sumRes.summary) setSummary(sumRes.summary);
    } catch (err) {
      console.error("Failed to save task", err);
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      text: "",
      description: "",
      priority: "medium",
      status: "pending",
      deadline: "",
      assignedTo: "",
      entityType: "",
      entityId: "",
      entityTitle: "",
      actionTab: "",
      actionLabel: "",
      tags: "",
    });
  };

  const openCreateModal = () => {
    setEditingTask(null);
    resetTaskForm();
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setTaskForm({
      text: task.text,
      description: task.description || "",
      priority: task.priority || "medium",
      status: task.status || (task.completed ? "completed" : "pending"),
      deadline: task.deadline || "",
      assignedTo: task.assignedTo || "",
      entityType: (task.entityType as any) || "",
      entityId: task.entityId || "",
      entityTitle: task.entityTitle || "",
      actionTab: task.actionTab || "",
      actionLabel: task.actionLabel || "",
      tags: (task.tags || []).join(", "),
    });
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!workspaceId) return;
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.workflow.deleteTask(workspaceId, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  // Handle Approval Action
  const handleApprovalAction = async (action: "approve" | "reject" | "request_revision") => {
    if (!workspaceId || !activeApproval) return;
    try {
      await api.workflow.actionApproval(
        workspaceId,
        activeApproval.id,
        activeApproval.type,
        action,
        approvalNotes
      );
      setActiveApproval(null);
      setApprovalNotes("");
      loadWorkflowData();
    } catch (err) {
      console.error("Failed to process approval", err);
    }
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const taskState = t.status || (t.completed ? "completed" : "pending");
      if (statusFilter !== "all" && taskState !== statusFilter) return false;
      if (priorityFilter !== "all" && (t.priority || "medium") !== priorityFilter) return false;
      if (entityFilter !== "all" && t.entityType !== entityFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.text.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.entityTitle?.toLowerCase().includes(q) ||
          t.assignedTo?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, entityFilter, searchQuery]);

  // Group tasks by status for Kanban
  const kanbanColumns: { id: TaskStatus; label: string; color: string; bg: string }[] = [
    { id: "pending", label: "Pending", color: "text-zinc-400", bg: "bg-zinc-900/60 border-zinc-800" },
    { id: "in_progress", label: "In Progress", color: "text-blue-400", bg: "bg-blue-950/20 border-blue-900/40" },
    { id: "review", label: "Review", color: "text-amber-400", bg: "bg-amber-950/20 border-amber-900/40" },
    { id: "approved", label: "Approved", color: "text-purple-400", bg: "bg-purple-950/20 border-purple-900/40" },
    { id: "completed", label: "Completed", color: "text-emerald-400", bg: "bg-emerald-950/20 border-emerald-900/40" },
  ];

  const getPriorityBadge = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "critical":
      case "urgent":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            URGENT
          </span>
        );
      case "high":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            HIGH
          </span>
        );
      case "low":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
            LOW
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            MED
          </span>
        );
    }
  };

  const getEntityIcon = (entityType?: string) => {
    switch (entityType) {
      case "release":
        return <Disc3 className="w-3.5 h-3.5 text-emerald-400" />;
      case "campaign":
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case "studio":
        return <Palette className="w-3.5 h-3.5 text-blue-400" />;
      case "content":
        return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      case "project":
        return <Briefcase className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <CheckSquare className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div id="workflow-hub-container" className="space-y-6 animate-fade-in pb-12">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                PHASE 14 ENGINE
              </span>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs text-zinc-400">Workspace Operational Lifecycle</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Workflow &amp; Notification Engine
            </h1>
            <p className="text-sm text-[var(--bento-muted)] mt-1 max-w-2xl">
              Cross-ecosystem operational orchestration connecting Releases, Campaigns, Studio production,
              and Radar signals into a unified execution board.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="workflow-refresh-btn"
              onClick={loadWorkflowData}
              disabled={isLoading}
              className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Refresh Engine State"
            >
              <RotateCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              id="workflow-new-task-btn"
              onClick={openCreateModal}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all shadow-lg shadow-red-950/40 hover:scale-105 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Executive Metrics Pulse */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-[var(--bento-border)]">
            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="text-[11px] text-zinc-500 font-mono uppercase">Total Tasks</div>
              <div className="text-xl font-extrabold text-white mt-0.5">{summary.totalTasks}</div>
              <div className="text-[10px] text-zinc-400 mt-1">Across all entities</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-900/30">
              <div className="text-[11px] text-blue-400 font-mono uppercase">In Progress</div>
              <div className="text-xl font-extrabold text-blue-300 mt-0.5">{summary.inProgressTasks}</div>
              <div className="text-[10px] text-blue-400/80 mt-1">Active execution</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-900/30">
              <div className="text-[11px] text-amber-400 font-mono uppercase">Awaiting Review</div>
              <div className="text-xl font-extrabold text-amber-300 mt-0.5">{summary.reviewTasks}</div>
              <div className="text-[10px] text-amber-400/80 mt-1">Signoff required</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-900/30">
              <div className="text-[11px] text-emerald-400 font-mono uppercase">Completed</div>
              <div className="text-xl font-extrabold text-emerald-300 mt-0.5">{summary.completedTasks}</div>
              <div className="text-[10px] text-emerald-400/80 mt-1">Resolved items</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-950/20 border border-red-900/30">
              <div className="text-[11px] text-red-400 font-mono uppercase">Overdue Deadlines</div>
              <div className="text-xl font-extrabold text-red-300 mt-0.5">{summary.overdueTasks}</div>
              <div className="text-[10px] text-red-400/80 mt-1">Needs attention</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-900/30">
              <div className="text-[11px] text-purple-400 font-mono uppercase">Pending Approvals</div>
              <div className="text-xl font-extrabold text-purple-300 mt-0.5">{summary.pendingApprovals}</div>
              <div className="text-[10px] text-purple-400/80 mt-1">Studio &amp; Campaigns</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation View Switcher & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] flex flex-wrap items-center justify-between gap-4">
        {/* View Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "kanban", label: "Workflow Kanban", icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
            { id: "list", label: "Unified List", icon: <CheckSquare className="w-3.5 h-3.5" /> },
            { id: "deadlines", label: `Deadlines (${deadlines.length})`, icon: <Calendar className="w-3.5 h-3.5" /> },
            { id: "approvals", label: `Approvals (${summary?.pendingApprovals || 0})`, icon: <ShieldCheck className="w-3.5 h-3.5" /> },
            { id: "timeline", label: "Activity Timeline", icon: <Activity className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeView === tab.id
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md ml-auto">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, assignees, entities..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Urgent / Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">All Entities</option>
            <option value="release">Releases</option>
            <option value="campaign">Campaigns</option>
            <option value="studio">Studio</option>
            <option value="content">Content</option>
            <option value="project">Projects</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD */}
      {activeView === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter(
              (t) => (t.status || (t.completed ? "completed" : "pending")) === col.id
            );

            return (
              <div
                key={col.id}
                id={`kanban-col-${col.id}`}
                className={`p-4 rounded-3xl border flex flex-col min-h-[500px] ${col.bg}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                      {col.label}
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300 font-bold">
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setEditingTask(null);
                      resetTaskForm();
                      setTaskForm((prev) => ({ ...prev, status: col.id }));
                      setIsTaskModalOpen(true);
                    }}
                    className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                    title={`Add task in ${col.label}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin">
                  {colTasks.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-zinc-800/60 rounded-2xl flex items-center justify-center text-zinc-600 text-xs">
                      No tasks
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        id={`task-card-${task.id}`}
                        className="group p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/90 hover:border-zinc-700 hover:shadow-lg transition-all"
                      >
                        {/* Badges */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {getPriorityBadge(task.priority)}
                            {task.entityType && (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                                {getEntityIcon(task.entityType)}
                                <span className="uppercase">{task.entityType}</span>
                              </span>
                            )}
                          </div>

                          {/* Quick menu */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-1 text-zinc-400 hover:text-white"
                              title="Edit task"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 text-zinc-400 hover:text-red-400"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Text */}
                        <h4 className="text-xs font-bold text-white group-hover:text-red-300 transition-colors leading-snug">
                          {task.text}
                        </h4>

                        {task.description && (
                          <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Entity Link */}
                        {task.entityTitle && (
                          <div
                            onClick={() => {
                              if (task.actionTab) onNavigateTab(task.actionTab, task.entityId);
                            }}
                            className="mt-2.5 px-2.5 py-1 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-[10px] text-zinc-300 flex items-center justify-between hover:bg-zinc-800 cursor-pointer transition-colors"
                          >
                            <span className="truncate font-medium">{task.entityTitle}</span>
                            <ExternalLink className="w-3 h-3 text-zinc-500 shrink-0 ml-1" />
                          </div>
                        )}

                        {/* Footer: Assignee & Deadline */}
                        <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-500">
                          <div className="flex items-center gap-1 truncate">
                            <User className="w-3 h-3 text-zinc-500" />
                            <span className="truncate">{task.assignedTo || "Unassigned"}</span>
                          </div>

                          {task.deadline && (
                            <div className="flex items-center gap-1 text-zinc-400 shrink-0">
                              <Clock className="w-3 h-3" />
                              <span>{task.deadline}</span>
                            </div>
                          )}
                        </div>

                        {/* State Transition Controls */}
                        <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-1">
                          <select
                            value={col.id}
                            onChange={(e) => handleTransition(task.id, e.target.value as TaskStatus)}
                            className="w-full px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-300 focus:outline-none focus:border-red-500 cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="approved">Approved</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: UNIFIED LIST */}
      {activeView === "list" && (
        <div className="p-4 rounded-3xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-xl overflow-hidden">
          <div className="divide-y divide-zinc-800/80">
            {filteredTasks.length === 0 ? (
              <div className="py-16 text-center text-zinc-500">
                <CheckSquare className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
                <p className="text-sm font-bold text-zinc-300">No tasks found matching criteria</p>
                <p className="text-xs text-zinc-500 mt-1">Create a new unified task to get started.</p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isDone = task.status === "completed" || task.completed;
                return (
                  <div
                    key={task.id}
                    className="py-3.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-900/40 rounded-2xl transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() =>
                          handleTransition(task.id, isDone ? "pending" : "completed")
                        }
                        className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          isDone
                            ? "bg-emerald-600 border-emerald-500 text-white"
                            : "border-zinc-700 hover:border-red-500 bg-zinc-900"
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-bold ${
                              isDone ? "line-through text-zinc-500" : "text-white"
                            }`}
                          >
                            {task.text}
                          </span>
                          {getPriorityBadge(task.priority)}
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-900 text-zinc-400 border border-zinc-800">
                            {task.status || (isDone ? "completed" : "pending")}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{task.description}</p>
                        )}

                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-500 flex-wrap">
                          {task.entityTitle && (
                            <span className="flex items-center gap-1 text-zinc-400 font-medium">
                              {getEntityIcon(task.entityType)}
                              <span>{task.entityTitle}</span>
                            </span>
                          )}
                          {task.assignedTo && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{task.assignedTo}</span>
                            </span>
                          )}
                          {task.deadline && (
                            <span className="flex items-center gap-1 text-zinc-400">
                              <Clock className="w-3 h-3" />
                              <span>Due {task.deadline}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {task.actionTab && (
                        <button
                          onClick={() => onNavigateTab(task.actionTab!, task.entityId)}
                          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>{task.actionLabel || "Open Workstation"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={() => openEditModal(task)}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Edit Task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: DEADLINE PULSE REMINDERS */}
      {activeView === "deadlines" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold text-white">Aggregated Timeline &amp; Milestone Reminders</span>
            </div>
            <span className="text-xs text-zinc-500">
              Auto-calculated from Releases, Campaigns, Milestones, and Unified Tasks.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deadlines.length === 0 ? (
              <div className="col-span-full py-16 text-center text-zinc-500">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                <p className="text-sm font-bold text-zinc-300">No approaching deadlines!</p>
                <p className="text-xs text-zinc-500 mt-1">All workspace deliverables are currently on schedule.</p>
              </div>
            ) : (
              deadlines.map((item) => (
                <div
                  key={item.id}
                  id={`deadline-card-${item.id}`}
                  className={`p-5 rounded-3xl border transition-all ${
                    item.status === "overdue"
                      ? "bg-red-950/20 border-red-500/40 shadow-lg shadow-red-950/30"
                      : item.status === "due_today"
                      ? "bg-amber-950/20 border-amber-500/40"
                      : "bg-zinc-950/60 border-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-zinc-900 border border-zinc-800 text-zinc-300">
                      {getEntityIcon(item.entityType)}
                      <span>{item.entityType}</span>
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        item.status === "overdue"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : item.status === "due_today"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {item.status === "overdue"
                        ? `${Math.abs(item.daysRemaining)} Days Overdue`
                        : item.status === "due_today"
                        ? "Due Today"
                        : `${item.daysRemaining} Days Left`}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-white mb-1">{item.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Target Date: {item.dueDate}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (item.actionTab) onNavigateTab(item.actionTab, item.entityId);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-red-500/40 text-xs font-bold text-red-400 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>{item.actionLabel || "Inspect Workstation"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: PENDING APPROVALS */}
      {activeView === "approvals" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white">Pending Governance &amp; Creative Sign-offs</span>
            </div>
            <span className="text-xs text-purple-300">
              One-click authorization for Studio production quotes, deliverables, and campaign sprints.
            </span>
          </div>

          {/* If there are quotes or deliverables, render approval cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Demo Approval Item for Studio if any quote exists */}
            <div className="p-5 rounded-3xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  STUDIO QUOTE
                </span>
                <span className="text-xs text-zinc-500">Awaiting Sign-off</span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Cover Art &amp; 3D Master Artwork Production
              </h3>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Studio Lead assigned. Scope includes 3000x3000px master artwork, animated canvas video,
                and social banners. Price: $280 USD (3 business days).
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setActiveApproval({
                      id: "quote_demo",
                      type: "studio_quote",
                      title: "Cover Art Production Quote",
                      description: "Approve quote to start production and lock timeline.",
                    })
                  }
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Authorize Quote</span>
                </button>
                <button
                  onClick={() =>
                    onNavigateTab("studio")
                  }
                  className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Inspect Brief
                </button>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  CAMPAIGN SPRINT
                </span>
                <span className="text-xs text-zinc-500">Ready for Launch</span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Pre-Release Sonic Velocity &amp; Creator Sound Wave
              </h3>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                7 scheduled posts, TikTok audio snippet push, and email broadcast. Target budget: $450 USD.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setActiveApproval({
                      id: "campaign_demo",
                      type: "campaign_sprint",
                      title: "Pre-Release Sonic Velocity Sprint",
                      description: "Approve sprint schedule and activate content distribution engine.",
                    })
                  }
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Sprint</span>
                </button>
                <button
                  onClick={() => onNavigateTab("brand-os")}
                  className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Inspect Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: ACTIVITY TIMELINE */}
      {activeView === "timeline" && (
        <div className="p-6 rounded-3xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-white">Live Workspace Activity Timeline</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real-time chronological log of workspace mutations, task completions, and studio milestones.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-zinc-900 text-zinc-400 border border-zinc-800">
              {timeline.length} Events Logged
            </span>
          </div>

          <div className="relative border-l-2 border-zinc-800 ml-4 space-y-6">
            {timeline.length === 0 ? (
              <div className="py-8 text-center text-zinc-500">
                <p className="text-xs">No recent activity logged in this workspace.</p>
              </div>
            ) : (
              timeline.map((act) => (
                <div key={act.id} className="relative pl-6">
                  {/* Dot */}
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-zinc-950 border-2 border-red-500 flex items-center justify-center shadow-xs" />

                  <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{act.details || act.action}</span>
                        <span className="px-2 py-0.2 rounded text-[9px] font-mono uppercase bg-zinc-900 text-zinc-400 border border-zinc-800">
                          {act.entityType || "SYSTEM"}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400">
                      <User className="w-3 h-3 text-zinc-500" />
                      <span>{act.userEmail || "Keedohub Creator"}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL */}
      {isTaskModalOpen && (
        <div
          id="workflow-task-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsTaskModalOpen(false)}
        >
          <div
            id="workflow-task-modal"
            className="w-full max-w-xl rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">
                  {editingTask ? "Edit Unified Task" : "Create New Unified Task"}
                </h3>
              </div>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-2 rounded-xl hover:bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.text}
                  onChange={(e) => setTaskForm({ ...taskForm, text: e.target.value })}
                  placeholder="e.g., Deliver Master Master Artwork for Lead Single"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Description / Specification
                </label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Details, deliverable requirements, or technical links..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent / Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as TaskStatus })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Assignee
                  </label>
                  <input
                    type="text"
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    placeholder="e.g., Creative Director, Producer"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Link to Workspace Entity
                  </label>
                  <select
                    value={taskForm.entityType}
                    onChange={(e) => {
                      const et = e.target.value as any;
                      setTaskForm({
                        ...taskForm,
                        entityType: et,
                        actionTab:
                          et === "release"
                            ? "artist-os"
                            : et === "campaign"
                            ? "brand-os"
                            : et === "studio"
                            ? "studio"
                            : et === "content"
                            ? "content-engine"
                            : et === "project"
                            ? "project-console"
                            : "",
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="">None (General Task)</option>
                    <option value="release">Release (Artist OS)</option>
                    <option value="campaign">Campaign (Brand OS)</option>
                    <option value="studio">Studio Production</option>
                    <option value="content">Content Item</option>
                    <option value="project">Project Console</option>
                  </select>
                </div>
              </div>

              {taskForm.entityType && (
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Entity Item Name / Title
                  </label>
                  <input
                    type="text"
                    value={taskForm.entityTitle}
                    onChange={(e) => setTaskForm({ ...taskForm, entityTitle: e.target.value })}
                    placeholder="e.g., Afro-Fusion Single Drop, Summer Launch Campaign"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={taskForm.tags}
                  onChange={(e) => setTaskForm({ ...taskForm, tags: e.target.value })}
                  placeholder="e.g., artwork, marketing, lufs, epk"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-colors cursor-pointer shadow-md shadow-red-950/40"
                >
                  {editingTask ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVAL DIALOG */}
      {activeApproval && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveApproval(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">{activeApproval.title}</h3>
                <p className="text-xs text-zinc-400">{activeApproval.description}</p>
              </div>
            </div>

            <div className="my-4">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Approval Feedback / Sign-off Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Approved for release production, or specify revision requirements..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => handleApprovalAction("request_revision")}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                Request Revision
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveApproval(null)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApprovalAction("approve")}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md transition-colors cursor-pointer"
                >
                  Sign &amp; Authorize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
