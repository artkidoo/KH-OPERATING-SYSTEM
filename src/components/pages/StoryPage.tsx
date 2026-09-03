import React from "react";
import { ActiveTab } from "../../types";
import {
  ArrowRight,
  Award,
  BookOpen,
  CircleDot,
  Disc3,
  Heart,
  MapPin,
  Sparkles,
} from "lucide-react";

interface PageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

const MILESTONES = [
  ["The observation", "Extraordinary records were being held back by ordinary chaos."],
  ["The question", "What if independent creators had the same operating leverage as a major studio?"],
  ["The build", "A single creative OS for release, brand, rights and momentum."],
  ["The invitation", "Turn your next idea into work that is ready for the world."],
];

export const StoryPage: React.FC<PageProps> = ({ onNavigateTab, openBriefModal }) => {
  return (
    <div className="space-y-14 sm:space-y-20 py-3 sm:py-8 animate-fade-in text-left">
      <section className="relative overflow-hidden rounded-[2rem] bento-card border border-[var(--bento-border)] bg-gradient-to-br from-[var(--bento-card)] to-[var(--bento-bg)]">
        <div className="absolute inset-0 bg-bento-grid opacity-25 pointer-events-none" />
        <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_.78fr] lg:items-center lg:gap-16 lg:p-14">
          <div className="space-y-6">
            <div className="bento-pill w-fit"><BookOpen className="h-3.5 w-3.5" /><span>Our story / 03</span></div>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-['Space_Grotesk'] text-4xl font-extrabold leading-[1.04] tracking-tight text-[var(--bento-text)] sm:text-5xl lg:text-6xl">
                Born from the work. <span className="text-theme-accent">Built for what’s next.</span>
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-[var(--bento-muted)] sm:text-lg">
                Keedohub began in Lagos with a simple observation: the world’s most exciting creative movements deserved better infrastructure.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => onNavigateTab("command-center")} className="inline-flex items-center gap-2 rounded-xl bg-theme-accent px-5 py-3 font-['Space_Grotesk'] text-sm font-bold shadow-md transition-transform hover:scale-[1.02] cursor-pointer">Enter the workspace <ArrowRight className="h-4 w-4" /></button>
              <button onClick={openBriefModal} className="rounded-xl border border-[var(--bento-border)] bg-[var(--bento-card)] px-5 py-3 text-sm font-semibold text-[var(--bento-text)] transition-colors hover:bg-[var(--bento-elevated)] cursor-pointer">Start a project</button>
            </div>
          </div>
          <div className="relative min-h-[20rem] overflow-hidden rounded-3xl border border-[var(--bento-border)] bg-[var(--bento-bg)] p-5 sm:min-h-[24rem] sm:p-7">
            <div className="absolute inset-0 bg-[linear-gradient(140deg,transparent_35%,rgba(245,158,11,.12))]" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[.2em] text-[var(--bento-subtle)]"><span>Lagos → everywhere</span><MapPin className="h-4 w-4 text-amber-400" /></div>
              <div className="space-y-5">
                <div className="font-['Space_Grotesk'] text-6xl font-bold tracking-[-.08em] text-[var(--bento-text)] sm:text-7xl">01<span className="text-theme-accent">—</span>∞</div>
                <div className="max-w-[14rem] text-sm leading-relaxed text-[var(--bento-muted)]">One idea can travel a long way when the system around it is strong.</div>
              </div>
              <div className="flex items-center gap-2 border-t border-[var(--bento-border)] pt-4 text-xs font-semibold text-[var(--bento-text)]"><Heart className="h-4 w-4 text-amber-400" /> Made for the people making culture.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold uppercase tracking-[.2em] text-theme-accent">The beginning</div>
          <h2 className="font-['Space_Grotesk'] text-3xl font-bold leading-tight text-[var(--bento-text)] sm:text-4xl">The problem was never a lack of talent.</h2>
          <p className="text-sm leading-relaxed text-[var(--bento-muted)]">It was the gap between the spark and the release—the invisible work that determines whether great ideas arrive with clarity or disappear in the noise.</p>
        </div>
        <div className="space-y-5 text-sm leading-relaxed text-[var(--bento-muted)] sm:text-base">
          <p>In late-night recording sessions across Lagos, founder <strong className="text-[var(--bento-text)]">Ojo Abdulkareem</strong> watched brilliant records lose momentum to missed deadlines, rushed artwork, unsigned splits and fragmented campaigns.</p>
          <p>Major studios had departments for every one of those details. Independent artists and modern brands had a maze of browser tabs and a chaotic group chat.</p>
          <p>Keedohub is the answer to that imbalance: a creative operating system that makes the invisible work visible, collaborative and ready to move.</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_.9fr] lg:items-start lg:gap-12">
        <div className="bento-card rounded-3xl border border-[var(--bento-border)] p-6 sm:p-8">
          <div className="mb-8 flex items-center justify-between"><div className="text-xs font-mono font-bold uppercase tracking-[.2em] text-[var(--bento-muted)]">The build log</div><Disc3 className="h-5 w-5 text-theme-accent" /></div>
          <div className="space-y-0">
            {MILESTONES.map(([title, copy], index) => (
              <div key={title} className="relative flex gap-4 pb-8 last:pb-0">
                {index < MILESTONES.length - 1 && <div className="absolute left-[7px] top-5 h-full w-px bg-[var(--bento-border)]" />}
                <CircleDot className="relative z-10 h-4 w-4 shrink-0 text-theme-accent" />
                <div className="space-y-1"><h3 className="font-['Space_Grotesk'] text-base font-bold text-[var(--bento-text)]">{title}</h3><p className="text-xs leading-relaxed text-[var(--bento-muted)]">{copy}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bento-card rounded-3xl border border-[var(--accent-border)] bg-gradient-to-br from-[var(--accent-light)] to-[var(--bento-card)] p-6 sm:p-8">
            <Award className="mb-6 h-6 w-6 text-theme-accent" />
            <div className="text-xs font-mono font-bold uppercase tracking-[.2em] text-theme-accent">The Keedohub promise</div>
            <h2 className="mt-3 font-['Space_Grotesk'] text-2xl font-bold leading-tight text-[var(--bento-text)]">We build the rails. You build the world.</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--bento-muted)]">Every asset, contract, stem and strategy created inside your workspace remains 100% yours.</p>
          </div>
          <div className="rounded-3xl border border-[var(--bento-border)] p-6">
            <div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" /><p className="text-sm leading-relaxed text-[var(--bento-muted)]"><strong className="text-[var(--bento-text)]">From Lagos, with global intent.</strong> We are building for the next generation of cultural founders—wherever they are.</p></div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-[var(--accent-border)] bg-[var(--accent-light)] p-6 sm:p-10">
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div><div className="text-xs font-mono font-bold uppercase tracking-[.2em] text-theme-accent">Continue the story</div><h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-bold text-[var(--bento-text)] sm:text-3xl">What will you make with more room to move?</h2></div>
          <button onClick={() => onNavigateTab("contact")} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-theme-accent px-5 py-3 text-sm font-bold transition-transform hover:scale-[1.02] cursor-pointer">Talk to the team <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>
    </div>
  );
};
