"use client";

import React, { useState } from "react";
import { SyllabusItem, TopicStatus } from "@/types/syllabus";
import { NoteIcon } from "@/components/ui/NoteIcon";
import {
  MoreHorizontal,
  Plus,
  Check,
  X,
  CornerDownRight,
  Braces,
  Undo2,
  Redo2,
} from "lucide-react";
import { TreeContextMenu } from "./TreeContextMenu";
import { JsonTreeEditor } from "./JsonTreeEditor";

interface SyllabusTreeProps {
  items: SyllabusItem[];
  selectedTopicId: string | null;
  onSelectTopic: (topic: SyllabusItem) => void;
  onToggleExpand: (itemId: string) => void;
  onUpdateStatus: (itemId: string, status: TopicStatus) => void;
  onDeleteTopic?: (itemId: string) => void;
  onAddTopic?: (parentId: string | null, title: string) => void;
  onRenameTopic?: (itemId: string, newTitle: string) => void;
  onToggleNote?: (itemId: string) => void;
  onUpdateItems?: (items: SyllabusItem[]) => void;
  onUpdateTitle?: (title: string) => void;
  courseTitle?: string;
  searchQuery?: string;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const SyllabusTree: React.FC<SyllabusTreeProps> = ({
  items,
  selectedTopicId,
  onSelectTopic,
  onToggleExpand,
  onUpdateStatus,
  onDeleteTopic,
  onAddTopic,
  onRenameTopic,
  onToggleNote,
  onUpdateItems,
  onUpdateTitle,
  courseTitle,
  searchQuery = "",
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [addingSubtopicToId, setAddingSubtopicToId] = useState<string | null>(
    null,
  );
  const [subtopicInput, setSubtopicInput] = useState("");
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [rootInput, setRootInput] = useState("");
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicTitle, setEditingTopicTitle] = useState("");

  const handleCreateSubtopic = (parentId: string) => {
    if (subtopicInput.trim() && onAddTopic) {
      onAddTopic(parentId, subtopicInput.trim());
    }
    setSubtopicInput("");
    setAddingSubtopicToId(null);
  };

  const handleCreateRootTopic = () => {
    if (rootInput.trim() && onAddTopic) {
      onAddTopic(null, rootInput.trim());
    }
    setRootInput("");
    setIsAddingRoot(false);
  };

  const handleSaveRename = (itemId: string) => {
    const trimmed = editingTopicTitle.trim();
    if (trimmed && onRenameTopic) {
      onRenameTopic(itemId, trimmed);
    }
    setEditingTopicId(null);
  };

  // Status pill styling resolver when selected vs unselected
  const getTopicPillStyles = (status: TopicStatus, isSelected: boolean) => {
    if (isSelected) {
      switch (status) {
        case "done":
          return "bg-status-done-bg text-status-done-fg border border-status-done-border font-medium px-2.5 py-0.5 rounded-full shadow-xs";
        case "partial":
          return "bg-status-partial-bg text-status-partial-fg border border-status-partial-border font-medium px-2.5 py-0.5 rounded-full shadow-xs";
        case "barely":
          return "bg-status-barely-bg text-status-barely-fg border border-status-barely-border font-medium px-2.5 py-0.5 rounded-full shadow-xs";
        case "untouched":
        default:
          return "bg-status-untouched-bg text-status-untouched-fg border border-status-untouched-border font-medium px-2.5 py-0.5 rounded-full shadow-xs";
      }
    }

    switch (status) {
      case "done":
        return "text-status-done-fg hover:bg-status-done-bg rounded px-1.5 py-0.5";
      case "partial":
        return "text-status-partial-fg hover:bg-status-partial-bg rounded px-1.5 py-0.5";
      case "barely":
        return "text-status-barely-fg hover:bg-status-barely-bg rounded px-1.5 py-0.5";
      case "untouched":
      default:
        return "text-foreground hover:bg-subtle rounded px-1.5 py-0.5";
    }
  };

  const renderTreeItem = (
    item: SyllabusItem,
    level: number = 0,
    isLastChild: boolean = false,
  ) => {
    const hasChildren = Boolean(item.children && item.children.length > 0);
    const isSelected = item.id === selectedTopicId;
    const isExpanded = item.isExpanded ?? false;

    // Filter by search query if present
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.children &&
        item.children.some((child) =>
          child.title.toLowerCase().includes(searchQuery.toLowerCase()),
        ));

    if (!matchesSearch) return null;

    return (
      <div key={item.id} className="relative group select-none">
        <div
          className={`relative flex items-center py-1 text-xs transition-colors rounded-lg group ${
            level === 0 ? "mt-1 font-medium" : "my-0.5"
          }`}
          style={{ paddingLeft: `${Math.max(level * 14, 2)}px` }}
        >
          {/* Collapse/Expand Toggle or Spacer */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(item.id);
              }}
              className="mr-1.5 w-3.5 h-3.5 flex items-center justify-center text-foreground-subtle hover:text-foreground transition-transform cursor-pointer"
            >
              {isExpanded ? (
                <span className="text-[9px] leading-none">▼</span>
              ) : (
                <span className="text-[9px] leading-none">▶</span>
              )}
            </button>
          ) : (
            <div className="w-3.5 mr-1.5 flex-shrink-0" />
          )}

          {/* Topic Title Badge / Label */}
          <div
            onClick={() => onSelectTopic(item)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (onRenameTopic) {
                setEditingTopicId(item.id);
                setEditingTopicTitle(item.title);
              }
            }}
            className={`cursor-pointer inline-flex items-center gap-1.5 transition-all ${getTopicPillStyles(
              item.status,
              isSelected,
            )}`}
          >
            {editingTopicId === item.id ? (
              <input
                type="text"
                autoFocus
                value={editingTopicTitle}
                onChange={(e) => setEditingTopicTitle(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSaveRename(item.id);
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    setEditingTopicId(null);
                  }
                }}
                onBlur={() => handleSaveRename(item.id)}
                className="px-1.5 py-0.5 text-xs bg-card text-foreground border border-border rounded outline-none focus:ring-1 focus:ring-accent font-manrope min-w-[120px]"
              />
            ) : (
              <span className="leading-relaxed tracking-tight">
                {item.title}
              </span>
            )}

            {/* Note Icon strictly displayed beside topics with a note */}
            {item.hasNote && (
              <NoteIcon className="w-3.5 h-3.5 ml-0.5 flex-shrink-0" />
            )}
          </div>

          {/* Action buttons (hover) */}
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 pr-1">
            {onAddTopic && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAddingSubtopicToId(item.id);
                  setSubtopicInput("");
                }}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-subtle text-muted-foreground hover:text-foreground cursor-pointer"
                title="Add Subtopic"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuId(activeMenuId === item.id ? null : item.id);
              }}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-subtle text-muted-foreground hover:text-foreground cursor-pointer"
              title="Options"
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>
          </div>

          {/* Context Popover Menu */}
          {activeMenuId === item.id && (
            <TreeContextMenu
              item={item}
              onUpdateStatus={onUpdateStatus}
              onToggleNote={onToggleNote}
              onStartAddSubtopic={(parentId) => {
                setAddingSubtopicToId(parentId);
                setSubtopicInput("");
              }}
              onStartRename={(id, title) => {
                setEditingTopicId(id);
                setEditingTopicTitle(title);
              }}
              onDeleteTopic={onDeleteTopic}
              onClose={() => setActiveMenuId(null)}
            />
          )}
        </div>

        {/* Inline Add Subtopic Input */}
        {addingSubtopicToId === item.id && (
          <div
            className="flex items-center gap-1.5 py-1 pr-2"
            style={{ paddingLeft: `${Math.max((level + 1) * 14 + 4, 18)}px` }}
          >
            <CornerDownRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={subtopicInput}
              onChange={(e) => setSubtopicInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateSubtopic(item.id);
                if (e.key === "Escape") setAddingSubtopicToId(null);
              }}
              placeholder="New subtopic title..."
              className="flex-1 px-2 py-0.5 text-xs bg-card text-foreground border border-border rounded outline-none focus:border-accent font-manrope"
            />
            <button
              onClick={() => handleCreateSubtopic(item.id)}
              className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded cursor-pointer"
              title="Add"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => setAddingSubtopicToId(null)}
              className="p-1 text-muted-foreground hover:bg-subtle rounded cursor-pointer"
              title="Cancel"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Child items with tree guide line */}
        {hasChildren && isExpanded && (
          <div className="relative pl-3">
            {/* Tree guide vertical line */}
            <div
              className="absolute top-0 bottom-1 w-[1px] bg-border"
              style={{ left: `${Math.max(level * 14 + 11, 10)}px` }}
            />
            <div className="space-y-0.5">
              {item.children!.map((child, index) =>
                renderTreeItem(
                  child,
                  level + 1,
                  index === item.children!.length - 1,
                ),
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleToggleJsonMode = () => {
    setIsJsonMode((prev) => !prev);
  };

  return (
    <div
      className="h-full flex flex-col select-none font-manrope overflow-hidden"
      onClick={() => setActiveMenuId(null)}
    >
      {isJsonMode ? (
        <JsonTreeEditor
          items={items}
          courseTitle={courseTitle}
          onUpdateItems={onUpdateItems}
          onUpdateTitle={onUpdateTitle}
          onClose={handleToggleJsonMode}
        />
      ) : (
        <div className="h-full flex flex-col p-4 overflow-y-auto select-none font-manrope">
          <div className="flex-1 space-y-1 pb-10">
            {/* Top row with Undo, Redo, and JSON toggle buttons on the right */}
            <div className="flex justify-end items-center gap-1 -mt-1 -mr-1 mb-1">
              {onUndo && (
                <button
                  type="button"
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-subtle disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Undo tree change (Ctrl+Z)"
                  aria-label="Undo tree change"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onRedo && (
                <button
                  type="button"
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-subtle disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Redo tree change (Ctrl+Y)"
                  aria-label="Redo tree change"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleToggleJsonMode}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-subtle transition-colors cursor-pointer"
                title="Edit tree as JSON"
                aria-label="Edit tree as JSON"
              >
                <Braces className="w-3.5 h-3.5" />
              </button>
            </div>

            {items.map((item, idx) =>
              renderTreeItem(item, 0, idx === items.length - 1),
            )}

            {/* Inline Add Root Topic */}
            {isAddingRoot && (
              <div className="flex items-center gap-1.5 py-1.5 px-1 mt-3">
                <input
                  type="text"
                  autoFocus
                  value={rootInput}
                  onChange={(e) => setRootInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateRootTopic();
                    if (e.key === "Escape") setIsAddingRoot(false);
                  }}
                  placeholder="New module or unit title..."
                  className="flex-1 px-2.5 py-1 text-xs bg-card text-foreground border border-border rounded-lg outline-none focus:border-accent font-manrope"
                />
                <button
                  onClick={handleCreateRootTopic}
                  className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded cursor-pointer"
                  title="Add"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsAddingRoot(false)}
                  className="p-1 text-muted-foreground hover:bg-subtle rounded cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Add Topic Root Button */}
          {onAddTopic && !isAddingRoot && (
            <div className="pt-4 mt-6 border-t border-border-subtle">
              <button
                onClick={() => {
                  setIsAddingRoot(true);
                  setRootInput("");
                }}
                className="w-full py-2 px-3 border border-dashed border-border hover:border-border hover:bg-subtle text-foreground-subtle rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Add Topic</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
