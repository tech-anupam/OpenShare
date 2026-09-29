"use client";

import { useState, useEffect } from "react";
import { DownloadIcon, ImageIcon, FileIcon, CopyIcon, CheckIcon, CodeIcon } from "@/components/icons";
import { MarkdownView } from "@/components/markdown-view";

interface ViewFileProps {
  url: string;
  downloadUrl?: string;
  fileName: string;
  fileSize: number | null;
  fileType: string | null;
  shareId?: string;
}

export function ViewFile({ url, downloadUrl, fileName, fileSize, fileType, shareId }: ViewFileProps) {
  const isImage = fileType?.startsWith("image/");
  const isVideo = fileType?.startsWith("video/");
  const isAudio = fileType?.startsWith("audio/");
  const isPdf = fileType === "application/pdf";
  const isMarkdown =
    fileName.toLowerCase().endsWith(".md") ||
    fileName.toLowerCase().endsWith(".markdown") ||
    fileType === "text/markdown";
  const isTextOrCode =
    !isMarkdown &&
    (fileType?.startsWith("text/") ||
      /\.(txt|json|js|ts|tsx|jsx|css|html|py|rs|go|sh|yml|yaml|sql)$/i.test(fileName));

  const dlUrl = downloadUrl || url;

  const [currentSrc, setCurrentSrc] = useState(url);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [textLoading, setTextLoading] = useState(false);

  useEffect(() => {
    setCurrentSrc(url);
    setImgLoaded(false);
  }, [url]);

  useEffect(() => {
    if ((isMarkdown || isTextOrCode) && dlUrl) {
      setTextLoading(true);
      fetch(dlUrl)
        .then((r) => r.text())
        .then((txt) => setTextContent(txt))
        .catch(() => setTextContent(null))
        .finally(() => setTextLoading(false));
    }
  }, [isMarkdown, isTextOrCode, dlUrl]);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 animate-in">
      <div
        className="rounded-2xl border overflow-hidden backdrop-blur-sm"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
      >
        {isImage && (
          <div className="relative flex items-center justify-center p-4 min-h-[240px]">
            {!imgLoaded && (
              <div
                className="absolute inset-4 rounded-xl animate-pulse flex items-center justify-center"
                style={{ background: "var(--bg-elevated)" }}
              >
                <ImageIcon size={32} style={{ color: "var(--text-muted)", opacity: 0.5 }} />
              </div>
            )}
            <img
              src={currentSrc}
              alt={fileName}
              onLoad={() => setImgLoaded(true)}
              onError={() => {
                if (currentSrc !== dlUrl) {
                  setCurrentSrc(dlUrl);
                }
              }}
              className={`max-w-full max-h-[65vh] rounded-xl object-contain transition-opacity duration-300 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        )}

        {isVideo && (
          <div className="p-3">
            <video
              src={dlUrl}
              controls
              playsInline
              className="w-full max-h-[65vh] rounded-xl bg-black"
              preload="metadata"
            />
          </div>
        )}

        {isAudio && (
          <div className="p-8 flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "var(--bg-elevated)", color: "var(--accent)" }}
            >
              <FileIcon size={28} />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {fileName}
            </p>
            <audio src={dlUrl} controls className="w-full max-w-md mt-2" preload="metadata" />
          </div>
        )}

        {isPdf && (
          <iframe
            src={dlUrl}
            className="w-full h-[70vh] border-0"
            title={fileName}
          />
        )}

        {isMarkdown && (
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {textLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-6 rounded w-1/3" style={{ background: "var(--bg-elevated)" }} />
                <div className="h-4 rounded w-full" style={{ background: "var(--bg-elevated)" }} />
                <div className="h-4 rounded w-2/3" style={{ background: "var(--bg-elevated)" }} />
              </div>
            ) : textContent ? (
              <MarkdownView content={textContent} />
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Unable to load preview
              </p>
            )}
          </div>
        )}

        {isTextOrCode && (
          <div className="p-4 max-h-[70vh] overflow-auto">
            {textLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 rounded w-full" style={{ background: "var(--bg-elevated)" }} />
                <div className="h-4 rounded w-3/4" style={{ background: "var(--bg-elevated)" }} />
              </div>
            ) : textContent ? (
              <pre
                className="text-xs font-mono p-4 rounded-xl overflow-x-auto"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--text-primary)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {textContent}
              </pre>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Unable to load preview
              </p>
            )}
          </div>
        )}

        {!isImage && !isVideo && !isAudio && !isPdf && !isMarkdown && !isTextOrCode && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 px-6">
            <div
              className="flex items-center justify-center w-16 h-16 rounded-2xl border"
              style={{
                background: "var(--bg-elevated)",
                borderColor: "var(--border)",
              }}
            >
              <FileIcon size={32} style={{ color: "var(--accent)" }} />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                {fileName}
              </p>
              {fileSize && (
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {formatSize(fileSize)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            style={{ background: "var(--bg-elevated)" }}
          >
            {isImage ? (
              <ImageIcon size={18} style={{ color: "var(--accent)" }} />
            ) : isMarkdown || isTextOrCode ? (
              <CodeIcon size={18} style={{ color: "var(--accent)" }} />
            ) : (
              <FileIcon size={18} style={{ color: "var(--accent)" }} />
            )}
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-medium truncate"
              style={{ color: "var(--text-primary)" }}
              title={fileName}
            >
              {fileName}
            </p>
            {fileSize && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {formatSize(fileSize)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {shareId && (isMarkdown || isTextOrCode) && (
            <a
              href={`/${shareId}/raw`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors duration-200 hover:opacity-80"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
              }}
            >
              Raw
            </a>
          )}

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors duration-200"
            style={{
              borderColor: "var(--border)",
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
            }}
          >
            {copied ? <CheckIcon size={14} style={{ color: "var(--success)" }} /> : <CopyIcon size={14} />}
            <span>{copied ? "Link Copied" : "Share Link"}</span>
          </button>

          <a
            href={dlUrl}
            download={fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-transform duration-150 active:scale-95"
            style={{
              background: "var(--accent)",
              color: "#ffffff",
            }}
          >
            <DownloadIcon size={14} />
            <span>Download</span>
          </a>
        </div>
      </div>
    </div>
  );
}
