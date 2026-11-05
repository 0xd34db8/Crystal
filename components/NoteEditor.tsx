"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  SyllabusItem,
  TopicNote,
  NoteComment,
  TopicStatus,
} from "@/types/syllabus";
import { ApiKeyModal } from "./ApiKeyModal";
import { getApiKey } from "@/lib/storage";
import {
  generateNotesWithAI,
  getNoteGenerationPrompt,
} from "@/lib/ai";
import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableImage } from "./ResizableImage";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
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
  Edit3,
  Plus,
  X,
  ArrowLeft,
  Loader2,
  AlertCircle,
  MessageSquare,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ImageIcon,
} from "lucide-react";

// Markdown serialization extensions to cleanly bridge TipTap nodes to standard markdown strings
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute("width") || element.style.width;
          if (!width) return null;
          const parsed = parseInt(width, 10);
          return isNaN(parsed) ? width : parsed;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      textAlign: {
        default: "left",
        parseHTML: (element) => {
          return (
            element.getAttribute("data-align") ||
            element.style.textAlign ||
            "left"
          );
        },
        renderHTML: (attributes) => {
          if (!attributes.textAlign || attributes.textAlign === "left")
            return {};
          return {
            "data-align": attributes.textAlign,
            style: `text-align: ${attributes.textAlign}`,
          };
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImage);
  },
  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          const hasCustomAttrs =
            node.attrs.width ||
            (node.attrs.textAlign && node.attrs.textAlign !== "left");
          if (hasCustomAttrs) {
            const widthAttr = node.attrs.width
              ? ` width="${node.attrs.width}"`
              : "";
            const alignAttr =
              node.attrs.textAlign && node.attrs.textAlign !== "left"
                ? ` data-align="${node.attrs.textAlign}"`
                : "";
            const titleAttr = node.attrs.title
              ? ` title="${state.esc(node.attrs.title)}"`
              : "";
            state.write(
              `<img src="${node.attrs.src}" alt="${state.esc(
                node.attrs.alt || "",
              )}"${widthAttr}${alignAttr}${titleAttr} />`,
            );
          } else {
            state.write(
              `![${state.esc(node.attrs.alt || "")}](${node.attrs.src}${
                node.attrs.title ? ` "${state.esc(node.attrs.title)}"` : ""
              })`,
            );
          }
        },
        parse: {},
      },
    };
  },
});

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

const CustomShortcuts = Extension.create({
  name: "customShortcuts",
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-s": () => this.editor.commands.toggleStrike(),
      "Mod-Shift-S": () => this.editor.commands.toggleStrike(),
      "Mod-Shift-l": () => this.editor.commands.setTextAlign("left"),
      "Mod-Shift-L": () => this.editor.commands.setTextAlign("left"),
      "Mod-Shift-e": () => this.editor.commands.setTextAlign("center"),
      "Mod-Shift-E": () => this.editor.commands.setTextAlign("center"),
      "Mod-Shift-r": () => this.editor.commands.setTextAlign("right"),
      "Mod-Shift-R": () => this.editor.commands.setTextAlign("right"),
      "Mod-Shift-j": () => this.editor.commands.setTextAlign("justify"),
      "Mod-Shift-J": () => this.editor.commands.setTextAlign("justify"),
      "Mod-Shift-9": () => this.editor.commands.toggleTaskList(),
    };
  },
});

const getEditorMarkdown = (ed: any): string => {
  if (!ed) return "";
  return (ed.storage as any)?.markdown?.getMarkdown?.() ?? "";
};

