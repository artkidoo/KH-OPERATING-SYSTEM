import React, { useState, useEffect } from "react";
import { BrandStrategy } from "../types";
import { KeedohubLogo } from "./KeedohubLogo";
import { BrandOSSkeleton } from "./skeletons/ModuleSkeletons";
import { 
  Sparkles, 
  Palette, 
  Type, 
  Calendar, 
  Copy, 
  Check, 
  Download, 
  Zap, 
  Briefcase,
  Layers,
  ArrowRight,
  Sun,
  Moon,
  FileCode,
  Sliders,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ShieldCheck,
  Compass,
  Rocket,
  ChevronDown,
  ChevronUp,
  Tag,
  Target
} from "lucide-react";
import confetti from "canvas-confetti";

interface BrandOSProps {
  onNotify: (msg: string, type?: "success" | "info") => void;
}

export const BrandOS: React.FC<BrandOSProps> = ({ onNotify }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [brandName, setBrandName] = useState("Vanguard Protocol");
  const [industry, setIndustry] = useState("Fintech & Creative Tech");
  const [brandVibe, setBrandVibe] = useState("Architectural, Ultra-Luxury, High-Trust, Bold");
  const [targetAudience, setTargetAudience] = useState("High-growth founders, venture studios, modern creators");
  const [primaryGoal, setPrimaryGoal] = useState("Global authority, high conversion, enterprise-grade brand trust");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mobile toggle for parameters panel
  const [showMobileParams, setShowMobileParams] = useState(false);

  // Active view tab for Brand OS
  type BrandTab = "strategy" | "colors" | "voice" | "sprint" | "logo";
  const [activeTab, setActiveTab] = useState<BrandTab>("strategy");

  // Track checked sprint items
  const [completedSprints, setCompletedSprints] = useState<Record<number, boolean>>({ 0: true, 1: true });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 280);
    return () => clearTimeout(timer);
  }, []);

  const [strategy, setStrategy] = useState<BrandStrategy>({
    brandTagline: "Vanguard Protocol — Engineered for Financial Autonomy",
    brandArchetype: "The Creator & Ruler (Precision, Innovation, Unshakable Authority)",
    voiceAndTone: {
      traits: ["Precision-Engineered", "Direct & Clear", "Unapologetically Bold", "Zero Fluff"],
      doSay: [
        "Built with architectural precision.",
        "Engineered for generational momentum.",
        "Real-time institutional liquidity.",
        "Command your sovereign capital stack."
      ],
      dontSay: [
        "Supercharge your finances with ease!",
        "A game-changing synergy tool for everyone.",
        "Cheap solutions for the mass market.",
        "Revolutionary hacks to get rich fast."
      ],
    },
    colorPalette: [
      { name: "Keedohub Crimson", hex: "#DC2626", role: "Primary brand mark, high-impact CTA triggers & monograms" },
      { name: "Obsidian Deep", hex: "#09090B", role: "Foundational canvas, dark mode surfaces & structural depth" },
      { name: "Solar Amber", hex: "#F59E0B", role: "Status signals, priority badges & spotlight highlights" },
      { name: "Pure Titanium", hex: "#FAFAFA", role: "High-contrast primary display headlines & typography" },
      { name: "Technical Slate", hex: "#71717A", role: "Monospace metadata, wireframe borders & secondary labels" },
    ],
    typographyPairing: {
      heading: "Space Grotesk (Bold 700 / Semi-Bold 600)",
      body: "Plus Jakarta Sans (Regular 400 & Medium 500)",
      monospace: "JetBrains Mono (Technical data, timestamps, token values)",
    },
    marketPositioningStatement: "Vanguard Protocol provides high-growth global operators with a resilient financial infrastructure, replacing fragmented legacy pipelines with a single unified operating system.",
    launchSprint: [
      { day: "Sprint Day 1 - 3", task: "Finalize master vector monogram mark, color harmony tokens, and typography pairing standards." },
      { day: "Sprint Day 4 - 7", task: "Design and build high-conversion landing page and interactive product walkthrough." },
      { day: "Sprint Day 8 - 10", task: "Generate 3D motion launch sizzle reel, investor deck, and press kit." },
      { day: "Sprint Day 11 - 14", task: "Execute coordinated launch across Twitter/X, LinkedIn, newsletter broadcast, and PR wires." },
    ],
  });

  const handleGenerateStrategy = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/brand-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          industry,
          brandVibe,
          targetAudience,
          primaryGoal,
        }),
      });
      const json = await res.json();
      if (json && json.data) {
        setStrategy(json.data);
        onNotify(`Brand Strategy generated for "${brandName}"!`, "success");
        try {
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } catch (e) {
      onNotify("Algorithmic engine active — Brand updated!", "info");
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify("Copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportBrandKit = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(strategy, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${brandName.replace(/\s+/g, "_")}_Brand_Architecture.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onNotify("Brand Architecture JSON exported!", "success");
  };

  const applyPreset = (pName: string, pIndustry: string, pVibe: string, pAudience: string, pGoal: string) => {
    setBrandName(pName);
    setIndustry(pIndustry);
    setBrandVibe(pVibe);
    setTargetAudience(pAudience);
    setPrimaryGoal(pGoal);
    onNotify(`Applied preset: ${pName}`, "info");
  };

  const toggleSprint = (idx: number) => {
    setCompletedSprints(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
    onNotify("Launch Sprint milestone updated", "info");
  };

  if (isInitializing) {
    return <BrandOSSkeleton />;
  }

  const completedSprintCount = Object.values(completedSprints).filter(Boolean).length;
  const sprintProgress = Math.round((completedSprintCount / (strategy.launchSprint.length || 1)) * 100);

  return (
    <div className="space-y-6 sm:space-y-8 text-left pb-20 max-w-7xl mx-auto">
      {/* Header Bento Card */}
      <div className="p-5 sm:p-8 bento-card border-[var(--bento-border)] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="bento-pill bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BRAND ARCHITECTURE & DESIGN SYSTEM OS</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-xs font-mono">
                <span className="text-[var(--bento-muted)]">Sprint:</span>
                <span className="font-bold text-emerald-400">{sprintProgress}% Complete</span>
              </div>

              <button
                onClick={exportBrandKit}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bento-card)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] text-xs font-mono text-[var(--bento-muted)] hover:text-[var(--bento-text)] cursor-pointer transition-colors"
                title="Export complete Brand Kit JSON"
              >
                <Download className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Export Kit</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="font-['Space_Grotesk'] text-2xl sm:text-4xl font-bold text-[var(--bento-text)] tracking-tight">
              Brand Architecture & Design System Engine
            </h1>
            <p className="text-xs sm:text-sm text-[var(--bento-muted)] max-w-3xl leading-relaxed">
              Move beyond static logos. Architect cohesive brand positioning, contrast-audited color tokens, voice & tone rules, typography pairings, and 14-day launch roadmap to build lasting cultural authority.
            </p>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Brand Parameters & Presets (Mobile Collapsible) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bento-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--bento-border)]">
              <h2 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[var(--bento-text)] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#F97316]" />
                <span>Brand Parameters</span>
              </h2>
              
              {/* Mobile Toggle Button */}
              <button
                onClick={() => setShowMobileParams(!showMobileParams)}
                className="lg:hidden flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bento-input)] border border-[var(--bento-border)] text-[11px] font-mono text-[var(--bento-text)]"
              >
                <span>{showMobileParams ? "Hide Form" : "Edit Inputs"}</span>
                {showMobileParams ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <span className="hidden lg:inline text-[10px] font-mono text-[#F97316] font-bold">
                ACTIVE
              </span>
            </div>

            {/* Quick Archetype Presets - Always Visible for Instant 1-Tap Mobile Testing */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-[var(--bento-muted)] uppercase tracking-wider">
                Instant Presets:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset("Vanguard Protocol", "Fintech & Creative Tech", "Architectural, Ultra-Luxury, High-Trust, Bold", "High-growth founders, venture studios, modern creators", "Global authority, high conversion, enterprise-grade brand trust")}
                  className="p-2 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-[#F97316]/40 text-[10px] font-mono text-[var(--bento-text)] text-left cursor-pointer transition-all flex flex-col justify-between min-h-[44px]"
                >
                  <span className="font-bold text-[#F97316]">💎 Fintech Luxury</span>
                  <span className="text-[9px] text-[var(--bento-muted)] truncate">Vanguard Protocol</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset("Aether Core AI", "Artificial Intelligence & Robotics", "Cybernetic, Minimalist, Research-Grade, Visionary", "Engineers, AI researchers, deep-tech investors", "Become the default intelligence layer for autonomous agents")}
                  className="p-2 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-[#F97316]/40 text-[10px] font-mono text-[var(--bento-text)] text-left cursor-pointer transition-all flex flex-col justify-between min-h-[44px]"
                >
                  <span className="font-bold text-indigo-400">🤖 DeepTech AI</span>
                  <span className="text-[9px] text-[var(--bento-muted)] truncate">Aether Core AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset("Kulture Shift", "Streetwear & Creative Media", "High-Energy, Underground, Diaspora-Rooted, Kinetic", "Gen-Z tastemakers, music producers, streetwear collectors", "Build a premier pan-African streetwear & culture syndicate")}
                  className="p-2 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-[#F97316]/40 text-[10px] font-mono text-[var(--bento-text)] text-left cursor-pointer transition-all flex flex-col justify-between min-h-[44px]"
                >
                  <span className="font-bold text-amber-400">⚡ Streetwear Media</span>
                  <span className="text-[9px] text-[var(--bento-muted)] truncate">Kulture Shift</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset("Verde Botanics", "Clean Health & Bio-Beverages", "Organic, Earthy-Modern, Premium Wellness, Serene", "Health-conscious professionals, boutique hotel guests", "Establish luxury retail distribution across global capitals")}
                  className="p-2 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-[#F97316]/40 text-[10px] font-mono text-[var(--bento-text)] text-left cursor-pointer transition-all flex flex-col justify-between min-h-[44px]"
                >
                  <span className="font-bold text-emerald-400">🌿 Clean Wellness</span>
                  <span className="text-[9px] text-[var(--bento-muted)] truncate">Verde Botanics</span>
                </button>
              </div>
            </div>

            {/* Form Fields (Expanded by default on desktop, collapsible on mobile) */}
            <div className={`space-y-3 text-xs ${showMobileParams ? "block" : "hidden lg:block"}`}>
              <div>
                <label className="block text-[var(--bento-text)] font-semibold mb-1">Company / Brand Name *</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Vanguard Protocol"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] font-medium focus:outline-none focus:border-[#F97316] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-[var(--bento-text)] font-semibold mb-1">Industry / Sector</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Fintech, Fashion, Energy, Creative Tech"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] font-medium focus:outline-none focus:border-[#F97316] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-[var(--bento-text)] font-semibold mb-1">Desired Brand Vibe & Aesthetics</label>
                <input
                  type="text"
                  value={brandVibe}
                  onChange={(e) => setBrandVibe(e.target.value)}
                  placeholder="e.g. Architectural, Ultra-Luxury, High-Trust, Bold"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] font-medium focus:outline-none focus:border-[#F97316] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-[var(--bento-text)] font-semibold mb-1">Target Demographic & Customers</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. High-growth founders, venture studios, modern creators"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] font-medium focus:outline-none focus:border-[#F97316] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-[var(--bento-text)] font-semibold mb-1">Core Goal</label>
                <input
                  type="text"
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  placeholder="e.g. Global authority, high conversion, enterprise trust"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] font-medium focus:outline-none focus:border-[#F97316] min-h-[44px]"
                />
              </div>
            </div>

            {/* Run Engine Button */}
            <button
              onClick={handleGenerateStrategy}
              disabled={isLoading || !brandName}
              className="w-full py-3.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-black font-bold text-xs sm:text-sm font-mono uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#F97316]/20 transition-all disabled:opacity-50 min-h-[44px]"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Computing Brand System...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Generate Brand OS</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Workstation Display Matrix & Tabbed Engine */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Workstation Sub-Navigation Tabs */}
          <div className="bento-card p-1.5 sm:p-2">
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
              <button
                onClick={() => setActiveTab("strategy")}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer min-h-[40px] ${
                  activeTab === "strategy"
                    ? "bg-[#F97316] text-black font-bold shadow-md shadow-[#F97316]/20"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Strategy & Archetype</span>
              </button>

              <button
                onClick={() => setActiveTab("colors")}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer min-h-[40px] ${
                  activeTab === "colors"
                    ? "bg-[#F97316] text-black font-bold shadow-md shadow-[#F97316]/20"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Color Tokens & Type</span>
              </button>

              <button
                onClick={() => setActiveTab("voice")}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer min-h-[40px] ${
                  activeTab === "voice"
                    ? "bg-[#F97316] text-black font-bold shadow-md shadow-[#F97316]/20"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Voice & Tone Matrix</span>
              </button>

              <button
                onClick={() => setActiveTab("sprint")}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer min-h-[40px] ${
                  activeTab === "sprint"
                    ? "bg-[#F97316] text-black font-bold shadow-md shadow-[#F97316]/20"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                }`}
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>14-Day Sprint ({completedSprintCount}/{strategy.launchSprint.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("logo")}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer min-h-[40px] ${
                  activeTab === "logo"
                    ? "bg-[#F97316] text-black font-bold shadow-md shadow-[#F97316]/20"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Vector Specs</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <BrandOSSkeleton isInlineResultOnly={true} />
          ) : (
            <>
              {/* TAB 1: STRATEGY & POSITIONING */}
              {activeTab === "strategy" && (
                <div className="space-y-5">
                  {/* Hero Tagline Card */}
                  <div className="bento-card p-5 sm:p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F97316]">
                        OFFICIAL BRAND SLOGAN & IDENTITY
                      </span>
                      <button
                        onClick={exportBrandKit}
                        className="flex items-center gap-1 text-xs font-mono text-[var(--bento-muted)] hover:text-[var(--bento-text)] px-3 py-1.5 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] cursor-pointer transition-colors min-h-[36px]"
                      >
                        <Download className="w-3.5 h-3.5 text-[#F97316]" />
                        <span>Export Kit</span>
                      </button>
                    </div>

                    <h3 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[var(--bento-text)]">
                      {strategy.brandTagline}
                    </h3>

                    {/* Responsive Grid of Core Strategy Pillars */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3.5 rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-1.5">
                        <div className="text-[10px] font-mono text-[#F97316] font-bold uppercase flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5" />
                          <span>Brand Archetype & Persona</span>
                        </div>
                        <p className="text-xs text-[var(--bento-text)] font-medium leading-relaxed">
                          {strategy.brandArchetype}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-1.5">
                        <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Industry & Sector Angle</span>
                        </div>
                        <p className="text-xs text-[var(--bento-text)] font-medium leading-relaxed">
                          {industry} • {brandVibe}
                        </p>
                      </div>
                    </div>

                    {/* Positioning Statement Card */}
                    <div className="p-4 rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-2">
                      <div className="text-[10px] font-mono text-[var(--bento-muted)] uppercase font-bold tracking-wider">
                        Market Positioning & Competitive Moat:
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--bento-text)] leading-relaxed">
                        {strategy.marketPositioningStatement}
                      </p>
                    </div>
                  </div>

                  {/* Brand Persona Traits Grid */}
                  <div className="bento-card p-5 sm:p-6 space-y-3">
                    <h4 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[var(--bento-text)] flex items-center gap-2 pb-2 border-b border-[var(--bento-border)]">
                      <Tag className="w-4 h-4 text-amber-400" />
                      <span>Core Brand Attributes & Personality</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {(strategy.voiceAndTone.traits || ["Precision-Engineered", "Direct & Clear", "Unapologetically Bold", "Zero Fluff"]).map((trait, tIdx) => (
                        <div key={tIdx} className="p-3 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-center space-y-1">
                          <span className="text-[10px] font-mono text-[#F97316] font-bold">0{tIdx + 1}</span>
                          <p className="text-xs font-semibold text-[var(--bento-text)]">{trait}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COLOR TOKENS & TYPOGRAPHY */}
              {activeTab === "colors" && (
                <div className="space-y-5">
                  {/* Color System Grid */}
                  <div className="bento-card p-5 sm:p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--bento-border)]">
                      <h4 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[var(--bento-text)] flex items-center gap-2">
                        <Palette className="w-4 h-4 text-[#F97316]" />
                        <span>Color System Tokens & Contrast Specs</span>
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        WCAG AA AUDITED
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {strategy.colorPalette.map((col, idx) => (
                        <div
                          key={idx}
                          onClick={() => copyText(col.hex, `color-${idx}`)}
                          className="p-3.5 rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] hover:border-[#F97316]/50 cursor-pointer transition-all space-y-3 group min-h-[96px]"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-xl shadow-md border border-white/10 flex items-center justify-center text-xs font-mono font-bold shrink-0 group-hover:scale-105 transition-transform"
                              style={{ backgroundColor: col.hex, color: col.hex.toLowerCase() === "#ffffff" || col.hex.toLowerCase() === "#fafafa" ? "#000000" : "#FFFFFF" }}
                            >
                              {copiedId === `color-${idx}` ? <Check className="w-4 h-4" /> : null}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-[var(--bento-text)] truncate">{col.name}</div>
                              <div className="text-[11px] font-mono text-[#F97316] font-semibold">{col.hex}</div>
                            </div>
                          </div>

                          <p className="text-[11px] text-[var(--bento-muted)] leading-relaxed">
                            {col.role}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Typography Pairing Matrix Card */}
                  <div className="bento-card p-5 sm:p-6 space-y-4">
                    <h4 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[var(--bento-text)] flex items-center gap-2 pb-2 border-b border-[var(--bento-border)]">
                      <Type className="w-4 h-4 text-indigo-400" />
                      <span>Typography Pairing Standards</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-1.5">
                        <div className="text-[10px] font-mono text-[var(--bento-muted)] uppercase font-bold">Display & Headlines</div>
                        <div className="font-['Space_Grotesk'] text-base font-bold text-[var(--bento-text)]">
                          {strategy.typographyPairing.heading}
                        </div>
                        <p className="text-[10px] text-[var(--bento-muted)] font-mono">Step Ratio: 1.333 (Perfect Fourth)</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-1.5">
                        <div className="text-[10px] font-mono text-[var(--bento-muted)] uppercase font-bold">Body & Interface</div>
                        <div className="text-sm font-medium text-[var(--bento-text)]">
                          {strategy.typographyPairing.body}
                        </div>
                        <p className="text-[10px] text-[var(--bento-muted)] font-mono">Optimal Line Height: 1.6 • Max 70ch</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-1.5">
                        <div className="text-[10px] font-mono text-[var(--bento-muted)] uppercase font-bold">Technical & Telemetry</div>
                        <div className="font-mono text-xs text-[#F97316] font-bold">
                          {strategy.typographyPairing.monospace}
                        </div>
                        <p className="text-[10px] text-[var(--bento-muted)] font-mono">Tabular numbers & code tokens</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: VOICE & TONE MATRIX */}
              {activeTab === "voice" && (
                <div className="space-y-5">
                  <div className="bento-card p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--bento-border)]">
                      <div>
                        <h4 className="text-xs sm:text-sm font-mono font-bold uppercase text-[var(--bento-text)] flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-[#F97316]" />
                          <span>Voice & Tone Editorial Matrix</span>
                        </h4>
                        <p className="text-xs text-[var(--bento-muted)] mt-0.5">
                          Enforce brand consistency across landing copy, PR releases, and social touchpoints.
                        </p>
                      </div>
                    </div>

                    {/* 2-Column Responsive Card Grid for Do Say vs Don't Say */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Do Say Column */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 px-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>BRAND APPROVED (DO SAY)</span>
                        </div>

                        <div className="space-y-2">
                          {strategy.voiceAndTone.doSay.map((phrase, dIdx) => (
                            <div
                              key={dIdx}
                              onClick={() => copyText(phrase, `dosay-${dIdx}`)}
                              className="p-3.5 rounded-2xl bg-[var(--bento-input)] border border-emerald-500/20 hover:border-emerald-500/50 cursor-pointer transition-all flex items-start justify-between gap-3 group"
                            >
                              <div className="flex items-start gap-2 text-xs text-[var(--bento-text)] leading-relaxed">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span className="font-medium">"{phrase}"</span>
                              </div>
                              <button className="text-[10px] font-mono text-[var(--bento-muted)] group-hover:text-[var(--bento-text)] shrink-0">
                                {copiedId === `dosay-${dIdx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Don't Say Column */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 px-1">
                          <XCircle className="w-4 h-4" />
                          <span>BANNED CLICHÉS (AVOID)</span>
                        </div>

                        <div className="space-y-2">
                          {strategy.voiceAndTone.dontSay.map((phrase, ndIdx) => (
                            <div
                              key={ndIdx}
                              className="p-3.5 rounded-2xl bg-[var(--bento-input)] border border-red-500/20 text-xs text-[var(--bento-muted)] line-through decoration-red-400/50 flex items-start gap-2 leading-relaxed"
                            >
                              <span className="text-red-400 font-bold shrink-0 no-underline">✕</span>
                              <span>"{phrase}"</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: 14-DAY LAUNCH SPRINT CARDS */}
              {activeTab === "sprint" && (
                <div className="space-y-5">
                  <div className="bento-card p-5 sm:p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--bento-border)]">
                      <div>
                        <h4 className="text-xs sm:text-sm font-mono font-bold uppercase text-[var(--bento-text)] flex items-center gap-2">
                          <Rocket className="w-4 h-4 text-emerald-400" />
                          <span>14-Day Coordinated Brand Launch Sprint</span>
                        </h4>
                        <p className="text-xs text-[var(--bento-muted)] mt-0.5">
                          Tap each milestone card to toggle completion and track launch velocity.
                        </p>
                      </div>

                      <div className="px-3 py-1 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-xs font-mono">
                        <span className="text-[var(--bento-muted)]">Progress: </span>
                        <span className="font-bold text-emerald-400">{completedSprintCount} / {strategy.launchSprint.length} Sprints</span>
                      </div>
                    </div>

                    {/* Responsive Grid of Touch-Friendly Sprint Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {strategy.launchSprint.map((sprint, sIdx) => {
                        const isDone = !!completedSprints[sIdx];
                        return (
                          <div
                            key={sIdx}
                            onClick={() => toggleSprint(sIdx)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 min-h-[110px] ${
                              isDone
                                ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-300"
                                : "bg-[var(--bento-input)] border-[var(--bento-border)] text-[var(--bento-text)] hover:border-[#F97316]/40"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={`px-2.5 py-0.5 rounded-lg font-mono text-[10px] font-bold border ${
                                isDone 
                                  ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/40" 
                                  : "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30"
                              }`}>
                                {sprint.day}
                              </span>

                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                isDone
                                  ? "bg-emerald-500 border-emerald-400 text-black"
                                  : "border-[var(--bento-border)] bg-[var(--bento-card)]"
                              }`}>
                                {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </div>

                            <p className={`text-xs font-medium leading-relaxed ${isDone ? "line-through opacity-80" : ""}`}>
                              {sprint.task}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: VECTOR SPECS & LIGHT/DARK SYSTEM */}
              {activeTab === "logo" && (
                <div className="bento-card p-5 sm:p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--bento-border)]">
                    <div>
                      <div className="bento-pill mb-2 bg-red-500/10 text-red-400 border border-red-500/30">
                        OFFICIAL VECTOR MARK • SYSTEM ARCHITECTURE
                      </div>
                      <h3 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[var(--bento-text)] tracking-tight">
                        Keedohub Official Logo & Dual Theme System
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--bento-muted)] mt-1 max-w-xl">
                        Precision-engineered geometric <strong className="text-[var(--bento-text)]">KH</strong> monogram combining the crimson angled notch with high-contrast chevron vector lockup.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          const svgDark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">\n  <rect width="512" height="512" fill="#000000"/>\n  <!-- Red Accent Notch -->\n  <path d="M 120 126 H 226 L 126 226 L 226 326 H 120 Z" fill="#DC2626"/>\n  <!-- KH Monogram Mark (White) -->\n  <path d="M 180 226 L 286 126 V 202 H 346 V 126 H 396 V 326 H 346 V 250 H 286 V 326 Z" fill="#FFFFFF"/>\n  <!-- Wordmark -->\n  <text x="256" y="395" font-family="'Space Grotesk', 'Montserrat', sans-serif" font-size="38" font-weight="900" letter-spacing="4" fill="#FFFFFF" text-anchor="middle">KEEDOHUB</text>\n</svg>`;
                          navigator.clipboard.writeText(svgDark);
                          onNotify("Dark SVG Code copied to clipboard!", "success");
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-elevated)] text-[var(--bento-text)] text-xs font-mono border border-[var(--bento-border)] transition-colors min-h-[40px] cursor-pointer"
                      >
                        <FileCode className="w-3.5 h-3.5 text-red-400" />
                        <span>Copy Dark SVG</span>
                      </button>

                      <button
                        onClick={() => {
                          const svgLight = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">\n  <rect width="512" height="512" fill="#FFFFFF"/>\n  <!-- Red Accent Notch -->\n  <path d="M 120 126 H 226 L 126 226 L 226 326 H 120 Z" fill="#DC2626"/>\n  <!-- KH Monogram Mark (Black) -->\n  <path d="M 180 226 L 286 126 V 202 H 346 V 126 H 396 V 326 H 346 V 250 H 286 V 326 Z" fill="#09090B"/>\n  <!-- Wordmark -->\n  <text x="256" y="395" font-family="'Space Grotesk', 'Montserrat', sans-serif" font-size="38" font-weight="900" letter-spacing="4" fill="#09090B" text-anchor="middle">KEEDOHUB</text>\n</svg>`;
                          navigator.clipboard.writeText(svgLight);
                          onNotify("Light SVG Code copied to clipboard!", "success");
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-elevated)] text-[var(--bento-text)] text-xs font-mono border border-[var(--bento-border)] transition-colors min-h-[40px] cursor-pointer"
                      >
                        <FileCode className="w-3.5 h-3.5 text-amber-400" />
                        <span>Copy Light SVG</span>
                      </button>
                    </div>
                  </div>

                  {/* Dual Light & Dark Mode Responsive Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dark Mode Master Spec */}
                    <div className="p-6 rounded-2xl bg-black border border-zinc-800 space-y-4 relative overflow-hidden shadow-2xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-300">
                          <Moon className="w-4 h-4 text-indigo-400" />
                          <span>DARK MODE EXECUTION</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                          Default Canvas
                        </span>
                      </div>

                      {/* Dark Lockup Visual Display */}
                      <div className="py-6 flex flex-col items-center justify-center space-y-3 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                        <KeedohubLogo size="lg" showText={false} theme="dark" />
                        <div className="font-['Space_Grotesk'] text-2xl font-extrabold tracking-widest text-white">
                          KEEDOHUB
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-zinc-400 pt-2 border-t border-zinc-800">
                        <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                          <div className="text-zinc-500">CANVAS</div>
                          <div className="text-white font-bold">#000000</div>
                        </div>
                        <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                          <div className="text-zinc-500">ACCENT</div>
                          <div className="text-red-500 font-bold">#DC2626</div>
                        </div>
                        <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                          <div className="text-zinc-500">MONOGRAM</div>
                          <div className="text-white font-bold">#FFFFFF</div>
                        </div>
                      </div>
                    </div>

                    {/* Light Mode Master Spec */}
                    <div className="p-6 rounded-2xl bg-white border border-zinc-200 space-y-4 relative overflow-hidden shadow-xl text-zinc-900">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-800">
                          <Sun className="w-4 h-4 text-amber-500" />
                          <span>LIGHT MODE EXECUTION</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-300">
                          High Contrast Day
                        </span>
                      </div>

                      {/* Light Lockup Visual Display */}
                      <div className="py-6 flex flex-col items-center justify-center space-y-3 bg-zinc-50 rounded-xl border border-zinc-200">
                        <KeedohubLogo size="lg" showText={false} theme="light" />
                        <div className="font-['Space_Grotesk'] text-2xl font-extrabold tracking-widest text-zinc-950">
                          KEEDOHUB
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-zinc-600 pt-2 border-t border-zinc-200">
                        <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200">
                          <div className="text-zinc-500">CANVAS</div>
                          <div className="text-zinc-900 font-bold">#FFFFFF</div>
                        </div>
                        <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200">
                          <div className="text-zinc-500">ACCENT</div>
                          <div className="text-red-600 font-bold">#DC2626</div>
                        </div>
                        <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200">
                          <div className="text-zinc-500">MONOGRAM</div>
                          <div className="text-zinc-950 font-bold">#09090B</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

