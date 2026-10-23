export const PACKET_SPEED = 95; // px per second along an edge
export const PACKET_GAP_S = 0.9; // pause between two trips on the same edge
const MIN_TRIP_S = 1.1;

export interface PacketTiming {
  dur: number;
  begin: number;
}

/** Constant speed regardless of edge length; edges start in sequence so the flow reads left to right. */
export function packetTiming(index: number, pathLength: number): PacketTiming {
  const travel = Math.max(MIN_TRIP_S, pathLength / PACKET_SPEED);
  return { dur: travel + PACKET_GAP_S, begin: (index % 6) * 0.35 };
}

/** Share of the cycle spent travelling (the rest is the pause), for `keyTimes`. */
export function travelShare(pathLength: number): number {
  const travel = Math.max(MIN_TRIP_S, pathLength / PACKET_SPEED);
  return travel / (travel + PACKET_GAP_S);
}
