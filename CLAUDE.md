# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio site (Omar Ajimi) built with Next.js 15 (App Router), React 19, TypeScript, and Tailwind CSS v4.

## Commands

- `npm run dev` — start dev server (Turbopack) at http://localhost:3000
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint (flat config, extends `next/core-web-vitals` and `next/typescript`)

There is no test suite configured in this repo.

## Architecture

- Single-page app: `src/app/page.tsx` composes the whole site as stacked `<section>`s (Hero, Projects, Skills, Contact) separated by `Divider` components, over a fixed `GridBackground` + radial-gradient backdrop that switches between light/dark variants via `dark:` classes.
- Page-specific sections live in `src/app/comps/` (e.g. `hero.tsx`, `projects.tsx`, `orbiting.tsx`, `movinv-grid.tsx`, `navigation.tsx`). Reusable/generic UI primitives live in `src/components/ui/` (e.g. `button.tsx`, `divider.tsx`, `dropdown-menu.tsx`).
- `Navigation` (`src/app/comps/navigation.tsx`) is not currently mounted in `layout.tsx` or `page.tsx` — check before assuming it's live on the site.
- Theming: `next-themes` via `ThemeProvider` (`src/app/comps/theme-provider.tsx`), wired in `src/app/layout.tsx` with `attribute="class"` and `defaultTheme="system"`. Components should support both light and dark styles using Tailwind `dark:` variants (this is a hard requirement throughout the codebase, not optional polish).
- Path alias `@/*` maps to `src/*` (see `tsconfig.json`).
- shadcn/ui-style setup: `components.json` defines aliases (`@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`) and uses the `new-york` style with `neutral` base color, RSC enabled, lucide icons.
- `seraui.config.json` points to an external component registry (`https://seraui.seraprogrammer.com/registry`); `components/registry/seraui/` holds components pulled from that registry, separate from `src/components/ui/`.
- `cn()` helper in `src/lib/utils.ts` (clsx + tailwind-merge) is the standard way to compose conditional Tailwind classes — use it instead of manual string concatenation.
- The contact form in `page.tsx` posts directly to FormSubmit (`https://formsubmit.co/...`) — no backend/API route involved.
