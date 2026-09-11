import React from "react";
import { useAuth } from "../context/AuthContext";
import { User } from "lucide-react";
export function ProfileView() {
  const { user, activeWorkspace } = useAuth();
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center"><User className="w-5 h-5 text-zinc-200" /></div>
        <div><h1 className="text-xl font-bold text-white">Profile</h1><p className="text-xs text-zinc-400">Your creative headquarters identity.</p></div>
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-2">
        <p className="text-sm text-white font-bold">{user?.fullName || "Member"}</p>
        <p className="text-xs text-zinc-400">{user?.email}</p>
        <p className="text-xs text-zinc-500">Workspace: {activeWorkspace?.name} ({activeWorkspace?.identityType})</p>
      </div>
    </div>
  );
}
export default ProfileView;
