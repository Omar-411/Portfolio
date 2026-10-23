"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { shouldTransition } from "./route-transition";
import { useRouteTransition } from "./transition-provider";

type TransitionLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & { href: string };

/** A normal `<Link>` (prefetch, middle-click, new tab) that plays the page wipe on a plain left click. */
export default function TransitionLink({ href, onClick, ...props }: TransitionLinkProps) {
  const pathname = usePathname();
  const { navigate } = useRouteTransition();

  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event);
        const plain =
          event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
        if (event.defaultPrevented || !plain || !shouldTransition(pathname, href)) return;
        event.preventDefault();
        navigate(href);
      }}
      {...props}
    />
  );
}
