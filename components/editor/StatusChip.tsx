"use client";

import React, { useState, useRef, useEffect } from "react";
import { SyllabusItem } from "@/types/syllabus";
import { calculateSyllabusStats } from "@/lib/syllabusUtils";
import { ChevronUp } from "lucide-react";

interface StatusChipProps {
  items: SyllabusItem[];
}

export const StatusChip: React.FC<StatusChipProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const stats = calculateSyllabusStats(items);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative inline-block select-none font-manrope"
    >
      {/* Dropdown Popover shown ABOVE the chip when clicked */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 max-w-[calc(100vw-2rem)] bg-card rounded-2xl shadow-xl border border-border p-4 z-50 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-border-subtle">
            <span className="font-semibold text-foreground">
              Progress Breakdown
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              {stats.total} topics
            </span>
          </div>

          {/* Mini stacked progress bar */}
          <div className="w-full h-2 rounded-full bg-subtle overflow-hidden flex mb-3.5">
            <div
              style={{ width: `${stats.done.pct}%` }}
              className="bg-status-done-fg h-full transition-all duration-300"
              title={`Done: ${stats.done.pct}%`}
            />
            <div
              style={{ width: `${stats.partial.pct}%` }}
              className="bg-status-partial-fg h-full transition-all duration-300"
              title={`Partially: ${stats.partial.pct}%`}
            />
            <div
              style={{ width: `${stats.barely.pct}%` }}
              className="bg-status-barely-fg h-full transition-all duration-300"
              title={`Barely: ${stats.barely.pct}%`}
            />
          </div>

          {/* Detailed Breakdown List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-foreground-subtle">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-done-fg" />
                <span className="text-foreground font-medium">
                  Done:
                </span>
              </span>
              <span className="font-mono text-[11px]">
                {stats.done.count} ({stats.done.pct}%)
              </span>
            </div>

            <div className="flex items-center justify-between text-foreground-subtle">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-partial-fg" />
                <span className="text-foreground font-medium">
                  Partially:
                </span>
              </span>
              <span className="font-mono text-[11px]">
                {stats.partial.count} ({stats.partial.pct}%)
              </span>
            </div>

            <div className="flex items-center justify-between text-foreground-subtle">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-barely-fg" />
                <span className="text-foreground font-medium">
                  Barely:
                </span>
              </span>
              <span className="font-mono text-[11px]">
                {stats.barely.count} ({stats.barely.pct}%)
              </span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-untouched-fg opacity-50" />
                <span>Untouched:</span>
              </span>
              <span className="font-mono text-[11px]">
                {stats.untouched.count} ({stats.untouched.pct}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Status Chip Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-done-bg text-status-done-fg border border-status-done-border text-xs font-normal tracking-tight shadow-2xs hover:opacity-90 transition-all cursor-pointer"
        title="Click to view progress breakdown"
      >
        <span>{stats.done.pct}% done</span>
        <ChevronUp
          className={`w-3.5 h-3.5 text-status-done-fg transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
};
