export const COVER_MS = 320;
export const REVEAL_MS = 440;
/** If the new route never reports back, lift the cover anyway. */
export const GIVE_UP_MS = 3000;

function pathnameOf(href: string): string {
  const path = href.split(/[?#]/)[0].replace(/\/+$/, "");
  return path === "" ? "/" : path;
}

/** Only in-app moves to a different page get the wipe; hash jumps and external links do not. */
export function shouldTransition(currentPath: string, href: string): boolean {
  if (!href.startsWith("/") || href.startsWith("//")) return false;
  return pathnameOf(href) !== pathnameOf(currentPath);
}

export function targetPathname(href: string): string {
  return pathnameOf(href);
}

/** `/en/projects/foo` → `~/projects/foo`: the line printed while the screen is covered. */
export function routeLabel(href: string): string {
  const segments = pathnameOf(href).split("/").filter(Boolean).slice(1);
  return `~/${segments.join("/")}`;
}
