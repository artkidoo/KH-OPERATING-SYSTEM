import React from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import { useAuth } from "../context/AuthContext";
import { ActiveTab } from "../types";
import { ArtistOperatingEnvironment } from "./artist/ArtistOperatingEnvironment";
import { BrandOperatingEnvironment } from "./brand/BrandOperatingEnvironment";
import { Disc3, Building2, ChevronDown, Plus } from "lucide-react";

interface WorkspaceHubProps {
  setActiveTab: (tab: ActiveTab) => void;
  onNotify: (text: string, type?: "success" | "info" | "error") => void;
  initialSubTab?: string;
}

/**
 * WorkspaceHub — Lightweight Operating Environment Shell
 * Eliminates dashboard duplication by directly routing the user to their
 * appropriate Operating Environment:
 * - Creator / Artist -> Artist Operating Environment
 * - Brand / Business -> Brand Operating Environment
 */
export function WorkspaceHub({ setActiveTab, onNotify }: WorkspaceHubProps) {
  const { activeWorkspace, workspaces, switchWorkspace, openOnboarding } = useAuth();
  const { workspace } = useWorkspace();

  const identityType = workspace?.identityType || activeWorkspace?.identityType || "artist";
  const isBrand = identityType === "brand";

  return (
    <div className="w-full min-h-screen">
      {/* Workspace Quick-Switcher Bar if user has multiple workspaces */}
      {workspaces.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-semibold">Active Workspace:</span>
            <div className="relative inline-block">
              <select
                value={activeWorkspace?.id || ""}
                onChange={(e) => switchWorkspace(e.target.value)}
                className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1 text-xs text-white font-bold cursor-pointer focus:outline-none focus:border-red-500"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name} ({ws.identityType === "brand" ? "Brand OS" : "Artist OS"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => openOnboarding?.()}
            className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Workspace</span>
          </button>
        </div>
      )}

      {/* Direct Operating Environment Routing */}
      {isBrand ? (
        <BrandOperatingEnvironment
          onNotify={onNotify}
          onNavigateTab={setActiveTab}
        />
      ) : (
        <ArtistOperatingEnvironment
          onNotify={onNotify}
          onNavigateTab={setActiveTab}
        />
      )}
    </div>
  );
}

export default WorkspaceHub;
