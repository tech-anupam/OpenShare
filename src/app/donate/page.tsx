"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "@/components/icons";
import { GITHUB_URL } from "@/lib/constants";

const wallets = [
  {
    name: "Bitcoin",
    address: "bc1q9f5l4ryr08pqufh3p3xv57lwnsz9z9gupd8yzs",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#F7931A" />
        <path d="M22.5 14.2c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.7 2.7c-.4-.1-.8-.2-1.3-.3l.7-2.7-1.6-.4-.7 2.7c-.3-.1-.7-.2-1-.3l-2.2-.5-.4 1.7s1.2.3 1.2.3c.6.2.8.6.7 1l-.7 2.9c0 0 .1 0 .2.1h-.2l-1 4.1c-.1.2-.3.5-.7.4 0 0-1.2-.3-1.2-.3l-.8 1.8 2.1.5c.4.1.8.2 1.2.3l-.7 2.8 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.8c2.9.5 5.1.3 6-2.3.7-2.1 0-3.3-1.5-4.1 1.1-.3 1.9-1 2.1-2.5zm-3.8 5.3c-.5 2.1-4.1 1-5.3.7l.9-3.8c1.2.3 4.9.9 4.4 3.1zm.5-5.4c-.5 1.9-3.5.9-4.4.7l.8-3.4c1 .2 4.1.7 3.6 2.7z" fill="#fff"/>
      </svg>
    ),
  },
  {
    name: "Ethereum",
    address: "0xdf2122B4a567CA6908Bbece014492998795f694D",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#627EEA" />
        <path d="M16 4v8.9l7.5 3.3L16 4z" fill="#fff" fillOpacity="0.6"/>
        <path d="M16 4L8.5 16.2 16 12.9V4z" fill="#fff"/>
        <path d="M16 21.9v6.1l7.5-10.4L16 21.9z" fill="#fff" fillOpacity="0.6"/>
        <path d="M16 28v-6.1l-7.5-4.3L16 28z" fill="#fff"/>
        <path d="M16 20.5l7.5-4.3L16 12.9v7.6z" fill="#fff" fillOpacity="0.2"/>
        <path d="M8.5 16.2l7.5 4.3v-7.6l-7.5 3.3z" fill="#fff" fillOpacity="0.5"/>
      </svg>
    ),
  },
  {
    name: "Solana",
    address: "EZXYEDuqWzzEPjEtg1wzNeErXy52MBDMAhYrVs8gG2s8",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#000"/>
        <path d="M9 20.2l1.5-1.5c.1-.1.3-.2.4-.2h12.4c.3 0 .4.3.2.5l-1.5 1.5c-.1.1-.3.2-.4.2H9.2c-.3 0-.4-.3-.2-.5z" fill="#14F195"/>
        <path d="M9 10.6l1.5-1.5c.1-.1.3-.2.4-.2h12.4c.3 0 .4.3.2.5l-1.5 1.5c-.1.1-.3.2-.4.2H9.2c-.3 0-.4-.3-.2-.5z" fill="#14F195"/>
        <path d="M23 15.2l-1.5-1.5c-.1-.1-.3-.2-.4-.2H8.7c-.3 0-.4.3-.2.5l1.5 1.5c.1.1.3.2.4.2h12.4c.3 0 .4-.3.2-.5z" fill="#9945FF"/>
      </svg>
    ),
  },
];

const upiId = "anupambuilds@fam";

export default function DonatePage() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="mt-6 max-w-lg mx-auto space-y-8 animate-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Support OpenShare
        </h1>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
          OpenShare is free and open source. If you find it useful, consider supporting the project.
          Every contribution helps keep this running.
        </p>
      </div>

      <div>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 hover:border-blue-500"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor" style={{ color: "var(--text-primary)" }}>
            <path d="M16 0C7.16 0 0 7.16 0 16c0 7.07 4.58 13.07 10.94 15.18.8.15 1.09-.35 1.09-.77v-2.99c-4.45.97-5.39-1.89-5.39-1.89-.73-1.85-1.78-2.34-1.78-2.34-1.45-.99.11-.97.11-.97 1.6.11 2.45 1.65 2.45 1.65 1.43 2.45 3.74 1.74 4.66 1.33.14-1.03.56-1.74 1.01-2.14-3.55-.4-7.29-1.78-7.29-7.91 0-1.75.62-3.18 1.65-4.3-.17-.4-.72-2.03.16-4.23 0 0 1.35-.43 4.4 1.64a15.3 15.3 0 014.01-.54c1.36.01 2.73.18 4.01.54 3.05-2.07 4.39-1.64 4.39-1.64.88 2.2.33 3.83.16 4.23 1.03 1.12 1.65 2.55 1.65 4.3 0 6.15-3.74 7.5-7.31 7.89.58.5 1.09 1.47 1.09 2.96v4.39c0 .42.29.93 1.1.77C27.42 29.07 32 23.07 32 16 32 7.16 24.84 0 16 0z"/>
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Star us on GitHub
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              The easiest way to support is giving us a star
            </p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)" }}>
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          UPI
        </h2>
        <div
          className="flex items-center gap-3.5 p-4 rounded-2xl border"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-neutral-200 shrink-0 p-1">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
              <rect width="100" height="100" rx="16" fill="#ffffff" />
              <path d="M22 66L50 20l12 15-20 22h-20z" fill="#097939" />
              <path d="M46 76l18-20L78 76H46z" fill="#ED7524" />
              <path d="M34 20h16l-10 14h-16z" fill="#ED7524" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              UPI Payment
            </p>
            <p className="text-xs font-mono truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
              {upiId}
            </p>
          </div>
          <button
            onClick={() => handleCopy(upiId, "upi")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{
              background: copied === "upi" ? "var(--success)" : "var(--accent)",
              color: "#ffffff",
            }}
          >
            {copied === "upi" ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
            {copied === "upi" ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Crypto
        </h2>
        <div className="space-y-2">
          {wallets.map((w) => (
            <div
              key={w.name}
              className="flex items-center gap-3.5 p-4 rounded-2xl border"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              {w.icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {w.name}
                </p>
                <p className="text-xs font-mono truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {w.address}
                </p>
              </div>
              <button
                onClick={() => handleCopy(w.address, w.name)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0"
                style={{
                  background: copied === w.name ? "var(--success)" : "var(--accent)",
                  color: "#ffffff",
                }}
              >
                {copied === w.name ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                {copied === w.name ? "Copied" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
