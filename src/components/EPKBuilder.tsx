import React, { useState, useEffect } from "react";
import { INITIAL_EPK_DATA } from "../data/mockData";
import { EPKData } from "../types";
import { EPKBuilderSkeleton } from "./skeletons/ModuleSkeletons";
import { EPKExportModal } from "./EPKExportModal";
import { downloadEPKPdf } from "../utils/epkPdfGenerator";
import { 
  FileText, 
  Sparkles, 
  Play, 
  Pause, 
  Copy, 
  Check, 
  Download, 
  Radio, 
  Share2, 
  Globe2, 
  Headphones,
  Mail,
  Calendar,
  CheckCircle2,
  Plus,
  Trash2,
  Sliders,
  FileCheck,
  Printer
} from "lucide-react";
import confetti from "canvas-confetti";

interface EPKBuilderProps {
  onNotify: (msg: string, type?: "success" | "info") => void;
}

export const EPKBuilder: React.FC<EPKBuilderProps> = ({ onNotify }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [epk, setEpk] = useState<EPKData>(INITIAL_EPK_DATA);
  const [activePlayingIndex, setActivePlayingIndex] = useState<number | null>(null);
  const [isLoadingBio, setIsLoadingBio] = useState(false);
  const [isQuickExporting, setIsQuickExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active sub-tab in left controls
  const [activeControlTab, setActiveControlTab] = useState<"profile" | "tracks" | "press">("profile");

  // New track form state
  const [newTrack, setNewTrack] = useState({ title: "", duration: "3:10", streams: "100K", dsp: "Spotify / Apple Music" });
  const [newQuote, setNewQuote] = useState({ quote: "", source: "" });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 320);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerateAIBio = async () => {
    setIsLoadingBio(true);
    try {
      const res = await fetch("/api/ai/epk-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistName: epk.artistName,
          genre: epk.genre,
          hometown: epk.hometown,
          influences: "Afro-Fusion, Alté Trap, Contemporary Global Rhythms",
          achievements: `${epk.totalStreams} catalog streams & BBC 1Xtra co-signs`,
          vibe: "Electrifying, Sophisticated, Authentic",
        }),
      });

      const json = await res.json();
      if (json && json.data) {
        setEpk({
          ...epk,
          bioShort: json.data.bioShort || epk.bioShort,
          bioFull: json.data.bioFull || epk.bioFull,
        });
        onNotify("Generated updated executive artist bio!", "success");
        try {
          confetti({ particleCount: 50, spread: 45, origin: { y: 0.7 } });
        } catch (e) {}
      }
    } catch (e) {
      onNotify("Bio updated!", "info");
    } finally {
      setIsLoadingBio(false);
    }
  };

  const handleQuickPdfDownload = async () => {
    setIsQuickExporting(true);
    try {
      await downloadEPKPdf(epk, { theme: "dark" });
      onNotify(`Exported ${epk.artistName} Official EPK Dossier (PDF)!`, "success");
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err) {
      console.error(err);
      onNotify("Could not export PDF. Please try again.", "info");
    } finally {
      setIsQuickExporting(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify("Copied EPK details to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddTrack = () => {
    if (!newTrack.title.trim()) return;
    setEpk({
      ...epk,
      keyTracks: [...epk.keyTracks, { ...newTrack }],
    });
    setNewTrack({ title: "", duration: "3:15", streams: "50K", dsp: "Spotify / Apple Music" });
    onNotify("Added track to EPK catalog!", "success");
  };

  const handleRemoveTrack = (index: number) => {
    setEpk({
      ...epk,
      keyTracks: epk.keyTracks.filter((_, i) => i !== index),
    });
    onNotify("Removed track from EPK catalog", "info");
  };

  const handleAddQuote = () => {
    if (!newQuote.quote.trim() || !newQuote.source.trim()) return;
    setEpk({
      ...epk,
      pressQuotes: [...epk.pressQuotes, { ...newQuote }],
    });
    setNewQuote({ quote: "", source: "" });
    onNotify("Added press quote to EPK!", "success");
  };

  const handleRemoveQuote = (index: number) => {
    setEpk({
      ...epk,
      pressQuotes: epk.pressQuotes.filter((_, i) => i !== index),
    });
    onNotify("Removed press quote", "info");
  };

  if (isInitializing) {
    return <EPKBuilderSkeleton />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 text-left pb-16">
      {/* Header Bento Card */}
      <div className="p-4 sm:p-6 md:p-8 bento-card border-[#27272A] shadow-2xl relative overflow-hidden rounded-2xl sm:rounded-3xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30 text-[10px] sm:text-xs font-mono font-bold">
              <FileText className="w-3.5 h-3.5" />
              <span>EPK DOSSIER & PDF EXPORT ENGINE</span>
            </div>
            <h1 className="font-['Space_Grotesk'] text-xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Live EPK & Press Dossier Builder
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-2xl leading-relaxed">
              Compile and export institutional, publication-ready PDF dossiers complete with streaming metrics, discography, media acclaim, and management representation.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-black font-bold font-['Space_Grotesk'] text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#F97316]/20 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Export PDF Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main EPK Live Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left: Quick Form Controls */}
        <div className="lg:col-span-4 space-y-4 text-xs">
          <div className="bento-card p-4 sm:p-5 space-y-3.5 rounded-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#F97316]" />
                <span>EPK Profile Controls</span>
              </h2>
              <button
                onClick={handleGenerateAIBio}
                disabled={isLoadingBio}
                className="text-[10px] font-mono px-2.5 py-1 rounded-xl bg-[#F97316]/10 text-[#F97316] hover:bg-[#F97316]/20 border border-[#F97316]/30 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isLoadingBio ? "Writing..." : "AI Bio Rewrite"}</span>
              </button>
            </div>

            {/* Sub Tabs in Controls */}
            <div className="flex p-0.5 sm:p-1 rounded-xl bg-[#09090B] border border-[#27272A]">
              {[
                { id: "profile", label: "Profile & Stats" },
                { id: "tracks", label: "Catalog (" + epk.keyTracks.length + ")" },
                { id: "press", label: "Press (" + epk.pressQuotes.length + ")" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveControlTab(t.id as any)}
                  className={`flex-1 py-1.5 text-[10px] font-mono rounded-lg transition-colors cursor-pointer ${
                    activeControlTab === t.id
                      ? "bg-[#27272A] text-white font-bold shadow-xs"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {activeControlTab === "profile" && (
              <div className="space-y-2.5 sm:space-y-3 animate-fade-in">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1 text-[11px]">Artist Stage Name</label>
                  <input
                    type="text"
                    value={epk.artistName}
                    onChange={(e) => setEpk({ ...epk, artistName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-white font-bold focus:outline-none focus:border-[#F97316] text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1 text-[11px]">Genre</label>
                    <input
                      type="text"
                      value={epk.genre}
                      onChange={(e) => setEpk({ ...epk, genre: e.target.value })}
                      className="w-full px-2.5 py-1.5 sm:py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#F97316] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1 text-[11px]">Hometown</label>
                    <input
                      type="text"
                      value={epk.hometown}
                      onChange={(e) => setEpk({ ...epk, hometown: e.target.value })}
                      className="w-full px-2.5 py-1.5 sm:py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#F97316] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1 text-[11px]">Dossier Tagline</label>
                  <input
                    type="text"
                    value={epk.tagline || ""}
                    placeholder="e.g. Pioneer of Lagos Cyber-Highlife"
                    onChange={(e) => setEpk({ ...epk, tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#F97316] text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1 text-[11px]">Monthly Listeners</label>
                    <input
                      type="text"
                      value={epk.monthlyListeners}
                      onChange={(e) => setEpk({ ...epk, monthlyListeners: e.target.value })}
                      className="w-full px-2.5 py-1.5 sm:py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1 text-[11px]">Total Streams</label>
                    <input
                      type="text"
                      value={epk.totalStreams}
                      onChange={(e) => setEpk({ ...epk, totalStreams: e.target.value })}
                      className="w-full px-2.5 py-1.5 sm:py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1 text-[11px]">Instagram Reach</label>
                    <input
                      type="text"
                      value={epk.instagramFollowers}
                      onChange={(e) => setEpk({ ...epk, instagramFollowers: e.target.value })}
                      className="w-full px-2.5 py-1.5 sm:py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1 text-[11px]">TikTok Audience</label>
                    <input
                      type="text"
                      value={epk.tiktokFollowers}
                      onChange={(e) => setEpk({ ...epk, tiktokFollowers: e.target.value })}
                      className="w-full px-2.5 py-1.5 sm:py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1 text-[11px]">Booking Email</label>
                  <input
                    type="text"
                    value={epk.bookingEmail}
                    onChange={(e) => setEpk({ ...epk, bookingEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1 text-[11px]">Management Representation</label>
                  <input
                    type="text"
                    value={epk.management}
                    onChange={(e) => setEpk({ ...epk, management: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1 text-[11px]">Official Biography</label>
                  <textarea
                    rows={4}
                    value={epk.bioFull}
                    onChange={(e) => setEpk({ ...epk, bioFull: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-white text-xs leading-relaxed focus:outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>
            )}

            {activeControlTab === "tracks" && (
              <div className="space-y-3 animate-fade-in">
                <div className="text-[11px] text-zinc-400">
                  Manage flagship master recordings included in the PDF dossier:
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {epk.keyTracks.map((trk, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-between gap-2">
                      <div className="truncate">
                        <div className="font-bold text-white truncate text-xs">{trk.title}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{trk.duration} • {trk.streams} streams</div>
                      </div>
                      <button
                        onClick={() => handleRemoveTrack(i)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2 pt-2.5">
                  <div className="font-bold text-white text-[11px]">Add New Master Recording</div>
                  <input
                    type="text"
                    placeholder="Track Title (e.g. Lagos Skyline)"
                    value={newTrack.title}
                    onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-white text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Duration (3:15)"
                      value={newTrack.duration}
                      onChange={(e) => setNewTrack({ ...newTrack, duration: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Streams (250K)"
                      value={newTrack.streams}
                      onChange={(e) => setNewTrack({ ...newTrack, streams: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-white text-xs"
                    />
                  </div>
                  <button
                    onClick={handleAddTrack}
                    className="w-full py-1.5 rounded-lg bg-[#F97316]/10 text-[#F97316] hover:bg-[#F97316]/20 border border-[#F97316]/30 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Append Master Track</span>
                  </button>
                </div>
              </div>
            )}

            {activeControlTab === "press" && (
              <div className="space-y-3 animate-fade-in">
                <div className="text-[11px] text-zinc-400">
                  Manage critical acclaim quotes printed in the PDF dossier:
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {epk.pressQuotes.map((q, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#09090B] border border-[#27272A] space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-zinc-300 italic text-[11px]">"{q.quote}"</p>
                        <button
                          onClick={() => handleRemoveQuote(i)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-[10px] text-[#F97316] font-mono font-bold">— {q.source}</div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2 pt-2.5">
                  <div className="font-bold text-white text-[11px]">Add Press / Media Quote</div>
                  <textarea
                    rows={2}
                    placeholder="Quote text..."
                    value={newQuote.quote}
                    onChange={(e) => setNewQuote({ ...newQuote, quote: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Publication / Source (e.g. Rolling Stone Africa)"
                    value={newQuote.source}
                    onChange={(e) => setNewQuote({ ...newQuote, source: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-white text-xs"
                  />
                  <button
                    onClick={handleAddQuote}
                    className="w-full py-1.5 rounded-lg bg-[#F97316]/10 text-[#F97316] hover:bg-[#F97316]/20 border border-[#F97316]/30 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Append Press Quote</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Export CTA in Left Panel */}
            <div className="pt-2 border-t border-[#27272A] space-y-2">
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-black font-bold text-xs font-['Space_Grotesk'] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#F97316]/20 transition-all"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Configure & Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive EPK Dossier */}
        <div className="lg:col-span-8 space-y-5 sm:space-y-6">
          <div className="bento-card p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 relative overflow-hidden rounded-2xl sm:rounded-3xl">
            {/* EPK Hero Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#27272A]">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#F97316] p-1 flex items-center justify-center text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-black shadow-xl shadow-[#F97316]/20 shrink-0">
                  {epk.artistName.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-['Space_Grotesk'] text-xl sm:text-2xl md:text-3xl font-extrabold text-white truncate">
                      {epk.artistName}
                    </h2>
                    <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-md sm:rounded-lg bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30 shrink-0">
                      VERIFIED ARTIST
                    </span>
                  </div>
                  <div className="text-xs font-mono text-[#A1A1AA] mt-0.5 truncate">
                    {epk.genre} • {epk.hometown}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                <button
                  onClick={handleQuickPdfDownload}
                  disabled={isQuickExporting}
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#F97316]/10 hover:bg-[#F97316]/20 text-[11px] sm:text-xs font-mono text-[#F97316] border border-[#F97316]/30 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>{isQuickExporting ? "Compiling..." : "Direct PDF"}</span>
                </button>

                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#323238] text-[11px] sm:text-xs font-mono text-zinc-300 hover:text-white flex items-center justify-center gap-1 border border-[#3F3F46] cursor-pointer transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Options</span>
                </button>

                <button
                  onClick={() => copyText(JSON.stringify(epk, null, 2), "epk-full")}
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#323238] text-[11px] sm:text-xs font-mono text-zinc-300 hover:text-white flex items-center justify-center gap-1 border border-[#3F3F46] cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>{copiedId === "epk-full" ? "Copied" : "JSON"}</span>
                </button>
              </div>
            </div>

            {/* Catalog Streaming Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#09090B] border border-[#27272A] space-y-0.5 sm:space-y-1">
                <div className="text-[9px] sm:text-[10px] font-mono text-[#A1A1AA] uppercase truncate">Monthly Listeners</div>
                <div className="text-base sm:text-lg font-bold text-white font-['Space_Grotesk']">{epk.monthlyListeners}</div>
              </div>
              <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#09090B] border border-[#27272A] space-y-0.5 sm:space-y-1">
                <div className="text-[9px] sm:text-[10px] font-mono text-[#A1A1AA] uppercase truncate">Total Streams</div>
                <div className="text-base sm:text-lg font-bold text-[#F97316] font-['Space_Grotesk']">{epk.totalStreams}</div>
              </div>
              <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#09090B] border border-[#27272A] space-y-0.5 sm:space-y-1">
                <div className="text-[9px] sm:text-[10px] font-mono text-[#A1A1AA] uppercase truncate">Instagram Community</div>
                <div className="text-base sm:text-lg font-bold text-white font-['Space_Grotesk']">{epk.instagramFollowers}</div>
              </div>
              <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#09090B] border border-[#27272A] space-y-0.5 sm:space-y-1">
                <div className="text-[9px] sm:text-[10px] font-mono text-[#A1A1AA] uppercase truncate">TikTok Audience</div>
                <div className="text-base sm:text-lg font-bold text-[#F97316] font-['Space_Grotesk']">{epk.tiktokFollowers}</div>
              </div>
            </div>

            {/* Official Artist Biography */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F97316] pb-1 border-b border-[#27272A]">
                Official Biography & Lore
              </h3>
              <div className="text-xs text-zinc-300 leading-relaxed space-y-2 whitespace-pre-line bg-[#09090B] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#27272A]">
                {epk.bioFull}
              </div>
            </div>

            {/* Featured Catalog Audio Player Simulation */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white pb-1 border-b border-[#27272A]">
                Flagship Singles & Master Recordings
              </h3>
              <div className="space-y-2">
                {epk.keyTracks.map((trk, tIdx) => {
                  const isPlaying = activePlayingIndex === tIdx;
                  return (
                    <div
                      key={tIdx}
                      className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#09090B] border border-[#27272A] hover:border-[#F97316]/40 flex items-center justify-between gap-2.5 transition-all"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <button
                          onClick={() => setActivePlayingIndex(isPlaying ? null : tIdx)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                            isPlaying ? "bg-[#F97316] text-black" : "bg-[#27272A] text-zinc-300 hover:text-white"
                          }`}
                        >
                          {isPlaying ? <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" /> : <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5 fill-current" />}
                        </button>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{trk.title}</div>
                          <div className="text-[10px] font-mono text-[#A1A1AA] truncate">
                            {trk.duration} • {trk.streams} streams • {trk.dsp}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-mono text-[#F97316] bg-[#F97316]/10 px-2 sm:px-2.5 py-0.5 rounded-lg border border-[#F97316]/30 shrink-0">
                        {isPlaying ? "STREAMING..." : "MASTER"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Press Quotes & Co-Signs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {epk.pressQuotes.map((q, qIdx) => (
                <div key={qIdx} className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#09090B] border border-[#27272A] space-y-1.5 text-xs">
                  <p className="text-zinc-300 italic">"{q.quote}"</p>
                  <div className="text-[10px] font-mono text-[#F97316] font-bold uppercase">— {q.source}</div>
                </div>
              ))}
            </div>

            {/* Booking & Management Footer */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#09090B] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div>
                <div className="font-bold text-white">Live Booking & Brand Partnerships</div>
                <div className="font-mono text-[11px] text-[#A1A1AA]">{epk.bookingEmail}</div>
              </div>
              <div className="text-[10px] font-mono text-[#F97316]">
                {epk.management}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Export Modal */}
      <EPKExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        epk={epk}
        onNotify={onNotify}
      />
    </div>
  );
};

export default EPKBuilder;

