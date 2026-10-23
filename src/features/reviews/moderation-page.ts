import type { Review } from "./review";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

const page = (title: string, body: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${escapeHtml(title)}</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#020b06;color:#e8fff2;font:16px/1.5 system-ui,sans-serif;padding:24px}
main{width:100%;max-width:520px;border:1px solid rgba(0,255,106,.25);border-radius:16px;padding:24px;background:rgba(0,255,106,.04)}
h1{font-size:18px;margin:0 0 4px}p{margin:8px 0}.meta{color:#7fe0a8;font-size:13px}
blockquote{margin:16px 0;padding:12px 14px;border-left:3px solid #00ff6a;background:rgba(255,255,255,.04);white-space:pre-wrap;word-wrap:break-word}
form{display:flex;gap:10px;margin-top:16px}button{flex:1;padding:12px;border-radius:10px;border:0;font:600 15px system-ui;cursor:pointer}
.ok{background:#00c87a;color:#02130a}.no{background:transparent;color:#ff8a8a;border:1px solid rgba(255,138,138,.5)}
</style></head><body><main>${body}</main></body></html>`;

export function reviewPage(review: Review, id: string, signature: string, approved: boolean): string {
  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
  const field = (name: string, value: string) => `<input type="hidden" name="${name}" value="${escapeHtml(value)}">`;
  return page(
    "Moderate review",
    `<h1>${escapeHtml(review.name)}${review.role ? ` · ${escapeHtml(review.role)}` : ""}</h1>
<p class="meta">${stars} · ${approved ? "currently public" : "waiting for approval"}</p>
<blockquote>${escapeHtml(review.message)}</blockquote>
<form method="post">${field("id", id)}${field("sig", signature)}
<button class="ok" name="action" value="approve">${approved ? "Keep public" : "Approve"}</button>
<button class="no" name="action" value="reject">Delete</button></form>`
  );
}

export const messagePage = (title: string, text: string) =>
  page(title, `<h1>${escapeHtml(title)}</h1><p>${escapeHtml(text)}</p>`);
