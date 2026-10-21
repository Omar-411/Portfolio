import type { Viewport } from "next";

/** Production URL, e.g. https://omarajimi.dev. Optional in development. */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

export const metadataBase = siteUrl ? new URL(siteUrl) : undefined;

export const viewport: Viewport = {
  themeColor: "#020b06",
  colorScheme: "dark",
};

/** Optional booking link (Cal.com, Calendly…). Falls back to email when unset. */
export const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL ?? null;
