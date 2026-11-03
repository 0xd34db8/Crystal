"use client";

import React from "react";

interface WindowControlsProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
}

export const WindowControls: React.FC<WindowControlsProps> = ({
  onClose,
  onMinimize,
  onMaximize,
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={onClose}
        className="w-3.5 h-3.5 rounded-full bg-[#FF2D55] border border-black/10 hover:opacity-80 active:scale-95 cursor-pointer shadow-inner transition-transform"
        title="Close"
        aria-label="Close window"
      />
      <div
        role="button"
        tabIndex={0}
        onClick={onMinimize}
        className="w-3.5 h-3.5 rounded-full bg-[#FFCC00] border border-black/10 hover:opacity-80 active:scale-95 cursor-pointer shadow-inner transition-transform"
        title="Minimize"
        aria-label="Minimize window"
      />
      <div
        role="button"
        tabIndex={0}
        onClick={onMaximize}
        className="w-3.5 h-3.5 rounded-full bg-[#34C759] border border-black/10 hover:opacity-80 active:scale-95 cursor-pointer shadow-inner transition-transform"
        title="Expand"
        aria-label="Expand window"
      />
    </div>
  );
};

