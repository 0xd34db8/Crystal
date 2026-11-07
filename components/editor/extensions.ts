import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { Extension } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableImage } from "./ResizableImage";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { MathNode } from "./MathNode";

export { MathNode, Table, TableRow, TableHeader, TableCell };

/**
 * Custom TipTap TaskList extension with support for ChatGPT/GFM classes
 */
export const CustomTaskList = TaskList.extend({
  parseHTML() {
    return [
      {
        tag: `ul[data-type="${this.name}"]`,
        priority: 70,
      },
      {
        tag: "ul.contains-task-list",
        priority: 70,
      },
      {
        tag: "ul",
        getAttrs: (element) => {
          if (
            element instanceof HTMLElement &&
            (element.classList.contains("contains-task-list") ||
              element.querySelector("li.task-list-item, input[type='checkbox']"))
          ) {
            return {};
          }
          return false;
        },
        priority: 65,
      },
    ];
  },
});

/**
 * Custom TipTap TaskItem extension extracting checkboxes correctly
 */
export const CustomTaskItem = TaskItem.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      checked: {
        default: false,
        keepOnSplit: false,
        parseHTML: (element) => {
          const dataChecked = element.getAttribute("data-checked");
          if (dataChecked === "" || dataChecked === "true") return true;
          const checkbox = element.querySelector(
            "input[type='checkbox']"
          ) as HTMLInputElement | null;
          if (checkbox) {
            return checkbox.checked || checkbox.hasAttribute("checked");
          }
          return false;
        },
        renderHTML: (attributes) => ({
          "data-checked": attributes.checked,
        }),
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: `li[data-type="${this.name}"]`,
        priority: 70,
        contentElement: (element) => {
          return element.querySelector("div") ?? element;
        },
      },
      {
        tag: "li.task-list-item",
        priority: 70,
        contentElement: (element) => {
          return element.querySelector("div") ?? element;
        },
      },
      {
        tag: "li",
        getAttrs: (element) => {
          if (
            element instanceof HTMLElement &&
            (element.classList.contains("task-list-item") ||
              element.querySelector("input[type='checkbox']"))
          ) {
            return {};
          }
          return false;
        },
        priority: 65,
        contentElement: (element) => {
          return element.querySelector("div") ?? element;
        },
      },
    ];
  },
});

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
        levels: [1, 2, 3, 4, 5, 6],
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
    CustomHighlight,
    CustomTaskList,
    CustomTaskItem.configure({
      nested: true,
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: "theseus-editor-table",
      },
    }),
    TableRow,
    TableHeader,
    TableCell,
    MathNode,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Link.configure({
      openOnClick: false,
    }),
    Markdown.configure({
      html: true,
      tightLists: true,
      bulletListMarker: "-",
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
