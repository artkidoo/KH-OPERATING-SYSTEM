import React, { useState, useEffect } from "react";
import {
  LifeBuoy,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  MessageSquare,
  Shield,
  X,
  FileCode,
  User,
  Building2,
  Tag,
  Check,
} from "lucide-react";
import { api } from "../../services/api";
import { SupportTicket, SystemAdminRole } from "../../types";

interface SupportViewTabProps {
  currentUserRole: SystemAdminRole;
}

export const SupportViewTab: React.FC<SupportViewTabProps> = ({
  currentUserRole,
}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Selected Ticket State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [updatingTicket, setUpdatingTicket] = useState(false);

  // New Ticket Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newCategory, setNewCategory] = useState("sync_error");
  const [newPriority, setNewPriority] = useState("medium");
  const [creatingTicket, setCreatingTicket] = useState(false);

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getSupportTickets({
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
      });
      if (res.tickets) {
        setTickets(res.tickets);
        if (selectedTicket) {
          const updated = res.tickets.find((t) => t.id === selectedTicket.id);
          if (updated) {
            setSelectedTicket(updated);
          }
        }
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to load support tickets" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter]);

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setResolutionNotes(ticket.resolutionNotes || "");
  };

  const handleUpdateStatus = async (newStatus: "open" | "in_progress" | "resolved") => {
    if (!selectedTicket) return;
    setUpdatingTicket(true);
    try {
      const res = await api.admin.updateSupportTicket(selectedTicket.id, {
        status: newStatus,
        resolutionNotes,
      });
      if (res.ticket) {
        setSelectedTicket(res.ticket);
        setNotification({ type: "success", message: `Ticket status set to ${newStatus}` });
        fetchTickets();
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to update ticket" });
    } finally {
      setUpdatingTicket(false);
    }
  };

  const handleAssignToMe = async () => {
    if (!selectedTicket) return;
    setUpdatingTicket(true);
    try {
      const res = await api.admin.updateSupportTicket(selectedTicket.id, {
        assignedAdminName: `Admin (${currentUserRole})`,
      });
      if (res.ticket) {
        setSelectedTicket(res.ticket);
        fetchTickets();
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to assign ticket" });
    } finally {
      setUpdatingTicket(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    setCreatingTicket(true);
    try {
      const res = await api.admin.createSupportTicket({
        category: newCategory,
        priority: newPriority,
        subject: newSubject,
        message: newMessage,
        diagnosticData: {
          browser: navigator.userAgent,
          platform: "Keedohub Web Applet",
          screen: `${window.innerWidth}x${window.innerHeight}`,
        },
      });
      if (res.ticket) {
        setNotification({ type: "success", message: `Ticket ${res.ticket.ticketNumber} created` });
        setCreateModalOpen(false);
        setNewSubject("");
        setNewMessage("");
        fetchTickets();
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to create ticket" });
    } finally {
      setCreatingTicket(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "critical":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">CRITICAL</span>;
      case "high":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">HIGH</span>;
      case "medium":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">LOW</span>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "resolved":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">RESOLVED</span>;
      case "in_progress":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">IN PROGRESS</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">OPEN</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:opacity-70">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-rose-500" />
            Support View & Tenant Issue Resolution
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Inspect operational errors, diagnose asset and approval pipeline anomalies without exposing private tenant secrets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Create Test Ticket
          </button>
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="p-2 rounded-xl border border-border/60 bg-card hover:bg-accent text-foreground disabled:opacity-50"
            title="Refresh tickets"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-rose-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-border/60 bg-card text-xs text-foreground focus:outline-none focus:border-rose-500"
        >
          <option value="all">All Ticket Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-border/60 bg-card text-xs text-foreground focus:outline-none focus:border-rose-500"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-border/60 bg-card text-xs text-foreground focus:outline-none focus:border-rose-500"
        >
          <option value="all">All Categories</option>
          <option value="sync_error">Sync Error</option>
          <option value="asset_upload">Asset Upload</option>
          <option value="approval_flow">Approval Flow</option>
          <option value="ai_generation">AI Generation</option>
          <option value="account_access">Account Access</option>
        </select>
      </div>

      {/* 2-Column Split: Ticket Queue + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tickets List (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-border/60 bg-card/60 overflow-hidden">
          <div className="p-3 border-b border-border/60 bg-muted/20 text-xs font-semibold text-muted-foreground flex items-center justify-between">
            <span>Support Tickets ({tickets.length})</span>
          </div>

          <div className="divide-y divide-border/40 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="py-16 text-center text-muted-foreground">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-rose-500 mb-2" />
                Loading support queue...
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                No tickets in this queue view.
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleSelectTicket(t)}
                  className={`p-3.5 cursor-pointer transition-colors text-xs space-y-1.5 ${
                    selectedTicket?.id === t.id
                      ? "bg-rose-500/10 border-l-4 border-l-rose-500"
                      : "hover:bg-accent/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-muted-foreground">
                      {t.ticketNumber}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {getPriorityBadge(t.priority)}
                      {getStatusBadge(t.status)}
                    </div>
                  </div>

                  <div className="font-semibold text-foreground truncate">{t.subject}</div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{t.workspaceName}</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Ticket Inspector & Diagnostic Details (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-border/60 bg-card/60 p-5 space-y-5">
          {selectedTicket ? (
            <div className="space-y-5 animate-fadeIn">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      {selectedTicket.ticketNumber}
                    </span>
                    {getPriorityBadge(selectedTicket.priority)}
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                  <h3 className="text-base font-bold text-foreground">{selectedTicket.subject}</h3>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Tenant: <strong>{selectedTicket.workspaceName}</strong> • Submitted by:{" "}
                    <strong>{selectedTicket.userName}</strong> ({selectedTicket.userEmail})
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {!selectedTicket.assignedAdminName && (
                    <button
                      onClick={handleAssignToMe}
                      disabled={updatingTicket}
                      className="px-2.5 py-1 rounded-md border border-purple-500/40 bg-purple-500/10 text-purple-400 text-xs font-semibold hover:bg-purple-500/20"
                    >
                      Assign to Me
                    </button>
                  )}
                </div>
              </div>

              {/* Message Body */}
              <div className="p-3.5 rounded-xl border border-border/40 bg-accent/10 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  User Issue Report
                </span>
                <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.message}
                </p>
              </div>

              {/* Non-Private Diagnostic Metadata */}
              {selectedTicket.diagnosticData && (
                <div className="p-3.5 rounded-xl border border-border/40 bg-card/80 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-blue-400" /> Operational Diagnostics (Sanitized)
                  </span>
                  <pre className="text-[11px] text-muted-foreground font-mono bg-black/30 p-2.5 rounded-lg overflow-x-auto">
                    {JSON.stringify(selectedTicket.diagnosticData, null, 2)}
                  </pre>
                </div>
              )}

              {/* Resolution Notes Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Support Resolution Notes & Actions
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-border/60 bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-rose-500"
                  placeholder="Record diagnosis, code fix details, or tenant communication summary..."
                />
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-muted-foreground font-mono">
                  Assigned: {selectedTicket.assignedAdminName || "Unassigned"}
                </div>

                <div className="flex items-center gap-2">
                  {selectedTicket.status !== "in_progress" && (
                    <button
                      onClick={() => handleUpdateStatus("in_progress")}
                      disabled={updatingTicket}
                      className="px-3.5 py-1.5 rounded-xl border border-purple-500/40 bg-purple-500/10 text-purple-400 text-xs font-semibold hover:bg-purple-500/20"
                    >
                      Mark In Progress
                    </button>
                  )}

                  {selectedTicket.status !== "resolved" ? (
                    <button
                      onClick={() => handleUpdateStatus("resolved")}
                      disabled={updatingTicket}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolve Ticket
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus("open")}
                      disabled={updatingTicket}
                      className="px-3.5 py-1.5 rounded-xl border border-border/60 hover:bg-accent text-xs font-semibold"
                    >
                      Reopen Ticket
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-muted-foreground space-y-2">
              <LifeBuoy className="w-8 h-8 mx-auto text-muted-foreground/40" />
              <div className="text-xs">Select a ticket from the queue to inspect details and resolve.</div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE TICKET MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTicket}
            className="w-full max-w-lg bg-card border border-border/80 rounded-2xl p-6 space-y-4 shadow-2xl animate-scaleUp text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-500" />
                Submit Platform Support Ticket
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-lg border border-border/60 hover:bg-accent text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border/60 bg-card text-foreground"
                >
                  <option value="sync_error">Sync Error</option>
                  <option value="asset_upload">Asset Upload</option>
                  <option value="approval_flow">Approval Flow</option>
                  <option value="ai_generation">AI Generation</option>
                  <option value="account_access">Account Access</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border/60 bg-card text-foreground"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g. Asset transcoding timeout on 4K video reel"
                className="w-full p-2 rounded-lg border border-border/60 bg-card text-foreground"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Description / Error Log
              </label>
              <textarea
                required
                rows={4}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Describe what occurred, any error messages, or affected studio deliverables..."
                className="w-full p-2.5 rounded-lg border border-border/60 bg-card text-foreground"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                disabled={creatingTicket}
                className="px-3.5 py-1.5 rounded-xl border border-border/60 hover:bg-accent font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingTicket}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5"
              >
                {creatingTicket ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Submit Ticket"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
