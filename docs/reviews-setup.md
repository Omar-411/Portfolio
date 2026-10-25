# Visitor reviews

Visitors can leave a review on the portfolio. Nothing is public until you approve it.

## How it works

1. A visitor fills in the form (name, optional role, 1 to 5 stars, 20 to 600 characters, no links).
2. The review is saved as pending in Upstash Redis and expires after 30 days if you never act on it.
3. You get an email with the review and a private link (sent through Resend when `RESEND_API_KEY` is set, otherwise through FormSubmit).
4. The link opens a page that shows the review with **Approve** and **Delete** buttons. Opening the link changes nothing; only the buttons do.
5. Approved reviews show on `/{en|fr}/portfolio` within a minute or two (the pages refresh every 60 seconds).

Protection: hidden honeypot field, 3 submissions per hour per visitor (the address is hashed, never stored), links in the text are refused, and no email address is collected from visitors.

## Setup

1. Create a free Redis database at [upstash.com](https://upstash.com) (or add Upstash from the Vercel Marketplace, which sets the variables for you).
2. Set in your hosting environment (and `.env.local` to try it locally):
   - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from the database's REST API tab (Vercel KV's `KV_REST_API_URL` / `KV_REST_API_TOKEN` also work).
   - `REVIEWS_ADMIN_SECRET`: run `openssl rand -hex 32`.
   - `NEXT_PUBLIC_SITE_URL`, so the emailed link points at your real domain.
   - `RESEND_API_KEY` (recommended): create a free account at [resend.com](https://resend.com), then API Keys → Create. With the default sender the emails can only go to the address you signed up with, so use that one (or set `REVIEWS_NOTIFY_EMAIL`). To send to another address, verify a domain in Resend and set `RESEND_FROM`.
   - Without Resend, `NEXT_PUBLIC_FORMSUBMIT_ALIAS` (an activated FormSubmit alias) is tried instead, but FormSubmit often refuses server-side requests.
3. Redeploy. The Reviews section and navbar link appear once the three storage variables are set.

## If the email does not arrive

The review is still saved. The server log prints `[reviews] owner email failed, moderate here: <link>`; open that link to approve it. A line just before it says why (`Resend refused the email 403 ...` means a wrong key or an address Resend will not send to yet). If you rely on FormSubmit and nothing arrives, add `RESEND_API_KEY`.

## Removing a review later

Open its approve/delete link again (the email keeps working) and press **Delete**. Or delete the `review:<id>` key and its member of the `reviews:approved` sorted set in the Upstash console.
