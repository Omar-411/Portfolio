"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useBooking } from "@/features/booking/booking-provider";
import { rememberLocale } from "@/i18n/client";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { useRouteTransition } from "@/features/transition/transition-provider";
import { playClick, playSuccess, setMuted, unlockAudio } from "@/lib/audio";
import CommandPalette from "./command-palette";
import { runCommand, type PaletteActions } from "./commands";

interface PaletteContextValue {
  open: () => void;
}

const PaletteContext = createContext<PaletteContextValue | null>(null);

export function usePalette(): PaletteContextValue {
  const value = useContext(PaletteContext);
  if (!value) throw new Error("usePalette must be used inside <PaletteProvider>");
  return value;
}

interface PaletteProviderProps {
  locale: Locale;
  t: Dictionary["palette"];
  children: React.ReactNode;
}

export default function PaletteProvider({ locale, t, children }: PaletteProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const returnFocusTo = useRef<HTMLElement | null>(null);
  const booking = useBooking();
  const { navigate } = useRouteTransition();
  const bookAfterClose = useRef(false);

  const open = useCallback(() => {
    returnFocusTo.current = document.activeElement as HTMLElement | null;
    void unlockAudio().then(playClick);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    returnFocusTo.current?.focus?.();
    if (bookAfterClose.current) {
      bookAfterClose.current = false;
      // After the focus return, so the dialog keeps the focus it takes when it mounts.
      window.setTimeout(booking.open, 0);
    }
  }, [booking.open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((current) => {
          if (!current) returnFocusTo.current = document.activeElement as HTMLElement | null;
          return !current;
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const actions: PaletteActions = useMemo(
    () => ({
      goToSection: (id) => {
        if (pathname === `/${locale}/portfolio`) {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        } else {
          navigate(`/${locale}/portfolio#${id}`);
        }
      },
      goToPath: navigate,
      openExternal: (url) => window.open(url, "_blank", "noopener,noreferrer"),
      download: (url) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = "";
        link.click();
      },
      setLocale: (next) => {
        rememberLocale(next);
        router.push(pathname.replace(/^\/(en|fr)(?=\/|$)/, `/${next}`));
      },
      setMuted: (muted) => {
        setMuted(muted);
        if (!muted) void unlockAudio().then(playClick);
      },
      bookCall: () => {
        bookAfterClose.current = true;
        playSuccess();
      },
    }),
    [locale, navigate, pathname, router]
  );

  const value = useMemo(() => ({ open }), [open]);

  return (
    <PaletteContext.Provider value={value}>
      {children}
      {isOpen && <CommandPalette t={t} onClose={close} onRun={(input) => runCommand(input, locale, t, actions)} />}
    </PaletteContext.Provider>
  );
}
