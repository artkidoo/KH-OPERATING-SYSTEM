// ============================================================
// CREATIVE MEMORY FOUNDATION (Step 9)
// Persistent workspace-level memory so returning customers
// never start from zero.
// ============================================================

export interface CreativeMemoryModel {
  workspaceId: string;
  artistIdentity?: string;
  brandIdentity?: string;
  approvedAssetIds: string[];
  colors: string[];
  typography: { heading?: string; body?: string };
  visualPreferences: string[];
  voice: string[];
  projectIds: string[];
  favoriteAssetIds: string[];
  approvedDirections: string[];
  frequentlyUsedDocumentIds: string[];
  creativeHistory: { at: string; summary: string }[];
  updatedAt: string;
}

export function emptyCreativeMemory(workspaceId: string): CreativeMemoryModel {
  return {
    workspaceId,
    approvedAssetIds: [],
    colors: [],
    typography: {},
    visualPreferences: [],
    voice: [],
    projectIds: [],
    favoriteAssetIds: [],
    approvedDirections: [],
    frequentlyUsedDocumentIds: [],
    creativeHistory: [],
    updatedAt: new Date().toISOString(),
  };
}

export function recordCreativeEvent(
  mem: CreativeMemoryModel,
  summary: string
): CreativeMemoryModel {
  return {
    ...mem,
    creativeHistory: [...mem.creativeHistory, { at: new Date().toISOString(), summary }].slice(-100),
    updatedAt: new Date().toISOString(),
  };
}
