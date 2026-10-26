import { NextResponse } from "next/server";
import { availabilityWindow, type BusyRange } from "@/features/booking/slots";
import { isBookingStoreConfigured, listStoredBusyRanges } from "@/lib/bookings-store";
import { getBusyIntervals, isCalendarConfigured } from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isCalendarConfigured && !isBookingStoreConfigured) return NextResponse.json({ configured: false, busy: [] });

  try {
    const { timeMin, timeMax } = availabilityWindow();
    const [calendarBusy, savedBusy]: BusyRange[][] = await Promise.all([
      isCalendarConfigured ? getBusyIntervals(timeMin, timeMax) : [],
      isBookingStoreConfigured ? listStoredBusyRanges() : [],
    ]);
    return NextResponse.json(
      { configured: true, busy: [...calendarBusy, ...savedBusy] },
      { headers: { "Cache-Control": "private, max-age=15" } }
    );
  } catch (error) {
    console.error("[booking] availability failed", error);
    // The client then shows every slot; double-booking is still caught on submit.
    return NextResponse.json({ configured: true, busy: [] }, { status: 502 });
  }
}
