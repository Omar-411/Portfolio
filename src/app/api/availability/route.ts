import { NextResponse } from "next/server";
import { availabilityWindow } from "@/features/booking/slots";
import { getBusyIntervals, isCalendarConfigured } from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isCalendarConfigured) return NextResponse.json({ configured: false, busy: [] });

  try {
    const { timeMin, timeMax } = availabilityWindow();
    const busy = await getBusyIntervals(timeMin, timeMax);
    return NextResponse.json({ configured: true, busy }, { headers: { "Cache-Control": "private, max-age=30" } });
  } catch (error) {
    console.error("[booking] availability failed", error);
    // The client then shows every slot; double-booking is still caught on submit.
    return NextResponse.json({ configured: true, busy: [] }, { status: 502 });
  }
}
