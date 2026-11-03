import { SyllabusData, SyllabusItem } from "@/types/syllabus";

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
  title: string = "Untitled Syllabus",
): SyllabusData {
  return {
    id: `syllabus-${Date.now()}`,
    fileName: title.trim() || "Untitled Syllabus",
    lastModified: "Just now",
    items: [],
  };
}

