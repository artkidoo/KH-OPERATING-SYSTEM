import React, { useState, useMemo } from "react";
import {
  ContentItem,
  ContentStatus,
  ContentPlatform,
  Release,
  Campaign,
} from "../../types";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  Plus,
  Search,
  Disc3,
  Target,
  Image as ImageIcon,
  Calendar,
  Clock,
  Copy,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Zap,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";

interface ContentPipelineProps {
  onOpenItemEditor: (item: Partial<ContentItem> | null) => void;
  onDuplicateItem: (itemId: string) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
}

const COLUMNS: { id: ContentStatus; label: string; description: string; color: string }[] = [
  { id: "idea", label: "Idea Bank", description: "Raw hooks & concepts", color: "border-neutral-700 bg-neutral-900/30" },
  { id: "draft", label: "Drafting", description: "Writing copy & sound notes", color: "border-amber-700/60 bg-amber-950/20" },
  { id: "review", label: "In Review", description: "Quality & retention check", color: "border-blue-700/60 bg-blue-950/20" },
  { id: "approved", label: "Approved", description: "Final asset attached", color: "border-indigo-700/60 bg-indigo-950/20" },
  { id: "scheduled", label: "Scheduled", description: "Date & time locked", color: "border-emerald-700/60 bg-emerald-950/20" },
  { id: "published", label: "Published", description: "Live on socials", color: "border-cyan-700/60 bg-cyan-950/20" },
];

const PLATFORM_ICONS: Record<string, string> = {
  tiktok: "🎵",
  instagram: "📸",
  youtube: "▶️",
  x: "🐦",
  twitter: "🐦",
  linkedin: "💼",
  threads: "🧵",
  spotify: "🟢",
  blog: "📰",
  other: "🌐",
};

