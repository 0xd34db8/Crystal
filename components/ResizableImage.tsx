"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";

export const ResizableImage: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
  editor,
  getPos,
  deleteNode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [liveWidth, setLiveWidth] = useState<number | null>(
    typeof node.attrs.width === "number"
      ? node.attrs.width
      : node.attrs.width
        ? parseInt(node.attrs.width, 10)
        : null
  );

  // Sync width if updated externally
  useEffect(() => {
    if (!isResizing) {
      const parsed =
        typeof node.attrs.width === "number"
          ? node.attrs.width
          : node.attrs.width
            ? parseInt(node.attrs.width, 10)
            : null;
      setLiveWidth(parsed);
    }
  }, [node.attrs.width, isResizing]);

  const textAlign = node.attrs.textAlign || "left";

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof getPos === "function") {
      const pos = getPos();
      if (typeof pos === "number") {
        editor.commands.setNodeSelection(pos);
      }
    }
  };

  const handleAlign = (alignment: "left" | "center" | "right") => {
    updateAttributes({ textAlign: alignment });
    if (editor && typeof getPos === "function") {
      const pos = getPos();
      if (typeof pos === "number") {
        editor.chain().setNodeSelection(pos).setTextAlign(alignment).run();
      }
    }
  };

  const startResize = useCallback(
    (e: React.MouseEvent, direction: "se" | "sw" | "e" | "w") => {
      e.preventDefault();
      e.stopPropagation();

      const container = containerRef.current;
      if (!container) return;

      const startX = e.clientX;
      const startWidth = container.getBoundingClientRect().width;
      const parentElement =
        container.closest(".ProseMirror") || container.parentElement;
      const maxWidth = parentElement ? parentElement.clientWidth : 800;

      setIsResizing(true);

      const onMouseMove = (moveEvent: MouseEvent) => {
        moveEvent.preventDefault();
        const deltaX = moveEvent.clientX - startX;
        let newWidth = startWidth;

        // If centered, resizing feels most natural when symmetric
        const multiplier = textAlign === "center" ? 2 : 1;

        if (direction === "se" || direction === "e") {
          newWidth = startWidth + deltaX * multiplier;
        } else if (direction === "sw" || direction === "w") {
          newWidth = startWidth - deltaX * multiplier;
        }

        const clamped = Math.max(80, Math.min(Math.round(newWidth), maxWidth));
        setLiveWidth(clamped);
      };

      const onMouseUp = (upEvent: MouseEvent) => {
        upEvent.preventDefault();
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        setIsResizing(false);

        // Commit final width
        const finalWidth = containerRef.current
          ? Math.round(containerRef.current.getBoundingClientRect().width)
          : null;
        if (finalWidth) {
          updateAttributes({ width: finalWidth });
        }
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [textAlign, updateAttributes]
  );

  // Layout alignment classes
  const justifyClass =
    textAlign === "center"
      ? "justify-center"
      : textAlign === "right"
        ? "justify-end"
        : "justify-start";

  return (
    <NodeViewWrapper
      className={`w-full flex my-3.5 select-none ${justifyClass}`}
      data-align={textAlign}
    >
      <div
        ref={containerRef}
        onClick={handleSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative inline-block group max-w-full"
        style={{
          width: liveWidth ? `${liveWidth}px` : "auto",
          maxWidth: "100%",
        }}
      >
        {/* Floating Context Toolbar when selected */}
        {selected && (
          <div
            className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-white dark:bg-[#1E1E20] border border-neutral-200 dark:border-neutral-700 shadow-md rounded-xl text-xs z-30 animate-in fade-in zoom-in-95 duration-100"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {/* Quick Alignment Actions */}
            <button
              type="button"
              title="Align Left"
              onClick={() => handleAlign("left")}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                textAlign === "left" || !textAlign
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Align Center"
              onClick={() => handleAlign("center")}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                textAlign === "center"
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Align Right"
              onClick={() => handleAlign("right")}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                textAlign === "right"
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-3.5 bg-neutral-200 dark:bg-neutral-700 mx-0.5" />

            {/* Quick Size Presets */}
            {[
              { label: "25%", pct: 0.25 },
              { label: "50%", pct: 0.5 },
              { label: "75%", pct: 0.75 },
              { label: "100%", pct: 1.0 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                title={`Set width to ${preset.label}`}
                onClick={() => {
                  const parentEl =
                    containerRef.current?.closest(".ProseMirror") ||
                    containerRef.current?.parentElement;
                  const maxW = parentEl ? parentEl.clientWidth : 700;
                  const targetWidth = Math.round(maxW * preset.pct);
                  setLiveWidth(targetWidth);
                  updateAttributes({ width: targetWidth });
                }}
                className="px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}

            {liveWidth && (
              <button
                type="button"
                title="Reset to natural size"
                onClick={() => {
                  setLiveWidth(null);
                  updateAttributes({ width: null });
                }}
                className="px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
              >
                Auto
              </button>
            )}

            <div className="w-[1px] h-3.5 bg-neutral-200 dark:bg-neutral-700 mx-0.5" />

            {/* Delete Image */}
            <button
              type="button"
              title="Delete image"
              onClick={() => deleteNode()}
              className="p-1 rounded-md text-neutral-400 hover:text-red-600 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* The Image Element */}
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          title={node.attrs.title || ""}
          className={`block w-full h-auto object-contain rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-2xs transition-shadow cursor-pointer ${
            selected
              ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-neutral-900 shadow-sm"
              : isHovered
                ? "ring-1 ring-neutral-300 dark:ring-neutral-600"
                : ""
          }`}
        />

        {/* Resize Handles */}
        {(selected || isHovered) && (
          <>
            {/* Bottom-Right Handle */}
            <div
              onMouseDown={(e) => startResize(e, "se")}
              className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-blue-600 border-2 border-white dark:border-neutral-900 rounded-full shadow-md z-20 cursor-nwse-resize hover:scale-125 transition-transform"
              title="Drag to resize"
            />
            {/* Bottom-Left Handle */}
            <div
              onMouseDown={(e) => startResize(e, "sw")}
              className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-blue-600 border-2 border-white dark:border-neutral-900 rounded-full shadow-md z-20 cursor-nesw-resize hover:scale-125 transition-transform"
              title="Drag to resize"
            />
            {/* Right Edge Handle */}
            <div
              onMouseDown={(e) => startResize(e, "e")}
              className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-7 bg-blue-600 border border-white dark:border-neutral-900 rounded-full shadow-md z-20 cursor-ew-resize hover:scale-110 transition-transform"
              title="Drag to resize horizontally"
            />
            {/* Left Edge Handle */}
            <div
              onMouseDown={(e) => startResize(e, "w")}
              className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-7 bg-blue-600 border border-white dark:border-neutral-900 rounded-full shadow-md z-20 cursor-ew-resize hover:scale-110 transition-transform"
              title="Drag to resize horizontally"
            />
          </>
        )}

        {/* Live Size Tooltip while dragging */}
        {isResizing && liveWidth && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/80 text-white text-[10px] rounded-md pointer-events-none select-none z-30 font-mono shadow-sm">
            {liveWidth}px
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

