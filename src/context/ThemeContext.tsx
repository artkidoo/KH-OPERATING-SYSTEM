import React, { createContext, useContext, useState, useEffect } from "react";
import { ColorTheme, ThemeMode, ThemeOption } from "../types";

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "keedohub-red",
    name: "Keedohub Crimson",
    tagline: "Signature Keedohub Studio Crimson & Carbon Slate",
    primaryColor: "#DC2626",
    secondaryColor: "#EF4444",
    badgeBg: "rgba(220, 38, 38, 0.12)",
    badgeText: "#EF4444",
    glowColor: "rgba(220, 38, 38, 0.25)",
  },
  {
    id: "flame-gold",
    name: "Lagos Flame & Gold",
    tagline: "Vibrant Afropop Sunset & Cyber Gold",
    primaryColor: "#F97316",
    secondaryColor: "#F59E0B",
    badgeBg: "rgba(249, 115, 22, 0.12)",
    badgeText: "#F97316",
    glowColor: "rgba(249, 115, 22, 0.25)",
  },
  {
    id: "neon-emerald",
    name: "Afro Emerald",
    tagline: "Lush Afrobeats Neon & Studio Sage",
    primaryColor: "#10B981",
    secondaryColor: "#059669",
    badgeBg: "rgba(16, 185, 129, 0.12)",
    badgeText: "#10B981",
    glowColor: "rgba(16, 185, 129, 0.25)",
  },
  {
    id: "royal-amethyst",
    name: "Royal Amethyst",
    tagline: "Ultra-Luxury Velvet Purple & Rose Gold",
    primaryColor: "#A855F7",
    secondaryColor: "#EC4899",
    badgeBg: "rgba(168, 85, 247, 0.12)",
    badgeText: "#C084FC",
    glowColor: "rgba(168, 85, 247, 0.25)",
  },
];

interface ThemeContextType {
  colorTheme: ColorTheme;
  themeMode: ThemeMode;
  setColorTheme: (theme: ColorTheme) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
  currentThemeConfig: ThemeOption;
  themeOptions: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    try {
      const saved = localStorage.getItem("keedohub_color_theme") as ColorTheme;
      if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return "keedohub-red"; // Default brand color is Red
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem("keedohub_theme_mode") as ThemeMode;
      if (saved === "light" || saved === "dark") {
        return saved;
      }
    } catch {
      // ignore
    }
    return "dark"; // Default is sleek dark mode
  });

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
    try {
      localStorage.setItem("keedohub_color_theme", theme);
    } catch {
      // ignore
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem("keedohub_theme_mode", mode);
    } catch {
      // ignore
    }
  };

  const toggleThemeMode = () => {
    const nextMode: ThemeMode = themeMode === "dark" ? "light" : "dark";
    setThemeMode(nextMode);
  };

  // Sync with HTML root classes and data attributes
  useEffect(() => {
    const root = document.documentElement;
    
    // Set data-theme attribute for CSS variable switching
    root.setAttribute("data-theme", colorTheme);
    
    // Update dark / light class
    if (themeMode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [colorTheme, themeMode]);

  const currentThemeConfig = THEME_OPTIONS.find((t) => t.id === colorTheme) || THEME_OPTIONS[0];

  return (
    <ThemeContext.Provider
      value={{
        colorTheme,
        themeMode,
        setColorTheme,
        setThemeMode,
        toggleThemeMode,
        currentThemeConfig,
        themeOptions: THEME_OPTIONS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
