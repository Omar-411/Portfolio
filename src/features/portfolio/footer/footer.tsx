import Image from "next/image";
import { Clock, Download, Github, Languages, Linkedin, Mail, MapPin } from "lucide-react";
import { profile } from "@/content/profile";
import BookCallButton from "@/features/booking/book-call-button";
import TransitionLink from "@/features/transition/transition-link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

interface FooterProps {
  locale: Locale;
  t: Dictionary["footer"];
  nav: Dictionary["nav"];
  /** Section links are in-page anchors on the portfolio and full paths elsewhere. */
  onPortfolio: boolean;
  showReviews: boolean;
}

const SECTION_KEYS = ["about", "experience", "projects", "skills", "services"] as const;
const SECTION_IDS: Record<(typeof SECTION_KEYS)[number], string> = {
  about: "hero",
  experience: "experience",
  projects: "projects",
  skills: "skills",
  services: "services",
};

const linkClass = "inline-flex items-center gap-2 text-sm text-white/50 transition-colors duration-200 hover:text-neon";
const titleClass = "mb-4 font-mono text-xs uppercase tracking-widest text-neon-soft";
const bookClass =
  "mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(0,255,106,0.4)]";

export default function Footer({ locale, t, nav, onPortfolio, showReviews }: FooterProps) {
  const portfolioPath = `/${locale}/portfolio`;
  const hrefFor = (id: string) => (onPortfolio ? `#${id}` : `${portfolioPath}#${id}`);
  const sections = [
    ...SECTION_KEYS.map((key) => ({ label: nav[key], href: hrefFor(SECTION_IDS[key]) })),
    ...(showReviews ? [{ label: nav.reviews, href: hrefFor("reviews") }] : []),
    { label: nav.systems, href: `/${locale}/systems` },
    { label: nav.lab, href: `/${locale}/lab` },
  ];

  return (
    <footer className="snap-footer relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-sm">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative block h-10 w-10 overflow-hidden rounded-full ring-2 ring-emerald-400/60">
              <Image src="/pdp-avatar.jpg" alt="" fill sizes="40px" className="object-cover" />
            </span>
            <p className="font-display text-lg font-bold text-white">{profile.name}</p>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">{t.tagline}</p>
          <p className="mt-4 inline-flex items-center gap-2 text-xs text-white/60">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
            {t.status}
          </p>
        </div>

        <nav aria-label={t.exploreTitle}>
          <h2 className={titleClass}>{t.exploreTitle}</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:flex sm:flex-col">
            {sections.map(({ label, href }) => (
              <li key={href}>
                <TransitionLink href={href} className={linkClass}>
                  {label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={titleClass}>{t.contactTitle}</h2>
          <ul className="flex flex-col gap-2.5">
            <li>
              <a href={`mailto:${profile.email}`} className={linkClass}>
                <Mail size={15} aria-hidden="true" />
                {profile.email}
              </a>
            </li>
            <li>
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <Github size={15} aria-hidden="true" />
                GitHub
              </a>
            </li>
            <li>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <Linkedin size={15} aria-hidden="true" />
                LinkedIn
              </a>
            </li>
            <li>
              <a href={profile.resume} download className={linkClass}>
                <Download size={15} aria-hidden="true" />
                {t.resume}
              </a>
            </li>
          </ul>
          <BookCallButton label={t.bookCall} className={bookClass} />
        </div>

        <div>
          <h2 className={titleClass}>{t.infoTitle}</h2>
          <ul className="flex flex-col gap-3 text-sm text-white/50">
            <li className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 shrink-0 text-neon-soft" aria-hidden="true" />
              {t.location}
            </li>
            <li className="flex items-start gap-2">
              <Clock size={15} className="mt-0.5 shrink-0 text-neon-soft" aria-hidden="true" />
              {t.timezone}
            </li>
            <li className="flex items-start gap-2">
              <Languages size={15} className="mt-0.5 shrink-0 text-neon-soft" aria-hidden="true" />
              {t.languages}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-white/30 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {profile.alias}. {t.rights}
          </p>
          <TransitionLink href={hrefFor("hero")} className="transition-colors duration-200 hover:text-neon">
            {nav.backToTop} ↑
          </TransitionLink>
        </div>
      </div>
    </footer>
  );
}
