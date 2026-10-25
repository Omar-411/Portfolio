# CLAUDE.md

Personal portfolio for Omar Ajimi. Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, framer-motion 12 (`LazyMotion strict`, `m.*` only). Package manager: **bun** (`bun.lock` is the only lockfile).

## Commands

- `bun dev` — dev server (Turbopack)
- `bun run build` / `bun start` — production build / serve
- `bun run lint` — ESLint flat config
- `bunx tsc --noEmit` — type check

## Routes

- `/` — boot terminal (`src/app/(intro)`); "press ENTER to boot" gate unlocks audio, then routes to `/{locale}/portfolio`.
- `/{en|fr}/portfolio` — one-page site: Hero, Experience, Projects, Skills, Services, Reviews (only when storage is configured). The Contact section is parked: `features/portfolio/contact/contact.tsx` and the `contact` dictionary block are kept, but it is not mounted in `portfolio/page.tsx` and has no navbar or terminal entry. To bring it back, mount `<Contact t={dictionary.contact} />`, re-add `{ key: "contact", id: "contact" }` to `SECTIONS` in `navbar.tsx` (plus `nav.contact` in both dictionaries), and the `contact` entries in `commands.ts`, `easter-eggs.ts` and `palette.commands` in both dictionaries.
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
- `src/features/transition/` — terminal scan-line wipe between pages. `route-transition.ts` is pure (`shouldTransition`, `routeLabel`, timings); `TransitionProvider` (in the `[lang]` layout, above the palette) exposes `useRouteTransition().navigate`; `TransitionLink` is a normal `<Link>` that plays the wipe on a plain left click. Use `TransitionLink` for in-app page links and `navigate` for programmatic moves; hash-only jumps and modified clicks skip the wipe. The cover is lifted when `usePathname` reaches the target (3s fallback).
- Hero name: `hero/animated-name.tsx` paints the letters from falling glyphs on a temporary canvas, once per session (`portfolio:name-rain` in sessionStorage), only when the title is on screen and there is no deep-link hash. `hero/name-rain.ts` is the pure timing and decision logic. The `h1` carries the full name in `aria-label`; the per-letter spans must not be given a stacking-context parent with `background-clip: text` (that is why `text-aurora` sits on each letter).
- `src/features/systems/flow-packets.tsx` — SVG `animateMotion` dots along the diagram edges (`packet-timing.ts` is pure). They start when the diagram is 35% visible, pause when it leaves, and are not rendered with reduced motion. They are drawn under the nodes on purpose.
- Pointer effects: `components/effects/pointer-effects.tsx` (mounted once in the `[lang]` layout) delegates one `pointermove` listener. Mark a card `data-tilt="<max degrees>"` to make it lean toward the cursor with a light reflection, and any button or link `data-magnetic` to make it drift toward the cursor (max 10px, 48px reach). It only writes CSS variables (`--rx --ry --px --py --glow`, `--mx --my`) that `globals.css` turns into `transform`, a `::after` glow and `translate`; `pointer-math.ts` is the pure math. `data-tilt` owns the element's `transform`, so never put it on a framer-motion element (Services wraps its card in an inner div for that reason). Cards with focus inside stay straight. Not active on touch or with reduced motion.
- `components/effects/decrypt-text.tsx` — `<DecryptText text className? delayMs? />` for headings. The real text always stays in the DOM; when it scrolls into view an `aria-hidden` overlay of per-letter boxes (widths measured from the real text, so nothing reflows) scrambles and resolves left to right, then is removed. Pass the gradient class (`text-aurora`) through `className`, because `background-clip: text` cannot span elements. `decrypt.ts` is the pure plan. `lib/glyphs.ts` is the shared glyph set for every matrix effect.
- `src/features/reviews/` — visitor reviews, approval first. `review.ts` is the pure domain (limits, `validateReviewInput` shared by the form and the API, link/spam rule, `parseStoredReview`); `moderation-page.ts` builds the owner's approve/delete HTML (escaped); `reviews.tsx` (server section, cards use `data-tilt`) and `review-form.tsx` (client) are the UI. Infrastructure: `lib/reviews-store.ts` (Upstash/Vercel KV over REST, no SDK: pending reviews are `review:<id>` with a 30-day TTL, approval does `PERSIST` + `ZADD reviews:approved`, reads are cached 60s), `lib/review-signature.ts` (HMAC links, hashed rate-limit key), `lib/review-notification.ts` (emails the owner: Resend when `RESEND_API_KEY` is set, else FormSubmit, which often refuses server-side requests; `RESEND_API_BASE` exists only to point tests at a mock). API: `/api/reviews` (submit: honeypot, validation, 3/hour limit, stores pending, emails the owner; the moderation link is logged if the email fails) and `/api/reviews/moderate` (signed link: GET shows the review and changes nothing, POST approves or deletes). The section and the navbar link render only when `isReviewsConfigured` (`UPSTASH_REDIS_REST_*` or `KV_REST_API_*`, plus `REVIEWS_ADMIN_SECRET`). Do not use `revalidatePath`/`revalidateTag` here: with `dynamicParams = false` they make `/[lang]/portfolio` answer 404 on this Next version, so approvals rely on the 60s time-based refresh. Moderation lives on the site itself: `app/(admin)/admin/reviews/page.tsx` (its own root layout, `noindex`, listed in robots) shows a login form until the admin cookie is set, then pending reviews (found by scanning `review:*`, so no second index) and public ones with Approve and Delete buttons. `lib/admin-session.ts` is the pure cookie logic (the cookie is an HMAC of a fixed label, the password is `REVIEWS_ADMIN_SECRET`), `lib/admin-auth.ts` reads it, and `app/api/admin/{login,logout,reviews}` are the form endpoints (login is limited to 8 tries per 15 minutes). The emailed link and the email are optional extras. Setup: `docs/reviews-setup.md`.
- `src/features/lab/` — Lab demos. `gas.ts` is pure; `web3-client.ts` lazily imports viem (public RPC, override with `NEXT_PUBLIC_ETH_RPC_URL`) so it only loads when a demo is used; one component per demo, wrapped by `demo-card.tsx`. Wallet access is read-only except message signing, which never leaves the browser.
- Services shows a "Recently shipped" strip from `fetchRecentActivity` (`src/lib/github.ts`, hourly revalidate, hidden when GitHub is unreachable). `GITHUB_API_URL` exists only to point tests at a mock.
- `src/features/intro/` — boot terminal.
- `src/lib/audio.ts` — single lazy `AudioContext`, synthesized sounds (no samples), mute in localStorage `portfolio:muted`. `ui-sounds.tsx` delegates hover/click/typing sounds from the document.
- `src/components/` — shared UI and effects. Scroll container on the one-page site is `[data-scroll-container]` (`.snap-container`); sub-pages scroll the window.

## Content to fill in (left empty on purpose, never invent facts)

- `src/content/case-studies.ts` — `problem`, `approach`, `results`, `stack`, `highlights` per project; empty sections are hidden.
- `src/content/systems.ts` — the three designs are written from the project scopes: review the decisions and trade-offs so they match what you would defend in an interview. `status` is `design` or `client` (anonymized, no client name).
- `src/content/web3.ts` — `ens` and `contracts`; the proof strip is hidden until filled.
- Env vars: see `.env.example` (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BOOKING_URL`, `NEXT_PUBLIC_FORMSUBMIT_ALIAS`, `NEXT_PUBLIC_ETH_RPC_URL`, `GITHUB_TOKEN`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `REVIEWS_ADMIN_SECRET`).

## Conventions

- No tests configured. Verify with build, tsc, lint.
- Use `cn()` from `src/lib/utils.ts` for conditional classes.
- Comments explain "why" only.
