import Portfolio from '../comps/hero';
import Projects from '../comps/projects';
import Skills from '../comps/skills';
import Contact from '../comps/contact';

export const metadata = {
  title: "Omar Ajimi | Portfolio",
  description: "Full-Stack & Blockchain Developer — Projects, Skills, Contact",
};

export default function PortfolioPage() {
  return (
    <main className="bg-[#020b06]">
      <Portfolio />
      <Projects />
      <Skills />
      <Contact />
    </main>
  );
}