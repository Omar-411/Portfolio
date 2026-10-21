export interface FeaturedProject {
  /** GitHub repository name under the profile's user. */
  repo: string;
  title: string;
  description: string;
}

export const featuredProjects: FeaturedProject[] = [
  {
    repo: "marketplacebyomar",
    title: "Marketplace",
    description: "A full-stack marketplace platform built with TypeScript.",
  },
  {
    repo: "CV_Analyzer",
    title: "CV Analyzer",
    description: "AI-powered CV analysis tool.",
  },
  {
    repo: "Convo",
    title: "Convo",
    description: "A real-time chat application with private messaging and group support.",
  },
  {
    repo: "e-draw",
    title: "E-Draw",
    description: "A collaborative whiteboard and drawing tool.",
  },
  {
    repo: "WeGrow",
    title: "WeGrow",
    description: "A platform connecting people to grow together.",
  },
  {
    repo: "DoraHacks_Scrapper",
    title: "DoraHacks Scrapper",
    description: "Scraper for DoraHacks hackathon data.",
  },
  {
    repo: "AI_agent_Linkedin_Posts",
    title: "LinkedIn Posts Agent",
    description: "An AI agent that generates and publishes LinkedIn posts automatically.",
  },
];
