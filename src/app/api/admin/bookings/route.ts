import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { adminPagePath, currentAdminRouting } from "@/lib/admin-path";
import { isBookingStoreConfigured, removeBooking, setBookingStatus } from "@/lib/bookings-store";

export const dynamic = "force-dynamic";

const ACTIONS = { confirm: "confirmed", decline: "declined" } as const;

const back = (request: Request, query = "") => NextResponse.redirect(new URL(`${adminPagePath(currentAdminRouting())}${query}`, request.url), 303);

/** Confirm, decline or delete one call request. Needs the admin cookie (SameSite=Strict). */
export async function POST(request: Request) {
  if (!isBookingStoreConfigured || !(await isAdmin())) return new NextResponse("Forbidden", { status: 403 });

  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  const action = String(form.get("action") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id) || (action !== "remove" && !(action in ACTIONS))) {
    return new NextResponse("Bad request", { status: 400 });
  }

  try {
    if (action === "remove") await removeBooking(id);
    else await setBookingStatus(id, ACTIONS[action as keyof typeof ACTIONS]);
    return back(request);
  } catch (error) {
    console.error("[booking] admin action failed", error);
    return back(request, "?error=failed");
  }
}
