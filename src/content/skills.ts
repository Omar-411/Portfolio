export interface Skill {
  name: string;
  level: number;
}

export interface SkillCategory {
  title: string;
  icon: string;
  color: string;
  skills: Skill[];
}

export const heroSkills = [
  "TypeScript", "React", "Node.js", "MongoDB", "Express", "Solidity",
  "Web3", "Docker", "WebSocket", "Next.js", "Tailwind", "Git",
] as const;

export const codeCardSkills = [
  "React", "Node.js", "Solidity", "Web3", "TypeScript", "Docker",
] as const;

export const skillCategories: SkillCategory[] = [
  {
    title: "Frontend",
    icon: "⚛️",
    color: "#00ff6a",
    skills: [
      { name: "React / Next.js", level: 95 },
      { name: "TypeScript", level: 90 },
      { name: "Tailwind CSS", level: 90 },
      { name: "Framer Motion", level: 85 },
      { name: "HTML5 / CSS3", level: 95 },
    ],
  },
  {
    title: "Backend",
    icon: "🔧",
    color: "#00c87a",
    skills: [
      { name: "Node.js / Express", level: 90 },
      { name: "MongoDB / PostgreSQL", level: 85 },
      { name: "REST APIs / GraphQL", level: 85 },
      { name: "Docker", level: 80 },
      { name: "WebSockets", level: 80 },
    ],
  },
  {
    title: "Blockchain",
    icon: "⛓️",
    color: "#00a860",
    skills: [
      { name: "Solidity", level: 85 },
      { name: "Web3.js / Ethers.js", level: 85 },
      { name: "Smart Contracts", level: 80 },
      { name: "DeFi Protocols", level: 75 },
      { name: "Hardhat / Foundry", level: 80 },
    ],
  },
  {
    title: "Tools & Others",
    icon: "🛠️",
    color: "#00ff6a",
    skills: [
      { name: "Git / GitHub", level: 95 },
      { name: "CI/CD (GitHub Actions)", level: 80 },
      { name: "Testing (Jest, Vitest)", level: 75 },
      { name: "Linux / Bash", level: 80 },
      { name: "Figma / Design Systems", level: 70 },
    ],
  },
];
