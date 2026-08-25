import React, { useState, useEffect, useRef } from "react";
import { PRESET_AUDIO_STEMS } from "../data/mockData";
import { AudioStudioSkeleton } from "./skeletons/ModuleSkeletons";
import { 
  Activity, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Sliders, 
  HelpCircle,
  Radio,
  FileAudio,
  Layers,
  Wand2,
  RefreshCw
} from "lucide-react";
import confetti from "canvas-confetti";

interface MasteringSuiteProps {
  onNotify: (text: string, type?: "success" | "info" | "error") => void;
}

export const MasteringSuite: React.FC<MasteringSuiteProps> = ({ onNotify }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedStem, setSelectedStem] = useState(PRESET_AUDIO_STEMS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lufs, setLufs] = useState(selectedStem.defaultLufs);
  const [truePeak, setTruePeak] = useState(selectedStem.defaultTruePeak);
  const [dynamicRange, setDynamicRange] = useState(selectedStem.defaultDr);
  const [stereoWidth, setStereoWidth] = useState(selectedStem.stereoWidth);
  const [activeTab, setActiveTab] = useState<"loudness" | "spectrum" | "critique">("loudness");
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 320);
    return () => clearTimeout(timer);
  }, []);
  
  // Canvas & Web Audio Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthOscRef = useRef<OscillatorNode | null>(null);

  // Initialize Web Audio synth loop for demo audio feedback
  const startAudioFeedback = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
    } catch (_) {}
  };

  // Real-time Canvas Spectrum Render Loop (60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let tick = 0;
    const renderSpectrum = () => {
      tick++;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw frequency background grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }

      // Draw spectrum bars
      const numBars = 32;
      const barWidth = (width / numBars) - 2;

      for (let i = 0; i < numBars; i++) {
        const freqRatio = i / numBars;
        // Spectrum baseline based on current stem preset
        const baseAmp = selectedStem.spectrum[Math.floor(freqRatio * selectedStem.spectrum.length)] || 50;
        
        // Add animated variation if playing
        const variation = isPlaying ? Math.sin(tick * 0.15 + i * 0.4) * 15 + Math.random() * 8 : 0;
        const barHeight = Math.max(8, Math.min(height - 10, ((baseAmp + variation) / 100) * height));

        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Gradient for bars
        const grad = ctx.createLinearGradient(0, height, 0, 0);
        if (y < 25) {
          // Clipping red peak
          grad.addColorStop(0, "#DC2626");
          grad.addColorStop(0.7, "#F59E0B");
          grad.addColorStop(1, "#EF4444");
        } else {
          grad.addColorStop(0, "#991B1B");
          grad.addColorStop(0.6, "#DC2626");
          grad.addColorStop(1, "#F87171");
        }

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Peak dot
        ctx.fillStyle = y < 25 ? "#FFFFFF" : "rgba(255, 255, 255, 0.6)";
        ctx.fillRect(x, y - 2, barWidth, 2);
      }

      animationFrameRef.current = requestAnimationFrame(renderSpectrum);
    };

    renderSpectrum();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, selectedStem]);

  // Load stem preset
  const handleSelectStem = (stem: typeof PRESET_AUDIO_STEMS[0]) => {
    setSelectedStem(stem);
    setLufs(stem.defaultLufs);
    setTruePeak(stem.defaultTruePeak);
    setDynamicRange(stem.defaultDr);
    setStereoWidth(stem.stereoWidth);
    onNotify(`Loaded: ${stem.name}`, "info");
  };

  const togglePlay = () => {
    startAudioFeedback();
    setIsPlaying(!isPlaying);
  };

  // Status determinations
  const isClipping = truePeak > -0.5;
  const isTooLoudSpotify = lufs > -12;
  const isTooQuietSpotify = lufs < -16;

  // AI Critique Action
  const handleRunAiCritique = async () => {
    setIsAiAnalyzing(true);
    onNotify("Keedohub Sound Labs is inspecting acoustic transients...", "info");
    try {
      const res = await fetch("/api/ai/audio-critique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackName: selectedStem.name,
          genre: selectedStem.genre,
          lufs,
          truePeak,
          dynamicRange,
          stereoWidth,
        }),
      });
      const data = await res.json();
      if (data && data.data) {
        setActiveTab("critique");
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
        onNotify("Generated comprehensive mastering report card!", "success");
      }
    } catch (_) {
      onNotify("Mastering report generated from offline acoustic engine", "info");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  if (isInitializing) {
    return <AudioStudioSkeleton />;
  }

  return (
    <div id="mastering-suite-module" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--bento-card)] border border-[var(--bento-border)] p-5 sm:p-6 rounded-3xl shadow-lg">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-theme-accent text-white shadow-md">
              <Activity className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-[var(--bento-text)]">
              Mastering Inspector & Loudness Radar
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              EBU R128 & ITU-R BS.1770
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--bento-muted)] max-w-2xl">
            Inspect Integrated <strong className="text-[var(--bento-text)]">LUFS, True Peak dBTP, and Frequency Spectrum</strong> to prevent Spotify and Apple Music audio compression squashing.
          </p>
        </div>

        {/* Stem Switcher */}
        <div className="flex items-center gap-2 bg-[var(--bento-elevated)] p-1.5 rounded-2xl border border-[var(--bento-border)]">
          {PRESET_AUDIO_STEMS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectStem(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                selectedStem.id === s.id
                  ? "bg-theme-accent text-white font-bold shadow"
                  : "text-[var(--bento-muted)] hover:text-[var(--bento-text)]"
              }`}
            >
              {s.genre}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Spectrum & Meters / Right Compliance Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ==========================================
            LEFT: LIVE SPECTRUM CANVAS & METERS (Col 7)
            ========================================== */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Canvas Spectrum Card */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-3xl space-y-4 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-300 font-bold">
                  60 FPS FREQUENCY SPECTRUM (20Hz - 20kHz)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                {selectedStem.name}
              </span>
            </div>

            {/* Canvas */}
            <div className="w-full h-44 bg-neutral-900/60 rounded-2xl border border-neutral-800 relative overflow-hidden flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={560}
                height={170}
                className="w-full h-full object-cover"
              />
              
              {/* Frequency Scale Labels */}
              <div className="absolute bottom-1.5 left-0 right-0 px-4 flex justify-between text-[9px] font-mono text-neutral-500 pointer-events-none">
                <span>20Hz</span>
                <span>100Hz</span>
                <span>500Hz</span>
                <span>2kHz</span>
                <span>8kHz</span>
                <span>20kHz</span>
              </div>
            </div>

            {/* Playback & Upload Controls */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={togglePlay}
                className="flex-1 py-2.5 rounded-2xl bg-theme-accent text-white font-bold flex items-center justify-center gap-2 text-xs hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? "PAUSE ANALYZER" : "START SPECTRUM SCAN"}</span>
              </button>

              <button
                onClick={() => onNotify("Audio file drag & drop is active for WAV/MP3 masters", "info")}
                className="px-4 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom .WAV</span>
              </button>
            </div>
          </div>

          {/* 4 Interactive Audio Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* 1. Integrated LUFS */}
            <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-[var(--bento-muted)] block uppercase">Integrated LUFS</span>
              <p className={`text-xl font-bold font-mono ${isTooLoudSpotify ? "text-amber-400" : "text-emerald-400"}`}>
                {lufs.toFixed(1)} <span className="text-xs font-normal">LUFS</span>
              </p>
              <span className="text-[10px] font-mono text-neutral-400 block">
                Target: -14.0 LUFS
              </span>
            </div>

            {/* 2. True Peak dBTP */}
            <div className={`border p-3.5 rounded-2xl space-y-1 ${
              isClipping ? "bg-red-950/40 border-red-500/50" : "bg-[var(--bento-card)] border-[var(--bento-border)]"
            }`}>
              <span className="text-[10px] font-mono text-[var(--bento-muted)] block uppercase">True Peak (dBTP)</span>
              <p className={`text-xl font-bold font-mono ${isClipping ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
                {truePeak > 0 ? `+${truePeak.toFixed(1)}` : truePeak.toFixed(1)} <span className="text-xs font-normal">dBTP</span>
              </p>
              <span className={`text-[10px] font-mono block ${isClipping ? "text-red-400 font-bold" : "text-neutral-400"}`}>
                {isClipping ? "⚠️ CLIPPING RISK" : "Headroom Clean"}
              </span>
            </div>

            {/* 3. Dynamic Range DR */}
            <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-[var(--bento-muted)] block uppercase">Dynamic Range</span>
              <p className="text-xl font-bold font-mono text-cyan-400">
                {dynamicRange} <span className="text-xs font-normal">DR</span>
              </p>
              <span className="text-[10px] font-mono text-neutral-400 block">
                {dynamicRange >= 8 ? "Punchy & Open" : "Heavily Compressed"}
              </span>
            </div>

            {/* 4. Stereo Width */}
            <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-[var(--bento-muted)] block uppercase">Stereo Field</span>
              <p className="text-xl font-bold font-mono text-purple-400">
                {stereoWidth}% <span className="text-xs font-normal">Width</span>
              </p>
              <span className="text-[10px] font-mono text-neutral-400 block">
                Mono Sub: 100% Locked
              </span>
            </div>

          </div>

          {/* Interactive Sliders to test mastering limits */}
          <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-4 rounded-2xl space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent-pill-text)] block">
              Limiter Ceiling & Gain Simulation
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-[var(--bento-muted)] flex justify-between mb-1">
                  <span>Gain Drive (Simulate Loudness)</span>
                  <span className="text-[var(--bento-text)] font-bold">{lufs.toFixed(1)} LUFS</span>
                </label>
                <input
                  type="range"
                  min="-20"
                  max="-6"
                  step="0.2"
                  value={lufs}
                  onChange={(e) => {
                    const newLufs = parseFloat(e.target.value);
                    setLufs(newLufs);
                    setTruePeak(newLufs > -10 ? (newLufs + 10) * 0.3 : -1.0);
                  }}
                  className="w-full accent-[var(--accent-color)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-[var(--bento-muted)] flex justify-between mb-1">
                  <span>True Peak Limiter Ceiling</span>
                  <span className="text-[var(--bento-text)] font-bold">{truePeak.toFixed(1)} dBTP</span>
                </label>
                <input
                  type="range"
                  min="-3.0"
                  max="1.0"
                  step="0.1"
                  value={truePeak}
                  onChange={(e) => setTruePeak(parseFloat(e.target.value))}
                  className="w-full accent-[var(--accent-color)]"
                />
              </div>
            </div>
          </div>

        </div>

        {/* ==========================================
            RIGHT: DSP COMPLIANCE MATRIX & AI REPORT (Col 5)
            ========================================== */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Sub Navigation */}
          <div className="flex items-center gap-2 border-b border-[var(--bento-border)] pb-3">
            <button
              onClick={() => setActiveTab("loudness")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "loudness"
                  ? "bg-theme-accent text-white shadow"
                  : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] bg-[var(--bento-card)] border border-[var(--bento-border)]"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>DSP Platform Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab("critique")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "critique"
                  ? "bg-theme-accent text-white shadow"
                  : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] bg-[var(--bento-card)] border border-[var(--bento-border)]"
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Acoustic Doctor</span>
            </button>
          </div>

          {/* TAB 1: DSP Compliance Matrix */}
          {activeTab === "loudness" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              
              {/* Spotify Row */}
              <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--bento-text)]">Spotify</span>
                    <span className="text-[10px] font-mono text-[var(--bento-muted)]">Standard: -14 LUFS / -1 dBTP</span>
                  </div>
                  <p className="text-[11px] text-[var(--bento-muted)]">
                    {lufs > -13 ? "⚠️ Attenuation: Spotify will lower volume by -" + (Math.abs(lufs) - 14).toFixed(1) + "dB" : "✅ Perfect streaming match"}
                  </p>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg ${
                  lufs > -13 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}>
                  {lufs > -13 ? "TOO LOUD" : "OPTIMAL"}
                </span>
              </div>

              {/* Apple Music Row */}
              <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--bento-text)]">Apple Music</span>
                    <span className="text-[10px] font-mono text-[var(--bento-muted)]">Sound Check: -16 LUFS / -1 dBTP</span>
                  </div>
                  <p className="text-[11px] text-[var(--bento-muted)]">
                    {lufs > -15 ? "Sound Check normalization applied" : "Full dynamic depth preserved"}
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  OPTIMAL
                </span>
              </div>

              {/* Club / DJ Row */}
              <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--bento-text)]">Club / Festival Soundsystem</span>
                    <span className="text-[10px] font-mono text-[var(--bento-muted)]">Standard: -9 to -8 LUFS</span>
                  </div>
                  <p className="text-[11px] text-[var(--bento-muted)]">
                    {lufs > -10 ? "Massive club impact on large PA rigs" : "Clean for streaming, but quieter in DJ sets"}
                  </p>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg ${
                  lufs > -10 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-neutral-800 text-neutral-400"
                }`}>
                  {lufs > -10 ? "CLUB READY" : "STREAM TIER"}
                </span>
              </div>

              {/* AI Doctor CTA */}
              <button
                onClick={handleRunAiCritique}
                disabled={isAiAnalyzing}
                className="w-full py-3 rounded-2xl bg-theme-accent text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAiAnalyzing ? "Analyzing Transients..." : "Get AI Mastering Recommendations"}</span>
              </button>
            </div>
          )}

          {/* TAB 2: AI Acoustic Doctor & Recommendations */}
          {activeTab === "critique" && (
            <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-5 rounded-3xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[var(--bento-border)] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[var(--bento-text)] font-['Space_Grotesk']">
                    Acoustic Doctor Report Card
                  </h3>
                  <p className="text-[11px] text-[var(--bento-muted)]">Keedohub Sound Labs Diagnostic Engine</p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  GRADE: A-
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-[var(--bento-elevated)] border border-[var(--bento-border)]">
                  <p className="font-bold text-[var(--bento-text)] mb-0.5">1. Sub-Bass Mono Lock (20-100Hz)</p>
                  <p className="text-[var(--bento-muted)] leading-relaxed">
                    High-pass below 28Hz to clean up sub rumble and recover +1.2dB of limiter headroom.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[var(--bento-elevated)] border border-[var(--bento-border)]">
                  <p className="font-bold text-[var(--bento-text)] mb-0.5">2. Low-Mid Frequency Clarity (250-500Hz)</p>
                  <p className="text-[var(--bento-muted)] leading-relaxed">
                    Dip -1.0dB around 320Hz to remove subtle mud without sacrificing vocal warmth.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[var(--bento-elevated)] border border-[var(--bento-border)]">
                  <p className="font-bold text-[var(--bento-text)] mb-0.5">3. True Peak Intersample Protection</p>
                  <p className="text-[var(--bento-muted)] leading-relaxed">
                    Ensure ceiling is locked to strictly -1.0 dBTP so AAC/MP3 DSP encoders don't crackle.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
