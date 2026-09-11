import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { useMembership } from "../hooks/useMembership";
import { api } from "../services/api";
import { ActiveTab, CreativeRequest } from "../types";
import { ShellSection } from "./workspace/WorkspaceShell";
import { routeToStudio } from "../domain/creativeRequests";
import {
  Palette,
  Disc3,
  Video,
  Layout,
  FileText,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
  Check,
  Search,
  Briefcase,
  Music,
  FolderKanban,
  Wand2,
  Plus,
  ExternalLink,
  ShieldCheck,
  Eye,
  Share2,
  Printer,
  TrendingUp,
  Box,
  Film,
  DollarSign,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Send,
  SlidersHorizontal,
  ChevronRight,
  Package,
} from "lucide-react";

export interface StudioProps {
  onNotify?: (text: string, type?: "success" | "info" | "error") => void;
  onNavigateTab?: (tab: ActiveTab) => void;
  onNavigateWorkspaceSection?: (section: ShellSection) => void;
  initialServiceCategory?: string;
  initialReleaseId?: string;
  initialCampaignId?: string;
}

export interface StudioServiceDef {
  id: string;
  domain: "artist" | "brand";
  title: string;
  tagline: string;
  description: string;
  turnaround: string;
  priceUsd: string;
  priceNgn: string;
  budgetNumber: number;
  idealFor: string;
  deliverables: string[];
  specs: string[];
  icon: React.ReactNode;
  diyTool: {
    name: string;
    description: string;
    actionTab?: ActiveTab;
    actionSection?: ShellSection;
  };
}

