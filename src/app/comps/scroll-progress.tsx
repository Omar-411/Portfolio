"use client";

import { useState, useEffect } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Scroll lives on <main>, not window
    const getMain = () => document.querySelector("main") as HTMLElement | null;

    const handleScroll = () => {
      const main = getMain();
      if (!main) return;
      const scrollTop = main.scrollTop;
      const maxScroll = main.scrollHeight - main.clientHeight;
      const pct = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
    };

    // Poll for main to exist (it mounts after this component)
    const attach = () => {
      const main = getMain();
      if (!main) {
        setTimeout(attach, 100);
        return;
      }
      main.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
    };

    attach();

    return () => {
      const main = getMain();
      if (main) main.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 9998,
        background: "transparent",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(to right, #34d399, #2dd4bf)",
          transition: "width 100ms linear",
          boxShadow: "0 0 8px rgba(52, 211, 153, 0.6)",
        }}
      />
    </div>
  );
}
