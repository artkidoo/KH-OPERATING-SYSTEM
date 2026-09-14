import React from "react";

export function OpsEmpty({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-8 text-center">
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}

export function OpsPill({ v }: { v: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-300">
      {String(v || "-").replace(/_/g, " ")}
    </span>
  );
}
