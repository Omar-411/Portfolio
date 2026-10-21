import type { Localized } from "@/i18n/config";

export interface FeaturedProject {
  /** GitHub repository name under the profile's user. */
  repo: string;
  title: string;
  description: Localized<string>;
}

export const featuredProjects: FeaturedProject[] = [
  {
    repo: "marketplacebyomar",
    title: "Marketplace",
    description: {
      en: "A full-stack marketplace platform built with TypeScript.",
      fr: "Une plateforme de marketplace full-stack développée en TypeScript.",
    },
  },
  {
    repo: "CV_Analyzer",
    title: "CV Analyzer",
    description: {
      en: "AI-powered resume scanner: ATS compatibility, skill coverage and prioritized improvements.",
      fr: "Analyseur de CV par IA : compatibilité ATS, couverture des compétences et améliorations prioritaires.",
    },
  },
  {
    repo: "Convo",
    title: "Convo",
    description: {
      en: "A real-time chat application with private messaging and group support.",
      fr: "Une application de chat en temps réel avec messages privés et groupes.",
    },
  },
  {
    repo: "e-draw",
    title: "E-Draw",
    description: {
      en: "A collaborative whiteboard and drawing tool.",
      fr: "Un tableau blanc collaboratif et outil de dessin.",
    },
  },
  {
    repo: "WeGrow",
    title: "WeGrow",
    description: {
      en: "A platform connecting people to grow together.",
      fr: "Une plateforme qui connecte les gens pour progresser ensemble.",
    },
  },
  {
    repo: "DoraHacks_Scrapper",
    title: "DoraHacks Scrapper",
    description: {
      en: "Scraper for DoraHacks hackathon data.",
      fr: "Scraper de données de hackathons DoraHacks.",
    },
  },
  {
    repo: "AI_agent_Linkedin_Posts",
    title: "LinkedIn Posts Agent",
    description: {
      en: "An AI agent that generates and publishes LinkedIn posts automatically.",
      fr: "Un agent IA qui génère et publie automatiquement des posts LinkedIn.",
    },
  },
];
