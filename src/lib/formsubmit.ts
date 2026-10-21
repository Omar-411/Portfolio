import { profile } from "@/content/profile";

// An activated FormSubmit alias keeps the real address out of the page source.
const target = process.env.NEXT_PUBLIC_FORMSUBMIT_ALIAS ?? profile.email;
const endpoint = `https://formsubmit.co/ajax/${target}`;

/** Sends a form to the owner's inbox. Resolves to `false` on any failure. */
export async function submitForm(body: FormData, subject: string): Promise<boolean> {
  body.append("_captcha", "false");
  body.append("_subject", subject);
  body.append("_template", "table");

  try {
    const response = await fetch(endpoint, { method: "POST", body, headers: { Accept: "application/json" } });
    return response.ok;
  } catch {
    return false;
  }
}
