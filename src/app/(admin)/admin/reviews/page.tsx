import { BookingsSection } from "@/features/admin/bookings-section";
import { ReviewsSection } from "@/features/admin/reviews-section";
import { buttonBase, Shell } from "@/features/admin/ui";
import { isAdmin } from "@/lib/admin-auth";
import { isBookingStoreConfigured, listBookings } from "@/lib/bookings-store";
import { isReviewsConfigured, listAllApprovedReviews, listPendingReviews } from "@/lib/reviews-store";

export const dynamic = "force-dynamic";

const LOGIN_ERRORS: Record<string, string> = {
  password: "Wrong password.",
  locked: "Too many attempts. Try again in a few minutes.",
  failed: "Something went wrong. Try again.",
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!isReviewsConfigured) {
    return (
      <Shell>
        <h1 className="font-display text-2xl font-bold text-white">Admin</h1>
        <p className="mt-4 text-white/60">
          The admin is not configured. Set <code>KV_REST_API_URL</code>, <code>KV_REST_API_TOKEN</code> and{" "}
          <code>REVIEWS_ADMIN_SECRET</code>, then redeploy.
        </p>
      </Shell>
    );
  }

  if (!(await isAdmin())) {
    const { error } = await searchParams;
    return (
      <Shell>
        <h1 className="font-display text-2xl font-bold text-white">Admin</h1>
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

  const [reviews, bookings] = await Promise.all([
    Promise.all([listPendingReviews(), listAllApprovedReviews()]).catch(() => null),
    isBookingStoreConfigured ? listBookings().catch(() => null) : Promise.resolve([]),
  ]);

  return (
    <Shell>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-white">Admin</h1>
        <form method="post" action="/api/admin/logout">
          <button type="submit" className={`${buttonBase} border border-white/15 text-white/60 hover:text-white`}>
            Log out
          </button>
        </form>
      </div>
      <BookingsSection records={bookings} />
      <ReviewsSection pending={reviews?.[0] ?? null} approved={reviews?.[1] ?? null} />
    </Shell>
  );
}
