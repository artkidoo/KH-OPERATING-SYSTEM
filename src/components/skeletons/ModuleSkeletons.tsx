import React from "react";
import { Sparkles, Disc3, Palette, Video, FileText, PieChart, BookOpen, Music, Activity, Layers, Radio, Briefcase } from "lucide-react";

// ==========================================
// BASE SKELETON PRIMITIVES
// ==========================================

export const SkeletonLine: React.FC<{
  className?: string;
  width?: string;
  height?: string;
}> = ({ className = "", width = "w-full", height = "h-4" }) => (
  <div
    className={`skeleton-shimmer rounded-md ${width} ${height} ${className}`}
  />
);

export const SkeletonRect: React.FC<{
  className?: string;
}> = ({ className = "w-full h-24 rounded-2xl" }) => (
  <div className={`skeleton-shimmer ${className}`} />
);

export const SkeletonBadge: React.FC<{
  className?: string;
  width?: string;
}> = ({ className = "", width = "w-20" }) => (
  <div className={`skeleton-shimmer rounded-full h-5 ${width} ${className}`} />
);

// Loading Banner with live pulsing status
export const SkeletonStatusIndicator: React.FC<{
  label?: string;
  subtext?: string;
  icon?: React.ReactNode;
}> = ({
  label = "Initializing Creative OS Engine...",
  subtext = "Synthesizing real-time neural architecture & tactical models",
  icon = <Sparkles className="w-4 h-4 text-[var(--accent-pill-text)] animate-spin" />
}) => (
  <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[var(--bento-card)] border border-[var(--accent-border)] shadow-lg shadow-[var(--accent-glow)] mb-6 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-[var(--accent-light)] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="space-y-0.5 text-left">
        <div className="text-xs sm:text-sm font-['Space_Grotesk'] font-bold text-[var(--bento-text)] flex items-center gap-2">
          <span>{label}</span>
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent-color)] animate-ping" />
        </div>
        <div className="text-[11px] text-[var(--bento-muted)] font-mono">
          {subtext}
        </div>
      </div>
    </div>
    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bento-elevated)] border border-[var(--bento-border)] font-mono text-[10px] text-[var(--accent-pill-text)]">
      <span>PROCESSING</span>
    </div>
  </div>
);

// ==========================================
// 1. ARTIST CONTENT BRAIN SKELETON
// ==========================================

