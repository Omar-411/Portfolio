# SEO checklist

What the code already does: unique title and description per page and language, a canonical URL and `hreflang` links (`src/lib/seo.ts`), `sitemap.xml`, `robots.txt`, a social preview image, and schema.org `Person` + `WebSite` data on the portfolio. The `/` intro page points search engines at `/en/portfolio`. The site URL comes from `NEXT_PUBLIC_SITE_URL`, or from Vercel's production host when that is not set.

What only you can do (this is what actually gets you ranked):

1. **Google Search Console** (search.google.com/search-console): add the site as a "URL prefix" property, verify it (on a `*.vercel.app` address use the **URL prefix** type and the **HTML tag** method, since DNS verification needs a domain you own: set `GOOGLE_SITE_VERIFICATION` to the `content` value of the tag in Vercel and redeploy), open Sitemaps and submit `sitemap.xml`, then use URL Inspection → Request indexing on `/en/portfolio`. Do the same in Bing Webmaster Tools.
2. **Backlinks**: put the site URL in your GitHub profile ("Website"), the GitHub repo's About box, your LinkedIn profile (Contact info → Website) and the post, your CV (already there), and any other profile you own. Links from established sites are the strongest signal for a personal site.
3. **Custom domain**: a name-based domain such as `omarajimi.dev` ranks and reads better than `*.vercel.app`. If you switch, set `NEXT_PUBLIC_SITE_URL` to it and add a redirect from the old host.
4. **Be consistent**: use the same name, "Omar Ajimi", everywhere (LinkedIn headline, GitHub bio, résumé, the site).
5. Give it time: a new site usually takes days to weeks to appear, and ranking first for a name query is realistic, while ranking first for "full stack developer" is not.
