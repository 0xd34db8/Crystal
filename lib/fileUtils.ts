import mammoth from "mammoth";

export interface ProcessedFileInput {
  text?: string;
  pdfBase64?: string;
  isJsonOrTheseus?: boolean;
  jsonData?: any;
}

/**
 * Reads and extracts text or binary data from supported syllabus file formats
 * (PDF, Word .docx, TXT, JSON, .theseus)
 */
export async function processSyllabusFile(
  file: File,
): Promise<ProcessedFileInput> {
  const name = file.name.toLowerCase();

  // 1. Theseus or JSON syllabus format
  if (name.endsWith(".theseus") || name.endsWith(".json")) {
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
      if (parsed.items) {
        return {
          isJsonOrTheseus: true,
          jsonData: parsed,
        };
      }
    } catch {
      return { text };
    }
  }

  // 2. Plain Text
  if (name.endsWith(".txt")) {
    const text = await file.text();
    return { text };
  }

  // 3. PDF Document (convert to base64 for direct Gemini multimodality)
  if (name.endsWith(".pdf")) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve({ pdfBase64: base64 });
      };
      reader.onerror = () => reject(new Error("Failed to read PDF file"));
      reader.readAsDataURL(file);
    });
  }

  // 4. Word Document (.docx)
  if (name.endsWith(".docx")) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return { text: result.value };
    } catch (err: any) {
      throw new Error(
        `Failed to extract text from Word document: ${err.message || "Unknown error"}`,
      );
    }
  }

  // 5. Fallback generic text read
  try {
    const text = await file.text();
    return { text };
  } catch {
    throw new Error(
      "Unsupported file format. Please upload a PDF, Word (.docx), TXT, or .theseus file.",
    );
  }
}

