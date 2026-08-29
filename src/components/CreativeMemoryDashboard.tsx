import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  CreativeMemoryItem,
  MemoryCandidate,
  MemoryBlockRule,
  CreativeMemoryCategory,
  CreativeMemoryScope,
  MemoryRetrievalResult,
  ActiveTab,
} from "../types";
import {
  BrainCircuit,
  Sparkles,
  Search,
  Filter,
  Plus,
  Pin,
  PinOff,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Archive,
  RefreshCw,
  Eye,
  Sliders,
  Tag,
  Folder,
  Disc3,
  Megaphone,
  Briefcase,
  Layers,
  ArrowRight,
  History,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ChevronDown,
  Check,
  X,
  FileText,
  Lock,
  Unlock,
  Radio,
  Clock,
  Zap,
} from "lucide-react";

interface CreativeMemoryDashboardProps {
  onNotify?: (text: string, type?: "success" | "info" | "error") => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export function CreativeMemoryDashboard({
  onNotify,
  onNavigateTab,
}: CreativeMemoryDashboardProps) {
  const { workspace, releases, campaigns, projects } = useWorkspace();
  const { user } = useAuth();

  // Primary navigation tabs inside Memory Dashboard
  const [activeSubTab, setActiveSubTab] = useState<
    "knowledge-base" | "ai-candidates" | "block-rules" | "retrieval-inspector" | "brand-tokens"
  >("knowledge-base");

  // Memory items state
  const [memoryItems, setMemoryItems] = useState<CreativeMemoryItem[]>([]);
  const [candidates, setCandidates] = useState<MemoryCandidate[]>([]);
  const [blockRules, setBlockRules] = useState<MemoryBlockRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedScope, setSelectedScope] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"active" | "archived" | "all">("active");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string>("all");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CreativeMemoryItem | null>(null);
  const [supersedingItem, setSupersedingItem] = useState<CreativeMemoryItem | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<MemoryCandidate | null>(null);
  const [isBlockRuleModalOpen, setIsBlockRuleModalOpen] = useState(false);

