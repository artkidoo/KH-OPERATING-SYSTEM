import React from "react";

interface KeedohubLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  showText?: boolean;
  theme?: "auto" | "light" | "dark";
  className?: string;
  animateOnHover?: boolean;
  badge?: string;
}

/**
 * Official Keedohub Vector Logo
 * Precise geometric KH monogram with left arrow and red angled container.
 * Automatically adapts seamlessly to Light Mode (Black + Red) and Dark Mode (White + Red),
 * or can be forced with the `theme` prop.
 */
export const KeedohubLogo: React.FC<KeedohubLogoProps> = ({
  size = "md",
  showText = true,
  theme = "auto",
  className = "",
  animateOnHover = true,
  badge,
}) => {
  // Dimensions map
  const sizeMap = {
    xs: { markW: 24, markH: 18, textClass: "text-xs", gap: "gap-1.5", padding: "p-0.5" },
    sm: { markW: 32, markH: 24, textClass: "text-sm", gap: "gap-2", padding: "p-0.5" },
    md: { markW: 40, markH: 30, textClass: "text-base", gap: "gap-2.5", padding: "p-1" },
    lg: { markW: 56, markH: 42, textClass: "text-xl", gap: "gap-3", padding: "p-1.5" },
    xl: { markW: 72, markH: 54, textClass: "text-2xl", gap: "gap-4", padding: "p-2" },
    hero: { markW: 120, markH: 90, textClass: "text-4xl", gap: "gap-5", padding: "p-3" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Determine colors based on theme
  // Red color: #DC2626 / #E11D48
  // Secondary color: White in dark mode, Black/Charcoal in light mode (using CSS variable or currentColor)
  const secondaryColorClass =
    theme === "dark"
      ? "fill-white text-white"
      : theme === "light"
      ? "fill-zinc-950 text-zinc-950"
      : "fill-[var(--bento-text)] text-[var(--bento-text)]";

  return (
    <div
      className={`inline-flex items-center ${currentSize.gap} group select-none ${className}`}
      title="Keedohub Creative Operating System"
    >
      {/* KH Geometric Vector Mark */}
      <div
        className={`relative shrink-0 ${animateOnHover ? "group-hover:scale-105" : ""} transition-transform duration-200`}
        style={{ width: currentSize.markW, height: currentSize.markH }}
      >
        <svg
          viewBox="110 115 295 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible drop-shadow-sm"
        >
          {/* 1. Red angled block on left with V-notch */}
          <path
            d="M 120 126 H 226 L 126 226 L 226 326 H 120 Z"
            className="fill-[#DC2626] transition-colors"
          />

          {/* 2. KH Monogram Arrow & H shape (White in Dark mode, Black in Light mode) */}
          <path
            d="M 180 226 L 286 126 V 202 H 346 V 126 H 396 V 326 H 346 V 250 H 286 V 326 Z"
            className={`${secondaryColorClass} transition-colors`}
          />
        </svg>
      </div>

      {/* Wordmark Text */}
      {showText && (
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-['Space_Grotesk'] font-bold tracking-tight ${currentSize.textClass} ${
              theme === "dark"
                ? "text-white"
                : theme === "light"
                ? "text-zinc-950"
                : "text-[var(--bento-text)]"
            } group-hover:text-[#DC2626] transition-colors`}
          >
            KEEDOHUB
          </span>
          {badge && (
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--accent-light)] text-[var(--accent-pill-text)] border border-[var(--accent-border)] font-bold tracking-wider uppercase">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Standalone Square Icon Badge with Keedohub Logo (Perfect for Avatars, Headers, App Store icons)
 */
export const KeedohubIconBadge: React.FC<{
  size?: number;
  className?: string;
  theme?: "auto" | "light" | "dark" | "black";
}> = ({ size = 36, className = "", theme = "auto" }) => {
  const bgClass =
    theme === "black"
      ? "bg-black border-zinc-800 shadow-md"
      : theme === "dark"
      ? "bg-zinc-950 border-zinc-800 shadow-md"
      : theme === "light"
      ? "bg-white border-zinc-200 shadow-sm"
      : "bg-[var(--bento-elevated)] border-[var(--bento-border)] shadow-sm";

  const markSecondaryClass =
    theme === "black" || theme === "dark"
      ? "fill-white"
      : theme === "light"
      ? "fill-zinc-950"
      : "fill-[var(--bento-text)]";

  return (
    <div
      className={`rounded-xl border flex items-center justify-center p-1.5 transition-all group-hover:scale-105 shrink-0 ${bgClass} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="115 120 285 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path
          d="M 120 126 H 226 L 126 226 L 226 326 H 120 Z"
          className="fill-[#DC2626]"
        />
        <path
          d="M 180 226 L 286 126 V 202 H 346 V 126 H 396 V 326 H 346 V 250 H 286 V 326 Z"
          className={markSecondaryClass}
        />
      </svg>
    </div>
  );
};

/**
 * Full Horizontal & Stacked Lockup Component for Prominent Displays (EPK, Press Kit, Brand OS)
 */
export const KeedohubBrandCard: React.FC<{
  mode?: "dark" | "light";
  className?: string;
}> = ({ mode = "dark", className = "" }) => {
  const isDark = mode === "dark";

  return (
    <div
      className={`p-6 rounded-2xl flex flex-col items-center justify-center space-y-4 border ${
        isDark
          ? "bg-black border-zinc-800 text-white"
          : "bg-white border-zinc-200 text-zinc-900"
      } ${className}`}
    >
      {/* High-Res Vector Mark */}
      <div className="w-28 h-20">
        <svg
          viewBox="110 115 295 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M 120 126 H 226 L 126 226 L 226 326 H 120 Z"
            fill="#DC2626"
          />
          <path
            d="M 180 226 L 286 126 V 202 H 346 V 126 H 396 V 326 H 346 V 250 H 286 V 326 Z"
            fill={isDark ? "#FFFFFF" : "#0A0A0A"}
          />
        </svg>
      </div>

      <div className="text-center space-y-1">
        <div
          className={`font-['Space_Grotesk'] text-xl font-bold tracking-widest ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          KEEDOHUB
        </div>
        <div className="text-[10px] font-mono tracking-wider opacity-60 uppercase">
          {isDark ? "Dark Theme Lockup" : "Light Theme Lockup"}
        </div>
      </div>
    </div>
  );
};
