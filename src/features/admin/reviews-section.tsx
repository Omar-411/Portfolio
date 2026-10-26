import { Star } from "lucide-react";
import type { Review } from "@/features/reviews/review";
import { buttonBase, SectionHeading } from "./ui";

function ReviewCard({ review, pending }: { review: Review; pending: boolean }) {
  const action = (name: "approve" | "reject", label: string, className: string) => (
    <button type="submit" name="action" value={name} className={`${buttonBase} ${className}`}>
      {label}
    </button>
  );

  return (
    <li className="glass-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-lg font-bold text-white">{review.name}</p>
          {review.role && <p className="text-sm text-neon-soft">{review.role}</p>}
        </div>
        <div className="flex shrink-0 gap-0.5" role="img" aria-label={`${review.rating} out of 5`}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Star key={value} size={14} aria-hidden="true" className={value <= review.rating ? "fill-neon text-neon" : "text-white/20"} />
          ))}
        </div>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/70">{review.message}</p>
      <p className="mt-3 font-mono text-xs text-white/30">{new Date(review.createdAt).toISOString().slice(0, 16).replace("T", " ")} UTC</p>
      <form method="post" action="/api/admin/reviews" className="mt-4 flex gap-2">
        <input type="hidden" name="id" value={review.id} />
        {pending && action("approve", "Approve", "bg-emerald-500 text-black hover:bg-emerald-400")}
        {action("reject", "Delete", "border border-red-400/50 text-red-300 hover:bg-red-400/10")}
      </form>
    </li>
  );
}

function ReviewList({ title, reviews, pending, empty }: { title: string; reviews: Review[]; pending: boolean; empty: string }) {
  return (
    <div className="mt-6">
      <SectionHeading title={title} count={reviews.length} />
      {reviews.length === 0 ? (
        <p className="text-sm text-white/40">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} pending={pending} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function ReviewsSection({ pending, approved }: { pending: Review[] | null; approved: Review[] | null }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-bold text-white">Reviews</h2>
      {pending && approved ? (
        <>
          <ReviewList title="Waiting for approval" reviews={pending} pending empty="Nothing to approve." />
          <ReviewList title="Public" reviews={approved} pending={false} empty="No public reviews yet." />
          <p className="mt-6 text-xs text-white/30">An approved review shows on the portfolio within a minute or two.</p>
        </>
      ) : (
        <p className="mt-4 text-red-300">Could not reach the reviews store. Refresh in a moment.</p>
      )}
    </section>
  );
}
