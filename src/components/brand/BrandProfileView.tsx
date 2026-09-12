// Brand Profile — Phase 3 S2: Brand Creative DNA (part 1)
import React from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../context/AuthContext";
import { Save, Building2, Palette, MessageSquare, FileText } from "lucide-react";
type Tab = "business" | "visual" | "voice" | "info";
export function BrandProfileView({ onNotify, onNavigateSection }: { onNotify: (m: string, t?: "success" | "info" | "error") => void; onNavigateSection: (s: string) => void; }) {
  const { activeWorkspace } = useAuth();
  const w = useWorkspace();
  const [tab, setTab] = React.useState<Tab>("business");
  const [saving, setSaving] = React.useState(false);
  const [dna, setDna] = React.useState<any>(null);
  const [f, setF] = React.useState({ name: "", desc: "", industry: "", location: "", website: "", email: "", phone: "", socials: "", founder: "", primary: "#DC2626", secondary: "#18181B", accent: "#F59E0B", heading: "Space Grotesk", body: "Plus Jakarta Sans", logoUrl: "", logoVariants: "", photo: "", illustration: "", iconStyle: "", motion: "", refs: "", tone: "", writing: "", tagline: "", mission: "", vision: "", values: "", audience: "", terms: "", avoid: "", address: "", rc: "", tax: "", bank: "" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  React.useEffect(() => {
    let live = true;
    (async () => {
      try {
        const d = await w.loadBrandDNA();
        if (live && d) {
          setDna(d);
          setF((p) => ({
            ...p, name: d.identity || "", industry: d.businessCategory || "", audience: d.audience || "",
            tagline: (d as any).tagline || "", tone: d.voice || "", photo: d.visualIdentity || "",
            website: (d as any).website || "", email: (d as any).email || "", phone: (d as any).phone || "",
            location: (d as any).location || "", desc: (d as any).description || "",
            founder: (d as any).founder || "", mission: (d as any).mission || "", vision: (d as any).vision || "",
            values: Array.isArray((d as any).values) ? (d as any).values.join(", ") : ((d as any).values || ""),
            primary: (d as any).primaryColor || p.primary, secondary: (d as any).secondaryColor || p.secondary,
            accent: (d as any).accentColor || p.accent, heading: (d as any).headingFont || p.heading,
            body: (d as any).bodyFont || p.body, logoUrl: (d as any).logoUrl || "",
            logoVariants: (d as any).logoVariants || "", terms: (d as any).preferredTerms || "",
            avoid: Array.isArray(d.thingsToAvoid) ? d.thingsToAvoid.join(", ") : (d.thingsToAvoid || ""),
            address: (d as any).address || "", socials: (d as any).socials || "",
          }));
        }
      } catch { /* offline */ }
      try {
        const bc: any = w.brandCore;
        if (live && bc) setF((p) => ({
          ...p, name: p.name || bc.brandName || "", industry: p.industry || bc.industry || "",
          tagline: p.tagline || bc.tagline || "", primary: bc.colorPalette?.[0]?.hex || p.primary,
          secondary: bc.colorPalette?.[1]?.hex || p.secondary, accent: bc.colorPalette?.[2]?.hex || p.accent,
          heading: bc.typographyPairing?.heading || bc.typography?.heading || p.heading,
          body: bc.typographyPairing?.body || bc.typography?.body || p.body,
          logoUrl: p.logoUrl || bc.logoAssets?.primaryLogoUrl || "",
          tone: p.tone || (bc.voiceAndTone?.traits || []).join(", "),
          terms: p.terms || (bc.voiceAndTone?.vocabulary || []).join(", "),
          avoid: p.avoid || (bc.voiceAndTone?.dontSay || []).join(", "),
          audience: p.audience || bc.audience?.primaryICP || "",
          mission: p.mission || (bc as any).mission || "", vision: p.vision || (bc as any).vision || "",
        }));
      } catch { /* offline */ }
    })();
    return () => { live = false; };
  }, [(w.workspace || activeWorkspace)?.id]);
  void dna; void onNavigateSection;
  const save = async () => {
    setSaving(true);
    try {
      await w.saveBrandDNA({
        identity: f.name, positioning: f.tagline, businessCategory: f.industry,
        audience: f.audience, valueProposition: f.mission, voice: f.tone,
        visualIdentity: f.photo, description: f.desc, website: f.website,
        email: f.email, phone: f.phone, location: f.location, socials: f.socials,
        founder: f.founder, tagline: f.tagline, mission: f.mission, vision: f.vision,
        values: f.values, primaryColor: f.primary, secondaryColor: f.secondary,
        accentColor: f.accent, headingFont: f.heading, bodyFont: f.body,
        logoUrl: f.logoUrl, logoVariants: f.logoVariants, preferredTerms: f.terms,
        thingsToAvoid: f.avoid, address: f.address,
      });
      onNotify("Brand DNA saved — Studio will use it automatically.", "success");
    } catch (e: any) { onNotify(e?.message || "Save failed", "error"); }
    finally { setSaving(false); }
  };
  const input = "w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500";
  const label = "block text-xs font-bold text-zinc-300 mb-1";
  const tabs: { id: Tab; name: string }[] = [
    { id: "business", name: "Business Identity" },
    { id: "visual", name: "Visual Identity" },
    { id: "voice", name: "Brand Voice" },
    { id: "info", name: "Business Information" },
  ];
  const F = ({ k, lab, ph, ta }: { k: string; lab: string; ph?: string; ta?: boolean }) => (
    <div className={k === "desc" || k === "socials" || k === "founder" || k === "logoVariants" || k === "mission" || k === "vision" || k === "audience" || k === "address" || k === "bank" ? "sm:col-span-2" : ""}>
      <label className={label}>{lab}</label>
      {ta
        ? <textarea rows={2} value={(f as any)[k]} onChange={(e) => set(k, e.target.value)} className={input} placeholder={ph} />
        : <input value={(f as any)[k]} onChange={(e) => set(k, e.target.value)} className={input} placeholder={ph} />}
    </div>
  );
  const C = ({ k, lab }: { k: string; lab: string }) => (
    <div><label className={label}>{lab}</label><div className="flex gap-2"><input type="color" value={(f as any)[k]} onChange={(e) => set(k, e.target.value)} className="h-9 w-12 rounded cursor-pointer" /><input value={(f as any)[k]} onChange={(e) => set(k, e.target.value)} className={input} /></div></div>
  );
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
        <p className="text-[11px] font-bold tracking-[0.2em] text-red-400">BRAND CREATIVE DNA</p>
        <h1 className="text-xl font-bold text-white">Brand Profile</h1>
        <div className="mt-3 flex flex-wrap gap-2">{tabs.map((t) => (<button key={t.id} onClick={() => setTab(t.id)} className={`rounded-xl px-3 py-2 text-xs font-bold cursor-pointer ${tab === t.id ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>{t.name}</button>))}</div>
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 grid gap-3 sm:grid-cols-2">
        {tab === "business" && (<><F k="name" lab="Company name" /><F k="industry" lab="Industry" /><F k="desc" lab="Description" ta /><F k="location" lab="Location" /><F k="website" lab="Website" /><F k="email" lab="Email" /><F k="phone" lab="Phone" /><F k="socials" lab="Social accounts" ta /><F k="founder" lab="Founder information" ta /></>)}
        {tab === "visual" && (<><C k="primary" lab="Primary colour" /><C k="secondary" lab="Secondary colour" /><C k="accent" lab="Accent colour" /><F k="logoUrl" lab="Logo URL" /><F k="heading" lab="Heading typography" /><F k="body" lab="Body typography" /><F k="logoVariants" lab="Logo variants" ta /><F k="photo" lab="Photography style" ta /><F k="refs" lab="Design references" ta /></>)}
        {tab === "voice" && (<><F k="tone" lab="Tone" /><F k="tagline" lab="Tagline" /><F k="mission" lab="Mission" ta /><F k="vision" lab="Vision" ta /><F k="values" lab="Values" /><F k="audience" lab="Audience" ta /><F k="terms" lab="Preferred terminology" /><F k="avoid" lab="Words to avoid" /></>)}
        {tab === "info" && (<><F k="address" lab="Registered address" ta /><F k="rc" lab="RC / registration no" /><F k="tax" lab="Tax ID" /><F k="bank" lab="Bank / payment terms" ta /></>)}
      </div>
      <div className="flex items-center justify-end">
        <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50 cursor-pointer"><Save className="w-4 h-4" />{saving ? "Saving..." : "Save Brand DNA"}</button>
      </div>
    </div>
  );
}
export default BrandProfileView;
