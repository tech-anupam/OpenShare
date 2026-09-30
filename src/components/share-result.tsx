"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon, LinkIcon, ShareIcon, ExternalLinkIcon } from "@/components/icons";

interface ShareResultProps {
  shareId: string;
}

export function ShareResult({ shareId }: ShareResultProps) {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const url = `${window.location.origin}/${shareId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sharePlatforms = [
    {
      name: "Discord (Copy Link)",
      action: async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
    },
    {
      name: "WhatsApp",
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent("Check this out: " + url)}`, "_blank"),
    },
    {
      name: "Twitter / X",
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("Shared via OpenShare")}&url=${encodeURIComponent(url)}`, "_blank"),
    },
    {
      name: "Telegram",
      action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent("Shared via OpenShare")}`, "_blank"),
    },
    {
      name: "Reddit",
      action: () => window.open(`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent("Shared via OpenShare")}`, "_blank"),
    },
    {
      name: "Email",
      action: () => window.open(`mailto:?subject=${encodeURIComponent("OpenShare Link")}&body=${encodeURIComponent(url)}`, "_blank"),
    },
  ];

  return (
    <div
      className="animate-in rounded-2xl border p-5 space-y-4"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
    >
      {/* Success header */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ background: "rgba(34, 197, 94, 0.1)" }}
        >
          <CheckIcon size={20} style={{ color: "var(--success)" }} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Your link is ready!
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Anyone with this link can view or download it
          </p>
        </div>
      </div>

      {/* URL display */}
      <div
        className="flex items-center gap-2 p-3 rounded-xl border"
        style={{
          background: "var(--bg-elevated)",
          borderColor: "var(--border)",
        }}
      >
        <LinkIcon size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
        <span
          className="flex-1 text-sm truncate font-mono"
          style={{ color: "var(--text-primary)" }}
        >
          {url}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shrink-0"
          style={{
            background: copied ? "var(--success)" : "var(--accent)",
            color: "#ffffff",
            boxShadow: "0 2px 8px rgba(59, 130, 246, 0.25)",
          }}
        >
          {copied ? (
            <>
              <CheckIcon size={12} />
              Copied!
            </>
          ) : (
            <>
              <CopyIcon size={12} />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Share to platforms */}
      <div className="relative">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 hover:shadow-md"
          style={{
            borderColor: "var(--border)",
            background: "var(--bg-elevated)",
            color: "var(--text-primary)",
          }}
        >
          <ShareIcon size={14} />
          <span>Share to social platforms</span>
        </button>

        {showShareMenu && (
          <div
            className="mt-2 rounded-xl border shadow-lg overflow-hidden animate-in"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            {sharePlatforms.map((p) => (
              <button
                key={p.name}
                onClick={p.action}
                className="w-full text-left px-4 py-3 text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2.5"
                style={{ color: "var(--text-primary)" }}
              >
                <ExternalLinkIcon size={13} style={{ color: "var(--text-muted)" }} />
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
