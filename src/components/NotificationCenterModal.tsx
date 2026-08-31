import React, { useState, useEffect, useMemo } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink,
  CheckCheck,
  Trash2,
  Filter,
  X,
  Radio,
  Disc3,
  Flame,
  Palette,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { NotificationItem, ActiveTab } from "../types";
import { api } from "../services/api";

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: string;
  onNavigateTab: (tab: ActiveTab, entityId?: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  onNavigateTab,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showResolved, setShowResolved] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadNotifications = async () => {
    if (!workspaceId) return;
    try {
      setIsLoading(true);
      const res = await api.workflow.getNotifications(workspaceId);
      if (res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && workspaceId) {
      loadNotifications();
    }
  }, [isOpen, workspaceId]);

  const handleMarkRead = async (notifId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!workspaceId) return;
    try {
      await api.workflow.markNotificationRead(workspaceId, notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  const handleResolve = async (notifId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!workspaceId) return;
    try {
      await api.workflow.markNotificationResolved(workspaceId, notifId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notifId
            ? { ...n, resolved: true, read: true, resolvedAt: new Date().toISOString() }
            : n
        )
      );
    } catch (err) {
      console.error("Failed to resolve notification", err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!workspaceId) return;
    try {
      await api.workflow.markAllNotificationsRead(workspaceId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  };

  const handleDismissAll = async () => {
    if (!workspaceId) return;
    try {
      await api.workflow.dismissAllNotifications(workspaceId);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, resolved: true, read: true, resolvedAt: new Date().toISOString() }))
      );
    } catch (err) {
      console.error("Failed to dismiss all", err);
    }
  };

  const handleActionClick = (notif: NotificationItem) => {
    // Mark read
    handleMarkRead(notif.id);
    onClose();

    if (notif.actionTab) {
      onNavigateTab(notif.actionTab, notif.entityId);
    } else {
      // Intelligent fallback routing based on category
      switch (notif.category) {
        case "radar":
          onNavigateTab("creative-radar", notif.entityId);
          break;
        case "approval":
        case "studio":
          onNavigateTab("studio", notif.entityId);
          break;
        case "release":
          onNavigateTab("artist-os", notif.entityId);
          break;
        case "campaign":
          onNavigateTab("brand-os", notif.entityId);
          break;
        case "task":
        case "workflow":
          onNavigateTab("workflow", notif.entityId);
          break;
        default:
          onNavigateTab("command-center");
      }
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Resolved filter
      if (!showResolved && n.resolved) return false;
      if (showResolved && !n.resolved) return false;

      // Category filter
      if (filterCategory !== "all") {
        if (filterCategory === "radar" && n.category !== "radar") return false;
        if (filterCategory === "approval" && n.category !== "approval") return false;
        if (filterCategory === "studio" && n.category !== "studio") return false;
        if (filterCategory === "release" && n.category !== "release") return false;
        if (filterCategory === "campaign" && n.category !== "campaign") return false;
        if (filterCategory === "task" && n.category !== "task") return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          n.entityTitle?.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [notifications, filterCategory, showResolved, searchQuery]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read && !n.resolved).length,
    [notifications]
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "radar":
        return <Radio className="w-4 h-4 text-red-400" />;
      case "approval":
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      case "studio":
        return <Palette className="w-4 h-4 text-blue-400" />;
      case "release":
        return <Disc3 className="w-4 h-4 text-emerald-400" />;
      case "campaign":
        return <Flame className="w-4 h-4 text-amber-400" />;
      case "task":
        return <CheckCircle2 className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case "critical":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            CRITICAL
          </span>
        );
      case "warning":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            ACTION NEEDED
          </span>
        );
      case "success":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            COMPLETED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            INFO
          </span>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="notification-center-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="notification-center-modal"
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-2xl shadow-black/80 overflow-hidden text-[var(--bento-text)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--bento-border)] flex items-center justify-between bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Notifications & Operational Radar
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-red-600 text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--bento-muted)] mt-0.5">
                Proactive intelligence, deadline reminders, task reviews, and Studio approvals.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="notif-refresh-btn"
              onClick={loadNotifications}
              disabled={isLoading}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh Stream"
            >
              <RotateCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              id="notif-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter & Action Toolbar */}
        <div className="px-5 py-3 border-b border-[var(--bento-border)] bg-zinc-950/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            {[
              { id: "all", label: "All Events" },
              { id: "radar", label: "Radar" },
              { id: "approval", label: "Approvals" },
              { id: "studio", label: "Studio" },
              { id: "release", label: "Releases" },
              { id: "campaign", label: "Campaigns" },
              { id: "task", label: "Tasks" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
                  filterCategory === tab.id
                    ? "bg-red-600 text-white font-bold shadow-sm"
                    : "bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResolved(!showResolved)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                showResolved
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              {showResolved ? "Showing Resolved" : "Active Only"}
            </button>

            {!showResolved && (
              <>
                <button
                  id="notif-mark-all-read-btn"
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="Mark all active notifications as read"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Mark All Read</span>
                </button>
                <button
                  id="notif-dismiss-all-btn"
                  onClick={handleDismissAll}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                  title="Dismiss all active notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dismiss All</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 scrollbar-thin">
          {isLoading ? (
            <div className="py-16 text-center text-zinc-500">
              <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-xs">Synchronizing workspace signals...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 text-center text-zinc-500">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-600">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-sm font-bold text-zinc-300">
                {showResolved ? "No resolved notifications" : "All Caught Up!"}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                {showResolved
                  ? "Completed and auto-resolved notifications will appear here for archival reference."
                  : "Zero unread alerts or critical blockers across your Releases, Campaigns, Tasks, and Studio requests."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                id={`notif-card-${item.id}`}
                onClick={() => handleActionClick(item)}
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
                  !item.read
                    ? "bg-zinc-900/90 hover:bg-zinc-850 border-red-500/30 hover:border-red-500/50 shadow-md shadow-black/40"
                    : "bg-zinc-950/60 hover:bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                {/* Unread indicator dot */}
                {!item.read && (
                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}

                <div className="flex items-start gap-3.5">
                  {/* Category icon avatar */}
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                        {item.title}
                      </span>
                      {getSeverityBadge(item.severity)}
                      {item.resolved && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-400">
                          RESOLVED
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                      {item.message}
                    </p>

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-3 mt-2.5 pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                      </div>

                      {item.entityTitle && (
                        <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px] font-mono truncate max-w-[200px]">
                          {item.entityType?.toUpperCase()}: {item.entityTitle}
                        </span>
                      )}

                      {/* One-Click Action Pill */}
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolve(item.id);
                          }}
                          className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-medium text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                          title="Resolve notification"
                        >
                          Resolve
                        </button>

                        <span className="flex items-center gap-1 font-bold text-red-400 group-hover:translate-x-0.5 transition-transform text-[11px]">
                          {item.actionLabel || "Inspect Item"}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[var(--bento-border)] bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-500 shrink-0">
          <span>
            Connected to <strong>Radar</strong>, <strong>Studio</strong>, <strong>Artist OS</strong> &amp; <strong>Workflow Engine</strong>
          </span>
          <button
            onClick={() => {
              onClose();
              onNavigateTab("workflow");
            }}
            className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Open Unified Workflow Hub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
