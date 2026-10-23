"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { m, useReducedMotion } from "framer-motion";
import { playScan } from "@/lib/audio";
import {
  COVER_MS,
  GIVE_UP_MS,
  REVEAL_MS,
  routeLabel,
  shouldTransition,
  targetPathname,
} from "./route-transition";

type Phase = "idle" | "cover" | "reveal";

interface TransitionContextValue {
  /** Same as `router.push`, with a terminal scan-line wipe when the page changes. */
  navigate: (href: string) => void;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function useRouteTransition(): TransitionContextValue {
  const value = useContext(TransitionContext);
  if (!value) throw new Error("useRouteTransition must be used inside <TransitionProvider>");
  return value;
}

const EASE = [0.65, 0, 0.35, 1] as const;

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState("");
  const phaseRef = useRef<Phase>("idle");
  const waitingFor = useRef<string | null>(null);
  const timers = useRef<number[]>([]);

  const enter = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const later = useCallback((callback: () => void, ms: number) => {
    timers.current.push(window.setTimeout(callback, ms));
  }, []);

  const reveal = useCallback(() => {
    if (phaseRef.current !== "cover") return;
    waitingFor.current = null;
    enter("reveal");
    later(() => enter("idle"), REVEAL_MS);
  }, [enter, later]);

  const navigate = useCallback(
    (href: string) => {
      if (reduceMotion || phaseRef.current !== "idle" || !shouldTransition(pathname, href)) {
        router.push(href);
        return;
      }
      waitingFor.current = targetPathname(href);
      setLabel(routeLabel(href));
      enter("cover");
      playScan();
      later(() => {
        router.push(href);
        later(reveal, GIVE_UP_MS);
      }, COVER_MS);
    },
    [enter, later, reduceMotion, reveal, router, pathname]
  );

  // The new page is in place: lift the cover.
  useEffect(() => {
    if (phaseRef.current === "cover" && waitingFor.current === pathname) reveal();
  }, [pathname, reveal]);

  useEffect(
    () => () => {
      for (const id of timers.current) window.clearTimeout(id);
    },
    []
  );

  const value = useMemo(() => ({ navigate }), [navigate]);
  const covering = phase === "cover";

  return (
    <TransitionContext.Provider value={value}>
      {children}
      {phase !== "idle" && (
        <div aria-hidden="true" className="fixed inset-0 z-[9500] cursor-wait overflow-hidden">
          <m.div
            key={phase}
            className="absolute inset-0 origin-top bg-[#020b06]"
            style={{
              transformOrigin: covering ? "top" : "bottom",
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0,255,106,0.045) 0 1px, transparent 1px 3px)",
            }}
            initial={{ scaleY: covering ? 0 : 1 }}
            animate={{ scaleY: covering ? 1 : 0 }}
            transition={{ duration: (covering ? COVER_MS : REVEAL_MS) / 1000, ease: EASE }}
          />
          <m.div
            key={`line-${phase}`}
            className="absolute inset-x-0 top-0 h-px bg-neon shadow-[0_0_14px_3px_rgba(0,255,106,0.7)]"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: "100vh", opacity: 1 }}
            transition={{ duration: (covering ? COVER_MS : REVEAL_MS) / 1000, ease: EASE }}
          />
          <m.p
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-mono text-sm tracking-wider text-neon"
            initial={{ opacity: covering ? 0 : 1 }}
            animate={{ opacity: covering ? 1 : 0 }}
            transition={{ duration: 0.2, delay: covering ? COVER_MS / 1000 - 0.12 : 0 }}
          >
            <span className="text-white/40">&gt; cd </span>
            {label}
            <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-neon" />
          </m.p>
        </div>
      )}
    </TransitionContext.Provider>
  );
}
