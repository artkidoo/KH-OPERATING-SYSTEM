import React, { useState } from "react";
import { X, Send, ShieldCheck, Music2, BriefcaseBusiness, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface BriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (msg: string, type?: "success" | "info") => void;
}

export const BriefModal: React.FC<BriefModalProps> = ({ isOpen, onClose, onNotify }) => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [projectType, setProjectType] = useState<"artist" | "brand" | "other">("artist");
  const [service, setService] = useState("Music Cover Art & Release Suite");
  const [budget, setBudget] = useState("₦50,000 - ₦150,000 ($60 - $200)");
  const [timeline, setTimeline] = useState("48-72 Hours");
  const [details, setDetails] = useState("");

  if (!isOpen) return null;

  const projectOptions = {
    artist: ["Music Cover Art & Release Suite", "30-Day Music Rollout & Content Campaign", "EPK, DSP Pitch & Release Readiness"],
    brand: ["Full Brand Identity & Vector System", "Brand OS Strategy & Campaign System", "Web Application & Landing Page"],
    other: ["Motion Graphics & Lyric Visualizer", "Web Application & Landing Page", "Custom Creative Direction"],
  };
  const projectLabels = { artist: "Artist OS", brand: "Brand OS", other: "Other / Custom" };
  const handleProjectTypeChange = (type: "artist" | "brand" | "other") => {
    setProjectType(type);
    setService(projectOptions[type][0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) {
      onNotify("Please fill in your name and contact details.", "info");
      return;
    }

    const message = `🚀 *NEW PROJECT BRIEF — KEEDOHUB CREATIVE OS*

*Name / Artist / Business:* ${name}
*Contact:* ${contact}
*Project Track:* ${projectLabels[projectType]}
*Requested Studio:* ${service}
*Budget Tier:* ${budget}
*Target Timeline:* ${timeline}

*Project Details & Vision:*
${details || "Standard high-priority production request."}

— Sent via Keedohub OS Quick Brief Portal`;

    window.open(`https://wa.me/2348104465924?text=${encodeURIComponent(message)}`, "_blank");
    onNotify("Dispatched project brief to WhatsApp!", "success");
    onClose();
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err) {}
  };

  return (
    <div 
      id="brief-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        id="brief-modal-container"
        className="w-full max-w-xl bg-[var(--bento-card)] border border-[var(--bento-border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--bento-border)] bg-[var(--bento-card)] flex items-center justify-between">
          <div>
            <div className="bento-pill mb-1">
              PROJECT CONSOLE • DIRECT PIPELINE
            </div>
            <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[var(--bento-text)] mt-1">
              Start Your Creative Empire
            </h2>
          </div>
          <button
            id="close-brief-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bento-elevated)] hover:bg-[var(--bento-border)] text-[var(--bento-muted)] hover:text-[var(--bento-text)] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block text-[var(--bento-text)] font-semibold mb-1">Your Name / Artist Name *</label>
            <input
              id="brief-input-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Zack Khalifa / NexaPay"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] font-medium focus:outline-none focus:border-[var(--accent-border)]"
            />
          </div>

          <div>
            <label className="block text-[var(--bento-text)] font-semibold mb-2">What are you building?</label>
            <div className="grid grid-cols-3 gap-1 rounded-xl border border-[var(--bento-border)] bg-[var(--bento-input)] p-1">
              {([
                ["artist", Music2, "Artist OS"],
                ["brand", BriefcaseBusiness, "Brand OS"],
                ["other", Sparkles, "Other / Custom"],
              ] as const).map(([type, Icon, label]) => (
                <button key={type} type="button" onClick={() => handleProjectTypeChange(type)} className={`flex min-h-0 items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-[10px] font-semibold transition-all cursor-pointer sm:px-2 sm:text-xs ${projectType === type ? "bg-theme-accent font-bold text-white shadow-sm" : "text-[var(--bento-muted)] hover:bg-[var(--bento-card)] hover:text-[var(--bento-text)]"}`}>
                  <Icon className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--bento-text)] font-semibold mb-1">Email / WhatsApp Number *</label>
              <input
                id="brief-input-contact"
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="email@test.com or +234..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] font-medium focus:outline-none focus:border-[var(--accent-border)]"
              />
            </div>
            <div>
              <label className="block text-[var(--bento-text)] font-semibold mb-1">Required Studio</label>
              <select
                id="brief-select-service"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] font-medium cursor-pointer"
              >
                {projectOptions[projectType].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--bento-text)] font-semibold mb-1">Estimated Budget Tier</label>
              <select
                id="brief-select-budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] font-medium cursor-pointer"
              >
                <option value="₦30,000 - ₦80,000 ($40 - $100)">₦30k - ₦80k ($40 - $100)</option>
                <option value="₦80,000 - ₦250,000 ($100 - $350)">₦80k - ₦250k ($100 - $350)</option>
                <option value="₦250,000 - ₦800,000 ($350 - $1k)">₦250k - ₦800k ($350 - $1k)</option>
                <option value="₦1M+ ($1.5k+ Enterprise)">₦1M+ ($1.5k+ Enterprise)</option>
              </select>
            </div>
            <div>
              <label className="block text-[var(--bento-text)] font-semibold mb-1">Delivery Timeline</label>
              <select
                id="brief-select-timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] font-medium cursor-pointer"
              >
                <option value="24-48 Hours (Fast-Track)">24-48 Hours (Fast-Track)</option>
                <option value="1 Week">1 Week</option>
                <option value="2-3 Weeks">2-3 Weeks</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[var(--bento-text)] font-semibold mb-1">
              {projectType === "artist" ? "Project Details, Song Links & Vision" : projectType === "brand" ? "Business Goals, References & Vision" : "Project Details, References & Vision"}
            </label>
            <textarea
              id="brief-textarea-details"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Tell us about the record, brand vision, reference links, or deadline..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] text-[var(--bento-text)] font-medium focus:outline-none focus:border-[var(--accent-border)]"
            />
          </div>

          <div className="pt-2">
            <button
              id="brief-submit-btn"
              type="submit"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-theme-accent px-3 py-3 text-center text-[10px] font-bold leading-tight tracking-wide text-white shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer sm:rounded-2xl sm:px-4 sm:py-3.5 sm:text-sm sm:tracking-wider"
            >
              <Send className="h-4 w-4 shrink-0" />
              <span className="min-w-0">Dispatch Brief to WhatsApp <span className="whitespace-nowrap">(+234 810 446 5924)</span></span>
            </button>
          </div>

          <div className="text-[10px] font-mono text-[var(--bento-muted)] text-center flex items-center justify-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Confidential • Official Keedohub Creative Pipeline</span>
          </div>
        </form>
      </div>
    </div>
  );
};
