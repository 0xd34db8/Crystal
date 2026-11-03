import React from "react";

export const NoteIcon: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => {
  return (
    <span title="Topic has taken notes" className="inline-flex items-center">
      <svg
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors ${className}`}
      >
        <rect
          x="2.5"
          y="1.5"
          width="11"
          height="13"
          rx="2"
          fill="white"
          stroke="#8E8E93"
          strokeWidth="1.2"
        />
        <line x1="5" y1="5" x2="11" y2="5" stroke="#8E8E93" strokeWidth="1" strokeLinecap="round" />
        <line x1="5" y1="8" x2="11" y2="8" stroke="#8E8E93" strokeWidth="1" strokeLinecap="round" />
        <line x1="5" y1="11" x2="9" y2="11" stroke="#8E8E93" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </span>
  );
};
