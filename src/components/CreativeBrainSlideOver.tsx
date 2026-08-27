import React, { useState, useRef, useEffect } from "react";
import { useCreativeBrain } from "../context/CreativeBrainContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { ActiveTab, CreativeBrainRecommendation } from "../types";
import {
  X,
  Sparkles,
  Send,
  BrainCircuit,
  ArrowUpRight,
  RotateCcw,
  Layers,
  CheckCircle2,
  Pin,
  Flame,
  AlertTriangle,
  Lightbulb,
  Play,
  Calendar,
  Disc3,
  Megaphone,
  Briefcase,
  Zap,
} from "lucide-react";

interface CreativeBrainSlideOverProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export function CreativeBrainSlideOver({ setActiveTab }: CreativeBrainSlideOverProps) {
  const {
    isOpen,
    closeBrain,
    messages,
    isThinking,
    askBrain,
    clearHistory,
    pinnedContext,
    clearPinnedContext,
    recommendations,
    isLoadingRecs,
    executeAction,
  } = useCreativeBrain();

  const { workspace, projects, releases, campaigns, assets } = useWorkspace();
  const [activeBrainView, setActiveBrainView] = useState<"chat" | "recommendations">("chat");
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && activeBrainView === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isThinking, activeBrainView]);

  if (!isOpen) return null;

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
      closeBrain();
    }
  };

  const quickPrompts = pinnedContext
    ? [
        `Audit readiness blockers for ${pinnedContext.title}`,
        `Create next urgent task for this`,
        `Generate high-impact content hooks for this`,
        `What is the next critical milestone?`,
      ]
    : workspace?.identityType === "artist"
    ? [
        "What am I missing before my release?",
        "Audit master audio and artwork specifications",
        "How should I pitch to Spotify editorial curators?",
        "Generate 3 viral TikTok audio hooks",
      ]
    : [
        "Is my campaign ready for launch?",
        "What should we prioritize this week?",
        "Generate creative direction for our flagship product",
        "Create task: Review Q3 performance analytics",
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-fade-in flex justify-end">
      <div
        className="w-full max-w-xl bg-zinc-950 border-l border-zinc-800 flex flex-col h-full shadow-2xl animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-800 flex items-center justify-center text-white shadow-lg shadow-red-950/50">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">Keedohub Creative Brain</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wide">
                  Intelligence OS
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate max-w-[280px]">
                {workspace?.name} • {workspace?.identityType?.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab("creative-brain");
                closeBrain();
              }}
              title="Open full-screen Brain Console workstation"
              className="px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 rounded-lg border border-zinc-700/60 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Full Console</span>
            </button>
            <button
              onClick={clearHistory}
              title="Reset context conversation"
              className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={closeBrain}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center border-b border-zinc-800 bg-zinc-900/40 px-4">
          <button
            onClick={() => setActiveBrainView("chat")}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeBrainView === "chat"
                ? "border-red-500 text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Chat & Operations
          </button>
          <button
            onClick={() => setActiveBrainView("recommendations")}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeBrainView === "recommendations"
                ? "border-red-500 text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Live Blockers & Recs</span>
            {recommendations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {recommendations.length}
              </span>
            )}
          </button>
        </div>

        {/* Pinned Context Banner (if any) */}
        {pinnedContext && (
          <div className="px-4 py-2 bg-red-950/30 border-b border-red-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Pin className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="text-zinc-400">Pinned Context:</span>
              <strong className="text-zinc-100 truncate">{pinnedContext.title}</strong>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                {pinnedContext.type}
              </span>
            </div>
            <button
              onClick={clearPinnedContext}
              className="text-xs text-zinc-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        {/* Context Summary Strip */}
        <div className="px-4 py-2 bg-zinc-900/30 border-b border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 overflow-x-auto gap-4">
          <div className="flex items-center gap-1.5 shrink-0">
            <Layers className="w-3.5 h-3.5 text-red-400" />
            <span>
              Release: <strong className="text-zinc-200">{releases[0]?.title || "None scheduled"}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span>Projects: <strong className="text-zinc-200">{projects.length}</strong></span>
            <span>Vault: <strong className="text-zinc-200">{assets.length}</strong></span>
          </div>
        </div>

        {/* Main Content Area */}
        {activeBrainView === "chat" ? (
          <>
            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[92%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-red-600 text-white rounded-br-none shadow-md shadow-red-950/40"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {/* Render message body with structured paragraphs */}
                    <div className="whitespace-pre-wrap space-y-1.5">
                      {msg.text}
                    </div>

                    {/* Executed Action Receipts (Real Server Tools) */}
                    {msg.executedActions && msg.executedActions.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-zinc-800 space-y-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Real Action Executed on Server</span>
                        </div>
                        {msg.executedActions.map((act) => (
                          <div
                            key={act.id}
                            className="p-2.5 rounded-xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-zinc-100 truncate">{act.actionSummary}</p>
                              <span className="text-[10px] text-zinc-400">ID: {act.entityId} • Status: {act.status}</span>
                            </div>
                            <button
                              onClick={() => {
                                setActiveTab(act.actionTab as ActiveTab);
                                closeBrain();
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 transition-colors shrink-0 cursor-pointer"
                            >
                              <span>{act.actionLabel}</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggested Action Buttons */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-wrap gap-1.5">
                        {msg.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setActiveTab(action.actionTab as ActiveTab);
                              closeBrain();
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-red-600/80 text-[11px] font-semibold text-zinc-200 hover:text-white border border-zinc-700/60 transition-all cursor-pointer"
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
                <div className="flex items-center gap-2.5 p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl max-w-[240px] text-xs text-zinc-300 shadow-md animate-pulse">
                  <Sparkles className="w-4 h-4 text-red-500 animate-spin" />
                  <span>Synthesizing workspace context & tools...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="p-3 bg-zinc-900/30 border-t border-zinc-800/60 overflow-x-auto flex gap-1.5 no-scrollbar">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => askBrain(prompt)}
                  disabled={isThinking}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] text-zinc-300 border border-zinc-800 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3.5 border-t border-zinc-800 bg-zinc-900/80 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  pinnedContext
                    ? `Ask Brain about ${pinnedContext.title}...`
                    : "Ask Creative Brain (e.g. 'What am I missing before my release?' or 'Create task: ...')"
                }
                className="flex-1 px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-red-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-red-950/50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          /* Recommendations View */
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Workspace Strategic Blockers ({recommendations.length})
              </h4>
              <span className="text-[11px] text-zinc-500">Real-time 7-Pillar Evaluation</span>
            </div>

            {isLoadingRecs ? (
              <div className="p-8 text-center text-zinc-500 text-xs flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-red-500 animate-spin" />
                <span>Auditing workspace readiness...</span>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">All Operational Pillars Cleared</h4>
                <p className="text-xs text-zinc-400">
                  No blocking readiness gaps detected in releases, campaigns, or projects.
                </p>
              </div>
            ) : (
              recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {rec.priority === "critical" ? (
                        <span className="p-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          <Flame className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="p-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <div>
                        <h5 className="text-xs font-bold text-white">{rec.title}</h5>
                        <span className="text-[10px] text-zinc-400 font-mono uppercase">{rec.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
                    <p className="text-zinc-300">
                      <strong className="text-zinc-400">Missing:</strong> {rec.whatIsMissing}
                    </p>
                    <p className="text-zinc-400 text-[11px]">
                      <strong className="text-zinc-500">Why it matters:</strong> {rec.whyItMatters}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-zinc-400">{rec.recommendedAction}</span>
                    <button
                      onClick={() => handleExecuteRec(rec)}
                      className="px-2.5 py-1 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-sm shadow-red-950/40"
                    >
                      <span>{rec.executableTool ? "Execute with Brain" : rec.actionLabel}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
