"use client";

import { useState, type FormEvent } from "react";
import { Send, Star } from "lucide-react";
import { playSuccess } from "@/lib/audio";
import { format } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils";
import { submitReview } from "./client";
import { LIMITS, validateReviewInput, type ReviewField } from "./review";

type Status = "idle" | "sending" | "sent" | "rate_limited" | "error";
type Errors = Partial<Record<ReviewField, string>>;

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 transition-all focus:border-emerald-500/60 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-60 aria-[invalid=true]:border-red-400/60";

export default function ReviewForm({ t }: { t: Dictionary["reviews"] }) {
  const [status, setStatus] = useState<Status>("idle");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const sending = status === "sending";
  const shown = hovered || rating;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const checked = validateReviewInput({
      name: data.get("name"),
      role: data.get("role"),
      rating,
      message: data.get("message"),
    });
    if (!checked.ok) {
      setErrors(
        Object.fromEntries(
          checked.issues.map(({ field, code }) => [field, code === "link" ? t.form.errors.link : t.form.errors[field]])
        )
      );
      return;
    }

    setErrors({});
    setStatus("sending");
    const outcome = await submitReview(checked.value, String(data.get("website") ?? ""));
    if (outcome === "sent") {
      form.reset();
      setRating(0);
      setMessage("");
      playSuccess();
    }
    setStatus(outcome);
  };

  const describe = (field: ReviewField) => (errors[field] ? `review-${field}-error` : undefined);
  const error = (field: ReviewField) =>
    errors[field] && (
      <p id={`review-${field}-error`} role="alert" className="mt-1.5 text-xs text-red-300">
        {errors[field]}
      </p>
    );

  return (
    <form onSubmit={handleSubmit} noValidate className="glass-card mx-auto mt-10 flex w-full max-w-2xl flex-col gap-4 p-6 text-left md:p-8">
      <h3 className="font-display text-xl font-bold text-white">{t.form.title}</h3>

      {/* Hidden from people and screen readers; bots fill it. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="w-full">
          <label htmlFor="review-name" className="sr-only">{t.form.name}</label>
          <input
            id="review-name"
            name="name"
            type="text"
            placeholder={t.form.name}
            maxLength={LIMITS.nameMax}
            disabled={sending}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describe("name")}
            className={fieldClass}
          />
          {error("name")}
        </div>
        <div className="w-full">
          <label htmlFor="review-role" className="sr-only">{t.form.role}</label>
          <input
            id="review-role"
            name="role"
            type="text"
            placeholder={t.form.role}
            maxLength={LIMITS.roleMax}
            disabled={sending}
            aria-invalid={Boolean(errors.role)}
            aria-describedby={describe("role")}
            className={fieldClass}
          />
          {error("role")}
        </div>
      </div>

      <fieldset disabled={sending} aria-describedby={describe("rating")}>
        <legend className="mb-2 text-sm text-white/60">{t.form.rating}</legend>
        <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer" onMouseEnter={() => setHovered(value)}>
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                className="peer sr-only"
                aria-label={format(t.stars, { n: value })}
              />
              <Star
                size={28}
                aria-hidden="true"
                className={cn(
                  "rounded transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-400",
                  value <= shown ? "fill-neon text-neon" : "text-white/25"
                )}
              />
            </label>
          ))}
        </div>
        {error("rating")}
      </fieldset>

      <div>
        <label htmlFor="review-message" className="sr-only">{t.form.message}</label>
        <textarea
          id="review-message"
          name="message"
          rows={4}
          placeholder={t.form.message}
          maxLength={LIMITS.messageMax}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={sending}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describe("message")}
          className={cn(fieldClass, "resize-none")}
        />
        <div className="mt-1.5 flex items-start justify-between gap-4">
          <div>{error("message")}</div>
          <span className="shrink-0 font-mono text-xs text-white/30">
            {format(t.form.messageHint, { count: message.length, max: LIMITS.messageMax })}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={sending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_0_30px_rgba(0,255,106,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={15} aria-hidden="true" />
        {sending ? t.form.sending : t.form.submit}
      </button>

      <p
        role="status"
        className={cn(
          "text-center text-sm",
          status === "sent" ? "text-neon" : "text-red-300",
          (status === "idle" || sending) && "hidden"
        )}
      >
        {status === "sent" && t.form.success}
        {status === "rate_limited" && t.form.rateLimited}
        {status === "error" && t.form.error}
      </p>
    </form>
  );
}
