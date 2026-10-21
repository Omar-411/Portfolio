import { Geist, JetBrains_Mono, Space_Grotesk } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const fontVariables = `${geistSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`;
