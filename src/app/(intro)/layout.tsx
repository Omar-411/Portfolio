import type { Metadata } from "next";
import RootBody from "@/components/root-body";
import { en } from "@/i18n/dictionaries/en";
import { metadataBase, viewport as siteViewport } from "@/lib/site";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase,
  title: en.meta.title,
  description: en.meta.description,
};

export const viewport = siteViewport;

export default function IntroLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <RootBody>{children}</RootBody>
    </html>
  );
}
