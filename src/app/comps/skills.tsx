"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import AuroraBackground from "./aurora-bg";
import MatrixRain from "./matrix-rain";

const SKILL_CATEGORIES = [
  {
    title: "Frontend",
    color: "#00ff6a",
    colorSoft: "rgba(0, 255, 106, 0.15)",
    skills: [
      { name: "React / Next.js", level: 95 },
      { name: "TypeScript", level: 90 },
      { name: "Tailwind CSS", level: 90 },
      { name: "Framer Motion", level: 85 },
      { name: "HTML5 / CSS3", level: 95 },
    ],
  },
  {
    title: "Backend",
    color: "#00c87a",
    colorSoft: "rgba(0, 200, 122, 0.15)",
    skills: [
      { name: "Node.js / Express", level: 90 },
      { name: "MongoDB / PostgreSQL", level: 85 },
      { name: "REST APIs / GraphQL", level: 85 },
      { name: "Docker", level: 80 },
      { name: "WebSockets", level: 80 },
    ],
  },
  {
    title: "Blockchain",
    color: "#007a40",
    colorSoft: "rgba(0, 122, 64, 0.15)",
    skills: [
      { name: "Solidity", level: 85 },
      { name: "Web3.js / Ethers.js", level: 85 },
      { name: "Smart Contracts", level: 80 },
      { name: "DeFi Protocols", level: 75 },
      { name: "Hardhat / Foundry", level: 80 },
    ],
  },
  {
    title: "Tools & Others",
    color: "#00ff6a",
    colorSoft: "rgba(0, 255, 106, 0.15)",
    skills: [
      { name: "Git / GitHub", level: 95 },
      { name: "CI/CD (GitHub Actions)", level: 80 },
      { name: "Testing (Jest, Vitest)", level: 75 },
      { name: "Linux / Bash", level: 80 },
      { name: "Figma / Design Systems", level: 70 },
    ],
  },
];

const ICONS = ["⚛️", "🔧", "⛓️", "🛠️"];

