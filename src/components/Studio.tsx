import React, { useState, useEffect } from "react";
import {
  StudioRequest,
  StudioQuote,
  StudioProject,
  StudioDeliverable,
  StudioRevision,
  StudioMessage,
  StudioServiceCategory,
  StudioBrief,
  StudioQuoteStatus,
  ActiveTab,
} from "../types";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import {
  Palette,
  Sparkles,
  Layers,
  FileCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Plus,
  ArrowRight,
  Download,
  Send,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Disc3,
  Video,
  Monitor,
  Layout,
  Printer,
  TrendingUp,
  Share2,
  PenTool,
  Wand2,
  DollarSign,
  Calendar,
  Check,
  X,
  Eye,
  FileText,
  UserCheck,
  Briefcase,
  HelpCircle,
  History,
  Users
} from "lucide-react";
import { CommentsSection } from "./collaboration/CommentsSection";
import { ApprovalModal } from "./collaboration/ApprovalModal";
import { RevisionHistoryModal } from "./collaboration/RevisionHistoryModal";

interface StudioProps {
  onNotify?: (text: string, type?: "success" | "info" | "error") => void;
  onNavigateTab?: (tab: ActiveTab) => void;
  initialServiceCategory?: StudioServiceCategory;
  initialReleaseId?: string;
  initialCampaignId?: string;
}

