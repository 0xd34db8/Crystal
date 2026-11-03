"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("crystal_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("crystal_theme", "light");
    }
  };

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-full ${className}`} aria-hidden="true" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`p-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1C1C1E] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer flex items-center justify-center ${className}`}
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5 text-amber-400" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-neutral-600" />
      )}
    </button>
  );
};

