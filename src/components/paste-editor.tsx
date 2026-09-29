"use client";

import { useState } from "react";
import { MAX_PASTE_LENGTH } from "@/lib/constants";
import { CodeIcon, EyeIcon } from "@/components/icons";
import { MarkdownView } from "@/components/markdown-view";

interface PasteEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function PasteEditor({ value, onChange }: PasteEditorProps) {
  const [preview, setPreview] = useState(false);
  const lineCount = value.split("\n").length;
  const charCount = value.length;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPreview(false)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-200"
            style={{
              background: !preview ? "var(--bg-elevated)" : "transparent",
              color: !preview ? "var(--text-primary)" : "var(--text-muted)",
            }}
          >
            <CodeIcon size={12} />
            Write
          </button>
          <button
            onClick={() => setPreview(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-200"
            style={{
              background: preview ? "var(--bg-elevated)" : "transparent",
              color: preview ? "var(--text-primary)" : "var(--text-muted)",
            }}
          >
            <EyeIcon size={12} />
            Preview
          </button>
        </div>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          Markdown supported
        </span>
      </div>

      {preview ? (
        <div className="p-4 min-h-[280px]">
          {value.trim() ? (
            <MarkdownView content={value} />
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Nothing to preview
            </p>
          )}
        </div>
      ) : (
        <div className="flex">
          <div
            className="select-none py-4 px-3 text-right"
            style={{
              color: "var(--text-muted)",
              fontSize: "13px",
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: "1.6",
              minWidth: "40px",
            }}
          >
            {Array.from({ length: Math.max(lineCount, 12) }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <textarea
            value={value}
            onChange={(e) => {
              if (e.target.value.length <= MAX_PASTE_LENGTH) {
                onChange(e.target.value);
              }
            }}
            placeholder="Paste your text, code, or markdown here..."
            spellCheck={false}
            className="flex-1 resize-none py-4 pr-4 outline-none bg-transparent"
            style={{
              color: "var(--text-primary)",
              fontSize: "13px",
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: "1.6",
              minHeight: "280px",
            }}
          />
        </div>
      )}

      <div
        className="flex items-center justify-between px-4 py-2 text-xs border-t"
        style={{
          borderColor: "var(--border)",
          color: "var(--text-muted)",
        }}
      >
        <span>{lineCount} lines</span>
        <span>
          {charCount.toLocaleString()} / {MAX_PASTE_LENGTH.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
