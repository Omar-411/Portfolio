interface DemoCardProps {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function DemoCard({ id, title, description, children }: DemoCardProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="glass-card flex flex-col gap-4 p-6">
      <header>
        <h2 id={`${id}-title`} className="font-display text-xl font-bold text-white">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-white/55">{description}</p>
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}
