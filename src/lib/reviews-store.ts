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

async function read<T>(segments: string[], { fresh = false } = {}): Promise<T> {
  const response = await fetch(`${url}/${segments.map(encodeURIComponent).join("/")}`, {
    headers: { Authorization: `Bearer ${token}` },
    ...(fresh ? { cache: "no-store" as const } : { next: { revalidate: REVALIDATE_SECONDS } }),
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

async function loadReviews(ids: string[], fresh: boolean): Promise<Review[]> {
  if (ids.length === 0) return [];
  const stored = await read<(string | null)[]>(["mget", ...ids.map(reviewKey)], { fresh });
  return stored.map(parseStoredReview).filter((review): review is Review => review !== null);
}

/** Newest first. Never throws: the page renders without reviews if the store is unreachable. */
export async function listApprovedReviews(limit = APPROVED_LIMIT): Promise<Review[]> {
  if (!isReviewsConfigured) return [];
  try {
    const ids = await read<string[]>(["zrevrange", approvedKey, "0", String(limit - 1)]);
    return loadReviews(ids, false);
  } catch (error) {
    console.error("[reviews] could not read approved reviews", error);
    return [];
  }
}

/** For the admin page: every approved review, uncached, newest first. */
export async function listAllApprovedReviews(): Promise<Review[]> {
  const ids = await read<string[]>(["zrevrange", approvedKey, "0", "-1"], { fresh: true });
  return loadReviews(ids, true);
}

/**
 * Reviews still waiting for a decision, oldest first. Found by scanning `review:*` instead of keeping
 * a second index: there are few, and an index could drift from the keys that expire on their own.
 */
export async function listPendingReviews(): Promise<Review[]> {
  const approved = new Set(await read<string[]>(["zrange", approvedKey, "0", "-1"], { fresh: true }));
  const ids: string[] = [];
  let cursor = "0";
  do {
    const [next, keys] = await run<[string, string[]]>(["SCAN", cursor, "MATCH", "review:*", "COUNT", 200]);
    cursor = next;
    for (const key of keys) {
      const id = key.slice("review:".length);
      if (!approved.has(id)) ids.push(id);
    }
  } while (cursor !== "0");

  const reviews = await loadReviews([...new Set(ids)], true);
  return reviews.sort((a, b) => a.createdAt - b.createdAt);
}

/** Counts one use of `bucket` and says whether it is still within `limit` for the window. */
export async function takeSlot(bucket: string, limit: number, windowSeconds: number): Promise<boolean> {
  const key = `reviews:rate:${bucket}`;
  const count = await run<number>(["INCR", key]);
  if (count === 1) await run(["EXPIRE", key, windowSeconds]);
  return count <= limit;
}

export const takeSubmissionSlot = (key: string) => takeSlot(`submit:${key}`, MAX_SUBMISSIONS_PER_HOUR, 3600);
