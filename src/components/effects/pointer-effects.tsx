"use client";

import { useEffect } from "react";
import { pullFor, tiltFor } from "./pointer-math";

const TILT_VARS = ["--rx", "--ry", "--px", "--py", "--glow"];
const PULL_VARS = ["--mx", "--my"];

function clearVars(element: HTMLElement, names: string[]) {
  for (const name of names) element.style.removeProperty(name);
}

/**
 * Cards marked `data-tilt="<max degrees>"` lean toward the pointer with a light reflection, and
 * elements marked `data-magnetic` drift toward it. Everything is delegated from one listener and
 * written straight to CSS variables (see globals.css), so mouse moves never re-render React.
 * Not active on touch devices or with prefers-reduced-motion.
 */
export default function PointerEffects() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let pointer = { x: -1, y: -1 };
    let tilted: HTMLElement | null = null;
    const offsets = new Map<HTMLElement, { x: number; y: number }>();

    const resetAll = () => {
      if (tilted) clearVars(tilted, TILT_VARS);
      tilted = null;
      for (const element of offsets.keys()) clearVars(element, PULL_VARS);
      offsets.clear();
    };

    const update = () => {
      frame = 0;
      if (reduced.matches) return resetAll();

      // Hit-tested each frame, so a card that scrolls under a resting pointer is still the right one.
      const under = pointer.x < 0 ? null : document.elementFromPoint(pointer.x, pointer.y);
      const card = under?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (card !== tilted && tilted) clearVars(tilted, TILT_VARS);
      tilted = card;

      const magnets = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
      // Read every box first, then write, to avoid layout thrashing.
      const boxes = magnets.map((element) => {
        const box = element.getBoundingClientRect();
        const offset = offsets.get(element) ?? { x: 0, y: 0 };
        return { left: box.left - offset.x, top: box.top - offset.y, width: box.width, height: box.height };
      });
      const cardBox = card?.getBoundingClientRect();

      if (card && cardBox) {
        const max = Number(card.dataset.tilt) || 6;
        // Inputs inside a card must stay straight while someone types.
        const tilt = tiltFor(cardBox, pointer.x, pointer.y, card.matches(":focus-within") ? 0 : max);
        card.style.setProperty("--rx", `${tilt.rx.toFixed(2)}deg`);
        card.style.setProperty("--ry", `${tilt.ry.toFixed(2)}deg`);
        card.style.setProperty("--px", `${tilt.px.toFixed(1)}%`);
        card.style.setProperty("--py", `${tilt.py.toFixed(1)}%`);
        card.style.setProperty("--glow", "1");
      }

      magnets.forEach((element, index) => {
        const pull = pullFor(boxes[index], pointer.x, pointer.y);
        if (pull) {
          element.style.setProperty("--mx", `${pull.x.toFixed(1)}px`);
          element.style.setProperty("--my", `${pull.y.toFixed(1)}px`);
          offsets.set(element, pull);
        } else if (offsets.has(element)) {
          clearVars(element, PULL_VARS);
          offsets.delete(element);
        }
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer = { x: event.clientX, y: event.clientY };
      schedule();
    };

    const onLeave = () => {
      pointer = { x: -1, y: -1 };
      resetAll();
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    // Content scrolling under a resting pointer changes which card it is over.
    document.addEventListener("scroll", schedule, { capture: true, passive: true });

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("scroll", schedule, { capture: true });
      resetAll();
    };
  }, []);

  return null;
}
