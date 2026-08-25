import React, { useState, useEffect } from "react";
import { DSPPitchData, PlaylistTarget } from "../types";
import { PRESET_PLAYLIST_TARGETS } from "../data/mockData";
import { ArtistBrainSkeleton } from "./skeletons/ModuleSkeletons";
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Radio, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  ListMusic, 
  Mail, 
  ExternalLink,
  Target,
  BarChart3,
  DollarSign,
  Users,
  Compass,
  FileCheck,
  Disc
} from "lucide-react";
import confetti from "canvas-confetti";

interface DSPPitcherProps {
  onNotify: (text: string, type?: "success" | "info" | "error") => void;
}

export const DSPPitcher: React.FC<DSPPitcherProps> = ({ onNotify }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [pitchData, setPitchData] = useState<DSPPitchData>({
    trackTitle: "Midnight in Victoria Island",
    artistName: "ZACK KHALIFA",
    featuredArtists: "Maya Soul",
    releaseDate: "2026-09-18",
    primaryGenre: "Afro-Fusion",
    subGenres: ["Amapiano", "Alté R&B", "Global Pop"],
    moods: ["Confident", "Late Night Drive", "High Energy", "Empowering"],
    instruments: ["Log Drum", "Electric Guitar", "Analog Sub Bass", "Afro Shakers"],
    language: "English / Nigerian Pidgin / Yoruba",
    isExplicit: false,
    recordingLocation: "Lagos, Nigeria (Keedohub Sound Labs)",
    culturalStory: "A defining modern Lagos sonic anthem celebrating youth ambition, resilience, and midnight romance.",
    marketingBudgetUSD: 1500,
    preSaveCount: 520,
    dspPitchShort: `"Midnight in Victoria Island" is an energetic Afro-Fusion record driven by pulsating Amapiano log drums, melodic electric guitar licks, and anthemic hooks. With $1,500 dedicated digital ad spend, 520+ verified pre-saves, and support from top West African club DJs, it is tailored for African Heat, Afro Pop Hits, and New Music Friday.`,
    pressPitchFull: `Rising Nigerian recording artist ZACK KHALIFA teams up with vocal sensation Maya Soul on their latest crossover single, "Midnight in Victoria Island". Produced with pristine acoustic depth and backed by Keedohub Creative OS, the record bridges West African log drum heritage with global stadium vocal charisma. Now servicing playlist curators, radio programmers, and international tastemakers.`,
    curatorDMEmail: `Subject: Priority Track Submission: "Midnight in Victoria Island" — ZACK KHALIFA (Afro-Fusion / Amapiano)\n\nHi Editorial Curator,\n\nI hope you're having an inspired week. I am submitting "Midnight in Victoria Island" by Zack Khalifa (feat. Maya Soul) for playlist consideration on African Heat and Afro Pop Hits.\n\nThe track combines infectious syncopated log drums with soaring vocal harmonies. We have committed $1,500 in targeted social advertising, secured 520+ pre-saves, and generated heavy teaser engagement across TikTok.\n\nStream the full master WAV here: [Link] — Thank you for supporting independent African artistry!\n\nBest regards,\nKeedohub Talent Division`,
    pitchScore: 95,
  });

  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"spotify-pitch" | "curator-email" | "press-release" | "playlist-directory">("spotify-pitch");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 320);
    return () => clearTimeout(timer);
  }, []);

  // Calculate dynamic pitch health score
  const calculateScore = () => {
    let score = 50;
    const words = pitchData.dspPitchShort.trim().split(/\s+/).length;
    if (words >= 45 && words <= 75) score += 15; // Optimal Spotify pitch length
    if (pitchData.marketingBudgetUSD >= 500) score += 10;
    if (pitchData.preSaveCount >= 200) score += 10;
    if (pitchData.instruments.length >= 2) score += 5;
    if (pitchData.moods.length >= 2) score += 5;
    if (pitchData.culturalStory.length > 20) score += 5;
    return Math.min(99, score);
  };

  const currentScore = calculateScore();

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
    onNotify(`Copied ${fieldName} to clipboard!`, "success");
  };

  // AI Pitch Generator
  const handleGenerateAiPitch = async () => {
    setIsLoadingAi(true);
    onNotify("Analyzing playlist criteria & crafting curator pitch...", "info");
    try {
      const res = await fetch("/api/ai/dsp-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pitchData),
      });
      const data = await res.json();
      if (data && data.data) {
        setPitchData((prev) => ({
          ...prev,
          dspPitchShort: data.data.dspPitchShort || prev.dspPitchShort,
          pressPitchFull: data.data.pressPitchFull || prev.pressPitchFull,
          curatorDMEmail: data.data.curatorDMEmail || prev.curatorDMEmail,
          pitchScore: data.data.pitchScore || 94,
        }));
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
        onNotify("Generated high-converting DSP pitches!", "success");
      }
    } catch (err) {
      onNotify("Error generating AI pitch", "error");
    } finally {
      setIsLoadingAi(false);
    }
  };

  if (isInitializing) {
    return <ArtistBrainSkeleton />;
  }

  return (
    <div id="dsp-pitcher-module" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--bento-card)] border border-[var(--bento-border)] p-5 sm:p-6 rounded-3xl shadow-lg">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-theme-accent text-white shadow-md">
              <Target className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-[var(--bento-text)]">
              DSP Pitch & Curator Strategy Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              SPOTIFY FOR ARTISTS READY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--bento-muted)] max-w-2xl">
            Curators discard 95% of pitches due to missing data tags or wrong formatting. Engineer high-converting pitches for <strong className="text-[var(--bento-text)]">Spotify, Apple Music, and Audiomack</strong> editorial teams.
          </p>
        </div>

        {/* Pitch Score Badge */}
        <div className="flex items-center gap-3 bg-[var(--bento-elevated)] p-3 rounded-2xl border border-[var(--bento-border)]">
          <div className="w-12 h-12 rounded-xl bg-theme-accent flex flex-col items-center justify-center text-white shadow-md">
            <span className="text-lg font-black font-mono leading-none">{currentScore}%</span>
            <span className="text-[8px] font-mono uppercase tracking-tight">SCORE</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--bento-text)]">Curator Acceptance Rating</p>
            <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready for Spotify Editorial
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Form & Data Matrix / Right Formatted Pitches & Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ==========================================
            LEFT: INPUT PARAMETERS & DATA METRICS (Col 5)
            ========================================== */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-4 sm:p-5 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--bento-border)] pb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent-pill-text)]">
                Release Metadata & Curator Tags
              </h3>
              <button
                onClick={handleGenerateAiPitch}
                disabled={isLoadingAi}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-accent text-white text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLoadingAi ? "Analyzing..." : "Auto-Pitch AI"}</span>
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-[var(--bento-muted)] block mb-1">Track Title</label>
                  <input
                    type="text"
                    value={pitchData.trackTitle}
                    onChange={(e) => setPitchData({ ...pitchData, trackTitle: e.target.value })}
                    className="w-full bg-[var(--bento-bg)] border border-[var(--bento-border)] px-3 py-2 rounded-xl text-xs text-[var(--bento-text)] font-bold focus:outline-none focus:border-[var(--accent-border)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[var(--bento-muted)] block mb-1">Primary Artist</label>
                  <input
                    type="text"
                    value={pitchData.artistName}
                    onChange={(e) => setPitchData({ ...pitchData, artistName: e.target.value })}
                    className="w-full bg-[var(--bento-bg)] border border-[var(--bento-border)] px-3 py-2 rounded-xl text-xs text-[var(--bento-text)] font-bold focus:outline-none focus:border-[var(--accent-border)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-[var(--bento-muted)] block mb-1">Featured Artist(s)</label>
                  <input
                    type="text"
                    value={pitchData.featuredArtists}
                    onChange={(e) => setPitchData({ ...pitchData, featuredArtists: e.target.value })}
                    className="w-full bg-[var(--bento-bg)] border border-[var(--bento-border)] px-3 py-2 rounded-xl text-xs text-[var(--bento-text)] focus:outline-none focus:border-[var(--accent-border)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[var(--bento-muted)] block mb-1">Primary Genre</label>
                  <select
                    value={pitchData.primaryGenre}
                    onChange={(e) => setPitchData({ ...pitchData, primaryGenre: e.target.value })}
                    className="w-full bg-[var(--bento-bg)] border border-[var(--bento-border)] px-3 py-2 rounded-xl text-xs text-[var(--bento-text)] font-bold focus:outline-none focus:border-[var(--accent-border)]"
                  >
                    <option value="Afro-Fusion">Afro-Fusion</option>
                    <option value="Afrobeats">Afrobeats</option>
                    <option value="Amapiano">Amapiano</option>
                    <option value="Hip-Hop / Drill">Hip-Hop / Drill</option>
                    <option value="R&B / Soul">R&B / Soul</option>
                    <option value="Alté / Indie">Alté / Indie</option>
                    <option value="Dancehall / Reggae">Dancehall / Reggae</option>
                  </select>
                </div>
              </div>

              {/* Verified Proof Metrics (Budget & Pre-Saves) */}
              <div className="p-3 rounded-2xl bg-[var(--bento-elevated)] border border-[var(--bento-border)] space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                  Algorithm & Marketing Proof
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-[var(--bento-muted)] flex items-center gap-1 mb-1">
                      <DollarSign className="w-3 h-3 text-emerald-400" /> Ad Budget ($ USD)
                    </label>
                    <input
                      type="number"
                      value={pitchData.marketingBudgetUSD}
                      onChange={(e) => setPitchData({ ...pitchData, marketingBudgetUSD: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[var(--bento-bg)] border border-[var(--bento-border)] px-2.5 py-1.5 rounded-xl text-xs text-[var(--bento-text)] font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[var(--bento-muted)] flex items-center gap-1 mb-1">
                      <Users className="w-3 h-3 text-cyan-400" /> Pre-Save Count
                    </label>
                    <input
                      type="number"
                      value={pitchData.preSaveCount}
                      onChange={(e) => setPitchData({ ...pitchData, preSaveCount: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[var(--bento-bg)] border border-[var(--bento-border)] px-2.5 py-1.5 rounded-xl text-xs text-[var(--bento-text)] font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Cultural Diaspora Story */}
              <div>
                <label className="text-[10px] font-mono text-[var(--bento-muted)] block mb-1">
                  Cultural Narrative & Song Context
                </label>
                <textarea
                  rows={2}
                  value={pitchData.culturalStory}
                  onChange={(e) => setPitchData({ ...pitchData, culturalStory: e.target.value })}
                  className="w-full bg-[var(--bento-bg)] border border-[var(--bento-border)] px-3 py-2 rounded-xl text-xs text-[var(--bento-text)] focus:outline-none focus:border-[var(--accent-border)] leading-relaxed resize-none"
                />
              </div>

              {/* Pitch Checklist Card */}
              <div className="p-3 rounded-2xl bg-[var(--bento-bg)] border border-[var(--bento-border)] space-y-1.5 text-[11px]">
                <span className="font-mono font-bold text-[10px] text-[var(--bento-muted)] uppercase tracking-wider block">
                  Spotify Reviewer Checklist
                </span>
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Character Limit (&lt; 500 chars)</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {pitchData.dspPitchShort.length} / 500
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Instruments Specified</span>
                  <span className="font-mono text-emerald-400 font-bold">4 Logged</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Promotion Budget Committed</span>
                  <span className="font-mono text-emerald-400 font-bold">${pitchData.marketingBudgetUSD}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            RIGHT: PITCH TABS & PLAYLIST DIRECTORY (Col 7)
            ========================================== */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Sub Navigation */}
          <div className="flex items-center gap-2 border-b border-[var(--bento-border)] pb-3">
            <button
              onClick={() => setSelectedTab("spotify-pitch")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTab === "spotify-pitch"
                  ? "bg-theme-accent text-white shadow"
                  : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] bg-[var(--bento-card)] border border-[var(--bento-border)]"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Spotify for Artists (50 Words)</span>
            </button>

            <button
              onClick={() => setSelectedTab("curator-email")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTab === "curator-email"
                  ? "bg-theme-accent text-white shadow"
                  : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] bg-[var(--bento-card)] border border-[var(--bento-border)]"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Cold Curator DM</span>
            </button>

            <button
              onClick={() => setSelectedTab("playlist-directory")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTab === "playlist-directory"
                  ? "bg-theme-accent text-white shadow"
                  : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] bg-[var(--bento-card)] border border-[var(--bento-border)]"
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Target Playlists (6 Flagship)</span>
            </button>
          </div>

          {/* TAB 1: Spotify for Artists Pitch Form */}
          {selectedTab === "spotify-pitch" && (
            <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-5 rounded-3xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--bento-text)] font-['Space_Grotesk']">
                    Official Spotify Editorial Pitch Note
                  </h3>
                  <p className="text-[11px] text-[var(--bento-muted)]">
                    Paste directly into your Spotify for Artists release submission box before the 7-day cutoff.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(pitchData.dspPitchShort, "Spotify Pitch")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-accent text-white text-xs font-bold shadow hover:brightness-110 cursor-pointer"
                >
                  {copiedField === "Spotify Pitch" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "Spotify Pitch" ? "Copied!" : "Copy Pitch"}</span>
                </button>
              </div>

              {/* Editable Pitch Box */}
              <div className="relative">
                <textarea
                  rows={5}
                  value={pitchData.dspPitchShort}
                  onChange={(e) => setPitchData({ ...pitchData, dspPitchShort: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-2xl font-mono text-xs text-neutral-200 focus:outline-none focus:border-[var(--accent-border)] leading-relaxed resize-none"
                />
                <div className="absolute bottom-3 right-3 text-[10px] font-mono text-neutral-500">
                  {pitchData.dspPitchShort.length} / 500 characters
                </div>
              </div>

              {/* Why Curators Love This Breakdown */}
              <div className="p-3.5 rounded-2xl bg-[var(--bento-elevated)] border border-[var(--bento-border)] space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent-pill-text)] block">
                  Curator Benchmark Analysis
                </span>
                <ul className="text-xs text-[var(--bento-muted)] space-y-1">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Exact length (50-70 words) prevents editor eye fatigue.</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Names specific target editorial lists (African Heat, Afro Pop Hits).</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Validates skin-in-the-game marketing spend ($1,500) & verified pre-saves.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: Cold Curator DM / Email Pitch */}
          {selectedTab === "curator-email" && (
            <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-5 rounded-3xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--bento-text)] font-['Space_Grotesk']">
                    Indie Curator Outreach Email & DM
                  </h3>
                  <p className="text-[11px] text-[var(--bento-muted)]">
                    Send to verified third-party playlist curators on Instagram, X, and SubmitHub.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(pitchData.curatorDMEmail, "Curator Email")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-accent text-white text-xs font-bold shadow hover:brightness-110 cursor-pointer"
                >
                  {copiedField === "Curator Email" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "Curator Email" ? "Copied!" : "Copy Email"}</span>
                </button>
              </div>

              <textarea
                rows={9}
                value={pitchData.curatorDMEmail}
                onChange={(e) => setPitchData({ ...pitchData, curatorDMEmail: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-2xl font-mono text-xs text-neutral-200 focus:outline-none focus:border-[var(--accent-border)] leading-relaxed resize-none"
              />
            </div>
          )}

          {/* TAB 3: Flagship Playlists Directory */}
          {selectedTab === "playlist-directory" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {PRESET_PLAYLIST_TARGETS.map((target) => (
                <div
                  key={target.id}
                  className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-4 rounded-2xl hover:border-[var(--accent-border)] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[var(--bento-text)]">{target.name}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-theme-accent text-white">
                        {target.dsp}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {target.followerCount}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--bento-muted)]">{target.vibe}</p>
                    <p className="text-[11px] text-[var(--accent-pill-text)] font-mono">
                      💡 Tip: {target.curatorTip}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setPitchData((prev) => ({
                        ...prev,
                        dspPitchShort: prev.dspPitchShort + ` Specifically targeted for ${target.name}.`,
                      }));
                      setSelectedTab("spotify-pitch");
                      onNotify(`Targeted pitch for ${target.name}!`, "info");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[var(--bento-elevated)] hover:bg-theme-accent hover:text-white border border-[var(--bento-border)] text-xs font-bold text-[var(--bento-text)] transition-all shrink-0 cursor-pointer"
                  >
                    Target This
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
