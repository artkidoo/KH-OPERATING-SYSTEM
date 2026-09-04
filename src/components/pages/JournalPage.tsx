import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  Disc3,
  Building2,
  Brain,
  Clock,
  Calendar,
  Share2,
  CheckCircle2,
  TrendingUp,
  Tag,
  Search,
  ExternalLink,
  ChevronRight,
  UserCheck
} from "lucide-react";

export type JournalPillar = "all" | "artist" | "brand" | "creative_intelligence";

export interface JournalArticle {
  id: string;
  slug: string;
  pillar: "artist" | "brand" | "creative_intelligence";
  pillarLabel: string;
  title: string;
  subtitle: string;
  readTime: string;
  publishedAt: string;
  author: {
    name: string;
    role: string;
    avatarUrl: string;
  };
  tags: string[];
  excerpt: string;
  content: string[];
  takeaways: string[];
  ctaText: string;
  ctaAction: "artist_signup" | "brand_signup";
}

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: "art-1",
    slug: "post-release-momentum-strategy",
    pillar: "artist",
    pillarLabel: "Artist Operating System",
    title: "The 6-Week Post-Release Engine: Why 80% of Streaming Lifespan Happens After Release Day",
    subtitle: "Stop treating release day as the finish line. How modern independent artists build perpetual catalog momentum.",
    readTime: "6 min read",
    publishedAt: "September 2026",
    author: {
      name: "Dami Vanguard",
      role: "Lead Artist Architect, Keedohub",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    tags: ["Release Strategy", "Music Marketing", "Post-Release Growth", "DSP Strategy"],
    excerpt: "Most artists exhaust their energy, budget, and creative capacity on the 48 hours surrounding release day, leaving their master catalog stranded. Learn how to sequence Week 1 to 6 post-release assets.",
    content: [
      "Every Friday, over 100,000 new songs are uploaded to major streaming platforms. Algorithms like Spotify's Release Radar and Discover Weekly do not measure release-day vanity numbers; they measure algorithmic velocity, completion rates, save-to-listener ratios, and playlist-add momentum over a 28-day window.",
      "The fatal flaw of modern music rollout is treating release day as an arrival point. In reality, release day is simply minute zero. In the Artist Operating Environment, releases are engineered with a three-tier lifecycle: Pre-Release (Hook Discovery), Launch Window (Conversion), and Post-Release (Algorithmic Anchor).",
      "By setting up contextual Artist DNA before your audio hits distribution, you store your core audience personas, sound aesthetics, and lyric themes in Keedohub's Creative Brain. When week 3 hits, the system automatically suggests fresh narrative angles and contextual reels instead of desperate 'stream my song' posts."
    ],
    takeaways: [
      "Week 1: Focus purely on save-rate and organic listener retention over raw play counts.",
      "Week 2-3: Transition from audio announcement to lyric-story breakdown and community user-generated clips.",
      "Week 4-6: Pitch DSP editors with real 28-day retention metrics for editorial consideration.",
      "Anchor all promotional assets to your central Artist DNA to keep brand coherence intact."
    ],
    ctaText: "Setup your Artist DNA & 6-Week Release Engine",
    ctaAction: "artist_signup"
  },
  {
    id: "art-2",
    slug: "dsp-pitching-playbook",
    pillar: "artist",
    pillarLabel: "DSP Strategy",
    title: "The Direct-to-Editor DSP Pitch: How to Frame Your Metadata for Algorithmic & Human Placement",
    subtitle: "The exact framework Spotify for Artists and Apple Music editorial curators look for in 500-word pitches.",
    readTime: "5 min read",
    publishedAt: "August 2026",
    author: {
      name: "Marcus Cole",
      role: "Editorial & Music Curator",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    tags: ["DSP Pitch", "Spotify for Artists", "Metadata", "Music Marketing"],
    excerpt: "Editorial curators read hundreds of pitches every day. Generic marketing claims get skipped. Specific sound palettes, cultural hooks, and planned promo budgets get placed.",
    content: [
      "When editors open Spotify for Artists or Apple Music for Artists, they scan for three specific pillars: sonic reference points (who does this sit next to?), cultural context (what subculture or mood does this serve?), and the artist's confirmed marketing commit.",
      "Writing 'this is my best song yet' guarantees your pitch is ignored. Editors want objective sonic anchors: 'combines Nigerian Alté rhythms with UK Garage basslines, tailored for late-night driving and chill electronic playlists.'",
      "Using the Keedohub DSP Pitch tool, your Artist DNA automatically populates the exact genre micro-tags, instruments, emotional mood curves, and cross-platform campaign strategy directly into your pitch draft."
    ],
    takeaways: [
      "Submit your master audio and pitch at least 21 days prior to release date.",
      "Always list 2 specific marquee playlist targets and explain why your track fits the editorial sequence.",
      "Detail your external traffic commitment: mention planned Reels, TikTok sounds, and direct pre-save ads.",
      "Keep metadata (ISRC, UPC, clean explicit tags, producer credits) pristine and verified."
    ],
    ctaText: "Draft your DSP Pitch in Artist OS",
    ctaAction: "artist_signup"
  },
  {
    id: "brand-1",
    slug: "brand-operating-systems-vs-scattered-tools",
    pillar: "brand",
    pillarLabel: "Brand Operating System",
    title: "Beyond the CRM: Why High-Growth Businesses Are Moving to Operating Environments",
    subtitle: "When your positioning, business documents, contracts, and marketing share the same DNA, execution accelerates 10x.",
    readTime: "7 min read",
    publishedAt: "September 2026",
    author: {
      name: "Elena Rostova",
      role: "Brand Strategy Director",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    },
    tags: ["Branding", "Positioning", "Business Systems", "Operations"],
    excerpt: "Most creative agencies and modern brands juggle 7 different tools: Notion for notes, Google Docs for proposals, Stripe for billing, and Slack for chat. Here is why unifying your Brand DNA transforms delivery.",
    content: [
      "Disconnection is the silent killer of early and mid-stage businesses. The marketing team writes copy that contradicts sales agreements; proposals don't reflect updated pricing tiers; and invoice generation takes 45 minutes of manual back-and-forth.",
      "A true Brand Operating Environment unifies Brand DNA (positioning, value proposition, client personas, core offers) with Business Operations (proposals, contracts, invoices, and service deliveries).",
      "When a client requests a quote, Keedohub automatically pulls from your verified Products & Services catalog, applies your branded typography and voice, and issues a trackable proposal ready for instant e-signature."
    ],
    takeaways: [
      "Eliminate fragmented dashboards in favor of ONE central operating context.",
      "Anchor company letters, proposals, and contracts to immutable Brand DNA guidelines.",
      "Speed up the quote-to-cash lifecycle from 5 days to under 15 minutes.",
      "Ensure every outgoing artifact mirrors the brand's premium positioning."
    ],
    ctaText: "Operationalize Your Business with Brand OS",
    ctaAction: "brand_signup"
  },
  {
    id: "ci-1",
    slug: "contextual-ai-creative-intelligence",
    pillar: "creative_intelligence",
    pillarLabel: "Creative Intelligence",
    title: "Context Over Prompting: Why AI Without Deep DNA Produces Generic Creative Slop",
    subtitle: "The future of generative systems isn't writing longer prompts; it is feeding persistent operating memory into intelligent engines.",
    readTime: "8 min read",
    publishedAt: "September 2026",
    author: {
      name: "Kaelen Vance",
      role: "AI & Creative Technology Lead",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    tags: ["Creative Intelligence", "AI Architecture", "Culture & Trends", "Creative Brain"],
    excerpt: "Every generic ChatGPT prompt yields the same corporate jargon. How Keedohub's Creative Brain fuses DNA, upcoming deadlines, and existing catalog to output high-conviction creative direction.",
    content: [
      "The novelty of generic text and image generation has faded. When every creator and company has access to the same foundational models, generic outputs blend into white noise. The differentiator is proprietary context.",
      "In Keedohub, the Creative Brain does not ask you for prompts. It already knows your target demographic, your sonic signatures, your competitive landscape, your current release stage, and your unresolved tasks.",
      "Formula: Artist/Brand DNA + Active Release/Campaign + Upcoming Deadlines + Catalog History = Operating Intelligence. The system simply surfaces the next best action."
    ],
    takeaways: [
      "Stop wasting hours crafting multi-paragraph prompts into isolated chatbots.",
      "Maintain a living creative memory that grows smarter with every release and project completed.",
      "Let intelligence handle operational grunt work so you focus entirely on high-taste creative execution."
    ],
    ctaText: "Experience Contextual Creative Brain",
    ctaAction: "artist_signup"
  }
];

interface JournalPageProps {
  onOpenAuth?: (mode: "login" | "signup", defaultIdentity?: "artist" | "brand") => void;
  onNavigateTab?: (tab: string) => void;
}

export const JournalPage: React.FC<JournalPageProps> = ({ onOpenAuth, onNavigateTab }) => {
  const [selectedPillar, setSelectedPillar] = useState<JournalPillar>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeArticle, setActiveArticle] = useState<JournalArticle | null>(null);

  const filteredArticles = JOURNAL_ARTICLES.filter((article) => {
    const matchesPillar = selectedPillar === "all" || article.pillar === selectedPillar;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPillar && matchesSearch;
  });

  const handleCtaClick = (article: JournalArticle) => {
    if (onOpenAuth) {
      onOpenAuth("signup", article.pillar === "brand" ? "brand" : "artist");
    } else if (onNavigateTab) {
      onNavigateTab("overview");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0a0a0c] text-zinc-100 selection:bg-red-600 selection:text-white pb-24">
      {/* Top Editorial Banner */}
      <div className="relative border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 via-[#0d0d11] to-[#0a0a0c] px-4 sm:px-8 py-16 sm:py-24 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-950/60 border border-red-500/30 text-red-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span>The Keedohub Journal & Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            The Blueprint for Modern Music Artists & Creative Brands.
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl leading-relaxed">
            In-depth operational essays, release strategies, positioning frameworks, and creative intelligence. Written by practitioners for independent innovators.
          </p>

          {/* Search & Pillar Filtering */}
          <div className="pt-6 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-zinc-800/60">
            {/* Pillars */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => setSelectedPillar("all")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedPillar === "all"
                    ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                All Editorial
              </button>

              <button
                onClick={() => setSelectedPillar("artist")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedPillar === "artist"
                    ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <Disc3 className="w-3.5 h-3.5 text-red-400" />
                Artist Operating System
              </button>

              <button
                onClick={() => setSelectedPillar("brand")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedPillar === "brand"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Brand Operating System
              </button>

              <button
                onClick={() => setSelectedPillar("creative_intelligence")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedPillar === "creative_intelligence"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                Creative Intelligence
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search frameworks..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredArticles.map((article) => {
            const isArtist = article.pillar === "artist";
            const isBrand = article.pillar === "brand";

            return (
              <article
                key={article.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all duration-300 shadow-xl"
              >
                <div className="space-y-4">
                  {/* Pillar Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        isArtist
                          ? "bg-red-950/40 text-red-400 border-red-500/30"
                          : isBrand
                          ? "bg-blue-950/40 text-blue-400 border-blue-500/30"
                          : "bg-purple-950/40 text-purple-400 border-purple-500/30"
                      }`}
                    >
                      {isArtist && <Disc3 className="w-3 h-3" />}
                      {isBrand && <Building2 className="w-3 h-3" />}
                      {!isArtist && !isBrand && <Brain className="w-3 h-3" />}
                      {article.pillarLabel}
                    </span>

                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h2
                    onClick={() => setActiveArticle(article)}
                    className="text-xl sm:text-2xl font-black text-white group-hover:text-red-400 transition-colors cursor-pointer leading-snug"
                  >
                    {article.title}
                  </h2>

                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {article.subtitle}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer & Read Link */}
                <div className="pt-6 mt-6 border-t border-zinc-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={article.author.avatarUrl}
                      alt={article.author.name}
                      className="w-7 h-7 rounded-full object-cover border border-zinc-700"
                    />
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">{article.author.name}</p>
                      <p className="text-[10px] text-zinc-500">{article.publishedAt}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveArticle(article)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <span>Read Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Acquisition Banner: Education -> Trust -> Account Creation -> DNA Setup */}
        <div className="mt-16 relative overflow-hidden rounded-3xl border border-red-500/30 bg-gradient-to-r from-red-950/50 via-zinc-900 to-black p-8 sm:p-12 text-center shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30">
              Ready to Operationalize
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Stop juggling scattered files. Step into your dedicated Operating Environment.
            </h3>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Define your Artist DNA or Brand DNA once. Keedohub fuses your positioning with release lifecycles, operations, and contextual creative intelligence.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onOpenAuth ? onOpenAuth("signup", "artist") : onNavigateTab?.("artist-os")}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-red-950/50 cursor-pointer flex items-center justify-center gap-2"
              >
                <Disc3 className="w-4 h-4" />
                <span>Launch Artist Environment</span>
              </button>

              <button
                onClick={() => onOpenAuth ? onOpenAuth("signup", "brand") : onNavigateTab?.("brand-os")}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs tracking-wide transition-all border border-zinc-700 cursor-pointer flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Launch Brand Environment</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-800 bg-[#0d0d12] p-6 sm:p-10 shadow-2xl space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Header info */}
            <div className="space-y-3 pr-10">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                {activeArticle.pillarLabel} • {activeArticle.readTime}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {activeArticle.title}
              </h2>
              <p className="text-base text-zinc-300 italic">
                {activeArticle.subtitle}
              </p>
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <img
                src={activeArticle.author.avatarUrl}
                alt={activeArticle.author.name}
                className="w-10 h-10 rounded-full object-cover border border-zinc-700"
              />
              <div>
                <p className="text-xs font-bold text-white">{activeArticle.author.name}</p>
                <p className="text-[11px] text-zinc-400">{activeArticle.author.role}</p>
              </div>
            </div>

            {/* Body Content */}
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed font-sans border-t border-zinc-800/80 pt-4">
              {activeArticle.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Key Takeaways */}
            <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-5 space-y-3">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Operational Takeaways
              </h4>
              <ul className="space-y-2 text-xs text-zinc-300">
                {activeArticle.takeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action CTA */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800">
              <div className="text-xs text-zinc-400">
                Apply this framework directly inside your Keedohub workspace.
              </div>
              <button
                onClick={() => {
                  handleCtaClick(activeArticle);
                  setActiveArticle(null);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-red-900/50 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{activeArticle.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
