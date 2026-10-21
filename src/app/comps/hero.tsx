"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, type Variants } from "framer-motion"
import { Download, ArrowRight, Github, Linkedin, Menu, X } from "lucide-react"
import LoadingScreen from "./loading-screen"
import MatrixRain from "./matrix-rain"
import AuroraBackground from "./aurora-bg"

// ─── Framer-Motion variants ───────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "About",    href: "/portfolio#hero",     id: "hero",     index: 0 },
  { label: "Projects", href: "/portfolio#projects", id: "projects", index: 1 },
  { label: "Skills",   href: "/portfolio#skills",   id: "skills",   index: 2 },
  { label: "Contact",  href: "/portfolio#contact",  id: "contact",  index: 3 },
]

const Navbar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const isPortfolio = pathname === "/portfolio"
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")

  const navigateToSection = (href: string) => {
    if (isPortfolio) {
      const hash = href.split("#")[1];
      const el = document.getElementById(hash);
      const main = document.querySelector('main') as HTMLElement | null;
      if (el && main) main.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
      else router.push(href);
    } else {
      router.push(href);
    }
    setIsMenuOpen(false);
  }

  useEffect(() => {
    if (!isPortfolio) return;
    const main = document.querySelector('main') as HTMLElement | null;
    if (!main) return;

    const handleScroll = () => {
      const idx = Math.round(main.scrollTop / main.clientHeight);
      const clamped = Math.max(0, Math.min(idx, NAV_ITEMS.length - 1));
      const item = NAV_ITEMS[clamped];
      if (item) setActiveSection(item.id);
    };

    main.addEventListener("scroll", handleScroll, { passive: true });
    return () => main.removeEventListener("scroll", handleScroll);
  }, [isPortfolio])

  useEffect(() => {
    if (!isPortfolio) return;
    const hash = window.location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      const main = document.querySelector('main') as HTMLElement | null;
      if (el && main) {
        setTimeout(() => main.scrollTo({ top: el.offsetTop, behavior: 'smooth' }), 100);
      }
    }
  }, [isPortfolio])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <button
          onClick={() => navigateToSection("/portfolio#hero")}
          className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg
            flex items-center justify-center text-white font-bold text-sm
            hover:shadow-[0_0_16px_rgba(0,255,106,0.5)] transition-shadow duration-300"
          style={{ fontFamily: "var(--font-syne)" }}
          aria-label="Go to portfolio"
        >
          OA
        </button>

        {/* Desktop pill nav */}
        <div className="hidden md:flex items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-2 py-1 gap-1">
          {NAV_ITEMS.map(({ label, id, href }) => (
            <button
              key={id}
              onClick={() => navigateToSection(href)}
              className={`px-4 py-1.5 text-sm rounded-full transition-all duration-200
                ${activeSection === id
                  ? "text-[#00ff6a] bg-white/10"
                  : "text-white/60 hover:text-[#00ff6a] hover:bg-white/5"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Omar-411"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-[#00ff6a] transition-colors duration-200"
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile full-screen overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-[#020b06]/95 backdrop-blur-md z-40 flex flex-col items-center justify-center gap-8"
          onClick={() => setIsMenuOpen(false)}
        >
          {NAV_ITEMS.map(({ label, id, href }) => (
            <button
              key={id}
              onClick={(e) => { e.stopPropagation(); navigateToSection(href); }}
              className="text-3xl font-bold text-white/70 hover:text-[#00ff6a] transition-colors duration-200"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}


// ─── SkillPills ───────────────────────────────────────────────────────────────
const SKILLS = [
  "TypeScript", "React", "Node.js", "MongoDB", "Express",
  "Solidity", "Web3", "Docker", "WebSocket", "Next.js", "Tailwind", "Git",
]

const SkillPills = () => (
  <div className="flex flex-wrap gap-2">
    {SKILLS.map((skill) => (
      <span
        key={skill}
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-default
          transition-all duration-200 hover:scale-105"
        style={{
          background: "rgba(0,255,100,0.06)",
          border: "1px solid rgba(0,255,100,0.2)",
          color: "#00c87a",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.background = "rgba(0,255,100,0.12)"
          el.style.border = "1px solid rgba(0,255,100,0.4)"
          el.style.boxShadow = "0 0 12px rgba(0,255,106,0.25)"
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.background = "rgba(0,255,100,0.06)"
          el.style.border = "1px solid rgba(0,255,100,0.2)"
          el.style.boxShadow = "none"
        }}
      >
        {skill}
      </span>
    ))}
  </div>
)

// ─── HeroCodeCard ─────────────────────────────────────────────────────────────
const CODE_LINES: { lineNum: number; jsx: React.ReactNode }[] = [
  {
    lineNum: 1,
    jsx: (
      <>
        <span className="text-[#ff79c6]">const</span>{" "}
        <span className="text-[#bd93f9]">coder</span>{" "}
        <span className="text-[#ff79c6]">=</span>{" "}
        <span className="text-white/40">{"{"}</span>
      </>
    ),
  },
  {
    lineNum: 2,
    jsx: (
      <span className="pl-5 inline-block">
        <span className="text-[#f8f8f2]">name: </span>
        <span className="text-white/40">&apos;</span>
        <span className="text-[#00ff6a]">Omar Ajimi</span>
        <span className="text-white/40">&apos;,</span>
      </span>
    ),
  },
  {
    lineNum: 3,
    jsx: (
      <span className="pl-5 inline-block">
        <span className="text-[#f8f8f2]">role: </span>
        <span className="text-white/40">&apos;</span>
        <span className="text-[#00ff6a]">Full-Stack Developer</span>
        <span className="text-white/40">&apos;,</span>
      </span>
    ),
  },
  {
    lineNum: 4,
    jsx: (
      <span className="pl-5 inline-block">
        <span className="text-[#f8f8f2]">seniority: </span>
        <span className="text-white/40">&apos;</span>
        <span className="text-[#00ff6a]">Mid-Level</span>
        <span className="text-white/40">&apos;,</span>
      </span>
    ),
  },
  {
    lineNum: 5,
    jsx: (
      <span className="pl-5 inline-block">
        <span className="text-[#f8f8f2]">location: </span>
        <span className="text-white/40">&apos;</span>
        <span className="text-[#00ff6a]">Tunisia</span>
        <span className="text-white/40">&apos;,</span>
      </span>
    ),
  },
  {
    lineNum: 6,
    jsx: (
      <span className="pl-5 inline-block">
        <span className="text-[#f8f8f2]">skills: </span>
        <span className="text-white/40">{"["}</span>
      </span>
    ),
  },
  {
    lineNum: 7,
    jsx: (
      <span className="pl-10 inline-block">
        <span className="text-white/40">&apos;</span>
        <span className="text-[#00ff6a]">React</span>
        <span className="text-white/40">&apos;, &apos;</span>
        <span className="text-[#00ff6a]">Node.js</span>
        <span className="text-white/40">&apos;, &apos;</span>
        <span className="text-[#00ff6a]">Solidity</span>
        <span className="text-white/40">&apos;,</span>
      </span>
    ),
  },
  {
    lineNum: 8,
    jsx: (
      <span className="pl-10 inline-block">
        <span className="text-white/40">&apos;</span>
        <span className="text-[#00ff6a]">Web3</span>
        <span className="text-white/40">&apos;, &apos;</span>
        <span className="text-[#00ff6a]">TypeScript</span>
        <span className="text-white/40">&apos;, &apos;</span>
        <span className="text-[#00ff6a]">Docker</span>
        <span className="text-white/40">&apos;</span>
      </span>
    ),
  },
  {
    lineNum: 9,
    jsx: (
      <span className="pl-5 inline-block">
        <span className="text-white/40">{"],"}</span>
      </span>
    ),
  },
  {
    lineNum: 10,
    jsx: (
      <span className="pl-5 inline-block">
        <span className="text-[#f8f8f2]">passion: </span>
        <span className="text-white/40">&apos;</span>
        <span className="text-[#00ff6a]">Blockchain & DeFi</span>
        <span className="text-white/40">&apos;,</span>
      </span>
    ),
  },
  {
    lineNum: 11,
    jsx: <span className="text-white/40">{"}"}</span>,
  },
  {
    lineNum: 12,
    jsx: <span className="text-white/40">{";"}</span>,
  },
]

const HeroCodeCard = () => (
  <div
    className="relative glass-card overflow-hidden group transition-all duration-300
      hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(0,255,106,0.12)]"
    style={{ background: "rgba(2,11,6,0.7)" }}
  >
    {/* Matrix rain inside card */}
    <div className="absolute inset-0 overflow-hidden rounded-[16px]">
      <MatrixRain opacity={0.03} />
    </div>

    {/* Window chrome */}
    <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.06]">
      {/* Traffic lights */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f56" }} />
        <div className="w-3 h-3 rounded-full" style={{ background: "#ffbd2e" }} />
        <div className="w-3 h-3 rounded-full" style={{ background: "#27c93f" }} />
      </div>

      {/* File tabs */}
      <div className="flex items-center gap-1 text-xs font-mono">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-t bg-white/[0.06] border border-white/10 border-b-0 text-white/70">
          <span className="w-2 h-2 rounded-sm bg-[#3178c6] inline-block" />
          coder.ts
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 text-white/25">
          portfolio.ts
        </div>
      </div>

      {/* Filename label */}
      <span className="text-white/30 text-xs font-mono">coder.ts</span>
    </div>

    {/* Code content */}
    <div className="relative z-10 flex px-4 py-4 font-mono text-sm">
      {/* Line numbers */}
      <div className="flex flex-col items-end pr-4 text-white/20 select-none text-xs leading-relaxed shrink-0">
        {CODE_LINES.map(({ lineNum }) => (
          <span key={lineNum} className="leading-[1.7]">{lineNum}</span>
        ))}
        <span className="leading-[1.7]">13</span>
      </div>

      {/* Code */}
      <code className="flex flex-col text-xs sm:text-sm leading-[1.7] overflow-x-auto">
        {CODE_LINES.map(({ lineNum, jsx }) => (
          <div key={lineNum}>{jsx}</div>
        ))}
        {/* Blinking cursor */}
        <div>
          <span className="text-[#00ff6a] animate-blink-cursor">▋</span>
        </div>
      </code>
    </div>

    {/* Status bar */}
    <div className="relative z-10 flex justify-between items-center px-4 py-1 bg-white/[0.025] border-t border-white/[0.06] text-white/20 text-[10px] font-mono">
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-sm bg-[#3178c6] inline-block" />
        TypeScript
      </span>
      <span>UTF-8</span>
      <span>Ln 12, Col 3</span>
    </div>
  </div>
)

// ─── AvatarRing ───────────────────────────────────────────────────────────────
const AvatarRing = () => (
  <div className="relative w-20 h-20 mx-auto mb-4">
    {/* Rotating gradient ring */}
    <div
      className="absolute inset-0 rounded-full animate-spin-slow"
      style={{
        background: "conic-gradient(from 0deg, #00ff6a, #00c87a, #007a40, #00ff6a)",
        padding: "2px",
        borderRadius: "50%",
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{ background: "#020b06" }}
      />
    </div>
    {/* Avatar */}
    <div className="absolute inset-[3px] rounded-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/avatar.png"
        alt="Omar Ajimi"
        className="w-full h-full object-cover"
      />
    </div>
  </div>
)

// ─── Portfolio (default export) ───────────────────────────────────────────────
const Portfolio = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [showContent, setShowContent] = useState(false)

  const handleLoadingComplete = () => {
    setIsLoading(false)
    setTimeout(() => setShowContent(true), 100)
  }

  return (
    <div className="w-full relative">
      {/* Loading screen */}
      {isLoading && (
        <LoadingScreen onLoadingComplete={handleLoadingComplete} />
      )}

      {/* Main content */}
      <div className="transition-opacity duration-700" style={{ opacity: showContent ? 1 : 0 }}>
        <Navbar />

        {/* Hero snap section */}
        <section id="hero" className="snap-section relative">
          {/* Aurora background */}
          <AuroraBackground section="hero" className="absolute inset-0 z-0" />

          {/* Content grid */}
          <div className="relative z-10 container mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-screen pt-20">
            {/* ── LEFT COLUMN ── */}
            <motion.div
              className="order-2 lg:order-1 flex flex-col gap-5"
              variants={containerVariants}
              initial="hidden"
              animate={showContent ? "visible" : "hidden"}
            >
              {/* Available badge */}
              <motion.div variants={itemVariants}>
                <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 text-xs text-[#00ff6a]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff6a] animate-pulse" />
                  Available for work
                </span>
              </motion.div>

              {/* Name */}
              <motion.h1
                variants={itemVariants}
                className="font-extrabold text-5xl sm:text-6xl xl:text-7xl text-white leading-none tracking-tight"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                <span className="block">OMAR</span>
                <span className="block text-aurora">AJIMI</span>
              </motion.h1>

              {/* Role line */}
              <motion.p
                variants={itemVariants}
                className="font-mono text-sm text-[#00c87a] tracking-widest uppercase"
              >
                Full-Stack Developer · Blockchain · Web3
              </motion.p>

              {/* Bio */}
              <motion.p
                variants={itemVariants}
                className="text-white/50 text-base max-w-sm"
              >
                JavaScript lover. Blockchain enthusiast. Crafting the decentralized future.
              </motion.p>

              {/* Skills */}
              <motion.div variants={itemVariants}>
                <SkillPills />
              </motion.div>

              {/* CTA buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-4 mt-2"
              >
                {/* Primary — Resume */}
                <a
                  href="/Omar_Ajimi_Resume.pdf"
                  download
                  className="relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                    bg-emerald-500/10 border border-emerald-500/30 text-[#00ff6a]
                    hover:bg-emerald-500/20 hover:border-emerald-500/60
                    hover:shadow-[0_0_20px_rgba(0,255,106,0.3)]
                    transition-all duration-200"
                >
                  <Download size={15} />
                  Get Resume
                </a>

                {/* Secondary — Projects */}
                <button
                  onClick={() => {
                    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
                    if (pathname === "/portfolio") {
                      const main = document.querySelector('main') as HTMLElement | null;
                      const el = document.getElementById("projects");
                      if (el && main) main.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
                    } else {
                      window.location.href = "/portfolio#projects";
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-white/60
                    border border-white/10 hover:border-white/30 hover:text-white
                    transition-all duration-200"
                >
                  View Projects
                  <ArrowRight size={15} />
                </button>
              </motion.div>

              {/* Social links */}
              <motion.div variants={itemVariants} className="flex items-center gap-4">
                <a
                  href="https://github.com/Omar-411"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/30 hover:text-[#00ff6a] transition-colors duration-200"
                  aria-label="GitHub"
                >
                  <Github size={20} />
                </a>
                <a
                  href="https://www.linkedin.com/in/omar-ajimi-7a5341118"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/30 hover:text-[#00ff6a] transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
              </motion.div>
            </motion.div>

            {/* ── RIGHT COLUMN ── */}
            <motion.div
              className="order-1 lg:order-2 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <AvatarRing />
              <HeroCodeCard />
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Portfolio