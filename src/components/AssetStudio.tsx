import React, { useState, useRef, useEffect } from "react";
import { 
  ImageIcon, 
  Upload, 
  Download, 
  Sparkles, 
  Layers, 
  Check, 
  Copy, 
  Sliders, 
  RefreshCw, 
  Radio, 
  Tv, 
  Share2, 
  Music, 
  Flame, 
  Volume2, 
  Clock, 
  Eye, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Tag
} from "lucide-react";
import confetti from "canvas-confetti";

export interface BrandTemplate {
  id: string;
  name: string;
  category: string;
  canvasBg: string;
  accentColor: string;
  secondaryColor: string;
  badgeBg: string;
  badgeText: string;
  glowGradient: string;
  textColor: string;
  mutedColor: string;
  borderStyle: string;
}

export const BRAND_TEMPLATES: BrandTemplate[] = [
  {
    id: "keedohub-noir",
    name: "Keedohub Signature Noir",
    category: "Dark Luxury & Tech",
    canvasBg: "#09090B",
    accentColor: "#DC2626",
    secondaryColor: "#F59E0B",
    badgeBg: "rgba(220, 38, 38, 0.15)",
    badgeText: "#DC2626",
    glowGradient: "radial-gradient(circle at center, rgba(220, 38, 38, 0.18) 0%, rgba(9, 9, 11, 0.95) 75%)",
    textColor: "#FAFAFA",
    mutedColor: "#A1A1AA",
    borderStyle: "border-red-500/30",
  },
  {
    id: "solar-amber",
    name: "Solar Sunset Amber",
    category: "Afrobeats & High Energy",
    canvasBg: "#0D0907",
    accentColor: "#F97316",
    secondaryColor: "#F59E0B",
    badgeBg: "rgba(249, 115, 22, 0.15)",
    badgeText: "#F97316",
    glowGradient: "radial-gradient(circle at center, rgba(249, 115, 22, 0.22) 0%, rgba(13, 9, 7, 0.95) 75%)",
    textColor: "#FFFBEB",
    mutedColor: "#D6D3D1",
    borderStyle: "border-amber-500/30",
  },
  {
    id: "cyber-emerald",
    name: "Cyber Emerald Alté",
    category: "Electro & Underground",
    canvasBg: "#04140D",
    accentColor: "#10B981",
    secondaryColor: "#06B6D4",
    badgeBg: "rgba(16, 185, 129, 0.15)",
    badgeText: "#10B981",
    glowGradient: "radial-gradient(circle at center, rgba(16, 185, 129, 0.2) 0%, rgba(4, 20, 13, 0.95) 75%)",
    textColor: "#ECFDF5",
    mutedColor: "#A7F3D0",
    borderStyle: "border-emerald-500/30",
  },
  {
    id: "midnight-indigo",
    name: "Midnight Alté Indigo",
    category: "Moody R&B & Late Night",
    canvasBg: "#080914",
    accentColor: "#6366F1",
    secondaryColor: "#A855F7",
    badgeBg: "rgba(99, 102, 241, 0.15)",
    badgeText: "#818CF8",
    glowGradient: "radial-gradient(circle at center, rgba(99, 102, 241, 0.2) 0%, rgba(8, 9, 20, 0.95) 75%)",
    textColor: "#EEF2FF",
    mutedColor: "#C7D2FE",
    borderStyle: "border-indigo-500/30",
  },
  {
    id: "monochrome-minimal",
    name: "Monochrome Swiss Minimal",
    category: "Editorial & High Fashion",
    canvasBg: "#121214",
    accentColor: "#FFFFFF",
    secondaryColor: "#71717A",
    badgeBg: "rgba(255, 255, 255, 0.1)",
    badgeText: "#FFFFFF",
    glowGradient: "radial-gradient(circle at center, rgba(255, 255, 255, 0.08) 0%, rgba(18, 18, 20, 0.98) 75%)",
    textColor: "#FFFFFF",
    mutedColor: "#71717A",
    borderStyle: "border-zinc-700",
  }
];

export type SocialPlatform = "all" | "instagram-feed" | "tiktok-story" | "twitter-card" | "tiktok-sound";

export interface AssetStudioProps {
  trackTitle: string;
  artistName: string;
  genre: string;
  releaseDate: string;
  releaseType?: string;
  coverArtUrl: string;
  onCoverChange: (newUrl: string) => void;
  onNotify: (msg: string, type?: "success" | "info") => void;
}

