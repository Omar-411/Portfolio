// Upstash Redis over its REST API (no SDK). Vercel KV exposes the same service under KV_* names.
const url = (process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL)?.replace(/\/$/, "");
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export const isStoreConfigured = Boolean(url && token);

export async function run<T>(command: (string | number)[]): Promise<T> {
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

/** GET form of a command, so Next can cache it (`revalidate`) or skip the cache (`fresh`). */
export async function read<T>(segments: string[], { fresh = false, revalidate = 60 } = {}): Promise<T> {
  const response = await fetch(`${url}/${segments.map(encodeURIComponent).join("/")}`, {
    headers: { Authorization: `Bearer ${token}` },
    ...(fresh ? { cache: "no-store" as const } : { next: { revalidate } }),
  });
  const data = (await response.json()) as { result?: T; error?: string };
  if (!response.ok || data.error) throw new Error(data.error ?? `store answered ${response.status}`);
  return data.result as T;
}

/** Counts one use of `bucket` and says whether it is still within `limit` for the window. */
export async function takeSlot(bucket: string, limit: number, windowSeconds: number): Promise<boolean> {
  const key = `rate:${bucket}`;
  const count = await run<number>(["INCR", key]);
  if (count === 1) await run(["EXPIRE", key, windowSeconds]);
  return count <= limit;
}
