/**
 * Where the reviews admin page lives. The code is public, so the address cannot be a secret in the
 * source: `REVIEWS_ADMIN_PATH` (e.g. "k3x9-inbox-7q2m") moves it, and `/admin/reviews` then answers 404.
 */
export type AdminRouting = { kind: "default" } | { kind: "custom"; slug: string } | { kind: "invalid" };

const SLUG = /^[A-Za-z0-9_-]{8,64}$/;
const RESERVED = new Set(["admin", "api", "en", "fr", "portfolio", "robots.txt", "sitemap.xml"]);

export const DEFAULT_ADMIN_PATH = "/admin/reviews";

/** A value that is set but unusable disables the page; falling back to the public address would expose it. */
export function adminRouting(raw: string | undefined): AdminRouting {
  const value = raw?.trim().replace(/^\/+|\/+$/g, "");
  if (!value) return { kind: "default" };
  if (!SLUG.test(value) || RESERVED.has(value.toLowerCase())) return { kind: "invalid" };
  return { kind: "custom", slug: value };
}

export function adminPagePath(routing: AdminRouting): string {
  if (routing.kind === "custom") return `/${routing.slug}`;
  return routing.kind === "default" ? DEFAULT_ADMIN_PATH : "/";
}

export type AdminRouteDecision = "pass" | "rewrite" | "hide";

const isInternalAdminPath = (pathname: string) => pathname === "/admin" || pathname.startsWith("/admin/");

export function decideAdminRoute(pathname: string, routing: AdminRouting): AdminRouteDecision {
  if (routing.kind === "default") return "pass";
  if (routing.kind === "custom" && pathname === `/${routing.slug}`) return "rewrite";
  return isInternalAdminPath(pathname) ? "hide" : "pass";
}

export const currentAdminRouting = () => adminRouting(process.env.REVIEWS_ADMIN_PATH);
