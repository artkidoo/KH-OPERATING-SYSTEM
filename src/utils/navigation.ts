// ============================================================
// WORKSPACE NAVIGATION — Brand OS rebuild (Phase 3)
// Brand is: "Everything my brand needs to look professional and ready."
// KeedoHub is the creative partner — not a generic business manager.
// Brand cannot access artist-only tools (guarded in WorkspaceShell).
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

// BRAND NAVIGATION — exact spec order:
// Home / Brand Profile / Creative / Brand Kits / Documents /
// Presentations / Projects / Library / Requests / Membership
export const BRAND_WORKSPACE_NAV: { key: string; label: string; tab: ActiveTab }[] = [
  { key: "home", label: "Home", tab: "command-center" },
  { key: "brand-profile", label: "Brand Profile", tab: "command-center" },
  { key: "creative", label: "Creative", tab: "command-center" },
  { key: "brand-kits", label: "Brand Kits", tab: "command-center" },
  { key: "documents", label: "Documents", tab: "command-center" },
  { key: "presentations", label: "Presentations", tab: "command-center" },
  { key: "projects", label: "Projects", tab: "command-center" },
  { key: "library", label: "Library", tab: "command-center" },
  { key: "requests", label: "Requests", tab: "command-center" },
  { key: "membership", label: "Membership", tab: "command-center" },
];

// Artist-only tools — Brand workspaces must never see these.
// Acceptance test: Brand cannot access Artist Releases, Artist DNA, artist-only tools.
export const ARTIST_ONLY_KEYS = [
  "releases",
  "music",
  "asset-kits",
  "artist-os",
  "brand_dna_artist",
];

export function isArtistOnlyKey(key: string | undefined | null): boolean {
  if (!key) return false;
  return ARTIST_ONLY_KEYS.includes(key);
}

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

// Customer-facing DIY studio tools have been removed from public navigation.
// Useful engines are preserved internally and operated through the Studio
// production pipeline (admin) or the Request Centre. Do not re-expose these
// as customer navigation tabs.
export const STUDIO_TABS: ActiveTab[] = [
  "studio",
  "production-center",
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
    case "/brand-profile":
    case "/brand-kits":
    case "/presentations":
    case "/documents":
    case "/business":
    case "/business-documents":
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
    case "/artist-brain":
      return "command-center";
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
    case "/lyrics-studio":
    case "/mastering-suite":
    case "/splits-calculator":
    case "/presave-hub":
      return "studio";
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

export function getPathFromTab(tab: ActiveTab | string, section?: string): string {
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
    case "studio-admin":
      return "/studio/admin";
    case "studio-production":
      return "/studio/production";
    case "studio-audio-qa":
      return "/studio/audio-qa";
    case "studio-brand":
      return "/studio/brand";
    case "studio-artist":
      return "/studio/artist";
    case "studio-music":
      return "/studio/music";
    case "studio-motion":
      return "/studio/motion";
    case "studio-documents":
      return "/studio/documents";
    case "studio-presentations":
      return "/studio/presentations";
    case "studio-visuals":
      return "/studio/visuals";
    case "studio-delivery":
      return "/studio/delivery";
    case "studio-queue":
      return "/studio/queue";
    case "studio-brief":
      return "/studio/brief";
    case "studio-files":
      return "/studio/files";
    case "studio-review":
      return "/studio/review";
    case "studio-approval":
      return "/studio/approval";
    case "studio-inspector":
      return "/studio/audio-inspector";
    case "studio-loudness":
      return "/studio/loudness-radar";
    // Customer-facing DIY studio tools removed from public routing.
    // Internal engines preserved; accessed via Studio admin or Request Centre.
    case "cover-studio":
    case "lyrics-studio":
    case "mastering-suite":
    case "splits-calculator":
    case "presave-hub":
    case "business-studio":
    case "epk-builder":
    case "content-engine":
      // Preserve URL stability for any existing bookmarks; fall through to
      // the workspace home so the user lands in the unified workspace.
      return "/home";
    case "creative-radar":
      return "/creative-radar";
    case "creative-memory":
      return "/creative-memory";
    case "creative-brain":
    case "artist-brain":
      return "/home";
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
      return "asset-kits";
    case "/brand":
      // /brand alias consolidated into /brand-profile.
      return "brand-profile";
    case "/brand-profile":
      return "brand-profile";
    case "/brand-kits":
      return "brand-kits";
    case "/documents":
    case "/business-documents":
      return "documents";
    case "/presentations":
      return "presentations";
    case "/content":
      // Content engine removed from public navigation; route to home.
      return "home";
    case "/creative":
      return "creative";
    case "/create":
      // Create alias consolidated into releases/documents.
      return "home";
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
