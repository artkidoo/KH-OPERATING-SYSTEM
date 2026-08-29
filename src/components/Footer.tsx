import React from "react";
import { ActiveTab } from "../types";
import { KeedohubLogo } from "./KeedohubLogo";
import { 
  Send, 
  PhoneCall, 
  Mail
} from "lucide-react";

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, openBriefModal }) => {
  const handleNavigate = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-[var(--bento-border)] bg-[var(--bento-bg)] text-[var(--bento-muted)] text-xs pt-16 pb-12 text-left relative overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Call to Action Statement Bento Banner */}
        <div className="p-4 sm:p-6 md:p-7 bento-card border-[var(--bento-border)] bg-gradient-to-br from-[var(--bento-card)] via-[var(--bento-card)] to-[var(--bento-elevated)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg group">
          {/* Ambient subtle glow decoration */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[var(--accent-color)]/10 rounded-full blur-3xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-60" />
          
          <div className="space-y-1.5 relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-pill-text)] text-[10px] font-mono font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
              <span>READY TO BUILD SOMETHING EXTRAORDINARY?</span>
            </div>
            <h2 className="font-['Space_Grotesk'] text-lg sm:text-2xl md:text-3xl font-bold text-[var(--bento-text)] tracking-tight">
              Build something <span className="italic font-normal text-[var(--accent-pill-text)]">worth</span> remembering.
            </h2>
            <p className="text-xs sm:text-xs text-[var(--bento-muted)] leading-relaxed">
              From standalone album artwork to full 360° promotional rollouts and enterprise brand operating systems.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2 sm:gap-2.5 w-full md:w-auto relative z-10 shrink-0">
            <button
              onClick={openBriefModal}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[var(--accent-color)] hover:opacity-90 text-[var(--accent-btn-text)] font-bold text-xs font-['Space_Grotesk'] flex items-center justify-center gap-1.5 shadow-md shadow-[var(--accent-glow)] transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Start a Project</span>
            </button>
            <a
              href="https://wa.me/2348104465924"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-card-hover)] text-[var(--bento-text)] font-medium text-xs border border-[var(--bento-border)] hover:border-emerald-500/40 flex items-center justify-center gap-1.5 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
              <span>WhatsApp Direct</span>
            </a>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-8 pt-4">
          {/* Col 1: Brand Lore */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <KeedohubLogo size="md" showText={true} badge="OS" />
            </div>
            <p className="text-xs text-[var(--bento-muted)] max-w-sm leading-relaxed">
              The Creative Operating System for music artists, brands, creators, and startups. Studios, resources, tools, knowledge, and production — engineered in Lagos, Nigeria for global creators.
            </p>
            <div className="flex items-center gap-3 pt-2 text-[var(--bento-muted)] font-mono text-[11px]">
              <span>Founder & Lead: <strong className="text-[var(--bento-text)]">Ojo Abdulkareem</strong></span>
            </div>
          </div>

          {/* Col 2: Creative OS Modules */}
          <div className="space-y-3">
            <h3 className="font-mono text-[10px] font-bold text-[var(--bento-text)] uppercase tracking-wider">
              Operating Systems
            </h3>
            <ul className="space-y-2 text-[var(--bento-muted)] text-xs">
              <li>
                <button onClick={() => handleNavigate("artist-brain")} className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left">
                  Artist Content Brain
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate("cover-studio")} className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left">
                  Music Cover Studio
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate("brand-os")} className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left">
                  Brand Architecture OS
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate("creator-os")} className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left">
                  Creator Hook OS
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate("epk-builder")} className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left">
                  EPK Press Dossier
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Tools & Resources */}
          <div className="space-y-3">
            <h3 className="font-mono text-[10px] font-bold text-[var(--bento-text)] uppercase tracking-wider">
              Vault & Intelligence
            </h3>
            <ul className="space-y-2 text-[var(--bento-muted)] text-xs">
              <li>
                <button onClick={() => handleNavigate("splits-calculator")} className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left">
                  Producer Split Sheets
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate("splits-calculator")} className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left">
                  Royalty Calculator
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate("resource-vault")} className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left">
                  Work-for-Hire Contracts
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate("intel-hub")} className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left">
                  Release Playbooks
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate("intel-hub")} className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left">
                  Album Art Science
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Studio Contact */}
          <div className="space-y-3">
            <h3 className="font-mono text-[10px] font-bold text-[var(--bento-text)] uppercase tracking-wider">
              Studio Hotline
            </h3>
            <ul className="space-y-2 text-[var(--bento-muted)] text-xs">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[var(--accent-pill-text)] shrink-0" />
                <a href="mailto:official_keedohub@gmail.com" className="hover:text-[var(--bento-text)] transition-colors">
                  official_keedohub@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <a href="https://wa.me/2348104465924" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--bento-text)] transition-colors">
                  +234-810-446-5924
                </a>
              </li>
              <li className="text-[11px] text-[var(--bento-muted)] font-mono pt-1">
                HQ: Lagos, Nigeria • Serving Global Clients
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--bento-border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[var(--bento-muted)]">
          <div>
            © {new Date().getFullYear()} Keedohub Creative OS v3.0. Official Keedohub Brand. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>100% Commercial Rights Protected</span>
            <span>•</span>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-[var(--bento-text)] cursor-pointer">
              Back to Top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
