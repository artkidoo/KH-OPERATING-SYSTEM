import React, { useState, useEffect } from "react";
import { GeneralModuleSkeleton } from "./skeletons/ModuleSkeletons";
import { 
  Briefcase, 
  Layers, 
  Check, 
  Send, 
  PhoneCall, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  FileText,
  Copy,
  Sparkles,
  ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";

interface ProjectConsoleProps {
  onNotify: (msg: string, type?: "success" | "info") => void;
}

export const ProjectConsole: React.FC<ProjectConsoleProps> = ({ onNotify }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [selectedService, setSelectedService] = useState<string>("album-art");
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [timeline, setTimeline] = useState("48 Hours (Fast-Track)");
  const [projectNotes, setProjectNotes] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 320);
    return () => clearTimeout(timer);
  }, []);

  const [selectedAddons, setSelectedAddons] = useState<{ [key: string]: boolean }>({
    motionVisualizer: true,
    socialKit: true,
    commercialLicense: true,
  });

  const services = [
    {
      id: "album-art",
      title: "Music Cover Art & Release Suite",
      description: "3000x3000px master artwork, streaming badges, tracklist back cover & vinyl mockup.",
      priceNGN: 45000,
      priceUSD: 60,
      turnaround: "24-48 Hours",
    },
    {
      id: "brand-identity",
      title: "Complete Brand Identity Architecture",
      description: "Vector monogram mark, typography system, brand manual, color tokens & asset pack.",
      priceNGN: 120000,
      priceUSD: 180,
      turnaround: "3-5 Days",
    },
    {
      id: "web-app",
      title: "Full-Stack Web App & Landing Experience",
      description: "Interactive modern web application with high conversion rate, SEO & mobile precision.",
      priceNGN: 250000,
      priceUSD: 380,
      turnaround: "1-2 Weeks",
    },
    {
      id: "rollout-campaign",
      title: "360° Music Release Campaign & Content Engine",
      description: "Cover artwork, 30-day rollout roadmap, motion visualizer, EPK, and curator pitch kit.",
      priceNGN: 180000,
      priceUSD: 270,
      turnaround: "3-5 Days",
    },
  ];

  const addonsList = [
    { id: "motionVisualizer", label: "3D Animated Cover / Motion Visualizer Loop", priceNGN: 35000, priceUSD: 50 },
    { id: "socialKit", label: "Social Media Launch Kit (Banners, Stories, Posts)", priceNGN: 25000, priceUSD: 35 },
    { id: "commercialLicense", label: "Exclusive Commercial IP Certificate (Full Transfer)", priceNGN: 0, priceUSD: 0, free: true },
    { id: "priorityRush", label: "24-Hour Emergency Rush Delivery", priceNGN: 40000, priceUSD: 60 },
  ];

  const currentServiceObj = services.find((s) => s.id === selectedService) || services[0];

  const totalCost = 
    (currency === "NGN" ? currentServiceObj.priceNGN : currentServiceObj.priceUSD) +
    addonsList.reduce((acc, addon) => {
      if (selectedAddons[addon.id]) {
        return acc + (currency === "NGN" ? addon.priceNGN : addon.priceUSD);
      }
      return acc;
    }, 0);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendWhatsAppBrief = () => {
    if (!clientName || !clientContact) {
      onNotify("Please provide your name and contact details.", "info");
      return;
    }

    const activeAddonsText = addonsList
      .filter((a) => selectedAddons[a.id])
      .map((a) => `• ${a.label}`)
      .join("\n");

    const message = `🚀 *KEEDOHUB CREATIVE OS — NEW PROJECT BRIEF*

*Client:* ${clientName}
*Contact:* ${clientContact}
*Selected Service:* ${currentServiceObj.title}
*Estimated Investment:* ${currency === "NGN" ? `₦${totalCost.toLocaleString()}` : `$${totalCost.toLocaleString()}`}
*Timeline Target:* ${timeline}

*Included Specifications & Add-ons:*
${activeAddonsText}

*Project Vision & Notes:*
${projectNotes || "Standard creative package according to Keedohub OS specifications."}

— Sent from Keedohub Creative OS Console`;

    window.open(`https://wa.me/2348104465924?text=${encodeURIComponent(message)}`, "_blank");
    onNotify("Opening WhatsApp to dispatch brief...", "success");
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  if (isInitializing) {
    return <GeneralModuleSkeleton title="Interactive Project Console & Brief Builder" badge="CLIENT CONSOLE & LIVE ESTIMATOR" />;
  }

  return (
    <div className="space-y-8 text-left pb-16">
      {/* Header Bento Card */}
      <div className="p-6 sm:p-8 bento-card border-[#27272A] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="bento-pill bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30">
            <Briefcase className="w-3.5 h-3.5" />
            <span>CLIENT PROJECT CONSOLE & LIVE QUOTE ESTIMATOR</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Interactive Project Console & Brief Builder
          </h1>
          <p className="text-sm sm:text-base text-[#A1A1AA] max-w-2xl leading-relaxed">
            Configure your creative scope, calculate institutional transparent pricing with zero hidden fees, and dispatch your brief directly to our Lagos studio.
          </p>
        </div>
      </div>

      {/* Main Console Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scope & Service Selector */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bento-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                1. Select Primary Workstation
              </h2>
              {/* Currency switcher */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#09090B] border border-[#27272A]">
                <button
                  onClick={() => setCurrency("NGN")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                    currency === "NGN" ? "bg-[#F97316] text-black" : "text-[#A1A1AA] hover:text-white"
                  }`}
                >
                  ₦ NGN
                </button>
                <button
                  onClick={() => setCurrency("USD")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                    currency === "USD" ? "bg-[#F97316] text-black" : "text-[#A1A1AA] hover:text-white"
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>

            {/* Service Cards */}
            <div className="space-y-3">
              {services.map((s) => {
                const isSelected = selectedService === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedService(s.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? "bg-[#27272A] border-[#F97316] shadow-lg shadow-[#F97316]/10"
                        : "bg-[#09090B] border-[#27272A] hover:border-[#3F3F46]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-['Space_Grotesk'] text-sm font-bold text-white flex items-center gap-2">
                        <span>{s.title}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#F97316]">
                        {currency === "NGN" ? `₦${s.priceNGN.toLocaleString()}` : `$${s.priceUSD}`}
                      </span>
                    </div>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed">{s.description}</p>
                    <div className="text-[10px] font-mono text-[#71717A] flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3 text-[#F97316]" />
                      <span>Avg Turnaround: {s.turnaround}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add-on Upgrades Bento Card */}
          <div className="bento-card p-5 space-y-3 text-xs">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white pb-2 border-b border-[#27272A]">
              2. Add-on Studio Deliverables
            </h3>

            <div className="space-y-2">
              {addonsList.map((addon) => (
                <label
                  key={addon.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedAddons[addon.id]
                      ? "bg-[#27272A] border-[#F97316]/60 text-white"
                      : "bg-[#09090B] border-[#27272A] text-[#A1A1AA] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedAddons[addon.id])}
                      onChange={() => toggleAddon(addon.id)}
                      className="w-4 h-4 accent-[#F97316] rounded cursor-pointer"
                    />
                    <span className="font-medium text-zinc-200">{addon.label}</span>
                  </div>
                  <span className="font-mono font-bold text-[#F97316] shrink-0 ml-2">
                    {addon.free
                      ? "FREE / INCLUDED"
                      : currency === "NGN"
                      ? `+₦${addon.priceNGN.toLocaleString()}`
                      : `+$${addon.priceUSD}`}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Brief Specifications & WhatsApp Dispatch */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bento-card p-5 sm:p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                3. Client & Project Details
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">DIRECT DISPATCH</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Your Full Name / Stage Name *</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Zack Khalifa / StyleAxis Brand"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-white font-medium focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Email or Phone Number (WhatsApp) *</label>
                <input
                  type="text"
                  value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)}
                  placeholder="e.g. zack@gmail.com or +234..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-white font-medium focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Project Delivery Timeline</label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-white font-medium cursor-pointer"
                >
                  <option value="24-48 Hours (Rush)">24-48 Hours (Rush)</option>
                  <option value="1 Week Standard">1 Week Standard</option>
                  <option value="2 Weeks">2 Weeks</option>
                  <option value="Flexible Schedule">Flexible Schedule</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Project Vision & Goals</label>
                <textarea
                  rows={3}
                  value={projectNotes}
                  onChange={(e) => setProjectNotes(e.target.value)}
                  placeholder="Describe your aesthetic inspirations, song mood, target audience..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-white font-medium focus:outline-none focus:border-[#F97316]"
                />
              </div>
            </div>

            {/* Total Investment Summary */}
            <div className="p-4 rounded-2xl bg-[#09090B] border border-[#27272A] space-y-1.5 pt-3">
              <div className="text-[10px] font-mono text-[#A1A1AA] uppercase">Estimated Milestone Investment:</div>
              <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-extrabold text-[#F97316] tracking-tight">
                {currency === "NGN" ? `₦${totalCost.toLocaleString()}` : `$${totalCost.toLocaleString()}`}
              </div>
              <div className="text-[10px] text-[#71717A] font-mono">
                Includes 100% Commercial Copyrights + High-Res Source Files
              </div>
            </div>

            {/* WhatsApp Send Button */}
            <button
              onClick={handleSendWhatsAppBrief}
              className="w-full py-3.5 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] text-black font-bold text-xs sm:text-sm font-mono uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#F97316]/20 transition-all"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>Send Project Brief via WhatsApp</span>
            </button>

            <div className="text-[10px] font-mono text-[#71717A] text-center flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct line to Creative Director: +234-810-446-5924</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
