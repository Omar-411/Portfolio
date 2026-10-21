import { profile } from "@/content/profile";
import { locales, type Locale } from "@/i18n/config";
import { format } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

/**
 * Pure command logic for the terminal palette. It never touches the DOM or router:
 * everything with a side effect goes through `PaletteActions`, so this file stays testable.
 */
export interface PaletteActions {
  goToSection(id: string): void;
  goToPath(path: string): void;
  openExternal(url: string): void;
  download(url: string): void;
  setLocale(locale: Locale): void;
  setMuted(muted: boolean): void;
}

export interface CommandResult {
  lines: string[];
  clear?: boolean;
  /** Close the palette after this many milliseconds. */
  closeAfterMs?: number;
}

type PaletteStrings = Dictionary["palette"];

const SECTION_COMMANDS = {
  about: "hero",
  experience: "experience",
  projects: "projects",
  skills: "skills",
  services: "services",
  contact: "contact",
} as const;

export const COMMAND_NAMES = [
  "help",
  "about",
  "experience",
  "projects",
  "skills",
  "services",
  "contact",
  "notes",
  "resume",
  "github",
  "linkedin",
  "lang",
  "sound",
  "clear",
  "exit",
] as const;

export type CommandName = (typeof COMMAND_NAMES)[number];

const isCommandName = (value: string): value is CommandName => (COMMAND_NAMES as readonly string[]).includes(value);
const isSection = (value: string): value is keyof typeof SECTION_COMMANDS => value in SECTION_COMMANDS;

const NAVIGATE_CLOSE_MS = 500;

export function helpLines(t: PaletteStrings): string[] {
  const width = Math.max(...COMMAND_NAMES.map((name) => name.length)) + 2;
  return [t.helpHeader, ...COMMAND_NAMES.map((name) => `  ${name.padEnd(width)}${t.commands[name]}`)];
}

export function welcomeLines(t: PaletteStrings): string[] {
  return [t.welcome];
}

/** Returns the unique (or first) command starting with `prefix`, for Tab completion. */
export function complete(prefix: string): CommandName | null {
  const value = prefix.trim().toLowerCase();
  if (!value) return null;
  return COMMAND_NAMES.find((name) => name.startsWith(value)) ?? null;
}

export function runCommand(
  input: string,
  locale: Locale,
  t: PaletteStrings,
  actions: PaletteActions
): CommandResult {
  const [rawName = "", ...args] = input.trim().split(/\s+/);
  const name = rawName.toLowerCase();

  if (!name) return { lines: [] };
  if (!isCommandName(name)) return { lines: [format(t.unknown, { name: rawName })] };

  if (isSection(name)) {
    actions.goToSection(SECTION_COMMANDS[name]);
    return { lines: [format(t.opening, { target: name })], closeAfterMs: NAVIGATE_CLOSE_MS };
  }

  switch (name) {
    case "help":
      return { lines: helpLines(t) };
    case "notes":
      actions.goToPath(`/${locale}/notes`);
      return { lines: [format(t.opening, { target: "notes" })], closeAfterMs: NAVIGATE_CLOSE_MS };
    case "resume":
      actions.download(profile.resume);
      return { lines: [format(t.opening, { target: "resume" })] };
    case "github":
      actions.openExternal(profile.github);
      return { lines: [format(t.opening, { target: "github" })] };
    case "linkedin":
      actions.openExternal(profile.linkedin);
      return { lines: [format(t.opening, { target: "linkedin" })] };
    case "lang": {
      const next = args[0]?.toLowerCase();
      const match = locales.find((candidate) => candidate === next);
      if (!match) return { lines: [t.languageUsage] };
      actions.setLocale(match);
      return { lines: [t.languageSet], closeAfterMs: NAVIGATE_CLOSE_MS };
    }
    case "sound": {
      const mode = args[0]?.toLowerCase();
      if (mode !== "on" && mode !== "off") return { lines: [t.soundUsage] };
      actions.setMuted(mode === "off");
      return { lines: [mode === "off" ? t.muted : t.unmuted] };
    }
    case "clear":
      return { lines: [], clear: true };
    case "exit":
      return { lines: [], closeAfterMs: 0 };
  }
}
