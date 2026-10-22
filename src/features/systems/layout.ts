/** Pure layout for layered architecture diagrams: layers run left to right, nodes are centered per layer. */
export const NODE_WIDTH = 144;
export const NODE_HEIGHT = 58;
const LAYER_GAP = 64;
const NODE_GAP = 20;
const PADDING = 12;
export const LABEL_HEIGHT = 26;

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
}

export interface LayoutEdge {
  from: string;
  to: string;
  /** SVG path data. */
  d: string;
}

export interface DiagramLayout {
  width: number;
  height: number;
  layerXs: number[];
  nodes: LayoutNode[];
  edges: LayoutEdge[];
}

export function layoutDiagram(layers: string[][], edges: [string, string][]): DiagramLayout {
  const tallest = Math.max(...layers.map((ids) => ids.length));
  const columnHeight = tallest * NODE_HEIGHT + (tallest - 1) * NODE_GAP;
  const top = PADDING + LABEL_HEIGHT;

  const layerXs = layers.map((_, index) => PADDING + index * (NODE_WIDTH + LAYER_GAP));
  const nodes: LayoutNode[] = layers.flatMap((ids, layerIndex) => {
    const height = ids.length * NODE_HEIGHT + (ids.length - 1) * NODE_GAP;
    const startY = top + (columnHeight - height) / 2;
    return ids.map((id, i) => ({ id, x: layerXs[layerIndex], y: startY + i * (NODE_HEIGHT + NODE_GAP) }));
  });

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const laidOutEdges = edges.map(([from, to]) => {
    const a = byId.get(from);
    const b = byId.get(to);
    if (!a || !b) throw new Error(`Diagram edge references an unknown node: ${from} -> ${to}`);
    const x1 = a.x + NODE_WIDTH;
    const y1 = a.y + NODE_HEIGHT / 2;
    const x2 = b.x;
    const y2 = b.y + NODE_HEIGHT / 2;
    const mid = (x2 - x1) / 2;
    return { from, to, d: `M ${x1} ${y1} C ${x1 + mid} ${y1}, ${x2 - mid} ${y2}, ${x2} ${y2}` };
  });

  return {
    width: layerXs[layerXs.length - 1] + NODE_WIDTH + PADDING,
    height: top + columnHeight + PADDING,
    layerXs,
    nodes,
    edges: laidOutEdges,
  };
}

const MAX_LINE_CHARS = 17;

/** Splits a long label into at most two balanced lines at a space. */
export function wrapLabel(text: string): string[] {
  if (text.length <= MAX_LINE_CHARS || !text.includes(" ")) return [text];
  const middle = text.length / 2;
  let best = -1;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === " " && (best === -1 || Math.abs(i - middle) < Math.abs(best - middle))) best = i;
  }
  return [text.slice(0, best), text.slice(best + 1)];
}
