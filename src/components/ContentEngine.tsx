import React, { useState } from "react";
import {
  ContentItem,
  ContentPlatform,
  ContentStatus,
  ContentPillar,
  Release,
  Campaign,
} from "../types";
import { useWorkspace } from "../context/WorkspaceContext";
import { ContentPipeline } from "./content/ContentPipeline";
import { ContentCalendar } from "./content/ContentCalendar";
import { GapRadar } from "./content/GapRadar";
import { ContentPillarsManager } from "./content/ContentPillarsManager";
import { ContentItemEditorModal } from "./content/ContentItemEditorModal";
import { BatchStrategyGeneratorModal } from "./content/BatchStrategyGeneratorModal";
import {
  Sparkles,
  Plus,
  Calendar,
  Layers,
  Radar,
  Kanban,
  FileText,
  Zap,
  Disc3,
  Target,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

type ContentEngineTab = "pipeline" | "calendar" | "gap-radar" | "pillars" | "drafts";

export const ContentEngine: React.FC = () => {
  const {
    contentItems,
    contentGaps,
    qualityIssues,
    releases,
    campaigns,
    contentPillars,
    createContentItem,
    updateContentItem,
    deleteContentItem,
    duplicateContentItem,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<ContentEngineTab>("pipeline");
  const [editorItem, setEditorItem] = useState<Partial<ContentItem> | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorInitialDate, setEditorInitialDate] = useState<string | undefined>(undefined);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchGoal, setBatchGoal] = useState<string | undefined>(undefined);
  const [batchReleaseId, setBatchReleaseId] = useState<string | undefined>(undefined);
  const [batchCampaignId, setBatchCampaignId] = useState<string | undefined>(undefined);

  const handleOpenCreate = (statusOrDraft?: Partial<ContentItem> | null, initialDate?: string) => {
    setEditorItem(statusOrDraft || null);
    setEditorInitialDate(initialDate);
    setIsEditorOpen(true);
  };

  const handleOpenBatchGenerator = (goal?: string, relId?: string, campId?: string) => {
    setBatchGoal(goal);
    setBatchReleaseId(relId);
    setBatchCampaignId(campId);
    setIsBatchModalOpen(true);
  };

  const handleSaveItem = async (itemData: Partial<ContentItem>) => {
    if (editorItem?.id) {
      await updateContentItem(editorItem.id, itemData);
    } else {
      await createContentItem(itemData);
    }
  };

  const handleDuplicate = async (itemId: string) => {
    await duplicateContentItem(itemId);
  };

  const scheduledCount = contentItems.filter((i) => i.status === "scheduled").length;
  const publishedCount = contentItems.filter((i) => i.status === "published").length;
  const ideasCount = contentItems.filter((i) => i.status === "idea" || i.status === "draft").length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner / Command Center Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-600/20 text-red-400 border border-red-500/30">
              PHASE 6 • CONTENT OPERATING SYSTEM
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              {contentItems.length} Content Entities
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-100">
            Content Engine & Distribution Hub
          </h1>
          <p className="text-xs text-neutral-400 max-w-2xl">
            Strategic editorial planning anchored directly to active releases, marketing campaigns, and vault assets.
          </p>
        </div>

        {/* Global Stats + Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Metrics */}
          <div className="hidden sm:flex items-center gap-4 px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono">
            <div>
              <span className="text-neutral-500 block text-[10px]">SCHEDULED</span>
              <span className="text-emerald-400 font-bold">{scheduledCount}</span>
            </div>
            <div className="w-px h-6 bg-neutral-800" />
            <div>
              <span className="text-neutral-500 block text-[10px]">DRAFTS</span>
              <span className="text-amber-400 font-bold">{ideasCount}</span>
            </div>
            <div className="w-px h-6 bg-neutral-800" />
            <div>
              <span className="text-neutral-500 block text-[10px]">GAPS</span>
              <span className="text-red-400 font-bold">{contentGaps.length}</span>
            </div>
          </div>

          <button
            onClick={() => handleOpenBatchGenerator()}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Strategy Batch</span>
          </button>

          <button
            onClick={() => handleOpenCreate()}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-950/50 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Content</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("pipeline")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "pipeline"
              ? "bg-red-600/10 text-red-400 border border-red-500/30"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
          }`}
        >
          <Kanban className="w-3.5 h-3.5" />
          <span>Workflow Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab("calendar")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "calendar"
              ? "bg-red-600/10 text-red-400 border border-red-500/30"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Content Calendar & Drops</span>
        </button>

        <button
          onClick={() => setActiveTab("gap-radar")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "gap-radar"
              ? "bg-red-600/10 text-red-400 border border-red-500/30"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
          }`}
        >
          <Radar className="w-3.5 h-3.5" />
          <span>Gap Radar & Audits</span>
          {contentGaps.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-red-600 text-white">
              {contentGaps.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("pillars")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "pillars"
              ? "bg-red-600/10 text-red-400 border border-red-500/30"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Content Pillars & Ratios</span>
        </button>
      </div>

      {/* Tab Content Rendering */}
      <div>
        {activeTab === "pipeline" && (
          <ContentPipeline
            onOpenItemEditor={handleOpenCreate}
            onDuplicateItem={handleDuplicate}
            onDeleteItem={deleteContentItem}
          />
        )}

        {activeTab === "calendar" && (
          <ContentCalendar onOpenItemEditor={handleOpenCreate} />
        )}

        {activeTab === "gap-radar" && (
          <GapRadar
            onOpenItemEditorWithDraft={(draft) => handleOpenCreate(draft)}
            onOpenBatchGenerator={handleOpenBatchGenerator}
          />
        )}

        {activeTab === "pillars" && <ContentPillarsManager />}
      </div>

      {/* Item Editor Modal */}
      <ContentItemEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        item={editorItem}
        onSave={handleSaveItem}
        onDelete={deleteContentItem}
        onDuplicate={handleDuplicate}
        initialDate={editorInitialDate}
      />

      {/* Batch Strategy Generator Modal */}
      <BatchStrategyGeneratorModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        initialGoal={batchGoal}
        initialReleaseId={batchReleaseId}
        initialCampaignId={batchCampaignId}
      />
    </div>
  );
};
