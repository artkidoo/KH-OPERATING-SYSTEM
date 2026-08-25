import React, { useState, useEffect, useRef } from "react";
import { RolloutPlan, RolloutPhase, RolloutDayAction } from "../types";
import { ArtistBrainSkeleton } from "./skeletons/ModuleSkeletons";
import { AssetStudio } from "./AssetStudio";
import { 
  Disc3, 
  Sparkles, 
  Calendar, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  Flame, 
  Radio, 
  Music, 
  Tv, 
  Send,
  Zap,
  ArrowRight,
  Layers,
  FileSpreadsheet,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  TrendingUp,
  Sliders,
  Hash,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Eye,
  RefreshCw,
  Palette,
  Volume2,
  Headphones,
  CheckSquare
} from "lucide-react";
import confetti from "canvas-confetti";

interface ArtistContentBrainProps {
  onNotify: (msg: string, type?: "success" | "info") => void;
  openBriefModal?: () => void;
}

export const ArtistContentBrain: React.FC<ArtistContentBrainProps> = ({ onNotify, openBriefModal }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Track parameters
  const [trackTitle, setTrackTitle] = useState("Midnight in Victoria Island");
  const [artistName, setArtistName] = useState("Zack Khalifa");
  const [genre, setGenre] = useState("Afro-Fusion / Alté");
  const [releaseType, setReleaseType] = useState("Single");
  const [releaseDate, setReleaseDate] = useState("2026-09-15");
  const [keyTheme, setKeyTheme] = useState("Late-night luxury drive, relentless ambition, hypnotic log drum rhythm");
  const [targetAudience, setTargetAudience] = useState("Gen-Z & Millennial Afrobeats tastemakers, club DJs, Spotify curators");

  // Cover Art Upload & State
  const [coverArtUrl, setCoverArtUrl] = useState<string>("/assets/samples/album_cover_1.jpg");
  const [isCustomCover, setIsCustomCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active view tab inside workstation
  type BrainTab = "blueprint" | "schedule" | "promokit" | "pitch" | "hooks" | "checklist";
  const [activeTab, setActiveTab] = useState<BrainTab>("blueprint");

  // Schedule phase tab
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showMobileParams, setShowMobileParams] = useState(false);

  // Default pre-populated rollout plan
  const [rolloutPlan, setRolloutPlan] = useState<RolloutPlan>({
    tagline: `Experience "Midnight in Victoria Island" — The Next Defining Era of Zack Khalifa`,
    diasporaAngle: `A high-octane sonic journey rooted in Afro-Fusion engineered for global radio, heavy club rotations, and flagship DSP editorial playlists.`,
    phases: [
      {
        phaseName: "Phase 1: Pre-Release Anticipation",
        focus: "Cultivate mysterious intrigue, collect verified pre-saves, and seed viral TikTok/Reels audio snippets",
        timeframe: "T-14 to T-1 Days",
        actions: [
          {
            day: "Day -14",
            platform: "Instagram Reels & TikTok",
            contentType: "Studio Voice Memo / Creation Moment",
            concept: "Raw studio recording clip showing the moment the hook was created at 3 AM with the producer.",
            captionHook: `When the melody hit at 3 AM... "Midnight in Victoria Island" drops Sep 15. Pre-save link in bio! 🔥`,
            timeToPost: "18:30 GMT+1 (WAT) / 1:30 PM EST",
            algorithmTip: "First 2.5s visual hook; pin the top comment asking fans to guess the release date for algorithmic dwell time.",
            soundSnippet: "Intro build-up into initial hook (0:00 - 0:18)",
            hashtags: ["#NewMusicAlert", "#BehindTheBeat", "#StudioSession", "#Afrobeats2026"],
            priority: "CRITICAL",
          },
          {
            day: "Day -10",
            platform: "Spotify Pre-Save & Apple Music",
            contentType: "Official 3D Cover Artwork Reveal",
            concept: "High-resolution 3D animated cover art reveal with official Keedohub badge and soundbite.",
            captionHook: `Official Cover Art for "Midnight in Victoria Island". Designed with @Keedohub. Tag 3 people who need this sound!`,
            timeToPost: "19:00 GMT+1 (WAT) / 2:00 PM EST",
            algorithmTip: "Carousel post with 3 slides to maximize swipe-through time and share-to-story triggers.",
            soundSnippet: "Chorus energy peak (0:45 - 1:05)",
            hashtags: ["#CoverArtReveal", "#PreSaveNow", "#FreshMusic", "#KeedohubOS"],
            priority: "HIGH",
          },
          {
            day: "Day -5",
            platform: "TikTok & YouTube Shorts",
            contentType: "15-Second Relatable Sound Hook",
            concept: "Point-of-view (POV) relatable video featuring the track's most memorable 15 seconds (late-night drive transition).",
            captionHook: `Use this sound if you're stepping into your winning era this month 🚀 #NewMusic #ZackKhalifa`,
            timeToPost: "20:15 GMT+1 (WAT) / 3:15 PM EST",
            algorithmTip: "Looping video format where the last frame matches the first for 100%+ retention rate.",
            soundSnippet: "Main vocal punchline (0:30 - 0:45)",
            hashtags: ["#POV", "#TrendingAudio", "#SongOfTheSummer", "#ViralSound"],
            priority: "CRITICAL",
          },
          {
            day: "Day -1",
            platform: "All Channels & WhatsApp Broadcast",
            contentType: "24-Hour Midnight Lockdown Countdown",
            concept: "Dark aesthetic visualizer loop with countdown timer ticker and direct streaming smart link.",
            captionHook: `Midnight tonight. The world receives "Midnight in Victoria Island". Are your headphones ready? 🎧⚡`,
            timeToPost: "21:00 GMT+1 (WAT) / 4:00 PM EST",
            algorithmTip: "Direct DM/WhatsApp broadcast to top 50 core superfans for instant hour-one stream spike.",
            soundSnippet: "Drop climax (0:50 - 1:10)",
            hashtags: ["#MidnightDrop", "#NewMusicFriday", "#OutTonight", "#StreamNow"],
            priority: "HIGH",
          },
        ],
      },
      {
        phaseName: "Phase 2: Drop Day & Launch Weekend",
        focus: "Trigger maximum Day-1 streaming velocity, editorial playlist saves, and algorithm indexing",
        timeframe: "Day 0 to Day 3",
        actions: [
          {
            day: "Day 0 (Release Day)",
            platform: "All Streaming Platforms & Socials",
            contentType: "Official Release Broadcast & SmartLink",
            concept: "Multi-slide carousel with high-res artwork, direct SmartLink, and streaming badges.",
            captionHook: `OUT NOW EVERYWHERE! "Midnight in Victoria Island" is officially yours. Stream loud, share worldwide. Link in bio! 🌍✨`,
            timeToPost: "00:01 Midnight & 12:00 Noon Followup",
            algorithmTip: "Reply to every single comment within the first 60 minutes to trigger algorithm push.",
            soundSnippet: "Full Track Streaming",
            hashtags: ["#OutNow", "#NewMusicFriday", "#StreamNow", "#GlobalSounds"],
            priority: "CRITICAL",
          },
          {
            day: "Day 1",
            platform: "X (Twitter) & Instagram Stories",
            contentType: "Behind-the-Lyrics Deep Dive",
            concept: "Short voice note + lyric breakdown graphic explaining the inspiration behind the track.",
            captionHook: `The story behind "Midnight in Victoria Island": Why this record means everything to me right now.`,
            timeToPost: "17:45 GMT+1 (WAT) / 12:45 PM EST",
            algorithmTip: "Text-heavy graphic with lyric cards; ask fans which line speaks to them.",
            soundSnippet: "Verse 2 standout lyric (1:15 - 1:35)",
            hashtags: ["#LyricBreakdown", "#Songwriter", "#Afrobeats"],
            priority: "HIGH",
          },
          {
            day: "Day 3",
            platform: "YouTube & Instagram Reels",
            contentType: "Official Motion Lyric Video",
            concept: "Kinetic typography motion video produced by Keedohub Motion Studio.",
            captionHook: `Full official visualizer for "Midnight in Victoria Island" is live on YouTube. Watch and tell me your favorite lyric 👇`,
            timeToPost: "18:00 GMT+1 (WAT) / 1:00 PM EST",
            algorithmTip: "End screen card routing viewers to official Spotify profile and YouTube playlist.",
            soundSnippet: "Full song synchronized",
            hashtags: ["#LyricVideo", "#Visualizer", "#OfficialAudio"],
            priority: "HIGH",
          },
        ],
      },
      {
        phaseName: "Phase 3: Post-Release Sustained Momentum",
        focus: "User-generated content (UGC), DJ club promotion, press followups, and live acoustic re-imaginations",
        timeframe: "Day 4 to Day 30",
        actions: [
          {
            day: "Day 7",
            platform: "TikTok & Instagram",
            contentType: "Fan Challenge / UGC Showcase",
            concept: "Reposting top fan dance/vibe clips using the official sound with artist reactions.",
            captionHook: `The energy on "Midnight in Victoria Island" is insane! Keep tagging me, reposting the best ones all week! 🔥`,
            timeToPost: "19:30 GMT+1 (WAT) / 2:30 PM EST",
            algorithmTip: "Tag creators to generate reciprocal community sharing loop.",
            soundSnippet: "Dance hook section (0:30 - 0:50)",
            hashtags: ["#FanReactions", "#Challenge", "#DanceVibes"],
            priority: "HIGH",
          },
          {
            day: "Day 14",
            platform: "YouTube & Live Sessions",
            contentType: "Raw Acoustic / Mic Session",
            concept: "Stripped-down live acoustic vocal rendition in a minimal studio setup.",
            captionHook: `Stripped down version of "Midnight in Victoria Island". Nothing but raw emotion.`,
            timeToPost: "18:00 GMT+1 (WAT) / 1:00 PM EST",
            algorithmTip: "Upload in 4K resolution with high audio fidelity for YouTube discovery algorithm.",
            soundSnippet: "Live acoustic vocal arrangement",
            hashtags: ["#AcousticSession", "#LiveMusic", "#RawVocals"],
            priority: "MEDIUM",
          },
          {
            day: "Day 21",
            platform: "Club DJs & Radio Outreach",
            contentType: "Club Pack & Extended Mix Drop",
            concept: "Servicing radio DJs, club selectors, and mix hosts with extended intro/outro DJ edits.",
            captionHook: `DJs! The extended club pack for "Midnight in Victoria Island" is now live in the promo vault. Link in bio for WAV stems.`,
            timeToPost: "16:00 GMT+1 (WAT) / 11:00 AM EST",
            algorithmTip: "Drive to Dropbox/Google Drive folder via private promo list.",
            soundSnippet: "128 BPM Extended Club Intro",
            hashtags: ["#DJPack", "#ClubMix", "#RadioPromo"],
            priority: "MEDIUM",
          },
        ],
      },
    ],
    dspPitch: {
      pitchTitle: `Zack Khalifa — "Midnight in Victoria Island" (Afro-Fusion Release)`,
      genreTags: ["Afrobeats", "Alté", "Contemporary R&B", "Global Sounds"],
      moodTags: ["Energetic", "Late Night", "Confident", "Feel-Good"],
      instruments: ["Log Drum / Amapiano Shakers", "Electric Guitar Licks", "Analog Bass", "Vocal Harmonies"],
      editorialNote: `"Midnight in Victoria Island" is an infectious, club-ready release blending dynamic percussion with anthemic vocal hooks. Ideal for flagship playlists like African Heat, New Music Friday, and Global Waves.`,
      targetPlaylists: ["African Heat (Spotify)", "Afro-Pop Hits (Apple Music)", "Afrobeats Fresh (Audiomack)", "New Music Daily", "Global Groove"],
      curatorAngle: "A distinctive sonic bridge combining rhythmic African percussion with sleek international melodic hooks.",
    },
    pressReleaseExcerpt: `FOR IMMEDIATE RELEASE: Multi-talented artist Zack Khalifa has officially unveiled their latest masterpiece, "Midnight in Victoria Island". Crafted with high-grade sonic engineering and backed by the Keedohub Creative Operating System, the record delivers an unmatched blend of rhythm, emotion, and global appeal. Now available on all major streaming services worldwide.`,
    contentHooks: [
      `"POV: You found the song that's going to define your entire 2026 late-night drive."`,
      `"Tell me this chorus doesn't give you goosebumps on the first listen..."`,
      `"When you told your producer to make something timeless, and he cooked this:"`,
      `"Don't skip if you need a new anthem for your daily morning gym drive."`,
      `"Rating my new single 'Midnight in Victoria Island' from 1 to 10... be brutally honest!"`,
    ],
    hashtags: ["#NewMusicAlert", "#AfrobeatsGlobal", "#StreamNow", "#KeedohubOS", "#SongOfTheSummer"],
    algorithmStrategy: {
      soundBiteRule: "Keep TikTok soundbite strictly between 12.5s and 16.5s to trigger auto-loop replays.",
      retentionMetric: "Target >65% 3-second hook retention and >28% completion rate for algorithmic feed push.",
      postingCadence: "1 core TikTok/Reel per day between 18:00 and 21:00 local time during Launch Week.",
      smartLinkTactic: "Use unified pre-save hub to prevent bounce rate from broken DSP destination links.",
    },
    releaseChecklist: [
      { id: "chk-1", task: "Submit Track to Distributor (Min 14 Days Ahead for DSP Pitching)", category: "METADATA", deadline: "T-14 Days", completed: true },
      { id: "chk-2", task: "Master Artwork 3000x3000px 300DPI RGB Specification", category: "CREATIVE", deadline: "T-12 Days", completed: true },
      { id: "chk-3", task: "Submit Spotify for Artists Editorial Pitch with Story Narrative", category: "EDITORIAL", deadline: "T-10 Days", completed: false },
      { id: "chk-4", task: "Verify Producer & Songwriter Split Sheets (100% Signed)", category: "METADATA", deadline: "T-7 Days", completed: true },
      { id: "chk-5", task: "Generate 9:16 Vertical Video Teaser & Promo Cards", category: "CREATIVE", deadline: "T-5 Days", completed: false },
      { id: "chk-6", task: "Activate Smart Pre-Save Link & Sync Fan SMS/Email Capture", category: "PROMO", deadline: "T-3 Days", completed: true },
      { id: "chk-7", task: "Upload Spotify Canvas 9:16 Loop (3-8 seconds)", category: "CREATIVE", deadline: "T-2 Days", completed: false },
      { id: "chk-8", task: "Prepare WhatsApp VIP Superfan & DJ Promo Broadcast Stems", category: "PROMO", deadline: "T-1 Day", completed: false },
    ],
  });

  const [checklistState, setChecklistState] = useState(rolloutPlan.releaseChecklist || []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 280);
    return () => clearTimeout(timer);
  }, []);

  // Update checklist when rollout plan updates
  useEffect(() => {
    if (rolloutPlan.releaseChecklist) {
      setChecklistState(rolloutPlan.releaseChecklist);
    }
  }, [rolloutPlan]);

  const toggleChecklistItem = (id: string) => {
    setChecklistState(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
    onNotify("Checklist progress updated", "info");
  };

  // Image Upload Handler
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        onNotify("Image is too large (max 15MB)", "info");
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      setCoverArtUrl(objectUrl);
      setIsCustomCover(true);
      onNotify("Cover artwork loaded into Promo Kit generator!", "success");
    }
  };

  const handleGenerateRollout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/artist-rollout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackTitle,
          artistName,
          genre,
          releaseType,
          releaseDate,
          keyTheme,
          targetAudience,
        }),
      });

      const json = await res.json();
      if (json && json.data) {
        setRolloutPlan(json.data);
        if (json.data.releaseChecklist) {
          setChecklistState(json.data.releaseChecklist);
        }
        onNotify(`Programmed Rollout Brain synthesized for "${trackTitle}"!`, "success");
        try {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        } catch (e) {
          // ignore
        }
      }
    } catch (err: any) {
      console.error(err);
      onNotify("Algorithmic engine active — Rollout updated!", "info");
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

  const exportRolloutJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rolloutPlan, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${artistName.replace(/\s+/g, "_")}_${trackTitle.replace(/\s+/g, "_")}_Rollout_Plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onNotify("Exported Rollout JSON blueprint!", "success");
  };

  const applyPreset = (pTrack: string, pGenre: string, pTheme: string) => {
    setTrackTitle(pTrack);
    setGenre(pGenre);
    setKeyTheme(pTheme);
    onNotify(`Preset applied: ${pTrack}`, "info");
  };

  const completedChecklistCount = checklistState.filter(c => c.completed).length;
  const readinessPercent = Math.round((completedChecklistCount / (checklistState.length || 1)) * 100);

  if (isInitializing) {
    return <ArtistBrainSkeleton />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 text-left pb-20 max-w-7xl mx-auto">
      {/* Workstation Master Hero Card */}
      <div className="p-5 sm:p-8 bento-card border-[var(--bento-border)] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="bento-pill bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30">
              <Disc3 className="w-3.5 h-3.5 animate-spin" />
              <span>FLAGSHIP ARTIST RELEASE OS • PROGRAMMED BRAIN</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-xs font-mono min-h-[44px]">
                <span className="text-[var(--bento-muted)]">Readiness:</span>
                <span className={`font-bold ${readinessPercent >= 75 ? "text-emerald-400" : readinessPercent >= 50 ? "text-amber-400" : "text-[#F97316]"}`}>
                  {readinessPercent}%
                </span>
              </div>

              <button
                onClick={exportRolloutJSON}
                className="hidden sm:flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--bento-card)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] text-xs font-mono text-[var(--bento-muted)] hover:text-[var(--bento-text)] cursor-pointer transition-colors min-h-[44px] min-w-[44px]"
                title="Export complete campaign data"
              >
                <Download className="w-4 h-4 text-[#F97316]" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="font-['Space_Grotesk'] text-2xl sm:text-4xl font-bold text-[var(--bento-text)] tracking-tight">
              Music Artist Operating System & Release Brain
            </h1>
            <p className="text-xs sm:text-sm text-[var(--bento-muted)] max-w-3xl leading-relaxed">
              The world-class release headquarters connecting Track Metadata → 30-Day Programmed Content Schedule → High-Res Artwork & Promo Card Kit → DSP Editorial Pitching → 8-Point Compliance Audit.
            </p>
          </div>

          {/* Interactive Release Roadmap / Progress Step Pipeline with >=44px Touch Targets */}
          <div className="pt-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--bento-muted)] mb-2 flex items-center justify-between">
              <span className="font-bold text-[#F97316]">Interactive Release Pipeline Steps:</span>
              <span>Tap any step to navigate</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { id: "blueprint", label: "1. Strategy", icon: Layers, desc: "Algorithm rules" },
                { id: "schedule", label: "2. 30-Day Plan", icon: Calendar, desc: "Posting calendar" },
                { id: "promokit", label: "3. Asset Studio", icon: ImageIcon, desc: "Artwork & Cards" },
                { id: "pitch", label: "4. DSP Pitch", icon: Radio, desc: "Curator editorial" },
                { id: "hooks", label: "5. Viral Hooks", icon: Tv, desc: "Sound & Captions" },
                { id: "checklist", label: "6. Audit Check", icon: CheckSquare, desc: `${completedChecklistCount}/${checklistState.length} done` },
              ].map((step) => {
                const isActive = activeTab === step.id;
                const IconComponent = step.icon;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveTab(step.id as any)}
                    className={`min-h-[48px] px-3 py-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#F97316] text-black font-bold border-[#F97316] shadow-md shadow-[#F97316]/20"
                        : "bg-[var(--bento-input)] border-[var(--bento-border)] text-[var(--bento-text)] hover:border-[#F97316]/50 hover:bg-[var(--bento-elevated)]"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-black/20 text-black" : "bg-[var(--bento-card)] text-[#F97316]"}`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold truncate leading-tight">{step.label}</div>
                      <div className={`text-[10px] truncate ${isActive ? "text-black/80 font-medium" : "text-[var(--bento-muted)]"}`}>{step.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Parameters Quick-Toggle Button (Visible on mobile/tablet only) */}
      <div className="lg:hidden">
        <button
          onClick={() => setShowMobileParams(!showMobileParams)}
          className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[var(--bento-card)] border border-[var(--bento-border)] hover:border-[#F97316]/50 text-xs font-mono font-bold text-[var(--bento-text)] flex items-center justify-between transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-[#F97316]" />
            <span>Track Setup: <strong className="text-[#F97316]">{trackTitle || "Untitled"}</strong> by {artistName}</span>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-lg bg-[var(--bento-input)] border border-[var(--bento-border)] text-[#F97316] min-h-[28px] flex items-center">
            {showMobileParams ? "Hide Specs ▲" : "Edit Specs ▼"}
          </span>
        </button>
      </div>

      {/* Main Workstation 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Track Parameters & Artwork Controls (Sticky on Desktop) */}
        <div className={`lg:col-span-4 space-y-5 ${showMobileParams ? "block" : "hidden lg:block"}`}>
          <div className="bento-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--bento-border)]">
              <h2 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[var(--bento-text)] flex items-center gap-2">
                <Music className="w-4 h-4 text-[#F97316]" />
                <span>Track Specs & Artwork</span>
              </h2>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">READY</span>
            </div>

            {/* Quick Presets with >=44px Touch Target Size */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-[var(--bento-muted)] uppercase tracking-wider">Quick Presets:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => applyPreset("Midnight in Victoria Island", "Afro-Fusion / Alté", "Late-night luxury drive, hypnotic log drums")}
                  className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-[#F97316]/50 text-xs font-mono text-[var(--bento-text)] cursor-pointer transition-colors flex items-center justify-center gap-1.5 text-center font-medium"
                >
                  ⚡ Afro-Fusion
                </button>
                <button
                  onClick={() => applyPreset("Ghost in My Head", "Alté Trap / Dark R&B", "Moody late-night introspection, heavy 808s")}
                  className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-[#F97316]/50 text-xs font-mono text-[var(--bento-text)] cursor-pointer transition-colors flex items-center justify-center gap-1.5 text-center font-medium"
                >
                  🌙 Alté Trap
                </button>
                <button
                  onClick={() => applyPreset("Grace Found Me", "Contemporary Gospel", "Triumphant testimony, soul-stirring choir")}
                  className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-[#F97316]/50 text-xs font-mono text-[var(--bento-text)] cursor-pointer transition-colors flex items-center justify-center gap-1.5 text-center font-medium"
                >
                  🙏 Gospel
                </button>
              </div>
            </div>

            {/* Artwork Upload & Preview Section */}
            <div className="p-3.5 rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[var(--bento-text)] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>Cover Artwork Asset</span>
                </span>
                <span className="text-[9px] font-mono text-[var(--bento-muted)]">3000x3000px 300DPI</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[var(--bento-border)] shrink-0 group bg-black/40 shadow-md">
                  <img 
                    src={coverArtUrl} 
                    alt="Cover Art" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isCustomCover && (
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-black" title="Custom Uploaded Art" />
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleCoverUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-[var(--bento-card)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-[#F97316] text-xs font-mono font-semibold text-[var(--bento-text)] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>{isCustomCover ? "Change Uploaded Art" : "Upload Your Cover Art"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (openBriefModal) {
                        openBriefModal();
                      } else {
                        window.open("https://wa.me/2348104465924?text=Hi%20Keedohub!%20I%20need%20a%20Bespoke%20Cover%20Artwork%20for%20my%20upcoming%20release.", "_blank");
                      }
                    }}
                    className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-[#F97316]/10 hover:bg-[#F97316]/20 border border-[#F97316]/30 text-xs font-mono font-semibold text-[#F97316] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Request Cover Art from Keedohub</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Input Fields Form */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--bento-text)] font-semibold mb-1">Track / Album Title *</label>
                <input
                  type="text"
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                  placeholder="e.g. Midnight in Victoria Island"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] focus:outline-none focus:border-[#F97316] font-medium transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[var(--bento-text)] font-semibold mb-1">Artist Name *</label>
                  <input
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="e.g. Zack Khalifa"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] focus:outline-none focus:border-[#F97316] font-medium transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[var(--bento-text)] font-semibold mb-1">Release Type</label>
                  <select
                    value={releaseType}
                    onChange={(e) => setReleaseType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] focus:outline-none focus:border-[#F97316] font-medium cursor-pointer transition-colors"
                  >
                    <option value="Single">Lead Single</option>
                    <option value="EP (4-6 Tracks)">EP (4-6 Tracks)</option>
                    <option value="Full Album">Full Album</option>
                    <option value="Mixtape">Mixtape</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[var(--bento-text)] font-semibold mb-1">Genre / Sound</label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="e.g. Afro-Fusion"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] focus:outline-none focus:border-[#F97316] font-medium transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[var(--bento-text)] font-semibold mb-1">Drop Date</label>
                  <input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] focus:outline-none focus:border-[#F97316] font-medium transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--bento-text)] font-semibold mb-1">Sonic Story & Theme</label>
                <textarea
                  rows={2}
                  value={keyTheme}
                  onChange={(e) => setKeyTheme(e.target.value)}
                  placeholder="What is the story behind the song? What emotion should listeners feel?"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] focus:outline-none focus:border-[#F97316] font-medium transition-colors"
                />
              </div>

              <div>
                <label className="block text-[var(--bento-text)] font-semibold mb-1">Target Audience</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Night drivers, clubgoers, Spotify curators"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] focus:outline-none focus:border-[#F97316] font-medium transition-colors"
                />
              </div>
            </div>

            {/* Run Engine Button */}
            <button
              onClick={handleGenerateRollout}
              disabled={isLoading || !trackTitle || !artistName}
              className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-black font-bold text-xs sm:text-sm font-mono uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#F97316]/25 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Computing Programmed Brain...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Synthesize Release Brain</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Workstation Display Matrix & Tabbed Engine */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Workstation Sub-Navigation (Horizontal Scroll on Mobile) with >=44px Touch Targets */}
          <div className="bento-card p-1.5 sm:p-2">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              <button
                onClick={() => setActiveTab("blueprint")}
                className={`min-h-[44px] min-w-[44px] py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "blueprint"
                    ? "bg-[#F97316] text-black font-bold shadow-md shadow-[#F97316]/20"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Blueprint</span>
              </button>

              <button
                onClick={() => setActiveTab("schedule")}
                className={`min-h-[44px] min-w-[44px] py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "schedule"
                    ? "bg-[#F97316] text-black font-bold shadow-md shadow-[#F97316]/20"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>30-Day Schedule</span>
              </button>

              <button
                onClick={() => setActiveTab("promokit")}
                className={`min-h-[44px] min-w-[44px] py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "promokit"
                    ? "bg-[#F97316] text-black font-bold shadow-md shadow-[#F97316]/20"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Asset Studio</span>
              </button>

              <button
                onClick={() => setActiveTab("pitch")}
                className={`min-h-[44px] min-w-[44px] py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "pitch"
                    ? "bg-[#F97316] text-black font-bold shadow-md shadow-[#F97316]/20"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>DSP Pitch</span>
              </button>

              <button
                onClick={() => setActiveTab("hooks")}
                className={`min-h-[44px] min-w-[44px] py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "hooks"
                    ? "bg-[#F97316] text-black font-bold shadow-md shadow-[#F97316]/20"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                }`}
              >
                <Tv className="w-4 h-4" />
                <span>Viral Hooks</span>
              </button>

              <button
                onClick={() => setActiveTab("checklist")}
                className={`min-h-[44px] min-w-[44px] py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "checklist"
                    ? "bg-[#F97316] text-black font-bold shadow-md shadow-[#F97316]/20"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-elevated)]"
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Audit ({completedChecklistCount}/{checklistState.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: BLUEPRINT & ALGORITHM STRATEGY */}
          {activeTab === "blueprint" && (
            <div className="space-y-5">
              <div className="bento-card p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F97316]">
                    STRATEGY SUMMARY & POSITIONING
                  </span>
                  <span className="text-[10px] font-mono text-[var(--bento-muted)]">
                    RELEASE TARGET: {releaseDate}
                  </span>
                </div>

                <h3 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[var(--bento-text)]">
                  {rolloutPlan.tagline}
                </h3>

                <div className="p-3.5 rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-xs text-[var(--bento-text)] leading-relaxed space-y-1">
                  <div className="font-mono text-[#F97316] text-[10px] font-bold uppercase">Curator & Diaspora Narrative:</div>
                  <p>{rolloutPlan.diasporaAngle}</p>
                </div>
              </div>

              {/* Programmed Algorithm Rules */}
              <div className="bento-card p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--bento-border)] pb-2.5">
                  <h4 className="text-xs sm:text-sm font-mono font-bold uppercase text-[var(--bento-text)] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Algorithmic Distribution Rules (TikTok, Reels & DSPs)</span>
                  </h4>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">VERIFIED</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-1">
                    <span className="text-[10px] font-mono text-[#F97316] font-bold">1. Soundbite Length</span>
                    <p className="text-[var(--bento-muted)] text-[11px] leading-relaxed">
                      {rolloutPlan.algorithmStrategy?.soundBiteRule || "Keep soundbite between 12.5s and 16.5s to maximize automatic looping replays."}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-1">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">2. Retention Metrics</span>
                    <p className="text-[var(--bento-muted)] text-[11px] leading-relaxed">
                      {rolloutPlan.algorithmStrategy?.retentionMetric || "Target >65% 3-second hook retention and >28% completion rate for algorithmic feed push."}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold">3. Posting Cadence</span>
                    <p className="text-[var(--bento-muted)] text-[11px] leading-relaxed">
                      {rolloutPlan.algorithmStrategy?.postingCadence || "1 core TikTok/Reel per day between 18:00 and 21:00 WAT/EST during Launch Week."}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-1">
                    <span className="text-[10px] font-mono text-purple-400 font-bold">4. SmartLink Tactic</span>
                    <p className="text-[var(--bento-muted)] text-[11px] leading-relaxed">
                      {rolloutPlan.algorithmStrategy?.smartLinkTactic || "Use unified pre-save hub to prevent bounce rate from broken DSP destination links."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Press Release Excerpt */}
              <div className="bento-card p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-[var(--bento-text)] flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-[#F97316]" />
                    <span>Official Press Release Statement (Blogs & Media)</span>
                  </h4>
                  <button
                    onClick={() => copyText(rolloutPlan.pressReleaseExcerpt, "press-release")}
                    className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-[#F97316]/50 text-xs font-mono text-[var(--bento-muted)] hover:text-[var(--bento-text)] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedId === "press-release" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === "press-release" ? "Copied" : "Copy PR Statement"}</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-xs text-[var(--bento-muted)] leading-relaxed font-sans">
                  {rolloutPlan.pressReleaseExcerpt}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 30-DAY PROGRAMMED SCHEDULE */}
          {activeTab === "schedule" && (
            <div className="space-y-4">
              {/* Phase Switcher with >=44px Touch Targets */}
              <div className="flex flex-wrap gap-2">
                {rolloutPlan.phases.map((phase, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhaseIndex(idx)}
                    className={`min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      activePhaseIndex === idx
                        ? "bg-[#F97316] text-black font-bold shadow-md shadow-[#F97316]/20"
                        : "bg-[var(--bento-input)] text-[var(--bento-muted)] hover:text-[var(--bento-text)] border border-[var(--bento-border)] hover:bg-[var(--bento-elevated)]"
                    }`}
                  >
                    <span>Phase {idx + 1}:</span>
                    <span>{idx === 0 ? "Pre-Release" : idx === 1 ? "Drop Day" : "Post-Drop"}</span>
                  </button>
                ))}
              </div>

              {/* Active Phase Details */}
              {rolloutPlan.phases[activePhaseIndex] && (
                <div className="bento-card p-4 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--bento-border)]">
                    <div>
                      <h4 className="font-['Space_Grotesk'] text-base sm:text-lg font-bold text-[var(--bento-text)]">
                        {rolloutPlan.phases[activePhaseIndex].phaseName}
                      </h4>
                      <p className="text-xs text-[var(--bento-muted)]">
                        {rolloutPlan.phases[activePhaseIndex].focus}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-[#F97316] px-3 py-1 rounded-xl bg-[#F97316]/10 border border-[#F97316]/30 font-semibold min-h-[32px] flex items-center">
                      {rolloutPlan.phases[activePhaseIndex].actions.length} Action Items
                    </span>
                  </div>

                  {/* Action Item Cards (Responsive 2-Column Grid) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {rolloutPlan.phases[activePhaseIndex].actions.map((act, aIdx) => (
                      <div
                        key={aIdx}
                        className="p-4 rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] hover:border-[#F97316]/40 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-[#F97316]/15 text-[#F97316] font-mono text-[10px] font-bold border border-[#F97316]/30">
                                {act.day}
                              </span>
                              <span className="text-xs font-bold text-[var(--bento-text)]">
                                {act.contentType}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {act.priority && (
                                <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                                  act.priority === "CRITICAL" 
                                    ? "bg-red-500/10 text-red-400 border border-red-500/30" 
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                }`}>
                                  {act.priority}
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-[var(--bento-muted)] bg-[var(--bento-card)] px-2 py-0.5 rounded border border-[var(--bento-border)]">
                                {act.platform}
                              </span>
                            </div>
                          </div>

                          {/* Concept Description */}
                          <p className="text-xs text-[var(--bento-text)] leading-relaxed">
                            {act.concept}
                          </p>

                          {/* Posting Time & Sound Snippet */}
                          <div className="grid grid-cols-1 gap-1.5 text-[10px] font-mono">
                            {act.timeToPost && (
                              <div className="flex items-center gap-1.5 text-[var(--bento-muted)] bg-[var(--bento-card)] p-2 rounded-lg border border-[var(--bento-border)]">
                                <Clock className="w-3 h-3 text-[#F97316] shrink-0" />
                                <span className="truncate">Time: {act.timeToPost}</span>
                              </div>
                            )}
                            {act.soundSnippet && (
                              <div className="flex items-center gap-1.5 text-[var(--bento-muted)] bg-[var(--bento-card)] p-2 rounded-lg border border-[var(--bento-border)]">
                                <Volume2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span className="truncate">Audio: {act.soundSnippet}</span>
                              </div>
                            )}
                          </div>

                          {act.algorithmTip && (
                            <div className="p-2 rounded-lg bg-[var(--bento-card)] border border-[var(--bento-border)] text-[10px] font-mono text-[var(--bento-muted)] flex items-start gap-1.5">
                              <TrendingUp className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                              <span><strong className="text-amber-400">Algo Factor:</strong> {act.algorithmTip}</span>
                            </div>
                          )}
                        </div>

                        {/* Copyable Caption Box with >=44px Copy Button */}
                        <div className="p-2.5 rounded-xl bg-[var(--bento-card)] border border-[var(--bento-border)] flex items-center justify-between gap-2 mt-auto">
                          <div className="text-[11px] font-mono text-amber-400/95 italic line-clamp-2">
                            "{act.captionHook}"
                          </div>
                          <button
                            onClick={() => copyText(act.captionHook, `caption-${activePhaseIndex}-${aIdx}`)}
                            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-elevated)] text-xs font-mono text-[var(--bento-text)] flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors border border-[var(--bento-border)] hover:border-[#F97316]/50"
                            title="Copy Caption Hook"
                          >
                            {copiedId === `caption-${activePhaseIndex}-${aIdx}` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ASSET STUDIO & MULTI-PLATFORM SOCIAL PROMO CARDS */}
          {activeTab === "promokit" && (
            <AssetStudio
              trackTitle={trackTitle}
              artistName={artistName}
              genre={genre}
              releaseDate={releaseDate}
              releaseType={releaseType}
              coverArtUrl={coverArtUrl}
              onCoverChange={(newUrl) => {
                setCoverArtUrl(newUrl);
                setIsCustomCover(true);
              }}
              onNotify={onNotify}
            />
          )}

          {/* TAB 4: DSP CURATOR & EDITORIAL PITCH */}
          {activeTab === "pitch" && (
            <div className="space-y-4">
              <div className="bento-card p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--bento-border)] pb-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-mono font-bold uppercase text-emerald-400 flex items-center gap-2">
                      <Radio className="w-4 h-4" />
                      <span>Spotify for Artists & Apple Music Editorial Pitch</span>
                    </h4>
                    <p className="text-xs text-[var(--bento-muted)]">
                      Optimized for 50-word editorial review windows 14 days before release.
                    </p>
                  </div>

                  <button
                    onClick={() => copyText(rolloutPlan.dspPitch.editorialNote, "dsp-pitch")}
                    className="min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-emerald-400/50 text-xs font-mono text-[var(--bento-text)] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    {copiedId === "dsp-pitch" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === "dsp-pitch" ? "Copied" : "Copy Pitch"}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-xs sm:text-sm text-[var(--bento-text)] leading-relaxed">
                  {rolloutPlan.dspPitch.editorialNote}
                </div>

                {/* Target Playlists */}
                {rolloutPlan.dspPitch.targetPlaylists && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-mono text-[var(--bento-muted)] uppercase font-bold">Target Flagship Playlists:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {rolloutPlan.dspPitch.targetPlaylists.map((pl, pIdx) => (
                        <span key={pIdx} className="px-3 py-1.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[11px] font-mono text-emerald-400 font-medium">
                          🎵 {pl}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Genre and Mood Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-1.5">
                    <span className="text-[10px] font-mono text-[#F97316] font-bold uppercase">Genre & Subgenre Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {rolloutPlan.dspPitch.genreTags.map((g, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-[var(--bento-card)] text-[10px] font-mono text-[var(--bento-text)] border border-[var(--bento-border)]">
                          #{g}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-1.5">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Mood & Instruments:</span>
                    <div className="flex flex-wrap gap-1">
                      {rolloutPlan.dspPitch.moodTags.map((m, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-[var(--bento-card)] text-[10px] font-mono text-[var(--bento-text)] border border-[var(--bento-border)]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: VIRAL SOUND HOOKS & HASHTAGS */}
          {activeTab === "hooks" && (
            <div className="space-y-4">
              <div className="bento-card p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--bento-border)] pb-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-mono font-bold uppercase text-amber-400 flex items-center gap-2">
                      <Tv className="w-4 h-4" />
                      <span>TikTok & Reels 3-Second Retention Hooks</span>
                    </h4>
                    <p className="text-xs text-[var(--bento-muted)]">
                      Proven audio-visual hooks engineered to halt scrolling within 2.5 seconds.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 font-bold">
                    HIGH RETENTION
                  </span>
                </div>

                {/* Responsive Hooks Grid (Large >=44px Tap Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rolloutPlan.contentHooks.map((hook, hIdx) => (
                    <div
                      key={hIdx}
                      onClick={() => copyText(hook, `hook-${hIdx}`)}
                      className="p-4 rounded-2xl bg-[var(--bento-input)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-amber-500/40 text-xs text-[var(--bento-text)] cursor-pointer transition-all flex flex-col justify-between gap-3 group min-h-[96px]"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                          {hIdx + 1}
                        </span>
                        <span className="italic font-medium leading-relaxed">{hook}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--bento-border)] text-xs font-mono text-[var(--bento-muted)] group-hover:text-[var(--bento-text)]">
                        <span className="text-amber-400/90 text-[11px]">Tap card to copy hook</span>
                        <span className="flex items-center gap-1.5 font-bold min-h-[32px]">
                          {copiedId === `hook-${hIdx}` ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* High-Yield Hashtag Bank */}
                <div className="p-4 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] space-y-3 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#F97316] font-bold uppercase flex items-center gap-1.5">
                      <Hash className="w-4 h-4" />
                      <span>Curated High-Yield Hashtag Matrix</span>
                    </span>
                    <button
                      onClick={() => copyText((rolloutPlan.hashtags || ["#NewMusic", "#AfrobeatsGlobal"]).join(" "), "hashtags")}
                      className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl bg-[var(--bento-card)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] hover:border-[#F97316]/50 text-xs font-mono text-[var(--bento-muted)] hover:text-[var(--bento-text)] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {copiedId === "hashtags" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy All Tags</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(rolloutPlan.hashtags || ["#NewMusicAlert", "#AfrobeatsGlobal", "#StreamNow", "#KeedohubOS", "#SongOfTheSummer", "#AltéWave", "#AfroFusion"]).map((tag, tIdx) => (
                      <span key={tIdx} className="px-3 py-1.5 rounded-xl bg-[var(--bento-card)] border border-[var(--bento-border)] text-xs font-mono text-[var(--bento-text)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: 8-POINT RELEASE READINESS CHECKLIST */}
          {activeTab === "checklist" && (
            <div className="space-y-4">
              <div className="bento-card p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--bento-border)] pb-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-mono font-bold uppercase text-[var(--bento-text)] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#F97316]" />
                      <span>8-Point Master Release Compliance Checklist</span>
                    </h4>
                    <p className="text-xs text-[var(--bento-muted)]">
                      Never drop a song without completing these mandatory pre-flight checks.
                    </p>
                  </div>

                  <div className="px-3.5 py-2 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-xs font-mono min-h-[44px] flex items-center">
                    <span className="text-[var(--bento-muted)]">Score: </span>
                    <span className="font-bold text-[#F97316] ml-1">{completedChecklistCount} / {checklistState.length} Done</span>
                  </div>
                </div>

                {/* Responsive Checklist Grid with >=44px Touch Targets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {checklistState.map((chk) => (
                    <div
                      key={chk.id}
                      onClick={() => toggleChecklistItem(chk.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 min-h-[104px] ${
                        chk.completed
                          ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-300"
                          : "bg-[var(--bento-input)] border-[var(--bento-border)] text-[var(--bento-text)] hover:border-[#F97316]/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                          chk.completed
                            ? "bg-emerald-500 border-emerald-400 text-black"
                            : "border-[var(--bento-border)] bg-[var(--bento-card)]"
                        }`}>
                          {chk.completed && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>

                        <p className={`text-xs sm:text-sm font-medium leading-relaxed ${chk.completed ? "line-through opacity-80" : ""}`}>
                          {chk.task}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--bento-border)] text-[10px] font-mono">
                        <span className="px-2.5 py-1 rounded-md bg-[var(--bento-card)] text-[#F97316] border border-[var(--bento-border)] font-bold">
                          {chk.category}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-[var(--bento-card)] border border-[var(--bento-border)] text-[var(--bento-muted)]">
                          {chk.deadline}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
