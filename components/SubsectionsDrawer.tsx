"use client";

import React, { useState, useEffect, useRef } from "react";
import { SyllabusItem, TopicNote, NoteComment } from "@/types/syllabus";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { Extension } from "@tiptap/core";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  FileCode,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
  RemoveFormatting,
  Undo2,
  Redo2,
  Plus,
  Trash2,
  Sparkles,
  Pencil,
} from "lucide-react";

const CustomUnderline = Underline.extend({
  addStorage() {
    return {
      markdown: {
        serialize: {
          open: "<u>",
          close: "</u>",
        },
      },
    };
  },
});

const CustomHighlight = Highlight.extend({
  addStorage() {
    return {
      markdown: {
        serialize: {
          open: "==",
          close: "==",
        },
      },
    };
  },
});

const getEditorMarkdown = (ed: any): string => {
  if (!ed) return "";
  return (ed.storage as any)?.markdown?.getMarkdown?.() ?? "";
};

interface SubsectionsDrawerProps {
  selectedTopic: SyllabusItem;
  onSaveNote: (topicId: string, note: TopicNote) => void;
  apiKey?: string;
  onOpenApiKeyModal?: () => void;
  onClose: () => void;
}

export const SubsectionsDrawer: React.FC<SubsectionsDrawerProps> = ({
  selectedTopic,
  onSaveNote,
  onClose,
}) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);
  const subComments: NoteComment[] = selectedTopic.note?.subComments || [];

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Close on Click Outside
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        const target = e.target as HTMLElement | null;
        if (target?.closest("[data-subsections-trigger]")) {
          return;
        }
        onClose();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onClose]);

  const handleSaveSubComment = () => {
    if (!editor) return;
    const content = getEditorMarkdown(editor).trim();
    if (!content) return;

    let updatedSubComments: NoteComment[];

    if (editingCommentId) {
      updatedSubComments = subComments.map((c) =>
        c.id === editingCommentId
          ? {
              ...c,
              content,
            }
          : c,
      );
    } else {
      const newComment: NoteComment = {
        id: `comment-${Date.now()}`,
        author: "",
        timestamp:
          new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }) +
          " at " +
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        content,
      };
      updatedSubComments = [...subComments, newComment];
    }

    const updatedNote: TopicNote = {
      id: selectedTopic.note?.id || `note-${selectedTopic.id}`,
      title: selectedTopic.title,
      content: selectedTopic.note?.content || "",
      subComments: updatedSubComments,
      updatedAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    onSaveNote(selectedTopic.id, updatedNote);
    editor.commands.setContent("");
    setEditingCommentId(null);
    setIsAdding(false);
  };

  const handleSaveSubCommentRef = useRef(handleSaveSubComment);
  handleSaveSubCommentRef.current = handleSaveSubComment;

  // Live TipTap Markdown Editor for Sub-sections
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      CustomUnderline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CustomHighlight.configure({
        multicolor: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder:
          "Write sub-section notes (# for heading, - for list, [ ] for todo)...",
      }),
      Extension.create({
        name: "subSectionSubmitShortcut",
        addKeyboardShortcuts() {
          return {
            "Mod-Enter": () => {
              handleSaveSubCommentRef.current();
              return true;
            },
          };
        },
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: "-",
      }),
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none focus:outline-none min-h-[90px] max-h-[160px] overflow-y-auto text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 px-3 py-2 font-manrope cursor-text",
      },
    },
  });

  // Reset composer state if topic changes
  useEffect(() => {
    setEditingCommentId(null);
    setIsAdding(false);
    if (editor) {
      editor.commands.setContent("");
    }
  }, [selectedTopic.id, editor]);

  const handleStartEdit = (comment: NoteComment) => {
    setEditingCommentId(comment.id);
    setIsAdding(true);
    if (editor) {
      editor.commands.setContent(comment.content || "");
      setTimeout(() => {
        editor.commands.focus("end");
      }, 50);
    }
  };

  const handleOpenAddForm = () => {
    setEditingCommentId(null);
    setIsAdding(true);
    if (editor) {
      editor.commands.setContent("");
      setTimeout(() => {
        editor.commands.focus();
      }, 50);
    }
  };

  const handleCloseAddForm = () => {
    if (editor) {
      editor.commands.setContent("");
    }
    setEditingCommentId(null);
    setIsAdding(false);
  };

  const handleDeleteSubComment = (commentId: string) => {
    if (editingCommentId === commentId) {
      setEditingCommentId(null);
      if (editor) {
        editor.commands.setContent("");
      }
      setIsAdding(false);
    }
    const updatedSubComments = subComments.filter((c) => c.id !== commentId);
    const updatedNote: TopicNote = {
      id: selectedTopic.note?.id || `note-${selectedTopic.id}`,
      title: selectedTopic.title,
      content: selectedTopic.note?.content || "",
      subComments: updatedSubComments,
      updatedAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    onSaveNote(selectedTopic.id, updatedNote);
  };

  const getBtnClass = (isActive: boolean, isDisabled: boolean = false) =>
    `p-1.5 rounded transition-colors cursor-pointer ${
      isDisabled
        ? "text-neutral-300 dark:text-neutral-600 cursor-not-allowed"
        : isActive
          ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-semibold"
          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
    }`;

  return (
    <div
      ref={popoverRef}
      className="fixed bottom-14 right-4 sm:right-6 w-[380px] sm:w-[460px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[75vh] bg-white dark:bg-[#1C1C1E] border border-black/15 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 font-manrope"
    >
      {/* Scrollable Subsections Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-neutral-50/30 dark:bg-[#141416]/30">
        {subComments.length === 0 && !isAdding && (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-neutral-400 dark:text-neutral-500 select-none">
            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-2.5 text-neutral-400">
              <Sparkles className="w-5 h-5 text-blue-500/70" />
            </div>
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-200 mb-1">
              No sub-sections yet
            </p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 max-w-[240px]">
              Add supplementary notes, formulas, checklists, or code snippets
              for this topic.
            </p>
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add first sub-section</span>
            </button>
          </div>
        )}

        {subComments.map((comment) => {
          const isCurrentlyEditing = editingCommentId === comment.id;
          return (
            <div
              key={comment.id}
              onDoubleClick={() => handleStartEdit(comment)}
              className={`p-3 rounded-xl space-y-1.5 text-xs transition-colors group cursor-default ${
                isCurrentlyEditing
                  ? "bg-blue-50/40 dark:bg-blue-950/20 border border-blue-500/50 dark:border-blue-400/50 ring-1 ring-blue-500/30 shadow-xs"
                  : "bg-white dark:bg-[#222225] border border-neutral-200/80 dark:border-neutral-700/80 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-600"
              }`}
              title="Double-click to edit"
            >
              <div className="flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500">
                {comment.author && comment.author.trim() ? (
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate pr-2">
                    {comment.author}
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                      {comment.timestamp}
                    </span>
                    {isCurrentlyEditing && (
                      <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-900/50 px-1.5 py-0.5 rounded">
                        Editing
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
                  {comment.author && comment.author.trim() && (
                    <span className="text-[10px] text-neutral-400 mr-1">
                      {comment.timestamp}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(comment);
                    }}
                    className={`transition-opacity cursor-pointer p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                      isCurrentlyEditing
                        ? "text-blue-600 dark:text-blue-400 opacity-100"
                        : "opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                    title="Edit sub-section"
                    aria-label="Edit sub-section"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubComment(comment.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-opacity cursor-pointer p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    title="Delete sub-section"
                    aria-label="Delete sub-section"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="text-neutral-800 dark:text-neutral-200 leading-relaxed text-xs">
                <MarkdownRenderer content={comment.content} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Composer Dock with TipTap Live Markdown Editor & Complete Toolbar */}
      {isAdding ? (
        <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1C1C1E] flex flex-col flex-shrink-0 animate-in slide-in-from-bottom-2 duration-150">
          {/* Complete Rich Formatting Toolbar */}
          {editor && (
            <div className="px-2.5 py-1.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#1A1A1D]/60 flex items-center gap-0.5 overflow-x-auto no-scrollbar text-xs select-none">
              {/* Text Style: Paragraph / Headings */}
              <select
                aria-label="Text style"
                value={
                  editor.isActive("heading", { level: 1 })
                    ? "1"
                    : editor.isActive("heading", { level: 2 })
                      ? "2"
                      : editor.isActive("heading", { level: 3 })
                        ? "3"
                        : "p"
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "p") {
                    editor.chain().focus().setParagraph().run();
                  } else {
                    editor
                      .chain()
                      .focus()
                      .toggleHeading({ level: parseInt(val, 10) as 1 | 2 | 3 })
                      .run();
                  }
                }}
                className="text-[11px] bg-white dark:bg-[#222225] border border-neutral-200 dark:border-neutral-700 rounded px-1.5 py-0.5 text-neutral-700 dark:text-neutral-300 outline-none cursor-pointer font-medium"
                title="Text style"
              >
                <option value="p">Normal text</option>
                <option value="1">Heading 1</option>
                <option value="2">Heading 2</option>
                <option value="3">Heading 3</option>
              </select>

              <div className="w-[1px] h-3.5 bg-neutral-200 dark:bg-neutral-700 mx-0.5" />

              {/* Inline Marks: Bold, Italic, Underline, Strike, Highlight, Code */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={getBtnClass(editor.isActive("bold"))}
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={getBtnClass(editor.isActive("italic"))}
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={getBtnClass(editor.isActive("underline"))}
                title="Underline (Ctrl+U)"
              >
                <UnderlineIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={getBtnClass(editor.isActive("strike"))}
                title="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={getBtnClass(editor.isActive("highlight"))}
                title="Highlight marker"
              >
                <Highlighter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={getBtnClass(editor.isActive("code"))}
                title="Inline Code (Ctrl+E)"
              >
                <Code className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-3.5 bg-neutral-200 dark:bg-neutral-700 mx-0.5" />

              {/* Lists & Structural Elements */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={getBtnClass(editor.isActive("bulletList"))}
                title="Bullet list"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={getBtnClass(editor.isActive("orderedList"))}
                title="Numbered list"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={getBtnClass(editor.isActive("taskList"))}
                title="Checklist / Todo"
              >
                <CheckSquare className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={getBtnClass(editor.isActive("blockquote"))}
                title="Blockquote"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={getBtnClass(editor.isActive("codeBlock"))}
                title="Code block"
              >
                <FileCode className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-3.5 bg-neutral-200 dark:bg-neutral-700 mx-0.5" />

              {/* Text Alignment */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                className={getBtnClass(editor.isActive({ textAlign: "left" }))}
                title="Align Left"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                className={getBtnClass(
                  editor.isActive({ textAlign: "center" }),
                )}
                title="Align Center"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                className={getBtnClass(editor.isActive({ textAlign: "right" }))}
                title="Align Right"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  editor.chain().focus().setTextAlign("justify").run()
                }
                className={getBtnClass(
                  editor.isActive({ textAlign: "justify" }),
                )}
                title="Align Justify"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-3.5 bg-neutral-200 dark:bg-neutral-700 mx-0.5" />

              {/* Dividers & Clear Formatting */}
              <button
                type="button"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className={getBtnClass(false)}
                title="Horizontal Divider"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().unsetAllMarks().clearNodes().run()
                }
                className={getBtnClass(false)}
                title="Clear formatting"
              >
                <RemoveFormatting className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-3.5 bg-neutral-200 dark:bg-neutral-700 mx-0.5" />

              {/* Undo / Redo */}
              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className={getBtnClass(false, !editor.can().undo())}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className={getBtnClass(false, !editor.can().redo())}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Live TipTap Markdown Canvas */}
          <div
            className="p-1 cursor-text"
            onClick={() => {
              if (editor && !editor.isFocused) {
                editor.commands.focus();
              }
            }}
          >
            <EditorContent editor={editor} />
          </div>

          {/* Action Row */}
          <div className="px-3 py-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-[#1C1C1E]">
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
              <span>
                Press Ctrl+Enter to {editingCommentId ? "save" : "add"}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCloseAddForm}
                className="px-2.5 py-1 rounded text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSubComment}
                className="px-3 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-lg text-xs font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer shadow-2xs transition-colors"
              >
                {editingCommentId ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2.5 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#1C1C1E] flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={handleOpenAddForm}
            className="flex-1 flex items-center justify-between px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50 dark:bg-[#242428] text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600 text-xs transition-colors cursor-pointer"
          >
            <span>Add a sub-section...</span>
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
