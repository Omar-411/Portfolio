"use client";

import DecryptText from "@/components/effects/decrypt-text";
import { useState, type FormEvent } from "react";
import { m } from "framer-motion";
import { Github, Linkedin, Mail, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { profile } from "@/content/profile";
import { submitForm } from "@/lib/formsubmit";
import { format } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

type Status = "idle" | "sending" | "success" | "error";

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-code text-sm text-white placeholder-white/30 transition-all focus:border-emerald-500/60 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-60";

const socialClass =
  "flex items-center gap-2 text-sm text-white/30 transition-colors duration-200 hover:text-neon";

export default function Contact({ t }: { t: Dictionary["contact"] }) {
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("sending");

    const ok = await submitForm(new FormData(form), t.subject);
    if (ok) form.reset();
    setStatus(ok ? "success" : "error");
  };

  const sending = status === "sending";

  return (
    <section id="contact" className="snap-section flex items-center justify-center">
      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-6 py-20 text-center">
        <div className="flex flex-col items-center gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-neon-soft">{t.eyebrow}</p>
          <h2 className="font-display text-[2.5rem] sm:text-5xl font-extrabold leading-tight text-white md:text-6xl">
            <DecryptText text={t.titleLines[0]} />
            <br />
            <DecryptText text={t.titleLines[1]} className="text-aurora" delayMs={200} />
            <br />
            <DecryptText text={t.titleLines[2]} delayMs={400} />
          </h2>
          <p className="mt-2 text-base text-white/50">{t.subtitle}</p>
        </div>

        <m.div
          className="glass-card w-full p-6 md:p-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <a
            href={`mailto:${profile.email}`}
            className="mb-4 inline-flex items-center gap-2 text-sm text-neon hover:underline"
          >
            <Mail size={14} />
            {profile.email}
          </a>

          <div className="my-4 border-t border-white/10" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            {/* Honeypot: real visitors never see or fill this; bots do. */}
            <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="w-full">
                <label htmlFor="contact-name" className="sr-only">{t.name}</label>
                <input id="contact-name" type="text" name="name" required placeholder={t.name} disabled={sending} className={fieldClass} />
              </div>
              <div className="w-full">
                <label htmlFor="contact-email" className="sr-only">{t.email}</label>
                <input id="contact-email" type="email" name="email" required placeholder={t.email} disabled={sending} className={fieldClass} />
              </div>
            </div>

            <div>
              <label htmlFor="contact-message" className="sr-only">{t.message}</label>
              <textarea id="contact-message" name="message" required rows={4} placeholder={t.message} disabled={sending} className={cn(fieldClass, "resize-none")} />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,255,106,0.4)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={15} />
              {sending ? t.sending : t.send}
            </button>

            <p
              role="status"
              className={cn(
                "min-h-5 text-center text-sm",
                status === "success" && "text-neon",
                status === "error" && "text-red-400"
              )}
            >
              {status === "success" && t.success}
              {status === "error" && format(t.error, { email: profile.email })}
            </p>
          </form>
        </m.div>

        <div className="flex items-center justify-center gap-6">
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className={socialClass}>
            <Github size={16} />
            GitHub
          </a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={socialClass}>
            <Linkedin size={16} />
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}
