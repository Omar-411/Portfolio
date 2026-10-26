import { SLOT_MINUTES, type BusyRange } from "./slots";

export type BookingStatus = "pending" | "confirmed" | "declined" | "invited";

export interface BookingRecord {
  id: string;
  name: string;
  email: string;
  topic: string;
  /** ISO instant of the slot start. */
  slot: string;
  createdAt: number;
  /** `invited`: a calendar invitation was sent automatically. `pending`: waiting for the owner. */
  status: BookingStatus;
}

const STATUSES: readonly BookingStatus[] = ["pending", "confirmed", "declined", "invited"];

/** A declined request frees its slot; every other status keeps it taken. */
export const holdsSlot = (status: BookingStatus): boolean => status !== "declined";

export function parseStoredBooking(raw: unknown): BookingRecord | null {
  if (typeof raw !== "string") return null;
  try {
    const data = JSON.parse(raw) as Partial<BookingRecord>;
    if (
      typeof data.id !== "string" ||
      typeof data.name !== "string" ||
      typeof data.email !== "string" ||
      typeof data.topic !== "string" ||
      typeof data.slot !== "string" ||
      Number.isNaN(Date.parse(data.slot)) ||
      typeof data.createdAt !== "number" ||
      !STATUSES.includes(data.status as BookingStatus)
    ) {
      return null;
    }
    return data as BookingRecord;
  } catch {
    return null;
  }
}

export function busyRangesOf(records: BookingRecord[]): BusyRange[] {
  return records
    .filter((record) => holdsSlot(record.status))
    .map((record) => ({
      start: record.slot,
      end: new Date(Date.parse(record.slot) + SLOT_MINUTES * 60_000).toISOString(),
    }));
}
