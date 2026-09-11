import React, { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../context/AuthContext";
import { useMembership } from "../../hooks/useMembership";
import { defaultProjectSections, WorkspaceIdentity } from "../../domain/workspace";
import { downloadBulkBundle } from "../../lib/exportEngine";
import { ClientReviewRoom } from "./ClientReviewRoom";
import {
  FolderKanban,
  Plus,
  ArrowLeft,
  Download,
  Share2,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Send,
  MoreVertical,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Upload,
} from "lucide-react";

export function ProjectsView({
  openId,
  onOpen,
  onNotify,
}: {
  openId: string | null;
  onOpen: (id: string | null) => void;
  onNotify: (m: string, t?: "success" | "info" | "error") => void;
}) {
  const {
    projects,
    assets,
    creativeRequests,
    releases,
    createProject,
    createAsset,
    updateProject,
    refreshWorkspace,
  } = useWorkspace();
  const { activeWorkspace } = useAuth();
  const { identity } = useMembership();

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeSectionTab, setActiveSectionTab] = useState<string>("All");
  const [newAssetUrl, setNewAssetUrl] = useState("");
  const [newAssetName, setNewAssetName] = useState("");
  const [showAddAsset, setShowAddAsset] = useState(false);

  const openProject = projects.find((p) => p.id === openId) || null;

  // Project sections based on identity
  const sections = openProject?.sections && openProject.sections.length > 0
    ? openProject.sections
    : defaultProjectSections(identity as WorkspaceIdentity);

  const projectAssets = assets.filter((a) => a.projectId === openProject?.id);
  const projectRequests = creativeRequests.filter(
    (r) => r.projectId === openProject?.id
  );
  const projectRelease = releases.find((r) => r.projectId === openProject?.id);

  // Filter assets by section
  const displayedAssets = projectAssets.filter((a) => {
    if (activeSectionTab === "All") return true;
    const cat = (a.category || "").toLowerCase();
    const sec = activeSectionTab.toLowerCase();
    return cat.includes(sec) || sec.includes(cat) || a.tags?.includes(activeSectionTab);
  });

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      onNotify("Please enter a project title.", "error");
      return;
    }
    try {
      const res = await createProject({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        status: "planning",
        priority: "high",
        sections: defaultProjectSections(identity as WorkspaceIdentity),
      } as never);
      setNewTitle("");
      setNewDesc("");
      setShowCreateModal(false);
      onNotify(`Project "${newTitle}" initialized.`, "success");
      onOpen((res as { id: string }).id);
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : "Failed to create project", "error");
    }
  };

  const handleExportProject = () => {
    if (!openProject) return;
    const items = projectAssets.map((a) => ({
      path: `${openProject.title}/${a.category || "General"}`,
      name: `${a.title || a.name || a.id}.png`,
      body: `Asset: ${a.title}\nURL: ${a.url}\nType: ${a.type}\nStatus: ${a.status}\nProject: ${openProject.title}`,
    }));

    if (items.length === 0) {
      items.push({
        path: `${openProject.title}/01-OVERVIEW`,
        name: "Project-Summary.txt",
        body: `PROJECT DOSSIER: ${openProject.title}\nStatus: ${openProject.status}\nSections: ${sections.join(", ")}\nWorkspace: ${activeWorkspace?.name || "Creative Workspace"}`,
      });
    }

    const res = downloadBulkBundle(openProject.title, items);
    onNotify(`Project exported: ${res.ok} assets bundled.`, "success");
  };

  const handleAddAssetSubmit = async () => {
    if (!newAssetName.trim() || !newAssetUrl.trim() || !openProject) {
      onNotify("Asset name and URL are required.", "error");
      return;
    }
    try {
      await createAsset({
        title: newAssetName.trim(),
        url: newAssetUrl.trim(),
        projectId: openProject.id,
        category: activeSectionTab !== "All" ? activeSectionTab.toLowerCase() : "artwork",
        type: "image",
        status: "approved",
        tags: [openProject.title, activeSectionTab],
      } as never);
      setNewAssetName("");
      setNewAssetUrl("");
      setShowAddAsset(false);
      onNotify("Asset added to project.", "success");
    } catch (e: unknown) {
      onNotify("Failed to add asset.", "error");
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!openProject) return;
    try {
      await updateProject(openProject.id, { status } as never);
      onNotify(`Project status updated to ${status}.`, "success");
    } catch (e: unknown) {
      onNotify("Failed to update status.", "error");
    }
  };

  // Detailed Project View
  if (openProject) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onOpen(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all projects
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportProject}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export Project
            </button>
          </div>
        </div>

        {/* Project Header Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 md:p-8 backdrop-blur-md shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-red-500 uppercase">
                  {activeWorkspace?.name || "KeedoHub Workspace"}
                </span>
                <span className="text-zinc-600">·</span>
                <select
                  value={openProject.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  className="rounded-full bg-zinc-900 border border-zinc-700/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase cursor-pointer focus:outline-none"
                >
                  <option value="planning">Draft / Planning</option>
                  <option value="in-progress">In Production</option>
                  <option value="review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Delivered</option>
                </select>
              </div>

              <h1 className="mt-2 text-2xl md:text-3xl font-bold text-white tracking-tight">
                {openProject.title}
              </h1>
              <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
                {openProject.description ||
                  "Primary container for all release information, creative assets, deliverables, and agency requests."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-center min-w-[90px]">
                <p className="text-[10px] font-bold text-zinc-500 uppercase">Assets</p>
                <p className="text-lg font-bold text-white">{projectAssets.length}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-center min-w-[90px]">
                <p className="text-[10px] font-bold text-zinc-500 uppercase">Requests</p>
                <p className="text-lg font-bold text-white">{projectRequests.length}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-center min-w-[90px]">
                <p className="text-[10px] font-bold text-zinc-500 uppercase">Release</p>
                <p className="text-xs font-bold text-emerald-400 mt-1">
                  {projectRelease ? "Connected" : "Not Linked"}
                </p>
              </div>
            </div>
          </div>

          {/* Section Pills */}
          <div className="mt-6 flex flex-wrap items-center gap-1.5 border-t border-zinc-800/80 pt-4">
            <button
              onClick={() => setActiveSectionTab("All")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeSectionTab === "All"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-zinc-900/70 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              All Sections ({projectAssets.length})
            </button>
            <button
              onClick={() => setActiveSectionTab("Studio Work")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSectionTab === "Studio Work"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-zinc-900/70 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              Studio Work & Review Room
            </button>
            {sections.map((sec) => {
              const active = activeSectionTab === sec;
              return (
                <button
                  key={sec}
                  onClick={() => setActiveSectionTab(sec)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-zinc-900/70 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {sec}
                </button>
              );
            })}
          </div>
        </div>

        {/* Client Review Room for Studio Work */}
        {(activeSectionTab === "All" || activeSectionTab === "Studio Work") && (
          <ClientReviewRoom
            projectId={openProject.id}
            projectTitle={openProject.title}
            onNotify={onNotify}
            onRefreshAssets={refreshWorkspace}
          />
        )}

        {/* Section Files & Actions Area (hidden if user specifically filtered to Studio Work) */}
        {activeSectionTab !== "Studio Work" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-400" />
              {activeSectionTab === "All" ? "Project Assets & Files" : activeSectionTab}
            </h3>
            <button
              onClick={() => setShowAddAsset(!showAddAsset)}
              className="inline-flex items-center gap-1 rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:text-white cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Asset
            </button>
          </div>

          {/* Quick Add Asset Form if toggled */}
          {showAddAsset && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
              <h4 className="text-xs font-bold text-white">Add Asset to {openProject.title}</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  placeholder="Asset Title (e.g. Master Cover Artwork)"
                  className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
                <input
                  type="text"
                  value={newAssetUrl}
                  onChange={(e) => setNewAssetUrl(e.target.value)}
                  placeholder="Image URL or File Path"
                  className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddAsset(false)}
                  className="rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAssetSubmit}
                  className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-500 cursor-pointer"
                >
                  Save Asset
                </button>
              </div>
            </div>
          )}

          {/* Assets Grid */}
          {displayedAssets.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {displayedAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-950/70 overflow-hidden hover:border-zinc-700 transition-all shadow-sm"
                >
                  <div className="aspect-square w-full bg-zinc-900 relative overflow-hidden flex items-center justify-center">
                    {asset.url ? (
                      <img
                        src={asset.url}
                        alt={asset.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-zinc-700" />
                    )}
                    <span className="absolute top-2 left-2 rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                      {asset.category || "Asset"}
                    </span>
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-bold text-white truncate">
                      {asset.title || asset.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{asset.status || "ready"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center space-y-2">
              <FolderKanban className="mx-auto w-8 h-8 text-zinc-600" />
              <p className="text-sm font-semibold text-zinc-300">
                No files in this section yet
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Generate creative assets through the Studio Dashboard or submit a creative request to KeedoHub.
              </p>
            </div>
          )}
        </div>
        )}

        {/* Studio Creative Requests Linked to this Project */}
        <div className="space-y-4 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>Studio Creative Requests ({projectRequests.length})</span>
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">
              Agency production lifecycle for this project
            </span>
          </div>

          {projectRequests.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {projectRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3 shadow-xs hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate">
                      {req.title || req.serviceName}
                    </span>
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                      {req.lifecycleStatus || "SUBMITTED"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {req.description || req.briefDetails || "Agency creative scope assigned."}
                  </p>
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Studio: {req.assignedStudio || "Creative"}</span>
                    <span>{req.deadline ? `Due ${req.deadline}` : "Priority queue"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-5 text-center">
              <p className="text-xs text-zinc-500">
                No active studio requests for this project. Commission agency work through <span className="text-red-400 font-semibold">Studio Services</span> to assign creative direction here.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // All Projects List View
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase">
            Project-First Headquarters
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Creative Projects</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Every release, brand identity, campaign asset, and agency request lives inside a project.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-500 transition-colors cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((proj) => {
          const pAssets = assets.filter((a) => a.projectId === proj.id);
          const pReqs = creativeRequests.filter((r) => r.projectId === proj.id);
          const heroAsset = pAssets[0];

          return (
            <div
              key={proj.id}
              onClick={() => onOpen(proj.id)}
              className="group rounded-3xl border border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 transition-all duration-200 overflow-hidden cursor-pointer shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="relative h-36 w-full bg-gradient-to-br from-zinc-900 to-zinc-950 overflow-hidden flex items-center justify-center">
                  {heroAsset?.url ? (
                    <img
                      src={heroAsset.url}
                      alt={proj.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <FolderKanban className="mx-auto w-8 h-8 text-zinc-700 mb-1" />
                      <span className="text-[10px] font-mono text-zinc-600 uppercase">
                        KeedoHub Creative Project
                      </span>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-bold text-amber-300 uppercase border border-white/10">
                    {proj.status || "Planning"}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                    {proj.description || "Active collaboration workspace with creative sections."}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-zinc-800/60 mt-2 flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-3">
                  <span>{pAssets.length} Assets</span>
                  <span>·</span>
                  <span>{pReqs.length} Requests</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-12 text-center space-y-3">
          <FolderKanban className="mx-auto w-10 h-10 text-zinc-600" />
          <h3 className="text-base font-bold text-white">No projects created yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Create your first project to organize release materials, creative packages, and agency deliverables.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Initialize First Project
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Project</h3>
            <p className="text-xs text-zinc-400">
              Initialize a project container. Sections will automatically adapt for{" "}
              <strong className="text-white uppercase">{identity}</strong> identity.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Project Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. LIGHT (or Brand Refresh)"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Project Brief / Description
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Goals, creative direction, or release overview..."
                  rows={3}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-500 transition-colors cursor-pointer shadow-md"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
