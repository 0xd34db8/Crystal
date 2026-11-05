export type LLMProvider =
  | "gemini"
  | "openai"
  | "anthropic"
  | "openrouter"
  | "groq"
  | "custom";

export interface AIConfig {
  provider: LLMProvider;
  apiKey: string;
  model?: string;
  baseURL?: string;
}

export interface CallLLMOptions {
  systemPrompt?: string;
  userPrompt: string;
  jsonOutput?: boolean;
  fileData?: {
    base64: string;
    mimeType: string;
  };
}
