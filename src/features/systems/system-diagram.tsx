import type { NodeKind, SystemDesign } from "@/content/systems";
import type { Locale } from "@/i18n/config";
import FlowPackets from "./flow-packets";
import { layoutDiagram, NODE_HEIGHT, NODE_WIDTH, wrapLabel } from "./layout";

const KIND_CLASS: Record<NodeKind, string> = {
  client: "stroke-sky-400/60",
  service: "stroke-emerald-400/70",
  data: "stroke-amber-300/60",
  external: "stroke-white/35",
};

const LINE_HEIGHT = 13;
const SUB_GAP = 12;

function renderText(label: string, sub: string | undefined, x: number, y: number) {
  const lines = wrapLabel(label);
  const blockHeight = lines.length * LINE_HEIGHT + (sub ? SUB_GAP : 0);
  const firstBaseline = y + (NODE_HEIGHT - blockHeight) / 2 + 10;
  const cx = x + NODE_WIDTH / 2;

  return (
    <>
      {lines.map((line, i) => (
        <text key={line} x={cx} y={firstBaseline + i * LINE_HEIGHT} textAnchor="middle" className="fill-white text-[11.5px] font-semibold">
          {line}
        </text>
      ))}
      {sub && (
        <text x={cx} y={firstBaseline + lines.length * LINE_HEIGHT + 2} textAnchor="middle" className="fill-white/45 text-[9px]">
          {sub}
        </text>
      )}
    </>
  );
}

interface SystemDiagramProps {
  system: SystemDesign;
  locale: Locale;
  ariaLabel: string;
  flowsLabel: string;
}

export default function SystemDiagram({ system, locale, ariaLabel, flowsLabel }: SystemDiagramProps) {
  const layout = layoutDiagram(
    system.layers.map((layer) => layer.nodes.map((node) => node.id)),
    system.edges
  );
  const nodeById = new Map(system.layers.flatMap((layer) => layer.nodes).map((node) => [node.id, node]));
  const markerId = `arrow-${system.slug}`;

  return (
    <>
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        role="img"
        aria-label={ariaLabel}
        className="h-auto w-full min-w-[880px]"
      >
        <defs>
          <marker id={markerId} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 z" className="fill-white/40" />
          </marker>
        </defs>

        {system.layers.map((layer, index) => (
          <text
            key={layer.title.en}
            x={layout.layerXs[index] + NODE_WIDTH / 2}
            y={18}
            textAnchor="middle"
            className="fill-white/35 font-mono text-[10px] uppercase tracking-widest"
          >
            {layer.title[locale]}
          </text>
        ))}

        {layout.edges.map((edge) => (
          <path
            key={`${edge.from}-${edge.to}`}
            d={edge.d}
            fill="none"
            className="stroke-white/25"
            strokeWidth={1.4}
            markerEnd={`url(#${markerId})`}
          />
        ))}

        {/* Under the nodes, so a packet disappears behind the box it arrives at. */}
        <FlowPackets paths={layout.edges.map((edge) => edge.d)} />

        {layout.nodes.map(({ id, x, y }) => {
          const node = nodeById.get(id);
          if (!node) return null;
          return (
            <g key={id}>
              {/* Solid fill so edges that pass behind a node stay hidden. */}
              <rect
                x={x}
                y={y}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={10}
                className={`fill-[#04140b] ${KIND_CLASS[node.kind]}`}
                strokeWidth={1.4}
                strokeDasharray={node.kind === "external" ? "4 3" : undefined}
              />
              {renderText(node.label[locale], node.sub?.[locale], x, y)}
            </g>
          );
        })}
      </svg>

      <ul className="sr-only" aria-label={flowsLabel}>
        {layout.edges.map((edge) => (
          <li key={`${edge.from}-${edge.to}`}>
            {nodeById.get(edge.from)?.label[locale]} → {nodeById.get(edge.to)?.label[locale]}
          </li>
        ))}
      </ul>
    </>
  );
}
