import React from "react";
import { ActiveTab } from "../../types";
import { 
  FolderDown, 
  ArrowRight, 
  FileText, 
  Disc3, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  BookOpen,
  Layers,
  Download
} from "lucide-react";

interface PageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

export const ResourcesPage: React.FC<PageProps> = ({ onNavigateTab, openBriefModal }) => {
  return (
    <div className="space-y-10 sm:space-y-14 py-3 sm:py-8 animate-fade-in text-left">
      {/* Page Hero */}
      <section className="relative overflow-hidden rounded-3xl bento-card p-6 sm:p-10 md:p-14 border border-[var(--bento-border)] bg-gradient-to-b from-[var(--bento-card)] to-[var(--bento-bg)]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-pill-text)] text-xs font-mono font-bold uppercase tracking-wider">
            <FolderDown className="w-3.5 h-3.5 text-emerald-500" />
            <span>Curated Creative Resources</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--bento-text)] tracking-tight leading-tight">
            Release Guides, Playbooks & Production Standards.
          </h1>
          <p className="text-base sm:text-lg text-[var(--bento-muted)] leading-relaxed font-normal">
            Essential operational knowledge developed through real-world music campaigns, cover art engineering, and corporate brand positioning.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab("command-center")}
              className="px-5 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs sm:text-sm font-['Space_Grotesk'] flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Access In-App Vault</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Resource Cards Grid */}
      <section className="space-y-5 sm:space-y-6">
        <div className="space-y-2">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--bento-muted)]">
            Production Knowledge
          </div>
          <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[var(--bento-text)]">
            Guides & Operational Playbooks
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
          {/* Item 1 */}
          <div className="bento-card p-3.5 sm:p-5 transition-all group cursor-pointer text-left flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-red-500/50">
            <div className="space-y-2.5 sm:space-y-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <Disc3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-['Space_Grotesk'] font-bold text-sm sm:text-base text-[var(--bento-text)]">
                The 30-Day Music Release Playbook
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--bento-muted)] leading-relaxed">
                Step-by-step release calendar covering T-30 days to Drop Day: pre-save launches, teaser audio snippets, Spotify editorial pitching, and TikTok dance challenges.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("artist-os")}
              className="w-full min-h-10 py-2 px-2 sm:px-3 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-card-hover)] border border-[var(--bento-border)] text-[10px] sm:text-xs font-semibold text-[var(--bento-text)] flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-colors"
            >
              <span>Open in Artist OS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Item 2 */}
          <div className="bento-card p-3.5 sm:p-5 transition-all group cursor-pointer text-left flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-blue-500/50">
            <div className="space-y-2.5 sm:space-y-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-['Space_Grotesk'] font-bold text-sm sm:text-base text-[var(--bento-text)]">
                Music Split Sheets Standard
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--bento-muted)] leading-relaxed">
                Comprehensive guide to legal split sheet documentation, distinguishing master recording shares from musical composition publishing rights.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("splits-calculator")}
              className="w-full min-h-10 py-2 px-2 sm:px-3 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-card-hover)] border border-[var(--bento-border)] text-[10px] sm:text-xs font-semibold text-[var(--bento-text)] flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-colors"
            >
              <span>Use Split Sheet Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Item 3 */}
          <div className="bento-card p-3.5 sm:p-5 transition-all group cursor-pointer text-left flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-amber-500/50">
            <div className="space-y-2.5 sm:space-y-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-['Space_Grotesk'] font-bold text-sm sm:text-base text-[var(--bento-text)]">
                Album Cover Artwork Science
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--bento-muted)] leading-relaxed">
                How to design high-impact cover art that scales seamlessly from small 50px mobile streaming thumbnails to billboard physical prints.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("cover-studio")}
              className="w-full min-h-10 py-2 px-2 sm:px-3 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-card-hover)] border border-[var(--bento-border)] text-[10px] sm:text-xs font-semibold text-[var(--bento-text)] flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-colors"
            >
              <span>Open Cover Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Item 4 */}
          <div className="bento-card p-3.5 sm:p-5 transition-all group cursor-pointer text-left flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-purple-500/50">
            <div className="space-y-2.5 sm:space-y-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-['Space_Grotesk'] font-bold text-sm sm:text-base text-[var(--bento-text)]">
                Brand Core & Positioning Canvas
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--bento-muted)] leading-relaxed">
                Strategic blueprint for establishing brand mission, target personas, distinctive visual marks, and high-conversion landing page layouts.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("brand-os")}
              className="w-full min-h-10 py-2 px-2 sm:px-3 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-card-hover)] border border-[var(--bento-border)] text-[10px] sm:text-xs font-semibold text-[var(--bento-text)] flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-colors"
            >
              <span>Open Brand OS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Item 5 */}
          <div className="bento-card p-3.5 sm:p-5 transition-all group cursor-pointer text-left flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-emerald-500/50">
            <div className="space-y-2.5 sm:space-y-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-['Space_Grotesk'] font-bold text-sm sm:text-base text-[var(--bento-text)]">
                Creative Work-For-Hire Agreement
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--bento-muted)] leading-relaxed">
                Standard contract clauses protecting producers, designers, session vocalists, and video directors with explicit assignment of rights.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("resource-vault")}
              className="w-full min-h-10 py-2 px-2 sm:px-3 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-card-hover)] border border-[var(--bento-border)] text-[10px] sm:text-xs font-semibold text-[var(--bento-text)] flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-colors"
            >
              <span>Access Legal Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Item 6 */}
          <div className="bento-card p-3.5 sm:p-5 transition-all group cursor-pointer text-left flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-rose-500/50">
            <div className="space-y-2.5 sm:space-y-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-['Space_Grotesk'] font-bold text-sm sm:text-base text-[var(--bento-text)]">
                DSP Editorial Pitch Formulas
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--bento-muted)] leading-relaxed">
                Proven pitch sentence structures that playlist curators at Spotify, Apple Music, and Amazon Music read when selecting editorial highlights.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("dsp-pitcher")}
              className="w-full min-h-10 py-2 px-2 sm:px-3 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-card-hover)] border border-[var(--bento-border)] text-[10px] sm:text-xs font-semibold text-[var(--bento-text)] flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-colors"
            >
              <span>Test Pitch Generator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
