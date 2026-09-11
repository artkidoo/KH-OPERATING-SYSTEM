// ============================================================
// SHARED STUDIO SERVICES CONFIGURATION
// Configuration-driven definition for all 16 Artist & Brand Services
// ============================================================

export type ServiceAudience = "artist" | "brand";

export type InternalStudioType =
  | "artwork"
  | "content"
  | "motion"
  | "lyrics"
  | "epk"
  | "document"
  | "brand_asset"
  | "template_engine"
  | "export_engine";

export interface ServiceDeliverableTemplate {
  id: string;
  title: string;
  format: string;
  specs: string;
  category: "artwork" | "video" | "document" | "brand" | "audio" | "motion" | "social" | "other";
  downloadAllowedByDefault?: boolean;
}

export interface ServiceRevisionRules {
  maxStandardRevisions: number;
  turnaroundHours: number;
  guidelines: string;
}

export interface ServiceDeliveryStructure {
  defaultFolder: string;
  projectSection: string;
  targetCategories: string[];
  tags: string[];
}

export interface StudioServiceConfig {
  id: string;
  serviceName: string;
  audience: ServiceAudience;
  tagline: string;
  description: string;
  pricing: {
    priceUsd: string;
    priceNgn: string;
    budgetNumber: number;
  };
  turnaround: string;
  deliverables: ServiceDeliverableTemplate[];
  requiredBriefFields: string[];
  optionalFields: string[];
  formats: string[];
  assignedProductionStudio: InternalStudioType;
  revisionRules: ServiceRevisionRules;
  deliveryStructure: ServiceDeliveryStructure;
  idealFor: string;
}

