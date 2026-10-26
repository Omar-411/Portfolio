import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { BookingRecord } from "@/features/booking/booking-request";
import { availabilityWindow, isBookableSlot, isSlotBusy, SLOT_MINUTES } from "@/features/booking/slots";
import { claimSlot, isBookingStoreConfigured, releaseSlot, saveBooking } from "@/lib/bookings-store";
import { createEvent, getBusyIntervals, isCalendarConfigured } from "@/lib/google-calendar";
import { hashAddress } from "@/lib/review-signature";
import { takeSlot } from "@/lib/upstash";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_REQUESTS_PER_HOUR = 5;

interface BookingBody {
  name?: unknown;
  email?: unknown;
  topic?: unknown;
  slot?: unknown;
  website?: unknown;
}

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export async function POST(request: Request) {
  // Neither a calendar nor a store: the client falls back to sending an email request.
  if (!isCalendarConfigured && !isBookingStoreConfigured) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  let body: BookingBody;
  try {
    body = (await request.json()) as BookingBody;
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Honeypot: real visitors never fill the hidden "website" field.
  if (text(body.website, 100)) return NextResponse.json({ ok: true, mode: "requested" });

  const name = text(body.name, 100);
  const email = text(body.email, 200);
  const topic = text(body.topic, 1000);
  const slot = text(body.slot, 40);

  if (!name || !EMAIL_PATTERN.test(email) || !isBookableSlot(slot)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const id = randomUUID();
  let claimed = false;
  try {
    if (isBookingStoreConfigured) {
      const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const key = hashAddress(address, process.env.REVIEWS_ADMIN_SECRET ?? "booking");
      if (!(await takeSlot(`booking:${key}`, MAX_REQUESTS_PER_HOUR, 3600))) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      }
      claimed = await claimSlot(slot, id);
      if (!claimed) return NextResponse.json({ error: "taken" }, { status: 409 });
    }

    if (isCalendarConfigured) {
      const { timeMin, timeMax } = availabilityWindow();
      if (isSlotBusy(slot, await getBusyIntervals(timeMin, timeMax))) {
        if (claimed) await releaseSlot(slot);
        return NextResponse.json({ error: "taken" }, { status: 409 });
      }
      await createEvent({
        summary: `Call with ${name}`,
        description: topic || "No topic given.",
        startIso: slot,
        endIso: new Date(Date.parse(slot) + SLOT_MINUTES * 60_000).toISOString(),
        attendee: { email, name },
      });
    }

    if (isBookingStoreConfigured) {
      const record: BookingRecord = {
        id,
        name,
        email,
        topic,
        slot,
        createdAt: Date.now(),
        status: isCalendarConfigured ? "invited" : "pending",
      };
      await saveBooking(record);
    }
    return NextResponse.json({ ok: true, mode: isCalendarConfigured ? "invited" : "requested" });
  } catch (error) {
    console.error("[booking] failed", error);
    if (claimed) await releaseSlot(slot).catch(() => undefined);
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }
}
