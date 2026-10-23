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
- `/{lang}/systems` — system design gallery (content in `src/content/systems.ts`): layered SVG diagram, key decisions with why and trade-off.
- `/{lang}/lab` — live demos: wallet and ENS lookup, gas cost estimator, signature check, typewriter sound.
- `/portfolio` redirects to `/en/portfolio`. `sitemap.xml`, `robots.txt` and an Open Graph image are generated.
- Two root layouts via route groups: `(intro)` and `[lang]`. `[lang]` uses `generateStaticParams` with `dynamicParams = false`.

## Architecture (dependencies point inward)

- `src/content/` — pure data: profile, projects, skills, case studies, web3 proof. User-facing text is `Localized<T>` (`{ en, fr }`).
- `src/i18n/` — `config.ts` (locales, `Localized`, `format`), `dictionaries/{en,fr}.ts` (`fr` must satisfy `typeof en`), `client.ts` (remembered locale in localStorage `portfolio:lang`).
- `src/features/portfolio/*` — one folder per section; sections receive `t` (dictionary slice) and `locale` as props.
- `src/features/palette/` — terminal command palette (Ctrl/Cmd+K). `commands.ts` is pure (`runCommand`, `complete`); `command-palette.tsx` and `palette-provider.tsx` are the UI and wiring. Add a command in `commands.ts` plus its description in both dictionaries. Hidden commands (`whoami`, `sudo hire omar`, `cd`, `ls`, `neofetch`, `coffee`...) live in `easter-eggs.ts`: pure, dispatched only when the input is not a listed command, and deliberately absent from `help` and Tab completion. Their text is in `palette.eggs` in both dictionaries.
- `src/features/booking/` — "Book a call" dialog, mounted once by `BookingProvider` in the `[lang]` layout; `useBooking().open()` opens it from anywhere (Services button, `sudo hire omar` in the terminal) or the external page when `NEXT_PUBLIC_BOOKING_URL` is set. `slots.ts` is pure (weekday slots in Tunis time, busy checks), `booking-dialog.tsx` is the UI (portal), `client.ts` talks to the API. Server side: `src/app/api/booking` and `src/app/api/availability` use `src/lib/google-calendar.ts` (OAuth refresh token, no SDK) to create a real event with a Meet link and invitation. Without `GOOGLE_*` env vars the API answers 501 and the client falls back to an email request via `src/lib/formsubmit.ts`. Setup: `docs/google-calendar-setup.md`. `NEXT_PUBLIC_BOOKING_URL` replaces the dialog with an external link. `GOOGLE_TOKEN_URL` and `GOOGLE_API_BASE` exist only to point tests at a mock.
- `src/features/systems/` — `layout.ts` is a pure layered-diagram layout (nodes per layer, edges between ids); `system-diagram.tsx` renders the SVG. Edges should connect adjacent layers: a skipped layer routes the line behind other nodes and reads as a false connection.
- `src/features/lab/` — Lab demos. `gas.ts` is pure; `web3-client.ts` lazily imports viem (public RPC, override with `NEXT_PUBLIC_ETH_RPC_URL`) so it only loads when a demo is used; one component per demo, wrapped by `demo-card.tsx`. Wallet access is read-only except message signing, which never leaves the browser.
- Services shows a "Recently shipped" strip from `fetchRecentActivity` (`src/lib/github.ts`, hourly revalidate, hidden when GitHub is unreachable). `GITHUB_API_URL` exists only to point tests at a mock.
- `src/features/intro/` — boot terminal.
- `src/lib/audio.ts` — single lazy `AudioContext`, synthesized sounds (no samples), mute in localStorage `portfolio:muted`. `ui-sounds.tsx` delegates hover/click/typing sounds from the document.
- `src/components/` — shared UI and effects. Scroll container on the one-page site is `[data-scroll-container]` (`.snap-container`); sub-pages scroll the window.

## Content to fill in (left empty on purpose, never invent facts)

- `src/content/case-studies.ts` — `problem`, `approach`, `results`, `stack`, `highlights` per project; empty sections are hidden.
- `src/content/systems.ts` — the three designs are written from the project scopes: review the decisions and trade-offs so they match what you would defend in an interview. `status` is `design` or `client` (anonymized, no client name).
- `src/content/web3.ts` — `ens` and `contracts`; the proof strip is hidden until filled.
- Env vars: see `.env.example` (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BOOKING_URL`, `NEXT_PUBLIC_FORMSUBMIT_ALIAS`, `NEXT_PUBLIC_ETH_RPC_URL`, `GITHUB_TOKEN`).

## Conventions

- No tests configured. Verify with build, tsc, lint.
- Use `cn()` from `src/lib/utils.ts` for conditional classes.
- Comments explain "why" only.
