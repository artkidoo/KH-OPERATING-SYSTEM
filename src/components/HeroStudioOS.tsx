import React, { useState } from "react";
import { ActiveTab } from "../types";
import { useTheme } from "../context/ThemeContext";
import { 
  Disc3, 
  Layers, 
  Sparkles, 
  Video, 
  ArrowRight, 
  Play, 
  Pause,
  Zap, 
  Cpu,
  Globe2,
  Palette,
  Rocket,
  Radio
} from "lucide-react";

interface HeroStudioOSProps {
  setActiveTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

export const HeroStudioOS: React.FC<HeroStudioOSProps> = ({
  setActiveTab,
  openBriefModal,
}) => {
  const { currentThemeConfig } = useTheme();
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [activeRole, setActiveRole] = useState<'artist' | 'brand'>('artist');

  const roleConfigs = {
    artist: {
      tag: "ARTIST WORKSPACE",
      title: "Release music with a complete creative system",
      description: "Plan your release, create artwork and content, prepare DSP materials, and move from recorded song to a professional rollout.",
      ctaTab: "artist-os" as ActiveTab,
      ctaText: "Enter Artist Workspace",
      metrics: [
        { label: "Release planning", val: "30-day" },
        { label: "Artwork standard", val: "3000px" },
        { label: "Core workflow", val: "4 steps" }
      ]
    },
    brand: {
      tag: "BRAND WORKSPACE",
      title: "Build a brand your business can grow with",
      description: "Understand what your business needs, organize your brand identity, create essential documents, and build a clearer path to visibility and sales.",
      ctaTab: "brand-os" as ActiveTab,
      ctaText: "Enter Brand Workspace",
      metrics: [
        { label: "Business needs", val: "6 areas" },
        { label: "Brand essentials", val: "7 items" },
        { label: "Growth path", val: "1 next move" }
      ]
    }
  };

  const currentRole = roleConfigs[activeRole];

  return (
    <div className="relative overflow-hidden pt-2 sm:pt-4 pb-8 sm:pb-12">
      {/* Background radial glows and cyber grid */}
      <div className="absolute inset-0 bg-bento-grid opacity-40 pointer-events-none"></div>
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full blur-[100px] sm:blur-[140px] pointer-events-none opacity-20"
        style={{ backgroundColor: currentThemeConfig.primaryColor }}
      ></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 space-y-5 sm:space-y-8">
        {/* System Status Ticker Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3.5 px-3 sm:px-5 rounded-xl sm:rounded-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-[var(--bento-text)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-4"></span>
            <span className="text-[var(--bento-muted)] font-semibold uppercase tracking-wider hidden xs:inline">ENGINE:</span>
            <span className="text-emerald-500 font-bold">ONLINE (OS)</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 text-[10px] sm:text-[11px] font-mono text-[var(--bento-muted)]">
            <div className="flex items-center gap-1">
              <Cpu className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--accent-pill-text)]" />
              <span className="text-[var(--bento-text)] font-medium">12 Studios</span>
            </div>
            <div className="hidden xs:flex items-center gap-1">
              <Globe2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
              <span>Remote</span>
            </div>
            <div className="flex items-center gap-1 text-[var(--accent-pill-text)] font-bold">
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>48h SLA</span>
            </div>
          </div>
        </div>

        {/* Hero Bento Matrix Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          {/* Main Left Bento Card: Mission & Interactive Role Engine (7 cols) */}
          <div className="lg:col-span-7 bento-card p-4 sm:p-7 flex flex-col justify-between space-y-4 sm:space-y-6 text-left relative overflow-hidden">
            {/* Ambient Bento glow */}
            <div 
              className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl to-transparent pointer-events-none rounded-tr-3xl opacity-15"
              style={{ backgroundImage: `linear-gradient(to bottom left, ${currentThemeConfig.primaryColor}, transparent)` }}
            ></div>

            <div className="space-y-4 sm:space-y-5 relative z-10">
              {/* Identity Role Badges (Artist & Brand OS) */}
              <div className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-[var(--bento-elevated)] border border-[var(--bento-border)]">
                {(['artist', 'brand'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setActiveRole(r)}
                    className={`flex-1 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer uppercase text-center truncate ${
                      activeRole === r
                        ? "bg-theme-accent font-bold text-white shadow-sm"
                        : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-card)]"
                    }`}
                  >
                    {r === 'artist' ? '🎵 Music Artist OS' : '💼 Brand OS'}
                  </button>
                ))}
              </div>

              {/* Main Headline */}
              <div className="space-y-2 sm:space-y-3">
                <div className="bento-pill text-[10px] sm:text-xs">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentThemeConfig.primaryColor }}></span>
                  <span>{currentRole.tag}</span>
                </div>
                <h1 className="font-['Space_Grotesk'] text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--bento-text)] leading-[1.15]">
                  {currentRole.title}
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-[var(--bento-muted)] max-w-xl leading-relaxed">
                  {currentRole.description}
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 pt-1">
                <button
                  id="hero-primary-cta-btn"
                  onClick={() => setActiveTab(currentRole.ctaTab)}
                  className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-xl bg-theme-accent font-bold text-xs font-['Space_Grotesk'] text-white shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer border border-[var(--accent-border)]"
                >
                  <span>{currentRole.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  id="hero-request-brief-btn"
                  onClick={openBriefModal}
                  className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[var(--bento-elevated)] hover:bg-[var(--bento-border)] text-[var(--bento-text)] font-semibold text-xs border border-[var(--bento-border)] transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Request Custom Brief</span>
                </button>
              </div>
            </div>

            {/* Role Specific Live Metrics Bento Row */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 pt-4 sm:pt-6 border-t border-[var(--bento-border)] relative z-10">
              {currentRole.metrics.map((m, idx) => (
                <div key={idx} className="p-2 sm:p-3 rounded-xl bg-[var(--bento-elevated)] border border-[var(--bento-border)] space-y-0.5 text-center sm:text-left">
                  <div className="font-['Space_Grotesk'] text-sm sm:text-lg font-bold text-[var(--bento-text)] tracking-tight">
                    {m.val}
                  </div>
                  <div className="text-[8px] sm:text-[10px] font-mono text-[var(--bento-muted)] uppercase tracking-wider truncate">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Open laptop showing the active creative workspace */}
          <div className="lg:col-span-5 flex items-center justify-center relative overflow-hidden px-1 sm:px-4 py-4 sm:py-7">
            <div className="w-full max-w-lg">
              <div className="relative mx-auto w-[92%]">
                <div className="relative rounded-t-[14px] sm:rounded-t-[20px] border-[5px] sm:border-[7px] border-zinc-700 bg-zinc-950 p-1.5 sm:p-2 shadow-2xl">
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-zinc-600"></div>
                  <div className="aspect-[16/10] overflow-hidden rounded-[5px] sm:rounded-[8px] bg-[#111116]">
                    <div className="flex h-full text-left">
                      <aside className="hidden sm:flex w-[24%] flex-col justify-between border-r border-white/10 bg-[#19191f] p-2.5">
                        <div><div className="mb-4 flex items-center gap-1.5 text-[8px] font-bold text-white"><span className="h-2 w-2 rounded-sm bg-red-500"></span>KEEDOHUB</div><div className="space-y-2 text-[7px] font-mono text-zinc-500"><div className="text-zinc-200">Workspace</div><div>Assets</div><div>Guidelines</div><div>Timeline</div></div></div>
                        <div className="text-[7px] font-mono text-emerald-400">● AUTOSAVED</div>
                      </aside>
                      <div className="flex min-w-0 flex-1 flex-col p-2.5 sm:p-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2"><div><div className="text-[7px] font-mono uppercase tracking-widest text-red-400">{activeRole === "artist" ? "Artist workspace" : "Brand workspace"}</div><div className="mt-0.5 truncate text-[11px] sm:text-sm font-bold text-white">{activeRole === "artist" ? 'Victoria — cover direction' : "Keedohub — identity system"}</div></div><div className="flex items-center gap-1 text-[7px] font-mono text-emerald-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></span>LIVE</div></div>
                        <div className="grid min-h-0 flex-1 grid-cols-[1.4fr_1fr] gap-2.5 pt-3">
                          <div className="relative overflow-hidden rounded-md border border-white/10 bg-gradient-to-br from-red-950 via-zinc-900 to-black p-2.5"><div className="absolute -right-5 -top-5 h-24 w-24 rounded-full border-[12px] border-red-500/20"></div><div className="relative flex h-full flex-col justify-between"><span className="w-fit rounded bg-black/60 px-1 py-0.5 text-[6px] font-mono uppercase tracking-wider text-zinc-300">{activeRole === "artist" ? "Cover art v03" : "Brand board v02"}</span><div><div className="text-[7px] font-mono uppercase tracking-widest text-red-300">{activeRole === "artist" ? "Afro-fusion single" : "Visual direction"}</div><div className="mt-1 text-base sm:text-xl font-bold leading-none text-white">{activeRole === "artist" ? "VICTORIA" : <>MAKE IT<br />RECOGNISABLE</>}</div></div></div></div>
                          <div className="space-y-2"><div className="rounded-md border border-white/10 bg-white/[0.04] p-2"><div className="mb-1 flex justify-between text-[7px] font-mono text-zinc-500"><span>{activeRole === "artist" ? "ROLLOUT PROGRESS" : "IDENTITY PROGRESS"}</span><span className="text-white">{activeRole === "artist" ? "68%" : "42%"}</span></div><div className="h-1 rounded-full bg-zinc-800"><div className="h-1 rounded-full bg-red-500" style={{ width: activeRole === "artist" ? "68%" : "42%" }}></div></div></div><div className="rounded-md border border-white/10 bg-white/[0.04] p-2 text-[7px] font-mono text-zinc-400"><div className="mb-1 text-zinc-200">IN PROGRESS</div><div className="space-y-1"><div>✓ Direction locked</div><div className="text-red-300">◐ {activeRole === "artist" ? "Artwork exploration" : "Tone of voice"}</div><div>○ Final review</div></div></div></div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[7px] font-mono text-zinc-500"><span>{activeRole === "artist" ? "3 collaborators editing" : "2 collaborators editing"}</span>{activeRole === "artist" && <button onClick={() => setIsPlayingPreview(!isPlayingPreview)} className="flex items-center gap-1 text-red-300 cursor-pointer">{isPlayingPreview ? <Pause className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5 fill-current" />} PREVIEW</button>}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-1.5 bg-zinc-800 shadow-inner"></div>
                <div className="relative -mx-[7%] h-14 sm:h-20 rounded-b-[8px] sm:rounded-b-[14px] bg-gradient-to-b from-zinc-600 to-zinc-800 px-[13%] pt-2 shadow-2xl [clip-path:polygon(5%_0,95%_0,100%_100%,0_100%)]"><div className="grid grid-cols-12 gap-0.5 sm:gap-1">{Array.from({ length: 48 }).map((_, index) => <span key={index} className="h-1.5 sm:h-2 rounded-[2px] bg-zinc-950/70"></span>)}</div><div className="mx-auto mt-2 h-4 w-16 sm:h-6 sm:w-24 rounded border border-zinc-500/60 bg-zinc-700/50"></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Operating Systems Workstation Suite Bento Grid (Forced 2-Column Mobile Grid) */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1.5 text-left">
            <div>
              <div className="bento-pill text-[10px] sm:text-xs mb-1 sm:mb-2">
                02 / WORKSTATION MODULES
              </div>
              <h2 className="font-['Space_Grotesk'] text-xl sm:text-3xl font-bold text-[var(--bento-text)] tracking-tight">
                Creative Operating System Modules
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--bento-muted)] max-w-md">
              Tap any module to enter dedicated creative engines.
            </p>
          </div>

          {/* Forced 2-Column Grid on Mobile! */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {/* Module 0A: Unified Command Center */}
            <div
              onClick={() => setActiveTab("command-center")}
              className="bento-card p-3.5 sm:p-5 transition-all group cursor-pointer text-left flex flex-col justify-between relative overflow-hidden shadow-sm border-red-500/50 hover:border-red-500 bg-red-950/20 hover:bg-red-950/30"
            >
              <div className="space-y-2.5 sm:space-y-3.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[8px] sm:text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider">
                    PHASE 10 · UNIFIED
                  </span>
                  <h3 className="font-['Space_Grotesk'] text-xs sm:text-base font-bold text-white group-hover:text-red-400 transition-colors mt-0.5">
                    Command Center
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[var(--bento-muted)] mt-1 line-clamp-2 sm:line-clamp-none leading-relaxed">
                    Single workspace pulse, today triage, deterministic next actions & relationship graph.
                  </p>
                </div>
              </div>
              <div className="pt-3 sm:pt-4 flex items-center justify-between text-[10px] sm:text-xs font-mono text-red-400 font-bold">
                <span>Open Command</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Module 0B: Creative Radar */}
            <div
              onClick={() => setActiveTab("creative-radar")}
              className="bento-card p-3.5 sm:p-5 transition-all group cursor-pointer text-left flex flex-col justify-between relative overflow-hidden shadow-sm border-amber-500/40 hover:border-amber-500 bg-amber-950/10 hover:bg-amber-950/20"
            >
              <div className="space-y-2.5 sm:space-y-3.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[8px] sm:text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                    PHASE 9 · RADAR
                  </span>
                  <h3 className="font-['Space_Grotesk'] text-xs sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors mt-0.5">
                    Creative Radar
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[var(--bento-muted)] mt-1 line-clamp-2 sm:line-clamp-none leading-relaxed">
                    Proactive bottleneck detection, release radar gaps & deterministic action feed.
                  </p>
                </div>
              </div>
              <div className="pt-3 sm:pt-4 flex items-center justify-between text-[10px] sm:text-xs font-mono text-amber-400 font-bold">
                <span>Scan Radar</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Module 0: Keedohub Studio Production Layer */}
            <div
              onClick={() => setActiveTab("studio")}
              className="bento-card p-3.5 sm:p-5 transition-all group cursor-pointer text-left flex flex-col justify-between relative overflow-hidden shadow-sm border-pink-500/40 hover:border-pink-500 bg-pink-950/10 hover:bg-pink-950/20"
            >
              <div className="space-y-2.5 sm:space-y-3.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[8px] sm:text-[9px] font-mono text-pink-400 font-bold uppercase tracking-wider">
                    PHASE 7 · STUDIO
                  </span>
                  <h3 className="font-['Space_Grotesk'] text-xs sm:text-base font-bold text-white group-hover:text-pink-400 transition-colors mt-0.5">
                    Keedohub Studio
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[var(--bento-muted)] mt-1 line-clamp-2 sm:line-clamp-none leading-relaxed">
                    Commission human creative production, cover art, motion graphics, branding & UI.
                  </p>
                </div>
              </div>
              <div className="pt-3 sm:pt-4 flex items-center justify-between text-[10px] sm:text-xs font-mono text-pink-400 font-bold">
                <span>Enter Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Module 1: Artist Content Brain */}
            <div
              onClick={() => setActiveTab("artist-brain")}
              className="bento-card p-3.5 sm:p-5 transition-all group cursor-pointer text-left flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-[var(--accent-border)]"
            >
              <div className="space-y-2.5 sm:space-y-3.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-pill-text)] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Disc3 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[8px] sm:text-[9px] font-mono text-[var(--accent-pill-text)] font-bold uppercase tracking-wider">
                    FLAGSHIP
                  </span>
                  <h3 className="font-['Space_Grotesk'] text-xs sm:text-base font-bold text-[var(--bento-text)] group-hover:text-[var(--accent-pill-text)] transition-colors mt-0.5">
                    Artist Content Brain
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[var(--bento-muted)] mt-1 line-clamp-2 sm:line-clamp-none leading-relaxed">
                    Complete 30-day release campaigns, viral TikTok hooks, and Spotify pitches.
                  </p>
                </div>
              </div>
              <div className="pt-3 sm:pt-4 flex items-center justify-between text-[10px] sm:text-xs font-mono text-[var(--accent-pill-text)] font-bold">
                <span>Enter</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Module 2: Lyric Studio */}
            <div
              onClick={() => setActiveTab("lyrics-studio")}
              className="bento-card p-3.5 sm:p-5 transition-all group cursor-pointer text-left flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-red-500/50"
            >
              <div className="space-y-2.5 sm:space-y-3.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[8px] sm:text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider">
                    LYRIC & SYNC
                  </span>
                  <h3 className="font-['Space_Grotesk'] text-xs sm:text-base font-bold text-[var(--bento-text)] group-hover:text-red-400 transition-colors mt-0.5">
                    Lyric Studio & .LRC
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[var(--bento-muted)] mt-1 line-clamp-2 sm:line-clamp-none leading-relaxed">
                    Time-sync lyrics, generate Spotify .LRC files, and live 9:16 kinetic videos.
                  </p>
                </div>
              </div>
              <div className="pt-3 sm:pt-4 flex items-center justify-between text-[10px] sm:text-xs font-mono text-red-400 font-bold">
                <span>Launch</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Module 3: DSP Pitcher */}
            <div
              onClick={() => setActiveTab("dsp-pitcher")}
              className="bento-card p-3.5 sm:p-5 transition-all group cursor-pointer text-left flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-emerald-500/50"
            >
              <div className="space-y-2.5 sm:space-y-3.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[8px] sm:text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    SPOTIFY EDITORIAL
                  </span>
                  <h3 className="font-['Space_Grotesk'] text-xs sm:text-base font-bold text-[var(--bento-text)] group-hover:text-emerald-400 transition-colors mt-0.5">
                    DSP Pitch Engine
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[var(--bento-muted)] mt-1 line-clamp-2 sm:line-clamp-none leading-relaxed">
                    Auto-generate 50-word editorial pitch notes, curator emails, and scorecards.
                  </p>
                </div>
              </div>
              <div className="pt-3 sm:pt-4 flex items-center justify-between text-[10px] sm:text-xs font-mono text-emerald-400 font-bold">
                <span>Pitch</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Module 4: Mastering Suite */}
            <div
              onClick={() => setActiveTab("mastering-suite")}
              className="bento-card p-3.5 sm:p-5 transition-all group cursor-pointer text-left flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-amber-500/50"
            >
              <div className="space-y-2.5 sm:space-y-3.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Globe2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[8px] sm:text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                    AUDIO LABS
                  </span>
                  <h3 className="font-['Space_Grotesk'] text-xs sm:text-base font-bold text-[var(--bento-text)] group-hover:text-amber-400 transition-colors mt-0.5">
                    Mastering & LUFS
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[var(--bento-muted)] mt-1 line-clamp-2 sm:line-clamp-none leading-relaxed">
                    60fps spectrum analyzer, -14 LUFS loudness meter, and True Peak check.
                  </p>
                </div>
              </div>
              <div className="pt-3 sm:pt-4 flex items-center justify-between text-[10px] sm:text-xs font-mono text-amber-400 font-bold">
                <span>Inspect</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Module 5: Splits Calculator */}
            <div
              onClick={() => setActiveTab("splits-calculator")}
              className="bento-card p-3.5 sm:p-5 transition-all group cursor-pointer text-left flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-purple-500/50"
            >
              <div className="space-y-2.5 sm:space-y-3.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Disc3 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[8px] sm:text-[9px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                    ROYALTY & LEGAL
                  </span>
                  <h3 className="font-['Space_Grotesk'] text-xs sm:text-base font-bold text-[var(--bento-text)] group-hover:text-purple-400 transition-colors mt-0.5">
                    Splits & Revenue
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[var(--bento-muted)] mt-1 line-clamp-2 sm:line-clamp-none leading-relaxed">
                    Master vs. Publishing splits calculator and global DSP revenue simulator.
                  </p>
                </div>
              </div>
              <div className="pt-3 sm:pt-4 flex items-center justify-between text-[10px] sm:text-xs font-mono text-purple-400 font-bold">
                <span>Splits</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Module 6: Pre-Save Hub */}
            <div
              onClick={() => setActiveTab("presave-hub")}
              className="bento-card p-3.5 sm:p-5 transition-all group cursor-pointer text-left flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-cyan-500/50"
            >
              <div className="space-y-2.5 sm:space-y-3.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[8px] sm:text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    FAN CRM & LINK
                  </span>
                  <h3 className="font-['Space_Grotesk'] text-xs sm:text-base font-bold text-[var(--bento-text)] group-hover:text-cyan-400 transition-colors mt-0.5">
                    Smart Link Hub
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[var(--bento-muted)] mt-1 line-clamp-2 sm:line-clamp-none leading-relaxed">
                    Custom bio landing page, fan email/WhatsApp collector, and marketing QR codes.
                  </p>
                </div>
              </div>
              <div className="pt-3 sm:pt-4 flex items-center justify-between text-[10px] sm:text-xs font-mono text-cyan-400 font-bold">
                <span>Build Link</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Module 7: Cover Art Studio */}
            <div
              onClick={() => setActiveTab("cover-studio")}
              className="bento-card p-3.5 sm:p-5 transition-all group cursor-pointer text-left flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-amber-500/50"
            >
              <div className="space-y-2.5 sm:space-y-3.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[8px] sm:text-[9px] font-mono text-amber-500 font-bold uppercase tracking-wider">
                    STUDIO
                  </span>
                  <h3 className="font-['Space_Grotesk'] text-xs sm:text-base font-bold text-[var(--bento-text)] group-hover:text-amber-500 transition-colors mt-0.5">
                    Music Cover Studio
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[var(--bento-muted)] mt-1 line-clamp-2 sm:line-clamp-none leading-relaxed">
                    Interactive 3000x3000px canvas with vinyl spin simulation and parental badges.
                  </p>
                </div>
              </div>
              <div className="pt-3 sm:pt-4 flex items-center justify-between text-[10px] sm:text-xs font-mono text-amber-500 font-bold">
                <span>Canvas</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Module 8: Content Engine */}
            <div
              onClick={() => setActiveTab("artist-brain")}
              className="bento-card p-3.5 sm:p-5 transition-all group cursor-pointer text-left flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-emerald-500/50"
            >
              <div className="space-y-2.5 sm:space-y-3.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[8px] sm:text-[9px] font-mono text-emerald-500 font-bold uppercase tracking-wider">
                    DISTRIBUTION
                  </span>
                  <h3 className="font-['Space_Grotesk'] text-xs sm:text-base font-bold text-[var(--bento-text)] group-hover:text-emerald-500 transition-colors mt-0.5">
                    Content Engine
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[var(--bento-muted)] mt-1 line-clamp-2 sm:line-clamp-none leading-relaxed">
                    Multi-channel content calendar, pillar scheduling, and automated creative distribution.
                  </p>
                </div>
              </div>
              <div className="pt-3 sm:pt-4 flex items-center justify-between text-[10px] sm:text-xs font-mono text-emerald-500 font-bold">
                <span>Engine</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
