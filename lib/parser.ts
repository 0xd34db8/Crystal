import { SyllabusData, SyllabusItem, TopicStatus } from "@/types/syllabus";

/**
 * Parses raw unformatted or pasted text into a hierarchical syllabus structure
 */
export function parseRawTextToSyllabus(
  text: string,
  title: string,
): SyllabusData {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const items: SyllabusItem[] = [];
  let currentUnit: SyllabusItem | null = null;
  let currentSection: SyllabusItem | null = null;

  lines.forEach((line, idx) => {
    const isUnit =
      /^unit\s+[0-9ivx]+/i.test(line) ||
      /^module\s+[0-9ivx]+/i.test(line) ||
      /^chapter\s+[0-9ivx]+/i.test(line);

    if (isUnit) {
      currentUnit = {
        id: `u-${Date.now()}-${idx}`,
        title: line,
        status: "untouched",
        hasNote: false,
        isExpanded: true,
        children: [],
      };
      items.push(currentUnit);
      currentSection = null;
    } else if (line.endsWith(":") || line.endsWith("{")) {
      const cleanTitle = line.replace(/[:{]+$/, "").trim();
      const section: SyllabusItem = {
        id: `sec-${Date.now()}-${idx}`,
        title: cleanTitle,
        status: "untouched",
        hasNote: false,
        isExpanded: true,
        children: [],
      };
      if (currentUnit) {
        currentUnit.children!.push(section);
        currentSection = section;
      } else {
        items.push(section);
        currentSection = section;
      }
    } else {
      const subtopic: SyllabusItem = {
        id: `top-${Date.now()}-${idx}`,
        title: line.replace(/^[-*•+]\s*/, "").trim(),
        status: "untouched",
        hasNote: false,
      };
      if (currentSection && currentSection.children) {
        currentSection.children.push(subtopic);
      } else if (currentUnit && currentUnit.children) {
        currentUnit.children.push(subtopic);
      } else {
        items.push(subtopic);
      }
    }
  });

  return {
    id: `syllabus-${Date.now()}`,
    fileName: title.trim() || "Untitled Syllabus",
    lastModified: "Just now",
    items:
      items.length > 0
        ? items
        : [
            {
              id: `u-1`,
              title: "UNIT I: Introduction",
              status: "untouched",
              hasNote: false,
              isExpanded: true,
              children: [
                {
                  id: "u-1-1",
                  title: "Overview & Foundations",
                  status: "untouched",
                  hasNote: false,
                },
              ],
            },
          ],
  };
}

/**
 * Creates a starter template syllabus for newly imported syllabi
 */
export function createStarterSyllabus(
  title: string = "New Syllabus",
): SyllabusData {
  return {
    id: `syllabus-${Date.now()}`,
    fileName: title.trim() || "New Syllabus",
    lastModified: "Just now",
    items: [],
    isDraft: true,
  };
}

function sanitizeJsonCandidate(str: string): string {
  if (!str) return "";
  let s = str.trim();

  // 1. Extract markdown code block if present
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/gi;
  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(s)) !== null) {
    if (match[1]) {
      s = match[1].trim();
      break;
    }
  }

  // 2. Decode HTML entities that often get injected when copying from chat/web viewers
  s = s
    .replace(/&#x20;/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  // 3. Remove trailing backslashes before newlines (e.g. markdown line continuations)
  s = s.replace(/\\+(\r?\n)/g, "$1");

  // 4. Normalize curly/smart quotes to standard double/single quotes
  s = s
    .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'");

  // 5. Clean trailing commas before closing brackets and braces
  s = s.replace(/,\s*([\]}])/g, "$1");

  return s;
}

/**
 * Tries to parse generated LLM JSON or .crystal JSON from raw text or markdown code blocks.
 * Returns a valid SyllabusData object, or null if the content is not syllabus JSON.
 */
export function tryParseSyllabusJson(
  rawInput: string,
  fallbackTitle?: string,
): SyllabusData | null {
  if (!rawInput || typeof rawInput !== "string") return null;

  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  const safeParse = (str: string): any => {
    try {
      return JSON.parse(str);
    } catch {
      try {
        const cleaned = str.replace(/,\s*([\]}])/g, "$1");
        return JSON.parse(cleaned);
      } catch {
        return null;
      }
    }
  };

  const cleaned = sanitizeJsonCandidate(trimmed);
  let parsed: any = safeParse(cleaned);

  // Fallback: extract substring between first { and last } or first [ and last ]
  if (!parsed) {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      parsed = safeParse(cleaned.substring(firstBrace, lastBrace + 1));
    }
  }

  if (!parsed) {
    const firstBracket = cleaned.indexOf("[");
    const lastBracket = cleaned.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      parsed = safeParse(cleaned.substring(firstBracket, lastBracket + 1));
    }
  }

  if (!parsed || typeof parsed !== "object") return null;

  // 4. Extract items and title
  let rawItems: any[] | null = null;
  let detectedTitle = fallbackTitle?.trim() || "";

  if (Array.isArray(parsed)) {
    rawItems = parsed;
  } else if (Array.isArray(parsed.items)) {
    rawItems = parsed.items;
    detectedTitle = detectedTitle || parsed.courseTitle || parsed.fileName || "";
  } else if (parsed.syllabus && Array.isArray(parsed.syllabus.items)) {
    rawItems = parsed.syllabus.items;
    detectedTitle = detectedTitle || parsed.syllabus.courseTitle || parsed.syllabus.fileName || "";
  }

  if (!rawItems || rawItems.length === 0) return null;

  // Verify that it actually looks like syllabus items (at least one object has a non-empty string title)
  const isLikelySyllabus = rawItems.some(
    (item) => item && typeof item === "object" && typeof item.title === "string" && item.title.trim().length > 0,
  );
  if (!isLikelySyllabus) return null;

  // Recursive normalizer to build full SyllabusItem nodes
  function normalizeNode(node: any, prefix: string, index: number): SyllabusItem {
    const id = node.id && typeof node.id === "string" ? node.id : `${prefix}-${index + 1}`;
    const title = typeof node.title === "string" ? node.title.trim() : `Topic ${index + 1}`;
    const status: TopicStatus = ["done", "partial", "barely", "untouched"].includes(node.status)
      ? node.status
      : "untouched";
    const hasNote = Boolean(node.hasNote || node.note);
    const isExpanded = node.isExpanded !== undefined ? Boolean(node.isExpanded) : true;

    const children =
      Array.isArray(node.children) && node.children.length > 0
        ? node.children.map((child: any, cIdx: number) => normalizeNode(child, id, cIdx))
        : undefined;

    return {
      id,
      title,
      status,
      hasNote,
      note: node.note,
      isExpanded,
      children,
    };
  }

  const items = rawItems.map((item, idx) => normalizeNode(item, "u", idx));
  const finalTitle = detectedTitle.trim() || "Imported Syllabus";

  return {
    id: parsed.id && typeof parsed.id === "string" ? parsed.id : `syllabus-${Date.now()}`,
    fileName: finalTitle,
    lastModified: "Just now",
    items,
    isDraft: false,
  };
}