export default function Skills() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const activeCategory = SKILL_CATEGORIES[activeIndex];

  const nextCategory = () => {
    setActiveIndex((prev) => (prev + 1) % SKILL_CATEGORIES.length);
  };

  const prevCategory = () => {
    setActiveIndex((prev) => (prev - 1 + SKILL_CATEGORIES.length) % SKILL_CATEGORIES.length);
  };

  const cardBg = "radial-gradient(ellipse at center, " + activeCategory.colorSoft + " 0%, rgba(2,11,6,0.8) 70%)";
  const cardBorder = activeCategory.color + "40";
  const cardShadow = "0 0 60px " + activeCategory.color + "20, inset 0 1px 0 " + activeCategory.color + "20";
  const iconBg = "linear-gradient(135deg, " + activeCategory.color + ", " + activeCategory.color + "80)";
  const iconShadow = "0 0 30px " + activeCategory.color + "40";
  const barBg = "linear-gradient(90deg, " + activeCategory.color + ", " + activeCategory.color + "80)";
  const barShadow = "0 0 15px " + activeCategory.color + "60";
  const underlineBg = "linear-gradient(90deg, " + activeCategory.color + ", " + activeCategory.color + "40)";

  const dotStyle = (i: number) => {
    const isActive = i === activeIndex;
    return {
      background: isActive ? activeCategory.color : "rgba(255,255,255,0.15)",
      width: isActive ? "24px" : "10px",
      boxShadow: isActive ? "0 0 15px " + activeCategory.color + "60" : "none",
    };
  };

  return (
    <section
      id="skills"
      className="snap-section relative flex items-center justify-center overflow-hidden"
    >
      <AuroraBackground className="absolute inset-0 z-0" />
      <MatrixRain opacity={0.025} className="absolute inset-0 z-[1]" />

      <div className="relative z-10 container mx-auto max-w-7xl px-6 py-16">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="font-mono text-xs text-[#00c87a] tracking-widest uppercase mb-3">
            {"/ / tech stack"}
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "var(--font-syne)" }}>
            MY TECH STACK
          </h2>
          <div className="w-24 h-[2px] bg-gradient-to-r from-emerald-400 to-transparent mx-auto" />
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <div className="relative" style={{ perspective: "1000px" }}>
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 40, rotateX: 15 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              key={activeIndex}
            >
              <div
                className="relative rounded-3xl p-8 md:p-12"
                style={{
                  background: cardBg,
                  border: "1px solid " + cardBorder,
                  boxShadow: cardShadow,
                }}
              >
                <div className="flex items-center justify-between mb-10">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex items-center gap-4"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: iconBg,
                        boxShadow: iconShadow,
                      }}
                    >
                      <span className="text-2xl" aria-hidden="true">
                        {ICONS[activeIndex]}
                      </span>
                    </div>
                    <div>
                      <p className="font-mono text-xs text-[#00c87a] tracking-widest uppercase">
                        {activeCategory.title.toUpperCase()}
                      </p>
                      <h3 className="text-2xl md:text-3xl font-extrabold text-white" style={{ fontFamily: "var(--font-syne)" }}>
                        {activeCategory.title}
                      </h3>
                    </div>
                  </motion.div>

                  <div className="hidden md:flex items-center gap-2">
                    <button
                      onClick={prevCategory}
                      disabled={activeIndex === 0}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/60 hover:text-[#00ff6a] hover:border-emerald-500/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
                      aria-label="Previous category"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={nextCategory}
                      disabled={activeIndex === SKILL_CATEGORIES.length - 1}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/60 hover:text-[#00ff6a] hover:border-emerald-500/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
                      aria-label="Next category"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {activeCategory.skills.map((skill, i) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="group relative overflow-hidden rounded-2xl p-5 md:p-6 cursor-default"
                      style={{
                        background: "rgba(2, 11, 6, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        backdropFilter: "blur(20px)",
                      }}
                      onMouseEnter={() => setHoveredSkill(skill.name)}
                      onMouseLeave={() => setHoveredSkill(null)}
                    >
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: "linear-gradient(135deg, " + activeCategory.color + "15 0%, transparent 60%)",
                        }}
                      />

                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex-1 pr-4">
                          <motion.p
                            className="font-medium text-white mb-2 transition-colors duration-300"
                            style={{
                              fontFamily: "var(--font-syne)",
                              color: hoveredSkill === skill.name ? activeCategory.color : "white",
                            }}
                          >
                            {skill.name}
                          </motion.p>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: skill.level + "%" }}
                              viewport={{ once: true, margin: "-50px" }}
                              transition={{ duration: 1.2, delay: 0.4 + i * 0.06, ease: "easeOut" }}
                              className="h-full rounded-full relative"
                              style={{
                                background: barBg,
                                boxShadow: barShadow,
                              }}
                            >
                              <div
                                className="absolute inset-0"
                                style={{
                                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                                  animation: "shimmer 2s infinite",
                                }}
                              />
                            </motion.div>
                          </div>
                        </div>
                        <motion.span
                          className="font-mono text-lg font-bold"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.06, duration: 0.5 }}
                          style={{ color: activeCategory.color }}
                        >
                          {skill.level}%
                        </motion.span>
                      </div>

                      <motion.div
                        className="absolute bottom-0 left-0 h-[2px] rounded-b-2xl"
                        initial={{ width: 0 }}
                        animate={{ width: hoveredSkill === skill.name ? "100%" : "0%" }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        style={{ background: underlineBg }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="flex items-center justify-center gap-3 mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {SKILL_CATEGORIES.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveIndex(i)}
                className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                style={dotStyle(i)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                aria-label={"View " + SKILL_CATEGORIES[i].title + " skills"}
              />
            ))}
          </motion.div>

          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          >
            <p className="text-white/50 text-sm mb-4 max-w-2xl mx-auto">
              Always learning. Currently exploring Rust, Zero-Knowledge Proofs, and AI agents.
            </p>
            <a
              href="https://github.com/Omar-411"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-emerald-500/10 border border-emerald-500/30 text-[#00ff6a] hover:bg-emerald-500/20 hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(0,255,106,0.3)] transition-all duration-200"
            >
              <ExternalLink size={15} />
              View GitHub Profile
              <ArrowRight size={15} />
            </a>
          </motion.div>
        </div>

        <style jsx global>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    </section>
  );
}