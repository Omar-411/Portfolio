import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AuroraBackground from "@/components/effects/aurora-background";
import MatrixRain from "@/components/effects/matrix-rain";
import ScrollProgress from "@/components/effects/scroll-progress";
import { profile } from "@/content/profile";
import { web3Proof } from "@/content/web3";
import Experience from "@/features/portfolio/experience/experience";
import Hero from "@/features/portfolio/hero/hero";
import Navbar from "@/features/portfolio/navbar";
import Projects from "@/features/portfolio/projects/projects";
import Services from "@/features/portfolio/services/services";
import Skills from "@/features/portfolio/skills/skills";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { fetchRecentActivity } from "@/lib/github";
import { bookingUrl, siteUrl } from "@/lib/site";

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).meta.portfolioTitle };
}

export default async function PortfolioPage({ params }: PageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dictionary = getDictionary(lang);
  const activity = await fetchRecentActivity(profile.githubUser);

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: dictionary.hero.headline,
    email: profile.email,
    url: siteUrl,
    sameAs: [profile.github, profile.linkedin],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      <AuroraBackground />
      <MatrixRain />
      <ScrollProgress />
      <Navbar locale={lang} t={dictionary.nav} />
      <main data-scroll-container className="snap-container relative z-10">
        <Hero t={dictionary.hero} />
        <Experience t={dictionary.experience} />
        <Projects locale={lang} t={dictionary.projects} />
        <Skills locale={lang} t={dictionary.skills} />
        <Services locale={lang} t={dictionary.services} bookingUrl={bookingUrl} proof={web3Proof} activity={activity} />
      </main>
    </>
  );
}
