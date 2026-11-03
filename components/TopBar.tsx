"use client";

import React, { useState } from "react";
import { AppHeader } from "./layout/AppHeader";
import { ThemeToggle } from "./ThemeToggle";
import { Search, Download, Key, X } from "lucide-react";

interface TopBarProps {
  fileName: string;
  onFileNameChange: (name: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExport?: () => void;
  onApiKeyClick?: () => void;
  apiKeyConfigured?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  fileName,
  onFileNameChange,
  searchQuery,
  onSearchChange,
  onExport,
  onApiKeyClick,
  apiKeyConfigured,
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(fileName);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleBlur = () => {
    setIsEditing(false);
    if (tempName.trim()) {
      onFileNameChange(tempName.trim());
    } else {
      setTempName(fileName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setTempName(fileName);
      setIsEditing(false);
    }
  };

  // If mobile search overlay is open, show full-width search bar in header
  if (isMobileSearchOpen) {
    return (
      <header className="flex items-center justify-between px-3 sm:px-6 py-2.5 bg-[#F9F9F9] dark:bg-[#121212] select-none font-manrope border-b border-black/5 dark:border-white/5 md:border-b-0 animate-in fade-in duration-150">
        <div className="relative flex-1 flex items-center mr-2">
          <Search className="absolute left-3 w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search syllabus topics..."
            autoFocus
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#1C1C1E] border border-neutral-300 dark:border-neutral-700 rounded-full outline-none focus:border-blue-500 dark:focus:border-blue-500 font-manrope text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setIsMobileSearchOpen(false);
            onSearchChange("");
          }}
          className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Close search"
        >
          <X className="w-4 h-4" />
        </button>
      </header>
    );
  }

  const titleElement = (
    <div className="flex items-center text-base sm:text-xl md:text-2xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 font-manrope min-w-0">
      {isEditing ? (
        <input
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="bg-transparent border-b border-neutral-400 dark:border-neutral-500 outline-none text-neutral-900 dark:text-neutral-100 font-light px-1 py-0 font-manrope min-w-[100px] max-w-[180px] sm:min-w-[200px] text-base sm:text-xl md:text-2xl"
        />
      ) : (
        <span
          onClick={() => {
            setTempName(fileName);
            setIsEditing(true);
          }}
          title="Click to rename"
          className="cursor-pointer hover:opacity-80 transition-opacity truncate max-w-[140px] xs:max-w-[190px] sm:max-w-xs md:max-w-md lg:max-w-xl"
        >
          {fileName}
        </span>
      )}
    </div>
  );

  const actions = (
    <>
      {/* Mobile Search Icon Button */}
      <button
        type="button"
        onClick={() => setIsMobileSearchOpen(true)}
        className="flex md:hidden p-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1C1C1E] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer items-center justify-center"
        title="Search topics"
        aria-label="Search topics"
      >
        <Search className="w-3.5 h-3.5" />
      </button>

      {/* Desktop Search Bar */}
      <div className="relative hidden md:flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder=""
          aria-label="Search syllabus topics"
          className="w-36 lg:w-52 pl-4 pr-9 py-1.5 text-xs font-normal bg-white dark:bg-[#1C1C1E] text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 rounded-full border border-neutral-300 dark:border-neutral-700 shadow-xs focus:outline-none focus:border-neutral-500 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 transition-all font-manrope"
        />
        <Search className="absolute right-3.5 w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 pointer-events-none" />
      </div>

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* API Key button */}
      {onApiKeyClick && (
        <button
          type="button"
          onClick={onApiKeyClick}
          title="Configure API Key"
          className={`flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-full border text-xs font-normal transition-all cursor-pointer font-manrope ${
            apiKeyConfigured
              ? "bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
              : "bg-white dark:bg-[#1C1C1E] border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600 shadow-2xs"
          }`}
        >
          <Key className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
          <span className="hidden sm:inline">
            {apiKeyConfigured ? "API Ready" : "API Key"}
          </span>
        </button>
      )}

      {/* Export .crystal button */}
      {onExport && (
        <button
          type="button"
          onClick={onExport}
          title="Download as .crystal format (Ctrl+S)"
          className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1C1C1E] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-normal shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-600 transition-all font-manrope cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
          <span className="hidden sm:inline">Export .crystal</span>
        </button>
      )}
    </>
  );

  return (
    <AppHeader
      titleElement={titleElement}
      actions={actions}
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
    />
  );
};
