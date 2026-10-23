import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { toReview, validateReviewInput } from "@/features/reviews/review";
import { moderationLink, notifyOwner } from "@/lib/review-notification";
import { hashAddress } from "@/lib/review-signature";
import { isReviewsConfigured, reviewsSecret, savePendingReview, takeSubmissionSlot } from "@/lib/reviews-store";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

interface ReviewBody {
  name?: unknown;
  role?: unknown;
  rating?: unknown;
  message?: unknown;
  website?: unknown;
}

function clientAddress(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  if (!isReviewsConfigured || !reviewsSecret) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  let body: ReviewBody;
  try {
    body = (await request.json()) as ReviewBody;
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Honeypot: real visitors never fill the hidden "website" field. Bots get a fake success.
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true }, { status: 201 });

  const checked = validateReviewInput(body);
  if (!checked.ok) return NextResponse.json({ error: "invalid", issues: checked.issues }, { status: 400 });

  try {
    if (!(await takeSubmissionSlot(hashAddress(clientAddress(request), reviewsSecret)))) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const review = toReview(checked.value, randomUUID(), Date.now());
    await savePendingReview(review);

    const link = moderationLink(siteUrl ?? new URL(request.url).origin, review, reviewsSecret);
    if (!(await notifyOwner(review, link))) {
      // The review is safe in the store; the link in the log is the way to find it.
      console.warn("[reviews] owner email failed, moderate here:", link);
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[reviews] submit failed", error);
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }
}
