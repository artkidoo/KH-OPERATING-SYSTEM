import React from "react";
import { ActiveTab } from "../../types";
import { Shield, Lock, Server, Key, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";

interface PageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

export const SecurityPage: React.FC<PageProps> = ({ onNavigateTab }) => {
  return (
    <div className="space-y-12 sm:space-y-16 py-4 sm:py-8 animate-fade-in text-left">
      {/* Page Hero */}
      <section className="relative overflow-hidden rounded-3xl bento-card p-6 sm:p-10 md:p-14 border border-[var(--bento-border)] bg-gradient-to-b from-[var(--bento-card)] to-[var(--bento-bg)]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-pill-text)] text-xs font-mono font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Security Architecture & Safeguards</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--bento-text)] tracking-tight leading-tight">
            Protecting Your Creative Assets & Enterprise Workspaces.
          </h1>
          <p className="text-base sm:text-lg text-[var(--bento-muted)] leading-relaxed font-normal">
            How Keedohub secures unreleased music masters, confidential pitch decks, split sheet contracts, and workspace collaborations.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab("contact")}
              className="px-5 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs sm:text-sm font-['Space_Grotesk'] flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Contact Security Desk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Security Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bento-card p-6 rounded-2xl border border-[var(--bento-border)] space-y-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[var(--bento-text)]">
            Encryption In Transit & At Rest
          </h3>
          <p className="text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed">
            All data traveling between your browser and our servers is secured using modern TLS encryption protocols. Sensitive workspace tokens and database records are isolated and protected at rest.
          </p>
        </div>

        <div className="bento-card p-6 rounded-2xl border border-[var(--bento-border)] space-y-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <Key className="w-5 h-5" />
          </div>
          <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[var(--bento-text)]">
            Workspace Tenant Isolation
          </h3>
          <p className="text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed">
            Workspaces are architecturally segregated. Users cannot inspect or query data across workspace boundaries, ensuring complete privacy between competing artists, labels, and agencies.
          </p>
        </div>

        <div className="bento-card p-6 rounded-2xl border border-[var(--bento-border)] space-y-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[var(--bento-text)]">
            Zero Unauthorized Model Training
          </h3>
          <p className="text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed">
            Your proprietary stems, lyrics, concept audio, and campaign strategy are strictly guarded. Keedohub guarantees that your private creative IP is never used to train public generative foundation models.
          </p>
        </div>
      </div>

      {/* Security Operational Practices */}
      <section className="bento-card p-6 sm:p-10 rounded-2xl border border-[var(--bento-border)] space-y-6">
        <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[var(--bento-text)]">
          Operational Security Practices
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[var(--bento-text)]">Role-Based Access Control (RBAC)</h4>
              <p className="text-xs text-[var(--bento-muted)] mt-1">
                Granular permission tiers (Owner, Admin, Creator, Reviewer) prevent unauthorized modifications to master tracks and legal split sheets.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[var(--bento-text)]">Comprehensive Audit Logs</h4>
              <p className="text-xs text-[var(--bento-muted)] mt-1">
                Every release update, split sheet modification, task completion, and asset download is logged in your workspace activity feed.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[var(--bento-text)]">Vulnerability Management</h4>
              <p className="text-xs text-[var(--bento-muted)] mt-1">
                Our application dependencies and build artifacts undergo regular automated security scanning to eliminate known software vulnerabilities.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[var(--bento-text)]">Responsible Disclosure</h4>
              <p className="text-xs text-[var(--bento-muted)] mt-1">
                Security researchers can report findings directly to <a href="mailto:official_keedohub@gmail.com" className="text-emerald-400 underline">official_keedohub@gmail.com</a> for rapid verification and remediation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
