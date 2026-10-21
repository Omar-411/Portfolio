"use client";

import { useEffect, useRef } from "react";

/** Thin progress bar. Follows the `[data-scroll-container]` element if the page has one, else the window. */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const container = document.querySelector<HTMLElement>("[data-scroll-container]");
    const scroller = container ?? document.documentElement;
    const eventTarget: HTMLElement | Window = container ?? window;

    const update = () => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      const ratio = max > 0 ? scroller.scrollTop / max : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    };

    update();
    eventTarget.addEventListener("scroll", update, { passive: true });
    return () => eventTarget.removeEventListener("scroll", update);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[9998] h-0.5">
      <div
        ref={barRef}
        className="h-full origin-left scale-x-0 bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
      />
    </div>
  );
}
