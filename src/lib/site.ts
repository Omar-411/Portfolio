import type { Viewport } from "next";

/** Production URL, e.g. https://omarajimi.dev. Falls back to the Vercel production host; optional in development. */
const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || (vercelProductionHost ? `https://${vercelProductionHost}` : undefined))?.replace(/\/$/, "");

/** Token of Google Search Console's "HTML tag" verification method. */
export const googleVerification =
  process.env.GOOGLE_SITE_VERIFICATION || "Vr2oM1HVnv7j8f0nT4Vm1hVfnAapajo0HLpvNOt6Rd8";

export const metadataBase = siteUrl ? new URL(siteUrl) : undefined;

export const viewport: Viewport = {
  themeColor: "#020b06",
  colorScheme: "dark",
};

/** Optional booking link (Cal.com, Calendly…). Falls back to email when unset. */
export const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL ?? null;
