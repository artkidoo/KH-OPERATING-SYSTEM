import React, { useState, useMemo } from "react";
import { ContentPillar, ContentItem } from "../../types";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  PieChart,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";

export const ContentPillarsManager: React.FC = () => {
  const { contentPillars, contentItems, createContentPillar, updateContentPillar, deleteContentPillar } = useWorkspace();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPillar, setEditingPillar] = useState<ContentPillar | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#EF4444");
  const [targetRatio, setTargetRatio] = useState<number>(25);
  const [isSaving, setIsSaving] = useState(false);

  // Compute actual counts & percentages
  const stats = useMemo(() => {
    const totalContent = contentItems.length;
    const counts: Record<string, number> = {};

    contentPillars.forEach((p) => {
      counts[p.name] = 0;
    });

    contentItems.forEach((item) => {
      if (item.contentPillar && counts[item.contentPillar] !== undefined) {
        counts[item.contentPillar]++;
      }
    });

    return {
      totalContent,
      counts,
    };
  }, [contentPillars, contentItems]);

  const handleOpenCreate = () => {
    setEditingPillar(null);
    setName("");
    setDescription("");
    setColor("#EF4444");
    setTargetRatio(25);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pillar: ContentPillar) => {
    setEditingPillar(pillar);
    setName(pillar.name);
    setDescription(pillar.description || "");
    setColor(pillar.color || "#EF4444");
    setTargetRatio(pillar.targetRatio || 25);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      if (editingPillar) {
        await updateContentPillar(editingPillar.id, {
          name: name.trim(),
          description: description.trim(),
          color,
          targetRatio: Number(targetRatio),
        });
      } else {
        await createContentPillar({
          name: name.trim(),
          description: description.trim(),
          color,
          targetRatio: Number(targetRatio),
        });
      }
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-100">Content Pillars & Balance Distribution</h2>
            <p className="text-xs text-neutral-400">
              Align your publishing volume with core brand narratives and audience engagement pillars
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-950/50 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Content Pillar</span>
        </button>
      </div>

      {/* Target vs Actual Ratio Multi-Bar */}
      {contentPillars.length > 0 && (
        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
              Live Distribution Balance ({stats.totalContent} Total Pieces)
            </h3>
            <span className="text-xs text-neutral-400 font-mono">Actual vs Strategic Target</span>
          </div>

          {/* Color bar preview */}
          <div className="h-3 rounded-full bg-neutral-950 overflow-hidden flex border border-neutral-800">
            {contentPillars.map((p) => {
              const count = stats.counts[p.name] || 0;
              const pct = stats.totalContent > 0 ? (count / stats.totalContent) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={p.id}
                  style={{ width: `${pct}%`, backgroundColor: p.color || "#EF4444" }}
                  className="h-full transition-all"
                  title={`${p.name}: ${count} pieces (${Math.round(pct)}%)`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contentPillars.map((pillar) => {
          const count = stats.counts[pillar.name] || 0;
          const actualPct = stats.totalContent > 0 ? Math.round((count / stats.totalContent) * 100) : 0;
          const targetPct = pillar.targetRatio || 25;
          const diff = actualPct - targetPct;

          return (
            <div
              key={pillar.id}
              className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: pillar.color || "#EF4444" }}
                    />
                    <h3 className="text-sm font-bold text-neutral-100">{pillar.name}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(pillar)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
                      title="Edit Pillar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete pillar "${pillar.name}"?`)) {
                          deleteContentPillar(pillar.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                      title="Delete Pillar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 min-h-[32px] line-clamp-2">
                  {pillar.description || "No description provided for this content pillar."}
                </p>
              </div>

              {/* Stats Bar */}
              <div className="pt-3 border-t border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Total Items:</span>
                  <span className="text-neutral-200 font-bold">{count} pieces</span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Actual vs Target:</span>
                  <span className="text-neutral-200">
                    <strong className="text-red-400">{actualPct}%</strong> / {targetPct}%
                  </span>
                </div>

                {/* Balance check */}
                <div className="text-[11px] font-semibold">
                  {diff < -10 ? (
                    <span className="text-amber-400">Under-represented (Need more {pillar.name})</span>
                  ) : diff > 15 ? (
                    <span className="text-blue-400">High frequency (Consider other pillars)</span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Balanced cadence
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Pillar Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-100">
                {editingPillar ? "Edit Content Pillar" : "New Content Pillar"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Pillar Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Behind The Scenes / In The Studio"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Strategic Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what content belongs in this pillar and why..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-neutral-300">{color}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Target Ratio (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={targetRatio}
                    onChange={(e) => setTargetRatio(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !name.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white shadow-md shadow-red-950/40"
                >
                  {isSaving ? "Saving..." : editingPillar ? "Update Pillar" : "Create Pillar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
