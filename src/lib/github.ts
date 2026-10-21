export interface GitHubRepo {
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  topics: string[];
}

const REVALIDATE_SECONDS = 3600;
const API_URL = process.env.GITHUB_API_URL ?? "https://api.github.com";

const authHeaders = (): Record<string, string> => {
  const token = process.env.GITHUB_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** Returns null (and logs why) when the repo cannot be fetched, so callers can fall back. */
export async function fetchRepo(user: string, repo: string): Promise<GitHubRepo | null> {
  try {
    const response = await fetch(`${API_URL}/repos/${user}/${repo}`, {
      headers: authHeaders(),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      console.warn(`[github] ${user}/${repo} responded ${response.status}`);
      return null;
    }
    return (await response.json()) as GitHubRepo;
  } catch (error) {
    console.warn(`[github] ${user}/${repo} failed`, error);
    return null;
  }
}

export interface Activity {
  repo: string;
  message: string;
  date: string;
  url: string;
}

interface PushEvent {
  type: string;
  created_at: string;
  repo: { name: string };
  payload: { commits?: { message: string }[] };
}

const ACTIVITY_LIMIT = 4;

/** Latest pushes with their newest commit message. Empty when GitHub is unreachable. */
export async function fetchRecentActivity(user: string): Promise<Activity[]> {
  try {
    const response = await fetch(`${API_URL}/users/${user}/events/public?per_page=30`, {
      headers: authHeaders(),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      console.warn(`[github] ${user} events responded ${response.status}`);
      return [];
    }

    const events = (await response.json()) as PushEvent[];
    return events
      .filter((event) => event.type === "PushEvent" && (event.payload.commits?.length ?? 0) > 0)
      .slice(0, ACTIVITY_LIMIT)
      .map((event) => ({
        repo: event.repo.name.split("/").pop() ?? event.repo.name,
        message: (event.payload.commits?.at(-1)?.message ?? "").split("\n")[0],
        date: event.created_at,
        url: `https://github.com/${event.repo.name}`,
      }));
  } catch (error) {
    console.warn(`[github] ${user} events failed`, error);
    return [];
  }
}
