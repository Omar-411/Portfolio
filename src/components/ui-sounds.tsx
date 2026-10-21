"use client";

import { useEffect } from "react";
import { playClick, playHover, playKey, unlockAudio } from "@/lib/audio";

// Buttons, links and anything that opts in with `data-sound` (e.g. project cards).
// `data-sound="off"` opts out.
const SOUND_TARGET = "a[href], button:not(:disabled), [role=button], [data-sound]";
const TEXT_FIELD = "textarea, input:not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button])";
const HOVER_MIN_INTERVAL_MS = 60;
const KEY_MIN_INTERVAL_MS = 30;

function soundTarget(element: EventTarget | null): Element | null {
  const target = (element as Element | null)?.closest?.(SOUND_TARGET) ?? null;
  return target?.getAttribute("data-sound") === "off" ? null : target;
}

/** Page-wide hover, click and typing sounds via event delegation. Renders nothing. */
export default function UiSounds() {
  useEffect(() => {
    let hovered: Element | null = null;
    let lastHover = 0;
    let lastKey = 0;

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

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      // Printable characters, Space, Backspace and Enter only (not Shift, arrows, etc.).
      if (event.key.length > 1 && event.key !== "Backspace" && event.key !== "Enter") return;

      const field = event.target as Element | null;
      if (!field?.matches?.(TEXT_FIELD) || field.getAttribute("data-sound") === "off") return;

      const now = performance.now();
      if (now - lastKey < KEY_MIN_INTERVAL_MS) return;
      lastKey = now;
      void unlockAudio().then(playKey);
    };

    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
