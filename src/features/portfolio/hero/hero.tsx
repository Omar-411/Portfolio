"use client";

import Image from "next/image";
import { m, type Variants } from "framer-motion";
import { ArrowRight, Download, Github, Linkedin } from "lucide-react";
import { profile } from "@/content/profile";
import { heroSkills } from "@/content/skills";
import HeroCodeCard from "./hero-code-card";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function AvatarRing() {
  return (
    <div className="relative mx-auto mb-4 h-20 w-20">
      <div
        className="animate-spin-slow absolute inset-0 rounded-full"
        style={{ background: "conic-gradient(from 0deg, #00ff6a, #00c87a, #007a40, #00ff6a)" }}
      />
      <div className="absolute inset-[3px] overflow-hidden rounded-full bg-void">
        <Image src="/avatar.png" alt={profile.name} fill sizes="80px" priority className="object-cover" />
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section id="hero" className="snap-section flex items-center">
      <div className="container relative z-10 mx-auto grid min-h-dvh max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-12 pt-24 lg:grid-cols-2">
        <m.div
          className="order-2 flex flex-col gap-5 lg:order-1"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <m.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-neon">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
              {profile.availability}
            </span>
          </m.div>

          <m.h1
            variants={item}
            className="font-display text-5xl font-extrabold leading-none tracking-tight text-white sm:text-6xl xl:text-7xl"
          >
            <span className="block">{profile.firstName}</span>
            <span className="text-aurora block">{profile.lastName}</span>
          </m.h1>

          <m.p variants={item} className="font-mono text-sm uppercase tracking-widest text-neon-soft">
            {profile.headline}
          </m.p>

          <m.p variants={item} className="max-w-sm text-base text-white/50">
            {profile.bio}
          </m.p>

          <m.ul variants={item} className="flex flex-wrap gap-2" aria-label="Main technologies">
            {heroSkills.map((skill) => (
              <li
                key={skill}
                className="inline-flex cursor-default items-center rounded-full border border-neon/20 bg-neon/[0.06] px-3 py-1 text-xs font-medium text-neon-soft transition-all duration-200 hover:scale-105 hover:border-neon/40 hover:bg-neon/[0.12] hover:shadow-[0_0_12px_rgba(0,255,106,0.25)]"
              >
                {skill}
              </li>
            ))}
          </m.ul>

          <m.div variants={item} className="mt-2 flex flex-wrap gap-4">
            <a
              href={profile.resume}
              download
              className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 font-semibold text-neon transition-all duration-200 hover:border-emerald-500/60 hover:bg-emerald-500/20 hover:shadow-[0_0_20px_rgba(0,255,106,0.3)]"
            >
              <Download size={15} />
              Get Resume
            </a>
            <a
              href="#projects"
              className="flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-white/60 transition-all duration-200 hover:border-white/30 hover:text-white"
            >
              View Projects
              <ArrowRight size={15} />
            </a>
          </m.div>

          <m.div variants={item} className="flex items-center gap-4">
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-white/30 transition-colors duration-200 hover:text-neon"
            >
              <Github size={20} />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-white/30 transition-colors duration-200 hover:text-neon"
            >
              <Linkedin size={20} />
            </a>
          </m.div>
        </m.div>

        <m.div
          className="order-1 flex flex-col lg:order-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <AvatarRing />
          <HeroCodeCard />
        </m.div>
      </div>
    </section>
  );
}