interface NoteEditorProps {
  selectedTopic: SyllabusItem | null;
  onSaveNote: (topicId: string, note: TopicNote) => void;
  onUpdateStatus: (topicId: string, status: TopicStatus) => void;
  onClose: () => void;
  courseTitle?: string;
  parentTitle?: string;
  onRenameTopic?: (topicId: string, newTitle: string) => void;
  onBackToTree?: () => void;
  isActive?: boolean;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  selectedTopic,
  onSaveNote,
  onUpdateStatus,
  onClose,
  courseTitle,
  parentTitle,
  onRenameTopic,
  onBackToTree,
  isActive = false,
}) => {
  const [content, setContent] = useState<string>("");
  const [hasCopiedNotePrompt, setHasCopiedNotePrompt] = useState<boolean>(false);

  // Topic Inline Renaming
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [titleValue, setTitleValue] = useState<string>("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Notion-style Image URL Embed Pill
  const [pendingEmbedUrl, setPendingEmbedUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Fullscreen toggle & Escape key listener
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const handleClose = () => {
    setIsFullscreen(false);
    onClose();
  };

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // AI Generation State
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  // Stable references for autosave without closure lag
  const selectedTopicRef = useRef(selectedTopic);
  selectedTopicRef.current = selectedTopic;

  const onSaveNoteRef = useRef(onSaveNote);
  onSaveNoteRef.current = onSaveNote;

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const debounceSave = (updatedMarkdown: string) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      if (!selectedTopicRef.current) return;
      const topic = selectedTopicRef.current;
      const updatedNote: TopicNote = {
        id: topic.note?.id || `note-${topic.id}`,
        title: topic.title,
        content: updatedMarkdown,
        subComments: topic.note?.subComments,
        updatedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      onSaveNoteRef.current(topic.id, updatedNote);
    }, 350);
  };

  // TipTap Rich Live Markdown Editor
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
        types: ["heading", "paragraph", "image"],
      }),
      CustomImage.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder:
          "Start writing notes, or use markdown shortcuts (# for heading, - for list, [ ] for todo)...",
      }),
      CustomShortcuts,
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: "-",
      }),
    ],
    content: selectedTopic?.note?.content || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none focus:outline-none min-h-[350px] text-sm leading-relaxed text-neutral-800 dark:text-neutral-200",
      },
      handlePaste: (view, event) => {
        // 1. Direct image paste from clipboard via Ctrl+V
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find((item) => item.type.startsWith("image/"));
        if (imageItem) {
          event.preventDefault();
          const file = imageItem.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const src = e.target?.result as string;
              if (src) {
                const { schema } = view.state;
                const node = schema.nodes.image.create({ src });
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }

        // 2. Notion-style image URL embed detection
        const pastedText = event.clipboardData?.getData("text/plain")?.trim();
        if (
          pastedText &&
          /^https?:\/\/.+\.(png|jpe?g|gif|webp|svg|bmp|avif)(\?.*)?$/i.test(
            pastedText,
          )
        ) {
          setPendingEmbedUrl(pastedText);
        }

        return false;
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            const reader = new FileReader();
            reader.onload = (e) => {
              const src = e.target?.result as string;
              if (src) {
                const { schema } = view.state;
                const node = schema.nodes.image.create({ src });
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      const markdown = getEditorMarkdown(ed);
      setContent(markdown);
      debounceSave(markdown);
    },
  });

  // Handle editor-scoped Undo/Redo shortcuts when this panel is active/highlighted
  useEffect(() => {
    if (!isActive || !editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isUndo =
        (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey;
      const isRedo =
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && e.shiftKey);

      if (!isUndo && !isRedo) return;

      const target = e.target as HTMLElement | null;
      // If typing in another normal input/textarea inside the editor (like comment inputs), let native input undo handle it
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        return;
      }

      // If TipTap editor is already focused, TipTap's own ProseMirror keydown listener will handle it natively
      if (editor.isFocused) {
        return;
      }

      // Otherwise (user clicked editor pane toolbar, comments, or outer card), route to TipTap history
      e.preventDefault();
      e.stopPropagation();
      if (isUndo && editor.can().undo()) {
        editor.chain().focus().undo().run();
      } else if (isRedo && editor.can().redo()) {
        editor.chain().focus().redo().run();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, editor]);

  // Sync state and editor content when selected topic changes
  useEffect(() => {
    if (selectedTopic) {
      setTitleValue(selectedTopic.title);
      setIsEditingTitle(false);
      const noteContent = selectedTopic.note?.content || "";
      setContent(noteContent);
      if (editor) {
        const currentMd = getEditorMarkdown(editor);
        if (currentMd !== noteContent) {
          editor.commands.setContent(noteContent);
        }
      }
    } else {
      setContent("");
      if (editor) {
        editor.commands.setContent("");
      }
    }
    setAiError(null);
    setPendingEmbedUrl(null);
  }, [selectedTopic?.id, selectedTopic?.note?.updatedAt, editor]);

  // Keep titleValue in sync if topic title changes externally (e.g. tree undo/redo or tree rename)
  useEffect(() => {
    if (selectedTopic && !isEditingTitle) {
      setTitleValue(selectedTopic.title);
    }
  }, [selectedTopic?.title, isEditingTitle]);

  // Handle topic inline renaming
  const handleSaveTitle = () => {
    const trimmed = titleValue.trim();
    if (selectedTopic && trimmed && trimmed !== selectedTopic.title) {
      onRenameTopic?.(selectedTopic.id, trimmed);
    } else if (selectedTopic) {
      setTitleValue(selectedTopic.title);
    }
    setIsEditingTitle(false);
  };

  // Immediate save helper for AI note generation
  const handleAutoSave = (updatedContent: string) => {
    if (!selectedTopic) return;
    const updatedNote: TopicNote = {
      id: selectedTopic.note?.id || `note-${selectedTopic.id}`,
      title: selectedTopic.title,
      content: updatedContent,
      subComments: selectedTopic.note?.subComments,
      updatedAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    onSaveNote(selectedTopic.id, updatedNote);
  };

  // Copy note prompt for external LLM interfaces (ChatGPT, Claude, Gemini, etc.)
  const handleCopyNotePrompt = async () => {
    if (!selectedTopic) return;
    const prompt = getNoteGenerationPrompt({
      topicTitle: selectedTopic.title,
      parentTitle: parentTitle,
      courseTitle: courseTitle,
    });
    try {
      await navigator.clipboard.writeText(prompt);
      setHasCopiedNotePrompt(true);
      setTimeout(() => setHasCopiedNotePrompt(false), 2500);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  };

  // Generate complete notes using configured AI
  const handleAiGenerateNotes = async () => {
    if (!selectedTopic) return;
    const key = getApiKey();
    if (!key) {
      setIsApiKeyModalOpen(true);
      return;
    }

    setIsAiGenerating(true);
    setAiError(null);

    try {
      const generated = await generateNotesWithAI(
        {
          topicTitle: selectedTopic.title,
          parentTitle: parentTitle,
          courseTitle: courseTitle,
        },
        key,
      );

      setContent(generated);
      if (editor) {
        editor.commands.setContent(generated);
      }
      handleAutoSave(generated);
    } catch (err: any) {
      setAiError(err.message || "Failed to generate notes with AI.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Convert detected image URL to embedded image block
  const handleEmbedPendingUrl = () => {
    if (!editor || !pendingEmbedUrl) return;
    editor.chain().focus().setImage({ src: pendingEmbedUrl }).run();
    setPendingEmbedUrl(null);
  };

  if (!selectedTopic) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-neutral-400 dark:text-neutral-500 select-none font-manrope">
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4 text-neutral-300 dark:text-neutral-600">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-light text-neutral-600 dark:text-neutral-300 mb-1">
          Select a topic
        </h3>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center max-w-xs">
          Click on any topic in the syllabus tree to view or start taking
          structured notes.
        </p>
      </div>
    );
  }

  // Handle "no notes yet" state
  if (!selectedTopic.hasNote && !content.trim()) {
    return (
      <div className="h-full flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 font-manrope">
        <div className="w-full flex justify-between items-center text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            {onBackToTree && (
              <button
                type="button"
                onClick={onBackToTree}
                className="md:hidden flex items-center gap-1 px-2 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Back to Topics"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Tree</span>
              </button>
            )}
            <span className="font-mono text-[11px] uppercase tracking-wider">
              {selectedTopic.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Centered Topic Title: Click to rename inline */}
        <div className="text-center my-auto space-y-5 max-w-md w-full">
          {isEditingTitle ? (
            <div className="w-full">
              <input
                ref={titleInputRef}
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  else if (e.key === "Escape") {
                    setTitleValue(selectedTopic.title);
                    setIsEditingTitle(false);
                  }
                }}
                onBlur={handleSaveTitle}
                autoFocus
                className="text-2xl md:text-3xl font-light text-neutral-900 dark:text-neutral-100 tracking-tight text-center bg-transparent border-b-2 border-blue-500 focus:outline-none px-2 py-0.5 w-full font-manrope"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTitleValue(selectedTopic.title);
                setIsEditingTitle(true);
              }}
              className="group inline-flex items-center justify-center gap-2 px-3 py-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-center max-w-full"
              title="Click to rename topic"
            >
              <h2 className="text-2xl md:text-3xl font-light text-neutral-900 dark:text-neutral-100 tracking-tight truncate">
                {selectedTopic.title}
              </h2>
              <Edit3 className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </button>
          )}

          <div className="space-y-4">
            <p className="text-sm font-light text-neutral-500 dark:text-neutral-400 italic">
              no notes yet
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  const newNote: TopicNote = {
                    id: `note-${selectedTopic.id}`,
                    title: selectedTopic.title,
                    content: `### ${selectedTopic.title}\n\nStart writing notes, formulas, or insert diagrams here...`,
                    updatedAt: new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  };
                  onSaveNote(selectedTopic.id, newNote);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 rounded-full text-xs font-medium shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Note</span>
              </button>

              {/* Two-in-one button: Generate with AI + Copy Prompt */}
              <div className="inline-flex items-center rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-sm transition-all overflow-hidden text-xs font-medium">
                <button
                  type="button"
                  onClick={handleAiGenerateNotes}
                  disabled={isAiGenerating}
                  className="inline-flex items-center gap-2 pl-4 pr-3 py-2 hover:bg-black/10 transition-colors cursor-pointer disabled:opacity-60"
                  title="Generate study notes with AI"
                >
                  {isAiGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Notes...</span>
                    </>
                  ) : (
                    <span>Generate with AI</span>
                  )}
                </button>
                <div className="w-px h-4 bg-white/25" />
                <button
                  type="button"
                  onClick={handleCopyNotePrompt}
                  className="inline-flex items-center justify-center px-3 py-2 hover:bg-black/10 transition-colors cursor-pointer"
                  title={hasCopiedNotePrompt ? "Prompt Copied" : "Copy note prompt for external LLM"}
                >
                  {hasCopiedNotePrompt ? (
                    <Check className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-white" />
                  )}
                </button>
              </div>
            </div>

            {aiError && (
              <div className="p-3 bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900 rounded-xl text-xs text-red-700 dark:text-rose-300 flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span>{aiError}</span>
                  <div>
                    <button
                      onClick={() => setIsApiKeyModalOpen(true)}
                      className="text-xs font-medium text-red-800 dark:text-rose-200 underline"
                    >
                      Configure API Key
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full" />

        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
        />
      </div>
    );
  }

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
      data-editor-pane="true"
      className={`flex flex-col font-manrope transition-all duration-200 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-white dark:bg-[#1C1C1E] h-screen w-screen overflow-hidden"
          : "h-full overflow-hidden"
      }`}
    >
      {/* Top Header: Centered Clickable / Inline Editable Topic Title */}
      <div className="relative pt-4 sm:pt-5 pb-3 sm:pb-4 px-3 sm:px-6 md:px-8 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
        {/* Left: Mobile Back Button + Status Selector Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 z-10">
          {onBackToTree && (
            <button
              type="button"
              onClick={onBackToTree}
              className="md:hidden flex items-center gap-1 px-2 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Back to Topics"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline text-[11px] font-medium">Tree</span>
            </button>
          )}

          <span className="hidden sm:inline text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-medium">
            Status:
          </span>
          <select
            value={selectedTopic.status}
            onChange={(e) =>
              onUpdateStatus(selectedTopic.id, e.target.value as TopicStatus)
            }
            className={`text-xs font-medium py-1 px-2 sm:px-2.5 rounded-full border outline-none cursor-pointer transition-colors ${
              selectedTopic.status === "done"
                ? "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-[#0066FF] dark:text-blue-400"
                : selectedTopic.status === "partial"
                  ? "bg-green-50 dark:bg-emerald-950/60 border-green-200 dark:border-emerald-800 text-[#28A745] dark:text-emerald-400"
                  : selectedTopic.status === "barely"
                    ? "bg-red-50 dark:bg-rose-950/60 border-red-200 dark:border-rose-800 text-[#E53E3E] dark:text-rose-400"
                    : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            <option value="untouched">Untouched</option>
            <option value="barely">Barely</option>
            <option value="partial">Partially</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Centered Topic Title: Click to Rename inline */}
        {isEditingTitle ? (
          <div className="absolute left-1/2 -translate-x-1/2 max-w-[50%] xs:max-w-[55%] w-full flex items-center justify-center z-10">
            <input
              ref={titleInputRef}
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                else if (e.key === "Escape") {
                  setTitleValue(selectedTopic.title);
                  setIsEditingTitle(false);
                }
              }}
              onBlur={handleSaveTitle}
              autoFocus
              className="text-lg sm:text-2xl font-light text-neutral-900 dark:text-neutral-100 tracking-tight text-center bg-transparent border-b-2 border-blue-500 focus:outline-none px-2 py-0.5 w-full font-manrope"
            />
          </div>
        ) : (
          <div className="absolute left-1/2 -translate-x-1/2 max-w-[42%] xs:max-w-[48%] sm:max-w-[50%] flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setTitleValue(selectedTopic.title);
                setIsEditingTitle(true);
              }}
              className="group flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer max-w-full"
              title="Click to rename topic"
            >
              <h2 className="text-base sm:text-xl md:text-2xl font-light text-neutral-900 dark:text-neutral-100 tracking-tight truncate">
                {selectedTopic.title}
              </h2>
              <Edit3 className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hidden sm:block" />
            </button>
          </div>
        )}

        {/* Right Actions: AI Notes + Copy Prompt Button & Close */}
        <div className="flex items-center gap-2 sm:gap-3 z-10">
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-2xs hover:shadow-xs transition-all overflow-hidden text-xs font-medium">
            <button
              type="button"
              onClick={handleAiGenerateNotes}
              disabled={isAiGenerating}
              className="flex items-center gap-1.5 pl-3 pr-2.5 py-1 hover:bg-black/10 transition-colors cursor-pointer disabled:opacity-50"
              title="Generate comprehensive study notes with AI"
            >
              {isAiGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span className="hidden xs:inline">Generating...</span>
                </>
              ) : (
                <span>AI Notes</span>
              )}
            </button>
            <div className="w-px h-3.5 bg-white/25" />
            <button
              type="button"
              onClick={handleCopyNotePrompt}
              className="flex items-center justify-center px-2 py-1 hover:bg-black/10 transition-colors cursor-pointer"
              title={hasCopiedNotePrompt ? "Prompt Copied" : "Copy study note prompt"}
            >
              {hasCopiedNotePrompt ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-white" />
              )}
            </button>
          </div>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            title="Close Note"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MS Word-level Rich Text Formatting Toolbar */}
      {editor && (
        <div className="px-3 sm:px-6 md:px-8 py-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-1 bg-neutral-50/70 dark:bg-[#18181A] text-neutral-600 dark:text-neutral-400 text-xs overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap">
          {/* History: Undo / Redo */}
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

          <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />

          {/* Style Selector: Normal text, H1, H2, H3 */}
          <select
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
                  .toggleHeading({ level: parseInt(val) as 1 | 2 | 3 })
                  .run();
              }
            }}
            className="text-xs bg-white dark:bg-[#222225] border border-neutral-200 dark:border-neutral-700 rounded-md px-2 py-1 text-neutral-700 dark:text-neutral-300 outline-none cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-500 font-medium"
            title="Text style"
          >
            <option value="p">Normal text</option>
            <option value="1">Heading 1 (Ctrl+Alt+1)</option>
            <option value="2">Heading 2 (Ctrl+Alt+2)</option>
            <option value="3">Heading 3 (Ctrl+Alt+3)</option>
          </select>

          <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />

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
            title="Strikethrough (Ctrl+Shift+S)"
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

          <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />

          {/* Lists & Structural Elements */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={getBtnClass(editor.isActive("bulletList"))}
            title="Bullet list (Ctrl+Shift+8)"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={getBtnClass(editor.isActive("orderedList"))}
            title="Numbered list (Ctrl+Shift+7)"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={getBtnClass(editor.isActive("taskList"))}
            title="Checklist / Todo (Ctrl+Shift+9)"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={getBtnClass(editor.isActive("blockquote"))}
            title="Quote block"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={getBtnClass(editor.isActive("codeBlock"))}
            title="Code block (Ctrl+Alt+C)"
          >
            <FileCode className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={getBtnClass(editor.isActive({ textAlign: "left" }))}
            title="Align Left (Ctrl+Shift+L)"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={getBtnClass(editor.isActive({ textAlign: "center" }))}
            title="Align Center (Ctrl+Shift+E)"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={getBtnClass(editor.isActive({ textAlign: "right" }))}
            title="Align Right (Ctrl+Shift+R)"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={getBtnClass(editor.isActive({ textAlign: "justify" }))}
            title="Align Justify (Ctrl+Shift+J)"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />

          {/* Horizontal Line & Clear Formatting */}
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
        </div>
      )}

      {/* Notion-style Floating Contextual Action for Pasted Image URLs */}
      {pendingEmbedUrl && (
        <div className="mx-3 sm:mx-6 md:mx-8 my-2 p-2 sm:p-2.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 min-w-0">
            <ImageIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-neutral-600 dark:text-neutral-400 truncate max-w-[200px] sm:max-w-[280px]">
              Image URL:{" "}
              <span className="font-mono text-neutral-900 dark:text-neutral-200">
                {pendingEmbedUrl}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleEmbedPendingUrl}
              className="px-2.5 sm:px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-2xs cursor-pointer"
            >
              Embed Image
            </button>
            <button
              type="button"
              onClick={() => setPendingEmbedUrl(null)}
              className="px-2 sm:px-2.5 py-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 rounded-lg transition-colors cursor-pointer"
            >
              Keep as link
            </button>
          </div>
        </div>
      )}

      {/* AI Error Notification Banner */}
      {aiError && (
        <div className="px-4 sm:px-6 md:px-8 py-2 bg-red-50 dark:bg-rose-950/50 border-b border-red-200 dark:border-rose-900 flex items-center justify-between text-xs text-red-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{aiError}</span>
          </div>
          <button
            onClick={() => setAiError(null)}
            className="p-1 text-red-400 hover:text-red-700 dark:hover:text-rose-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Notion-Style Live Markdown Editing Canvas */}
      <div
        className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 min-h-0 cursor-text"
        onClick={() => {
          if (editor && !editor.isFocused) {
            editor.commands.focus();
          }
        }}
      >
        <div className={isFullscreen ? "max-w-4xl mx-auto w-full" : "w-full"}>
          <EditorContent editor={editor} />
        </div>
      </div>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
};
