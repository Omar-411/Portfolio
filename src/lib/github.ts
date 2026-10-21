export interface GitHubRepo {
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  topics: string[];
}

const REVALIDATE_SECONDS = 3600;

/** Returns null (and logs why) when the repo cannot be fetched, so callers can fall back. */
export async function fetchRepo(user: string, repo: string): Promise<GitHubRepo | null> {
  const token = process.env.GITHUB_TOKEN;
  try {
    const response = await fetch(`https://api.github.com/repos/${user}/${repo}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
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
