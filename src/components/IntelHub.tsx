import React, { useState, useEffect } from "react";
import { INTEL_ARTICLES } from "../data/mockData";
import { IntelArticle } from "../types";
import { VaultIntelSkeleton } from "./skeletons/ModuleSkeletons";
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Tag, 
  User, 
  X,
  Share2,
  Sparkles,
  Flame
} from "lucide-react";

interface IntelHubProps {
  onNotify: (msg: string, type?: "success" | "info") => void;
}

export const IntelHub: React.FC<IntelHubProps> = ({ onNotify }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<IntelArticle | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 320);
    return () => clearTimeout(timer);
  }, []);

  const categories = ["All", "Music Marketing", "Design Science", "Brand Strategy", "Creator Growth"];

  const filteredArticles = activeCategory === "All"
    ? INTEL_ARTICLES
    : INTEL_ARTICLES.filter((a) => a.category.toLowerCase() === activeCategory.toLowerCase());

  if (isInitializing) {
    return <VaultIntelSkeleton />;
  }

  return (
    <div className="space-y-8 text-left pb-16">
      {/* Header Bento Card */}
      <div className="p-6 sm:p-8 bento-card border-[#27272A] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="bento-pill bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>CREATIVE INTELLIGENCE & INDUSTRY PLAYBOOKS</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Keedohub Intel & Strategic Playbooks
          </h1>
          <p className="text-sm sm:text-base text-[#A1A1AA] max-w-2xl leading-relaxed">
            Engineering guides, album art psychology, music marketing case studies, and algorithmic breakdown playbooks from the Keedohub creative team.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeCategory === c
                ? "bg-[#F97316] text-black shadow-lg shadow-[#F97316]/20 font-bold"
                : "bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#27272A]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Articles Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((art) => (
          <div
            key={art.id}
            onClick={() => setSelectedArticle(art)}
            className="bento-card p-6 border-[#27272A] hover:border-[#F97316]/40 transition-all cursor-pointer flex flex-col justify-between space-y-4 group shadow-xl"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#F97316] font-bold uppercase px-2.5 py-0.5 rounded-lg bg-[#F97316]/10 border border-[#F97316]/30">
                  {art.category}
                </span>
                <div className="flex items-center gap-2 text-[#A1A1AA]">
                  <Clock className="w-3 h-3 text-[#F97316]" />
                  <span>{art.readTime}</span>
                </div>
              </div>

              <h2 className="font-['Space_Grotesk'] text-xl font-bold text-white group-hover:text-[#F97316] transition-colors leading-tight">
                {art.title}
              </h2>

              <p className="text-xs text-[#A1A1AA] line-clamp-3 leading-relaxed">
                {art.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-[#27272A] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#A1A1AA]">
                <User className="w-3 h-3 text-[#F97316]" />
                <span>{art.author}</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#F97316] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Read Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Article Reader */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setSelectedArticle(null)}
        >
          <div 
            className="w-full max-w-2xl bg-[#18181B] border border-[#27272A] rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#27272A] bg-[#121215] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#F97316] font-bold uppercase tracking-wider">
                  {selectedArticle.category} • {selectedArticle.readTime}
                </span>
                <h3 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-white mt-1">
                  {selectedArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-8 h-8 rounded-full bg-[#27272A] hover:bg-[#323238] text-[#A1A1AA] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-[#09090B] border border-[#27272A] text-[#FAFAFA] italic">
                {selectedArticle.summary}
              </div>

              <div className="space-y-3 pt-2">
                {selectedArticle.content.map((paragraph, pIdx) => (
                  <p key={pIdx} className="leading-relaxed text-[#D4D4D8]">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Tags */}
              <div className="pt-4 border-t border-[#27272A] flex flex-wrap gap-1.5">
                {selectedArticle.tags.map((t, tIdx) => (
                  <span key={tIdx} className="px-2.5 py-1 rounded-xl bg-[#09090B] text-[10px] font-mono text-[#A1A1AA] border border-[#27272A]">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#121215] border-t border-[#27272A] flex items-center justify-between text-xs">
              <span className="font-mono text-[#A1A1AA]">Authored by {selectedArticle.author}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${selectedArticle.title} — Keedohub Creative OS`);
                  onNotify("Article title copied!", "success");
                }}
                className="px-3 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#323238] text-white font-mono text-[11px] flex items-center gap-1.5 border border-[#3F3F46] cursor-pointer transition-colors"
              >
                <Share2 className="w-3 h-3 text-[#F97316]" />
                <span>Share Intel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
