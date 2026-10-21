"use client";

import { useEffect, useRef } from "react";

interface MatrixRainProps {
  opacity?: number;
  color?: string;
}

// Katakana block + printable ASCII
const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン" +
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>/\\|[]{}";

const FONT_SIZE = 14;
const FRAME_MS = 1000 / 30;

/** One full-screen canvas for the whole page. Paused while the tab is hidden. */
export default function MatrixRain({ opacity = 0.05, color = "#00ff6a" }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let columns: number[] = [];
    let frame = 0;
    let lastDraw = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Array.from({ length: Math.floor(canvas.width / FONT_SIZE) }, () =>
        Math.floor((-Math.random() * canvas.height) / FONT_SIZE)
      );
    };

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (document.hidden || now - lastDraw < FRAME_MS) return;
      lastDraw = now;

      ctx.fillStyle = "rgba(2, 11, 6, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FONT_SIZE}px monospace`;

      columns.forEach((row, i) => {
        const y = row * FONT_SIZE;
        ctx.fillStyle = Math.random() > 0.95 ? "#ffffff" : color;
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * FONT_SIZE, y);
        columns[i] = y > canvas.height && Math.random() > 0.975 ? 0 : row + 1;
      });
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] block"
      style={{ opacity }}
    />
  );
}
