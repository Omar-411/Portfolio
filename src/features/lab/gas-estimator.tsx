"use client";

import { useEffect, useState } from "react";
import { format } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { estimateCost, GAS_ACTIONS, gasUnitsFor, type GasActionId } from "./gas";
import { inputClass, labelClass, rowClass, valueClass } from "./ui";
import { getPublicClient } from "./web3-client";

const PRICE_URL = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";

async function fetchGasPriceGwei(): Promise<number> {
  const wei = await (await getPublicClient()).getGasPrice();
  return Number(wei) / 1e9;
}

async function fetchEthUsd(): Promise<number> {
  const response = await fetch(PRICE_URL);
  if (!response.ok) throw new Error("price unavailable");
  return ((await response.json()) as { ethereum: { usd: number } }).ethereum.usd;
}

export default function GasEstimator({ t }: { t: Dictionary["lab"]["gas"] }) {
  const [action, setAction] = useState<GasActionId>("transfer");
  const [gwei, setGwei] = useState("");
  const [ethUsd, setEthUsd] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    // Each value is independent: if one source fails the visitor can type it in.
    Promise.allSettled([fetchGasPriceGwei(), fetchEthUsd()]).then(([gas, price]) => {
      if (!active) return;
      if (gas.status === "fulfilled") setGwei(gas.value.toFixed(2));
      if (price.status === "fulfilled") setEthUsd(price.value.toFixed(0));
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const gasUnits = gasUnitsFor(action);
  const gweiNumber = Number.parseFloat(gwei);
  const usdNumber = Number.parseFloat(ethUsd);
  const ready = gweiNumber >= 0 && usdNumber >= 0 && gwei !== "" && ethUsd !== "";
  const cost = ready ? estimateCost(gasUnits, gweiNumber, usdNumber) : null;

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-xs text-white/45">
        {t.action}
        <select value={action} onChange={(event) => setAction(event.target.value as GasActionId)} className={inputClass}>
          {GAS_ACTIONS.map((item) => (
            <option key={item.id} value={item.id} className="bg-black">
              {t.actions[item.id]} · {item.gasUnits.toLocaleString("en")} gas
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5 text-xs text-white/45">
          {t.gasPrice}
          <input value={gwei} onChange={(event) => setGwei(event.target.value)} inputMode="decimal" placeholder={loaded ? "—" : "..."} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-xs text-white/45">
          {t.ethPrice}
          <input value={ethUsd} onChange={(event) => setEthUsd(event.target.value)} inputMode="decimal" placeholder={loaded ? "—" : "..."} className={inputClass} />
        </label>
      </div>

      <div aria-live="polite" className="flex flex-col gap-2">
        {cost ? (
          <>
            <div className={rowClass}>
              <span className={labelClass}>{t.costEth}</span>
              <span className={valueClass}>{format(t.eth, { amount: cost.eth.toFixed(6) })}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>{t.costUsd}</span>
              <span className={valueClass}>${cost.usd.toFixed(2)}</span>
            </div>
          </>
        ) : (
          loaded && <p className="text-sm text-white/45">{t.fillIn}</p>
        )}
        <p className="text-xs text-white/35">{t.disclaimer}</p>
      </div>
    </div>
  );
}
