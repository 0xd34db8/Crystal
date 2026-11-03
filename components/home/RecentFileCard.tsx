"use client";

import React from "react";
import { SyllabusData } from "@/types/syllabus";
import { calculateSyllabusStats } from "@/lib/syllabusUtils";
import { Clock, Trash2 } from "lucide-react";

interface RecentFileCardProps {
  file: SyllabusData;
  onOpen: (id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export const RecentFileCard: React.FC<RecentFileCardProps> = ({
  file,
  onOpen,
  onDelete,
}) => {
  const stats = calculateSyllabusStats(file.items);

  return (
    <div
      onClick={() => onOpen(file.id)}
      className="group px-5 py-4 rounded-2xl border border-neutral-200/90 hover:border-neutral-400 hover:shadow-xs transition-all cursor-pointer bg-neutral-50/40 hover:bg-white flex items-center justify-between font-manrope"
    >
      <div className="min-w-0 pr-4">
        <h3 className="text-sm font-medium text-neutral-900 truncate group-hover:text-blue-600 transition-colors">
          {file.fileName}
        </h3>

        <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-neutral-400" />
            {file.lastModified || "Recently"}
          </span>
          <span>•</span>
          <span>{stats.total} topics</span>
        </div>
      </div>

      {/* Progress Chip matching Draft Style */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div
          className="px-3 py-1 rounded-full bg-[#BAE6FD] text-neutral-900 border border-[#0284C7]/80 text-[11px] font-normal tracking-tight shadow-2xs"
          title="Progress (% completed)"
        >
          {stats.done.pct}% done
        </div>

        <button
          type="button"
          onClick={(e) => onDelete(e, file.id)}
          className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          title="Remove from recents"
          aria-label={`Remove ${file.fileName} from recents`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

