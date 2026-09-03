import React from "react";
import { ActiveTab } from "../../types";
import { 
  TrendingUp, 
  Radio, 
  Sparkles, 
  ArrowRight, 
  Disc3, 
  Activity, 
  Flame, 
  Globe2 
} from "lucide-react";

interface PageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

export const TrendingPage: React.FC<PageProps> = ({ onNavigateTab, openBriefModal }) => {
  return (
    <div className="space-y-10 sm:space-y-14 py-3 sm:py-8 animate-fade-in text-left">
      {/* Page Hero */}
      <section className="relative overflow-hidden rounded-3xl bento-card p-6 sm:p-10 md:p-14 border border-[var(--bento-border)] bg-gradient-to-b from-[var(--bento-card)] to-[var(--bento-bg)]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-pill-text)] text-xs font-mono font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>KH Cultural Velocity Radar</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--bento-text)] tracking-tight leading-tight">
            KH Trending & Sonic Velocity.
          </h1>
          <p className="text-base sm:text-lg text-[var(--bento-muted)] leading-relaxed font-normal">
            Real-time tracking of emerging African diaspora rhythms, TikTok sound spikes, Spotify editorial movements, and high-impact visual trends.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab("creative-radar")}
              className="px-5 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs sm:text-sm font-['Space_Grotesk'] flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Launch Live Radar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Trending Matrices */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
        <div className="bento-card p-3.5 sm:p-5 rounded-2xl border border-[var(--bento-border)] space-y-2.5 sm:space-y-3 transition-all hover:border-red-500/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-red-400 font-bold">Sonic Subgenre</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">+184% MoM</span>
          </div>
          <h3 className="font-['Space_Grotesk'] font-bold text-sm sm:text-base text-[var(--bento-text)]">
            Amapiano-Gqom Fusion
          </h3>
          <p className="text-xs text-[var(--bento-muted)] leading-relaxed">
            Fast syncopated basslines with dark atmospheric pads dominating London and Lagos underground club rotations.
          </p>
          <div className="pt-2 border-t border-[var(--bento-border)] text-xs font-mono text-[var(--bento-muted)]">
            DSP Target: African Heat, Alte Cruise
          </div>
        </div>

        <div className="bento-card p-3.5 sm:p-5 rounded-2xl border border-[var(--bento-border)] space-y-2.5 sm:space-y-3 transition-all hover:border-blue-500/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">Visual Aesthetic</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">+92% MoM</span>
          </div>
          <h3 className="font-['Space_Grotesk'] font-bold text-sm sm:text-base text-[var(--bento-text)]">
            Neo-Brutalist Chrome Vector
          </h3>
          <p className="text-xs text-[var(--bento-muted)] leading-relaxed">
            High-contrast metallic textures paired with clean monospace typography for album covers and tour posters.
          </p>
          <div className="pt-2 border-t border-[var(--bento-border)] text-xs font-mono text-[var(--bento-muted)]">
            Studio Tool: Keedohub Cover Studio
          </div>
        </div>

        <div className="bento-card p-3.5 sm:p-5 rounded-2xl border border-[var(--bento-border)] space-y-2.5 sm:space-y-3 transition-all hover:border-purple-500/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">Campaign Hook</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">+240% MoM</span>
          </div>
          <h3 className="font-['Space_Grotesk'] font-bold text-sm sm:text-base text-[var(--bento-text)]">
            Studio POV Micro-Dockets
          </h3>
          <p className="text-xs text-[var(--bento-muted)] leading-relaxed">
            12-second raw studio recordings with subtitles capturing the vocal booth moment before the main drop.
          </p>
          <div className="pt-2 border-t border-[var(--bento-border)] text-xs font-mono text-[var(--bento-muted)]">
            Platform: TikTok & Instagram Reels
          </div>
        </div>
      </div>
    </div>
  );
};