export const ArtistBrainSkeleton: React.FC<{
  isInlineResultOnly?: boolean;
}> = ({ isInlineResultOnly = false }) => {
  const resultSkeleton = (
    <div className="space-y-6 text-left">
      {/* Campaign Architecture Header Card */}
      <div className="bento-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2 flex-1">
            <SkeletonBadge width="w-48" className="h-4" />
            <SkeletonLine width="w-3/4" height="h-6" />
          </div>
          <SkeletonRect className="w-28 h-9 rounded-xl" />
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-2">
          <SkeletonLine width="w-32" height="h-3.5" />
          <SkeletonLine width="w-full" height="h-3" />
          <SkeletonLine width="w-5/6" height="h-3" />
        </div>

        {/* Phase Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--bento-border)]">
          <SkeletonRect className="w-28 h-8 rounded-xl" />
          <SkeletonRect className="w-24 h-8 rounded-xl" />
          <SkeletonRect className="w-28 h-8 rounded-xl" />
        </div>
      </div>

      {/* Active Phase Schedule Cards */}
      <div className="bento-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--bento-border)]">
          <div className="space-y-1.5 flex-1">
            <SkeletonLine width="w-48" height="h-5" />
            <SkeletonLine width="w-72" height="h-3.5" />
          </div>
          <SkeletonBadge width="w-24" className="h-6" />
        </div>

        {/* 3 Action Cards */}
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="p-4 rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SkeletonBadge width="w-16" className="h-5" />
                  <SkeletonLine width="w-32" height="h-4" />
                </div>
                <SkeletonBadge width="w-20" className="h-4" />
              </div>
              <SkeletonLine width="w-full" height="h-3.5" />
              <div className="p-2.5 rounded-xl bg-[var(--bento-card)] border border-[var(--bento-border)] space-y-1.5">
                <SkeletonLine width="w-24" height="h-3" />
                <SkeletonLine width="90%" height="h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DSP & Viral Hooks Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bento-card p-4 space-y-3">
          <SkeletonLine width="w-36" height="h-4" />
          <SkeletonLine width="w-full" height="h-3" />
          <SkeletonLine width="w-4/5" height="h-3" />
        </div>
        <div className="bento-card p-4 space-y-3">
          <SkeletonLine width="w-36" height="h-4" />
          <SkeletonLine width="w-full" height="h-3" />
          <SkeletonLine width="w-4/5" height="h-3" />
        </div>
      </div>
    </div>
  );

  if (isInlineResultOnly) {
    return resultSkeleton;
  }

  return (
    <div className="space-y-8 text-left pb-16">
      {/* Header Bento Card Skeleton */}
      <div className="p-6 sm:p-8 bento-card border-[var(--bento-border)] space-y-4">
        <SkeletonBadge width="w-56" className="h-6" />
        <SkeletonLine width="w-3/5" height="h-8" />
        <SkeletonLine width="w-4/5" height="h-4" />
      </div>

      <SkeletonStatusIndicator
        label="Synthesizing 30-Day Campaign Architecture..."
        subtext="Generating TikTok viral hooks, Spotify pitches, release timelines & diaspora angles"
        icon={<Disc3 className="w-4 h-4 text-[var(--accent-pill-text)] animate-spin" />}
      />

      {/* 2-Column Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bento-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--bento-border)]">
              <SkeletonLine width="w-40" height="h-4" />
              <SkeletonBadge width="w-20" className="h-4" />
            </div>
            <div className="flex gap-2">
              <SkeletonBadge width="w-24" className="h-6" />
              <SkeletonBadge width="w-24" className="h-6" />
              <SkeletonBadge width="w-24" className="h-6" />
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <SkeletonLine width="w-28" height="h-3" />
                <SkeletonRect className="w-full h-10 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <SkeletonLine width="w-28" height="h-3" />
                <SkeletonRect className="w-full h-10 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <SkeletonLine width="w-28" height="h-3" />
                <SkeletonRect className="w-full h-20 rounded-xl" />
              </div>
            </div>
            <SkeletonRect className="w-full h-12 rounded-2xl" />
          </div>
        </div>

        {/* Right Result Skeleton */}
        <div className="lg:col-span-7">
          {resultSkeleton}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. BRAND ARCHITECTURE OS SKELETON
// ==========================================

export const BrandOSSkeleton: React.FC<{
  isInlineResultOnly?: boolean;
}> = ({ isInlineResultOnly = false }) => {
  const resultSkeleton = (
    <div className="space-y-6 text-left">
      {/* Slogan & Archetype Skeleton */}
      <div className="bento-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonBadge width="w-48" className="h-4" />
          <SkeletonRect className="w-24 h-8 rounded-xl" />
        </div>
        <SkeletonLine width="w-4/5" height="h-6" />
        <div className="p-3.5 rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-2">
          <SkeletonLine width="w-32" height="h-3.5" />
          <SkeletonLine width="w-full" height="h-3" />
        </div>
        <div className="border-t border-[var(--bento-border)] pt-3 space-y-1.5">
          <SkeletonLine width="w-full" height="h-3" />
          <SkeletonLine width="w-3/4" height="h-3" />
        </div>
      </div>

      {/* Color Palette Tokens Skeleton */}
      <div className="bento-card p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--bento-border)]">
          <Palette className="w-4 h-4 text-[var(--accent-pill-text)]" />
          <SkeletonLine width="w-36" height="h-4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="p-3 rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-2"
            >
              <SkeletonRect className="w-full h-10 rounded-xl" />
              <SkeletonLine width="w-3/4" height="h-3" />
              <SkeletonLine width="w-full" height="h-2.5" />
            </div>
          ))}
        </div>
      </div>

      {/* Typography Pairings Skeleton */}
      <div className="bento-card p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--bento-border)]">
          <SkeletonLine width="w-44" height="h-4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="p-3.5 rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-2"
            >
              <SkeletonLine width="w-24" height="h-3" />
              <SkeletonLine width="w-full" height="h-4" />
              <SkeletonLine width="w-4/5" height="h-2.5" />
            </div>
          ))}
        </div>
      </div>

      {/* Voice & Tone Matrix Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bento-card p-4 space-y-3">
          <SkeletonLine width="w-32" height="h-4" />
          <SkeletonLine width="w-full" height="h-3" />
          <SkeletonLine width="w-5/6" height="h-3" />
          <SkeletonLine width="w-4/5" height="h-3" />
        </div>
        <div className="bento-card p-4 space-y-3">
          <SkeletonLine width="w-32" height="h-4" />
          <SkeletonLine width="w-full" height="h-3" />
          <SkeletonLine width="w-5/6" height="h-3" />
          <SkeletonLine width="w-4/5" height="h-3" />
        </div>
      </div>
    </div>
  );

  if (isInlineResultOnly) {
    return resultSkeleton;
  }

  return (
    <div className="space-y-8 text-left pb-16">
      {/* Header Skeleton */}
      <div className="p-6 sm:p-8 bento-card border-[var(--bento-border)] space-y-4">
        <SkeletonBadge width="w-52" className="h-6" />
        <SkeletonLine width="w-3/5" height="h-8" />
        <SkeletonLine width="w-4/5" height="h-4" />
      </div>

      <SkeletonStatusIndicator
        label="Architecting Brand Strategy & Identity Tokens..."
        subtext="Synthesizing archetype matrices, Keedohub color systems, typography pairings & launch sprints"
        icon={<Palette className="w-4 h-4 text-[var(--accent-pill-text)] animate-bounce" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bento-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--bento-border)]">
              <SkeletonLine width="w-40" height="h-4" />
              <SkeletonBadge width="w-20" className="h-4" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="space-y-1.5">
                  <SkeletonLine width="w-28" height="h-3" />
                  <SkeletonRect className="w-full h-10 rounded-xl" />
                </div>
              ))}
            </div>
            <SkeletonRect className="w-full h-12 rounded-2xl" />
          </div>
        </div>

        {/* Right Output Skeleton */}
        <div className="lg:col-span-7">
          {resultSkeleton}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. COVER STUDIO SKELETON
