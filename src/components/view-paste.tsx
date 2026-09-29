"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon, CodeIcon, EyeIcon } from "@/components/icons";
import { MarkdownView } from "@/components/markdown-view";

interface ViewPasteProps {
  content: string;
  shareId?: string;
}

export function ViewPaste({ content, shareId }: ViewPasteProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"rendered" | "raw">("rendered");
  const lines = content.split("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3 animate-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode("rendered")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-200"
            style={{
              background: viewMode === "rendered" ? "var(--bg-elevated)" : "transparent",
              color: viewMode === "rendered" ? "var(--text-primary)" : "var(--text-muted)",
            }}
          >
            <EyeIcon size={12} />
            Rendered
          </button>
          <button
            onClick={() => setViewMode("raw")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-200"
            style={{
              background: viewMode === "raw" ? "var(--bg-elevated)" : "transparent",
              color: viewMode === "raw" ? "var(--text-primary)" : "var(--text-muted)",
            }}
          >
            <CodeIcon size={12} />
            Raw
          </button>
        </div>

        <div className="flex items-center gap-2">
          {shareId && (
            <a
              href={`/${shareId}/raw`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-200 hover:opacity-80"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
              }}
            >
              Raw Link
            </a>
          )}

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

      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
      >
        {viewMode === "rendered" ? (
          <div className="p-5">
            <MarkdownView content={content} />
          </div>
        ) : (
          <div className="flex overflow-x-auto">
            <div
              className="select-none py-4 px-3 text-right shrink-0"
              style={{
                color: "var(--text-muted)",
                fontSize: "13px",
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: "1.6",
                minWidth: "48px",
              }}
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <pre
              className="py-4 pr-4 overflow-x-auto flex-1"
              style={{
                color: "var(--text-primary)",
                fontSize: "13px",
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              {content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
