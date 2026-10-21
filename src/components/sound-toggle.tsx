"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isMuted, playClick, setMuted, unlockAudio } from "@/lib/audio";

interface SoundToggleProps {
  className?: string;
  size?: number;
}

export default function SoundToggle({ className, size = 16 }: SoundToggleProps) {
  const [muted, setMutedState] = useState(false);

  useEffect(() => setMutedState(isMuted()), []);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    // Unmuting is a user gesture, so it can also unlock audio and confirm with a click.
    if (!next) void unlockAudio().then(playClick);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? "Unmute sound" : "Mute sound"}
      aria-pressed={muted}
      data-sound="off"
      className={className}
    >
      {muted ? <VolumeX size={size} /> : <Volume2 size={size} />}
    </button>
  );
}
