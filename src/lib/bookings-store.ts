import {
  busyRangesOf,
  holdsSlot,
  parseStoredBooking,
  type BookingRecord,
  type BookingStatus,
} from "@/features/booking/booking-request";
import type { BusyRange } from "@/features/booking/slots";
import { isStoreConfigured, read, run } from "./upstash";

export { isStoreConfigured as isBookingStoreConfigured };

const RECORD_TTL_SECONDS = 90 * 24 * 60 * 60;
const indexKey = "bookings";
const recordKey = (id: string) => `booking:${id}`;
const slotKey = (iso: string) => `booking:slot:${iso}`;

/** Atomic: of two visitors picking the same slot at once, only one gets `true`. */
export async function claimSlot(iso: string, id: string): Promise<boolean> {
  const secondsAhead = Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 1000));
  return (await run<string | null>(["SET", slotKey(iso), id, "NX", "EX", secondsAhead + 24 * 60 * 60])) === "OK";
}

export const releaseSlot = (iso: string) => run(["DEL", slotKey(iso)]);

export async function saveBooking(record: BookingRecord): Promise<void> {
  await run(["SET", recordKey(record.id), JSON.stringify(record), "EX", RECORD_TTL_SECONDS]);
  await run(["ZADD", indexKey, Date.parse(record.slot), record.id]);
}

export async function findBooking(id: string): Promise<BookingRecord | null> {
  return parseStoredBooking(await run<string | null>(["GET", recordKey(id)]));
}

/** Soonest slot first. Records that expired on their own are skipped. */
export async function listBookings(): Promise<BookingRecord[]> {
  const ids = await read<string[]>(["zrange", indexKey, "0", "-1"], { fresh: true });
  if (ids.length === 0) return [];
  const stored = await read<(string | null)[]>(["mget", ...ids.map(recordKey)], { fresh: true });
  return stored.map(parseStoredBooking).filter((record): record is BookingRecord => record !== null);
}

export async function setBookingStatus(id: string, status: BookingStatus): Promise<BookingRecord | null> {
  const record = await findBooking(id);
  if (!record) return null;
  const updated = { ...record, status };
  await run(["SET", recordKey(id), JSON.stringify(updated), "KEEPTTL"]);
  if (!holdsSlot(status)) await releaseSlot(record.slot);
  return updated;
}

export async function removeBooking(id: string): Promise<void> {
  const record = await findBooking(id);
  if (record) await releaseSlot(record.slot);
  await run(["DEL", recordKey(id)]);
  await run(["ZREM", indexKey, id]);
}

/** Slots taken by saved requests, for the availability endpoint. Never throws. */
export async function listStoredBusyRanges(): Promise<BusyRange[]> {
  try {
    return busyRangesOf(await listBookings());
  } catch (error) {
    console.error("[booking] could not read saved requests", error);
    return [];
  }
}
