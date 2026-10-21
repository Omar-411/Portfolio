"use client";

import { useEffect, useRef } from "react";

/** Thin progress bar for the page's scroll container (<main>). */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const main = document.querySelector("main");
    const bar = barRef.current;
    if (!main || !bar) return;

    const update = () => {
      const max = main.scrollHeight - main.clientHeight;
      const ratio = max > 0 ? main.scrollTop / max : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    };

    update();
    main.addEventListener("scroll", update, { passive: true });
    return () => main.removeEventListener("scroll", update);
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
