import React, { useState, useEffect } from "react";
import { VIRAL_HOOKS_BANK } from "../data/mockData";
import { CreatorOSSkeleton } from "./skeletons/ModuleSkeletons";
import { 
  Video, 
  Flame, 
  Calculator, 
  Copy, 
  Check, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Tv, 
  Share2,
  Filter
} from "lucide-react";

interface CreatorOSProps {
  onNotify: (msg: string, type?: "success" | "info") => void;
}

export const CreatorOS: React.FC<CreatorOSProps> = ({ onNotify }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Sponsorship Calculator State
  const [avgViews, setAvgViews] = useState<number>(45000);
  const [cpmRate, setCpmRate] = useState<number>(18);
  const [engagementRate, setEngagementRate] = useState<number>(6.5);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 320);
    return () => clearTimeout(timer);
  }, []);

  const estimatedIntegratedFee = Math.round((avgViews / 1000) * cpmRate * (1 + engagementRate / 100));
  const estimatedDedicatedFee = Math.round(estimatedIntegratedFee * 2.2);
  const estimatedStoryBundle = Math.round(estimatedIntegratedFee * 0.45);

  const categories = ["All", "Music Drop", "Curiosity & Shock", "Behind The Craft", "POV Emotion", "Transformation"];

  const filteredHooks = selectedCategory === "All" 
    ? VIRAL_HOOKS_BANK 
    : VIRAL_HOOKS_BANK.filter(h => h.category.toLowerCase().includes(selectedCategory.toLowerCase()) || h.tag.toLowerCase().includes(selectedCategory.toLowerCase()));

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify("Copied hook to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isInitializing) {
    return <CreatorOSSkeleton />;
  }

  return (
    <div className="space-y-8 text-left pb-16">
      {/* Header Bento Card */}
      <div className="p-6 sm:p-8 bento-card border-[#27272A] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="bento-pill bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30">
            <Video className="w-3.5 h-3.5" />
            <span>CREATOR & INFLUENCER OPERATING SYSTEM</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Creator OS & Viral Hook Architecture
          </h1>
          <p className="text-sm sm:text-base text-[#A1A1AA] max-w-2xl leading-relaxed">
            Stop losing viewers in the first 3 seconds. Access proven algorithmic hook blueprints, thumbnail layout principles, and an institutional sponsorship rate calculator.
          </p>
        </div>
      </div>

      {/* 2-Column Workstation Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Viral Hook Bank */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bento-card p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#27272A]">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#F97316]" />
                  <span>3-Second Hook Retention Bank</span>
                </h2>
                <div className="text-[11px] text-[#A1A1AA] mt-0.5">
                  Click any hook to copy directly to your script
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-mono transition-all cursor-pointer ${
                      selectedCategory === c
                        ? "bg-[#F97316] text-black font-bold shadow-sm"
                        : "bg-[#27272A] text-[#A1A1AA] hover:text-white"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Hook Cards */}
            <div className="space-y-2.5">
              {filteredHooks.map((h) => (
                <div
                  key={h.id}
                  onClick={() => copyText(h.hook, h.id)}
                  className="p-3.5 rounded-2xl bg-[#09090B] hover:bg-[#202025] border border-[#27272A] hover:border-[#F97316]/40 cursor-pointer transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#F97316] font-semibold uppercase">{h.category}</span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#18181B] text-[#A1A1AA] border border-[#27272A]">
                      {h.tag}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-zinc-200 group-hover:text-white flex items-center justify-between gap-2">
                    <span className="italic">"{h.hook}"</span>
                    <div className="shrink-0 p-1.5 rounded-lg bg-[#18181B] text-[#A1A1AA] group-hover:text-[#F97316]">
                      {copiedId === h.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sponsorship Rate Calculator & Thumbnail Rules */}
        <div className="lg:col-span-5 space-y-6">
          {/* Sponsorship Rate Card Calculator Bento Card */}
          <div className="bento-card p-5 sm:p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#F97316]" />
                <span>Sponsorship Rate Calculator</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">FAIR MARKET DATA</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                  <span>Average Views per Video</span>
                  <span className="font-mono text-[#F97316]">{avgViews.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="500000"
                  step="5000"
                  value={avgViews}
                  onChange={(e) => setAvgViews(Number(e.target.value))}
                  className="w-full accent-[#F97316] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                  <span>Target CPM Tier ($ per 1K Views)</span>
                  <span className="font-mono text-[#F97316]">${cpmRate} CPM</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="45"
                  step="1"
                  value={cpmRate}
                  onChange={(e) => setCpmRate(Number(e.target.value))}
                  className="w-full accent-[#F97316] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                  <span>Audience Engagement Rate (%)</span>
                  <span className="font-mono text-[#F97316]">{engagementRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={engagementRate}
                  onChange={(e) => setEngagementRate(Number(e.target.value))}
                  className="w-full accent-[#F97316] cursor-pointer"
                />
              </div>
            </div>

            {/* Calculated Quote Cards */}
            <div className="pt-3 border-t border-[#27272A] space-y-2">
              <div className="p-3.5 rounded-2xl bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[#A1A1AA] uppercase">Dedicated Reel / TikTok (60-90s)</div>
                  <div className="text-base font-bold text-white font-['Space_Grotesk'] mt-0.5">
                    ${estimatedDedicatedFee.toLocaleString()}{" "}
                    <span className="text-xs text-[#71717A] font-normal">
                      (≈ ₦{(estimatedDedicatedFee * 1480).toLocaleString()})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => copyText(`$${estimatedDedicatedFee.toLocaleString()} (Dedicated Video Package)`, "rate-dedicated")}
                  className="p-2 rounded-xl bg-[#27272A] hover:bg-[#323238] text-zinc-300 hover:text-white cursor-pointer transition-colors"
                  title="Copy Rate"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[#A1A1AA] uppercase">30s Integrated Midroll Sponsor</div>
                  <div className="text-sm font-bold text-[#F97316] font-['Space_Grotesk'] mt-0.5">
                    ${estimatedIntegratedFee.toLocaleString()}{" "}
                    <span className="text-xs text-[#71717A] font-normal">
                      (≈ ₦{(estimatedIntegratedFee * 1480).toLocaleString()})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => copyText(`$${estimatedIntegratedFee.toLocaleString()} (30s Integration)`, "rate-midroll")}
                  className="p-2 rounded-xl bg-[#27272A] hover:bg-[#323238] text-zinc-300 hover:text-white cursor-pointer transition-colors"
                  title="Copy Rate"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[#A1A1AA] uppercase">2x 24hr Instagram Story Bundle</div>
                  <div className="text-sm font-bold text-zinc-200 font-['Space_Grotesk'] mt-0.5">
                    ${estimatedStoryBundle.toLocaleString()}{" "}
                    <span className="text-xs text-[#71717A] font-normal">
                      (≈ ₦{(estimatedStoryBundle * 1480).toLocaleString()})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => copyText(`$${estimatedStoryBundle.toLocaleString()} (Story Package)`, "rate-story")}
                  className="p-2 rounded-xl bg-[#27272A] hover:bg-[#323238] text-zinc-300 hover:text-white cursor-pointer transition-colors"
                  title="Copy Rate"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
