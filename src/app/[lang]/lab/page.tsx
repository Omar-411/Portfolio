import DecryptText from "@/components/effects/decrypt-text";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteChrome from "@/components/site-chrome";
import DemoCard from "@/features/lab/demo-card";
import GasEstimator from "@/features/lab/gas-estimator";
import SignaturePlayground from "@/features/lab/signature-playground";
import TypewriterToy from "@/features/lab/typewriter-toy";
import WalletLookup from "@/features/lab/wallet-lookup";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { meta } = getDictionary(lang);
  return { title: meta.labTitle, description: meta.labDescription };
}

export default async function LabPage({ params }: PageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).lab;

  return (
    <SiteChrome locale={lang} wide>
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neon-soft">{t.eyebrow}</p>
      <h1 className="font-display text-4xl font-extrabold text-white md:text-5xl">
        <DecryptText text={t.title} />
      </h1>
      <div className="mt-3 h-[2px] w-16 bg-gradient-to-r from-emerald-400 to-transparent" />
      <p className="mt-4 text-white/55">{t.intro}</p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <DemoCard id="wallet" title={t.wallet.title} description={t.wallet.description}>
          <WalletLookup t={t.wallet} />
        </DemoCard>
        <DemoCard id="gas" title={t.gas.title} description={t.gas.description}>
          <GasEstimator t={t.gas} />
        </DemoCard>
        <DemoCard id="sign" title={t.sign.title} description={t.sign.description}>
          <SignaturePlayground t={t.sign} />
        </DemoCard>
        <DemoCard id="typewriter" title={t.typewriter.title} description={t.typewriter.description}>
          <TypewriterToy t={t.typewriter} />
        </DemoCard>
      </div>
    </SiteChrome>
  );
}
