import React, { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../context/AuthContext";
import { downloadBulkBundle } from "../../lib/exportEngine";
import {
  Fingerprint,
  Sparkles,
  Download,
  Share2,
  Plus,
  Palette,
  Type,
  CheckCircle2,
  ShieldAlert,
  FolderDown,
  Layers,
  Edit3,
  ExternalLink,
} from "lucide-react";

type BrandSection =
  | "overview"
  | "guidelines"
  | "logos"
  | "colors_type"
  | "assets"
  | "deliverables";

export function BrandIdentity({
  onNotify,
}: {
  onNotify: (m: string, t?: "success" | "info" | "error") => void;
}) {
  const { brandCore, saveBrandCore, assets, projects } = useWorkspace();
  const { activeWorkspace } = useAuth();

  const [activeTab, setActiveTab] = useState<BrandSection>("overview");

  // Editable brand fields with intelligent defaults
  const [tagline, setTagline] = useState(
    brandCore?.tagline || "Redefining Cultural Craft and Intelligent Design"
  );
  const [mission, setMission] = useState(
    (brandCore as any)?.mission ||
      "Building visionary creative materials that bridge authentic street identity and enterprise-grade execution."
  );
  const [primaryLogo, setPrimaryLogo] = useState(
    brandCore?.logoAssets?.primaryLogoUrl ||
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80"
  );
  const [secondaryLogo, setSecondaryLogo] = useState(
    (brandCore?.logoAssets as any)?.secondaryLogoUrl ||
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80"
  );
  const [primaryHex, setPrimaryHex] = useState("#EF4444");
  const [secondaryHex, setSecondaryHex] = useState("#09090B");
  const [accentHex, setAccentHex] = useState("#F59E0B");
  const [neutralHex, setNeutralHex] = useState("#F4F4F5");
  const [fontHeading, setFontHeading] = useState("Space Grotesk (700 Bold)");
  const [fontBody, setFontBody] = useState("Plus Jakarta Sans (400 Regular / 500 Medium)");
  const [toneVoice, setToneVoice] = useState(
    "Confident, Minimalist, Forward-thinking, Editorial"
  );
  const [dos, setDos] = useState(
    "Use generous negative space (min 24px padding).\nMaintain high contrast on dark obsidian backdrops.\nEnsure logo clearspace is at least 1.5x the mark height."
  );
  const [donts, setDonts] = useState(
    "Never distort or stretch the logo proportions.\nNever apply arbitrary dropshadows or gradients over typography.\nNever place dark marks on low-contrast backgrounds."
  );
  const [busy, setBusy] = useState(false);

  // Sync state when brandCore updates asynchronously
  React.useEffect(() => {
    if (brandCore) {
      if (brandCore.tagline) setTagline(brandCore.tagline);
      if ((brandCore as any).mission) setMission((brandCore as any).mission);
      if (brandCore.logoAssets?.primaryLogoUrl) setPrimaryLogo(brandCore.logoAssets.primaryLogoUrl);
      if ((brandCore.logoAssets as any)?.secondaryLogoUrl)
        setSecondaryLogo((brandCore.logoAssets as any).secondaryLogoUrl);
      if (brandCore.colorPalette && brandCore.colorPalette.length >= 4) {
        setPrimaryHex(brandCore.colorPalette[0]?.hex || "#EF4444");
        setSecondaryHex(brandCore.colorPalette[1]?.hex || "#09090B");
        setAccentHex(brandCore.colorPalette[2]?.hex || "#F59E0B");
        setNeutralHex(brandCore.colorPalette[3]?.hex || "#F4F4F5");
      }
      if (brandCore.typography?.heading) setFontHeading(brandCore.typography.heading);
      else if (brandCore.typographyPairing?.heading) setFontHeading(brandCore.typographyPairing.heading);

      if (brandCore.typography?.body) setFontBody(brandCore.typography.body);
      else if (brandCore.typographyPairing?.body) setFontBody(brandCore.typographyPairing.body);

      if (brandCore.voiceAndTone?.traits?.length)
        setToneVoice(brandCore.voiceAndTone.traits.join(", "));

      const dosList = (brandCore as any).voiceAndTone?.dos || brandCore.visualDirection?.dos || brandCore.voiceAndTone?.doSay;
      if (dosList && dosList.length) setDos(dosList.join("\n"));

      const dontsList = (brandCore as any).voiceAndTone?.donts || brandCore.visualDirection?.donts || brandCore.voiceAndTone?.dontSay;
      if (dontsList && dontsList.length) setDonts(dontsList.join("\n"));
    }
  }, [brandCore]);

  const handleSave = async () => {
    setBusy(true);
    try {
      await saveBrandCore({
        tagline,
        mission,
        logoAssets: {
          primaryLogoUrl: primaryLogo,
          secondaryLogoUrl: secondaryLogo,
        },
        colorPalette: [
          { name: "Brand Primary", hex: primaryHex, role: "primary" },
          { name: "Obsidian Canvas", hex: secondaryHex, role: "canvas" },
          { name: "Amber Accent", hex: accentHex, role: "accent" },
          { name: "Chalk Neutral", hex: neutralHex, role: "text" },
        ],
        typography: {
          heading: fontHeading,
          body: fontBody,
        },
        voiceAndTone: {
          traits: toneVoice.split(",").map((s) => s.trim()),
          dos: dos.split("\n").filter(Boolean),
          donts: donts.split("\n").filter(Boolean),
        },
      } as never);
      onNotify("Brand identity synchronized to KeedoHub Creative Memory.", "success");
    } catch (e: unknown) {
      onNotify("Failed to save brand identity", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadBrandKit = () => {
    const brandKitContent =
      `KEEDOHUB BRAND IDENTITY DOSSIER\n` +
      `Brand: ${activeWorkspace?.name || "Creative Brand"}\n` +
      `Tagline: ${tagline}\n` +
      `Mission: ${mission}\n\n` +
      `PALETTE CODES:\n` +
      `- Primary Accent: ${primaryHex}\n` +
      `- Canvas / Dark: ${secondaryHex}\n` +
      `- Secondary Accent: ${accentHex}\n` +
      `- Light Text / Chalk: ${neutralHex}\n\n` +
      `TYPOGRAPHY SPECIFICATIONS:\n` +
      `- Display / Headings: ${fontHeading}\n` +
      `- Body Copy: ${fontBody}\n\n` +
      `VOICE & TONE PILLARS:\n` +
      `${toneVoice}\n\n` +
      `USAGE RULES (DOS):\n${dos}\n\n` +
      `USAGE RULES (DON'TS):\n${donts}\n\n` +
      `Maintained and certified by KeedoHub Agency Operating System.`;

    const items = [
      {
        path: "01-GUIDELINES",
        name: "Brand-Guidelines.txt",
        body: brandKitContent,
      },
      {
        path: "02-LOGOS",
        name: "Primary-Logo-Spec.txt",
        body: `Primary Logo URL: ${primaryLogo}\nSecondary Mark URL: ${secondaryLogo}\nFormat: SVG / Vector / High-Res PNG`,
      },
    ];

    const res = downloadBulkBundle(`${activeWorkspace?.name || "Brand"}-Kit`, items);
    onNotify(`Brand Kit downloaded: ${res.ok} files packaged.`, "success");
  };

  const handleSharePortal = () => {
    navigator.clipboard.writeText(window.location.href);
    onNotify("Brand Portal URL copied to clipboard.", "success");
  };

  const tabs: { key: BrandSection; label: string }[] = [
    { key: "overview", label: "Brand Overview" },
    { key: "guidelines", label: "Identity & Guidelines" },
    { key: "logos", label: "Logos & Marks" },
    { key: "colors_type", label: "Colors & Typography" },
    { key: "deliverables", label: "Deliverables Archive" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 md:p-8 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase">
                Brand Operating Environment
              </span>
              <span className="text-zinc-600">·</span>
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-300">
                {activeWorkspace?.name || "Brand Workspace"}
              </span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold text-white tracking-tight">
              Brand Identity & Style Hub
            </h1>
            <p className="mt-1 text-xs text-zinc-400 max-w-xl">
              Centralized brand foundation. Manage guidelines, logos, typographic systems, color tokens, and corporate collateral.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleSave}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50 transition-colors cursor-pointer shadow-md"
            >
              {busy ? "Saving..." : "Save Identity"}
            </button>
            <button
              onClick={handleDownloadBrandKit}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer shadow-sm"
            >
              <FolderDown className="w-3.5 h-3.5" />
              Download Brand Kit
            </button>
            <button
              onClick={handleSharePortal}
              className="rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Share Brand Portal"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Brand Tabs */}
        <div className="mt-6 flex flex-wrap gap-1.5 border-t border-zinc-800/80 pt-4">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-zinc-900/70 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-red-400" />
              Brand Essence & Positioning
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Official Brand Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Brand Mission & Vision Statement
              </label>
              <textarea
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                rows={4}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Core Voice Traits (Comma Separated)
              </label>
              <input
                type="text"
                value={toneVoice}
                onChange={(e) => setToneVoice(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Live Brand Card Specimen
              </h3>
              <div
                className="rounded-2xl border border-white/10 p-6 text-center space-y-3"
                style={{ backgroundColor: secondaryHex, color: neutralHex }}
              >
                <div className="mx-auto h-16 w-16 overflow-hidden rounded-2xl border border-white/20 p-2 bg-white/5">
                  <img
                    src={primaryLogo}
                    alt="Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <h4 className="text-xl font-bold tracking-tight" style={{ color: neutralHex }}>
                  {activeWorkspace?.name || "BRAND STUDIO"}
                </h4>
                <p className="text-xs font-medium" style={{ color: primaryHex }}>
                  {tagline}
                </p>
                <p className="text-[11px] text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  {mission}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
              <span className="text-[11px] text-zinc-500 font-mono">
                System Status: Verified by KeedoHub Studio
              </span>
              <button
                onClick={handleSave}
                className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GUIDELINES */}
      {activeTab === "guidelines" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white">Brand Usage Dos</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Directives for maintaining visual consistency across digital, press, and print collateral.
            </p>
            <textarea
              value={dos}
              onChange={(e) => setDos(e.target.value)}
              rows={6}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 p-3 text-xs text-zinc-200 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-red-400">
              <ShieldAlert className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white">Brand Usage Don'ts</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Strict rules against logo stretching, poor color contrasts, and unapproved modifications.
            </p>
            <textarea
              value={donts}
              onChange={(e) => setDonts(e.target.value)}
              rows={6}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 p-3 text-xs text-zinc-200 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>
        </div>
      )}

      {/* TAB 3: LOGOS */}
      {activeTab === "logos" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-white">Primary Brand Mark</h3>
            <div className="aspect-video w-full rounded-2xl bg-zinc-900 border border-zinc-800 p-6 flex items-center justify-center overflow-hidden">
              <img
                src={primaryLogo}
                alt="Primary Mark"
                className="max-h-24 max-w-full object-contain"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Primary Logo URL / File
              </label>
              <input
                type="text"
                value={primaryLogo}
                onChange={(e) => setPrimaryLogo(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-white">Secondary Emblem / Icon</h3>
            <div className="aspect-video w-full rounded-2xl bg-zinc-900 border border-zinc-800 p-6 flex items-center justify-center overflow-hidden">
              <img
                src={secondaryLogo}
                alt="Secondary Mark"
                className="max-h-24 max-w-full object-contain"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Secondary Logo URL / File
              </label>
              <input
                type="text"
                value={secondaryLogo}
                onChange={(e) => setSecondaryLogo(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COLORS & TYPOGRAPHY */}
      {activeTab === "colors_type" && (
        <div className="space-y-6">
          {/* Swatches */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-red-400" />
              Brand Color System
            </h3>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-zinc-800 p-4 space-y-2 bg-zinc-900/60">
                <div
                  className="h-16 w-full rounded-xl border border-white/20 shadow-inner"
                  style={{ backgroundColor: primaryHex }}
                />
                <span className="text-xs font-bold text-white block">Primary Accent</span>
                <input
                  type="text"
                  value={primaryHex}
                  onChange={(e) => setPrimaryHex(e.target.value)}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-2 py-1 text-xs text-white font-mono text-center"
                />
              </div>

              <div className="rounded-2xl border border-zinc-800 p-4 space-y-2 bg-zinc-900/60">
                <div
                  className="h-16 w-full rounded-xl border border-white/20 shadow-inner"
                  style={{ backgroundColor: secondaryHex }}
                />
                <span className="text-xs font-bold text-white block">Obsidian Canvas</span>
                <input
                  type="text"
                  value={secondaryHex}
                  onChange={(e) => setSecondaryHex(e.target.value)}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-2 py-1 text-xs text-white font-mono text-center"
                />
              </div>

              <div className="rounded-2xl border border-zinc-800 p-4 space-y-2 bg-zinc-900/60">
                <div
                  className="h-16 w-full rounded-xl border border-white/20 shadow-inner"
                  style={{ backgroundColor: accentHex }}
                />
                <span className="text-xs font-bold text-white block">Amber Secondary</span>
                <input
                  type="text"
                  value={accentHex}
                  onChange={(e) => setAccentHex(e.target.value)}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-2 py-1 text-xs text-white font-mono text-center"
                />
              </div>

              <div className="rounded-2xl border border-zinc-800 p-4 space-y-2 bg-zinc-900/60">
                <div
                  className="h-16 w-full rounded-xl border border-white/20 shadow-inner"
                  style={{ backgroundColor: neutralHex }}
                />
                <span className="text-xs font-bold text-white block">Chalk Neutral</span>
                <input
                  type="text"
                  value={neutralHex}
                  onChange={(e) => setNeutralHex(e.target.value)}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-2 py-1 text-xs text-white font-mono text-center"
                />
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-red-400" />
              Typographic Hierarchy
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Primary Display Font (Headings, Posters, Logotypes)
                </label>
                <input
                  type="text"
                  value={fontHeading}
                  onChange={(e) => setFontHeading(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Body & Interface Font (Reading, Tables, Documents)
                </label>
                <input
                  type="text"
                  value={fontBody}
                  onChange={(e) => setFontBody(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DELIVERABLES */}
      {activeTab === "deliverables" && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Brand Deliverables Archive</h3>
              <p className="text-xs text-zinc-400">
                All approved logos, social kits, and corporate identity files stored in your workspace.
              </p>
            </div>
            <button
              onClick={handleDownloadBrandKit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-500 transition-colors cursor-pointer"
            >
              <FolderDown className="w-3.5 h-3.5" />
              Download All
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Vector Mark</span>
              <p className="text-xs font-bold text-white mt-1">Master-Logo.svg</p>
              <span className="text-[10px] text-emerald-400 block mt-1">Production Ready</span>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Style Guide</span>
              <p className="text-xs font-bold text-white mt-1">Brand-Guidelines.pdf</p>
              <span className="text-[10px] text-emerald-400 block mt-1">Approved</span>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Colors</span>
              <p className="text-xs font-bold text-white mt-1">Tokens.json</p>
              <span className="text-[10px] text-emerald-400 block mt-1">Synced to Studio</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
