// ============================================================
// WORKSPACE NAVIGATION — Phase 1 customer-facing model (Step 3 + Step 10)
// The customer experiences: MY WORKSPACE / MY PROJECTS / MY CREATIVE
// WORK / MY LIBRARY / MY REQUESTS. Internal engine names are hidden.
// ============================================================

import { ActiveTab } from "../types";

export const ARTIST_WORKSPACE_NAV: { key: string; label: string; tab: ActiveTab }[] = [
  { key: "home", label: "Home", tab: "command-center" },
  { key: "profile", label: "Profile", tab: "command-center" },
  { key: "releases", label: "Releases", tab: "command-center" },
  { key: "asset-kits", label: "Asset Kits", tab: "command-center" },
  { key: "projects", label: "Projects", tab: "command-center" },
  { key: "library", label: "Library", tab: "command-center" },
  { key: "requests", label: "Requests", tab: "command-center" },
  { key: "membership", label: "Membership", tab: "command-center" },
];

export const BRAND_WORKSPACE_NAV: { key: string; label: string; tab: ActiveTab }[] = [
  { key: "home", label: "Home", tab: "command-center" },
  { key: "brand", label: "Brand", tab: "command-center" },
  { key: "creative", label: "Creative", tab: "command-center" },
  { key: "business", label: "Business", tab: "command-center" },
  { key: "documents", label: "Documents", tab: "command-center" },
  { key: "library", label: "Library", tab: "command-center" },
  { key: "projects", label: "Projects", tab: "command-center" },
  { key: "requests", label: "Requests", tab: "command-center" },
  { key: "membership", label: "Membership", tab: "command-center" },
  { key: "profile", label: "Profile", tab: "command-center" },
];

export function workspaceNavFor(identityType: string | undefined | null): { key: string; label: string; tab: ActiveTab }[] {
  return identityType === "brand" ? BRAND_WORKSPACE_NAV : ARTIST_WORKSPACE_NAV;
}

export const WORKSPACE_TABS: ActiveTab[] = [
  "command-center",
  "requests",
  "membership",
  "profile",
  "workflow",
  "collaboration",
  "analytics",
  "intel-hub",
  "creative-memory",
  // NOTE: "production-center" is intentionally NOT in customer navigation.
  // It is admin-only and accessible via direct URL for admin users.
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
    case "/artist-os":
    case "/brand-os":
    case "/projects":
    case "/project-console":
    case "/library":
    case "/resource-vault":
    case "/music":
    case "/releases":
    case "/brand":
    case "/documents":
    case "/business":
    case "/content":
    case "/creative":
    case "/create":
    case "/requests":
    case "/membership":
    case "/profile":
      return "command-center";
    // NOTE: "/production-center" is admin-only. Do not add to public path routing.
    // Admin users can still access via direct URL — the App.tsx renders the
    // ProductionCenter component only after checking user.systemRole.
    case "/production":
      return "production-center";
    case "/workflow":
      return "workflow";
    case "/collaboration":
      return "collaboration";
    case "/analytics":
      return "analytics";
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

export function getPathFromTab(tab: ActiveTab, section?: string): string {
  switch (tab) {
    case "overview":
      return "/home";
    case "command-center": {
      if (section === "projects") return "/projects";
      if (section === "library") return "/library";
      if (section === "music" || section === "releases") return "/releases";
      if (section === "asset-kits" || section === "content" || section === "creative") return "/asset-kits";
      if (section === "brand") return "/brand";
      if (section === "documents" || section === "business") return "/documents";
      if (section === "content" || section === "creative") return "/content";
      if (section === "create") return "/create";
      if (section === "requests") return "/requests";
      if (section === "membership") return "/membership";
      if (section === "profile") return "/profile";
      return "/workspace";
    }
    case "workspace-hub":
      return "/workspace";
    case "artist-os":
      return "/music";
    case "brand-os":
      return "/brand";
    case "project-console":
      return "/projects";
    case "resource-vault":
      return "/library";
    case "requests":
      return "/requests";
    case "membership":
      return "/membership";
    case "profile":
      return "/profile";
    // NOTE: Production Center is admin-only. While we keep the path mapping
    // for direct URL access by admin users, it should never appear in customer nav.
    case "production-center":
      return "/production-center";
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

export function getSectionFromPath(path: string): string {
  const normalized = path.toLowerCase().replace(/\/$/, "");
  switch (normalized) {
    case "/projects":
    case "/project-console":
      return "projects";
    case "/library":
    case "/resource-vault":
      return "library";
    case "/releases":
    case "/music":
    case "/artist-os":
      return "releases";
    case "/asset-kits":
    case "/content":
    case "/creative":
      return "asset-kits";
    case "/create":
      return "create";
    case "/requests":
      return "requests";
    case "/membership":
      return "membership";
    case "/profile":
      return "profile";
    case "/workspace":
    case "/workspace-hub":
    case "/command-center":
    default:
      return "home";
  }
}
