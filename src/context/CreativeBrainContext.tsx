import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useWorkspace } from "./WorkspaceContext";
import { api } from "../services/api";
import { BrainActionReceipt, PinnedBrainContext, CreativeBrainRecommendation } from "../types";

export interface BrainMessage {
  id: string;
  sender: "user" | "brain";
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; actionTab: string }[];
  executedActions?: BrainActionReceipt[];
  contextAnalyzed?: any;
  pinnedContext?: PinnedBrainContext;
}

interface CreativeBrainContextType {
  isOpen: boolean;
  isThinking: boolean;
  messages: BrainMessage[];
  pinnedContext: PinnedBrainContext | null;
  recommendations: CreativeBrainRecommendation[];
  isLoadingRecs: boolean;
  openBrain: () => void;
  closeBrain: () => void;
  toggleBrain: () => void;
  openWithContext: (ctx: PinnedBrainContext, initialPrompt?: string) => void;
  setPinnedContext: (ctx: PinnedBrainContext | null) => void;
  clearPinnedContext: () => void;
  askBrain: (prompt: string, overrideContext?: PinnedBrainContext) => Promise<void>;
  executeAction: (toolName: string, args: Record<string, any>) => Promise<BrainActionReceipt | null>;
  fetchRecommendations: () => Promise<void>;
  clearHistory: () => void;
}

const CreativeBrainContext = createContext<CreativeBrainContextType | undefined>(undefined);

