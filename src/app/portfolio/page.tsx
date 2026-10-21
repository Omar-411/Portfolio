import type { Metadata } from "next";
import AuroraBackground from "@/components/effects/aurora-background";
import MatrixRain from "@/components/effects/matrix-rain";
import ScrollProgress from "@/components/effects/scroll-progress";
import MotionProvider from "@/components/motion-provider";
import UiSounds from "@/components/ui-sounds";
import Contact from "@/features/portfolio/contact/contact";
import Hero from "@/features/portfolio/hero/hero";
import Navbar from "@/features/portfolio/navbar";
import Projects from "@/features/portfolio/projects/projects";
import Skills from "@/features/portfolio/skills/skills";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Full-Stack & Blockchain Developer — Projects, Skills, Contact",
};

export default function PortfolioPage() {
  return (
    <MotionProvider>
      <AuroraBackground />
      <MatrixRain />
      <UiSounds />
      <ScrollProgress />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Projects />
        <Skills />
        <Contact />
      </main>
    </MotionProvider>
  );
}
