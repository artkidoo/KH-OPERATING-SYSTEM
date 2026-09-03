import React, { useState, useMemo } from "react";
import { ActiveTab } from "../../types";
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ArrowRight,
  Disc3,
  Briefcase,
  ShieldCheck
} from "lucide-react";

interface PageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  openBriefModal: () => void;
}

interface FAQItem {
  id: string;
  category: "all" | "workspace" | "artist" | "brand" | "legal";
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "faq-1",
    category: "workspace",
    question: "What is Keedohub?",
    answer: "Keedohub is a unified Creative Operating System built for music artists and modern businesses. Rather than juggling dozens of fragmented tools, Keedohub consolidates release management, visual studios, automated editorial pitching, split sheet calculations, and proactive creative intelligence inside one environment."
  },
  {
    id: "faq-2",
    category: "workspace",
    question: "What is the difference between a Workspace and an OS?",
    answer: "A Workspace is your private environment holding your specific songs, campaigns, contracts, and team members. Artist OS and Brand OS are the operating systems powering that workspace depending on whether you are managing musical releases or brand campaigns."
  },
  {
    id: "faq-3",
    category: "artist",
    question: "What is the 7-Pillar Release Readiness standard?",
    answer: "Every single or album inside Artist OS is audited across 7 critical criteria before drop day: (1) Master Audio WAV & LUFS loudness verification, (2) Synchronized LRC & Apple Music lyrics, (3) 100% locked producer and songwriter split sheets, (4) Official 3000x3000px 300DPI artwork, (5) Editorial DSP pitch letter, (6) Smart Pre-save landing links, and (7) Press EPK dossier."
  },
  {
    id: "faq-4",
    category: "artist",
    question: "How does the Cover Studio ensure DSP compliance?",
    answer: "The Cover Studio renders assets strictly at 3000x3000px resolution in sRGB color profile, meeting Apple Music, Spotify, TIDAL, and Audiomack ingestion requirements without lossy compression or pixel distortion."
  },
  {
    id: "faq-5",
    category: "brand",
    question: "What does Brand OS provide for businesses?",
    answer: "Brand OS structures your visual brand tokens (color palettes, font pairings, marks), launches 30-day marketing sprint campaigns, tracks product catalogs, and prepares multi-platform social media calendars with high-retention hooks."
  },
  {
    id: "faq-6",
    category: "legal",
    question: "Who owns the intellectual property created in Keedohub?",
    answer: "You do. 100% of the masters, split sheets, stems, artwork, brand guidelines, and copy created or stored in Keedohub belong unconditionally to the creator or business that owns the workspace. We never claim royalty stakes or copyright over your creative outputs."
  },
  {
    id: "faq-7",
    category: "workspace",
    question: "What is the Creative Brain and how does it work?",
    answer: "The Creative Brain is an autonomous reasoning engine embedded in Keedohub. It continuously audits your workspace, identifying missing release assets or marketing gaps, and can execute tools on your behalf—such as generating 30-day release playbooks, diagnosing LUFS mastering anomalies, or creating action tasks."
  },
  {
    id: "faq-8",
    category: "legal",
    question: "Are split sheets generated in Keedohub legally binding?",
    answer: "Keedohub split sheets follow standard international publishing and master recording split conventions, documenting legal songwriter names, IPI numbers, PRO affiliations, and percentage shares. Once signed by all collaborators, they serve as authoritative documentation for DSP distributors and collection societies."
  },
  {
    id: "faq-9",
    category: "workspace",
    question: "Can I collaborate with my team, manager, or clients?",
    answer: "Yes. Workspaces support role-based collaboration. You can invite managers, producers, mix engineers, or brand executives to review deliverables, leave threaded comments, and provide official approvals."
  }
];

export const FAQPage: React.FC<PageProps> = ({ onNavigateTab, openBriefModal }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "workspace" | "artist" | "brand" | "legal">("all");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ "faq-1": true, "faq-3": true });

  const toggleItem = (id: string) => {
    setOpenIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const matchesSearch = searchQuery.trim() === "" ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="space-y-12 sm:space-y-16 py-4 sm:py-8 animate-fade-in text-left">
      {/* Page Hero */}
      <section className="relative overflow-hidden rounded-3xl bento-card p-6 sm:p-10 md:p-14 border border-[var(--bento-border)] bg-gradient-to-b from-[var(--bento-card)] to-[var(--bento-bg)]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-pill-text)] text-xs font-mono font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-red-500" />
            <span>Knowledge Base & FAQs</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--bento-text)] tracking-tight leading-tight">
            Frequently Asked Questions.
          </h1>
          <p className="text-base sm:text-lg text-[var(--bento-muted)] leading-relaxed font-normal">
            Everything you need to know about the Keedohub Creative OS, Artist Workspace, Brand Architecture, IP ownership, and intelligent automation.
          </p>
        </div>
      </section>

      {/* Search & Category Filter */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[var(--bento-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search answers..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-xs sm:text-sm text-[var(--bento-text)] focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: "all", label: "All Questions" },
              { id: "workspace", label: "Workspace & OS" },
              { id: "artist", label: "Artist OS" },
              { id: "brand", label: "Brand OS" },
              { id: "legal", label: "Legal & IP" },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-theme-accent text-white font-bold shadow-xs"
                    : "bg-[var(--bento-card)] border border-[var(--bento-border)] text-[var(--bento-muted)] hover:text-[var(--bento-text)]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion Questions */}
        <div className="space-y-3 pt-2">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 bento-card rounded-2xl border border-[var(--bento-border)] text-center text-sm text-[var(--bento-muted)]">
              No questions found matching "{searchQuery}". Try a different keyword or contact our support team.
            </div>
          ) : (
            filteredFaqs.map(item => {
              const isOpen = Boolean(openIds[item.id]);
              return (
                <div
                  key={item.id}
                  className="bento-card rounded-2xl border border-[var(--bento-border)] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[var(--bento-elevated)] transition-colors"
                  >
                    <span className="font-['Space_Grotesk'] font-bold text-sm sm:text-base text-[var(--bento-text)]">
                      {item.question}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[var(--bento-input)] border border-[var(--bento-border)] flex items-center justify-center text-[var(--bento-muted)] shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[var(--bento-muted)] leading-relaxed border-t border-[var(--bento-border)]/50 pt-4 animate-fade-in">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="bento-card p-6 sm:p-8 rounded-2xl border border-[var(--bento-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <h3 className="font-['Space_Grotesk'] font-bold text-base sm:text-lg text-[var(--bento-text)]">
            Still have a question?
          </h3>
          <p className="text-xs text-[var(--bento-muted)]">
            Our creative support team is available on WhatsApp and email.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab("contact")}
            className="px-4 py-2 rounded-xl bg-theme-accent text-white text-xs font-bold font-['Space_Grotesk'] shadow-sm hover:scale-105 transition-all cursor-pointer"
          >
            Contact Team
          </button>
          <button
            onClick={() => onNavigateTab("help")}
            className="px-4 py-2 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-xs font-semibold text-[var(--bento-text)] hover:bg-[var(--bento-card-hover)] transition-all cursor-pointer"
          >
            Open Help Center
          </button>
        </div>
      </section>
    </div>
  );
};