export const STUDIO_SERVICES_CONFIG: StudioServiceConfig[] = [
  // ==========================================
  // ARTIST CATALOG (8 Services)
  // ==========================================
  {
    id: "artist_release_creative",
    serviceName: "Release Creative",
    audience: "artist",
    tagline: "End-to-end creative direction & release visual roadmap",
    description: "Complete release creative direction for singles, EPs, and albums. We codify your visual concept, narrative hook, color scripts, and release aesthetic roadmap.",
    pricing: { priceUsd: "$350", priceNgn: "₦320,000", budgetNumber: 350 },
    turnaround: "3-5 Business Days",
    idealFor: "Lead singles, Debut EPs, Full albums, Major rollouts",
    assignedProductionStudio: "content",
    formats: ["16:9 Presentation PDF", "Figma Asset System", "Moodboard & Style Matrix"],
    requiredBriefFields: ["title", "description", "genre", "targetDate"],
    optionalFields: ["visualReferences", "colorPreferences", "narrativeConcept"],
    revisionRules: {
      maxStandardRevisions: 2,
      turnaroundHours: 48,
      guidelines: "Revisions cover color grading, typography adjustments, and layout composition.",
    },
    deliveryStructure: {
      defaultFolder: "Deliveries/Creative Direction",
      projectSection: "Creative Direction",
      targetCategories: ["document", "artwork"],
      tags: ["creative-direction", "release-roadmap", "style-guide"],
    },
    deliverables: [
      { id: "del_rc_1", title: "Release Creative Direction Deck", format: "PDF", specs: "16:9 Presentation PDF (15-20 slides)", category: "document", downloadAllowedByDefault: true },
      { id: "del_rc_2", title: "Color & Mood Bible with Hex Tokens", format: "PDF / Figma", specs: "Design tokens & contrast matrix", category: "artwork", downloadAllowedByDefault: true },
      { id: "del_rc_3", title: "Multi-Phase Asset Roadmap", format: "PDF", specs: "Pre-save, Release week & Post-drop roadmap", category: "document", downloadAllowedByDefault: true },
      { id: "del_rc_4", title: "Aesthetic Stems & Layout Guidelines", format: "ZIP", specs: "Vector stems, textures & typography pairings", category: "artwork", downloadAllowedByDefault: true },
    ],
  },
  {
    id: "artist_cover_artwork",
    serviceName: "Cover Artwork",
    audience: "artist",
    tagline: "DSP-compliant 3000×3000px master artwork & canvas visualizers",
    description: "High-impact cover art engineered for Spotify, Apple Music, and vinyl runs. Includes front cover, back tracklist, and animated 9:16 Canvas loops.",
    pricing: { priceUsd: "$280", priceNgn: "₦250,000", budgetNumber: 280 },
    turnaround: "48-72 Hours",
    idealFor: "DSP Singles, EPs, Deluxe editions, Beat tapes",
    assignedProductionStudio: "artwork",
    formats: ["3000×3000px RGB & CMYK", "Apple Digital Masters Compliant", "Spotify Canvas (3-8s loop)"],
    requiredBriefFields: ["title", "artistName", "description", "aspectRatio"],
    optionalFields: ["moodboard", "lyricsSnippets", "typographyStyle"],
    revisionRules: {
      maxStandardRevisions: 2,
      turnaroundHours: 24,
      guidelines: "Covers font styling, color grade adjustments, and secondary texture tweaks.",
    },
    deliveryStructure: {
      defaultFolder: "Deliveries/Cover Art",
      projectSection: "Artwork & Visuals",
      targetCategories: ["artwork", "cover", "video"],
      tags: ["cover-art", "dsp-ready", "spotify-canvas"],
    },
    deliverables: [
      { id: "del_ca_1", title: "3000×3000px 300DPI Master Artwork", format: "PNG / JPG", specs: "3000×3000px RGB 300DPI uncompressed", category: "artwork", downloadAllowedByDefault: true },
      { id: "del_ca_2", title: "Spotify Canvas 9:16 Video Loop", format: "MP4", specs: "1080×1920px 60fps 5-8s seamless loop", category: "video", downloadAllowedByDefault: true },
      { id: "del_ca_3", title: "Tracklist Back Cover Layout", format: "PNG / PDF", specs: "3000×3000px 300DPI with vinyl barcode dieline", category: "artwork", downloadAllowedByDefault: true },
      { id: "del_ca_4", title: "Social Promo Thumbnail Suite", format: "ZIP", specs: "1:1, 4:5, and 16:9 promotional cuts", category: "social", downloadAllowedByDefault: true },
    ],
  },
  {
    id: "artist_music_visuals",
    serviceName: "Music Visuals",
    audience: "artist",
    tagline: "Kinetic visualizers, stage loops & vertical video teasers",
    description: "Engaging motion visualizers, concert stage LED loops, audio spectrum videos, and high-retention vertical teasers for TikTok and Instagram Reels.",
    pricing: { priceUsd: "$400", priceNgn: "₦360,000", budgetNumber: 400 },
    turnaround: "3-4 Business Days",
    idealFor: "YouTube audio streams, Tour backdrops, TikTok sound teasers",
    assignedProductionStudio: "motion",
    formats: ["ProRes 422 & H.264 MP4", "24/60fps High Frame Rate", "Alpha Channel Transparent Elements"],
    requiredBriefFields: ["title", "audioTrackUrl", "videoPacing", "targetResolution"],
    optionalFields: ["keyLyrics", "visualThemes", "referenceVideos"],
    revisionRules: {
      maxStandardRevisions: 2,
      turnaroundHours: 48,
      guidelines: "Motion pacing, color filter tweaks, and timing sync adjustments.",
    },
    deliveryStructure: {
      defaultFolder: "Deliveries/Motion & Visuals",
      projectSection: "Motion & Video",
      targetCategories: ["video", "motion"],
      tags: ["music-visuals", "kinetic-motion", "stage-loops"],
    },
    deliverables: [
      { id: "del_mv_1", title: "16:9 Full HD Kinetic Visualizer Video", format: "MP4 (H.264)", specs: "1920×1080 60fps Full Length YouTube Stream", category: "video", downloadAllowedByDefault: true },
      { id: "del_mv_2", title: "9:16 Vertical Reel & Story Cut", format: "MP4", specs: "1080×1920 60fps 30s High-Energy Hook", category: "video", downloadAllowedByDefault: true },
      { id: "del_mv_3", title: "Seamless Concert Stage Backdrop Stems", format: "ProRes 422", specs: "Seamless LED wall projection loop", category: "motion", downloadAllowedByDefault: true },
      { id: "del_mv_4", title: "Audio Waveform Spectrum Overlay Stems", format: "Transparent MOV", specs: "Alpha channel spectrum overlay elements", category: "motion", downloadAllowedByDefault: true },
    ],
  },
  {
    id: "artist_social_content",
    serviceName: "Social Content",
    audience: "artist",
    tagline: "Multi-channel release countdowns, carousels & banners",
    description: "Cohesive multi-channel promo graphics, release day swipe-through carousels, artist banners, and fan engagement graphic suites.",
    pricing: { priceUsd: "$240", priceNgn: "₦220,000", budgetNumber: 240 },
    turnaround: "48 Hours",
    idealFor: "Pre-save campaigns, Release week velocity, Tour dates",
    assignedProductionStudio: "content",
    formats: ["1080×1350px 4:5 Carousels", "1080×1920px 9:16 Stories", "Figma / PNG Package"],
    requiredBriefFields: ["title", "releaseDate", "channels", "copyNotes"],
    optionalFields: ["quoteCards", "artistPhotos", "preSaveLink"],
    revisionRules: {
      maxStandardRevisions: 2,
      turnaroundHours: 24,
      guidelines: "Text copy updates, banner resizing, and asset alignments.",
    },
    deliveryStructure: {
      defaultFolder: "Deliveries/Social Content",
      projectSection: "Social & Marketing",
      targetCategories: ["social", "artwork"],
      tags: ["social-pack", "carousels", "banner-suite"],
    },
    deliverables: [
      { id: "del_asc_1", title: "10× Release Day Carousel Slide Graphics", format: "PNG / JPG", specs: "1080×1350px 4:5 optimized for Instagram", category: "social", downloadAllowedByDefault: true },
      { id: "del_asc_2", title: "YouTube, Spotify & X Banner Suite", format: "PNG", specs: "Exact DSP & social header pixel specs", category: "social", downloadAllowedByDefault: true },
      { id: "del_asc_3", title: "Story Countdown & Out Now Templates", format: "PNG / MP4", specs: "1080×1920px 9:16 animated & static frames", category: "social", downloadAllowedByDefault: true },
      { id: "del_asc_4", title: "Fan Engagement Quote & Lyric Graphic Cards", format: "PNG", specs: "1080×1080px square shareable cards", category: "social", downloadAllowedByDefault: true },
    ],
  },
  {
    id: "artist_epk",
    serviceName: "EPK",
    audience: "artist",
    tagline: "Curated Electronic Press Kit, one-sheet PDF & curator pitch deck",
    description: "Curated Electronic Press Kit, high-conversion one-sheet PDF, streaming analytics showcase, and press-ready photography layout tailored for journalists and DSP playlist editors.",
    pricing: { priceUsd: "$300", priceNgn: "₦270,000", budgetNumber: 300 },
    turnaround: "2-3 Business Days",
    idealFor: "Media pitching, Festival booking, Label scouting, DSP playlisting",
    assignedProductionStudio: "epk",
    formats: ["Vector Interactive PDF", "Clickable DSP & Social Links", "Letter & A4 Print Bleeds"],
    requiredBriefFields: ["artistBio", "keyAchievements", "streamingHighlights", "contactEmail"],
    optionalFields: ["hiResPhotos", "upcomingDates", "pressQuotes"],
    revisionRules: {
      maxStandardRevisions: 2,
      turnaroundHours: 36,
      guidelines: "Copy corrections, metric updates, and link destination updates.",
    },
    deliveryStructure: {
      defaultFolder: "Deliveries/EPK & Press",
      projectSection: "Press & EPK",
      targetCategories: ["epk", "document"],
      tags: ["press-kit", "one-sheet", "curator-deck"],
    },
    deliverables: [
      { id: "del_aepk_1", title: "Interactive Press Kit Deck", format: "Interactive PDF", specs: "12-page interactive PDF with active audio/DSP links", category: "document", downloadAllowedByDefault: true },
      { id: "del_aepk_2", title: "Print-Ready Press One-Sheet", format: "PDF (CMYK)", specs: "A4 / US Letter 300DPI print bleed", category: "document", downloadAllowedByDefault: true },
      { id: "del_aepk_3", title: "Curator & Editorial Pitch Deck", format: "PDF", specs: "8-slide DSP & media pitch showcase", category: "document", downloadAllowedByDefault: true },
      { id: "del_aepk_4", title: "Media Hi-Res Asset & Photo Repository", format: "ZIP", specs: "Curated hi-res press photos & vector logos", category: "artwork", downloadAllowedByDefault: true },
    ],
  },
  {
    id: "artist_lyrics_visuals",
    serviceName: "Lyrics / Lyric Visuals",
    audience: "artist",
    tagline: "Kinetic typography lyric videos & synchronized lyric cards",
    description: "Typography-driven kinetic lyric videos, synchronized social lyric snippets, and karaoke-ready visual cards designed to drive audio familiarity and sing-alongs.",
    pricing: { priceUsd: "$290", priceNgn: "₦260,000", budgetNumber: 290 },
    turnaround: "48-72 Hours",
    idealFor: "Focus tracks, Fan favorite singles, Viral TikTok sound snippets",
    assignedProductionStudio: "lyrics",
    formats: ["1080p / 4K MP4", "Custom Font Kinetic Motion", "LRC Synchronized Timestamp"],
    requiredBriefFields: ["lyricsText", "audioFileUrl", "motionStyle"],
    optionalFields: ["timeCodes", "customFontPreferences"],
    revisionRules: {
      maxStandardRevisions: 2,
      turnaroundHours: 24,
      guidelines: "Spelling corrections, typography font switches, timing micro-adjustments.",
    },
    deliveryStructure: {
      defaultFolder: "Deliveries/Lyrics",
      projectSection: "Lyrics & Audio",
      targetCategories: ["video", "document", "motion"],
      tags: ["kinetic-lyrics", "lyric-video", "lrc-file"],
    },
    deliverables: [
      { id: "del_alv_1", title: "Full Song Kinetic Lyric Video", format: "MP4 (1080p)", specs: "1920×1080 60fps Full Song Typography Video", category: "video", downloadAllowedByDefault: true },
      { id: "del_alv_2", title: "Short-Form Chorus Lyric Snippet", format: "MP4 (9:16)", specs: "1080×1920 60fps 30s Chorus Cut for TikTok/Reels", category: "video", downloadAllowedByDefault: true },
      { id: "del_alv_3", title: "5× Typography Lyric Quote Art Cards", format: "PNG Bundle", specs: "1080×1080px shareable lyric quote cards", category: "artwork", downloadAllowedByDefault: true },
      { id: "del_alv_4", title: "Synchronized Time-Coded LRC File", format: "LRC", specs: "DSP & karaoke standard synchronized timestamp file", category: "document", downloadAllowedByDefault: true },
    ],
  },
  {
    id: "artist_brand_kit",
    serviceName: "Artist Brand Kit",
    audience: "artist",
    tagline: "Artist logotype mark, signature typography & brand guide",
    description: "Complete artist visual identity system: bespoke logotype mark, vector signature icon, custom color tokens, font pairing system, and brand usage guidelines.",
    pricing: { priceUsd: "$450", priceNgn: "₦400,000", budgetNumber: 450 },
    turnaround: "3-5 Business Days",
    idealFor: "Emerging & established artists building recognizable iconography",
    assignedProductionStudio: "brand_asset",
    formats: ["SVG, AI, EPS, PNG Vectors", "Brand Tokens JSON", "High-Resolution Brand Guidelines PDF"],
    requiredBriefFields: ["artistName", "aestheticKeywords", "targetAudience"],
    optionalFields: ["inspirationalBrands", "existingLogos", "merchIdeas"],
    revisionRules: {
      maxStandardRevisions: 3,
      turnaroundHours: 48,
      guidelines: "Vector mark refinements, color palette variations, and font adjustments.",
    },
    deliveryStructure: {
      defaultFolder: "Deliveries/Artist Brand Kit",
      projectSection: "Brand & Identity",
      targetCategories: ["brand", "document", "artwork"],
      tags: ["artist-logo", "brand-guide", "typography-system"],
    },
    deliverables: [
      { id: "del_abk_1", title: "Primary & Secondary Vector Artist Marks", format: "SVG / EPS / PNG", specs: "Fully scalable vector logos in dark, light, and monochrome", category: "brand", downloadAllowedByDefault: true },
      { id: "del_abk_2", title: "Artist Signature / Monogram Vector", format: "SVG / PNG", specs: "Secondary icon & watermark monogram mark", category: "brand", downloadAllowedByDefault: true },
      { id: "del_abk_3", title: "Curated Typography System & Font Tokens", format: "ZIP / JSON", specs: "Web & print font pairings with license guidance", category: "document", downloadAllowedByDefault: true },
      { id: "del_abk_4", title: "Artist Brand Bible & Styling Guide", format: "PDF", specs: "16-page comprehensive styling & brand rules guide", category: "document", downloadAllowedByDefault: true },
    ],
  },
  {
    id: "artist_release_asset_packages",
    serviceName: "Release Asset Packages",
    audience: "artist",
    tagline: "360 turnkey bundle: master art + motion + 25 social assets + EPK",
    description: "All-in-one comprehensive production package: master artwork, Spotify canvas visualizer, 25 social promotion graphics, lyric video cut, and press one-sheet in a single unified delivery.",
    pricing: { priceUsd: "$750", priceNgn: "₦680,000", budgetNumber: 750 },
    turnaround: "5-7 Business Days",
    idealFor: "Priority singles, Milestone album launches, Label rollouts",
    assignedProductionStudio: "artwork",
    formats: ["Comprehensive Multi-Format Master Zip", "300DPI Print & 4K Digital", "DSP Compliant"],
    requiredBriefFields: ["releaseTitle", "artistName", "releaseDate", "trackAudioUrl", "visualDirection"],
    optionalFields: ["pressQuotes", "creditsList", "merchNotes"],
    revisionRules: {
      maxStandardRevisions: 3,
      turnaroundHours: 48,
      guidelines: "Unified review cycle covering all deliverable components.",
    },
    deliveryStructure: {
      defaultFolder: "Deliveries/Release 360 Package",
      projectSection: "All Sections",
      targetCategories: ["cover", "video", "social", "epk", "document"],
      tags: ["turnkey-bundle", "360-release", "master-package"],
    },
    deliverables: [
      { id: "del_rap_1", title: "Master Artwork (Front + Tracklist Back)", format: "PNG / PDF", specs: "3000×3000px 300DPI Master Cover & Back Cover", category: "artwork", downloadAllowedByDefault: true },
      { id: "del_rap_2", title: "Spotify 9:16 Canvas + 16:9 Visualizer", format: "MP4 Bundle", specs: "Seamless 9:16 Canvas Loop + 16:9 YouTube Stream", category: "video", downloadAllowedByDefault: true },
      { id: "del_rap_3", title: "25× Social Promotion Multi-Channel Suite", format: "ZIP", specs: "Carousels, story countdowns, banners & quote cards", category: "social", downloadAllowedByDefault: true },
      { id: "del_rap_4", title: "Chorus Kinetic Lyric Snippet (9:16)", format: "MP4", specs: "1080×1920 30s High-Retention Lyric Motion Reel", category: "video", downloadAllowedByDefault: true },
      { id: "del_rap_5", title: "Complete Press One-Sheet & Pitch Deck", format: "PDF", specs: "Curator pitch deck and print-ready press sheet", category: "document", downloadAllowedByDefault: true },
      { id: "del_rap_6", title: "Cloud Asset Archive & Ready-to-Post Manifest", format: "ZIP", specs: "Master archive organized with scheduled captions", category: "document", downloadAllowedByDefault: true },
    ],
  },

  // ==========================================
  // BRAND CATALOG (8 Services)
  // ==========================================
  {
    id: "brand_identity",
    serviceName: "Brand Identity",
    audience: "brand",
    tagline: "Corporate vector logo marks, color tokens & design guidelines",
    description: "Comprehensive visual identity system for companies, startups, and creators: primary vector logos, monogram marks, color hierarchy, typography rules, and detailed brand guidelines.",
    pricing: { priceUsd: "$550", priceNgn: "₦500,000", budgetNumber: 550 },
    turnaround: "4-6 Business Days",
    idealFor: "Startups, Rebrands, Agencies, E-commerce, Venture funds",
    assignedProductionStudio: "brand_asset",
    formats: ["Vector SVG, EPS, PDF, PNG", "Design Tokens JSON", "Print & Web Color Profiles"],
    requiredBriefFields: ["companyName", "industry", "targetMarket", "coreValues"],
    optionalFields: ["competitors", "aestheticReferences", "colorPreferences"],
    revisionRules: {
      maxStandardRevisions: 3,
      turnaroundHours: 48,
      guidelines: "Exploratory concept iterations followed by vector precision refinements.",
    },
    deliveryStructure: {
      defaultFolder: "Deliveries/Brand Identity",
      projectSection: "Brand Guidelines",
      targetCategories: ["brand", "document", "artwork"],
      tags: ["brand-identity", "vector-logo", "brand-bible"],
    },
    deliverables: [
      { id: "del_bi_1", title: "Primary, Secondary & Icon Vector Marks", format: "SVG / EPS / PNG", specs: "Full responsive vector logo suite (horizontal, stacked, icon)", category: "brand", downloadAllowedByDefault: true },
      { id: "del_bi_2", title: "Color Palette Tokens & Contrast Matrix", format: "JSON / PDF", specs: "Hex, RGB, CMYK, Pantone color tokens & WCAG AA matrix", category: "brand", downloadAllowedByDefault: true },
      { id: "del_bi_3", title: "Typography Pairing Hierarchy System", format: "PDF / Web Fonts", specs: "Display, heading, and body typography pairings", category: "document", downloadAllowedByDefault: true },
      { id: "del_bi_4", title: "Comprehensive Brand Guidelines Book", format: "PDF", specs: "24-page executive brand manual and asset usage rules", category: "document", downloadAllowedByDefault: true },
    ],
  },
  {
    id: "brand_social_content",
    serviceName: "Social Content",
    audience: "brand",
    tagline: "High-conversion carousel packs, banner suites & ad creatives",
    description: "Professional multi-platform brand social kits: educational carousel templates, testimonial graphics, leadership quote cards, and brand awareness reels for LinkedIn, Instagram, and X.",
    pricing: { priceUsd: "$280", priceNgn: "₦250,000", budgetNumber: 280 },
    turnaround: "48 Hours",
    idealFor: "B2B SaaS, Professional services, Consumer brands, Product launches",
    assignedProductionStudio: "content",
    formats: ["Figma Components", "1080×1350px Carousel Slides", "1080×1920px Stories"],
    requiredBriefFields: ["brandName", "platforms", "contentThemes", "targetAction"],
    optionalFields: ["brandColors", "existingTemplates", "copywritingGuidelines"],
    revisionRules: {
      maxStandardRevisions: 2,
      turnaroundHours: 24,
      guidelines: "Graphic layout, text alignment, and corporate color accuracy.",
    },
    deliveryStructure: {
      defaultFolder: "Deliveries/Brand Social",
      projectSection: "Marketing & Ads",
      targetCategories: ["social", "artwork"],
      tags: ["brand-social", "b2b-carousels", "banner-kit"],
    },
    deliverables: [
      { id: "del_bsc_1", title: "12× Branded Carousel Templates", format: "PNG / Figma", specs: "1080×1350px 4:5 educational & product slides", category: "social", downloadAllowedByDefault: true },
      { id: "del_bsc_2", title: "LinkedIn & Twitter Header Banner Suite", format: "PNG", specs: "High-resolution corporate social header suite", category: "social", downloadAllowedByDefault: true },
      { id: "del_bsc_3", title: "Story & Reel Motion Covers", format: "PNG / MP4", specs: "1080×1920px vertical cover frames", category: "social", downloadAllowedByDefault: true },
      { id: "del_bsc_4", title: "Editable Figma Layout File", format: "FIG", specs: "Reusable component design system in Figma", category: "document", downloadAllowedByDefault: true },
    ],
  },
  {
    id: "brand_presentations",
    serviceName: "Presentations",
    audience: "brand",
    tagline: "Investor pitch decks, sales presentations & keynote slide suites",
    description: "High-stakes presentation design: investor pitch decks, executive sales decks, board meeting slides, and keynote presentations engineered to win confidence and funding.",
    pricing: { priceUsd: "$380", priceNgn: "₦340,000", budgetNumber: 380 },
    turnaround: "3-5 Business Days",
    idealFor: "Fundraising seed/Series A, Enterprise sales, Conference keynotes",
    assignedProductionStudio: "document",
    formats: ["16:9 Widescreen PDF & Figma", "Keynote / PowerPoint Formats", "Vector Diagram Assets"],
    requiredBriefFields: ["presentationGoal", "slideOutline", "targetAudience"],
    optionalFields: ["dataMetrics", "financialCharts", "speakerNotes"],
    revisionRules: {
      maxStandardRevisions: 3,
      turnaroundHours: 36,
      guidelines: "Slide typography, diagram adjustments, and pacing edits.",
    },
    deliveryStructure: {
      defaultFolder: "Deliveries/Presentations",
      projectSection: "Presentations & Decks",
      targetCategories: ["document"],
      tags: ["pitch-deck", "investor-slides", "keynote"],
    },
    deliverables: [
      { id: "del_bp_1", title: "20-Slide Master Keynote/Pitch Deck", format: "PDF / PPTX", specs: "16:9 Widescreen investor-grade presentation deck", category: "document", downloadAllowedByDefault: true },
      { id: "del_bp_2", title: "Custom Visual Infographics & Charts", format: "SVG / PNG", specs: "Bespoke vector charts and market diagram graphics", category: "artwork", downloadAllowedByDefault: true },
      { id: "del_bp_3", title: "Editable Slide Template System", format: "Figma / PPTX", specs: "Reusable slide layouts, stat cards, and team grids", category: "document", downloadAllowedByDefault: true },
      { id: "del_bp_4", title: "Light & Dark Mode Master Themes", format: "PDF", specs: "High-contrast dark stage mode & clean print light mode", category: "document", downloadAllowedByDefault: true },
    ],
  },
  {
    id: "brand_business_documents",
    serviceName: "Business Documents",
    audience: "brand",
    tagline: "Letterheads, proposals, invoices, receipts & company profiles",
    description: "Executive stationery suite built from your Brand Profile: professional letterheads, formal business proposals, client quotations, invoices, receipts, and HTML email signatures.",
    pricing: { priceUsd: "$180", priceNgn: "₦160,000", budgetNumber: 180 },
    turnaround: "24-48 Hours",
    idealFor: "Operating businesses, Consultancies, Agencies, Service firms",
    assignedProductionStudio: "document",
    formats: ["Print-Ready CMYK PDF", "A4 & US Letter Dielines", "Responsive HTML Signature"],
    requiredBriefFields: ["companyInfo", "documentTypes", "contactDetails"],
    optionalFields: ["bankingDetails", "taxId", "corporateTagline"],
    revisionRules: {
      maxStandardRevisions: 2,
      turnaroundHours: 24,
      guidelines: "Typographical changes, address updates, layout realignment.",
    },
    deliveryStructure: {
      defaultFolder: "Deliveries/Business Documents",
      projectSection: "Stationery & Documents",
      targetCategories: ["document"],
      tags: ["business-stationery", "proposals", "invoices"],
    },
    deliverables: [
      { id: "del_bbd_1", title: "Print-Ready Letterhead & Invoice PDFs", format: "PDF (CMYK)", specs: "A4 & US Letter 300DPI print bleed vectors", category: "document", downloadAllowedByDefault: true },
      { id: "del_bbd_2", title: "Editable Business Proposal Template", format: "DOCX / PDF", specs: "Formal multi-page client proposal template", category: "document", downloadAllowedByDefault: true },
      { id: "del_bbd_3", title: "Official 8-Page Company Profile Document", format: "PDF", specs: "Executive corporate capabilities brochure", category: "document", downloadAllowedByDefault: true },
      { id: "del_bbd_4", title: "Corporate HTML Email Signature", format: "HTML / TXT", specs: "Responsive mobile-tested email signature code", category: "document", downloadAllowedByDefault: true },
    ],
  },
  {
    id: "brand_product_graphics",
    serviceName: "Product Graphics",
    audience: "brand",
    tagline: "3D packaging mockups, apparel tech packs & e-commerce hero assets",
    description: "Photorealistic 3D product packaging mockups, apparel streetwear graphics, digital product bundle box visuals, and high-conversion e-commerce hero graphics.",
    pricing: { priceUsd: "$320", priceNgn: "₦290,000", budgetNumber: 320 },
    turnaround: "3-4 Business Days",
    idealFor: "D2C Brands, Apparel lines, Software bundles, Physical goods",
    assignedProductionStudio: "artwork",
    formats: ["4K High-Res Renders", "CMYK Print Vector Dielines", "Transparent PNG Cutouts"],
    requiredBriefFields: ["productType", "dimensions", "packagingTheme"],
    optionalFields: ["barcodeNumbers", "labelCopy", "referenceRenders"],
    revisionRules: {
      maxStandardRevisions: 2,
      turnaroundHours: 36,
      guidelines: "Angle adjustments, lighting intensity, label alignment.",
    },
    deliveryStructure: {
      defaultFolder: "Deliveries/Product Graphics",
      projectSection: "Product & Packaging",
      targetCategories: ["artwork", "brand"],
      tags: ["3d-mockup", "packaging-dieline", "ecommerce-hero"],
    },
    deliverables: [
      { id: "del_bpg_1", title: "Photorealistic 3D Product Mockup Renders", format: "PNG (4K)", specs: "Studio-lit 3840×2160 renders from 3 camera angles", category: "artwork", downloadAllowedByDefault: true },
      { id: "del_bpg_2", title: "Packaging Dieline Vector Specifications", format: "AI / PDF", specs: "100% exact manufacturer dielines with bleeds & folds", category: "brand", downloadAllowedByDefault: true },
      { id: "del_bpg_3", title: "E-Commerce Transparent Hero PNGs", format: "PNG", specs: "Clean transparent cutouts for Shopify and Amazon listings", category: "artwork", downloadAllowedByDefault: true },
      { id: "del_bpg_4", title: "Digital Box & Device Bundle Mockup Suite", format: "PNG Bundle", specs: "Laptop, tablet, box, and mobile device stack mockups", category: "artwork", downloadAllowedByDefault: true },
    ],
  },
  {
    id: "brand_motion_design",
    serviceName: "Motion Design",
    audience: "brand",
    tagline: "2D/3D logo reveals, product animations & video ad creatives",
    description: "High-end motion graphics: 3D animated logo stings, product explainer animations, user interface micro-interactions, and high-converting paid video ads for Meta and YouTube.",
    pricing: { priceUsd: "$450", priceNgn: "₦400,000", budgetNumber: 450 },
    turnaround: "3-5 Business Days",
    idealFor: "Website hero animations, Product launch teasers, Paid social ads",
    assignedProductionStudio: "motion",
    formats: ["4K 60fps ProRes & H.264", "Transparent WebM / Alpha MOV", "Lottie Web Animations"],
    requiredBriefFields: ["motionGoal", "logoVectorUrl", "audioPreference", "videoLength"],
    optionalFields: ["storyboardNotes", "soundEffects", "brandKeywords"],
    revisionRules: {
      maxStandardRevisions: 2,
      turnaroundHours: 48,
      guidelines: "Timing easing, camera move speed, particle effects adjustments.",
    },
    deliveryStructure: {
      defaultFolder: "Deliveries/Motion Design",
      projectSection: "Motion & Ads",
      targetCategories: ["video", "motion"],
      tags: ["logo-reveal", "motion-ads", "lottie-animation"],
    },
    deliverables: [
      { id: "del_bmd_1", title: "4K Logo Animation Sting (3s & 6s versions)", format: "MP4 / MOV", specs: "4K 60fps ProRes 422 with alpha transparent stems", category: "motion", downloadAllowedByDefault: true },
      { id: "del_bmd_2", title: "15s & 30s Product Explainer Motion Cut", format: "MP4 (16:9)", specs: "1920×1080 high-energy feature walkthrough with sound design", category: "video", downloadAllowedByDefault: true },
      { id: "del_bmd_3", title: "Seamless Website Background Motion Loop", format: "WebM / MP4", specs: "Subtle continuous web background ambient motion loop", category: "motion", downloadAllowedByDefault: true },
      { id: "del_bmd_4", title: "Alpha Channel Transparent Video Assets", format: "MOV (ProRes 4444)", specs: "Zero-compression transparent overlays for editor workflows", category: "motion", downloadAllowedByDefault: true },
    ],
  },
  {
    id: "brand_asset_packages",
    serviceName: "Brand Asset Packages",
    audience: "brand",
    tagline: "Enterprise turnkey suite: identity + stationery + pitch deck + social kit",
    description: "Complete corporate creative foundation: Brand Identity system + Executive business documents + 20-slide Pitch Deck + 15× Social Media Launch Pack + Organized Cloud Asset Vault.",
    pricing: { priceUsd: "$850", priceNgn: "₦780,000", budgetNumber: 850 },
    turnaround: "5-7 Business Days",
    idealFor: "New company launch, Strategic rebrand, Venture-backed startups",
    assignedProductionStudio: "brand_asset",
    formats: ["All Source Files (AI, SVG, PDF, Figma)", "Brand Token JSON Matrix", "Master Archive Zip"],
    requiredBriefFields: ["companyName", "industry", "launchDate", "executiveSummary"],
    optionalFields: ["presentationNeeds", "stationeryTypes", "adFormats"],
    revisionRules: {
      maxStandardRevisions: 3,
      turnaroundHours: 48,
      guidelines: "Comprehensive multi-asset milestone reviews.",
    },
    deliveryStructure: {
      defaultFolder: "Deliveries/Brand 360 Package",
      projectSection: "All Sections",
      targetCategories: ["brand", "document", "social", "artwork"],
      tags: ["enterprise-suite", "brand-360", "turnkey-launch"],
    },
    deliverables: [
      { id: "del_bap_1", title: "Full Vector Brand Identity System", format: "ZIP (SVG, EPS, PNG)", specs: "Primary, secondary, and monogram vectors with tokens", category: "brand", downloadAllowedByDefault: true },
      { id: "del_bap_2", title: "Executive Business Documents Suite", format: "PDF / DOCX", specs: "Letterheads, invoices, proposals, receipts & email signature", category: "document", downloadAllowedByDefault: true },
      { id: "del_bap_3", title: "20-Slide Investor Presentation Deck", format: "PDF / PPTX", specs: "High-stakes investor pitch deck with infographic vector assets", category: "document", downloadAllowedByDefault: true },
      { id: "del_bap_4", title: "15× Social Media Multi-Channel Launch Pack", format: "ZIP", specs: "Carousels, announcement cards, header banners & story graphics", category: "social", downloadAllowedByDefault: true },
      { id: "del_bap_5", title: "Curated Master Asset Vault Repository", format: "ZIP Archive", specs: "Master folder hierarchy organized by department and channel", category: "document", downloadAllowedByDefault: true },
    ],
  },
  {
    id: "brand_marketing_materials",
    serviceName: "Marketing Materials",
    audience: "brand",
    tagline: "Physical event banners, trade show brochures & print advertising",
    description: "Physical and digital marketing assets: large format trade show backdrops, tri-fold brochures, sales flyers, roll-up banners, stickers, and print-ready magazine advertisement specs.",
    pricing: { priceUsd: "$260", priceNgn: "₦230,000", budgetNumber: 260 },
    turnaround: "2-3 Business Days",
    idealFor: "Conferences, Trade shows, Retail popups, Print advertising",
    assignedProductionStudio: "document",
    formats: ["CMYK 300DPI Print Bleed Vectors", "PDF/X-1a Compliant", "Packaging Cutout Dielines"],
    requiredBriefFields: ["materialTypes", "targetEventOrChannel", "dimensions"],
    optionalFields: ["printerSpecifications", "sponsorLogos", "promoCodes"],
    revisionRules: {
      maxStandardRevisions: 2,
      turnaroundHours: 24,
      guidelines: "Bleed margins, CMYK print contrast, copy proofreading.",
    },
    deliveryStructure: {
      defaultFolder: "Deliveries/Marketing Materials",
      projectSection: "Marketing & Print",
      targetCategories: ["document", "artwork"],
      tags: ["print-cmyk", "trade-show", "brochures"],
    },
    deliverables: [
      { id: "del_bmm_1", title: "CMYK Print-Ready Vector PDFs with Bleeds", format: "PDF/X-1a", specs: "300DPI CMYK with 0.125 inch bleeds and crop marks", category: "document", downloadAllowedByDefault: true },
      { id: "del_bmm_2", title: "Event Backdrop & Roll-Up Banner Specs", format: "PDF (8×8ft)", specs: "Large-format vector layout for 8×8ft fabric backdrops", category: "artwork", downloadAllowedByDefault: true },
      { id: "del_bmm_3", title: "Tri-Fold Company Brochure Layout", format: "PDF (A4 / Letter)", specs: "6-panel double-sided high-impact corporate brochure", category: "document", downloadAllowedByDefault: true },
      { id: "del_bmm_4", title: "Sales One-Sheet & Promo Flyer Prints", format: "PDF", specs: "High-conversion sales sheet with QR tracking targets", category: "document", downloadAllowedByDefault: true },
    ],
  },
];

