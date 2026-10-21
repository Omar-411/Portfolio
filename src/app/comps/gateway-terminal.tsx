"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface BootLine {
  text: string;
  delay: number;
  highlight?: boolean;
  isAscii?: boolean;
}

const BOOT_SEQUENCE: BootLine[] = [
  { text: "> initializing portfolio...", delay: 300 },
  { text: "> loading projects...", delay: 400 },
  { text: "> fetching skills...", delay: 350 },
  { text: "> establishing secure connection...", delay: 500 },
  { text: "> decrypting credentials...", delay: 450 },
];

export default function GatewayTerminal() {
  const router = useRouter();
  const [displayLines, setDisplayLines] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const mountedRef = useRef(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const playKeystroke = useCallback(() => {
    try {
      const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) return;
      const ctx = new AudioContextCtor();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch {
      // Silently fail if audio not available
    }
  }, []);

  const navigateToPortfolio = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    router.push("/portfolio");
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  // Boot sequence animation - runs once on mount
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    let sequenceIndex = 0;
    let charIndex = 0;
    let isTyping = false;
    let cancelled = false;

    const clearAllTimeouts = () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };

    const typeNextLine = () => {
      if (cancelled) return;
      if (sequenceIndex >= BOOT_SEQUENCE.length) {
        setIsComplete(true);
        // Auto-navigate after a brief pause
        const timeout = setTimeout(() => navigateToPortfolio(), 500);
        timeoutsRef.current.push(timeout);
        return;
      }

      const line = BOOT_SEQUENCE[sequenceIndex];
      const chars = line.text.split("");
      charIndex = 0;
      isTyping = true;

      // Add new empty line
      setDisplayLines((prev) => [...prev, ""]);

      const typeChar = () => {
        if (cancelled || !isTyping) return;
        
        if (charIndex < chars.length) {
          setDisplayLines((prev) => {
            const newLines = [...prev];
            newLines[sequenceIndex] = chars.slice(0, charIndex + 1).join("");
            return newLines;
          });
          charIndex++;
          playKeystroke();
          const delay = line.isAscii ? 15 : 30 + Math.random() * 40;
          const timeout = setTimeout(typeChar, delay);
          timeoutsRef.current.push(timeout);
        } else {
          isTyping = false;
          sequenceIndex++;
          const timeout = setTimeout(typeNextLine, line.delay);
          timeoutsRef.current.push(timeout);
        }
      };

      const initialDelay = line.isAscii ? 0 : 50;
      const timeout = setTimeout(typeChar, initialDelay);
      timeoutsRef.current.push(timeout);
    };

    typeNextLine();

    return () => {
      cancelled = true;
      clearAllTimeouts();
    };
  }, [playKeystroke]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(2, 11, 6, 0.9)" }}
    >
      <div className="relative">
        <div
          className="terminal-container"
          style={{
            width: "800px",
            height: "520px",
            maxWidth: "90vw",
            maxHeight: "90vh",
            background: "#020b06",
            border: "2px solid #00ff6a",
            borderRadius: "4px",
            boxShadow: "0 0 40px rgba(0, 255, 106, 0.3), 0 0 80px rgba(0, 255, 106, 0.1), inset 0 1px 0 rgba(0, 255, 106, 0.2)",
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#00ff6a",
            padding: "0",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Windows-style title bar */}
          <div className="terminal-titlebar flex items-center justify-between px-3 py-2" style={{
            position: "relative",
            zIndex: 10,
            background: "linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)",
            borderBottom: "1px solid #00ff6a40",
            userSelect: "none",
          }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500/70" style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)" }} />
              <div className="w-3 h-3 rounded bg-yellow-500/70" style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)" }} />
              <div className="w-3 h-3 rounded bg-green-500/70" style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)" }} />
            </div>
            <span className="text-white/60 text-xs font-mono font-bold tracking-wider" style={{ textShadow: "0 0 5px #00ff6a80" }}>
              {"C:/Users/Omar> terminal.bash"}
            </span>
            <div className="flex items-center gap-1">
              <button className="w-6 h-6 rounded hover:bg-white/10 transition-colors flex items-center justify-center" style={{ border: "1px solid transparent" }} aria-label="Minimize">
                <svg width="10" height="2" viewBox="0 0 10 2" fill="currentColor"><rect x="0" y="0" width="10" height="2" rx="1" fill="currentColor"/></svg>
              </button>
              <button className="w-6 h-6 rounded hover:bg-white/10 transition-colors flex items-center justify-center" style={{ border: "1px solid transparent" }} aria-label="Maximize">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="8" height="8" rx="1"/></svg>
              </button>
              <button className="w-6 h-6 rounded hover:bg-red-500/30 hover:border-red-500/50 transition-colors flex items-center justify-center" style={{ border: "1px solid transparent" }} aria-label="Close">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2"><line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/></svg>
              </button>
            </div>
          </div>

          {/* Scanlines overlay */}
          <div className="scanlines" style={{
            position: "absolute",
            inset: 0,
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
            pointerEvents: "none",
            opacity: 0.4,
            zIndex: 5,
          }} />

          {/* Terminal content area */}
          <div className="terminal-content flex-1 overflow-y-auto px-4 py-3" style={{ position: "relative", zIndex: 1 }}>
            <AnimatePresence mode="wait">
              {displayLines.map((line, i) => (
                <motion.div
                  key={i}
                  className={`terminal-line ${displayLines[i]?.includes("welcome to my world") ? "highlight" : ""} ${BOOT_SEQUENCE[i]?.isAscii ? "ascii-art" : ""}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontFamily: BOOT_SEQUENCE[i]?.isAscii ? "var(--font-jetbrains), monospace" : "var(--font-jetbrains), monospace",
                    color: BOOT_SEQUENCE[i]?.isAscii ? "#00c87a" : BOOT_SEQUENCE[i]?.highlight ? "#00ff6a" : "#00ff6acc",
                    fontWeight: BOOT_SEQUENCE[i]?.highlight ? 600 : 400,
                    letterSpacing: BOOT_SEQUENCE[i]?.isAscii ? "0.5px" : "normal",
                    whiteSpace: "pre",
                  }}
                >
                  {line}
                  {i === displayLines.length - 1 && !isComplete && (
                    <span className="cursor" style={{ opacity: cursorVisible ? 1 : 0 }}>█</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 2, duration: 1 }}
          className="text-center mt-3 text-xs font-mono"
          style={{ color: "#00ff6a60" }}
        >
          omar ajimi · full-stack & blockchain developer
        </motion.p>
      </div>

      <style jsx global>{`
        .terminal-line::selection {
          background: rgba(0, 255, 106, 0.3);
        }
        .cursor {
          animation: blink 1.06s steps(1) infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .ascii-art {
          font-size: 12px !important;
          line-height: 1.4 !important;
        }
      `}</style>
    </div>
  );
}