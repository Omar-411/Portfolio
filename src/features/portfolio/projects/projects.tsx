import { getCaseStudyForRepo } from "@/content/case-studies";
import { featuredProjects } from "@/content/projects";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { fetchRepo } from "@/lib/github";
import ProjectCarousel from "./project-carousel";
import type { ProjectCard } from "./types";

/** Curated copy always wins; live GitHub data only adds language, stars and topics. */
async function loadProjects(locale: Locale): Promise<ProjectCard[]> {
  return Promise.all(
    featuredProjects.map(async ({ repo, title, description }): Promise<ProjectCard> => {
      const live = await fetchRepo(profile.githubUser, repo);
      return {
        repo,
        title,
        description: description[locale],
        url: live?.html_url ?? `${profile.github}/${repo}`,
        homepage: live?.homepage || null,
        language: live?.language ?? null,
        stars: live?.stargazers_count ?? 0,
        topics: live?.topics ?? [],
        caseStudySlug: getCaseStudyForRepo(repo)?.slug ?? null,
      };
    })
  );
}

interface ProjectsProps {
  locale: Locale;
  t: Dictionary["projects"];
}

export default async function Projects({ locale, t }: ProjectsProps) {
  return <ProjectCarousel projects={await loadProjects(locale)} locale={locale} t={t} />;
}
