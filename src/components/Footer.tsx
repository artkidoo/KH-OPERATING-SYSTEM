import React, { useState } from "react";
import { ActiveTab } from "../types";
import { KeedohubLogo } from "./KeedohubLogo";
import { 
  Send, 
  PhoneCall, 
  Mail, 
  ChevronDown, 
  ChevronUp,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, openBriefModal }) => {
  const [mobileSectionsOpen, setMobileSectionsOpen] = useState<Record<string, boolean>>({
    product: false,
    company: false,
    resources: false,
    legal: false,
  });

  const toggleMobileSection = (sec: string) => {
    setMobileSectionsOpen(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleNavigate = (tab: ActiveTab, path: string) => {
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", path);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="app-global-footer" className="border-t border-[var(--bento-border)] bg-[var(--bento-bg)] text-[var(--bento-muted)] text-xs pt-8 sm:pt-10 pb-6 sm:pb-8 text-left transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Compact Top Action Strip */}
        <div className="p-4 sm:p-5 rounded-2xl bento-card border border-[var(--bento-border)] bg-gradient-to-r from-[var(--bento-card)] via-[var(--bento-card)] to-[var(--bento-elevated)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6 shadow-sm">
          <div className="space-y-0.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent-pill-text)]">
                Creative Operating System
              </span>
            </div>
            <p className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-[var(--bento-text)]">
              Build something <span className="italic font-normal text-[var(--accent-pill-text)]">worth</span> remembering.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={openBriefModal}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-theme-accent text-white font-bold text-xs font-['Space_Grotesk'] flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Start a Project</span>
            </button>
            <a
              href="https://wa.me/2348104465924"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-card-hover)] text-[var(--bento-text)] text-xs font-medium border border-[var(--bento-border)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Chat on WhatsApp"
            >
              <PhoneCall className="w-3 h-3 text-emerald-500" />
              <span className="hidden xs:inline">WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Structured Desktop / Mobile Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-6 sm:gap-8 pt-2">
          {/* Brand Identity & Summary (Col 1 to 4) */}
          <div className="sm:col-span-2 md:col-span-4 space-y-3">
            <div className="flex items-center gap-2">
              <KeedohubLogo size="sm" showText={true} badge="OS" />
            </div>
            <p className="text-xs text-[var(--bento-muted)] max-w-sm leading-relaxed font-normal">
              Creative operating system for artists and businesses.
            </p>
            <div className="space-y-1 pt-1 text-[11px] font-mono text-[var(--bento-muted)]">
              <div>HQ: Lagos, Nigeria • Serving Global Creators</div>
              <div className="flex items-center gap-2 pt-1">
                <a 
                  href="mailto:official_keedohub@gmail.com" 
                  className="hover:text-[var(--bento-text)] transition-colors inline-flex items-center gap-1"
                >
                  <Mail className="w-3 h-3 text-red-500" />
                  <span>official_keedohub@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: PRODUCT (2 cols) */}
          <div className="md:col-span-2 space-y-2.5">
            <div 
              className="flex items-center justify-between sm:justify-start cursor-pointer sm:cursor-default"
              onClick={() => toggleMobileSection("product")}
            >
              <h3 className="font-mono text-[10px] font-bold text-[var(--bento-text)] uppercase tracking-wider">
                Product
              </h3>
              <span className="sm:hidden text-[var(--bento-muted)]">
                {mobileSectionsOpen.product ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </span>
            </div>
            <ul className={`space-y-2 text-xs ${mobileSectionsOpen.product ? "block" : "hidden sm:block"}`}>
              <li>
                <button
                  id="footer-link-home"
                  onClick={() => handleNavigate("overview", "/home")}
                  className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left inline-block"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  id="footer-link-workspace"
                  onClick={() => handleNavigate("command-center", "/workspace")}
                  className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left inline-block"
                >
                  Workspace
                </button>
              </li>
              <li>
                <button
                  id="footer-link-studios"
                  onClick={() => handleNavigate("studio", "/studios")}
                  className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left inline-block"
                >
                  Studios
                </button>
              </li>
              <li>
                <button
                  id="footer-link-intelligence"
                  onClick={() => handleNavigate("creative-brain", "/creative-brain")}
                  className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left inline-block"
                >
                  Intelligence
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: COMPANY (2 cols) */}
          <div className="md:col-span-2 space-y-2.5">
            <div 
              className="flex items-center justify-between sm:justify-start cursor-pointer sm:cursor-default"
              onClick={() => toggleMobileSection("company")}
            >
              <h3 className="font-mono text-[10px] font-bold text-[var(--bento-text)] uppercase tracking-wider">
                Company
              </h3>
              <span className="sm:hidden text-[var(--bento-muted)]">
                {mobileSectionsOpen.company ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </span>
            </div>
            <ul className={`space-y-2 text-xs ${mobileSectionsOpen.company ? "block" : "hidden sm:block"}`}>
              <li>
                <button
                  id="footer-link-about"
                  onClick={() => handleNavigate("about", "/about")}
                  className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left inline-block"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  id="footer-link-vision"
                  onClick={() => handleNavigate("vision", "/vision")}
                  className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left inline-block"
                >
                  Our Vision
                </button>
              </li>
              <li>
                <button
                  id="footer-link-story"
                  onClick={() => handleNavigate("story", "/story")}
                  className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left inline-block"
                >
                  Our Story
                </button>
              </li>
              <li>
                <button
                  id="footer-link-contact"
                  onClick={() => handleNavigate("contact", "/contact")}
                  className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left inline-block"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: RESOURCES (2 cols) */}
          <div className="md:col-span-2 space-y-2.5">
            <div 
              className="flex items-center justify-between sm:justify-start cursor-pointer sm:cursor-default"
              onClick={() => toggleMobileSection("resources")}
            >
              <h3 className="font-mono text-[10px] font-bold text-[var(--bento-text)] uppercase tracking-wider">
                Resources
              </h3>
              <span className="sm:hidden text-[var(--bento-muted)]">
                {mobileSectionsOpen.resources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </span>
            </div>
            <ul className={`space-y-2 text-xs ${mobileSectionsOpen.resources ? "block" : "hidden sm:block"}`}>
              <li>
                <button
                  id="footer-link-faq"
                  onClick={() => handleNavigate("faq", "/faq")}
                  className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left inline-block"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  id="footer-link-help"
                  onClick={() => handleNavigate("help", "/help")}
                  className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left inline-block"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button
                  id="footer-link-docs"
                  onClick={() => handleNavigate("docs", "/docs")}
                  className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left inline-block"
                >
                  Documentation
                </button>
              </li>
              <li>
                <button
                  id="footer-link-resources"
                  onClick={() => handleNavigate("resources", "/resources")}
                  className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left inline-block"
                >
                  Resources
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: LEGAL (2 cols) */}
          <div className="md:col-span-2 space-y-2.5">
            <div 
              className="flex items-center justify-between sm:justify-start cursor-pointer sm:cursor-default"
              onClick={() => toggleMobileSection("legal")}
            >
              <h3 className="font-mono text-[10px] font-bold text-[var(--bento-text)] uppercase tracking-wider">
                Legal
              </h3>
              <span className="sm:hidden text-[var(--bento-muted)]">
                {mobileSectionsOpen.legal ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </span>
            </div>
            <ul className={`space-y-2 text-xs ${mobileSectionsOpen.legal ? "block" : "hidden sm:block"}`}>
              <li>
                <button
                  id="footer-link-privacy"
                  onClick={() => handleNavigate("privacy", "/privacy")}
                  className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left inline-block"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  id="footer-link-terms"
                  onClick={() => handleNavigate("terms", "/terms")}
                  className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left inline-block"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  id="footer-link-security"
                  onClick={() => handleNavigate("security", "/security")}
                  className="hover:text-[var(--accent-pill-text)] transition-colors cursor-pointer text-left inline-block"
                >
                  Security
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Compact Bottom Bar */}
        <div className="pt-6 border-t border-[var(--bento-border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[var(--bento-muted)]">
          <div>
            © {new Date().getFullYear()} Keedohub Creative OS. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[var(--bento-text)] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Commercial Rights Protected</span>
            </span>
            <span>•</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:text-[var(--bento-text)] cursor-pointer"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
