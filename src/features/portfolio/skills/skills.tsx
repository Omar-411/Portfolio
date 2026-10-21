"use client";

import { useState, type CSSProperties } from "react";
import { m } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { profile } from "@/content/profile";
import { skillCategories } from "@/content/skills";
import { format, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

const arrowClass =
  "flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all duration-200 hover:border-emerald-500/40 hover:text-neon";

interface SkillsProps {
  locale: Locale;
  t: Dictionary["skills"];
}

export default function Skills({ locale, t }: SkillsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const category = skillCategories[activeIndex];
  const count = skillCategories.length;

  const goTo = (delta: number) => setActiveIndex((index) => (index + delta + count) % count);

  return (
    <section id="skills" className="snap-section flex items-center justify-center">
      <div className="container relative z-10 mx-auto max-w-7xl px-6 py-20">
        <m.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-neon-soft">{t.eyebrow}</p>
          <h2 className="mb-4 font-display text-4xl font-extrabold text-white md:text-5xl">{t.title}</h2>
          <div className="mx-auto h-[2px] w-24 bg-gradient-to-r from-emerald-400 to-transparent" />
        </m.div>

        <div className="mx-auto max-w-4xl">
          <m.div
            key={category.title.en}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="rounded-3xl border p-6 md:p-12"
            style={
              {
                "--cat": category.color,
                borderColor: `${category.color}40`,
                background: `radial-gradient(ellipse at center, ${category.color}26 0%, rgba(2,11,6,0.8) 70%)`,
                boxShadow: `0 0 60px ${category.color}20, inset 0 1px 0 ${category.color}20`,
              } as CSSProperties
            }
          >
            <div className="mb-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${category.color}, ${category.color}80)`,
                    boxShadow: `0 0 30px ${category.color}40`,
                  }}
                  aria-hidden="true"
                >
                  {category.icon}
                </div>
                <h3 className="font-display text-2xl font-extrabold text-white md:text-3xl">{category.title[locale]}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => goTo(-1)} className={arrowClass} aria-label={t.previous}>
                  <ChevronLeft size={18} />
                </button>
                <button type="button" onClick={() => goTo(1)} className={arrowClass} aria-label={t.next}>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              {category.skills.map((skill, i) => (
                <m.li
                  key={skill.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: "easeOut" }}
                  className="group relative overflow-hidden rounded-2xl border border-white/5 bg-void/60 p-5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 md:p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="mb-2 font-display font-medium text-white transition-colors duration-300 group-hover:text-[var(--cat)]">
                        {skill.name}
                      </p>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                        <m.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{ duration: 0.9, delay: 0.2 + i * 0.05, ease: "easeOut" }}
                          className="animate-shimmer-bar relative h-full overflow-hidden rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${category.color}, ${category.color}80)`,
                            boxShadow: `0 0 15px ${category.color}60`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="font-mono text-lg font-bold" style={{ color: category.color }}>
                      {skill.level}%
                    </span>
                  </div>
                  <span
                    className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 ease-out group-hover:w-full"
                    style={{ background: `linear-gradient(90deg, ${category.color}, ${category.color}40)` }}
                  />
                </m.li>
              ))}
            </ul>
          </m.div>

          <div className="mt-10 flex items-center justify-center gap-3">
            {skillCategories.map((item, i) => (
              <button
                key={item.title.en}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={format(t.view, { title: item.title[locale] })}
                aria-current={i === activeIndex}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300",
                  i === activeIndex ? "w-6" : "w-2.5 bg-white/15 hover:bg-white/30"
                )}
                style={i === activeIndex ? { background: category.color, boxShadow: `0 0 15px ${category.color}60` } : undefined}
              />
            ))}
          </div>

          <div className="mt-14 text-center">
            <p className="mx-auto mb-4 max-w-2xl text-sm text-white/50">
              {t.footer}
            </p>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 font-semibold text-neon transition-all duration-200 hover:border-emerald-500/60 hover:bg-emerald-500/20 hover:shadow-[0_0_20px_rgba(0,255,106,0.3)]"
            >
              <ExternalLink size={15} />
              {t.githubProfile}
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
