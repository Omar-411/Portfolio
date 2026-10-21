import type { PublicClient } from "viem";

// Public RPC with CORS enabled. Override with NEXT_PUBLIC_ETH_RPC_URL for a private endpoint.
const RPC_URL = process.env.NEXT_PUBLIC_ETH_RPC_URL ?? "https://ethereum-rpc.publicnode.com";

let client: Promise<PublicClient> | null = null;

/** viem is large, so it is only imported when a visitor actually uses a Web3 demo. */
export function getPublicClient(): Promise<PublicClient> {
  client ??= import("viem").then(({ createPublicClient, http }) =>
    import("viem/chains").then(({ mainnet }) => createPublicClient({ chain: mainnet, transport: http(RPC_URL) }))
  );
  return client;
}

export interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

export function getInjectedProvider(): Eip1193Provider | null {
  const provider = (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
  return provider ?? null;
}
