import { SyllabusData, SyllabusItem, TopicStatus } from "@/types/syllabus";

export interface SyllabusStats {
  total: number;
  done: { count: number; pct: number };
  partial: { count: number; pct: number };
  barely: { count: number; pct: number };
  untouched: { count: number; pct: number };
}

/**
 * Calculates completion stats across all leaf topics in a syllabus
 */
export function calculateSyllabusStats(items: SyllabusItem[]): SyllabusStats {
  let done = 0;
  let partial = 0;
  let barely = 0;
  let untouched = 0;
  let total = 0;

  const traverse = (nodeList: SyllabusItem[]) => {
    for (const node of nodeList) {
      if (!node.children || node.children.length === 0) {
        total++;
        if (node.status === "done") done++;
        else if (node.status === "partial") partial++;
        else if (node.status === "barely") barely++;
        else untouched++;
      } else {
        traverse(node.children);
      }
    }
  };

  traverse(items);

  if (total === 0) {
    return {
      total: 0,
      done: { count: 0, pct: 0 },
      partial: { count: 0, pct: 0 },
      barely: { count: 0, pct: 0 },
      untouched: { count: 0, pct: 0 },
    };
  }

  return {
    total,
    done: { count: done, pct: Math.round((done / total) * 100) },
    partial: { count: partial, pct: Math.round((partial / total) * 100) },
    barely: { count: barely, pct: Math.round((barely / total) * 100) },
    untouched: { count: untouched, pct: Math.round((untouched / total) * 100) },
  };
}

/**
 * Returns overall completion percentage for done topics
 */
export function getCompletionPct(items: SyllabusItem[]): number {
  const stats = calculateSyllabusStats(items);
  return stats.done.pct;
}

/**
 * Returns total count of leaf topics
 */
export function getTopicCount(items: SyllabusItem[]): number {
  const stats = calculateSyllabusStats(items);
  return stats.total;
}

/**
 * Recursively searches for an item in the syllabus tree by ID
 */
export function findItemById(
  items: SyllabusItem[],
  id: string,
): SyllabusItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Recursively updates an item in the syllabus tree immutably
 */
export function updateItemInTree(
  items: SyllabusItem[],
  id: string,
  updater: (item: SyllabusItem) => SyllabusItem,
): SyllabusItem[] {
  return items.map((item) => {
    if (item.id === id) {
      return updater(item);
    }
    if (item.children) {
      return {
        ...item,
        children: updateItemInTree(item.children, id, updater),
      };
    }
    return item;
  });
}

/**
 * Recursively deletes an item from the syllabus tree by ID
 */
export function deleteItemFromTree(
  items: SyllabusItem[],
  id: string,
): SyllabusItem[] {
  return items
    .filter((item) => item.id !== id)
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: deleteItemFromTree(item.children, id),
        };
      }
      return item;
    });
}

/**
 * Adds an item to the syllabus tree immutably
 */
export function addItemToTree(
  items: SyllabusItem[],
  parentId: string | null,
  newItem: SyllabusItem,
): SyllabusItem[] {
  if (!parentId) {
    return [...items, newItem];
  }

  return items.map((item) => {
    if (item.id === parentId) {
      return {
        ...item,
        isExpanded: true,
        children: [...(item.children || []), newItem],
      };
    }
    if (item.children) {
      return {
        ...item,
        children: addItemToTree(item.children, parentId, newItem),
      };
    }
    return item;
  });
}

/**
 * Exports syllabus data to a local .crystal JSON file download
 */
export function exportSyllabusAsFile(syllabus: SyllabusData): void {
  if (typeof window === "undefined") return;

  const dataStr = JSON.stringify(syllabus, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const safeTitle = (syllabus.fileName || "syllabus")
    .trim()
    .replace(/[^a-zA-Z0-9_\-\s]/g, "")
    .replace(/\s+/g, "_");

  link.download = `${safeTitle}.crystal`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

