import React, { useState, useEffect } from "react";
import { SAMPLE_CONTRACTS } from "../data/mockData";
import { LegalContract } from "../types";
import { VaultIntelSkeleton } from "./skeletons/ModuleSkeletons";
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Calculator, 
  CheckSquare, 
  Layers, 
  Music, 
  DollarSign 
} from "lucide-react";

interface ResourceVaultProps {
  onNotify: (msg: string, type?: "success" | "info") => void;
}

export const ResourceVault: React.FC<ResourceVaultProps> = ({ onNotify }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedContract, setSelectedContract] = useState<LegalContract>(SAMPLE_CONTRACTS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Royalty Calculator State
  const [streamCount, setStreamCount] = useState<number>(100000);
  const [dspRate, setDspRate] = useState<number>(0.0038); // Average $0.0038 per stream across DSPs
  const [masterShare, setMasterShare] = useState<number>(80); // 80% to artist/label, 20% to producer

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 320);
    return () => clearTimeout(timer);
  }, []);

  const totalGrossPayoutUSD = streamCount * dspRate;
  const artistShareUSD = totalGrossPayoutUSD * (masterShare / 100);
  const producerShareUSD = totalGrossPayoutUSD * ((100 - masterShare) / 100);

  // Release Checklist State
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    "c1": true,
    "c2": true,
    "c3": true,
  });

  const checklist = [
    { id: "c1", label: "Cover Artwork formatted at exactly 3000 x 3000px in RGB mode (PNG/TIFF)" },
    { id: "c2", label: "Master Audio exported as 24-bit 44.1kHz or 48kHz uncompressed WAV" },
    { id: "c3", label: "All Songwriter & Producer Split Sheets signed and archived" },
    { id: "c4", label: "Spotify for Artists editorial pitch submitted minimum 10 days before release date" },
    { id: "c5", label: "SmartLink / Pre-Save link created (Feature.fm / ToneDen / Linktree)" },
    { id: "c6", label: "TikTok sound snippet extracted (15-30s high-retention audio hook)" },
    { id: "c7", label: "Official Press Release statement prepared for music blogs & curators" },
    { id: "c8", label: "High-resolution press photos & EPK link updated in artist bio" },
  ];

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify("Copied legal contract to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadContract = (contract: LegalContract) => {
    const blob = new Blob([contract.templateText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${contract.id}_Agreement.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onNotify(`Downloaded ${contract.title}!`, "success");
  };

  if (isInitializing) {
    return <VaultIntelSkeleton />;
  }

  return (
    <div className="space-y-8 text-left pb-16">
      {/* Header Bento Card */}
      <div className="p-6 sm:p-8 bento-card border-[#27272A] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="bento-pill bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>LEGAL CONTRACTS & UTILITY VAULT</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Creative Legal Vault & Royalty Engine
          </h1>
          <p className="text-sm sm:text-base text-[#A1A1AA] max-w-2xl leading-relaxed">
            Institutional split sheets, producer licenses, work-for-hire agreements, streaming payout calculators, and release day checklists.
          </p>
        </div>
      </div>

      {/* 2-Column Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Contract Selector & Templates */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bento-card p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#27272A]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#F97316]" />
                <span>Industry Legal Templates</span>
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyText(selectedContract.templateText, selectedContract.id)}
                  className="px-3 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#323238] border border-[#3F3F46] text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedId === selectedContract.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#F97316]" />}
                  <span>{copiedId === selectedContract.id ? "Copied" : "Copy Template"}</span>
                </button>
                <button
                  onClick={() => downloadContract(selectedContract)}
                  className="px-3 py-1.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-black font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .TXT</span>
                </button>
              </div>
            </div>

            {/* Template Selector Tabs */}
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_CONTRACTS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedContract(c)}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    selectedContract.id === c.id
                      ? "bg-[#27272A] border-[#F97316] text-white shadow-sm"
                      : "bg-[#09090B] border-[#27272A] text-[#A1A1AA] hover:text-white"
                  }`}
                >
                  <div className="text-xs font-bold font-['Space_Grotesk']">{c.title}</div>
                  <div className="text-[10px] font-mono text-[#F97316] mt-1 uppercase">{c.category} Agreement</div>
                </button>
              ))}
            </div>

            {/* Contract Viewer Box */}
            <div className="space-y-2 pt-2">
              <div className="text-xs text-[#A1A1AA]">{selectedContract.description}</div>
              <pre className="p-4 rounded-2xl bg-[#09090B] border border-[#27272A] font-mono text-[11px] text-[#D4D4D8] overflow-x-auto whitespace-pre-wrap max-h-96 leading-relaxed">
                {selectedContract.templateText}
              </pre>
            </div>
          </div>
        </div>

        {/* Right: Royalty Calculator & Release Checklist */}
        <div className="lg:col-span-5 space-y-6">
          {/* DSP Streaming Royalty Estimator Bento Card */}
          <div className="bento-card p-5 sm:p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#F97316]" />
                <span>DSP Royalty Split Calculator</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">ESTIMATE ENGINE</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                  <span>Catalog Stream Volume</span>
                  <span className="font-mono text-[#F97316]">{streamCount.toLocaleString()} Streams</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="5000000"
                  step="10000"
                  value={streamCount}
                  onChange={(e) => setStreamCount(Number(e.target.value))}
                  className="w-full accent-[#F97316] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                  <span>Artist Master Share (%)</span>
                  <span className="font-mono text-[#F97316]">{masterShare}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={masterShare}
                  onChange={(e) => setMasterShare(Number(e.target.value))}
                  className="w-full accent-[#F97316] cursor-pointer"
                />
              </div>
            </div>

            {/* Calculated Breakdown */}
            <div className="p-4 rounded-2xl bg-[#09090B] border border-[#27272A] space-y-2">
              <div className="flex justify-between items-center text-[#A1A1AA]">
                <span>Gross Streaming Payout:</span>
                <span className="font-bold text-white font-mono">${Math.round(totalGrossPayoutUSD).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[#F97316] font-semibold">
                <span>Artist Share ({masterShare}%):</span>
                <span className="font-bold font-mono">${Math.round(artistShareUSD).toLocaleString()} (≈ ₦{Math.round(artistShareUSD * 1480).toLocaleString()})</span>
              </div>
              <div className="flex justify-between items-center text-[#A1A1AA]">
                <span>Producer Share ({100 - masterShare}%):</span>
                <span className="font-bold font-mono text-white">${Math.round(producerShareUSD).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Release Day Checklist Bento Card */}
          <div className="bento-card p-5 sm:p-6 space-y-3 text-xs">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2 pb-2 border-b border-[#27272A]">
              <CheckSquare className="w-4 h-4 text-[#F97316]" />
              <span>Release Day Protocol Checklist</span>
            </h3>

            <div className="space-y-2">
              {checklist.map((item) => {
                const isDone = checkedItems[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={`p-3 rounded-2xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      isDone
                        ? "bg-[#27272A] border-[#F97316]/50 text-white"
                        : "bg-[#09090B] border-[#27272A] text-[#A1A1AA] hover:text-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(isDone)}
                      onChange={() => toggleCheck(item.id)}
                      className="w-4 h-4 accent-[#F97316] rounded cursor-pointer mt-0.5"
                    />
                    <span className={`text-[11px] leading-relaxed ${isDone ? "line-through text-[#71717A]" : ""}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
