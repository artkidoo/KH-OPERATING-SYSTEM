import React, { useState, useEffect, useMemo } from "react";
import {
  ContentItem,
  ContentPlatform,
  ContentStatus,
  ContentPillar,
  Release,
  Campaign,
  ProductService,
  Asset,
} from "../../types";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  Layers,
  Disc3,
  Target,
  ShoppingBag,
  Image as ImageIcon,
  Copy,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Volume2,
  ArrowRight,
  Plus,
  Share2,
  Check,
  Zap,
} from "lucide-react";

interface ContentItemEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Partial<ContentItem> | null;
  onSave: (itemData: Partial<ContentItem>) => Promise<void>;
  onDelete?: (itemId: string) => Promise<void>;
  onDuplicate?: (itemId: string) => Promise<void>;
  initialDate?: string;
}

const PLATFORM_OPTIONS: { id: ContentPlatform; label: string; icon: string; color: string }[] = [
  { id: "tiktok", label: "TikTok", icon: "🎵", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  { id: "instagram", label: "Instagram", icon: "📸", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { id: "youtube", label: "YouTube", icon: "▶️", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { id: "x", label: "X / Twitter", icon: "🐦", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  { id: "linkedin", label: "LinkedIn", icon: "💼", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { id: "threads", label: "Threads", icon: "🧵", color: "bg-neutral-500/20 text-neutral-300 border-neutral-500/30" },
  { id: "spotify", label: "Spotify Canvas", icon: "🟢", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { id: "blog", label: "Newsletter / Blog", icon: "📰", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
];

const CONTENT_TYPES = [
  "Short-Form Video (Reel/TikTok/Short)",
  "Behind the Scenes Clip",
  "Sound Bite / Master Audio Snippet",
  "Carousel Breakdown",
  "Story / Quick Update",
  "Editorial Thread / Text Post",
  "Product Showcase / Demo",
  "Lyric & Visualizer Clip",
  "Spotify Canvas Loop",
  "Announcement / Press Drop",
];

const STATUS_OPTIONS: { id: ContentStatus; label: string; color: string }[] = [
  { id: "idea", label: "Idea", color: "bg-neutral-800 text-neutral-300 border-neutral-700" },
  { id: "draft", label: "Draft", color: "bg-amber-950/40 text-amber-300 border-amber-800/50" },
  { id: "review", label: "In Review", color: "bg-blue-950/40 text-blue-300 border-blue-800/50" },
  { id: "approved", label: "Approved", color: "bg-indigo-950/40 text-indigo-300 border-indigo-800/50" },
  { id: "scheduled", label: "Scheduled", color: "bg-emerald-950/40 text-emerald-300 border-emerald-800/50" },
  { id: "published", label: "Published", color: "bg-cyan-950/40 text-cyan-300 border-cyan-800/50" },
  { id: "archived", label: "Archived", color: "bg-neutral-900 text-neutral-400 border-neutral-800" },
];

export const ContentItemEditorModal: React.FC<ContentItemEditorModalProps> = ({
  isOpen,
  onClose,
  item,
  onSave,
  onDelete,
  onDuplicate,
  initialDate,
}) => {
  const { releases, campaigns, products, assets, contentPillars } = useWorkspace();

  const [title, setTitle] = useState("");
  const [concept, setConcept] = useState("");
  const [hook, setHook] = useState("");
  const [copy, setCopy] = useState("");
  const [cta, setCta] = useState("");
  const [platform, setPlatform] = useState<ContentPlatform>("tiktok");
  const [contentType, setContentType] = useState("Short-Form Video (Reel/TikTok/Short)");
  const [contentPillar, setContentPillar] = useState("");
  const [status, setStatus] = useState<ContentStatus>("draft");
  const [priority, setPriority] = useState<"CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [releaseId, setReleaseId] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [productId, setProductId] = useState("");
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [soundSnippet, setSoundSnippet] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setTitle(item.title || "");
        setConcept(item.concept || "");
        setHook(item.hook || item.captionHook || "");
        setCopy(item.copy || item.caption || item.captionHook || "");
        setCta(item.cta || "");
        setPlatform(item.platform || "tiktok");
        setContentType(item.contentType || "Short-Form Video (Reel/TikTok/Short)");
        setContentPillar(item.contentPillar || (contentPillars[0]?.name || ""));
        setStatus(item.status || "draft");
        setPriority(item.priority || "MEDIUM");
        setReleaseId(item.releaseId || "");
        setCampaignId(item.campaignId || "");
        setProductId(item.productId || "");
        setSelectedAssetIds(item.assetIds || (item.assetId ? [item.assetId] : []));
        setScheduledDate(item.scheduledDate || initialDate || "");
        setScheduledTime(item.scheduledTime || "12:00");
        setSoundSnippet(item.soundSnippet || "");
        setNotes(item.notes || "");
      } else {
        setTitle("");
        setConcept("");
        setHook("");
        setCopy("");
        setCta("");
        setPlatform("tiktok");
        setContentType("Short-Form Video (Reel/TikTok/Short)");
        setContentPillar(contentPillars[0]?.name || "");
        setStatus("draft");
        setPriority("MEDIUM");
        setReleaseId(releases[0]?.id || "");
        setCampaignId(campaigns[0]?.id || "");
        setProductId("");
        setSelectedAssetIds([]);
        setScheduledDate(initialDate || new Date().toISOString().split("T")[0]);
        setScheduledTime("12:00");
        setSoundSnippet("");
        setNotes("");
      }
    }
  }, [isOpen, item, initialDate, contentPillars, releases, campaigns]);

  // Quality Audit Calculation
  const qualityAudit = useMemo(() => {
    const issues: { message: string; severity: "warning" | "suggestion" }[] = [];
    let score = 100;

    if (!hook || hook.trim().length < 5) {
      issues.push({ message: "Missing or weak Hook (first 3-second attention grabber)", severity: "warning" });
      score -= 25;
    }
    if (!cta || cta.trim().length < 3) {
      issues.push({ message: "No explicit Call to Action (e.g., stream link, pre-save, join waitlist)", severity: "suggestion" });
      score -= 15;
    }
    if (!releaseId && !campaignId && !productId) {
      issues.push({ message: "Not linked to any Release, Campaign, or Product/Service", severity: "warning" });
      score -= 25;
    }
    if (["tiktok", "instagram", "youtube"].includes(platform) && selectedAssetIds.length === 0) {
      issues.push({ message: "No visual/audio asset attached from Vault for visual platform", severity: "suggestion" });
      score -= 15;
    }
    if (status === "scheduled" && !scheduledDate) {
      issues.push({ message: "Status set to Scheduled but no Date specified", severity: "warning" });
      score -= 20;
    }

    return {
      score: Math.max(10, score),
      issues,
    };
  }, [hook, cta, releaseId, campaignId, productId, platform, selectedAssetIds, status, scheduledDate]);

  if (!isOpen) return null;

  const handleToggleAsset = (assetId: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const selectedRelease = releases.find((r) => r.id === releaseId);
      const selectedCampaign = campaigns.find((c) => c.id === campaignId);
      const selectedProduct = products.find((p) => p.id === productId);

      const payload: Partial<ContentItem> = {
        title: title.trim(),
        concept: concept.trim(),
        hook: hook.trim(),
        captionHook: hook.trim(),
        copy: copy.trim(),
        caption: copy.trim(),
        cta: cta.trim(),
        platform,
        contentType,
        contentPillar: contentPillar.trim(),
        status,
        priority,
        releaseId: releaseId || undefined,
        releaseTitle: selectedRelease?.title,
        campaignId: campaignId || undefined,
        campaignTitle: selectedCampaign?.title,
        productId: productId || undefined,
        productName: selectedProduct?.name,
        assetIds: selectedAssetIds,
        assetId: selectedAssetIds[0] || undefined,
        scheduledDate: scheduledDate || undefined,
        scheduledTime: scheduledTime || undefined,
        soundSnippet: soundSnippet.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      await onSave(payload);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/80 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">
                {item?.id ? "Edit Content Piece" : "Create Operating Content Piece"}
              </h2>
              <p className="text-xs text-neutral-400">
                Craft contextual, goal-driven content anchored to releases, campaigns, and vault assets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {item?.id && onDuplicate && (
              <button
                type="button"
                onClick={() => onDuplicate(item.id!)}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1.5 transition-colors border border-neutral-700/50"
                title="Duplicate Item"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Duplicate</span>
              </button>
            )}

            {item?.id && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this content item?")) {
                    onDelete(item.id!);
                    onClose();
                  }
                }}
                className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs flex items-center gap-1.5 transition-colors border border-red-900/50"
                title="Delete Item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Form Scrollable */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Metadata Row: Platform, Content Type, Pillar, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80">
            {/* Platform */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Target Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as ContentPlatform)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-red-500"
              >
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Format / Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-red-500"
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Content Pillar */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Content Pillar
              </label>
              <select
                value={contentPillar}
                onChange={(e) => setContentPillar(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-red-500"
              >
                <option value="">-- Select Pillar --</option>
                {contentPillars.map((pillar) => (
                  <option key={pillar.id} value={pillar.name}>
                    {pillar.name} ({pillar.targetRatio || 25}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Workflow Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-red-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title & Concept */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Content Title / Working Label *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Studio Vocal Session Teaser with Producer Stems"
                required
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-red-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Angle / Concept / Strategy
              </label>
              <textarea
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="What is the strategic narrative of this post? (e.g. Highlight the raw African drum transitions right before chorus 2 to establish sound signature)"
                rows={2}
                className="w-full px-4 py-2 text-xs rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Hook, Caption & CTA Block */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  The Hook (First 3 Seconds / Opening Line)
                </label>
                <span className="text-[10px] text-neutral-400">Crucial for retention</span>
              </div>
              <input
                type="text"
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                placeholder="e.g. 'We almost scrapped this bassline until 3 AM in Lagos...'"
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-neutral-950 border border-red-500/30 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-red-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Full Copy / Body Caption
              </label>
              <textarea
                value={copy}
                onChange={(e) => setCopy(e.target.value)}
                placeholder="Write the full post caption, story breakdown, or body copy..."
                rows={4}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-red-500 font-mono text-[11px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Call to Action (CTA)
                </label>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="e.g. 'Pre-save the link in bio to unlock exclusive stems'"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  Sound Snippet / Audio Timestamp
                </label>
                <input
                  type="text"
                  value={soundSnippet}
                  onChange={(e) => setSoundSnippet(e.target.value)}
                  placeholder="e.g. 01:14 - 01:38 (Drop Section)"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Context Relationships Section: Release, Campaign, Product */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-red-400" />
              Keedohub Context Alignment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Linked Release */}
              <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800">
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Disc3 className="w-3.5 h-3.5 text-red-400" />
                  Linked Release
                </label>
                <select
                  value={releaseId}
                  onChange={(e) => setReleaseId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-red-500"
                >
                  <option value="">-- No Linked Release --</option>
                  {releases.map((rel) => (
                    <option key={rel.id} value={rel.id}>
                      {rel.title} ({rel.releaseDate || "No Date"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Linked Campaign */}
              <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800">
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  Linked Campaign
                </label>
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-red-500"
                >
                  <option value="">-- No Linked Campaign --</option>
                  {campaigns.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      {camp.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Linked Product/Service */}
              <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800">
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                  Linked Product / Offer
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-red-500"
                >
                  <option value="">-- No Linked Product --</option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({prod.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Attached Assets from Vault */}
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                Attached Vault Assets ({selectedAssetIds.length})
              </label>
              <button
                type="button"
                onClick={() => setIsAssetPickerOpen(!isAssetPickerOpen)}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] font-semibold text-neutral-200 border border-neutral-700 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                {isAssetPickerOpen ? "Close Asset Vault" : "Attach from Vault"}
              </button>
            </div>

            {/* Currently selected assets chips */}
            {selectedAssetIds.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedAssetIds.map((id) => {
                  const match = assets.find((a) => a.id === id);
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-800/90 border border-neutral-700 text-xs text-neutral-200"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="truncate max-w-[180px] font-medium">
                        {match?.name || "Attached Asset"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleAsset(id)}
                        className="text-neutral-400 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 italic">
                No vault assets attached yet. Linking cover art or video stems keeps content aligned with your creative files.
              </p>
            )}

            {/* Asset Vault Drawer / Multi-Select */}
            {isAssetPickerOpen && (
              <div className="p-3 mt-2 rounded-xl bg-neutral-950 border border-neutral-800 max-h-48 overflow-y-auto space-y-2">
                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Select Assets from Resource Vault:
                </p>
                {assets.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">No assets in workspace vault yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {assets.map((asset) => {
                      const isSelected = selectedAssetIds.includes(asset.id);
                      return (
                        <div
                          key={asset.id}
                          onClick={() => handleToggleAsset(asset.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs border transition-colors ${
                            isSelected
                              ? "bg-red-950/30 border-red-500/50 text-red-200"
                              : "bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ImageIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate">{asset.name}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Scheduling & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                Scheduled Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                Posting Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-red-500"
              >
                <option value="CRITICAL">Critical (Launch Essential)</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority / Evergreen</option>
              </select>
            </div>
          </div>

          {/* Quality Audit Bar */}
          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
                  qualityAudit.score >= 80
                    ? "bg-emerald-950/50 text-emerald-300 border-emerald-800/60"
                    : qualityAudit.score >= 50
                    ? "bg-amber-950/50 text-amber-300 border-amber-800/60"
                    : "bg-red-950/50 text-red-300 border-red-800/60"
                }`}
              >
                Readiness: {qualityAudit.score}%
              </div>
              <div className="text-xs text-neutral-300">
                {qualityAudit.issues.length === 0 ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> High-converting format ready
                  </span>
                ) : (
                  <span className="text-neutral-400">
                    {qualityAudit.issues.length} audit recommendations noted
                  </span>
                )}
              </div>
            </div>

            {qualityAudit.issues.length > 0 && (
              <div className="text-[11px] text-amber-300/90 flex flex-col gap-0.5">
                {qualityAudit.issues.slice(0, 2).map((issue, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{issue.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-900/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={isSaving || !title.trim()}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white shadow-lg shadow-red-950/50 flex items-center gap-2 transition-all cursor-pointer"
          >
            {isSaving ? "Saving Piece..." : item?.id ? "Update Content Item" : "Create Content Piece"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