// ==========================================

export const CoverStudioSkeleton: React.FC = () => (
  <div className="space-y-8 text-left pb-16">
    {/* Header Skeleton */}
    <div className="p-6 sm:p-8 bento-card border-[var(--bento-border)] space-y-4">
      <SkeletonBadge width="w-56" className="h-6" />
      <SkeletonLine width="w-3/5" height="h-8" />
      <SkeletonLine width="w-4/5" height="h-4" />
    </div>

    <SkeletonStatusIndicator
      label="Rendering 3000 × 3000px High-Resolution Canvas..."
      subtext="Calibrating 3D vinyl shaders, typography overlays, parental advisory & streaming badges"
      icon={<Disc3 className="w-4 h-4 text-[var(--accent-pill-text)] animate-spin" />}
    />

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Canvas Area Skeleton */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bento-card p-6 flex flex-col items-center justify-center space-y-4">
          <div className="w-full max-w-md aspect-square rounded-3xl skeleton-shimmer border border-[var(--bento-border)] flex flex-col items-center justify-center p-8 space-y-4 relative overflow-hidden">
            <div className="w-32 h-32 rounded-full border-4 border-[var(--bento-elevated)] skeleton-shimmer" />
            <SkeletonLine width="w-48" height="h-6" />
            <SkeletonLine width="w-32" height="h-4" />
          </div>
          <div className="flex gap-2">
            <SkeletonBadge width="w-24" className="h-8" />
            <SkeletonBadge width="w-24" className="h-8" />
            <SkeletonBadge width="w-24" className="h-8" />
          </div>
        </div>
      </div>

      {/* Controls Area Skeleton */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bento-card p-5 space-y-4">
          <SkeletonLine width="w-36" height="h-4" />
          <div className="flex gap-2">
            <SkeletonBadge width="w-20" className="h-7" />
            <SkeletonBadge width="w-20" className="h-7" />
            <SkeletonBadge width="w-20" className="h-7" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1">
                <SkeletonLine width="w-24" height="h-3" />
                <SkeletonRect className="w-full h-9 rounded-xl" />
              </div>
            ))}
          </div>
          <SkeletonRect className="w-full h-12 rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// 4. CREATOR OS SKELETON
// ==========================================

