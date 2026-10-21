"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { buttonClass, inputClass, labelClass, rowClass, valueClass } from "./ui";
import { getInjectedProvider } from "./web3-client";

interface SignedResult {
  signature: string;
  recovered: string;
  valid: boolean;
}

export default function SignaturePlayground({ t }: { t: Dictionary["lab"]["sign"] }) {
  const [account, setAccount] = useState<string | null>(null);
  const [message, setMessage] = useState(t.defaultMessage);
  const [result, setResult] = useState<SignedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (cause) {
      const rejected = (cause as { code?: number }).code === 4001;
      setError(rejected ? t.rejected : t.error);
    } finally {
      setBusy(false);
    }
  };

  const connect = () =>
    run(async () => {
      const provider = getInjectedProvider();
      if (!provider) {
        setError(t.noWallet);
        return;
      }
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      setAccount(accounts[0] ?? null);
    });

  const sign = () =>
    run(async () => {
      const provider = getInjectedProvider();
      if (!provider || !account) return;
      const { toHex, recoverMessageAddress, isAddressEqual } = await import("viem");
      const signature = (await provider.request({
        method: "personal_sign",
        params: [toHex(message), account],
      })) as `0x${string}`;
      // Verified in the browser: the signature must recover to the connected address.
      const recovered = await recoverMessageAddress({ message, signature });
      setResult({ signature, recovered, valid: isAddressEqual(recovered, account as `0x${string}`) });
    });

  return (
    <div className="flex flex-col gap-4">
      {account ? (
        <>
          <p className="break-all font-mono text-xs text-neon">
            {t.connected}: {account}
          </p>
          <textarea
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setResult(null);
            }}
            rows={3}
            aria-label={t.messageLabel}
            className={inputClass}
          />
          <button type="button" onClick={sign} disabled={busy || !message} className={buttonClass}>
            {t.sign}
          </button>
        </>
      ) : (
        <button type="button" onClick={connect} disabled={busy} className={buttonClass}>
          {t.connect}
        </button>
      )}

      <div aria-live="polite" className="flex flex-col gap-2">
        {error && <p className="text-sm text-red-400">{error}</p>}
        {result && (
          <dl className="flex flex-col gap-2">
            <div className={rowClass}>
              <dt className={labelClass}>{t.signature}</dt>
              <dd className={valueClass}>{`${result.signature.slice(0, 18)}…${result.signature.slice(-8)}`}</dd>
            </div>
            <div className={rowClass}>
              <dt className={labelClass}>{t.recovered}</dt>
              <dd className={valueClass}>{result.recovered}</dd>
            </div>
            <div className={rowClass}>
              <dt className={labelClass}>{t.verdict}</dt>
              <dd className={result.valid ? valueClass : "text-right font-mono text-red-400"}>
                {result.valid ? t.valid : t.invalid}
              </dd>
            </div>
          </dl>
        )}
      </div>
      <p className="text-xs text-white/35">{t.privacy}</p>
    </div>
  );
}
