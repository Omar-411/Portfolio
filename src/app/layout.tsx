import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import CustomCursor from "@/components/effects/custom-cursor";
import { profile } from "@/content/profile";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const description = "Full-Stack & Blockchain Developer — projects, skills and contact.";

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: { default: `${profile.name} | Developer`, template: `%s | ${profile.name}` },
  description,
  openGraph: {
    type: "website",
    title: `${profile.name} | Developer`,
    description,
    siteName: profile.name,
  },
  twitter: { card: "summary", title: `${profile.name} | Developer`, description },
};

export const viewport: Viewport = {
  themeColor: "#020b06",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} min-h-dvh bg-void text-[#f0fff4] antialiased`}
      >
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
