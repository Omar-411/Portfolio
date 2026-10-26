import { NextResponse } from "next/server";
import { adminPagePath, currentAdminRouting } from "@/lib/admin-path";
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, adminToken, passwordMatches } from "@/lib/admin-session";
import { hashAddress } from "@/lib/review-signature";
import { isReviewsConfigured, reviewsSecret, takeSlot } from "@/lib/reviews-store";

export const dynamic = "force-dynamic";

const LOGIN_ATTEMPTS = 8;
const LOGIN_WINDOW_SECONDS = 15 * 60;

const back = (request: Request, query = "") => NextResponse.redirect(new URL(`${adminPagePath(currentAdminRouting())}${query}`, request.url), 303);

export async function POST(request: Request) {
  if (!isReviewsConfigured || !reviewsSecret) return back(request);

  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  try {
    if (!(await takeSlot(`login:${hashAddress(address, reviewsSecret)}`, LOGIN_ATTEMPTS, LOGIN_WINDOW_SECONDS))) {
      return back(request, "?error=locked");
    }
  } catch (error) {
    console.error("[reviews] login limiter failed", error);
    return back(request, "?error=failed");
  }

  const password = String((await request.formData()).get("password") ?? "");
  if (!passwordMatches(password, reviewsSecret)) return back(request, "?error=password");

  const response = back(request);
  response.cookies.set(ADMIN_COOKIE, adminToken(reviewsSecret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_SECONDS,
  });
  return response;
}
