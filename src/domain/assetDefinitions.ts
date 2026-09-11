// PHASE 2 — extensible asset definition / template system (additive).
// Do NOT hardcode 100 components: register AssetDefinitions instead.
import type { Capability } from "./membership";

export type AssetCategory =
  | "SOCIAL"
  | "STREAMING"
  | "PRESS"
  | "PRINT"
  | "MOTION"
  | "MERCH"
  | "COPY"
  | "WEB"
  | "OTHER";

export interface AssetDefinition {
  id: string;
  name: string;
  category: AssetCategory;
  width: number;
  height: number;
  format: "png" | "jpg" | "txt" | "pdf";
  template: string;
  editableFields: string[];
  requiredInputs: string[];
  optionalInputs: string[];
  membershipRequirement: Capability;
  scale?: number;
  description?: string;
  aspectRatio?: string;
}

function def(d: AssetDefinition): AssetDefinition { return d; }

export const ASSET_DEFINITIONS: AssetDefinition[] = [
  // --- SOCIAL ---
  def({
    id: "ig-post",
    name: "Instagram Post",
    category: "SOCIAL",
    width: 1080,
    height: 1080,
    format: "png",
    template: "cover-hero",
    editableFields: ["title", "subtitle", "palette"],
    requiredInputs: ["releaseTitle", "artistName"],
    optionalInputs: ["artwork"],
    membershipRequirement: "basic_creative_tools",
    aspectRatio: "1:1",
    description: "Standard square social post for feeds and announcements."
  }),
  def({
    id: "ig-portrait",
    name: "Instagram Portrait",
    category: "SOCIAL",
    width: 1080,
    height: 1350,
    format: "png",
    template: "cover-hero",
    editableFields: ["title", "subtitle", "palette"],
    requiredInputs: ["releaseTitle", "artistName"],
    optionalInputs: ["artwork"],
    membershipRequirement: "basic_creative_tools",
    aspectRatio: "4:5",
    description: "High-engagement 4:5 vertical portrait feed asset."
  }),
  def({
    id: "ig-story",
    name: "Instagram Story",
    category: "SOCIAL",
    width: 1080,
    height: 1920,
    format: "png",
    template: "cover-hero",
    editableFields: ["title", "subtitle", "palette"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: ["artwork"],
    membershipRequirement: "basic_creative_tools",
    aspectRatio: "9:16",
    description: "Full-bleed 9:16 story frame with swipe up / sticker room."
  }),
  def({
    id: "tiktok-graphic",
    name: "TikTok Graphic",
    category: "SOCIAL",
    width: 1080,
    height: 1920,
    format: "png",
    template: "quote-card",
    editableFields: ["title", "palette"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: ["artwork"],
    membershipRequirement: "basic_creative_tools",
    aspectRatio: "9:16",
    description: "Vertical visual card optimized for TikTok carousels and posts."
  }),
  def({
    id: "tiktok-cover",
    name: "TikTok Cover",
    category: "SOCIAL",
    width: 1080,
    height: 1920,
    format: "png",
    template: "quote-card",
    editableFields: ["title", "palette"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: ["artwork"],
    membershipRequirement: "basic_creative_tools",
    aspectRatio: "9:16",
    description: "Clean thumbnail cover for TikTok series or sound launch."
  }),

  // --- STREAMING ---
  def({
    id: "spotify-header",
    name: "Spotify Header",
    category: "STREAMING",
    width: 2660,
    height: 1140,
    format: "png",
    template: "cover-hero",
    editableFields: ["title", "subtitle", "palette"],
    requiredInputs: ["releaseTitle", "artistName"],
    optionalInputs: ["artwork"],
    membershipRequirement: "advanced_templates",
    aspectRatio: "2.33:1",
    description: "Official Spotify for Artists desktop banner dimensions."
  }),
  def({
    id: "streaming-graphic",
    name: "Streaming Graphic",
    category: "STREAMING",
    width: 3000,
    height: 3000,
    format: "png",
    template: "cover-hero",
    editableFields: ["title", "palette"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: ["artwork"],
    membershipRequirement: "basic_creative_tools",
    scale: 1,
    aspectRatio: "1:1",
    description: "Full 3000×3000px 300DPI DSP distributor compliant master art."
  }),
  def({
    id: "yt-thumb",
    name: "YouTube Thumbnail",
    category: "STREAMING",
    width: 1280,
    height: 720,
    format: "png",
    template: "cover-hero",
    editableFields: ["title", "palette"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: ["artwork"],
    membershipRequirement: "basic_creative_tools",
    aspectRatio: "16:9",
    description: "High-contrast YouTube video and visualizer thumbnail."
  }),
  def({
    id: "yt-banner",
    name: "YouTube Banner",
    category: "STREAMING",
    width: 2560,
    height: 1440,
    format: "png",
    template: "cover-hero",
    editableFields: ["title", "palette"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: ["artwork"],
    membershipRequirement: "advanced_templates",
    aspectRatio: "16:9",
    description: "Full YouTube channel responsive art banner."
  }),

  // --- PRESS ---
  def({
    id: "press-graphic",
    name: "Press Graphic",
    category: "PRESS",
    width: 1920,
    height: 1080,
    format: "png",
    template: "quote-card",
    editableFields: ["title", "palette"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: ["artwork"],
    membershipRequirement: "basic_creative_tools",
    aspectRatio: "16:9",
    description: "Editorial press announcement asset for blogs and media."
  }),
  def({
    id: "epk-cover",
    name: "EPK Cover",
    category: "PRESS",
    width: 1200,
    height: 1600,
    format: "png",
    template: "epk-sheet",
    editableFields: ["title", "subtitle", "palette"],
    requiredInputs: ["releaseTitle", "artistName", "bio"],
    optionalInputs: ["artwork"],
    membershipRequirement: "epk_tools",
    aspectRatio: "3:4",
    description: "Front cover sheet for digital press kit presentation."
  }),
  def({
    id: "artist-profile",
    name: "Artist Profile",
    category: "PRESS",
    width: 1000,
    height: 1000,
    format: "png",
    template: "cover-hero",
    editableFields: ["title", "subtitle", "palette"],
    requiredInputs: ["artistName", "bio"],
    optionalInputs: ["artwork"],
    membershipRequirement: "basic_creative_tools",
    aspectRatio: "1:1",
    description: "Curated 1:1 square media profile card."
  }),
  def({
    id: "release-sheet",
    name: "Release Sheet",
    category: "PRESS",
    width: 2480,
    height: 3508,
    format: "png",
    template: "epk-sheet",
    editableFields: ["title", "subtitle", "palette"],
    requiredInputs: ["releaseTitle", "artistName", "bio"],
    optionalInputs: ["artwork"],
    membershipRequirement: "advanced_templates",
    aspectRatio: "1:1.41",
    description: "A4 comprehensive single-page release dossier for radio and PR."
  }),
  def({
    id: "quote-sheet",
    name: "Quote Sheet",
    category: "PRESS",
    width: 1080,
    height: 1080,
    format: "png",
    template: "quote-card",
    editableFields: ["title", "palette"],
    requiredInputs: ["lyric"],
    optionalInputs: ["artwork"],
    membershipRequirement: "basic_creative_tools",
    aspectRatio: "1:1",
    description: "Editorial quote or lyric callout square graphic."
  }),

  // --- PRINT ---
  def({
    id: "poster",
    name: "Poster",
    category: "PRINT",
    width: 1800,
    height: 2400,
    format: "png",
    template: "poster",
    editableFields: ["title", "subtitle", "palette"],
    requiredInputs: ["releaseTitle", "artistName"],
    optionalInputs: ["artwork"],
    membershipRequirement: "advanced_templates",
    aspectRatio: "3:4",
    description: "Print-ready high-resolution promotional event or release poster."
  }),
  def({
    id: "flyer-a5",
    name: "Flyer A5",
    category: "PRINT",
    width: 1748,
    height: 2480,
    format: "png",
    template: "poster",
    editableFields: ["title", "palette"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: ["artwork"],
    membershipRequirement: "basic_creative_tools",
    aspectRatio: "1:1.41",
    description: "Standard A5 handheld promotional gig / release flyer."
  }),
  def({
    id: "print-a4",
    name: "A4 Document",
    category: "PRINT",
    width: 2480,
    height: 3508,
    format: "png",
    template: "poster",
    editableFields: ["title", "subtitle", "palette"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: ["artwork"],
    membershipRequirement: "basic_creative_tools",
    aspectRatio: "1:1.41",
    description: "Standard international A4 print sheet."
  }),
  def({
    id: "print-a5",
    name: "A5 Document",
    category: "PRINT",
    width: 1748,
    height: 2480,
    format: "png",
    template: "poster",
    editableFields: ["title", "palette"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: ["artwork"],
    membershipRequirement: "basic_creative_tools",
    aspectRatio: "1:1.41",
    description: "Standard international A5 booklet / flyer print sheet."
  }),
  def({
    id: "billboard",
    name: "Billboard",
    category: "PRINT",
    width: 1400,
    height: 400,
    format: "png",
    template: "cover-hero",
    editableFields: ["title", "subtitle", "palette"],
    requiredInputs: ["releaseTitle", "artistName"],
    optionalInputs: ["artwork"],
    membershipRequirement: "advanced_templates",
    aspectRatio: "3.5:1",
    description: "Ultra-wide outdoor billboard / digital display banner."
  }),

  // --- MOTION ---
  def({
    id: "visualizer",
    name: "Visualizer Frame",
    category: "MOTION",
    width: 1920,
    height: 1080,
    format: "png",
    template: "cover-hero",
    editableFields: ["title", "palette"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: ["artwork"],
    membershipRequirement: "motion_tools",
    aspectRatio: "16:9",
    description: "Landscape 16:9 backdrop keyframe for video visualizers."
  }),
  def({
    id: "animated-artwork",
    name: "Animated Artwork",
    category: "MOTION",
    width: 1080,
    height: 1080,
    format: "png",
    template: "cover-hero",
    editableFields: ["title", "palette"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: ["artwork"],
    membershipRequirement: "motion_tools",
    aspectRatio: "1:1",
    description: "Square kinetic frame for Apple Music Canvas and Spotify loop."
  }),
  def({
    id: "lyric-visual",
    name: "Lyric Visual",
    category: "MOTION",
    width: 1080,
    height: 1920,
    format: "png",
    template: "quote-card",
    editableFields: ["title", "palette"],
    requiredInputs: ["releaseTitle", "lyric"],
    optionalInputs: ["artwork"],
    membershipRequirement: "motion_tools",
    aspectRatio: "9:16",
    description: "Vertical motion keyframe for animated lyric clips."
  }),
  def({
    id: "social-motion",
    name: "Social Motion",
    category: "MOTION",
    width: 1080,
    height: 1920,
    format: "png",
    template: "cover-hero",
    editableFields: ["title", "subtitle", "palette"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: ["artwork"],
    membershipRequirement: "motion_tools",
    aspectRatio: "9:16",
    description: "Vertical countdown and teaser card for short-form video."
  }),

  // --- MERCH ---
  def({
    id: "tshirt-mockup",
    name: "T-Shirt Mockup",
    category: "MERCH",
    width: 2000,
    height: 2000,
    format: "png",
    template: "cover-hero",
    editableFields: ["title", "palette"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: ["artwork"],
    membershipRequirement: "premium_templates",
    aspectRatio: "1:1",
    description: "Front & back graphic placement preview on streetwear tees."
  }),
  def({
    id: "hoodie-mockup",
    name: "Hoodie Mockup",
    category: "MERCH",
    width: 2000,
    height: 2000,
    format: "png",
    template: "cover-hero",
    editableFields: ["title", "palette"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: ["artwork"],
    membershipRequirement: "premium_templates",
    aspectRatio: "1:1",
    description: "Heavyweight fleece apparel mockup with chest branding."
  }),
  def({
    id: "cap-mockup",
    name: "Cap Mockup",
    category: "MERCH",
    width: 2000,
    height: 2000,
    format: "png",
    template: "cover-hero",
    editableFields: ["title", "palette"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: ["artwork"],
    membershipRequirement: "premium_templates",
    aspectRatio: "1:1",
    description: "Structured 5-panel and dad cap embroidery preview."
  }),

  // --- COPY ---
  def({
    id: "artist-bio",
    name: "Artist Bio",
    category: "COPY",
    width: 800,
    height: 1000,
    format: "txt",
    template: "copy-card",
    editableFields: ["title", "subtitle"],
    requiredInputs: ["artistName", "bio"],
    optionalInputs: [],
    membershipRequirement: "basic_creative_tools",
    description: "Editorial press bio (short, medium, and extended cuts)."
  }),
  def({
    id: "release-description",
    name: "Release Description",
    category: "COPY",
    width: 800,
    height: 1000,
    format: "txt",
    template: "copy-card",
    editableFields: ["title", "subtitle"],
    requiredInputs: ["releaseTitle", "story"],
    optionalInputs: [],
    membershipRequirement: "basic_creative_tools",
    description: "Streaming track notes and liner notes statement."
  }),
  def({
    id: "caption-copy",
    name: "Caption Copy",
    category: "COPY",
    width: 800,
    height: 1000,
    format: "txt",
    template: "copy-card",
    editableFields: ["title", "subtitle"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: [],
    membershipRequirement: "basic_creative_tools",
    description: "Social media captions, hashtags, and call-to-actions."
  }),
  def({
    id: "press-copy",
    name: "Press Copy",
    category: "COPY",
    width: 800,
    height: 1000,
    format: "txt",
    template: "copy-card",
    editableFields: ["title", "subtitle"],
    requiredInputs: ["releaseTitle", "artistName", "bio"],
    optionalInputs: [],
    membershipRequirement: "basic_creative_tools",
    description: "Standard press release pitch email and announcement copy."
  }),

  // --- WEB ---
  def({
    id: "web-hero",
    name: "Website Hero Banner",
    category: "WEB",
    width: 1920,
    height: 800,
    format: "png",
    template: "cover-hero",
    editableFields: ["title", "subtitle", "palette"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: ["artwork"],
    membershipRequirement: "basic_creative_tools",
    aspectRatio: "2.4:1",
    description: "Responsive desktop hero banner for artist or brand site."
  }),
  def({
    id: "link-bio-card",
    name: "Link-In-Bio Card",
    category: "WEB",
    width: 1080,
    height: 1920,
    format: "png",
    template: "cover-hero",
    editableFields: ["title", "palette"],
    requiredInputs: ["releaseTitle"],
    optionalInputs: ["artwork"],
    membershipRequirement: "basic_creative_tools",
    aspectRatio: "9:16",
    description: "Mobile landing backdrop for smart-link Bio profiles."
  }),
];

export function assetsForPlan(plan: "free" | "pro", identity: "artist" | "brand"): AssetDefinition[] {
  void identity;
  if (plan === "pro") return ASSET_DEFINITIONS;
  return ASSET_DEFINITIONS.filter((a) =>
    ["basic_creative_tools"].includes(a.membershipRequirement)
  );
}

export function packageCountForPlan(plan: "free" | "pro"): number {
  void plan;
  return ASSET_DEFINITIONS.length;
}

