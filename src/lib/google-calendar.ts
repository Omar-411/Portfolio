// Server-only. Thin Google Calendar client using an OAuth refresh token of the calendar owner.
const TOKEN_URL = process.env.GOOGLE_TOKEN_URL ?? "https://oauth2.googleapis.com/token";
const API_BASE = process.env.GOOGLE_API_BASE ?? "https://www.googleapis.com/calendar/v3";

export interface BusyInterval {
  start: string;
  end: string;
}

export interface NewEvent {
  summary: string;
  description: string;
  startIso: string;
  endIso: string;
  attendee: { email: string; name: string };
}

export class CalendarError extends Error {}

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";

export const isCalendarConfigured = Boolean(clientId && clientSecret && refreshToken);

let cached: { token: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.token;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId ?? "",
      client_secret: clientSecret ?? "",
      refresh_token: refreshToken ?? "",
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new CalendarError(`Google token request failed (${response.status})`);

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cached = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cached.token;
}

async function call<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new CalendarError(`Google Calendar request failed (${response.status})`);
  return (await response.json()) as T;
}

export async function getBusyIntervals(timeMin: string, timeMax: string): Promise<BusyInterval[]> {
  const data = await call<{ calendars: Record<string, { busy: BusyInterval[] }> }>("/freeBusy", {
    method: "POST",
    body: JSON.stringify({ timeMin, timeMax, items: [{ id: calendarId }] }),
  });
  return data.calendars[calendarId]?.busy ?? [];
}

/** Creates the event, adds a Meet link and lets Google email the invitation to the attendee. */
export async function createEvent(event: NewEvent): Promise<void> {
  await call(`/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`, {
    method: "POST",
    body: JSON.stringify({
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.startIso },
      end: { dateTime: event.endIso },
      attendees: [{ email: event.attendee.email, displayName: event.attendee.name }],
      conferenceData: {
        createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } },
      },
      reminders: { useDefault: true },
    }),
  });
}
