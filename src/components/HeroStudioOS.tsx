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

          {/* Right Column: Interactive Bento Phone Mockup Card (5 cols) */}
          <div className="lg:col-span-5 bento-card p-4 sm:p-7 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="w-full max-w-xs sm:max-w-sm">
              {/* Studio OS Phone Container */}
              <div className="relative rounded-[28px] sm:rounded-[32px] bg-gradient-to-b from-[var(--bento-elevated)] to-[var(--bento-card)] p-2.5 sm:p-3 shadow-xl border border-[var(--bento-border)] overflow-hidden">
                {/* Top Notch Status */}
                <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-mono text-[var(--bento-muted)]">
                  <span className="font-bold text-[var(--bento-text)]">9:41</span>
                  <div className="w-12 sm:w-16 h-3 bg-black/40 rounded-full mx-auto"></div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: currentThemeConfig.primaryColor }}></span>
                    <span className="font-bold text-[10px]" style={{ color: currentThemeConfig.primaryColor }}>LIVE</span>
                  </div>
                </div>

                {/* Inner Screen */}
                <div className="bg-[var(--bento-bg)] rounded-[20px] sm:rounded-[24px] p-3 sm:p-4 space-y-2.5 sm:space-y-3.5 border border-[var(--bento-border)]">
                  {/* Studio Active Record Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--bento-border)]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[var(--accent-light)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-pill-text)]">
                        {activeRole === "artist" ? (
                          <Disc3 className={`w-3.5 h-3.5 ${isPlayingPreview ? 'animate-spin' : ''}`} />
                        ) : (
                          <Palette className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-[11px] sm:text-xs font-bold text-[var(--bento-text)] truncate max-w-[150px] sm:max-w-none">
                          {activeRole === "artist" ? 'ZACK KHALIFA — "VICTORIA"' : "KEEDOHUB BUSINESS PROFILE"}
                        </div>
                        <div className="text-[8px] sm:text-[9px] font-mono text-[var(--accent-pill-text)]">
                          {activeRole === "artist" ? "ROLLOUT ENGINE ACTIVE" : "BRAND OS ACTIVE"}
                        </div>
                      </div>
                    </div>
                    {activeRole === "artist" && (
                      <button
                        onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-theme-accent flex items-center justify-center cursor-pointer transition-colors shadow-sm font-bold text-white"
                        title={isPlayingPreview ? "Pause Audio Preview" : "Play Audio Preview"}
                      >
                        {isPlayingPreview ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 ml-0.5 fill-current" />}
                      </button>
                    )}
                  </div>

                  {/* Album Cover 3D Canvas Preview */}
                  <div className={`relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden p-3 sm:p-4 flex flex-col justify-between border border-[var(--accent-border)] shadow-inner group ${activeRole === "artist" ? "bg-gradient-to-br from-red-950/80 via-zinc-900 to-black" : "bg-gradient-to-br from-[var(--accent-light)] via-zinc-900 to-black"}`}>
                    {/* Vinyl spinning disc overlay */}
                    {activeRole === "artist" && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 sm:w-44 h-36 sm:h-44 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black opacity-35 border-4 border-zinc-700 pointer-events-none group-hover:scale-105 transition-transform duration-500">
                        <div className="absolute inset-[38%] rounded-full" style={{ backgroundColor: currentThemeConfig.primaryColor }}></div>
                      </div>
                    )}

                    {/* Top tags */}
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[8px] sm:text-[9px] font-mono font-bold tracking-widest px-1.5 py-0.2 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/10 uppercase">
                        {activeRole === "artist" ? "MASTER" : "PROFILE"}
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-mono text-amber-300 bg-amber-950/70 px-1.5 py-0.2 rounded-full border border-amber-500/30">
                        {activeRole === "artist" ? "3000px" : "READY"}
                      </span>
                    </div>

                    {/* Cover typography */}
                    <div className="text-left relative z-10 space-y-0.5">
                      <div className="text-[8px] sm:text-[10px] font-mono text-red-300 font-semibold tracking-widest uppercase">
                        {activeRole === "artist" ? "AFRO-FUSION SINGLE" : "BUSINESS IDENTITY"}
                      </div>
                      <div className="font-['Space_Grotesk'] text-lg sm:text-2xl font-bold text-white tracking-tight leading-none drop-shadow-md">
                        {activeRole === "artist" ? "MIDNIGHT IN VI" : "YOUR BRAND, CLEARLY"}
                      </div>
                      <div className="text-[10px] sm:text-xs text-zinc-300 font-medium">
                        {activeRole === "artist" ? "PROD. BY KEEDOHUB" : "POWERED BY KEEDOHUB"}
                      </div>
                    </div>

                    {/* Bottom badges */}
                    <div className="flex items-end justify-between relative z-10 pt-1">
                      <div className="px-1 py-0.2 bg-black border border-white/20 text-[7px] sm:text-[8px] font-mono font-bold text-white uppercase tracking-tighter rounded">
                        {activeRole === "artist" ? "PARENTAL ADVISORY" : "BRAND FOUNDATION"}
                      </div>
                      <div className="text-[7px] sm:text-[8px] font-mono text-zinc-400">
                        {activeRole === "artist" ? "HIGH-FIDELITY" : "BUSINESS READY"}
                      </div>
                    </div>
                  </div>

                  {/* Micro Rollout Dashboard Cards */}
                  <div className="grid grid-cols-2 gap-1.5 text-left">
                    <div 
                      onClick={() => setActiveTab(activeRole === "artist" ? "artist-brain" : "brand-os")}
                      className="p-2 rounded-lg bg-[var(--bento-card)] border border-[var(--bento-border)] hover:border-[var(--accent-border)] cursor-pointer transition-colors"
                    >
                      <div className="text-[8px] font-mono text-[var(--bento-muted)]">{activeRole === "artist" ? "30-DAY TIMELINE" : "BUSINESS NEEDS"}</div>
                      <div className="text-[11px] font-bold text-[var(--bento-text)] flex items-center justify-between">
                        <span>{activeRole === "artist" ? "Pre-Save" : "Overview"}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-[var(--accent-pill-text)]" />
                      </div>
                    </div>
                    <div 
                      onClick={() => setActiveTab(activeRole === "artist" ? "cover-studio" : "brand-os")}
                      className="p-2 rounded-lg bg-[var(--bento-card)] border border-[var(--bento-border)] hover:border-amber-500/50 cursor-pointer transition-colors"
                    >
                      <div className="text-[8px] font-mono text-[var(--bento-muted)]">{activeRole === "artist" ? "COVER STUDIO" : "BRAND PROFILE"}</div>
                      <div className="text-[11px] font-bold text-[var(--bento-text)] flex items-center justify-between">
                        <span>{activeRole === "artist" ? "3D Canvas" : "Identity Setup"}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-amber-500" />
                      </div>
                    </div>
                  </div>

                  {/* Launch Engine CTA Button */}
                  <button
                    onClick={() => setActiveTab(currentRole.ctaTab)}
                    className="w-full py-2 rounded-lg bg-theme-accent text-[11px] font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md text-white"
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    <span>{activeRole === "artist" ? "Run Rollout Campaign" : "Open Brand OS"}</span>
                  </button>
                </div>
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
