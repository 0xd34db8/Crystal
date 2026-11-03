"use client";

import React, { useState } from "react";
import { AppHeader } from "./layout/AppHeader";
import { ThemeToggle } from "./ThemeToggle";
import { Search, Download, Key } from "lucide-react";

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

  const titleElement = (
    <div className="flex items-center text-3xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 font-manrope">
      {isEditing ? (
        <input
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="bg-transparent border-b border-neutral-400 dark:border-neutral-500 outline-none text-neutral-900 dark:text-neutral-100 font-light px-1 py-0 font-manrope min-w-[200px] text-3xl"
        />
      ) : (
        <span
          onClick={() => {
            setTempName(fileName);
            setIsEditing(true);
          }}
          title="Click to rename"
          className="cursor-pointer hover:opacity-80 transition-opacity truncate max-w-sm md:max-w-md lg:max-w-xl"
        >
          {fileName}
        </span>
      )}
    </div>
  );

  const actions = (
    <>
      {/* Theme Toggle */}
      <ThemeToggle />

      {/* API Key button if handler passed */}
      {onApiKeyClick && (
        <button
          type="button"
          onClick={onApiKeyClick}
          title="Configure API Key"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-normal transition-all cursor-pointer font-manrope ${
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1C1C1E] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-normal shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-600 transition-all font-manrope cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
          <span className="hidden sm:inline">Export .crystal</span>
        </button>
      )}

      {/* Search Bar */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder=""
          aria-label="Search syllabus topics"
          className="w-36 md:w-52 pl-4 pr-9 py-1.5 text-xs font-normal bg-white dark:bg-[#1C1C1E] text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 rounded-full border border-neutral-300 dark:border-neutral-700 shadow-xs focus:outline-none focus:border-neutral-500 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 transition-all font-manrope"
        />
        <Search className="absolute right-3.5 w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 pointer-events-none" />
      </div>
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
