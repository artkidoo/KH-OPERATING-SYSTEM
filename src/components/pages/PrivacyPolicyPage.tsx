import React from "react";
import { ActiveTab } from "../../types";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

interface PageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

export const PrivacyPolicyPage: React.FC<PageProps> = ({ onNavigateTab }) => {
  return (
    <div className="space-y-12 sm:space-y-16 py-4 sm:py-8 animate-fade-in text-left">
      {/* Page Hero */}
      <section className="relative overflow-hidden rounded-3xl bento-card p-6 sm:p-10 md:p-14 border border-[var(--bento-border)] bg-gradient-to-b from-[var(--bento-card)] to-[var(--bento-bg)]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-pill-text)] text-xs font-mono font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-red-500" />
            <span>Legal Notice & Privacy</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--bento-text)] tracking-tight leading-tight">
            Privacy Policy.
          </h1>
          <p className="text-base sm:text-lg text-[var(--bento-muted)] leading-relaxed font-normal">
            Last Updated: September 2026. How Keedohub collects, manages, and protects your account details, creative assets, and workspace communications.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="bento-card p-6 sm:p-10 rounded-2xl border border-[var(--bento-border)] space-y-8 text-[var(--bento-text)] max-w-4xl mx-auto">
        <div className="space-y-2">
          <h2 className="font-['Space_Grotesk'] text-xl font-bold">1. Overview & Commitment to Creator Privacy</h2>
          <p className="text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed">
            Keedohub Creative OS ("Keedohub", "we", "us", or "our") is dedicated to safeguarding the privacy and intellectual integrity of our users. This Privacy Policy details the types of information we collect when you use our web platform, APIs, and creative operating systems (Artist OS, Brand OS), and how that data is processed.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-['Space_Grotesk'] text-xl font-bold">2. Information We Collect</h2>
          <p className="text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed">
            We collect information strictly necessary to provide and elevate the Creative Operating System:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-[var(--bento-muted)] pl-2">
            <li><strong>Account & Profile Credentials:</strong> Full name, stage name, email address, password hashes, and workspace settings.</li>
            <li><strong>Workspace Content & Creative Assets:</strong> Song titles, lyrics, split sheet participant percentages, marketing briefs, cover artwork files, and campaign timelines.</li>
            <li><strong>Technical Telemetry:</strong> Browser type, operating system, IP address, and platform usage interactions to diagnose technical performance.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="font-['Space_Grotesk'] text-xl font-bold">3. Intellectual Property & AI Processing Safeguards</h2>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs sm:text-sm space-y-2">
            <div className="font-bold text-[var(--bento-text)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span>Strict Non-Training Guarantee</span>
            </div>
            <p className="text-[var(--bento-muted)] leading-relaxed">
              We do not use your private musical compositions, audio stems, unreleased lyrics, or confidential brand strategies to train general public artificial intelligence foundation models. Your workspace data is processed exclusively to deliver your requested rollout recommendations and studio outputs.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="font-['Space_Grotesk'] text-xl font-bold">4. Data Sharing & Third-Party Services</h2>
          <p className="text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed">
            We do not sell, rent, or monetize your personal information or creative data. We share information only with third-party service providers (such as cloud hosting, database synchronization, and payment gateways) strictly necessary for operating the application under confidentiality agreements.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-['Space_Grotesk'] text-xl font-bold">5. User Rights & Data Deletion</h2>
          <p className="text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed">
            You retain full rights to request access to, correction of, or permanent deletion of your account and workspace records. You may initiate an account deletion or export request by contacting our legal desk at <a href="mailto:official_keedohub@gmail.com" className="text-red-400 underline">official_keedohub@gmail.com</a>.
          </p>
        </div>

        <div className="pt-4 border-t border-[var(--bento-border)] text-xs text-[var(--bento-muted)] flex items-center justify-between">
          <span>Official Keedohub Brand Legal Desk</span>
          <button
            onClick={() => onNavigateTab("terms")}
            className="text-red-400 hover:underline cursor-pointer font-semibold"
          >
            Review Terms of Service →
          </button>
        </div>
      </div>
    </div>
  );
};
