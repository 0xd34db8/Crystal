"use client";

import React from "react";
import Link from "next/link";
import { CrystalLogo } from "@/components/CrystalLogo";

interface AppHeaderProps {
  /**
   * Title or interactive element displayed beside the Crystal logo
   */
  titleElement?: React.ReactNode;
  /**
   * Right-aligned controls (e.g. search, export button, API key trigger)
   */
  actions?: React.ReactNode;
  /**
   * Optional custom close/minimize/maximize handlers
   */
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  titleElement,
  actions,
}) => {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-2.5 sm:py-3.5 bg-[#F9F9F9] dark:bg-[#121212] select-none font-manrope border-b border-black/5 dark:border-white/5 md:border-b-0">
      {/* Left: Crystal Logo + Title/FileName */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1 mr-2">
        <Link href="/" title="Crystal Home" className="flex items-center flex-shrink-0">
          <CrystalLogo className="w-10 h-[38px] sm:w-14 sm:h-[53px] hover:opacity-90 transition-opacity cursor-pointer drop-shadow-xs" />
        </Link>

        {titleElement ? (
          titleElement
        ) : (
          <h1 className="text-xl sm:text-2xl md:text-3xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
            Crystal
          </h1>
        )}
      </div>

      {/* Right: Actions (pushed to the right position) */}
      {actions && (
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
};


