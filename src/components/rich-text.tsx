import { Fragment } from "react";

/** Renders `code` and **bold** spans from plain strings. No HTML is ever injected. */
export default function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`")) {
          return (
            <code key={i} className="rounded bg-white/10 px-1.5 py-0.5 font-code text-[0.9em] text-neon">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
