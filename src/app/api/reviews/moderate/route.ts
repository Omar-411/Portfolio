import { messagePage, reviewPage } from "@/features/reviews/moderation-page";
import { verifyReviewSignature } from "@/lib/review-signature";
import {
  approveReview,
  findReview,
  isApproved,
  isReviewsConfigured,
  rejectReview,
  reviewsSecret,
} from "@/lib/reviews-store";

export const dynamic = "force-dynamic";

const headers = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "no-store",
  "referrer-policy": "no-referrer",
  "x-robots-tag": "noindex, nofollow",
};

const html = (body: string, status = 200) => new Response(body, { status, headers });
const denied = () => html(messagePage("Link not valid", "This link is invalid or has expired."), 403);

function authorized(id: string, signature: string): boolean {
  return Boolean(reviewsSecret) && /^[0-9a-f-]{36}$/.test(id) && /^[0-9a-f]{64}$/.test(signature) && verifyReviewSignature(id, signature, reviewsSecret!);
}

/** Shows the review and two buttons. Opening a link never changes anything: mail scanners follow links. */
export async function GET(request: Request) {
  if (!isReviewsConfigured) return html(messagePage("Not configured", "Reviews storage is not set up."), 501);
  const params = new URL(request.url).searchParams;
  const id = params.get("id") ?? "";
  const signature = params.get("sig") ?? "";
  if (!authorized(id, signature)) return denied();

  try {
    const review = await findReview(id);
    if (!review) return html(messagePage("Not found", "This review no longer exists. It may have been deleted or expired."), 404);
    return html(reviewPage(review, id, signature, await isApproved(id)));
  } catch (error) {
    console.error("[reviews] moderation read failed", error);
    return html(messagePage("Storage error", "Could not reach the reviews store. Try again in a moment."), 502);
  }
}

export async function POST(request: Request) {
  if (!isReviewsConfigured) return html(messagePage("Not configured", "Reviews storage is not set up."), 501);
  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  const signature = String(form.get("sig") ?? "");
  const action = String(form.get("action") ?? "");
  if (!authorized(id, signature)) return denied();

  try {
    if (action === "approve") {
      const review = await approveReview(id);
      if (!review) return html(messagePage("Not found", "This review no longer exists."), 404);
    } else if (action === "reject") {
      await rejectReview(id);
    } else {
      return html(messagePage("Unknown action", "Nothing was changed."), 400);
    }
    return html(messagePage(action === "approve" ? "Approved" : "Deleted", action === "approve" ? "The review is now public. It shows on your portfolio within a minute or two." : "The review was deleted."));
  } catch (error) {
    console.error("[reviews] moderation failed", error);
    return html(messagePage("Storage error", "Nothing was changed. Try again in a moment."), 502);
  }
}
