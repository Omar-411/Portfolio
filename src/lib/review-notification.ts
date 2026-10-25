import { profile } from "@/content/profile";
import type { Review } from "@/features/reviews/review";
import { submitForm } from "./formsubmit";
import { signReviewId } from "./review-signature";

// Resend (https://resend.com) delivers reliably from a server. FormSubmit is the fallback, but it
// often refuses requests that do not come from a browser.
const resendKey = process.env.RESEND_API_KEY;
const resendBase = (process.env.RESEND_API_BASE ?? "https://api.resend.com").replace(/\/$/, "");
const resendFrom = process.env.RESEND_FROM ?? "Portfolio <onboarding@resend.dev>";
const notifyTo = process.env.REVIEWS_NOTIFY_EMAIL ?? profile.email;

export function moderationLink(baseUrl: string, review: Review, secret: string): string {
  const query = new URLSearchParams({ id: review.id, sig: signReviewId(review.id, secret) });
  return `${baseUrl.replace(/\/$/, "")}/api/reviews/moderate?${query}`;
}

const stars = (rating: number) => "★".repeat(rating) + "☆".repeat(5 - rating);

function emailText(review: Review, link: string): string {
  return [
    `${review.name}${review.role ? `, ${review.role}` : ""}`,
    stars(review.rating),
    "",
    review.message,
    "",
    "Approve or delete (private link, do not forward):",
    link,
  ].join("\n");
}

async function sendWithResend(review: Review, link: string): Promise<boolean> {
  try {
    const response = await fetch(`${resendBase}/emails`, {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: resendFrom,
        to: [notifyTo],
        subject: `New review from ${review.name} (waiting for your approval)`,
        text: emailText(review, link),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) console.error("[reviews] Resend refused the email", response.status, await response.text());
    return response.ok;
  } catch (error) {
    console.error("[reviews] Resend request failed", error);
    return false;
  }
}

async function sendWithFormSubmit(review: Review, link: string): Promise<boolean> {
  const body = new FormData();
  body.append("rating", `${review.rating}/5`);
  body.append("name", review.name);
  body.append("role", review.role || "-");
  body.append("review", review.message);
  body.append("approve_or_delete", link);
  return submitForm(body, `New review from ${review.name} (waiting for your approval)`);
}

/** Emails the owner the review with a private approve/delete link. Resolves to `false` if it could not be sent. */
export async function notifyOwner(review: Review, link: string): Promise<boolean> {
  return resendKey ? sendWithResend(review, link) : sendWithFormSubmit(review, link);
}
