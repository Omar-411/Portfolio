"use client";

import { useState, useEffect } from "react";

interface AuroraBackgroundProps {
  section?: "hero" | "projects" | "contact";
  className?: string;
}

interface BlobConfig {
  width: number;
  height: number;
  top: string;
  left: string;
  color: string;
  blur: number;
  animClass: string;
  parallaxFactor: number;
}

const SECTION_BLOBS: Record<string, BlobConfig[]> = {
  hero: [
    {
      width: 680,
      height: 680,
      top: "10%",
      left: "60%",
      color: "rgba(0, 80, 40, 0.5)",
      blur: 150,
      animClass: "animate-aurora-1",
      parallaxFactor: 1,
    },
    {
      width: 520,
      height: 520,
      top: "55%",
      left: "10%",
      color: "rgba(0, 50, 60, 0.4)",
      blur: 120,
      animClass: "animate-aurora-2",
      parallaxFactor: -0.8,
    },
    {
      width: 400,
      height: 400,
      top: "30%",
      left: "35%",
      color: "rgba(0, 100, 50, 0.3)",
      blur: 130,
      animClass: "animate-aurora-3",
      parallaxFactor: 0.5,
    },
  ],
  projects: [
    {
      width: 600,
      height: 500,
      top: "5%",
      left: "70%",
      color: "rgba(0, 60, 30, 0.45)",
      blur: 140,
      animClass: "animate-aurora-2",
      parallaxFactor: 0.9,
    },
    {
      width: 480,
      height: 480,
      top: "60%",
      left: "5%",
      color: "rgba(0, 40, 50, 0.35)",
      blur: 120,
      animClass: "animate-aurora-1",
      parallaxFactor: -0.7,
    },
    {
      width: 360,
      height: 360,
      top: "40%",
      left: "40%",
      color: "rgba(0, 80, 40, 0.25)",
      blur: 110,
      animClass: "animate-aurora-3",
      parallaxFactor: 0.4,
    },
  ],
  contact: [
    {
      width: 700,
      height: 700,
      top: "50%",
      left: "50%",
      color: "rgba(0, 90, 45, 0.45)",
      blur: 160,
      animClass: "animate-aurora-1",
      parallaxFactor: 0.6,
    },
    {
      width: 300,
      height: 300,
      top: "10%",
      left: "5%",
      color: "rgba(0, 50, 60, 0.3)",
      blur: 100,
      animClass: "animate-aurora-2",
      parallaxFactor: -1,
    },
    {
      width: 280,
      height: 280,
      top: "70%",
      left: "80%",
      color: "rgba(0, 70, 35, 0.35)",
      blur: 100,
      animClass: "animate-aurora-3",
      parallaxFactor: 0.8,
    },
  ],
};

export default function AuroraBackground({
  section = "hero",
  className = "",
}: AuroraBackgroundProps) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalise to range [-1, 1] from window centre
      const x = (e.clientX - window.innerWidth / 2) / 20;
      const y = (e.clientY - window.innerHeight / 2) / 20;
      setMouse({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const blobs = SECTION_BLOBS[section];

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ backgroundColor: "#020b06", zIndex: 0 }}
    >
      {blobs.map((blob, i) => (
        <div
          key={i}
          className={blob.animClass}
          style={{
            position: "absolute",
            width: blob.width,
            height: blob.height,
            top: blob.top,
            left: blob.left,
            borderRadius: "50%",
            backgroundColor: blob.color,
            filter: `blur(${blob.blur}px)`,
            transform: `translate(
              calc(-50% + ${mouse.x * blob.parallaxFactor}px),
              calc(-50% + ${mouse.y * blob.parallaxFactor}px)
            )`,
            willChange: "transform",
            transition: "transform 0.1s linear",
          }}
        />
      ))}
    </div>
  );
}
