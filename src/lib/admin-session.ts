import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "reviews_admin";
export const ADMIN_SESSION_SECONDS = 7 * 24 * 60 * 60;

/** The cookie holds a MAC of a fixed label, never the password itself. */
export function adminToken(secret: string): string {
  return createHmac("sha256", secret).update("admin-session").digest("hex");
}

export function isValidAdminToken(token: string | undefined, secret: string): boolean {
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return false;
  return timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(adminToken(secret), "hex"));
}

/** Compares digests so the length of the password is not leaked by the comparison. */
export function passwordMatches(input: string, secret: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(input), digest(secret));
}
