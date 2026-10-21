"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Github, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { profile } from "@/content/profile";
import { format, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { ProjectCard } from "./types";

const LANGUAGE_STYLES: Record<string, string> = {
  TypeScript: "border-blue-500/30 text-blue-400",
  JavaScript: "border-yellow-500/30 text-yellow-400",
  Solidity: "border-gray-500/30 text-gray-300",
  HTML: "border-orange-500/30 text-orange-400",
  Java: "border-red-500/30 text-red-400",
  Python: "border-blue-400/30 text-blue-300",
  CSS: "border-pink-500/30 text-pink-400",
  Rust: "border-orange-700/30 text-orange-500",
};

const FALLBACK_LANGUAGE_STYLE = "border-emerald-500/30 text-emerald-400";

const arrowClass =
  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-neon/15 bg-neon/5 text-white/60 backdrop-blur-xl transition-all duration-200 hover:border-emerald-500/40 hover:text-neon disabled:cursor-not-allowed disabled:opacity-20";

interface ProjectCarouselProps {
  projects: ProjectCard[];
  locale: Locale;
  t: Dictionary["projects"];
}

export default function ProjectCarousel({ projects, locale, t }: ProjectCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Native scroll-snap does the scrolling; we only mirror its position into the dots.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => {
      const cards = Array.from(track.children) as HTMLElement[];
      const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth;
      const index = Math.round(track.scrollLeft / step);
      setActiveIndex(Math.max(0, Math.min(index, cards.length - 1)));
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(index, projects.length - 1));
    const card = trackRef.current?.children[clamped] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <section id="projects" className="snap-section flex flex-col justify-center">
      <div className="container relative z-10 mx-auto flex max-w-7xl flex-col px-6 py-16">
        <div className="mb-10">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neon-soft">{t.eyebrow}</p>
          <h2 className="font-display text-4xl font-extrabold text-white md:text-5xl">{t.title}</h2>
          <div className="mt-3 h-[2px] w-16 bg-gradient-to-r from-emerald-400 to-transparent" />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label={t.previous}
            className={cn(arrowClass, "hidden sm:flex")}
          >
            <ChevronLeft size={18} />
          </button>

          <ul
            ref={trackRef}
            aria-label={t.listLabel}
            className="scrollbar-hide flex flex-1 snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
          >
            {projects.map((project) => (
              <li
                key={project.repo}
                data-sound
                className="group glass-card w-[300px] flex-shrink-0 snap-start overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500/40 hover:shadow-[0_0_40px_rgba(0,255,106,0.15)] sm:w-[320px]"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={`https://opengraph.githubassets.com/1/${profile.githubUser}/${project.repo}`}
                    alt={`${project.title} preview`}
                    fill
                    sizes="320px"
                    className="select-none object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-void/80" />
                </div>

                <div className="flex flex-col gap-3 p-5">
                  <h3 className="font-display text-lg font-bold leading-snug text-white transition-colors duration-300 group-hover:text-neon">
                    {project.title}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-white/50">{project.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {project.language && (
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px]",
                          LANGUAGE_STYLES[project.language] ?? FALLBACK_LANGUAGE_STYLE
                        )}
                      >
                        {project.language}
                      </span>
                    )}
                    {project.stars > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/30 px-2 py-0.5 text-[10px] text-yellow-400">
                        <Star size={9} />
                        {project.stars}
                      </span>
                    )}
                    {project.topics.slice(0, 2).map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full border border-purple-500/30 px-2 py-0.5 text-[10px] text-purple-400"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={format(t.viewOnGithub, { title: project.title })}
                      className="text-white/40 transition-colors duration-200 hover:text-neon"
                    >
                      <Github size={18} />
                    </a>
                    {project.caseStudySlug && (
                      <Link
                        href={`/${locale}/projects/${project.caseStudySlug}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-neon-soft transition-colors hover:text-neon"
                      >
                        {t.caseStudy}
                        <ArrowRight size={12} aria-hidden="true" />
                      </Link>
                    )}
                    {project.homepage && (
                      <a
                        href={project.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={format(t.liveDemo, { title: project.title })}
                        className="text-white/40 transition-colors duration-200 hover:text-neon"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex === projects.length - 1}
            aria-label={t.next}
            className={cn(arrowClass, "hidden sm:flex")}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {projects.map((project, i) => (
            <button
              key={project.repo}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={format(t.goTo, { title: project.title })}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === activeIndex ? "w-5 bg-neon" : "w-2 bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-neon/20 bg-neon/[0.04] px-6 py-2.5 text-sm font-medium text-neon-soft backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/50 hover:bg-neon/[0.08] hover:text-neon"
          >
            <Github size={15} />
            {t.viewAll}
          </a>
        </div>
      </div>
    </section>
  );
}
