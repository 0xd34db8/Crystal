import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import { Extension, Node as TiptapNode, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Node as PMNode } from "@tiptap/pm/model";
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
import markdownItFootnote from "markdown-it-footnote";
// @ts-ignore
import markdownItDeflist from "markdown-it-deflist";

export { MathNode, Table, TableRow, TableHeader, TableCell, Superscript };

/**
 * Definition List nodes (<dl>, <dt>, <dd>)
 */
export const DefinitionList = TiptapNode.create({
  name: "definitionList",
  group: "block",
  content: "(definitionTerm | definitionDescription)+",
  parseHTML() {
    return [{ tag: "dl" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "dl",
      mergeAttributes(HTMLAttributes, { class: "theseus-definition-list" }),
      0,
    ];
  },
  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          state.renderContent(node);
          state.write("\n");
        },
      },
    };
  },
});

export const DefinitionTerm = TiptapNode.create({
  name: "definitionTerm",
  content: "inline*",
  defining: true,
  parseHTML() {
    return [{ tag: "dt" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "dt",
      mergeAttributes(HTMLAttributes, { class: "theseus-definition-term" }),
      0,
    ];
  },
  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          state.renderInline(node);
          state.write("\n");
        },
      },
    };
  },
});

export const DefinitionDescription = TiptapNode.create({
  name: "definitionDescription",
  content: "inline*",
  defining: true,
  parseHTML() {
    return [
      {
        tag: "dd",
        contentElement: (element) => element.querySelector("p") ?? element,
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "dd",
      mergeAttributes(HTMLAttributes, { class: "theseus-definition-desc" }),
      0,
    ];
  },
  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          state.write(": ");
          state.renderInline(node);
          state.write("\n\n");
        },
      },
    };
  },
});

/**
 * Extension that hooks markdown-it plugins (footnotes, definition lists) into tiptap-markdown
 */
export const MarkdownPlugins = Extension.create({
  name: "markdownPlugins",
  addStorage() {
    return {
      markdown: {
        parse: {
          setup(md: any) {
            md.use(markdownItFootnote);
            md.use(markdownItDeflist);
          },
        },
      },
    };
  },
});

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

export const SearchHighlightPluginKey = new PluginKey("searchHighlight");

export interface SearchMatch {
  from: number;
  to: number;
}

export interface SearchPluginState {
  searchTerm: string;
  currentIndex: number;
  matches: SearchMatch[];
  decorations: DecorationSet;
}

function computeSearchState(
  doc: PMNode,
  term: string,
  targetIndex: number,
): SearchPluginState {
  const clean = term.trim().toLowerCase();
  if (!clean) {
    return {
      searchTerm: "",
      currentIndex: 0,
      matches: [],
      decorations: DecorationSet.empty,
    };
  }

  const matches: SearchMatch[] = [];
  doc.descendants((node, pos) => {
    if (node.isText && node.text) {
      const text = node.text.toLowerCase();
      let idx = text.indexOf(clean);
      while (idx !== -1) {
        matches.push({ from: pos + idx, to: pos + idx + clean.length });
        idx = text.indexOf(clean, idx + clean.length);
      }
    }
  });

  let currentIndex = 0;
  if (matches.length > 0) {
    if (targetIndex >= 0 && targetIndex < matches.length) {
      currentIndex = targetIndex;
    } else if (targetIndex >= matches.length) {
      currentIndex = 0;
    } else if (targetIndex < 0) {
      currentIndex = matches.length - 1;
    }
  }

  const decorations = matches.map((m, i) =>
    Decoration.inline(m.from, m.to, {
      class:
        i === currentIndex
          ? "editor-search-match editor-search-match-active"
          : "editor-search-match",
    }),
  );

  return {
    searchTerm: term,
    currentIndex,
    matches,
    decorations: DecorationSet.create(doc, decorations),
  };
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    searchHighlight: {
      setSearchTerm: (searchTerm: string) => ReturnType;
      nextSearchMatch: () => ReturnType;
      prevSearchMatch: () => ReturnType;
    };
  }
}

/**
 * Custom live search highlight extension for TipTap editor
 */
export const SearchHighlight = Extension.create({
  name: "searchHighlight",

  addCommands() {
    return {
      setSearchTerm:
        (searchTerm: string) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(SearchHighlightPluginKey, {
              type: "setTerm",
              term: searchTerm,
            });
          }
          return true;
        },
      nextSearchMatch:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(SearchHighlightPluginKey, { type: "next" });
          }
          return true;
        },
      prevSearchMatch:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(SearchHighlightPluginKey, { type: "prev" });
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: SearchHighlightPluginKey,
        state: {
          init(_, state): SearchPluginState {
            return computeSearchState(state.doc, "", 0);
          },
          apply(
            tr,
            prev: SearchPluginState,
            _oldState,
            newState,
          ): SearchPluginState {
            const meta = tr.getMeta(SearchHighlightPluginKey);
            if (meta) {
              if (meta.type === "setTerm") {
                return computeSearchState(newState.doc, meta.term, 0);
              }
              if (meta.type === "next") {
                const nextIdx =
                  prev.matches.length > 0
                    ? (prev.currentIndex + 1) % prev.matches.length
                    : 0;
                return computeSearchState(
                  newState.doc,
                  prev.searchTerm,
                  nextIdx,
                );
              }
              if (meta.type === "prev") {
                const prevIdx =
                  prev.matches.length > 0
                    ? (prev.currentIndex - 1 + prev.matches.length) %
                      prev.matches.length
                    : 0;
                return computeSearchState(
                  newState.doc,
                  prev.searchTerm,
                  prevIdx,
                );
              }
            }
            if (tr.docChanged) {
              return computeSearchState(
                newState.doc,
                prev.searchTerm,
                prev.currentIndex,
              );
            }
            return prev;
          },
        },
        props: {
          decorations(state) {
            const pluginState = SearchHighlightPluginKey.getState(state);
            return pluginState ? pluginState.decorations : DecorationSet.empty;
          },
        },
      }),
    ];
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
    Superscript,
    DefinitionList,
    DefinitionTerm,
    DefinitionDescription,
    MarkdownPlugins,
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
    SearchHighlight,
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