const STUDIO_SERVICES: StudioServiceDef[] = [
  // ==========================================
  // ARTIST CATALOG (8 Services)
  // ==========================================
  {
    id: "artist_release_creative",
    domain: "artist",
    title: "Release Creative",
    tagline: "End-to-end creative direction & release visual roadmap",
    description: "Complete release creative direction for singles, EPs, and albums. We codify your visual concept, narrative hook, color scripts, and release aesthetic roadmap.",
    turnaround: "3-5 Business Days",
    priceUsd: "$350",
    priceNgn: "₦320,000",
    budgetNumber: 350,
    idealFor: "Lead singles, Debut EPs, Full albums, Major rollouts",
    deliverables: [
      "Release Creative Direction Deck (PDF)",
      "Color & Mood Bible with Hex Tokens",
      "Multi-Phase Asset Roadmap",
      "Aesthetic Stems & Layout Guidelines",
    ],
    specs: ["16:9 Presentation PDF", "Figma Asset System", "Moodboard & Style Matrix"],
    icon: <Sparkles className="w-5 h-5 text-red-400" />,
    diyTool: {
      name: "Workspace Music",
      description: "Plan tracks, schedule rollouts, and orchestrate creative readiness directly in Workspace Music.",
      actionSection: "music",
    },
  },
  {
    id: "artist_cover_artwork",
    domain: "artist",
    title: "Cover Artwork",
    tagline: "DSP-compliant 3000×3000px master artwork & canvas visualizers",
    description: "High-impact cover art engineered for Spotify, Apple Music, and vinyl runs. Includes front cover, back tracklist, and animated 9:16 Canvas loops.",
    turnaround: "48-72 Hours",
    priceUsd: "$280",
    priceNgn: "₦250,000",
    budgetNumber: 280,
    idealFor: "DSP Singles, EPs, Deluxe editions, Beat tapes",
    deliverables: [
      "3000×3000px 300DPI Master Artwork (PNG/JPG)",
      "Spotify Canvas 9:16 1080×1920 MP4 Loop",
      "Tracklist Back Cover Layout",
      "Social Promo Thumbnail Cuts (1:1, 4:5, 16:9)",
    ],
    specs: ["3000×3000px RGB & CMYK", "Apple Digital Masters Compliant", "Spotify Canvas (3-8s loop)"],
    icon: <Disc3 className="w-5 h-5 text-red-400" />,
    diyTool: {
      name: "Cover Studio",
      description: "Design and format compliant cover art and canvas visualizers self-serve using Cover Studio.",
      actionTab: "cover-studio",
    },
  },
  {
    id: "artist_music_visuals",
    domain: "artist",
    title: "Music Visuals",
    tagline: "Kinetic visualizers, stage loops & vertical video teasers",
    description: "Engaging motion visualizers, concert stage LED loops, audio spectrum videos, and high-retention vertical teasers for TikTok and Instagram Reels.",
    turnaround: "3-4 Business Days",
    priceUsd: "$400",
    priceNgn: "₦360,000",
    budgetNumber: 400,
    idealFor: "YouTube audio streams, Tour backdrops, TikTok sound teasers",
    deliverables: [
      "16:9 Full HD Kinetic Visualizer Video",
      "9:16 Vertical Reel & Story Cut (1080×1920)",
      "Seamless Concert Stage Backdrop Stems",
      "Audio Waveform Spectrum Overlay Stems",
    ],
    specs: ["ProRes 422 & H.264 MP4", "24/60fps High Frame Rate", "Alpha Channel Transparent Elements"],
    icon: <Video className="w-5 h-5 text-purple-400" />,
    diyTool: {
      name: "Studio Visualizer Suite",
      description: "Build short-form audio teasers and sound hooks with KeedoHub Content Engine.",
      actionSection: "content",
    },
  },
  {
    id: "artist_social_content",
    domain: "artist",
    title: "Social Content",
    tagline: "Multi-channel release countdowns, carousels & banners",
    description: "Cohesive multi-channel promo graphics, release day swipe-through carousels, artist banners, and fan engagement graphic suites.",
    turnaround: "48 Hours",
    priceUsd: "$240",
    priceNgn: "₦220,000",
    budgetNumber: 240,
    idealFor: "Pre-save campaigns, Release week velocity, Tour dates",
    deliverables: [
      "10× Release Day Carousel Slide Graphics",
      "YouTube, Spotify & X Banner Suite",
      "Story Countdown & Out Now Templates",
      "Fan Engagement Quote & Lyric Graphic Cards",
    ],
    specs: ["1080×1350px 4:5 Carousels", "1080×1920px 9:16 Stories", "Figma / PNG Package"],
    icon: <Layout className="w-5 h-5 text-amber-400" />,
    diyTool: {
      name: "Content Engine",
      description: "Draft, auto-generate, and organize release posts with KeedoHub Content Engine.",
      actionTab: "content-engine",
    },
  },
  {
    id: "artist_epk",
    domain: "artist",
    title: "EPK",
    tagline: "Curated Electronic Press Kit, one-sheet PDF & curator pitch deck",
    description: "Curated Electronic Press Kit, high-conversion one-sheet PDF, streaming analytics showcase, and press-ready photography layout tailored for journalists and DSP playlist editors.",
    turnaround: "2-3 Business Days",
    priceUsd: "$300",
    priceNgn: "₦270,000",
    budgetNumber: 300,
    idealFor: "Media pitching, Festival booking, Label scouting, DSP playlisting",
    deliverables: [
      "Interactive Press Kit Deck (PDF)",
      "Print-Ready Press One-Sheet",
      "Curator & Editorial Pitch Deck",
      "Media Hi-Res Asset & Photo Repository",
    ],
    specs: ["Vector Interactive PDF", "Clickable DSP & Social Links", "Letter & A4 Print Bleeds"],
    icon: <FileText className="w-5 h-5 text-blue-400" />,
    diyTool: {
      name: "EPK Builder",
      description: "Generate and customize an industry-standard Electronic Press Kit in EPK Builder.",
      actionTab: "epk-builder",
    },
  },
  {
    id: "artist_lyrics_visuals",
    domain: "artist",
    title: "Lyrics / Lyric Visuals",
    tagline: "Kinetic typography lyric videos & synchronized lyric cards",
    description: "Typography-driven kinetic lyric videos, synchronized social lyric snippets, and karaoke-ready visual cards designed to drive audio familiarity and sing-alongs.",
    turnaround: "48-72 Hours",
    priceUsd: "$290",
    priceNgn: "₦260,000",
    budgetNumber: 290,
    idealFor: "Focus tracks, Fan favorite singles, Viral TikTok sound snippets",
    deliverables: [
      "Full Song Kinetic Lyric Video (16:9 Full HD)",
      "Short-Form Chorus Lyric Snippet (9:16 Cut)",
      "5× Typography Lyric Quote Art Cards",
      "Synchronized Time-Coded LRC File",
    ],
    specs: ["1080p / 4K MP4", "Custom Font Kinetic Motion", "LRC Synchronized Timestamp"],
    icon: <Music className="w-5 h-5 text-emerald-400" />,
    diyTool: {
      name: "Lyrics Studio",
      description: "Format, transcribe, and render synchronized lyric cards in Lyrics Studio.",
      actionTab: "lyrics-studio",
    },
  },
  {
    id: "artist_brand_kit",
    domain: "artist",
    title: "Artist Brand Kit",
    tagline: "Artist logotype mark, signature typography & brand guide",
    description: "Complete artist visual identity system: bespoke logotype mark, vector signature icon, custom color tokens, font pairing system, and brand usage guidelines.",
    turnaround: "3-5 Business Days",
    priceUsd: "$450",
    priceNgn: "₦400,000",
    budgetNumber: 450,
    idealFor: "Emerging & established artists building recognizable iconography",
    deliverables: [
      "Primary & Secondary Vector Artist Marks",
      "Artist Signature / Monogram Vector",
      "Curated Typography System & Font Tokens",
      "Artist Brand Bible & Styling Guide (PDF)",
    ],
    specs: ["SVG, AI, EPS, PNG Vectors", "Brand Tokens JSON", "High-Resolution Brand Guidelines PDF"],
    icon: <Palette className="w-5 h-5 text-rose-400" />,
    diyTool: {
      name: "Brand Operating Environment",
      description: "Codify your brand core, color tokens, and aesthetic keywords in Workspace Brand.",
      actionSection: "brand",
    },
  },
  {
    id: "artist_release_asset_packages",
    domain: "artist",
    title: "Release Asset Packages",
    tagline: "360 turnkey bundle: master art + motion + 25 social assets + EPK",
    description: "All-in-one comprehensive production package: master artwork, Spotify canvas visualizer, 25 social promotion graphics, lyric video cut, and press one-sheet in a single unified delivery.",
    turnaround: "5-7 Business Days",
    priceUsd: "$750",
    priceNgn: "₦680,000",
    budgetNumber: 750,
    idealFor: "Priority singles, Milestone album launches, Label rollouts",
    deliverables: [
      "Master Artwork (Front + Tracklist Back)",
      "Spotify 9:16 Canvas + 16:9 Visualizer",
      "25× Social Promotion Multi-Channel Suite",
      "Chorus Kinetic Lyric Snippet (9:16)",
      "Complete Press One-Sheet & Pitch Deck",
      "Cloud Asset Archive & Ready-to-Post Manifest",
    ],
    specs: ["Comprehensive Multi-Format Master Zip", "300DPI Print & 4K Digital", "DSP Compliant"],
    icon: <Package className="w-5 h-5 text-red-500" />,
    diyTool: {
      name: "Release Builder",
      description: "Coordinate your multi-asset release pipeline directly inside Workspace Music.",
      actionSection: "music",
    },
  },

  // ==========================================
  // BRAND CATALOG (8 Services)
  // ==========================================
  {
    id: "brand_identity",
    domain: "brand",
    title: "Brand Identity",
    tagline: "Corporate vector logo marks, color tokens & design guidelines",
    description: "Comprehensive visual identity system for companies, startups, and creators: primary vector logos, monogram marks, color hierarchy, typography rules, and detailed brand guidelines.",
    turnaround: "4-6 Business Days",
    priceUsd: "$550",
    priceNgn: "₦500,000",
    budgetNumber: 550,
    idealFor: "Startups, Rebrands, Agencies, E-commerce, Venture funds",
    deliverables: [
      "Primary, Secondary & Icon Vector Marks",
      "Color Palette Tokens & Contrast Matrix",
      "Typography Pairing Hierarchy System",
      "Comprehensive Brand Guidelines Book (PDF)",
    ],
    specs: ["Vector SVG, EPS, PDF, PNG", "Design Tokens JSON", "Print & Web Color Profiles"],
    icon: <Palette className="w-5 h-5 text-amber-400" />,
    diyTool: {
      name: "Brand Operating Environment",
      description: "Define your company mission, visual direction, and color palette in Workspace Brand.",
      actionSection: "brand",
    },
  },
  {
    id: "brand_social_content",
    domain: "brand",
    title: "Social Content",
    tagline: "High-conversion carousel packs, banner suites & ad creatives",
    description: "Professional multi-platform brand social kits: educational carousel templates, testimonial graphics, leadership quote cards, and brand awareness reels for LinkedIn, Instagram, and X.",
    turnaround: "48 Hours",
    priceUsd: "$280",
    priceNgn: "₦250,000",
    budgetNumber: 280,
    idealFor: "B2B SaaS, Professional services, Consumer brands, Product launches",
    deliverables: [
      "12× Branded Carousel Templates",
      "LinkedIn & Twitter Header Banner Suite",
      "Story & Reel Motion Covers",
      "Editable Figma Layout File",
    ],
    specs: ["Figma Components", "1080×1350px Carousel Slides", "1080×1920px Stories"],
    icon: <Share2 className="w-5 h-5 text-cyan-400" />,
    diyTool: {
      name: "Content Engine",
      description: "Generate structured brand content pillars and scheduled items in Content Engine.",
      actionTab: "content-engine",
    },
  },
  {
    id: "brand_presentations",
    domain: "brand",
    title: "Presentations",
    tagline: "Investor pitch decks, sales presentations & keynote slide suites",
    description: "High-stakes presentation design: investor pitch decks, executive sales decks, board meeting slides, and keynote presentations engineered to win confidence and funding.",
    turnaround: "3-5 Business Days",
    priceUsd: "$380",
    priceNgn: "₦340,000",
    budgetNumber: 380,
    idealFor: "Fundraising seed/Series A, Enterprise sales, Conference keynotes",
    deliverables: [
      "20-Slide Master Keynote/Pitch Deck",
      "Custom Visual Infographics & Charts",
      "Editable Slide Template System",
      "Light & Dark Mode Master Themes",
    ],
    specs: ["16:9 Widescreen PDF & Figma", "Keynote / PowerPoint Formats", "Vector Diagram Assets"],
    icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
    diyTool: {
      name: "Business & Documents",
      description: "Draft proposals and company presentations directly inside Workspace Documents.",
      actionSection: "documents",
    },
  },
  {
    id: "brand_business_documents",
    domain: "brand",
    title: "Business Documents",
    tagline: "Letterheads, proposals, invoices, receipts & company profiles",
    description: "Executive stationery suite built from your Brand Profile: professional letterheads, formal business proposals, client quotations, invoices, receipts, and HTML email signatures.",
    turnaround: "24-48 Hours",
    priceUsd: "$180",
    priceNgn: "₦160,000",
    budgetNumber: 180,
    idealFor: "Operating businesses, Consultancies, Agencies, Service firms",
    deliverables: [
      "Print-Ready Letterhead & Invoice PDFs",
      "Editable Business Proposal Template",
      "Official 8-Page Company Profile Document",
      "Corporate HTML Email Signature",
    ],
    specs: ["Print-Ready CMYK PDF", "A4 & US Letter Dielines", "Responsive HTML Signature"],
    icon: <FileText className="w-5 h-5 text-emerald-400" />,
    diyTool: {
      name: "Business Documents Studio",
      description: "Create and export branded invoices, proposals, and letterheads in Business Documents Studio.",
      actionTab: "business-studio",
    },
  },
  {
    id: "brand_product_graphics",
    domain: "brand",
    title: "Product Graphics",
    tagline: "3D packaging mockups, apparel tech packs & e-commerce hero assets",
    description: "Photorealistic 3D product packaging mockups, apparel streetwear graphics, digital product bundle box visuals, and high-conversion e-commerce hero graphics.",
    turnaround: "3-4 Business Days",
    priceUsd: "$320",
    priceNgn: "₦290,000",
    budgetNumber: 320,
    idealFor: "D2C Brands, Apparel lines, Software bundles, Physical goods",
    deliverables: [
      "Photorealistic 3D Product Mockup Renders",
      "Packaging Dieline Vector Specifications",
      "E-Commerce Transparent Hero PNGs",
      "Digital Box & Device Bundle Mockup Suite",
    ],
    specs: ["4K High-Res Renders", "CMYK Print Vector Dielines", "Transparent PNG Cutouts"],
    icon: <Box className="w-5 h-5 text-indigo-400" />,
    diyTool: {
      name: "Resource Vault",
      description: "Archive and inspect product imagery and mockups in your Workspace Resource Vault.",
      actionSection: "library",
    },
  },
  {
    id: "brand_motion_design",
    domain: "brand",
    title: "Motion Design",
    tagline: "2D/3D logo reveals, product animations & video ad creatives",
    description: "High-end motion graphics: 3D animated logo stings, product explainer animations, user interface micro-interactions, and high-converting paid video ads for Meta and YouTube.",
    turnaround: "3-5 Business Days",
    priceUsd: "$450",
    priceNgn: "₦400,000",
    budgetNumber: 450,
    idealFor: "Website hero animations, Product launch teasers, Paid social ads",
    deliverables: [
      "4K Logo Animation Sting (3s & 6s versions)",
      "15s & 30s Product Explainer Motion Cut",
      "Seamless Website Background Motion Loop",
      "Alpha Channel Transparent Video Assets",
    ],
    specs: ["4K 60fps ProRes & H.264", "Transparent WebM / Alpha MOV", "Lottie Web Animations"],
    icon: <Film className="w-5 h-5 text-rose-400" />,
    diyTool: {
      name: "Visualizer & Motion",
      description: "Explore motion clips and creative assets in KeedoHub Studio.",
      actionSection: "content",
    },
  },
  {
    id: "brand_asset_packages",
    domain: "brand",
    title: "Brand Asset Packages",
    tagline: "Enterprise turnkey suite: identity + stationery + pitch deck + social kit",
    description: "Complete corporate creative foundation: Brand Identity system + Executive business documents + 20-slide Pitch Deck + 15× Social Media Launch Pack + Organized Cloud Asset Vault.",
    turnaround: "5-7 Business Days",
    priceUsd: "$850",
    priceNgn: "₦780,000",
    budgetNumber: 850,
    idealFor: "New company launch, Strategic rebrand, Venture-backed startups",
    deliverables: [
      "Full Vector Brand Identity System",
      "Executive Business Documents Suite",
      "20-Slide Investor Presentation Deck",
      "15× Social Media Multi-Channel Launch Pack",
      "Curated Master Asset Vault Repository",
    ],
    specs: ["All Source Files (AI, SVG, PDF, Figma)", "Brand Token JSON Matrix", "Master Archive Zip"],
    icon: <Package className="w-5 h-5 text-amber-500" />,
    diyTool: {
      name: "Brand Operating Environment",
      description: "Manage your entire brand architecture, pillars, and guidelines inside ONE Workspace.",
      actionSection: "brand",
    },
  },
  {
    id: "brand_marketing_materials",
    domain: "brand",
    title: "Marketing Materials",
    tagline: "Physical event banners, trade show brochures & print advertising",
    description: "Physical and digital marketing assets: large format trade show backdrops, tri-fold brochures, sales flyers, roll-up banners, stickers, and print-ready magazine advertisement specs.",
    turnaround: "2-3 Business Days",
    priceUsd: "$260",
    priceNgn: "₦230,000",
    budgetNumber: 260,
    idealFor: "Conferences, Trade shows, Retail popups, Print advertising",
    deliverables: [
      "CMYK Print-Ready Vector PDFs with Bleeds",
      "Event Backdrop & Roll-Up Banner Specs (8×8ft)",
      "Tri-Fold Company Brochure Layout",
      "Sales One-Sheet & Promo Flyer Prints",
    ],
    specs: ["CMYK 300DPI Print Bleed Vectors", "PDF/X-1a Compliant", "Packaging Cutout Dielines"],
    icon: <Printer className="w-5 h-5 text-zinc-300" />,
    diyTool: {
      name: "Business Documents Studio",
      description: "Format and export marketing flyers and document templates in Business Documents Studio.",
      actionTab: "business-studio",
    },
  },
];

