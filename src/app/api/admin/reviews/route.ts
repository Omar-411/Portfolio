import { NextResponse } from "next/server";
import { adminPagePath, currentAdminRouting } from "@/lib/admin-path";
import { isAdmin } from "@/lib/admin-auth";
import { approveReview, isReviewsConfigured, rejectReview } from "@/lib/reviews-store";

export const dynamic = "force-dynamic";

const back = (request: Request, query = "") => NextResponse.redirect(new URL(`${adminPagePath(currentAdminRouting())}${query}`, request.url), 303);

/** Approve or delete one review. Needs the admin cookie; the cookie is SameSite=Strict, so other sites cannot trigger it. */
export async function POST(request: Request) {
  if (!isReviewsConfigured || !(await isAdmin())) return new NextResponse("Forbidden", { status: 403 });

  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  const action = String(form.get("action") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id) || (action !== "approve" && action !== "reject")) {
    return new NextResponse("Bad request", { status: 400 });
  }

  try {
    if (action === "approve") await approveReview(id);
    else await rejectReview(id);
    return back(request);
  } catch (error) {
    console.error("[reviews] admin action failed", error);
    return back(request, "?error=failed");
  }
}
