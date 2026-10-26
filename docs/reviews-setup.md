# Visitor reviews and call requests (admin)

Visitors can leave a review on the portfolio. Nothing is public until you approve it.

## How it works

1. A visitor fills in the form (name, optional role, 1 to 5 stars, 20 to 600 characters, no links).
2. The review is saved as pending in Upstash Redis and expires after 30 days if you never act on it.
3. You moderate it on the admin page of your own site (at `/admin/reviews`, or at your private address, see below): log in with your `REVIEWS_ADMIN_SECRET`, then press **Approve** or **Delete** next to each review. The page also lists the public reviews so you can delete one later.
4. Optionally you also get an email with the review and a private approve/delete link (sent through Resend when `RESEND_API_KEY` is set, otherwise through FormSubmit, which often refuses server requests). The admin page works without any email setup.
5. Approved reviews show on `/{en|fr}/portfolio` within a minute or two (the pages refresh every 60 seconds).

Admin login: the password is `REVIEWS_ADMIN_SECRET`. The browser only keeps a signed, httpOnly, same-site cookie (7 days), never the password, and login is locked after 8 wrong attempts per 15 minutes. `/admin` and `/api/` are excluded in `robots.txt` and the page is `noindex`.

Protection against spam: hidden honeypot field, 3 submissions per hour per visitor (the address is hashed, never stored), links in the text are refused, and no email address is collected from visitors.

## Keep the admin address private

The repository is public, so the default address `/admin/reviews` is known. Set `REVIEWS_ADMIN_PATH` to something only you know, for example `k3x9-inbox-7q2m` (8 to 64 letters, digits, `-` or `_`; not `admin`, `api`, `en`, `fr`). The page is then at `https://your-site/k3x9-inbox-7q2m` and `/admin/reviews` answers 404. If the value is set but not valid, the page is switched off entirely instead of falling back to the public address. The address is read at runtime, so changing it needs a restart or redeploy, not a rebuild. The password is still required on top of the hidden address.

## Setup

1. Create a free Redis database at [upstash.com](https://upstash.com) (or add Upstash from the Vercel Marketplace, which sets the variables for you).
2. Set in your hosting environment (and `.env.local` to try it locally):
   - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from the database's REST API tab (Vercel KV's `KV_REST_API_URL` / `KV_REST_API_TOKEN` also work).
   - `REVIEWS_ADMIN_SECRET`: run `openssl rand -hex 32`.
   - `REVIEWS_ADMIN_PATH`: your private admin address (see above).
   - `NEXT_PUBLIC_SITE_URL`, so the emailed link points at your real domain.
   - `RESEND_API_KEY` (optional, for an email when a review arrives): create a free account at [resend.com](https://resend.com), then API Keys → Create. With the default sender the emails can only go to the address you signed up with, so use that one (or set `REVIEWS_NOTIFY_EMAIL`). To send to another address, verify a domain in Resend and set `RESEND_FROM`.
   - Without Resend, `NEXT_PUBLIC_FORMSUBMIT_ALIAS` (an activated FormSubmit alias) is tried instead, but FormSubmit often refuses server-side requests.
3. Redeploy. The Reviews section and navbar link appear once the three storage variables are set.

## If the email does not arrive

Nothing is lost: every review waits on `/admin/reviews`. The server log also prints `[reviews] owner email not sent ...` with the reason on the line before it (for example `Resend refused the email 403 ...`).

## Removing a review later

Open the admin page, find it under "Public" and press **Delete**.

# Call requests in the admin page

The "Book a call" dialog also reports to the admin page, so you do not need Google Calendar to receive requests.

- **Storage only (Upstash configured, no `GOOGLE_*`)**: the visitor picks a slot and sends name, email and topic. The request is saved as `pending` and appears under **Call requests** on the admin page. Press **Reply** (opens your mail app with a prefilled message to the visitor), **Confirm** (marks it confirmed), **Decline** (frees the slot) or **Delete**.
- **Storage and Google Calendar**: the calendar invitation is still sent automatically (status "Invite sent"), and the request is also listed here as a record.
- **Neither**: the dialog falls back to an email request (FormSubmit), as before.

A slot is claimed atomically (`SET NX`), so two visitors cannot take the same time; a declined or deleted request releases it. Requests are removed from the store after 90 days. Visitors are limited to 5 requests per hour (address hashed, never stored). Slots, notice period and time zone are the ones in `src/features/booking/slots.ts` (Tunis time).
