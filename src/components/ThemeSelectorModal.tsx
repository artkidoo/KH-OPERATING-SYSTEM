import React from "react";
import { useTheme } from "../context/ThemeContext";
import { ColorTheme } from "../types";
import { KeedohubLogo } from "./KeedohubLogo";
import { 
  Palette, 
  Sun, 
  Moon, 
  Check, 
  X, 
  Sparkles, 
  Flame, 
  Leaf, 
  Crown
} from "lucide-react";

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { colorTheme, themeMode, setColorTheme, setThemeMode, themeOptions } = useTheme();

  if (!isOpen) return null;

  const getThemeIcon = (id: ColorTheme) => {
    switch (id) {
      case "keedohub-red":
        return <Sparkles className="w-3.5 h-3.5 text-[#EF4444]" />;
      case "flame-gold":
        return <Flame className="w-3.5 h-3.5 text-[#F97316]" />;
      case "neon-emerald":
        return <Leaf className="w-3.5 h-3.5 text-[#10B981]" />;
      case "royal-amethyst":
        return <Crown className="w-3.5 h-3.5 text-[#A855F7]" />;
    }
  };

  return (
    <div
      id="theme-selector-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="theme-selector-modal"
        className="w-full max-w-xs bg-[var(--bento-card)] border border-[var(--bento-border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-[var(--bento-border)] flex items-center justify-between bg-[var(--bento-elevated)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-pill-text)] shadow-xs">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-[var(--bento-text)]">
                Studio Theme
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[var(--bento-muted)] font-mono">
                Select visual palette & mode
              </p>
            </div>
          </div>
          <button
            id="close-theme-modal-btn"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[var(--bento-input)] hover:bg-[var(--bento-card-hover)] text-[var(--bento-muted)] hover:text-[var(--bento-text)] border border-[var(--bento-border)] flex items-center justify-center cursor-pointer transition-colors"
            title="Close theme selector"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-4 space-y-4">
          {/* Display Mode (Sleek Segmented Pill Control) */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--bento-muted)] flex items-center justify-between">
              <span>Display Mode</span>
              <span className="text-[9px] text-[var(--accent-pill-text)] uppercase">{themeMode} mode active</span>
            </div>
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] gap-1">
              <button
                id="select-dark-mode-btn"
                type="button"
                onClick={() => setThemeMode("dark")}
                className={`py-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  themeMode === "dark"
                    ? "bg-[#18181B] text-white shadow-sm border border-zinc-700"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)]"
                }`}
              >
                <Moon className="w-4 h-4 text-zinc-300" />
              </button>

              <button
                id="select-light-mode-btn"
                type="button"
                onClick={() => setThemeMode("light")}
                className={`py-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  themeMode === "light"
                    ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                    : "text-[var(--bento-muted)] hover:text-[var(--bento-text)]"
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
              </button>
            </div>
          </div>

          {/* 4 Keedohub Color Themes (Compact List / Grid) */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--bento-muted)] flex items-center justify-between">
              <span>Palette Options</span>
              <span className="text-[9px] text-[var(--bento-muted)]">Instant Apply</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {themeOptions.map((t) => {
                const isSelected = colorTheme === t.id;
                return (
                  <button
                    key={t.id}
                    id={`theme-card-${t.id}`}
                    type="button"
                    onClick={() => setColorTheme(t.id)}
                    className={`h-10 rounded-xl border cursor-pointer transition-all flex items-center justify-center ${
                      isSelected
                        ? "bg-[var(--bento-input)] border-[var(--accent-color)] ring-1 ring-[var(--accent-color)] shadow-xs"
                        : "bg-[var(--bento-card)] border-[var(--bento-border)] hover:bg-[var(--bento-elevated)] hover:border-[var(--bento-muted)]/40"
                    }`}
                    title={t.name}
                    aria-label={`Use ${t.name} theme`}
                  >
                    <div className="flex items-center justify-center">{getThemeIcon(t.id)}</div>

                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] transition-colors ${
                        isSelected
                          ? "bg-[var(--accent-color)] text-[var(--accent-btn-text)]"
                          : "border border-[var(--bento-border)] text-transparent"
                      }`}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Logo Brand Check */}
          <div className="py-2 px-3 rounded-xl bg-[var(--bento-input)] border border-[var(--bento-border)] flex items-center justify-between">
            <span className="text-[10px] font-mono text-[var(--bento-muted)]">Live Preview:</span>
            <KeedohubLogo size="sm" showText={true} badge="ACTIVE" />
          </div>
        </div>

        {/* Compact Footer */}
        <div className="p-3 bg-[var(--bento-elevated)] border-t border-[var(--bento-border)] flex items-center justify-between text-xs">
          <span className="text-[10px] font-mono text-[var(--bento-muted)]">
            Auto-saved
          </span>
          <button
            id="apply-theme-done-btn"
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[var(--accent-color)] hover:opacity-90 text-[var(--accent-btn-text)] font-bold text-xs font-mono cursor-pointer transition-all shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
