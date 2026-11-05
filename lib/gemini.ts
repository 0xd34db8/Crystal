/**
 * Backward compatibility re-export wrapper
 * All LLM functionality is unified in lib/ai.ts
 */
export {
  formatSyllabusWithAI,
  generateNotesWithAI,
  generateSubCommentWithAI,
  getSyllabusTreePrompt,
  getNoteGenerationPrompt,
  SYLLABUS_TREE_SYSTEM_PROMPT,
  CORE_SYLLABUS_FILTER_RULE,
  testUniversalApiKey as testGeminiApiKey,
} from "./ai";
