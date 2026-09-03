import React, { useState, useEffect } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import { useAuth } from "../context/AuthContext";
import {
  ActiveTab,
  Project,
  ProjectStatus,
  IdentityType,
  Folder,
  Milestone,
  TaskItem,
  AttentionItem,
  CreativeRecommendation,
  Asset,
  Release,
  Campaign,
  ContentItem,
} from "../types";
import {
  Layers,
  FolderPlus,
  Music,
  Video,
  Building2,
  Rocket,
  Briefcase,
  CheckCircle2,
  Clock,
  HardDrive,
  Calendar,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  Upload,
  Eye,
  CheckSquare,
  Square,
  ShieldCheck,
  Zap,
  Tag,
  Share2,
  FileText,
  Palette,
  Volume2,
  Bell,
  RefreshCw,
  AlertTriangle,
  Flame,
  Filter,
  Folder as FolderIcon,
  Sliders,
  ChevronRight,
  TrendingUp,
  Target,
  Search,
  X,
  Check,
  ArrowUpRight,
  PieChart,
  Megaphone,
  Disc3,
  ChevronDown,
  Radio,
  Headphones,
  Percent,
  BrainCircuit
} from "lucide-react";
import { NewProjectModal } from "./NewProjectModal";
import { ArtistOS } from "./ArtistOS";
import { BrandOS } from "./BrandOS";
import { ContentEngine } from "./ContentEngine";
import { CreativeMemoryDashboard } from "./CreativeMemoryDashboard";
import { MasteringSuite } from "./MasteringSuite";
import { LyricsStudio } from "./LyricsStudio";
import { CoverStudio } from "./CoverStudio";
import { DSPPitcher } from "./DSPPitcher";
import { SplitsCalculator } from "./SplitsCalculator";
import { PresaveHub } from "./PresaveHub";
import { EPKBuilder } from "./EPKBuilder";
import { useCreativeBrain } from "../context/CreativeBrainContext";

interface WorkspaceHubProps {
  setActiveTab: (tab: ActiveTab) => void;
  onNotify: (text: string, type?: "success" | "info" | "error") => void;
  initialSubTab?: string;
}

