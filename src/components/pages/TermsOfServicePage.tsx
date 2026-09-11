import React from "react";
import { ActiveTab } from "../../types";
import { FileCheck, Shield, CheckCircle2, AlertCircle } from "lucide-react";

interface PageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

export const TermsOfServicePage: React.FC<PageProps> = ({ onNavigateTab }) => {
  return (
    <div className="space-y-12 sm:space-y-16 py-4 sm:py-8 animate-fade-in text-left">
      {/* Page Hero */}
      <section className="relative overflow-hidden rounded-3xl bento-card p-6 sm:p-10 md:p-14 border border-[var(--bento-border)] bg-gradient-to-b from-[var(--bento-card)] to-[var(--bento-bg)]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-pill-text)] text-xs font-mono font-bold uppercase tracking-wider">
            <FileCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Commercial Agreements</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--bento-text)] tracking-tight leading-tight">
            Terms of Service.
          </h1>
          <p className="text-base sm:text-lg text-[var(--bento-muted)] leading-relaxed font-normal">
            Last Updated: September 2026. The terms and conditions governing your access to and usage of the Keedohub Creative Operating System.
          </p>
        </div>
      </section>

      {/* Main Terms Body */}
      <div className="bento-card p-6 sm:p-10 rounded-2xl border border-[var(--bento-border)] space-y-8 text-[var(--bento-text)] max-w-4xl mx-auto">
        <div className="space-y-2">
          <h2 className="font-['Space_Grotesk'] text-xl font-bold">1. Acceptance of Terms</h2>
          <p className="text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed">
            By creating an account, accessing, or using Keedohub ("Platform", "Service", "Creative OS"), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree, you must discontinue use of the platform immediately.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-['Space_Grotesk'] text-xl font-bold">2. Absolute Creator Ownership (100% IP Retained)</h2>
          <p className="text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed">
            Keedohub operates as a tool and operating rail for your creative endeavor. All intellectual property rights, master recordings, musical compositions, synchronized lyric sheets, split agreements, graphic artwork, and brand marks created or organized within your workspace remain <strong>100% your exclusive property</strong>. Keedohub asserts zero ownership, publishing rights, or residual royalty claim over your creative deliverables.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-['Space_Grotesk'] text-xl font-bold">3. Account & Workspace Responsibilities</h2>
          <p className="text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed">
            You are responsible for maintaining the confidentiality of your workspace credentials and for all actions occurring under your account. You agree not to upload materials that infringe on third-party copyrights, trademarks, or trade secrets.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-['Space_Grotesk'] text-xl font-bold">4. Acceptable Use Policy</h2>
          <p className="text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed">
            You agree to use Keedohub only for lawful creative, commercial, and promotional activities. You shall not attempt to reverse engineer platform code, deploy automated crawlers to overload infrastructure, or inject malicious payloads into shared workspace documents.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-['Space_Grotesk'] text-xl font-bold">5. Service Availability & Disclaimers</h2>
          <p className="text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed">
            While Keedohub strives for continuous platform availability and enterprise reliability, the services are provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. Editorial placement decisions by third-party DSPs (such as Spotify or Apple Music) are independent editorial decisions not guaranteed by Keedohub.
          </p>
        </div>

        <div className="pt-4 border-t border-[var(--bento-border)] text-xs text-[var(--bento-muted)] flex items-center justify-between">
          <span>Official Keedohub Brand Legal Desk</span>
          <button
            onClick={() => onNavigateTab("privacy")}
            className="text-blue-400 hover:underline cursor-pointer font-semibold"
          >
            Review Privacy Policy →
          </button>
        </div>
      </div>
    </div>
  );
};
