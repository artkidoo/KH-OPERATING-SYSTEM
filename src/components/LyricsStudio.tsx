import React, { useState, useEffect, useRef } from "react";
import { LyricProject, LyricLine } from "../types";
import { PRESET_LYRICS_PROJECTS } from "../data/mockData";
import { AudioStudioSkeleton } from "./skeletons/ModuleSkeletons";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Music, 
  Clock, 
  Layers, 
  Tv, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  FileText,
  Sliders,
  Type,
  Share2,
  Wand2,
  Smartphone,
  Maximize2
} from "lucide-react";
import confetti from "canvas-confetti";

interface LyricsStudioProps {
  onNotify: (text: string, type?: "success" | "info" | "error") => void;
}

export const LyricsStudio: React.FC<LyricsStudioProps> = ({ onNotify }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  // Current active lyric project state
  const [project, setProject] = useState<LyricProject>(PRESET_LYRICS_PROJECTS[0]);
  
  // Playback & Timing state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMetronomeEnabled, setIsMetronomeEnabled] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 320);
    return () => clearTimeout(timer);
  }, []);
  
  // Editor state
  const [copiedLRC, setCopiedLRC] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiPromptTopic, setAiPromptTopic] = useState("");
  const [selectedSection, setSelectedSection] = useState<LyricLine["section"]>("verse");
  const [viewMode, setViewMode] = useState<"visualizer" | "editor" | "lrc">("visualizer");

  // Web Audio synth refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const visualizerContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize Web Audio Context for metronome / beat click
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playClickSound = (freq = 880) => {
    if (isAudioMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (_) {}
  };

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 50;
      playTimerRef.current = window.setInterval(() => {
        setCurrentTimeMs((prev) => {
          const nextTime = prev + intervalMs * playbackSpeed;
          
          // Check active line based on timestamps
          const foundIndex = project.lines.reduce((acc, line, idx) => {
            return line.timeMs <= nextTime ? idx : acc;
          }, 0);
          
          if (foundIndex !== activeLineIndex) {
            setActiveLineIndex(foundIndex);
          }

          // Optional beat click every quarter note
          if (isMetronomeEnabled) {
            const beatDurationMs = (60 / project.bpm) * 1000;
            const currentBeat = Math.floor(nextTime / beatDurationMs);
            const prevBeat = Math.floor(prev / beatDurationMs);
            if (currentBeat > prevBeat) {
              playClickSound(currentBeat % 4 === 0 ? 980 : 660);
            }
          }

          // Max track duration limit (e.g. 60 seconds loop)
          const lastLine = project.lines[project.lines.length - 1];
          const maxTrackMs = (lastLine ? lastLine.timeMs : 30000) + 4000;
          if (nextTime >= maxTrackMs) {
            setIsPlaying(false);
            return 0;
          }

          return nextTime;
        });
      }, intervalMs);
    } else {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    }

    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, isMetronomeEnabled, project.bpm, project.lines, activeLineIndex]);

  // Format Milliseconds to LRC Time String [mm:ss.xx]
  const formatLrcTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${hundredths.toString().padStart(2, "0")}`;
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    getAudioContext();
    setIsPlaying(!isPlaying);
  };

  // Reset to start
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTimeMs(0);
    setActiveLineIndex(0);
  };

  // Jump to specific line
  const jumpToLine = (index: number) => {
    const line = project.lines[index];
    if (line) {
      setCurrentTimeMs(line.timeMs);
      setActiveLineIndex(index);
    }
  };

  // Stamp current playback time to active line
  const stampCurrentTimeToLine = (index: number) => {
    const updated = [...project.lines];
    updated[index] = {
      ...updated[index],
      timeMs: Math.round(currentTimeMs),
      timeFormatted: formatLrcTime(currentTimeMs),
    };
    // Sort lines chronologically
    updated.sort((a, b) => a.timeMs - b.timeMs);
    setProject({ ...project, lines: updated });
    onNotify(`Timestamp set for line ${index + 1}: [${formatLrcTime(currentTimeMs)}]`, "success");
  };

  // Add new lyric line
  const handleAddLine = () => {
    const lastLine = project.lines[project.lines.length - 1];
    const newTimeMs = lastLine ? lastLine.timeMs + 3500 : 2000;
    const newLine: LyricLine = {
      id: "l_" + Math.random().toString(36).substring(2, 7),
      timeMs: newTimeMs,
      timeFormatted: formatLrcTime(newTimeMs),
      text: "New lyric bar with melody and rhythm",
      section: selectedSection,
    };
    setProject({ ...project, lines: [...project.lines, newLine] });
    onNotify("Added new lyric line", "info");
  };

  // Delete line
  const handleDeleteLine = (id: string) => {
    if (project.lines.length <= 1) {
      onNotify("Cannot delete all lines", "error");
      return;
    }
    setProject({
      ...project,
      lines: project.lines.filter((l) => l.id !== id),
    });
  };

  // Update line text
  const handleLineTextChange = (id: string, newText: string) => {
    setProject({
      ...project,
      lines: project.lines.map((l) => (l.id === id ? { ...l, text: newText } : l)),
    });
  };

  // Load Preset
  const handleLoadPreset = (presetId: string) => {
    const found = PRESET_LYRICS_PROJECTS.find((p) => p.id === presetId);
    if (found) {
      setProject(found);
      handleReset();
      onNotify(`Loaded project: "${found.title}"`, "success");
    }
  };

  // Generate LRC formatted output text
  const generateLrcString = () => {
    let output = `[ti:${project.title}]\n[ar:${project.artist}]\n[al:Keedohub Creative OS]\n[by:Keedohub Lyric Engine]\n[length:${formatLrcTime(project.lines[project.lines.length - 1]?.timeMs + 3000 || 30000)}]\n\n`;
    project.lines.forEach((line) => {
      output += `[${line.timeFormatted}] ${line.text}\n`;
    });
    return output;
  };

  // Copy standard LRC to clipboard
  const handleCopyLRC = () => {
    navigator.clipboard.writeText(generateLrcString());
    setCopiedLRC(true);
    setTimeout(() => setCopiedLRC(false), 2500);
    onNotify("Copied .LRC format for Spotify & Musixmatch!", "success");
  };

  // Download .lrc file
  const handleDownloadLrcFile = () => {
    const lrcContent = generateLrcString();
    const blob = new Blob([lrcContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.artist.replace(/\s+/g, "_")}_${project.title.replace(/\s+/g, "_")}.lrc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    onNotify("Downloaded standardized .LRC file", "success");
  };

  // AI Lyrics Generator API call
  const handleGenerateAiLyrics = async () => {
    setIsAiGenerating(true);
    onNotify("Keedohub Topline Engine is composing...", "info");
    try {
      const res = await fetch("/api/ai/lyrics-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: project.title,
          artist: project.artist,
          genre: project.genre,
          mood: project.theme,
          promptTheme: aiPromptTopic || "Late night drive, Lagos hustle, high ambition",
          section: selectedSection,
        }),
      });
      const data = await res.json();
      if (data && data.data && data.data.lines) {
        setProject({
          ...project,
          lines: data.data.lines.map((l: any, i: number) => ({
            id: `ai_${i}`,
            timeMs: l.timeMs || (i + 1) * 3500,
            timeFormatted: l.timeFormatted || formatLrcTime((i + 1) * 3500),
            text: l.text,
            section: l.section || "verse",
          })),
          bpm: data.data.bpm || project.bpm,
        });
        handleReset();
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
        onNotify(`Generated ${data.data.lines.length} lyrical bars with timing!`, "success");
      }
    } catch (err: any) {
      onNotify("Error generating AI lyrics", "error");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Theme styles helper
  const getThemeStyles = () => {
    switch (project.theme) {
      case "golden-afro":
        return {
          bg: "from-[#1a1408] via-[#2d1e05] to-[#0d0a04]",
          cardBg: "bg-[#201606]/90 border-amber-500/30 text-amber-100",
          activeGlow: "text-amber-400 drop-shadow-[0_0_20px_rgba(245,166,35,0.8)] scale-105",
          inactiveText: "text-amber-200/40",
          accentBorder: "border-amber-500/40",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          waveform: "bg-amber-500",
        };
      case "neon-midnight":
        return {
          bg: "from-[#050b14] via-[#091b2e] to-[#02060c]",
          cardBg: "bg-[#091829]/90 border-cyan-500/30 text-cyan-100",
          activeGlow: "text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] scale-105",
          inactiveText: "text-cyan-200/40",
          accentBorder: "border-cyan-500/40",
          badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
          waveform: "bg-cyan-400",
        };
      case "minimal-noir":
        return {
          bg: "from-[#0f0f11] via-[#16161a] to-[#0a0a0c]",
          cardBg: "bg-[#18181c]/90 border-neutral-700 text-neutral-100",
          activeGlow: "text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] scale-105 font-bold",
          inactiveText: "text-neutral-500",
          accentBorder: "border-neutral-700",
          badge: "bg-neutral-800 text-neutral-300 border-neutral-700",
          waveform: "bg-neutral-300",
        };
      case "cassette-lofi":
        return {
          bg: "from-[#1a0e14] via-[#2b1722] to-[#12070c]",
          cardBg: "bg-[#24131d]/90 border-pink-500/30 text-pink-100",
          activeGlow: "text-pink-400 drop-shadow-[0_0_20px_rgba(244,114,182,0.8)] scale-105",
          inactiveText: "text-pink-200/40",
          accentBorder: "border-pink-500/40",
          badge: "bg-pink-500/20 text-pink-300 border-pink-500/30",
          waveform: "bg-pink-500",
        };
      case "acid-green":
        return {
          bg: "from-[#08170c] via-[#0e2a16] to-[#040c06]",
          cardBg: "bg-[#0c2413]/90 border-emerald-500/30 text-emerald-100",
          activeGlow: "text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)] scale-105",
          inactiveText: "text-emerald-200/40",
          accentBorder: "border-emerald-500/40",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          waveform: "bg-emerald-400",
        };
      case "cyber-crimson":
      default:
        return {
          bg: "from-[#1c0707] via-[#2d0c0c] to-[#0e0303]",
          cardBg: "bg-[#260909]/90 border-red-500/30 text-red-100",
          activeGlow: "text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] scale-105",
          inactiveText: "text-red-200/40",
          accentBorder: "border-red-500/40",
          badge: "bg-red-500/20 text-red-300 border-red-500/30",
          waveform: "bg-red-500",
        };
    }
  };

  const themeStyle = getThemeStyles();

  // Typography font class
  const getFontFamily = () => {
    switch (project.fontStyle) {
      case "cinematic-serif":
        return "font-serif tracking-normal";
      case "mono-terminal":
        return "font-mono tracking-tight";
      case "bold-impact":
        return "font-['Space_Grotesk'] uppercase font-extrabold tracking-wider";
      case "space-grotesk":
      default:
        return "font-['Space_Grotesk'] font-bold tracking-tight";
    }
  };

  if (isInitializing) {
    return <AudioStudioSkeleton />;
  }

  return (
    <div id="lyrics-studio-module" className="space-y-6">
      {/* Module Header & Quick Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--bento-card)] border border-[var(--bento-border)] p-5 sm:p-6 rounded-3xl shadow-lg">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-theme-accent text-white shadow-md">
              <Music className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-[var(--bento-text)]">
              Lyric Studio & Kinetic Visualizer
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--accent-light)] text-[var(--accent-pill-text)] border border-[var(--accent-border)]">
              SYNC ENGINE v3.0
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--bento-muted)] max-w-2xl">
            Time-sync song lyrics, generate standardized <strong className="text-[var(--bento-text)]">.LRC files</strong> for Spotify/Musixmatch, and create live kinetic 9:16 vertical lyric videos for TikTok and Reels.
          </p>
        </div>

        {/* Preset Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 bg-[var(--bento-elevated)] p-1 rounded-2xl border border-[var(--bento-border)]">
            {PRESET_LYRICS_PROJECTS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleLoadPreset(p.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                  project.title === p.title
                    ? "bg-theme-accent text-white font-bold shadow"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)]"
                }`}
              >
                {p.title.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* LRC Download */}
          <button
            onClick={handleDownloadLrcFile}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[var(--bento-card)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] text-xs font-bold text-[var(--bento-text)] shadow-sm cursor-pointer transition-all hover:border-[var(--accent-border)]"
            title="Download .LRC file for Spotify/Apple Music"
          >
            <Download className="w-3.5 h-3.5 text-[var(--accent-pill-text)]" />
            <span>.LRC File</span>
          </button>

          {/* Copy LRC */}
          <button
            onClick={handleCopyLRC}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-theme-accent text-xs font-bold text-white shadow-md cursor-pointer transition-all hover:brightness-110"
          >
            {copiedLRC ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLRC ? "Copied!" : "Copy .LRC"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left 9:16 Kinetic Visualizer Phone / Right Studio Controls & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ==========================================
            LEFT: 9:16 KINETIC VISUALIZER STAGE (Col 5)
            ========================================== */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[360px] bg-neutral-950 p-3 sm:p-4 rounded-[40px] border-4 border-neutral-800 shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* Phone Speaker Notch */}
            <div className="w-28 h-4 bg-neutral-900 rounded-full mx-auto mb-2 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neutral-800"></span>
              <span className="w-8 h-1 rounded-full bg-neutral-800"></span>
            </div>

            {/* 9:16 Screen Canvas */}
            <div
              ref={visualizerContainerRef}
              className={`w-full aspect-[9/16] rounded-3xl bg-gradient-to-b ${themeStyle.bg} relative overflow-hidden p-5 flex flex-col justify-between border border-white/10 shadow-inner select-none`}
            >
              {/* Scanline / Texture Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-black/60 pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.25)_51%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

              {/* Top Meta Bar */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/70 font-bold">
                    LYRIC SYNC • 9:16
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${themeStyle.badge}`}>
                  {project.bpm} BPM
                </span>
              </div>

              {/* Center Kinetic Lyric Stream */}
              <div className="relative z-10 my-auto py-6 space-y-4 text-center">
                {/* Previous Line (Dimmed) */}
                {project.lines[activeLineIndex - 1] && (
                  <p className={`text-xs sm:text-sm font-medium transition-all duration-300 opacity-30 ${getFontFamily()} ${themeStyle.inactiveText} transform -translate-y-2`}>
                    {project.lines[activeLineIndex - 1].text}
                  </p>
                )}

                {/* CURRENT ACTIVE LINE (Glowing / Highlighted) */}
                {project.lines[activeLineIndex] ? (
                  <div className="py-2 px-1">
                    <span className="inline-block text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 mb-1 rounded bg-black/40 text-white/60 border border-white/10">
                      {project.lines[activeLineIndex].section || "verse"} • [{project.lines[activeLineIndex].timeFormatted}]
                    </span>
                    <p
                      className={`text-lg sm:text-xl md:text-2xl leading-snug transition-all duration-200 ${getFontFamily()} ${themeStyle.activeGlow}`}
                    >
                      {project.lines[activeLineIndex].text}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400 font-mono italic">Waiting for drop...</p>
                )}

                {/* Next Line (Subtle Preview) */}
                {project.lines[activeLineIndex + 1] && (
                  <p className={`text-xs sm:text-sm font-medium transition-all duration-300 opacity-40 ${getFontFamily()} ${themeStyle.inactiveText} transform translate-y-2`}>
                    {project.lines[activeLineIndex + 1].text}
                  </p>
                )}
              </div>

              {/* Bottom Visualizer Wave & Track Info */}
              <div className="relative z-10 space-y-3">
                {/* Simulated Waveform Bars */}
                {project.showWaveform && (
                  <div className="flex items-end justify-center gap-1 h-8 px-2">
                    {[12, 28, 45, 80, 60, 95, 70, 40, 90, 100, 75, 50, 85, 60, 30, 20].map((h, i) => {
                      const dynamicHeight = isPlaying ? Math.min(100, Math.max(15, (h * ((currentTimeMs % 1000) / 1000 + 0.4)))) : 20;
                      return (
                        <span
                          key={i}
                          className={`w-1 rounded-full transition-all duration-100 ${themeStyle.waveform}`}
                          style={{ height: `${dynamicHeight}%`, opacity: isPlaying ? 0.9 : 0.3 }}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Track Title & Artist Bar */}
                <div className="bg-black/60 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div className="text-left overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{project.title}</p>
                    <p className="text-[10px] font-mono text-white/60 truncate">{project.artist}</p>
                  </div>
                  <div className="text-right font-mono text-[11px] text-white/80">
                    {formatLrcTime(currentTimeMs)}
                  </div>
                </div>
              </div>
            </div>

            {/* Playback Controls under the phone */}
            <div className="mt-3 flex items-center justify-between gap-2 px-1">
              <button
                onClick={handleReset}
                className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors"
                title="Reset to 00:00"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="flex-1 py-2.5 rounded-2xl bg-theme-accent text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all text-xs"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? "PAUSE PREVIEW" : "PLAY KINETIC VIDEO"}</span>
              </button>

              <button
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className={`p-2 rounded-xl border transition-colors ${
                  isAudioMuted
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : "bg-neutral-900 text-neutral-300 border-neutral-800"
                }`}
                title={isAudioMuted ? "Unmute metronome" : "Mute metronome"}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ==========================================
            RIGHT: STUDIO CONTROLS & TIMELINE EDITOR (Col 7)
            ========================================== */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[var(--bento-border)] pb-3">
            <button
              onClick={() => setViewMode("visualizer")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "visualizer"
                  ? "bg-theme-accent text-white shadow"
                  : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] bg-[var(--bento-card)] border border-[var(--bento-border)]"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Visualizer Engine</span>
            </button>

            <button
              onClick={() => setViewMode("editor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "editor"
                  ? "bg-theme-accent text-white shadow"
                  : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] bg-[var(--bento-card)] border border-[var(--bento-border)]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timestamp Sync ({project.lines.length} bars)</span>
            </button>

            <button
              onClick={() => setViewMode("lrc")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "lrc"
                  ? "bg-theme-accent text-white shadow"
                  : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] bg-[var(--bento-card)] border border-[var(--bento-border)]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>LRC Code View</span>
            </button>
          </div>

          {/* VIEW 1: Visualizer Customizer & AI Writer */}
          {viewMode === "visualizer" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Project Meta Inputs */}
              <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-4 sm:p-5 rounded-3xl space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent-pill-text)]">
                  Track Identity & Rhythm
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-[var(--bento-muted)] block mb-1">Track Title</label>
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => setProject({ ...project, title: e.target.value })}
                      className="w-full bg-[var(--bento-bg)] border border-[var(--bento-border)] px-3 py-2 rounded-xl text-xs text-[var(--bento-text)] font-bold focus:outline-none focus:border-[var(--accent-border)]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-[var(--bento-muted)] block mb-1">Artist Name</label>
                    <input
                      type="text"
                      value={project.artist}
                      onChange={(e) => setProject({ ...project, artist: e.target.value })}
                      className="w-full bg-[var(--bento-bg)] border border-[var(--bento-border)] px-3 py-2 rounded-xl text-xs text-[var(--bento-text)] font-bold focus:outline-none focus:border-[var(--accent-border)]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-[var(--bento-muted)] block mb-1">Tempo (BPM: {project.bpm})</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="60"
                        max="180"
                        value={project.bpm}
                        onChange={(e) => setProject({ ...project, bpm: parseInt(e.target.value) })}
                        className="w-full accent-[var(--accent-color)]"
                      />
                      <button
                        onClick={() => setIsMetronomeEnabled(!isMetronomeEnabled)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                          isMetronomeEnabled
                            ? "bg-theme-accent text-white"
                            : "bg-[var(--bento-bg)] text-[var(--bento-muted)] border-[var(--bento-border)]"
                        }`}
                      >
                        {isMetronomeEnabled ? "CLICK ON" : "CLICK"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aesthetic Theme & Typography Grid */}
              <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-4 sm:p-5 rounded-3xl space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent-pill-text)]">
                  Kinetic Visual Theme & Styling
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "cyber-crimson", name: "Cyber Crimson", color: "#DC2626" },
                    { id: "golden-afro", name: "Golden Afro-Aura", color: "#F59E0B" },
                    { id: "neon-midnight", name: "Neon Midnight", color: "#06B6D4" },
                    { id: "minimal-noir", name: "Minimal Noir", color: "#737373" },
                    { id: "cassette-lofi", name: "Cassette Pink", color: "#EC4899" },
                    { id: "acid-green", name: "Acid Matrix", color: "#10B981" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setProject({ ...project, theme: t.id as any })}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        project.theme === t.id
                          ? "border-[var(--accent-color)] bg-[var(--accent-light)] font-bold shadow-sm"
                          : "border-[var(--bento-border)] bg-[var(--bento-bg)] hover:bg-[var(--bento-elevated)]"
                      }`}
                    >
                      <span className="text-xs text-[var(--bento-text)]">{t.name}</span>
                      <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: t.color }} />
                    </button>
                  ))}
                </div>

                {/* Typography Selection */}
                <div className="pt-2 border-t border-[var(--bento-border)] grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "space-grotesk", label: "Space Grotesk" },
                    { id: "bold-impact", label: "Bold Impact" },
                    { id: "cinematic-serif", label: "Cinematic Serif" },
                    { id: "mono-terminal", label: "JetBrains Mono" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setProject({ ...project, fontStyle: f.id as any })}
                      className={`py-2 px-2.5 rounded-xl border text-[11px] text-center transition-all ${
                        project.fontStyle === f.id
                          ? "bg-theme-accent text-white font-bold border-transparent"
                          : "bg-[var(--bento-bg)] border-[var(--bento-border)] text-[var(--bento-muted)] hover:text-[var(--bento-text)]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Topline & Lyric Generator Prompt Bar */}
              <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-4 sm:p-5 rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-[var(--accent-pill-text)]" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--bento-text)]">
                      AI Lyric & Cadence Topliner
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--bento-muted)]">Powered by Gemini 3.7</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="E.g. Melodic Afrobeats hook about late night drives in Lagos with amapiano log drum groove..."
                    value={aiPromptTopic}
                    onChange={(e) => setAiPromptTopic(e.target.value)}
                    className="flex-1 bg-[var(--bento-bg)] border border-[var(--bento-border)] px-3.5 py-2.5 rounded-2xl text-xs text-[var(--bento-text)] focus:outline-none focus:border-[var(--accent-border)]"
                  />
                  <button
                    onClick={handleGenerateAiLyrics}
                    disabled={isAiGenerating}
                    className="px-4 py-2.5 rounded-2xl bg-theme-accent text-white text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 transition-all shrink-0 cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAiGenerating ? "Composing..." : "Generate Lyrics"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: Timestamp Sync Timeline Editor */}
          {viewMode === "editor" && (
            <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-4 sm:p-5 rounded-3xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--bento-text)] font-['Space_Grotesk']">
                    Synchronized Timeline & Bar Stamping
                  </h3>
                  <p className="text-[11px] text-[var(--bento-muted)]">
                    Play the track and click <strong className="text-[var(--accent-pill-text)]">Stamp Time</strong> when the vocalist delivers each bar.
                  </p>
                </div>
                <button
                  onClick={handleAddLine}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-accent text-white text-xs font-bold shadow hover:brightness-110 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </button>
              </div>

              {/* Lyric Bars List */}
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {project.lines.map((line, idx) => {
                  const isActive = activeLineIndex === idx;
                  return (
                    <div
                      key={line.id}
                      className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isActive
                          ? "bg-[var(--accent-light)] border-[var(--accent-color)] shadow-md"
                          : "bg-[var(--bento-bg)] border-[var(--bento-border)] hover:border-[var(--accent-border)]/50"
                      }`}
                    >
                      {/* Bar Index & Section */}
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[var(--bento-elevated)] border border-[var(--bento-border)] text-[10px] font-mono font-bold flex items-center justify-center text-[var(--bento-muted)]">
                          {idx + 1}
                        </span>
                        <select
                          value={line.section || "verse"}
                          onChange={(e) => {
                            const updated = [...project.lines];
                            updated[idx].section = e.target.value as any;
                            setProject({ ...project, lines: updated });
                          }}
                          className="text-[10px] font-mono uppercase bg-[var(--bento-card)] border border-[var(--bento-border)] rounded-lg px-1.5 py-1 text-[var(--bento-muted)] focus:outline-none"
                        >
                          <option value="intro">INTRO</option>
                          <option value="verse">VERSE</option>
                          <option value="pre-chorus">PRE-CHORUS</option>
                          <option value="chorus">CHORUS</option>
                          <option value="hook">HOOK</option>
                          <option value="outro">OUTRO</option>
                        </select>
                      </div>

                      {/* Text Input Field */}
                      <div className="flex-1 w-full sm:w-auto">
                        <input
                          type="text"
                          value={line.text}
                          onChange={(e) => handleLineTextChange(line.id, e.target.value)}
                          className="w-full bg-transparent font-medium text-xs sm:text-sm text-[var(--bento-text)] focus:outline-none border-b border-transparent focus:border-[var(--accent-border)] pb-0.5"
                        />
                      </div>

                      {/* Timestamp & Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="font-mono text-xs text-[var(--accent-pill-text)] font-bold px-2 py-0.5 rounded bg-[var(--bento-card)] border border-[var(--bento-border)]">
                          {line.timeFormatted}
                        </span>

                        <button
                          onClick={() => stampCurrentTimeToLine(idx)}
                          className="px-2.5 py-1 rounded-xl bg-[var(--bento-elevated)] hover:bg-theme-accent hover:text-white border border-[var(--bento-border)] text-[10px] font-mono font-bold text-[var(--bento-text)] transition-all cursor-pointer"
                          title="Stamp current playback time"
                        >
                          Stamp Now
                        </button>

                        <button
                          onClick={() => jumpToLine(idx)}
                          className="p-1.5 rounded-lg text-[var(--bento-muted)] hover:text-[var(--bento-text)] hover:bg-[var(--bento-card)]"
                          title="Jump to this line in playback"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteLine(line.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/10"
                          title="Delete line"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: Standard LRC Code View & Exporter */}
          {viewMode === "lrc" && (
            <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-4 sm:p-5 rounded-3xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--bento-text)] font-['Space_Grotesk']">
                    Standardized .LRC Master File
                  </h3>
                  <p className="text-[11px] text-[var(--bento-muted)]">
                    Compatible with Spotify for Artists, Musixmatch, Apple Music, and Instagram Music.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLRC}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--bento-elevated)] border border-[var(--bento-border)] text-xs font-bold text-[var(--bento-text)] hover:border-[var(--accent-border)] cursor-pointer"
                  >
                    {copiedLRC ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLRC ? "Copied" : "Copy Raw"}</span>
                  </button>

                  <button
                    onClick={handleDownloadLrcFile}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-theme-accent text-white text-xs font-bold shadow hover:brightness-110 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .lrc</span>
                  </button>
                </div>
              </div>

              {/* Code Box */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 font-mono text-xs text-neutral-300 overflow-x-auto max-h-[380px] leading-relaxed select-all">
                <pre>{generateLrcString()}</pre>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
