import React from "react";
import { ActiveTab } from "../../types";
import { 
  Sparkles, 
  ArrowRight, 
  Disc3, 
  Briefcase, 
  Cpu, 
  ShieldCheck, 
  Users, 
  Zap, 
  Globe2,
  CheckCircle2
} from "lucide-react";

interface PageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

export const AboutPage: React.FC<PageProps> = ({ onNavigateTab, openBriefModal }) => {
  return (
    <div className="space-y-12 sm:space-y-16 py-4 sm:py-8 animate-fade-in text-left">
      {/* Page Hero */}
      <section className="relative overflow-hidden rounded-3xl bento-card p-6 sm:p-10 md:p-14 border border-[var(--bento-border)] bg-gradient-to-b from-[var(--bento-card)] to-[var(--bento-bg)]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-pill-text)] text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span>About Keedohub</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--bento-text)] tracking-tight leading-tight">
            The Creative Operating System for Artists & Brands.
          </h1>
          <p className="text-base sm:text-lg text-[var(--bento-muted)] leading-relaxed font-normal">
            Keedohub unifies release architecture, visual design studios, strategic marketing intelligence, and asset management into one coherent environment — eliminating creative fragmentation so creators can execute at the highest global caliber.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab("command-center")}
              className="px-5 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs sm:text-sm font-['Space_Grotesk'] flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Enter Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={openBriefModal}
              className="px-5 py-2.5 rounded-xl bg-[var(--bento-card)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] text-[var(--bento-text)] font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Start a Project
            </button>
          </div>
        </div>
      </section>

      {/* The Core Problem & Solution */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div className="bento-card p-6 sm:p-8 rounded-2xl border border-[var(--bento-border)] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[var(--bento-text)]">
            The Problem We Solved
          </h2>
          <p className="text-sm text-[var(--bento-muted)] leading-relaxed">
            Modern creators and brands do not suffer from lack of talent — they suffer from operational chaos. Tracks get finished, but rollouts stall because artwork, DSP pitching, split sheets, social hooks, and budget timelines are scattered across spreadsheets, messy folders, and disjointed freelance threads.
          </p>
          <p className="text-sm text-[var(--bento-muted)] leading-relaxed">
            Keedohub was engineered to replace this chaotic patchwork with a singular, high-precision operating system.
          </p>
        </div>

        <div className="bento-card p-6 sm:p-8 rounded-2xl border border-[var(--bento-border)] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[var(--bento-text)]">
            Two Operating Environments
          </h2>
          <p className="text-sm text-[var(--bento-muted)] leading-relaxed">
            Keedohub is structured around two dedicated user environments:
          </p>
          <ul className="space-y-2 text-sm text-[var(--bento-text)]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span><strong>Artist Workspace (powered by Artist OS):</strong> Built for musicians, producers, and label managers to handle release readiness, mastering quality, metadata, cover art, and editorial pitching.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span><strong>Brand Workspace (powered by Brand OS):</strong> Engineered for businesses, agencies, and ventures to execute brand positioning, multi-channel campaigns, asset consistency, and conversion funnels.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--bento-muted)]">
            Foundation & Philosophy
          </div>
          <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[var(--bento-text)]">
            What Defines Keedohub
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bento-card p-5 rounded-2xl border border-[var(--bento-border)] space-y-2">
            <Disc3 className="w-6 h-6 text-red-400" />
            <h3 className="font-['Space_Grotesk'] font-bold text-base text-[var(--bento-text)]">7-Pillar Readiness</h3>
            <p className="text-xs text-[var(--bento-muted)] leading-relaxed">
              Every drop is measured against deterministic standards: audio mastering, cover art, synchronized lyrics, legal splits, pre-save velocity, press dossier, and editorial pitch.
            </p>
          </div>

          <div className="bento-card p-5 rounded-2xl border border-[var(--bento-border)] space-y-2">
            <Briefcase className="w-6 h-6 text-blue-400" />
            <h3 className="font-['Space_Grotesk'] font-bold text-base text-[var(--bento-text)]">Commercial Ownership</h3>
            <p className="text-xs text-[var(--bento-muted)] leading-relaxed">
              100% creator ownership. Everything generated or managed inside your workspace — stems, split sheets, vectors, and brand tokens — remains strictly your intellectual property.
            </p>
          </div>

          <div className="bento-card p-5 rounded-2xl border border-[var(--bento-border)] space-y-2">
            <Zap className="w-6 h-6 text-amber-400" />
            <h3 className="font-['Space_Grotesk'] font-bold text-base text-[var(--bento-text)]">Intelligence In Action</h3>
            <p className="text-xs text-[var(--bento-muted)] leading-relaxed">
              Our Creative Brain and Creative Radar analyze gaps proactively, recommending exact actions before bottlenecks threaten drop day or campaign deadlines.
            </p>
          </div>

          <div className="bento-card p-5 rounded-2xl border border-[var(--bento-border)] space-y-2">
            <Globe2 className="w-6 h-6 text-emerald-400" />
            <h3 className="font-['Space_Grotesk'] font-bold text-base text-[var(--bento-text)]">Global Execution</h3>
            <p className="text-xs text-[var(--bento-muted)] leading-relaxed">
              Engineered in Lagos, Nigeria and serving creators, labels, and businesses across London, New York, Johannesburg, Toronto, and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership & Origin */}
      <section className="bento-card p-6 sm:p-10 rounded-2xl border border-[var(--bento-border)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--bento-muted)]">
            Founder & Direction
          </div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[var(--bento-text)]">
            Built by Creators Who Understand the Stakes
          </h2>
          <p className="text-sm text-[var(--bento-muted)] leading-relaxed">
            Keedohub was founded by <strong>Ojo Abdulkareem</strong> with a singular mission: to provide the next generation of music artists and innovative brands with enterprise-grade operating tools that match the speed of modern culture.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab("contact")}
          className="px-5 py-2.5 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-card-hover)] border border-[var(--bento-border)] text-xs sm:text-sm font-semibold text-[var(--bento-text)] shrink-0 transition-all cursor-pointer"
        >
          Get In Touch With Team
        </button>
      </section>
    </div>
  );
};
