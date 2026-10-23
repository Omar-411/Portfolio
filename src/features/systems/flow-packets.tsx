"use client";

import { useEffect, useRef, useState } from "react";
import { packetTiming, travelShare } from "./packet-timing";

interface FlowPacketsProps {
  /** SVG path data, one per edge, drawn from source to target. */
  paths: string[];
}

function measure(d: string): number {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  return path.getTotalLength();
}

/**
 * Glowing dots travelling along the edges. They only start once the diagram scrolls into view
 * and pause again when it leaves, so an off-screen diagram costs nothing.
 */
export default function FlowPackets({ paths }: FlowPacketsProps) {
  const anchor = useRef<SVGGElement>(null);
  const [lengths, setLengths] = useState<number[] | null>(null);

  useEffect(() => {
    const svg = anchor.current?.ownerSVGElement;
    if (!svg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLengths((current) => current ?? paths.map(measure));
          svg.unpauseAnimations();
        } else {
          svg.pauseAnimations();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(svg);
    return () => observer.disconnect();
  }, [paths]);

  return (
    <g ref={anchor} aria-hidden="true">
      {lengths &&
        paths.map((d, index) => {
          const { dur, begin } = packetTiming(index, lengths[index]);
          const share = travelShare(lengths[index]);
          return (
            <g key={d} opacity={0}>
              <animate attributeName="opacity" values="0;1;1;0;0" keyTimes={`0;0.04;${share - 0.04};${share};1`} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" />
              <animateMotion
                path={d}
                dur={`${dur}s`}
                begin={`${begin}s`}
                repeatCount="indefinite"
                keyPoints={`0;1;1`}
                keyTimes={`0;${share};1`}
                calcMode="linear"
              />
              <circle r={6} className="fill-neon" opacity={0.16} />
              <circle r={2.6} className="fill-neon" style={{ filter: "drop-shadow(0 0 3px #00ff6a)" }} />
            </g>
          );
        })}
    </g>
  );
}
