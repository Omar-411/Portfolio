"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import BookingDialog from "./booking-dialog";

interface BookingContextValue {
  /** Opens the booking dialog, or the external booking page when one is configured. */
  open: () => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking(): BookingContextValue {
  const value = useContext(BookingContext);
  if (!value) throw new Error("useBooking must be used inside <BookingProvider>");
  return value;
}

interface BookingProviderProps {
  locale: Locale;
  t: Dictionary["services"]["booking"];
  bookingUrl: string | null;
  children: React.ReactNode;
}

export default function BookingProvider({ locale, t, bookingUrl, children }: BookingProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    if (bookingUrl) window.open(bookingUrl, "_blank", "noopener,noreferrer");
    else setIsOpen(true);
  }, [bookingUrl]);

  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <BookingContext.Provider value={value}>
      {children}
      {isOpen && <BookingDialog locale={locale} t={t} onClose={close} />}
    </BookingContext.Provider>
  );
}
