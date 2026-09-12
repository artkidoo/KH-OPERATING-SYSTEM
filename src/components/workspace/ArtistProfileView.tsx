import React, { useState, useEffect } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Music,
  Palette,
  Sparkles,
  Link2,
  Globe,
  Camera,
  CheckCircle2,
  Save,
  Layers,
  FileText,
  Compass,
  Sliders,
  Eye,
  Info,
} from "lucide-react";
import { ArtistDNA } from "../../types";

export function ArtistProfileView({
  onNotify,
}: {
  onNotify: (m: string, t?: "success" | "info" | "error") => void;
}) {
  const { activeWorkspace } = useAuth();
  const { loadArtistDNA, saveArtistDNA } = useWorkspace();

  const [activeTab, setActiveTab] = useState<"identity" | "creative" | "release">("identity");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [artistName, setArtistName] = useState("");
  const [stageName, setStageName] = useState("");
  const [bio, setBio] = useState("");
  const [genre, setGenre] = useState("");
  const [subgenre, setSubgenre] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");

  // Socials
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");

  // DSPs
  const [spotify, setSpotify] = useState("");
  const [appleMusic, setAppleMusic] = useState("");
  const [audiomack, setAudiomack] = useState("");
  const [soundcloud, setSoundcloud] = useState("");
  const [youtubeMusic, setYoutubeMusic] = useState("");

  // Creative Identity
  const [story, setStory] = useState("");
  const [visualPersonality, setVisualPersonality] = useState("Minimalist Noir");
  const [colorPrimary, setColorPrimary] = useState("#EF4444");
  const [colorSecondary, setColorSecondary] = useState("#18181B");
  const [colorAccent, setColorAccent] = useState("#F59E0B");
  const [colorCanvas, setColorCanvas] = useState("#09090B");
  const [headingFont, setHeadingFont] = useState("Space Grotesk");
  const [bodyFont, setBodyFont] = useState("Plus Jakarta Sans");
  const [fontNotes, setFontNotes] = useState("");
  const [visualReferences, setVisualReferences] = useState("");
  const [moodReferences, setMoodReferences] = useState("");
  const [photography, setPhotography] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [designDirection, setDesignDirection] = useState("");
  const [toneTraits, setToneTraits] = useState("");
  const [toneDos, setToneDos] = useState("");
  const [toneDonts, setToneDonts] = useState("");

  // Release Info
  const [preferredReleaseStyle, setPreferredReleaseStyle] = useState("Single-driven rollout with EP culmination");
  const [preferredVisualDirection, setPreferredVisualDirection] = useState("Cinematic dark with bold typography");
  const [recurringCreativePreferences, setRecurringCreativePreferences] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchDNA = async () => {
      setIsLoading(true);
      try {
        const dna = await loadArtistDNA();
        if (dna && mounted) {
          setArtistName(dna.artistName || dna.artistIdentity || activeWorkspace?.name || "");
          setStageName(dna.stageName || "");
          setBio(dna.bio || dna.story || "");
          setGenre(dna.genre || "");
          setSubgenre(dna.subgenre || dna.soundDescription || "");
          setLocation(dna.location || "");
          setWebsite(dna.website || "");

          if (dna.socialLinks) {
            setInstagram(dna.socialLinks.instagram || "");
            setTiktok(dna.socialLinks.tiktok || "");
            setTwitter(dna.socialLinks.twitter || "");
            setYoutube(dna.socialLinks.youtube || "");
          }

          if (dna.streamingLinks) {
            setSpotify(dna.streamingLinks.spotify || "");
            setAppleMusic(dna.streamingLinks.appleMusic || "");
            setAudiomack(dna.streamingLinks.audiomack || "");
            setSoundcloud(dna.streamingLinks.soundcloud || "");
            setYoutubeMusic(dna.streamingLinks.youtubeMusic || "");
          }

          setStory(dna.story || "");
          setVisualPersonality(dna.visualPersonality || dna.visualDirection || "Minimalist Noir");
          if (dna.preferredColours) {
            if (dna.preferredColours.primary) setColorPrimary(dna.preferredColours.primary);
            if (dna.preferredColours.secondary) setColorSecondary(dna.preferredColours.secondary);
            if (dna.preferredColours.accent) setColorAccent(dna.preferredColours.accent);
            if (dna.preferredColours.canvas) setColorCanvas(dna.preferredColours.canvas);
          }
          if (dna.typographyPreferences) {
            if (dna.typographyPreferences.heading) setHeadingFont(dna.typographyPreferences.heading);
            if (dna.typographyPreferences.body) setBodyFont(dna.typographyPreferences.body);
            if (dna.typographyPreferences.notes) setFontNotes(dna.typographyPreferences.notes);
          }

          if (dna.visualReferences) {
            setVisualReferences(Array.isArray(dna.visualReferences) ? dna.visualReferences.join("\n") : dna.visualReferences);
          }
          if (dna.moodReferences) {
            setMoodReferences(Array.isArray(dna.moodReferences) ? dna.moodReferences.join("\n") : dna.moodReferences);
          }
          if (dna.photography) {
            setPhotography(Array.isArray(dna.photography) ? dna.photography.join("\n") : dna.photography);
          }
          setLogoUrl(dna.logoUrl || "");
          setDesignDirection(dna.designDirection || dna.positioning || "");

          if (dna.contentTone) {
            if (dna.contentTone.traits) setToneTraits(dna.contentTone.traits.join(", "));
            if (dna.contentTone.dos) setToneDos(dna.contentTone.dos.join("\n"));
            if (dna.contentTone.donts) setToneDonts(dna.contentTone.donts.join("\n"));
          }

          setPreferredReleaseStyle(dna.preferredReleaseStyle || "Single-driven rollout with EP culmination");
          setPreferredVisualDirection(dna.preferredVisualDirection || "Cinematic dark with bold typography");
          setRecurringCreativePreferences(dna.recurringCreativePreferences || (Array.isArray(dna.recurringThemes) ? dna.recurringThemes.join("\n") : ""));
        } else if (mounted) {
          // Default fallback
          setArtistName(activeWorkspace?.name || "Independent Artist");
        }
      } catch {
        // ignore fallback
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchDNA();
    return () => {
      mounted = false;
    };
  }, [activeWorkspace?.id]);

  // Profile completion calculation
  const fields = [
    { name: "Artist Name", filled: !!artistName },
    { name: "Bio / Narrative", filled: !!bio },
    { name: "Genre", filled: !!genre },
    { name: "Streaming Links", filled: !!(spotify || appleMusic || audiomack || soundcloud) },
    { name: "Social Links", filled: !!(instagram || tiktok || twitter || youtube) },
    { name: "Visual Personality", filled: !!visualPersonality },
    { name: "Color Palette", filled: !!colorPrimary },
    { name: "Typography", filled: !!headingFont },
    { name: "Visual / Mood References", filled: !!(visualReferences || moodReferences) },
    { name: "Release Preferences", filled: !!preferredReleaseStyle },
  ];

  const filledCount = fields.filter((f) => f.filled).length;
  const completionPct = Math.round((filledCount / fields.length) * 100);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const payload: ArtistDNA = {
        artistName: artistName.trim(),
        stageName: stageName.trim(),
        bio: bio.trim(),
        genre: genre.trim(),
        subgenre: subgenre.trim(),
        location: location.trim(),
        website: website.trim(),
        socialLinks: {
          instagram: instagram.trim(),
          tiktok: tiktok.trim(),
          twitter: twitter.trim(),
          youtube: youtube.trim(),
        },
        streamingLinks: {
          spotify: spotify.trim(),
          appleMusic: appleMusic.trim(),
          audiomack: audiomack.trim(),
          soundcloud: soundcloud.trim(),
          youtubeMusic: youtubeMusic.trim(),
        },
        story: story.trim() || bio.trim(),
        visualPersonality: visualPersonality.trim(),
        preferredColours: {
          primary: colorPrimary,
          secondary: colorSecondary,
          accent: colorAccent,
          canvas: colorCanvas,
        },
        typographyPreferences: {
          heading: headingFont,
          body: bodyFont,
          notes: fontNotes,
        },
        visualReferences: visualReferences
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        moodReferences: moodReferences
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        photography: photography
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        logoUrl: logoUrl.trim(),
        designDirection: designDirection.trim(),
        contentTone: {
          traits: toneTraits
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          dos: toneDos
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          donts: toneDonts
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        },
        preferredReleaseStyle: preferredReleaseStyle.trim(),
        preferredVisualDirection: preferredVisualDirection.trim(),
        recurringCreativePreferences: recurringCreativePreferences.trim(),
      };

      await saveArtistDNA(payload);
      onNotify("Artist Profile & Creative DNA saved to Studio source of truth.", "success");
    } catch (err: any) {
      onNotify(err.message || "Failed to save profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="workspace-page space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/20 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-0.5 text-[10px] font-bold tracking-wider text-red-400 uppercase">
              <Sparkles className="w-3 h-3" />
              <span>Studio Source of Truth</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {stageName || artistName || "Artist Profile & DNA"}
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-2xl">
              This master profile is the single source of truth KeedoHub Studio
              consults when designing your artwork, visual assets, and marketing
              kits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave()}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-950/60 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>
        </div>

        {/* Profile Completion Indicator */}
        <div className="mt-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-zinc-300">
              Profile Readiness for Production
            </span>
            <span
              className={`font-bold ${
                completionPct >= 80
                  ? "text-emerald-400"
                  : completionPct >= 50
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {completionPct}% Complete
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                completionPct >= 80
                  ? "bg-emerald-500"
                  : completionPct >= 50
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${completionPct}%` }}
            />
          </div>
          {completionPct < 100 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] text-zinc-400">
              <span className="text-zinc-500 font-medium">To reach 100%:</span>
              {fields
                .filter((f) => !f.filled)
                .slice(0, 4)
                .map((f) => (
                  <span
                    key={f.name}
                    className="rounded-md bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 text-zinc-300"
                  >
                    + Add {f.name}
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 space-x-2">
        <button
          onClick={() => setActiveTab("identity")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "identity"
              ? "border-red-500 text-white"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <User className="w-4 h-4" />
          <span>1. Identity & Links</span>
        </button>
        <button
          onClick={() => setActiveTab("creative")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "creative"
              ? "border-red-500 text-white"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>2. Creative Identity & Visuals</span>
        </button>
        <button
          onClick={() => setActiveTab("release")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "release"
              ? "border-red-500 text-white"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>3. Release Information & Preferences</span>
        </button>
      </div>

      {/* Form Content */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
        {activeTab === "identity" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Artist Core Identity</h2>
              <p className="text-xs text-zinc-400">
                Primary name, genre classifications, and background narrative.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Artist Legal / Official Name *
                </label>
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="e.g. Samuel Adeyemi"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Stage Name / Moniker *
                </label>
                <input
                  type="text"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  placeholder="e.g. KAYDO"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Primary Genre *
                </label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g. Afrobeats, Alté, Trap, R&B"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Subgenre / Sonic Style
                </label>
                <input
                  type="text"
                  value={subgenre}
                  onChange={(e) => setSubgenre(e.target.value)}
                  placeholder="e.g. Afro-Fusion, Melodic Drill"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lagos, Nigeria / London, UK"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Artist Bio & Origin Story *
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your musical journey, pivotal moments, and distinct sound."
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <h3 className="text-sm font-bold text-white mb-1">Streaming & DSP Profiles</h3>
              <p className="text-xs text-zinc-400 mb-3">
                Used to link presaves, release kits, and verify streaming deliveries.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={spotify}
                  onChange={(e) => setSpotify(e.target.value)}
                  placeholder="Spotify Artist URI or URL"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
                <input
                  type="text"
                  value={appleMusic}
                  onChange={(e) => setAppleMusic(e.target.value)}
                  placeholder="Apple Music Artist URL"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
                <input
                  type="text"
                  value={audiomack}
                  onChange={(e) => setAudiomack(e.target.value)}
                  placeholder="Audiomack Profile URL"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
                <input
                  type="text"
                  value={soundcloud}
                  onChange={(e) => setSoundcloud(e.target.value)}
                  placeholder="SoundCloud URL"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <h3 className="text-sm font-bold text-white mb-1">Social Channels & Website</h3>
              <p className="text-xs text-zinc-400 mb-3">
                Target handles for social kits, mention tags, and rollout collateral.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Instagram (@handle)"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
                <input
                  type="text"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="TikTok (@handle)"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="Twitter / X (@handle)"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="YouTube Channel URL"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="Official Website URL"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "creative" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Creative Identity & Aesthetics</h2>
              <p className="text-xs text-zinc-400">
                Visual aesthetics, typography pairings, color systems, and moodboards.
              </p>
            </div>

            {/* Visual Personality */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-2">
                Visual Personality Archetype
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  "Minimalist Noir",
                  "Afrofuturistic",
                  "High-Contrast Editorial",
                  "Cyberpunk Amber",
                  "Gritty 35mm Film",
                  "Vintage Vinyl Soul",
                  "Luxury Monochrome",
                  "Ethereal Dreamscape",
                ].map((arch) => (
                  <button
                    key={arch}
                    type="button"
                    onClick={() => setVisualPersonality(arch)}
                    className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                      visualPersonality === arch
                        ? "border-red-500 bg-red-500/10 text-white font-bold"
                        : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <p className="text-xs">{arch}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="pt-4 border-t border-zinc-800">
              <label className="block text-xs font-bold text-zinc-300 mb-2">
                Brand & Release Color Palette
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Primary Accent</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorPrimary}
                      onChange={(e) => setColorPrimary(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={colorPrimary}
                      onChange={(e) => setColorPrimary(e.target.value)}
                      className="w-full text-xs font-mono font-bold text-white bg-transparent"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Secondary</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorSecondary}
                      onChange={(e) => setColorSecondary(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={colorSecondary}
                      onChange={(e) => setColorSecondary(e.target.value)}
                      className="w-full text-xs font-mono font-bold text-white bg-transparent"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Accent Pop</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorAccent}
                      onChange={(e) => setColorAccent(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={colorAccent}
                      onChange={(e) => setColorAccent(e.target.value)}
                      className="w-full text-xs font-mono font-bold text-white bg-transparent"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Canvas Background</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorCanvas}
                      onChange={(e) => setColorCanvas(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={colorCanvas}
                      onChange={(e) => setColorCanvas(e.target.value)}
                      className="w-full text-xs font-mono font-bold text-white bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="pt-4 border-t border-zinc-800">
              <label className="block text-xs font-bold text-zinc-300 mb-2">
                Typography Preferences
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] text-zinc-400 mb-1">Headline Font Family</span>
                  <input
                    type="text"
                    value={headingFont}
                    onChange={(e) => setHeadingFont(e.target.value)}
                    placeholder="e.g. Space Grotesk, Syne, Clash Display, Anton"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <span className="block text-[11px] text-zinc-400 mb-1">Body / Copy Font</span>
                  <input
                    type="text"
                    value={bodyFont}
                    onChange={(e) => setBodyFont(e.target.value)}
                    placeholder="e.g. Plus Jakarta Sans, Inter, Satoshi"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* References & Photography */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Visual References & Moodboard URLs
                </label>
                <textarea
                  rows={3}
                  value={visualReferences}
                  onChange={(e) => setVisualReferences(e.target.value)}
                  placeholder="Paste links to Pinterest boards, Behance, or reference imagery"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Photography & Press Shot Assets (Cloud Links)
                </label>
                <textarea
                  rows={3}
                  value={photography}
                  onChange={(e) => setPhotography(e.target.value)}
                  placeholder="Links to high-res press photos or Dropbox/Drive folders"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Logo / Monogram URL */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Artist Mark / Logotype / Monogram URL
              </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://... SVG or transparent PNG link"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Tone & Guidelines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1">
                  Visual Guidelines (Dos)
                </label>
                <textarea
                  rows={3}
                  value={toneDos}
                  onChange={(e) => setToneDos(e.target.value)}
                  placeholder="e.g.&#10;Always maintain high shadow contrast&#10;Keep typography bold and centered&#10;Use subtle grain textures"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-400 mb-1">
                  Things to Avoid (Don'ts)
                </label>
                <textarea
                  rows={3}
                  value={toneDonts}
                  onChange={(e) => setToneDonts(e.target.value)}
                  placeholder="e.g.&#10;No rainbow or neon pastel gradients&#10;No clip-art or AI distortion&#10;Never stretch typography"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "release" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Release Strategy & Directives</h2>
              <p className="text-xs text-zinc-400">
                How you prefer your releases structured, produced, and packaged.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-2">
                Preferred Release Cadence & Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    title: "Single-Driven Rollout",
                    desc: "Lead with 2-3 flagship singles followed by focused EP drop.",
                  },
                  {
                    title: "Cinematic Conceptual Album",
                    desc: "Expansive multi-phase visual narrative and cohesive art direction.",
                  },
                  {
                    title: "Rapid Mystery Teasers",
                    desc: "High-frequency micro-content leading to sudden shock release.",
                  },
                ].map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setPreferredReleaseStyle(item.title)}
                    className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                      preferredReleaseStyle === item.title
                        ? "border-red-500 bg-red-500/10 text-white"
                        : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <p className="text-xs font-bold text-white">{item.title}</p>
                    <p className="text-[11px] text-zinc-400 mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Preferred Visual Direction for Master Artwork
              </label>
              <textarea
                rows={3}
                value={preferredVisualDirection}
                onChange={(e) => setPreferredVisualDirection(e.target.value)}
                placeholder="e.g. Cinematic portrait photography with film grain and custom minimalist monograms."
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Recurring Creative Motifs & Themes
              </label>
              <textarea
                rows={3}
                value={recurringCreativePreferences}
                onChange={(e) => setRecurringCreativePreferences(e.target.value)}
                placeholder="e.g. Nocturnal cityscapes, amber streetlights, handwritten lyric quotes, silhouettes."
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 flex items-start gap-3">
              <Info className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="font-bold">KeedoHub Studio Synchronization</p>
                <p className="mt-0.5 text-amber-200/80">
                  When you submit a New Release or request artwork, KeedoHub Studio
                  designers automatically ingest these preferences so every single,
                  EPK, or TikTok motion clip is guaranteed on-brand.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer save */}
        <div className="mt-8 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Last saved to workspace: {activeWorkspace?.name}
          </p>
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-950/60 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Profile & DNA"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
