import React, { useState, useEffect, useRef } from "react";
import { ActiveTab, ColorTheme, GlobalSearchResultItem } from "../types";
import { useTheme } from "../context/ThemeContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { api } from "../services/api";
import { 
  Search, 
  Disc3, 
  Layers, 
  Sparkles, 
  Video, 
  FileText, 
  Briefcase, 
  ShieldCheck, 
  BookOpen, 
  ArrowRight,
  PhoneCall,
  Palette,
  Sun,
  Moon,
  Flame,
  Leaf,
  Crown,
  HardDrive,
  CheckSquare,
  Target,
  Music,
  Megaphone,
  Folder,
  BrainCircuit,
  Radio,
  Clock,
  Zap,
  PlusCircle,
  TrendingUp,
  Package,
  Activity
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  openBriefModal,
}) => {
  const { setColorTheme, toggleThemeMode, themeMode } = useTheme();
  const { workspace } = useWorkspace();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [serverResults, setServerResults] = useState<GlobalSearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Perform dynamic backend global search on typing across all authorized entities
  useEffect(() => {
    if (!query.trim() || !workspace?.id) {
      setServerResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.commandCenter.search(workspace.id, query);
        setServerResults(res.results || []);
      } catch (err) {
        console.error("[Search Error]", err);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, workspace?.id]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Primary Cross-OS Workstation Shortcuts
  const osModules = [
    {
      id: "nav-command-center",
      title: "Unified Command Center",
      description: "Primary workspace pulse: Today view, next actions, relationship graph & operational health",
      icon: <Clock className="w-4 h-4 text-red-500" />,
      action: () => {
        setActiveTab("command-center");
        onClose();
      },
    },
    {
      id: "nav-creative-radar",
      title: "Creative Radar & Proactive Intelligence",
      description: "Proactive condition detection, release gap radar & deterministic action recommendations",
      icon: <Radio className="w-4 h-4 text-amber-400" />,
      action: () => {
        setActiveTab("creative-radar");
        onClose();
      },
    },
    {
      id: "nav-creative-brain",
      title: "Creative Brain & Autonomous Agent Console",
      description: "Autonomous reasoning, multi-turn chat, persistent memory & workspace execution tools",
      icon: <BrainCircuit className="w-4 h-4 text-purple-400" />,
      action: () => {
        setActiveTab("creative-brain");
        onClose();
      },
    },
    {
      id: "nav-artist-os",
      title: "Artist OS (7-Pillar Release Brain)",
      description: "Release rollout pipeline, DSP editorial pitch, cover studio, stems mastering & splits",
      icon: <Disc3 className="w-4 h-4 text-red-400" />,
      action: () => {
        setActiveTab("artist-os");
        onClose();
      },
    },
    {
      id: "nav-brand-os",
      title: "Brand & Business OS",
      description: "Brand core, visual guidelines, 30-day sprint campaign launcher & product catalog",
      icon: <Sparkles className="w-4 h-4 text-blue-400" />,
      action: () => {
        setActiveTab("brand-os");
        onClose();
      },
    },
    {
      id: "nav-content-engine",
      title: "Content Engine",
      description: "Production calendar, TikTok/Reels hook generator, multi-pillar strategy & batching",
      icon: <Layers className="w-4 h-4 text-emerald-400" />,
      action: () => {
        setActiveTab("content-engine");
        onClose();
      },
    },
    {
      id: "nav-studio",
      title: "Keedohub Studio Services",
      description: "Commission top-tier artwork, motion design, 3D, branding, and review deliverables",
      icon: <Palette className="w-4 h-4 text-pink-400" />,
      action: () => {
        setActiveTab("studio");
        onClose();
      },
    },
    {
      id: "nav-creative-memory",
      title: "Creative Memory System",
      description: "Multi-scope persistent learning, narrative principles, rules & decision history",
      icon: <BookOpen className="w-4 h-4 text-cyan-400" />,
      action: () => {
        setActiveTab("creative-memory");
        onClose();
      },
    },
    {
      id: "nav-resource-vault",
      title: "Resource Vault & Cloud Assets",
      description: "High-resolution master WAVs, 3000x3000px artwork, contracts, and press kits",
      icon: <HardDrive className="w-4 h-4 text-amber-500" />,
      action: () => {
        setActiveTab("resource-vault");
        onClose();
      },
    },
  ];

  // Quick Action Triggers
  const quickActions = [
    {
      id: "qa-request-studio",
      title: "Request Creative Service in Studio",
      description: "Commission custom artwork, typography, video trailer, or landing page",
      icon: <PlusCircle className="w-4 h-4 text-pink-400" />,
      action: () => {
        openBriefModal();
        onClose();
      },
    },
    {
      id: "qa-new-release",
      title: "Initialize New Music Release",
      description: "Draft release blueprint, set target drop date, and start 7-pillar countdown",
      icon: <Music className="w-4 h-4 text-red-400" />,
      action: () => {
        setActiveTab("artist-os");
        onClose();
      },
    },
    {
      id: "qa-new-campaign",
      title: "Launch 30-Day Sprint Campaign",
      description: "Assemble multi-channel marketing campaign with KPI targets and creative direction",
      icon: <Megaphone className="w-4 h-4 text-blue-400" />,
      action: () => {
        setActiveTab("brand-os");
        onClose();
      },
    },
    {
      id: "qa-batch-content",
      title: "Batch Create Social Content Hooks",
      description: "Generate 10 platform-tailored scripts with viral psychology hooks",
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      action: () => {
        setActiveTab("content-engine");
        onClose();
      },
    },
  ];

  // Theme Commands
  const themeActions = [
    {
      id: "theme-crimson",
      title: "Switch Theme: Keedohub Crimson (Signature Red)",
      description: "High-contrast Carbon Noir & Crimson Red styling",
      icon: <Sparkles className="w-4 h-4 text-[#EF4444]" />,
      action: () => {
        setColorTheme("keedohub-red");
        onClose();
      },
    },
    {
      id: "theme-flame",
      title: "Switch Theme: Lagos Flame & Gold",
      description: "Fiery sunburst orange & cyberpunk golden accents",
      icon: <Flame className="w-4 h-4 text-[#F97316]" />,
      action: () => {
        setColorTheme("flame-gold");
        onClose();
      },
    },
    {
      id: "theme-emerald",
      title: "Switch Theme: Afro Emerald",
      description: "Studio neon green & sage aesthetic",
      icon: <Leaf className="w-4 h-4 text-[#10B981]" />,
      action: () => {
        setColorTheme("neon-emerald");
        onClose();
      },
    },
    {
      id: "theme-amethyst",
      title: "Switch Theme: Royal Amethyst",
      description: "Ultra-luxury deep purple & rose gold palette",
      icon: <Crown className="w-4 h-4 text-[#A855F7]" />,
      action: () => {
        setColorTheme("royal-amethyst");
        onClose();
      },
    },
    {
      id: "toggle-dark-light",
      title: `Toggle Display Mode (${themeMode === "dark" ? "Switch to Light" : "Switch to Dark"})`,
      description: `Current mode: ${themeMode}. Switch with zero layout shift.`,
      icon: themeMode === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />,
      action: () => {
        toggleThemeMode();
        onClose();
      },
    },
  ];

  // Build Results Structure
  let groups: { group: string; items: any[] }[] = [];

  if (query.trim()) {
    // If user typed query, show backend search results first
    if (serverResults.length > 0) {
      groups.push({
        group: `Universal Workspace Search Results (${serverResults.length})`,
        items: serverResults.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.subtitle,
          badge: r.badge,
          icon: r.type === "release" ? <Music className="w-4 h-4 text-red-400" /> :
                r.type === "campaign" ? <Megaphone className="w-4 h-4 text-blue-400" /> :
                r.type === "content" ? <Layers className="w-4 h-4 text-emerald-400" /> :
                r.type === "asset" ? <HardDrive className="w-4 h-4 text-amber-400" /> :
                r.type === "task" ? <CheckSquare className="w-4 h-4 text-purple-400" /> :
                r.type === "studio_request" ? <Palette className="w-4 h-4 text-pink-400" /> :
                r.type === "memory" ? <BookOpen className="w-4 h-4 text-cyan-400" /> :
                <Folder className="w-4 h-4 text-zinc-400" />,
          action: () => {
            setActiveTab(r.actionTab as ActiveTab);
            onClose();
          },
        })),
      });
    }

    // Filter Navigation & Actions locally as well
    const q = query.toLowerCase();
    const matchingModules = osModules.filter((m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
    const matchingActions = quickActions.filter((a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    const matchingThemes = themeActions.filter((t) => t.title.toLowerCase().includes(q));

    if (matchingModules.length > 0) {
      groups.push({ group: "Operating Systems", items: matchingModules });
    }
    if (matchingActions.length > 0) {
      groups.push({ group: "Actions & Workflows", items: matchingActions });
    }
    if (matchingThemes.length > 0) {
      groups.push({ group: "Appearance", items: matchingThemes });
    }
  } else {
    // Default state: Quick Actions + Core OS Modules + Theme
    groups = [
      { group: "Quick Actions", items: quickActions },
      { group: "Keedohub Operating Systems", items: osModules },
      { group: "Display & Appearance", items: themeActions },
    ];
  }

  const flatItems = groups.flatMap((g) => g.items);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, flatItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatItems.length) % Math.max(1, flatItems.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flatItems[selectedIndex]) {
          flatItems[selectedIndex].action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, flatItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      id="command-palette-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 font-['Plus_Jakarta_Sans']"
      onClick={onClose}
    >
      <div 
        id="command-palette-modal"
        className="w-full max-w-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] rounded-3xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--bento-border)] bg-[var(--bento-card)]">
          <Search className={`w-4 h-4 shrink-0 ${isSearching ? "animate-spin text-red-500" : "text-[var(--accent-pill-text)]"}`} />
          <input
            id="command-palette-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search all releases, campaigns, content, studio, vault assets, tasks... (⌘K)"
            className="w-full bg-transparent text-sm text-[var(--bento-text)] placeholder-[var(--bento-subtle)] focus:outline-none font-medium"
          />
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[var(--bento-elevated)] text-[var(--bento-muted)] border border-[var(--bento-border)] shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-3 space-y-4 flex-1">
          {groups.length === 0 ? (
            <div className="py-12 text-center text-[var(--bento-muted)] text-sm font-mono">
              No matching workspace entities or commands found for "{query}".
            </div>
          ) : (
            groups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1 text-left">
                <div className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--bento-muted)] flex items-center justify-between">
                  <span>{group.group}</span>
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const globalIdx = flatItems.findIndex((i) => i.id === item.id);
                    const isSelected = globalIdx === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[var(--bento-elevated)] border border-[var(--accent-border)] text-[var(--bento-text)] shadow-xs"
                            : "hover:bg-[var(--bento-elevated)]/50 text-[var(--bento-muted)] border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-xl border shrink-0 ${isSelected ? 'bg-[var(--accent-light)] border-[var(--accent-border)] text-[var(--accent-pill-text)]' : 'bg-[var(--bento-elevated)] border-[var(--bento-border)]'}`}>
                            {item.icon}
                          </div>
                          <div className="text-left min-w-0">
                            <div className="text-xs sm:text-sm font-semibold flex items-center gap-2 text-[var(--bento-text)] truncate">
                              <span className="truncate">{item.title}</span>
                              {item.badge && (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/30 shrink-0">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[var(--bento-muted)] line-clamp-1">
                              {item.description}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[var(--accent-pill-text)] translate-x-0.5' : 'text-[var(--bento-muted)]'} transition-transform shrink-0 ml-2`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[var(--bento-elevated)] border-t border-[var(--bento-border)] flex items-center justify-between text-[11px] font-mono text-[var(--bento-muted)]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div className="text-[var(--accent-pill-text)] font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Keedohub Command Center</span>
          </div>
        </div>
      </div>
    </div>
  );
};
