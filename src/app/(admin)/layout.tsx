import type { Metadata } from "next";
import RootBody from "@/components/root-body";
import { viewport as siteViewport } from "@/lib/site";
import "../globals.css";

export const metadata: Metadata = {
  title: "Reviews admin",
  robots: { index: false, follow: false },
};

export const viewport = siteViewport;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <RootBody>{children}</RootBody>
    </html>
  );
}
