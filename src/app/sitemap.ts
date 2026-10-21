import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/case-studies";
import { notes } from "@/content/notes";
import { locales } from "@/i18n/config";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl ?? "http://localhost:3000";
  const paths = [
    "/portfolio",
    ...caseStudies.map(({ slug }) => `/projects/${slug}`),
    "/notes",
    ...notes.map(({ slug }) => `/notes/${slug}`),
  ];

  return locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${base}/${locale}${path}`,
      changeFrequency: "monthly" as const,
      alternates: {
        languages: Object.fromEntries(locales.map((code) => [code, `${base}/${code}${path}`])),
      },
    }))
  );
}
