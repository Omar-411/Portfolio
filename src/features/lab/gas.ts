export const GAS_ACTIONS = [
  { id: "transfer", gasUnits: 21_000 },
  { id: "erc20", gasUnits: 65_000 },
  { id: "mint", gasUnits: 120_000 },
  { id: "swap", gasUnits: 150_000 },
  { id: "deploy", gasUnits: 800_000 },
] as const;

export type GasActionId = (typeof GAS_ACTIONS)[number]["id"];

export interface GasCost {
  eth: number;
  usd: number;
}

/** gasPriceGwei × gasUnits gives gwei; 1 ETH = 1e9 gwei. */
export function estimateCost(gasUnits: number, gasPriceGwei: number, ethUsd: number): GasCost {
  const eth = (gasUnits * gasPriceGwei) / 1e9;
  return { eth, usd: eth * ethUsd };
}

export function gasUnitsFor(id: GasActionId): number {
  return GAS_ACTIONS.find((action) => action.id === id)?.gasUnits ?? 21_000;
}
