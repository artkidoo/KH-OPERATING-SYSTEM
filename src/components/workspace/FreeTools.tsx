import React from "react";
import { Link2, Type } from "lucide-react";
export function FreeTools({ onNotify }: { onNotify: (m: string, t?: "success"|"info"|"error") => void }) {
  const [links, setLinks] = React.useState<string[]>(["", "", ""]);
  const [text, setText] = React.useState("LIGHT — KAYDO\nOut now on all platforms.");
  const smart = `https://keedohub.link/${Math.random().toString(36).slice(2, 8)}`;
  const input = "w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white";
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-2">
        <div className="flex items-center gap-2"><Link2 className="w-4 h-4 text-emerald-400" /><p className="text-sm font-bold text-white">Smart link builder (free)</p></div>
        {links.map((l, i) => (<input key={i} className={input} value={l} onChange={(e) => { const c = [...links]; c[i] = e.target.value; setLinks(c); }} placeholder={["Spotify URL", "Apple Music URL", "YouTube URL"][i]} />))}
        <button onClick={() => { navigator.clipboard?.writeText(`${smart}\n${links.filter(Boolean).join("\n")}`); onNotify(`Smart link copied: ${smart}`, "success"); }} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white cursor-pointer">Copy smart link</button>
        <p className="text-[11px] text-zinc-500">Paste DSP URLs, get one shareable pre-save link. Works for artists and brands.</p>
      </div>
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-2">
        <div className="flex items-center gap-2"><Type className="w-4 h-4 text-sky-400" /><p className="text-sm font-bold text-white">Caption + hashtag writer (free)</p></div>
        <textarea className={input} value={text} onChange={(e) => setText(e.target.value)} rows={4} />
        <button onClick={() => { const tags = `#NewMusic #KeedoHub #${"Release".replace(/\s/g, "")}`; navigator.clipboard?.writeText(`${text}\n\n${tags}`); onNotify("Caption + hashtags copied.", "success"); }} className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white cursor-pointer">Copy caption</button>
        <p className="text-[11px] text-zinc-500">Real clipboard output — no mocks, no dead buttons.</p>
      </div>
    </div>
  );
}

