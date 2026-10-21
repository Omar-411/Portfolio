import { featuredProjects } from "@/content/projects";
import { profile } from "@/content/profile";
import { fetchRepo } from "@/lib/github";
import ProjectCarousel from "./project-carousel";
import type { ProjectCard } from "./types";

/** Curated copy always wins; live GitHub data only adds language, stars and topics. */
async function loadProjects(): Promise<ProjectCard[]> {
  return Promise.all(
    featuredProjects.map(async ({ repo, title, description }): Promise<ProjectCard> => {
      const live = await fetchRepo(profile.githubUser, repo);
      return {
        repo,
        title,
        description,
        url: live?.html_url ?? `${profile.github}/${repo}`,
        homepage: live?.homepage || null,
        language: live?.language ?? null,
        stars: live?.stargazers_count ?? 0,
        topics: live?.topics ?? [],
      };
    })
  );
}

export default async function Projects() {
  return <ProjectCarousel projects={await loadProjects()} />;
}
