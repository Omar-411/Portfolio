import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AuroraBackground from "@/components/effects/aurora-background";
import MatrixRain from "@/components/effects/matrix-rain";
import ScrollProgress from "@/components/effects/scroll-progress";
import { profile } from "@/content/profile";
import { web3Proof } from "@/content/web3";
import Experience from "@/features/portfolio/experience/experience";
import Footer from "@/features/portfolio/footer/footer";
import Hero from "@/features/portfolio/hero/hero";
import Navbar from "@/features/portfolio/navbar";
import Projects from "@/features/portfolio/projects/projects";
import Services from "@/features/portfolio/services/services";
import Skills from "@/features/portfolio/skills/skills";
import Reviews from "@/features/reviews/reviews";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageAlternates, portfolioJsonLd } from "@/lib/seo";
import { fetchRecentActivity } from "@/lib/github";
import { isReviewsConfigured, listApprovedReviews } from "@/lib/reviews-store";
import { bookingUrl, siteUrl } from "@/lib/site";

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { meta } = getDictionary(lang);
  return {
    title: { absolute: meta.portfolioTitle },
    description: meta.portfolioDescription,
    alternates: pageAlternates(lang, "/portfolio"),
    openGraph: { title: meta.portfolioTitle, description: meta.portfolioDescription, url: `/${lang}/portfolio` },
  };
}

export default async function PortfolioPage({ params }: PageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dictionary = getDictionary(lang);
  const [activity, reviews] = await Promise.all([fetchRecentActivity(profile.githubUser), listApprovedReviews()]);

  const jsonLd = portfolioJsonLd({ siteUrl, jobTitle: dictionary.hero.headline, description: dictionary.meta.portfolioDescription });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AuroraBackground />
      <MatrixRain />
      <ScrollProgress />
      <Navbar locale={lang} t={dictionary.nav} showReviews={isReviewsConfigured} />
      <main data-scroll-container className="snap-container relative z-10">
        <Hero t={dictionary.hero} />
        <Experience t={dictionary.experience} />
        <Projects locale={lang} t={dictionary.projects} />
        <Skills locale={lang} t={dictionary.skills} />
        <Services locale={lang} t={dictionary.services} bookingUrl={bookingUrl} proof={web3Proof} activity={activity} />
        {isReviewsConfigured && <Reviews t={dictionary.reviews} reviews={reviews} />}
        <Footer locale={lang} t={dictionary.footer} nav={dictionary.nav} onPortfolio showReviews={isReviewsConfigured} />
      </main>
    </>
  );
}
