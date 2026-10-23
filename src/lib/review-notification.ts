import type { Review } from "@/features/reviews/review";
import { submitForm } from "./formsubmit";
import { signReviewId } from "./review-signature";

export function moderationLink(baseUrl: string, review: Review, secret: string): string {
  const query = new URLSearchParams({ id: review.id, sig: signReviewId(review.id, secret) });
  return `${baseUrl.replace(/\/$/, "")}/api/reviews/moderate?${query}`;
}

/** Emails the owner the review with a private approve/delete link. Resolves to `false` if it could not be sent. */
export async function notifyOwner(review: Review, link: string): Promise<boolean> {
  const body = new FormData();
  body.append("rating", `${review.rating}/5`);
  body.append("name", review.name);
  body.append("role", review.role || "-");
  body.append("review", review.message);
  body.append("approve_or_delete", link);
  return submitForm(body, `New review from ${review.name} (waiting for your approval)`);
}
