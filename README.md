# Omar Ajimi — Portfolio

Bilingual (EN/FR) portfolio built with Next.js 15, React 19, Tailwind CSS v4 and framer-motion.

## Run

```bash
bun install
bun dev          # http://localhost:3000
bun run build && bun start
```

## Highlights

- Boot-terminal intro with a "press ENTER" gate so sound always works (synthesized with the Web Audio API, no audio files).
- Hover, click and real typewriter key sounds, with a mute toggle.
- `Ctrl/Cmd + K` opens a terminal command palette (`help`, `projects`, `lang fr`, `sound`, ...).
- One-page site: Hero, Experience and education, Projects, Skills, Services, Contact.
- System design gallery: diagrams, key decisions and trade-offs for three architectures.
- Lab: live Web3 demos (wallet and ENS lookup, gas estimator, signature check) and the typewriter sound toy.
- Real "Book a call" with Google Calendar invitations, case study pages, live GitHub activity, sitemap, robots, Open Graph image, JSON-LD.

## Configure

Copy `.env.example` to `.env.local`. For real Google Calendar invitations on "Book a call", follow `docs/google-calendar-setup.md`. Content lives in `src/content/` and `src/i18n/dictionaries/`. See `CLAUDE.md` for the architecture and what is left to fill in.
