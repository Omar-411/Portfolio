"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { complete, welcomeLines, type CommandResult } from "./commands";

interface Line {
  id: number;
  kind: "input" | "output";
  text: string;
}

interface CommandPaletteProps {
  t: Dictionary["palette"];
  onRun: (input: string) => CommandResult;
  onClose: () => void;
}

export default function CommandPalette({ t, onRun, onClose }: CommandPaletteProps) {
  const [lines, setLines] = useState<Line[]>(() =>
    welcomeLines(t).map((text, id) => ({ id, kind: "output", text }))
  );
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(100);
  const closeTimer = useRef<number>(0);

  useEffect(() => {
    inputRef.current?.focus();
    return () => window.clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  const append = (kind: Line["kind"], texts: string[]) =>
    setLines((current) => [...current, ...texts.map((text) => ({ id: nextId.current++, kind, text }))]);

  const submit = () => {
    const input = value.trim();
    setValue("");
    setHistoryIndex(null);
    if (!input) return;

    setHistory((current) => [...current, input]);
    const result = onRun(input);

    if (result.clear) {
      setLines([]);
    } else {
      append("input", [input]);
      if (result.lines.length > 0) append("output", result.lines);
    }
    if (result.closeAfterMs !== undefined) {
      closeTimer.current = window.setTimeout(onClose, result.closeAfterMs);
    }
  };

  const browseHistory = (direction: -1 | 1) => {
    if (history.length === 0) return;
    const base = historyIndex ?? history.length;
    const next = Math.max(0, Math.min(history.length, base + direction));
    setHistoryIndex(next === history.length ? null : next);
    setValue(next === history.length ? "" : history[next]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "Enter":
        event.preventDefault();
        submit();
        break;
      case "Escape":
        event.preventDefault();
        onClose();
        break;
      case "Tab": {
        event.preventDefault();
        const match = complete(value);
        if (match) setValue(match);
        break;
      }
      case "ArrowUp":
        event.preventDefault();
        browseHistory(-1);
        break;
      case "ArrowDown":
        event.preventDefault();
        browseHistory(1);
        break;
      case "l":
        if (event.ctrlKey) {
          event.preventDefault();
          setLines([]);
        }
        break;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-start justify-center bg-void/80 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.title}
        className="flex max-h-[70dvh] w-full max-w-2xl flex-col overflow-hidden rounded-md border-2 border-neon bg-void font-code text-sm text-neon shadow-[0_0_40px_rgba(0,255,106,0.3),0_0_80px_rgba(0,255,106,0.1)]"
      >
        <div
          className="flex select-none items-center justify-between border-b border-neon/25 px-3 py-2"
          style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)" }}
        >
          <span className="text-xs font-bold tracking-wider text-white/60">{`omar@portfolio: ~ ${t.title}`}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeLabel}
            className="rounded p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 leading-relaxed" aria-live="polite">
          {lines.map((line) => (
            <p key={line.id} className={line.kind === "input" ? "text-white" : "whitespace-pre-wrap text-neon/90"}>
              {line.kind === "input" ? `> ${line.text}` : line.text}
            </p>
          ))}
        </div>

        <label className="flex items-center gap-2 border-t border-neon/25 px-4 py-3">
          <span aria-hidden="true">&gt;</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full bg-transparent text-white placeholder:text-white/30 focus:outline-none"
          />
        </label>
        <p className="border-t border-neon/10 px-4 py-1.5 text-[11px] text-neon/40">{t.hint}</p>
      </div>
    </div>
  );
}
