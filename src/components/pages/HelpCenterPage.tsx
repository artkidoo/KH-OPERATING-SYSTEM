import React from "react";
import { ActiveTab } from "../../types";
import { 
  LifeBuoy, 
  Search, 
  ArrowRight, 
  BookOpen, 
  Disc3, 
  Briefcase, 
  Users, 
  Settings, 
  PhoneCall, 
  Mail, 
  CheckCircle2, 
  ExternalLink 
} from "lucide-react";

interface PageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

export const HelpCenterPage: React.FC<PageProps> = ({ onNavigateTab, openBriefModal }) => {
  return (
    <div className="space-y-10 sm:space-y-14 py-3 sm:py-8 animate-fade-in text-left">
      {/* Page Hero */}
      <section className="relative overflow-hidden rounded-3xl bento-card p-6 sm:p-10 md:p-14 border border-[var(--bento-border)] bg-gradient-to-b from-[var(--bento-card)] to-[var(--bento-bg)]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-pill-text)] text-xs font-mono font-bold uppercase tracking-wider">
            <LifeBuoy className="w-3.5 h-3.5 text-red-500" />
            <span>Keedohub Help Center</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--bento-text)] tracking-tight leading-tight">
            How Can We Assist Your Workflow?
          </h1>
          <p className="text-base sm:text-lg text-[var(--bento-muted)] leading-relaxed font-normal">
            Find guides, release checklists, mastering specifications, and troubleshooting steps to optimize your Keedohub workspace.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab("docs")}
              className="px-5 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs sm:text-sm font-['Space_Grotesk'] flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Browse Documentation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab("faq")}
              className="px-5 py-2.5 rounded-xl bg-[var(--bento-card)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] text-[var(--bento-text)] font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              View FAQs
            </button>
          </div>
        </div>
      </section>

      {/* Help Topics Grid */}
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--bento-muted)]">
            Browse By Topic
          </div>
          <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[var(--bento-text)]">
            Support Categories
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="bento-card p-3.5 sm:p-5 rounded-2xl border border-[var(--bento-border)] space-y-2.5 sm:space-y-3 transition-all hover:border-red-500/40">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Disc3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-['Space_Grotesk'] font-bold text-sm sm:text-base text-[var(--bento-text)]">
              Release Readiness & Audio
            </h3>
            <p className="text-xs text-[var(--bento-muted)] leading-relaxed">
              How to reach 100% readiness across the 7 pillars: mastering LUFS, 3000px artwork, split agreements, and Spotify playlist pitch deadlines.
            </p>
            <ul className="space-y-1.5 text-xs text-[var(--bento-text)] pt-2 border-t border-[var(--bento-border)]">
              <li className="hover:text-red-400 cursor-pointer flex items-center gap-1.5" onClick={() => onNavigateTab("docs")}>
                <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                <span>Audio Loudness & Ceiling Rules</span>
              </li>
              <li className="hover:text-red-400 cursor-pointer flex items-center gap-1.5" onClick={() => onNavigateTab("docs")}>
                <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                <span>DSP 14-Day Ingestion Window</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bento-card p-3.5 sm:p-5 rounded-2xl border border-[var(--bento-border)] space-y-2.5 sm:space-y-3 transition-all hover:border-blue-500/40">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-['Space_Grotesk'] font-bold text-sm sm:text-base text-[var(--bento-text)]">
              Brand OS & Campaigns
            </h3>
            <p className="text-xs text-[var(--bento-muted)] leading-relaxed">
              Managing brand architecture, typography standards, product launch matrices, and high-conversion marketing sprint playbooks.
            </p>
            <ul className="space-y-1.5 text-xs text-[var(--bento-text)] pt-2 border-t border-[var(--bento-border)]">
              <li className="hover:text-blue-400 cursor-pointer flex items-center gap-1.5" onClick={() => onNavigateTab("docs")}>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Brand Core & Positioning Matrix</span>
              </li>
              <li className="hover:text-blue-400 cursor-pointer flex items-center gap-1.5" onClick={() => onNavigateTab("docs")}>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                <span>30-Day Sprint Calendar Setup</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bento-card p-3.5 sm:p-5 rounded-2xl border border-[var(--bento-border)] space-y-2.5 sm:space-y-3 transition-all hover:border-purple-500/40">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-['Space_Grotesk'] font-bold text-sm sm:text-base text-[var(--bento-text)]">
              Collaboration & Roles
            </h3>
            <p className="text-xs text-[var(--bento-muted)] leading-relaxed">
              Inviting team members, assigning client approval roles, handling revision notes, and locking signed split sheet documentation.
            </p>
            <ul className="space-y-1.5 text-xs text-[var(--bento-text)] pt-2 border-t border-[var(--bento-border)]">
              <li className="hover:text-purple-400 cursor-pointer flex items-center gap-1.5" onClick={() => onNavigateTab("docs")}>
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Workspace Member Permissions</span>
              </li>
              <li className="hover:text-purple-400 cursor-pointer flex items-center gap-1.5" onClick={() => onNavigateTab("docs")}>
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Digital Sign-Off Workflows</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Direct Escalation Section */}
      <section className="bento-card p-6 sm:p-10 rounded-2xl border border-[var(--bento-border)] grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500">
            Live Human Support
          </div>
          <h3 className="font-['Space_Grotesk'] text-2xl font-bold text-[var(--bento-text)]">
            Need Direct Executive Assistance?
          </h3>
          <p className="text-sm text-[var(--bento-muted)] leading-relaxed">
            Our technical and release operations producers are available on WhatsApp and email for priority troubleshooting or workspace setups.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-end">
          <a
            href="https://wa.me/2348104465924"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm font-['Space_Grotesk'] flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-transform hover:scale-105"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>

          <button
            onClick={() => onNavigateTab("contact")}
            className="px-5 py-3 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] hover:bg-[var(--bento-card-hover)] text-xs sm:text-sm font-semibold text-[var(--bento-text)] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Submit Dispatch Ticket</span>
          </button>
        </div>
      </section>
    </div>
  );
};
