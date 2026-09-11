import React, { useState, useEffect } from "react";
import { EPKData } from "../types";
import { 
  downloadEPKPdf, 
  getEPKPdfBlobUrl, 
  EPKExportOptions 
} from "../utils/epkPdfGenerator";
import { 
  FileText, 
  Download, 
  Printer, 
  Eye, 
  Sparkles, 
  Check, 
  X, 
  Palette, 
  Sliders, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  FileCheck
} from "lucide-react";
import confetti from "canvas-confetti";

interface EPKExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  epk: EPKData;
  onNotify: (msg: string, type?: "success" | "info") => void;
}

export const EPKExportModal: React.FC<EPKExportModalProps> = ({
  isOpen,
  onClose,
  epk,
  onNotify,
}) => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [docTitle, setDocTitle] = useState("OFFICIAL ELECTRONIC PRESS KIT");
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [includeBio, setIncludeBio] = useState(true);
  const [includeTracks, setIncludeTracks] = useState(true);
  const [includePressQuotes, setIncludePressQuotes] = useState(true);
  const [includeContact, setIncludeContact] = useState(true);
  const [watermark, setWatermark] = useState(true);

  const [isExporting, setIsExporting] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<"config" | "preview">("config");

  // Re-generate preview blob when config changes
  useEffect(() => {
    let cleanupFn: (() => void) | null = null;

    if (isOpen) {
      setIsLoadingPreview(true);
      const options: EPKExportOptions = {
        theme,
        docTitle,
        includeMetrics,
        includeBio,
        includeTracks,
        includePressQuotes,
        includeContact,
        watermark,
      };

      getEPKPdfBlobUrl(epk, options)
        .then(({ url, cleanup }) => {
          setPreviewBlobUrl(url);
          cleanupFn = cleanup;
        })
        .catch((err) => {
          console.error("PDF Preview Error:", err);
        })
        .finally(() => {
          setIsLoadingPreview(false);
        });
    }

    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, [
    isOpen,
    theme,
    docTitle,
    includeMetrics,
    includeBio,
    includeTracks,
    includePressQuotes,
    includeContact,
    watermark,
    epk,
  ]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const options: EPKExportOptions = {
        theme,
        docTitle,
        includeMetrics,
        includeBio,
        includeTracks,
        includePressQuotes,
        includeContact,
        watermark,
      };
      await downloadEPKPdf(epk, options);
      onNotify(`Exported ${epk.artistName} EPK Dossier (PDF)!`, "success");
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (e) {
      console.error(e);
      onNotify("Error creating PDF dossier. Please try again.", "info");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (previewBlobUrl) {
      const printWindow = window.open(previewBlobUrl, "_blank");
      if (printWindow) {
        printWindow.focus();
      }
    } else {
      handleDownload();
    }
  };

  const classifications = [
    "OFFICIAL ELECTRONIC PRESS KIT",
    "LABEL A&R EXECUTIVE DOSSIER",
    "FESTIVAL & BOOKING PORTFOLIO",
    "DSP EDITORIAL REVIEW DOSSIER",
    "BRAND PARTNERSHIP MEDIA KIT",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in text-left">
      <div className="bg-[var(--bento-card)] border border-[var(--bento-border)] rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[94vh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 md:p-6 border-b border-[var(--bento-border)] flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-[var(--bento-elevated)]">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-pill-text)] shrink-0 shadow-sm">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="font-['Space_Grotesk'] text-base sm:text-lg md:text-xl font-bold text-[var(--bento-text)] truncate">
                  Export EPK Dossier
                </h2>
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full bg-[var(--accent-light)] text-[var(--accent-pill-text)] border border-[var(--accent-border)] shrink-0">
                  <FileCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  PDF Vector
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[var(--bento-muted)] truncate sm:whitespace-normal">
                Publication-ready PDF dossier for A&R desks, festival curators & agents
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
            {/* Tab switch on mobile / desktop */}
            <div className="flex p-0.5 sm:p-1 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)]">
              <button
                onClick={() => setActiveTab("config")}
                className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-mono rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  activeTab === "config"
                    ? "bg-[var(--accent-color)] text-[var(--accent-btn-text)] font-bold shadow-sm"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)]"
                }`}
              >
                <Sliders className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Options</span>
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-mono rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-[var(--accent-color)] text-[var(--accent-btn-text)] font-bold shadow-sm"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)]"
                }`}
              >
                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Live View</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-card-hover)] border border-[var(--bento-border)] flex items-center justify-center text-[var(--bento-muted)] hover:text-[var(--bento-text)] transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-5 md:p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === "config" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column: Theme & Document Metadata */}
              <div className="space-y-4 sm:space-y-5">
                {/* Visual Theme Selection (Compact Segmented Control) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--bento-muted)] flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[var(--accent-pill-text)]" />
                      <span>Dossier Color Archetype</span>
                    </label>
                    <span className="text-[9px] font-mono text-[var(--bento-muted)] uppercase">{theme === "dark" ? "Onyx Dark" : "Ivory Print"}</span>
                  </div>
                  <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] gap-1">
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        theme === "dark"
                          ? "bg-[#18181B] text-white shadow-sm border border-zinc-700"
                          : "text-[var(--bento-muted)] hover:text-[var(--bento-text)]"
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                      <span>Midnight Onyx</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        theme === "light"
                          ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                          : "text-[var(--bento-muted)] hover:text-[var(--bento-text)]"
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
                      <span>Editorial Ivory</span>
                    </button>
                  </div>
                </div>

                {/* Document Classification Subtitle */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[var(--bento-muted)]">
                    Document Purpose / Subtitle
                  </label>
                  <select
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full px-3 py-2 sm:py-2.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] text-xs font-mono focus:outline-none focus:border-[var(--accent-color)]"
                  >
                    {classifications.map((c) => (
                      <option key={c} value={c} className="bg-[var(--bento-card)] text-[var(--bento-text)]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Security & Watermark Stamp */}
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent-pill-text)] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[var(--bento-text)] truncate">Keedohub Security Stamp</div>
                      <div className="text-[10px] sm:text-[11px] text-[var(--bento-muted)] truncate">Embed watermark & verification ID</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={watermark}
                      onChange={(e) => setWatermark(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 sm:w-9 sm:h-5 bg-[var(--bento-elevated)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 sm:after:h-4 sm:after:w-4 after:transition-all peer-checked:bg-[var(--accent-color)]" />
                  </label>
                </div>
              </div>

              {/* Right Column: Included Sections Toggles */}
              <div className="space-y-3 sm:space-y-4">
                <label className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[var(--bento-muted)] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[var(--accent-pill-text)]" />
                  <span>Dossier Section Inclusions</span>
                </label>

                <div className="space-y-2 sm:space-y-2.5">
                  {[
                    {
                      label: "Performance & Streaming Metrics",
                      sub: "Monthly listeners, catalog streams, Instagram & TikTok metrics",
                      checked: includeMetrics,
                      setter: setIncludeMetrics,
                    },
                    {
                      label: "Executive Biography & Lore",
                      sub: "Complete artist biography narrative and cultural positioning",
                      checked: includeBio,
                      setter: setIncludeBio,
                    },
                    {
                      label: "Master Catalog & Flagship Singles",
                      sub: "Curated discography table with duration, streams, and DSP tags",
                      checked: includeTracks,
                      setter: setIncludeTracks,
                    },
                    {
                      label: "Press Quotes & Critical Acclaim",
                      sub: "Verified media reviews and major curator endorsements",
                      checked: includePressQuotes,
                      setter: setIncludePressQuotes,
                    },
                    {
                      label: "Live Booking & Management Representation",
                      sub: "Direct agency contact, representation email and phone directory",
                      checked: includeContact,
                      setter: setIncludeContact,
                    },
                  ].map((sec, idx) => (
                    <div
                      key={idx}
                      onClick={() => sec.setter(!sec.checked)}
                      className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        sec.checked
                          ? "bg-[var(--bento-input)] border-[var(--accent-border)] shadow-xs"
                          : "bg-[var(--bento-card)] border-[var(--bento-border)] opacity-60"
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs font-bold text-[var(--bento-text)] truncate">{sec.label}</div>
                        <div className="text-[10px] text-[var(--bento-muted)] line-clamp-1 sm:line-clamp-none">{sec.sub}</div>
                      </div>
                      <div
                        className={`w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          sec.checked
                            ? "bg-[var(--accent-color)] text-[var(--accent-btn-text)]"
                            : "bg-[var(--bento-elevated)] text-transparent"
                        }`}
                      >
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Live Interactive Preview */
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs text-[var(--bento-muted)] font-mono">
                <span>INTERACTIVE PDF DOCUMENT RENDER</span>
                <div className="flex items-center gap-3">
                  {previewBlobUrl && (
                    <a
                      href={previewBlobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent-pill-text)] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open Full Screen Tab</span>
                    </a>
                  )}
                  <span className="hidden sm:inline">A4 FORMAT • 300 DPI EQUIVALENT</span>
                </div>
              </div>
              <div className="w-full h-[360px] sm:h-[460px] rounded-xl sm:rounded-2xl bg-[var(--bento-input)] border border-[var(--bento-border)] overflow-hidden relative">
                {isLoadingPreview ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 text-[var(--bento-muted)]">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent-pill-text)] animate-spin" />
                    <span className="text-xs font-mono">Rendering PDF layout vector...</span>
                  </div>
                ) : previewBlobUrl ? (
                  <iframe
                    src={previewBlobUrl}
                    title="EPK PDF Preview"
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-2 text-xs text-[var(--bento-muted)]">
                    <p>Preview rendering in background. Tap Download to save PDF dossier directly.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="p-3 sm:p-4 md:p-5 border-t border-[var(--bento-border)] bg-[var(--bento-elevated)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="text-[11px] text-[var(--bento-muted)] font-mono flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">Ready • {epk.artistName} Official Press Dossier</span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2.5 sm:w-auto">
            <button
              onClick={handlePrint}
              className="py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl bg-[var(--bento-input)] hover:bg-[var(--bento-card-hover)] border border-[var(--bento-border)] text-xs font-mono text-[var(--bento-text)] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--bento-muted)]" />
              <span>Print Dialog</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="py-2 px-3.5 sm:py-2.5 sm:px-5 rounded-xl bg-[var(--accent-color)] hover:opacity-90 text-[var(--accent-btn-text)] font-bold text-xs font-['Space_Grotesk'] flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-[var(--accent-glow)] transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  <span>Compiling...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
