/**
 * Backward compatibility re-export wrapper
 * All LLM functionality is unified in lib/ai.ts
 */
export {
  formatSyllabusWithAI,
  generateNotesWithAI,
  generateSubCommentWithAI,
  testUniversalApiKey as testGeminiApiKey,
} from "./ai";