// Fallback high-res procedural artwork generator
function createProceduralCover(title: string, artist: string, themeColor: string): string {
  const c = document.createElement("canvas");
  c.width = 1000;
  c.height = 1000;
  const ctx = c.getContext("2d");
  if (!ctx) return "";

  // Base background
  ctx.fillStyle = "#0A0A0E";
  ctx.fillRect(0, 0, 1000, 1000);

  // Gradient Orb
  const grad = ctx.createRadialGradient(500, 450, 50, 500, 450, 550);
  grad.addColorStop(0, themeColor || "#DC2626");
  grad.addColorStop(0.5, "rgba(20, 10, 15, 0.85)");
  grad.addColorStop(1, "#08080A");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1000, 1000);

  // Vinyl concentric groove lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.lineWidth = 1.5;
  for (let r = 80; r <= 480; r += 28) {
    ctx.beginPath();
    ctx.arc(500, 450, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Cross lines & grid
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(500, 0);
  ctx.lineTo(500, 1000);
  ctx.moveTo(0, 450);
  ctx.lineTo(1000, 450);
  ctx.stroke();

  // Top Badge
  ctx.fillStyle = themeColor || "#DC2626";
  ctx.font = "bold 24px 'Space Grotesk', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("KEEDOHUB MASTER SOUNDS • ARCHITECTURAL EDITION", 500, 80);

  // Big Monogram in center
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = "900 130px 'Space Grotesk', sans-serif";
  ctx.fillText("KH", 500, 485);

  // Title Box
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 44px 'Space Grotesk', sans-serif";
  ctx.fillText(title.toUpperCase(), 500, 840);

  ctx.fillStyle = "#A1A1AA";
  ctx.font = "26px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(artist.toUpperCase(), 500, 890);

  ctx.fillStyle = themeColor || "#DC2626";
  ctx.font = "bold 18px 'JetBrains Mono', monospace";
  ctx.fillText("OFFICIAL HIGH-FIDELITY MASTER", 500, 940);

  return c.toDataURL("image/jpeg", 0.92);
}

export const AssetStudio: React.FC<AssetStudioProps> = ({
  trackTitle,
  artistName,
  genre,
  releaseDate,
  releaseType = "Single",
  coverArtUrl,
  onCoverChange,
  onNotify
}) => {
  // Active Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("keedohub-noir");
  const currentTemplate = BRAND_TEMPLATES.find(t => t.id === selectedTemplateId) || BRAND_TEMPLATES[0];

  // Active View Filter
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>("all");

  // Customization Options
  const [badgeText, setBadgeText] = useState<string>("OUT NOW ON ALL PLATFORMS");
  const [ctaText, setCtaText] = useState<string>("LINK IN BIO TO STREAM");
  const [customSubtitle, setCustomSubtitle] = useState<string>(`Prod. by Keedohub Sound Labs`);
  const [showStreamingLogos, setShowStreamingLogos] = useState<boolean>(true);
  const [showWaveform, setShowWaveform] = useState<boolean>(true);
  const [showReleaseDate, setShowReleaseDate] = useState<boolean>(true);
  const [showSmartLinkPill, setShowSmartLinkPill] = useState<boolean>(true);

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExportingAll, setIsExportingAll] = useState<boolean>(false);

  // File upload input ref & drag states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Effective artwork fallback
  const [effectiveArt, setEffectiveArt] = useState<string>(coverArtUrl);

  useEffect(() => {
    if (coverArtUrl && coverArtUrl.length > 5) {
      setEffectiveArt(coverArtUrl);
    } else {
      const generated = createProceduralCover(trackTitle, artistName, currentTemplate.accentColor);
      setEffectiveArt(generated);
    }
  }, [coverArtUrl, trackTitle, artistName, currentTemplate.accentColor]);

  // Handle local image file upload
  const processImageFile = (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      onNotify("Image size must be under 20MB", "info");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onCoverChange(result);
        setEffectiveArt(result);
        onNotify("Cover Art loaded into Asset Studio!", "success");
        try {
          confetti({ particleCount: 50, spread: 45, origin: { y: 0.7 } });
        } catch (e) {}
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processImageFile(file);
    }
  };

  // Sample preset artworks
  const loadPresetArtwork = (presetType: string) => {
    let color = "#DC2626";
    if (presetType === "amber") color = "#F97316";
    if (presetType === "emerald") color = "#10B981";
    if (presetType === "indigo") color = "#6366F1";
    if (presetType === "white") color = "#FFFFFF";
    
    const art = createProceduralCover(trackTitle, artistName, color);
    onCoverChange(art);
    setEffectiveArt(art);
    onNotify(`Loaded ${presetType.toUpperCase()} Artwork Template`, "info");
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify("Copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Render Canvas for Download
  const generateCanvasImage = (format: "instagram" | "story" | "twitter" | "tiktok-sound"): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("");
        return;
      }

      let width = 1080;
      let height = 1080;

      if (format === "story" || format === "tiktok-sound") {
        width = 1080;
        height = 1920;
      } else if (format === "twitter") {
        width = 1920;
        height = 1080;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw background
      ctx.fillStyle = currentTemplate.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Draw glowing radial gradient
      const grad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.7);
      grad.addColorStop(0, currentTemplate.accentColor + "28");
      grad.addColorStop(0.7, currentTemplate.canvasBg);
      grad.addColorStop(1, currentTemplate.canvasBg);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (format === "instagram") {
          // 1:1 Instagram Square
          const imgSize = 640;
          const imgX = (width - imgSize) / 2;
          const imgY = 140;

          // Shadow
          ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
          ctx.shadowBlur = 45;
          ctx.shadowOffsetY = 24;
          ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
          ctx.shadowColor = "transparent";

          // Border outline
          ctx.strokeStyle = currentTemplate.accentColor + "50";
          ctx.lineWidth = 4;
          ctx.strokeRect(imgX, imgY, imgSize, imgSize);

          // Top Badge Tag
          ctx.fillStyle = currentTemplate.accentColor;
          ctx.font = "bold 26px 'Space Grotesk', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`• ${badgeText.toUpperCase()} •`, width / 2, 85);

          // Title
          ctx.fillStyle = currentTemplate.textColor;
          ctx.font = "bold 44px 'Space Grotesk', sans-serif";
          ctx.fillText(trackTitle, width / 2, 835);

          // Artist & Genre
          ctx.fillStyle = currentTemplate.mutedColor;
          ctx.font = "26px 'Plus Jakarta Sans', sans-serif";
          ctx.fillText(`${artistName} • ${genre}`, width / 2, 885);

          if (customSubtitle) {
            ctx.fillStyle = currentTemplate.accentColor;
            ctx.font = "bold 20px 'JetBrains Mono', monospace";
            ctx.fillText(customSubtitle.toUpperCase(), width / 2, 930);
          }

          // Streaming row
          if (showStreamingLogos) {
            ctx.fillStyle = currentTemplate.textColor;
            ctx.font = "bold 19px 'JetBrains Mono', monospace";
            ctx.fillText(`SPOTIFY • APPLE MUSIC • AUDIOMACK • BOOMPLAY • TIDAL`, width / 2, 990);
          }

          // Watermark
          ctx.fillStyle = currentTemplate.mutedColor;
          ctx.font = "16px 'JetBrains Mono', monospace";
          ctx.fillText("KEEDOHUB ARTIST OS • OFFICIAL RELEASE SPEC", width / 2, 1035);

        } else if (format === "story" || format === "tiktok-sound") {
          // 9:16 Story / TikTok
          const imgSize = 740;
          const imgX = (width - imgSize) / 2;
          const imgY = 460;

          // Ambient blurred cover behind
          ctx.save();
          ctx.filter = "blur(40px) brightness(0.35)";
          ctx.drawImage(img, (width - 1200) / 2, (height - 1200) / 2, 1200, 1200);
          ctx.restore();

          // Main Artwork Shadow
          ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
          ctx.shadowBlur = 60;
          ctx.shadowOffsetY = 30;
          ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
          ctx.shadowColor = "transparent";

          // Border outline
          ctx.strokeStyle = currentTemplate.accentColor + "60";
          ctx.lineWidth = 5;
          ctx.strokeRect(imgX, imgY, imgSize, imgSize);

          // Top Branding
          ctx.fillStyle = currentTemplate.mutedColor;
          ctx.font = "bold 22px 'JetBrains Mono', monospace";
          ctx.textAlign = "center";
          ctx.fillText("KEEDOHUB ARTIST OS • GLOBAL BROADCAST", width / 2, 280);

          // Badge Pill
          ctx.fillStyle = currentTemplate.accentColor;
          ctx.font = "bold 32px 'Space Grotesk', sans-serif";
          ctx.fillText(`🔥 ${badgeText.toUpperCase()}`, width / 2, 360);

          // Title & Artist
          ctx.fillStyle = currentTemplate.textColor;
          ctx.font = "bold 56px 'Space Grotesk', sans-serif";
          ctx.fillText(trackTitle, width / 2, 1290);

          ctx.fillStyle = currentTemplate.mutedColor;
          ctx.font = "bold 34px 'Plus Jakarta Sans', sans-serif";
          ctx.fillText(artistName, width / 2, 1350);

          if (showReleaseDate) {
            ctx.fillStyle = currentTemplate.accentColor;
            ctx.font = "bold 24px 'JetBrains Mono', monospace";
            ctx.fillText(`RELEASE: ${releaseDate} • ${genre.toUpperCase()}`, width / 2, 1410);
          }

          // CTA Pill
          ctx.fillStyle = currentTemplate.accentColor;
          ctx.beginPath();
          ctx.roundRect((width - 560) / 2, 1500, 560, 84, 42);
          ctx.fill();

          ctx.fillStyle = "#000000";
          ctx.font = "bold 30px 'Space Grotesk', sans-serif";
          ctx.fillText(ctaText.toUpperCase(), width / 2, 1552);

          if (showStreamingLogos) {
            ctx.fillStyle = currentTemplate.textColor;
            ctx.font = "18px 'JetBrains Mono', monospace";
            ctx.fillText("STREAMING ON ALL DIGITAL PLATFORMS", width / 2, 1660);
          }

        } else if (format === "twitter") {
          // 16:9 Twitter / X Landscape
          const imgSize = 640;
          const imgX = 140;
          const imgY = (height - imgSize) / 2;

          ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
          ctx.shadowBlur = 40;
          ctx.shadowOffsetY = 15;
          ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
          ctx.shadowColor = "transparent";

          ctx.strokeStyle = currentTemplate.accentColor + "50";
          ctx.lineWidth = 4;
          ctx.strokeRect(imgX, imgY, imgSize, imgSize);

          const textX = 840;
          ctx.textAlign = "left";

          // Badge
          ctx.fillStyle = currentTemplate.accentColor;
          ctx.font = "bold 26px 'Space Grotesk', sans-serif";
          ctx.fillText(`• ${badgeText.toUpperCase()}`, textX, 330);

          // Track Title
          ctx.fillStyle = currentTemplate.textColor;
          ctx.font = "bold 60px 'Space Grotesk', sans-serif";
          ctx.fillText(trackTitle, textX, 420);

          // Artist
          ctx.fillStyle = currentTemplate.mutedColor;
          ctx.font = "36px 'Plus Jakarta Sans', sans-serif";
          ctx.fillText(artistName, textX, 485);

          // Metadata Details
          ctx.fillStyle = currentTemplate.accentColor;
          ctx.font = "bold 22px 'JetBrains Mono', monospace";
          ctx.fillText(`GENRE: ${genre.toUpperCase()} | DROP: ${releaseDate}`, textX, 555);

          if (customSubtitle) {
            ctx.fillStyle = currentTemplate.mutedColor;
            ctx.font = "22px 'Plus Jakarta Sans', sans-serif";
            ctx.fillText(customSubtitle, textX, 605);
          }

          if (showStreamingLogos) {
            ctx.fillStyle = currentTemplate.textColor;
            ctx.font = "bold 20px 'JetBrains Mono', monospace";
            ctx.fillText("SPOTIFY • APPLE MUSIC • AUDIOMACK • BOOMPLAY • TIDAL", textX, 675);
          }

          // CTA Pill
          ctx.fillStyle = currentTemplate.accentColor;
          ctx.beginPath();
          ctx.roundRect(textX, 730, 420, 64, 32);
          ctx.fill();

          ctx.fillStyle = "#000000";
          ctx.font = "bold 24px 'Space Grotesk', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(ctaText.toUpperCase(), textX + 210, 770);
        }

        resolve(canvas.toDataURL("image/png", 0.95));
      };

      img.onerror = () => {
        // Fallback procedural
        const fallback = createProceduralCover(trackTitle, artistName, currentTemplate.accentColor);
        img.src = fallback;
      };

      img.src = effectiveArt;
    });
  };

  // Download Single Card
  const downloadSingleCard = async (format: "instagram" | "story" | "twitter" | "tiktok-sound", label: string) => {
    onNotify(`Generating ${label} Asset...`, "info");
    const dataUrl = await generateCanvasImage(format);
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${artistName.replace(/\s+/g, "_")}_${trackTitle.replace(/\s+/g, "_")}_${label.replace(/\s+/g, "_")}_Promo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onNotify(`Exported ${label} promo asset!`, "success");
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch (e) {}
  };

  // Download All Assets Pack
  const downloadAllAssetsPack = async () => {
    setIsExportingAll(true);
    onNotify("Rendering multi-platform asset bundle...", "info");

    const formats: { format: "instagram" | "story" | "twitter"; label: string }[] = [
      { format: "instagram", label: "Instagram_Feed_1x1" },
      { format: "story", label: "TikTok_Story_9x16" },
      { format: "twitter", label: "Twitter_Card_16x9" },
    ];

    for (let i = 0; i < formats.length; i++) {
      const item = formats[i];
      const dataUrl = await generateCanvasImage(item.format);
      if (dataUrl) {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${artistName.replace(/\s+/g, "_")}_${trackTitle.replace(/\s+/g, "_")}_${item.label}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Small delay to allow browser downloads
        await new Promise(r => setTimeout(r, 400));
      }
    }

    setIsExportingAll(false);
    onNotify("Complete Social Media Asset Pack exported!", "success");
    try {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    } catch (e) {}
  };

  // Pre-formatted copy hooks
  const igCaption = `🔥 ${badgeText}! "${trackTitle}" by @${artistName.replace(/\s+/g, "").toLowerCase()} is officially out now worldwide on all streaming platforms! 🎧✨\n\n${customSubtitle}\n\nStream now via the link in my bio. Tag someone who needs this on their playlist! 🚀\n\n#${genre.replace(/[^a-zA-Z0-9]/g, "")} #NewMusicAlert #NowStreaming #${artistName.replace(/[^a-zA-Z0-9]/g, "")} #KeedohubOS`;
  const tiktokCaption = `"${trackTitle}" drops right now! Use this official sound for your next video ⚡ Drop your honest rating 1-10 in the comments! #NewMusic #${artistName.replace(/[^a-zA-Z0-9]/g, "")} #Afrobeats #TrendingSound`;
  const twitterPost = `🚀 OFFICIAL RELEASE: "${trackTitle}" by ${artistName} is out now everywhere!\n\n🎧 Stream on Spotify, Apple Music & Audiomack:\n👉 [Your Pre-Save / SmartLink Here]\n\nRT & tell me your favorite lyric! #NewMusic #${artistName.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner with Quick Actions */}
      <div className="bento-card p-4 sm:p-6 border-[var(--bento-border)] space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--bento-border)] pb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F97316]/15 border border-[#F97316]/30 flex items-center justify-center text-[#F97316]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] text-base sm:text-lg font-bold text-[var(--bento-text)] flex items-center gap-2">
                <span>Asset Studio: Multi-Platform Social Card Generator</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/30">
                  SYSTEM READY
                </span>
              </h3>
              <p className="text-xs text-[var(--bento-muted)]">
                Upload your cover art to auto-generate matching high-res promotional assets for Instagram, TikTok, and Twitter.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadAllAssetsPack}
              disabled={isExportingAll}
              className="px-4 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-black font-bold text-xs font-mono flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#F97316]/20 transition-all disabled:opacity-50 min-h-[44px] min-w-[44px]"
            >
              {isExportingAll ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Packaging Assets...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Complete Pack (All 3 Cards)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Brand Theme Selector Row */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[var(--bento-muted)] uppercase tracking-wider font-bold">
              1. Select Brand Design Template:
            </span>
            <span className="text-[#F97316] font-semibold">{currentTemplate.name} ({currentTemplate.category})</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {BRAND_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplateId === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => {
                    setSelectedTemplateId(tmpl.id);
                    onNotify(`Switched to ${tmpl.name}`, "info");
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between min-h-[72px] min-w-[44px] ${
                    isSelected
                      ? "bg-[var(--bento-elevated)] border-[#F97316] shadow-md shadow-[#F97316]/15"
                      : "bg-[var(--bento-input)] border-[var(--bento-border)] hover:border-[#F97316]/50"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold truncate text-[var(--bento-text)]">{tmpl.name}</span>
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: tmpl.accentColor }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--bento-muted)] truncate">{tmpl.category}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Workspace: Controls & Uploader (Left) + Multi-Platform Previews (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Cover Art Upload & Customization Suite */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Cover Art Drag & Drop Box */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`bento-card p-4 sm:p-5 space-y-3.5 border-2 transition-all ${
              isDragging ? "border-[#F97316] bg-[#F97316]/10" : "border-[var(--bento-border)]"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--bento-border)]">
              <h4 className="text-xs font-mono font-bold uppercase text-[var(--bento-text)] flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Cover Art Source</span>
              </h4>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            {/* Artwork Preview Card */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-black border border-[var(--bento-border)] shrink-0 shadow-md relative group">
                <img 
                  src={effectiveArt} 
                  alt="Current Cover Art" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                />
              </div>

              <div className="flex-1 w-full space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-black font-bold text-xs font-mono flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#F97316]/20 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Artwork File</span>
                </button>

                <div className="text-[10px] text-[var(--bento-muted)] font-mono flex items-center justify-between">
                  <span>PNG, JPG, WEBP</span>
                  <span>Max 20MB</span>
                </div>
              </div>
            </div>

            {/* Quick Sample Artworks Fallback with >=44px Touch Targets */}
            <div className="pt-2 border-t border-[var(--bento-border)] space-y-2">
              <div className="text-[10px] font-mono text-[var(--bento-muted)] uppercase">
                Or Use Built-in Cover Art Presets:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => loadPresetArtwork("red")}
                  className="min-h-[44px] py-2 px-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-700/50 text-xs font-mono font-semibold text-red-300 text-center cursor-pointer transition-colors flex items-center justify-center"
                >
                  Crimson
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetArtwork("amber")}
                  className="min-h-[44px] py-2 px-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-700/50 text-xs font-mono font-semibold text-amber-300 text-center cursor-pointer transition-colors flex items-center justify-center"
                >
                  Amber
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetArtwork("emerald")}
                  className="min-h-[44px] py-2 px-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 text-xs font-mono font-semibold text-emerald-300 text-center cursor-pointer transition-colors flex items-center justify-center"
                >
                  Emerald
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetArtwork("indigo")}
                  className="min-h-[44px] py-2 px-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/50 text-xs font-mono font-semibold text-indigo-300 text-center cursor-pointer transition-colors flex items-center justify-center"
                >
                  Indigo
                </button>
              </div>
            </div>
          </div>

          {/* Card Text & Copy Customizer */}
          <div className="bento-card p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--bento-border)]">
              <h4 className="text-xs font-mono font-bold uppercase text-[var(--bento-text)] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Text & Badge Controls</span>
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              {/* Release Badge Input */}
              <div>
                <label className="block text-[var(--bento-text)] font-semibold mb-1">
                  Release Status Badge Text
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g. OUT NOW ON ALL PLATFORMS"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] font-mono focus:outline-none focus:border-[#F97316] min-h-[44px]"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">
                  {["OUT NOW ON ALL PLATFORMS", "PRE-SAVE NOW", "DROPPING FRIDAY", "OFFICIAL MUSIC VIDEO"].map((b, bIdx) => (
                    <button
                      key={bIdx}
                      type="button"
                      onClick={() => setBadgeText(b)}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-[#F97316]/50 text-xs font-mono text-[var(--bento-muted)] hover:text-[var(--bento-text)] cursor-pointer flex items-center justify-center text-center font-medium transition-colors"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Call To Action Text */}
              <div>
                <label className="block text-[var(--bento-text)] font-semibold mb-1">
                  Call-To-Action (CTA) Pill
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="e.g. LINK IN BIO TO STREAM"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] font-mono focus:outline-none focus:border-[#F97316] min-h-[44px]"
                />
              </div>

              {/* Subtitle / Producer Credits */}
              <div>
                <label className="block text-[var(--bento-text)] font-semibold mb-1">
                  Producer / Label Credits
                </label>
                <input
                  type="text"
                  value={customSubtitle}
                  onChange={(e) => setCustomSubtitle(e.target.value)}
                  placeholder="e.g. Prod. by Keedohub Sound Labs"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] font-mono focus:outline-none focus:border-[#F97316] min-h-[44px]"
                />
              </div>

              {/* Toggle Switches with Touch-Friendly Hit Areas */}
              <div className="space-y-2 pt-2 border-t border-[var(--bento-border)]">
                <label className="flex items-center justify-between text-xs cursor-pointer text-[var(--bento-text)] min-h-[44px] py-1 px-1">
                  <span>Display Streaming DSP Badges (Spotify, Apple, etc.)</span>
                  <input
                    type="checkbox"
                    checked={showStreamingLogos}
                    onChange={(e) => setShowStreamingLogos(e.target.checked)}
                    className="accent-[#F97316] w-5 h-5 rounded cursor-pointer shrink-0"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer text-[var(--bento-text)] min-h-[44px] py-1 px-1">
                  <span>Show Release Date & Genre Tags</span>
                  <input
                    type="checkbox"
                    checked={showReleaseDate}
                    onChange={(e) => setShowReleaseDate(e.target.checked)}
                    className="accent-[#F97316] w-5 h-5 rounded cursor-pointer shrink-0"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Ready-to-Copy Platform Captions Card */}
          <div className="bento-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--bento-border)]">
              <h4 className="text-xs font-mono font-bold uppercase text-[var(--bento-text)] flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Ready-To-Copy Social Captions</span>
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              {/* Instagram Copy */}
              <div className="p-3.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#F97316] font-bold">📸 INSTAGRAM CAPTION</span>
                  <button
                    onClick={() => copyText(igCaption, "copy-ig")}
                    className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-[var(--bento-card)] hover:bg-[var(--bento-elevated)] text-xs font-mono text-[var(--bento-text)] flex items-center justify-center gap-1.5 border border-[var(--bento-border)] hover:border-[#F97316]/50 cursor-pointer transition-colors"
                  >
                    {copiedId === "copy-ig" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === "copy-ig" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[var(--bento-muted)] line-clamp-2 leading-relaxed">
                  {igCaption}
                </p>
              </div>

              {/* TikTok Copy */}
              <div className="p-3.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-amber-400 font-bold">🎵 TIKTOK HOOK & SOUND</span>
                  <button
                    onClick={() => copyText(tiktokCaption, "copy-tt")}
                    className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-[var(--bento-card)] hover:bg-[var(--bento-elevated)] text-xs font-mono text-[var(--bento-text)] flex items-center justify-center gap-1.5 border border-[var(--bento-border)] hover:border-amber-400/50 cursor-pointer transition-colors"
                  >
                    {copiedId === "copy-tt" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === "copy-tt" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[var(--bento-muted)] line-clamp-2 leading-relaxed">
                  {tiktokCaption}
                </p>
              </div>

              {/* Twitter / X Copy */}
              <div className="p-3.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-indigo-400 font-bold">🐦 TWITTER / X POST</span>
                  <button
                    onClick={() => copyText(twitterPost, "copy-tw")}
                    className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-[var(--bento-card)] hover:bg-[var(--bento-elevated)] text-xs font-mono text-[var(--bento-text)] flex items-center justify-center gap-1.5 border border-[var(--bento-border)] hover:border-indigo-400/50 cursor-pointer transition-colors"
                  >
                    {copiedId === "copy-tw" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === "copy-tw" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[var(--bento-muted)] line-clamp-2 leading-relaxed">
                  {twitterPost}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Platform Live Visual Showcase */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Format Sub-Navigation Filter with >=44px Touch Targets */}
          <div className="bento-card p-1.5 sm:p-2">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              <button
                onClick={() => setActivePlatform("all")}
                className={`py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer min-h-[44px] min-w-[44px] ${
                  activePlatform === "all"
                    ? "bg-[#F97316] text-black font-bold shadow-md shadow-[#F97316]/20"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>All Platforms (Grid View)</span>
              </button>

              <button
                onClick={() => setActivePlatform("instagram-feed")}
                className={`py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer min-h-[44px] min-w-[44px] ${
                  activePlatform === "instagram-feed"
                    ? "bg-[#F97316] text-black font-bold shadow-md shadow-[#F97316]/20"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Instagram Feed (1:1)</span>
              </button>

              <button
                onClick={() => setActivePlatform("tiktok-story")}
                className={`py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer min-h-[44px] min-w-[44px] ${
                  activePlatform === "tiktok-story"
                    ? "bg-[#F97316] text-black font-bold shadow-md shadow-[#F97316]/20"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                }`}
              >
                <Tv className="w-4 h-4" />
                <span>TikTok / IG Story (9:16)</span>
              </button>

              <button
                onClick={() => setActivePlatform("twitter-card")}
                className={`py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer min-h-[44px] min-w-[44px] ${
                  activePlatform === "twitter-card"
                    ? "bg-[#F97316] text-black font-bold shadow-md shadow-[#F97316]/20"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>Twitter / X Card (16:9)</span>
              </button>
            </div>
          </div>

          {/* Social Cards Visual Matrix */}
          <div className="space-y-6">
            
            {/* 1. INSTAGRAM FEED (1:1 SQUARE) */}
            {(activePlatform === "all" || activePlatform === "instagram-feed") && (
              <div className="bento-card p-4 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--bento-border)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                    <h4 className="text-xs sm:text-sm font-mono font-bold uppercase text-[var(--bento-text)]">
                      Instagram Square Post (1:1 • 1080x1080)
                    </h4>
                  </div>

                  <button
                    onClick={() => downloadSingleCard("instagram", "Instagram_Feed")}
                    className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-[#F97316]/50 text-xs font-mono text-[var(--bento-text)] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4 text-[#F97316]" />
                    <span>Download 1:1 PNG</span>
                  </button>
                </div>

                {/* Rendered 1:1 Card Mockup */}
                <div className="flex justify-center p-4 sm:p-6 bg-black/40 rounded-2xl border border-[var(--bento-border)]">
                  <div 
                    className="w-full max-w-sm aspect-square rounded-2xl p-5 sm:p-6 flex flex-col justify-between items-center text-center shadow-2xl relative overflow-hidden transition-all"
                    style={{ 
                      backgroundColor: currentTemplate.canvasBg,
                      border: `1px solid ${currentTemplate.accentColor}30`,
                      color: currentTemplate.textColor
                    }}
                  >
                    {/* Background Radial Glow */}
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-60"
                      style={{ background: currentTemplate.glowGradient }}
                    />

                    {/* Top Tag */}
                    <div 
                      className="relative z-10 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase"
                      style={{ 
                        backgroundColor: currentTemplate.badgeBg, 
                        color: currentTemplate.badgeText,
                        border: `1px solid ${currentTemplate.accentColor}40`
                      }}
                    >
                      {badgeText}
                    </div>

                    {/* Artwork Container */}
                    <div 
                      className="relative z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-xl overflow-hidden shadow-2xl my-2 shrink-0 group transition-transform"
                      style={{ 
                        border: `2px solid ${currentTemplate.accentColor}50`,
                        boxShadow: `0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 25px ${currentTemplate.accentColor}25`
                      }}
                    >
                      <img src={effectiveArt} alt="Artwork" className="w-full h-full object-cover" />
                    </div>

                    {/* Meta Info */}
                    <div className="relative z-10 space-y-1 w-full px-2">
                      <h4 className="font-['Space_Grotesk'] text-base sm:text-lg font-bold tracking-tight truncate max-w-[280px] mx-auto" style={{ color: currentTemplate.textColor }}>
                        {trackTitle}
                      </h4>
                      <p className="text-xs font-medium truncate" style={{ color: currentTemplate.mutedColor }}>
                        {artistName} • {genre}
                      </p>

                      {showStreamingLogos && (
                        <div className="text-[9px] font-mono pt-1 tracking-wider uppercase" style={{ color: currentTemplate.accentColor }}>
                          SPOTIFY • APPLE MUSIC • AUDIOMACK
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TIKTOK & INSTAGRAM STORY (9:16 VERTICAL) */}
            {(activePlatform === "all" || activePlatform === "tiktok-story") && (
              <div className="bento-card p-4 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--bento-border)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <h4 className="text-xs sm:text-sm font-mono font-bold uppercase text-[var(--bento-text)]">
                      TikTok & IG Story Video Card (9:16 • 1080x1920)
                    </h4>
                  </div>

                  <button
                    onClick={() => downloadSingleCard("story", "TikTok_Story_9x16")}
                    className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-emerald-400/50 text-xs font-mono text-[var(--bento-text)] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download 9:16 PNG</span>
                  </button>
                </div>

                {/* Rendered 9:16 Vertical Card Mockup */}
                <div className="flex justify-center p-4 sm:p-6 bg-black/40 rounded-2xl border border-[var(--bento-border)]">
                  <div 
                    className="w-72 aspect-[9/16] rounded-2xl p-5 flex flex-col justify-between items-center text-center shadow-2xl relative overflow-hidden transition-all"
                    style={{ 
                      backgroundColor: currentTemplate.canvasBg,
                      border: `1px solid ${currentTemplate.accentColor}40`,
                      color: currentTemplate.textColor
                    }}
                  >
                    {/* Blurred Backdrop */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 pointer-events-none scale-125"
                      style={{ backgroundImage: `url(${effectiveArt})` }}
                    />
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: currentTemplate.glowGradient }}
                    />

                    {/* Top Tag */}
                    <div className="relative z-10 space-y-1 w-full">
                      <span className="text-[9px] font-mono uppercase tracking-wider block" style={{ color: currentTemplate.mutedColor }}>
                        KEEDOHUB SOUND SYSTEM
                      </span>
                      <div 
                        className="px-3 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase inline-block"
                        style={{ backgroundColor: currentTemplate.accentColor, color: "#000000" }}
                      >
                        🔥 {badgeText}
                      </div>
                    </div>

                    {/* Central 3D Artwork */}
                    <div 
                      className="relative z-10 w-44 h-44 rounded-2xl overflow-hidden my-auto shadow-2xl shrink-0"
                      style={{ 
                        border: `2px solid ${currentTemplate.accentColor}70`,
                        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 35px ${currentTemplate.accentColor}30`
                      }}
                    >
                      <img src={effectiveArt} alt="Artwork" className="w-full h-full object-cover" />
                    </div>

                    {/* Bottom Metadata & CTA Button */}
                    <div className="relative z-10 space-y-2 w-full">
                      <div>
                        <h4 className="font-['Space_Grotesk'] text-base font-bold truncate" style={{ color: currentTemplate.textColor }}>
                          {trackTitle}
                        </h4>
                        <p className="text-xs truncate font-medium" style={{ color: currentTemplate.mutedColor }}>
                          {artistName}
                        </p>
                        {showReleaseDate && (
                          <p className="text-[9px] font-mono mt-0.5" style={{ color: currentTemplate.accentColor }}>
                            Drop: {releaseDate} • {genre}
                          </p>
                        )}
                      </div>

                      {/* CTA Button */}
                      <div 
                        className="py-2.5 px-4 rounded-xl font-bold text-xs font-mono uppercase tracking-wider shadow-lg min-h-[44px] flex items-center justify-center"
                        style={{ backgroundColor: currentTemplate.accentColor, color: "#000000" }}
                      >
                        {ctaText}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. TWITTER / X & FACEBOOK (16:9 LANDSCAPE) */}
            {(activePlatform === "all" || activePlatform === "twitter-card") && (
              <div className="bento-card p-4 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--bento-border)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                    <h4 className="text-xs sm:text-sm font-mono font-bold uppercase text-[var(--bento-text)]">
                      Twitter / X & Web PR Card (16:9 • 1920x1080)
                    </h4>
                  </div>

                  <button
                    onClick={() => downloadSingleCard("twitter", "Twitter_Landscape_16x9")}
                    className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-indigo-400/50 text-xs font-mono text-[var(--bento-text)] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4 text-indigo-400" />
                    <span>Download 16:9 PNG</span>
                  </button>
                </div>

                {/* Rendered 16:9 Landscape Card Mockup */}
                <div className="flex justify-center p-4 sm:p-6 bg-black/40 rounded-2xl border border-[var(--bento-border)]">
                  <div 
                    className="w-full max-w-2xl aspect-[16/9] rounded-2xl p-5 sm:p-8 flex items-center justify-between gap-5 sm:gap-6 shadow-2xl relative overflow-hidden text-left transition-all"
                    style={{ 
                      backgroundColor: currentTemplate.canvasBg,
                      border: `1px solid ${currentTemplate.accentColor}40`,
                      color: currentTemplate.textColor
                    }}
                  >
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-50"
                      style={{ background: currentTemplate.glowGradient }}
                    />

                    {/* Left Cover Art */}
                    <div 
                      className="relative z-10 w-36 h-36 sm:w-48 sm:h-48 rounded-xl overflow-hidden shrink-0 shadow-2xl"
                      style={{ 
                        border: `2px solid ${currentTemplate.accentColor}50`,
                        boxShadow: `0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 25px ${currentTemplate.accentColor}25`
                      }}
                    >
                      <img src={effectiveArt} alt="Artwork" className="w-full h-full object-cover" />
                    </div>

                    {/* Right Metadata */}
                    <div className="relative z-10 space-y-2 flex-1 min-w-0">
                      <span 
                        className="text-[10px] font-mono font-bold uppercase tracking-wider block"
                        style={{ color: currentTemplate.accentColor }}
                      >
                        • {badgeText}
                      </span>

                      <h4 className="font-['Space_Grotesk'] text-lg sm:text-2xl font-bold leading-tight truncate" style={{ color: currentTemplate.textColor }}>
                        {trackTitle}
                      </h4>

                      <p className="text-xs sm:text-sm font-medium" style={{ color: currentTemplate.mutedColor }}>
                        {artistName} • {genre}
                      </p>

                      <p className="text-[10px] font-mono" style={{ color: currentTemplate.accentColor }}>
                        Release: {releaseDate} | Keedohub OS
                      </p>

                      {showStreamingLogos && (
                        <div className="text-[9px] font-mono pt-1 text-zinc-400 tracking-wider truncate">
                          STREAMING ON SPOTIFY • APPLE MUSIC • AUDIOMACK • BOOMPLAY
                        </div>
                      )}

                      {/* CTA Pill */}
                      <div 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase shadow"
                        style={{ backgroundColor: currentTemplate.accentColor, color: "#000000" }}
                      >
                        <span>{ctaText}</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
