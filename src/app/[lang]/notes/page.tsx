import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteChrome from "@/components/site-chrome";
import { notes } from "@/content/notes";
import { format, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { meta } = getDictionary(lang);
  return { title: meta.notesTitle, description: meta.notesDescription };
}

export default async function NotesPage({ params }: PageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).notes;
  const formatter = new Intl.DateTimeFormat(lang, { dateStyle: "long" });
  const sorted = [...notes].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <SiteChrome locale={lang}>
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neon-soft">{t.eyebrow}</p>
      <h1 className="font-display text-4xl font-extrabold text-white md:text-5xl">{t.title}</h1>
      <div className="mt-3 h-[2px] w-16 bg-gradient-to-r from-emerald-400 to-transparent" />
      <p className="mt-4 text-white/55">{t.intro}</p>

      <ul className="mt-10 flex flex-col gap-5">
        {sorted.map((note) => (
          <li key={note.slug}>
            <Link
              href={`/${lang}/notes/${note.slug}`}
              className="glass-card group block p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(0,255,106,0.12)]"
            >
              <p className="mb-2 flex items-center gap-3 font-mono text-xs text-neon-soft">
                <time dateTime={note.date}>{formatter.format(new Date(note.date))}</time>
                <span>{format(t.readTime, { minutes: note.readingMinutes })}</span>
                {lang !== "en" && <span className="rounded border border-neon/30 px-1.5 text-[10px]">{t.englishOnly}</span>}
              </p>
              <h2 className="font-display text-xl font-bold text-white transition-colors group-hover:text-neon">
                {note.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{note.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </SiteChrome>
  );
}
