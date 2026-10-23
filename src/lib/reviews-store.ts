import { parseStoredReview, type Review } from "@/features/reviews/review";

// Upstash Redis over its REST API (no SDK). Vercel KV exposes the same service under KV_* names.
const url = (process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL)?.replace(/\/$/, "");
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export const reviewsSecret = process.env.REVIEWS_ADMIN_SECRET;
export const isReviewsConfigured = Boolean(url && token && reviewsSecret);

export const PENDING_TTL_SECONDS = 30 * 24 * 60 * 60;
export const MAX_SUBMISSIONS_PER_HOUR = 3;
export const APPROVED_LIMIT = 12;
/**
 * Approved reviews are re-read at most this often by the static pages, so an approval is public
 * within about this long. (On-demand purging is not used: `revalidateTag`/`revalidatePath` make
 * `/[lang]/portfolio` answer 404 while the layout has `dynamicParams = false`.)
 */
const REVALIDATE_SECONDS = 60;

const approvedKey = "reviews:approved";
const reviewKey = (id: string) => `review:${id}`;

async function run<T>(command: (string | number)[]): Promise<T> {
  const response = await fetch(url!, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const data = (await response.json()) as { result?: T; error?: string };
  if (!response.ok || data.error) throw new Error(data.error ?? `store answered ${response.status}`);
  return data.result as T;
}

async function read<T>(...segments: string[]): Promise<T> {
  const response = await fetch(`${url}/${segments.map(encodeURIComponent).join("/")}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  const data = (await response.json()) as { result?: T; error?: string };
  if (!response.ok || data.error) throw new Error(data.error ?? `store answered ${response.status}`);
  return data.result as T;
}

/** New reviews wait unapproved and expire on their own if never moderated. */
export async function savePendingReview(review: Review): Promise<void> {
  await run(["SET", reviewKey(review.id), JSON.stringify(review), "EX", PENDING_TTL_SECONDS]);
}

export async function findReview(id: string): Promise<Review | null> {
  return parseStoredReview(await run<string | null>(["GET", reviewKey(id)]));
}

export async function isApproved(id: string): Promise<boolean> {
  return (await run<number | null>(["ZSCORE", approvedKey, id])) !== null;
}

/** Idempotent. Resolves to `null` when the review is unknown or already expired. */
export async function approveReview(id: string): Promise<Review | null> {
  const review = await findReview(id);
  if (!review) return null;
  await run(["PERSIST", reviewKey(id)]);
  await run(["ZADD", approvedKey, review.createdAt, id]);
  return review;
}

export async function rejectReview(id: string): Promise<void> {
  await run(["ZREM", approvedKey, id]);
  await run(["DEL", reviewKey(id)]);
}

/** Newest first. Never throws: the page renders without reviews if the store is unreachable. */
export async function listApprovedReviews(limit = APPROVED_LIMIT): Promise<Review[]> {
  if (!isReviewsConfigured) return [];
  try {
    const ids = await read<string[]>("zrevrange", approvedKey, "0", String(limit - 1));
    if (ids.length === 0) return [];
    const stored = await read<(string | null)[]>("mget", ...ids.map(reviewKey));
    return stored.map(parseStoredReview).filter((review): review is Review => review !== null);
  } catch (error) {
    console.error("[reviews] could not read approved reviews", error);
    return [];
  }
}

/** Counts a submission for this key and says whether it is still within the hourly allowance. */
export async function takeSubmissionSlot(key: string): Promise<boolean> {
  const bucket = `reviews:rate:${key}`;
  const count = await run<number>(["INCR", bucket]);
  if (count === 1) await run(["EXPIRE", bucket, 3600]);
  return count <= MAX_SUBMISSIONS_PER_HOUR;
}
