import React, { useState } from "react";
import { useCreativeBrain } from "../context/CreativeBrainContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { ActiveTab, CreativeBrainRecommendation } from "../types";
import {
  BrainCircuit,
  Sparkles,
  Send,
  Pin,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  RotateCcw,
  Layers,
  Disc3,
  Megaphone,
  Briefcase,
  Lightbulb,
  ShieldCheck,
  Zap,
  Plus,
  Compass,
  FileCheck,
  Palette,
  Music,
  Share2,
  Calendar,
  CheckSquare,
  Sliders,
} from "lucide-react";

interface CreativeBrainConsoleProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export function CreativeBrainConsole({ setActiveTab }: CreativeBrainConsoleProps) {
  const {
    messages,
    isThinking,
    askBrain,
    clearHistory,
    pinnedContext,
    setPinnedContext,
    clearPinnedContext,
    recommendations,
    isLoadingRecs,
    executeAction,
  } = useCreativeBrain();

  const {
    workspace,
    projects,
    releases,
    activeRelease,
    campaigns,
    activeCampaign,
    assets,
    creativeMemory,
    contentItems,
    calculateReleaseReadiness,
    calculateCampaignReadiness,
  } = useWorkspace();

  const activeRelReadiness = calculateReleaseReadiness(activeRelease);
  const activeCmpReadiness = calculateCampaignReadiness(activeCampaign);

  const [input, setInput] = useState("");
  const [activeRightTab, setActiveRightTab] = useState<"recommendations" | "memory" | "pillars">("recommendations");
  const [quickActionModal, setQuickActionModal] = useState<string | null>(null);

  // Quick Action Form States
  const [taskText, setTaskText] = useState("");
  const [taskCategory, setTaskCategory] = useState("General");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high" | "urgent">("high");

