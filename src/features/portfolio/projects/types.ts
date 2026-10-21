export interface ProjectCard {
  repo: string;
  title: string;
  description: string;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  topics: string[];
  /** Set when a case study exists for this project. */
  caseStudySlug: string | null;
}
