import { NextResponse } from "next/server";
import { adminPagePath, currentAdminRouting } from "@/lib/admin-path";
import { ADMIN_COOKIE } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL(adminPagePath(currentAdminRouting()), request.url), 303);
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
