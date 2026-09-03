import React, { useState } from "react";
import { ActiveTab } from "../../types";
import { 
  FileCode2, 
  Terminal, 
  Layers, 
  Disc3, 
  Briefcase, 
  BrainCircuit, 
  Radio, 
  ShieldCheck, 
  ArrowRight,
  Code,
  Copy,
  Check
} from "lucide-react";

interface PageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

export const DocumentationPage: React.FC<PageProps> = ({ onNavigateTab, openBriefModal }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-12 sm:space-y-16 py-4 sm:py-8 animate-fade-in text-left">
      {/* Page Hero */}
      <section className="relative overflow-hidden rounded-3xl bento-card p-6 sm:p-10 md:p-14 border border-[var(--bento-border)] bg-gradient-to-b from-[var(--bento-card)] to-[var(--bento-bg)]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-pill-text)] text-xs font-mono font-bold uppercase tracking-wider">
            <FileCode2 className="w-3.5 h-3.5 text-purple-500" />
            <span>Developer & System Documentation</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--bento-text)] tracking-tight leading-tight">
            Keedohub System Architecture & Guides.
          </h1>
          <p className="text-base sm:text-lg text-[var(--bento-muted)] leading-relaxed font-normal">
            A comprehensive reference for workspace entity models, 7-pillar release criteria, audio mastering specifications, and the Creative Brain intelligence pipeline.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab("command-center")}
              className="px-5 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs sm:text-sm font-['Space_Grotesk'] flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2-Column Documentation View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-3 sticky top-20">
          <div className="bento-card p-4 rounded-2xl border border-[var(--bento-border)] space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase text-[var(--bento-muted)] tracking-wider">
              Architecture Reference
            </div>
            <a href="#core-architecture" className="block px-3 py-2 rounded-xl text-xs font-semibold text-[var(--bento-text)] hover:bg-[var(--bento-elevated)] transition-colors">
              1. Workspace Core & Environments
            </a>
            <a href="#release-engine" className="block px-3 py-2 rounded-xl text-xs font-semibold text-[var(--bento-text)] hover:bg-[var(--bento-elevated)] transition-colors">
              2. 7-Pillar Music Release Engine
            </a>
            <a href="#brand-os" className="block px-3 py-2 rounded-xl text-xs font-semibold text-[var(--bento-text)] hover:bg-[var(--bento-elevated)] transition-colors">
              3. Brand Architecture OS
            </a>
            <a href="#creative-brain" className="block px-3 py-2 rounded-xl text-xs font-semibold text-[var(--bento-text)] hover:bg-[var(--bento-elevated)] transition-colors">
              4. Creative Brain & Intelligence API
            </a>
            <a href="#keyboard-shortcuts" className="block px-3 py-2 rounded-xl text-xs font-semibold text-[var(--bento-text)] hover:bg-[var(--bento-elevated)] transition-colors">
              5. Global Shortcuts & ⌘K Palette
            </a>
          </div>

          <div className="bento-card p-5 rounded-2xl border border-[var(--bento-border)] space-y-2">
            <div className="text-xs font-mono font-bold text-[var(--bento-text)]">API Server Status</div>
            <p className="text-xs text-[var(--bento-muted)]">
              Integrated with server-side algorithmic rollout models and Google GenAI infrastructure.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>v3.0.0 Stable Runtime</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="lg:col-span-8 space-y-8 text-[var(--bento-text)]">
          {/* Section 1: Workspace Core */}
          <section id="core-architecture" className="bento-card p-6 sm:p-8 rounded-2xl border border-[var(--bento-border)] space-y-4">
            <h2 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold">
              1. Workspace Core & Environments
            </h2>
            <p className="text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed">
              Keedohub isolates data into sovereign workspaces. Each workspace holds persistent releases, marketing campaigns, collaborative tasks, activity logs, and brand assets.
            </p>
            <div className="p-4 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] font-mono text-xs text-zinc-300 space-y-1">
              <div className="text-zinc-500">// Workspace Identity Schema</div>
              <div>interface Workspace &#123;</div>
              <div className="pl-4">id: string;</div>
              <div className="pl-4">name: string;</div>
              <div className="pl-4">identityType: 'artist' | 'brand';</div>
              <div className="pl-4">tier: 'starter' | 'pro' | 'studio' | 'enterprise';</div>
              <div className="pl-4">role: 'owner' | 'admin' | 'creator' | 'reviewer';</div>
              <div>&#125;</div>
            </div>
          </section>

          {/* Section 2: 7-Pillar Release Engine */}
          <section id="release-engine" className="bento-card p-6 sm:p-8 rounded-2xl border border-[var(--bento-border)] space-y-4">
            <h2 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold">
              2. 7-Pillar Music Release Engine
            </h2>
            <p className="text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed">
              To guarantee that songs ingested into DSPs (Spotify, Apple Music, TIDAL) achieve maximum algorithmic and editorial placement, Artist OS calculates a deterministic readiness score across 7 pillars:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
                <strong className="text-red-400">Pillar 1: Audio Mastering</strong>
                <p className="text-[var(--bento-muted)] mt-0.5">24-bit/44.1kHz WAV, -14.0 LUFS integrated loudness, ceiling -1.0 dBTP.</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
                <strong className="text-red-400">Pillar 2: Cover Artwork</strong>
                <p className="text-[var(--bento-muted)] mt-0.5">Strictly 3000x3000px, 300 DPI, sRGB color profile, uncompressed PNG/JPG.</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
                <strong className="text-red-400">Pillar 3: Synchronized Lyrics</strong>
                <p className="text-[var(--bento-muted)] mt-0.5">Time-synced LRC strings and Musixmatch/Apple Music structure.</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
                <strong className="text-red-400">Pillar 4: Split Agreements</strong>
                <p className="text-[var(--bento-muted)] mt-0.5">100% locked publishing and master recording split percentages.</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
                <strong className="text-red-400">Pillar 5: DSP Pitch Letter</strong>
                <p className="text-[var(--bento-muted)] mt-0.5">Optimal 65-word Spotify for Artists submission with promo proof.</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
                <strong className="text-red-400">Pillar 6: Smart Pre-Save</strong>
                <p className="text-[var(--bento-muted)] mt-0.5">Multi-DSP landing link with day-one release auto-save listener funnel.</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] sm:col-span-2">
                <strong className="text-red-400">Pillar 7: EPK Press Dossier</strong>
                <p className="text-[var(--bento-muted)] mt-0.5">High-resolution artist bio, press angles, approved press photos, and streaming metrics.</p>
              </div>
            </div>
          </section>

          {/* Section 3: Keyboard Navigation */}
          <section id="keyboard-shortcuts" className="bento-card p-6 sm:p-8 rounded-2xl border border-[var(--bento-border)] space-y-4">
            <h2 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold">
              3. Global Shortcuts & Command Palette
            </h2>
            <p className="text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed">
              Keedohub is engineered for keyboard-first navigation:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
                <span className="text-[var(--bento-muted)]">Open Command Palette</span>
                <kbd className="px-2 py-1 rounded bg-[var(--bento-card)] border border-[var(--bento-border)] font-mono text-[11px] font-bold text-[var(--bento-text)]">⌘K / Ctrl+K</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
                <span className="text-[var(--bento-muted)]">Open Quick Project Brief</span>
                <kbd className="px-2 py-1 rounded bg-[var(--bento-card)] border border-[var(--bento-border)] font-mono text-[11px] font-bold text-[var(--bento-text)]">⌘B / Header Brief</kbd>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
