"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { buttonClass } from "./ui";

// The key sounds come from the global UiSounds listener; this is just a place to type.
export default function TypewriterToy({ t }: { t: Dictionary["lab"]["typewriter"] }) {
  const [text, setText] = useState("");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={t.placeholder}
        aria-label={t.placeholder}
        rows={6}
        className="w-full resize-none rounded-lg border border-amber-100/20 bg-[#f4ecd8] p-4 font-mono text-sm leading-relaxed text-[#2a2418] placeholder-[#2a2418]/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      />
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-xs text-white/45">
          {text.length} {t.characters} · {words} {t.words}
        </p>
        <button type="button" onClick={() => setText("")} disabled={!text} className={buttonClass}>
          {t.clear}
        </button>
      </div>
      <p className="text-xs text-white/35">{t.hint}</p>
    </div>
  );
}
