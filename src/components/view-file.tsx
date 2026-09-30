"use client";

import { useState, useEffect } from "react";
import { DownloadIcon, ImageIcon, FileIcon, CopyIcon, CheckIcon, CodeIcon, VideoIcon, MusicIcon, ShareIcon, ExternalLinkIcon, PlayIcon } from "@/components/icons";
import { MarkdownView } from "@/components/markdown-view";

interface ViewFileProps {
  url: string;
  downloadUrl?: string;
  fileName: string;
  fileSize: number | null;
  fileType: string | null;
  shareId?: string;
}

function stripExtension(name: string): string {
  const lastDot = name.lastIndexOf(".");
  if (lastDot <= 0) return name;
  return name.substring(0, lastDot);
}

function getFileCategory(fileName: string, fileType: string | null) {
  if (fileType?.startsWith("image/")) return { icon: ImageIcon, label: "Image", color: "#8b5cf6" };
  if (fileType?.startsWith("video/")) return { icon: VideoIcon, label: "Video", color: "#ef4444" };
  if (fileType?.startsWith("audio/")) return { icon: MusicIcon, label: "Audio", color: "#f59e0b" };
  if (fileType?.startsWith("text/") || /\.(js|ts|tsx|jsx|py|rs|go|rb|css|html|json|yml|yaml|sh|sql|md)$/i.test(fileName))
    return { icon: CodeIcon, label: "Code", color: "#22c55e" };
  return { icon: FileIcon, label: "File", color: "var(--accent)" };
}

function ShareToMenu({ url, fileName, isVideo }: { url: string; fileName: string; isVideo?: boolean }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : url;
  const title = `Check out ${stripExtension(fileName)} on OpenShare`;

  const platforms = [
    {
      name: "Copy Link",
      action: async () => {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
      },
    },
    ...(isVideo
      ? [
          {
            name: "Copy Discord Video Link",
            action: async () => {
              await navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
            },
          },
          {
            name: "Copy Video Embed Code (HTML)",
            action: async () => {
              const iframe = `<iframe src="${shareUrl}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
              await navigator.clipboard.writeText(iframe);
              setCopied(true);
              setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
            },
          },
        ]
      : []),
    {
      name: "Discord",
      action: async () => {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
      },
    },
    {
      name: "WhatsApp",
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(title + " " + shareUrl)}`, "_blank"),
    },
    {
      name: "Twitter / X",
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`, "_blank"),
    },
    {
      name: "Telegram",
      action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`, "_blank"),
    },
    {
      name: "Reddit",
      action: () => window.open(`https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`, "_blank"),
    },
    {
      name: "Email",
      action: () => window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`, "_blank"),
    },
  ];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 hover:shadow-md"
        style={{
          borderColor: "var(--border)",
          background: "var(--bg-elevated)",
          color: "var(--text-primary)",
        }}
      >
        <ShareIcon size={14} />
        <span>Share</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(false)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors"
        style={{
          borderColor: "var(--accent)",
          background: "rgba(59, 130, 246, 0.08)",
          color: "var(--accent)",
        }}
      >
        <ShareIcon size={14} />
        <span>Share</span>
      </button>
      <div
        className="absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-xl overflow-hidden animate-in z-50"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
      >
        {platforms.map((p) => (
          <button
            key={p.name}
            onClick={p.action}
            className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: "var(--text-primary)" }}
          >
            {p.name === "Copy Link" && copied ? "\u2713 Copied!" : p.name}
          </button>
        ))}
      </div>
    </div>
  );
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
  const [textContent, setTextContent] = useState<string | null>(null);
  const [textLoading, setTextLoading] = useState(false);

  const cat = getFileCategory(fileName, fileType);
  const CatIcon = cat.icon;

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

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(dlUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: open in new tab
      window.open(dlUrl, "_blank");
    }
  };

  return (
    <div className="space-y-4 animate-in">
      <div
        className="rounded-2xl border overflow-hidden"
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
              alt={stripExtension(fileName)}
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
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(245, 158, 11, 0.1)" }}
            >
              <MusicIcon size={32} style={{ color: "#f59e0b" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {stripExtension(fileName)}
            </p>
            <audio src={dlUrl} controls className="w-full max-w-md mt-2" preload="metadata" />
          </div>
        )}

        {isPdf && (
          <iframe
            src={dlUrl}
            className="w-full h-[70vh] border-0"
            title={stripExtension(fileName)}
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
              className="flex items-center justify-center w-16 h-16 rounded-2xl"
              style={{
                background: `color-mix(in srgb, ${cat.color} 12%, transparent)`,
              }}
            >
              <CatIcon size={32} style={{ color: cat.color }} />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                {stripExtension(fileName)}
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

      {/* File info bar */}
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
            style={{ background: `color-mix(in srgb, ${cat.color} 12%, transparent)` }}
          >
            <CatIcon size={18} style={{ color: cat.color }} />
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: "var(--text-primary)" }}
              title={fileName}
            >
              {stripExtension(fileName)}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                style={{
                  background: `color-mix(in srgb, ${cat.color} 12%, transparent)`,
                  color: cat.color,
                }}
              >
                {cat.label}
              </span>
              {fileSize && (
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {formatSize(fileSize)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {shareId && (isMarkdown || isTextOrCode) && (
            <a
              href={`/${shareId}/raw`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 hover:shadow-md"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
              }}
            >
              <ExternalLinkIcon size={13} />
              Raw
            </a>
          )}

          <ShareToMenu url={dlUrl} fileName={fileName} isVideo={isVideo} />

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 shadow-sm hover:shadow-lg"
            style={{
              background: "var(--accent)",
              color: "#ffffff",
            }}
          >
            <DownloadIcon size={14} />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
