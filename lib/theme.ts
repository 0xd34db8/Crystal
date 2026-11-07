/**
 * Single source of truth for the color-theme system.
 * Consumed by the root layout (pre-hydration script), the `useTheme` hook and the theme picker UI.
 */

export const THEME_STORAGE_KEY = "theseus_theme";

export const THEMES = [
  { id: "system", name: "System", description: "Follows OS preference", dark: false, swatch: ["#9CA3AF", "#0066FF"] },
  { id: "light", name: "Light", description: "Crisp white", dark: false, swatch: ["#F9F9F9", "#0066FF"] },
  { id: "dark", name: "Dark", description: "Obsidian charcoal", dark: true, swatch: ["#121212", "#3B82F6"] },
  { id: "sepia", name: "Sepia", description: "Warm reading paper", dark: false, swatch: ["#F7F2E7", "#D97706"] },
  { id: "nord", name: "Nord", description: "Polar slate blue", dark: true, swatch: ["#242933", "#88C0D0"] },
  { id: "midnight", name: "Midnight", description: "AMOLED deep black", dark: true, swatch: ["#000000", "#6366F1"] },
  { id: "forest", name: "Forest", description: "Calm evergreen", dark: true, swatch: ["#0F1713", "#10B981"] },
] as const;

export type ThemeMode = (typeof THEMES)[number]["id"];
/** A concrete palette (what `system` resolves to). */
export type ResolvedTheme = Exclude<ThemeMode, "system">;

const DARK_IDS: readonly string[] = THEMES.filter((t) => t.dark).map((t) => t.id);
const VALID_IDS: readonly string[] = THEMES.map((t) => t.id);

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === "string" && VALID_IDS.includes(value);
}

export function readStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

export function persistTheme(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* storage unavailable (private mode, quota) – theme still applies for this session */
  }
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode !== "system") return mode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Writes the theme onto <html>: `data-theme`, `data-theme-setting` and the `dark` class. */
export function applyThemeToDocument(mode: ThemeMode): void {
  const resolved = resolveTheme(mode);
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  root.setAttribute("data-theme-setting", mode);
  root.classList.toggle("dark", DARK_IDS.includes(resolved));
}

/**
 * Inline script run before first paint to avoid a flash of the wrong theme.
 * Generated from the same data as the runtime logic so the two can't drift apart.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{
var valid=${JSON.stringify(VALID_IDS)},dark=${JSON.stringify(DARK_IDS)};
var s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
if(valid.indexOf(s)<0)s="system";
var r=s;
if(s==="system")r=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
var e=document.documentElement;
e.setAttribute("data-theme",r);
e.setAttribute("data-theme-setting",s);
e.classList.toggle("dark",dark.indexOf(r)>=0);
}catch(_){}})();`;
