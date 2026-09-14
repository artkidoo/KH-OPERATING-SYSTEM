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
  // Canonical Admin deep-links (§6): /admin/* all resolve to the single admin tab.
  // The Admin shell itself re-derives the specific sub-view and authorizes (a
  // customer who navigates here directly still gets the Admin access wall).
  if (normalized === "/admin" || normalized.startsWith("/admin/")) return "admin";
  // Removed/obsolete product tools — route to the explicit "removed" wall instead
  // of silently falling through to the customer workspace home. Covers DSP Pitcher
  // lineage, customer-facing Cover Studio / Mastering Inspector / Lyric Studio /
  // Presave Hub / EPK Builder / Splits Calculator / Business Studio / Content
  // Engine, and the Programmed Brain / Artist Content Brain slide-over.
  if (
    normalized === "/removed" ||
    normalized.startsWith("/removed/")
  )
    return "removed";
  const removedPaths = [
    "/cover-studio",
    "/lyrics-studio",
    "/mastering-suite",
    "/splits-calculator",
    "/presave-hub",
    "/epk-builder",
    "/content-engine",
    "/business-studio",
    "/creative-radar",
    "/creative-memory",
    "/creative-brain",
    "/artist-brain",
    "/workflow",
    "/collaboration",
    "/analytics",
    "/intel-hub",
    "/studio",
    "/studios",
    "/studio/visuals",
    "/studio/audio-inspector",
    "/studio/loudness-radar",
    "/studio/brand",
    "/studio/artist",
    "/studio/music",
    "/studio/motion",
    "/studio/documents",
    "/studio/presentations",
    "/studio/delivery",
    "/studio/queue",
    "/studio/brief",
    "/studio/files",
    "/studio/review",
    "/studio/approval",
    "/studio/production",
    "/studio/audio-qa",
    "/studio/admin",
  ];
  if (removedPaths.includes(normalized)) return "removed";
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
    case "/integrations":
      return "integrations";
    case "/production":
      return "production-center";
    case "/home":
    case "":
      return "overview";
    default:
      // Workspace-landable paths → command-center (single workspace shell).
      if (
        normalized.startsWith("/workspace") ||
        normalized.startsWith("/music") ||
        normalized.startsWith("/releases") ||
        normalized.startsWith("/brand") ||
        normalized.startsWith("/projects") ||
        normalized.startsWith("/library") ||
        normalized.startsWith("/documents") ||
        normalized.startsWith("/requests") ||
        normalized.startsWith("/membership") ||
        normalized.startsWith("/profile")
      )
        return "command-center";
      return "overview";
  }
}

// Customer-facing DIY studio tools and obsolete product concepts have been
// removed from KeedoHub. These paths no longer resolve to a real experience.
// They intentionally land in the Admin "removed tools" wall so an old bookmark
// or command-palette entry shows an honest state instead of silently dropping
// the user into the customer workspace home.
// (DSP Pitcher lineage, customer-facing Cover Studio / Mastering Inspector /
// Lyric Studio / Presave Hub / EPK Builder / Splits Calculator / Business Studio,
// and the Programmed Brain / Artist Content Brain slide-over are out of scope.)
const REMOVED_PATHS = new Set([
  "/cover-studio",
  "/lyrics-studio",
  "/mastering-suite",
  "/splits-calculator",
  "/presave-hub",
  "/epk-builder",
  "/content-engine",
  "/business-studio",
  "/creative-radar",
  "/creative-memory",
  "/creative-brain",
  "/artist-brain",
  "/workflow",
  "/collaboration",
  "/analytics",
  "/intel-hub",
  "/studio/visuals",
  "/studio/audio-inspector",
  "/studio/loudness-radar",
  "/studio/brand",
  "/studio/artist",
  "/studio/music",
  "/studio/motion",
  "/studio/documents",
  "/studio/presentations",
  "/studio/delivery",
  "/studio/queue",
  "/studio/brief",
  "/studio/files",
  "/studio/review",
  "/studio/approval",
  "/studio/production",
  "/studio/audio-qa",
  "/studio/admin",
  "/studio",
]);

export function getPathFromTab(tab: ActiveTab | string, section?: string): string {
  if (typeof tab === "string" && REMOVED_PATHS.has("/" + tab.replace(/^\//, ""))) {
    return "/removed";
  }
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
    case "production-center":
      // Production Center is admin-only. Kept for direct admin URL access; never
      // surfaced in customer navigation.
      return "/production-center";
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
