# CLAUDE.md

Personal portfolio for Omar Ajimi. Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, framer-motion 12 (`LazyMotion strict`, `m.*` only). Package manager: **bun** (`bun.lock` is the only lockfile).

## Commands

- `bun dev` — dev server (Turbopack)
- `bun run build` / `bun start` — production build / serve
- `bun run lint` — ESLint flat config
- `bunx tsc --noEmit` — type check

## Routes

- `/` — boot terminal (`src/app/(intro)`); "press ENTER to boot" gate unlocks audio, then routes to `/{locale}/portfolio`.
- `/{en|fr}/portfolio` — one-page site: Hero, Experience, Projects, Skills, Services, Contact.
- `/{lang}/projects/[slug]` — case study (content in `src/content/case-studies.ts`).
- `/{lang}/notes`, `/{lang}/notes/[slug]` — short notes (`src/content/notes.ts`, English only).
- `/portfolio` redirects to `/en/portfolio`. `sitemap.xml`, `robots.txt` and an Open Graph image are generated.
- Two root layouts via route groups: `(intro)` and `[lang]`. `[lang]` uses `generateStaticParams` with `dynamicParams = false`.

## Architecture (dependencies point inward)

- `src/content/` — pure data: profile, projects, skills, case studies, notes, web3 proof. User-facing text is `Localized<T>` (`{ en, fr }`).
- `src/i18n/` — `config.ts` (locales, `Localized`, `format`), `dictionaries/{en,fr}.ts` (`fr` must satisfy `typeof en`), `client.ts` (remembered locale in localStorage `portfolio:lang`).
- `src/features/portfolio/*` — one folder per section; sections receive `t` (dictionary slice) and `locale` as props.
- `src/features/palette/` — terminal command palette (Ctrl/Cmd+K). `commands.ts` is pure (`runCommand`, `complete`); `command-palette.tsx` and `palette-provider.tsx` are the UI and wiring. Add a command in `commands.ts` plus its description in both dictionaries.
- `src/features/booking/` — built-in "Book a call" dialog: `slots.ts` is pure (weekday slots defined in Tunis time), `booking-dialog.tsx` is the UI (portal). Requests go to the owner's inbox via `src/lib/formsubmit.ts`. Setting `NEXT_PUBLIC_BOOKING_URL` replaces the dialog with an external link.
- `src/features/intro/` — boot terminal.
- `src/lib/audio.ts` — single lazy `AudioContext`, synthesized sounds (no samples), mute in localStorage `portfolio:muted`. `ui-sounds.tsx` delegates hover/click/typing sounds from the document.
- `src/components/` — shared UI and effects. Scroll container on the one-page site is `[data-scroll-container]` (`.snap-container`); sub-pages scroll the window.

## Content to fill in (left empty on purpose, never invent facts)

- `src/content/case-studies.ts` — `problem`, `approach`, `results`, `stack`, `highlights` per project; empty sections are hidden.
- `src/content/web3.ts` — `ens` and `contracts`; the proof strip is hidden until filled.
- Env vars: see `.env.example` (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BOOKING_URL`, `NEXT_PUBLIC_FORMSUBMIT_ALIAS`, `GITHUB_TOKEN`).

## Conventions

- No tests configured. Verify with build, tsc, lint.
- Use `cn()` from `src/lib/utils.ts` for conditional classes.
- Comments explain "why" only.
