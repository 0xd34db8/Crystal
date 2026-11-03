"use client";

import React, { useState } from "react";
import { AppHeader } from "./layout/AppHeader";
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
    <div className="flex items-center text-3xl font-light tracking-tight text-neutral-900 font-manrope">
      {isEditing ? (
        <input
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="bg-transparent border-b border-neutral-400 outline-none text-neutral-900 font-light px-1 py-0 font-manrope min-w-[200px] text-3xl"
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
      {/* API Key button if handler passed */}
      {onApiKeyClick && (
        <button
          type="button"
          onClick={onApiKeyClick}
          title="Configure API Key"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-normal transition-all cursor-pointer font-manrope ${
            apiKeyConfigured
              ? "bg-emerald-50/90 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
              : "bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400 shadow-2xs"
          }`}
        >
          <Key className="w-3.5 h-3.5 text-neutral-600" />
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
          title="Download as .crystal format"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-normal shadow-2xs hover:border-neutral-400 transition-all font-manrope cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-neutral-600" />
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
          className="w-36 md:w-52 pl-4 pr-9 py-1.5 text-xs font-normal bg-white text-neutral-800 placeholder-neutral-400 rounded-full border border-neutral-300 shadow-xs focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 transition-all font-manrope"
        />
        <Search className="absolute right-3.5 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
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
