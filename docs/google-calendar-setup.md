# Real calendar invitations for "Book a call"

Without this setup, a booking is sent to your inbox as a request (FormSubmit). With it, each booking creates a Google Calendar event on your calendar, adds a Meet link, and Google emails the invitation to the visitor. Slots already busy in your calendar disappear from the dialog.

## One-time setup (about 10 minutes)

1. Go to <https://console.cloud.google.com>, create a project, and enable **Google Calendar API**.
2. **OAuth consent screen**: user type External, add your Gmail as a test user. Then click **Publish app** (status "In production"). Skip this and the token below expires after 7 days. The "unverified app" warning only affects you.
3. **Credentials → Create credentials → OAuth client ID → Web application**. Add the authorized redirect URI `https://developers.google.com/oauthplayground`. Copy the client ID and secret.
4. Open <https://developers.google.com/oauthplayground>, click the gear icon, tick **Use your own OAuth credentials**, and paste the ID and secret.
5. In Step 1 enter the scope `https://www.googleapis.com/auth/calendar.events`, click **Authorize APIs**, sign in with the Google account whose calendar should receive bookings.
6. In Step 2 click **Exchange authorization code for tokens** and copy the **refresh token**.
7. Set these environment variables locally (`.env.local`) and on your host (for example Vercel → Settings → Environment Variables), then redeploy:

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_CALENDAR_ID=primary
```

Never commit these values. They give access to your calendar.

## Behavior

- Slots: Mon–Fri 10:00, 11:00, 14:00, 15:00, 16:00 Tunis time, 30 minutes each (`src/features/booking/slots.ts`).
- The server re-checks availability on submit and answers "slot just taken" if someone booked it first.
- If the Google variables are missing, or the host has no server (static export), the dialog falls back to the email request.
