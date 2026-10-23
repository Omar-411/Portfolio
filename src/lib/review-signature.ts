import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/** Signs a review id so only the owner's emailed link can approve or reject it. */
export function signReviewId(id: string, secret: string): string {
  return createHmac("sha256", secret).update(`review:${id}`).digest("hex");
}

export function verifyReviewSignature(id: string, signature: string, secret: string): boolean {
  const expected = Buffer.from(signReviewId(id, secret), "hex");
  const given = Buffer.from(signature, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Rate-limit key. The raw address is never stored. */
export function hashAddress(address: string, secret: string): string {
  return createHash("sha256").update(`${secret}:${address}`).digest("hex").slice(0, 32);
}
