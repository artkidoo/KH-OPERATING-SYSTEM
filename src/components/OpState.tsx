// PHASE 3 — typed UI states: LOADING / EMPTY / SUCCESS / ERROR / RETRY.
// Every important operation renders a meaningful state, never silent fail.
import React from "react";

export type OpState = "idle" | "loading" | "empty" | "success" | "error";

export function OpStateView({ state, message, onRetry }: {
  state: OpState; message?: string; onRetry?: () => void;
}): React.ReactElement | null {
  if (state === "idle" || state === "success") return null;
  if (state === "loading") {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 text-center" role="status" aria-live="polite">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-red-500" />
        <p className="mt-2 text-xs text-zinc-400">{message || "Loading…"}</p>
      </div>
    );
  }
  if (state === "empty") {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-700 p-6 text-center">
        <p className="text-xs font-semibold text-zinc-400">{message || "Nothing here yet."}</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-6 text-center" role="alert">
      <p className="text-xs font-bold text-red-200">Something went wrong</p>
      <p className="mt-1 text-xs text-zinc-400">{message || "Please try again."}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white cursor-pointer">Retry</button>
      )}
    </div>
  );
}
