import type { Localized } from "@/i18n/config";

/**
 * Case studies for featured projects. Only add facts you can stand behind: any optional
 * section left out is hidden on the page. Language, stars and topics come live from GitHub.
 */
export interface CaseStudy {
  slug: string;
  /** Must match a `repo` in `content/projects.ts`. */
  repo: string;
  title: string;
  summary: Localized<string>;
  highlights?: Localized<string[]>;
  problem?: Localized<string>;
  approach?: Localized<string>;
  results?: Localized<string[]>;
  stack?: string[];
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "cv-analyzer",
    repo: "CV_Analyzer",
    title: "CV Analyzer",
    summary: {
      en: "An AI-powered resume scanner that tells candidates how well their CV will perform before a recruiter or an applicant tracking system reads it.",
      fr: "Un analyseur de CV par IA qui indique aux candidats comment leur CV sera perçu avant qu'un recruteur ou un système de suivi des candidatures ne le lise.",
    },
    highlights: {
      en: [
        "ATS compatibility check",
        "Skill coverage percentage",
        "Cross-role analysis",
        "Prioritized improvement suggestions",
      ],
      fr: [
        "Vérification de la compatibilité ATS",
        "Pourcentage de couverture des compétences",
        "Analyse transversale entre rôles",
        "Suggestions d'amélioration priorisées",
      ],
    },
  },
  {
    slug: "convo",
    repo: "Convo",
    title: "Convo",
    summary: {
      en: "A real-time chat application with private conversations and group chats.",
      fr: "Une application de chat en temps réel avec conversations privées et discussions de groupe.",
    },
    highlights: {
      en: ["Real-time messaging", "Private one-to-one conversations", "Group chats"],
      fr: ["Messagerie en temps réel", "Conversations privées en tête-à-tête", "Discussions de groupe"],
    },
  },
  {
    slug: "marketplace",
    repo: "marketplacebyomar",
    title: "Marketplace",
    summary: {
      en: "A full-stack marketplace platform built with TypeScript.",
      fr: "Une plateforme de marketplace full-stack développée en TypeScript.",
    },
  },
];

export const getCaseStudy = (slug: string) => caseStudies.find((study) => study.slug === slug);
export const getCaseStudyForRepo = (repo: string) => caseStudies.find((study) => study.repo === repo);
