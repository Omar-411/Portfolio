"use client";

import { m } from "framer-motion";
import { Briefcase, GraduationCap, Languages } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" },
} as const;

export default function Experience({ t }: { t: Dictionary["experience"] }) {
  return (
    <section id="experience" className="snap-section flex items-center">
      <div className="container relative z-10 mx-auto max-w-6xl px-6 py-24">
        <m.div className="mb-12" {...reveal}>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neon-soft">{t.eyebrow}</p>
          <h2 className="font-display text-4xl font-extrabold text-white md:text-5xl">{t.title}</h2>
          <div className="mt-3 h-[2px] w-16 bg-gradient-to-r from-emerald-400 to-transparent" />
        </m.div>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <ol className="relative flex flex-col gap-6 border-l border-neon/20 pl-6">
            {t.items.map((item) => (
              <m.li key={item.role} className="relative" {...reveal}>
                <span
                  className="absolute -left-[31px] top-5 h-3 w-3 rounded-full border-2 border-neon bg-void shadow-[0_0_10px_rgba(0,255,106,0.6)]"
                  aria-hidden="true"
                />
                <div className="glass-card p-5 transition-colors duration-300 hover:border-emerald-500/40">
                  <div className="mb-1 flex items-center gap-2 text-neon-soft">
                    <Briefcase size={14} aria-hidden="true" />
                    {item.period && <span className="font-mono text-xs uppercase tracking-widest">{item.period}</span>}
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">{item.role}</h3>
                  <p className="text-sm text-neon">{item.org}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{item.description}</p>
                </div>
              </m.li>
            ))}
          </ol>

          <div className="flex flex-col gap-6">
            <m.div className="glass-card p-5" {...reveal}>
              <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-white">
                <GraduationCap size={16} className="text-neon" aria-hidden="true" />
                {t.educationTitle}
              </h3>
              <ul className="flex flex-col gap-4">
                {t.education.map((item) => (
                  <li key={item.degree}>
                    <p className="font-mono text-xs uppercase tracking-widest text-neon-soft">{item.period}</p>
                    <p className="font-medium text-white">{item.degree}</p>
                    <p className="text-sm text-white/55">{item.school}</p>
                    <p className="text-sm text-neon">{item.note}</p>
                  </li>
                ))}
              </ul>
            </m.div>

            <m.div className="glass-card p-5" {...reveal}>
              <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-white">
                <Languages size={16} className="text-neon" aria-hidden="true" />
                {t.languagesTitle}
              </h3>
              <ul className="flex flex-col gap-2">
                {t.languages.map((language) => (
                  <li key={language.name} className="flex items-center justify-between text-sm">
                    <span className="text-white">{language.name}</span>
                    <span className="font-mono text-xs text-neon-soft">{language.level}</span>
                  </li>
                ))}
              </ul>
            </m.div>
          </div>
        </div>
      </div>
    </section>
  );
}
