import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Music,
  Video,
  Building2,
  Rocket,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Layers,
  Wand2,
  ShieldCheck,
  Disc,
  Target,
  Share2,
  Calendar,
  Zap,
  HelpCircle,
  FolderPlus,
} from "lucide-react";
import { IdentityType, OnboardingPayload } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

interface IdentityCardConfig {
  type: IdentityType;
  title: string;
  subtitle: string;
  icon: any;
  accentColor: string;
  badge: string;
  features: string[];
}

const IDENTITY_OPTIONS: IdentityCardConfig[] = [
  {
    type: "artist",
    title: "Artist & Musician",
    subtitle: "Music releases, cover art, DSP pitching, and fanbase growth",
    icon: Music,
    accentColor: "from-red-500/20 to-orange-500/20 border-red-500/30 text-red-400",
    badge: "Artist OS",
    features: ["Release Readiness Engine", "DSP Editorial Pitcher", "Cover & Mastering Suites"],
  },
  {
    type: "brand",
    title: "Brand & Business",
    subtitle: "Brand identity, collection drops, campaign sprints, and conversion engines",
    icon: Building2,
    accentColor: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400",
    badge: "Brand OS",
    features: ["Brand Core & Archetypes", "Campaign Sprint Tracker", "Multi-channel Content & Product Engine"],
  },
];

