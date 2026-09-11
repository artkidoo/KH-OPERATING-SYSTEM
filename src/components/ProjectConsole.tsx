import React, { useState, useEffect } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import { useAuth } from "../context/AuthContext";
import { 
  Briefcase, 
  Layers, 
  Check, 
  Send, 
  ShieldCheck, 
  ArrowRight,
  Plus,
  Sparkles,
  FileText,
} from "lucide-react";

interface ProjectConsoleProps {
  onNotify: (msg: string, type?: "success" | "info" | "error") => void;
}

export const ProjectConsole: React.FC<ProjectConsoleProps> = ({ onNotify }) => {
  const { createProject } = useWorkspace();
  const { activeWorkspace } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("music");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 320);
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    { id: "music", label: "Music Release", icon: Sparkles, description: "Album artwork, release strategy, content rollout" },
    { id: "brand", label: "Brand Identity", icon: Layers, description: "Logo, colors, typography, brand guidelines" },
    { id: "content", label: "Content Campaign", icon: Send, description: "Social content, posts, visual assets" },
    { id: "document", label: "Business Documents", icon: FileText, description: "Proposals, contracts, invoices, presentations" },
  ];

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory) || categories[0];

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      onNotify("Give your project a name first.", "error");
      return;
    }
    
    if (!activeWorkspace) {
      onNotify("Please select a workspace first.", "error");
      return;
    }

    setIsCreating(true);
    try {
      const project = await createProject({
        title: projectName.trim(),
        description: projectDescription.trim(),
        category: selectedCategory,
        status: "planning",
        priority: "medium",
      });

      onNotify(`Project "${projectName}" created successfully!`, "success");
      window.location.href = "/project-console";
    } catch (err) {
      console.error("Failed to create project:", err);
      onNotify("Failed to create project. Please try again.", "error");
    } finally {
      setIsCreating(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-lg shadow-red-600/20">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Start a Project</h1>
            <p className="text-sm text-zinc-400 mt-1">Create a project to organize your creative work</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Project Details</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Summer Album 2026"
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5">Description (optional)</label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="What are you working on?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3 rounded-xl border text-left ${selectedCategory === cat.id ? "border-red-500 bg-red-500/10" : "border-zinc-700 hover:border-zinc-600"}`}
                >
                  <cat.icon className={`w-4 h-4 mb-1 ${selectedCategory === cat.id ? "text-red-400" : "text-zinc-500"}`} />
                  <p className={`text-sm font-semibold ${selectedCategory === cat.id ? "text-white" : "text-zinc-400"}`}>{cat.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Quick Start</h2>
          </div>

          <p className="text-sm text-zinc-400">Select a category above or create a blank project.</p>

          <div className="space-y-2">
            {categories.map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setProjectName(`${cat.label} ${idx + 1}`);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700 cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <cat.icon className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{cat.label}</p>
                  <p className="text-xs text-zinc-500 truncate">{cat.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600" />
              </button>
            ))}
          </div>

          <button
            onClick={handleCreateProject}
            disabled={isCreating || !projectName.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-sm cursor-pointer"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Project
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Projects are your workspace hub</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Every creative effort starts with a project. Add assets, documents, requests, and team members 
              to keep everything organized in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
