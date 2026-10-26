import AuroraBackground from "@/components/effects/aurora-background";
import MatrixRain from "@/components/effects/matrix-rain";
import ScrollProgress from "@/components/effects/scroll-progress";
import Footer from "@/features/portfolio/footer/footer";
import Navbar from "@/features/portfolio/navbar";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { isReviewsConfigured } from "@/lib/reviews-store";

/** Shared frame for the content pages (case studies, lab): background, nav, and a readable column. */
interface SiteChromeProps {
  locale: Locale;
  wide?: boolean;
  children: React.ReactNode;
}

export default function SiteChrome({ locale, wide = false, children }: SiteChromeProps) {
  const dictionary = getDictionary(locale);

  return (
    <>
      <AuroraBackground />
      <MatrixRain />
      <ScrollProgress />
      <Navbar locale={locale} t={dictionary.nav} showReviews={isReviewsConfigured} />
      <main className={`relative z-10 mx-auto min-h-dvh px-6 pb-24 pt-28 ${wide ? "max-w-5xl" : "max-w-3xl"}`}>
        {children}
      </main>
      <Footer locale={locale} t={dictionary.footer} nav={dictionary.nav} onPortfolio={false} showReviews={isReviewsConfigured} />
    </>
  );
}
