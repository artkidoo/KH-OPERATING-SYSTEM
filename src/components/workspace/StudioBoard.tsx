import React, { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../context/AuthContext";
import {
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  Bell,
  Layers,
  ArrowUpRight,
  ThumbsUp,
  RotateCcw,
} from "lucide-react";

interface AgencyNote {
  id: string;
  sender: string;
  avatar: string;
  role: string;
  message: string;
  timestamp: string;
  tag: string;
}

export function StudioBoard({
  onNotify,
}: {
  onNotify: (m: string, t?: "success" | "info" | "error") => void;
}) {
  const { assets, projects, releases, creativeRequests } = useWorkspace();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"activity" | "notes">("notes");
  const [commentInput, setCommentInput] = useState("");

  const [notes, setNotes] = useState<AgencyNote[]>([
    {
      id: "note-1",
      sender: "Keedo (Creative Director)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      role: "KeedoHub Lead",
      message: "Master artwork typography rendered with high-contrast amber foil accents. Color profile calibrated for Spotify & Apple Music.",
      timestamp: "Today at 10:45 AM",
      tag: "Design Review",
    },
    {
      id: "note-2",
      sender: "Sarah O. (Production Lead)",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      role: "Motion Design",
      message: "Vertical 9:16 motion teasers ready for TikTok & Reels staging. Check the Creative Package tab for downloads.",
      timestamp: "Yesterday",
      tag: "Assets Ready",
    },
  ]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newNote: AgencyNote = {
      id: `note-${Date.now()}`,
      sender: user?.name || "Client Feedback",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      role: "Client",
      message: commentInput.trim(),
      timestamp: "Just now",
      tag: "Feedback",
    };

    setNotes([newNote, ...notes]);
    setCommentInput("");
    onNotify("Feedback logged to Studio collaboration board.", "success");
  };

  const pendingApprovals = assets.filter((a) => a.status === "review" || a.status === "in_review").length;
  const activeRequests = creativeRequests.filter((r) => r.lifecycleStatus !== "DELIVERED").length;

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-4 shadow-lg backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Studio Collaboration</h3>
            <p className="text-[10px] text-zinc-500">Agency Notes & Feedback</p>
          </div>
        </div>

        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Studio Online
        </span>
      </div>

      {/* Production Quick Tracker */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-2.5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase block">Pending Review</span>
          <span className="text-sm font-bold text-amber-400 mt-0.5 block">
            {pendingApprovals} Assets
          </span>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-2.5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase block">In Production</span>
          <span className="text-sm font-bold text-white mt-0.5 block">
            {activeRequests} Requests
          </span>
        </div>
      </div>

      {/* Notes Stream */}
      <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
        {notes.map((n) => (
          <div
            key={n.id}
            className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-3 space-y-1.5 transition-all hover:border-zinc-700"
          >
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <img
                  src={n.avatar}
                  alt={n.sender}
                  className="h-5 w-5 rounded-full object-cover border border-white/10"
                />
                <span className="text-[11px] font-bold text-zinc-200 truncate max-w-[120px]">
                  {n.sender}
                </span>
              </div>
              <span className="text-[9px] font-bold uppercase rounded-md bg-red-500/10 text-red-400 px-1.5 py-0.5">
                {n.tag}
              </span>
            </div>

            <p className="text-[11px] text-zinc-300 leading-relaxed">{n.message}</p>
            <span className="text-[9px] font-mono text-zinc-500 block text-right">
              {n.timestamp}
            </span>
          </div>
        ))}
      </div>

      {/* Direct Feedback Input */}
      <form onSubmit={handlePostComment} className="pt-1 space-y-2">
        <div className="relative">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Send note to KeedoHub production team..."
            className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 pl-3 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
