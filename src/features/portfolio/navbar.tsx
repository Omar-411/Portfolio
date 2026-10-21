"use client";

import { useEffect, useState } from "react";
import { Github, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { profile } from "@/content/profile";

const NAV_ITEMS = [
  { label: "About", id: "hero" },
  { label: "Projects", id: "projects" },
  { label: "Skills", id: "skills" },
  { label: "Contact", id: "contact" },
] as const;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>(NAV_ITEMS[0].id);

  // A section is "active" while it crosses the middle line of the scroll container.
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { root: main, rootMargin: "-50% 0px -50% 0px" }
    );

    for (const { id } of NAV_ITEMS) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed inset-x-0 top-0 z-50" aria-label="Main">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a
          href="#hero"
          aria-label="Back to top"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 font-display text-sm font-bold text-white transition-shadow duration-300 hover:shadow-[0_0_16px_rgba(0,255,106,0.5)]"
        >
          OA
        </a>

        <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 backdrop-blur-md md:flex">
          {NAV_ITEMS.map(({ label, id }) => (
            <a
              key={id}
              href={`#${id}`}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm transition-colors duration-200",
                activeId === id
                  ? "bg-white/10 text-neon"
                  : "text-white/60 hover:bg-white/5 hover:text-neon"
              )}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-white/40 transition-colors duration-200 hover:text-neon"
          >
            <Github size={18} />
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="rounded-lg p-1.5 text-white/40 transition-colors duration-200 hover:bg-white/10 hover:text-white md:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 -z-10 flex flex-col items-center justify-center gap-8 bg-void/95 backdrop-blur-md">
          {NAV_ITEMS.map(({ label, id }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setMenuOpen(false)}
              className="font-display text-3xl font-bold text-white/70 transition-colors duration-200 hover:text-neon"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