export const ContentPipeline: React.FC<ContentPipelineProps> = ({
  onOpenItemEditor,
  onDuplicateItem,
  onDeleteItem,
}) => {
  const { contentItems, updateContentItem, releases, campaigns, contentPillars } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [pillarFilter, setPillarFilter] = useState("all");
  const [releaseFilter, setReleaseFilter] = useState("all");

  const filteredItems = useMemo(() => {
    return contentItems.filter((item) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(query);
        const matchHook = item.hook?.toLowerCase().includes(query) || item.captionHook?.toLowerCase().includes(query);
        const matchCopy = item.copy?.toLowerCase().includes(query) || item.caption?.toLowerCase().includes(query);
        if (!matchTitle && !matchHook && !matchCopy) return false;
      }

      if (platformFilter !== "all" && item.platform !== platformFilter) return false;
      if (pillarFilter !== "all" && item.contentPillar !== pillarFilter) return false;
      if (releaseFilter !== "all" && item.releaseId !== releaseFilter) return false;

      return true;
    });
  }, [contentItems, searchQuery, platformFilter, pillarFilter, releaseFilter]);

  const itemsByStatus = useMemo(() => {
    const map: Record<string, ContentItem[]> = {
      idea: [],
      draft: [],
      drafted: [],
      review: [],
      approved: [],
      ready: [],
      scheduled: [],
      published: [],
      archived: [],
    };

    filteredItems.forEach((item) => {
      const statusKey = item.status || "draft";
      if (!map[statusKey]) map[statusKey] = [];
      map[statusKey].push(item);
    });

    // Merge ready into approved, drafted into draft for column view
    map["draft"] = [...(map["draft"] || []), ...(map["drafted"] || [])];
    map["approved"] = [...(map["approved"] || []), ...(map["ready"] || [])];

    return map;
  }, [filteredItems]);

  const handleMoveStatus = async (item: ContentItem, direction: "next" | "prev", e: React.MouseEvent) => {
    e.stopPropagation();
    const order: ContentStatus[] = ["idea", "draft", "review", "approved", "scheduled", "published"];
    const currentIndex = order.indexOf(item.status as ContentStatus);
    if (currentIndex === -1) return;

    let targetIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < order.length) {
      const nextStatus = order[targetIndex];
      await updateContentItem(item.id, { status: nextStatus });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hooks, titles, captions..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-200 focus:outline-none focus:border-red-500"
          >
            <option value="all">All Platforms</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
            <option value="x">X / Twitter</option>
            <option value="linkedin">LinkedIn</option>
            <option value="spotify">Spotify</option>
          </select>

          {/* Pillar Filter */}
          <select
            value={pillarFilter}
            onChange={(e) => setPillarFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-200 focus:outline-none focus:border-red-500"
          >
            <option value="all">All Pillars</option>
            {contentPillars.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Release Filter */}
          <select
            value={releaseFilter}
            onChange={(e) => setReleaseFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-200 focus:outline-none focus:border-red-500"
          >
            <option value="all">All Releases</option>
            {releases.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => onOpenItemEditor(null)}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-950/40 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Piece</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colItems = itemsByStatus[col.id] || [];
          return (
            <div
              key={col.id}
              className={`rounded-2xl border ${col.color} p-3 space-y-3 min-w-[250px] flex flex-col`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-neutral-100 uppercase tracking-wider">
                      {col.label}
                    </h3>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-neutral-300">
                      {colItems.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{col.description}</p>
                </div>

                <button
                  onClick={() => onOpenItemEditor({ status: col.id })}
                  className="p-1 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
                  title={`Add to ${col.label}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 min-h-[120px]">
                {colItems.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-neutral-800/80 text-center text-[11px] text-neutral-500 italic">
                    No items in {col.label}
                  </div>
                ) : (
                  colItems.map((item) => {
                    const icon = PLATFORM_ICONS[item.platform] || "🌐";
                    const hasHook = Boolean(item.hook || item.captionHook);
                    return (
                      <div
                        key={item.id}
                        onClick={() => onOpenItemEditor(item)}
                        className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/90 hover:border-neutral-700 transition-all shadow-md space-y-2.5 cursor-pointer group"
                      >
                        {/* Title & Platform Header */}
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-xs font-bold text-neutral-100 leading-snug line-clamp-2">
                            {item.title}
                          </span>
                          <span className="text-sm shrink-0">{icon}</span>
                        </div>

                        {/* Hook Excerpt */}
                        {hasHook ? (
                          <p className="text-[11px] text-red-300/90 italic font-serif line-clamp-2 bg-red-950/20 p-1.5 rounded-md border border-red-900/30">
                            "{item.hook || item.captionHook}"
                          </p>
                        ) : (
                          <p className="text-[10px] text-neutral-500 italic">No hook recorded</p>
                        )}

                        {/* Tags / Relationships */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {item.releaseTitle && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-red-950/50 text-red-300 border border-red-900/40 flex items-center gap-1">
                              <Disc3 className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[90px]">{item.releaseTitle}</span>
                            </span>
                          )}

                          {item.contentPillar && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-neutral-800 text-neutral-300">
                              {item.contentPillar}
                            </span>
                          )}

                          {item.assetIds && item.assetIds.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-950/40 text-amber-300 border border-amber-900/40 flex items-center gap-0.5">
                              <ImageIcon className="w-2.5 h-2.5" />
                              <span>{item.assetIds.length}</span>
                            </span>
                          )}
                        </div>

                        {/* Scheduled Date or Footer Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-neutral-900 text-[10px] text-neutral-400">
                          {item.scheduledDate ? (
                            <span className="flex items-center gap-1 font-mono text-emerald-400">
                              <Calendar className="w-3 h-3" />
                              {item.scheduledDate}
                            </span>
                          ) : (
                            <span className="text-neutral-500 italic">Unscheduled</span>
                          )}

                          {/* Quick Move Status Buttons */}
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {col.id !== "idea" && (
                              <button
                                onClick={(e) => handleMoveStatus(item, "prev", e)}
                                className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200"
                                title="Move Previous Stage"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                            )}

                            {col.id !== "published" && (
                              <button
                                onClick={(e) => handleMoveStatus(item, "next", e)}
                                className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200"
                                title="Move Next Stage"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
