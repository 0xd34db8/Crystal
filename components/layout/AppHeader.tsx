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
    <header className="flex items-center justify-between px-8 py-3.5 bg-[#F9F9F9] dark:bg-[#121212] select-none font-manrope">
      {/* Left: Crystal Logo + Title/FileName */}
      <div className="flex items-center gap-4 min-w-0">
        <Link href="/" title="Crystal Home" className="flex items-center flex-shrink-0">
          <CrystalLogo className="w-14 h-[53px] hover:opacity-90 transition-opacity cursor-pointer drop-shadow-xs" />
        </Link>

        {titleElement ? (
          titleElement
        ) : (
          <h1 className="text-3xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
            Crystal
          </h1>
        )}
      </div>

      {/* Right: Actions (pushed to the right position) */}
      {actions && (
        <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
};


