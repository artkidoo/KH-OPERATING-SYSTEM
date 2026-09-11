import React, { useState } from "react";
import {
  emptyReleaseDraft,
  demoReleaseDraft,
  ReleaseBuilderDraft,
} from "../../domain/releaseBuilder";
import { useWorkspace } from "../../context/WorkspaceContext";
import { STUDIO_PALETTES } from "../../domain/studioPalettes";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Upload,
  CheckCircle2,
  Music,
  Disc,
  BookOpen,
  Link2,
  Palette,
  Eye,
  RotateCcw,
} from "lucide-react";

const STEPS = [
  { id: "artist", title: "Artist Profile", icon: Music, desc: "Identity & background" },
  { id: "release", title: "Release Info", icon: Disc, desc: "Format, title & metadata" },
  { id: "story", title: "Story & Lyrics", icon: BookOpen, desc: "Narrative, mood & lyrics" },
  { id: "links", title: "Streaming Links", icon: Link2, desc: "DSP & presave routes" },
  { id: "visual", title: "Visual Identity", icon: Palette, desc: "Palette, artwork & direction" },
];

export function ReleaseBuilder({
  onDone,
  onNotify,
}: {
  onDone: (projectId: string) => void;
  onNotify: (m: string, t?: "success" | "info" | "error") => void;
}) {
  const { createProject, createRelease, createAsset } = useWorkspace();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ReleaseBuilderDraft>(emptyReleaseDraft());
  const [busy, setBusy] = useState(false);
  const [previewPalette, setPreviewPalette] = useState("cinematic-dark");

  const loadSample = () => {
    const demo = demoReleaseDraft();
    setDraft(demo);
    setPreviewPalette(demo.palette);
    onNotify("Populated with demo data: KAYDO — 'LIGHT'", "info");
  };

  const handleFinish = async () => {
    if (!draft.releaseTitle.trim() || !draft.artistName.trim()) {
      onNotify("Artist Name and Release Title are required.", "error");
      return;
    }

    setBusy(true);
    try {
      // 1. Create Project
      const project = await createProject({
        title: draft.releaseTitle.trim(),
        description: `${draft.releaseType.toUpperCase()} by ${draft.artistName} · ${draft.story.slice(0, 140)}`,
        category: "Release",
        status: "in-progress",
        priority: "high",
        sections: [
          "Release Information",
          "Artwork",
          "Photos",
          "Social Assets",
          "Motion",
          "Press",
          "EPK",
          "Copy",
          "Downloads",
        ],
      } as never);

      const projectId = (project as { id: string }).id;

      // 2. Create Release record
      await createRelease({
        title: draft.releaseTitle.trim(),
        artistName: draft.artistName.trim(),
        releaseType: draft.releaseType,
        releaseDate: draft.releaseDate || new Date().toISOString().slice(0, 10),
        status: "ready",
        projectId: projectId,
        upc: draft.upc || undefined,
        isrc: draft.isrc || undefined,
      } as never);

      // 3. Attach artwork if provided
      if (draft.artwork) {
        try {
          await createAsset({
            title: `${draft.releaseTitle} — Master Artwork`,
            projectId: projectId,
            type: "image",
            category: "artwork",
            url: draft.artwork,
            status: "approved",
            tags: [draft.releaseTitle, draft.artistName, "Artwork"],
          } as never);
        } catch (_) {
          // non-blocking
        }
      }

      onNotify(`Release "${draft.releaseTitle}" created with Creative Package ready.`, "success");
      onDone(projectId);
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : "Failed to create release", "error");
    } finally {
      setBusy(false);
    }
  };

  const currentStep = STEPS[step];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      {/* Header with Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/20 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] font-bold tracking-widest text-red-400 uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Flagship Studio Experience
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold text-white tracking-tight">
              Release Creative Builder
            </h1>
            <p className="mt-1 text-sm text-zinc-400 max-w-xl">
              Construct your complete release foundation. In 5 steps, KeedoHub synthesizes release metadata, streaming delivery links, narrative copy, and a full multi-format creative package.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              id="release-builder-use-sample-btn"
              onClick={loadSample}
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/20 transition-colors cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Use Sample Data
            </button>
            <button
              onClick={() => setDraft(emptyReleaseDraft())}
              type="button"
              title="Reset Draft"
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Indicator Bar */}
        <div className="mt-8 grid grid-cols-5 gap-2">
          {STEPS.map((s, idx) => {
            const isDone = idx < step;
            const isCurr = idx === step;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setStep(idx)}
                className={`group flex flex-col items-start rounded-xl p-2.5 text-left transition-all cursor-pointer ${
                  isCurr
                    ? "bg-red-500/15 border border-red-500/40"
                    : isDone
                    ? "bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700"
                    : "opacity-40 hover:opacity-75"
                }`}
              >
                <div className="flex items-center gap-1.5 w-full">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      isCurr
                        ? "bg-red-500 text-white"
                        : isDone
                        ? "bg-emerald-500 text-white"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span
                    className={`hidden sm:inline text-xs font-semibold truncate ${
                      isCurr ? "text-white" : isDone ? "text-zinc-200" : "text-zinc-400"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                <span className="hidden md:block text-[10px] text-zinc-500 truncate mt-1">
                  {s.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Container */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 md:p-8 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
              <currentStep.icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                Step {step + 1} of 5
              </span>
              <h2 className="text-lg font-bold text-white">{currentStep.title}</h2>
            </div>
          </div>
          <span className="text-xs text-zinc-500 font-medium">{currentStep.desc}</span>
        </div>

        {/* STEP 1: ARTIST */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Artist Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={draft.artistName}
                  onChange={(e) => setDraft({ ...draft, artistName: e.target.value })}
                  placeholder="e.g. KAYDO"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Primary Genre / Sound
                </label>
                <input
                  type="text"
                  value={draft.genre}
                  onChange={(e) => setDraft({ ...draft, genre: e.target.value })}
                  placeholder="e.g. Afro-Fusion / Soul"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Profile Photo URL or Image Path
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={draft.profileImage}
                  onChange={(e) => setDraft({ ...draft, profileImage: e.target.value })}
                  placeholder="https://... (or select from library)"
                  className="flex-1 rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
                {draft.profileImage && (
                  <img
                    src={draft.profileImage}
                    alt="Preview"
                    className="h-10 w-10 rounded-xl object-cover border border-zinc-700"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Artist Bio & Background
              </label>
              <textarea
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                placeholder="Brief narrative of the artist journey, sound influences, and cultural roots..."
                rows={4}
                className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Social Links
                </label>
                <input
                  type="text"
                  value={draft.socialLinks.join(", ")}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      socialLinks: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                  placeholder="https://instagram.com/..., https://tiktok.com/..."
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Official Website / EPK Link
                </label>
                <input
                  type="text"
                  value={draft.website}
                  onChange={(e) => setDraft({ ...draft, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: RELEASE */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Release Format
                </label>
                <select
                  value={draft.releaseType}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      releaseType: e.target.value as "single" | "ep" | "album",
                    })
                  }
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="single">Single</option>
                  <option value="ep">EP (Extended Play)</option>
                  <option value="album">Studio Album</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Release Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={draft.releaseTitle}
                  onChange={(e) => setDraft({ ...draft, releaseTitle: e.target.value })}
                  placeholder="e.g. LIGHT"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Official Release Date
                </label>
                <input
                  type="date"
                  value={draft.releaseDate}
                  onChange={(e) => setDraft({ ...draft, releaseDate: e.target.value })}
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Track Sub-Genre / BPM
                </label>
                <input
                  type="text"
                  value={draft.trackGenre}
                  onChange={(e) => setDraft({ ...draft, trackGenre: e.target.value })}
                  placeholder="e.g. Afro-Fusion / 104 BPM"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Track Listing & Duration
              </label>
              <textarea
                value={draft.trackInfo}
                onChange={(e) => setDraft({ ...draft, trackInfo: e.target.value })}
                placeholder="1. LIGHT — 02:58 (Key: C#m)&#10;2. MORNING (Acoustic) — 03:12"
                rows={3}
                className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Master Credits (Producers, Writers, Engineers)
              </label>
              <input
                type="text"
                value={draft.credits}
                onChange={(e) => setDraft({ ...draft, credits: e.target.value })}
                placeholder="Produced by Keedo | Written by Kaydo | Mixed by..."
                className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  ISRC Code (Optional)
                </label>
                <input
                  type="text"
                  value={draft.isrc}
                  onChange={(e) => setDraft({ ...draft, isrc: e.target.value })}
                  placeholder="e.g. NG-KH1-26-00142"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  UPC / Barcode (Optional)
                </label>
                <input
                  type="text"
                  value={draft.upc}
                  onChange={(e) => setDraft({ ...draft, upc: e.target.value })}
                  placeholder="e.g. 198293849102"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: STORY */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Song Story & Conception
                </label>
                <textarea
                  value={draft.story}
                  onChange={(e) => setDraft({ ...draft, story: e.target.value })}
                  placeholder="What inspired this record? Where were you when you wrote it?"
                  rows={4}
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Core Meaning & Emotional Theme
                </label>
                <textarea
                  value={draft.meaning}
                  onChange={(e) => setDraft({ ...draft, meaning: e.target.value })}
                  placeholder="What does this release represent for your listeners?"
                  rows={4}
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Full Lyrics
              </label>
              <textarea
                value={draft.lyrics}
                onChange={(e) => setDraft({ ...draft, lyrics: e.target.value })}
                placeholder="[Verse 1]&#10;City lights fading...&#10;&#10;[Chorus]&#10;We are the light..."
                rows={6}
                className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors font-mono"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Mood & Energy
                </label>
                <input
                  type="text"
                  value={draft.mood}
                  onChange={(e) => setDraft({ ...draft, mood: e.target.value })}
                  placeholder="e.g. Cinematic, Triumphant, Soulful"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Key Message / Tagline
                </label>
                <input
                  type="text"
                  value={draft.keyMessage}
                  onChange={(e) => setDraft({ ...draft, keyMessage: e.target.value })}
                  placeholder="e.g. The light always breaks through"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Artist Direct Notes
                </label>
                <input
                  type="text"
                  value={draft.artistNotes}
                  onChange={(e) => setDraft({ ...draft, artistNotes: e.target.value })}
                  placeholder="e.g. Pitch targeting Afro Indie & NMF"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: LINKS */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-400">
              Add your DSP streaming destinations and smart links. These will be automatically populated into DSP pitch cards, EPK one-sheets, and interactive presave banners.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Spotify Link
                </label>
                <input
                  type="text"
                  value={draft.streaming.spotify}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      streaming: { ...draft.streaming, spotify: e.target.value },
                    })
                  }
                  placeholder="https://open.spotify.com/..."
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Apple Music Link
                </label>
                <input
                  type="text"
                  value={draft.streaming.apple}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      streaming: { ...draft.streaming, apple: e.target.value },
                    })
                  }
                  placeholder="https://music.apple.com/..."
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Audiomack Link
                </label>
                <input
                  type="text"
                  value={draft.streaming.audiomack}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      streaming: { ...draft.streaming, audiomack: e.target.value },
                    })
                  }
                  placeholder="https://audiomack.com/..."
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  YouTube Official Video / Audio Link
                </label>
                <input
                  type="text"
                  value={draft.streaming.youtube}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      streaming: { ...draft.streaming, youtube: e.target.value },
                    })
                  }
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Pre-Save Smart Link URL
                </label>
                <input
                  type="text"
                  value={draft.streaming.presave}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      streaming: { ...draft.streaming, presave: e.target.value },
                    })
                  }
                  placeholder="https://keedohub.com/r/your-presave"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  TikTok Sound / Additional Link
                </label>
                <input
                  type="text"
                  value={draft.streaming.other}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      streaming: { ...draft.streaming, other: e.target.value },
                    })
                  }
                  placeholder="https://tiktok.com/music/..."
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: VISUAL IDENTITY */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Master Cover Artwork URL
                </label>
                <input
                  type="text"
                  value={draft.artwork}
                  onChange={(e) => setDraft({ ...draft, artwork: e.target.value })}
                  placeholder="https://... (3000x3000px recommended)"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                />
                <p className="mt-1 text-[11px] text-zinc-500">
                  Artwork will be synced directly to all social, streaming, and print templates.
                </p>

                {draft.artwork && (
                  <div className="mt-3 relative aspect-square w-48 overflow-hidden rounded-2xl border border-zinc-700 shadow-lg">
                    <img
                      src={draft.artwork}
                      alt="Cover Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                      3000 × 3000px
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Studio Visual Direction Preset
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {STUDIO_PALETTES.map((p) => {
                      const selected = previewPalette === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setPreviewPalette(p.id);
                            setDraft({ ...draft, palette: p.id });
                          }}
                          className={`flex items-center gap-2 rounded-xl p-2.5 border text-left cursor-pointer transition-all ${
                            selected
                              ? "border-red-500 bg-zinc-900 shadow-md"
                              : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700"
                          }`}
                        >
                          <div
                            className="h-4 w-4 rounded-full border border-white/20"
                            style={{ backgroundColor: p.accent }}
                          />
                          <span className="text-xs font-semibold text-white truncate">
                            {p.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Typography Pairing
                  </label>
                  <input
                    type="text"
                    value={draft.typography}
                    onChange={(e) => setDraft({ ...draft, typography: e.target.value })}
                    placeholder="e.g. Space Grotesk + Plus Jakarta Sans"
                    className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Visual Mood & Style References
                  </label>
                  <textarea
                    value={draft.styleReferences}
                    onChange={(e) => setDraft({ ...draft, styleReferences: e.target.value })}
                    placeholder="e.g. 35mm film grain, sunset amber tones, editorial typography..."
                    rows={3}
                    className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Live Synthesis Card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Creative Package Output Ready</p>
                <p className="text-[11px] text-zinc-400">
                  Finalizing will automatically generate 25+ assets across Social, Streaming, Press, Print, Motion, Merch, and Copy.
                </p>
              </div>
              <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
                100+ Asset Engine
              </span>
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="mt-8 flex items-center justify-between border-t border-zinc-800/80 pt-6">
          <button
            type="button"
            disabled={step === 0 || busy}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-500 transition-colors cursor-pointer shadow-md"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="release-builder-finish-btn"
                type="button"
                disabled={busy}
                onClick={handleFinish}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors cursor-pointer shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                {busy ? "Generating Package..." : "Create Release & Package"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
