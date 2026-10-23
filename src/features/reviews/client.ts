import type { ReviewInput } from "./review";

export type SubmitOutcome = "sent" | "rate_limited" | "error";

export async function submitReview(input: ReviewInput, honeypot: string): Promise<SubmitOutcome> {
  try {
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, website: honeypot }),
    });
    if (response.ok) return "sent";
    return response.status === 429 ? "rate_limited" : "error";
  } catch {
    return "error";
  }
}
