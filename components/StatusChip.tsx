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
        <div className="absolute bottom-full left-0 mb-2 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-xl border border-neutral-200/90 dark:border-neutral-700 p-4 z-50 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-100 dark:border-neutral-800">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Progress Breakdown
            </span>
            <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
              {stats.total} topics
            </span>
          </div>

          {/* Mini stacked progress bar */}
          <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex mb-3.5">
            <div
              style={{ width: `${stats.done.pct}%` }}
              className="bg-[#0066FF] h-full transition-all duration-300"
              title={`Done: ${stats.done.pct}%`}
            />
            <div
              style={{ width: `${stats.partial.pct}%` }}
              className="bg-[#28A745] h-full transition-all duration-300"
              title={`Partially: ${stats.partial.pct}%`}
            />
            <div
              style={{ width: `${stats.barely.pct}%` }}
              className="bg-[#E53E3E] h-full transition-all duration-300"
              title={`Barely: ${stats.barely.pct}%`}
            />
          </div>

          {/* Detailed Breakdown List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0066FF]" />
                <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                  Done:
                </span>
              </span>
              <span className="font-mono text-[11px]">
                {stats.done.count} ({stats.done.pct}%)
              </span>
            </div>

            <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#28A745]" />
                <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                  Partially:
                </span>
              </span>
              <span className="font-mono text-[11px]">
                {stats.partial.count} ({stats.partial.pct}%)
              </span>
            </div>

            <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E53E3E]" />
                <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                  Barely:
                </span>
              </span>
              <span className="font-mono text-[11px]">
                {stats.barely.count} ({stats.barely.pct}%)
              </span>
            </div>

            <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                <span>Untouched:</span>
              </span>
              <span className="font-mono text-[11px]">
                {stats.untouched.count} ({stats.untouched.pct}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Status Chip Button matching draft */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#BAE6FD] dark:bg-sky-950/80 text-neutral-900 dark:text-sky-200 border border-[#0284C7]/80 dark:border-sky-600/60 text-xs font-normal tracking-tight shadow-2xs hover:bg-[#A5DDFB] dark:hover:bg-sky-900/80 transition-all cursor-pointer"
        title="Click to view progress breakdown"
      >
        <span>{stats.done.pct}% done</span>
        <ChevronUp
          className={`w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
};
