"use client";

import { useCallback, useRef, useState } from "react";
import { UploadIcon, FileIcon, XIcon } from "@/components/icons";
import { MAX_FILE_SIZE } from "@/lib/constants";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  uploading: boolean;
}

export function UploadZone({
  onFileSelect,
  selectedFile,
  onClear,
  uploading,
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
    return (
      <div
        className="relative flex items-center gap-3 p-3.5 rounded-2xl border transition-all animate-in"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
      >
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
          style={{ background: "var(--bg-elevated)" }}
        >
          <FileIcon size={20} style={{ color: "var(--accent)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-semibold truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {selectedFile.name}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            {formatSize(selectedFile.size)}
          </p>
        </div>
        {!uploading && (
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg transition-colors hover:opacity-75"
            style={{ color: "var(--text-muted)" }}
            title="Remove file"
          >
            <XIcon size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`group flex flex-col items-center justify-center gap-2.5 py-6 px-4 rounded-2xl border border-dashed cursor-pointer transition-all duration-200 hover:border-blue-500 ${
        dragging ? "drop-zone-active" : ""
      }`}
      style={{
        borderColor: dragging ? "var(--accent)" : "var(--border)",
        background: "var(--bg-card)",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div
        className="flex items-center justify-center w-9 h-9 rounded-xl transition-transform duration-200 group-hover:scale-105"
        style={{ background: "var(--bg-elevated)" }}
      >
        <UploadIcon size={18} style={{ color: "var(--text-secondary)" }} />
      </div>
      <div className="text-center">
        <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
          Drop a file here or tap to browse
        </p>
        <span
          className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
          style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
        >
          Max 512 MB
        </span>
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
