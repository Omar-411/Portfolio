import { cn } from "@/lib/utils";
import Image from "next/image";
import { ExternalLink, Github, Star } from "lucide-react";
import React from "react";
import GlitchVault from "@/components/glitchvault";

const GITHUB_USERNAME = "Omar-411";

// ✏️ Edit this list to control what appears on your portfolio.
// `title` and `description` are optional overrides — used when the GitHub repo has none.
const FEATURED_REPOS: { name: string; title?: string; description?: string }[] = [
  {
    name: "marketplacebyomar",
    title: "Marketplace",
    description: "A full-stack marketplace platform built with TypeScript.",
  },
  {
    name: "CV_Analyzer",
  },
  {
    name: "Convo",
    description: "A real-time chat application with private messaging and group support.",
  },
  {
    name: "e-draw",
    description: "A collaborative whiteboard and drawing tool.",
  },
  {
    name: "WeGrow",
    description: "A platform connecting people to grow together.",
  },
  {
    name: "DoraHacks_Scrapper",
  },
  {
    name: "AI_agent_Linkedin_Posts",
    description: "An AI agent that generates and publishes LinkedIn posts automatically.",
  },
];

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

interface RepoWithOverrides extends GitHubRepo {
  _title?: string;
  _description?: string;
}

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
            ? (r.json() as Promise<GitHubRepo>).then((repo) => ({
                ...repo,
                _title: title,
                _description: description,
              } as RepoWithOverrides))
            : null
        )
      )
    );
    return results.filter((r): r is RepoWithOverrides => r !== null);
  } catch {
    return [];
  }
}

function formatName(name: string) {
  return name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "from-blue-500/10 to-blue-700/10 text-blue-400 border-blue-400/30",
  JavaScript: "from-yellow-500/10 to-yellow-600/10 text-yellow-400 border-yellow-400/30",
  Solidity: "from-gray-500/10 to-gray-600/10 text-gray-300 border-gray-400/30",
  HTML: "from-orange-500/10 to-orange-600/10 text-orange-400 border-orange-400/30",
  Java: "from-red-500/10 to-red-600/10 text-red-400 border-red-400/30",
};

const Projects = async () => {
  const repos: RepoWithOverrides[] = await fetchRepos();

  return (
    <section
      id="projects"
      className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 relative z-10"
      aria-label="Project section"
    >
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        My{" "}
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Projects
        </span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {repos.map((repo, index) => (
          <GlitchVault
            key={repo.id}
            className={cn(
              "animate-fade-in-up w-full backdrop-blur-xl bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/10 rounded-2xl shadow-2xl shadow-cyan-500/10",
              "hover:scale-105 hover:shadow-cyan-500/25 transition-all duration-500",
              "flex flex-col"
            )}
            glitchColor="#0AF0F0"
            glitchRadius={120}
          >
            <div className="p-6 relative flex flex-col flex-grow">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent rounded-2xl" />

              {/* GitHub social preview image */}
              <div className="relative w-full h-44 mb-5 rounded-xl overflow-hidden border border-white/20 dark:border-white/10 bg-gray-900">
                <Image
                  src={`https://opengraph.githubassets.com/1/${GITHUB_USERNAME}/${repo.name}`}
                  alt={`${repo.name} preview`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={index === 0}
                />
              </div>

              <h3 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-slate-800 via-slate-700 to-cyan-700 dark:from-white dark:via-slate-100 dark:to-cyan-300 bg-clip-text text-transparent mb-2 tracking-wide relative z-10">
                {repo._title ?? formatName(repo.name)}
              </h3>

              <p className="text-slate-600/80 dark:text-slate-300/80 text-sm sm:text-base mb-5 flex-grow relative z-10 line-clamp-3">
                {repo._description ?? repo.description ?? "No description provided."}
              </p>

              {/* Tags: language + stars */}
              <div className="flex flex-wrap gap-2 mb-5 relative z-10">
                {repo.language && (
                  <span
                    className={cn(
                      "inline-block px-2 py-1 text-xs rounded-full border bg-gradient-to-r",
                      LANG_COLORS[repo.language] ??
                        "from-cyan-500/10 to-blue-500/10 text-cyan-400 border-cyan-400/30"
                    )}
                  >
                    {repo.language}
                  </span>
                )}
                {repo.stargazers_count > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-400 border-yellow-400/30">
                    <Star size={10} />
                    {repo.stargazers_count}
                  </span>
                )}
                {repo.topics?.slice(0, 2).map((topic) => (
                  <span
                    key={topic}
                    className="inline-block px-2 py-1 text-xs rounded-full border bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-400 border-purple-400/30"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex justify-center gap-4 relative z-10">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-600 dark:text-cyan-300 hover:text-cyan-700 dark:hover:text-cyan-200 transition-colors"
                  aria-label={`View ${repo.name} on GitHub`}
                >
                  <Github size={20} />
                </a>
                {repo.homepage && (
                  <a
                    href={repo.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 dark:text-cyan-300 hover:text-cyan-700 dark:hover:text-cyan-200 transition-colors"
                    aria-label={`Live demo of ${repo.name}`}
                  >
                    <ExternalLink size={20} />
                  </a>
                )}
              </div>
            </div>
          </GlitchVault>
        ))}
      </div>

      {/* Link to full GitHub profile */}
      <div className="mt-10 text-center relative z-10">
        <a
          href={`https://github.com/${GITHUB_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-cyan-400/40 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/10 transition-all duration-300 text-sm font-medium"
        >
          <Github size={16} />
          View all repositories on GitHub
        </a>
      </div>
    </section>
  );
};

export default Projects;
