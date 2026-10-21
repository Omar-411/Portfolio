"use client";

import { useRef, useEffect } from "react";

interface MatrixRainProps {
  opacity?: number;
  color?: string;
  className?: string;
}

// Katakana block + printable ASCII
const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン" +
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>/\\|[]{}";

const FONT_SIZE = 14;

export default function MatrixRain({
  opacity = 0.03,
  color = "#00ff6a",
  className = "",
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Column state: y-position (in characters) for each column
    let columns: number[] = [];

    const initColumns = () => {
      const cols = Math.floor(canvas.width / FONT_SIZE);
      columns = Array.from({ length: cols }, () =>
        Math.floor(Math.random() * -canvas.height / FONT_SIZE)
      );
    };

    const setSize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.offsetWidth : window.innerWidth;
      canvas.height = parent ? parent.offsetHeight : window.innerHeight;
      initColumns();
    };

    setSize();

    const draw = () => {
      // Trailing fade — semi-transparent void-coloured fill
      ctx.fillStyle = "rgba(2, 11, 6, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`;

      columns.forEach((yChar, i) => {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * FONT_SIZE;
        const y = yChar * FONT_SIZE;

        // Leading character is brighter
        const isLeader = Math.random() > 0.95;
        ctx.fillStyle = isLeader ? "#ffffff" : color;
        ctx.fillText(char, x, y);

        // Reset column randomly after it passes the bottom
        if (y > canvas.height && Math.random() > 0.975) {
          columns[i] = 0;
        } else {
          columns[i] = yChar + 1;
        }
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    // Handle resize
    const observer = new ResizeObserver(() => {
      setSize();
    });

    const parent = canvas.parentElement;
    if (parent) observer.observe(parent);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ opacity, display: "block" }}
      aria-hidden="true"
    />
  );
}