export const Studio: React.FC<StudioProps> = ({
  onNotify,
  onNavigateTab,
  initialServiceCategory,
  initialReleaseId,
  initialCampaignId,
}) => {
  const { activeWorkspace, user } = useAuth();
  const { creativeMemory, releases, campaigns } = useWorkspace();

  // Navigation & Sub-views
  const [activeSubTab, setActiveSubTab] = useState<
    "projects" | "deliverables" | "quotes" | "requests" | "catalog" | "messages"
  >("projects");

  // Data states
  const [requests, setRequests] = useState<StudioRequest[]>([]);
  const [quotes, setQuotes] = useState<StudioQuote[]>([]);
  const [projects, setStudioProjects] = useState<StudioProject[]>([]);
  const [deliverables, setDeliverables] = useState<StudioDeliverable[]>([]);
  const [revisions, setRevisions] = useState<StudioRevision[]>([]);
  const [messages, setMessages] = useState<StudioMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selected item states
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<StudioQuote | null>(null);

  // Modals & Forms
  const [isBriefBuilderOpen, setIsBriefBuilderOpen] = useState<boolean>(Boolean(initialServiceCategory));
  const [selectedCategory, setSelectedCategory] = useState<StudioServiceCategory>(initialServiceCategory || "cover_design");
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState<boolean>(false);
  const [targetDeliverableForRevision, setTargetDeliverableForRevision] = useState<StudioDeliverable | null>(null);
  const [revisionReason, setRevisionReason] = useState<string>("");
  const [revisionRequestedChanges, setRevisionRequestedChanges] = useState<string>("");

  // Phase 15: Collaboration Modals for Deliverables
  const [collabApprovalDeliverable, setCollabApprovalDeliverable] = useState<StudioDeliverable | null>(null);
  const [collabCommentsDeliverable, setCollabCommentsDeliverable] = useState<StudioDeliverable | null>(null);
  const [collabRevisionsDeliverable, setCollabRevisionsDeliverable] = useState<StudioDeliverable | null>(null);

  // Brief Form State
  const [briefTitle, setBriefTitle] = useState<string>("");
  const [briefConcept, setBriefConcept] = useState<string>("");
  const [briefVisualDirection, setBriefVisualDirection] = useState<string>("");
  const [briefReferences, setBriefReferences] = useState<string>("");
  const [briefDimensions, setBriefDimensions] = useState<string>("3000x3000px");
  const [briefDeliverables, setBriefDeliverables] = useState<string>("");
  const [briefDeadline, setBriefDeadline] = useState<string>("");
  const [briefTargetBudget, setBriefTargetBudget] = useState<number>(280);
  const [briefCurrency, setBriefCurrency] = useState<"USD" | "NGN">("USD");
  const [briefNotes, setBriefNotes] = useState<string>("");
  const [selectedReleaseId, setSelectedReleaseId] = useState<string>(initialReleaseId || "");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(initialCampaignId || "");

  // AI Brief Assist State
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

  // New Message input
  const [newMessageText, setNewMessageText] = useState<string>("");
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

  // Load Studio Data
  const loadStudioData = async () => {
    if (!activeWorkspace?.id) return;
    setIsLoading(true);
    try {
      const [reqRes, quoRes, projRes, delRes, revRes, msgRes] = await Promise.all([
        api.studio.requests.getAll(activeWorkspace.id),
        api.studio.quotes.getAll(activeWorkspace.id),
        api.studio.projects.getAll(activeWorkspace.id),
        api.studio.deliverables.getAll(activeWorkspace.id),
        api.studio.revisions.getAll(activeWorkspace.id),
        api.studio.messages.getAll(activeWorkspace.id),
      ]);

      setRequests(reqRes.requests || []);
      setQuotes(quoRes.quotes || []);
      setStudioProjects(projRes.projects || []);
      setDeliverables(delRes.deliverables || []);
      setRevisions(revRes.revisions || []);
      setMessages(msgRes.messages || []);

      if (projRes.projects && projRes.projects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projRes.projects[0].id);
      }
    } catch (err: any) {
      console.error("[Studio] Failed to load studio data:", err);
      onNotify?.("Failed to load studio data: " + (err.message || "Unknown error"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudioData();
  }, [activeWorkspace?.id]);

  // Service Catalog definitions
  const serviceCatalog: {
    id: StudioServiceCategory;
    title: string;
    description: string;
    icon: React.ReactNode;
    turnaround: string;
    startingPrice: string;
    idealFor: string;
    deliverables: string[];
  }[] = [
    {
      id: "cover_design",
      title: "Album / Single / EP Cover Design",
      description: "DSP-compliant 3000x3000px master artwork, gatefold vinyl mockups, and animated 9:16 Spotify Canvas visualizer loops.",
      icon: <Disc3 className="w-5 h-5 text-red-400" />,
      turnaround: "48-72 Hours",
      startingPrice: "$280 / ₦250k",
      idealFor: "Singles, EPs, Albums, Beat Tapes",
      deliverables: ["3000x3000px 300DPI PNG", "Spotify 9:16 Canvas MP4", "Tracklist Back Cover", "Social Promo Suite"],
    },
    {
      id: "brand_identity",
      title: "Logo & Brand Identity",
      description: "Complete visual identity system including vector logo marks, color tokens, typography hierarchy, and brand guidelines.",
      icon: <Palette className="w-5 h-5 text-amber-400" />,
      turnaround: "3-5 Business Days",
      startingPrice: "$450 / ₦400k",
      idealFor: "Artists, Record Labels, Creative Agencies, Startups",
      deliverables: ["Primary & Secondary Vector Marks", "Color Palette Tokens", "Typography Pairing System", "PDF Brand Guidelines"],
    },
    {
      id: "motion_animation",
      title: "Motion Graphics & 2D Animation",
      description: "Kinetic lyric videos, 3D animated cover loops, release countdown teasers, and high-engagement social reels.",
      icon: <Video className="w-5 h-5 text-purple-400" />,
      turnaround: "3-4 Business Days",
      startingPrice: "$380 / ₦350k",
      idealFor: "Track Teasers, Lyric Videos, Tour Visuals",
      deliverables: ["1080x1920 9:16 Reel Cut", "16:9 Full HD Kinetic Lyric Video", "Seamless Loop Stems"],
    },
    {
      id: "web_ui_ux",
      title: "Website & UI/UX Design",
      description: "High-converting artist discography hubs, smart merchandise stores, tour landing pages, and interactive Web3/EPK sites.",
      icon: <Monitor className="w-5 h-5 text-blue-400" />,
      turnaround: "5-7 Business Days",
      startingPrice: "$650 / ₦600k",
      idealFor: "Tour Portals, Direct-to-Fan Stores, Official Portfolios",
      deliverables: ["Figma Design System & Prototypes", "Responsive Mobile Layouts", "Developer Handoff Package"],
    },
    {
      id: "social_media",
      title: "Social Media Design Kit",
      description: "Cohesive multi-channel promo graphics, release day carousels, banner suites, and reusable Figma/PSD content templates.",
      icon: <Layout className="w-5 h-5 text-emerald-400" />,
      turnaround: "48 Hours",
      startingPrice: "$220 / ₦200k",
      idealFor: "Release Campaigns, Tour Announcements, DSP Playlisting",
      deliverables: ["10x Carousel Slides", "YouTube / X / Spotify Banners", "Story Countdown Kit"],
    },
    {
      id: "artist_promotion",
      title: "Artist Promotion & DSP Pitching",
      description: "Curated Spotify/Apple Music editorial pitching decks, press release syndication, and digital diaspora playlist seeding.",
      icon: <TrendingUp className="w-5 h-5 text-rose-400" />,
      turnaround: "3-5 Business Days",
      startingPrice: "$350 / ₦300k",
      idealFor: "Release Launch Velocity, Playlist Curator Seeding",
      deliverables: ["DSP Editorial Pitch Deck", "Curator Press Kit (EPK)", "Targeted Curator Outreach Log"],
    },
    {
      id: "print_design",
      title: "Print Design & Merchandise",
      description: "Vinyl gatefolds, CD jewel cases, tour posters, cassette J-cards, streetwear apparel graphics, and packaging specs.",
      icon: <Printer className="w-5 h-5 text-indigo-400" />,
      turnaround: "3-4 Business Days",
      startingPrice: "$300 / ₦270k",
      idealFor: "Physical Vinyl Runs, Tour Merch, Festival Posters",
      deliverables: ["CMYK Print-Ready Vector PDFs", "Dieline Packaging Cutouts", "3D Apparel Mockups"],
    },
    {
      id: "content_creation",
      title: "Content Creation & Sound Hooks",
      description: "Short-form viral sound concepts, POV lifestyle video hooks, sound snippets, and creator seeding packages.",
      icon: <Share2 className="w-5 h-5 text-cyan-400" />,
      turnaround: "48-72 Hours",
      startingPrice: "$260 / ₦230k",
      idealFor: "TikTok / IG Reels Sound Adoption, Gen-Z Virality",
      deliverables: ["5x High-Retention Sound Concepts", "Hook Timecodes & Copy", "Creator Seeding Deck"],
    },
    {
      id: "digital_marketing",
      title: "Digital Marketing & Ad Creatives",
      description: "High-ROI paid ad creatives for Meta, TikTok Ads, YouTube Discovery, and pre-save conversion funnels.",
      icon: <TrendingUp className="w-5 h-5 text-orange-400" />,
      turnaround: "3-4 Business Days",
      startingPrice: "$400 / ₦350k",
      idealFor: "Ad Spend Amplification, Pre-Save Funnel Conversion",
      deliverables: ["6x Paid Ad Creative Variations", "Copywriting & Audience Angles", "A/B Testing Setup Deck"],
    },
    {
      id: "custom_creative",
      title: "Custom Creative Production",
      description: "Bespoke creative direction, 3D CGI stage visuals, festival visual identity suites, or specialized multimedia requests.",
      icon: <PenTool className="w-5 h-5 text-zinc-300" />,
      turnaround: "Custom Scope",
      startingPrice: "Custom Quote",
      idealFor: "Major Milestones, Tours, Strategic Rebrands",
      deliverables: ["Custom Tailored Deliverable Suite", "Dedicated Art Director Assignment"],
    },
  ];

  // AI Brief Assist handler
  const handleAiBriefAssist = async () => {
    if (!activeWorkspace?.id) return;
    setIsAiAssisting(true);
    try {
      const draftBrief: Partial<StudioBrief> = {
        serviceCategory: selectedCategory,
        title: briefTitle || "Untitled Request",
        concept: briefConcept,
        visualDirection: briefVisualDirection,
        references: briefReferences ? briefReferences.split("\n").filter(Boolean) : [],
        dimensions: briefDimensions,
        requiredDeliverables: briefDeliverables ? briefDeliverables.split("\n").filter(Boolean) : [],
        deadline: briefDeadline,
        targetBudget: briefTargetBudget,
        currency: briefCurrency,
        additionalNotes: briefNotes,
      };

      const res = await api.studio.aiBriefAssist(activeWorkspace.id, selectedCategory, draftBrief);
      if (res.assist) {
        setAiAssistResult(res.assist);
        // Pre-fill fields if empty
        if (!briefConcept && res.assist.refinedConcept) {
          setBriefConcept(res.assist.refinedConcept);
        }
        if (!briefVisualDirection && res.assist.suggestedVisualDirection) {
          setBriefVisualDirection(res.assist.suggestedVisualDirection);
        }
        if (!briefDeliverables && res.assist.suggestedDeliverables) {
          setBriefDeliverables(res.assist.suggestedDeliverables.join("\n"));
        }
        onNotify?.("AI Creative Director analyzed your brief and suggested enhancements!", "success");
      }
    } catch (err: any) {
      console.error("[Studio AI Brief Assist]", err);
      onNotify?.("Could not run AI assist: " + (err.message || "Unknown error"), "error");
    } finally {
      setIsAiAssisting(false);
    }
  };

  // Submit Brief Request handler
  const handleSubmitBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace?.id) return;
    if (!briefTitle.trim()) {
      onNotify?.("Please enter a title for your creative request.", "error");
      return;
    }

    const catInfo = serviceCatalog.find((c) => c.id === selectedCategory);
    const catName = catInfo?.title || "Custom Creative Request";

    const brief: StudioBrief = {
      serviceCategory: selectedCategory,
      title: briefTitle,
      artistOrBrandName: activeWorkspace.name,
      releaseTitle: releases.find((r) => r.id === selectedReleaseId)?.title,
      genreOrIndustry: activeWorkspace.genreOrNiche,
      concept: briefConcept,
      visualDirection: briefVisualDirection,
      references: briefReferences ? briefReferences.split("\n").filter(Boolean) : [],
      dimensions: briefDimensions,
      requiredDeliverables: briefDeliverables 
        ? briefDeliverables.split("\n").filter(Boolean)
        : (catInfo?.deliverables || ["Master Asset Deliverable"]),
      deadline: briefDeadline || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      targetBudget: Number(briefTargetBudget) || 280,
      currency: briefCurrency,
      additionalNotes: briefNotes,
      aiAssisted: Boolean(aiAssistResult),
      missingElementsDetected: aiAssistResult?.missingElements || [],
      aiSuggestedQuestions: aiAssistResult?.clarifyingQuestions || [],
    };

    try {
      const res = await api.studio.requests.create(activeWorkspace.id, {
        serviceId: selectedCategory,
        serviceName: catName,
        title: briefTitle,
        brief,
        origin: selectedReleaseId ? "artist_release" : selectedCampaignId ? "brand_campaign" : "direct",
        releaseId: selectedReleaseId || undefined,
        releaseTitle: releases.find((r) => r.id === selectedReleaseId)?.title,
        campaignId: selectedCampaignId || undefined,
        campaignTitle: campaigns.find((c) => c.id === selectedCampaignId)?.title,
      });

      onNotify?.(`Request for "${briefTitle}" submitted! Quote #${res.quote?.id.substring(0, 8) || "draft"} is generated.`, "success");
      setIsBriefBuilderOpen(false);
      
      // Reset form
      setBriefTitle("");
      setBriefConcept("");
      setBriefVisualDirection("");
      setBriefReferences("");
      setBriefNotes("");
      setAiAssistResult(null);

      // Refresh data and switch to quotes tab
      await loadStudioData();
      setActiveSubTab("quotes");
    } catch (err: any) {
      console.error("[Studio Request Submit]", err);
      onNotify?.("Failed to submit request: " + (err.message || "Unknown error"), "error");
    }
  };

  // Quote Status Update (Approve / Decline)
  const handleUpdateQuoteStatus = async (quote: StudioQuote, status: StudioQuoteStatus) => {
    if (!activeWorkspace?.id) return;
    try {
      const res = await api.studio.quotes.updateStatus(activeWorkspace.id, quote.id, status, {
        approvedBy: user?.fullName || user?.email || "Workspace Lead",
      });

      if (status === "APPROVED") {
        onNotify?.(`Quote approved! Dedicated Studio Project #${res.project?.id || "active"} is now in production.`, "success");
        await loadStudioData();
        if (res.project) {
          setSelectedProjectId(res.project.id);
          setActiveSubTab("projects");
        }
      } else {
        onNotify?.("Quote status updated to " + status, "info");
        await loadStudioData();
      }
    } catch (err: any) {
      console.error("[Studio Quote Action]", err);
      onNotify?.("Failed to update quote: " + (err.message || "Unknown error"), "error");
    }
  };

  // Sync Deliverable to Asset Vault
  const handleSyncToVault = async (deliverable: StudioDeliverable) => {
    if (!activeWorkspace?.id) return;
    try {
      await api.studio.deliverables.syncToVault(activeWorkspace.id, deliverable.id);
      onNotify?.(`Asset "${deliverable.name}" successfully archived into your Workspace Asset Vault!`, "success");
      await loadStudioData();
    } catch (err: any) {
      console.error("[Deliverable Sync]", err);
      onNotify?.("Failed to sync to vault: " + (err.message || "Unknown error"), "error");
    }
  };

  // Submit Revision Handler
  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace?.id || !targetDeliverableForRevision) return;
    if (!revisionRequestedChanges.trim()) {
      onNotify?.("Please specify the changes you would like our team to make.", "error");
      return;
    }

    try {
      await api.studio.revisions.create(activeWorkspace.id, {
        projectId: targetDeliverableForRevision.projectId,
        deliverableId: targetDeliverableForRevision.id,
        deliverableName: targetDeliverableForRevision.name,
        version: targetDeliverableForRevision.version || "V1",
        reason: revisionReason || "Visual & typography refinement",
        requestedChanges: revisionRequestedChanges,
      });

      onNotify?.("Revision request logged. Our lead designer has been notified.", "success");
      setIsRevisionModalOpen(false);
      setRevisionReason("");
      setRevisionRequestedChanges("");
      setTargetDeliverableForRevision(null);
      await loadStudioData();
    } catch (err: any) {
      console.error("[Submit Revision]", err);
      onNotify?.("Failed to submit revision: " + (err.message || "Unknown error"), "error");
    }
  };

  // Send Message Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace?.id || !newMessageText.trim()) return;
    setIsSendingMessage(true);
    try {
      await api.studio.messages.send(activeWorkspace.id, {
        projectId: selectedProjectId || undefined,
        requestId: selectedRequestId || undefined,
        content: newMessageText.trim(),
      });
      setNewMessageText("");
      const msgRes = await api.studio.messages.getAll(activeWorkspace.id, selectedProjectId || undefined);
      setMessages(msgRes.messages || []);
    } catch (err: any) {
      console.error("[Studio Send Message]", err);
      onNotify?.("Failed to send message: " + (err.message || "Unknown error"), "error");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const currentSelectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const currentProjectDeliverables = deliverables.filter((d) => !selectedProjectId || d.projectId === selectedProjectId);
  const currentProjectRevisions = revisions.filter((r) => !selectedProjectId || r.projectId === selectedProjectId);
  const currentProjectMessages = messages.filter((m) => !selectedProjectId || m.projectId === selectedProjectId);

  // Status counts for overview header
  const activeProjectsCount = projects.filter((p) => p.status !== "COMPLETED").length;
  const pendingQuotesCount = quotes.filter((q) => q.status === "SENT" || q.status === "DRAFT").length;
  const deliverablesReviewCount = deliverables.filter((d) => d.status === "ready_for_review").length;
  const activeRevisionsCount = revisions.filter((r) => r.status === "OPEN" || r.status === "IN_PROGRESS").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Studio Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800/80 p-6 md:p-8 shadow-xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PHASE 7 · KEEDOHUB STUDIO SERVICES</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-['Space_Grotesk'] text-white tracking-tight">
              Human Creative Production Layer
            </h1>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              Connect directly with Keedohub’s production team from inside your OS. Request high-fidelity cover artwork, brand identities, motion graphics, UI/UX, and marketing suites with end-to-end brief tracking.
            </p>
          </div>

          {/* Quick Action & Stat Pills */}
          <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 shrink-0">
            <button
              id="studio-new-request-btn"
              onClick={() => {
                setIsBriefBuilderOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-lg shadow-red-950/50 border border-red-400/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Request Studio Service</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Keedohub Production Queue: <strong>Active</strong></span>
            </div>
          </div>
        </div>

        {/* Operational Status Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-800/60">
          <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">Active Projects</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-['Space_Grotesk'] text-white">{activeProjectsCount}</span>
              <span className="text-[10px] text-emerald-400 font-mono">in studio</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">Pending Quotes</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-['Space_Grotesk'] text-amber-400">{pendingQuotesCount}</span>
              <span className="text-[10px] text-zinc-400 font-mono">awaiting review</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">Deliverables for Review</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-['Space_Grotesk'] text-cyan-400">{deliverablesReviewCount}</span>
              <span className="text-[10px] text-zinc-400 font-mono">ready</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">Open Revisions</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-['Space_Grotesk'] text-purple-400">{activeRevisionsCount}</span>
              <span className="text-[10px] text-zinc-400 font-mono">rendering</span>
            </div>
          </div>
        </div>
      </div>

      {/* Studio Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800/60">
        <button
          onClick={() => setActiveSubTab("projects")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === "projects"
              ? "bg-zinc-800 text-white font-semibold shadow-xs border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
          }`}
        >
          <Briefcase className="w-4 h-4 text-red-400" />
          <span>Production Projects</span>
          {projects.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-zinc-700 text-zinc-200">
              {projects.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("deliverables")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === "deliverables"
              ? "bg-zinc-800 text-white font-semibold shadow-xs border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Deliverables & Vault Sync</span>
          {deliverables.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-zinc-700 text-zinc-200">
              {deliverables.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("quotes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === "quotes"
              ? "bg-zinc-800 text-white font-semibold shadow-xs border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
          }`}
        >
          <DollarSign className="w-4 h-4 text-amber-400" />
          <span>Quotes & Approvals</span>
          {pendingQuotesCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {pendingQuotesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("requests")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === "requests"
              ? "bg-zinc-800 text-white font-semibold shadow-xs border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
          }`}
        >
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>Request History</span>
          {requests.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-zinc-700 text-zinc-200">
              {requests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("catalog")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === "catalog"
              ? "bg-zinc-800 text-white font-semibold shadow-xs border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
          }`}
        >
          <Palette className="w-4 h-4 text-purple-400" />
          <span>Service Catalog</span>
        </button>

        <button
          onClick={() => setActiveSubTab("messages")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === "messages"
              ? "bg-zinc-800 text-white font-semibold shadow-xs border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-rose-400" />
          <span>Studio Communications</span>
          {messages.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-zinc-700 text-zinc-200">
              {messages.length}
            </span>
          )}
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. SUB-VIEW: PRODUCTION PROJECTS */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === "projects" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project List Sidebar */}
          <div className="space-y-3 lg:col-span-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold font-['Space_Grotesk'] text-zinc-200 uppercase tracking-wider">
                Production Queue ({projects.length})
              </h3>
              <button
                onClick={() => setIsBriefBuilderOpen(true)}
                className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-center space-y-3">
                <Palette className="w-8 h-8 text-zinc-500 mx-auto" />
                <p className="text-sm text-zinc-400">No active studio projects in production.</p>
                <button
                  onClick={() => setIsBriefBuilderOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  Submit a Brief
                </button>
              </div>
            ) : (
              projects.map((proj) => {
                const isSelected = proj.id === (currentSelectedProject?.id);
                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProjectId(proj.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left space-y-2.5 ${
                      isSelected
                        ? "bg-zinc-800/90 border-red-500/50 shadow-md shadow-red-950/20"
                        : "bg-zinc-900/50 border-zinc-800/60 hover:bg-zinc-800/50 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                        {proj.serviceCategory.replace("_", " ")}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>Due {proj.deadline}</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug line-clamp-1">
                      {proj.title}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-zinc-800/60">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="capitalize">{proj.status.toLowerCase()}</span>
                      </span>
                      <span className="font-mono text-white font-semibold">
                        ${proj.budget} {proj.currency}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Project Details Workspace */}
          <div className="lg:col-span-2 space-y-6">
            {currentSelectedProject ? (
              <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-6">
                {/* Project Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/60">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                        PROJECT #{currentSelectedProject.id.substring(0, 8)}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 capitalize">
                        {currentSelectedProject.status}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold font-['Space_Grotesk'] text-white">
                      {currentSelectedProject.title}
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Service: <strong className="text-zinc-200">{currentSelectedProject.serviceCategory.replace("_", " ")}</strong> · Budget: <strong className="text-zinc-200">${currentSelectedProject.budget} {currentSelectedProject.currency}</strong>
                    </p>
                  </div>

                  {/* Assigned Creative Producer */}
                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3 shrink-0">
                    <img
                      src={currentSelectedProject.leadProducer.avatarUrl}
                      alt={currentSelectedProject.leadProducer.name}
                      className="w-10 h-10 rounded-full object-cover border border-red-500/40"
                    />
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 block uppercase">Lead Art Director</span>
                      <span className="text-xs font-bold text-white">{currentSelectedProject.leadProducer.name}</span>
                      <span className="text-[10px] text-zinc-400 block">Keedohub Creative Ops</span>
                    </div>
                  </div>
                </div>

                {/* Milestone Roadmap */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-400" />
                    <span>Production Milestones</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentSelectedProject.milestones.map((m, idx) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl border flex items-start gap-3 ${
                          m.completed
                            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                            : "bg-zinc-900/50 border-zinc-800 text-zinc-300"
                        }`}
                      >
                        <div className="mt-0.5">
                          {m.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-zinc-600 flex items-center justify-center text-[9px] font-mono text-zinc-400 font-bold">
                              {idx + 1}
                            </div>
                          )}
                        </div>
                        <div className="space-y-0.5 text-xs">
                          <span className="font-semibold block">{m.title}</span>
                          <span className="text-[10px] font-mono opacity-70">Target: {m.targetDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Deliverables Quick Cards */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span>Project Deliverables ({currentProjectDeliverables.length})</span>
                    </h4>
                    <button
                      onClick={() => setActiveSubTab("deliverables")}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>Full Deliverable Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentProjectDeliverables.map((del) => (
                      <div key={del.id} className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-800 text-zinc-300">
                            {del.version}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            del.status === "approved" || del.status === "delivered"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : del.status === "ready_for_review"
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold"
                              : "bg-zinc-800 text-zinc-400"
                          }`}>
                            {del.status.replace("_", " ")}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white line-clamp-1">{del.name}</h5>
                        <p className="text-[11px] text-zinc-400 line-clamp-1">{del.description}</p>
                        
                        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
                          {del.previewUrl && (
                            <a
                              href={del.previewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold text-center transition-all"
                            >
                              Preview
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setTargetDeliverableForRevision(del);
                              setIsRevisionModalOpen(true);
                            }}
                            className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-purple-900/40 hover:text-purple-300 text-zinc-300 text-[11px] font-semibold transition-all cursor-pointer"
                          >
                            Revise
                          </button>
                          <button
                            onClick={() => handleSyncToVault(del)}
                            className="flex-1 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 transition-all cursor-pointer"
                          >
                            Vault Sync
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Creative Brief Summary Accordion */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 text-xs">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                    Underlying Creative Brief Specs
                  </span>
                  <p className="text-zinc-300 leading-relaxed">
                    <strong>Concept:</strong> {currentSelectedProject.brief.concept || "High-impact creative direction"}
                  </p>
                  {currentSelectedProject.brief.visualDirection && (
                    <p className="text-zinc-300 leading-relaxed">
                      <strong>Visual Direction:</strong> {currentSelectedProject.brief.visualDirection}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-center space-y-3">
                <Palette className="w-10 h-10 text-zinc-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No Project Selected</h3>
                <p className="text-sm text-zinc-400">Select an active production project from the left queue to view details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. SUB-VIEW: DELIVERABLES & VAULT ARCHIVE */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === "deliverables" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white">
                Studio Deliverables & Asset Vault Integration
              </h3>
              <p className="text-xs text-zinc-400">
                Review master deliverables produced by Keedohub Studio. Approve and sync verified assets directly into your Workspace Asset Vault.
              </p>
            </div>
          </div>

          {deliverables.length === 0 ? (
            <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
              <Layers className="w-10 h-10 text-zinc-500 mx-auto" />
              <h4 className="text-base font-bold text-white">No Deliverables Yet</h4>
              <p className="text-sm text-zinc-400">Once your studio project reaches production, draft assets and master deliverables will appear here for review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deliverables.map((del) => {
                const isApproved = del.approvalStatus === "approved" || del.status === "delivered";
                return (
                  <div
                    key={del.id}
                    className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all space-y-4 shadow-lg"
                  >
                    {/* Media Preview Box */}
                    <div className="relative aspect-video sm:aspect-square max-h-60 w-full rounded-xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
                      {del.previewUrl ? (
                        <img
                          src={del.previewUrl}
                          alt={del.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center space-y-2 p-4">
                          <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
                          <span className="text-xs font-mono text-zinc-500 block">Render Preview in Progress</span>
                        </div>
                      )}

                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 backdrop-blur-md text-white border border-white/10">
                          {del.version}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 backdrop-blur-md text-zinc-300 border border-white/10">
                          {del.format}
                        </span>
                      </div>

                      <div className="absolute top-2 right-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold backdrop-blur-md ${
                          isApproved
                            ? "bg-emerald-500/80 text-white border border-emerald-400/40"
                            : del.status === "ready_for_review"
                            ? "bg-cyan-500/80 text-white border border-cyan-400/40 animate-pulse"
                            : "bg-zinc-800/80 text-zinc-300"
                        }`}>
                          {(del.status || "draft").toUpperCase().replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Description */}
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">{del.name}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">{del.description}</p>
                    </div>

                    {/* Revision & Approval Action Toolbar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800">
                      <button
                        onClick={() => setCollabCommentsDeliverable(del)}
                        className="py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                        <span>Feedback</span>
                      </button>

                      <button
                        onClick={() => setCollabRevisionsDeliverable(del)}
                        className="py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <History className="w-3.5 h-3.5 text-purple-400" />
                        <span>Revisions</span>
                      </button>

                      <button
                        onClick={() => setCollabApprovalDeliverable(del)}
                        className="py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-amber-300 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sign-Off</span>
                      </button>

                      <button
                        onClick={() => handleSyncToVault(del)}
                        className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isApproved
                            ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40"
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{isApproved ? "Synced" : "Vault"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. SUB-VIEW: QUOTES & COMMERCIAL APPROVALS */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === "quotes" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white">
              Studio Quotes & Proposals
            </h3>
            <p className="text-xs text-zinc-400">
              Review official quotes prepared by Keedohub Studio directors. Approve to immediately commission production.
            </p>
          </div>

          {quotes.length === 0 ? (
            <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
              <DollarSign className="w-10 h-10 text-zinc-500 mx-auto" />
              <h4 className="text-base font-bold text-white">No Quotes Generated Yet</h4>
              <p className="text-sm text-zinc-400">Submit a brief from the Service Catalog to receive a transparent price and timeline quote.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quotes.map((quote) => {
                const isApproved = quote.status === "APPROVED";
                const isDeclined = quote.status === "DECLINED";
                return (
                  <div
                    key={quote.id}
                    className={`p-6 rounded-2xl border transition-all space-y-5 shadow-xl ${
                      isApproved
                        ? "bg-emerald-950/10 border-emerald-500/30"
                        : isDeclined
                        ? "bg-zinc-900/40 border-zinc-800 opacity-60"
                        : "bg-zinc-900/70 border-zinc-800 hover:border-amber-500/40"
                    }`}
                  >
                    {/* Quote Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            QUOTE #{quote.id.substring(0, 8)}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            isApproved
                              ? "bg-emerald-500/20 text-emerald-300"
                              : isDeclined
                              ? "bg-red-500/20 text-red-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}>
                            {quote.status}
                          </span>
                        </div>
                        <h4 className="text-base md:text-lg font-bold text-white">{quote.serviceName}</h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xl md:text-2xl font-bold font-['Space_Grotesk'] text-white">
                          ${quote.price}
                        </span>
                        <span className="text-xs text-zinc-400 block font-mono">{quote.currency}</span>
                      </div>
                    </div>

                    {/* Scope & Timeline */}
                    <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/80">
                      {quote.scopeSummary}
                    </p>

                    {/* Deliverables Checklist */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                        Included Deliverables:
                      </span>
                      <ul className="space-y-1 text-xs text-zinc-300">
                        {quote.deliverables.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Quote Parameters Footer */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-400 pt-3 border-t border-zinc-800">
                      <div>
                        <span>Timeline:</span> <strong className="text-white">{quote.timeline}</strong>
                      </div>
                      <div>
                        <span>Revisions:</span> <strong className="text-white">{quote.revisionAllowance} Included</strong>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {!isApproved && !isDeclined && (
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={() => handleUpdateQuoteStatus(quote, "DECLINED")}
                          className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleUpdateQuoteStatus(quote, "APPROVED")}
                          className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-950/40 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Start Production</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. SUB-VIEW: REQUEST HISTORY */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === "requests" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white">
                Studio Creative Briefs & Lifecycle Tracking
              </h3>
              <p className="text-xs text-zinc-400">
                Full history of all service requests initiated from your workspace.
              </p>
            </div>
            <button
              onClick={() => setIsBriefBuilderOpen(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Brief</span>
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
              <FileCheck className="w-10 h-10 text-zinc-500 mx-auto" />
              <h4 className="text-base font-bold text-white">No Creative Requests Logged</h4>
              <p className="text-sm text-zinc-400">Choose a service from our catalog to submit your first creative brief.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-red-400">
                        {req.serviceName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                        {req.status}
                      </span>
                      {req.origin !== "direct" && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-purple-500/10 text-purple-400">
                          {req.origin.replace("_", " ")}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white">{req.title}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-1">{req.brief.concept || "Concept stored in brief"}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-zinc-400">
                      Budget: <strong>${req.brief.targetBudget}</strong>
                    </span>
                    {req.projectId && (
                      <button
                        onClick={() => {
                          setSelectedProjectId(req.projectId!);
                          setActiveSubTab("projects");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-all cursor-pointer"
                      >
                        View Project
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. SUB-VIEW: SERVICE CATALOG */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === "catalog" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white">
              Official Keedohub Creative Service Catalog
            </h3>
            <p className="text-xs text-zinc-400">
              Select any creative discipline below to open our adaptive brief builder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {serviceCatalog.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-red-500/40 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                      {cat.icon}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {cat.turnaround}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">{cat.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{cat.description}</p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-300">
                    <span className="font-mono text-zinc-500 text-[10px] block uppercase">Typical Deliverables:</span>
                    <ul className="space-y-0.5">
                      {(cat.deliverables || []).slice(0, 3).map((d, i) => (
                        <li key={i} className="flex items-center gap-1.5 truncate">
                          <Check className="w-3 h-3 text-red-400 shrink-0" />
                          <span className="truncate">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">{cat.startingPrice}</span>
                  <button
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setIsBriefBuilderOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Request Brief</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 6. SUB-VIEW: STUDIO COMMUNICATIONS */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === "messages" && (
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-white">Direct Production Messaging</h3>
              <p className="text-xs text-zinc-400">Collaborate in real-time with your assigned lead producers and art directors.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Studio Channel Encrypted
            </span>
          </div>

          {/* Message Stream */}
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No messages yet. Send a note to your assigned creative lead below.
              </div>
            ) : (
              messages.map((msg) => {
                const isFromClient = msg.senderRole === "client";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isFromClient ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-zinc-300">{msg.senderName}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase">
                        {msg.senderRole}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] sm:max-w-[70%] ${
                        isFromClient
                          ? "bg-red-600 text-white rounded-tr-none shadow-md"
                          : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4 border-t border-zinc-800">
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="Type message to Keedohub Studio creative director..."
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              disabled={isSendingMessage || !newMessageText.trim()}
              className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: ADAPTIVE BRIEF BUILDER WITH AI ASSIST */}
      {/* ---------------------------------------------------- */}
      {isBriefBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl p-6 md:p-8 space-y-6 my-8">
            <button
              onClick={() => setIsBriefBuilderOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 font-mono text-xs font-bold">
                <PenTool className="w-3.5 h-3.5" />
                <span>ADAPTIVE BRIEF BUILDER</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold font-['Space_Grotesk'] text-white">
                Commission Creative Production
              </h3>
              <p className="text-xs text-zinc-400">
                Provide the creative scope. Use our built-in AI Creative Director to polish your vision before submission.
              </p>
            </div>

            <form onSubmit={handleSubmitBrief} className="space-y-5">
              {/* Category Selector Tabs */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-300 block uppercase">
                  1. Creative Service Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {serviceCatalog.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedCategory === cat.id
                          ? "bg-red-600/20 border-red-500 text-white font-bold"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span className="text-[11px] leading-tight block">{cat.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Release/Campaign Linking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-zinc-300 block uppercase">
                    2. Request Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={briefTitle}
                    onChange={(e) => setBriefTitle(e.target.value)}
                    placeholder="e.g. Midnight in VI — Master Cover & Motion Loop"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-zinc-300 block uppercase">
                    Link to Active Release or Campaign (Optional)
                  </label>
                  <select
                    value={selectedReleaseId}
                    onChange={(e) => setSelectedReleaseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500"
                  >
                    <option value="">-- Direct Workspace Request --</option>
                    {releases.map((r) => (
                      <option key={r.id} value={r.id}>
                        Release: {r.title} ({r.releaseDate || "TBD"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Concept & Narrative */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-zinc-300 block uppercase">
                    3. Concept & Artistic Direction
                  </label>
                  <button
                    type="button"
                    onClick={handleAiBriefAssist}
                    disabled={isAiAssisting}
                    className="text-[11px] font-mono text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{isAiAssisting ? "AI Optimizing..." : "AI Enhance Concept"}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={briefConcept}
                  onChange={(e) => setBriefConcept(e.target.value)}
                  placeholder="Describe the story, mood, visual metaphors, or overall vibe you want to project..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs leading-relaxed focus:outline-none focus:border-red-500"
                />
              </div>

              {/* AI Clarification Panel if Run */}
              {aiAssistResult && (
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-red-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Executive Creative Director Recommendations</span>
                  </div>
                  {aiAssistResult.clarifyingQuestions.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Considerations to note:</span>
                      <ul className="list-disc list-inside text-zinc-300 space-y-0.5">
                        {aiAssistResult.clarifyingQuestions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Deliverables & Target Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-zinc-300 block uppercase">
                    Required Deliverables (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={briefDeliverables}
                    onChange={(e) => setBriefDeliverables(e.target.value)}
                    placeholder="3000x3000px Master Cover PNG&#10;Spotify 9:16 Canvas MP4&#10;Social Story Kit"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs leading-relaxed focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-zinc-300 block uppercase">
                      Target Budget & Currency
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={briefTargetBudget}
                        onChange={(e) => setBriefTargetBudget(Number(e.target.value))}
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-red-500"
                      />
                      <select
                        value={briefCurrency}
                        onChange={(e) => setBriefCurrency(e.target.value as "USD" | "NGN")}
                        className="px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-red-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="NGN">NGN (₦)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-zinc-300 block uppercase">
                      Target Deadline
                    </label>
                    <input
                      type="date"
                      value={briefDeadline}
                      onChange={(e) => setBriefDeadline(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsBriefBuilderOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-950/50 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Creative Brief</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: SUBMIT REVISION REQUEST */}
      {/* ---------------------------------------------------- */}
      {isRevisionModalOpen && targetDeliverableForRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl p-6 space-y-5">
            <button
              onClick={() => setIsRevisionModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">
                Revision Request · {targetDeliverableForRevision.version}
              </span>
              <h3 className="text-lg font-bold text-white">
                Log Revision for "{targetDeliverableForRevision.name}"
              </h3>
            </div>

            <form onSubmit={handleSubmitRevision} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-300 block uppercase">
                  Primary Reason for Revision
                </label>
                <input
                  type="text"
                  required
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  placeholder="e.g. Typography kerning, lighting contrast, color tone"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-300 block uppercase">
                  Specific Changes Requested *
                </label>
                <textarea
                  rows={4}
                  required
                  value={revisionRequestedChanges}
                  onChange={(e) => setRevisionRequestedChanges(e.target.value)}
                  placeholder="Please specify exact changes: e.g. tighten letter spacing on Victoria Island by -2%, brighten ambient crimson glow on the background..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs leading-relaxed focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Submit Revision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phase 15: Collaboration Modals for Deliverables */}
      {collabApprovalDeliverable && (
        <ApprovalModal
          isOpen={Boolean(collabApprovalDeliverable)}
          onClose={() => setCollabApprovalDeliverable(null)}
          entityType="deliverable"
          entityId={collabApprovalDeliverable.id}
          entityTitle={collabApprovalDeliverable.name}
          workspaceId={activeWorkspace?.id || ""}
          currentUser={
            user
              ? {
                  id: user.id,
                  email: user.email,
                  name: user.fullName,
                  role: activeWorkspace?.role || "owner",
                }
              : undefined
          }
          onSuccess={() => {
            if (onNotify) onNotify("Approval state updated successfully", "success");
            setCollabApprovalDeliverable(null);
          }}
        />
      )}

      {collabRevisionsDeliverable && (
        <RevisionHistoryModal
          isOpen={Boolean(collabRevisionsDeliverable)}
          onClose={() => setCollabRevisionsDeliverable(null)}
          entityType="deliverable"
          entityId={collabRevisionsDeliverable.id}
          entityTitle={collabRevisionsDeliverable.name}
          workspaceId={activeWorkspace?.id || ""}
          currentUser={
            user
              ? {
                  id: user.id,
                  email: user.email,
                  name: user.fullName,
                  role: activeWorkspace?.role || "owner",
                }
              : undefined
          }
        />
      )}

      {collabCommentsDeliverable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  Deliverable Feedback & Discussion
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">{collabCommentsDeliverable.name}</p>
              </div>
              <button
                onClick={() => setCollabCommentsDeliverable(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <CommentsSection
              entityType="deliverable"
              entityId={collabCommentsDeliverable.id}
              workspaceId={activeWorkspace?.id || ""}
              currentUser={
                user
                  ? {
                      id: user.id,
                      email: user.email,
                      name: user.fullName,
                      role: activeWorkspace?.role || "owner",
                    }
                  : undefined
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
