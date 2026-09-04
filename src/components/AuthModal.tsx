import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { IdentityType } from "../types";
import { X, Sparkles, LogIn, UserPlus, Music, Video, Building2, Rocket, Briefcase, CheckCircle2, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, onSuccess, initialMode = "login" }: AuthModalProps) {
  const { login, signup, isLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [identityType, setIdentityType] = useState<IdentityType>("artist");
  const [workspaceName, setWorkspaceName] = useState("");
  const [genreOrNiche, setGenreOrNiche] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await signup({
          email,
          password,
          fullName,
          identityType,
          workspaceName: workspaceName || `${fullName}'s Workspace`,
          genreOrNiche,
        });
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check credentials.");
    }
  };

  const identities: { id: IdentityType; label: string; icon: any; desc: string }[] = [
    { id: "artist", label: "Music Artist OS", icon: Music, desc: "Release rollouts, Cover Studio, DSP Pitching" },
    { id: "brand", label: "Brand OS", icon: Building2, desc: "Design systems, marketing campaigns, content engines" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/60 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
              K
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                {mode === "login" ? "Sign In to Keedohub OS" : "Initialize Workspace Account"}
              </h3>
              <p className="text-xs text-zinc-400">
                {mode === "login" ? "Access persistent workspaces & assets" : "One operating system for your creative world"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {mode === "login" && (
            <div className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                  Default Demo Environments
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Password: keedohub2026</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setEmail("creator@keedohub.com");
                    setPassword("keedohub2026");
                    try {
                      await login({ email: "creator@keedohub.com", password: "keedohub2026" });
                      onSuccess?.();
                      onClose();
                    } catch (err: any) {
                      setError(err.message || "Failed to log in as Artist");
                    }
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-left transition-all group cursor-pointer"
                >
                  <div className="p-1.5 rounded-md bg-red-600/20 text-red-400 group-hover:scale-105 transition-transform">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Artist OS</span>
                      <span className="text-[10px] text-red-400 font-normal">Instant →</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">creator@keedohub.com</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setEmail("brand@keedohub.com");
                    setPassword("keedohub2026");
                    try {
                      await login({ email: "brand@keedohub.com", password: "keedohub2026" });
                      onSuccess?.();
                      onClose();
                    } catch (err: any) {
                      setError(err.message || "Failed to log in as Brand");
                    }
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-purple-500/30 bg-purple-950/20 hover:bg-purple-950/40 text-left transition-all group cursor-pointer"
                >
                  <div className="p-1.5 rounded-md bg-purple-600/20 text-purple-400 group-hover:scale-105 transition-transform">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Brand OS</span>
                      <span className="text-[10px] text-purple-400 font-normal">Instant →</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">brand@keedohub.com</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {mode === "signup" && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Full Name / Artist Pseudonym
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tems, Burna, Vector, or Acme Studio"
                  className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              {/* Creative Identity Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Primary Identity Archetype
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {identities.map((item) => {
                    const Icon = item.icon;
                    const isSelected = identityType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setIdentityType(item.id)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-red-950/30 border-red-500/60 text-white shadow-sm"
                            : "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${isSelected ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            {item.label}
                            {isSelected && <CheckCircle2 className="w-3 h-3 text-red-400" />}
                          </div>
                          <div className="text-[10px] text-zinc-400 leading-tight mt-0.5 truncate">{item.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Workspace Name & Genre/Niche */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="e.g. Starboy Sound Lab"
                    className="w-full px-3.5 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Genre or Creative Niche
                  </label>
                  <input
                    type="text"
                    value={genreOrNiche}
                    onChange={(e) => setGenreOrNiche(e.target.value)}
                    placeholder="e.g. Afro-Fusion, Tech Brand"
                    className="w-full px-3.5 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="creator@yourbrand.com"
              className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-red-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Enter Operating System</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Create Workspace & Start</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="p-4 border-t border-zinc-800/60 bg-zinc-900/30 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Persistent cloud data isolation</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
            }}
            className="text-red-400 hover:text-red-300 font-semibold cursor-pointer underline underline-offset-4"
          >
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
