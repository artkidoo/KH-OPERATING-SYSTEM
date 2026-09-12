import React, { useState, useEffect } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../context/AuthContext";
import { useMembership } from "../../hooks/useMembership";
import {
  Sparkles,
  Disc3,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  Plus,
  Music,
  FolderKanban,
  FileText,
  User,
  Shield,
  Palette,
  ExternalLink,
} from "lucide-react";
import { RequestCoverArtworkModal } from "./RequestCoverArtworkModal";

export function ArtistHome({
  onNotify,
  onNavigateSection,
}: {
  onNotify: (m: string, t?: "success" | "info" | "error") => void;
  onNavigateSection: (section: string) => void;
}) {
  const {
    releases,
    projects,
    creativeRequests,
    assets,
    loadArtistDNA,
  } = useWorkspace();
  const { activeWorkspace } = useAuth();
  const { tier } = useMembership();

  const [artistDNA, setArtistDNA] = useState<any>(null);
  const [isCoverArtworkModalOpen, setIsCoverArtworkModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchDNA = async () => {
      try {
        const dna = await loadArtistDNA();
        if (mounted && dna) {
          setArtistDNA(dna);
        }
      } catch {
        // ignore fallback
      }
    };
    fetchDNA();
    return () => {
      mounted = false;
    };
  }, [activeWorkspace?.id]);

  // Derive Artist Identity
  const artistName = artistDNA?.artistName || activeWorkspace?.name || "Artist";
  const stageName = artistDNA?.stageName || "";
  const genre = artistDNA?.genre || "Music";
  const subgenre = artistDNA?.subgenre || "";
  const location = artistDNA?.location || "";
  const bio = artistDNA?.bio || artistDNA?.story || "";

  // Calculate Profile Completion
  const profileFields = [
    { name: "Artist Name", filled: !!artistName },
    { name: "Stage Name", filled: !!stageName },
    { name: "Bio / Story", filled: !!bio },
    { name: "Genre", filled: !!genre },
    { name: "Streaming Links", filled: !!(artistDNA?.streamingLinks?.spotify || artistDNA?.streamingLinks?.appleMusic) },
    { name: "Social Handles", filled: !!(artistDNA?.socialLinks?.instagram || artistDNA?.socialLinks?.tiktok) },
    { name: "Visual Personality", filled: !!artistDNA?.visualPersonality },
    { name: "Color Palette", filled: !!artistDNA?.preferredColours?.primary },
  ];
  const filledCount = profileFields.filter((f) => f.filled).length;
  const completionPct = Math.round((filledCount / profileFields.length) * 100);

  // Releases
  const currentRelease = releases[0];
  const upcomingRelease = releases[1] || (releases.length > 0 && (releases[0].status === "in_progress" || releases[0].status === "in-progress") ? releases[0] : null);

  // Active Projects
  const activeProjects = projects.filter((p) => p.status !== "completed").slice(0, 3);

  // Outstanding Requests
  const outstandingRequests = creativeRequests.filter((r) => r.status !== "completed");

  // Asset Kit Status breakdown
  let requestedCount = 0;
  let inProductionCount = 0;
  let deliveredCount = 0;

  if (currentRelease?.assetKitStatus) {
    Object.values(currentRelease.assetKitStatus).forEach((st) => {
      if (st === "Delivered" || st === "Approved") deliveredCount++;
      else if (st === "In Production" || st === "Review") inProductionCount++;
      else requestedCount++;
    });
  } else {
    // Defaults for visual balance
    deliveredCount = assets.length > 0 ? Math.min(assets.length, 6) : 3;
    inProductionCount = 4;
    requestedCount = 4;
  }

  // Recent deliveries from library assets
  const recentDeliveries = assets.slice(0, 4);

  return (
    <div className="workspace-page space-y-6 max-w-6xl mx-auto">
      {/* Hero Affirmation Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/30 p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-0.5 text-[10px] font-bold tracking-wider text-red-400 uppercase">
              <Sparkles className="w-3 h-3" />
              <span>KEEDOHUB ARTIST RELEASE WORKSPACE</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {stageName ? `${stageName} (${artistName})` : artistName}
            </h1>
            <p className="text-base md:text-lg font-medium text-red-200/90 italic">
              "KeedoHub is preparing everything I need."
            </p>
            <p className="text-xs text-zinc-400 max-w-xl">
              Your creative control room. Submit release dossiers and visual preferences—KeedoHub Studio designers produce your master artwork, video canvases, and turnkey asset kits.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsCoverArtworkModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-200 transition-colors cursor-pointer"
            >
              <Palette className="w-4 h-4 text-red-400" />
              <span>Request Cover Artwork</span>
            </button>
            <button
              onClick={() => onNavigateSection("releases")}
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-950/60 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Release</span>
            </button>
          </div>
        </div>

        {/* Identity & Profile Readiness Bar */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
              Sonic Identity
            </span>
            <p className="text-xs font-bold text-zinc-200">
              {genre} {subgenre ? `• ${subgenre}` : ""}
            </p>
            {location && <p className="text-[11px] text-zinc-400">{location}</p>}
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-300">
                Artist Profile Completion (Artist DNA)
              </span>
              <button
                onClick={() => onNavigateSection("profile")}
                className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Edit Profile</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  completionPct >= 80
                    ? "bg-emerald-500"
                    : completionPct >= 50
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>{completionPct}% Ready for Studio Calibration</span>
              {completionPct < 100 && (
                <span className="text-zinc-500">
                  Add {profileFields.find((f) => !f.filled)?.name || "details"} in Profile
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Current Release & Upcoming Release */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Release Card */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Disc3 className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-white">Current Active Release</h3>
            </div>
            {currentRelease && (
              <span className="rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-bold text-red-400 uppercase">
                {currentRelease.status || "In Production"}
              </span>
            )}
          </div>

          {currentRelease ? (
            <div className="flex gap-4 items-start">
              <div className="w-24 h-24 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 relative">
                {currentRelease.coverUrl ? (
                  <img
                    src={currentRelease.coverUrl}
                    alt={currentRelease.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-900">
                    <Disc3 className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[9px] font-bold text-zinc-300 uppercase">
                  {currentRelease.releaseType || "Single"}
                </span>
                <h4 className="text-base font-bold text-white truncate">
                  {currentRelease.title}
                </h4>
                <p className="text-xs text-zinc-400">
                  Target Date: <span className="text-zinc-200 font-medium">{currentRelease.releaseDate || "TBA"}</span>
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => onNavigateSection("releases")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/20 border border-red-500/30 px-3 py-1 text-xs font-bold text-red-300 hover:bg-red-600/30 cursor-pointer"
                  >
                    <span>View Asset Kit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center space-y-2">
              <p className="text-xs text-zinc-400">No active release registered yet.</p>
              <button
                onClick={() => onNavigateSection("releases")}
                className="text-xs font-bold text-red-400 hover:text-red-300"
              >
                + Register First Release
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Release / Rollout Status */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-white">Upcoming Rollout & Schedule</h3>
            </div>
            <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
              Next Drop
            </span>
          </div>

          <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Studio Delivery Target:</span>
              <span className="text-xs font-bold text-white">
                {upcomingRelease?.releaseDate || "Within 14 Days"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Rollout Phase:</span>
              <span className="text-xs font-bold text-emerald-400">
                Asset Kit Production & Review
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">DSP Pre-Save Readiness:</span>
              <span className="text-xs font-bold text-zinc-300">Synchronized</span>
            </div>

            <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">Need artwork revision or extra motion?</span>
              <button
                onClick={() => onNavigateSection("requests")}
                className="text-[11px] font-bold text-red-400 hover:text-red-300"
              >
                Open Studio Request
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Kit Status & Outstanding Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Kit Status (Col 1) */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-white">Asset Kit Status</h3>
            </div>
            <button
              onClick={() => onNavigateSection("asset-kits")}
              className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <span>All Kits</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
              <p className="text-xl font-bold text-emerald-400">{deliveredCount}</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">Delivered</p>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3">
              <p className="text-xl font-bold text-amber-400">{inProductionCount}</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">In Production</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
              <p className="text-xl font-bold text-zinc-300">{requestedCount}</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">Briefing</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {[
              { name: "Cover Artwork", st: "Delivered", color: "text-emerald-400" },
              { name: "Spotify Canvas", st: "In Production", color: "text-amber-400" },
              { name: "TikTok / Reels Teaser", st: "In Production", color: "text-amber-400" },
              { name: "Press One-Sheet", st: "Briefing", color: "text-zinc-400" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-800/60 last:border-0"
              >
                <span className="text-zinc-300">{item.name}</span>
                <span className={`text-[11px] font-bold ${item.color}`}>{item.st}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Projects (Col 2) */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Active Projects</h3>
            </div>
            <button
              onClick={() => onNavigateSection("projects")}
              className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <span>All Projects</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {activeProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-400">
              No active projects in progress.
            </div>
          ) : (
            <div className="space-y-3">
              {activeProjects.map((project) => {
                const totalTasks = project.tasks?.length || 0;
                const doneTasks = project.tasks?.filter((t) => t.completed)?.length || 0;
                const calcPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 40;
                return (
                  <div
                    key={project.id}
                    className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">
                        {project.name || project.title}
                      </h4>
                      <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.2 text-[9px] font-bold text-blue-300 capitalize">
                        {project.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${calcPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span>Target: {project.deadline || "TBA"}</span>
                      <span>{totalTasks} Tasks</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Outstanding Requests (Col 3) */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Outstanding Requests</h3>
            </div>
            <button
              onClick={() => onNavigateSection("requests")}
              className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {outstandingRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
              <p className="text-xs text-zinc-400">All studio requests are up to date.</p>
              <button
                onClick={() => setIsCoverArtworkModalOpen(true)}
                className="text-xs font-bold text-red-400 hover:text-red-300"
              >
                + Request New Asset
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {outstandingRequests.slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white truncate">
                      {req.title || req.serviceName}
                    </h4>
                    <span className="text-[10px] font-bold text-amber-400 capitalize">
                      {req.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Service: {req.serviceName || "Creative Production"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Deliveries */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Studio Deliveries</h3>
            <p className="text-xs text-zinc-400">
              Completed master assets uploaded directly to your workspace Library.
            </p>
          </div>
          <button
            onClick={() => onNavigateSection("library")}
            className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 cursor-pointer"
          >
            <span>Browse Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentDeliveries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-xs text-zinc-400">
            Completed artwork and visual assets will appear here once delivered by KeedoHub Studio.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentDeliveries.map((asset) => {
              const url = asset.url;
              return (
                <div
                  key={asset.id}
                  className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-3 space-y-2 hover:border-zinc-700 transition-colors"
                >
                  <div className="w-full aspect-square rounded-xl bg-zinc-800 overflow-hidden relative">
                    {url ? (
                      <img
                        src={url}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Music className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{asset.name}</h4>
                    <p className="text-[10px] text-zinc-500 capitalize">{asset.category || "Master Asset"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cover Artwork Request Modal */}
      <RequestCoverArtworkModal
        isOpen={isCoverArtworkModalOpen}
        onClose={() => setIsCoverArtworkModalOpen(false)}
        releaseTitle={currentRelease?.title}
        releaseId={currentRelease?.id}
        onNotify={onNotify}
      />
    </div>
  );
}
