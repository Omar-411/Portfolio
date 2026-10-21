"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";

/** Loads only the animation features we use and respects prefers-reduced-motion. */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
