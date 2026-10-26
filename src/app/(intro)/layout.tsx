import type { Metadata } from "next";
import RootBody from "@/components/root-body";
import { en } from "@/i18n/dictionaries/en";
import { googleVerification, metadataBase, viewport as siteViewport } from "@/lib/site";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase,
  title: { absolute: en.meta.portfolioTitle },
  description: en.meta.portfolioDescription,
  // The intro has no content of its own, so search engines should index the portfolio instead.
  alternates: { canonical: "/en/portfolio" },
  // Search Console checks the home page, which is this intro.
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
};

export const viewport = siteViewport;

export default function IntroLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <RootBody>{children}</RootBody>
    </html>
  );
}
