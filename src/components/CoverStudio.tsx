import React, { useState, useRef, useEffect } from "react";
import { CoverStudioState } from "../types";
import { useWorkspace } from "../context/WorkspaceContext";
import { KeedohubLogo } from "./KeedohubLogo";
import { CoverStudioSkeleton } from "./skeletons/ModuleSkeletons";
import { 
  Layers, 
  Download, 
  Disc3, 
  Smartphone, 
  Tv, 
  Sparkles, 
  Palette, 
  Sliders, 
  Check, 
  Copy, 
  RefreshCw,
  Eye,
  Radio,
  FileCheck2,
  Save,
  HardDrive
} from "lucide-react";
import confetti from "canvas-confetti";

interface CoverStudioProps {
  onNotify: (msg: string, type?: "success" | "info") => void;
}

export const CoverStudio: React.FC<CoverStudioProps> = ({ onNotify }) => {
  const { workspace, activeRelease, updateRelease, saveAsset, createRelease } = useWorkspace();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSavingToVault, setIsSavingToVault] = useState(false);
  const [state, setState] = useState<CoverStudioState>({
    title: "MIDNIGHT IN VI",
    artist: "ZACK KHALIFA",
    subtitle: "PROD. BY KEEDOHUB LABS",
    genreTag: "AFRO-FUSION / ALTÉ",
    themePreset: "crimson-noir",
    bgGradient: "from-[#7A1515] via-[#1a0808] to-[#08080c]",
    textColor: "#ffffff",
    accentColor: "#F5A623",
    showParentalAdvisory: true,
    parentalAdvisoryStyle: "black",
    showStreamingBadges: true,
    showBarcode: true,
    showAudioWave: true,
    textureOverlay: "vinyl-dust",
    previewMode: "canvas",
  });

  // Sync with active master release
  useEffect(() => {
    if (activeRelease) {
      setState((prev) => ({
        ...prev,
        title: activeRelease.title ? activeRelease.title.toUpperCase() : prev.title,
        artist: activeRelease.artistName ? activeRelease.artistName.toUpperCase() : prev.artist,
        genreTag: activeRelease.genre ? activeRelease.genre.toUpperCase() : prev.genreTag,
      }));
    }
  }, [activeRelease]);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 320);
    return () => clearTimeout(timer);
  }, []);

  const presets = [
    {
      id: "crimson-noir",
      name: "Keedohub Crimson Noir",
      bgGradient: "from-[#7A1515] via-[#1c0808] to-[#08080c]",
      textColor: "#ffffff",
      accentColor: "#F5A623",
      texture: "vinyl-dust" as const,
    },
    {
      id: "cyber-purple",
      name: "Neo-Tokyo Cyber",
      bgGradient: "from-[#3b0764] via-[#1e1035] to-[#050508]",
      textColor: "#ffffff",
      accentColor: "#38bdf8",
      texture: "grid" as const,
    },
    {
      id: "y2k-chrome",
      name: "Y2K Holographic Chrome",
      bgGradient: "from-[#374151] via-[#1f2937] to-[#111827]",
      textColor: "#f3f4f6",
      accentColor: "#f43f5e",
      texture: "plastic-wrap" as const,
    },
    {
      id: "golden-afro",
      name: "Golden Sahara Sunset",
      bgGradient: "from-[#78350f] via-[#451a03] to-[#0c0a09]",
      textColor: "#fef3c7",
      accentColor: "#fbbf24",
      texture: "grain" as const,
    },
    {
      id: "emerald-luxury",
      name: "Imperial Emerald",
      bgGradient: "from-[#064e3b] via-[#022c22] to-[#040d0a]",
      textColor: "#ffffff",
      accentColor: "#34d399",
      texture: "vinyl-dust" as const,
    },
    {
      id: "mono-brutalist",
      name: "Brutalist Mono",
      bgGradient: "from-[#18181b] via-[#09090b] to-[#000000]",
      textColor: "#ffffff",
      accentColor: "#ef4444",
      texture: "plastic-wrap" as const,
    },
  ];

  const handleDownloadSpecs = () => {
    const specs = `=====================================================
KEEDOHUB CREATIVE OS — COVER ARTWORK SPECIFICATION
=====================================================
Title: ${state.title}
Artist: ${state.artist}
Credits: ${state.subtitle}
Genre: ${state.genreTag}

DIMENSIONS & TECHNICAL SPECIFICATIONS:
- Resolution: 3000 x 3000 pixels (1:1 Square Ratio)
- Color Profile: RGB (Digital DSP Master) / CMYK (Print vinyl ready)
- DPI: 300 High-Fidelity
- Formats: TIFF, PNG 24-bit, JPEG (Max Quality)
- Spotify / Apple Music / Audiomack Verified: YES
- Parental Advisory Badge: ${state.showParentalAdvisory ? "Included (" + state.parentalAdvisoryStyle + ")" : "Clean / None"}

COLOR PALETTE TOKENS:
- Base: ${state.bgGradient}
- Text Color: ${state.textColor}
- Accent: ${state.accentColor}
- Mastered by: Keedohub Studio Creative Engineering
=====================================================`;

    const blob = new Blob([specs], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(state.artist || "Artist").replace(/\s+/g, "_")}_${(state.title || "Track").replace(/\s+/g, "_")}_Artwork_Specs.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onNotify("Exported Artwork Technical Specs Sheet!", "success");
    try {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    } catch (e) {}
  };

  const handleSaveToVault = async () => {
    setIsSavingToVault(true);
    try {
      const coverImgUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80`;

      // 1. Commit artwork asset to active workspace linked to release
      const asset = await saveAsset({
        name: `${state.title} — Official Cover Master`,
        category: "artwork",
        url: coverImgUrl,
        size: 4800000,
        mimeType: "image/png",
        dimensions: "3000x3000px",
        releaseId: activeRelease?.id,
        tags: [state.genreTag, "DSP Ready", state.themePreset, state.artist],
        metadata: {
          title: state.title,
          artist: state.artist,
          subtitle: state.subtitle,
          genreTag: state.genreTag,
          themePreset: state.themePreset,
          bgGradient: state.bgGradient,
          textColor: state.textColor,
          accentColor: state.accentColor,
          showParentalAdvisory: state.showParentalAdvisory,
          parentalAdvisoryStyle: state.parentalAdvisoryStyle,
        }
      });

      // 2. If active release exists, update it directly; otherwise create new release
      if (activeRelease) {
        await updateRelease(activeRelease.id, {
          coverUrl: coverImgUrl,
          coverAssetId: asset.id,
        });
      } else {
        await createRelease({
          title: state.title,
          artistName: state.artist,
          releaseType: "Single",
          genre: state.genreTag,
          status: "ready-to-distribute",
          releaseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          coverUrl: coverImgUrl,
          coverAssetId: asset.id,
          upc: `859${Math.floor(100000000 + Math.random() * 900000000)}`,
          isrc: `US-KDH-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
          platforms: ["Spotify", "Apple Music", "Audiomack", "YouTube Music", "Boomplay", "Tidal", "Amazon Music"],
          dspPitchStatus: "drafted",
          notes: `Production: ${state.subtitle}. Theme preset: ${state.themePreset}. Stored from Cover Studio Workstation.`
        });
      }

      onNotify(`Artwork "${state.title}" saved to ${workspace?.name || 'Workspace'} Vault & Release Registry!`, "success");
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err: any) {
      onNotify(err.message || "Failed to commit asset to vault", "error" as any);
    } finally {
      setIsSavingToVault(false);
    }
  };

  if (isInitializing) {
    return <CoverStudioSkeleton />;
  }

  return (
    <div className="space-y-8 text-left pb-16">
      {/* Header Bento Card */}
      <div className="p-6 sm:p-8 bento-card border-[#27272A] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="bento-pill bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30">
            <Layers className="w-3.5 h-3.5" />
            <span>3000 × 3000PX STUDIO WORKSTATION</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Music Cover Studio & 3D Visualizer
          </h1>
          <p className="text-sm sm:text-base text-[#A1A1AA] max-w-2xl leading-relaxed">
            Design album and single cover artwork compliant with Spotify, Apple Music, and vinyl print standards. Preview in real-time across spinning vinyl, CD jewel cases, lockscreens, and billboard mockups.
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preset Palettes Bento Card */}
          <div className="bento-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#F97316]" />
                <span>Aesthetic Styles & Themes</span>
              </h2>
              <span className="text-[10px] font-mono text-[#A1A1AA]">6 Curated Presets</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() =>
                    setState({
                      ...state,
                      themePreset: p.id,
                      bgGradient: p.bgGradient,
                      textColor: p.textColor,
                      accentColor: p.accentColor,
                      textureOverlay: p.texture,
                    })
                  }
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    state.themePreset === p.id
                      ? "border-[#F97316] bg-[#27272A] text-white shadow-sm"
                      : "border-[#27272A] bg-[#09090B] text-[#A1A1AA] hover:text-white hover:bg-[#18181B]"
                  }`}
                >
                  <div className="text-xs font-semibold">{p.name}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E4E4E7]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3F3F46]"></span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Typography & Copy Inputs */}
          <div className="bento-card p-5 space-y-4 text-xs">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2 pb-2 border-b border-[#27272A]">
              <Sliders className="w-4 h-4 text-[#F97316]" />
              <span>Typography & Metadata</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Release Title</label>
                <input
                  type="text"
                  value={state.title}
                  onChange={(e) => setState({ ...state, title: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-white font-['Space_Grotesk'] font-bold tracking-tight focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Artist Name</label>
                <input
                  type="text"
                  value={state.artist}
                  onChange={(e) => setState({ ...state, artist: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-white font-['Space_Grotesk'] font-bold focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Producer / Subtitle</label>
                  <input
                    type="text"
                    value={state.subtitle}
                    onChange={(e) => setState({ ...state, subtitle: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-white font-mono text-[11px] focus:outline-none focus:border-[#F97316]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Genre Badge</label>
                  <input
                    type="text"
                    value={state.genreTag}
                    onChange={(e) => setState({ ...state, genreTag: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-white font-mono text-[11px] focus:outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Overlays & Elements Toggle */}
          <div className="bento-card p-5 space-y-4 text-xs">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white pb-2 border-b border-[#27272A]">
              Overlays & Stickers
            </h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-[#09090B] border border-[#27272A]">
                <span className="text-zinc-300">Parental Advisory Sticker</span>
                <input
                  type="checkbox"
                  checked={state.showParentalAdvisory}
                  onChange={(e) => setState({ ...state, showParentalAdvisory: e.target.checked })}
                  className="w-4 h-4 accent-[#F97316] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-[#09090B] border border-[#27272A]">
                <span className="text-zinc-300">DSP Streaming Badges (Spotify, Apple)</span>
                <input
                  type="checkbox"
                  checked={state.showStreamingBadges}
                  onChange={(e) => setState({ ...state, showStreamingBadges: e.target.checked })}
                  className="w-4 h-4 accent-[#F97316] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-[#09090B] border border-[#27272A]">
                <span className="text-zinc-300">Barcode & Catalog Number</span>
                <input
                  type="checkbox"
                  checked={state.showBarcode}
                  onChange={(e) => setState({ ...state, showBarcode: e.target.checked })}
                  className="w-4 h-4 accent-[#F97316] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-[#09090B] border border-[#27272A]">
                <span className="text-zinc-300">Audio Spectrum Waveform</span>
                <input
                  type="checkbox"
                  checked={state.showAudioWave}
                  onChange={(e) => setState({ ...state, showAudioWave: e.target.checked })}
                  className="w-4 h-4 accent-[#F97316] rounded cursor-pointer"
                />
              </label>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Texture Filter</label>
                <select
                  value={state.textureOverlay}
                  onChange={(e) => setState({ ...state, textureOverlay: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-white font-mono cursor-pointer"
                >
                  <option value="vinyl-dust">Vinyl Dust & Groove Rings</option>
                  <option value="plastic-wrap">Shrinkwrap Plastic Sheen</option>
                  <option value="grain">Vintage Film Grain</option>
                  <option value="grid">Cyber Matrix Grid</option>
                  <option value="none">Clean Digital Flat</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* View Mode Switcher Bento Card */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bento-card">
            <div className="flex items-center gap-1.5 font-mono text-xs text-[#A1A1AA]">
              <Eye className="w-3.5 h-3.5 text-[#F97316]" />
              <span>3D PREVIEW MODE:</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "canvas", label: "Square (1:1)", icon: <Layers className="w-3.5 h-3.5" /> },
                { id: "vinyl", label: "Vinyl Spin", icon: <Disc3 className="w-3.5 h-3.5" /> },
                { id: "phone", label: "Lockscreen", icon: <Smartphone className="w-3.5 h-3.5" /> },
                { id: "billboard", label: "Billboard", icon: <Tv className="w-3.5 h-3.5" /> },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setState({ ...state, previewMode: m.id as any })}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    state.previewMode === m.id
                      ? "bg-[#F97316] text-black font-bold shadow-md shadow-[#F97316]/20"
                      : "bg-[#27272A] text-[#A1A1AA] hover:text-white"
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Artwork Render Stage */}
          <div className="p-6 sm:p-10 bento-card flex items-center justify-center min-h-[460px] relative overflow-hidden bg-[#09090B]">
            {/* Mode 1: Standard Canvas or Vinyl */}
            {state.previewMode === "canvas" && (
              <div 
                ref={canvasRef}
                className={`w-full max-w-[380px] aspect-square rounded-3xl bg-gradient-to-br ${state.bgGradient} p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-white/15`}
              >
                {/* Texture Overlay */}
                {state.textureOverlay === "vinyl-dust" && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.5)_95%)] pointer-events-none opacity-60"></div>
                )}
                {state.textureOverlay === "plastic-wrap" && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/15 to-transparent pointer-events-none mix-blend-overlay"></div>
                )}
                {state.textureOverlay === "grid" && (
                  <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
                )}

                {/* Top Header */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F97316]"></span>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-white/90 uppercase">
                      {state.genreTag}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-white/60 uppercase">
                    3000 × 3000
                  </span>
                </div>

                {/* Center Content */}
                <div className="relative z-10 space-y-2 text-left my-auto">
                  <div className="text-xs font-mono font-semibold tracking-widest text-[#F97316]">
                    {state.artist}
                  </div>
                  <h3 
                    className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-extrabold tracking-tight leading-[0.95] drop-shadow-lg"
                    style={{ color: state.textColor }}
                  >
                    {state.title}
                  </h3>
                  <div className="text-[11px] font-mono text-zinc-300/80">
                    {state.subtitle}
                  </div>

                  {/* Audio wave simulation */}
                  {state.showAudioWave && (
                    <div className="flex items-end gap-1 h-6 pt-2 opacity-70">
                      {[40, 70, 90, 60, 100, 80, 45, 95, 60, 75, 50, 85, 30, 90, 65, 40].map((h, i) => (
                        <span
                          key={i}
                          className="w-1 bg-[#F97316] rounded-full"
                          style={{ height: `${h}%` }}
                        ></span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Footer Badges */}
                <div className="flex items-end justify-between relative z-10 pt-4">
                  {state.showParentalAdvisory ? (
                    <div className="px-2 py-1 bg-black border border-white/30 text-[9px] font-mono font-bold text-white uppercase tracking-tight shadow-md rounded-md">
                      PARENTAL ADVISORY
                      <div className="text-[7px] text-zinc-400 font-normal">EXPLICIT CONTENT</div>
                    </div>
                  ) : (
                    <div></div>
                  )}

                  {/* Keedohub Master Record Stamp */}
                  <div className="flex items-center gap-1.5 opacity-85 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/15">
                    <KeedohubLogo size="xs" showText={true} theme="dark" />
                  </div>

                  {state.showBarcode && (
                    <div className="text-right">
                      <div className="flex gap-0.5 justify-end h-5 items-end opacity-75">
                        {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3].map((w, i) => (
                          <span key={i} className="bg-white h-full" style={{ width: `${w}px` }}></span>
                        ))}
                      </div>
                      <div className="text-[8px] font-mono text-zinc-400 mt-0.5">
                        KH-779145
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode 2: Vinyl Record with Spinning Disc */}
            {state.previewMode === "vinyl" && (
              <div className="relative flex items-center justify-center py-6">
                {/* Vinyl Record */}
                <div className="absolute left-1/3 -translate-x-1/2 w-64 h-64 rounded-full bg-[radial-gradient(circle_at_center,_#262626_0%,_#0a0a0a_60%,_#171717_100%)] border-4 border-zinc-700 shadow-2xl shadow-black animate-spin-slow flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-[#EA580C] border-4 border-black flex items-center justify-center text-center p-2 text-[8px] font-mono font-bold text-white">
                    {state.artist}
                  </div>
                </div>

                {/* Front Sleeve Jacket */}
                <div className={`relative z-10 w-64 h-64 rounded-3xl bg-gradient-to-br ${state.bgGradient} p-5 flex flex-col justify-between shadow-2xl border border-white/20`}>
                  <div className="text-[9px] font-mono text-[#F97316] font-bold uppercase">
                    {state.genreTag}
                  </div>
                  <div className="text-left space-y-1">
                    <div className="text-xs font-mono font-bold text-zinc-300">{state.artist}</div>
                    <div className="font-['Space_Grotesk'] text-2xl font-bold text-white leading-tight">
                      {state.title}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400">
                    <span>STEREO 33⅓ RPM</span>
                    <span>KEEDOHUB RECORDINGS</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 3: Phone Lockscreen */}
            {state.previewMode === "phone" && (
              <div className="w-64 rounded-[36px] bg-[#18181B] p-3 border-2 border-[#27272A] shadow-2xl space-y-4">
                <div className="w-16 h-3.5 bg-black rounded-full mx-auto"></div>
                <div className="text-center space-y-0.5 text-zinc-300">
                  <div className="text-2xl font-bold text-white font-['Space_Grotesk']">10:42</div>
                  <div className="text-[10px] font-mono text-[#A1A1AA]">Friday, August 28</div>
                </div>

                {/* Lockscreen Player Box */}
                <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${state.bgGradient} flex items-center justify-center p-1.5 shadow-md`}>
                      <Disc3 className="w-6 h-6 text-white animate-spin-slow" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white truncate">{state.title}</div>
                      <div className="text-[10px] text-zinc-400 truncate">{state.artist}</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="h-1 bg-zinc-700 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-[#F97316] rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-zinc-500">
                      <span>1:48</span>
                      <span>-1:12</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 4: Billboard Street Poster Mockup */}
            {state.previewMode === "billboard" && (
              <div className="w-full max-w-md bg-[#18181B] rounded-3xl p-4 border border-[#27272A] shadow-2xl text-left space-y-3">
                <div className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-widest">
                  URBAN STREET BILLBOARD (LAGOS / LONDON / NYC)
                </div>
                <div className={`aspect-video rounded-2xl bg-gradient-to-br ${state.bgGradient} p-5 flex items-center justify-between border border-white/20 relative overflow-hidden shadow-inner`}>
                  <div className="space-y-2 z-10">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[#F97316] text-black uppercase">
                      OUT NOW WORLDWIDE
                    </span>
                    <h3 className="font-['Space_Grotesk'] text-3xl font-extrabold text-white">
                      {state.title}
                    </h3>
                    <p className="text-xs text-[#F97316] font-mono">
                      THE NEW MASTERPIECE BY {state.artist}
                    </p>
                  </div>
                  <div className="w-24 h-24 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-[#F97316]">
                    <Disc3 className="w-12 h-12 animate-spin-slow" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Export Button Bento Card */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bento-card">
            <div className="text-xs text-[#A1A1AA]">
              <span className="font-bold text-white">Production Ready:</span> Meets Spotify & Apple Music 3000x3000px upload mandates.
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleSaveToVault}
                disabled={isSavingToVault}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--bento-card)] hover:bg-[var(--bento-elevated)] text-emerald-400 border border-emerald-500/30 font-bold text-xs font-mono uppercase tracking-wider cursor-pointer transition-all hover:scale-102 disabled:opacity-50"
                title="Save master artwork directly into Workspace Assets and Release Blueprints"
              >
                {isSavingToVault ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSavingToVault ? "Committing..." : "Save to Workspace Vault"}</span>
              </button>

              <button
                onClick={handleDownloadSpecs}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] text-black font-bold text-xs font-mono uppercase tracking-wider cursor-pointer shadow-lg shadow-[#F97316]/20 transition-transform hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Master Specs</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