  // Form states for Create/Edit Memory
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "preference" as CreativeMemoryCategory,
    scope: "workspace" as CreativeMemoryScope,
    entityType: "" as string,
    entityId: "" as string,
    entityName: "" as string,
    tagsInput: "",
    confidence: 95,
    isPinned: false,
  });

  // Form states for Supersede Memory
  const [supersedeData, setSupersedeData] = useState({
    title: "",
    content: "",
    tagsInput: "",
    reason: "",
  });

  // Form state for Block Rule
  const [blockRuleData, setBlockRuleData] = useState({
    pattern: "",
    reason: "Internal privacy / sensitive project data",
    ruleType: "keyword",
    entityType: "",
  });

  // Form state for Candidate Editing
  const [candidateEditData, setCandidateEditData] = useState({
    title: "",
    content: "",
    category: "preference" as CreativeMemoryCategory,
    scope: "workspace" as CreativeMemoryScope,
    tagsInput: "",
  });

  // Retrieval Simulator State
  const [retrievalQuery, setRetrievalQuery] = useState("We are launching our next single with a high-energy diaspora sound.");
  const [retrievalCategory, setRetrievalCategory] = useState("");
  const [retrievalScope, setRetrievalScope] = useState("");
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [retrievalResult, setRetrievalResult] = useState<MemoryRetrievalResult | null>(null);

  // Load all memory data
  const loadData = useCallback(async () => {
    if (!workspace?.id) return;
    setIsLoading(true);
    try {
      const [itemsRes, candRes, rulesRes] = await Promise.all([
        api.creativeMemory.getItems(workspace.id),
        api.creativeMemory.getCandidates(workspace.id),
        api.creativeMemory.getBlockRules(workspace.id),
      ]);
      setMemoryItems(itemsRes.items || []);
      setCandidates(candRes.candidates || []);
      setBlockRules(rulesRes.rules || []);
    } catch (err: any) {
      console.error("Failed to load memory data", err);
      onNotify?.("Failed to fetch creative memory records", "error");
    } finally {
      setIsLoading(false);
    }
  }, [workspace?.id, onNotify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered items computation
  const filteredItems = useMemo(() => {
    return memoryItems.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesContent = item.content.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        const matchesEntity = item.entityName?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent && !matchesTags && !matchesEntity) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Scope filter
      if (selectedScope !== "all" && item.scope !== selectedScope) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      // Pinned only
      if (pinnedOnly && !item.isPinned) {
        return false;
      }

      // Entity ID filter
      if (selectedEntityId !== "all" && item.entityId !== selectedEntityId) {
        return false;
      }

      return true;
    });
  }, [memoryItems, searchQuery, selectedCategory, selectedScope, statusFilter, pinnedOnly, selectedEntityId]);

  // Stats computation
  const stats = useMemo(() => {
    const active = memoryItems.filter((i) => i.status === "active");
    const pinned = active.filter((i) => i.isPinned);
    const pendingCandidates = candidates.filter((c) => c.status === "pending");
    const avgConfidence = active.length > 0
      ? Math.round(active.reduce((acc, curr) => acc + (curr.confidence || 100), 0) / active.length)
      : 100;

    return {
      total: memoryItems.length,
      activeCount: active.length,
      pinnedCount: pinned.length,
      pendingCandidatesCount: pendingCandidates.length,
      blockRulesCount: blockRules.length,
      avgConfidence,
    };
  }, [memoryItems, candidates, blockRules]);

  // Actions: Pin / Unpin
  const handleTogglePin = async (item: CreativeMemoryItem) => {
    if (!workspace?.id) return;
    try {
      const updated = await api.creativeMemory.togglePin(workspace.id, item.id, !item.isPinned);
      setMemoryItems((prev) => prev.map((m) => (m.id === item.id ? updated.item : m)));
      onNotify?.(
        item.isPinned ? "Memory unpinned" : "Memory pinned as Key Directive",
        "success"
      );
    } catch (err: any) {
      onNotify?.("Failed to toggle pin state", "error");
    }
  };

  // Actions: Archive / Restore
  const handleToggleArchive = async (item: CreativeMemoryItem) => {
    if (!workspace?.id) return;
    const newStatus = item.status === "active" ? "archived" : "active";
    try {
      const updated = await api.creativeMemory.updateItem(workspace.id, item.id, { status: newStatus });
      setMemoryItems((prev) => prev.map((m) => (m.id === item.id ? updated.item : m)));
      onNotify?.(
        newStatus === "archived" ? "Memory archived" : "Memory restored to active memory",
        "info"
      );
    } catch (err: any) {
      onNotify?.("Failed to update status", "error");
    }
  };

  // Actions: Delete Item
  const handleDeleteItem = async (itemId: string) => {
    if (!workspace?.id) return;
    if (!confirm("Are you sure you want to permanently delete this memory item?")) return;
    try {
      await api.creativeMemory.deleteItem(workspace.id, itemId);
      setMemoryItems((prev) => prev.filter((m) => m.id !== itemId));
      onNotify?.("Memory item permanently deleted", "success");
    } catch (err: any) {
      onNotify?.("Failed to delete memory item", "error");
    }
  };

  // Actions: Create Memory
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace?.id || !formData.content.trim()) return;

    const tags = formData.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const created = await api.creativeMemory.createItem(workspace.id, {
        title: formData.title.trim() || undefined,
        content: formData.content.trim(),
        category: formData.category,
        scope: formData.scope,
        entityType: (formData.entityType as any) || undefined,
        entityId: formData.entityId || undefined,
        entityName: formData.entityName || undefined,
        tags,
        confidence: Number(formData.confidence),
        isPinned: formData.isPinned,
        source: "user_explicit",
      });

      setMemoryItems((prev) => [created.item, ...prev]);
      setIsCreateModalOpen(false);
      resetFormData();
      onNotify?.("Memory item committed to Creative Memory", "success");
    } catch (err: any) {
      onNotify?.(err.message || "Failed to create memory item", "error");
    }
  };

  // Actions: Edit Memory
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace?.id || !editingItem || !formData.content.trim()) return;

    const tags = formData.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const updated = await api.creativeMemory.updateItem(workspace.id, editingItem.id, {
        title: formData.title.trim() || undefined,
        content: formData.content.trim(),
        category: formData.category,
        scope: formData.scope,
        entityType: (formData.entityType as any) || undefined,
        entityId: formData.entityId || undefined,
        entityName: formData.entityName || undefined,
        tags,
        confidence: Number(formData.confidence),
        isPinned: formData.isPinned,
      });

      setMemoryItems((prev) => prev.map((m) => (m.id === editingItem.id ? updated.item : m)));
      setEditingItem(null);
      resetFormData();
      onNotify?.("Memory item updated successfully", "success");
    } catch (err: any) {
      onNotify?.(err.message || "Failed to update memory item", "error");
    }
  };

  // Actions: Supersede Memory (Evolution)
  const handleSupersedeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace?.id || !supersedingItem || !supersedeData.content.trim()) return;

    const tags = supersedeData.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await api.creativeMemory.supersedeItem(workspace.id, supersedingItem.id, {
        title: supersedeData.title.trim() || undefined,
        content: supersedeData.content.trim(),
        tags,
        reason: supersedeData.reason.trim() || "Creative evolution and updated positioning",
      });

      // Update old item to archived and add new item to memory list
      setMemoryItems((prev) => [
        res.item,
        ...prev.map((m) =>
          m.id === supersedingItem.id
            ? { ...m, status: "archived" as const, supersededByMemoryId: res.item.id }
            : m
        ),
      ]);

      setSupersedingItem(null);
      setSupersedeData({ title: "", content: "", tagsInput: "", reason: "" });
      onNotify?.("Memory successfully superseded with new creative era", "success");
    } catch (err: any) {
      onNotify?.(err.message || "Failed to supersede memory item", "error");
    }
  };

  // Actions: Resolve AI Candidate
  const handleCandidateResolve = async (
    candidateId: string,
    action: "approve" | "reject" | "edit",
    edited?: Partial<CreativeMemoryItem>
  ) => {
    if (!workspace?.id) return;
    try {
      const res = await api.creativeMemory.resolveCandidate(workspace.id, candidateId, action, edited);
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
      if (res.createdItem) {
        setMemoryItems((prev) => [res.createdItem!, ...prev]);
        onNotify?.("AI proposed memory approved and committed", "success");
      } else if (action === "reject") {
        onNotify?.("Candidate dismissed", "info");
      }
      setEditingCandidate(null);
    } catch (err: any) {
      onNotify?.("Failed to resolve candidate", "error");
    }
  };

  // Actions: Block Rules
  const handleCreateBlockRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace?.id || !blockRuleData.pattern.trim()) return;

    try {
      const res = await api.creativeMemory.createBlockRule(workspace.id, {
        pattern: blockRuleData.pattern.trim(),
        reason: blockRuleData.reason.trim(),
        ruleType: blockRuleData.ruleType,
        entityType: blockRuleData.entityType || undefined,
      });

      setBlockRules((prev) => [...prev, res.rule]);
      setIsBlockRuleModalOpen(false);
      setBlockRuleData({
        pattern: "",
        reason: "Internal privacy / sensitive project data",
        ruleType: "keyword",
        entityType: "",
      });
      onNotify?.("Privacy guardrail rule created", "success");
    } catch (err: any) {
      onNotify?.("Failed to create privacy guardrail rule", "error");
    }
  };

  const handleDeleteBlockRule = async (ruleId: string) => {
    if (!workspace?.id) return;
    try {
      await api.creativeMemory.deleteBlockRule(workspace.id, ruleId);
      setBlockRules((prev) => prev.filter((r) => r.id !== ruleId));
      onNotify?.("Exclusion rule removed", "info");
    } catch (err: any) {
      onNotify?.("Failed to remove rule", "error");
    }
  };

  // Actions: Run Retrieval Test
  const handleRunRetrieval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace?.id) return;
    setIsRetrieving(true);
    try {
      const res = await api.creativeMemory.retrieve(workspace.id, {
        query: retrievalQuery,
        category: retrievalCategory || undefined,
        scope: retrievalScope || undefined,
        limit: 8,
      });
      setRetrievalResult(res);
      onNotify?.(`Retrieval test executed: ${res.memories.length} relevant memories found`, "success");
    } catch (err: any) {
      onNotify?.("Retrieval test failed", "error");
    } finally {
      setIsRetrieving(false);
    }
  };

  const resetFormData = () => {
    setFormData({
      title: "",
      content: "",
      category: "preference",
      scope: "workspace",
      entityType: "",
      entityId: "",
      entityName: "",
      tagsInput: "",
      confidence: 95,
      isPinned: false,
    });
  };

  const openEditModal = (item: CreativeMemoryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      scope: item.scope,
      entityType: item.entityType || "",
      entityId: item.entityId || "",
      entityName: item.entityName || "",
      tagsInput: item.tags.join(", "),
      confidence: item.confidence || 95,
      isPinned: item.isPinned || false,
    });
  };

  const openSupersedeModal = (item: CreativeMemoryItem) => {
    setSupersedingItem(item);
    setSupersedeData({
      title: `${item.title} (Updated)`,
      content: item.content,
      tagsInput: item.tags.join(", "),
      reason: "Evolving creative strategy and updated standards.",
    });
  };

  const openEditCandidateModal = (cand: MemoryCandidate) => {
    setEditingCandidate(cand);
    setCandidateEditData({
      title: cand.title,
      content: cand.content,
      category: cand.category,
      scope: cand.scope,
      tagsInput: cand.tags.join(", "),
    });
  };

  // Helper colors & badge generators
  const getCategoryBadge = (category: CreativeMemoryCategory) => {
    switch (category) {
      case "identity":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">Identity</span>;
      case "preference":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Preference</span>;
      case "strategy":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Strategy</span>;
      case "project":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Project</span>;
      case "asset":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">Asset</span>;
      case "rule":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Rule / Guardrail</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">{category}</span>;
    }
  };

  const getScopeBadge = (scope: CreativeMemoryScope) => {
    switch (scope) {
      case "workspace":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">Workspace</span>;
      case "identity":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-950/60 text-indigo-300 border border-indigo-700/40">Identity</span>;
      case "release":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950/60 text-cyan-300 border border-cyan-700/40">Release</span>;
      case "campaign":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-950/60 text-amber-300 border border-amber-700/40">Campaign</span>;
      case "project":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-950/60 text-blue-300 border border-blue-700/40">Project</span>;
      case "content":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-pink-950/60 text-pink-300 border border-pink-700/40">Content</span>;
      case "studio_project":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-950/60 text-purple-300 border border-purple-700/40">Studio Project</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300">{scope}</span>;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "user_explicit":
        return <span className="text-[10px] text-emerald-400/90 flex items-center gap-1 font-medium"><Check className="w-3 h-3" /> User Explicit</span>;
      case "ai_extracted":
        return <span className="text-[10px] text-purple-400/90 flex items-center gap-1 font-medium"><Sparkles className="w-3 h-3" /> AI Extracted (Approved)</span>;
      case "studio_decision":
        return <span className="text-[10px] text-blue-400/90 flex items-center gap-1 font-medium"><Layers className="w-3 h-3" /> Studio Decision</span>;
      default:
        return <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium"><Zap className="w-3 h-3" /> Verified System</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header Banner & Executive Stats */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>PHASE 8 • CREATIVE MEMORY & LONG-TERM INTELLIGENCE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Persistent Creative Memory
              <span className="text-xs px-2.5 py-1 rounded-md font-mono font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                Workspace Scoped
              </span>
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Keedohub Creative Memory empowers your Creative Brain with structured, evolving, user-approved intelligence across releases, campaigns, sound decisions, and studio projects.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="refresh-memory-btn"
              onClick={loadData}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Sync Memory
            </button>
            <button
              id="add-memory-item-btn"
              onClick={() => {
                resetFormData();
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-lg shadow-red-950/50 flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              Add Memory Directive
            </button>
          </div>
        </div>

        {/* Executive KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-zinc-800/80">
          <div className="bg-zinc-950/60 rounded-xl p-3.5 border border-zinc-800/60">
            <div className="text-[11px] text-zinc-400 font-medium">Active Directives</div>
            <div className="text-xl font-bold text-white mt-1">{stats.activeCount}</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" /> High Precision
            </div>
          </div>

          <div className="bg-zinc-950/60 rounded-xl p-3.5 border border-zinc-800/60">
            <div className="text-[11px] text-zinc-400 font-medium">Pinned Directives</div>
            <div className="text-xl font-bold text-amber-400 mt-1">{stats.pinnedCount}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Priority Core Rules</div>
          </div>

          <div className="bg-zinc-950/60 rounded-xl p-3.5 border border-zinc-800/60">
            <div className="text-[11px] text-zinc-400 font-medium">AI Candidates</div>
            <div className="text-xl font-bold text-purple-400 mt-1">{stats.pendingCandidatesCount}</div>
            <div className="text-[10px] text-purple-400 flex items-center gap-1 mt-0.5">
              <Sparkles className="w-2.5 h-2.5" /> Awaiting Review
            </div>
          </div>

          <div className="bg-zinc-950/60 rounded-xl p-3.5 border border-zinc-800/60">
            <div className="text-[11px] text-zinc-400 font-medium">Privacy Guardrails</div>
            <div className="text-xl font-bold text-rose-400 mt-1">{stats.blockRulesCount}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Active Blockers</div>
          </div>

          <div className="bg-zinc-950/60 rounded-xl p-3.5 border border-zinc-800/60">
            <div className="text-[11px] text-zinc-400 font-medium">Confidence Rating</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{stats.avgConfidence}%</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Quality Weighted</div>
          </div>

          <div className="bg-zinc-950/60 rounded-xl p-3.5 border border-zinc-800/60">
            <div className="text-[11px] text-zinc-400 font-medium">Total Stored</div>
            <div className="text-xl font-bold text-zinc-300 mt-1">{stats.total}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Scoped Records</div>
          </div>
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <button
            id="tab-knowledge-base"
            onClick={() => setActiveSubTab("knowledge-base")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "knowledge-base"
                ? "bg-red-600 text-white shadow-md shadow-red-950/50"
                : "bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            Structured Knowledge Base ({stats.activeCount})
          </button>

          <button
            id="tab-ai-candidates"
            onClick={() => setActiveSubTab("ai-candidates")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer relative ${
              activeSubTab === "ai-candidates"
                ? "bg-purple-600 text-white shadow-md shadow-purple-950/50"
                : "bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Proposals & Candidates
            {stats.pendingCandidatesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-500 text-white">
                {stats.pendingCandidatesCount}
              </span>
            )}
          </button>

          <button
            id="tab-block-rules"
            onClick={() => setActiveSubTab("block-rules")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "block-rules"
                ? "bg-rose-600 text-white shadow-md shadow-rose-950/50"
                : "bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Privacy & Exclusion Rules ({stats.blockRulesCount})
          </button>

          <button
            id="tab-retrieval-inspector"
            onClick={() => setActiveSubTab("retrieval-inspector")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "retrieval-inspector"
                ? "bg-blue-600 text-white shadow-md shadow-blue-950/50"
                : "bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Memory Retrieval Inspector
          </button>
        </div>
      </div>

      {/* 3. Sub-Tab 1: Structured Knowledge Base */}
      {activeSubTab === "knowledge-base" && (
        <div className="space-y-5">
          {/* Filter Toolbar */}
          <div className="bg-zinc-900/70 p-4 rounded-2xl border border-zinc-800/80 space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="search-memory-input"
                  type="text"
                  placeholder="Search memory titles, directives, tags, release names..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Status and Pin Toggles */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPinnedOnly(!pinnedOnly)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    pinnedOnly
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                  Pinned Directives
                </button>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="active">Active Only</option>
                  <option value="archived">Archived Only</option>
                  <option value="all">All States</option>
                </select>

                {releases.length > 0 && (
                  <select
                    value={selectedEntityId}
                    onChange={(e) => setSelectedEntityId(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="all">All Linked Entities</option>
                    <optgroup label="Releases">
                      {releases.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title} ({r.artistName})
                        </option>
                      ))}
                    </optgroup>
                    {campaigns.length > 0 && (
                      <optgroup label="Campaigns">
                        {campaigns.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {projects.length > 0 && (
                      <optgroup label="Projects">
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                )}
              </div>
            </div>

            {/* Category Pills Filter */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800/60">
              <span className="text-[11px] font-medium text-zinc-500 mr-1">Category:</span>
              {[
                { id: "all", label: "All Categories" },
                { id: "identity", label: "Identity" },
                { id: "preference", label: "Preferences" },
                { id: "strategy", label: "Strategy" },
                { id: "project", label: "Project Decisions" },
                { id: "asset", label: "Assets & Visuals" },
                { id: "rule", label: "Rules & Guardrails" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-zinc-200 text-zinc-900 font-semibold"
                      : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                  }`}
                >
                  {cat.label}
                </button>
              ))}

              <span className="text-[11px] font-medium text-zinc-500 ml-3 mr-1">Scope:</span>
              {[
                { id: "all", label: "All Scopes" },
                { id: "workspace", label: "Workspace" },
                { id: "release", label: "Release" },
                { id: "campaign", label: "Campaign" },
                { id: "project", label: "Project" },
                { id: "studio_project", label: "Studio" },
              ].map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScope(sc.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    selectedScope === sc.id
                      ? "bg-purple-500/30 text-purple-200 border border-purple-500/50 font-semibold"
                      : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Memory Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="bg-zinc-900/40 rounded-2xl p-12 text-center border border-zinc-800/80 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 text-zinc-400 flex items-center justify-center mx-auto">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">No Creative Memories Found</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  {searchQuery || selectedCategory !== "all" || selectedScope !== "all"
                    ? "Try adjusting your search query or clearing active category filters."
                    : "Add your first structured creative decision or let the Creative Brain extract insights as you collaborate."}
                </p>
              </div>
              <button
                onClick={() => {
                  resetFormData();
                  setIsCreateModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-red-950/50"
              >
                <Plus className="w-4 h-4" />
                Add Directive Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl p-5 border flex flex-col justify-between transition-all duration-200 hover:border-zinc-700 bg-zinc-900/80 relative group ${
                    item.isPinned
                      ? "border-amber-500/30 shadow-lg shadow-amber-950/10"
                      : item.status === "archived"
                      ? "border-zinc-800/50 opacity-60 bg-zinc-950/60"
                      : "border-zinc-800"
                  }`}
                >
                  {/* Card Header: Badges & Pin Toggle */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getCategoryBadge(item.category)}
                        {getScopeBadge(item.scope)}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePin(item)}
                          title={item.isPinned ? "Unpin Key Memory" : "Pin as Key Memory"}
                          className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                            item.isPinned
                              ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                              : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
                          }`}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-bold text-white mb-2 leading-snug line-clamp-2">
                      {item.title}
                    </h4>

                    {/* Content */}
                    <p className="text-xs text-zinc-300 leading-relaxed line-clamp-4 whitespace-pre-line mb-4 font-normal">
                      {item.content}
                    </p>

                    {/* Entity link badge if tied to Release / Campaign / Project */}
                    {item.entityName && (
                      <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400 flex items-center gap-1 font-medium">
                          {item.scope === "release" && <Disc3 className="w-3 h-3 text-cyan-400" />}
                          {item.scope === "campaign" && <Megaphone className="w-3 h-3 text-amber-400" />}
                          {item.scope === "project" && <Briefcase className="w-3 h-3 text-blue-400" />}
                          {item.entityName}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">LINKED</span>
                      </div>
                    )}

                    {/* Evolution / Superseded Indicator */}
                    {item.supersedesMemoryId && (
                      <div className="mb-3 px-2.5 py-1 rounded bg-purple-950/30 border border-purple-800/30 text-[10px] text-purple-300 flex items-center gap-1 font-mono">
                        <History className="w-3 h-3" /> Evolved from previous era
                      </div>
                    )}
                    {item.supersededByMemoryId && (
                      <div className="mb-3 px-2.5 py-1 rounded bg-amber-950/30 border border-amber-800/30 text-[10px] text-amber-300 flex items-center gap-1 font-mono">
                        <ArrowRight className="w-3 h-3" /> Superseded by newer directive
                      </div>
                    )}

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-zinc-950 text-zinc-400 text-[10px] border border-zinc-800"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Metadata & Actions */}
                  <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400 mt-2">
                    <div className="space-y-0.5">
                      <div>{getSourceBadge(item.source)}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        Confidence: {item.confidence || 95}%
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                      <button
                        onClick={() => openEditModal(item)}
                        title="Edit Memory"
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => openSupersedeModal(item)}
                        title="Supersede with New Decision"
                        className="p-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 text-purple-300 border border-purple-700/40 transition-all cursor-pointer"
                      >
                        <History className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleToggleArchive(item)}
                        title={item.status === "active" ? "Archive" : "Restore"}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                      >
                        <Archive className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        title="Delete Permanently"
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 hover:text-red-200 border border-red-800/30 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Sub-Tab 2: AI Candidates & Proposals */}
      {activeSubTab === "ai-candidates" && (
        <div className="space-y-5">
          <div className="bg-purple-950/20 p-5 rounded-2xl border border-purple-800/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-purple-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                AI Creative Memory Candidates
              </h3>
              <p className="text-xs text-purple-300/80 max-w-2xl leading-relaxed">
                When you collaborate with Keedohub Creative Brain in Studio or Rollout sessions, meaningful creative decisions are queued here. They are NEVER stored into long-term memory without your explicit human approval.
              </p>
            </div>
            <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-purple-900/40 text-purple-300 border border-purple-700/40">
              {candidates.length} Pending Approval
            </div>
          </div>

          {candidates.length === 0 ? (
            <div className="bg-zinc-900/40 rounded-2xl p-12 text-center border border-zinc-800/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/50 text-purple-400 flex items-center justify-center mx-auto border border-purple-800/40">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-white">No Pending AI Memory Proposals</h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                As you chat with the Creative Brain or commission Studio assets, new suggested style tokens and decisions will automatically surface here for verification.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((cand) => (
                <div
                  key={cand.id}
                  className="rounded-2xl p-5 border border-purple-500/20 bg-zinc-900/90 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getCategoryBadge(cand.category)}
                        {getScopeBadge(cand.scope)}
                      </div>
                      <span className="text-[10px] text-purple-400 font-mono bg-purple-950 px-2 py-0.5 rounded border border-purple-800/40">
                        {cand.confidence}% Confidence
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{cand.title}</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-950/70 p-3 rounded-xl border border-zinc-800">
                      {cand.content}
                    </p>

                    {cand.sourceContext && (
                      <div className="text-[11px] text-zinc-400">
                        <span className="text-zinc-500 font-mono">Source Context:</span> {cand.sourceContext}
                      </div>
                    )}

                    {cand.tags && cand.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {cand.tags.map((t, i) => (
                          <span key={i} className="text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleCandidateResolve(cand.id, "reject")}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Dismiss
                    </button>

                    <button
                      onClick={() => openEditCandidateModal(cand)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit & Approve
                    </button>

                    <button
                      onClick={() => handleCandidateResolve(cand.id, "approve")}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-purple-950/50 cursor-pointer transition-all"
                    >
                      <Check className="w-3.5 h-3.5" /> Commit to Memory
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Sub-Tab 3: Privacy & Block Rules */}
      {activeSubTab === "block-rules" && (
        <div className="space-y-5">
          <div className="bg-rose-950/20 p-5 rounded-2xl border border-rose-800/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-rose-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                Creative Privacy & Exclusion Guardrails
              </h3>
              <p className="text-xs text-rose-300/80 max-w-2xl leading-relaxed">
                Define strictly prohibited words, secret feature codenames, confidential personal contact details, or NDA terms. The Memory Retrieval Service will strictly exclude any memory matching these rules before feeding prompt context to the AI.
              </p>
            </div>
            <button
              onClick={() => setIsBlockRuleModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
            >
              <Plus className="w-4 h-4" />
              Add Exclusion Rule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blockRules.map((rule) => (
              <div
                key={rule.id}
                className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold uppercase">
                      BLOCK PATTERN
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {rule.createdAt ? new Date(rule.createdAt).toLocaleDateString() : "Active"}
                    </span>
                  </div>

                  <div className="text-base font-mono font-bold text-white bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800">
                    "{rule.pattern}"
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    <span className="font-semibold text-zinc-300">Reason:</span> {rule.reason}
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                    <Lock className="w-3 h-3" /> Shield Active
                  </span>

                  <button
                    onClick={() => handleDeleteBlockRule(rule.id)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/40 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
                    title="Remove Rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Sub-Tab 4: Memory Retrieval Inspector & Simulation */}
      {activeSubTab === "retrieval-inspector" && (
        <div className="space-y-6">
          <div className="bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-400" />
                Memory Retrieval Inspector & Verification Sandbox
              </h3>
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                Test how the Creative Brain retrieves and weights memories in real-time. Enter a prompt to verify which knowledge nodes are prioritized, their relevance scores, and how they get structured into the AI context prompt.
              </p>
            </div>

            <form onSubmit={handleRunRetrieval} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Test Query / Intent Prompt
                </label>
                <textarea
                  rows={2}
                  value={retrievalQuery}
                  onChange={(e) => setRetrievalQuery(e.target.value)}
                  placeholder="e.g. Write a TikTok hook for our high-energy summer single..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <select
                    value={retrievalCategory}
                    onChange={(e) => setRetrievalCategory(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300 cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    <option value="identity">Identity</option>
                    <option value="preference">Preference</option>
                    <option value="strategy">Strategy</option>
                    <option value="project">Project</option>
                    <option value="asset">Asset</option>
                    <option value="rule">Rule</option>
                  </select>

                  <select
                    value={retrievalScope}
                    onChange={(e) => setRetrievalScope(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300 cursor-pointer"
                  >
                    <option value="">All Scopes</option>
                    <option value="workspace">Workspace</option>
                    <option value="release">Release</option>
                    <option value="campaign">Campaign</option>
                    <option value="project">Project</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isRetrieving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-950/50 transition-all cursor-pointer"
                >
                  <Zap className={`w-3.5 h-3.5 ${isRetrieving ? "animate-spin" : ""}`} />
                  {isRetrieving ? "Simulating Retrieval..." : "Run Retrieval Inspection"}
                </button>
              </div>
            </form>
          </div>

          {/* Retrieval Results Output */}
          {retrievalResult && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Retrieved Knowledge Nodes ({retrievalResult.memories.length})
                </h4>
                <span className="text-xs font-mono text-zinc-400">
                  Targeted Ranking Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {retrievalResult.memories.map((m) => {
                  const score = retrievalResult.relevanceScores[m.id] || 0;
                  const reason = retrievalResult.retrievalReasons[m.id] || "Relevance Match";
                  return (
                    <div
                      key={m.id}
                      className="bg-zinc-900/90 rounded-2xl p-5 border border-zinc-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {getCategoryBadge(m.category)}
                          {getScopeBadge(m.scope)}
                        </div>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Match Score: {score}%
                        </span>
                      </div>

                      <h5 className="text-sm font-bold text-white">{m.title}</h5>
                      <p className="text-xs text-zinc-300 whitespace-pre-line">{m.content}</p>

                      <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                        <span className="text-emerald-400 font-medium">{reason}</span>
                        <span className="font-mono text-[10px] text-zinc-500">ID: {m.id.substring(0, 10)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Formatted Prompt Injection Preview */}
              <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                    Formatted AI Prompt Context (What Gemini Receives)
                  </h5>
                  <span className="text-[10px] text-zinc-500 font-mono">System Injection</span>
                </div>
                <pre className="text-xs text-zinc-400 bg-zinc-900/60 p-4 rounded-xl font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {retrievalResult.usedMemorySummaries.length > 0
                    ? `[WORKSPACE CREATIVE MEMORY & DIRECTIVES]\n${retrievalResult.usedMemorySummaries.map((s) => `• ${s}`).join("\n")}`
                    : "No memories met the retrieval threshold for this query."}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE / EDIT MEMORY ITEM                                        */}
      {/* ========================================================================= */}
      {(isCreateModalOpen || editingItem) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-red-500" />
                {editingItem ? "Edit Creative Memory Directive" : "Add Creative Memory Directive"}
              </h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingItem(null);
                }}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingItem ? handleEditSubmit : handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Directive Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Sonic Signature: Late-Night Analog Synths"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Memory Content / Knowledge Directive *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="State the creative rule, aesthetic preference, audience insight, or non-negotiable standard clearly..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 cursor-pointer"
                  >
                    <option value="preference">Preference (Visual / Sound / Tone)</option>
                    <option value="identity">Identity (Origin / Story / Archetype)</option>
                    <option value="strategy">Strategy (Audience ICP / Conversion)</option>
                    <option value="project">Project Decision (Approved Direction)</option>
                    <option value="asset">Asset (Specs / Vault Relationship)</option>
                    <option value="rule">Rule / Guardrail (Do Not Say / Standard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Scope
                  </label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 cursor-pointer"
                  >
                    <option value="workspace">Workspace (Global)</option>
                    <option value="identity">Identity Specific</option>
                    <option value="release">Release Specific</option>
                    <option value="campaign">Campaign Specific</option>
                    <option value="project">Project Specific</option>
                    <option value="content">Content Specific</option>
                    <option value="studio_project">Studio Project Specific</option>
                  </select>
                </div>
              </div>

              {/* Linked Entity Selection */}
              {(formData.scope === "release" || formData.scope === "campaign" || formData.scope === "project") && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Link to Specific {formData.scope.charAt(0).toUpperCase() + formData.scope.slice(1)}
                  </label>
                  <select
                    value={formData.entityId}
                    onChange={(e) => {
                      const id = e.target.value;
                      let name = "";
                      if (formData.scope === "release") {
                        name = releases.find((r) => r.id === id)?.title || "";
                      } else if (formData.scope === "campaign") {
                        name = campaigns.find((c) => c.id === id)?.title || "";
                      } else if (formData.scope === "project") {
                        name = projects.find((p) => p.id === id)?.title || "";
                      }
                      setFormData({
                        ...formData,
                        entityId: id,
                        entityName: name,
                        entityType: formData.scope,
                      });
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 cursor-pointer"
                  >
                    <option value="">Select entity...</option>
                    {formData.scope === "release" &&
                      releases.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title} ({r.artistName})
                        </option>
                      ))}
                    {formData.scope === "campaign" &&
                      campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    {formData.scope === "project" &&
                      projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. production, 808, mastering, visual_identity"
                  value={formData.tagsInput}
                  onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="rounded bg-zinc-950 border-zinc-800 text-red-500 focus:ring-0"
                  />
                  Pin as Key Directive (Prioritized in All Retrieval Passes)
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Confidence:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{formData.confidence}%</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-950/50 cursor-pointer"
                >
                  {editingItem ? "Save Changes" : "Commit Directive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SUPERSEDE MEMORY (CREATIVE EVOLUTION)                            */}
      {/* ========================================================================= */}
      {supersedingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-400" />
                  Supersede Memory Directive
                </h3>
                <p className="text-xs text-zinc-400">
                  Document the creative evolution. The previous directive will be archived with historic linkage.
                </p>
              </div>
              <button
                onClick={() => setSupersedingItem(null)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 text-xs space-y-1">
              <div className="text-zinc-500 font-medium">Previous Directive Being Superseded:</div>
              <div className="font-semibold text-zinc-300">{supersedingItem.title}</div>
              <div className="text-zinc-400 text-[11px] line-clamp-2">{supersedingItem.content}</div>
            </div>

            <form onSubmit={handleSupersedeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  New Evolution Title
                </label>
                <input
                  type="text"
                  required
                  value={supersedeData.title}
                  onChange={(e) => setSupersedeData({ ...supersedeData, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Updated Memory Content / Decision *
                </label>
                <textarea
                  rows={4}
                  required
                  value={supersedeData.content}
                  onChange={(e) => setSupersedeData({ ...supersedeData, content: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Reason for Evolution (Why did the sound/brand change?)
                </label>
                <input
                  type="text"
                  value={supersedeData.reason}
                  onChange={(e) => setSupersedeData({ ...supersedeData, reason: e.target.value })}
                  placeholder="e.g. Upgraded from bedroom demo era to flagship orchestral studio production"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSupersedingItem(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-950/50 cursor-pointer"
                >
                  Confirm Creative Evolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD BLOCK RULE / PRIVACY GUARDRAIL                              */}
      {/* ========================================================================= */}
      {isBlockRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                Add Privacy & Exclusion Rule
              </h3>
              <button
                onClick={() => setIsBlockRuleModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBlockRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Pattern / Word / Phrase to Exclude *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Project Sphinx, +234-810, $50,000 secret budget"
                  value={blockRuleData.pattern}
                  onChange={(e) => setBlockRuleData({ ...blockRuleData, pattern: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Reason for Exclusion
                </label>
                <input
                  type="text"
                  value={blockRuleData.reason}
                  onChange={(e) => setBlockRuleData({ ...blockRuleData, reason: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsBlockRuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/50 cursor-pointer"
                >
                  Add Exclusion Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT & APPROVE CANDIDATE                                         */}
      {/* ========================================================================= */}
      {editingCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Refine AI Candidate Before Approval
              </h3>
              <button
                onClick={() => setEditingCandidate(null)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Title</label>
                <input
                  type="text"
                  value={candidateEditData.title}
                  onChange={(e) => setCandidateEditData({ ...candidateEditData, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Content</label>
                <textarea
                  rows={4}
                  value={candidateEditData.content}
                  onChange={(e) => setCandidateEditData({ ...candidateEditData, content: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Category</label>
                  <select
                    value={candidateEditData.category}
                    onChange={(e) => setCandidateEditData({ ...candidateEditData, category: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200"
                  >
                    <option value="preference">Preference</option>
                    <option value="identity">Identity</option>
                    <option value="strategy">Strategy</option>
                    <option value="project">Project</option>
                    <option value="asset">Asset</option>
                    <option value="rule">Rule</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Scope</label>
                  <select
                    value={candidateEditData.scope}
                    onChange={(e) => setCandidateEditData({ ...candidateEditData, scope: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200"
                  >
                    <option value="workspace">Workspace</option>
                    <option value="identity">Identity</option>
                    <option value="release">Release</option>
                    <option value="campaign">Campaign</option>
                    <option value="project">Project</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingCandidate(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleCandidateResolve(editingCandidate.id, "edit", {
                    title: candidateEditData.title,
                    content: candidateEditData.content,
                    category: candidateEditData.category,
                    scope: candidateEditData.scope,
                  })
                }
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-950/50 cursor-pointer"
              >
                Approve & Commit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
