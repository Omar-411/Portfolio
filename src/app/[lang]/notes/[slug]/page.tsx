import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import RichText from "@/components/rich-text";
import SiteChrome from "@/components/site-chrome";
import { getNote, notes } from "@/content/notes";
import { profile } from "@/content/profile";
import { format, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

type PageProps = { params: Promise<{ lang: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => notes.map(({ slug }) => ({ lang, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return {};
  return {
    title: note.title,
    description: note.description,
    openGraph: { type: "article", publishedTime: note.date, title: note.title, description: note.description },
  };
}

export default async function NotePage({ params }: PageProps) {
  const { lang, slug } = await params;
  const note = getNote(slug);
  if (!isLocale(lang) || !note) notFound();

  const t = getDictionary(lang).notes;
  const date = new Intl.DateTimeFormat(lang, { dateStyle: "long" }).format(new Date(note.date));

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: note.title,
    description: note.description,
    datePublished: note.date,
    author: { "@type": "Person", name: profile.name },
  };

  return (
    <SiteChrome locale={lang}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <Link
        href={`/${lang}/notes`}
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-neon"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        {t.back}
      </Link>

      <article>
        <p className="mb-3 flex items-center gap-3 font-mono text-xs text-neon-soft">
          <time dateTime={note.date}>{format(t.publishedOn, { date })}</time>
          <span>{format(t.readTime, { minutes: note.readingMinutes })}</span>
        </p>
        <h1 className="font-display text-3xl font-extrabold leading-tight text-white md:text-5xl">{note.title}</h1>

        <div className="mt-8 space-y-5 text-base leading-relaxed text-white/70">
          {note.blocks.map((block, i) => {
            switch (block.type) {
              case "h2":
                return (
                  <h2 key={i} className="pt-4 font-display text-2xl font-bold text-white">
                    {block.text}
                  </h2>
                );
              case "p":
                return (
                  <p key={i}>
                    <RichText text={block.text} />
                  </p>
                );
              case "ul":
                return (
                  <ul key={i} className="list-disc space-y-2 pl-5 marker:text-neon">
                    {block.items.map((item) => (
                      <li key={item}>
                        <RichText text={item} />
                      </li>
                    ))}
                  </ul>
                );
              case "code":
                return (
                  <pre
                    key={i}
                    className="overflow-x-auto rounded-xl border border-neon/15 bg-black/40 p-4 font-code text-[13px] leading-relaxed text-[#d6ffe6]"
                  >
                    <code data-language={block.language}>{block.code}</code>
                  </pre>
                );
            }
          })}
        </div>
      </article>
    </SiteChrome>
  );
}
