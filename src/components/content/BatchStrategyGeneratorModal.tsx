import React, { useState } from "react";
import {
  ContentItem,
  ContentPlatform,
  Release,
  Campaign,
  ProductService,
} from "../../types";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  X,
  Sparkles,
  Zap,
  Disc3,
  Target,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Copy,
  Plus,
} from "lucide-react";

interface BatchStrategyGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGoal?: string;
  initialReleaseId?: string;
  initialCampaignId?: string;
}

const STRATEGY_PRESETS = [
  {
    id: "pre-release",
    label: "Pre-Release Teaser Sprint",
    stage: "pre-release",
    description: "Build anticipation, sound bite teasers, and pre-save velocity",
  },
  {
    id: "launch-day",
    label: "Release Launch Velocity Blast",
    stage: "launch",
    description: "High-impact announcement, master audio reels, and DSP stream links",
  },
  {
    id: "post-release",
    label: "Post-Release Longevity & BTS",
    stage: "post-release",
    description: "Lyric breakdowns, studio memories, fan response, and community hooks",
  },
  {
    id: "campaign-sprint",
    label: "Omni-Channel Campaign Sprint",
    stage: "sprint",
    description: "Structured multi-platform campaign push anchored to brand goals",
  },
  {
    id: "custom",
    label: "Custom Strategic Goal",
    stage: "evergreen",
    description: "Define a tailored creative angle or milestone target",
  },
];

export const BatchStrategyGeneratorModal: React.FC<BatchStrategyGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialGoal,
  initialReleaseId,
  initialCampaignId,
}) => {
  const {
    releases,
    campaigns,
    products,
    generateOpportunityBatch,
    createContentItemBatch,
  } = useWorkspace();

  const [selectedPreset, setSelectedPreset] = useState("pre-release");
  const [releaseId, setReleaseId] = useState(initialReleaseId || releases[0]?.id || "");
  const [campaignId, setCampaignId] = useState(initialCampaignId || campaigns[0]?.id || "");
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [platform, setPlatform] = useState<string>("all");
  const [count, setCount] = useState<number>(4);
  const [customGoal, setCustomGoal] = useState(initialGoal || "");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuggestions, setGeneratedSuggestions] = useState<Partial<ContentItem>[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isInserting, setIsInserting] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const presetObj = STRATEGY_PRESETS.find((p) => p.id === selectedPreset);
      const suggestions = await generateOpportunityBatch({
        stage: presetObj?.stage || "pre-release",
        releaseId: releaseId || undefined,
        campaignId: campaignId || undefined,
        productId: productId || undefined,
        platform: platform !== "all" ? platform : undefined,
        count,
        customGoal: selectedPreset === "custom" ? customGoal : undefined,
      });

      setGeneratedSuggestions(suggestions);
      setSelectedIndices(suggestions.map((_, i) => i)); // all checked by default
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSelect = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleBatchInsert = async () => {
    const itemsToInsert = generatedSuggestions.filter((_, i) => selectedIndices.includes(i));
    if (itemsToInsert.length === 0) return;

    setIsInserting(true);
    try {
      await createContentItemBatch(itemsToInsert);
      onClose();
    } finally {
      setIsInserting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">
                Strategic Content Batch Generator
              </h2>
              <p className="text-xs text-neutral-400">
                AI-driven strategy synchronized with real releases, campaigns, and vault assets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Strategy Presets */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2.5">
              Select Strategy Objective
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {STRATEGY_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPreset === preset.id
                      ? "bg-red-950/30 border-red-500/60 shadow-md shadow-red-950/20"
                      : "bg-neutral-900/40 border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <h4 className="text-xs font-bold text-neutral-100">{preset.label}</h4>
                  <p className="text-[11px] text-neutral-400 mt-1">{preset.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Context Linking Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
            {/* Release Link */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Disc3 className="w-3.5 h-3.5 text-red-400" />
                Target Release
              </label>
              <select
                value={releaseId}
                onChange={(e) => setReleaseId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-red-500"
              >
                <option value="">-- Optional / None --</option>
                {releases.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Campaign Link */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                Target Campaign
              </label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-red-500"
              >
                <option value="">-- Optional / None --</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Count & Platform */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Batch Size
                </label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-red-500 font-mono"
                >
                  <option value={3}>3 Pieces</option>
                  <option value={5}>5 Pieces</option>
                  <option value={8}>8 Pieces</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-red-500"
                >
                  <option value="all">All Multi-Channel</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="x">X / Twitter</option>
                </select>
              </div>
            </div>
          </div>

          {/* Custom Goal Input if Custom selected */}
          {selectedPreset === "custom" && (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Custom Strategic Objective / Directive
              </label>
              <textarea
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="e.g. Generate 5 TikTok sounds highlighting the African talking drums for diaspora dance challenges"
                rows={2}
                className="w-full px-4 py-2 text-xs rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-red-500"
              />
            </div>
          )}

          {/* Generate Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-red-950/50 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Synthesizing Strategic Batch..." : "Generate Batch Preview"}</span>
            </button>
          </div>

          {/* Generated Candidates Inspection */}
          {generatedSuggestions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                  Generated Strategic Candidates ({generatedSuggestions.length})
                </h3>
                <span className="text-xs text-neutral-400 font-mono">
                  {selectedIndices.length} of {generatedSuggestions.length} selected
                </span>
              </div>

              <div className="space-y-3">
                {generatedSuggestions.map((item, idx) => {
                  const isSelected = selectedIndices.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleSelect(idx)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2.5 ${
                        isSelected
                          ? "bg-neutral-900/90 border-red-500/50 shadow-md"
                          : "bg-neutral-950/50 border-neutral-800 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(idx)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                          />
                          <div>
                            <span className="text-[10px] font-mono uppercase text-red-400 font-bold">
                              {item.platform} • {item.contentType}
                            </span>
                            <h4 className="text-xs font-bold text-neutral-100">{item.title}</h4>
                          </div>
                        </div>

                        {item.contentPillar && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-neutral-800 text-neutral-300">
                            {item.contentPillar}
                          </span>
                        )}
                      </div>

                      {/* Hook & Copy Preview */}
                      <div className="text-xs text-neutral-300 space-y-1.5 pl-7">
                        {item.hook && (
                          <p className="text-red-300/90 italic font-serif text-[11px] bg-red-950/30 p-2 rounded-lg border border-red-900/30">
                            <strong>Hook:</strong> "{item.hook}"
                          </p>
                        )}
                        <p className="text-[11px] text-neutral-400 line-clamp-2">{item.copy || item.captionHook}</p>
                        {item.cta && (
                          <p className="text-[10px] text-amber-300 font-mono">
                            <strong>CTA:</strong> {item.cta}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-900/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleBatchInsert}
            disabled={isInserting || selectedIndices.length === 0}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white shadow-lg shadow-red-950/50 flex items-center gap-2 transition-all cursor-pointer"
          >
            {isInserting
              ? "Inserting Batch..."
              : `Add Selected (${selectedIndices.length}) to Pipeline`}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
