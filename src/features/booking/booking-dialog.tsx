"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { CalendarCheck, CheckCircle2, X } from "lucide-react";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";
import { format, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { fetchBusy, submitBooking, type BookingOutcome } from "./client";
import { formatDay, formatFull, formatTime, isSlotBusy, upcomingDays, type BusyRange } from "./slots";

type Status = "idle" | "sending" | "error" | "taken" | BookingOutcome;

interface BookingDialogProps {
  locale: Locale;
  t: Dictionary["services"]["booking"];
  onClose: () => void;
}

const TUNIS_TZ = "Africa/Tunis";

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-code text-sm text-white placeholder-white/30 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-60";

const chip = (active: boolean) =>
  cn(
    "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
    active
      ? "border-neon bg-neon/15 text-neon"
      : "border-white/10 bg-white/5 text-white/70 hover:border-emerald-500/40 hover:text-white"
  );

export default function BookingDialog({ locale, t, onClose }: BookingDialogProps) {
  const allDays = useMemo(() => upcomingDays(), []);
  const [busy, setBusy] = useState<BusyRange[]>([]);
  const days = useMemo(
    () =>
      allDays
        .map((d) => ({ ...d, slots: d.slots.filter((slot) => !isSlotBusy(slot.iso, busy)) }))
        .filter((d) => d.slots.length > 0),
    [allDays, busy]
  );
  const localZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const [dayKey, setDayKey] = useState(allDays[0]?.key ?? "");
  const [slotIso, setSlotIso] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const closeRef = useRef<HTMLButtonElement>(null);

  const day = days.find((d) => d.key === dayKey) ?? days[0];
  const sameZone = localZone === TUNIS_TZ;

  useEffect(() => {
    let active = true;
    fetchBusy().then((ranges) => active && setBusy(ranges));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!slotIso) return;

    const form = new FormData(event.currentTarget);
    const field = (key: string) => String(form.get(key) ?? "");

    setStatus("sending");
    const outcome = await submitBooking({
      name: field("name"),
      email: field("email"),
      topic: field("topic"),
      slot: slotIso,
      website: field("website"),
      emailFields: {
        slot_tunis_time: formatFull(slotIso, "en", TUNIS_TZ),
        slot_visitor_time: `${formatFull(slotIso, "en", localZone)} (${localZone})`,
        slot_iso_utc: slotIso,
      },
      emailSubject: t.emailSubject,
    });

    if (outcome === "taken") {
      setSlotIso(null);
      setBusy(await fetchBusy());
    }
    setStatus(outcome);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="glass-card relative max-h-[90dvh] w-full max-w-lg overflow-y-auto p-6"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-white/40 transition-colors hover:text-white"
        >
          <X size={18} />
        </button>

        <h3 id="booking-title" className="mb-1 flex items-center gap-2 font-display text-2xl font-bold text-white">
          <CalendarCheck size={20} className="text-neon" aria-hidden="true" />
          {t.title}
        </h3>
        <p className="mb-5 text-sm text-white/50">{t.subtitle}</p>

        {status === "invited" || status === "requested" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center" role="status">
            <CheckCircle2 size={40} className="text-neon" aria-hidden="true" />
            <p className="text-white">{status === "invited" ? t.successInvited : t.success}</p>
            {slotIso && <p className="font-mono text-sm text-neon">{formatFull(slotIso, locale, TUNIS_TZ)}</p>}
            <button type="button" onClick={onClose} className="mt-2 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white">
              {t.close}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <fieldset>
              <legend className="mb-2 font-mono text-xs uppercase tracking-widest text-neon-soft">{t.pickDay}</legend>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {days.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    aria-pressed={d.key === dayKey}
                    onClick={() => {
                      setDayKey(d.key);
                      setSlotIso(null);
                    }}
                    className={chip(d.key === dayKey)}
                  >
                    {formatDay(d.key, locale)}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 font-mono text-xs uppercase tracking-widest text-neon-soft">{t.pickTime}</legend>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {day?.slots.map((slot) => (
                  <button
                    key={slot.iso}
                    type="button"
                    aria-pressed={slot.iso === slotIso}
                    onClick={() => setSlotIso(slot.iso)}
                    className={chip(slot.iso === slotIso)}
                  >
                    <span className="block font-mono">{formatTime(slot.iso, locale, TUNIS_TZ)}</span>
                    {!sameZone && (
                      <span className="block text-[11px] text-white/40">{formatTime(slot.iso, locale)}</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-white/40">
                {sameZone ? t.zoneTunis : format(t.zoneNote, { zone: localZone })}
              </p>
            </fieldset>

            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />
            <input name="name" required autoComplete="name" placeholder={t.name} className={fieldClass} disabled={status === "sending"} />
            <input name="email" type="email" required autoComplete="email" placeholder={t.email} className={fieldClass} disabled={status === "sending"} />
            <textarea name="topic" rows={3} placeholder={t.topic} className={cn(fieldClass, "resize-none")} disabled={status === "sending"} />

            {(status === "error" || status === "taken") && (
              <p role="alert" className="text-sm text-red-400">
                {status === "taken" ? t.taken : format(t.error, { email: profile.email })}
              </p>
            )}

            <button
              type="submit"
              disabled={!slotIso || status === "sending"}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 font-semibold text-white transition-all hover:shadow-[0_0_30px_rgba(0,255,106,0.4)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
            >
              {status === "sending" ? t.sending : slotIso ? format(t.submit, { slot: formatFull(slotIso, locale, TUNIS_TZ) }) : t.chooseSlot}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
