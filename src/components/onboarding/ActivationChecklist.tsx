import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Zap,
} from "lucide-react";
import { ActiveTab, Workspace, ActivationChecklistItem } from "../../types";
import { useAuth } from "../../context/AuthContext";

interface ActivationChecklistProps {
  onNavigateTab: (tab: ActiveTab) => void;
  workspace: Workspace | null;
  releasesCount?: number;
  campaignsCount?: number;
  assetsCount?: number;
  contentCount?: number;
  hasMemory?: boolean;
}

export const ActivationChecklist: React.FC<ActivationChecklistProps> = ({
  onNavigateTab,
  workspace,
  releasesCount = 0,
  campaignsCount = 0,
  assetsCount = 0,
  contentCount = 0,
}) => {
  const { openOnboarding } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!workspace || isDismissed) return null;

  const identity = workspace.identityType || "artist";

  // Build identity-specific activation tasks
  const getTasksForIdentity = (): ActivationChecklistItem[] => {
    switch (identity) {
      case "artist":
        return [
          {
            id: "release-blueprint",
            label: "Create Master Release Blueprint",
            description: "Define song title, genre, audio LUFS specs & drop date",
            completed: releasesCount > 0,
            actionTab: "artist-os",
            actionLabel: "Open Artist OS",
            category: "core",
          },
          {
            id: "cover-art",
            label: "Generate 3000x3000px Cover Artwork",
            description: "Design compliant single/album artwork in Cover Studio",
            completed: assetsCount > 0,
            actionTab: "cover-studio",
            actionLabel: "Launch Cover Studio",
            category: "assets",
          },
          {
            id: "dsp-pitch",
            label: "Draft DSP Editorial Pitch",
            description: "Write playlist rationale targeting Spotify editorial curators",
            completed: Boolean(releasesCount > 0),
            actionTab: "dsp-pitcher",
            actionLabel: "Open DSP Pitcher",
            category: "launch",
          },
          {
            id: "content-schedule",
            label: "Schedule 3 Teaser Drops",
            description: "Seed 15-second chorus hooks into Content Engine",
            completed: contentCount >= 3,
            actionTab: "artist-brain",
            actionLabel: "Content Engine",
            category: "content",
          },
          {
            id: "split-sheets",
            label: "Lock Master & Publishing Splits",
            description: "Define producer & co-writer percentages in Splits Calculator",
            completed: false,
            actionTab: "splits-calculator",
            actionLabel: "Splits Calculator",
            category: "intelligence",
          },
        ];

      case "brand":
        return [
          {
            id: "brand-core",
            label: "Set Brand Core & Voice",
            description: "Define positioning statement, target ICP and aesthetic rules",
            completed: true,
            actionTab: "brand-os",
            actionLabel: "Open Brand OS",
            category: "core",
          },
          {
            id: "campaign-sprint",
            label: "Launch Collection / Product Campaign",
            description: "Setup milestone timeline, deliverable goals and budget",
            completed: campaignsCount > 0,
            actionTab: "brand-os",
            actionLabel: "Campaign OS",
            category: "launch",
          },
          {
            id: "brand-assets",
            label: "Upload Brand Kit & Visuals",
            description: "Store logos, product mockups and lifestyle photography",
            completed: assetsCount > 0,
            actionTab: "resource-vault",
            actionLabel: "Asset Vault",
            category: "assets",
          },
          {
            id: "content-pillars",
            label: "Schedule Multi-Channel Sprint",
            description: "Distribute customer proof, manifesto clips and UGC",
            completed: contentCount >= 3,
            actionTab: "artist-brain",
            actionLabel: "Content Calendar",
            category: "content",
          },
        ];

      case "creator":
        return [
          {
            id: "signature-series",
            label: "Initialize Signature Content Series",
            description: "Define your core format, production cadence and series hook",
            completed: true,
            actionTab: "creator-os",
            actionLabel: "Creator OS",
            category: "core",
          },
          {
            id: "content-pipeline",
            label: "Plan 5 Short-Form Hooks",
            description: "Draft viral scripts & retention loops in Content Engine",
            completed: contentCount >= 5,
            actionTab: "artist-brain",
            actionLabel: "Content Engine",
            category: "content",
          },
          {
            id: "asset-library",
            label: "Organize B-Roll & Brand Kit",
            description: "Centralize thumbnails, sound effects and visual assets",
            completed: assetsCount > 0,
            actionTab: "resource-vault",
            actionLabel: "Asset Vault",
            category: "assets",
          },
          {
            id: "creative-radar",
            label: "Scan Cultural & Niche Trends",
            description: "Analyze trending audio, formats and audience sentiment",
            completed: false,
            actionTab: "creative-radar",
            actionLabel: "Creative Radar",
            category: "intelligence",
          },
        ];

      case "startup":
      case "business":
      default:
        return [
          {
            id: "product-offer",
            label: "Configure Flagship Solution / Retainer",
            description: "Define value proposition, pricing tiers and ICP deliverables",
            completed: true,
            actionTab: "brand-os",
            actionLabel: "Brand Core",
            category: "core",
          },
          {
            id: "growth-campaign",
            label: "Launch Growth & Inbound Sprint",
            description: "Structure lead generation or beta onboarding milestones",
            completed: campaignsCount > 0,
            actionTab: "brand-os",
            actionLabel: "Campaign OS",
            category: "launch",
          },
          {
            id: "thought-leadership",
            label: "Schedule Authority Content",
            description: "Post product breakdown, case study or insight carousel",
            completed: contentCount > 0,
            actionTab: "artist-brain",
            actionLabel: "Content Engine",
            category: "content",
          },
          {
            id: "sales-assets",
            label: "Upload Deck & Brand Assets",
            description: "Centralize one-pagers, logo assets and media collateral",
            completed: assetsCount > 0,
            actionTab: "resource-vault",
            actionLabel: "Asset Vault",
            category: "assets",
          },
        ];
    }
  };

  const tasks = getTasksForIdentity();
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div
      id="activation-checklist-card"
      className="bg-zinc-900/70 border border-zinc-800/90 rounded-xl overflow-hidden transition-all duration-200"
    >
      {/* Header Bar */}
      <div className="px-4 py-3.5 flex items-center justify-between bg-zinc-900/90 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-100">Activation Roadmap</span>
              <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-medium">
                {progressPercent}% Complete
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              {completedCount} of {totalCount} foundational milestones achieved
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => openOnboarding({ defaultIdentity: identity, existingWorkspaceId: workspace.id })}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 px-2.5 py-1 rounded-lg hover:bg-zinc-800 transition-colors hidden sm:inline-flex items-center gap-1"
            title="Reconfigure OS Settings"
          >
            <Sparkles className="h-3 w-3 text-orange-400" /> Re-run Setup
          </button>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
            aria-label={isCollapsed ? "Expand Checklist" : "Collapse Checklist"}
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
            aria-label="Dismiss Checklist"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar Line */}
      <div className="w-full bg-zinc-950 h-1">
        <div
          className="bg-gradient-to-r from-red-500 to-orange-500 h-1 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Checklist Items */}
      {!isCollapsed && (
        <div className="p-3 sm:p-4 space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-2.5 sm:p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                task.completed
                  ? "bg-zinc-950/40 border-zinc-800/50 text-zinc-400"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-200 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {task.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Circle className="h-4 w-4 text-zinc-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <div
                    className={`text-xs font-semibold truncate ${
                      task.completed ? "line-through text-zinc-500" : "text-zinc-100"
                    }`}
                  >
                    {task.label}
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">{task.description}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTab(task.actionTab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1 transition-colors ${
                  task.completed
                    ? "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200"
                    : "bg-red-600/90 hover:bg-red-500 text-white shadow-sm shadow-red-600/20"
                }`}
              >
                {task.actionLabel}
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
