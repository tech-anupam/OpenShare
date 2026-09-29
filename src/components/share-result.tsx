"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon, LinkIcon } from "@/components/icons";

interface ShareResultProps {
  shareId: string;
}

export function ShareResult({ shareId }: ShareResultProps) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/${shareId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="animate-in rounded-xl border p-4 space-y-3"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center gap-2">
        <LinkIcon size={16} style={{ color: "var(--success)" }} />
        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Link ready
        </span>
      </div>

      <div
        className="flex items-center gap-2 p-2.5 rounded-lg border"
        style={{
          background: "var(--bg-elevated)",
          borderColor: "var(--border)",
        }}
      >
        <span
          className="flex-1 text-sm truncate font-mono"
          style={{ color: "var(--text-primary)" }}
        >
          {url}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200"
          style={{
            background: copied ? "var(--success)" : "var(--accent)",
            color: "#ffffff",
          }}
        >
          {copied ? (
            <>
              <CheckIcon size={12} />
              Copied
            </>
          ) : (
            <>
              <CopyIcon size={12} />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
