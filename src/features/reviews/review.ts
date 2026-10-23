export const LIMITS = {
  nameMin: 2,
  nameMax: 60,
  roleMax: 80,
  messageMin: 20,
  messageMax: 600,
} as const;

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface Review {
  id: string;
  name: string;
  /** Job title and/or company; optional, so it may be empty. */
  role: string;
  rating: Rating;
  message: string;
  createdAt: number;
}

export interface ReviewInput {
  name: string;
  role: string;
  rating: Rating;
  message: string;
}

export type ReviewField = "name" | "role" | "rating" | "message";
export type ReviewIssueCode = "required" | "short" | "long" | "link" | "invalid";

export interface ReviewIssue {
  field: ReviewField;
  code: ReviewIssueCode;
}

export type Validation = { ok: true; value: ReviewInput } | { ok: false; issues: ReviewIssue[] };

// Links are the spam vector for an open form on a public page; a review has no need for one.
const LINK_PATTERN = /(https?:\/\/|www\.|t\.me\/)/i;
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const asText = (value: unknown) => (typeof value === "string" ? value.replace(CONTROL_CHARS, "") : "");
const oneLine = (value: unknown) => asText(value).replace(/\s+/g, " ").trim();
const paragraphs = (value: unknown) =>
  asText(value)
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const isRating = (value: number): value is Rating => Number.isInteger(value) && value >= 1 && value <= 5;

/** Shared by the form (inline errors) and the API (the real check). */
export function validateReviewInput(raw: { name?: unknown; role?: unknown; rating?: unknown; message?: unknown }): Validation {
  const name = oneLine(raw.name);
  const role = oneLine(raw.role);
  const message = paragraphs(raw.message);
  const rating = typeof raw.rating === "number" ? raw.rating : Number(raw.rating);
  const issues: ReviewIssue[] = [];

  if (name.length === 0) issues.push({ field: "name", code: "required" });
  else if (name.length < LIMITS.nameMin) issues.push({ field: "name", code: "short" });
  else if (name.length > LIMITS.nameMax) issues.push({ field: "name", code: "long" });
  else if (LINK_PATTERN.test(name)) issues.push({ field: "name", code: "link" });

  if (role.length > LIMITS.roleMax) issues.push({ field: "role", code: "long" });
  else if (LINK_PATTERN.test(role)) issues.push({ field: "role", code: "link" });

  if (!isRating(rating)) issues.push({ field: "rating", code: "required" });

  if (message.length === 0) issues.push({ field: "message", code: "required" });
  else if (message.length < LIMITS.messageMin) issues.push({ field: "message", code: "short" });
  else if (message.length > LIMITS.messageMax) issues.push({ field: "message", code: "long" });
  else if (LINK_PATTERN.test(message)) issues.push({ field: "message", code: "link" });

  if (issues.length > 0 || !isRating(rating)) return { ok: false, issues };
  return { ok: true, value: { name, role, rating, message } };
}

export function toReview(input: ReviewInput, id: string, now: number): Review {
  return { id, ...input, createdAt: now };
}

/** Parses what the store returns. Anything malformed is dropped rather than shown. */
export function parseStoredReview(raw: unknown): Review | null {
  if (typeof raw !== "string") return null;
  try {
    const data = JSON.parse(raw) as Partial<Review>;
    const checked = validateReviewInput(data);
    if (!checked.ok || typeof data.id !== "string" || typeof data.createdAt !== "number") return null;
    return toReview(checked.value, data.id, data.createdAt);
  } catch {
    return null;
  }
}
