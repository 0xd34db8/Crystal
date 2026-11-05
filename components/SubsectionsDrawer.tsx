"use client";

import React, { useState, useEffect, useRef } from "react";
import { SyllabusItem, TopicNote, NoteComment } from "@/types/syllabus";
import { generateSubCommentWithAI } from "@/lib/ai";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface SubsectionsDrawerProps {
  selectedTopic: SyllabusItem;
  onSaveNote: (topicId: string, note: TopicNote) => void;
  apiKey: string;
  onOpenApiKeyModal: () => void;
  onClose: () => void;
}

export const SubsectionsDrawer: React.FC<SubsectionsDrawerProps> = ({
  selectedTopic,
  onSaveNote,
  apiKey,
  onOpenApiKeyModal,
  onClose,
}) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [replyTitle, setReplyTitle] = useState<string>("");
  const [replyInput, setReplyInput] = useState<string>("");
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

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

  const handleOpenAddForm = () => {
    setIsAdding(true);
    setAiError(null);
  };

  const handleCloseAddForm = () => {
    setIsAdding(false);
    setReplyTitle("");
    setReplyInput("");
    setAiError(null);
  };

  const handleAiGenerateSubComment = async () => {
    if (!apiKey) {
      onOpenApiKeyModal();
      return;
    }

    const query = replyInput.trim() || replyTitle.trim() || selectedTopic.title;
    setIsAiGenerating(true);
    setAiError(null);

    try {
      const result = await generateSubCommentWithAI(
        {
          topicTitle: selectedTopic.title,
          aspectOrQuestion: query,
        },
        apiKey,
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

      const updatedSubComments = [...subComments, newComment];
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
      handleCloseAddForm();
    } catch (err: any) {
      setAiError(err.message || "Failed to generate sub-section explanation.");
    } finally {
      setIsAiGenerating(false);
    }
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

    const updatedSubComments = [...subComments, newComment];
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
    handleCloseAddForm();
  };

  const handleDeleteSubComment = (commentId: string) => {
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

  return (
    <div
      ref={popoverRef}
      className="fixed bottom-14 right-4 sm:right-6 w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[75vh] bg-white dark:bg-[#1C1C1E] border border-black/15 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 font-manrope"
    >
      {/* Scrollable Subsections Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-neutral-50/30 dark:bg-[#141416]/30">
        {subComments.length === 0 && !isAdding && (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-neutral-400 dark:text-neutral-500 select-none">
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-200 mb-1">
              No sub-sections yet
            </p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 max-w-[240px]">
              Add supplementary notes, code snippets, or generate explanations
              with AI.
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

        {subComments.map((comment) => (
          <div
            key={comment.id}
            className="p-3 rounded-xl bg-white dark:bg-[#222225] border border-neutral-200/80 dark:border-neutral-700/80 space-y-1.5 text-xs shadow-2xs group"
          >
            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate pr-2">
                {comment.author}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] text-neutral-400">
                  {comment.timestamp}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteSubComment(comment.id)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-opacity cursor-pointer p-0.5"
                  title="Delete sub-section"
                  aria-label="Delete sub-section"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed text-xs">
              {comment.content}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Composer Dock */}
      {isAdding ? (
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1C1C1E] space-y-2 animate-in slide-in-from-bottom-2 duration-150 flex-shrink-0">
          <input
            type="text"
            value={replyTitle}
            onChange={(e) => setReplyTitle(e.target.value)}
            placeholder="Sub-section title (e.g. Code Example, Summary)"
            className="w-full px-2.5 py-1.5 border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#242428] text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 rounded-lg text-xs outline-none focus:border-neutral-400 dark:focus:border-neutral-500 font-manrope"
            autoFocus
          />
          <textarea
            value={replyInput}
            onChange={(e) => setReplyInput(e.target.value)}
            placeholder="Write notes, or leave blank and click Explain with AI..."
            rows={3}
            className="w-full px-2.5 py-1.5 border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#242428] text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 rounded-lg text-xs outline-none focus:border-neutral-400 dark:focus:border-neutral-500 resize-none font-manrope"
          />

          {aiError && (
            <div className="p-2 bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900 rounded text-[11px] text-red-700 dark:text-rose-300">
              {aiError}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleAiGenerateSubComment}
              disabled={isAiGenerating}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer disabled:opacity-50"
            >
              {isAiGenerating ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>Explain with AI</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCloseAddForm}
                className="px-2.5 py-1 rounded text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSubComment}
                disabled={!replyInput.trim()}
                className="px-3 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-lg text-xs font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer disabled:opacity-40"
              >
                Add
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
