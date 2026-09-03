import React, { useState } from "react";
import { ActiveTab } from "../../types";
import { 
  Mail, 
  PhoneCall, 
  MapPin, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Clock, 
  Sparkles 
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
    <div className="space-y-12 sm:space-y-16 py-4 sm:py-8 animate-fade-in text-left">
      {/* Page Hero */}
      <section className="relative overflow-hidden rounded-3xl bento-card p-6 sm:p-10 md:p-14 border border-[var(--bento-border)] bg-gradient-to-b from-[var(--bento-card)] to-[var(--bento-bg)]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-pill-text)] text-xs font-mono font-bold uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5 text-emerald-500" />
            <span>Contact & Studio Dispatch</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--bento-text)] tracking-tight leading-tight">
            Connect With the Keedohub Studio Team.
          </h1>
          <p className="text-base sm:text-lg text-[var(--bento-muted)] leading-relaxed font-normal">
            Whether you need customized enterprise workspace deployment, label partnerships, bespoke cover art commission, or immediate technical assistance — we are on standby.
          </p>
        </div>
      </section>

      {/* Main Grid: Form + Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7 bento-card p-6 sm:p-8 rounded-2xl border border-[var(--bento-border)] space-y-6">
          <div className="space-y-1">
            <h2 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[var(--bento-text)]">
              Send a Direct Dispatch
            </h2>
            <p className="text-xs sm:text-sm text-[var(--bento-muted)]">
              Fill out the form below for enterprise inquiries, partnerships, or studio bookings.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">Dispatch Received Successfully</h3>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Thank you for reaching out. A Keedohub creative producer has been assigned to your message and will reply to your email within 12-24 business hours.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-xs font-bold underline hover:text-white cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[var(--bento-text)] uppercase">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tunde Adeyemi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-xs sm:text-sm text-[var(--bento-text)] focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[var(--bento-text)] uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-xs sm:text-sm text-[var(--bento-text)] focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[var(--bento-text)] uppercase">
                  Inquiry Topic
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-xs sm:text-sm text-[var(--bento-text)] focus:outline-none focus:border-red-500 transition-colors"
                >
                  <option value="Artist Workspace Setup">Artist Workspace Setup & Rollout Guidance</option>
                  <option value="Brand OS Deployment">Brand OS Deployment & Corporate Licensing</option>
                  <option value="Cover Studio Commission">Bespoke 3000x3000px Cover Commission</option>
                  <option value="Partnership & Press">Label Partnership / Press / Agency Sync</option>
                  <option value="Technical Support">Technical Support / Account Inquiries</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[var(--bento-text)] uppercase">
                  Message Details
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your upcoming release, campaign goals, or questions..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-xs sm:text-sm text-[var(--bento-text)] focus:outline-none focus:border-red-500 transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs sm:text-sm font-['Space_Grotesk'] flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Dispatching..." : "Send Message"}</span>
                </button>

                <div className="text-[11px] font-mono text-[var(--bento-muted)] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Typical reply: &lt; 24h</span>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Direct Channels */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bento-card p-6 rounded-2xl border border-[var(--bento-border)] space-y-4">
            <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[var(--bento-text)]">
              Direct Channels
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <a
                href="mailto:official_keedohub@gmail.com"
                className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] hover:border-red-500/40 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-[var(--bento-text)] group-hover:text-red-400 transition-colors">
                    Official Email
                  </div>
                  <div className="text-xs text-[var(--bento-muted)] mt-0.5">
                    official_keedohub@gmail.com
                  </div>
                </div>
              </a>

              <a
                href="https://wa.me/2348104465924"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] hover:border-emerald-500/40 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-[var(--bento-text)] group-hover:text-emerald-400 transition-colors">
                    WhatsApp Studio Hotline
                  </div>
                  <div className="text-xs text-[var(--bento-muted)] mt-0.5">
                    +234-810-446-5924 (Voice & Chat)
                  </div>
                </div>
              </a>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-[var(--bento-text)]">
                    Studio Location
                  </div>
                  <div className="text-xs text-[var(--bento-muted)] mt-0.5">
                    Lagos, Nigeria • Operating Globally
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bento-card p-6 rounded-2xl border border-[var(--bento-border)] space-y-3">
            <h4 className="font-['Space_Grotesk'] font-bold text-sm text-[var(--bento-text)]">
              Need Instant Commissioning?
            </h4>
            <p className="text-xs text-[var(--bento-muted)] leading-relaxed">
              You can start an interactive project brief directly in the browser to receive an instant creative scope estimate.
            </p>
            <button
              onClick={openBriefModal}
              className="w-full px-4 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs font-['Space_Grotesk'] flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Quick Brief</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
