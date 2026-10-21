"use client";

import { useEffect } from "react";
import { playClick, playHover, unlockAudio } from "@/lib/audio";

// Buttons, links and anything that opts in with `data-sound` (e.g. project cards).
// `data-sound="off"` opts out.
const SOUND_TARGET = "a[href], button:not(:disabled), [role=button], [data-sound]";
const HOVER_MIN_INTERVAL_MS = 60;

function soundTarget(element: EventTarget | null): Element | null {
  const target = (element as Element | null)?.closest?.(SOUND_TARGET) ?? null;
  return target?.getAttribute("data-sound") === "off" ? null : target;
}

/** Page-wide hover and click sounds via event delegation. Renders nothing. */
export default function UiSounds() {
  useEffect(() => {
    let hovered: Element | null = null;
    let lastHover = 0;

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const target = soundTarget(event.target);
      if (target === hovered) return;
      hovered = target;

      const now = performance.now();
      if (target && now - lastHover > HOVER_MIN_INTERVAL_MS) {
        lastHover = now;
        playHover();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      // The first gesture on the page also unlocks audio (needed on direct visits).
      const target = soundTarget(event.target);
      void unlockAudio().then(() => {
        if (target) playClick();
      });
    };

    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return null;
}
