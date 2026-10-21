import { GitCommitHorizontal } from "lucide-react";
import type { Activity } from "@/lib/github";
import type { Locale } from "@/i18n/config";

interface NowActivityProps {
  title: string;
  locale: Locale;
  activity: Activity[];
}

export default function NowActivity({ title, locale, activity }: NowActivityProps) {
  if (activity.length === 0) return null;
  // Fixed to UTC so the server render and the browser agree on the day.
  const formatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" });

  return (
    <div className="glass-card mx-auto mt-6 max-w-3xl p-5">
      <h3 className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neon-soft">
        <span className="h-2 w-2 animate-pulse rounded-full bg-neon" aria-hidden="true" />
        {title}
      </h3>
      <ul className="flex flex-col gap-2 text-sm">
        {activity.map((item) => (
          <li key={`${item.url}-${item.date}`} className="flex items-baseline gap-3">
            <GitCommitHorizontal size={14} className="shrink-0 translate-y-0.5 text-white/30" aria-hidden="true" />
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0 font-mono text-neon hover:underline">
              {item.repo}
            </a>
            <span className="min-w-0 flex-1 truncate text-white/60">{item.message}</span>
            <time dateTime={item.date} className="shrink-0 font-mono text-xs text-white/35">
              {formatter.format(new Date(item.date))}
            </time>
          </li>
        ))}
      </ul>
    </div>
  );
}
