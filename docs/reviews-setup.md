# Visitor reviews

Visitors can leave a review on the portfolio. Nothing is public until you approve it.

## How it works

1. A visitor fills in the form (name, optional role, 1 to 5 stars, 20 to 600 characters, no links).
2. The review is saved as pending in Upstash Redis and expires after 30 days if you never act on it.
3. You get an email (through your FormSubmit alias) with the review and a private link.
4. The link opens a page that shows the review with **Approve** and **Delete** buttons. Opening the link changes nothing; only the buttons do.
5. Approved reviews show on `/{en|fr}/portfolio` within a minute or two (the pages refresh every 60 seconds).

Protection: hidden honeypot field, 3 submissions per hour per visitor (the address is hashed, never stored), links in the text are refused, and no email address is collected from visitors.

## Setup

1. Create a free Redis database at [upstash.com](https://upstash.com) (or add Upstash from the Vercel Marketplace, which sets the variables for you).
2. Set in your hosting environment (and `.env.local` to try it locally):
   - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from the database's REST API tab (Vercel KV's `KV_REST_API_URL` / `KV_REST_API_TOKEN` also work).
   - `REVIEWS_ADMIN_SECRET`: run `openssl rand -hex 32`.
   - `NEXT_PUBLIC_SITE_URL`, so the emailed link points at your real domain.
   - `NEXT_PUBLIC_FORMSUBMIT_ALIAS`, an activated FormSubmit alias (the same one the booking fallback uses).
3. Redeploy. The Reviews section and navbar link appear once the three storage variables are set.

## If the email does not arrive

The review is still saved. The server log prints `[reviews] owner email failed, moderate here: <link>`; open that link to approve it. FormSubmit sometimes blocks requests that do not come from a browser; if that happens often, replace `notifyOwner` in `src/lib/review-notification.ts` with Resend, Postmark or similar.

## Removing a review later

Open its approve/delete link again (the email keeps working) and press **Delete**. Or delete the `review:<id>` key and its member of the `reviews:approved` sorted set in the Upstash console.
