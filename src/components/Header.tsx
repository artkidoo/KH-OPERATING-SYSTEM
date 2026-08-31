import React, { useState, useEffect, useRef } from "react";
import { ActiveTab, IdentityType } from "../types";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { useCreativeBrain } from "../context/CreativeBrainContext";
import { ThemeSelectorModal } from "./ThemeSelectorModal";
import { AuthModal } from "./AuthModal";
import { NotificationCenterModal } from "./NotificationCenterModal";
import { KeedohubLogo } from "./KeedohubLogo";
import { api } from "../services/api";
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
  Target,
  BrainCircuit,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Plus,
  Building2,
  Rocket,
  CheckCircle2,
  CheckSquare,
  Bell,
  HardDrive
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
  const { user, workspaces, activeWorkspace, switchWorkspace, logout, openOnboarding } = useAuth();
  const { toggleBrain, isOpen: isBrainOpen } = useCreativeBrain();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const workspaceDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Poll / fetch unread notifications count
  useEffect(() => {
    if (!activeWorkspace?.id) return;
    const fetchUnread = async () => {
      try {
        const res = await api.workflow.getNotifications(activeWorkspace.id, { unreadOnly: true, resolved: false });
        if (res.notifications) {
          setUnreadNotifCount(res.notifications.length);
        }
      } catch (err) {
        // silent
      }
    };
    fetchUnread();
    const timer = setInterval(fetchUnread, 30000);
    return () => clearInterval(timer);
  }, [activeWorkspace?.id]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (workspaceDropdownRef.current && !workspaceDropdownRef.current.contains(e.target as Node)) {
        setIsWorkspaceDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "command-center", label: "Command Center", icon: <Rocket className="w-3.5 h-3.5" />, badge: "PHASE 10" },
    { id: "workflow", label: "Workflow & Tasks", icon: <CheckSquare className="w-3.5 h-3.5" />, badge: "PHASE 14" },
    { id: "creative-radar", label: "Creative Radar", icon: <Radio className="w-3.5 h-3.5" />, badge: "PHASE 9" },
    { id: "analytics", label: "Analytics & Growth", icon: <TrendingUp className="w-3.5 h-3.5" />, badge: "PHASE 11" },
    { id: "artist-os", label: "Artist OS", icon: <Disc3 className="w-3.5 h-3.5" />, badge: "PHASE 3" },
    { id: "content-engine", label: "Content Engine", icon: <Layers className="w-3.5 h-3.5" />, badge: "PHASE 6" },
    { id: "studio", label: "Keedohub Studio", icon: <Palette className="w-3.5 h-3.5" />, badge: "PHASE 7" },
    { id: "creative-memory", label: "Creative Memory", icon: <BrainCircuit className="w-3.5 h-3.5" />, badge: "PHASE 8" },
    { id: "creative-brain", label: "Creative Brain", icon: <BrainCircuit className="w-3.5 h-3.5" />, badge: "OS AI" },
    { id: "workspace-hub", label: "Workspace OS", icon: <HardDrive className="w-3.5 h-3.5" />, badge: "HUB" },
    { id: "brand-os", label: "Brand OS", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "artist-brain", label: "Artist Brain", icon: <Music className="w-3.5 h-3.5" /> },
    { id: "lyrics-studio", label: "Lyric Studio", icon: <Music className="w-3.5 h-3.5" /> },
    { id: "dsp-pitcher", label: "DSP Pitch", icon: <Target className="w-3.5 h-3.5" /> },
    { id: "mastering-suite", label: "Mastering & LUFS", icon: <Activity className="w-3.5 h-3.5" /> },
    { id: "splits-calculator", label: "Splits & Royalties", icon: <Percent className="w-3.5 h-3.5" /> },
    { id: "presave-hub", label: "Smart Pre-Save", icon: <Radio className="w-3.5 h-3.5" /> },
    { id: "cover-studio", label: "Cover Studio", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "creator-os", label: "Creator OS", icon: <Video className="w-3.5 h-3.5" /> },
    { id: "epk-builder", label: "EPK Kit", icon: <FileText className="w-3.5 h-3.5" /> },
    { id: "project-console", label: "Project Console", icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: "resource-vault", label: "Vault & Legal", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: "intel-hub", label: "KH Intel", icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  const getIdentityBadge = (type?: IdentityType) => {
    switch (type) {
      case "artist":
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-500/20 text-red-400">ARTIST</span>;
      case "creator":
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400">CREATOR</span>;
      case "brand":
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/20 text-blue-400">BRAND</span>;
      case "startup":
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-400">STARTUP</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400">BIZ</span>;
    }
  };

  return (
    <>
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <NotificationCenterModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        workspaceId={activeWorkspace?.id}
        onNavigateTab={setActiveTab}
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
            {/* Left: Logo & Workspace Switcher */}
            <div className="flex items-center gap-3">
              <button
                id="header-brand-logo-btn"
                onClick={() => setActiveTab("overview")}
                className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer focus:outline-none shrink-0"
                title="Keedohub Creative Operating System"
              >
                <KeedohubLogo size="sm" showText={false} />
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className="font-['Space_Grotesk'] text-xs sm:text-sm md:text-base font-bold tracking-tight text-[var(--bento-text)] group-hover:text-[#DC2626] transition-colors">
                      KEEDOHUB
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-mono px-1 py-0.2 rounded-full bg-[var(--accent-light)] text-[var(--accent-pill-text)] border border-[var(--accent-border)] font-bold tracking-wider">
                      OS
                    </span>
                  </div>
                </div>
              </button>

              {/* Workspace Switcher Pill */}
              <div className="relative hidden sm:block" ref={workspaceDropdownRef}>
                <button
                  onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-200 transition-all cursor-pointer shadow-xs max-w-[180px]"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="truncate font-semibold text-white">
                    {activeWorkspace?.name || "My Workspace"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                </button>

                {/* Workspace Dropdown Menu */}
                {isWorkspaceDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                    <div className="px-2.5 py-1.5 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                      Active Workspaces ({workspaces.length})
                    </div>

                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {workspaces.map((ws) => {
                        const isCurrent = ws.id === activeWorkspace?.id;
                        return (
                          <button
                            key={ws.id}
                            onClick={() => {
                              switchWorkspace(ws.id);
                              setIsWorkspaceDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                              isCurrent
                                ? "bg-red-950/40 text-white border border-red-500/40 font-bold"
                                : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                              <span className="truncate">{ws.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {getIdentityBadge(ws.identityType)}
                              {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 space-y-1">
                      <button
                        onClick={() => {
                          setIsWorkspaceDropdownOpen(false);
                          openOnboarding({ isNewAccount: false, defaultIdentity: activeWorkspace?.identityType || "artist" });
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-orange-400 hover:text-orange-300 hover:bg-zinc-900 transition-colors font-semibold cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Run OS Setup Wizard</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsWorkspaceDropdownOpen(false);
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-zinc-900 transition-colors font-semibold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create / Switch Workspace</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation Pills */}
            <nav className="hidden xl:flex items-center gap-1 bg-[var(--bento-card)] border border-[var(--bento-border)] p-1 rounded-full shadow-inner">
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
              {/* Notification Center Bell Trigger */}
              <button
                id="header-notification-center-btn"
                onClick={() => setIsNotificationModalOpen(true)}
                className="relative p-1.5 sm:p-2 rounded-xl bg-[var(--bento-card)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-red-500/40 text-[var(--bento-muted)] hover:text-white transition-all cursor-pointer shadow-sm group flex items-center justify-center"
                title={`Notifications & Radar (${unreadNotifCount} unread)`}
                aria-label="Open Notifications & Operational Radar"
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-300 group-hover:text-red-400 group-hover:scale-110 transition-transform" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-mono font-bold flex items-center justify-center border border-zinc-950 shadow-sm animate-pulse">
                    {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Creative Radar Trigger */}
              <button
                id="header-creative-radar-btn"
                onClick={() => setActiveTab("creative-radar")}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md hover:scale-105 cursor-pointer group ${
                  activeTab === "creative-radar"
                    ? "bg-red-600 text-white border-red-400 shadow-red-950/60"
                    : "bg-zinc-900/90 text-red-300 border-red-500/40 hover:border-red-400 hover:text-white"
                }`}
                title="Open Creative Radar — Proactive Intelligence"
              >
                <Radio className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform animate-pulse" />
                <span className="hidden sm:inline">Radar</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              </button>

              {/* Creative Brain Slide-over Trigger */}
              <button
                id="header-creative-brain-btn"
                onClick={toggleBrain}
                className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-red-950/80 to-zinc-900 border border-red-500/40 hover:border-red-400 text-xs text-white font-bold transition-all shadow-md shadow-red-950/40 hover:scale-105 cursor-pointer group"
                title="Open Workspace Creative Brain Assistant"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Brain</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              </button>

              {/* Theme Selector Trigger */}
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

              {/* User / Auth Avatar Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                  title="Account Profile"
                >
                  <img
                    src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                    alt={user?.fullName || "User"}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover"
                  />
                  <ChevronDown className="w-3 h-3 text-zinc-400 mr-1 hidden sm:inline" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-2.5 z-50 animate-fade-in space-y-2">
                    <div className="px-2 py-1">
                      <div className="text-xs font-bold text-white truncate">{user?.fullName || "Keedohub Creator"}</div>
                      <div className="text-[10px] text-zinc-400 truncate">{user?.email || "creator@keedohub.com"}</div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800 space-y-1">
                      <button
                        onClick={() => {
                          setActiveTab("workspace-hub");
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                      >
                        <HardDrive className="w-3.5 h-3.5 text-red-400" />
                        <span>Workspace Hub</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span>Switch User / Register</span>
                      </button>

                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-zinc-900 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

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
            onClick={() => setActiveTab("workspace-hub")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold whitespace-nowrap shrink-0 transition-all ${
              activeTab === "workspace-hub"
                ? "bg-theme-accent text-white shadow-sm font-bold"
                : "bg-[var(--bento-card)] text-[var(--bento-muted)] border border-[var(--bento-border)] hover:text-[var(--bento-text)]"
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </button>
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
          <div className="lg:hidden border-t border-[var(--bento-border)] bg-[var(--bento-bg)] px-4 py-4 space-y-3 animate-fade-in shadow-xl max-h-[70vh] overflow-y-auto">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--bento-muted)] mb-1">
              Creative OS Workstations
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setActiveTab("workspace-hub");
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all text-left cursor-pointer col-span-2 ${
                  activeTab === "workspace-hub"
                    ? "bg-theme-accent font-bold"
                    : "bg-[var(--bento-card)] border-[var(--bento-border)] text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                }`}
              >
                <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Workspace OS Hub</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("overview");
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-theme-accent font-bold"
                    : "bg-[var(--bento-card)] border-[var(--bento-border)] text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                }`}
              >
                <Layers className="w-4 h-4 text-[var(--accent-pill-text)] shrink-0" />
                <span className="truncate">Overview</span>
              </button>

              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? "bg-theme-accent font-bold"
                        : "bg-[var(--bento-card)] border-[var(--bento-border)] text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                    }`}
                  >
                    <span className={isActive ? "text-white" : "text-[var(--accent-pill-text)]"}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
