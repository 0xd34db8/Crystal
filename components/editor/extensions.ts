import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { Extension } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableImage } from "./ResizableImage";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";

/**
 * Custom TipTap Image extension with width & alignment serialization to Markdown
 */
export const CustomImage = Image.extend({
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

/**
 * Custom Underline extension with <u> markdown serialization
 */
export const CustomUnderline = Underline.extend({
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

/**
 * Custom Highlight extension with == markdown serialization
 */
export const CustomHighlight = Highlight.extend({
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

/**
 * Custom keyboard shortcuts for rich formatting
 */
export const CustomShortcuts = Extension.create({
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

/**
 * Extracts serialized markdown from a TipTap editor instance safely
 */
export const getEditorMarkdown = (editor: any): string => {
  if (!editor) return "";
  return (editor.storage as any)?.markdown?.getMarkdown?.() ?? "";
};

/**
 * Creates standard TipTap extensions for Theseus editors
 */
export function createTipTapExtensions(options?: {
  placeholder?: string;
  withImages?: boolean;
}) {
  const exts: any[] = [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    CustomUnderline,
    CustomHighlight,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Link.configure({
      openOnClick: false,
    }),
    Markdown.configure({
      html: true,
      transformPastedText: true,
      transformCopiedText: true,
    }),
    CustomShortcuts,
  ];

  if (options?.placeholder) {
    exts.push(
      Placeholder.configure({
        placeholder: options.placeholder,
      }),
    );
  }

  if (options?.withImages) {
    exts.push(CustomImage);
  }

  return exts;
}
