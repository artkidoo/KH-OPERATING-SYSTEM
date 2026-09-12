// Brand Creative — Phase 3 S3 catalogue (part 1)
import React from "react";
import { Send, ChevronDown } from "lucide-react";
import { BRAND_CREATIVE_CATALOGUE } from "../../domain/brandCatalogue";
export function BrandCreativeView({ onNotify, onRequest }: { onNotify: (m: string, t?: "success" | "info" | "error") => void; onRequest: (reqType: string, title: string) => void; }) {
  const [open, setOpen] = React.useState<string>("identity");
  void onNotify;
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
        <p className="text-[11px] font-bold tracking-[0.2em] text-red-400">CREATIVE SERVICES</p>
        <h1 className="text-xl font-bold text-white">Creative</h1>
        <p className="text-xs text-zinc-400">KeedoHub is your creative partner. Pick a service — everything leads to Request Creative Work.</p>
      </div>
      {BRAND_CREATIVE_CATALOGUE.map((cat) => (
        <div key={cat.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 overflow-hidden">
          <button onClick={() => setOpen(open === cat.id ? "" : cat.id)} className="w-full flex items-center justify-between p-4 cursor-pointer">
            <span className="text-left"><span className="block text-sm font-bold text-white">{cat.name}</span><span className="block text-[11px] text-zinc-500">{cat.tag}</span></span>
            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${open === cat.id ? "rotate-180" : ""}`} />
          </button>
          {open === cat.id && (<div className="grid gap-2 p-4 pt-0 sm:grid-cols-2">
            {cat.services.map((s) => (
              <div key={s.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-xs font-bold text-white">{s.name}</p>
                <p className="mt-0.5 text-[11px] text-zinc-400">{s.desc}</p>
                <p className="mt-1 text-[10px] text-zinc-500">{s.items.join(" · ")}</p>
                <button onClick={() => onRequest(s.req, s.name)} className="mt-2 flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-red-500 cursor-pointer"><Send className="w-3 h-3" /> Request Creative Work</button>
              </div>
            ))}
          </div>)}
        </div>
      ))}
    </div>
  );
}
export default BrandCreativeView;