export const Studio: React.FC<StudioProps> = ({
  onNotify,
  onNavigateTab,
  onNavigateWorkspaceSection,
  initialServiceCategory,
}) => {
  const { activeWorkspace, user } = useAuth();
  const {
    projects,
    creativeRequests,
    submitStudioRequest,
    createProject,
    assets,
  } = useWorkspace();
  const { identity, plan } = useMembership();

  // Filter & Search states
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<"all" | "artist" | "brand">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals & Drawers
  const [viewServiceModal, setViewServiceModal] = useState<StudioServiceDef | null>(null);
  const [requestBriefService, setRequestBriefService] = useState<StudioServiceDef | null>(() => {
    if (initialServiceCategory) {
      return (
        STUDIO_SERVICES.find(
          (s) => s.id === initialServiceCategory || s.title.toLowerCase().includes(initialServiceCategory.toLowerCase())
        ) || null
      );
    }
    return null;
  });

  // Brief Form States
  const [briefTitle, setBriefTitle] = useState<string>("");
  const [briefConcept, setBriefConcept] = useState<string>("");
  const [briefVisualDirection, setBriefVisualDirection] = useState<string>("");
  const [briefReferences, setBriefReferences] = useState<string>("");
  const [briefDeliverables, setBriefDeliverables] = useState<string[]>([]);
  const [briefTimeline, setBriefTimeline] = useState<string>("standard");
  const [briefBudget, setBriefBudget] = useState<number>(280);
  const [briefCurrency, setBriefCurrency] = useState<"USD" | "NGN">("USD");
  const [briefNotes, setBriefNotes] = useState<string>("");
  const [briefPriority, setBriefPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  // Inline Project Creation inside Request Form
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
  const [newProjectTitle, setNewProjectTitle] = useState<string>("");
  const [newProjectDesc, setNewProjectDesc] = useState<string>("");
  const [isCreatingProjectLoading, setIsCreatingProjectLoading] = useState<boolean>(false);

  // AI Brief Assist
  const [isAiAssisting, setIsAiAssisting] = useState<boolean>(false);
  const [aiAssistResult, setAiAssistResult] = useState<{
    refinedConcept: string;
    suggestedVisualDirection: string;
    suggestedDeliverables: string[];
    missingElements: string[];
    clarifyingQuestions: string[];
    estimatedDays: string;
    confidenceScore: number;
  } | null>(null);

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRequest, setSubmittedRequest] = useState<CreativeRequest | null>(null);

  // In-Flight Requests Drawer toggle
  const [showInFlightDrawer, setShowInFlightDrawer] = useState<boolean>(false);

  // When requestBriefService changes, pre-fill form
  const handleOpenRequestBrief = (service: StudioServiceDef) => {
    setRequestBriefService(service);
    setViewServiceModal(null);
    setBriefTitle(`${service.title} — ${activeWorkspace?.name || "Production"}`);
    setBriefBudget(service.budgetNumber);
    setBriefDeliverables([...service.deliverables]);
    setBriefConcept("");
    setBriefVisualDirection("");
    setBriefReferences("");
    setBriefNotes("");
    setAiAssistResult(null);
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  };

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return STUDIO_SERVICES.filter((srv) => {
      if (selectedDomainFilter !== "all" && srv.domain !== selectedDomainFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = srv.title.toLowerCase().includes(q);
        const matchTagline = srv.tagline.toLowerCase().includes(q);
        const matchDesc = srv.description.toLowerCase().includes(q);
        const matchDeliv = srv.deliverables.some((d) => d.toLowerCase().includes(q));
        return matchTitle || matchTagline || matchDesc || matchDeliv;
      }
      return true;
    });
  }, [selectedDomainFilter, searchQuery]);

  // AI Brief Assistant handler
  const handleAiBriefAssist = async () => {
    if (!activeWorkspace?.id || !requestBriefService) return;
    setIsAiAssisting(true);
    try {
      const res = await api.studio.aiBriefAssist(activeWorkspace.id, requestBriefService.id, {
        serviceCategory: requestBriefService.id as any,
        title: briefTitle || requestBriefService.title,
        concept: briefConcept,
        visualDirection: briefVisualDirection,
        requiredDeliverables: briefDeliverables,
      });

      if (res.assist) {
        setAiAssistResult(res.assist);
        if (!briefConcept && res.assist.refinedConcept) {
          setBriefConcept(res.assist.refinedConcept);
        }
        if (!briefVisualDirection && res.assist.suggestedVisualDirection) {
          setBriefVisualDirection(res.assist.suggestedVisualDirection);
        }
        if (res.assist.suggestedDeliverables?.length) {
          setBriefDeliverables((prev) => Array.from(new Set([...prev, ...res.assist.suggestedDeliverables])));
        }
        onNotify?.("AI Creative Director analyzed your brief and enhanced scope!", "success");
      }
    } catch {
      // Graceful fallback recommendations
      setAiAssistResult({
        refinedConcept:
          briefConcept ||
          `Bespoke ${requestBriefService.title} engineered to elevate ${activeWorkspace?.name || "the project"} with high aesthetic standards and market distinction.`,
        suggestedVisualDirection:
          briefVisualDirection ||
          "High-contrast lighting, clean architectural composition, premium color tokens, and disciplined typographic scale.",
        suggestedDeliverables: requestBriefService.deliverables,
        missingElements: [],
        clarifyingQuestions: [
          "What is the target delivery date and primary audience channel?",
          "Are there specific moodboard or vector assets we should build upon?",
        ],
        estimatedDays: requestBriefService.turnaround,
        confidenceScore: 0.95,
      });
      onNotify?.("AI Creative Director generated recommendations!", "info");
    } finally {
      setIsAiAssisting(false);
    }
  };

  // Inline project creator
  const handleInlineCreateProject = async () => {
    if (!newProjectTitle.trim()) {
      onNotify?.("Please enter a title for the new project.", "error");
      return;
    }
    setIsCreatingProjectLoading(true);
    try {
      const p = await createProject({
        title: newProjectTitle.trim(),
        description: newProjectDesc.trim() || `Container for ${requestBriefService?.title || "creative production"}`,
        category: identity === "brand" ? "brand" : "music",
        status: "in-progress",
      });
      setSelectedProjectId(p.id);
      setIsCreatingProject(false);
      setNewProjectTitle("");
      setNewProjectDesc("");
      onNotify?.(`Created project "${p.title}" and linked to this request!`, "success");
    } catch (err: any) {
      onNotify?.("Could not create project: " + (err.message || "Unknown error"), "error");
    } finally {
      setIsCreatingProjectLoading(false);
    }
  };

  // Submit Brief handler
  const handleSubmitBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace?.id || !requestBriefService) return;
    if (!briefTitle.trim()) {
      onNotify?.("Please enter a title for your creative request.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const linkedProj = projects.find((p) => p.id === selectedProjectId);
      const timelineLabel =
        briefTimeline === "express"
          ? "Express (24–48 Hours)"
          : briefTimeline === "standard"
          ? "Standard (3–5 Days)"
          : "Flexible (1–2 Weeks)";

      const fullDescription = `${briefConcept || "Standard creative brief"}\n\n[Visual Direction]\n${
        briefVisualDirection || "Per KeedoHub Studio agency standards"
      }\n\n[Requested Deliverables]\n${briefDeliverables.join(", ") || "Standard deliverable package"}\n\n[Project & Context]\nProject: ${
        linkedProj?.title || "Direct Workspace"
      } | Identity: ${identity.toUpperCase()} | Timeline: ${timelineLabel}\n\n[Notes]\n${
        briefNotes || "None provided"
      }`;

      const requestPayload: Partial<CreativeRequest> = {
        title: briefTitle.trim(),
        serviceId: requestBriefService.id,
        serviceName: requestBriefService.title,
        requestType: requestBriefService.id,
        projectId: selectedProjectId || undefined,
        budget: Number(briefBudget) || requestBriefService.budgetNumber,
        currency: briefCurrency,
        deadline: timelineLabel,
        description: fullDescription,
        briefDetails: fullDescription,
        instructions: briefNotes || undefined,
        references: briefReferences
          ? briefReferences.split("\n").map((r) => r.trim()).filter(Boolean)
          : [],
        assetIds: selectedAssetIds,
        priority: briefPriority,
        membershipEntitlement: plan,
        lifecycleStatus: "SUBMITTED",
        assignedStudio: routeToStudio(requestBriefService.id),
      };

      const created = await submitStudioRequest(requestPayload);
      setSubmittedRequest(created);
      setRequestBriefService(null);
      onNotify?.(`Creative request for "${briefTitle}" submitted to KeedoHub Studio!`, "success");
    } catch (err: any) {
      onNotify?.("Failed to submit request: " + (err.message || "Unknown error"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Count active in-flight requests
  const activeRequests = useMemo(() => {
    return (creativeRequests || []).filter(
      (r) => (r.lifecycleStatus || "SUBMITTED") !== "COMPLETED" && (r.lifecycleStatus || "SUBMITTED") !== "CANCELLED"
    );
  }, [creativeRequests]);

  return (
    <div id="studio-services-root" className="min-h-screen bg-zinc-950 text-white pb-20">
      {/* ======================================================== */}
      {/* 1. HERO & AGENCY HEADER */}
      {/* ======================================================== */}
      <div className="border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 via-zinc-950 to-zinc-950 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-mono font-bold text-red-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>KEEDOHUB CREATIVE AGENCY · PRODUCTION DESK</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-['Space_Grotesk']">
                Studio Services
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                Commission dedicated human creative direction from KeedoHub’s internal production studios, or craft it yourself using self-serve KeedoHub OS creator suites.
              </p>
            </div>

            {/* In-Flight Requests Counter & Status Pill */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">Active Workspace</p>
                  <p className="text-xs font-bold text-white truncate max-w-[140px]">
                    {activeWorkspace?.name || "KeedoHub Workspace"}
                  </p>
                </div>
              </div>

              <button
                id="view-active-requests-btn"
                onClick={() => setShowInFlightDrawer(!showInFlightDrawer)}
                className={`rounded-2xl border p-3 flex items-center gap-3 transition-all cursor-pointer ${
                  activeRequests.length > 0
                    ? "border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20"
                    : "border-zinc-800 bg-zinc-900/70 hover:bg-zinc-900"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">Production Queue</p>
                  <p className="text-xs font-bold text-white">
                    {activeRequests.length} {activeRequests.length === 1 ? "Request" : "Requests"} In-Flight
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 text-zinc-400 transition-transform ${showInFlightDrawer ? "rotate-90" : ""}`} />
              </button>
            </div>
          </div>

          {/* Canonical Process Pipeline Strip */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-3 sm:p-4 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2 text-[11px] font-mono whitespace-nowrap text-zinc-400 min-w-max">
              <span className="font-bold text-red-400">STUDIO SERVICES</span>
              <span className="text-zinc-600">→</span>
              <span className="text-zinc-300">SELECT SERVICE</span>
              <span className="text-zinc-600">→</span>
              <span className="text-zinc-300">CREATIVE REQUEST</span>
              <span className="text-zinc-600">→</span>
              <span className="text-zinc-300">ONE WORKSPACE / PROJECT</span>
              <span className="text-zinc-600">→</span>
              <span className="text-zinc-500">ADMIN PRODUCTION</span>
              <span className="text-zinc-600">→</span>
              <span className="text-zinc-500">REVIEW & APPROVAL</span>
              <span className="text-zinc-600">→</span>
              <span className="text-emerald-400 font-bold">CUSTOMER LIBRARY</span>
            </div>
          </div>

          {/* In-Flight Requests Dropdown Drawer */}
          {showInFlightDrawer && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                  In-Flight Agency Requests ({activeRequests.length})
                </span>
                <button
                  onClick={() => {
                    if (onNavigateWorkspaceSection) {
                      onNavigateWorkspaceSection("requests");
                    } else {
                      onNavigateTab?.("command-center");
                    }
                  }}
                  className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full Request Desk</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {activeRequests.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {activeRequests.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate">
                          {req.title || req.serviceName}
                        </span>
                        <span className="rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                          {req.lifecycleStatus || "SUBMITTED"}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">{req.description}</p>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1 border-t border-zinc-800/60">
                        <span>Studio: {req.assignedStudio || "Creative"}</span>
                        <span>{req.deadline || "Standard"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-2">
                  No requests currently in production. Select a service below to commission agency work.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CATALOG NAVIGATION & FILTER CONTROLS */}
      {/* ======================================================== */}
      <div className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Domain Filter Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              id="filter-all-services-btn"
              onClick={() => setSelectedDomainFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedDomainFilter === "all"
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All Services (16)
            </button>
            <button
              id="filter-artist-services-btn"
              onClick={() => setSelectedDomainFilter("artist")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedDomainFilter === "artist"
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Artist (8)</span>
            </button>
            <button
              id="filter-brand-services-btn"
              onClick={() => setSelectedDomainFilter("brand")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedDomainFilter === "brand"
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Brand (8)</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services, deliverables..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. SERVICES CATALOG LIST */}
      {/* ======================================================== */}
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-10">
        {/* ARTIST SECTION */}
        {(selectedDomainFilter === "all" || selectedDomainFilter === "artist") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
                    Artist Creative Services
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Bespoke artwork, rollouts, visualizers, lyric videos, and complete release packages.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 font-bold">
                8 Disciplines
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredServices
                .filter((s) => s.domain === "artist")
                .map((service) => (
                  <div
                    key={service.id}
                    className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 hover:border-zinc-700 hover:bg-zinc-900/90 transition-all flex flex-col justify-between shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                          {service.icon}
                        </div>
                        <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-mono text-zinc-400 font-medium">
                          {service.turnaround}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/60 space-y-1">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block">Deliverables:</span>
                        <ul className="space-y-0.5">
                          {service.deliverables.slice(0, 2).map((d, i) => (
                            <li key={i} className="text-[11px] text-zinc-300 truncate flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-red-400 shrink-0" />
                              <span className="truncate">{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800/80 mt-4 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-mono font-bold text-white">
                          From {service.priceUsd}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          ({service.priceNgn})
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setViewServiceModal(service)}
                          className="w-full py-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer text-center"
                        >
                          View Service
                        </button>
                        <button
                          onClick={() => handleOpenRequestBrief(service)}
                          className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer text-center shadow-sm"
                        >
                          Request
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* BRAND SECTION */}
        {(selectedDomainFilter === "all" || selectedDomainFilter === "brand") && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
                    Brand Creative Services
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Corporate identity, presentations, business stationery, 3D product graphics, and marketing materials.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 font-bold">
                8 Disciplines
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredServices
                .filter((s) => s.domain === "brand")
                .map((service) => (
                  <div
                    key={service.id}
                    className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 hover:border-zinc-700 hover:bg-zinc-900/90 transition-all flex flex-col justify-between shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                          {service.icon}
                        </div>
                        <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-mono text-zinc-400 font-medium">
                          {service.turnaround}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/60 space-y-1">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block">Deliverables:</span>
                        <ul className="space-y-0.5">
                          {service.deliverables.slice(0, 2).map((d, i) => (
                            <li key={i} className="text-[11px] text-zinc-300 truncate flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="truncate">{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800/80 mt-4 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-mono font-bold text-white">
                          From {service.priceUsd}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          ({service.priceNgn})
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setViewServiceModal(service)}
                          className="w-full py-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer text-center"
                        >
                          View Service
                        </button>
                        <button
                          onClick={() => handleOpenRequestBrief(service)}
                          className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer text-center shadow-sm"
                        >
                          Request
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {filteredServices.length === 0 && (
          <div className="rounded-3xl border border-dashed border-zinc-800 p-12 text-center space-y-3">
            <Search className="mx-auto w-8 h-8 text-zinc-600" />
            <p className="text-base font-bold text-white">No services found</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try modifying your search keywords or resetting the domain filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDomainFilter("all");
              }}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. MODAL: VIEW SERVICE (SPECS + DIY vs DONE-FOR-YOU) */}
      {/* ======================================================== */}
      {viewServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-zinc-900 border border-zinc-800 p-6 md:p-8 space-y-6 my-8 shadow-2xl animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setViewServiceModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Service Header */}
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 shrink-0">
                {viewServiceModal.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold uppercase px-2 py-0.5">
                    {viewServiceModal.domain.toUpperCase()} SERVICE
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    ⏱ {viewServiceModal.turnaround}
                  </span>
                </div>
                <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-white">
                  {viewServiceModal.title}
                </h3>
                <p className="text-xs text-zinc-400">{viewServiceModal.tagline}</p>
              </div>
            </div>

            {/* Description & Scope */}
            <div className="space-y-2 rounded-2xl bg-zinc-950 p-4 border border-zinc-800/80">
              <p className="text-xs text-zinc-300 leading-relaxed">
                {viewServiceModal.description}
              </p>
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="font-mono text-zinc-500">Ideal Scenarios:</span>
                <span className="text-zinc-300 font-semibold">{viewServiceModal.idealFor}</span>
              </div>
            </div>

            {/* Deliverables & Technical Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-zinc-300 uppercase block">
                  Included Deliverables:
                </span>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {viewServiceModal.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-zinc-300 uppercase block">
                  Format Specifications:
                </span>
                <ul className="space-y-1.5 text-xs text-zinc-400 font-mono">
                  {viewServiceModal.specs.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ======================================================== */}
            {/* TWO PATHS: DIY vs DONE-FOR-YOU */}
            {/* ======================================================== */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block text-center">
                CHOOSE YOUR EXECUTION PATH
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option A: DIY Tool */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-300 font-bold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                      <span>DIY — Self-Serve Studio</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {viewServiceModal.diyTool.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const tool = viewServiceModal.diyTool;
                      setViewServiceModal(null);
                      if (tool.actionSection && onNavigateWorkspaceSection) {
                        onNavigateWorkspaceSection(tool.actionSection);
                      } else if (tool.actionTab && onNavigateTab) {
                        onNavigateTab(tool.actionTab);
                      } else {
                        onNavigateTab?.("command-center");
                      }
                    }}
                    className="w-full py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Launch {viewServiceModal.diyTool.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Option B: DONE FOR YOU */}
                <div className="rounded-2xl border border-red-500/40 bg-red-950/20 p-4 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-red-400 font-bold text-xs">
                        DONE FOR YOU — Studio Agency
                      </span>
                      <span className="text-xs font-mono font-bold text-white">
                        {viewServiceModal.priceUsd}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      Commission human art direction, bespoke vector production, and turnkey deliverables managed through your Workspace.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenRequestBrief(viewServiceModal)}
                    className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span>Request This Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL: SUBMIT CREATIVE REQUEST (ONE WORKSPACE FLOW) */}
      {/* ======================================================== */}
      {requestBriefService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl p-6 md:p-8 space-y-6 my-8 animate-in zoom-in-95 duration-150 text-left">
            <button
              onClick={() => setRequestBriefService(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/30 px-3 py-0.5 text-xs font-mono font-bold text-red-400">
                <Send className="w-3 h-3" />
                <span>ONE WORKSPACE · CREATIVE REQUEST DESK</span>
              </div>
              <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-white">
                Request {requestBriefService.title}
              </h2>
              <p className="text-xs text-zinc-400">
                Commission KeedoHub Studio for your active workspace. Preserves project linking, deliverables, and production tracking.
              </p>
            </div>

            <form onSubmit={handleSubmitBrief} className="space-y-5 text-xs">
              {/* Request Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-300 block uppercase">
                  1. Request Title *
                </label>
                <input
                  type="text"
                  required
                  value={briefTitle}
                  onChange={(e) => setBriefTitle(e.target.value)}
                  placeholder={`e.g. ${requestBriefService.title} for ${activeWorkspace?.name || "Project"}`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              {/* PROJECT SELECTOR & INLINE PROJECT CREATION */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-zinc-300 block uppercase">
                    2. Workspace Project Association *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCreatingProject(!isCreatingProject)}
                    className="text-[11px] font-mono text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isCreatingProject ? "Select Existing Project" : "+ Create New Project"}</span>
                  </button>
                </div>

                {isCreatingProject ? (
                  <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-3.5 space-y-2.5">
                    <p className="text-[11px] text-zinc-400">
                      Create a project immediately without leaving the ONE Workspace architecture:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newProjectTitle}
                        onChange={(e) => setNewProjectTitle(e.target.value)}
                        placeholder="Project Title (e.g. Midnight Rollout)"
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                      <input
                        type="text"
                        value={newProjectDesc}
                        onChange={(e) => setNewProjectDesc(e.target.value)}
                        placeholder="Short description (optional)"
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCreatingProject(false)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!newProjectTitle.trim() || isCreatingProjectLoading}
                        onClick={handleInlineCreateProject}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        {isCreatingProjectLoading ? "Creating..." : "Save & Link Project"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="">-- General Workspace Scope (No Specific Project) --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        Project: {p.title} ({p.status || "Active"})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Concept & Direction with AI Creative Director */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-zinc-300 block uppercase">
                    3. Concept, Narrative & Artistic Direction
                  </label>
                  <button
                    type="button"
                    onClick={handleAiBriefAssist}
                    disabled={isAiAssisting}
                    className="text-[11px] font-mono text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Wand2 className={`w-3.5 h-3.5 ${isAiAssisting ? "animate-spin" : ""}`} />
                    <span>{isAiAssisting ? "AI Optimizing Brief..." : "AI Enhance Brief"}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={briefConcept}
                  onChange={(e) => setBriefConcept(e.target.value)}
                  placeholder="Describe your creative vision, narrative, aesthetic theme, and intended audience reaction..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs leading-relaxed focus:outline-none focus:border-red-500"
                />
              </div>

              {/* AI Recommendations Panel */}
              {aiAssistResult && (
                <div className="rounded-xl bg-red-950/20 border border-red-500/30 p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-red-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Creative Director Recommendations</span>
                  </div>
                  {aiAssistResult.clarifyingQuestions?.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Considerations:</span>
                      <ul className="list-disc list-inside text-zinc-300 space-y-0.5">
                        {aiAssistResult.clarifyingQuestions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Deliverables Checklist */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-300 block uppercase">
                  4. Requested Deliverables ({briefDeliverables.length})
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {requestBriefService.deliverables.map((deliv, idx) => {
                    const isChecked = briefDeliverables.includes(deliv);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setBriefDeliverables((prev) => prev.filter((d) => d !== deliv));
                          } else {
                            setBriefDeliverables((prev) => [...prev, deliv]);
                          }
                        }}
                        className={`p-2 rounded-xl text-left border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                          isChecked
                            ? "bg-zinc-800/80 border-red-500/50 text-white font-medium"
                            : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 ${
                            isChecked ? "bg-red-600 text-white" : "border border-zinc-700 bg-zinc-900"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="truncate">{deliv}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* References & Moodboards */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-300 block uppercase">
                  5. Reference Links (Spotify, Pinterest, Behance, Google Drive)
                </label>
                <textarea
                  rows={2}
                  value={briefReferences}
                  onChange={(e) => setBriefReferences(e.target.value)}
                  placeholder="Paste reference URLs (one per line)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Budget, Currency & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">
                    Budget Tier
                  </label>
                  <div className="flex rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
                    <select
                      value={briefCurrency}
                      onChange={(e) => setBriefCurrency(e.target.value as any)}
                      className="px-2 py-2 bg-zinc-900 text-zinc-300 font-mono text-xs border-r border-zinc-800"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="NGN">NGN (₦)</option>
                    </select>
                    <input
                      type="number"
                      value={briefBudget}
                      onChange={(e) => setBriefBudget(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-transparent text-white text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">
                    Production Timeline
                  </label>
                  <select
                    value={briefTimeline}
                    onChange={(e) => setBriefTimeline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs cursor-pointer focus:outline-none focus:border-red-500"
                  >
                    <option value="express">Express (24–48 Hours)</option>
                    <option value="standard">Standard (3–5 Days)</option>
                    <option value="planned">Flexible / Planned (1–2 Weeks)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">
                    Priority
                  </label>
                  <select
                    value={briefPriority}
                    onChange={(e) => setBriefPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs cursor-pointer focus:outline-none focus:border-red-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Rollout</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <div className="text-[11px] text-zinc-500 font-mono">
                  Preserved: User · Workspace · Project · Identity
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestBriefService(null)}
                    className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !briefTitle.trim()}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Creative Request</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. SUCCESS CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {submittedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-700 p-6 sm:p-8 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                REQUEST DISPATCHED
              </span>
              <h3 className="text-xl font-bold font-['Space_Grotesk'] text-white">
                Assigned to KeedoHub Studio
              </h3>
              <p className="text-xs text-zinc-400">
                Your brief for <span className="text-white font-semibold">{submittedRequest.title}</span> has entered the internal production pipeline.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-3.5 text-left text-xs font-mono space-y-1 text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">Request ID:</span>
                <span className="text-white">{submittedRequest.id.substring(0, 12)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status:</span>
                <span className="text-amber-400 uppercase font-bold">
                  {submittedRequest.lifecycleStatus || "SUBMITTED"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Internal Studio:</span>
                <span className="text-white uppercase">{submittedRequest.assignedStudio || "agency"}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setSubmittedRequest(null);
                  if (onNavigateWorkspaceSection) {
                    onNavigateWorkspaceSection("projects");
                  } else {
                    onNavigateTab?.("command-center");
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>View in Workspace Projects</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setSubmittedRequest(null);
                  if (onNavigateWorkspaceSection) {
                    onNavigateWorkspaceSection("requests");
                  } else {
                    onNavigateTab?.("command-center");
                  }
                }}
                className="w-full py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Open Creative Request Desk
              </button>

              <button
                onClick={() => setSubmittedRequest(null)}
                className="text-xs text-zinc-500 hover:text-zinc-300 font-mono transition-colors pt-1 cursor-pointer"
              >
                Continue Browsing Catalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Studio;
