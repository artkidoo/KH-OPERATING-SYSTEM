import React, { useState, useEffect } from "react";
import { ActiveTab } from "../types";
import { useTheme } from "../context/ThemeContext";
import { ThemeSelectorModal } from "./ThemeSelectorModal";
import { KeedohubLogo } from "./KeedohubLogo";
import { 
  Disc3, 
  Sparkles, 
  Layers, 
  Briefcase, 
  Video, 
  FileText, 
  BookOpen, 
  Search, 
  Send, 
  Menu, 
  X, 
  Activity,
  ShieldCheck,
  Sun,
  Moon,
  Palette,
  Music,
  Radio,
  Sliders,
  Percent,
  TrendingUp,
  Target
} from "lucide-react";

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openCommandPalette: () => void;
  openBriefModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openCommandPalette,
  openBriefModal,
}) => {
  const { colorTheme, themeMode, toggleThemeMode, currentThemeConfig } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "artist-brain", label: "Artist Brain", icon: <Disc3 className="w-3.5 h-3.5" />, badge: "CORE" },
    { id: "lyrics-studio", label: "Lyric Studio", icon: <Music className="w-3.5 h-3.5" />, badge: "NEW" },
    { id: "dsp-pitcher", label: "DSP Pitch", icon: <Target className="w-3.5 h-3.5" />, badge: "AI" },
    { id: "mastering-suite", label: "Mastering & LUFS", icon: <Activity className="w-3.5 h-3.5" /> },
    { id: "splits-calculator", label: "Splits & Royalties", icon: <Percent className="w-3.5 h-3.5" /> },
    { id: "presave-hub", label: "Smart Pre-Save", icon: <Radio className="w-3.5 h-3.5" /> },
    { id: "cover-studio", label: "Cover Studio", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "brand-os", label: "Brand OS", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "creator-os", label: "Creator OS", icon: <Video className="w-3.5 h-3.5" /> },
    { id: "epk-builder", label: "EPK Kit", icon: <FileText className="w-3.5 h-3.5" /> },
    { id: "project-console", label: "Project Console", icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: "resource-vault", label: "Vault & Legal", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: "intel-hub", label: "KH Intel", icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <header
        id="app-global-header"
        className={`sticky top-0 z-40 transition-all duration-300 border-b ${
          isScrolled
            ? "bg-[var(--bento-bg)]/95 backdrop-blur-xl border-[var(--bento-border)] shadow-lg"
            : "bg-[var(--bento-bg)]/85 backdrop-blur-md border-[var(--bento-border)]/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-3">
            {/* Logo */}
            <button
              id="header-brand-logo-btn"
              onClick={() => setActiveTab("overview")}
              className="flex items-center gap-1.5 sm:gap-2.5 group cursor-pointer focus:outline-none shrink-0"
              title="Keedohub Creative Operating System"
            >
              <KeedohubLogo size="sm" showText={false} />
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="font-['Space_Grotesk'] text-xs sm:text-sm md:text-base font-bold tracking-tight text-[var(--bento-text)] group-hover:text-[#DC2626] transition-colors">
                    KEEDOHUB
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-mono px-1 sm:px-1.5 py-0.2 rounded-full bg-[var(--accent-light)] text-[var(--accent-pill-text)] border border-[var(--accent-border)] font-bold tracking-wider">
                    OS
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] font-mono text-[var(--bento-muted)] uppercase tracking-wider hidden md:flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                  Creative OS
                </span>
              </div>
            </button>

            {/* Desktop Navigation Pills */}
            <nav className="hidden lg:flex items-center gap-1 bg-[var(--bento-card)] border border-[var(--bento-border)] p-1 rounded-full shadow-inner">
              {navItems.slice(0, 7).map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-theme-accent font-bold shadow-sm"
                        : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase ${isActive ? 'bg-black/20 text-white' : 'bg-[var(--accent-light)] text-[var(--accent-pill-text)]'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Theme Selector Trigger (Icon Only) */}
              <button
                id="header-theme-selector-btn"
                onClick={() => setIsThemeModalOpen(true)}
                className="relative p-1.5 sm:p-2 rounded-xl bg-[var(--bento-card)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-[var(--accent-border)] text-[var(--bento-muted)] hover:text-[var(--bento-text)] transition-all cursor-pointer shadow-sm group flex items-center justify-center"
                title={`Theme Palette: ${currentThemeConfig.name}`}
                aria-label="Select Theme Palette"
              >
                <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent-pill-text)] group-hover:scale-110 transition-transform" />
                <span
                  className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full ring-1 ring-[var(--bento-bg)]"
                  style={{ backgroundColor: currentThemeConfig.primaryColor }}
                />
              </button>

              {/* Dark / Light Mode Toggle Button */}
              <button
                id="header-darkmode-toggle-btn"
                onClick={toggleThemeMode}
                className="p-1.5 sm:p-2 rounded-xl bg-[var(--bento-card)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-[var(--accent-border)] text-[var(--bento-muted)] hover:text-[var(--bento-text)] transition-all cursor-pointer shadow-sm group"
                title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle Dark/Light Mode"
              >
                {themeMode === "dark" ? (
                  <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 group-hover:-rotate-12 transition-transform" />
                )}
              </button>

              {/* Global Command Palette Trigger */}
              <button
                id="header-command-palette-btn"
                onClick={openCommandPalette}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--bento-card)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-[var(--accent-border)] text-xs text-[var(--bento-muted)] hover:text-[var(--bento-text)] transition-all cursor-pointer shadow-sm group"
                title="Search OS & Commands (⌘K)"
              >
                <Search className="w-3.5 h-3.5 text-[var(--accent-pill-text)] group-hover:scale-110 transition-transform" />
                <span className="font-mono text-[11px]">⌘K</span>
              </button>

              {/* Start Project CTA */}
              <button
                id="header-start-project-btn"
                onClick={openBriefModal}
                className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-theme-accent text-xs font-bold transition-all shadow-md hover:scale-105 cursor-pointer border border-[var(--accent-border)]"
              >
                <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="whitespace-nowrap hidden xs:inline">Brief</span>
                <span className="whitespace-nowrap xs:hidden">New</span>
              </button>

              {/* Mobile Hamburger Menu Toggle */}
              <button
                id="header-mobile-menu-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-[var(--bento-card)] border border-[var(--bento-border)] text-[var(--bento-muted)] hover:text-[var(--bento-text)] cursor-pointer"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Quick-Scroll Pill Navigation */}
        <div className="lg:hidden overflow-x-auto scrollbar-none py-1.5 px-3 border-t border-[var(--bento-border)]/60 bg-[var(--bento-bg)] flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold whitespace-nowrap shrink-0 transition-all ${
              activeTab === "overview"
                ? "bg-theme-accent text-white shadow-sm font-bold"
                : "bg-[var(--bento-card)] text-[var(--bento-muted)] border border-[var(--bento-border)] hover:text-[var(--bento-text)]"
            }`}
          >
            <span>Overview</span>
          </button>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? "bg-theme-accent text-white shadow-sm font-bold"
                    : "bg-[var(--bento-card)] text-[var(--bento-muted)] border border-[var(--bento-border)] hover:text-[var(--bento-text)]"
                }`}
              >
                <span className={isActive ? "text-white" : "text-[var(--accent-pill-text)]"}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Dropdown Drawer Menu (Forced 2-Column Grid) */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[var(--bento-card)] border-t border-[var(--bento-border)] px-3 py-3 shadow-2xl animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--bento-border)]">
              <span className="text-[10px] font-mono uppercase font-bold text-[var(--bento-muted)]">
                SELECT MODULE ({navItems.length + 1})
              </span>
              <button
                onClick={() => {
                  setActiveTab("overview");
                  setMobileMenuOpen(false);
                }}
                className="text-[11px] font-mono text-[var(--accent-pill-text)] font-semibold"
              >
                → Go to Overview
              </button>
            </div>

            {/* Forced 2-Column Mobile Grid for All Navigation Items */}
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] text-left transition-all ${
                      isActive
                        ? "bg-theme-accent font-bold text-white shadow-sm"
                        : "bg-[var(--bento-elevated)] text-[var(--bento-text)] border border-[var(--bento-border)] hover:border-[var(--accent-border)]"
                    }`}
                  >
                    <span className={isActive ? "text-white" : "text-[var(--accent-pill-text)] shrink-0"}>{item.icon}</span>
                    <span className="truncate font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto text-[8px] px-1 py-0.2 rounded font-mono uppercase ${isActive ? 'bg-black/30 text-white' : 'bg-[var(--accent-light)] text-[var(--accent-pill-text)]'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Mobile Bottom Quick Actions */}
            <div className="pt-2 border-t border-[var(--bento-border)] grid grid-cols-3 gap-1.5">
              <button
                onClick={() => {
                  openCommandPalette();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-[var(--bento-elevated)] border border-[var(--bento-border)] text-[10px] font-mono text-[var(--bento-muted)]"
              >
                <Search className="w-3 h-3 text-[var(--accent-pill-text)]" />
                <span>Search</span>
              </button>

              <button
                onClick={() => {
                  setIsThemeModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-[var(--bento-elevated)] border border-[var(--bento-border)] text-[10px] font-mono text-[var(--bento-muted)]"
              >
                <Palette className="w-3 h-3 text-[var(--accent-pill-text)]" />
                <span>Themes</span>
              </button>

              <button
                onClick={toggleThemeMode}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-[var(--bento-elevated)] border border-[var(--bento-border)] text-[10px] font-mono text-[var(--bento-muted)]"
              >
                {themeMode === "dark" ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-indigo-600" />}
                <span>{themeMode === "dark" ? "Light" : "Dark"}</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