// Helper functions for accessing configuration
export function getStudioServiceById(serviceId: string): StudioServiceConfig | undefined {
  return STUDIO_SERVICES_CONFIG.find((s) => s.id === serviceId);
}

export function getStudioServicesByAudience(audience: ServiceAudience): StudioServiceConfig[] {
  return STUDIO_SERVICES_CONFIG.filter((s) => s.audience === audience);
}

export function getAllStudioServices(): StudioServiceConfig[] {
  return STUDIO_SERVICES_CONFIG;
}

export function createDefaultDeliverablesForService(serviceId: string): Array<{
  id: string;
  title: string;
  category: string;
  format: string;
  specs: string;
  downloadAllowed: boolean;
  status: "pending" | "in_production" | "internal_review" | "client_review" | "revision_requested" | "approved" | "delivered";
  currentVersionNumber: number;
  versions: any[];
}> {
  const cfg = getStudioServiceById(serviceId);
  if (!cfg) {
    return [
      {
        id: "del_" + Math.random().toString(36).substring(2, 9),
        title: "Primary Master Asset Deliverable",
        category: "artwork",
        format: "Production Master",
        specs: "High-resolution master asset",
        downloadAllowed: true,
        status: "pending",
        currentVersionNumber: 0,
        versions: [],
      },
    ];
  }

  return cfg.deliverables.map((d, idx) => ({
    id: "del_" + Math.random().toString(36).substring(2, 9),
    title: d.title,
    category: d.category,
    format: d.format,
    specs: d.specs,
    downloadAllowed: d.downloadAllowedByDefault ?? true,
    status: idx === 0 ? "pending" : "pending",
    currentVersionNumber: 0,
    versions: [],
  }));
}
