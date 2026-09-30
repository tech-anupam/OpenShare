"use client";

import { useState, useRef, useCallback } from "react";
import { MAX_PASTE_LENGTH } from "@/lib/constants";
import { CodeIcon, EyeIcon, CopyIcon, CheckIcon, TrashIcon, OpenShareLogo } from "@/components/icons";
import { MarkdownView } from "@/components/markdown-view";

interface PasteEditorProps {
  value: string;
  onChange: (value: string) => void;
  onShare?: () => void;
}

export function PasteEditor({ value, onChange, onShare }: PasteEditorProps) {
  const [preview, setPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = value.split("\n");
  const lineCount = lines.length;
  const charCount = value.length;

  // Tab key indents 2 spaces like a native code editor
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + "  " + value.substring(end);
        onChange(newValue);

        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
          }
        });
      }
    },
    [value, onChange]
  );

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    onChange("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#060912] transition-colors w-full">
      {/* Editor Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b select-none border-slate-200/80 dark:border-blue-500/15 bg-slate-50/90 dark:bg-[rgba(10,16,32,0.7)] transition-colors">
        {/* Write / Preview segmented switch */}
        <div className="inline-flex p-0.5 rounded-lg border gap-0.5 border-slate-200 bg-white dark:border-blue-500/25 dark:bg-[rgba(6,9,18,0.8)] shadow-xs">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold transition-all duration-150 ${
              !preview
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <CodeIcon size={12} />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold transition-all duration-150 ${
              preview
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <EyeIcon size={12} />
            <span>Preview</span>
          </button>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-3">
          {value.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy all text"
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors hover:bg-black/5 dark:hover:bg-blue-500/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-blue-400"
              >
                {copied ? (
                  <>
                    <CheckIcon size={12} style={{ color: "var(--success)" }} />
                    <span style={{ color: "var(--success)" }}>Copied</span>
                  </>
                ) : (
                  <>
                    <CopyIcon size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClear}
                title="Clear editor"
                className="p-1 rounded-md transition-colors hover:text-red-500 hover:bg-red-500/10 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400"
              >
                <TrashIcon size={13} />
              </button>
            </>
          )}

          <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
            {charCount.toLocaleString()} / {MAX_PASTE_LENGTH.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Editor Body */}
      {preview ? (
        <div className="p-5 min-h-[340px] max-h-[500px] overflow-y-auto bg-white dark:bg-[#070b16]">
          {value.trim() ? (
            <MarkdownView content={value} />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[280px] text-center gap-2">
              <EyeIcon size={24} className="text-slate-400 dark:text-slate-600" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Preview will appear here when you enter content
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-[340px] max-h-[500px] bg-white dark:bg-[#060912]">
          {/* Line Number Gutter */}
          <div
            className="select-none py-3.5 px-3 text-right font-mono border-r border-slate-200 text-slate-400 bg-slate-50/70 dark:border-blue-500/15 dark:text-sky-400/50 dark:bg-[rgba(10,16,32,0.4)] shrink-0 transition-colors"
            style={{
              fontSize: "12px",
              lineHeight: "1.7",
              minWidth: "44px",
            }}
          >
            {Array.from({ length: Math.max(lineCount, 12) }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Textarea Canvas */}
          <textarea
            ref={textareaRef}
            value={value}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              if (e.target.value.length <= MAX_PASTE_LENGTH) {
                onChange(e.target.value);
              }
            }}
            placeholder="Paste code, markdown, logs, or text here..."
            spellCheck={false}
            className="flex-1 resize-none py-3.5 px-4 outline-none bg-transparent font-mono text-slate-800 dark:text-slate-100 caret-black dark:caret-[#38bdf8]"
            style={{
              fontSize: "13px",
              lineHeight: "1.7",
              minHeight: "340px",
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            }}
          />
        </div>
      )}

      {/* Editor Bottom Line / Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 text-xs font-mono border-t border-slate-200/80 bg-slate-50/90 text-slate-500 dark:border-blue-500/15 dark:bg-[rgba(10,16,32,0.8)] dark:text-slate-400 select-none transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 dark:text-sky-400/90 font-medium">
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
          <span>·</span>
          <span>{charCount.toLocaleString()} chars</span>
        </div>

        {onShare && value.trim().length > 0 && (
          <button
            type="button"
            onClick={onShare}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-md shadow-blue-500/25 transition-all"
          >
            <OpenShareLogo size={14} />
            <span>Share Paste</span>
          </button>
        )}
      </div>
    </div>
  );
}