export function CreativeBrainProvider({ children }: { children: ReactNode }) {
  const { workspace, fetchWorkspaceData } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [pinnedContext, setPinnedContextState] = useState<PinnedBrainContext | null>(null);
  const [recommendations, setRecommendations] = useState<CreativeBrainRecommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  const [messages, setMessages] = useState<BrainMessage[]>([
    {
      id: "init_msg",
      sender: "brain",
      text: "⚡ **Keedohub Creative Brain Active**.\n\nI have indexed your workspace, active release blueprint, creative memory tokens, and asset vault. How can I direct your creative operations today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestedActions: [
        { label: "Audit Release Readiness", actionTab: "artist-brain" },
        { label: "Design Master Artwork", actionTab: "cover-studio" },
        { label: "Verify Audio Mastering", actionTab: "mastering-suite" },
      ],
    },
  ]);

  const openBrain = () => setIsOpen(true);
  const closeBrain = () => setIsOpen(false);
  const toggleBrain = () => setIsOpen((prev) => !prev);

  const setPinnedContext = (ctx: PinnedBrainContext | null) => {
    setPinnedContextState(ctx);
  };

  const clearPinnedContext = () => {
    setPinnedContextState(null);
  };

  const fetchRecommendations = useCallback(async () => {
    if (!workspace?.id) return;
    setIsLoadingRecs(true);
    try {
      const res = await api.ai.getRecommendations(workspace.id);
      if (res && Array.isArray(res.recommendations)) {
        setRecommendations(res.recommendations);
      } else {
        setRecommendations([]);
      }
    } catch {
      // Graceful fallback for offline / preview transitions
      const fallbackRecs: CreativeBrainRecommendation[] = [];
      if (workspace.identityType === 'artist') {
        fallbackRecs.push({
          id: `rec_fallback_art`,
          title: "Complete 3000x3000px Cover Artwork",
          category: "Release Blocker",
          priority: "high",
          whatIsMissing: "High-resolution master cover visual",
          whyItMatters: "DSP platforms require strict 3000x3000px uncompressed artwork",
          recommendedAction: "Design in Cover Studio",
          actionTab: "cover-studio",
          actionLabel: "Design in Cover Studio",
        });
      } else {
        fallbackRecs.push({
          id: `rec_fallback_brand`,
          title: "Establish Brand Visual Direction",
          category: "Campaign Blocker",
          priority: "high",
          whatIsMissing: "Brand design tokens & campaign assets",
          whyItMatters: "Visual consistency drives audience trust and campaign conversion",
          recommendedAction: "Define in Brand OS",
          actionTab: "brand-os",
          actionLabel: "Open Brand OS",
        });
      }
      setRecommendations(fallbackRecs);
    } finally {
      setIsLoadingRecs(false);
    }
  }, [workspace]);

  useEffect(() => {
    if (workspace?.id) {
      fetchRecommendations();
    }
  }, [workspace?.id, fetchRecommendations]);

  const openWithContext = (ctx: PinnedBrainContext, initialPrompt?: string) => {
    setPinnedContextState(ctx);
    setIsOpen(true);
    if (initialPrompt) {
      askBrain(initialPrompt, ctx);
    }
  };

  const askBrain = async (prompt: string, overrideContext?: PinnedBrainContext) => {
    if (!prompt.trim() || !workspace) return;

    const activeCtx = overrideContext || pinnedContext;

    const userMsg: BrainMessage = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      sender: "user",
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      pinnedContext: activeCtx || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const res = await api.ai.creativeBrain(
        workspace.id,
        prompt,
        messages.slice(-6),
        activeCtx || undefined
      );

      const brainMsg: BrainMessage = {
        id: "brn_" + Math.random().toString(36).substring(2, 9),
        sender: "brain",
        text: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedActions: res.suggestedActions,
        executedActions: res.executedActions,
        contextAnalyzed: res.contextAnalyzed,
        pinnedContext: activeCtx || undefined,
      };

      setMessages((prev) => [...prev, brainMsg]);

      // If any actions were executed, refresh workspace state & recommendations
      if (res.executedActions && res.executedActions.length > 0) {
        if (fetchWorkspaceData) fetchWorkspaceData();
        fetchRecommendations();
      }
    } catch (err: any) {
      const errorMsg: BrainMessage = {
        id: "err_" + Math.random().toString(36).substring(2, 9),
        sender: "brain",
        text: `⚠️ **Execution Notice**: Could not complete reasoning pass (${err.message || "Network timeout"}). Workspace data remains secure.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const executeAction = async (toolName: string, args: Record<string, any>): Promise<BrainActionReceipt | null> => {
    if (!workspace) return null;
    setIsThinking(true);
    try {
      const res = await api.ai.executeAction(workspace.id, toolName, args);
      const receipt = res.receipt;

      const brainMsg: BrainMessage = {
        id: "brn_act_" + Math.random().toString(36).substring(2, 9),
        sender: "brain",
        text: `⚡ **Action Executed Successfully**\n\n- ${receipt.actionSummary}\n- Target Workstation: **${receipt.actionLabel}**`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        executedActions: [receipt],
      };

      setMessages((prev) => [...prev, brainMsg]);

      if (fetchWorkspaceData) fetchWorkspaceData();
      fetchRecommendations();

      return receipt;
    } catch (err: any) {
      const errorMsg: BrainMessage = {
        id: "err_act_" + Math.random().toString(36).substring(2, 9),
        sender: "brain",
        text: `⚠️ **Action Failed**: ${err.message || "Could not execute tool."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      return null;
    } finally {
      setIsThinking(false);
    }
  };

  const clearHistory = () => {
    setMessages([
      {
        id: "reset_msg",
        sender: "brain",
        text: "⚡ **Keedohub Creative Brain Reset**.\n\nContext re-indexed for your active workspace. What are we building next?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <CreativeBrainContext.Provider
      value={{
        isOpen,
        isThinking,
        messages,
        pinnedContext,
        recommendations,
        isLoadingRecs,
        openBrain,
        closeBrain,
        toggleBrain,
        openWithContext,
        setPinnedContext,
        clearPinnedContext,
        askBrain,
        executeAction,
        fetchRecommendations,
        clearHistory,
      }}
    >
      {children}
    </CreativeBrainContext.Provider>
  );
}

export function useCreativeBrain() {
  const context = useContext(CreativeBrainContext);
  if (!context) {
    throw new Error("useCreativeBrain must be used within a CreativeBrainProvider");
  }
  return context;
}
