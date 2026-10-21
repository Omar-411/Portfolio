/**
 * On-chain proof shown in the "Services" section. Leave everything empty and the
 * strip simply doesn't render. Fill it in with real, verifiable items only.
 */
export interface ContractProof {
  label: string;
  chain: string;
  address: string;
  /** Block-explorer URL of the verified contract. */
  explorerUrl: string;
}

export interface Web3Proof {
  ens: string | null;
  contracts: ContractProof[];
}

export const web3Proof: Web3Proof = {
  ens: null,
  contracts: [],
};
