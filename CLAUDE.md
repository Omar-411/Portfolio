# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Personal portfolio for Omar Ajimi. Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion. Dark-only design (no theme switcher).

## Commands

- `npm run dev` — dev server (Turbopack) at http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (flat config, `next/core-web-vitals` + `next/typescript`)

No test suite is configured.

## Routes

- `/` — boot-terminal intro (`features/intro`). Waits for ENTER/click (this unlocks audio), types a short boot log (~2s), then routes to `/portfolio`. ESC or "skip intro" leaves immediately. A `sessionStorage` flag makes repeat visits skip it.
- `/portfolio` — single page of snapping sections: Hero, Projects, Skills, Contact. `<main>` is the scroll container (not `window`).

## Architecture (dependencies point inward)

- `src/content/` — plain data: profile, skills, featured projects. Edit copy here, not in components.
- `src/lib/` — infrastructure helpers with no UI: `audio.ts` (Web Audio, one lazy context, must be unlocked from a user gesture), `github.ts` (repo fetch, returns `null` on failure), `utils.ts` (`cn`).
- `src/components/` — shared UI: `effects/` (aurora background, single shared matrix-rain canvas, custom cursor, scroll progress) and `motion-provider.tsx` (`LazyMotion` strict + reduced-motion).
- `src/features/` — feature code: `intro/` and `portfolio/{hero,projects,skills,contact}` plus `portfolio/navbar.tsx`.
- `src/app/` — routing only (layout, pages, `globals.css`).

## Conventions

- Animation: ambient loops are CSS (transform/opacity only); entrances and scroll reveals use Framer Motion's `m` components (never `motion`, `LazyMotion strict` will throw). Respect `prefers-reduced-motion`.
- Tokens live in `@theme` in `globals.css` (`bg-void`, `text-neon`, `text-neon-soft`, `font-display`, `font-code`). Use them instead of hard-coded hex.
- Sections use `.snap-section` (`min-height: 100dvh`); never clip them with `overflow: hidden`.
- Projects show curated copy from `content/projects.ts`; GitHub data only adds language/stars/topics. If GitHub fails the card still renders, without invented data.
- Use `cn()` for conditional classes.

## Environment (see `.env.example`)

- `GITHUB_TOKEN` — optional, raises the GitHub API rate limit.
- `NEXT_PUBLIC_FORMSUBMIT_ALIAS` — optional FormSubmit alias so the real email isn't in the page source.
- `NEXT_PUBLIC_SITE_URL` — optional, sets `metadataBase` for Open Graph URLs.
