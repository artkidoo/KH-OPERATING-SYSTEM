import React, { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useMembership } from "../../hooks/useMembership";
import {
  Sparkles,
  X,
  Upload,
  ArrowRight,
  Palette,
  Image as ImageIcon,
  BookOpen,
  CheckCircle2,
  FileText,
  HelpCircle,
} from "lucide-react";

interface RequestCoverArtworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  releaseId?: string;
  releaseTitle?: string;
  onNotify: (m: string, t?: "success" | "info" | "error") => void;
  onSuccess?: () => void;
}

export function RequestCoverArtworkModal({
  isOpen,
  onClose,
  releaseId,
  releaseTitle = "",
  onNotify,
  onSuccess,
}: RequestCoverArtworkModalProps) {
  const { submitStudioRequest, projects, releases } = useWorkspace();
  const { tier } = useMembership();

  const [title, setTitle] = useState(
    releaseTitle ? `Cover Artwork: ${releaseTitle}` : "Single / EP Cover Artwork"
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || ""
  );
  const [ideas, setIdeas] = useState("");
  const [mood, setMood] = useState("");
  const [references, setReferences] = useState("");
  const [photography, setPhotography] = useState("");
  const [lyricsStory, setLyricsStory] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onNotify("Please provide a title for your artwork request.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullBrief = [
        `### Creative Ideas & Vision\n${ideas || "Artist open to KeedoHub Studio direction"}`,
        `### Mood & Emotional Tone\n${mood || "Calibrated to Artist DNA"}`,
        `### Visual References & Moodboards\n${references || "None provided"}`,
        `### Photography & Assets\n${photography || "Use KeedoHub high-res creative direction"}`,
        `### Song Story & Lyrics Excerpt\n${lyricsStory || "See Release dossier"}`,
        `### Creative Notes & Typography\n${notes || "Spotify / Apple Music 3000x3000px master standard"}`,
      ].join("\n\n");

      await submitStudioRequest({
        title: title.trim(),
        serviceId: "srv_cover_artwork",
        serviceName: "Cover Artwork & Master Release Visuals",
        category: "Cover Artwork",
        briefDetails: fullBrief,
        priority: tier === "pro" || tier === "scale" ? "urgent" : "high",
        metadata: {
          releaseId,
          releaseTitle,
          requestedType: "cover-artwork",
          ideas,
          mood,
          references,
          photography,
          lyricsStory,
          notes,
          flowStage: "KeedoHub Studio Ingestion",
        },
      } as any);

      onNotify(
        "Cover artwork request submitted to KeedoHub Studio. Our designers will calibrate your artwork.",
        "success"
      );
      onSuccess?.();
      onClose();
    } catch (err: any) {
      onNotify(err.message || "Failed to submit artwork request", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-bold text-red-400">
              <Sparkles className="w-3 h-3" />
              <span>KEEDOHUB STUDIO PRODUCTION</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Request Cover Artwork
            </h2>
            <p className="text-xs text-zinc-400">
              KeedoHub designers craft your finished master artwork. Submit your
              mood, references, and photography.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workflow Diagram */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4">
          <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mb-2">
            Studio Production Pipeline
          </p>
          <div className="flex items-center justify-between text-xs text-zinc-300 overflow-x-auto gap-2 py-1">
            <span className="font-semibold text-white px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 shrink-0">
              1. Creative Request
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            <span className="shrink-0 px-2 py-1 rounded bg-zinc-800/80 text-zinc-400">
              2. Studio Briefing
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            <span className="shrink-0 px-2 py-1 rounded bg-zinc-800/80 text-zinc-400">
              3. KeedoHub Designer
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            <span className="shrink-0 px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              4. Final Master Artwork
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Artwork Request Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Cover Artwork for 'NOVA'"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Visual Concept & Ideas
              </label>
              <textarea
                rows={3}
                value={ideas}
                onChange={(e) => setIdeas(e.target.value)}
                placeholder="What vision or elements do you imagine? (e.g. bold typography, cinematic portrait, abstract neon textures)"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Mood & Atmospheric Tone
              </label>
              <textarea
                rows={3}
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="e.g. Dark noir, cinematic, high contrast amber, melancholy, futuristic, gritty film grain"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Visual References & Moodboards
              </label>
              <textarea
                rows={2}
                value={references}
                onChange={(e) => setReferences(e.target.value)}
                placeholder="Paste Pinterest, Instagram, or image links for references"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Photography & Headshot Links
              </label>
              <textarea
                rows={2}
                value={photography}
                onChange={(e) => setPhotography(e.target.value)}
                placeholder="Links to high-res artist photos or press shots (Google Drive, Dropbox, Unsplash)"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Song Story / Lyrics Excerpt
              </label>
              <textarea
                rows={2}
                value={lyricsStory}
                onChange={(e) => setLyricsStory(e.target.value)}
                placeholder="Key chorus lyric or back-story that gives the song its soul"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Creative Notes & Typography Rules
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specific font style preferences, explicit sticker, exact color codes"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-400 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-950/50 hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <span>Submitting to Studio...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Send Request to KeedoHub Studio</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
