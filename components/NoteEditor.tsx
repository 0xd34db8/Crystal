"use client";

import React, { useState, useEffect } from "react";
import {
  SyllabusItem,
  TopicNote,
  NoteComment,
  TopicStatus,
} from "@/types/syllabus";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ApiKeyModal } from "./ApiKeyModal";
import { getApiKey } from "@/lib/storage";
import { generateNotesWithAI, generateSubCommentWithAI } from "@/lib/ai";
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Code,
  Image as ImageIcon,
  Quote,
  Eye,
  Edit3,
  Columns,
  Plus,
  X,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface NoteEditorProps {
  selectedTopic: SyllabusItem | null;
  onSaveNote: (topicId: string, note: TopicNote) => void;
  onUpdateStatus: (topicId: string, status: TopicStatus) => void;
  onClose: () => void;
  courseTitle?: string;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  selectedTopic,
  onSaveNote,
  onUpdateStatus,
  onClose,
  courseTitle,
}) => {
  const [content, setContent] = useState<string>("");
  const [subComments, setSubComments] = useState<NoteComment[]>([]);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">(
    "edit",
  );
  const [replyInput, setReplyInput] = useState<string>("");
  const [replyTitle, setReplyTitle] = useState<string>("");
  const [isAddingReply, setIsAddingReply] = useState<boolean>(false);
  const [showImagePrompt, setShowImagePrompt] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  // AI Generation State
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [isAiSubCommentGenerating, setIsAiSubCommentGenerating] =
    useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (selectedTopic && selectedTopic.note) {
      setContent(selectedTopic.note.content || "");
      setSubComments(selectedTopic.note.subComments || []);
    } else {
      setContent("");
      setSubComments([]);
    }
    setAiError(null);
  }, [selectedTopic]);

  if (!selectedTopic) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-neutral-400 select-none font-manrope">
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-neutral-300">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-light text-neutral-600 mb-1">
          Select a topic
        </h3>
        <p className="text-xs text-neutral-400 text-center max-w-xs">
          Click on any topic in the syllabus tree to view or start taking
          structured notes.
        </p>
      </div>
    );
  }

  const handleAutoSave = (
    updatedContent: string,
    updatedSubComments: NoteComment[],
  ) => {
    const updatedNote: TopicNote = {
      id: selectedTopic.note?.id || `note-${selectedTopic.id}`,
      title: selectedTopic.title,
      content: updatedContent,
      subComments: updatedSubComments,
      updatedAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    onSaveNote(selectedTopic.id, updatedNote);
  };

  // Generate complete notes using configured AI
  const handleAiGenerateNotes = async () => {
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
          courseTitle: courseTitle,
        },
        key,
      );

      setContent(generated);
      handleAutoSave(generated, subComments);
    } catch (err: any) {
      setAiError(err.message || "Failed to generate notes with AI.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Generate a sub-section explanation with AI
  const handleAiGenerateSubComment = async () => {
    const key = getApiKey();
    if (!key) {
      setIsApiKeyModalOpen(true);
      return;
    }

    const query = replyInput.trim() || replyTitle.trim() || selectedTopic.title;
    setIsAiSubCommentGenerating(true);
    setAiError(null);

    try {
      const result = await generateSubCommentWithAI(
        {
          topicTitle: selectedTopic.title,
          aspectOrQuestion: query,
        },
        key,
      );

      const newComment: NoteComment = {
        id: `comment-${Date.now()}`,
        author: result.title || replyTitle.trim() || "AI Concept Notes",
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
        content: result.content,
      };

      const nextComments = [...subComments, newComment];
      setSubComments(nextComments);
      setReplyInput("");
      setReplyTitle("");
      setIsAddingReply(false);
      handleAutoSave(content, nextComments);
    } catch (err: any) {
      setAiError(err.message || "Failed to generate sub-section explanation.");
    } finally {
      setIsAiSubCommentGenerating(false);
    }
  };

  // Handle "no notes yet" state
  if (!selectedTopic.hasNote && !content.trim()) {
    return (
      <div className="h-full flex flex-col items-center justify-between p-8 font-manrope">
        <div className="w-full flex justify-between items-center text-xs text-neutral-400">
          <span className="font-mono text-[11px] uppercase tracking-wider">
            {selectedTopic.id}
          </span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Centered Topic Title strictly following the draft visual */}
        <div className="text-center my-auto space-y-5 max-w-md">
          <h2 className="text-2xl md:text-3xl font-light text-neutral-900 tracking-tight">
            {selectedTopic.title}
          </h2>

          <div className="space-y-4">
            <p className="text-sm font-light text-neutral-500 italic">
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-medium shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Note</span>
              </button>

              <button
                onClick={handleAiGenerateNotes}
                disabled={isAiGenerating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-300 hover:to-green-700 text-white rounded-full text-xs font-medium shadow-sm transition-all cursor-pointer disabled:opacity-60"
                title="Generate study notes with AI"
              >
                {isAiGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Notes...</span>
                  </>
                ) : (
                  <>
                    <span>Generate with AI</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span>{aiError}</span>
                  <div>
                    <button
                      onClick={() => setIsApiKeyModalOpen(true)}
                      className="text-xs font-medium text-red-800 underline"
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

  // Formatting toolbar helper
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById(
      "note-textarea",
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end);

    const newText =
      previousText.substring(0, start) +
      prefix +
      (selectedText || "text") +
      suffix +
      previousText.substring(end);

    setContent(newText);
    handleAutoSave(newText, subComments);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText ? selectedText.length : 4),
      );
    }, 0);
  };

  const handleAddSubComment = () => {
    if (!replyInput.trim()) return;

    const newComment: NoteComment = {
      id: `comment-${Date.now()}`,
      author: replyTitle.trim() || "Sub-section",
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
      content: replyInput.trim(),
    };

    const nextComments = [...subComments, newComment];
    setSubComments(nextComments);
    setReplyInput("");
    setReplyTitle("");
    setIsAddingReply(false);
    handleAutoSave(content, nextComments);
  };

  const handleInsertImage = () => {
    if (!imageUrl.trim()) return;
    insertFormatting(`\n![image](${imageUrl.trim()})\n`, "");
    setImageUrl("");
    setShowImagePrompt(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden font-manrope">
      {/* Top Header inside main pane: Title Centered as in Draft */}
      <div className="relative pt-6 pb-4 px-8 border-b border-neutral-100 flex items-center justify-between">
        {/* Left: Status Selector Pill */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">
            Status:
          </span>
          <select
            value={selectedTopic.status}
            onChange={(e) =>
              onUpdateStatus(selectedTopic.id, e.target.value as TopicStatus)
            }
            className={`text-xs font-medium py-1 px-2.5 rounded-full border outline-none cursor-pointer transition-colors ${
              selectedTopic.status === "done"
                ? "bg-blue-50 border-blue-200 text-[#0066FF]"
                : selectedTopic.status === "partial"
                  ? "bg-green-50 border-green-200 text-[#28A745]"
                  : selectedTopic.status === "barely"
                    ? "bg-red-50 border-red-200 text-[#E53E3E]"
                    : "bg-neutral-100 border-neutral-200 text-neutral-700"
            }`}
          >
            <option value="untouched">Untouched</option>
            <option value="barely">Barely</option>
            <option value="partial">Partially</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Centered Topic Title: 1:1 match with draft visual */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none max-w-[50%] truncate">
          <h2 className="text-2xl font-light text-neutral-900 tracking-tight truncate">
            {selectedTopic.title}
          </h2>
        </div>

        {/* Right Action Controls: Mode Switcher & Close */}
        <div className="flex items-center gap-2">
          {/* Segmented View Mode Controls */}
          <div className="flex items-center p-0.5 bg-neutral-100 rounded-full border border-neutral-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === "edit"
                  ? "bg-white text-neutral-900 shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
              title="Edit markdown"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer hidden sm:flex items-center gap-1 ${
                viewMode === "split"
                  ? "bg-white text-neutral-900 shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
              title="Side-by-side edit & live preview"
            >
              <Columns className="w-3 h-3" />
              <span>Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === "preview"
                  ? "bg-white text-neutral-900 shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
              title="Rendered preview"
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
            title="Close Note"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Formatting Toolbar (shown when editing or split) */}
      {viewMode !== "preview" && (
        <div className="px-8 py-2 border-b border-neutral-100 flex items-center gap-1 bg-neutral-50/70 text-neutral-600 text-xs flex-wrap">
          <button
            onClick={() => insertFormatting("**", "**")}
            className="p-1.5 hover:bg-neutral-200/80 rounded transition-colors cursor-pointer"
            title="Bold (**text**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting("*", "*")}
            className="p-1.5 hover:bg-neutral-200/80 rounded transition-colors cursor-pointer"
            title="Italic (*text*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting("### ")}
            className="p-1.5 hover:bg-neutral-200/80 rounded transition-colors cursor-pointer"
            title="Heading 3"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-4 bg-neutral-300 mx-1" />
          <button
            onClick={() => insertFormatting("- ")}
            className="p-1.5 hover:bg-neutral-200/80 rounded transition-colors cursor-pointer"
            title="Bullet list"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting("1. ")}
            className="p-1.5 hover:bg-neutral-200/80 rounded transition-colors cursor-pointer"
            title="Numbered list"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting("```\n", "\n```")}
            className="p-1.5 hover:bg-neutral-200/80 rounded transition-colors cursor-pointer"
            title="Code block"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting("> ")}
            className="p-1.5 hover:bg-neutral-200/80 rounded transition-colors cursor-pointer"
            title="Quote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowImagePrompt(true)}
            className="p-1.5 hover:bg-neutral-200/80 rounded transition-colors cursor-pointer"
            title="Insert Image"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>

          {/* AI Generate Notes Button */}
          <div className="w-[1px] h-4 bg-neutral-300 mx-1" />
          <button
            onClick={handleAiGenerateNotes}
            disabled={isAiGenerating}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-400 hover:to-green-700 text-white rounded-full text-[11px] font-medium shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Generate comprehensive study notes with AI"
          >
            {isAiGenerating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-white" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>AI Notes</span>
              </>
            )}
          </button>

          <span className="ml-auto text-[11px] text-neutral-400">
            Auto-saved
          </span>
        </div>
      )}

      {/* Image Insertion Popover Modal */}
      {showImagePrompt && (
        <div className="px-8 py-2.5 bg-blue-50/80 border-b border-blue-100 flex items-center gap-3">
          <ImageIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste image URL (e.g. https://... or data:image/...)"
            className="flex-1 px-3 py-1 bg-white border border-blue-200 rounded text-xs outline-none focus:border-blue-500 font-manrope"
            onKeyDown={(e) => e.key === "Enter" && handleInsertImage()}
          />
          <button
            onClick={handleInsertImage}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 cursor-pointer"
          >
            Insert
          </button>
          <button
            onClick={() => setShowImagePrompt(false)}
            className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* AI Error Notification Banner */}
      {aiError && (
        <div className="px-8 py-2 bg-red-50 border-b border-red-200 flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{aiError}</span>
          </div>
          <button
            onClick={() => setAiError(null)}
            className="p-1 text-red-400 hover:text-red-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area: Editor, Preview, or Split */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {viewMode === "preview" && (
          <MarkdownRenderer
            content={content}
            emptyPlaceholder="*No notes content yet. Switch to Edit to write notes.*"
          />
        )}

        {viewMode === "edit" && (
          <textarea
            id="note-textarea"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              handleAutoSave(e.target.value, subComments);
            }}
            placeholder="Write notes for this syllabus topic here (supports full markdown: # Heading, - list, **bold**, `code`, tables)..."
            className="w-full h-72 resize-none bg-transparent outline-none font-mono text-xs leading-relaxed text-neutral-800 placeholder-neutral-400"
          />
        )}

        {viewMode === "split" && (
          <div className="grid grid-cols-2 gap-6 min-h-[300px]">
            {/* Left: Raw Markdown Editor */}
            <div className="border-r border-neutral-200 pr-4">
              <textarea
                id="note-textarea"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  handleAutoSave(e.target.value, subComments);
                }}
                placeholder="Write markdown notes..."
                className="w-full h-full min-h-[280px] resize-none bg-transparent outline-none font-mono text-xs leading-relaxed text-neutral-800 placeholder-neutral-400"
              />
            </div>

            {/* Right: Live Rendered Preview */}
            <div className="overflow-y-auto pl-2">
              <MarkdownRenderer
                content={content}
                emptyPlaceholder="*Live preview will appear here as you type...*"
              />
            </div>
          </div>
        )}

        {/* Sub-sections / Comment Thread replies */}
        <div className="pt-6 border-t border-neutral-100 space-y-4">
          <div className="flex items-center justify-between">
            {!isAddingReply && (
              <button
                onClick={() => setIsAddingReply(true)}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Sub-section ({subComments.length})</span>
              </button>
            )}
          </div>

          {/* Sub-comment Cards */}
          <div className="space-y-3">
            {subComments.map((comment) => (
              <div
                key={comment.id}
                className="p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-200/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                  <span className="font-semibold text-neutral-800">
                    {comment.author}
                  </span>
                  <span>{comment.timestamp}</span>
                </div>
                <div className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                  {comment.content}
                </div>
              </div>
            ))}
          </div>

          {/* Add Sub-section Form */}
          {isAddingReply && (
            <div className="p-3.5 rounded-xl bg-white border border-neutral-300 shadow-xs space-y-2 text-xs animate-in fade-in duration-150">
              <input
                type="text"
                value={replyTitle}
                onChange={(e) => setReplyTitle(e.target.value)}
                placeholder="Sub-section title (e.g. Code Example, Summary)"
                className="w-full px-2.5 py-1.5 border border-neutral-200 rounded text-xs outline-none focus:border-neutral-400 font-manrope"
              />
              <textarea
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder="Write detailed sub-notes, or leave blank and click 'Explain with AI'..."
                rows={3}
                className="w-full px-2.5 py-1.5 border border-neutral-200 rounded text-xs outline-none focus:border-neutral-400 resize-none font-manrope"
              />
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleAiGenerateSubComment}
                  disabled={isAiSubCommentGenerating}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer disabled:opacity-50"
                >
                  {isAiSubCommentGenerating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Generating with AI...</span>
                    </>
                  ) : (
                    <>
                      <span>Explain with AI</span>
                    </>
                  )}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAddingReply(false)}
                    className="px-3 py-1 rounded text-neutral-600 hover:bg-neutral-100 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSubComment}
                    className="px-3 py-1 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800 cursor-pointer"
                  >
                    Add Sub-section
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
};
