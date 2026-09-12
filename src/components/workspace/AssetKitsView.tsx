import React, { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../context/AuthContext";
import {
  Package,
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
  Film,
  Music,
  FileText,
  Palette,
  Share2,
  ExternalLink,
} from "lucide-react";

interface AssetKitItem {
  id: string;
  name: string;
  description: string;
  category: string;
  deliverables: string[];
  status: "Delivered" | "In Production" | "Review" | "Ready to Request";
  lastUpdated?: string;
  assetCount: number;
}

const REUSABLE_KITS: AssetKitItem[] = [
  {
    id: "release-kit",
    name: "Release Asset Kit",
    description:
      "Core release rollout package: 3000x3000px master artwork, animated cover, Spotify canvas, streaming banners, and press one-sheet.",
    category: "Release Rollout",
    deliverables: [
      "Master Cover Artwork (3000x3000px)",
      "Animated Cover Video (ProRes / MP4)",
      "Spotify 9:16 Canvas (8s loop)",
      "Streaming Platform Banners (Apple, Spotify, YouTube)",
      "Press One-Sheet PDF Summary",
      "Release Announcement Graphic",
    ],
    status: "Delivered",
    lastUpdated: "Recently updated",
    assetCount: 6,
  },
  {
    id: "social-kit",
    name: "Social Asset Kit",
    description:
      "Turnkey social media promotional templates and finished assets designed for Instagram, TikTok, Twitter/X, and YouTube.",
    category: "Social Media",
    deliverables: [
      "4:5 High-Engagement Carousel Frames",
      "9:16 Full-Screen Story Teasers",
      "1:1 Square Feed Tiles with Typography",
      "YouTube Header & Thumbnail Stills",
      "Twitter/X Release Banner & Promo Cards",
    ],
    status: "In Production",
    lastUpdated: "Studio working now",
    assetCount: 5,
  },
  {
    id: "brand-kit",
    name: "Artist Brand Kit",
    description:
      "Master visual identity assets: artist monogram, vector logotype, typography specimen, and signature color tokens.",
    category: "Visual Identity",
    deliverables: [
      "Primary Monogram / Logotype (SVG & PNG)",
      "Vector Watermark & Stage Stamp",
      "Color Palette Guidelines & Hex Tokens",
      "Typography Pairing & Headline Specimen",
      "Social Avatar & Favicon Icons",
    ],
    status: "Delivered",
    lastUpdated: "Master version",
    assetCount: 5,
  },
  {
    id: "epk-kit",
    name: "Electronic Press Kit (EPK)",
    description:
      "Comprehensive media kit containing high-res press photos, official artist biography, streaming achievements, and press quotes.",
    category: "Press & Media",
    deliverables: [
      "Master EPK Interactive PDF Dossier",
      "Curated High-Res Press Photography",
      "Official 200-Word & 500-Word Biographies",
      "Streaming Milestones & Media Quotes",
      "Booking & Management Contact Card",
    ],
    status: "Review",
    lastUpdated: "Draft awaiting review",
    assetCount: 4,
  },
  {
    id: "motion-kit",
    name: "Motion Kit",
    description:
      "Kinetic video teasers, audio waveform visualizers, and looping animated backdrops for stage screens and short-form video.",
    category: "Video & Motion",
    deliverables: [
      "9:16 Looping Audio Visualizer for Reels & TikTok",
      "15-Second Release Countdown Video",
      "Looping Stage Backdrop Visuals (1080p)",
      "Animated Social Stickers & Overlays",
    ],
    status: "In Production",
    lastUpdated: "In render queue",
    assetCount: 4,
  },
  {
    id: "lyric-kit",
    name: "Lyric Visual Kit",
    description:
      "Lyric cards for social carousels, kinetic typography snippets for chorus hooks, and full-length vertical lyric video visualizers.",
    category: "Music & Lyrics",
    deliverables: [
      "Hook Lyric Cards (1:1 & 4:5 Carousel Stills)",
      "Kinetic Typography Snippet for TikTok",
      "16:9 & 9:16 Full Track Lyric Visualizer",
      "High-Contrast Quote Cards for Stories",
    ],
    status: "Ready to Request",
    lastUpdated: "Available on demand",
    assetCount: 4,
  },
];

export function AssetKitsView({
  onNotify,
  onNavigateSection,
}: {
  onNotify: (m: string, t?: "success" | "info" | "error") => void;
  onNavigateSection?: (section: string) => void;
}) {
  const { submitStudioRequest, assets } = useWorkspace();
  const { activeWorkspace } = useAuth();
  const [selectedKitId, setSelectedKitId] = useState<string>("release-kit");
  const [isRequesting, setIsRequesting] = useState(false);

  const selectedKit =
    REUSABLE_KITS.find((k) => k.id === selectedKitId) || REUSABLE_KITS[0];

  const handleRequestKit = async (kit: AssetKitItem) => {
    setIsRequesting(true);
    try {
      await submitStudioRequest({
        title: `Request Asset Kit: ${kit.name}`,
        serviceId: `srv_${kit.id}`,
        serviceName: `${kit.name} Production`,
        category: "Artist Asset Kits",
        briefDetails: `Artist requested complete production of ${kit.name}.\nIncludes:\n${kit.deliverables.join(
          "\n- "
        )}\n\nDeliver to artist Library upon completion.`,
        priority: "high",
        metadata: {
          kitId: kit.id,
          kitName: kit.name,
          deliverablesCount: kit.deliverables.length,
        },
      } as any);

      onNotify(
        `Production requested for ${kit.name}. KeedoHub Studio designers will deliver your completed assets.`,
        "success"
      );
    } catch (err: any) {
      onNotify(err.message || "Failed to request kit", "error");
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "Delivered":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "In Production":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "Review":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  return (
    <div className="workspace-page space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/20 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-0.5 text-[10px] font-bold tracking-wider text-red-400 uppercase">
              <Package className="w-3 h-3" />
              <span>Delivered Production Assets</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Artist Asset Kits
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-2xl">
              Turnkey, studio-produced creative kits delivered directly to your
              workspace. KeedoHub Studio designers create every deliverable—no
              DIY design required.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateSection?.("library")}
              className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-200 transition-colors cursor-pointer"
            >
              <span>View in Library</span>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Kit Grid and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: List of Reusable Kits */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold tracking-wider text-zinc-400 uppercase px-1">
            Production Kits
          </h3>
          <div className="space-y-2.5">
            {REUSABLE_KITS.map((kit) => {
              const isSelected = kit.id === selectedKitId;
              return (
                <div
                  key={kit.id}
                  onClick={() => setSelectedKitId(kit.id)}
                  className={`group rounded-2xl border p-4 transition-all cursor-pointer ${
                    isSelected
                      ? "border-red-500/60 bg-red-950/10 shadow-lg shadow-red-950/20"
                      : "border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-white group-hover:text-red-300 transition-colors">
                      {kit.name}
                    </h4>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${getStatusBadge(
                        kit.status
                      )}`}
                    >
                      {kit.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                    {kit.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-3 pt-2 border-t border-zinc-800/60">
                    <span>{kit.deliverables.length} Deliverables</span>
                    <span className="text-zinc-400">{kit.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Selected Kit Dossier & Deliverables */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-[10px] font-bold text-zinc-300">
                    {selectedKit.category}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getStatusBadge(
                      selectedKit.status
                    )}`}
                  >
                    {selectedKit.status}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {selectedKit.name}
                </h2>
                <p className="text-xs md:text-sm text-zinc-400">
                  {selectedKit.description}
                </p>
              </div>

              <button
                onClick={() => handleRequestKit(selectedKit)}
                disabled={isRequesting}
                className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-950/50 transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isRequesting
                    ? "Submitting..."
                    : selectedKit.status === "Delivered"
                    ? "Request Updated Kit"
                    : "Request This Kit from Studio"}
                </span>
              </button>
            </div>

            {/* Deliverables Checklist */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-500" />
                <span>Included Deliverables in this Kit</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedKit.deliverables.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-3.5 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-zinc-200">{item}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        Calibrated for master streaming & social specifications
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Studio Production Assurance */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">
                  Production by KeedoHub Designers
                </p>
                <p className="text-[11px] text-zinc-400">
                  Finished files are uploaded directly to your workspace Library
                  ready for high-resolution download.
                </p>
              </div>

              <button
                onClick={() => onNavigateSection?.("library")}
                className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-bold text-zinc-200 transition-colors cursor-pointer shrink-0"
              >
                Open Library
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
