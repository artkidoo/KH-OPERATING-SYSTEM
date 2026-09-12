import React, { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../context/AuthContext";
import { useMembership } from "../../hooks/useMembership";
import {
  Music,
  Plus,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Download,
  Share2,
  FileText,
  Eye,
  Disc3,
  Search,
  Filter,
} from "lucide-react";
import { Release } from "../../types";
import { RequestCoverArtworkModal } from "./RequestCoverArtworkModal";

const STANDARD_ASSET_KIT_ITEMS = [
  { key: "cover-artwork", label: "Cover Artwork", format: "3000x3000px Master" },
  { key: "animated-cover", label: "Animated Cover", format: "1:1 MP4 / ProRes" },
  { key: "spotify-canvas", label: "Spotify Canvas", format: "9:16 Vertical Video (3-8s)" },
  { key: "lyric-visual", label: "Lyric Visual", format: "16:9 & 9:16 Video" },
  { key: "lyric-cards", label: "Lyric Cards", format: "1:1 & 4:5 Carousel Stills" },
  { key: "release-announcement", label: "Release Announcement", format: "1:1, 4:5 & 9:16 Graphic" },
  { key: "countdown-graphics", label: "Countdown Graphics", format: "Story & Feed Countdown Stills" },
  { key: "instagram-assets", label: "Instagram Assets", format: "Feed Carousel + Story Frames" },
  { key: "tiktok-assets", label: "TikTok Assets", format: "9:16 Motion Teaser Package" },
  { key: "youtube-assets", label: "YouTube Assets", format: "16:9 Banner & Thumbnail Stills" },
  { key: "streaming-banners", label: "Streaming Banners", format: "Spotify & Apple Music Headers" },
  { key: "press-onesheet", label: "Press One-Sheet", format: "PDF Media Summary" },
  { key: "epk", label: "EPK", format: "Electronic Press Kit Dossier" },
  { key: "release-motion-package", label: "Release Motion Package", format: "Looping Motion Teasers" },
];

export function ReleasesView({
  onNotify,
  onNavigateTab,
  onNavigateSection,
}: {
  onNotify: (m: string, t?: "success" | "info" | "error") => void;
  onNavigateTab?: (tab: any) => void;
  onNavigateSection?: (section: string) => void;
}) {
  const { releases, createRelease, updateRelease, submitStudioRequest, assets } = useWorkspace();
  const { activeWorkspace } = useAuth();
  const { tier } = useMembership();

  const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(
    releases[0]?.id || null
  );
  const [isNewReleaseModalOpen, setIsNewReleaseModalOpen] = useState(false);
  const [isCoverArtworkModalOpen, setIsCoverArtworkModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // New Release Form State
  const [newTitle, setNewTitle] = useState("");
  const [newArtist, setNewArtist] = useState(activeWorkspace?.name || "");
  const [newReleaseType, setNewReleaseType] = useState("Single");
  const [newReleaseDate, setNewReleaseDate] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [newFeaturedArtists, setNewFeaturedArtists] = useState("");
  const [newProducer, setNewProducer] = useState("");
  const [newSongwriter, setNewSongwriter] = useState("");
  const [newLyrics, setNewLyrics] = useState("");
  const [newSongStory, setNewSongStory] = useState("");
  const [newStreamingLink, setNewStreamingLink] = useState("");
  const [newPreSaveLink, setNewPreSaveLink] = useState("");
  const [newReferenceImages, setNewReferenceImages] = useState("");
  const [newCreativeNotes, setNewCreativeNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRelease = releases.find((r) => r.id === selectedReleaseId) || releases[0];

  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      onNotify("Please enter a release title", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Default initial asset kit status mapping
      const defaultKitStatus: Record<string, "Requested" | "Briefing" | "In Production" | "Review" | "Approved" | "Delivered"> = {};
      STANDARD_ASSET_KIT_ITEMS.forEach((item) => {
        defaultKitStatus[item.key] = "Briefing";
      });
      defaultKitStatus["cover-artwork"] = "In Production";

      const created = await createRelease({
        title: newTitle.trim(),
        artistName: newArtist.trim() || activeWorkspace?.name || "Artist",
        releaseType: newReleaseType,
        releaseDate: newReleaseDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        genre: newGenre.trim() || "Alternative",
        status: "in_production",
        featuredArtists: newFeaturedArtists
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        producer: newProducer.trim(),
        songwriter: newSongwriter.trim(),
        songStory: newSongStory.trim(),
        streamingLink: newStreamingLink.trim(),
        preSaveLink: newPreSaveLink.trim(),
        referenceImages: newReferenceImages
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        creativeNotes: newCreativeNotes.trim(),
        lyrics: {
          fullText: newLyrics.trim(),
        },
        assetKitStatus: defaultKitStatus,
      } as any);

      onNotify(`Release "${newTitle}" created with turnkey Asset Kit.`, "success");
      setIsNewReleaseModalOpen(false);
      // Reset form
      setNewTitle("");
      setNewFeaturedArtists("");
      setNewProducer("");
      setNewSongwriter("");
      setNewLyrics("");
      setNewSongStory("");
      setNewCreativeNotes("");

      if (created?.id) {
        setSelectedReleaseId(created.id);
      }
    } catch (err: any) {
      onNotify(err.message || "Failed to create release", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestAsset = async (itemKey: string, itemLabel: string) => {
    if (!selectedRelease) return;
    try {
      await submitStudioRequest({
        title: `${itemLabel}: ${selectedRelease.title}`,
        serviceId: `srv_${itemKey}`,
        serviceName: `${itemLabel} Production`,
        category: "Release Asset Kit",
        briefDetails: `Request for ${itemLabel} for release "${selectedRelease.title}" by ${selectedRelease.artistName}.\nGenre: ${selectedRelease.genre}.\nTarget Date: ${selectedRelease.releaseDate}`,
        priority: "high",
        metadata: {
          releaseId: selectedRelease.id,
          releaseTitle: selectedRelease.title,
          assetKey: itemKey,
        },
      } as any);

      // Update release asset kit status
      const updatedKit = {
        ...(selectedRelease.assetKitStatus || {}),
        [itemKey]: "In Production" as const,
      };
      await updateRelease(selectedRelease.id, {
        assetKitStatus: updatedKit,
      } as any);

      onNotify(`Production requested for ${itemLabel} from KeedoHub Studio.`, "success");
    } catch (err: any) {
      onNotify(err.message || "Failed to request asset", "error");
    }
  };

  const filteredReleases = releases.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.artistName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="workspace-page space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-0.5 text-[10px] font-bold tracking-wider text-red-400 uppercase mb-1">
            <Disc3 className="w-3 h-3" />
            <span>Turnkey Release Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Releases & Asset Kits</h1>
          <p className="text-xs md:text-sm text-zinc-400">
            Submit release dossiers and track delivered master artwork, canvases, and rollout assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCoverArtworkModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-red-400" />
            <span>Request Cover Artwork</span>
          </button>
          <button
            onClick={() => setIsNewReleaseModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-950/50 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Release</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Release Selector / List & Detailed Asset Kit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Releases List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search releases..."
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-2.5">
            {filteredReleases.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center space-y-3">
                <Music className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">No releases registered yet.</p>
                <button
                  onClick={() => setIsNewReleaseModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/20 border border-red-500/30 px-3 py-1 text-xs font-bold text-red-300 hover:bg-red-600/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Release</span>
                </button>
              </div>
            ) : (
              filteredReleases.map((release) => {
                const isSelected = selectedRelease?.id === release.id;
                const cover = release.coverUrl || "/placeholder-cover.jpg";
                return (
                  <div
                    key={release.id}
                    onClick={() => setSelectedReleaseId(release.id)}
                    className={`group relative rounded-2xl border p-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? "border-red-500/60 bg-red-950/10 shadow-lg shadow-red-950/20"
                        : "border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700/60">
                        {release.coverUrl ? (
                          <img
                            src={cover}
                            alt={release.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                            <Disc3 className="w-6 h-6" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.2 text-[9px] font-bold text-zinc-300 uppercase">
                          {release.releaseType || "Single"}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-xs font-bold text-white truncate">
                            {release.title}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-0.2 text-[9px] font-bold shrink-0 capitalize ${
                              release.status === "released" || (release.status as string) === "completed"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {release.status === "in_progress" || release.status === "in-progress"
                              ? "In Production"
                              : release.status || "Scheduled"}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {release.artistName}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {release.releaseDate || "TBA"}
                          </span>
                          <span>•</span>
                          <span>{release.genre || "Music"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Release Asset Kit & Dossier */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRelease ? (
            <div className="space-y-6">
              {/* Release Header Dossier */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 relative group shadow-xl">
                    {selectedRelease.coverUrl ? (
                      <img
                        src={selectedRelease.coverUrl}
                        alt={selectedRelease.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-zinc-900 text-zinc-500">
                        <Disc3 className="w-8 h-8 mb-1 text-zinc-600" />
                        <span className="text-[10px]">Artwork In Production</span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-bold text-red-400 uppercase">
                        {selectedRelease.releaseType || "Single"}
                      </span>
                      <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-[10px] font-bold text-zinc-300">
                        {selectedRelease.genre || "Genre Not Set"}
                      </span>
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        Release Date: {selectedRelease.releaseDate || "TBA"}
                      </span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      {selectedRelease.title}
                    </h2>
                    <p className="text-xs text-zinc-400">
                      By <span className="text-white font-medium">{selectedRelease.artistName}</span>
                      {selectedRelease.featuredArtists && selectedRelease.featuredArtists.length > 0 && (
                        <span> ft. {selectedRelease.featuredArtists.join(", ")}</span>
                      )}
                    </p>

                    {/* Quick Metadata badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase">Producer</span>
                        <span className="text-zinc-300 font-medium">
                          {selectedRelease.producer || "In-house"}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase">Songwriter</span>
                        <span className="text-zinc-300 font-medium">
                          {selectedRelease.songwriter || selectedRelease.artistName}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase">Presave Status</span>
                        <span className="text-emerald-400 font-medium">
                          {selectedRelease.preSaveLink ? "Configured" : "Queued with Kit"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Song Story excerpt if exists */}
                {selectedRelease.songStory && (
                  <div className="mt-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-3 text-xs text-zinc-300">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                      Song Narrative & Context
                    </span>
                    <p className="line-clamp-2 italic text-zinc-400">
                      "{selectedRelease.songStory}"
                    </p>
                  </div>
                )}
              </div>

              {/* Release Asset Kit */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-red-500" />
                      <span>Creative Production: Release Asset Kit</span>
                    </h3>
                    <p className="text-xs text-zinc-400">
                      KeedoHub Studio prepares, formats, and delivers every asset required for your rollout.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsCoverArtworkModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-950/40 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Request Artwork / Asset</span>
                  </button>
                </div>

                {/* Asset Kit Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {STANDARD_ASSET_KIT_ITEMS.map((item) => {
                    const status =
                      (selectedRelease.assetKitStatus && selectedRelease.assetKitStatus[item.key]) ||
                      (item.key === "cover-artwork" && selectedRelease.coverUrl ? "Delivered" : "In Production");

                    const getStatusBadge = (st: string) => {
                      switch (st) {
                        case "Delivered":
                          return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
                        case "Approved":
                          return "bg-blue-500/20 text-blue-300 border-blue-500/30";
                        case "Review":
                          return "bg-purple-500/20 text-purple-300 border-purple-500/30";
                        case "In Production":
                          return "bg-amber-500/20 text-amber-300 border-amber-500/30";
                        case "Briefing":
                          return "bg-zinc-800 text-zinc-300 border-zinc-700";
                        default:
                          return "bg-zinc-900 text-zinc-400 border-zinc-800";
                      }
                    };

                    return (
                      <div
                        key={item.key}
                        className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-3.5 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white truncate">
                              {item.label}
                            </h4>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            {item.format}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getStatusBadge(
                              status
                            )}`}
                          >
                            {status}
                          </span>

                          {status === "Delivered" ? (
                            <button
                              onClick={() => {
                                onNotify(`Navigating to Library for ${item.label}`, "info");
                                onNavigateSection?.("library");
                              }}
                              className="rounded-lg bg-zinc-800 p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
                              title="View in Library"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRequestAsset(item.key, item.label)}
                              className="rounded-lg bg-zinc-800/80 hover:bg-red-500/20 border border-zinc-700/60 hover:border-red-500/40 px-2 py-1 text-[10px] font-bold text-zinc-300 hover:text-red-300 transition-colors cursor-pointer"
                            >
                              Request
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Studio Reassurance Note */}
                <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <p className="text-xs text-zinc-300">
                      Assets are continuously designed and calibrated against your{" "}
                      <span className="font-bold text-white">Artist Profile & DNA</span>.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateSection?.("library")}
                    className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    <span>View in Library</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center space-y-4">
              <Disc3 className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">Select or Create a Release</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Track your active music releases and access custom-designed Asset Kits crafted by KeedoHub Studio.
              </p>
              <button
                onClick={() => setIsNewReleaseModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Release</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Release Modal */}
      {isNewReleaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-0.5 text-[10px] font-bold text-red-400">
                  <Sparkles className="w-3 h-3" />
                  <span>NEW RELEASE DOSSIER</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Create New Release</h2>
                <p className="text-xs text-zinc-400">
                  Submit track information. KeedoHub Studio automatically provisions your complete Release Asset Kit.
                </p>
              </div>
              <button
                onClick={() => setIsNewReleaseModalOpen(false)}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRelease} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Release Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Midnight Waves"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Primary Artist Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newArtist}
                    onChange={(e) => setNewArtist(e.target.value)}
                    placeholder="e.g. KAYDO"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Release Type *
                  </label>
                  <select
                    value={newReleaseType}
                    onChange={(e) => setNewReleaseType(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Single">Single</option>
                    <option value="EP">EP</option>
                    <option value="Album">Album</option>
                    <option value="Remix">Remix</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Target Release Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newReleaseDate}
                    onChange={(e) => setNewReleaseDate(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Genre *
                  </label>
                  <input
                    type="text"
                    required
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    placeholder="e.g. Afrobeats, Alté"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Featured Artists (Optional)
                  </label>
                  <input
                    type="text"
                    value={newFeaturedArtists}
                    onChange={(e) => setNewFeaturedArtists(e.target.value)}
                    placeholder="Comma-separated"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Producer
                  </label>
                  <input
                    type="text"
                    value={newProducer}
                    onChange={(e) => setNewProducer(e.target.value)}
                    placeholder="e.g. BeatsByKel"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Songwriter(s)
                  </label>
                  <input
                    type="text"
                    value={newSongwriter}
                    onChange={(e) => setNewSongwriter(e.target.value)}
                    placeholder="e.g. Samuel Adeyemi"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Song Story & Narrative
                  </label>
                  <textarea
                    rows={2}
                    value={newSongStory}
                    onChange={(e) => setNewSongStory(e.target.value)}
                    placeholder="What inspired the track? What story does it communicate?"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Lyrics / Hook Excerpt
                  </label>
                  <textarea
                    rows={2}
                    value={newLyrics}
                    onChange={(e) => setNewLyrics(e.target.value)}
                    placeholder="Key lyrics to feature in lyric visuals, canvas, and quote cards"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Streaming Link (if already uploaded)
                  </label>
                  <input
                    type="text"
                    value={newStreamingLink}
                    onChange={(e) => setNewStreamingLink(e.target.value)}
                    placeholder="Spotify, Apple Music, or SoundCloud link"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Pre-Save Link
                  </label>
                  <input
                    type="text"
                    value={newPreSaveLink}
                    onChange={(e) => setNewPreSaveLink(e.target.value)}
                    placeholder="Feature.fm, ToneDen, or DistroKid pre-save link"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Reference Images & Moodboard Links
                  </label>
                  <textarea
                    rows={2}
                    value={newReferenceImages}
                    onChange={(e) => setNewReferenceImages(e.target.value)}
                    placeholder="Paste links to moodboards, photography, or cover inspirations"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Creative Notes for KeedoHub Designers
                  </label>
                  <textarea
                    rows={2}
                    value={newCreativeNotes}
                    onChange={(e) => setNewCreativeNotes(e.target.value)}
                    placeholder="Specific ideas, typography requirements, or rollout dates"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewReleaseModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-400 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-950/50 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Release & Ingest Kit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cover Artwork Request Modal */}
      <RequestCoverArtworkModal
        isOpen={isCoverArtworkModalOpen}
        onClose={() => setIsCoverArtworkModalOpen(false)}
        releaseId={selectedRelease?.id}
        releaseTitle={selectedRelease?.title}
        onNotify={onNotify}
      />
    </div>
  );
}