export function WorkspaceHub({ setActiveTab, onNotify, initialSubTab }: WorkspaceHubProps) {
  const { user, switchWorkspace, workspaces, activeWorkspace, openOnboarding } = useAuth();
  const { openBrainWithContext, toggleBrain } = useCreativeBrain();
  const {
    workspace,
    overview,
    projects,
    assets,
    releases,
    campaigns,
    contentItems,
    folders,
    milestones,
    tasks,
    attentionItems,
    recommendations,
    creativeMemory,
    notifications,
    activityLogs,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    createFolder,
    deleteFolder,
    createMilestone,
    toggleMilestone,
    deleteMilestone,
    saveAsset,
    deleteAsset,
    createCampaign,
    deleteContentItem,
    updateCreativeMemory,
    markNotificationAsRead,
    fetchWorkspaceData,
    isLoading,
    calculateReleaseReadiness,
    calculateCampaignReadiness,
    activeRelease,
    activeCampaign,
  } = useWorkspace();

  const isArtist = (workspace?.identityType || activeWorkspace?.identityType) === "artist";
  const isBrand = (workspace?.identityType || activeWorkspace?.identityType) === "brand";

  type WorkspaceSubTab =
    | "artist-os"
    | "brand-os"
    | "dashboard"
    | "pipeline"
    | "tasks"
    | "milestones"
    | "artist-tools"
    | "releases"
    | "assets"
    | "campaigns"
    | "content"
    | "memory"
    | "activity";

  const [activeSubTab, setActiveSubTab] = useState<WorkspaceSubTab>(() => {
    if (initialSubTab) {
      if (initialSubTab === "artist-os" || initialSubTab === "brand-os") return initialSubTab;
      if (
        initialSubTab === "mastering-suite" ||
        initialSubTab === "lyrics-studio" ||
        initialSubTab === "cover-studio" ||
        initialSubTab === "dsp-pitcher" ||
        initialSubTab === "splits-calculator" ||
        initialSubTab === "presave-hub" ||
        initialSubTab === "epk-builder"
      ) {
        return "artist-tools";
      }
      return initialSubTab as WorkspaceSubTab;
    }
    return isArtist ? "artist-os" : "brand-os";
  });

  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [selectedArtistTool, setSelectedArtistTool] = useState<
    "mastering" | "lyrics" | "cover" | "dsp" | "splits" | "presave" | "epk"
  >(() => {
    if (initialSubTab === "lyrics-studio") return "lyrics";
    if (initialSubTab === "cover-studio") return "cover";
    if (initialSubTab === "dsp-pitcher") return "dsp";
    if (initialSubTab === "splits-calculator") return "splits";
    if (initialSubTab === "presave-hub") return "presave";
    if (initialSubTab === "epk-builder") return "epk";
    return "mastering";
  });

  // Sync internal navigation if initialSubTab or workspace identity changes
  useEffect(() => {
    if (initialSubTab) {
      if (initialSubTab === "mastering-suite") {
        setActiveSubTab("artist-tools");
        setSelectedArtistTool("mastering");
      } else if (initialSubTab === "lyrics-studio") {
        setActiveSubTab("artist-tools");
        setSelectedArtistTool("lyrics");
      } else if (initialSubTab === "cover-studio") {
        setActiveSubTab("artist-tools");
        setSelectedArtistTool("cover");
      } else if (initialSubTab === "dsp-pitcher") {
        setActiveSubTab("artist-tools");
        setSelectedArtistTool("dsp");
      } else if (initialSubTab === "splits-calculator") {
        setActiveSubTab("artist-tools");
        setSelectedArtistTool("splits");
      } else if (initialSubTab === "presave-hub") {
        setActiveSubTab("artist-tools");
        setSelectedArtistTool("presave");
      } else if (initialSubTab === "epk-builder") {
        setActiveSubTab("artist-tools");
        setSelectedArtistTool("epk");
      } else if (initialSubTab === "artist-os") {
        setActiveSubTab("artist-os");
      } else if (initialSubTab === "brand-os") {
        setActiveSubTab("brand-os");
      } else if (initialSubTab === "content-engine") {
        setActiveSubTab("content");
      } else if (initialSubTab === "creative-memory") {
        setActiveSubTab("memory");
      } else if (initialSubTab === "resource-vault") {
        setActiveSubTab("assets");
      } else {
        setActiveSubTab(initialSubTab as WorkspaceSubTab);
      }
    } else {
      if (isArtist && activeSubTab === "brand-os") {
        setActiveSubTab("artist-os");
      } else if (isBrand && (activeSubTab === "artist-os" || activeSubTab === "artist-tools")) {
        setActiveSubTab("brand-os");
      }
    }
  }, [initialSubTab, workspace?.id, workspace?.identityType, isArtist, isBrand]);

  const handleInternalNavigate = (targetTab: string) => {
    if (targetTab === "mastering-suite") {
      setActiveSubTab("artist-tools");
      setSelectedArtistTool("mastering");
    } else if (targetTab === "lyrics-studio") {
      setActiveSubTab("artist-tools");
      setSelectedArtistTool("lyrics");
    } else if (targetTab === "cover-studio") {
      setActiveSubTab("artist-tools");
      setSelectedArtistTool("cover");
    } else if (targetTab === "dsp-pitcher") {
      setActiveSubTab("artist-tools");
      setSelectedArtistTool("dsp");
    } else if (targetTab === "splits-calculator") {
      setActiveSubTab("artist-tools");
      setSelectedArtistTool("splits");
    } else if (targetTab === "presave-hub") {
      setActiveSubTab("artist-tools");
      setSelectedArtistTool("presave");
    } else if (targetTab === "epk-builder") {
      setActiveSubTab("artist-tools");
      setSelectedArtistTool("epk");
    } else if (targetTab === "artist-os") {
      setActiveSubTab("artist-os");
    } else if (targetTab === "brand-os") {
      setActiveSubTab("brand-os");
    } else if (targetTab === "content-engine") {
      setActiveSubTab("content");
    } else if (targetTab === "resource-vault") {
      setActiveSubTab("assets");
    } else if (targetTab === "creative-memory") {
      setActiveSubTab("memory");
    } else if (targetTab === "project-console") {
      setActiveSubTab("pipeline");
    } else if (targetTab === "workspace-hub" || targetTab === "command-center") {
      setActiveSubTab(isArtist ? "artist-os" : "brand-os");
    } else {
      setActiveTab(targetTab as ActiveTab);
    }
  };

  // Modals state
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isNewMilestoneOpen, setIsNewMilestoneOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isUploadAssetOpen, setIsUploadAssetOpen] = useState(false);

  // New Task form state
  const [taskText, setTaskText] = useState("");
  const [taskPriority, setTaskPriority] = useState<"urgent" | "high" | "medium" | "low">("medium");
  const [taskProjectId, setTaskProjectId] = useState<string>("");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskCategory, setTaskCategory] = useState("Production");

  // New Milestone form state
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDate, setMilestoneDate] = useState("");
  const [milestoneProjectId, setMilestoneProjectId] = useState("");
  const [milestoneDeliverables, setMilestoneDeliverables] = useState("");
  const [milestoneNotes, setMilestoneNotes] = useState("");

  // New Folder form state
  const [folderName, setFolderName] = useState("");
  const [folderCategory, setFolderCategory] = useState<"artwork" | "audio" | "video" | "marketing" | "documents" | "general">("artwork");
  const [folderColor, setFolderColor] = useState("#EF4444");

  // Upload Asset form state
  const [assetName, setAssetName] = useState("");
  const [assetUrl, setAssetUrl] = useState("");
  const [assetFolderId, setAssetFolderId] = useState<string>("");
  const [assetCategory, setAssetCategory] = useState<"artwork" | "audio" | "video" | "document">("artwork");

  // Asset folder filter
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");

  // Task filter
  const [taskFilterStatus, setTaskFilterStatus] = useState<"all" | "open" | "completed">("all");
  const [taskFilterPriority, setTaskFilterPriority] = useState<string>("all");

  // Memory editing
  const [editingMemory, setEditingMemory] = useState(false);
  const [memorySummary, setMemorySummary] = useState(creativeMemory?.identitySummary || "");
  const [memoryNarrative, setMemoryNarrative] = useState(creativeMemory?.coreNarrative || "");

  // Sync memory local state
  useEffect(() => {
    if (creativeMemory) {
      setMemorySummary(creativeMemory.identitySummary);
      setMemoryNarrative(creativeMemory.coreNarrative);
    }
  }, [creativeMemory]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    try {
      await createTask({
        text: taskText.trim(),
        priority: taskPriority,
        projectId: taskProjectId || undefined,
        deadline: taskDeadline || undefined,
        category: taskCategory || "Production",
      });
      setTaskText("");
      setTaskDeadline("");
      setIsNewTaskOpen(false);
      onNotify("Task added to workspace", "success");
    } catch {
      onNotify("Failed to create task", "error");
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim() || !milestoneDate) return;

    const deliverablesList = milestoneDeliverables
      .split("\n")
      .map((d) => d.trim())
      .filter(Boolean);

    const project = projects.find((p) => p.id === milestoneProjectId);

    try {
      await createMilestone({
        title: milestoneTitle.trim(),
        targetDate: milestoneDate,
        projectId: milestoneProjectId || undefined,
        projectTitle: project?.title || undefined,
        deliverables: deliverablesList,
        notes: milestoneNotes || undefined,
        status: "planned",
      });
      setMilestoneTitle("");
      setMilestoneDate("");
      setMilestoneDeliverables("");
      setMilestoneNotes("");
      setIsNewMilestoneOpen(false);
      onNotify("Milestone scheduled on roadmap", "success");
    } catch {
      onNotify("Failed to create milestone", "error");
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    try {
      await createFolder({
        name: folderName.trim(),
        category: folderCategory,
        color: folderColor,
      });
      setFolderName("");
      setIsNewFolderOpen(false);
      onNotify("Folder created in Asset Vault", "success");
    } catch {
      onNotify("Failed to create folder", "error");
    }
  };

  const handleUploadAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim() || !assetUrl.trim()) return;

    try {
      await saveAsset({
        name: assetName.trim(),
        url: assetUrl.trim(),
        category: assetCategory,
        folderId: assetFolderId || undefined,
        dimensions: assetCategory === "artwork" ? "3000x3000" : undefined,
        format: assetCategory === "audio" ? "WAV 24-bit" : "PNG",
        size: 5 * 1024 * 1024,
      });
      setAssetName("");
      setAssetUrl("");
      setIsUploadAssetOpen(false);
      onNotify("Asset cataloged to workspace vault", "success");
    } catch {
      onNotify("Failed to upload asset", "error");
    }
  };

  const handleSaveMemory = async () => {
    try {
      await updateCreativeMemory({
        identitySummary: memorySummary,
        coreNarrative: memoryNarrative,
      });
      setEditingMemory(false);
      onNotify("Workspace Creative Memory updated", "success");
    } catch {
      onNotify("Failed to update memory", "error");
    }
  };

  const getIdentityIcon = (type?: IdentityType) => {
    switch (type) {
      case "artist":
        return <Music className="w-5 h-5 text-red-400" />;
      case "brand":
      default:
        return <Building2 className="w-5 h-5 text-blue-400" />;
    }
  };

  const filteredAssets = selectedFolderId === "all"
    ? assets
    : assets.filter((a) => a.folderId === selectedFolderId);

  const filteredTasks = tasks.filter((t) => {
    if (taskFilterStatus === "open" && t.completed) return false;
    if (taskFilterStatus === "completed" && !t.completed) return false;
    if (taskFilterPriority !== "all" && t.priority !== taskFilterPriority) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* 1. NEW PROJECT MODAL */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onSuccess={() => onNotify("Project logged to workspace", "success")}
      />

      {/* 2. NEW TASK MODAL */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-red-500" />
                <span>Create Workspace Task</span>
              </h3>
              <button
                onClick={() => setIsNewTaskOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Task Description *</label>
                <input
                  type="text"
                  required
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  placeholder="e.g. Master track stems to -14 LUFS standard"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 min-h-[44px]"
                  >
                    <option value="urgent">🔴 Urgent</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    placeholder="e.g. Audio, Legal, Marketing"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Link to Project (Optional)</label>
                <select
                  value={taskProjectId}
                  onChange={(e) => setTaskProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 min-h-[44px]"
                >
                  <option value="">No Project (Standalone Workspace Task)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Deadline</label>
                <input
                  type="date"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 min-h-[44px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl min-h-[44px]"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. NEW MILESTONE MODAL */}
      {isNewMilestoneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                <span>Schedule Workspace Milestone</span>
              </h3>
              <button
                onClick={() => setIsNewMilestoneOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Milestone Name *</label>
                <input
                  type="text"
                  required
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="e.g. Master Delivery & DSP Ingestion"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Date *</label>
                  <input
                    type="date"
                    required
                    value={milestoneDate}
                    onChange={(e) => setMilestoneDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Related Project</label>
                  <select
                    value={milestoneProjectId}
                    onChange={(e) => setMilestoneProjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 min-h-[44px]"
                  >
                    <option value="">None (Global Milestone)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Deliverables Checklist (One item per line)
                </label>
                <textarea
                  rows={3}
                  value={milestoneDeliverables}
                  onChange={(e) => setMilestoneDeliverables(e.target.value)}
                  placeholder="Final WAV master files&#10;3000x3000px Cover art&#10;Split sheet agreement signatures"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewMilestoneOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs rounded-xl min-h-[44px]"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. NEW FOLDER MODAL */}
      {isNewFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderIcon className="w-4 h-4 text-emerald-500" />
                <span>Create Asset Folder</span>
              </h3>
              <button
                onClick={() => setIsNewFolderOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Folder Name *</label>
                <input
                  type="text"
                  required
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="e.g. Single Artwork High-Res"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Category</label>
                  <select
                    value={folderCategory}
                    onChange={(e) => setFolderCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 min-h-[44px]"
                  >
                    <option value="artwork">Artwork & Graphics</option>
                    <option value="audio">Audio & Stems</option>
                    <option value="video">Video & Motion</option>
                    <option value="marketing">Marketing Decks</option>
                    <option value="documents">Contracts & Legal</option>
                    <option value="general">General Assets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Folder Color Accent</label>
                  <div className="flex items-center gap-2 mt-1">
                    {["#EF4444", "#F97316", "#10B981", "#3B82F6", "#8B5CF6"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFolderColor(c)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          folderColor === c ? "scale-110 border-white" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl min-h-[44px]"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. UPLOAD ASSET MODAL */}
      {isUploadAssetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-500" />
                <span>Upload Cloud Asset</span>
              </h3>
              <button
                onClick={() => setIsUploadAssetOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadAsset} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Asset Name *</label>
                <input
                  type="text"
                  required
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="e.g. Keedohub Master Artwork 3000px"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Asset URL or Image Source *</label>
                <input
                  type="url"
                  required
                  value={assetUrl}
                  onChange={(e) => setAssetUrl(e.target.value)}
                  placeholder="https://... or data:image/..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Asset Type</label>
                  <select
                    value={assetCategory}
                    onChange={(e) => setAssetCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 min-h-[44px]"
                  >
                    <option value="artwork">Cover Artwork</option>
                    <option value="audio">Audio Master / Stem</option>
                    <option value="video">Video / Reel</option>
                    <option value="document">Legal / Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Folder Destination</label>
                  <select
                    value={assetFolderId}
                    onChange={(e) => setAssetFolderId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 min-h-[44px]"
                  >
                    <option value="">Uncategorized (Root)</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadAssetOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl min-h-[44px]"
                >
                  Catalog Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOP WORKSPACE HERO & COMMAND BAR */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={workspace?.avatarUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80"}
                alt={workspace?.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-zinc-700/80 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800">
                {isArtist ? <Disc3 className="w-4 h-4 text-red-500" /> : <Building2 className="w-4 h-4 text-blue-500" />}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative">
                  <button
                    onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-sm font-bold text-white transition-all cursor-pointer"
                    title="Switch active workspace"
                  >
                    <span className={`w-2 h-2 rounded-full ${isArtist ? "bg-red-500" : "bg-blue-500"} animate-pulse`} />
                    <span className="font-['Space_Grotesk'] font-black tracking-tight">{workspace?.name || "Keedohub Workspace"}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isWorkspaceDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Switcher Dropdown */}
                  {isWorkspaceDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-72 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-2.5 z-50 animate-fade-in space-y-1">
                      <div className="px-2 py-1 text-[10px] font-mono uppercase font-bold text-zinc-400 border-b border-zinc-800/80 pb-1.5 flex items-center justify-between">
                        <span>Available Workspaces</span>
                        <span className="text-zinc-500 font-normal">{workspaces.length} total</span>
                      </div>

                      <div className="max-h-56 overflow-y-auto space-y-1 py-1">
                        {workspaces.map((ws) => {
                          const isActive = ws.id === workspace?.id;
                          const isWsArtist = ws.identityType === "artist";
                          return (
                            <button
                              key={ws.id}
                              onClick={() => {
                                switchWorkspace(ws.id);
                                setIsWorkspaceDropdownOpen(false);
                                onNotify(`Switched to ${ws.name} (${isWsArtist ? "Artist OS" : "Brand OS"})`, "success");
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                                isActive
                                  ? "bg-zinc-800/90 border border-zinc-700 text-white font-bold"
                                  : "hover:bg-zinc-900 text-zinc-300 border border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <div className={`p-1.5 rounded-lg shrink-0 ${isWsArtist ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}>
                                  {isWsArtist ? <Disc3 className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                                </div>
                                <div className="truncate">
                                  <div className="text-xs truncate font-semibold">{ws.name}</div>
                                  <div className="text-[10px] text-zinc-500 font-mono capitalize">{ws.identityType} OS</div>
                                </div>
                              </div>
                              {isActive && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80">
                        <button
                          onClick={() => {
                            setIsWorkspaceDropdownOpen(false);
                            openOnboarding({ isNewAccount: false, defaultIdentity: isArtist ? "artist" : "brand" });
                          }}
                          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-red-400" />
                          <span>+ Create New Workspace</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  isArtist
                    ? "bg-red-500/15 text-red-400 border-red-500/30"
                    : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                }`}>
                  {isArtist ? "Artist Operating Environment" : "Brand Operating Environment"}
                </span>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/40">
                  Account: {user?.fullName || "Keedohub Creator"}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                {isArtist
                  ? "Unified Artist Workspace: Rollout operations, music production tools, stems vault, 30-day schedules, DSP pitching, and Creative Brain."
                  : "Unified Brand Workspace: Brand strategy, campaigns, growth sprints, asset kit, content engine, and brand intelligence."}
              </p>

              {workspace?.genreOrNiche && (
                <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500 font-mono">
                  <span className="font-semibold text-zinc-400">{isArtist ? "Genre" : "Industry"}:</span> {workspace.genreOrNiche}
                </div>
              )}
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                if (isArtist && activeRelease) {
                  openBrainWithContext(`I am in the Artist Workspace for release "${activeRelease.title}". Help me with rollout timeline, DSP pitching, and viral promo.`);
                } else if (isBrand && activeCampaign) {
                  openBrainWithContext(`I am in the Brand Workspace for campaign "${activeCampaign.name}". Help me optimize brand positioning, campaign sprints, and content.`);
                } else {
                  toggleBrain();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-red-950/80 to-zinc-900 border border-red-500/40 hover:border-red-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-red-950/40 transition-all cursor-pointer min-h-[44px]"
              title="Ask Creative Brain with current Workspace context"
            >
              <BrainCircuit className="w-4 h-4 text-red-400 animate-pulse" />
              <span>Ask Brain</span>
            </button>

            <button
              onClick={() => fetchWorkspaceData()}
              disabled={isLoading}
              title="Refresh live workspace data"
              className="p-2.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-zinc-700/60 transition-colors cursor-pointer disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-red-400" : ""}`} />
            </button>

            <button
              onClick={() => setIsNewProjectOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-950/60 transition-all cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>{isArtist ? "New Project" : "New Initiative"}</span>
            </button>

            <button
              onClick={() => setIsNewTaskOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-semibold rounded-xl border border-zinc-700/60 transition-colors cursor-pointer min-h-[44px]"
            >
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Add Task</span>
            </button>

            <button
              onClick={() => setIsNewMilestoneOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-semibold rounded-xl border border-zinc-700/60 transition-colors cursor-pointer min-h-[44px]"
            >
              <Target className="w-4 h-4 text-amber-400" />
              <span>Milestone</span>
            </button>
          </div>
        </div>

        {/* Real-time Workspace Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-zinc-800/80">
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>{isArtist ? "Release Readiness" : "Campaign Readiness"}</span>
              <TrendingUp className={`w-3.5 h-3.5 ${isArtist ? "text-red-400" : "text-blue-400"}`} />
            </div>
            <div className="text-xl font-black text-white font-['Space_Grotesk']">
              {isArtist
                ? `${activeRelease ? calculateReleaseReadiness(activeRelease).score : 78}%`
                : `${activeCampaign ? calculateCampaignReadiness(activeCampaign).score : 85}%`}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
              {isArtist ? (activeRelease?.title || "Upcoming Drop") : (activeCampaign?.name || "Active Sprint")}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>{isArtist ? "Projects" : "Initiatives"}</span>
              <FolderPlus className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-black text-white font-['Space_Grotesk']">{projects.length}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{projects.filter(p => p.status === "in-progress").length} in progress</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Tasks</span>
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-white font-['Space_Grotesk']">{tasks.length}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{tasks.filter(t => !t.completed).length} pending</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Milestones</span>
              <Target className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black text-white font-['Space_Grotesk']">{milestones.length}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{milestones.filter(m => m.status !== "completed").length} scheduled</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>{isArtist ? "Asset Vault" : "Brand Kit Vault"}</span>
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-black text-white font-['Space_Grotesk']">{assets.length}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{folders.length} organized folders</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Content</span>
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-black text-white font-['Space_Grotesk']">{contentItems.length}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Queue items</div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS WITH LIVE COUNTS */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
        {isArtist ? (
          <>
            <button
              onClick={() => setActiveSubTab("artist-os")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 min-h-[44px] ${
                activeSubTab === "artist-os"
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <Disc3 className="w-4 h-4 text-red-400" />
              <span>Rollout OS</span>
            </button>

            <button
              onClick={() => setActiveSubTab("pipeline")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 min-h-[44px] ${
                activeSubTab === "pipeline"
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <FolderPlus className="w-4 h-4" />
              <span>Projects ({projects.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("tasks")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 min-h-[44px] ${
                activeSubTab === "tasks"
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tasks ({tasks.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("milestones")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 min-h-[44px] ${
                activeSubTab === "milestones"
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Milestones ({milestones.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("artist-tools")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 min-h-[44px] ${
                activeSubTab === "artist-tools"
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <Sliders className="w-4 h-4 text-red-400" />
              <span>Artist Tools Suite</span>
            </button>

            <button
              onClick={() => setActiveSubTab("assets")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 min-h-[44px] ${
                activeSubTab === "assets"
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Asset Vault ({assets.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("content")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 min-h-[44px] ${
                activeSubTab === "content"
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Content Engine ({contentItems.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("memory")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 min-h-[44px] ${
                activeSubTab === "memory"
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-red-400" />
              <span>Creative Memory & Brain</span>
            </button>

            <button
              onClick={() => setActiveSubTab("activity")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 min-h-[44px] ${
                activeSubTab === "activity"
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Audit Log ({activityLogs.length})</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveSubTab("brand-os")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 min-h-[44px] ${
                activeSubTab === "brand-os"
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Brand OS & Strategy</span>
            </button>

            <button
              onClick={() => setActiveSubTab("pipeline")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 min-h-[44px] ${
                activeSubTab === "pipeline"
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <FolderPlus className="w-4 h-4" />
              <span>Initiatives ({projects.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("tasks")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 min-h-[44px] ${
                activeSubTab === "tasks"
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tasks ({tasks.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("milestones")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 min-h-[44px] ${
                activeSubTab === "milestones"
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Milestones ({milestones.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("campaigns")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 min-h-[44px] ${
                activeSubTab === "campaigns"
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Campaigns ({campaigns.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("assets")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 min-h-[44px] ${
                activeSubTab === "assets"
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Brand Kit Vault ({assets.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("content")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 min-h-[44px] ${
                activeSubTab === "content"
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Content Engine ({contentItems.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("memory")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 min-h-[44px] ${
                activeSubTab === "memory"
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-blue-400" />
              <span>Brand Intelligence</span>
            </button>

            <button
              onClick={() => setActiveSubTab("activity")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 min-h-[44px] ${
                activeSubTab === "activity"
                  ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Audit Log ({activityLogs.length})</span>
            </button>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB: ARTIST OS (Integrated Artist Operating Environment)               */}
      {/* ========================================================================= */}
      {activeSubTab === "artist-os" && (
        <div className="space-y-6">
          <ArtistOS onNavigateTab={handleInternalNavigate} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB: BRAND OS (Integrated Brand Strategy & Execution Environment)      */}
      {/* ========================================================================= */}
      {activeSubTab === "brand-os" && (
        <div className="space-y-6">
          <BrandOS onNotify={onNotify} onNavigateTab={handleInternalNavigate} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB: ARTIST TOOLS SUITE                                                */}
      {/* ========================================================================= */}
      {activeSubTab === "artist-tools" && (
        <div className="space-y-6">
          {/* Sub-navigation for Artist Tools */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                  <Sliders className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Artist Creative Tools Suite
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Embedded production, marketing, and release assets built directly into your Artist Workspace.
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto">
              <button
                onClick={() => setSelectedArtistTool("mastering")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
                  selectedArtistTool === "mastering"
                    ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                Mastering QA
              </button>
              <button
                onClick={() => setSelectedArtistTool("lyrics")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
                  selectedArtistTool === "lyrics"
                    ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                Lyrics Studio
              </button>
              <button
                onClick={() => setSelectedArtistTool("cover")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
                  selectedArtistTool === "cover"
                    ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                Cover Art Studio
              </button>
              <button
                onClick={() => setSelectedArtistTool("dsp")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
                  selectedArtistTool === "dsp"
                    ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                DSP Pitcher
              </button>
              <button
                onClick={() => setSelectedArtistTool("splits")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
                  selectedArtistTool === "splits"
                    ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                Splits Calculator
              </button>
              <button
                onClick={() => setSelectedArtistTool("presave")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
                  selectedArtistTool === "presave"
                    ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                Pre-Save Hub
              </button>
              <button
                onClick={() => setSelectedArtistTool("epk")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
                  selectedArtistTool === "epk"
                    ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                EPK Dossier
              </button>
            </div>
          </div>

          {/* Active Artist Tool Render */}
          <div className="pt-2">
            {selectedArtistTool === "mastering" && <MasteringSuite onNotify={onNotify} />}
            {selectedArtistTool === "lyrics" && <LyricsStudio onNotify={onNotify} />}
            {selectedArtistTool === "cover" && <CoverStudio onNotify={onNotify} />}
            {selectedArtistTool === "dsp" && <DSPPitcher onNotify={onNotify} />}
            {selectedArtistTool === "splits" && <SplitsCalculator onNotify={onNotify} />}
            {selectedArtistTool === "presave" && <PresaveHub onNotify={onNotify} />}
            {selectedArtistTool === "epk" && <EPKBuilder onNotify={onNotify} />}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 0: INTELLIGENT COMMAND CENTER DASHBOARD                           */}
      {/* ========================================================================= */}
      {activeSubTab === "dashboard" && (
        <div className="space-y-6">
          {/* Section 1: WHAT NEEDS ATTENTION (Live Strategic Radar) */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                    <span>What Needs Attention</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-500/20 text-red-300 font-bold">
                      {attentionItems.length} Action Items
                    </span>
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    Real-time workspace bottlenecks, unassigned artwork, imminent deadlines, and legal split reviews.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("project-console")}
                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Project Console</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {attentionItems.length === 0 ? (
              <div className="p-6 text-center bg-zinc-950/40 rounded-xl border border-zinc-800/60">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-zinc-200">Everything is on schedule and up to date!</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">No critical bottlenecks found across your projects or releases.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attentionItems.map((item) => {
                  const severity = (item.severity || item.level || "warning") as "critical" | "warning" | "info";
                  const itemType = (item.type || item.category || "action").toString();
                  const message = item.message || item.description || "";
                  const actionTab = item.actionTab || "workspace-hub";
                  const actionLabel = item.actionLabel || "Resolve in Workstation";

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                        severity === "critical"
                          ? "bg-red-950/30 border-red-500/40 hover:border-red-500"
                          : severity === "warning"
                          ? "bg-amber-950/30 border-amber-500/40 hover:border-amber-500"
                          : "bg-blue-950/30 border-blue-500/40 hover:border-blue-500"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                              severity === "critical"
                                ? "bg-red-500/20 text-red-400"
                                : severity === "warning"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {severity} • {itemType.replace(/_/g, " ")}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white tracking-tight">{item.title}</h4>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">{message}</p>
                      </div>

                      {actionTab && (
                        <div className="mt-3 pt-2.5 border-t border-white/10 flex justify-end">
                          <button
                            onClick={() => setActiveTab(actionTab)}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
                          >
                            <span>{actionLabel}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: CREATIVE RECOMMENDATIONS */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                    <span>Creative Intelligence Recommendations</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 font-bold">
                      {recommendations.length} Strategic Insights
                    </span>
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    Automated tactical suggestions for DSP rollouts, aspect ratio assets, master loudness, and editorial PR.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recommendations.map((rec) => {
                const category = rec.category || (rec.tags && rec.tags[0]) || "Strategy";
                const impact = rec.impact || (rec.tags && rec.tags.length > 1 ? rec.tags[1] : "High Impact");
                const insight = rec.recommendation || rec.insight || rec.benefit || "";
                const targetTab = rec.suggestedWorkstation || rec.actionTab || "workspace-hub";
                const actionLabel = rec.actionLabel || "Launch Workstation";

                return (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 flex flex-col justify-between space-y-3 transition-all"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-zinc-800 text-zinc-300">
                          {category}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono text-emerald-400 font-semibold">
                          Impact: {impact}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white tracking-tight">{rec.title}</h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{insight}</p>
                    </div>

                    <button
                      onClick={() => setActiveTab(targetTab)}
                      className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-red-400 hover:text-red-300 border border-zinc-800 hover:border-red-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[40px]"
                    >
                      <span>{actionLabel}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: 2-COLUMN DASHBOARD (Active Projects + Upcoming Releases) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Active Projects & Pending Tasks (8 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h3 className="text-xs font-bold uppercase text-white font-mono flex items-center gap-2">
                    <FolderPlus className="w-3.5 h-3.5 text-blue-400" />
                    <span>Active Projects Pipeline</span>
                  </h3>
                  <button
                    onClick={() => setActiveSubTab("pipeline")}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold"
                  >
                    View All ({projects.length})
                  </button>
                </div>

                {projects.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500 text-xs">
                    No active projects. Click "New Project" to start one.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(projects || []).slice(0, 3).map((project) => {
                      const completedTasks = project.tasks.filter((t) => t.completed).length;
                      const totalTasks = project.tasks.length;
                      const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                      return (
                        <div
                          key={project.id}
                          className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-zinc-800 text-zinc-300">
                                {project.category}
                              </span>
                              <h4 className="text-xs font-bold text-white truncate max-w-[200px]">
                                {project.title}
                              </h4>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400">
                              Deadline: {project.deadline}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                              <span>Milestones: {completedTasks}/{totalTasks}</span>
                              <span>{progressPct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Task Checklist Widget */}
              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h3 className="text-xs font-bold uppercase text-white font-mono flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Workspace Task Engine</span>
                  </h3>
                  <button
                    onClick={() => setActiveSubTab("tasks")}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold"
                  >
                    Manage All ({tasks.length})
                  </button>
                </div>

                {tasks.length === 0 ? (
                  <div className="p-4 text-center text-zinc-500 text-xs">
                    No open tasks in workspace.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(tasks || []).slice(0, 5).map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => toggleTask(task.id, task.completed)}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-800/80 text-xs transition-colors cursor-pointer min-h-[44px]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {task.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-600 shrink-0" />
                          )}
                          <span className={`truncate ${task.completed ? "line-through text-zinc-500" : "text-zinc-200"}`}>
                            {task.text}
                          </span>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold shrink-0 ${
                            task.priority === "urgent" || task.priority === "high"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Upcoming Releases & Stems (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h3 className="text-xs font-bold uppercase text-white font-mono flex items-center gap-2">
                    <Music className="w-3.5 h-3.5 text-red-400" />
                    <span>Upcoming Releases</span>
                  </h3>
                  <button
                    onClick={() => setActiveSubTab("releases")}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold"
                  >
                    View All ({releases.length})
                  </button>
                </div>

                {releases.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500 text-xs">
                    No release schedules recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(releases || []).slice(0, 2).map((rel) => (
                      <div
                        key={rel.id}
                        className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-start gap-3"
                      >
                        <img
                          src={rel.coverUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"}
                          alt={rel.title}
                          className="w-14 h-14 rounded-lg object-cover border border-zinc-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-mono uppercase bg-emerald-500/20 text-emerald-400 font-bold">
                              {rel.status}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-400">
                              Drop: {rel.releaseDate}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white truncate mt-0.5">{rel.title}</h4>
                          <p className="text-[10px] text-zinc-400 truncate">{rel.artistName} • {rel.genre}</p>

                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => setActiveTab("artist-brain")}
                              className="text-[10px] text-red-400 font-semibold hover:underline"
                            >
                              30-Day Plan
                            </button>
                            <span className="text-zinc-700">•</span>
                            <button
                              onClick={() => setActiveTab("cover-studio")}
                              className="text-[10px] text-zinc-300 font-semibold hover:underline"
                            >
                              Artwork
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Assets Strip */}
              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h3 className="text-xs font-bold uppercase text-white font-mono flex items-center gap-2">
                    <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Recent Assets & Covers</span>
                  </h3>
                  <button
                    onClick={() => setActiveSubTab("assets")}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold"
                  >
                    Vault ({assets.length})
                  </button>
                </div>

                {assets.length === 0 ? (
                  <div className="p-4 text-center text-zinc-500 text-xs">
                    No cloud assets saved.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {(assets || []).slice(0, 3).map((asset) => (
                      <div
                        key={asset.id}
                        className="rounded-lg overflow-hidden border border-zinc-800 relative aspect-square group bg-black"
                      >
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                          <span className="text-[9px] text-white font-bold text-center truncate">
                            {asset.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 1: PROJECT PIPELINE                                                */}
      {/* ========================================================================= */}
      {activeSubTab === "pipeline" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-red-500" />
              <span>Active Production Projects</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNewProjectOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
              <FolderPlus className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-300">No active projects in this workspace yet</p>
              <p className="text-xs text-zinc-500 mt-1">Create a project or generate one in the Project Console</p>
              <button
                onClick={() => setIsNewProjectOpen(true)}
                className="mt-4 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl cursor-pointer min-h-[44px]"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {projects.map((project) => {
                const completedTasks = project.tasks.filter((t) => t.completed).length;
                const totalTasks = project.tasks.length;
                const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                  <div
                    key={project.id}
                    className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              project.priority === "urgent" || project.priority === "high"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-zinc-800 text-zinc-300"
                            }`}
                          >
                            {project.priority} priority
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800/80 text-zinc-400">
                            {project.category}
                          </span>
                        </div>

                        <button
                          onClick={() => deleteProject(project.id)}
                          title="Delete project"
                          className="text-zinc-500 hover:text-red-400 p-1.5 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-white tracking-tight">{project.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{project.description}</p>

                      {/* Progress Bar */}
                      <div className="mt-3.5 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                          <span>Milestones: {completedTasks}/{totalTasks} ({progressPct}%)</span>
                          <span>Deadline: {project.deadline}</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Task Checklist items */}
                      <div className="mt-3.5 space-y-2 max-h-40 overflow-y-auto pr-1">
                        {project.tasks.map((task) => (
                          <button
                            key={task.id}
                            type="button"
                            onClick={async () => {
                              const updatedTasks = project.tasks.map((t) =>
                                t.id === task.id ? { ...t, completed: !t.completed } : t
                              );
                              const allCompleted = updatedTasks.every((t) => t.completed);
                              await updateProject(project.id, {
                                tasks: updatedTasks,
                                status: allCompleted ? "completed" : "in-progress",
                              });
                            }}
                            className="w-full flex items-start gap-2 text-left p-2 rounded-lg bg-zinc-950/40 hover:bg-zinc-950/80 border border-zinc-800/60 text-xs transition-colors cursor-pointer min-h-[44px]"
                          >
                            {task.completed ? (
                              <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                            )}
                            <span className={task.completed ? "line-through text-zinc-500" : "text-zinc-300"}>
                              {task.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-mono">
                        Budget: <strong className="text-zinc-200">${project.budget.toLocaleString()}</strong>
                      </span>
                      <button
                        onClick={() => setActiveTab("project-console")}
                        className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer min-h-[44px] px-2"
                      >
                        <span>Manage in Console</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: WORKSPACE TASK ENGINE                                           */}
      {/* ========================================================================= */}
      {activeSubTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-zinc-800">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Workspace Task Engine</span>
              </h2>
              <p className="text-xs text-zinc-400">Persistent actionable tasks synchronized across your entire workspace.</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter pills */}
              <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setTaskFilterStatus("all")}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                    taskFilterStatus === "all" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button
                  onClick={() => setTaskFilterStatus("open")}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                    taskFilterStatus === "open" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Open ({tasks.filter((t) => !t.completed).length})
                </button>
                <button
                  onClick={() => setTaskFilterStatus("completed")}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                    taskFilterStatus === "completed" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Completed ({tasks.filter((t) => t.completed).length})
                </button>
              </div>

              <button
                onClick={() => setIsNewTaskOpen(true)}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 min-h-[44px] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
              <CheckSquare className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-300">No tasks found matching filter</p>
              <button
                onClick={() => setIsNewTaskOpen(true)}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl min-h-[44px] cursor-pointer"
              >
                Add New Task
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    task.completed
                      ? "bg-zinc-950/40 border-zinc-800/40 opacity-70"
                      : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id, task.completed)}
                      className="cursor-pointer text-zinc-400 hover:text-emerald-400 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                    >
                      {task.completed ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5 text-zinc-500" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <span className={`text-xs sm:text-sm font-medium ${task.completed ? "line-through text-zinc-500" : "text-white"}`}>
                        {task.text}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                        {task.projectTitle && <span>Project: {task.projectTitle}</span>}
                        {task.category && <span>• {task.category}</span>}
                        {task.deadline && <span>• Due: {task.deadline}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                        task.priority === "urgent"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : task.priority === "high"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {task.priority}
                    </span>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-zinc-500 hover:text-red-400 p-1.5 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: VISUAL MILESTONES ROADMAP                                       */}
      {/* ========================================================================= */}
      {activeSubTab === "milestones" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-zinc-800">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                <span>Visual Milestones Roadmap</span>
              </h2>
              <p className="text-xs text-zinc-400">Chronological production deadlines and major deliverable targets.</p>
            </div>

            <button
              onClick={() => setIsNewMilestoneOpen(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 min-h-[44px] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Milestone</span>
            </button>
          </div>

          {milestones.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
              <Target className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-300">No milestones scheduled</p>
              <p className="text-xs text-zinc-500 mt-1">Add production milestones to build out your creative roadmap</p>
              <button
                onClick={() => setIsNewMilestoneOpen(true)}
                className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs rounded-xl min-h-[44px] cursor-pointer"
              >
                Schedule Milestone
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          m.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : m.status === "in_progress"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {(m.status || "planned").toString().replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-amber-400 font-mono font-bold">
                        Target Date: {m.targetDate}
                      </span>
                      {m.projectTitle && (
                        <span className="text-xs text-zinc-400 font-mono">
                          • Project: {m.projectTitle}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white">{m.title}</h3>
                    {m.notes && <p className="text-xs text-zinc-400">{m.notes}</p>}

                    {/* Deliverables checklist */}
                    {m.deliverables && m.deliverables.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {m.deliverables.map((del, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded bg-zinc-950 text-[11px] text-zinc-300 border border-zinc-800"
                          >
                            ✓ {del}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleMilestone(m.id, m.status === "completed")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer min-h-[44px] ${
                        m.status === "completed"
                          ? "bg-zinc-800 text-zinc-400 hover:text-white"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }`}
                    >
                      {m.status === "completed" ? "Mark Pending" : "Mark Achieved"}
                    </button>

                    <button
                      onClick={() => deleteMilestone(m.id)}
                      className="p-2 text-zinc-500 hover:text-red-400 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                      title="Delete milestone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: RELEASES                                                        */}
      {/* ========================================================================= */}
      {activeSubTab === "releases" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-zinc-800">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Music className="w-4 h-4 text-red-500" />
              <span>30-Day Release Blueprints & Rollouts</span>
            </h2>
            <button
              onClick={() => setActiveTab("artist-brain")}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 min-h-[44px] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate Rollout in Brain</span>
            </button>
          </div>

          {releases.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
              <Music className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-300">No scheduled releases recorded yet</p>
              <p className="text-xs text-zinc-500 mt-1">Generate a 30-Day release rollout in the Artist Content Brain</p>
              <button
                onClick={() => setActiveTab("artist-brain")}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl cursor-pointer min-h-[44px]"
              >
                Open Artist Brain
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {releases.map((rel) => (
                <div
                  key={rel.id}
                  className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={rel.coverUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80"}
                      alt={rel.title}
                      className="w-20 h-20 rounded-xl object-cover border border-zinc-700 shadow-md shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {rel.status}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                          {rel.genre}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                          ISRC: {rel.isrc || "NGKDH2600001"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white tracking-tight mt-1">{rel.title}</h3>
                      <p className="text-xs text-zinc-400">By {rel.artistName} • Target Drop: <strong className="text-zinc-200">{rel.releaseDate}</strong></p>
                      
                      {rel.dspPitch?.editorialNote && (
                        <p className="text-xs text-zinc-400 mt-2 line-clamp-1 italic max-w-xl">
                          "{rel.dspPitch.editorialNote}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                    <button
                      onClick={() => setActiveTab("artist-brain")}
                      className="flex-1 md:flex-none px-3.5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[44px]"
                    >
                      30-Day Plan
                    </button>
                    <button
                      onClick={() => setActiveTab("dsp-pitcher")}
                      className="flex-1 md:flex-none px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold border border-zinc-700/60 transition-colors cursor-pointer min-h-[44px]"
                    >
                      DSP Pitch
                    </button>
                    <button
                      onClick={() => setActiveTab("presave-hub")}
                      className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-zinc-700/60 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Pre-Save Hub"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 5: CLOUD ASSET VAULT & FOLDERS                                     */}
      {/* ========================================================================= */}
      {activeSubTab === "assets" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-zinc-800">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-500" />
                <span>Cloud Asset Vault & Directory</span>
              </h2>
              <p className="text-xs text-zinc-400">Organize high-res 3000px artwork, master audio stems, and promo video kits into folders.</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsNewFolderOpen(true)}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700/60 flex items-center gap-1.5 min-h-[44px] cursor-pointer"
              >
                <FolderIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>New Folder</span>
              </button>

              <button
                onClick={() => setIsUploadAssetOpen(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 min-h-[44px] cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Asset</span>
              </button>

              <button
                onClick={() => setActiveTab("cover-studio")}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 min-h-[44px] cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Cover Studio</span>
              </button>
            </div>
          </div>

          {/* Folder Pills Directory */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedFolderId("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 transition-colors cursor-pointer min-h-[38px] ${
                selectedFolderId === "all"
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              All Assets ({assets.length})
            </button>

            {folders.map((f) => {
              const count = assets.filter((a) => a.folderId === f.id).length;
              const isSelected = selectedFolderId === f.id;
              return (
                <div key={f.id} className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setSelectedFolderId(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[38px] ${
                      isSelected
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: f.color || "#10B981" }}
                    />
                    <span>{f.name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">({count})</span>
                  </button>
                  <button
                    onClick={() => deleteFolder(f.id)}
                    className="text-zinc-600 hover:text-red-400 p-1 cursor-pointer"
                    title="Delete folder"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {filteredAssets.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
              <HardDrive className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-300">No assets stored in this folder</p>
              <p className="text-xs text-zinc-500 mt-1">Upload an asset or generate artwork in Cover Studio</p>
              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={() => setIsUploadAssetOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl min-h-[44px] cursor-pointer"
                >
                  Upload File
                </button>
                <button
                  onClick={() => setActiveTab("cover-studio")}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl min-h-[44px] cursor-pointer"
                >
                  Launch Cover Studio
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    <div className="aspect-square w-full rounded-xl bg-zinc-950 overflow-hidden relative border border-zinc-800 mb-2.5">
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-black/80 text-zinc-200 backdrop-blur-xs">
                        {asset.category}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white tracking-tight truncate">{asset.name}</h4>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-1">
                      <span>{asset.dimensions || "3000x3000"}</span>
                      <span>{(asset.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
                    <a
                      href={asset.url}
                      download={asset.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-zinc-400 hover:text-white font-semibold flex items-center gap-1 cursor-pointer min-h-[44px] px-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                    <button
                      onClick={() => deleteAsset(asset.id)}
                      className="text-zinc-500 hover:text-red-400 p-1.5 cursor-pointer transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 6: CAMPAIGNS                                                       */}
      {/* ========================================================================= */}
      {activeSubTab === "campaigns" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-purple-400" />
                <span>Marketing & Media Campaigns</span>
              </h2>
              <p className="text-xs text-zinc-400">Sprint budgets, target demographics, and connected content distribution.</p>
            </div>
            <button
              onClick={() => setActiveTab("brand-os")}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 min-h-[44px] cursor-pointer"
            >
              <span>Build in Brand OS</span>
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
              <Megaphone className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-300">No campaigns launched</p>
              <p className="text-xs text-zinc-500 mt-1">Design marketing campaigns and sprint budgets in Brand OS or Creator OS</p>
              <button
                onClick={() => setActiveTab("brand-os")}
                className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl min-h-[44px] cursor-pointer"
              >
                Launch Brand OS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map((camp) => (
                <div key={camp.id} className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/20 text-purple-400">
                      {camp.status}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">Budget: ${camp.budget?.toLocaleString() || "0"}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{camp.name}</h3>
                  <p className="text-xs text-zinc-400">{camp.objective}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 7: CONTENT QUEUE & ENGINE                                          */}
      {/* ========================================================================= */}
      {activeSubTab === "content" && (
        <div className="space-y-6">
          <ContentEngine />

          <div className="pt-6 border-t border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>Programmed Content Queue</span>
              </h2>
              <button
                onClick={() => {
                  openBrainWithContext(`Generate a high-converting 30-day content calendar for ${workspace?.name || "this workspace"}`);
                }}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 min-h-[44px] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Generate 30-Day Calendar</span>
              </button>
            </div>

            {contentItems.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
                <Calendar className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-zinc-300">No scheduled content pieces in queue</p>
                <p className="text-xs text-zinc-500 mt-1">Commit rollout items from the Content Engine or Creative Brain</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contentItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {item.platform}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                          {item.contentType}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">Date: {item.scheduledDate || "T-10"}</span>
                      </div>

                      <h4 className="text-sm font-bold text-white tracking-tight">{item.title}</h4>
                      <p className="text-xs text-zinc-300 font-medium">"{item.captionHook}"</p>
                      <p className="text-[11px] text-zinc-500">{item.concept}</p>
                    </div>

                    <button
                      onClick={() => deleteContentItem(item.id)}
                      className="text-zinc-500 hover:text-red-400 p-1.5 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 8: CREATIVE MEMORY & CODIFICATION                                  */}
      {/* ========================================================================= */}
      {activeSubTab === "memory" && (
        <div className="space-y-6">
          <CreativeMemoryDashboard onNotify={onNotify} onNavigateTab={handleInternalNavigate} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 9: AUDIT LOGS & EVENT STREAM                                       */}
      {/* ========================================================================= */}
      {activeSubTab === "activity" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Workspace Audit Trail & Event Stream</span>
              </h2>
              <p className="text-xs text-zinc-400">Immutable ledger tracking workspace updates, assets, and project milestones.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            {activityLogs.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">No recent activity recorded.</p>
            ) : (
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between gap-4 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-zinc-800 text-red-400 shrink-0">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{log.action}</div>
                        <div className="text-zinc-400 mt-0.5">{log.details}</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-1">
                          By {log.userEmail} • Entity: {log.entityType} ({log.entityId})
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
