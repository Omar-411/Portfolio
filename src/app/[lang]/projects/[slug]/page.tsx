import type { Metadata } from "next";
import Image from "next/image";
import TransitionLink from "@/features/transition/transition-link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Github, Star } from "lucide-react";
import SiteChrome from "@/components/site-chrome";
import { caseStudies, getCaseStudy } from "@/content/case-studies";
import { profile } from "@/content/profile";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { fetchRepo } from "@/lib/github";

type PageProps = { params: Promise<{ lang: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => caseStudies.map(({ slug }) => ({ lang, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const study = getCaseStudy(slug);
  if (!isLocale(lang) || !study) return {};
  return { title: study.title, description: study.summary[lang] };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 font-display text-2xl font-bold text-white">{title}</h2>
      {children}
    </section>
  );
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { lang, slug } = await params;
  const study = getCaseStudy(slug);
  if (!isLocale(lang) || !study) notFound();

  const locale: Locale = lang;
  const t = getDictionary(locale).caseStudy;
  const live = await fetchRepo(profile.githubUser, study.repo);
  const repoUrl = live?.html_url ?? `${profile.github}/${study.repo}`;
  const highlights = study.highlights?.[locale];
  const results = study.results?.[locale];
  const stack = Array.from(new Set([...(study.stack ?? []), ...(live?.language ? [live.language] : [])]));

  return (
    <SiteChrome locale={locale}>
      <TransitionLink
        href={`/${locale}/portfolio#projects`}
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-neon"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        {t.back}
      </TransitionLink>

      <article>
        <h1 className="font-display text-4xl font-extrabold text-white md:text-5xl">{study.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-white/60">{study.summary[locale]}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-neon/25 bg-neon/10 px-4 py-2 text-neon transition-colors hover:bg-neon/20"
          >
            <Github size={14} aria-hidden="true" />
            {t.sourceCode}
          </a>
          {live?.homepage && (
            <a
              href={live.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-white/70 transition-colors hover:border-white/40 hover:text-white"
            >
              <ExternalLink size={14} aria-hidden="true" />
              {t.liveDemo}
            </a>
          )}
          {live && live.stargazers_count > 0 && (
            <span className="inline-flex items-center gap-1 text-yellow-400">
              <Star size={14} aria-hidden="true" />
              {live.stargazers_count}
              <span className="sr-only">{t.stars}</span>
            </span>
          )}
        </div>

        <div className="relative mt-8 aspect-[2/1] overflow-hidden rounded-2xl border border-neon/15">
          <Image
            src={`https://opengraph.githubassets.com/1/${profile.githubUser}/${study.repo}`}
            alt={`${study.title} preview`}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
            priority
          />
        </div>

        {highlights && highlights.length > 0 && (
          <Section title={t.highlights}>
            <ul className="list-disc space-y-2 pl-5 text-white/70 marker:text-neon">
              {highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        )}

        {study.problem && (
          <Section title={t.problem}>
            <p className="leading-relaxed text-white/70">{study.problem[locale]}</p>
          </Section>
        )}

        {study.approach && (
          <Section title={t.approach}>
            <p className="leading-relaxed text-white/70">{study.approach[locale]}</p>
          </Section>
        )}

        {results && results.length > 0 && (
          <Section title={t.results}>
            <ul className="list-disc space-y-2 pl-5 text-white/70 marker:text-neon">
              {results.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        )}

        {stack.length > 0 && (
          <Section title={t.stack}>
            <ul className="flex flex-wrap gap-2">
              {stack.map((item) => (
                <li key={item} className="rounded-full border border-neon/20 bg-neon/[0.06] px-3 py-1 text-xs text-neon-soft">
                  {item}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </article>
    </SiteChrome>
  );
}