export const CreatorOSSkeleton: React.FC = () => (
  <div className="space-y-8 text-left pb-16">
    <div className="p-6 sm:p-8 bento-card border-[var(--bento-border)] space-y-4">
      <SkeletonBadge width="w-60" className="h-6" />
      <SkeletonLine width="w-3/5" height="h-8" />
      <SkeletonLine width="w-4/5" height="h-4" />
    </div>

    <SkeletonStatusIndicator
      label="Loading Viral Hook Architecture & Script Vault..."
      subtext="Analyzing high-retention TikTok, Reels & Shorts patterns"
      icon={<Video className="w-4 h-4 text-[var(--accent-pill-text)]" />}
    />

    {/* Filter Pills */}
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <SkeletonBadge key={i} width="w-24" className="h-8" />
      ))}
    </div>

    {/* Hook Cards Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bento-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <SkeletonBadge width="w-20" className="h-5" />
            <SkeletonBadge width="w-16" className="h-5" />
          </div>
          <SkeletonLine width="w-full" height="h-4" />
          <SkeletonLine width="w-4/5" height="h-4" />
          <SkeletonRect className="w-full h-14 rounded-xl" />
          <div className="flex items-center justify-between pt-2 border-t border-[var(--bento-border)]">
            <SkeletonLine width="w-28" height="h-3" />
            <SkeletonBadge width="w-14" className="h-6" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ==========================================
// 5. EPK PRESS DOSSIER SKELETON
// ==========================================

export const EPKBuilderSkeleton: React.FC = () => (
  <div className="space-y-8 text-left pb-16">
    <div className="p-6 sm:p-8 bento-card border-[var(--bento-border)] space-y-4">
      <SkeletonBadge width="w-52" className="h-6" />
      <SkeletonLine width="w-3/5" height="h-8" />
      <SkeletonLine width="w-4/5" height="h-4" />
    </div>

    <SkeletonStatusIndicator
      label="Formatting EPK Press Dossier..."
      subtext="Compiling stream analytics, bio narratives, discography and press releases"
      icon={<FileText className="w-4 h-4 text-[var(--accent-pill-text)]" />}
    />

    {/* Artist Banner Skeleton */}
    <div className="bento-card p-6 flex flex-wrap items-center gap-6">
      <div className="w-24 h-24 rounded-2xl skeleton-shimmer shrink-0" />
      <div className="space-y-2 flex-1 min-w-[200px]">
        <SkeletonLine width="w-48" height="h-6" />
        <SkeletonLine width="w-32" height="h-4" />
        <div className="flex gap-2">
          <SkeletonBadge width="w-20" className="h-5" />
          <SkeletonBadge width="w-20" className="h-5" />
        </div>
      </div>
      <div className="flex gap-3">
        <SkeletonRect className="w-20 h-14 rounded-xl" />
        <SkeletonRect className="w-20 h-14 rounded-xl" />
      </div>
    </div>

    {/* Content Sections Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-6">
        <div className="bento-card p-5 space-y-3">
          <SkeletonLine width="w-36" height="h-4" />
          <SkeletonLine width="w-full" height="h-3.5" />
          <SkeletonLine width="w-full" height="h-3.5" />
          <SkeletonLine width="w-3/4" height="h-3.5" />
        </div>
        <div className="bento-card p-5 space-y-3">
          <SkeletonLine width="w-44" height="h-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <SkeletonRect key={i} className="w-full h-14 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-4 space-y-6">
        <div className="bento-card p-5 space-y-3">
          <SkeletonLine width="w-32" height="h-4" />
          <SkeletonRect className="w-full h-40 rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// 6. SPLITS & ROYALTY SKELETON
// ==========================================

export const SplitsCalculatorSkeleton: React.FC = () => (
  <div className="space-y-8 text-left pb-16">
    <div className="p-6 sm:p-8 bento-card border-[var(--bento-border)] space-y-4">
      <SkeletonBadge width="w-56" className="h-6" />
      <SkeletonLine width="w-3/5" height="h-8" />
      <SkeletonLine width="w-4/5" height="h-4" />
    </div>

    <SkeletonStatusIndicator
      label="Balancing Splits & DSP Royalty Projections..."
      subtext="Verifying 100% master & publishing balances and IPI metadata"
      icon={<PieChart className="w-4 h-4 text-[var(--accent-pill-text)]" />}
    />

    {/* Gauge Summary */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bento-card p-5 space-y-2">
          <SkeletonLine width="w-24" height="h-3" />
          <SkeletonLine width="w-32" height="h-6" />
          <SkeletonLine width="w-full" height="h-2" />
        </div>
      ))}
    </div>

    {/* Collaborators List Skeleton */}
    <div className="bento-card p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--bento-border)]">
        <SkeletonLine width="w-40" height="h-4" />
        <SkeletonBadge width="w-28" className="h-7" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-2">
            <div className="flex items-center justify-between">
              <SkeletonLine width="w-36" height="h-4" />
              <SkeletonBadge width="w-16" className="h-5" />
            </div>
            <SkeletonLine width="w-full" height="h-3" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ==========================================
