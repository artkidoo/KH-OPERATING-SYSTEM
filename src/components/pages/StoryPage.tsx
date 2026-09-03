import React from "react";
import { ActiveTab } from "../../types";
import { 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Heart, 
  Compass, 
  Disc3, 
  Award 
} from "lucide-react";

interface PageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

export const StoryPage: React.FC<PageProps> = ({ onNavigateTab, openBriefModal }) => {
  return (
    <div className="space-y-12 sm:space-y-16 py-4 sm:py-8 animate-fade-in text-left">
      {/* Page Hero */}
      <section className="relative overflow-hidden rounded-3xl bento-card p-6 sm:p-10 md:p-14 border border-[var(--bento-border)] bg-gradient-to-b from-[var(--bento-card)] to-[var(--bento-bg)]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-pill-text)] text-xs font-mono font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Our Story & Philosophy</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--bento-text)] tracking-tight leading-tight">
            Born in Lagos. Engineered for the Global Creative Vanguard.
          </h1>
          <p className="text-base sm:text-lg text-[var(--bento-muted)] leading-relaxed font-normal">
            Keedohub was born from a direct observation: the most vibrant cultural movements on earth were being held back not by lack of genius, but by broken, disjointed creative infrastructure.
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
              onClick={() => onNavigateTab("contact")}
              className="px-5 py-2.5 rounded-xl bg-[var(--bento-card)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] text-[var(--bento-text)] font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Contact Founder & Team
            </button>
          </div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6 text-[var(--bento-text)] text-sm sm:text-base leading-relaxed">
          <div className="bento-card p-6 sm:p-8 rounded-2xl border border-[var(--bento-border)] space-y-4">
            <h2 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[var(--bento-text)]">
              The Genesis
            </h2>
            <p className="text-[var(--bento-muted)]">
              In late night recording sessions across Lagos, Nigeria, founder <strong>Ojo Abdulkareem</strong> witnessed an all-too-common tragedy: extraordinary records that took months of emotional sweat to write and produce would drop with zero editorial momentum.
            </p>
            <p className="text-[var(--bento-muted)]">
              Producers didn't have signed split sheets. Cover artwork was hurried 3 hours before upload. DSP pitches were missed because nobody knew the 14-day lead time rule. Marketing budgets were burned on untargeted ads without a unified visual identity.
            </p>
            <p className="text-[var(--bento-muted)]">
              The issue was structural. Hollywood studios and major record labels had dedicated departments for legal, artwork, rollout strategy, mastering QA, and DSP relations. Independent artists and modern brands had twenty browser tabs and a chaotic WhatsApp group.
            </p>
          </div>

          <div className="bento-card p-6 sm:p-8 rounded-2xl border border-[var(--bento-border)] space-y-4">
            <h2 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[var(--bento-text)]">
              The Architectural Shift: One OS
            </h2>
            <p className="text-[var(--bento-muted)]">
              Keedohub was engineered to be the equalizer. Rather than building another random utility or lightweight generator, we built a comprehensive <strong>Creative Operating System</strong>.
            </p>
            <p className="text-[var(--bento-muted)]">
              We formalized the <strong>7-Pillar Release Readiness</strong> framework for musicians, and the <strong>Brand Architecture OS</strong> for businesses. We embedded autonomous reasoning into the <strong>Creative Brain</strong> so that gaps are detected before drop day, not after failure.
            </p>
            <p className="text-[var(--bento-muted)]">
              Today, Keedohub stands as a unified workspace where creators from across the globe build lasting creative IP with total confidence.
            </p>
          </div>
        </div>

        {/* Sidebar Info Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bento-card p-6 rounded-2xl border border-[var(--bento-border)] space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[var(--bento-muted)]">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>Headquarters</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[var(--bento-text)]">Lagos, Nigeria</h3>
              <p className="text-xs text-[var(--bento-muted)]">
                The cultural epicenter of modern Afrobeats, global youth culture, and fearless creative entrepreneurship.
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--bento-border)] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--bento-muted)]">Founder & Lead:</span>
                <span className="font-semibold text-[var(--bento-text)]">Ojo Abdulkareem</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--bento-muted)]">Serving:</span>
                <span className="font-semibold text-[var(--bento-text)]">Global Creators & Brands</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--bento-muted)]">Core Framework:</span>
                <span className="font-semibold text-[var(--bento-text)]">7-Pillar Release OS</span>
              </div>
            </div>
          </div>

          <div className="bento-card p-6 rounded-2xl border border-[var(--bento-border)] bg-gradient-to-br from-red-950/20 to-transparent space-y-2">
            <Award className="w-5 h-5 text-red-400" />
            <h4 className="font-['Space_Grotesk'] font-bold text-sm text-[var(--bento-text)]">
              The Keedohub Guarantee
            </h4>
            <p className="text-xs text-[var(--bento-muted)] leading-relaxed">
              Every asset, contract, stem, and guideline created inside your Keedohub workspace is 100% owned by you. We build the operating rails; you build the empire.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
