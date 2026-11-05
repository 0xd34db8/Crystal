"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  ThemeMode,
  applyThemeToDocument,
  persistTheme,
  readStoredTheme,
} from "@/lib/theme";

/**
 * Shared theme store: every consumer (multiple toggles, etc.) stays in sync,
 * and the OS color-scheme listener is registered once, only while subscribed.
 */
const listeners = new Set<() => void>();
let current: ThemeMode | null = null;

function getSnapshot(): ThemeMode {
  if (current === null) current = readStoredTheme();
  return current;
}

const getServerSnapshot = (): ThemeMode => "system";

function emit() {
  listeners.forEach((l) => l());
}

function setTheme(mode: ThemeMode) {
  current = mode;
  persistTheme(mode);
  applyThemeToDocument(mode);
  emit();
}

function subscribe(listener: () => void) {
  const first = listeners.size === 0;
  listeners.add(listener);

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (getSnapshot() === "system") applyThemeToDocument("system");
  };
  media.addEventListener("change", onSystemChange);

  // Make sure <html> matches the store (the bootstrap script normally already did this).
  if (first) applyThemeToDocument(getSnapshot());

  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onSystemChange);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const set = useCallback((mode: ThemeMode) => setTheme(mode), []);
  return { theme, setTheme: set };
}
