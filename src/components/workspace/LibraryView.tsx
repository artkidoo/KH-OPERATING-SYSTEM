import React, { useState, useRef } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  Upload,
  Search,
  Star,
  Download,
  Filter,
  Layers,
  FolderKanban,
  CheckCircle,
  Clock,
  AlertCircle,
  FileCode,
  Image as ImageIcon,
  Film,
  Music,
  FileText,
  Share2,
  X,
  ExternalLink,
  Edit,
  Tag,
} from "lucide-react";

type ViewTab =
  | "all"
  | "approved"
  | "in_review"
  | "needs_revision"
  | "raw_working"
  | "final_deliverables"
  | "by_project"
  | "by_category";

export function LibraryView({
  onNotify,
}: {
  onNotify: (m: string, t?: "success" | "info" | "error") => void;
}) {
  const { assets, projects, saveAsset, updateAsset } = useWorkspace();
  const [activeTab, setActiveTab] = useState<ViewTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [busy, setBusy] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Filter logic
  const filteredAssets = assets.filter((a) => {
    // Tab filter
    if (activeTab === "approved" && a.status !== "approved") return false;
    if (activeTab === "in_review" && a.status !== "in_review" && a.status !== "review") return false;
    if (activeTab === "needs_revision" && a.status !== "needs_revision") return false;
    if (activeTab === "raw_working" && a.status !== "raw" && a.category !== "working") return false;
    if (activeTab === "final_deliverables" && a.status !== "approved" && a.status !== "final") return false;

    // Type filter
    if (selectedType !== "all") {
      const cat = (a.category || a.type || "").toLowerCase();
      if (!cat.includes(selectedType.toLowerCase())) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (a.name || a.title || "").toLowerCase().includes(q);
      const tagMatch = (a.tags || []).some((t: string) => t.toLowerCase().includes(q));
      const projMatch = projects.find((p) => p.id === a.projectId)?.title.toLowerCase().includes(q);
      if (!nameMatch && !tagMatch && !projMatch) return false;
    }

    return true;
  });

  const handleUpload = async (f: File) => {
    setBusy(true);
    try {
      const url = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = rej;
        r.readAsDataURL(f);
      });

      const category = f.type.startsWith("video")
        ? "motion"
        : f.type.startsWith("audio")
        ? "audio"
        : f.type.includes("pdf") || f.type.includes("document")
        ? "document"
        : "artwork";

      await saveAsset({
        name: f.name,
        title: f.name.replace(/\.[^/.]+$/, ""),
        category,
        url,
        size: f.size,
        mimeType: f.type,
        status: "approved",
        tags: ["Upload", category.toUpperCase()],
      } as never);

      onNotify(`Uploaded ${f.name} to Library`, "success");
    } catch (e: unknown) {
      onNotify(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
            <CheckCircle className="w-2.5 h-2.5" /> Approved
          </span>
        );
      case "in_review":
      case "review":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
            <Clock className="w-2.5 h-2.5" /> In Review
          </span>
        );
      case "needs_revision":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-bold text-red-300 border border-red-500/30">
            <AlertCircle className="w-2.5 h-2.5" /> Needs Revision
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[9px] font-bold text-zinc-400">
            Final Deliverable
          </span>
        );
    }
  };

  const tabs: { key: ViewTab; label: string }[] = [
    { key: "all", label: "All Assets" },
    { key: "approved", label: "Approved" },
    { key: "in_review", label: "In Review" },
    { key: "needs_revision", label: "Needs Revision" },
    { key: "raw_working", label: "Raw / Working Files" },
    { key: "final_deliverables", label: "Final Deliverables" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Library Banner */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase">
              Permanent Creative Archive
            </span>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold text-white tracking-tight">
              Creative Asset Library
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Centralized repository for high-resolution masters, working project files, photography, social graphics, and final delivery packages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50 transition-colors cursor-pointer shadow-md"
            >
              <Upload className="w-3.5 h-3.5" />
              {busy ? "Uploading..." : "Upload Asset"}
            </button>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.zip"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 border-t border-zinc-800/80 pt-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets, projects, format, tags..."
              className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-auto rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">All File Types</option>
            <option value="artwork">Artwork & Covers</option>
            <option value="photo">Photography</option>
            <option value="social">Social Graphics</option>
            <option value="motion">Motion & Video</option>
            <option value="audio">Audio & Masters</option>
            <option value="document">Documents & EPK</option>
          </select>
        </div>

        {/* View Tabs */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length > 0 ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredAssets.map((asset) => {
            const project = projects.find((p) => p.id === asset.projectId);
            const isImage =
              asset.url?.startsWith("data:image") ||
              asset.url?.includes("http") ||
              asset.type === "image" ||
              asset.category === "artwork";

            return (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 transition-all duration-200 cursor-pointer shadow-sm"
              >
                <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden flex items-center justify-center">
                  {isImage && asset.url ? (
                    <img
                      src={asset.url}
                      alt={asset.name || asset.title}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : asset.category === "motion" ? (
                    <Film className="w-8 h-8 text-zinc-600" />
                  ) : asset.category === "audio" ? (
                    <Music className="w-8 h-8 text-zinc-600" />
                  ) : (
                    <FileText className="w-8 h-8 text-zinc-600" />
                  )}

                  <div className="absolute top-2 left-2">
                    {getStatusBadge(asset.status)}
                  </div>
                </div>

                <div className="p-3">
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                    {asset.title || asset.name}
                  </h4>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                    {project ? project.title : "Studio Master"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center space-y-3">
          <Layers className="mx-auto w-10 h-10 text-zinc-600" />
          <h3 className="text-base font-bold text-white">No assets match your criteria</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Upload files directly or switch your view filter to locate archived deliverables.
          </p>
        </div>
      )}

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                  Asset Detail & Specs
                </span>
                <h3 className="text-lg font-bold text-white">
                  {selectedAsset.title || selectedAsset.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="rounded-xl border border-zinc-800 p-1.5 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Box */}
            <div className="relative aspect-video w-full rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
              {selectedAsset.url ? (
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <FileCode className="w-12 h-12 text-zinc-600" />
              )}
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Status</span>
                <span className="text-white font-semibold capitalize mt-0.5 block">
                  {selectedAsset.status || "Approved"}
                </span>
              </div>
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Category</span>
                <span className="text-white font-semibold capitalize mt-0.5 block">
                  {selectedAsset.category || "Artwork"}
                </span>
              </div>
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Project</span>
                <span className="text-white font-semibold truncate mt-0.5 block">
                  {projects.find((p) => p.id === selectedAsset.projectId)?.title || "Independent"}
                </span>
              </div>
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Format</span>
                <span className="text-white font-semibold uppercase mt-0.5 block">
                  {selectedAsset.mimeType || "PNG / High-Res"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedAsset.url || "");
                    onNotify("Share link copied to clipboard", "success");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Link
                </button>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedAsset.url}
                  download={selectedAsset.name || "master-asset.png"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" /> Download Master File
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
