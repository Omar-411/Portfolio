"use client";

import { useState, type FormEvent } from "react";
import { format } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { buttonClass, inputClass, labelClass, rowClass, valueClass } from "./ui";
import { getPublicClient } from "./web3-client";

interface WalletInfo {
  address: string;
  ensName: string | null;
  balanceEth: string;
  transactions: number;
  isContract: boolean;
}

type State = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string } | { kind: "done"; info: WalletInfo };

class LookupError extends Error {}

async function lookup(input: string, t: Dictionary["lab"]["wallet"]): Promise<WalletInfo> {
  const { isAddress, getAddress, formatEther } = await import("viem");
  const client = await getPublicClient();
  const query = input.trim();

  let address: string | null = null;
  if (isAddress(query, { strict: false })) {
    address = getAddress(query.toLowerCase());
  } else if (query.includes(".")) {
    const { normalize } = await import("viem/ens");
    try {
      address = await client.getEnsAddress({ name: normalize(query) });
    } catch {
      throw new LookupError(t.invalid);
    }
    if (!address) throw new LookupError(t.notFound);
  } else {
    throw new LookupError(t.invalid);
  }

  const hexAddress = address as `0x${string}`;
  const [balance, transactions, code, ensName] = await Promise.all([
    client.getBalance({ address: hexAddress }),
    client.getTransactionCount({ address: hexAddress }),
    client.getCode({ address: hexAddress }),
    client.getEnsName({ address: hexAddress }).catch(() => null),
  ]);

  return {
    address,
    ensName,
    balanceEth: Number(formatEther(balance)).toLocaleString("en", { maximumFractionDigits: 4 }),
    transactions,
    isContract: Boolean(code && code !== "0x"),
  };
}

export default function WalletLookup({ t }: { t: Dictionary["lab"]["wallet"] }) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!value.trim()) return;
    setState({ kind: "loading" });
    try {
      setState({ kind: "done", info: await lookup(value, t) });
    } catch (error) {
      setState({ kind: "error", message: error instanceof LookupError ? error.message : t.error });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t.placeholder}
          aria-label={t.placeholder}
          spellCheck={false}
          autoComplete="off"
          className={inputClass}
        />
        <button type="submit" disabled={state.kind === "loading"} className={buttonClass}>
          {state.kind === "loading" ? t.loading : t.lookup}
        </button>
      </form>

      <div aria-live="polite">
        {state.kind === "error" && <p className="text-sm text-red-400">{state.message}</p>}
        {state.kind === "done" && (
          <dl className="flex flex-col gap-2">
            <div className={rowClass}>
              <dt className={labelClass}>{t.address}</dt>
              <dd className={valueClass}>{state.info.address}</dd>
            </div>
            <div className={rowClass}>
              <dt className={labelClass}>ENS</dt>
              <dd className={valueClass}>{state.info.ensName ?? t.noEns}</dd>
            </div>
            <div className={rowClass}>
              <dt className={labelClass}>{t.balance}</dt>
              <dd className={valueClass}>{format(t.eth, { amount: state.info.balanceEth })}</dd>
            </div>
            <div className={rowClass}>
              <dt className={labelClass}>{t.transactions}</dt>
              <dd className={valueClass}>{state.info.transactions}</dd>
            </div>
            <div className={rowClass}>
              <dt className={labelClass}>{t.type}</dt>
              <dd className={valueClass}>{state.info.isContract ? t.contract : t.wallet}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
