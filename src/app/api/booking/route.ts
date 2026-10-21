import { NextResponse } from "next/server";
import { availabilityWindow, isBookableSlot, isSlotBusy, SLOT_MINUTES } from "@/features/booking/slots";
import { createEvent, getBusyIntervals, isCalendarConfigured } from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface BookingBody {
  name?: unknown;
  email?: unknown;
  topic?: unknown;
  slot?: unknown;
  website?: unknown;
}

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export async function POST(request: Request) {
  if (!isCalendarConfigured) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  let body: BookingBody;
  try {
    body = (await request.json()) as BookingBody;
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Honeypot: real visitors never fill the hidden "website" field.
  if (text(body.website, 100)) return NextResponse.json({ ok: true });

  const name = text(body.name, 100);
  const email = text(body.email, 200);
  const topic = text(body.topic, 1000);
  const slot = text(body.slot, 40);

  if (!name || !EMAIL_PATTERN.test(email) || !isBookableSlot(slot)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const { timeMin, timeMax } = availabilityWindow();
    if (isSlotBusy(slot, await getBusyIntervals(timeMin, timeMax))) {
      return NextResponse.json({ error: "taken" }, { status: 409 });
    }

    await createEvent({
      summary: `Call with ${name}`,
      description: topic || "No topic given.",
      startIso: slot,
      endIso: new Date(Date.parse(slot) + SLOT_MINUTES * 60_000).toISOString(),
      attendee: { email, name },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[booking] create failed", error);
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }
}
