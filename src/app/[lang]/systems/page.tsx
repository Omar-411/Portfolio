import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteChrome from "@/components/site-chrome";
import { systems } from "@/content/systems";
import SystemDiagram from "@/features/systems/system-diagram";
import { format, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { meta } = getDictionary(lang);
  return { title: meta.systemsTitle, description: meta.systemsDescription };
}

export default async function SystemsPage({ params }: PageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).systems;

  return (
    <SiteChrome locale={lang} wide>
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neon-soft">{t.eyebrow}</p>
      <h1 className="font-display text-4xl font-extrabold text-white md:text-5xl">{t.title}</h1>
      <div className="mt-3 h-[2px] w-16 bg-gradient-to-r from-emerald-400 to-transparent" />
      <p className="mt-4 max-w-2xl text-white/55">{t.intro}</p>

      <div className="mt-12 flex flex-col gap-12">
        {systems.map((system) => {
          const name = system.name[lang];
          return (
            <article key={system.slug} id={system.slug} aria-labelledby={`${system.slug}-title`} className="glass-card p-6 md:p-8">
              <header>
                <p className="mb-2 inline-block rounded-full border border-neon/30 px-3 py-0.5 font-mono text-[11px] uppercase tracking-wider text-neon-soft">
                  {t.status[system.status]}
                </p>
                <h2 id={`${system.slug}-title`} className="font-display text-2xl font-bold text-white md:text-3xl">
                  {name}
                </h2>
                <p className="mt-2 max-w-3xl leading-relaxed text-white/60">{system.summary[lang]}</p>
                <ul className="mt-4 flex flex-wrap gap-2" aria-label={t.stack}>
                  {system.stack.map((tech) => (
                    <li key={tech} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-white/60">
                      {tech}
                    </li>
                  ))}
                </ul>
              </header>

              <div className="mt-8 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3">
                <SystemDiagram
                  system={system}
                  locale={lang}
                  ariaLabel={format(t.diagramLabel, { name })}
                  flowsLabel={t.connections}
                />
              </div>
              <p className="mt-2 text-xs text-white/35 xl:hidden">{t.scrollHint}</p>

              <h3 className="mb-4 mt-10 font-mono text-xs uppercase tracking-widest text-neon-soft">{t.decisionsTitle}</h3>
              <ol className="flex flex-col gap-4">
                {system.decisions.map((decision, index) => (
                  <li key={decision.title.en} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                    <h4 className="flex items-baseline gap-3 font-display text-lg font-bold text-white">
                      <span className="font-mono text-sm text-neon-soft">{String(index + 1).padStart(2, "0")}</span>
                      {decision.title[lang]}
                    </h4>
                    <dl className="mt-3 grid gap-3 text-sm leading-relaxed md:grid-cols-2 md:gap-6">
                      <div>
                        <dt className="mb-1 font-mono text-[11px] uppercase tracking-wider text-emerald-400">{t.why}</dt>
                        <dd className="text-white/65">{decision.why[lang]}</dd>
                      </div>
                      <div>
                        <dt className="mb-1 font-mono text-[11px] uppercase tracking-wider text-amber-300">{t.tradeoff}</dt>
                        <dd className="text-white/65">{decision.tradeoff[lang]}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ol>
            </article>
          );
        })}
      </div>
    </SiteChrome>
  );
}
