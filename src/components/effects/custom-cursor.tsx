"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, [role=button], input, textarea, select, label[for], [data-cursor-hover]";

/** Dot + lagging halo. Position is written straight to the DOM, so mouse moves never re-render React. */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const halo = haloRef.current;
    if (!dot || !halo) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const root = document.documentElement;
    root.classList.add("custom-cursor");

    let x = -100;
    let y = -100;
    let frame = 0;

    const render = () => {
      frame = 0;
      const transform = `translate3d(${x}px, ${y}px, 0)`;
      dot.style.transform = transform;
      halo.style.transform = transform;
    };

    const setVisible = (visible: boolean) => {
      dot.dataset.visible = String(visible);
      halo.dataset.visible = String(visible);
    };

    const onMove = (event: MouseEvent) => {
      x = event.clientX;
      y = event.clientY;
      setVisible(true);
      if (!frame) frame = requestAnimationFrame(render);
    };

    const onOver = (event: MouseEvent) => {
      const hovering = (event.target as Element).closest(INTERACTIVE) !== null;
      halo.dataset.hover = String(hovering);
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    root.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      root.removeEventListener("mouseleave", onLeave);
      root.classList.remove("custom-cursor");
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        data-visible="false"
        className="pointer-events-none fixed left-0 top-0 z-[9999] opacity-0 mix-blend-difference transition-opacity duration-200 data-[visible=true]:opacity-100"
      >
        <div className="-ml-[5px] -mt-[5px] h-[10px] w-[10px] rounded-full bg-neon" />
      </div>
      <div
        ref={haloRef}
        aria-hidden="true"
        data-visible="false"
        data-hover="false"
        className="group pointer-events-none fixed left-0 top-0 z-[9998] opacity-0 transition-[transform,opacity] duration-150 ease-out data-[visible=true]:opacity-60 data-[visible=true]:data-[hover=true]:opacity-90"
      >
        <div className="-ml-5 -mt-5 h-10 w-10 rounded-full border-[1.5px] border-neon/50 bg-neon/[0.03] transition-all duration-200 group-data-[hover=true]:scale-[1.5] group-data-[hover=true]:border-neon group-data-[hover=true]:bg-neon/[0.08]" />
      </div>
    </>
  );
}
