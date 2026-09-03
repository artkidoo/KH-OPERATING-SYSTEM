import React, { useState } from "react";
import { ActiveTab } from "../../types";
import { 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Send,
  MessageCircle,
  Clock
} from "lucide-react";

interface PageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

interface ForumThread {
  id: string;
  category: string;
  title: string;
  author: string;
  replies: number;
  timeAgo: string;
  isPinned?: boolean;
}

const FORUM_THREADS: ForumThread[] = [
  {
    id: "th-1",
    category: "Release Strategy",
    title: "How we secured editorial placement on African Heat with 14-day pitch lead time",
    author: "Damola (Sound Architect)",
    replies: 24,
    timeAgo: "2 hours ago",
    isPinned: true
  },
  {
    id: "th-2",
    category: "Cover Art",
    title: "Optimizing 3000x3000px artwork for mobile lock screens & Spotify canvas loops",
    author: "Ojo Abdulkareem",
    replies: 18,
    timeAgo: "5 hours ago",
    isPinned: true
  },
  {
    id: "th-3",
    category: "Mastering QA",
    title: "Why Spotify turns down songs louder than -14 LUFS (and how to protect dynamics)",
    author: "Kelvin Audio",
    replies: 31,
    timeAgo: "Yesterday"
  },
  {
    id: "th-4",
    category: "Brand Architecture",
    title: "Structuring vector brand guidelines that agencies cannot ruin",
    author: "Studio Mono",
    replies: 12,
    timeAgo: "2 days ago"
  },
  {
    id: "th-5",
    category: "Legal & Splits",
    title: "Sample clearance and producer master splits: The standard 50/50 breakdown",
    author: "Lex Legal",
    replies: 45,
    timeAgo: "3 days ago"
  }
];

export const ForumPage: React.FC<PageProps> = ({ onNavigateTab, openBriefModal }) => {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="space-y-12 sm:space-y-16 py-4 sm:py-8 animate-fade-in text-left">
      {/* Page Hero */}
      <section className="relative overflow-hidden rounded-3xl bento-card p-6 sm:p-10 md:p-14 border border-[var(--bento-border)] bg-gradient-to-b from-[var(--bento-card)] to-[var(--bento-bg)]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-pill-text)] text-xs font-mono font-bold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5 text-red-500" />
            <span>Community Forum & Creator Discussions</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--bento-text)] tracking-tight leading-tight">
            Keedohub Creator Forum.
          </h1>
          <p className="text-base sm:text-lg text-[var(--bento-muted)] leading-relaxed font-normal">
            A peer-to-peer exchange of release tactics, mastering benchmarks, visual identity critique, and legal split insights from working music artists and brand operators.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab("command-center")}
              className="px-5 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs sm:text-sm font-['Space_Grotesk'] flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Join via Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Discussion Board */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", "Release Strategy", "Cover Art", "Mastering QA", "Brand Architecture", "Legal & Splits"].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-theme-accent text-white font-bold shadow-xs"
                    : "bg-[var(--bento-card)] border border-[var(--bento-border)] text-[var(--bento-muted)] hover:text-[var(--bento-text)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab("command-center")}
            className="px-3.5 py-1.5 rounded-xl bg-theme-accent text-white font-bold text-xs font-['Space_Grotesk'] flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Send className="w-3 h-3" />
            <span>New Discussion</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-2 sm:gap-4 lg:grid-cols-3">
          {FORUM_THREADS.filter(t => activeCategory === "All" || t.category === activeCategory).map(thread => (
            <div
              key={thread.id}
              className="bento-card p-3.5 sm:p-5 rounded-2xl border border-[var(--bento-border)] flex flex-col justify-between gap-3 hover:border-red-500/40 transition-colors cursor-pointer group"
              onClick={() => onNavigateTab("command-center")}
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--accent-pill-text)] uppercase">
                    {thread.category}
                  </span>
                  {thread.isPinned && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      PINNED
                    </span>
                  )}
                </div>
                <h3 className="font-['Space_Grotesk'] font-bold text-sm sm:text-base text-[var(--bento-text)] group-hover:text-red-400 transition-colors">
                  {thread.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--bento-muted)]">
                  <span>By <strong>{thread.author}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {thread.timeAgo}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--bento-muted)] shrink-0">
                <MessageCircle className="w-4 h-4 text-red-400" />
                <span>{thread.replies} replies</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