  const [memoryDecision, setMemoryDecision] = useState("");
  const [memoryCategory, setMemoryCategory] = useState("Creative Direction");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    const msg = input;
    setInput("");
    await askBrain(msg);
  };

  const handleExecuteRec = async (rec: CreativeBrainRecommendation) => {
    if (rec.executableTool) {
      await executeAction(rec.executableTool.toolName, rec.executableTool.args);
    } else {
      setActiveTab(rec.actionTab);
    }
  };

  const handleCreateQuickTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    await executeAction("create_task", {
      text: taskText,
      category: taskCategory,
      priority: taskPriority,
    });
    setTaskText("");
    setQuickActionModal(null);
  };

  const handleSaveDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryDecision.trim()) return;
    await executeAction("save_creative_memory", {
      keyDecision: memoryDecision,
    });
    setMemoryDecision("");
    setQuickActionModal(null);
  };

  const personaPrompts =
    workspace?.identityType === "artist"
      ? [
          { label: "Audit Release Blockers", prompt: "What am I missing before my release? Audit all 7 readiness pillars." },
          { label: "Generate TikTok Hooks", prompt: "Generate 3 high-impact TikTok sound memo concepts for my upcoming single." },
          { label: "DSP Pitch Letter", prompt: "Write an editorial pitch note for Spotify and Apple Music curators focusing on my sonic mood." },
          { label: "Split Sheet Check", prompt: "What splits and metadata do I need to register before drop day?" },
        ]
      : workspace?.identityType === "brand" || workspace?.identityType === "business"
      ? [
          { label: "Campaign Launch Audit", prompt: "Is my campaign ready for launch? Check all 7 campaign readiness pillars." },
          { label: "Generate Sprint Plan", prompt: "Build a 7-day high-velocity sprint content plan for our flagship product." },
          { label: "Creative Positioning", prompt: "How should we differentiate our product positioning against legacy alternatives?" },
          { label: "Ad Copy Angles", prompt: "Generate 4 high-converting headline hooks tailored to our target persona." },
        ]
      : [
          { label: "Content Calendar Audit", prompt: "What high-retention content items should I film this week?" },
          { label: "Brand Collaboration Angle", prompt: "How should I structure my media kit proposal for incoming sponsors?" },
          { label: "Vault Organization", prompt: "How can I better tag and repurpose my visual assets across platforms?" },
          { label: "Weekly Priority Check", prompt: "What are my top 3 highest priority tasks across active projects?" },
        ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Console Bar */}
      <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-900 flex items-center justify-center text-white shadow-lg shadow-red-950/60 shrink-0">
            <BrainCircuit className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Creative Brain Console</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase">
                {workspace?.identityType || "General"} Core
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Autonomous Intelligence Engine operating over your real workspace files, releases, campaigns, and creative memory.
            </p>
          </div>
        </div>

        {/* Global Quick Action Triggers */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setQuickActionModal("task")}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/60 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-red-400" />
            <span>New Task</span>
          </button>
          <button
            onClick={() => setQuickActionModal("decision")}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/60 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Log Decision</span>
          </button>
          <button
            onClick={clearHistory}
            className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-medium border border-zinc-700/50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Context</span>
          </button>
        </div>
      </div>

      {/* 3-Column Layout: Left (Context Directory), Center (AI Reasoning Thread), Right (Blockers & Memory) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Workspace Intelligence Directory (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Context Card */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-red-400" />
                <span>Pinned Context</span>
              </h3>
              {pinnedContext && (
                <button
                  onClick={clearPinnedContext}
                  className="text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {pinnedContext ? (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Pin className="w-3 h-3 text-red-400 shrink-0" />
                  <span className="text-xs font-bold text-white truncate">{pinnedContext.title}</span>
                </div>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-300">
                  {pinnedContext.type}
                </span>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Brain answers will prioritize this specific entity.
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">
                No specific entity pinned. Operating across entire workspace.
              </p>
            )}
          </div>

          {/* Releases (Artist OS) */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Disc3 className="w-3.5 h-3.5 text-red-400" />
                <span>Releases ({releases.length})</span>
              </h3>
              <button
                onClick={() => setActiveTab("artist-brain")}
                className="text-[11px] text-red-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {releases.length === 0 ? (
              <p className="text-xs text-zinc-500">No releases scheduled.</p>
            ) : (
              <div className="space-y-2">
                {releases.map((rel) => {
                  const isPinned = pinnedContext?.id === rel.id;
                  const relSummary = calculateReleaseReadiness(rel);
                  const readinessScore = relSummary?.score ?? 0;
                  return (
                    <div
                      key={rel.id}
                      onClick={() => setPinnedContext({ type: "release", id: rel.id, title: rel.title })}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isPinned
                          ? "bg-red-950/20 border-red-500/50 shadow-sm"
                          : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-zinc-200 truncate">{rel.title}</h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                          {readinessScore}%
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {rel.artistName} • {rel.releaseDate || "No date"}
                      </p>
                      <div className="w-full bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            readinessScore >= 80 ? "bg-emerald-500" : readinessScore >= 50 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${readinessScore}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Campaigns (Brand/Business OS) */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Campaigns ({campaigns.length})</span>
              </h3>
              <button
                onClick={() => setActiveTab("brand-os")}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {campaigns.length === 0 ? (
              <p className="text-xs text-zinc-500">No campaigns launched.</p>
            ) : (
              <div className="space-y-2">
                {campaigns.map((cmp) => {
                  const isPinned = pinnedContext?.id === cmp.id;
                  const cmpSummary = calculateCampaignReadiness(cmp);
                  const readinessScore = cmpSummary?.score ?? 0;
                  return (
                    <div
                      key={cmp.id}
                      onClick={() => setPinnedContext({ type: "campaign", id: cmp.id, title: cmp.title })}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isPinned
                          ? "bg-amber-950/20 border-amber-500/50 shadow-sm"
                          : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-zinc-200 truncate">{cmp.title}</h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                          {readinessScore}%
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {cmp.objective} • Sprint {cmp.sprintDays?.length || 0}d
                      </p>
                      <div className="w-full bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            readinessScore >= 80 ? "bg-emerald-500" : readinessScore >= 50 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${readinessScore}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Projects */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                <span>Projects ({projects.length})</span>
              </h3>
              <button
                onClick={() => setActiveTab("project-console")}
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Console</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5">
              {projects.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPinnedContext({ type: "project", id: p.id, title: p.title })}
                  className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="min-w-0">
                    <h5 className="text-xs font-semibold text-zinc-200 truncate">{p.title}</h5>
                    <span className="text-[10px] text-zinc-400">{p.tasks.length} tasks • {p.status}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    p.priority === 'urgent' ? 'bg-rose-500/20 text-rose-400' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {p.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Autonomous AI Reasoning & Operational Console (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col h-[700px] shadow-xl overflow-hidden">
            {/* Thread Header */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Operations Stream
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {messages.length} messages in context buffer
              </span>
            </div>

            {/* Chat Thread Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[92%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-red-600 text-white rounded-br-none shadow-md shadow-red-950/40"
                        : "bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap space-y-2">
                      {msg.text}
                    </div>

                    {/* Executed Action Receipts */}
                    {msg.executedActions && msg.executedActions.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-zinc-800 space-y-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Action Executed on Server</span>
                        </div>
                        {msg.executedActions.map((act) => (
                          <div
                            key={act.id}
                            className="p-2.5 rounded-xl bg-zinc-900 border border-emerald-500/30 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-zinc-100 truncate">{act.actionSummary}</p>
                              <span className="text-[10px] text-zinc-400">ID: {act.entityId}</span>
                            </div>
                            <button
                              onClick={() => setActiveTab(act.actionTab as ActiveTab)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 transition-colors shrink-0 cursor-pointer"
                            >
                              <span>{act.actionLabel}</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggested Action Navigation Chips */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-wrap gap-1.5">
                        {msg.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveTab(action.actionTab as ActiveTab)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-red-600/80 text-[11px] font-semibold text-zinc-200 hover:text-white border border-zinc-700/60 transition-all cursor-pointer"
                          >
                            <span>{action.label}</span>
                            <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2.5 p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl max-w-[280px] text-xs text-zinc-300 shadow-md animate-pulse">
                  <Sparkles className="w-4 h-4 text-red-500 animate-spin" />
                  <span>Evaluating workspace state & tools...</span>
                </div>
              )}
            </div>

            {/* Persona Quick Prompts */}
            <div className="p-3 bg-zinc-950/70 border-t border-zinc-800 overflow-x-auto flex gap-2 no-scrollbar">
              {personaPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => askBrain(p.prompt)}
                  disabled={isThinking}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs border border-zinc-800 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input Formulation */}
            <form onSubmit={handleSend} className="p-4 border-t border-zinc-800 bg-zinc-900 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  pinnedContext
                    ? `Instruct Brain regarding ${pinnedContext.title}...`
                    : "Ask or instruct Creative Brain (e.g. 'Create task: Pitch to playlists', 'Audit missing assets')..."
                }
                className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-xl disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-red-950/60"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Blockers, 7-Pillars & Creative Memory (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Sub-Tabs */}
          <div className="p-1 bg-zinc-900 rounded-xl border border-zinc-800 grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveRightTab("recommendations")}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeRightTab === "recommendations"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Blockers ({recommendations.length})
            </button>
            <button
              onClick={() => setActiveRightTab("pillars")}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeRightTab === "pillars"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              7 Pillars
            </button>
            <button
              onClick={() => setActiveRightTab("memory")}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeRightTab === "memory"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Memory
            </button>
          </div>

          {/* TAB 1: Real Strategic Blockers */}
          {activeRightTab === "recommendations" && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Priority Action Items
                </h3>
                <span className="text-[10px] text-zinc-500">Live DB Audit</span>
              </div>

              {isLoadingRecs ? (
                <div className="p-8 text-center text-zinc-500 text-xs flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-500 animate-spin" />
                  <span>Evaluating blockers...</span>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800/80 text-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-white">All Pillars Cleared</h4>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    No critical blockers detected across active releases or campaigns.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {rec.priority === "critical" ? (
                            <span className="p-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              <Flame className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="p-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              <AlertTriangle className="w-3 h-3" />
                            </span>
                          )}
                          <div>
                            <h5 className="text-xs font-bold text-white truncate max-w-[170px]">{rec.title}</h5>
                            <span className="text-[10px] text-zinc-500 uppercase font-mono">{rec.category}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-300">
                        <strong className="text-zinc-400">Missing:</strong> {rec.whatIsMissing}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => handleExecuteRec(rec)}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-sm shadow-red-950/40"
                        >
                          <span>{rec.executableTool ? "Resolve with Brain" : rec.actionLabel}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 7 Readiness Pillars Overview */}
          {activeRightTab === "pillars" && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  7-Pillar Source of Truth
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Unified compliance benchmark across Artist & Brand workspaces.
                </p>
              </div>

              {/* Artist Release Pillars */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-200">Release Blueprint</span>
                  <span className="font-mono text-zinc-400">{activeRelReadiness?.score ?? 0}%</span>
                </div>
                <div className="space-y-1.5">
                  {(activeRelReadiness?.requirements || []).map((p) => (
                    <div
                      key={p.id}
                      className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        {p.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-zinc-600" />
                        )}
                        <span className={p.completed ? "text-zinc-200" : "text-zinc-400"}>{p.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{p.weight}pts</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Campaign Pillars */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-200">Campaign Blueprint</span>
                  <span className="font-mono text-zinc-400">{activeCmpReadiness?.score ?? 0}%</span>
                </div>
                <div className="space-y-1.5">
                  {(activeCmpReadiness?.requirements || []).map((p) => (
                    <div
                      key={p.id}
                      className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        {p.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-zinc-600" />
                        )}
                        <span className={p.completed ? "text-zinc-200" : "text-zinc-400"}>{p.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{p.weight}pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Codified Creative Memory */}
          {activeRightTab === "memory" && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-red-400" />
                  <span>Creative Memory</span>
                </h3>
                <span className="text-[10px] text-zinc-500">Persistent Tokens</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Core Narrative</span>
                  <p className="text-zinc-300 mt-1">{creativeMemory?.coreNarrative || "N/A"}</p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Tone Traits</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {creativeMemory?.toneTraits?.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 text-[11px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Visual Rules</span>
                  <ul className="list-disc list-inside text-zinc-300 mt-1 space-y-0.5 text-[11px]">
                    {creativeMemory?.visualRules?.slice(0, 3).map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>

                {creativeMemory?.keyDecisions && creativeMemory.keyDecisions.length > 0 && (
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Key Creative Decisions</span>
                    <ul className="space-y-1 mt-1 text-[11px] text-zinc-300">
                      {creativeMemory.keyDecisions.slice(-3).map((d) => (
                        <li key={d.id} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                          <span>{d.decision}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QUICK ACTION MODAL: Task Form */}
      {quickActionModal === "task" && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New Workspace Task</h3>
            <form onSubmit={handleCreateQuickTask} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Task Deliverable</label>
                <input
                  type="text"
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  placeholder="e.g. Render 3000x3000px streaming cover"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Category</label>
                  <input
                    type="text"
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickActionModal(null)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-md shadow-red-950/50"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ACTION MODAL: Decision Form */}
      {quickActionModal === "decision" && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Log Creative Decision into Memory</h3>
            <form onSubmit={handleSaveDecision} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Decision / Rule</label>
                <textarea
                  value={memoryDecision}
                  onChange={(e) => setMemoryDecision(e.target.value)}
                  placeholder="e.g. Always use high-contrast grain filter and crimson accents on drop campaigns"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 h-20"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickActionModal(null)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-md shadow-red-950/50"
                >
                  Save to Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
