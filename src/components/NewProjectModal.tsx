import React, { useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import { ProjectPriority } from "../types";
import { X, Plus, Trash2, FolderPlus, DollarSign, Calendar, CheckSquare } from "lucide-react";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewProjectModal({ isOpen, onClose, onSuccess }: NewProjectModalProps) {
  const { createProject, isLoading } = useWorkspace();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Music & Brand Launch");
  const [priority, setPriority] = useState<ProjectPriority>("medium");
  const [budget, setBudget] = useState(1500);
  const [currency, setCurrency] = useState("USD");
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [clientName, setClientName] = useState("");
  const [tasks, setTasks] = useState<{ id: string; text: string; completed: boolean }[]>([
    { id: "t1", text: "Create and validate 3000x3000px master artwork in Cover Studio", completed: false },
    { id: "t2", text: "Submit 5-week Spotify for Artists editorial pitch via DSP Pitcher", completed: false },
    { id: "t3", text: "Execute songwriter & producer split sheets", completed: false },
  ]);
  const [newTaskInput, setNewTaskInput] = useState("");

  if (!isOpen) return null;

  const handleAddTask = () => {
    if (!newTaskInput.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: "task_" + Math.random().toString(36).substring(2, 7), text: newTaskInput.trim(), completed: false },
    ]);
    setNewTaskInput("");
  };

  const handleRemoveTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createProject({
        title,
        description,
        category,
        priority,
        budget: Number(budget) || 0,
        currency,
        deadline,
        clientName: clientName || undefined,
        status: "in-progress",
        tasks,
        tags: [category, priority.toUpperCase()],
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const categories = [
    "Music & Brand Launch",
    "Single / EP Artwork & Rollout",
    "Music Video & Motion Design",
    "Brand Identity & Design System",
    "Digital Marketing & DSP Pitching",
    "Web App & UI/UX Sprints",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Create Persistent Workspace Project</h3>
              <p className="text-xs text-zinc-400">Add a tracked production sprint to your live Keedohub workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 'Born in Lagos' Album Campaign & Master Visuals"
              className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Project Scope & Summary
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key deliverables, launch milestones, target aesthetic and creative direction..."
              className="w-full px-3.5 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-zinc-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Priority Level
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["low", "medium", "high", "urgent"] as ProjectPriority[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPriority(lvl)}
                    className={`py-2 text-xs font-bold uppercase rounded-lg border transition-colors cursor-pointer ${
                      priority === lvl
                        ? "bg-red-600 text-white border-red-500"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Budget, Currency, Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Budget
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                />
                <DollarSign className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
              >
                <option value="USD">USD ($)</option>
                <option value="NGN">NGN (₦)</option>
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Target Deadline
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Client / Entity */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Client / Organization Name (Optional)
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Warner Music Africa, AfroVibe Ltd."
              className="w-full px-3.5 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Tasks Checklist */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Production Milestones & Tasks ({tasks.length})
            </label>
            <div className="space-y-2 mb-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-200"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{task.text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(task.id)}
                    className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
                placeholder="Add a milestone task..."
                className="flex-1 px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-red-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Commit Project to Workspace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
