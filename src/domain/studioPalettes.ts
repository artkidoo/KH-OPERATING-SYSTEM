// PHASE 2 — studio palettes aligned to KeedoHub design system (additive).
export interface StudioPalette {
  id: string;
  name: string;
  bg: string;
  bg2: string;
  accent: string;
  text: string;
  sub: string;
}

export const STUDIO_PALETTES: StudioPalette[] = [
  { id: "cinematic-dark", name: "Cinematic Dark", bg: "#0A0A0C", bg2: "#17171c", accent: "#E11D2E", text: "#FFFFFF", sub: "#A1A1AA" },
  { id: "warm-golden", name: "Warm Golden", bg: "#171006", bg2: "#2b1f0c", accent: "#F5A623", text: "#FFF7E6", sub: "#D6C39A" },
  { id: "neon-futuristic", name: "Neon Futuristic", bg: "#07070f", bg2: "#101024", accent: "#22d3ee", text: "#F4F4FF", sub: "#9aa3ff" },
  { id: "minimal-editorial", name: "Minimal Editorial", bg: "#FAFAF8", bg2: "#ECECE6", accent: "#111111", text: "#111111", sub: "#6b6b66" },
  { id: "luxury-neutral", name: "Luxury Neutral", bg: "#121110", bg2: "#221f1c", accent: "#C9A96A", text: "#F5F0E6", sub: "#B8AE9C" },
];

export function paletteById(id: string): StudioPalette {
  return STUDIO_PALETTES.find((p) => p.id === id) ?? STUDIO_PALETTES[0];
}
