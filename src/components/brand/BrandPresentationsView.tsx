// Presentations — Phase 3 S7 (part 1)
import React from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { Presentation, Send } from "lucide-react";
const DECKS = [
  { id: "company-presentation", name: "Company Presentation", desc: "Master company story built from Brand DNA." },
  { id: "pitch-deck", name: "Pitch Deck", desc: "Concise narrative that wins rooms." },
  { id: "investor-deck", name: "Investor Deck", desc: "Investor-grade structure and visuals." },
  { id: "sales-deck", name: "Sales Deck", desc: "Offer-led deck for sales conversations." },
];
export function BrandPresentationsView({ onNotify, onRequest }: { onNotify: (m: string, t?: "success" | "info" | "error") => void; onRequest: (reqType: string, title: string) => void; }) {
  const w = useWorkspace();
  const docs = w.businessDocuments.filter((d: any) => ["presentation", "pitch-deck", "company-presentation", "investor-deck", "sales-deck", "deck"].includes(String(d.documentType || d.type || "")));
  void onNotify;
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
        <p className="text-[11px] font-bold tracking-[0.2em] text-red-400">BRAND PROFILE → STUDIO → EDITABLE DECK</p>
        <h1 className="text-xl font-bold text-white">Presentations</h1>
        <p className="text-xs text-zinc-400">Request professionally designed presentations. Studio uses Brand DNA automatically; you approve and export.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">{DECKS.map((d) => (
        <div key={d.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-white"><Presentation className="w-4 h-4 text-red-400" />{d.name}</p>
          <p className="mt-1 text-xs text-zinc-400">{d.desc}</p>
          <button onClick={() => onRequest("presentation", d.name)} className="mt-3 flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 cursor-pointer"><Send className="w-3.5 h-3.5" /> Request {d.name}</button>
        </div>))}</div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
        <p className="text-xs font-bold text-white">My presentations ({docs.length})</p>
        {docs.length === 0 && <p className="mt-1 text-xs text-zinc-500">Editable presentations will appear here after Studio delivery.</p>}
        {docs.map((d: any) => (<div key={d.id} className="mt-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3"><p className="text-xs font-bold text-white">{d.title}</p><p className="text-[11px] text-zinc-500">{d.status}</p></div>))}
      </div>
    </div>
  );
}
export default BrandPresentationsView;
