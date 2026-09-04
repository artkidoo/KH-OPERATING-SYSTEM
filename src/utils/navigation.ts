import { ActiveTab } from "../types";

export const WORKSPACE_TABS: ActiveTab[] = [
  "command-center",
  "workspace-hub",
  "artist-os",
  "brand-os",
  "workflow",
  "collaboration",
  "analytics",
  "project-console",
  "resource-vault",
  "intel-hub",
  "creative-memory",
  "artist-brain",
  "creative-brain",
];

export const STUDIO_TABS: ActiveTab[] = [
  "studio",
  "cover-studio",
  "lyrics-studio",
  "business-studio",
  "mastering-suite",
  "dsp-pitcher",
  "splits-calculator",
  "presave-hub",
  "epk-builder",
  "content-engine",
];

export function isWorkspaceTab(tab: string | ActiveTab | undefined | null): boolean {
  if (!tab) return false;
  return WORKSPACE_TABS.includes(tab as ActiveTab);
}

export function isStudioTab(tab: string | ActiveTab | undefined | null): boolean {
  if (!tab) return false;
  return STUDIO_TABS.includes(tab as ActiveTab);
}

export function getTabFromPath(path: string): ActiveTab {
  const normalized = path.toLowerCase().replace(/\/$/, "");
  switch (normalized) {
    case "/about":
      return "about";
    case "/vision":
      return "vision";
    case "/story":
      return "story";
    case "/contact":
      return "contact";
    case "/faq":
      return "faq";
    case "/help":
      return "help";
    case "/docs":
      return "docs";
    case "/resources":
      return "resources";
    case "/privacy":
      return "privacy";
    case "/terms":
      return "terms";
    case "/security":
      return "security";
    case "/forum":
      return "forum";
    case "/trending":
      return "trending";
    case "/journal":
    case "/blog":
      return "journal";
    case "/workspace":
    case "/workspace-hub":
    case "/command-center":
      return "command-center";
    case "/artist-os":
      return "artist-os";
    case "/brand-os":
      return "brand-os";
    case "/workflow":
      return "workflow";
    case "/collaboration":
      return "collaboration";
    case "/analytics":
      return "analytics";
    case "/project-console":
      return "project-console";
    case "/resource-vault":
      return "resource-vault";
    case "/intel-hub":
      return "intel-hub";
    case "/creative-brain":
      return "creative-brain";
    case "/artist-brain":
      return "artist-brain";
    case "/creative-memory":
      return "creative-memory";
    case "/creative-radar":
      return "creative-radar";
    case "/studios":
    case "/studio":
      return "studio";
    case "/business-documents":
    case "/business-studio":
      return "business-studio";
    case "/cover-studio":
      return "cover-studio";
    case "/lyrics-studio":
      return "lyrics-studio";
    case "/mastering-suite":
      return "mastering-suite";
    case "/dsp-pitcher":
      return "dsp-pitcher";
    case "/splits-calculator":
      return "splits-calculator";
    case "/presave-hub":
      return "presave-hub";
    case "/epk-builder":
      return "epk-builder";
    case "/content-engine":
      return "content-engine";
    case "/admin":
      return "admin";
    case "/integrations":
      return "integrations";
    case "/home":
    case "":
      return "overview";
    default:
      return "overview";
  }
}

export function getPathFromTab(tab: ActiveTab): string {
  switch (tab) {
    case "overview":
      return "/home";
    case "command-center":
    case "workspace-hub":
      return "/workspace";
    case "artist-os":
      return "/artist-os";
    case "brand-os":
      return "/brand-os";
    case "studio":
      return "/studios";
    case "cover-studio":
      return "/cover-studio";
    case "lyrics-studio":
      return "/lyrics-studio";
    case "mastering-suite":
      return "/mastering-suite";
    case "dsp-pitcher":
      return "/dsp-pitcher";
    case "splits-calculator":
      return "/splits-calculator";
    case "presave-hub":
      return "/presave-hub";
    case "business-studio":
      return "/business-documents";
    case "epk-builder":
      return "/epk-builder";
    case "content-engine":
      return "/content-engine";
    case "creative-radar":
      return "/creative-radar";
    case "creative-memory":
      return "/creative-memory";
    case "creative-brain":
      return "/creative-brain";
    case "artist-brain":
      return "/artist-brain";
    case "workflow":
      return "/workflow";
    case "collaboration":
      return "/collaboration";
    case "analytics":
      return "/analytics";
    case "project-console":
      return "/project-console";
    case "resource-vault":
      return "/resource-vault";
    case "intel-hub":
      return "/intel-hub";
    case "admin":
      return "/admin";
    case "integrations":
      return "/integrations";
    case "journal":
      return "/journal";
    case "trending":
      return "/trending";
    case "forum":
      return "/forum";
    case "about":
      return "/about";
    case "vision":
      return "/vision";
    case "story":
      return "/story";
    case "contact":
      return "/contact";
    case "faq":
      return "/faq";
    case "help":
      return "/help";
    case "docs":
      return "/docs";
    case "resources":
      return "/resources";
    case "privacy":
      return "/privacy";
    case "terms":
      return "/terms";
    case "security":
      return "/security";
    default:
      return "/home";
  }
}
