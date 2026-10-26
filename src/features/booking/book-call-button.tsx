"use client";

import { CalendarCheck } from "lucide-react";
import { useBooking } from "./booking-provider";

interface BookCallButtonProps {
  label: string;
  className?: string;
}

/** Opens the booking dialog (or the external booking page) from server-rendered UI. */
export default function BookCallButton({ label, className }: BookCallButtonProps) {
  const { open } = useBooking();

  return (
    <button type="button" onClick={open} data-magnetic className={className}>
      <CalendarCheck size={16} aria-hidden="true" />
      {label}
    </button>
  );
}
