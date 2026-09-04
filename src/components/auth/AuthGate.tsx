import React from "react";
import { Lock, Shield, ArrowRight, Disc3, Building2, BookOpen, Compass } from "lucide-react";
import { ActiveTab } from "../../types";

interface AuthGateProps {
  areaName?: string;
  onOpenAuth: (mode: "login" | "signup", defaultIdentity?: "artist" | "brand") => void;
  onNavigatePublic: (tab: ActiveTab) => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  areaName = "Private Operating Environment",
  onOpenAuth,
  onNavigatePublic,
}) => {
  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 via-[#0d0d12] to-black p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl space-y-6">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-400 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Protected Area</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Authentication Required
          </h2>

          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            <strong className="text-zinc-200">{areaName}</strong> is a private workspace environment storing your catalog, Artist/Brand DNA, and operational assets. Please sign in to access your operating context.
          </p>
        </div>

        {/* Primary Auth Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth("login")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-red-950/50 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Sign In to Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenAuth("signup")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs tracking-wide transition-all border border-zinc-700 cursor-pointer"
          >
            Create Free Account
          </button>
        </div>

        {/* Demo Quick Access Credentials */}
        <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-left text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
            <span>DEFAULT DEMO ACCOUNTS</span>
            <span className="font-mono text-[10px] text-zinc-500">password: keedohub2026</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => onOpenAuth("login", "artist")}
              className="p-2 rounded-lg bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-left transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                  <Disc3 className="w-3 h-3 text-red-400" />
                  <span>Artist OS</span>
                </div>
                <div className="text-[10px] text-zinc-400">creator@keedohub.com</div>
              </div>
              <span className="text-[10px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">Sign in →</span>
            </button>

            <button
              onClick={() => onOpenAuth("login", "brand")}
              className="p-2 rounded-lg bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/20 text-left transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-purple-400" />
                  <span>Brand OS</span>
                </div>
                <div className="text-[10px] text-zinc-400">brand@keedohub.com</div>
              </div>
              <span className="text-[10px] text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">Sign in →</span>
            </button>
          </div>
        </div>

        {/* Public Alternatives */}
        <div className="pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
          <span className="text-zinc-500">Explore public resources:</span>
          <button
            onClick={() => onNavigatePublic("overview")}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5 text-zinc-400" />
            <span>Home</span>
          </button>
          <button
            onClick={() => onNavigatePublic("journal" as any)}
            className="hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5 text-red-400" />
            <span>Journal & Intelligence</span>
          </button>
        </div>
      </div>
    </div>
  );
};
