"use client";

import { m } from "framer-motion";
import { Blocks, CalendarCheck, Code2, ExternalLink, Server } from "lucide-react";
import DecryptText from "@/components/effects/decrypt-text";
import { useBooking } from "@/features/booking/booking-provider";
import type { Web3Proof } from "@/content/web3";
import type { Activity } from "@/lib/github";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import NowActivity from "./now-activity";

const ICONS = [Code2, Blocks, Server] as const;

interface ServicesProps {
  locale: Locale;
  t: Dictionary["services"];
  bookingUrl: string | null;
  proof: Web3Proof;
  activity: Activity[];
}

const shorten = (address: string) => (address.length > 14 ? `${address.slice(0, 8)}…${address.slice(-6)}` : address);

export default function Services({ locale, t, bookingUrl, proof, activity }: ServicesProps) {
  const hasProof = proof.ens !== null || proof.contracts.length > 0;
  const booking = useBooking();
  const ctaClass =
    "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-7 py-3 font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(0,255,106,0.4)]";

  return (
    <section id="services" className="snap-section flex items-center">
      <div className="container relative z-10 mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 text-center">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neon-soft">{t.eyebrow}</p>
          <h2 className="font-display text-4xl font-extrabold text-white md:text-5xl">
            <DecryptText text={t.title} />
          </h2>
          <div className="mx-auto mt-3 h-[2px] w-24 bg-gradient-to-r from-emerald-400 to-transparent" />
          <p className="mx-auto mt-4 max-w-xl text-white/50">{t.intro}</p>
        </div>

        <ul className="grid gap-6 md:grid-cols-3">
          {t.items.map((item, i) => {
            const Icon = ICONS[i] ?? Code2;
            return (
              <m.li
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              >
                {/* The tilt lives on an inner box: framer-motion owns the li's transform. */}
                <div
                  data-tilt="6"
                  className="glass-card group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(0,255,106,0.12)]"
                >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-neon/25 bg-neon/10 text-neon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3 className="mb-2 font-display text-xl font-bold text-white transition-colors group-hover:text-neon">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/55">{item.description}</p>
                </div>
              </m.li>
            );
          })}
        </ul>

        <div className="mt-10 flex justify-center">
          {bookingUrl ? (
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer" data-magnetic className={ctaClass}>
              <CalendarCheck size={16} aria-hidden="true" />
              {t.bookCall}
            </a>
          ) : (
            <button type="button" onClick={booking.open} data-magnetic className={ctaClass}>
              <CalendarCheck size={16} aria-hidden="true" />
              {t.bookCall}
            </button>
          )}
        </div>

        {hasProof && (
          <div className="glass-card mx-auto mt-10 max-w-3xl p-5">
            <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-neon-soft">{t.proofTitle}</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {proof.ens && (
                <li className="flex items-center justify-between gap-4">
                  <span className="text-white/60">{t.proofEns}</span>
                  <span className="font-mono text-neon">{proof.ens}</span>
                </li>
              )}
              {proof.contracts.map((contract) => (
                <li key={contract.address} className="flex items-center justify-between gap-4">
                  <span className="text-white/60">
                    {contract.label} <span className="text-white/30">· {contract.chain}</span>
                  </span>
                  <a
                    href={contract.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-neon hover:underline"
                  >
                    {shorten(contract.address)}
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <NowActivity title={t.nowTitle} locale={locale} activity={activity} />
      </div>

    </section>
  );
}
