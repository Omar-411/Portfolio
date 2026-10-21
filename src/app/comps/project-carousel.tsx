'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ExternalLink, Github, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from './aurora-bg';

// ---------------------------------------------------------------------------
// Types (mirrored from projects.tsx so this file is self-contained)
// ---------------------------------------------------------------------------

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  topics: string[];
}

export interface RepoWithOverrides extends GitHubRepo {
  _title?: string;
  _description?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GITHUB_USERNAME = 'Omar-411';

function formatName(name: string) {
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const LANG_COLORS: Record<string, { border: string; text: string }> = {
  TypeScript:  { border: 'border-blue-500/30',   text: 'text-blue-400'   },
  JavaScript:  { border: 'border-yellow-500/30', text: 'text-yellow-400' },
  Solidity:    { border: 'border-gray-500/30',   text: 'text-gray-300'   },
  HTML:        { border: 'border-orange-500/30', text: 'text-orange-400' },
  Java:        { border: 'border-red-500/30',    text: 'text-red-400'    },
  Python:      { border: 'border-blue-400/30',   text: 'text-blue-300'   },
  CSS:         { border: 'border-pink-500/30',   text: 'text-pink-400'   },
  Rust:        { border: 'border-orange-700/30', text: 'text-orange-500' },
};

// ---------------------------------------------------------------------------
// ProjectCarousel — client component
// ---------------------------------------------------------------------------

export default function ProjectCarousel({ repos }: { repos: RepoWithOverrides[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const CARD_WIDTH = 320;
  const GAP = 24;

  // Keep active index in sync with scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / (CARD_WIDTH + GAP));
      setActiveIndex(Math.max(0, Math.min(idx, repos.length - 1)));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [repos.length]);

  const scrollToIndex = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(idx, repos.length - 1));
    el.scrollTo({ left: clamped * (CARD_WIDTH + GAP), behavior: 'smooth' });
    setActiveIndex(clamped);
  };

  // ── Mouse drag ──────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeft(el.scrollLeft);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeft - (x - startX);
  };
  const onMouseUp = () => setIsDragging(false);

  // ── Touch drag ───────────────────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setStartX(e.touches[0].pageX - el.offsetLeft);
    setScrollLeft(el.scrollLeft);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeft - (x - startX);
  };

  return (
    <section
      id="projects"
      className="snap-section relative flex flex-col justify-center overflow-hidden"
    >
      {/* Aurora background */}
      <AuroraBackground className="absolute inset-0 z-0" />

      {/* Content */}
      <div className="relative z-10 container mx-auto max-w-7xl px-6 py-16 flex flex-col">
        {/* Header */}
        <div className="mb-10">
          <p className="font-mono text-xs text-[#00c87a] tracking-widest uppercase mb-2">
            {"/ / projects"}
          </p>
          <h2
            className="text-4xl md:text-5xl font-extrabold text-white"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            MY WORK
          </h2>
          <div className="w-16 h-[2px] bg-gradient-to-r from-emerald-400 to-transparent mt-3" />
        </div>

        {/* Carousel + arrow buttons */}
        <div className="relative flex items-center gap-4">
          {/* Left arrow */}
          <button
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Previous project"
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
              backdrop-blur-xl bg-[rgba(0,255,100,0.05)] border border-[rgba(0,255,100,0.15)]
              text-white/60 hover:text-[#00ff6a] hover:border-emerald-500/40
              disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Scrollable track */}
          <div
            ref={scrollRef}
            className="flex gap-6 pb-4 overflow-x-auto scrollbar-hide flex-1"
            style={{
              scrollSnapType: 'x mandatory',
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
          >
            {repos.map((repo, index) => {
              const lang = repo.language ? LANG_COLORS[repo.language] : null;
              return (
                <motion.div
                  key={repo.id}
                  className="glass-card flex-shrink-0 w-[320px] overflow-hidden group
                    cursor-grab active:cursor-grabbing rounded-2xl
                    border border-[rgba(0,255,100,0.12)]
                    bg-[rgba(0,255,100,0.03)] backdrop-blur-xl
                    hover:border-emerald-500/40 transition-colors duration-300"
                  style={{ scrollSnapAlign: 'start' }}
                  whileHover={{
                    y: -8,
                    boxShadow: '0 0 40px rgba(0,255,106,0.15)',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {/* GitHub social preview image */}
                  <div className="relative h-40 overflow-hidden rounded-t-2xl">
                    <Image
                      src={`https://opengraph.githubassets.com/1/${GITHUB_USERNAME}/${repo.name}`}
                      alt={`${repo.name} preview`}
                      fill
                      className="object-cover select-none"
                      sizes="320px"
                      priority={index === 0}
                      draggable={false}
                    />
                    {/* Gradient fade to card background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020b06]/80" />
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex flex-col gap-3">
                    {/* Title */}
                    <h3
                      className="font-bold text-lg text-white group-hover:text-[#00ff6a]
                        transition-colors duration-300 leading-snug"
                      style={{ fontFamily: 'var(--font-syne)' }}
                    >
                      {repo._title ?? formatName(repo.name)}
                    </h3>

                    {/* Description */}
                    <p className="text-white/50 text-sm line-clamp-2 leading-relaxed">
                      {repo._description ?? repo.description ?? 'No description provided.'}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {repo.language && lang && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] border bg-transparent
                            ${lang.border} ${lang.text}`}
                        >
                          {repo.language}
                        </span>
                      )}
                      {repo.language && !lang && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] border border-emerald-500/30 text-emerald-400 bg-transparent">
                          {repo.language}
                        </span>
                      )}
                      {repo.stargazers_count > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border border-yellow-500/30 text-yellow-400 bg-transparent">
                          <Star size={9} />
                          {repo.stargazers_count}
                        </span>
                      )}
                      {repo.topics?.slice(0, 2).map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-0.5 rounded-full text-[10px] border border-purple-500/30 text-purple-400 bg-transparent"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    {/* Links */}
                    <div className="flex justify-between items-center pt-1">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${repo.name} on GitHub`}
                        className="text-white/40 hover:text-[#00ff6a] transition-colors duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Github size={18} />
                      </a>
                      {repo.homepage && (
                        <a
                          href={repo.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Live demo of ${repo.name}`}
                          className="text-white/40 hover:text-[#00ff6a] transition-colors duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex === repos.length - 1}
            aria-label="Next project"
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
              backdrop-blur-xl bg-[rgba(0,255,100,0.05)] border border-[rgba(0,255,100,0.15)]
              text-white/60 hover:text-[#00ff6a] hover:border-emerald-500/40
              disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {repos.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to project ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-5 h-2 bg-[#00ff6a]'
                  : 'w-2 h-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* View all on GitHub */}
        <div className="mt-8 flex justify-center">
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium
              border border-[rgba(0,255,100,0.2)] text-[#00c87a]
              bg-[rgba(0,255,100,0.04)] backdrop-blur-xl
              hover:border-emerald-500/50 hover:bg-[rgba(0,255,100,0.08)] hover:text-[#00ff6a]
              transition-all duration-300"
          >
            <Github size={15} />
            View all on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
