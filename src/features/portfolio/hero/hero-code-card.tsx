import { Fragment, type ReactNode } from "react";
import { profile } from "@/content/profile";
import { codeCardSkills } from "@/content/skills";

const Punct = ({ children }: { children: ReactNode }) => <span className="text-white/40">{children}</span>;

const Value = ({ children }: { children: ReactNode }) => (
  <>
    <Punct>&apos;</Punct>
    <span className="text-neon">{children}</span>
    <Punct>&apos;</Punct>
  </>
);

const Indent = ({ level, children }: { level: number; children: ReactNode }) => (
  <span className="inline-block" style={{ paddingLeft: `${level * 1.25}rem` }}>
    {children}
  </span>
);

const property = (key: string, value: string): ReactNode => (
  <Indent level={1}>
    <span className="text-[#f8f8f2]">{key}: </span>
    <Value>{value}</Value>
    <Punct>,</Punct>
  </Indent>
);

function chunk<T>(items: readonly T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

interface CodeLine {
  id: string;
  node: ReactNode;
}

function buildLines(): CodeLine[] {
  const skillRows = chunk(codeCardSkills, 3);
  return [
    {
      id: "open",
      node: (
        <>
          <span className="text-[#ff79c6]">const</span> <span className="text-[#bd93f9]">coder</span>{" "}
          <span className="text-[#ff79c6]">=</span> <Punct>{"{"}</Punct>
        </>
      ),
    },
    { id: "name", node: property("name", profile.name) },
    { id: "role", node: property("role", profile.role) },
    { id: "seniority", node: property("seniority", profile.seniority) },
    { id: "location", node: property("location", profile.location) },
    {
      id: "skills-open",
      node: (
        <Indent level={1}>
          <span className="text-[#f8f8f2]">skills: </span>
          <Punct>{"["}</Punct>
        </Indent>
      ),
    },
    ...skillRows.map((row, rowIndex) => ({
      id: `skills-${row.join("-")}`,
      node: (
        <Indent level={2}>
          {row.map((skill, i) => (
            <Fragment key={skill}>
              {i > 0 && <Punct>, </Punct>}
              <Value>{skill}</Value>
            </Fragment>
          ))}
          {rowIndex < skillRows.length - 1 && <Punct>,</Punct>}
        </Indent>
      ),
    })),
    {
      id: "skills-close",
      node: (
        <Indent level={1}>
          <Punct>{"],"}</Punct>
        </Indent>
      ),
    },
    { id: "passion", node: property("passion", profile.passion) },
    { id: "close", node: <Punct>{"}"}</Punct> },
    { id: "end", node: <Punct>{";"}</Punct> },
  ];
}

export default function HeroCodeCard() {
  const lines = buildLines();

  return (
    <div className="glass-card relative overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(0,255,106,0.12)]">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex items-center gap-1 font-mono text-xs">
          <span className="flex items-center gap-1.5 rounded-t border border-b-0 border-white/10 bg-white/[0.06] px-3 py-1 text-white/70">
            <span className="inline-block h-2 w-2 rounded-sm bg-[#3178c6]" />
            coder.ts
          </span>
          <span className="px-3 py-1 text-white/25">portfolio.ts</span>
        </div>
        <span className="font-mono text-xs text-white/30">coder.ts</span>
      </div>

      <div className="flex px-4 py-4 font-mono text-sm" aria-hidden="true">
        <div className="flex shrink-0 select-none flex-col items-end pr-4 text-xs text-white/20">
          {Array.from({ length: lines.length + 1 }, (_, i) => (
            <span key={i} className="leading-[1.7]">
              {i + 1}
            </span>
          ))}
        </div>
        <code className="flex flex-col overflow-x-auto text-xs leading-[1.7] sm:text-sm">
          {lines.map(({ id, node }) => (
            <div key={id}>{node}</div>
          ))}
          <div>
            <span className="animate-blink-cursor text-neon">▋</span>
          </div>
        </code>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.025] px-4 py-1 font-mono text-[10px] text-white/20">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm bg-[#3178c6]" />
          TypeScript
        </span>
        <span>UTF-8</span>
        <span>Ln {lines.length}, Col 3</span>
      </div>
    </div>
  );
}
