import React, { useState, useEffect } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../context/AuthContext";
import { memoryOptedOut, setMemoryOptOut, clearWorkspaceMemory } from "../../domain/memoryEngine";
import {
  BrainCircuit,
  ShieldCheck,
  Trash2,
  Edit2,
  Check,
  Eye,
  Sparkles,
  Palette,
  Layers,
  FileText,
} from "lucide-react";

export function MemoryPanel({
  onNotify,
}: {
  onNotify?: (m: string, t?: "success" | "info" | "error") => void;
}) {
  const { activeWorkspace } = useAuth();
  const {
    assets,
    projects,
    creativeRequests,
    businessDocuments,
    releases,
    brandCore,
    saveBrandCore,
  } = useWorkspace();

  const wsId = activeWorkspace?.id || "";
  const [off, setOff] = useState(wsId ? memoryOptedOut(wsId) : false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable memory fields
  const [bioMemory, setBioMemory] = useState(
    brandCore?.tagline || "Visionary African storytelling blending authentic street identity with global sound."
  );
  const [voiceMemory, setVoiceMemory] = useState(
    (brandCore?.voiceAndTone?.traits || ["Confident", "Minimalist", "Soulful", "Editorial"]).join(", ")
  );
  const [directionMemory, setDirectionMemory] = useState(
    "Cinematic warm amber dawn against urban silhouettes. High-contrast typography with clean framing."
  );
  const [audienceMemory, setAudienceMemory] = useState(
    "Global diaspora, indie tastemakers, afro-fusion enthusiasts ages 18-35."
  );

  useEffect(() => {
    setOff(wsId ? memoryOptedOut(wsId) : false);
  }, [wsId]);

  const colors = Array.from(
    new Set((brandCore?.colorPalette || []).map((c: { hex: string }) => c.hex))
  ).slice(0, 6);

  const approved = assets.filter(
    (a) => a.status === "approved" || (a.metadata as any)?.approved
  ).slice(0, 4);

  const handleSaveMemory = async () => {
    try {
      await saveBrandCore({
        tagline: bioMemory,
        voiceAndTone: {
          traits: voiceMemory.split(",").map((s) => s.trim()).filter(Boolean),
        },
      } as never);
      setIsEditing(false);
      if (onNotify) onNotify("Workspace memory entries updated.", "success");
    } catch {
      if (onNotify) onNotify("Failed to save memory entries.", "error");
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-4 shadow-lg backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Creative Memory</p>
            <p className="text-[10px] text-zinc-500">Autonomous Workspace Brain</p>
          </div>
        </div>

        <button
          onClick={() => {
            const next = !off;
            setMemoryOptOut(wsId, next);
            setOff(next);
            if (onNotify)
              onNotify(next ? "Creative memory paused." : "Creative memory resumed.", "info");
          }}
          className="text-[10px] font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          {off ? "Resume" : "Pause"}
        </button>
      </div>

      {off ? (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Memory learning paused. No context is collected for this workspace.</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
          <Sparkles className="w-3 h-3" />
          <span>Auto-injecting brand context into Release Builder & Requests</span>
        </div>
      )}

      {/* Memory Content Entries */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Active Workspace Knowledge
          </span>
          <button
            onClick={() => {
              if (isEditing) handleSaveMemory();
              else setIsEditing(true);
            }}
            className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-300 cursor-pointer"
          >
            {isEditing ? (
              <>
                <Check className="w-3 h-3" /> Save
              </>
            ) : (
              <>
                <Edit2 className="w-3 h-3" /> Edit Entries
              </>
            )}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-2.5">
            <div>
              <label className="block text-[10px] text-zinc-400 mb-0.5">Bio & Background</label>
              <textarea
                value={bioMemory}
                onChange={(e) => setBioMemory(e.target.value)}
                rows={2}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-400 mb-0.5">Voice Traits</label>
              <input
                type="text"
                value={voiceMemory}
                onChange={(e) => setVoiceMemory(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-400 mb-0.5">Visual Direction</label>
              <input
                type="text"
                value={directionMemory}
                onChange={(e) => setDirectionMemory(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-400 mb-0.5">Target Audience</label>
              <input
                type="text"
                value={audienceMemory}
                onChange={(e) => setAudienceMemory(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-3 space-y-2 text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                Story / Bio
              </span>
              <p className="text-zinc-200 line-clamp-2 mt-0.5">{bioMemory}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                Voice & Mood
              </span>
              <p className="text-zinc-300 mt-0.5">{voiceMemory}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                Visual Rules
              </span>
              <p className="text-zinc-300 line-clamp-1 mt-0.5">{directionMemory}</p>
            </div>
          </div>
        )}
      </div>

      {/* Approved Swatches & Assets */}
      {colors.length > 0 && (
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
            Synced Color Tokens
          </span>
          <div className="flex gap-1.5">
            {colors.map((c) => (
              <span
                key={c}
                title={c}
                className="h-6 w-6 rounded-lg border border-white/20 shadow-sm"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}

      {approved.length > 0 && (
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
            Approved Master Imagery
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {approved.map((a) => (
              <img
                key={a.id}
                src={a.url}
                alt={a.name}
                className="h-12 w-12 rounded-xl object-cover border border-emerald-500/30"
              />
            ))}
          </div>
        </div>
      )}

      {/* Workspace Quick Stats */}
      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800/80 pt-3 text-[11px] text-zinc-400">
        <p>
          <strong className="text-white">{projects.length}</strong> Active Projects
        </p>
        <p>
          <strong className="text-white">{releases.length}</strong> Releases
        </p>
        <p>
          <strong className="text-white">{creativeRequests.length}</strong> Requests
        </p>
        <p>
          <strong className="text-white">{businessDocuments.length}</strong> Documents
        </p>
      </div>

      {/* Footer Clear */}
      <div className="pt-1 flex justify-end">
        <button
          onClick={() => {
            clearWorkspaceMemory(wsId);
            if (onNotify) onNotify("Learned memory signals cleared.", "info");
          }}
          className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          Reset learned signals
        </button>
      </div>
    </div>
  );
}
