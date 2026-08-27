import React, { useState, useEffect, useRef } from "react";
import { ActiveTab, ColorTheme } from "../types";
import { useTheme } from "../context/ThemeContext";
import { useWorkspace } from "../context/WorkspaceContext";
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
  Folder
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
  const { 
    workspace, 
    projects, 
    releases, 
    assets, 
    tasks, 
    milestones, 
    campaigns, 
    performSearch 
  } = useWorkspace();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamic Workspace Results
  const workspaceItems = [
    ...projects.map((p) => ({
      id: `project-${p.id}`,
      title: `Project: ${p.title}`,
      description: `${p.category} • Budget: $${p.budget.toLocaleString()} • Deadline: ${p.deadline}`,
      icon: <Briefcase className="w-4 h-4 text-blue-400" />,
      action: () => {
        setActiveTab("workspace-hub");
        onClose();
      },
    })),
    ...releases.map((r) => ({
      id: `release-${r.id}`,
      title: `Release: ${r.title} (${r.artistName})`,
      description: `${r.genre} • Drop: ${r.releaseDate} • ISRC: ${r.isrc || "Pending"}`,
      icon: <Music className="w-4 h-4 text-red-400" />,
      action: () => {
        setActiveTab("workspace-hub");
        onClose();
      },
    })),
    ...assets.map((a) => ({
      id: `asset-${a.id}`,
      title: `Asset: ${a.name}`,
      description: `${a.category.toUpperCase()} • ${a.dimensions || "3000x3000px"} • ${(a.size / (1024 * 1024)).toFixed(2)} MB`,
      icon: <HardDrive className="w-4 h-4 text-emerald-400" />,
      action: () => {
        setActiveTab("workspace-hub");
        onClose();
      },
    })),
    ...tasks.map((t) => ({
      id: `task-${t.id}`,
      title: `Task: ${t.text}`,
      description: `Priority: ${t.priority.toUpperCase()} • ${t.completed ? "Completed" : "Pending"}`,
      icon: <CheckSquare className="w-4 h-4 text-amber-400" />,
      action: () => {
        setActiveTab("workspace-hub");
        onClose();
      },
    })),
    ...milestones.map((m) => ({
      id: `milestone-${m.id}`,
      title: `Milestone: ${m.title}`,
      description: `Target Date: ${m.targetDate} • Status: ${m.status}`,
      icon: <Target className="w-4 h-4 text-purple-400" />,
      action: () => {
        setActiveTab("workspace-hub");
        onClose();
      },
    })),
  ];

  const commandItems = [
    {
      group: `Active Workspace (${workspace?.name || "Keedohub OS"})`,
      items: workspaceItems,
    },
    {
      group: "Theme & Display Appearance",
      items: [
        {
          id: "theme-keedohub-red",
          title: "Switch Theme: Keedohub Crimson (Signature Red)",
          description: "Activate official Keedohub Crimson Red & Carbon Noir brand styling",
          icon: <Sparkles className="w-4 h-4 text-[#EF4444]" />,
          action: () => {
            setColorTheme("keedohub-red");
            onClose();
          },
        },
        {
          id: "theme-flame-gold",
          title: "Switch Theme: Lagos Flame & Gold",
          description: "Activate fiery sunburst orange and cyberpunk golden accents",
          icon: <Flame className="w-4 h-4 text-[#F97316]" />,
          action: () => {
            setColorTheme("flame-gold");
            onClose();
          },
        },
        {
          id: "theme-neon-emerald",
          title: "Switch Theme: Afro Emerald",
          description: "Activate lush studio neon green & sage aesthetic",
          icon: <Leaf className="w-4 h-4 text-[#10B981]" />,
          action: () => {
            setColorTheme("neon-emerald");
            onClose();
          },
        },
        {
          id: "theme-royal-amethyst",
          title: "Switch Theme: Royal Amethyst",
          description: "Activate ultra-luxury deep purple & rose gold palette",
          icon: <Crown className="w-4 h-4 text-[#A855F7]" />,
          action: () => {
            setColorTheme("royal-amethyst");
            onClose();
          },
        },
        {
          id: "toggle-dark-light",
          title: `Toggle Mode: Switch to ${themeMode === "dark" ? "Light" : "Dark"} Mode`,
          description: `Current display mode is ${themeMode}. Switch instantly with full contrast styling.`,
          icon: themeMode === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />,
          action: () => {
            toggleThemeMode();
            onClose();
          },
        },
      ],
    },
    {
      group: "Core Operating Systems",
      items: [
        {
          id: "creative-brain",
          title: "Keedohub Creative Brain Console",
          description: "Autonomous intelligence operating over releases, campaigns, 7-pillar readiness & persistent memory",
          icon: <Sparkles className="w-4 h-4 text-red-500" />,
          action: () => {
            setActiveTab("creative-brain");
            onClose();
          },
        },
        {
          id: "artist-os",
          title: "Artist OS (Central Release Brain & Readiness)",
          description: "Persistent Release Command Center, 30-Day Pipeline, Timeline, Splits, Pre-Save & 7-Pillar Readiness",
          icon: <Disc3 className="w-4 h-4 text-cyan-400" />,
          action: () => {
            setActiveTab("artist-os");
            onClose();
          },
        },
        {
          id: "workspace-hub",
          title: "Workspace Command Center & Vault",
          description: "Intelligent command center, tasks, milestones, cloud assets, and release blueprints",
          icon: <HardDrive className="w-4 h-4 text-red-500" />,
          action: () => {
            setActiveTab("workspace-hub");
            onClose();
          },
        },
        {
          id: "artist-brain",
          title: "Music Artist Content Brain",
          description: "Generate 30-day release timeline, viral TikTok hooks, and DSP pitches",
          icon: <Disc3 className="w-4 h-4 text-red-500" />,
          action: () => {
            setActiveTab("artist-brain");
            onClose();
          },
        },
        {
          id: "lyrics-studio",
          title: "Lyric Studio & Kinetic Visualizer (.LRC)",
          description: "Time-sync song lyrics, generate standardized .LRC files & 9:16 vertical videos",
          icon: <Sparkles className="w-4 h-4 text-red-400" />,
          action: () => {
            setActiveTab("lyrics-studio");
            onClose();
          },
        },
        {
          id: "dsp-pitcher",
          title: "DSP Pitch & Curator Strategy Engine",
          description: "Auto-engineer 50-word Spotify editorial pitches, curator emails & playlist scorecards",
          icon: <Disc3 className="w-4 h-4 text-emerald-400" />,
          action: () => {
            setActiveTab("dsp-pitcher");
            onClose();
          },
        },
        {
          id: "mastering-suite",
          title: "Mastering Inspector & Loudness Radar",
          description: "Live 60fps spectrum analyzer, -14 LUFS loudness meter & True Peak limiter checker",
          icon: <Sparkles className="w-4 h-4 text-amber-400" />,
          action: () => {
            setActiveTab("mastering-suite");
            onClose();
          },
        },
        {
          id: "splits-calculator",
          title: "Royalty Splits & Streaming Revenue Simulator",
          description: "Master vs Publishing splits calculator, global DSP revenue estimator & split sheets",
          icon: <Crown className="w-4 h-4 text-purple-400" />,
          action: () => {
            setActiveTab("splits-calculator");
            onClose();
          },
        },
        {
          id: "presave-hub",
          title: "Smart Link & Fan Pre-Save Hub",
          description: "Custom bio smart link, fan email/WhatsApp lead capture CRM & marketing QR codes",
          icon: <Leaf className="w-4 h-4 text-cyan-400" />,
          action: () => {
            setActiveTab("presave-hub");
            onClose();
          },
        },
        {
          id: "cover-studio",
          title: "Music Cover Studio (3000x3000px)",
          description: "Live interactive canvas, vinyl mockups, and parental advisory badges",
          icon: <Layers className="w-4 h-4 text-amber-500" />,
          action: () => {
            setActiveTab("cover-studio");
            onClose();
          },
        },
        {
          id: "brand-os",
          title: "Brand OS & Launch Engine",
          description: "Design systems, color palettes, voice matrix & 14-day brand sprint",
          icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
          action: () => {
            setActiveTab("brand-os");
            onClose();
          },
        },
        {
          id: "creator-os",
          title: "Creator OS & Hook Engine",
          description: "Viral 3-second hook bank, thumbnail blueprint & sponsorship rates",
          icon: <Video className="w-4 h-4 text-emerald-400" />,
          action: () => {
            setActiveTab("creator-os");
            onClose();
          },
        },
        {
          id: "epk-builder",
          title: "Electronic Press Kit (EPK) Generator",
          description: "Build live press kits with stream stats, bio, quotes & booking specs",
          icon: <FileText className="w-4 h-4 text-purple-400" />,
          action: () => {
            setActiveTab("epk-builder");
            onClose();
          },
        },
      ],
    },
    {
      group: "Client & Studio Workflows",
      items: [
        {
          id: "project-console",
          title: "Project Console & Quote Calculator",
          description: "Interactive project brief builder with instant estimates in ₦ and $",
          icon: <Briefcase className="w-4 h-4 text-amber-400" />,
          action: () => {
            setActiveTab("project-console");
            onClose();
          },
        },
        {
          id: "resource-vault",
          title: "Legal & Split Sheet Vault",
          description: "Producer agreements, songwriter split sheets, and work-for-hire contracts",
          icon: <ShieldCheck className="w-4 h-4 text-blue-400" />,
          action: () => {
            setActiveTab("resource-vault");
            onClose();
          },
        },
        {
          id: "intel-hub",
          title: "Keedohub Intel & Guides",
          description: "Music marketing playbooks, cover art science, and design breakdowns",
          icon: <BookOpen className="w-4 h-4 text-rose-400" />,
          action: () => {
            setActiveTab("intel-hub");
            onClose();
          },
        },
      ],
    },
    {
      group: "Direct Studio Actions",
      items: [
        {
          id: "start-brief",
          title: "Start a New Creative Brief",
          description: "Dispatch your project specifications directly to Keedohub studio",
          icon: <ArrowRight className="w-4 h-4 text-emerald-400" />,
          action: () => {
            onClose();
            openBriefModal();
          },
        },
        {
          id: "whatsapp-direct",
          title: "Connect with Lead Director on WhatsApp",
          description: "Instant chat with Ojo Abdulkareem (+234-810-446-5924)",
          icon: <PhoneCall className="w-4 h-4 text-green-500" />,
          action: () => {
            window.open("https://wa.me/2348104465924?text=Hi%20Keedohub!%20I'm%20using%20the%20Creative%20OS%20and%20want%20to%20discuss%20a%20project.", "_blank");
            onClose();
          },
        },
      ],
    },
  ];

  const filteredItems = commandItems
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          (item.title || "").toLowerCase().includes((query || "").toLowerCase()) ||
          (item.description || "").toLowerCase().includes((query || "").toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  const flatFiltered = filteredItems.flatMap((g) => g.items);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }

      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, flatFiltered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatFiltered.length) % Math.max(1, flatFiltered.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flatFiltered[selectedIndex]) {
          flatFiltered[selectedIndex].action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, flatFiltered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      id="command-palette-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        id="command-palette-modal"
        className="w-full max-w-2xl bg-[var(--bento-card)] border border-[var(--bento-border)] rounded-3xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--bento-border)] bg-[var(--bento-card)]">
          <Search className="w-4 h-4 text-[var(--accent-pill-text)] shrink-0" />
          <input
            id="command-palette-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search projects, releases, assets, tasks, milestones, themes... (⌘K)"
            className="w-full bg-transparent text-sm text-[var(--bento-text)] placeholder-[var(--bento-subtle)] focus:outline-none font-medium"
          />
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[var(--bento-elevated)] text-[var(--bento-muted)] border border-[var(--bento-border)] shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-3 space-y-4 flex-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-[var(--bento-muted)] text-sm font-mono">
              No matching workspace entities, modules, or commands found for "{query}".
            </div>
          ) : (
            filteredItems.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1 text-left">
                <div className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--bento-muted)]">
                  {group.group}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const globalIdx = flatFiltered.findIndex((i) => i.id === item.id);
                    const isSelected = globalIdx === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[var(--bento-elevated)] border border-[var(--accent-border)] text-[var(--bento-text)]"
                            : "hover:bg-[var(--bento-elevated)]/50 text-[var(--bento-muted)] border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl border shrink-0 ${isSelected ? 'bg-[var(--accent-light)] border-[var(--accent-border)] text-[var(--accent-pill-text)]' : 'bg-[var(--bento-elevated)] border-[var(--bento-border)]'}`}>
                            {item.icon}
                          </div>
                          <div className="text-left">
                            <div className="text-xs sm:text-sm font-semibold flex items-center gap-2 text-[var(--bento-text)]">
                              <span>{item.title}</span>
                            </div>
                            <div className="text-[11px] text-[var(--bento-muted)] line-clamp-1">
                              {item.description}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[var(--accent-pill-text)] translate-x-0.5' : 'text-[var(--bento-muted)]'} transition-transform shrink-0`} />
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
          <div className="text-[var(--accent-pill-text)] font-semibold">Keedohub Creative OS</div>
        </div>
      </div>
    </div>
  );
};