export const OnboardingModal: React.FC = () => {
  const {
    isOnboardingOpen,
    closeOnboarding,
    completeOnboarding,
    onboardingOptions,
    activeWorkspace,
    user,
  } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedIdentity, setSelectedIdentity] = useState<IdentityType>("artist");
  const [workspaceName, setWorkspaceName] = useState("");
  const [genreOrNiche, setGenreOrNiche] = useState("");
  const [stage, setStage] = useState("Emerging & Active");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [positioning, setPositioning] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  
  // Specific Entity Inputs
  const [releaseTitle, setReleaseTitle] = useState("");
  const [releaseFormat, setReleaseFormat] = useState("Single");
  const [releaseDate, setReleaseDate] = useState("");

  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const [campaignTargetDate, setCampaignTargetDate] = useState("");

  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [mainOffer, setMainOffer] = useState("");

  // AI Prompt Interpreter
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOnboardingOpen) {
      const defaultId = onboardingOptions.defaultIdentity || activeWorkspace?.identityType || "artist";
      setSelectedIdentity(defaultId);
      setWorkspaceName(activeWorkspace?.name || (user?.fullName ? `${user.fullName}'s OS` : ""));
      setGenreOrNiche(activeWorkspace?.genreOrNiche || "");
      setPositioning(activeWorkspace?.bio || "");

      // Pre-select popular platforms based on identity
      if (defaultId === "artist") {
        setSelectedPlatforms(["spotify", "instagram", "tiktok", "youtube"]);
      } else {
        setSelectedPlatforms(["instagram", "linkedin", "tiktok", "youtube"]);
      }
      setStep(1);
      setError(null);
    }
  }, [isOnboardingOpen, onboardingOptions, activeWorkspace, user]);

  if (!isOnboardingOpen) return null;

  const togglePlatform = (p: string) => {
    if (selectedPlatforms.includes(p)) {
      setSelectedPlatforms(selectedPlatforms.filter((x) => x !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleAiInterpret = async () => {
    if (!naturalLanguageInput.trim()) return;
    setIsInterpreting(true);
    setAiNotice(null);
    try {
      const res = await api.workspaces.interpretOnboardingPrompt(naturalLanguageInput, selectedIdentity);
      const data = res.interpreted;

      if (data.identityType) setSelectedIdentity(data.identityType);
      if (data.suggestedGenreOrNiche) setGenreOrNiche(data.suggestedGenreOrNiche);
      if (data.suggestedGoal) setPrimaryGoal(data.suggestedGoal);
      if (data.suggestedPlatforms && data.suggestedPlatforms.length > 0) {
        setSelectedPlatforms(data.suggestedPlatforms);
      }

      if (data.suggestedMilestone) {
        if (data.identityType === "artist" && data.suggestedMilestone.title) {
          setReleaseTitle(data.suggestedMilestone.title);
          if (data.suggestedMilestone.format) setReleaseFormat(data.suggestedMilestone.format);
          if (data.suggestedMilestone.targetDate) setReleaseDate(data.suggestedMilestone.targetDate);
        } else if (data.identityType === "brand" && data.suggestedMilestone.title) {
          setCampaignTitle(data.suggestedMilestone.title);
          if (data.suggestedMilestone.goal) setCampaignGoal(data.suggestedMilestone.goal);
          if (data.suggestedMilestone.targetDate) setCampaignTargetDate(data.suggestedMilestone.targetDate);
        }
      }

      setAiNotice("Creative Brain structured your setup. Review or adjust below.");
    } catch (err: any) {
      console.warn("AI interpretation fallback:", err);
      setAiNotice("Interpreted input based on standard creative framework.");
    } finally {
      setIsInterpreting(false);
    }
  };

  const handleSubmit = async () => {
    if (!workspaceName.trim()) {
      setError("Please provide a name for your creative workspace");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: OnboardingPayload = {
      workspaceId: onboardingOptions.existingWorkspaceId || activeWorkspace?.id,
      identityType: selectedIdentity,
      name: workspaceName.trim(),
      genreOrNiche: genreOrNiche.trim(),
      stage,
      primaryGoal: primaryGoal.trim(),
      targetAudience: targetAudience.trim(),
      positioning: positioning.trim(),
      platforms: selectedPlatforms,
      saveAsMemory: true,
      rawDescription: naturalLanguageInput.trim(),
    };

    if (selectedIdentity === "artist" && releaseTitle.trim()) {
      payload.upcomingRelease = {
        title: releaseTitle.trim(),
        format: releaseFormat,
        releaseDate: releaseDate || undefined,
      };
    } else if (selectedIdentity === "brand" && campaignTitle.trim()) {
      payload.upcomingCampaign = {
        title: campaignTitle.trim(),
        goal: campaignGoal.trim(),
        targetDate: campaignTargetDate || undefined,
      };
    }

    try {
      await completeOnboarding(payload);
    } catch (err: any) {
      setError(err.message || "Failed to finalize workspace setup");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="onboarding-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="onboarding-modal-container"
        className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header Bar */}
        <div className="px-5 sm:px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-bold text-sm">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
                  Keedohub OS Setup
                </span>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                  Step {step} of 4
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100">
                {step === 1 && "What are you building?"}
                {step === 2 && "Identity & Strategic Niche"}
                {step === 3 && "Immediate Milestone & Objectives"}
                {step === 4 && "Review & Deploy Creative Operating System"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-skip-onboarding"
              onClick={closeOnboarding}
              className="text-xs text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors"
            >
              Skip for now
            </button>
            <button
              id="btn-close-onboarding-modal"
              onClick={closeOnboarding}
              className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-900 h-1">
          <div
            className="bg-gradient-to-r from-red-500 to-orange-500 h-1 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-zinc-200 text-sm">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          {/* STEP 1: IDENTITY SELECTION */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-zinc-400 text-xs sm:text-sm">
                Keedohub customizes workstations, content frameworks, and AI workflows for your specific creative identity.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {IDENTITY_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedIdentity === opt.type;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      id={`identity-choice-${opt.type}`}
                      onClick={() => setSelectedIdentity(opt.type)}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between group ${
                        isSelected
                          ? `bg-zinc-900/90 border-red-500 ring-1 ring-red-500/50 shadow-lg shadow-red-500/5`
                          : `bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/70 hover:border-zinc-700`
                      }`}
                    >
                      <div className="flex items-start justify-between w-full mb-3">
                        <div
                          className={`p-2.5 rounded-lg border bg-zinc-950 ${
                            isSelected ? "border-red-500/50 text-red-400" : "border-zinc-800 text-zinc-400 group-hover:text-zinc-200"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                            isSelected
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : "bg-zinc-800/60 text-zinc-400 border-zinc-700/50"
                          }`}
                        >
                          {opt.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-semibold text-zinc-100 text-sm mb-1 group-hover:text-white flex items-center gap-1.5">
                          {opt.title}
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-red-500" />}
                        </h3>
                        <p className="text-zinc-400 text-xs line-clamp-2">{opt.subtitle}</p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-zinc-800/60 flex flex-wrap gap-1.5">
                        {opt.features.map((f, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-zinc-950/80 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800/50"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Natural Language Prompt Assistant */}
              <div className="mt-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Wand2 className="h-3.5 w-3.5 text-orange-400" />
                    Describe what you are building in your own words (Optional)
                  </label>
                  <span className="text-[10px] text-zinc-500">AI Auto-Extraction</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="input-onboarding-natural-language"
                    value={naturalLanguageInput}
                    onChange={(e) => setNaturalLanguageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAiInterpret();
                      }
                    }}
                    placeholder={
                      selectedIdentity === "artist"
                        ? "e.g., I'm an electronic producer dropping a 4-track EP next month with visualizers"
                        : "e.g., Sustainable streetwear brand dropping our winter collection and scaling ads"
                    }
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    id="btn-interpret-onboarding-ai"
                    onClick={handleAiInterpret}
                    disabled={isInterpreting || !naturalLanguageInput.trim()}
                    className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
                  >
                    {isInterpreting ? (
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-red-500 border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                        Interpret
                      </>
                    )}
                  </button>
                </div>
                {aiNotice && (
                  <p className="text-[11px] text-orange-400/90 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3" /> {aiNotice}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PROFILE & NICHE */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Workspace Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="input-workspace-name"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="e.g. Apex Sound Studio, Nova Apparel, TechPulse"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    {selectedIdentity === "artist"
                      ? "Primary Music Genre / Style"
                      : "Industry / Market Category"}
                  </label>
                  <input
                    type="text"
                    id="input-genre-niche"
                    value={genreOrNiche}
                    onChange={(e) => setGenreOrNiche(e.target.value)}
                    placeholder={
                      selectedIdentity === "artist"
                        ? "e.g. Melodic Rap, Afrobeats, Synthwave, Indie Rock"
                        : "e.g. Direct-To-Consumer Apparel, Beauty & Skincare, Tech & SaaS"
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Current Creative Stage</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Building Foundations", desc: "Setting up identity & first assets" },
                    { id: "Emerging & Active", desc: "Actively creating & planning drops" },
                    { id: "Scaling & Professional", desc: "Multi-channel operations & team" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStage(st.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        stage === st.id
                          ? "bg-zinc-900 border-red-500/80 text-white"
                          : "bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900/50"
                      }`}
                    >
                      <div className="font-medium text-xs text-zinc-200">{st.id}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{st.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Target Audience / Core Demographic
                </label>
                <input
                  type="text"
                  id="input-target-audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Gen-Z bedroom music lovers, Early-adopter founders, Fashion enthusiasts aged 18-34"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Primary Channels & Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "spotify",
                    "instagram",
                    "tiktok",
                    "youtube",
                    "twitter",
                    "linkedin",
                    "apple-music",
                    "soundcloud",
                  ].map((p) => {
                    const active = selectedPlatforms.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePlatform(p)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors capitalize ${
                          active
                            ? "bg-red-500/10 border-red-500/40 text-red-400"
                            : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        {p.replace("-", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: IMMEDIATE MILESTONE & VALUE */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-100">Setup your first master entity</h4>
                  <p className="text-[11px] text-zinc-400">
                    Keedohub will generate a live blueprint so your Command Center is immediately actionable.
                  </p>
                </div>
              </div>

              {/* ARTIST SPECIFIC */}
              {selectedIdentity === "artist" && (
                <div className="space-y-3.5 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider">
                    <Disc className="h-4 w-4" /> Next Music Release
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] text-zinc-400">Song / Project Title</label>
                      <input
                        type="text"
                        id="input-release-title"
                        value={releaseTitle}
                        onChange={(e) => setReleaseTitle(e.target.value)}
                        placeholder="e.g. Midnight Drive, After Hours EP"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400">Format</label>
                      <select
                        id="select-release-format"
                        value={releaseFormat}
                        onChange={(e) => setReleaseFormat(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                      >
                        <option value="Single">Single</option>
                        <option value="EP">EP (3-6 tracks)</option>
                        <option value="Album">Album / LP</option>
                        <option value="Mixtape">Mixtape</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400">Target Drop Date (Optional)</label>
                      <input
                        type="date"
                        id="input-release-date"
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400">Primary Release Goal</label>
                      <input
                        type="text"
                        id="input-primary-goal"
                        value={primaryGoal}
                        onChange={(e) => setPrimaryGoal(e.target.value)}
                        placeholder="e.g. 50,000 streams & editorial playlist pitch"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* BRAND SPECIFIC */}
              {selectedIdentity === "brand" && (
                <div className="space-y-3.5 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                    <Building2 className="h-4 w-4" /> Next Marketing Campaign / Drop
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">Campaign Title</label>
                    <input
                      type="text"
                      id="input-campaign-title"
                      value={campaignTitle}
                      onChange={(e) => setCampaignTitle(e.target.value)}
                      placeholder="e.g. Summer Capsule Drop, Rebrand Sprint"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400">Campaign Objective</label>
                      <input
                        type="text"
                        id="input-campaign-goal"
                        value={campaignGoal}
                        onChange={(e) => setCampaignGoal(e.target.value)}
                        placeholder="e.g. Acquire 500 new customers"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400">Target Launch Date</label>
                      <input
                        type="date"
                        id="input-campaign-date"
                        value={campaignTargetDate}
                        onChange={(e) => setCampaignTargetDate(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: REVIEW & DEPLOY */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 via-zinc-900 to-zinc-900 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2 text-red-400 font-semibold text-xs uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" /> Ready to initialize your OS
                </div>
                <h3 className="text-base font-bold text-zinc-100 mb-1">
                  {workspaceName || "My Creative OS"}
                </h3>
                <p className="text-xs text-zinc-400">
                  Configured as <span className="text-zinc-200 font-semibold uppercase">{selectedIdentity}</span> • {genreOrNiche || "General"}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-300">What Keedohub will configure:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-zinc-200">Identity Content Pillars</div>
                      <div className="text-[10px] text-zinc-400">4 custom pillars mapped for high audience retention</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-zinc-200">Creative Memory Core</div>
                      <div className="text-[10px] text-zinc-400">Persists your rules, goals, and tone across all AI modules</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-zinc-200">
                        {selectedIdentity === "artist" ? "Release Readiness Matrix" : "Master Sprint Blueprint"}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {releaseTitle || campaignTitle || projectTitle || mainOffer || "Actionable starter workflow"}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-zinc-200">Command Center Personalization</div>
                      <div className="text-[10px] text-zinc-400">Dynamic readiness score, priority tasks, and radar feed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-5 sm:px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                id="btn-onboarding-back"
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
            ) : (
              <span className="text-[11px] text-zinc-500 hidden sm:inline">
                You can adjust settings anytime in your Workspace Config.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step < 4 ? (
              <button
                type="button"
                id="btn-onboarding-next"
                onClick={() => {
                  if (step === 2 && !workspaceName.trim()) {
                    setWorkspaceName(user?.fullName ? `${user.fullName}'s OS` : `${(selectedIdentity || "creative").toUpperCase()} OS`);
                  }
                  setStep((prev) => (prev + 1) as any);
                }}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-red-600/20 transition-colors"
              >
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                id="btn-onboarding-finish"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-bold flex items-center gap-2 shadow-xl shadow-red-500/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                    Initializing Operating System...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Launch Creative OS
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
