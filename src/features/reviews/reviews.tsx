import { Quote, Star } from "lucide-react";
import DecryptText from "@/components/effects/decrypt-text";
import { format } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import ReviewForm from "./review-form";
import type { Review } from "./review";

interface ReviewsProps {
  t: Dictionary["reviews"];
  reviews: Review[];
}

export default function Reviews({ t, reviews }: ReviewsProps) {
  return (
    <section id="reviews" className="snap-section flex items-center">
      <div className="container relative z-10 mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 text-center">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neon-soft">{t.eyebrow}</p>
          <h2 className="font-display text-4xl font-extrabold text-white md:text-5xl">
            <DecryptText text={t.title} />
          </h2>
          <div className="mx-auto mt-3 h-[2px] w-24 bg-gradient-to-r from-emerald-400 to-transparent" />
          <p className="mx-auto mt-4 max-w-xl text-white/50">{t.intro}</p>
        </div>

        {reviews.length > 0 ? (
          <ul aria-label={t.listLabel} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <li
                key={review.id}
                data-tilt="5"
                className="glass-card flex flex-col gap-3 p-6 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(0,255,106,0.12)]"
              >
                <Quote size={18} className="text-neon/60" aria-hidden="true" />
                <p className="flex-1 whitespace-pre-line text-sm leading-relaxed text-white/70">{review.message}</p>
                <div>
                  <div className="flex gap-0.5" role="img" aria-label={format(t.stars, { n: review.rating })}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        size={14}
                        aria-hidden="true"
                        className={value <= review.rating ? "fill-neon text-neon" : "text-white/20"}
                      />
                    ))}
                  </div>
                  <p className="mt-2 font-display font-bold text-white">{review.name}</p>
                  {review.role && <p className="text-xs text-neon-soft">{review.role}</p>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-white/40">{t.empty}</p>
        )}

        <ReviewForm t={t} />
      </div>
    </section>
  );
}
