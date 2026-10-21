import { Code2 } from "lucide-react";
import { profile } from "@/content/profile";

const REPO_BLOB = `${profile.github}/Portfolio/blob/main/src/features/lab`;

interface DemoCardProps {
  id: string;
  title: string;
  description: string;
  sourceFile: string;
  viewCode: string;
  children: React.ReactNode;
}

export default function DemoCard({ id, title, description, sourceFile, viewCode, children }: DemoCardProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="glass-card flex flex-col gap-4 p-6">
      <header>
        <h2 id={`${id}-title`} className="font-display text-xl font-bold text-white">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-white/55">{description}</p>
      </header>
      <div className="flex-1">{children}</div>
      <a
        href={`${REPO_BLOB}/${sourceFile}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-1.5 font-mono text-xs text-white/40 transition-colors hover:text-neon"
      >
        <Code2 size={14} aria-hidden="true" />
        {viewCode}
      </a>
    </section>
  );
}
