import React from "react";
import { ActiveTab } from "../../types";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Eye,
  Layers3,
  Orbit,
  Rocket,
  Sparkles,
  Workflow,
} from "lucide-react";

interface PageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

const HORIZONS = [
  {
    number: "01",
    title: "Make the work legible",
    copy: "Unify briefs, assets, rights and release signals so every collaborator can see what matters next.",
    icon: Layers3,
    tone: "text-red-400 bg-red-500/10 border-red-500/20",
  },
  {
    number: "02",
    title: "Make the system intelligent",
    copy: "Move from passive dashboards to a Creative Brain that identifies gaps and turns them into action.",
    icon: Workflow,
    tone: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  {
    number: "03",
    title: "Make independence scalable",
    copy: "Give cultural builders everywhere the leverage to grow lasting creative empires on their own terms.",
    icon: Orbit,
    tone: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
];

const PRINCIPLES = [
  ["Useful over noisy", "Every feature must shorten a cycle, protect a right or improve the work."],
  ["Simple outside, deep inside", "A calm public experience, with serious operational depth underneath."],
  ["Sovereignty is a feature", "Your creative output, data and decisions remain yours."],
  ["Velocity creates options", "The faster you can move with confidence, the more ambitious you can be."],
];

export const VisionPage: React.FC<PageProps> = ({ onNavigateTab, openBriefModal }) => {
  return (
    <div className="space-y-14 sm:space-y-20 py-3 sm:py-8 animate-fade-in text-left">
      <section className="relative overflow-hidden rounded-[2rem] bento-card border border-[var(--bento-border)] bg-gradient-to-br from-[var(--bento-card)] to-[var(--bento-bg)]">
        <div className="absolute inset-0 bg-bento-grid opacity-25 pointer-events-none" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_.8fr] lg:items-center lg:gap-16 lg:p-14">
          <div className="space-y-6">
            <div className="bento-pill w-fit"><Eye className="h-3.5 w-3.5" /><span>Vision / 02</span></div>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-['Space_Grotesk'] text-4xl font-extrabold leading-[1.04] tracking-tight text-[var(--bento-text)] sm:text-5xl lg:text-6xl">
                The creative economy, <span className="text-theme-accent">properly equipped.</span>
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-[var(--bento-muted)] sm:text-lg">
                We envision a world where independent artists and ambitious brands operate with the structural power of an elite studio—without losing their point of view.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => onNavigateTab("command-center")} className="inline-flex items-center gap-2 rounded-xl bg-theme-accent px-5 py-3 font-['Space_Grotesk'] text-sm font-bold shadow-md transition-transform hover:scale-[1.02] cursor-pointer">
                Explore the OS <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={openBriefModal} className="rounded-xl border border-[var(--bento-border)] bg-[var(--bento-card)] px-5 py-3 text-sm font-semibold text-[var(--bento-text)] transition-colors hover:bg-[var(--bento-elevated)] cursor-pointer">
                Start with a brief
              </button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="aspect-square rounded-full border border-[var(--accent-border)] bg-[radial-gradient(circle_at_center,var(--accent-light),transparent_62%)] p-5">
              <div className="flex h-full flex-col justify-between rounded-full border border-[var(--bento-border)] bg-[var(--bento-bg)] p-6 text-center sm:p-8">
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-[.2em] text-[var(--bento-subtle)]"><span>North star</span><Compass className="h-4 w-4 text-theme-accent" /></div>
                <div className="space-y-3">
                  <Rocket className="mx-auto h-8 w-8 text-theme-accent" />
                  <div className="font-['Space_Grotesk'] text-xl font-bold text-[var(--bento-text)]">More signal.<br />Less friction.</div>
                </div>
                <div className="text-xs leading-relaxed text-[var(--bento-muted)]">A shared operating layer for the people shaping culture.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[.72fr_1.28fr] lg:gap-14">
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-[.2em] text-theme-accent">The long view</div>
          <h2 className="font-['Space_Grotesk'] text-3xl font-bold leading-tight text-[var(--bento-text)] sm:text-4xl">A better future is built in layers.</h2>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--bento-muted)]">Our roadmap is less about adding tools and more about removing the invisible tax on creative ambition.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {HORIZONS.map(({ number, title, copy, icon: Icon, tone }) => (
            <article key={number} className="bento-card relative rounded-2xl border border-[var(--bento-border)] p-5 sm:p-6">
              <div className="mb-8 flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${tone}`}><Icon className="h-4 w-4" /></div>
                <span className="font-mono text-xs text-[var(--bento-subtle)]">{number}</span>
              </div>
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[var(--bento-text)]">{title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--bento-muted)]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bento-card rounded-3xl border border-[var(--bento-border)] p-6 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <div className="space-y-3">
            <Sparkles className="h-5 w-5 text-theme-accent" />
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[var(--bento-text)] sm:text-3xl">What we refuse to compromise.</h2>
            <p className="text-sm leading-relaxed text-[var(--bento-muted)]">These principles are our filter for product, partnerships and the way we show up.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {PRINCIPLES.map(([title, copy]) => (
              <div key={title} className="flex items-start gap-3 rounded-2xl border border-[var(--bento-border)] bg-[var(--bento-bg)] p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <div><h3 className="text-sm font-bold text-[var(--bento-text)]">{title}</h3><p className="mt-1 text-xs leading-relaxed text-[var(--bento-muted)]">{copy}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-[var(--accent-border)] bg-[var(--accent-light)] p-6 sm:p-10">
        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div><div className="text-xs font-mono font-bold uppercase tracking-[.2em] text-theme-accent">Build toward it</div><h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-bold text-[var(--bento-text)] sm:text-3xl">The future is waiting on your next move.</h2></div>
          <button onClick={() => onNavigateTab("story")} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-theme-accent px-5 py-3 text-sm font-bold transition-transform hover:scale-[1.02] cursor-pointer">Read our story <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>
    </div>
  );
};
