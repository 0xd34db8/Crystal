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
export function createStarterSyllabus(title: string): SyllabusData {
  return {
    id: `syllabus-${Date.now()}`,
    fileName: title.trim() || "New Syllabus",
    lastModified: "Just now",
    items: [
      {
        id: `unit-${Date.now()}-1`,
        title: "UNIT I: Fundamentals",
        status: "untouched",
        hasNote: true,
        isExpanded: true,
        note: {
          id: `note-1`,
          title: "UNIT I: Fundamentals",
          content: `### Welcome to ${title}\n\nStart outlining your notes, key takeaways, and definitions here.`,
          updatedAt: "Just now",
        },
        children: [
          {
            id: `top-${Date.now()}-1`,
            title: "Introduction & Scope",
            status: "done",
            hasNote: true,
          },
          {
            id: `top-${Date.now()}-2`,
            title: "Core Concepts & Terminology",
            status: "partial",
            hasNote: false,
          },
          {
            id: `top-${Date.now()}-3`,
            title: "Methods & Applications",
            status: "untouched",
            hasNote: false,
          },
        ],
      },
      {
        id: `unit-${Date.now()}-2`,
        title: "UNIT II: Advanced Topics",
        status: "untouched",
        hasNote: false,
        isExpanded: false,
        children: [
          {
            id: `top-${Date.now()}-4`,
            title: "Theoretical Frameworks",
            status: "untouched",
            hasNote: false,
          },
          {
            id: `top-${Date.now()}-5`,
            title: "Practical Case Studies",
            status: "untouched",
            hasNote: false,
          },
        ],
      },
    ],
  };
}

