"use client";

import React, { useState } from "react";
import { SyllabusItem, TopicStatus } from "@/types/syllabus";
import { NoteIcon } from "./NoteIcon";
import {
  MoreHorizontal,
  Plus,
  Check,
  FileText,
  Trash2,
  X,
  CornerDownRight,
  Pencil,
  Braces,
  ListTree,
  AlertCircle,
} from "lucide-react";

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
  searchQuery?: string;
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
  searchQuery = "",
}) => {
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
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
          return "bg-blue-100/90 dark:bg-blue-950/80 text-[#0066FF] dark:text-blue-300 border border-blue-400/80 dark:border-blue-500/70 font-medium px-2.5 py-0.5 rounded-full shadow-xs";
        case "partial":
          return "bg-green-100/90 dark:bg-emerald-950/80 text-[#28A745] dark:text-emerald-300 border border-green-500/80 dark:border-emerald-500/70 font-medium px-2.5 py-0.5 rounded-full shadow-xs";
        case "barely":
          return "bg-red-100/90 dark:bg-rose-950/80 text-[#E53E3E] dark:text-rose-300 border border-red-400/80 dark:border-rose-500/70 font-medium px-2.5 py-0.5 rounded-full shadow-xs";
        case "untouched":
        default:
          return "bg-[#C7C7CC] dark:bg-neutral-700 text-neutral-950 dark:text-neutral-100 border border-black/20 dark:border-white/20 font-medium px-2.5 py-0.5 rounded-full shadow-xs";
      }
    }

    switch (status) {
      case "done":
        return "text-[#0066FF] dark:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 rounded px-1.5 py-0.5";
      case "partial":
        return "text-[#28A745] dark:text-emerald-400 hover:bg-green-50/60 dark:hover:bg-emerald-950/40 rounded px-1.5 py-0.5";
      case "barely":
        return "text-[#E53E3E] dark:text-rose-400 hover:bg-red-50/60 dark:hover:bg-rose-950/40 rounded px-1.5 py-0.5";
      case "untouched":
      default:
        return "text-neutral-800 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded px-1.5 py-0.5";
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
              className="mr-1.5 w-3.5 h-3.5 flex items-center justify-center text-neutral-800 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-transform cursor-pointer"
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
                className="px-1.5 py-0.5 text-xs bg-white dark:bg-[#252528] text-neutral-900 dark:text-neutral-100 border border-neutral-400 dark:border-neutral-600 rounded outline-none focus:ring-1 focus:ring-neutral-700 dark:focus:ring-neutral-400 font-manrope min-w-[120px]"
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
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
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
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
              title="Options"
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>
          </div>

          {/* Context Popover Menu */}
          {activeMenuId === item.id && (
            <div
              className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#242426] rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 py-1.5 z-50 text-xs text-neutral-700 dark:text-neutral-200 animate-in fade-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-1 font-semibold text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Progress Status
              </div>

              <button
                onClick={() => {
                  onUpdateStatus(item.id, "done");
                  setActiveMenuId(null);
                }}
                className="w-full px-3 py-1 text-left flex items-center justify-between hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[#0066FF] dark:text-blue-400 font-medium cursor-pointer"
              >
                <span>Done</span>
                {item.status === "done" && <Check className="w-3 h-3" />}
              </button>

              <button
                onClick={() => {
                  onUpdateStatus(item.id, "partial");
                  setActiveMenuId(null);
                }}
                className="w-full px-3 py-1 text-left flex items-center justify-between hover:bg-green-50 dark:hover:bg-emerald-950/40 text-[#28A745] dark:text-emerald-400 font-medium cursor-pointer"
              >
                <span>Partially</span>
                {item.status === "partial" && <Check className="w-3 h-3" />}
              </button>

              <button
                onClick={() => {
                  onUpdateStatus(item.id, "barely");
                  setActiveMenuId(null);
                }}
                className="w-full px-3 py-1 text-left flex items-center justify-between hover:bg-red-50 dark:hover:bg-rose-950/40 text-[#E53E3E] dark:text-rose-400 font-medium cursor-pointer"
              >
                <span>Barely</span>
                {item.status === "barely" && <Check className="w-3 h-3" />}
              </button>

              <button
                onClick={() => {
                  onUpdateStatus(item.id, "untouched");
                  setActiveMenuId(null);
                }}
                className="w-full px-3 py-1 text-left flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
              >
                <span>Untouched</span>
                {item.status === "untouched" && <Check className="w-3 h-3" />}
              </button>

              <div className="my-1 border-t border-neutral-100 dark:border-neutral-700" />

              {/* Note Toggle */}
              {onToggleNote && (
                <button
                  onClick={() => {
                    onToggleNote(item.id);
                    setActiveMenuId(null);
                  }}
                  className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  <FileText className="w-3 h-3" />
                  <span>{item.hasNote ? "Remove Note" : "Create Note"}</span>
                </button>
              )}

              {/* Add Subtopic from menu */}
              {onAddTopic && (
                <button
                  onClick={() => {
                    setActiveMenuId(null);
                    setAddingSubtopicToId(item.id);
                    setSubtopicInput("");
                  }}
                  className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Subtopic</span>
                </button>
              )}

              {/* Rename Topic */}
              {onRenameTopic && (
                <button
                  onClick={() => {
                    setActiveMenuId(null);
                    setEditingTopicId(item.id);
                    setEditingTopicTitle(item.title);
                  }}
                  className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  <Pencil className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                  <span>Rename Topic</span>
                </button>
              )}

              {/* Delete Topic */}
              {onDeleteTopic && (
                <>
                  <div className="my-1 border-t border-neutral-100 dark:border-neutral-700" />
                  <button
                    onClick={() => {
                      onDeleteTopic(item.id);
                      setActiveMenuId(null);
                    }}
                    className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-red-50 dark:hover:bg-rose-950/40 text-red-600 dark:text-red-400 font-medium cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3 text-red-500 dark:text-red-400" />
                    <span>Delete Topic</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Inline Add Subtopic Input */}
        {addingSubtopicToId === item.id && (
          <div
            className="flex items-center gap-1.5 py-1 pr-2"
            style={{ paddingLeft: `${Math.max((level + 1) * 14 + 4, 18)}px` }}
          >
            <CornerDownRight className="w-3 h-3 text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
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
              className="flex-1 px-2 py-0.5 text-xs bg-white dark:bg-[#252528] text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 rounded outline-none focus:border-neutral-500 dark:focus:border-neutral-400 font-manrope"
            />
            <button
              onClick={() => handleCreateSubtopic(item.id)}
              className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded cursor-pointer"
              title="Add"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => setAddingSubtopicToId(null)}
              className="p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-pointer"
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
              className="absolute top-0 bottom-1 w-[1px] bg-black/20 dark:bg-white/20"
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

  const handleOpenJsonMode = () => {
    setJsonText(JSON.stringify(items, null, 2));
    setJsonError(null);
    setIsJsonMode(true);
  };

  const handleCloseJsonMode = () => {
    try {
      const parsed = JSON.parse(jsonText);
      let nextItems: SyllabusItem[];
      if (Array.isArray(parsed)) {
        nextItems = parsed;
      } else if (parsed && Array.isArray(parsed.items)) {
        nextItems = parsed.items;
      } else {
        throw new Error(
          "JSON must be an array of syllabus topics or { items: [...] }",
        );
      }

      const sanitizeItems = (list: any[]): SyllabusItem[] => {
        return list.map((item, i) => ({
          id: item.id || `topic-${Date.now()}-${i}`,
          title: item.title || "Untitled Topic",
          status: item.status || "untouched",
          isExpanded: item.isExpanded ?? true,
          hasNote: Boolean(item.hasNote || item.note),
          note: item.note,
          children:
            item.children && Array.isArray(item.children)
              ? sanitizeItems(item.children)
              : undefined,
        }));
      };

      const sanitized = sanitizeItems(nextItems);
      onUpdateItems?.(sanitized);
      setIsJsonMode(false);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message || "Invalid JSON syntax");
    }
  };

  const handleJsonKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleCloseJsonMode();
    } else if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      setJsonText(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div
      className="h-full flex flex-col select-none font-manrope overflow-hidden"
      onClick={() => setActiveMenuId(null)}
    >
      {isJsonMode ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-100">
          {/* Clean header bar */}
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-neutral-100 dark:border-neutral-800 text-xs select-none">
            <span className="font-mono uppercase tracking-wider text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
              JSON Mode
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(jsonText);
                    setJsonText(JSON.stringify(parsed, null, 2));
                    setJsonError(null);
                  } catch (e: any) {
                    setJsonError(e.message);
                  }
                }}
                className="px-2 py-1 text-[11px] font-mono text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                title="Format JSON indentation"
              >
                Format
              </button>
              <button
                type="button"
                onClick={handleCloseJsonMode}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-medium text-[11px] transition-colors cursor-pointer shadow-2xs"
                title="Apply changes & convert back to tree (Ctrl+Enter)"
              >
                <ListTree className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            </div>
          </div>

          {jsonError && (
            <div className="mx-3 mt-2 p-2 bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900 rounded-lg text-[11px] text-red-600 dark:text-rose-300 flex items-start gap-1.5 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-500" />
              <span className="flex-1 font-mono break-all">{jsonError}</span>
              <button
                type="button"
                onClick={() => setJsonError(null)}
                className="text-red-400 hover:text-red-600 dark:hover:text-rose-200 p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              if (jsonError) setJsonError(null);
            }}
            onKeyDown={handleJsonKeyDown}
            placeholder="Edit syllabus tree JSON here..."
            spellCheck={false}
            className="flex-1 w-full p-3.5 font-mono text-xs leading-relaxed bg-transparent text-neutral-800 dark:text-neutral-200 outline-none resize-none selection:bg-blue-100 dark:selection:bg-blue-900 overflow-y-auto"
          />
        </div>
      ) : (
        <div className="h-full flex flex-col p-4 overflow-y-auto select-none font-manrope">
          <div className="flex-1 space-y-1 pb-10">
            {/* Top row with JSON toggle icon on the right (scrolls away with tree content) */}
            <div className="flex justify-end items-center -mt-1 -mr-1 mb-1">
              <button
                type="button"
                onClick={handleOpenJsonMode}
                className="p-1 rounded-md text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
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
                  className="flex-1 px-2.5 py-1 text-xs bg-white dark:bg-[#252528] text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 rounded-lg outline-none focus:border-neutral-500 dark:focus:border-neutral-400 font-manrope"
                />
                <button
                  onClick={handleCreateRootTopic}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded cursor-pointer"
                  title="Add"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsAddingRoot(false)}
                  className="p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Add Topic Root Button */}
          {onAddTopic && !isAddingRoot && (
            <div className="pt-4 mt-6 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => {
                  setIsAddingRoot(true);
                  setRootInput("");
                }}
                className="w-full py-2 px-3 border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                <span>Add Topic</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
