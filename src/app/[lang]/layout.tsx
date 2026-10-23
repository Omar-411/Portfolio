import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MotionProvider from "@/components/motion-provider";
import RootBody from "@/components/root-body";
import UiSounds from "@/components/ui-sounds";
import BookingProvider from "@/features/booking/booking-provider";
import PaletteProvider from "@/features/palette/palette-provider";
import TransitionProvider from "@/features/transition/transition-provider";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { bookingUrl, metadataBase, viewport as siteViewport } from "@/lib/site";
import "../globals.css";

export const dynamicParams = false;

export const viewport = siteViewport;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { meta } = getDictionary(lang);

  return {
    metadataBase,
    title: { default: meta.title, template: "%s | Omar Ajimi" },
    description: meta.description,
    alternates: {
      languages: Object.fromEntries(locales.map((code) => [code, `/${code}/portfolio`])),
    },
    openGraph: {
      type: "website",
      title: meta.title,
      description: meta.description,
      siteName: "Omar Ajimi",
      locale: lang === "fr" ? "fr_FR" : "en_US",
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dictionary = getDictionary(lang);

  return (
    <html lang={lang}>
      <RootBody>
        <MotionProvider>
          <TransitionProvider>
            <BookingProvider locale={lang} t={dictionary.services.booking} bookingUrl={bookingUrl}>
              <PaletteProvider locale={lang} t={dictionary.palette}>
                <UiSounds />
                {children}
              </PaletteProvider>
            </BookingProvider>
          </TransitionProvider>
        </MotionProvider>
      </RootBody>
    </html>
  );
}
