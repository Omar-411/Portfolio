import { submitForm } from "@/lib/formsubmit";
import type { BusyRange } from "./slots";

export type BookingOutcome = "invited" | "requested" | "taken" | "error";

export interface BookingRequest {
  name: string;
  email: string;
  topic: string;
  slot: string;
  website?: string;
  /** Pre-formatted for the fallback email only. */
  emailFields: Record<string, string>;
  emailSubject: string;
}

export async function fetchBusy(): Promise<BusyRange[]> {
  try {
    const response = await fetch("/api/availability");
    if (!response.ok) return [];
    return ((await response.json()) as { busy: BusyRange[] }).busy;
  } catch {
    return [];
  }
}

/** Creates a real calendar invitation when the server has Google credentials, else emails a request. */
export async function submitBooking(request: BookingRequest): Promise<BookingOutcome> {
  try {
    const response = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: request.name, email: request.email, topic: request.topic, slot: request.slot, website: request.website }),
    });
    if (response.ok) return ((await response.json()) as { mode?: string }).mode === "invited" ? "invited" : "requested";
    if (response.status === 409) return "taken";
    if (response.status !== 501) return "error";
  } catch {
    // Network or no API route (static hosting): use the email fallback below.
  }

  const body = new FormData();
  body.append("name", request.name);
  body.append("email", request.email);
  body.append("topic", request.topic);
  for (const [key, value] of Object.entries(request.emailFields)) body.append(key, value);
  return (await submitForm(body, request.emailSubject)) ? "requested" : "error";
}
