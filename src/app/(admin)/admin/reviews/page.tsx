import { Star } from "lucide-react";
import type { Review } from "@/features/reviews/review";
import { isAdmin } from "@/lib/admin-auth";
import { isReviewsConfigured, listAllApprovedReviews, listPendingReviews } from "@/lib/reviews-store";

export const dynamic = "force-dynamic";

const LOGIN_ERRORS: Record<string, string> = {
  password: "Wrong password.",
  locked: "Too many attempts. Try again in a few minutes.",
  failed: "Something went wrong. Try again.",
};

const buttonBase = "rounded-lg px-4 py-2 text-sm font-semibold transition-colors";

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto min-h-dvh max-w-3xl px-6 py-16">{children}</main>;
}

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

function Section({ title, reviews, pending, empty }: { title: string; reviews: Review[]; pending: boolean; empty: string }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-neon-soft">
        {title} ({reviews.length})
      </h2>
      {reviews.length === 0 ? (
        <p className="text-sm text-white/40">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} pending={pending} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!isReviewsConfigured) {
    return (
      <Shell>
        <h1 className="font-display text-2xl font-bold text-white">Reviews admin</h1>
        <p className="mt-4 text-white/60">
          Reviews are not configured. Set <code>KV_REST_API_URL</code>, <code>KV_REST_API_TOKEN</code> and{" "}
          <code>REVIEWS_ADMIN_SECRET</code>, then redeploy.
        </p>
      </Shell>
    );
  }

  if (!(await isAdmin())) {
    const { error } = await searchParams;
    return (
      <Shell>
        <h1 className="font-display text-2xl font-bold text-white">Reviews admin</h1>
        <form method="post" action="/api/admin/login" className="glass-card mt-6 flex max-w-sm flex-col gap-3 p-6">
          <label htmlFor="password" className="text-sm text-white/60">
            Password (your <code>REVIEWS_ADMIN_SECRET</code>)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            autoFocus
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-500/60 focus:outline-none"
          />
          {error && <p role="alert" className="text-sm text-red-300">{LOGIN_ERRORS[error] ?? LOGIN_ERRORS.failed}</p>}
          <button type="submit" className={`${buttonBase} bg-emerald-500 text-black hover:bg-emerald-400`}>
            Log in
          </button>
        </form>
      </Shell>
    );
  }

  const [pending, approved] = await Promise.all([listPendingReviews(), listAllApprovedReviews()]).catch(() => [null, null]);

  return (
    <Shell>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-white">Reviews admin</h1>
        <form method="post" action="/api/admin/logout">
          <button type="submit" className={`${buttonBase} border border-white/15 text-white/60 hover:text-white`}>
            Log out
          </button>
        </form>
      </div>
      {pending && approved ? (
        <>
          <Section title="Waiting for approval" reviews={pending} pending empty="Nothing to approve." />
          <Section title="Public" reviews={approved} pending={false} empty="No public reviews yet." />
          <p className="mt-10 text-xs text-white/30">An approved review shows on the portfolio within a minute or two.</p>
        </>
      ) : (
        <p className="mt-8 text-red-300">Could not reach the reviews store. Refresh in a moment.</p>
      )}
    </Shell>
  );
}
