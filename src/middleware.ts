import { NextResponse, type NextRequest } from "next/server";
import { currentAdminRouting, DEFAULT_ADMIN_PATH, decideAdminRoute } from "@/lib/admin-path";

/** Serves the admin page at its private address and hides the built-in one. */
export function middleware(request: NextRequest) {
  const decision = decideAdminRoute(request.nextUrl.pathname, currentAdminRouting());

  if (decision === "rewrite") {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_ADMIN_PATH;
    return NextResponse.rewrite(url);
  }
  if (decision === "hide") return new NextResponse("Not found", { status: 404 });
  return NextResponse.next();
}

// Single-segment paths cover the private address; /admin/* covers the hidden built-in one.
export const config = { matcher: ["/admin/:path*", "/:slug"] };
