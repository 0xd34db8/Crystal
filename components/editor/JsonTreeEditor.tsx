"use client";

import React, { useState, useRef, useEffect } from "react";
import { SyllabusItem } from "@/types/syllabus";
import { Braces } from "lucide-react";
import {
  serializeSyllabusToJson,
  tolerantParseSyllabus,
} from "@/lib/parser";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function highlightJson(code: string, isValid: boolean): string {
  if (!code) return "";
  if (!isValid) {
    return `<span class="text-red-500">${escapeHtml(code)}</span>`;
  }

  const tokenRegex =
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}\[\],:])/g;

  let lastIndex = 0;
  let html = "";
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      html += escapeHtml(code.slice(lastIndex, match.index));
    }
    const token = match[0];
    lastIndex = match.index + token.length;

    if (token.startsWith('"')) {
      if (token.endsWith(":")) {
        const colonIndex = token.lastIndexOf(":");
        const keyPart = token.slice(0, colonIndex);
        const colonPart = token.slice(colonIndex);
        html += `<span class="text-sky-600 dark:text-sky-400 font-semibold">${escapeHtml(keyPart)}</span><span class="text-foreground-subtle">${escapeHtml(colonPart)}</span>`;
      } else {
        html += `<span class="text-emerald-600 dark:text-emerald-400">${escapeHtml(token)}</span>`;
      }
    } else if (/^(true|false|null)$/.test(token)) {
      html += `<span class="text-amber-600 dark:text-amber-400 font-medium">${escapeHtml(token)}</span>`;
    } else if (/^-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?$/.test(token)) {
      html += `<span class="text-purple-600 dark:text-purple-400">${escapeHtml(token)}</span>`;
    } else if (/[{}\[\]]/.test(token)) {
      html += `<span class="text-foreground font-bold">${escapeHtml(token)}</span>`;
    } else if (token === ",") {
      html += `<span class="text-muted-foreground">${escapeHtml(token)}</span>`;
    } else {
      html += escapeHtml(token);
    }
  }

  if (lastIndex < code.length) {
    html += escapeHtml(code.slice(lastIndex));
  }

  return html;
}

export interface JsonTreeEditorProps {
  items: SyllabusItem[];
  courseTitle?: string;
  onUpdateItems?: (items: SyllabusItem[]) => void;
  onUpdateTitle?: (title: string) => void;
  onClose: () => void;
}

export function JsonTreeEditor({
  items,
  courseTitle,
  onUpdateItems,
  onUpdateTitle,
  onClose,
}: JsonTreeEditorProps) {
  const [jsonText, setJsonText] = useState(() =>
    serializeSyllabusToJson(items, courseTitle),
  );
  const [isValidJson, setIsValidJson] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Sync scroll between textarea and syntax highlight pre overlay
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setJsonText(newText);
    const res = tolerantParseSyllabus(newText, items);
    setIsValidJson(res.isValid);
    if (res.items && res.items.length > 0) {
      onUpdateItems?.(res.items);
    }
    if (res.courseTitle && onUpdateTitle) {
      onUpdateTitle(res.courseTitle.trim());
    }
  };

  const handleFormatJson = () => {
    const res = tolerantParseSyllabus(jsonText, items);
    if (res.items && res.items.length > 0) {
      const formatted = serializeSyllabusToJson(
        res.items,
        res.courseTitle || courseTitle,
      );
      setJsonText(formatted);
      setIsValidJson(true);
      onUpdateItems?.(res.items);
      if (res.courseTitle && onUpdateTitle) {
        onUpdateTitle(res.courseTitle.trim());
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      setJsonText(newValue);
      const res = tolerantParseSyllabus(newValue, items);
      setIsValidJson(res.isValid);
      if (res.items && res.items.length > 0) {
        onUpdateItems?.(res.items);
      }
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    } else if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const value = textarea.value;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const currentLine = value.substring(lineStart, start);
      const match = currentLine.match(/^(\s+)/);
      const indent = match ? match[1] : "";
      const extraIndent = /[{\[]\s*$/.test(currentLine.trim()) ? "  " : "";
      const totalIndent = indent + extraIndent;

      if (totalIndent.length > 0) {
        e.preventDefault();
        const end = textarea.selectionEnd;
        const newValue =
          value.substring(0, start) + "\n" + totalIndent + value.substring(end);
        setJsonText(newValue);
        const res = tolerantParseSyllabus(newValue, items);
        setIsValidJson(res.isValid);
        if (res.items && res.items.length > 0) {
          onUpdateItems?.(res.items);
        }
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            start + 1 + totalIndent.length;
        }, 0);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-100 font-manrope">
      {/* Header bar */}
      <div className="flex items-center justify-end px-3.5 py-2 border-b border-border-subtle text-xs select-none bg-subtle">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleFormatJson}
            className="px-2 py-1 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-card rounded transition-colors cursor-pointer"
            title="Format JSON indentation"
          >
            Format
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-[11px] transition-colors cursor-pointer shadow-2xs"
            title="Return to Tree view (Esc or Ctrl+Enter)"
          >
            <Braces className="w-3.5 h-3.5" />
            <span>Parse</span>
          </button>
        </div>
      </div>

      {/* Formatted live editor */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-card">
        <pre
          ref={preRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none m-0 p-3.5 font-mono text-xs leading-[20px] whitespace-pre-wrap break-words overflow-hidden [tab-size:2]"
          dangerouslySetInnerHTML={{
            __html:
              highlightJson(jsonText, isValidJson) +
              (jsonText.endsWith("\n") ? " " : ""),
          }}
        />
        <textarea
          ref={textareaRef}
          value={jsonText}
          onChange={handleJsonChange}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          placeholder="Edit syllabus tree JSON here..."
          spellCheck={false}
          className={`relative w-full h-full m-0 p-3.5 font-mono text-xs leading-[20px] whitespace-pre-wrap break-words bg-transparent outline-none resize-none overflow-y-auto text-transparent selection:text-transparent [tab-size:2] ${
            isValidJson
              ? "caret-foreground selection:bg-accent-subtle"
              : "caret-red-500 selection:bg-red-500/20"
          }`}
        />
      </div>
    </div>
  );
}
