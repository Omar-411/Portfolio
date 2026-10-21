/** Availability is defined in Tunis time (UTC+1, no daylight saving). */
const TUNIS_UTC_OFFSET_HOURS = 1;
const SLOT_HOURS_TUNIS = [10, 11, 14, 15, 16] as const;
const BOOKABLE_DAYS = 10;
const MIN_NOTICE_HOURS = 12;
export const SLOT_MINUTES = 30;

export interface Slot {
  /** ISO instant, used as a stable key. */
  iso: string;
  hourTunis: number;
}

export interface BookableDay {
  /** yyyy-mm-dd of the Tunis calendar day. */
  key: string;
  slots: Slot[];
}

const pad = (n: number) => String(n).padStart(2, "0");

function isWeekday(utcDate: Date): boolean {
  const day = utcDate.getUTCDay();
  return day !== 0 && day !== 6;
}

export function upcomingDays(now: Date = new Date()): BookableDay[] {
  const earliest = now.getTime() + MIN_NOTICE_HOURS * 3_600_000;
  const days: BookableDay[] = [];
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  while (days.length < BOOKABLE_DAYS) {
    if (isWeekday(cursor)) {
      const slots = SLOT_HOURS_TUNIS.map((hourTunis) => ({
        hourTunis,
        iso: new Date(
          Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate(), hourTunis - TUNIS_UTC_OFFSET_HOURS)
        ).toISOString(),
      })).filter((slot) => Date.parse(slot.iso) >= earliest);

      if (slots.length > 0) {
        days.push({ key: `${cursor.getUTCFullYear()}-${pad(cursor.getUTCMonth() + 1)}-${pad(cursor.getUTCDate())}`, slots });
      }
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export const formatDay = (key: string, locale: string): string =>
  new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(`${key}T12:00:00Z`)
  );

export const formatTime = (iso: string, locale: string, timeZone?: string): string =>
  new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone }).format(new Date(iso));

export const formatFull = (iso: string, locale: string, timeZone?: string): string =>
  new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(new Date(iso));

export interface BusyRange {
  start: string;
  end: string;
}

export function isBookableSlot(iso: string, now: Date = new Date()): boolean {
  return upcomingDays(now).some((day) => day.slots.some((slot) => slot.iso === iso));
}

export function isSlotBusy(iso: string, busy: BusyRange[]): boolean {
  const start = Date.parse(iso);
  const end = start + SLOT_MINUTES * 60_000;
  return busy.some((range) => Date.parse(range.start) < end && Date.parse(range.end) > start);
}

/** Window to query for availability: covers every bookable slot. */
export function availabilityWindow(now: Date = new Date()): { timeMin: string; timeMax: string } {
  const days = upcomingDays(now);
  const lastDay = days[days.length - 1];
  const last = lastDay.slots[lastDay.slots.length - 1];
  return { timeMin: now.toISOString(), timeMax: new Date(Date.parse(last.iso) + SLOT_MINUTES * 60_000).toISOString() };
}
