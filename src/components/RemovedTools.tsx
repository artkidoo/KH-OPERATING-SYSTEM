// RemovedTools.tsx
// Canonical "this tool has been removed from KeedoHub" wall.
// Old bookmarks, deep links, command-palette entries, and legacy paths that
// used to target DSP Pitcher / customer-facing Cover Studio / Mastering
// Inspector / Lyric Studio / Presave Hub / EPK Builder / Splits Calculator /
// Business Studio / Programmed Brain / Artist Content Brain now land here
// instead of silently falling through to the customer workspace.
import React from "react";
import { Trash2, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { hasAdminAccess } from "../utils/adminAccess";

export function RemovedTools() {
  const { user } = useAuth();
  const role = user?.systemRole;

  return (
    <div className="min-h-screen bg-[var(--bento-bg)] text-[var(--bento-text)]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Identity header */}
        <div className="mb-10 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-900/40 bg-red-950/40 text-red-400">
            <Trash2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-red-400/80">Tool removed</p>
            <h1 className="text-2xl font-bold tracking-tight">This tool is no longer part of KeedoHub</h1>
          </div>
        </div>

        {/* Plain-language explanation */}
        <p className="mb-6 text-[15px] leading-relaxed text-zinc-300">
          The experience you are looking for has been removed from KeedoHub. It is no
          longer available as a customer-facing tool, and it is not part of the current
          KeedoHub model.
        </p>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 text-sm text-zinc-400 mb-8">
          <p className="mb-3 font-semibold text-zinc-300">
            Why it was removed
          </p>
          <p className="leading-relaxed">
            KeedoHub changed how production works. Customers submit a creative request,
            KeedoHub Studio produces the work internally, and approved work is delivered
            back to the customer's Library. Old DIY production tools, DSP-pitching tools,
            and consumer-facing "creative brain" assistants were retired because they sit
            outside that model.
          </p>
        </div>

        {/* Where to go instead */}
        <div className="rounded-xl border border-zinc-800 bg-emerald-950/30 p-5 mb-8">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-emerald-400">
            Where this fits now
          </h2>
          <p className="text-sm text-zinc-300">
            Studio production now happens inside KeedoHub Operations. A customer submits
            a creative request, the request becomes a production job, and admins manage
            review, approval, and delivery from the Operations console.
          </p>
        </div>

        {/* Auth-aware next step */}
        <div className="flex flex-wrap gap-4">
          {hasAdminAccess(role) ? (
            <>
              <a
                href="/admin"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-700"
              >
                Open Operations
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </a>
              <span className="text-sm text-zinc-500 self-center">
                Admin: the production queue and requests live here.
              </span>
            </>
          ) : user ? (
            <>
              <a
                href="/workspace"
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-zinc-200 border border-zinc-700 transition-colors hover:bg-zinc-700"
              >
                Return to your workspace
              </a>
              <span className="text-sm text-zinc-500 self-center">
                Studio work is requested through your workspace, not via stand-alone tools.
              </span>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-zinc-200 border border-zinc-700 transition-colors hover:bg-zinc-700"
              >
                Sign in
              </a>
              <span className="text-sm text-zinc-500 self-center">
                Existing customers can sign in to their workspace.
              </span>
            </>
          )}
        </div>

        <p className="mt-10 text-xs text-zinc-600">
          If you were redirected here by mistake, contact KeedoHub support with the page
          you were trying to reach.
        </p>
      </div>
    </div>
  );
}
