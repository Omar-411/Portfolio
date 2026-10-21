import ProjectCarousel, { type RepoWithOverrides } from './project-carousel';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GITHUB_USERNAME = 'Omar-411';

const FEATURED_REPOS: { name: string; title?: string; description?: string }[] = [
  {
    name: 'marketplacebyomar',
    title: 'Marketplace',
    description: 'A full-stack marketplace platform built with TypeScript.',
  },
  { name: 'CV_Analyzer' },
  {
    name: 'Convo',
    description: 'A real-time chat application with private messaging and group support.',
  },
  {
    name: 'e-draw',
    description: 'A collaborative whiteboard and drawing tool.',
  },
  {
    name: 'WeGrow',
    description: 'A platform connecting people to grow together.',
  },
  { name: 'DoraHacks_Scrapper' },
  {
    name: 'AI_agent_Linkedin_Posts',
    description: 'An AI agent that generates and publishes LinkedIn posts automatically.',
  },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  topics: string[];
}

// ---------------------------------------------------------------------------
// Fallback mock data (used when GitHub API fails)
// ---------------------------------------------------------------------------

const MOCK_REPOS: RepoWithOverrides[] = [
  {
    id: 1,
    name: 'marketplacebyomar',
    description: 'A full-stack marketplace platform built with TypeScript.',
    html_url: 'https://github.com/Omar-411/marketplacebyomar',
    homepage: null,
    language: 'TypeScript',
    stargazers_count: 12,
    fork: false,
    topics: ['marketplace', 'typescript', 'nextjs'],
    _title: 'Marketplace',
    _description: 'A full-stack marketplace platform built with TypeScript.',
  },
  {
    id: 2,
    name: 'CV_Analyzer',
    description: 'AI-powered CV analysis tool.',
    html_url: 'https://github.com/Omar-411/CV_Analyzer',
    homepage: null,
    language: 'Python',
    stargazers_count: 8,
    fork: false,
    topics: ['ai', 'cv', 'analysis'],
    _title: 'CV Analyzer',
    _description: 'AI-powered CV analysis tool.',
  },
  {
    id: 3,
    name: 'Convo',
    description: 'A real-time chat application with private messaging and group support.',
    html_url: 'https://github.com/Omar-411/Convo',
    homepage: null,
    language: 'TypeScript',
    stargazers_count: 15,
    fork: false,
    topics: ['chat', 'websocket', 'realtime'],
    _description: 'A real-time chat application with private messaging and group support.',
  },
  {
    id: 4,
    name: 'e-draw',
    description: 'A collaborative whiteboard and drawing tool.',
    html_url: 'https://github.com/Omar-411/e-draw',
    homepage: null,
    language: 'TypeScript',
    stargazers_count: 10,
    fork: false,
    topics: ['canvas', 'collaborative', 'drawing'],
    _description: 'A collaborative whiteboard and drawing tool.',
  },
  {
    id: 5,
    name: 'WeGrow',
    description: 'A platform connecting people to grow together.',
    html_url: 'https://github.com/Omar-411/WeGrow',
    homepage: null,
    language: 'JavaScript',
    stargazers_count: 5,
    fork: false,
    topics: ['social', 'growth', 'platform'],
    _description: 'A platform connecting people to grow together.',
  },
  {
    id: 6,
    name: 'DoraHacks_Scrapper',
    description: 'Scraper for DoraHacks hackathon data.',
    html_url: 'https://github.com/Omar-411/DoraHacks_Scrapper',
    homepage: null,
    language: 'Python',
    stargazers_count: 3,
    fork: false,
    topics: ['scraper', 'hackathon', 'data'],
  },
  {
    id: 7,
    name: 'AI_agent_Linkedin_Posts',
    description: 'An AI agent that generates and publishes LinkedIn posts automatically.',
    html_url: 'https://github.com/Omar-411/AI_agent_Linkedin_Posts',
    homepage: null,
    language: 'TypeScript',
    stargazers_count: 7,
    fork: false,
    topics: ['ai', 'linkedin', 'automation'],
    _description: 'An AI agent that generates and publishes LinkedIn posts automatically.',
  },
];

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchRepos(): Promise<RepoWithOverrides[]> {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const results = await Promise.all(
      FEATURED_REPOS.map(({ name, title, description }) =>
        fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${name}`, {
          headers,
          next: { revalidate: 3600 },
        }).then((r) =>
          r.ok
            ? (r.json() as Promise<GitHubRepo>).then(
                (repo) =>
                  ({
                    ...repo,
                    _title: title,
                    _description: description,
                  } as RepoWithOverrides)
              )
            : null
        )
      )
    );
    const valid = results.filter((r): r is RepoWithOverrides => r !== null);
    return valid.length > 0 ? valid : MOCK_REPOS;
  } catch {
    return MOCK_REPOS;
  }
}

// ---------------------------------------------------------------------------
// Server component (default export)
// ---------------------------------------------------------------------------

const Projects = async () => {
  const repos = await fetchRepos();
  return <ProjectCarousel repos={repos} />;
};

export default Projects;
