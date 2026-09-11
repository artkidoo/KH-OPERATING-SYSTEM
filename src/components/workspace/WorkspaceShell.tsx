import React from "react";
import { ActiveTab } from "../../types";
import { useMembership } from "../../hooks/useMembership";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { workspaceNavFor } from "../../utils/navigation";
import { WorkspaceHome } from "./WorkspaceHome";
import { ProjectsView } from "./ProjectsView";
import { LibraryView } from "./LibraryView";
import { ReleaseBuilder } from "./ReleaseBuilder";
import { CreativePackage } from "./CreativePackage";
import { StudioBoard } from "./StudioBoard";
import { BrandIdentity } from "./BrandIdentity";
import { DocumentsHub } from "./DocumentsHub";
import { SharePanel } from "./SharePanel";
import { RequestsView } from "../RequestsView";
import { MembershipView } from "../MembershipView";
import { ProfileView } from "../ProfileView";
import {
  Home,
  FolderKanban,
  Music,
  Newspaper,
  LibraryBig,
  Send,
  Crown,
  User,
  Fingerprint,
  Briefcase,
  FileText,
  PlusCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export type ShellSection =
  | "home"
  | "projects"
  | "music"
  | "releases"
  | "content"
  | "library"
  | "requests"
  | "membership"
  | "profile"
  | "brand"
  | "creative"
  | "business"
  | "documents"
  | "create";

const ICONS: Record<string, React.ReactNode> = {
  home: <Home className="w-4 h-4" />,
  projects: <FolderKanban className="w-4 h-4" />,
  music: <Music className="w-4 h-4" />,
  releases: <Music className="w-4 h-4" />,
  content: <Newspaper className="w-4 h-4" />,
  creative: <Newspaper className="w-4 h-4" />,
  library: <LibraryBig className="w-4 h-4" />,
  requests: <Send className="w-4 h-4" />,
  membership: <Crown className="w-4 h-4" />,
  profile: <User className="w-4 h-4" />,
  brand: <Fingerprint className="w-4 h-4" />,
  business: <Briefcase className="w-4 h-4" />,
  documents: <FileText className="w-4 h-4" />,
  create: <PlusCircle className="w-4 h-4" />,
};

export function WorkspaceShell({
  onNotify,
  onNavigateTab: _onNavigateTab,
  initialSection = "home",
  onSectionChange,
}: {
  onNotify: (m: string, t?: "success" | "info" | "error") => void;
  onNavigateTab: (t: ActiveTab, section?: ShellSection) => void;
  initialSection?: ShellSection;
  onSectionChange?: (s: ShellSection) => void;
}) {
  const { identity } = useMembership();
  const { activeWorkspace, workspaces, switchWorkspace } = useAuth();
  const { projects } = useWorkspace();
  const [section, setSection] = React.useState<ShellSection>(initialSection);
  const [openProject, setOpenProject] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initialSection && initialSection !== section) {
      setSection(initialSection);
    }
  }, [initialSection]);

  const nav = workspaceNavFor(identity);

  const goProjects = (id?: string) => {
    if (id) setOpenProject(id);
    setSection("projects");
    onSectionChange?.("projects");
  };

  const navTo = (s: ShellSection) => {
    setSection(s);
    onSectionChange?.(s);
  };

  interface BreadcrumbItem {
    id: string;
    label: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    active?: boolean;
  }

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const crumbs: BreadcrumbItem[] = [
      {
        id: "crumb-home",
        label: "Workspace",
        icon: <Home className="w-3.5 h-3.5" />,
        onClick:
          section === "home" && !openProject
            ? undefined
            : () => {
                setOpenProject(null);
                navTo("home");
              },
        active: section === "home" && !openProject,
      },
    ];

    if (section === "home") {
      return crumbs;
    }

    if (section === "projects") {
      const topDomain = identity === "artist" ? "Music" : "Brand";
      crumbs.push({
        id: "crumb-domain",
        label: topDomain,
        onClick: () => {
          setOpenProject(null);
          navTo(identity === "artist" ? "music" : "brand");
        },
      });

      if (openProject) {
        const proj = projects.find((p) => p.id === openProject);
        crumbs.push({
          id: "crumb-projects-list",
          label: "Projects",
          onClick: () => setOpenProject(null),
        });
        crumbs.push({
          id: "crumb-project-leaf",
          label: proj?.title || "Project Details",
          active: true,
        });
      } else {
        crumbs.push({
          id: "crumb-projects-leaf",
          label: "Projects",
          active: true,
        });
      }
      return crumbs;
    }

    if (section === "music" || section === "releases") {
      crumbs.push({
        id: "crumb-music",
        label: identity === "brand" ? "Brand Identity" : "Music & Releases",
        active: true,
      });
      return crumbs;
    }

    if (section === "brand") {
      crumbs.push({
        id: "crumb-brand",
        label: "Brand Identity",
        active: true,
      });
      return crumbs;
    }

    if (section === "content" || section === "creative") {
      crumbs.push({
        id: "crumb-content",
        label: identity === "brand" ? "Creative System" : "Content Engine",
        active: true,
      });
      return crumbs;
    }

    if (section === "documents" || section === "business") {
      if (identity === "brand") {
        crumbs.push({
          id: "crumb-brand-parent",
          label: "Brand",
          onClick: () => navTo("brand"),
        });
      }
      crumbs.push({
        id: "crumb-documents",
        label: "Business & Documents",
        active: true,
      });
      return crumbs;
    }

    if (section === "library") {
      crumbs.push({
        id: "crumb-library",
        label: "Asset Library",
        active: true,
      });
      return crumbs;
    }

    if (section === "create") {
      if (identity === "brand") {
        crumbs.push({
          id: "crumb-brand-parent",
          label: "Brand",
          onClick: () => navTo("brand"),
        });
        crumbs.push({
          id: "crumb-create",
          label: "New Document",
          active: true,
        });
      } else {
        crumbs.push({
          id: "crumb-music-parent",
          label: "Music",
          onClick: () => navTo("music"),
        });
        crumbs.push({
          id: "crumb-create",
          label: "Create Release",
          active: true,
        });
      }
      return crumbs;
    }

    if (section === "requests") {
      crumbs.push({
        id: "crumb-requests",
        label: "Creative Requests",
        active: true,
      });
      return crumbs;
    }

    if (section === "membership") {
      crumbs.push({
        id: "crumb-membership",
        label: "Membership & Tier",
        active: true,
      });
      return crumbs;
    }

    if (section === "profile") {
      crumbs.push({
        id: "crumb-profile",
        label: "Profile & Settings",
        active: true,
      });
      return crumbs;
    }

    return crumbs;
  };

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-4 py-4 grid gap-4 lg:grid-cols-[220px_1fr_300px]">
      {/* Left Navigation Sidebar */}
      <aside className="hidden lg:block rounded-3xl border border-zinc-800 bg-zinc-950/70 p-3 h-fit sticky top-20 shadow-xl">
        <div className="px-2 pt-1 pb-2 flex items-center justify-between border-b border-zinc-800/60 mb-2">
          <p className="text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">
            {identity === "brand" ? "Brand Workspace" : "Artist Workspace"}
          </p>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </div>
        <div className="space-y-1">
          {nav.map((n) => {
            const isSelected =
              section === n.key ||
              (n.key === "music" && section === "releases") ||
              (n.key === "content" && section === "creative") ||
              (n.key === "business" && section === "documents") ||
              (n.key === "create" && section === "create");
            return (
              <button
                key={n.key}
                onClick={() => navTo(n.key as ShellSection)}
                className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-red-600/20 text-white border border-red-500/30"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                {ICONS[n.key] || null}
                <span>{n.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Workspace Stage */}
      <div className="min-w-0 pb-20 lg:pb-0 space-y-3">
        {/* Workspace Top Bar & Dynamic Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Direct Home shortcut button when nested */}
            {section !== "home" && (
              <button
                id="workspace-return-hub-btn"
                onClick={() => {
                  setOpenProject(null);
                  navTo("home");
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer border border-zinc-800 shrink-0 shadow-xs"
                title="Return to Workspace Hub"
              >
                <Home className="w-3 h-3 text-red-400" />
                <span className="hidden sm:inline">Hub</span>
              </button>
            )}

            {/* Dynamic Breadcrumbs Hierarchy */}
            <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 flex-wrap text-xs">
              {getBreadcrumbs().map((crumb, idx, arr) => {
                const isLast = idx === arr.length - 1;
                return (
                  <React.Fragment key={crumb.id}>
                    {idx > 0 && (
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0 select-none" />
                    )}
                    {crumb.onClick && !isLast ? (
                      <button
                        onClick={crumb.onClick}
                        className="flex items-center gap-1 font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title={`Go to ${crumb.label}`}
                      >
                        {crumb.icon}
                        <span className="truncate max-w-[120px] sm:max-w-[180px]">{crumb.label}</span>
                      </button>
                    ) : (
                      <span
                        className={`flex items-center gap-1 font-bold ${
                          isLast ? "text-red-400" : "text-zinc-300"
                        }`}
                      >
                        {crumb.icon}
                        <span className="truncate max-w-[140px] sm:max-w-[220px]">{crumb.label}</span>
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* Active Workspace / Demo Identity Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {workspaces.length > 1 ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline text-[11px] font-semibold text-zinc-500">
                  Workspace:
                </span>
                <select
                  value={activeWorkspace?.id || ""}
                  onChange={(e) => switchWorkspace(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1 text-xs text-white font-bold cursor-pointer focus:outline-none focus:border-red-500"
                >
                  {workspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.identityType === "brand" ? "Brand" : "Artist"})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-zinc-950 border border-zinc-800 px-3 py-0.5 text-[11px] font-bold text-zinc-300">
                <Sparkles className="w-3 h-3 text-red-400" />
                <span>{activeWorkspace?.name || (identity === "brand" ? "Brand Workspace" : "Artist Workspace")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section Content Views */}
        {section === "home" && (
          <WorkspaceHome
            onNav={(t) => navTo(t as ShellSection)}
            onOpenProject={goProjects}
            onNotify={onNotify}
          />
        )}

        {section === "projects" && (
          <ProjectsView
            openId={openProject}
            onOpen={setOpenProject}
            onNotify={onNotify}
          />
        )}

        {(section === "music" || section === "releases") && (
          identity === "brand" ? (
            <BrandIdentity onNotify={onNotify} />
          ) : (
            <ReleaseBuilder onDone={goProjects} onNotify={onNotify} />
          )
        )}

        {(section === "content" || section === "creative") && (
          <CreativePackage onNotify={onNotify} />
        )}

        {section === "brand" && (
          <BrandIdentity onNotify={onNotify} />
        )}

        {(section === "business" || section === "documents") && (
          <DocumentsHub onNotify={onNotify} />
        )}

        {section === "library" && (
          <LibraryView onNotify={onNotify} />
        )}

        {section === "create" && (
          identity === "brand" ? (
            <DocumentsHub onNotify={onNotify} />
          ) : (
            <ReleaseBuilder onDone={goProjects} onNotify={onNotify} />
          )
        )}

        {section === "requests" && (
          <RequestsView onNotify={onNotify} />
        )}

        {section === "membership" && (
          <MembershipView onNotify={onNotify} />
        )}

        {section === "profile" && (
          <ProfileView />
        )}

        <div className="sm:hidden mt-4">
          <SharePanel onNotify={onNotify} />
        </div>
      </div>

      {/* Right Intelligence Sidebar */}
      <aside className="hidden lg:block space-y-4 h-fit sticky top-20">
        <StudioBoard onNotify={onNotify} />
        <SharePanel onNotify={onNotify} />
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800 px-2 py-1.5 flex items-center justify-around backdrop-blur-xl">
        {nav.slice(0, 5).map((n) => {
          const isSelected = section === n.key;
          return (
            <button
              key={n.key}
              onClick={() => navTo(n.key as ShellSection)}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl cursor-pointer min-w-[52px] ${
                isSelected ? "text-red-500 font-bold" : "text-zinc-400"
              }`}
            >
              {ICONS[n.key] || null}
              <span className="text-[10px]">{n.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
