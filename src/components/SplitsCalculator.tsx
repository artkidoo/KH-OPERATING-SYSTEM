import React, { useState, useEffect } from "react";
import { CollaboratorSplit } from "../types";
import { PRESET_SPLIT_TEMPLATES, DSP_STREAM_RATES } from "../data/mockData";
import { SplitsCalculatorSkeleton } from "./skeletons/ModuleSkeletons";
import { 
  DollarSign, 
  PieChart as PieIcon, 
  Plus, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  HelpCircle, 
  ShieldCheck, 
  Users, 
  TrendingUp,
  Percent,
  Layers,
  ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";

interface SplitsCalculatorProps {
  onNotify: (text: string, type?: "success" | "info" | "error") => void;
}

export const SplitsCalculator: React.FC<SplitsCalculatorProps> = ({ onNotify }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [trackTitle, setTrackTitle] = useState("Midnight in Victoria Island");
  const [collaborators, setCollaborators] = useState<CollaboratorSplit[]>(
    PRESET_SPLIT_TEMPLATES[0].collaborators
  );
  
  // Streaming Simulator state
  const [streamCount, setStreamCount] = useState<number>(500000); // 500k streams
  const [distributorCutPct, setDistributorCutPct] = useState<number>(0); // e.g. 0% for DistroKid
  const [copiedAgreement, setCopiedAgreement] = useState(false);
  const [activeTab, setActiveTab] = useState<"splits" | "revenue" | "contract">("splits");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 320);
    return () => clearTimeout(timer);
  }, []);

  // Sum check
  const totalMaster = collaborators.reduce((sum, c) => sum + (c.masterPercentage || 0), 0);
  const totalPub = collaborators.reduce((sum, c) => sum + (c.publishingPercentage || 0), 0);
  const isMasterBalanced = Math.round(totalMaster) === 100;
  const isPubBalanced = Math.round(totalPub) === 100;

  // Add collaborator
  const handleAddCollaborator = () => {
    const newCollab: CollaboratorSplit = {
      id: "c_" + Math.random().toString(36).substring(2, 7),
      name: "New Collaborator",
      role: "Songwriter / Topliner",
      masterPercentage: 0,
      publishingPercentage: 10,
      ipiNumber: "000000000",
      proAffiliation: "BMI",
      payoutWallet: "0x...",
    };
    setCollaborators([...collaborators, newCollab]);
    onNotify("Added new collaborator", "info");
  };

  // Remove collaborator
  const handleRemoveCollaborator = (id: string) => {
    if (collaborators.length <= 1) {
      onNotify("Must have at least one rights holder", "error");
      return;
    }
    setCollaborators(collaborators.filter((c) => c.id !== id));
  };

  // Update collaborator field
  const handleUpdate = (id: string, field: keyof CollaboratorSplit, value: any) => {
    setCollaborators(
      collaborators.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // Load preset template
  const handleLoadTemplate = (templateName: string) => {
    const found = PRESET_SPLIT_TEMPLATES.find((t) => t.name === templateName);
    if (found) {
      setCollaborators(found.collaborators);
      onNotify(`Applied template: ${templateName}`, "success");
    }
  };

  // Calculate gross streaming revenue across all DSPs (Blended average ~$0.0042)
  const blendedRate = 0.0042;
  const grossRevenueUSD = streamCount * blendedRate;
  const netRevenueAfterDistributor = grossRevenueUSD * (1 - distributorCutPct / 100);

  // Generate printable contract agreement
  const generateAgreementText = () => {
    let doc = `========================================================================\n`;
    doc += `OFFICIAL MUSIC SPLIT SHEET & REVENUE AGREEMENT\n`;
    doc += `Generated via Keedohub Creative Operating System\n`;
    doc += `========================================================================\n\n`;
    doc += `RECORDING / COMPOSITION TITLE: "${trackTitle}"\n`;
    doc += `DATE OF EXECUTION: ${new Date().toLocaleDateString()}\n`;
    doc += `JURISDICTION: Lagos State, Nigeria / Federal Republic of Nigeria\n\n`;
    doc += `1. MASTER RECORDING (SOUND RECORDING) ROYALTY SPLITS:\n`;
    doc += `------------------------------------------------------------------------\n`;
    collaborators.forEach((c, i) => {
      doc += `${i + 1}. ${c.name.toUpperCase()} (${c.role})\n`;
      doc += `   - Master Royalty Share: ${c.masterPercentage}%\n`;
      doc += `   - PRO Affiliation: ${c.proAffiliation} (IPI/CAE: ${c.ipiNumber})\n`;
      doc += `   - Wallet / Payout: ${c.payoutWallet}\n\n`;
    });
    doc += `2. PUBLISHING & COMPOSITION (MECHANICAL & PERFORMANCE) SPLITS:\n`;
    doc += `------------------------------------------------------------------------\n`;
    collaborators.forEach((c, i) => {
      doc += `${i + 1}. ${c.name.toUpperCase()} — Composition Share: ${c.publishingPercentage}%\n`;
    });
    doc += `\n3. WARRANTIES & SIGNATURES:\n`;
    doc += `All parties warrant that contributions are 100% original and free of uncleared third-party samples.\n\n`;
    collaborators.forEach((c) => {
      doc += `Signed: ___________________________  Date: ____________ (${c.name})\n`;
    });
    return doc;
  };

  const handleCopyAgreement = () => {
    navigator.clipboard.writeText(generateAgreementText());
    setCopiedAgreement(true);
    setTimeout(() => setCopiedAgreement(false), 2500);
    onNotify("Copied official split sheet document to clipboard!", "success");
  };

  const handleDownloadDoc = () => {
    const blob = new Blob([generateAgreementText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SPLIT_SHEET_${trackTitle.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    onNotify("Downloaded official legal split sheet", "success");
  };

  // Color palette for collaborator pie slices
  const sliceColors = ["#DC2626", "#F59E0B", "#06B6D4", "#10B981", "#8B5CF6", "#EC4899"];

  if (isInitializing) {
    return <SplitsCalculatorSkeleton />;
  }

  return (
    <div id="splits-calculator-module" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--bento-card)] border border-[var(--bento-border)] p-5 sm:p-6 rounded-3xl shadow-lg">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-theme-accent text-white shadow-md">
              <Percent className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-[var(--bento-text)]">
              Royalty Splits & Streaming Revenue Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--accent-light)] text-[var(--accent-pill-text)] border border-[var(--accent-border)]">
              MASTER & PUBLISHING LEGAL v3.0
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--bento-muted)] max-w-2xl">
            Separate <strong className="text-[var(--bento-text)]">Master Rights vs. Publishing Rights</strong>, prevent collaborator ownership disputes, and simulate global streaming revenue across all DSPs.
          </p>
        </div>

        {/* Template Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_SPLIT_TEMPLATES.map((t) => (
            <button
              key={t.name}
              onClick={() => handleLoadTemplate(t.name)}
              className="px-3 py-1.5 rounded-2xl bg-[var(--bento-card)] hover:bg-[var(--bento-elevated)] border border-[var(--bento-border)] text-xs font-mono text-[var(--bento-text)] cursor-pointer hover:border-[var(--accent-border)] transition-all"
            >
              {t.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Splits Editor / Right Revenue Simulator & Contract */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ==========================================
            LEFT: COLLABORATOR SPLIT TABLE & PIE (Col 7)
            ========================================== */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Track Name Bar */}
          <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-4 rounded-3xl flex items-center justify-between gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-mono text-[var(--bento-muted)] block mb-1 uppercase">
                Track Title for Split Agreement
              </label>
              <input
                type="text"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                className="w-full bg-[var(--bento-bg)] border border-[var(--bento-border)] px-3 py-2 rounded-xl text-xs font-bold text-[var(--bento-text)] focus:outline-none focus:border-[var(--accent-border)]"
              />
            </div>
            
            <button
              onClick={handleAddCollaborator}
              className="mt-4 px-3 py-2 rounded-2xl bg-theme-accent text-white text-xs font-bold flex items-center gap-1.5 shadow hover:brightness-110 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Collaborator</span>
            </button>
          </div>

          {/* Validation Balance Bar */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-2xl border text-center transition-all ${
              isMasterBalanced ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
              <p className="text-[10px] font-mono uppercase font-bold">Master Rights Balance</p>
              <p className="text-base font-mono font-black">{totalMaster}% / 100%</p>
              <p className="text-[10px]">{isMasterBalanced ? "✅ Perfectly balanced" : "⚠️ Must sum to 100%"}</p>
            </div>

            <div className={`p-3 rounded-2xl border text-center transition-all ${
              isPubBalanced ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
              <p className="text-[10px] font-mono uppercase font-bold">Publishing Rights Balance</p>
              <p className="text-base font-mono font-black">{totalPub}% / 100%</p>
              <p className="text-[10px]">{isPubBalanced ? "✅ Perfectly balanced" : "⚠️ Must sum to 100%"}</p>
            </div>
          </div>

          {/* Collaborators List */}
          <div className="space-y-3">
            {collaborators.map((c, idx) => (
              <div
                key={c.id}
                className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-4 rounded-3xl space-y-3 shadow-sm hover:border-[var(--accent-border)]/50 transition-all"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: sliceColors[idx % sliceColors.length] }}
                    />
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => handleUpdate(c.id, "name", e.target.value)}
                      className="font-bold text-xs sm:text-sm text-[var(--bento-text)] bg-transparent border-b border-transparent focus:border-[var(--accent-border)] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={c.role}
                      onChange={(e) => handleUpdate(c.id, "role", e.target.value)}
                      className="text-[11px] font-mono bg-[var(--bento-elevated)] border border-[var(--bento-border)] rounded-xl px-2 py-1 text-[var(--bento-text)] focus:outline-none"
                    >
                      <option value="Primary Artist">Primary Artist</option>
                      <option value="Music Producer">Music Producer</option>
                      <option value="Featured Artist">Featured Artist</option>
                      <option value="Songwriter / Topliner">Songwriter / Topliner</option>
                      <option value="Mixing / Mastering">Mixing / Mastering</option>
                      <option value="Executive Producer">Executive Producer</option>
                    </select>

                    <button
                      onClick={() => handleRemoveCollaborator(c.id)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Percentage Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--bento-border)]">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-[var(--bento-muted)]">Master Share</span>
                      <span className="text-red-400 font-bold">{c.masterPercentage}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={c.masterPercentage}
                      onChange={(e) => handleUpdate(c.id, "masterPercentage", parseInt(e.target.value) || 0)}
                      className="w-full accent-red-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-[var(--bento-muted)]">Publishing Share</span>
                      <span className="text-amber-400 font-bold">{c.publishingPercentage}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={c.publishingPercentage}
                      onChange={(e) => handleUpdate(c.id, "publishingPercentage", parseInt(e.target.value) || 0)}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>

                {/* Legal & PRO Metadata */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="text-[9px] font-mono text-[var(--bento-muted)] block">PRO Affiliation</label>
                    <select
                      value={c.proAffiliation}
                      onChange={(e) => handleUpdate(c.id, "proAffiliation", e.target.value)}
                      className="w-full bg-[var(--bento-bg)] border border-[var(--bento-border)] rounded-lg px-2 py-1 text-[10px] font-mono text-[var(--bento-text)] focus:outline-none"
                    >
                      <option value="BMI">BMI (USA)</option>
                      <option value="ASCAP">ASCAP (USA)</option>
                      <option value="PRS">PRS for Music (UK)</option>
                      <option value="SAMRO">SAMRO (South Africa)</option>
                      <option value="MCSN">MCSN (Nigeria)</option>
                      <option value="SOCAN">SOCAN (Canada)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-[var(--bento-muted)] block">IPI / CAE Number</label>
                    <input
                      type="text"
                      value={c.ipiNumber}
                      onChange={(e) => handleUpdate(c.id, "ipiNumber", e.target.value)}
                      className="w-full bg-[var(--bento-bg)] border border-[var(--bento-border)] rounded-lg px-2 py-1 text-[10px] font-mono text-[var(--bento-text)] focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[9px] font-mono text-[var(--bento-muted)] block">Payout Wallet / Bank</label>
                    <input
                      type="text"
                      value={c.payoutWallet}
                      onChange={(e) => handleUpdate(c.id, "payoutWallet", e.target.value)}
                      className="w-full bg-[var(--bento-bg)] border border-[var(--bento-border)] rounded-lg px-2 py-1 text-[10px] font-mono text-[var(--bento-text)] focus:outline-none truncate"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ==========================================
            RIGHT: REVENUE SIMULATOR & SPLIT SHEET (Col 5)
            ========================================== */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Sub Navigation */}
          <div className="flex items-center gap-2 border-b border-[var(--bento-border)] pb-3">
            <button
              onClick={() => setActiveTab("splits")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "splits"
                  ? "bg-theme-accent text-white shadow"
                  : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] bg-[var(--bento-card)] border border-[var(--bento-border)]"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>DSP Revenue Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab("contract")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "contract"
                  ? "bg-theme-accent text-white shadow"
                  : "text-[var(--bento-muted)] hover:text-[var(--bento-text)] bg-[var(--bento-card)] border border-[var(--bento-border)]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Legal Document</span>
            </button>
          </div>

          {/* TAB 1: DSP Revenue Simulator */}
          {activeTab === "splits" && (
            <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-5 rounded-3xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--bento-text)] font-['Space_Grotesk']">
                    Target Stream Revenue Projections
                  </h3>
                  <p className="text-[11px] text-[var(--bento-muted)]">Calculated against official 2026 DSP payout rates.</p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ${netRevenueAfterDistributor.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                </span>
              </div>

              {/* Stream Slider */}
              <div className="p-4 rounded-2xl bg-[var(--bento-elevated)] border border-[var(--bento-border)] space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[var(--bento-muted)]">Streaming Milestone</span>
                  <span className="text-[var(--accent-pill-text)] font-bold">
                    {streamCount.toLocaleString()} Streams
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="5000000"
                  step="50000"
                  value={streamCount}
                  onChange={(e) => setStreamCount(parseInt(e.target.value))}
                  className="w-full accent-[var(--accent-color)]"
                />
              </div>

              {/* Individual Collaborator Payout Breakdown */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent-pill-text)] block">
                  Collaborator Payout Projection ({streamCount.toLocaleString()} streams)
                </span>
                {collaborators.map((c) => {
                  const collabEarnings = (netRevenueAfterDistributor * (c.masterPercentage / 100));
                  return (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-xl bg-[var(--bento-bg)] border border-[var(--bento-border)] flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <span className="font-bold text-[var(--bento-text)] block">{c.name}</span>
                        <span className="text-[10px] text-[var(--bento-muted)]">{c.role} ({c.masterPercentage}%)</span>
                      </div>
                      <span className="font-bold text-emerald-400 text-sm">
                        ${collabEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* DSP Rate Table Snapshot */}
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  DSP Rate Benchmark per 1M Streams
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="flex justify-between text-neutral-300">
                    <span>Apple Music:</span>
                    <span className="text-red-400 font-bold">$8,000</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Spotify:</span>
                    <span className="text-emerald-400 font-bold">$3,800</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Audiomack:</span>
                    <span className="text-amber-400 font-bold">$2,200</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>YouTube:</span>
                    <span className="text-red-500 font-bold">$2,000</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Legal Split Sheet Text & Export */}
          {activeTab === "contract" && (
            <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] p-5 rounded-3xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--bento-text)] font-['Space_Grotesk']">
                    Official Legal Split Sheet
                  </h3>
                  <p className="text-[11px] text-[var(--bento-muted)]">Ready for signatures & PRO registration.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyAgreement}
                    className="p-2 rounded-xl bg-[var(--bento-elevated)] border border-[var(--bento-border)] text-[var(--bento-text)] hover:border-[var(--accent-border)] cursor-pointer"
                    title="Copy document text"
                  >
                    {copiedAgreement ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleDownloadDoc}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-theme-accent text-white text-xs font-bold shadow hover:brightness-110 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download TXT</span>
                  </button>
                </div>
              </div>

              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 font-mono text-[11px] text-neutral-300 overflow-x-auto max-h-[380px] leading-relaxed select-all">
                <pre>{generateAgreementText()}</pre>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
