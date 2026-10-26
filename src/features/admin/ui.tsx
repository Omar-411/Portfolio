export const buttonBase = "rounded-lg px-4 py-2 text-sm font-semibold transition-colors";

export function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto min-h-dvh max-w-3xl px-6 py-16">{children}</main>;
}

export function SectionHeading({ title, count }: { title: string; count: number }) {
  return (
    <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-neon-soft">
      {title} ({count})
    </h3>
  );
}
