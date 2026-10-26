import type { Metadata } from "next";
import { profile } from "@/content/profile";
import { defaultLocale, locales, type Locale } from "@/i18n/config";

/** Canonical URL plus every language version, so Google serves the right one and never sees duplicates. */
export function pageAlternates(locale: Locale, path: string): NonNullable<Metadata["alternates"]> {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((code) => [code, `/${code}${path}`])),
      "x-default": `/${defaultLocale}${path}`,
    },
  };
}

const KNOWS_ABOUT = [
  "Full-stack web development",
  "Node.js",
  "Express.js",
  "MongoDB",
  "React",
  "Next.js",
  "TypeScript",
  "Blockchain",
  "Web3",
  "Solidity",
  "Smart contracts",
] as const;

/** schema.org graph for the portfolio: the person and the website, linked together. */
export function portfolioJsonLd({ siteUrl, jobTitle, description }: { siteUrl?: string; jobTitle: string; description: string }) {
  const personId = siteUrl ? `${siteUrl}/#person` : undefined;
  const person = {
    "@type": "Person",
    ...(personId ? { "@id": personId } : {}),
    name: profile.name,
    alternateName: profile.alias,
    jobTitle,
    description,
    email: profile.email,
    ...(siteUrl ? { url: siteUrl, image: `${siteUrl}/pdp.jpeg` } : {}),
    address: { "@type": "PostalAddress", addressLocality: "Tunis", addressCountry: "TN" },
    knowsAbout: KNOWS_ABOUT,
    knowsLanguage: ["ar", "fr", "en"],
    alumniOf: { "@type": "CollegeOrUniversity", name: "Institut Supérieur d'Informatique du Kef" },
    sameAs: [profile.github, profile.linkedin],
  };
  const website = siteUrl
    ? { "@type": "WebSite", "@id": `${siteUrl}/#website`, url: siteUrl, name: `${profile.name} Portfolio`, inLanguage: ["en", "fr"], author: { "@id": personId } }
    : null;

  return { "@context": "https://schema.org", "@graph": website ? [person, website] : [person] };
}
