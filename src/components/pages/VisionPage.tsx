import React from "react";
import { ActiveTab } from "../../types";
import { 
  Eye, 
  ArrowRight, 
  TrendingUp, 
  Layers, 
  Cpu, 
  Compass, 
  CheckCircle2, 
  Workflow
} from "lucide-react";

interface PageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

export const VisionPage: React.FC<PageProps> = ({ onNavigateTab, openBriefModal }) => {
  return (
    <div className="space-y-12 sm:space-y-16 py-4 sm:py-8 animate-fade-in text-left">
      {/* Page Hero */}
      <section className="relative overflow-hidden rounded-3xl bento-card p-6 sm:p-10 md:p-14 border border-[var(--bento-border)] bg-gradient-to-b from-[var(--bento-card)] to-[var(--bento-bg)]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-pill-text)] text-xs font-mono font-bold uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            <span>Our Vision</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--bento-text)] tracking-tight leading-tight">
            The Operating System for the Autonomous Creative Economy.
          </h1>
          <p className="text-base sm:text-lg text-[var(--bento-muted)] leading-relaxed font-normal">
            We envision a world where individual artists and ambitious brands operate with the structural power, intelligence, and execution precision of an elite multinational studio.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab("command-center")}
              className="px-5 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs sm:text-sm font-['Space_Grotesk'] flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Explore the OS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab("story")}
              className="px-5 py-2.5 rounded-xl bg-[var(--bento-card)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] text-[var(--bento-text)] font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Read Our Story
            </button>
          </div>
        </div>
      </section>

      {/* The 3 Horizons of Keedohub */}
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--bento-muted)]">
            Strategic Roadmap
          </div>
          <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[var(--bento-text)]">
            Our Architectural Horizons
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bento-card p-6 rounded-2xl border border-[var(--bento-border)] space-y-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-mono font-bold text-sm">
              01
            </div>
            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[var(--bento-text)]">
              Unified Creative Infrastructure
            </h3>
            <p className="text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed">
              Consolidating songwriting metadata, stem mastering, 3000x3000px artwork, lyric sync, and digital split sheets into a single, reliable workspace.
            </p>
          </div>

          <div className="bento-card p-6 rounded-2xl border border-[var(--bento-border)] space-y-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-mono font-bold text-sm">
              02
            </div>
            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[var(--bento-text)]">
              Autonomous Intelligence (Creative Brain)
            </h3>
            <p className="text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed">
              Moving from passive dashboards to proactive intelligence. Creative Brain diagnoses missing release requirements and formulates exact 30-day marketing playbooks automatically.
            </p>
          </div>

          <div className="bento-card p-6 rounded-2xl border border-[var(--bento-border)] space-y-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono font-bold text-sm">
              03
            </div>
            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[var(--bento-text)]">
              Sovereign Cultural Economies
            </h3>
            <p className="text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed">
              Empowering creators from emerging cultural capitals (Lagos, Nairobi, Accra, London) to build independent creative empires with uncompromised IP ownership and global distribution.
            </p>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="bento-card p-6 sm:p-10 rounded-2xl border border-[var(--bento-border)] space-y-6">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[var(--bento-text)]">
            Our Non-Negotiable Principles
          </h2>
          <p className="text-sm text-[var(--bento-muted)]">
            How we guide every line of code and every studio workflow inside Keedohub.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-[var(--bento-text)]">No Shallow Gimmicks</h4>
              <p className="text-xs text-[var(--bento-muted)] mt-1">
                We build serious tools for serious creators. Every feature must tangibly shorten rollout cycles or increase distribution velocity.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-[var(--bento-text)]">Simple Outside, Deep Inside</h4>
              <p className="text-xs text-[var(--bento-muted)] mt-1">
                The public experience is clear, elegant, and discoverable. The internal workspace holds the full depth of an enterprise creative OS.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-[var(--bento-text)]">Creator Data Sovereignty</h4>
              <p className="text-xs text-[var(--bento-muted)] mt-1">
                Your tracks, stems, concepts, and campaign strategies belong to you. We never train public models on your proprietary work.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-[var(--bento-text)]">Engineered for Velocity</h4>
              <p className="text-xs text-[var(--bento-muted)] mt-1">
                Speed is a competitive advantage in culture. Keedohub turns 4-week release preparation into 48-hour turnarounds.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
