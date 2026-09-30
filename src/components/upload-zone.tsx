"use client";

import { useCallback, useRef, useState } from "react";
import { UploadIcon, FileIcon, ImageIcon, VideoIcon, MusicIcon, CodeIcon, XIcon, OpenShareLogo } from "@/components/icons";
import { MAX_FILE_SIZE } from "@/lib/constants";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  uploading: boolean;
  onShare?: () => void;
}

function getFileCategory(file: File) {
  const t = file.type;
  const n = file.name.toLowerCase();
  if (t.startsWith("image/")) return { icon: ImageIcon, label: "Image", color: "#a78bfa" };
  if (t.startsWith("video/")) return { icon: VideoIcon, label: "Video", color: "#f87171" };
  if (t.startsWith("audio/")) return { icon: MusicIcon, label: "Audio", color: "#fbbf24" };
  if (t.startsWith("text/") || /\.(js|ts|tsx|jsx|py|rs|go|rb|css|html|json|yml|yaml|sh|sql|md)$/i.test(n))
    return { icon: CodeIcon, label: "Code", color: "#34d399" };
  return { icon: FileIcon, label: "File", color: "#60a5fa" };
}

function stripExtension(name: string): string {
  const lastDot = name.lastIndexOf(".");
  if (lastDot <= 0) return name;
  return name.substring(0, lastDot);
}

export function UploadZone({
  onFileSelect,
  selectedFile,
  onClear,
  uploading,
  onShare,
}: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.size <= MAX_FILE_SIZE) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.size <= MAX_FILE_SIZE) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  if (selectedFile) {
    const cat = getFileCategory(selectedFile);
    const Icon = cat.icon;
    return (
      <div className="space-y-4 animate-in">
        <div
          className="relative flex items-center gap-4 p-4 rounded-2xl border transition-all"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--border)",
          }}
        >
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
            style={{ background: `${cat.color}18` }}
          >
            <Icon size={22} style={{ color: cat.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {stripExtension(selectedFile.name)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  background: `${cat.color}18`,
                  color: cat.color,
                }}
              >
                {cat.label}
              </span>
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {formatSize(selectedFile.size)}
              </span>
            </div>
          </div>
          {!uploading && (
            <button
              onClick={onClear}
              className="p-2 rounded-xl transition-all hover:bg-red-500/10 text-slate-400 hover:text-red-500"
              title="Remove file"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>

        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-98 shadow-md shadow-blue-500/25 transition-all"
          >
            <OpenShareLogo size={16} />
            <span>Share File</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`group relative flex flex-col items-center justify-center gap-5 py-14 px-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 border-slate-300/80 hover:border-blue-500 dark:border-blue-500/25 dark:hover:border-blue-400 ${
        dragging
          ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
          : "bg-slate-50/60 hover:bg-blue-50/30 dark:bg-transparent dark:hover:bg-blue-500/[0.04]"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {/* Gradient icon container */}
      <div
        className="flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
        style={{
          background: dragging
            ? "var(--accent)"
            : "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))",
          boxShadow: dragging ? "0 8px 30px rgba(59, 130, 246, 0.3)" : "none",
        }}
      >
        <UploadIcon
          size={26}
          style={{
            color: dragging ? "#ffffff" : "var(--accent)",
          }}
        />
      </div>

      <div className="text-center space-y-1.5">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Drop your file here or{" "}
          <span style={{ color: "var(--accent)" }}>browse</span>
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Any file type up to 512 MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
