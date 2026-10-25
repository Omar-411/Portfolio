import { cookies } from "next/headers";
import { ADMIN_COOKIE, isValidAdminToken } from "./admin-session";
import { reviewsSecret } from "./reviews-store";

/** True when the request carries a valid admin cookie (set by `/api/admin/login`). */
export async function isAdmin(): Promise<boolean> {
  if (!reviewsSecret) return false;
  return isValidAdminToken((await cookies()).get(ADMIN_COOKIE)?.value, reviewsSecret);
}
