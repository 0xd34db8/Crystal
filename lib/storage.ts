import { SyllabusData } from "@/types/syllabus";
import { initialSyllabusData } from "./mockData";

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

const STORAGE_KEY = "crystal_syllabi_v1";
const ACTIVE_ID_KEY = "crystal_active_syllabus_id";
const API_KEY_STORAGE = "crystal_api_key";
const AI_CONFIG_STORAGE = "crystal_ai_config";

export function detectProviderFromKey(key: string): LLMProvider {
  const trimmed = key.trim();
  if (trimmed.startsWith("AIza")) return "gemini";
  if (trimmed.startsWith("sk-ant-")) return "anthropic";
  if (trimmed.startsWith("sk-or-")) return "openrouter";
  if (trimmed.startsWith("gsk_")) return "groq";
  if (trimmed.startsWith("sk-")) return "openai";
  return "gemini";
}

export function getDefaultModelForProvider(provider: LLMProvider): string {
  switch (provider) {
    case "gemini":
      return "gemini-3.8-flash";
    case "openai":
      return "gpt-4o-mini";
    case "anthropic":
      return "claude-3-5-haiku-20241022";
    case "openrouter":
      return "openai/gpt-4o-mini";
    case "groq":
      return "llama-3.3-70b-versatile";
    case "custom":
      return "gpt-4o-mini";
    default:
      return "gemini-3.8-flash";
  }
}

export function getAIConfig(): AIConfig {
  if (typeof window === "undefined") {
    return { provider: "gemini", apiKey: "", model: "gemini-3.8-flash" };
  }
  try {
    const raw = localStorage.getItem(AI_CONFIG_STORAGE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey) return parsed;
    }
  } catch {}

  const legacyKey = localStorage.getItem(API_KEY_STORAGE) || "";
  const provider = detectProviderFromKey(legacyKey);
  return {
    provider,
    apiKey: legacyKey,
    model: getDefaultModelForProvider(provider),
  };
}

export function saveAIConfig(config: AIConfig): void {
  if (typeof window === "undefined") return;
  const cleanConfig: AIConfig = {
    ...config,
    apiKey: config.apiKey.trim(),
    model: (config.model || getDefaultModelForProvider(config.provider)).trim(),
    baseURL: config.baseURL?.trim(),
  };
  localStorage.setItem(AI_CONFIG_STORAGE, JSON.stringify(cleanConfig));
  localStorage.setItem(API_KEY_STORAGE, cleanConfig.apiKey);
}

export function getApiKey(): string {
  if (typeof window === "undefined") return "";
  const cfg = getAIConfig();
  return cfg.apiKey || localStorage.getItem(API_KEY_STORAGE) || "";
}

export function saveApiKey(key: string): void {
  if (typeof window === "undefined") return;
  const trimmed = key.trim();
  const provider = detectProviderFromKey(trimmed);
  saveAIConfig({
    provider,
    apiKey: trimmed,
    model: getDefaultModelForProvider(provider),
  });
}

export function removeApiKey(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(API_KEY_STORAGE);
  localStorage.removeItem(AI_CONFIG_STORAGE);
}

export const defaultRecentSyllabi: SyllabusData[] = [];

export function getSavedSyllabi(): SyllabusData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: SyllabusData[] = JSON.parse(raw);
    // Filter out legacy mock entries if previously stored
    const cleaned = parsed.filter(
      (s) => s.id !== "syllabus-ml-101" && s.id !== "syllabus-cloud-arch",
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (e) {
    console.error("Failed to load syllabi from storage", e);
    return [];
  }
}

export function saveSyllabus(syllabus: SyllabusData) {
  if (typeof window === "undefined") return;
  const list = getSavedSyllabi();
  const existingIdx = list.findIndex((s) => s.id === syllabus.id);
  let updatedList: SyllabusData[];
  if (existingIdx >= 0) {
    updatedList = [...list];
    updatedList[existingIdx] = {
      ...syllabus,
      lastModified: "Just now",
    };
  } else {
    updatedList = [
      {
        ...syllabus,
        lastModified: "Just now",
      },
      ...list,
    ];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  localStorage.setItem(ACTIVE_ID_KEY, syllabus.id);
}

export function getActiveSyllabusId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_ID_KEY) || null;
}

export function setActiveSyllabusId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_ID_KEY, id);
}

export function deleteSyllabus(id: string): SyllabusData[] {
  if (typeof window === "undefined") return [];
  const list = getSavedSyllabi().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list;
}