// 7. INTEL & VAULT SKELETON
// ==========================================

export const VaultIntelSkeleton: React.FC = () => (
  <div className="space-y-8 text-left pb-16">
    <div className="p-6 sm:p-8 bento-card border-[var(--bento-border)] space-y-4">
      <SkeletonBadge width="w-60" className="h-6" />
      <SkeletonLine width="w-3/5" height="h-8" />
      <SkeletonLine width="w-4/5" height="h-4" />
    </div>

    <SkeletonStatusIndicator
      label="Querying Intelligence Database & Playbook Vault..."
      subtext="Loading verified legal contracts, release playbooks, and streaming guides"
      icon={<BookOpen className="w-4 h-4 text-[var(--accent-pill-text)]" />}
    />

    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <SkeletonBadge key={i} width="w-28" className="h-8" />
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bento-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <SkeletonBadge width="w-20" className="h-4" />
            <SkeletonLine width="w-16" height="h-3" />
          </div>
          <SkeletonLine width="w-full" height="h-5" />
          <SkeletonLine width="w-4/5" height="h-3.5" />
          <SkeletonLine width="90%" height="h-3.5" />
          <div className="pt-3 border-t border-[var(--bento-border)] flex items-center justify-between">
            <SkeletonLine width="w-24" height="h-3" />
            <SkeletonBadge width="w-20" className="h-6" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ==========================================
// 8. AUDIO & MASTERING SKELETON
// ==========================================

export const AudioStudioSkeleton: React.FC = () => (
  <div className="space-y-8 text-left pb-16">
    <div className="p-6 sm:p-8 bento-card border-[var(--bento-border)] space-y-4">
      <SkeletonBadge width="w-56" className="h-6" />
      <SkeletonLine width="w-3/5" height="h-8" />
      <SkeletonLine width="w-4/5" height="h-4" />
    </div>

    <SkeletonStatusIndicator
      label="Analyzing Acoustic Spectrum & Mastering Tolerances..."
      subtext="Computing LUFS, True-Peak, stereo correlation and dynamic range"
      icon={<Activity className="w-4 h-4 text-[var(--accent-pill-text)] animate-pulse" />}
    />

    <div className="bento-card p-6 space-y-4">
      <SkeletonRect className="w-full h-36 rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3.5 rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-1.5">
            <SkeletonLine width="w-16" height="h-3" />
            <SkeletonLine width="w-24" height="h-5" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ==========================================
// 9. GENERAL MODULE SKELETON (Fallback)
// ==========================================

export const GeneralModuleSkeleton: React.FC<{
  title?: string;
  badge?: string;
}> = ({ title = "Studio Module", badge = "CREATIVE OS WORKSTATION" }) => (
  <div className="space-y-8 text-left pb-16">
    <div className="p-6 sm:p-8 bento-card border-[var(--bento-border)] space-y-4">
      <SkeletonBadge width="w-48" className="h-6" />
      <SkeletonLine width="w-2/3" height="h-8" />
      <SkeletonLine width="w-4/5" height="h-4" />
    </div>

    <SkeletonStatusIndicator
      label={`Initializing ${title}...`}
      subtext="Loading studio matrix, state stores and presets"
      icon={<Layers className="w-4 h-4 text-[var(--accent-pill-text)]" />}
    />

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5">
        <div className="bento-card p-5 space-y-4">
          <SkeletonLine width="w-36" height="h-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <SkeletonLine width="w-24" height="h-3" />
                <SkeletonRect className="w-full h-10 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-7">
        <div className="bento-card p-5 space-y-4">
          <SkeletonLine width="w-44" height="h-5" />
          <SkeletonRect className="w-full h-32 rounded-2xl" />
          <div className="space-y-2">
            <SkeletonLine width="w-full" height="h-3.5" />
            <SkeletonLine width="90%" height="h-3.5" />
            <SkeletonLine width="80%" height="h-3.5" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
