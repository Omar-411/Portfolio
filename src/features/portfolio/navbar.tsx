"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Github, Menu, Terminal, X } from "lucide-react";
import SoundToggle from "@/components/sound-toggle";
import { profile } from "@/content/profile";
import { rememberLocale } from "@/i18n/client";
import { locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { usePalette } from "@/features/palette/palette-provider";
import TransitionLink from "@/features/transition/transition-link";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { key: "about", id: "hero" },
  { key: "experience", id: "experience" },
  { key: "projects", id: "projects" },
  { key: "skills", id: "skills" },
  { key: "services", id: "services" },
] as const;

const REVIEWS_SECTION = { key: "reviews", id: "reviews" } as const;

const EXTRA_PAGES = [
  { key: "systems", path: "systems" },
  { key: "lab", path: "lab" },
] as const;

interface NavbarProps {
  locale: Locale;
  t: Dictionary["nav"];
  /** The reviews section only exists once its storage is configured. */
  showReviews?: boolean;
}

const iconButton =
  "rounded-lg p-1.5 text-white/40 transition-colors duration-200 hover:bg-white/10 hover:text-neon";

export default function Navbar({ locale, t, showReviews = false }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { open: openPalette } = usePalette();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
  const sections = showReviews ? [...SECTIONS, REVIEWS_SECTION] : SECTIONS;

  const portfolioPath = `/${locale}/portfolio`;
  const onPortfolio = pathname === portfolioPath;
  const onSystems = pathname.startsWith(`/${locale}/systems`);
  const onLab = pathname.startsWith(`/${locale}/lab`);
  const hrefFor = (id: string) => (onPortfolio ? `#${id}` : `${portfolioPath}#${id}`);

  // A section is "active" while it crosses the middle line of the scroll container.
  useEffect(() => {
    if (!onPortfolio) return;
    const container = document.querySelector("[data-scroll-container]");
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { root: container, rootMargin: "-50% 0px -50% 0px" }
    );

    for (const { id } of showReviews ? [...SECTIONS, REVIEWS_SECTION] : SECTIONS) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [onPortfolio, showReviews]);

  const switchLocale = (next: Locale) => {
    if (next === locale) return;
    rememberLocale(next);
    router.push(`${pathname.replace(/^\/(en|fr)(?=\/|$)/, `/${next}`)}${window.location.hash}`);
  };

  const pillClass = (active: boolean) =>
    cn(
      "rounded-full px-3 py-1.5 text-sm transition-colors duration-200 xl:px-4",
      active ? "bg-white/10 text-neon" : "text-white/60 hover:bg-white/5 hover:text-neon"
    );

  return (
    <nav className="fixed inset-x-0 top-0 z-50" aria-label={t.main}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <TransitionLink
          href={hrefFor("hero")}
          aria-label={t.backToTop}
          className="relative block h-10 w-10 overflow-hidden rounded-full ring-2 ring-emerald-400/60 transition-shadow duration-300 hover:shadow-[0_0_18px_rgba(0,255,106,0.55)]"
        >
          <Image src="/pdp-avatar.jpg" alt="" fill sizes="40px" priority className="object-cover" />
        </TransitionLink>

        <div className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-white/5 px-2 py-1 backdrop-blur-md lg:flex">
          {sections.map(({ key, id }) => (
            <TransitionLink key={id} href={hrefFor(id)} className={pillClass(onPortfolio && activeId === id)}>
              {t[key]}
            </TransitionLink>
          ))}
          <TransitionLink href={`/${locale}/systems`} className={pillClass(onSystems)}>
            {t.systems}
          </TransitionLink>
          <TransitionLink href={`/${locale}/lab`} className={pillClass(onLab)}>
            {t.lab}
          </TransitionLink>
        </div>

        <div className="flex items-center gap-1.5">
          <div role="group" aria-label={t.language} className="flex items-center rounded-lg border border-white/10 text-xs">
            {locales.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => switchLocale(code)}
                aria-pressed={code === locale}
                className={cn(
                  "px-2 py-1 font-mono uppercase transition-colors first:rounded-l-lg last:rounded-r-lg",
                  code === locale ? "bg-neon/15 text-neon" : "text-white/40 hover:text-white"
                )}
              >
                {code}
              </button>
            ))}
          </div>
          <button type="button" onClick={openPalette} aria-label={t.openTerminal} title={t.openTerminal} className={iconButton}>
            <Terminal size={18} />
          </button>
          <SoundToggle className={iconButton} size={18} muteLabel={t.muteSound} unmuteLabel={t.unmuteSound} />
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className={cn(iconButton, "hidden sm:block")}
          >
            <Github size={18} />
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={menuOpen ? t.closeMenu : t.openMenu}
            aria-expanded={menuOpen}
            className={cn(iconButton, "lg:hidden")}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 -z-10 flex flex-col items-center justify-center gap-6 bg-void/95 backdrop-blur-md">
          {sections.map(({ key, id }) => (
            <TransitionLink
              key={id}
              href={hrefFor(id)}
              onClick={() => setMenuOpen(false)}
              className="font-display text-3xl font-bold text-white/70 transition-colors duration-200 hover:text-neon"
            >
              {t[key]}
            </TransitionLink>
          ))}
          {EXTRA_PAGES.map(({ key, path }) => (
            <TransitionLink
              key={path}
              href={`/${locale}/${path}`}
              onClick={() => setMenuOpen(false)}
              className="font-display text-3xl font-bold text-white/70 transition-colors duration-200 hover:text-neon"
            >
              {t[key]}
            </TransitionLink>
          ))}
        </div>
      )}
    </nav>
  );
}
