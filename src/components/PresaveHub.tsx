import React, { useState, useEffect } from "react";
import { PresavePageData, FanLead } from "../types";
import { useWorkspace } from "../context/WorkspaceContext";
import { GeneralModuleSkeleton } from "./skeletons/ModuleSkeletons";
import { 
  Radio, 
  Smartphone, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  QrCode, 
  Play, 
  Pause, 
  Clock, 
  Mail, 
  Phone, 
  Send, 
  ExternalLink, 
  Sparkles, 
  Music2, 
  Globe, 
  Code,
  Users,
  Layers,
  Heart,
  Save
} from "lucide-react";
import confetti from "canvas-confetti";

interface PresaveHubProps {
  onNotify: (text: string, type?: "success" | "info" | "error") => void;
}

export const PresaveHub: React.FC<PresaveHubProps> = ({ onNotify }) => {
  const { workspace, activeRelease, updateRelease } = useWorkspace();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageData, setPageData] = useState<PresavePageData>({
    title: "Midnight in Victoria Island",
    artist: "ZACK KHALIFA",
    releaseDate: "2026-09-18",
    coverArtUrl: "",
    bioSnippet: "The official pre-save portal for Zack Khalifa's upcoming Afro-Fusion masterpiece. Pre-save now on Spotify, Apple Music & Audiomack for early access.",
    vanitySlug: "victoria-island",
    themeStyle: "dark-crimson",
    dspLinks: {
      spotify: "https://open.spotify.com/album/keedohub-victoria",
      appleMusic: "https://music.apple.com/album/victoria",
      audiomack: "https://audiomack.com/zack-khalifa/song/victoria",
      youtubeMusic: "https://music.youtube.com/watch?v=victoria",
      boomplay: "https://www.boomplay.com/songs/victoria",
      deezer: "https://www.deezer.com/album/victoria",
      tidal: "https://tidal.com/browse/album/victoria",
      soundcloud: "https://soundcloud.com/zack-khalifa/victoria",
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 320);
    return () => clearTimeout(timer);
  }, []);

  // Sync with active master release
  useEffect(() => {
    if (activeRelease) {
      setPageData((prev) => {
        if (activeRelease.presaveData) {
          return {
            ...prev,
            ...activeRelease.presaveData,
            title: activeRelease.title || prev.title,
            artist: activeRelease.artistName || prev.artist,
            releaseDate: activeRelease.releaseDate || prev.releaseDate,
            coverArtUrl: activeRelease.coverUrl || prev.coverArtUrl,
            vanitySlug: activeRelease.presaveSlug || prev.vanitySlug,
          };
        }
        return {
          ...prev,
          title: activeRelease.title || prev.title,
          artist: activeRelease.artistName || prev.artist,
          releaseDate: activeRelease.releaseDate || prev.releaseDate,
          coverArtUrl: activeRelease.coverUrl || prev.coverArtUrl,
          vanitySlug: activeRelease.presaveSlug || activeRelease.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        };
      });
    }
  }, [activeRelease]);

  const handleSaveToRelease = async () => {
    if (!activeRelease) {
      onNotify("No active master release found in workspace", "error");
      return;
    }
    setIsSaving(true);
    try {
      await updateRelease(activeRelease.id, {
        presaveSlug: pageData.vanitySlug,
        presaveData: pageData,
      });
      onNotify(`Linked Pre-Save page to master release "${activeRelease.title}"!`, "success");
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err: any) {
      onNotify(err.message || "Failed to save pre-save page to release", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Fan Leads CRM state
  const [fanLeads, setFanLeads] = useState<FanLead[]>([
    { id: "f1", email: "tunde.music@gmail.com", phone: "+234 810 446 5924", country: "Nigeria", subscribedAt: "Today, 14:20" },
    { id: "f2", email: "sarah.london@afrobeats.co.uk", phone: "+44 7911 123456", country: "United Kingdom", subscribedAt: "Yesterday, 18:45" },
    { id: "f3", email: "kwame.accra@gmail.com", phone: "+233 24 123 4567", country: "Ghana", subscribedAt: "2 days ago" },
  ]);

  // Fan input form
  const [fanEmail, setFanEmail] = useState("");
  const [fanPhone, setFanPhone] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [activeTab, setActiveTab] = useState<"designer" | "fans" | "qr">("designer");

  // Handle fan pre-save submission
  const handleFanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fanEmail && !fanPhone) {
      onNotify("Please enter an email or WhatsApp number", "error");
      return;
    }
    const newLead: FanLead = {
      id: "f_" + Math.random().toString(36).substring(2, 7),
      email: fanEmail || "fan@music.io",
      phone: fanPhone || "N/A",
      country: "Global",
      subscribedAt: "Just now",
    };
    setFanLeads([newLead, ...fanLeads]);
    setFanEmail("");
    setFanPhone("");
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.8 } });
    onNotify("Pre-saved! Fan contact saved to release CRM", "success");
  };

  const handleCopyLink = () => {
    const fullUrl = `https://keedohub.os/drop/${pageData.vanitySlug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    onNotify("Copied SmartLink to clipboard!", "success");
  };

  const handleCopyEmbed = () => {
    const embedCode = `<iframe src="https://keedohub.os/embed/${pageData.vanitySlug}" width="100%" height="450" frameborder="0" allow="autoplay; encrypted-media"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2500);
    onNotify("Copied HTML Embed widget code!", "success");
  };

  // Export Fan CRM CSV
  const handleExportCsv = () => {
    let csv = "ID,Email,Phone,Country,SubscribedAt\n";
    fanLeads.forEach((l) => {
      csv += `${l.id},"${l.email}","${l.phone}","${l.country}","${l.subscribedAt}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `FAN_PRE_SAVE_LEADS_${pageData.vanitySlug}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify("Exported Fan CRM leads to CSV", "success");
  };

  if (isInitializing) {
    return <GeneralModuleSkeleton title="Smart Link & Fan Pre-Save Hub" badge="FAN CAPTURE & SMART LINKS" />;
  }

  return (
    <div id="presave-hub-module" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--bento-card)] border border-[var(--bento-border)] p-5 sm:p-6 rounded-3xl shadow-lg">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-theme-accent text-white shadow-md">
              <Radio className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-[var(--bento-text)]">
              Smart Link & Fan Pre-Save Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ZERO SUBSCRIPTION FEES
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--bento-muted)] max-w-2xl">
            Build high-converting <strong className="text-[var(--bento-text)]">Linkfire & Feature.fm style smart landing pages</strong>, collect fan emails/WhatsApp for release day blasts, and generate marketing QR codes.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSaveToRelease}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-theme-accent text-white text-xs font-bold shadow hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save to Master Release"}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[var(--bento-elevated)] border border-[var(--bento-border)] text-[var(--bento-text)] text-xs font-bold shadow hover:border-theme-accent cursor-pointer transition-all"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "Link Copied!" : "Share SmartLink"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Live Mobile Preview (Col 5) / Right Configuration & Fan CRM (Col 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ==========================================
            LEFT: LIVE SMART LINK PHONE PREVIEW (Col 5)
            ========================================== */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[360px] bg-neutral-950 p-4 rounded-[42px] border-4 border-neutral-800 shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* Phone Speaker Notch */}
            <div className="w-24 h-3.5 bg-neutral-900 rounded-full mx-auto mb-3 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neutral-800"></span>
            </div>

            {/* Smart Landing Screen Canvas */}
            <div className="w-full rounded-3xl bg-gradient-to-b from-[#1a0707] via-[#120404] to-black p-5 border border-white/10 shadow-inner flex flex-col items-center text-center space-y-4 max-h-[580px] overflow-y-auto pr-1">
              
              {/* Cover Art & Vinyl Glow */}
              <div className="relative group">
                <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-red-600 to-neutral-900 border border-white/20 shadow-2xl flex items-center justify-center p-3 relative z-10 overflow-hidden">
                  <div className="w-full h-full rounded-xl border border-white/30 flex flex-col items-center justify-center text-white bg-black/40 backdrop-blur-sm p-2 text-center">
                    <Music2 className="w-6 h-6 text-red-400 mb-1" />
                    <span className="text-[10px] font-bold leading-tight uppercase font-['Space_Grotesk'] line-clamp-2">
                      {pageData.title}
                    </span>
                    <span className="text-[8px] font-mono text-neutral-400 truncate w-full">
                      {pageData.artist}
                    </span>
                  </div>
                </div>

                {/* Animated aura */}
                <div className="absolute -inset-2 bg-gradient-to-r from-red-600 to-amber-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500 animate-pulse pointer-events-none" />
              </div>

              {/* Release Title & Artist Header */}
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white font-['Space_Grotesk'] leading-tight">
                  {pageData.title}
                </h2>
                <p className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
                  {pageData.artist}
                </p>
                <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed px-2">
                  {pageData.bioSnippet}
                </p>
              </div>

              {/* Countdown Ticker */}
              <div className="w-full bg-black/50 border border-white/10 p-2.5 rounded-2xl flex items-center justify-around text-white">
                <div>
                  <span className="text-xs font-mono font-bold block text-red-400">14</span>
                  <span className="text-[8px] font-mono text-neutral-400 uppercase">DAYS</span>
                </div>
                <span className="text-neutral-600">:</span>
                <div>
                  <span className="text-xs font-mono font-bold block text-red-400">08</span>
                  <span className="text-[8px] font-mono text-neutral-400 uppercase">HOURS</span>
                </div>
                <span className="text-neutral-600">:</span>
                <div>
                  <span className="text-xs font-mono font-bold block text-red-400">45</span>
                  <span className="text-[8px] font-mono text-neutral-400 uppercase">MINS</span>
                </div>
                <span className="text-neutral-600">:</span>
                <div>
                  <span className="text-xs font-mono font-bold block text-red-400">12</span>
                  <span className="text-[8px] font-mono text-neutral-400 uppercase">SECS</span>
                </div>
              </div>

              {/* Pre-Save Fan Capture Form */}
              <form onSubmit={handleFanSubmit} className="w-full space-y-2 bg-neutral-900/60 p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] font-mono text-neutral-300 font-bold block uppercase flex items-center justify-center gap-1">
                  <Mail className="w-3 h-3 text-red-400" /> Get Drop Day Alert
                </span>
                <input
                  type="email"
                  placeholder="Enter email or WhatsApp..."
                  value={fanEmail}
                  onChange={(e) => setFanEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-xl text-[11px] text-white focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  Pre-Save & Notify Me
                </button>
              </form>

              {/* DSP Buttons */}
              <div className="w-full space-y-1.5">
                {[
                  { name: "Spotify", action: "Pre-Save", color: "#1DB954", bg: "hover:bg-[#1DB954]/20" },
                  { name: "Apple Music", action: "Pre-Add", color: "#FC3C44", bg: "hover:bg-[#FC3C44]/20" },
                  { name: "Audiomack", action: "Favorite", color: "#FFA200", bg: "hover:bg-[#FFA200]/20" },
                  { name: "Boomplay", action: "Pre-Order", color: "#00E5FF", bg: "hover:bg-[#00E5FF]/20" },
                ].map((dsp) => (
                  <div
                    key={dsp.name}
                    className="w-full p-2 rounded-xl bg-neutral-900/80 border border-white/10 flex items-center justify-between hover:border-white/30 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dsp.color }} />
                      <span className="font-bold text-white text-[11px]">{dsp.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNotify(`Simulated ${dsp.action} on ${dsp.name}`, "success")}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[10px] font-bold"
                    >
                      {dsp.action}
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[9px] font-mono text-neutral-500 flex items-center justify-center gap-1">
                <span>Powered by Keedohub OS</span>
              </div>
            </div>

            {/* SmartLink Footer Slug */}
            <div className="mt-3 text-center">
              <span className="text-[11px] font-mono text-neutral-400 truncate block">
                keedohub.os/drop/{pageData.vanitySlug}
              </span>
            </div>
          </div>
        </div>

        {/* ==========================================
            RIGHT: DESIGNER, FAN CRM & QR CODE (Col 7)
            ========================================== */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Sub Navigation */}
          <div className="flex items-center gap-2 border-b border-[var(--bento-border)] pb-3">
            <button
              onClick={() => setActiveTab("designer")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "designer"
                  ? "bg-theme-accent text-white shadow"
                  : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] bg-[var(--bento-card)] border border-[var(--bento-border)]"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Smart Link Designer</span>
            </button>

            <button
              onClick={() => setActiveTab("fans")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "fans"
                  ? "bg-theme-accent text-white shadow"
                  : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] bg-[var(--bento-card)] border border-[var(--bento-border)]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Fan CRM Leads ({fanLeads.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("qr")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "qr"
                  ? "bg-theme-accent text-white shadow"
                  : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] bg-[var(--bento-card)] border border-[var(--bento-border)]"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Marketing QR & Embed</span>
            </button>
          </div>

          {/* TAB 1: Smart Link Designer Form */}
          {activeTab === "designer" && (
            <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-5 rounded-3xl space-y-4 animate-in fade-in duration-200">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent-pill-text)]">
                Release Metadata & Vanity URL
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-[var(--bento-muted)] block mb-1">Track Title</label>
                  <input
                    type="text"
                    value={pageData.title}
                    onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                    className="w-full bg-[var(--bento-bg)] border border-[var(--bento-border)] px-3 py-2 rounded-xl text-xs text-[var(--bento-text)] font-bold focus:outline-none focus:border-[var(--accent-border)]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[var(--bento-muted)] block mb-1">Artist Name</label>
                  <input
                    type="text"
                    value={pageData.artist}
                    onChange={(e) => setPageData({ ...pageData, artist: e.target.value })}
                    className="w-full bg-[var(--bento-bg)] border border-[var(--bento-border)] px-3 py-2 rounded-xl text-xs text-[var(--bento-text)] font-bold focus:outline-none focus:border-[var(--accent-border)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[var(--bento-muted)] block mb-1">
                  Custom Vanity Slug URL
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[var(--bento-muted)]">keedohub.os/drop/</span>
                  <input
                    type="text"
                    value={pageData.vanitySlug}
                    onChange={(e) => setPageData({ ...pageData, vanitySlug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    className="flex-1 bg-[var(--bento-bg)] border border-[var(--bento-border)] px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-[var(--accent-pill-text)] focus:outline-none focus:border-[var(--accent-border)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[var(--bento-muted)] block mb-1">
                  Fan Bio & Call-to-Action Note
                </label>
                <textarea
                  rows={3}
                  value={pageData.bioSnippet}
                  onChange={(e) => setPageData({ ...pageData, bioSnippet: e.target.value })}
                  className="w-full bg-[var(--bento-bg)] border border-[var(--bento-border)] px-3 py-2 rounded-xl text-xs text-[var(--bento-text)] focus:outline-none focus:border-[var(--accent-border)] resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Fan CRM Leads */}
          {activeTab === "fans" && (
            <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-5 rounded-3xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--bento-text)] font-['Space_Grotesk']">
                    Subscriber & Pre-Save Fan Contacts
                  </h3>
                  <p className="text-[11px] text-[var(--bento-muted)]">
                    Own your audience data directly with zero intermediary lock-in.
                  </p>
                </div>

                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-accent text-white text-xs font-bold shadow hover:brightness-110 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Fan Leads Table */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {fanLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 rounded-2xl bg-[var(--bento-bg)] border border-[var(--bento-border)] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[var(--bento-text)] block">{lead.email}</span>
                      <span className="text-[10px] font-mono text-[var(--bento-muted)]">{lead.phone} • {lead.country}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {lead.subscribedAt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Marketing QR Code & Embed */}
          {activeTab === "qr" && (
            <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-5 rounded-3xl space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-[var(--bento-text)] font-['Space_Grotesk']">
                Print Marketing QR Code & Embed Widget
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[var(--bento-elevated)] border border-[var(--bento-border)]">
                {/* Simulated SVG QR Code */}
                <div className="w-32 h-32 bg-white p-2 rounded-2xl shadow-lg flex items-center justify-center shrink-0">
                  <div className="w-full h-full bg-neutral-900 rounded-xl p-2 flex flex-col items-center justify-between text-white font-mono text-[8px] text-center">
                    <div className="w-full flex justify-between">
                      <span className="w-4 h-4 bg-white rounded"></span>
                      <span className="w-4 h-4 bg-white rounded"></span>
                    </div>
                    <span className="font-bold">KEEDO QR</span>
                    <div className="w-full flex justify-between">
                      <span className="w-4 h-4 bg-white rounded"></span>
                      <span className="w-4 h-4 bg-white rounded"></span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-[var(--bento-text)]">
                    Scannable Release Drop QR Code
                  </p>
                  <p className="text-[11px] text-[var(--bento-muted)]">
                    Direct fans instantly to your pre-save page when scanned from concert flyers, posters, and stickers.
                  </p>
                  <button
                    onClick={() => {
                      confetti({ particleCount: 30, spread: 50 });
                      onNotify("QR Code downloaded for print materials", "success");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-theme-accent text-white text-xs font-bold shadow hover:brightness-110 cursor-pointer"
                  >
                    Download Vector QR
                  </button>
                </div>
              </div>

              {/* Embed Code */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-[var(--bento-muted)]">
                    Website & Blog Embed Code (iFrame)
                  </span>
                  <button
                    onClick={handleCopyEmbed}
                    className="text-xs font-bold text-[var(--accent-pill-text)] hover:underline flex items-center gap-1"
                  >
                    {copiedEmbed ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEmbed ? "Copied" : "Copy Embed Code"}</span>
                  </button>
                </div>
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 font-mono text-[11px] text-neutral-300 overflow-x-auto">
                  <code>{`<iframe src="https://keedohub.os/embed/${pageData.vanitySlug}" width="100%" height="450" frameborder="0"></iframe>`}</code>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
