import { profile } from "@/content/profile";
import { format, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { CommandResult, PaletteActions } from "./commands";

type PaletteStrings = Dictionary["palette"];

/** Hidden commands. They are not listed by `help` or Tab completion on purpose. */
const SECTION_DIRECTORIES = ["hero", "experience", "projects", "skills", "services"] as const;
const PAGE_DIRECTORIES = ["systems", "lab"] as const;
const DIRECTORY_ALIASES: Record<string, (typeof SECTION_DIRECTORIES)[number]> = { about: "hero" };

const NAVIGATE_CLOSE_MS = 500;
const BOOKING_CLOSE_MS = 1100;
const MAX_ECHO_LENGTH = 200;

const COFFEE_CUP = ["    ( (", "     ) )", "  ........", "  |      |]", "  \\      /", "   `----'"];

interface EggContext {
  locale: Locale;
  t: PaletteStrings;
  actions: PaletteActions;
  now: Date;
}

const isSectionDirectory = (value: string): value is (typeof SECTION_DIRECTORIES)[number] =>
  (SECTION_DIRECTORIES as readonly string[]).includes(value);
const isPageDirectory = (value: string): value is (typeof PAGE_DIRECTORIES)[number] =>
  (PAGE_DIRECTORIES as readonly string[]).includes(value);

function sudo(args: string[], { t, actions }: EggContext): CommandResult {
  const request = args.join(" ").toLowerCase();
  if (/^hire( omar| me)?$/.test(request)) {
    actions.bookCall();
    return { lines: [t.eggs.sudoPassword, t.eggs.sudoGranted], closeAfterMs: BOOKING_CLOSE_MS };
  }
  return { lines: [t.eggs.sudoDenied] };
}

function cd(args: string[], { locale, t, actions }: EggContext): CommandResult {
  const target = (args[0] ?? "").toLowerCase().replace(/\/$/, "");
  if (!target || target === "~" || target === "..") return { lines: [t.eggs.cdUsage] };

  const section = DIRECTORY_ALIASES[target] ?? target;
  if (isSectionDirectory(section)) {
    actions.goToSection(section);
    return { lines: [format(t.opening, { target })], closeAfterMs: NAVIGATE_CLOSE_MS };
  }
  if (isPageDirectory(section)) {
    actions.goToPath(`/${locale}/${section}`);
    return { lines: [format(t.opening, { target })], closeAfterMs: NAVIGATE_CLOSE_MS };
  }
  return { lines: [format(t.eggs.cdMissing, { name: args[0] })] };
}

function neofetch({ t }: EggContext): string[] {
  const title = `${profile.firstName.toLowerCase()}@portfolio`;
  return [
    title,
    "-".repeat(title.length),
    t.eggs.neofetchOs,
    format(t.eggs.neofetchRole, { role: profile.role }),
    format(t.eggs.neofetchLocation, { location: profile.location }),
    t.eggs.neofetchLanguages,
    format(t.eggs.neofetchStatus, { status: t.eggs.available }),
  ];
}

/** Returns a result for a hidden command, or `null` when the input is not one. */
export function runEasterEgg(input: string, context: EggContext): CommandResult | null {
  const [rawName = "", ...args] = input.trim().split(/\s+/);
  const name = rawName.toLowerCase();
  const { t, now, locale } = context;

  switch (name) {
    case "whoami":
      return {
        lines: [
          format(t.eggs.whoamiLine, { name: profile.name, role: profile.role, location: profile.location }),
          t.eggs.whoamiStack,
          format(t.eggs.whoamiStatus, { status: t.eggs.available }),
        ],
      };
    case "sudo":
      return sudo(args, context);
    case "cd":
      return cd(args, context);
    case "ls":
      return { lines: [[...SECTION_DIRECTORIES, ...PAGE_DIRECTORIES].map((dir) => `${dir}/`).join("  ")] };
    case "pwd":
      return { lines: ["/home/visitor/omar-ajimi/portfolio"] };
    case "date":
      return { lines: [new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short" }).format(now)] };
    case "echo":
      return { lines: [args.join(" ").slice(0, MAX_ECHO_LENGTH)] };
    case "coffee":
      return { lines: [t.eggs.coffeeStart, ...COFFEE_CUP, t.eggs.coffeeDone] };
    case "neofetch":
      return { lines: neofetch(context) };
    case "rm":
      return { lines: [t.eggs.rmDenied] };
    case "vim":
    case "nano":
    case "emacs":
      return { lines: [t.eggs.editor] };
    case "hello":
    case "hi":
    case "hey":
    case "bonjour":
    case "salut":
      return { lines: [t.eggs.hello] };
    default:
      return null;
  }
}
