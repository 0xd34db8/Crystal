"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Monitor,
  Sun,
  Moon,
  BookOpen,
  Compass,
  Disc,
  Leaf,
  Check,
} from "lucide-react";

export type ThemeMode =
  | "system"
  | "light"
  | "dark"
  | "sepia"
  | "nord"
  | "midnight"
  | "forest";

interface ThemeOption {
  id: ThemeMode;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  colors: [string, string];
  description?: string;
}

const THEMES: ThemeOption[] = [
  {
    id: "system",
    name: "System",
    icon: Monitor,
    colors: ["#9CA3AF", "#0066FF"],
    description: "Follows OS preference",
  },
  {
    id: "light",
    name: "Light",
    icon: Sun,
    colors: ["#F9F9F9", "#0066FF"],
    description: "Crisp white",
  },
  {
    id: "dark",
    name: "Dark",
    icon: Moon,
    colors: ["#121212", "#3B82F6"],
    description: "Obsidian charcoal",
  },
  {
    id: "sepia",
    name: "Sepia",
    icon: BookOpen,
    colors: ["#F7F2E7", "#D97706"],
    description: "Warm reading paper",
  },
  {
    id: "nord",
    name: "Nord",
    icon: Compass,
    colors: ["#242933", "#88C0D0"],
    description: "Polar slate blue",
  },
  {
    id: "midnight",
    name: "Midnight",
    icon: Disc,
    colors: ["#000000", "#6366F1"],
    description: "AMOLED deep black",
  },
  {
    id: "forest",
    name: "Forest",
    icon: Leaf,
    colors: ["#0F1713", "#10B981"],
    description: "Calm evergreen",
  },
];

export const ThemeToggle: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>("system");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const applyTheme = (theme: ThemeMode) => {
    let isDark = false;

    if (theme === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      isDark = systemDark;
      document.documentElement.setAttribute("data-theme", systemDark ? "dark" : "light");
      document.documentElement.setAttribute("data-theme-setting", "system");
      localStorage.setItem("crystal_theme", "system");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.setAttribute("data-theme-setting", theme);
      isDark =
        theme === "dark" ||
        theme === "nord" ||
        theme === "midnight" ||
        theme === "forest";
      localStorage.setItem("crystal_theme", theme);
    }

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setCurrentTheme(theme);
  };

  useEffect(() => {
    setMounted(true);
    const stored = (localStorage.getItem("crystal_theme") as ThemeMode) || "system";
    setCurrentTheme(stored);
    applyTheme(stored);

    // Dynamic OS listener for system mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      const active = localStorage.getItem("crystal_theme") || "system";
      if (active === "system") {
        applyTheme("system");
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemChange);
      return () => mediaQuery.removeEventListener("change", handleSystemChange);
    } else {
      mediaQuery.addListener(handleSystemChange);
      return () => mediaQuery.removeListener(handleSystemChange);
    }
  }, []);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-full ${className}`} aria-hidden="true" />
    );
  }

  const activeOption =
    THEMES.find((t) => t.id === currentTheme) || THEMES[0];
  const ActiveIcon = activeOption.icon;

  return (
    <div ref={containerRef} className="relative inline-block font-manrope">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Theme: ${activeOption.name}. Click to change theme.`}
        title={`Current theme: ${activeOption.name}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`p-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1C1C1E] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer flex items-center justify-center ${className}`}
      >
        <ActiveIcon className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-manrope">
          <div className="px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 border-b border-neutral-100 dark:border-neutral-800">
            Appearance
          </div>

          <div className="py-1">
            {THEMES.map((theme) => {
              const Icon = theme.icon;
              const isSelected = currentTheme === theme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    applyTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-xs flex items-center justify-between text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50 font-medium"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Swatch preview */}
                    <div className="flex items-center -space-x-1 flex-shrink-0">
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10"
                        style={{ backgroundColor: theme.colors[0] }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/10"
                        style={{ backgroundColor: theme.colors[1] }}
                      />
                    </div>

                    <span className="font-normal">{theme.name}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
