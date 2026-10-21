"use client";

import { useState, useEffect, useRef } from "react";

export default function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Track whether we've mounted (avoids SSR mismatch)
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as Element;
      const interactive = target.closest(
        "a, button, [role=button], input, textarea, select, label[for], [data-cursor-hover]"
      );
      setIsHovering(!!interactive);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible]);

  if (!mounted.current) return null;

  const haloSize = isHovering ? 60 : 40;

  return (
    <>
      {/* ── Precise dot ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: mousePos.x,
          top: mousePos.y,
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: "#00ff6a",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 9999,
          mixBlendMode: "difference",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      />

      {/* ── Lagging halo ring ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: mousePos.x,
          top: mousePos.y,
          width: haloSize,
          height: haloSize,
          borderRadius: "50%",
          border: `1.5px solid ${isHovering ? "#00ff6a" : "rgba(0, 255, 106, 0.5)"}`,
          background: isHovering
            ? "radial-gradient(circle, rgba(0,255,106,0.08) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(0,255,106,0.03) 0%, transparent 70%)",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 9998,
          opacity: isVisible ? (isHovering ? 0.9 : 0.6) : 0,
          transition:
            "left 0.15s ease-out, top 0.15s ease-out, width 0.2s ease, height 0.2s ease, opacity 0.2s ease, border-color 0.2s ease, background 0.2s ease",
        }}
      />
    </>
  );
}
