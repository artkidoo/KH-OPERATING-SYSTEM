import React, { useState } from "react";
import { ActiveTab } from "../../types";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageSquare,
  PhoneCall,
  Send,
  Sparkles,
} from "lucide-react";

interface PageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

export const ContactPage: React.FC<PageProps> = ({ onNavigateTab, openBriefModal }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Artist Workspace Setup");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }, 900);
  };

  return (
    <div className="space-y-14 sm:space-y-20 py-3 sm:py-8 animate-fade-in text-left">
      <section className="relative overflow-hidden rounded-[2rem] bento-card border border-[var(--bento-border)] bg-gradient-to-br from-[var(--bento-card)] to-[var(--bento-bg)]">
        <div className="absolute inset-0 bg-bento-grid opacity-25 pointer-events-none" />
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16 lg:p-14">
          <div className="max-w-3xl space-y-5">
            <div className="bento-pill w-fit"><MessageSquare className="h-3.5 w-3.5" /><span>Studio dispatch / 04</span></div>
            <h1 className="font-['Space_Grotesk'] text-4xl font-extrabold leading-[1.04] tracking-tight text-[var(--bento-text)] sm:text-5xl lg:text-6xl">Let’s make the next move <span className="text-theme-accent">intentional.</span></h1>
            <p className="max-w-2xl text-base leading-relaxed text-[var(--bento-muted)] sm:text-lg">Tell us where you are headed. We’ll help you find the clearest path from idea to ready-to-ship.</p>
          </div>
          <div className="flex items-center gap-3 border-t border-[var(--bento-border)] pt-5 text-xs text-[var(--bento-muted)] lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,.12)]" />
            <span>Usually replies within 24 hours</span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:gap-10">
        <section className="bento-card rounded-3xl border border-[var(--bento-border)] p-6 sm:p-8 lg:p-10">
          <div className="mb-8 space-y-2">
            <div className="text-xs font-mono font-bold uppercase tracking-[.2em] text-theme-accent">Start a conversation</div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[var(--bento-text)] sm:text-3xl">Send a direct dispatch.</h2>
            <p className="max-w-lg text-sm leading-relaxed text-[var(--bento-muted)]">For workspace setup, partnerships, commissions or a question about your next release.</p>
          </div>

          {isSubmitted ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-300 animate-fade-in">
              <CheckCircle2 className="mb-4 h-7 w-7" />
              <h3 className="font-['Space_Grotesk'] text-xl font-bold">Dispatch received.</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--bento-muted)]">A Keedohub creative producer has been assigned and will reply to your email within 12–24 business hours.</p>
              <button onClick={() => setIsSubmitted(false)} className="mt-5 text-xs font-bold underline underline-offset-4 hover:text-[var(--bento-text)] cursor-pointer">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--bento-text)]">Your name</span>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tunde Adeyemi" className="w-full rounded-xl border border-[var(--bento-border)] bg-[var(--bento-input)] px-4 py-3 text-sm text-[var(--bento-text)] transition-colors placeholder:text-[var(--bento-subtle)] focus:border-[var(--accent-color)] focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--bento-text)]">Email address</span>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" className="w-full rounded-xl border border-[var(--bento-border)] bg-[var(--bento-input)] px-4 py-3 text-sm text-[var(--bento-text)] transition-colors placeholder:text-[var(--bento-subtle)] focus:border-[var(--accent-color)] focus:outline-none" />
                </label>
              </div>
              <label className="block space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--bento-text)]">Inquiry topic</span>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-xl border border-[var(--bento-border)] bg-[var(--bento-input)] px-4 py-3 text-sm text-[var(--bento-text)] focus:border-[var(--accent-color)] focus:outline-none">
                  <option value="Artist Workspace Setup">Artist Workspace Setup & Rollout Guidance</option>
                  <option value="Brand OS Deployment">Brand OS Deployment & Corporate Licensing</option>
                  <option value="Cover Studio Commission">Bespoke 3000x3000px Cover Commission</option>
                  <option value="Partnership & Press">Label Partnership / Press / Agency Sync</option>
                  <option value="Technical Support">Technical Support / Account Inquiries</option>
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--bento-text)]">Message details</span>
                <textarea required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your upcoming release, campaign goals, or questions..." className="w-full resize-none rounded-xl border border-[var(--bento-border)] bg-[var(--bento-input)] px-4 py-3 text-sm leading-relaxed text-[var(--bento-text)] transition-colors placeholder:text-[var(--bento-subtle)] focus:border-[var(--accent-color)] focus:outline-none" />
              </label>
              <div className="flex flex-col items-start justify-between gap-4 pt-1 sm:flex-row sm:items-center">
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-theme-accent px-5 py-3 text-sm font-bold shadow-md transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"><Send className="h-4 w-4" />{isSubmitting ? "Dispatching..." : "Send message"}</button>
                <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[var(--bento-muted)]"><Clock3 className="h-3.5 w-3.5" /> Typical reply &lt; 24h</div>
              </div>
            </form>
          )}
        </section>

        <aside className="space-y-4">
          <div className="bento-card rounded-3xl border border-[var(--bento-border)] p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between"><h2 className="font-['Space_Grotesk'] text-xl font-bold text-[var(--bento-text)]">Direct channels</h2><ArrowRight className="h-4 w-4 text-[var(--bento-subtle)]" /></div>
            <div className="space-y-3">
              <a href="mailto:official_keedohub@gmail.com" className="group flex items-start gap-3 rounded-2xl border border-[var(--bento-border)] bg-[var(--bento-bg)] p-4 transition-colors hover:border-[var(--accent-border)]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400"><Mail className="h-4 w-4" /></div>
                <div><div className="text-sm font-bold text-[var(--bento-text)] group-hover:text-theme-accent">Official email</div><div className="mt-1 text-xs text-[var(--bento-muted)]">official_keedohub@gmail.com</div></div>
              </a>
              <a href="https://wa.me/2348104465924" target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 rounded-2xl border border-[var(--bento-border)] bg-[var(--bento-bg)] p-4 transition-colors hover:border-emerald-500/40">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"><PhoneCall className="h-4 w-4" /></div>
                <div><div className="text-sm font-bold text-[var(--bento-text)] group-hover:text-emerald-400">WhatsApp studio hotline</div><div className="mt-1 text-xs text-[var(--bento-muted)]">+234-810-446-5924 (voice & chat)</div></div>
              </a>
              <div className="flex items-start gap-3 rounded-2xl border border-[var(--bento-border)] bg-[var(--bento-bg)] p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400"><MapPin className="h-4 w-4" /></div>
                <div><div className="text-sm font-bold text-[var(--bento-text)]">Studio location</div><div className="mt-1 text-xs text-[var(--bento-muted)]">Lagos, Nigeria · operating globally</div></div>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--accent-border)] bg-[var(--accent-light)] p-6 sm:p-8">
            <Sparkles className="mb-5 h-5 w-5 text-theme-accent" />
            <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[var(--bento-text)]">Need a faster start?</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--bento-muted)]">Launch an interactive project brief and get a clear creative scope in minutes.</p>
            <button onClick={openBriefModal} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-theme-accent px-4 py-3 text-sm font-bold transition-transform hover:scale-[1.02] cursor-pointer">Launch quick brief <ArrowRight className="h-4 w-4" /></button>
          </div>
          <button onClick={() => onNavigateTab("story")} className="flex w-full items-center justify-between rounded-2xl border border-[var(--bento-border)] p-4 text-left text-sm font-semibold text-[var(--bento-text)] transition-colors hover:bg-[var(--bento-elevated)] cursor-pointer"><span>Learn where Keedohub began</span><ArrowRight className="h-4 w-4 text-theme-accent" /></button>
        </aside>
      </div>

      <section className="grid gap-6 lg:grid-cols-[.7fr_1.3fr] lg:items-start lg:gap-12">
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-[.2em] text-theme-accent">Helpful information</div>
          <h2 className="font-['Space_Grotesk'] text-3xl font-bold leading-tight text-[var(--bento-text)] sm:text-4xl">A clearer first conversation.</h2>
          <p className="text-sm leading-relaxed text-[var(--bento-muted)]">Bring the context you have. We will help shape the next step.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["What should I include?", "Share your goal, timeline and any useful links. A rough brief is more than enough."],
            ["When will I hear back?", "Most messages receive a thoughtful reply within 12–24 business hours."],
            ["Can you support teams?", "Yes. We help artists, labels, agencies and growing businesses set up repeatable systems."],
            ["Is my work protected?", "Your creative work and project information remain yours throughout the conversation."],
          ].map(([question, answer]) => (
            <div key={question} className="rounded-2xl border border-[var(--bento-border)] bg-[var(--bento-card)] p-5">
              <h3 className="font-['Space_Grotesk'] text-sm font-bold text-[var(--bento-text)]">{question}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--bento-muted)]">{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-[var(--accent-border)] bg-[var(--accent-light)] p-6 sm:p-10">
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <div className="text-xs font-mono font-bold uppercase tracking-[.2em] text-theme-accent">Ready when you are</div>
            <h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-bold text-[var(--bento-text)] sm:text-3xl">Give the next idea a stronger starting point.</h2>
          </div>
          <button onClick={openBriefModal} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-theme-accent px-5 py-3 text-sm font-bold transition-transform hover:scale-[1.02] cursor-pointer">
            Start a project <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
