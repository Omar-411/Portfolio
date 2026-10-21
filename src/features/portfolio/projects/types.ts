export interface ProjectCard {
  repo: string;
  title: string;
  description: string;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  topics: string[];
}
