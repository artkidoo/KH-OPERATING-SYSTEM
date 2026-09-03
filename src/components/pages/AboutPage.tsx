import React from "react";
import { ActiveTab } from "../../types";
import {
  ArrowRight,
  BriefcaseBusiness,
  Cpu,
  Disc3,
  Globe2,
  Layers3,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

interface PageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

const PILLARS = [
  {
    icon: Disc3,
    label: "Release readiness",
    copy: "Audio, artwork, metadata, rights and rollout momentum in one view.",
    tone: "text-red-400 bg-red-500/10 border-red-500/20",
  },
  {
    icon: BriefcaseBusiness,
    label: "Commercial ownership",
    copy: "Your masters, stems, strategy and brand systems stay yours.",
    tone: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Zap,
    label: "Proactive intelligence",
    copy: "Creative Brain spots the next bottleneck before it costs you.",
    tone: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Globe2,
    label: "Global by design",
    copy: "Built in Lagos for ambitious teams everywhere.",
    tone: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
];

export const AboutPage: React.FC<PageProps> = ({ onNavigateTab, openBriefModal }) => {
  return (
    <div className="space-y-14 sm:space-y-20 py-3 sm:py-8 animate-fade-in text-left">
      <section className="relative overflow-hidden rounded-[2rem] bento-card border border-[var(--bento-border)] bg-gradient-to-br from-[var(--bento-card)] via-[var(--bento-card)] to-[var(--bento-bg)]">
        <div className="absolute inset-0 bg-bento-grid opacity-25 pointer-events-none" />
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[var(--accent-color)] opacity-10 blur-3xl pointer-events-none" />
        <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-14 lg:p-14">
          <div className="space-y-6">
            <div className="bento-pill w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              <span>About Keedohub / 01</span>
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-['Space_Grotesk'] text-4xl font-extrabold leading-[1.04] tracking-tight text-[var(--bento-text)] sm:text-5xl lg:text-6xl">
                The infrastructure behind <span className="text-theme-accent">better work.</span>
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-[var(--bento-muted)] sm:text-lg">
                Keedohub is the creative operating system for artists and brands who are ready to move from scattered output to intentional momentum.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigateTab("command-center")}
                className="inline-flex items-center gap-2 rounded-xl bg-theme-accent px-5 py-3 font-['Space_Grotesk'] text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[.98] cursor-pointer"
              >
                Enter the workspace <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={openBriefModal}
                className="rounded-xl border border-[var(--bento-border)] bg-[var(--bento-card)] px-5 py-3 text-sm font-semibold text-[var(--bento-text)] transition-colors hover:bg-[var(--bento-elevated)] cursor-pointer"
              >
                Start a project
              </button>
            </div>
          </div>

          <div className="relative min-h-[19rem] overflow-hidden rounded-3xl border border-[var(--bento-border)] bg-[var(--bento-bg)] p-4 sm:min-h-[23rem] sm:p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-light)] via-transparent to-transparent" />
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.2em] text-[var(--bento-subtle)]">
                <span>One creative system</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {[
                  ["Artist OS", "Release control", "bg-red-500/10 text-red-300"],
                  ["Brand OS", "Market clarity", "bg-blue-500/10 text-blue-300"],
                  ["Creative Brain", "Next best action", "bg-purple-500/10 text-purple-300"],
                  ["Asset memory", "Nothing gets lost", "bg-amber-500/10 text-amber-300"],
                ].map(([title, subtitle, tone]) => (
                  <div key={title} className={`rounded-2xl border border-[var(--bento-border)] p-3 sm:p-4 ${tone}`}>
                    <Layers3 className="mb-5 h-4 w-4 opacity-80" />
                    <div className="font-['Space_Grotesk'] text-sm font-bold text-[var(--bento-text)]">{title}</div>
                    <div className="mt-1 text-[10px] text-[var(--bento-muted)]">{subtitle}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 border-t border-[var(--bento-border)] pt-4 text-xs text-[var(--bento-muted)]">
                <Cpu className="h-4 w-4 text-theme-accent" />
                <span>Less coordination. More creation.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["01", "One source of truth", "Every brief, asset and decision has a home."],
          ["02", "Built for velocity", "Turn a good idea into a ready-to-ship system."],
          ["03", "Ownership by default", "Your creative work is never the platform’s product."],
        ].map(([number, title, copy]) => (
          <div key={number} className="bento-card rounded-2xl border border-[var(--bento-border)] p-5 sm:p-6">
            <div className="mb-8 font-mono text-xs font-bold tracking-widest text-theme-accent">{number}</div>
            <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[var(--bento-text)]">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--bento-muted)]">{copy}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:gap-12">
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold uppercase tracking-[.2em] text-theme-accent">Why we exist</div>
          <h2 className="max-w-md font-['Space_Grotesk'] text-3xl font-bold leading-tight text-[var(--bento-text)] sm:text-4xl">
            Talent should not have to become an operations department.
          </h2>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-[var(--bento-muted)] sm:text-base">
          <p>Great work is often slowed by the invisible layer around it: version control, rights, deadlines, handoffs and a dozen disconnected tools. Keedohub brings that layer into focus.</p>
          <p>We give independent creators the same operational leverage as an elite studio, without asking them to trade away their voice or ownership.</p>
          <div className="flex items-center gap-3 border-l-2 border-[var(--accent-color)] pl-4 pt-2 font-['Space_Grotesk'] text-base font-semibold text-[var(--bento-text)]">
            <ShieldCheck className="h-5 w-5 shrink-0 text-theme-accent" />
            Enterprise-grade rails. Creator-first control.
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-[.2em] text-[var(--bento-muted)]">The Keedohub standard</div>
            <h2 className="mt-2 font-['Space_Grotesk'] text-3xl font-bold text-[var(--bento-text)]">A system with a point of view.</h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-[var(--bento-muted)]">Four principles that shape every workflow we ship.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, label, copy, tone }) => (
            <div key={label} className="bento-card rounded-2xl border border-[var(--bento-border)] p-5">
              <div className={`mb-7 flex h-10 w-10 items-center justify-center rounded-xl border ${tone}`}><Icon className="h-5 w-5" /></div>
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-[var(--bento-text)]">{label}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--bento-muted)]">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bento-card relative overflow-hidden rounded-3xl border border-[var(--accent-border)] bg-gradient-to-r from-[var(--accent-light)] to-[var(--bento-card)] p-6 sm:p-10">
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-mono font-bold uppercase tracking-[.2em] text-theme-accent">Make room for the work</div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[var(--bento-text)] sm:text-3xl">Your next chapter deserves better infrastructure.</h2>
          </div>
          <button onClick={() => onNavigateTab("contact")} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-theme-accent px-5 py-3 text-sm font-bold transition-transform hover:scale-[1.02] cursor-pointer">
            Meet the team <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
