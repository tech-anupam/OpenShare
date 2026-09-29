"use client";

import { useState, useCallback, useEffect } from "react";
import { UploadZone } from "@/components/upload-zone";
import { PasteEditor } from "@/components/paste-editor";
import { ShareOptions } from "@/components/share-options";
import { ShareResult } from "@/components/share-result";
import { ViewFile } from "@/components/view-file";
import { ViewPaste } from "@/components/view-paste";
import {
  UploadIcon,
  PasteIcon,
  CheckIcon,
  LoaderIcon,
} from "@/components/icons";
import { DEFAULT_EXPIRY } from "@/lib/constants";
import { useUploadThing } from "@/lib/uploadthing";
import { encrypt } from "@/lib/crypto";
import { trackShareCreated } from "@/lib/analytics";
import { useToast } from "@/components/toast";

type Mode = "file" | "paste";
type Step = "input" | "uploading" | "done";

const DRAFT_KEY = "openshare-draft";

function saveDraft(data: Record<string, unknown>) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {}
}

function loadDraft(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

function UploadProgressRing({
  progress,
  fileName,
  fileSize,
}: {
  progress: number;
  fileName?: string;
  fileSize?: number;
}) {
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const statusText =
    progress < 15
      ? "Initializing..."
      : progress < 50
      ? "Uploading to storage..."
      : progress < 85
      ? "Processing & optimizing..."
      : progress < 99
      ? "Finalizing share..."
      : "Complete!";

  return (
    <div className="space-y-6 py-8 animate-in text-center">
      <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
            style={{ transition: "stroke-dashoffset 0.25s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-xl font-bold tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {statusText}
        </p>
        {fileName && (
          <p className="text-xs truncate max-w-xs mx-auto" style={{ color: "var(--text-muted)" }}>
            {fileName} {fileSize ? `(${formatSize(fileSize)})` : ""}
          </p>
        )}
      </div>

      <div
        className="w-full max-w-xs mx-auto h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--bg-elevated)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: "var(--accent)",
            width: `${progress}%`,
            transition: "width 0.25s ease",
          }}
        />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [mode, setMode] = useState<Mode>("file");
  const [step, setStep] = useState<Step>("input");
  const [file, setFile] = useState<File | null>(null);
  const [pasteContent, setPasteContent] = useState("");
  const [expiry, setExpiry] = useState(DEFAULT_EXPIRY);
  const [password, setPassword] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [shareId, setShareId] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();
  const { startUpload } = useUploadThing("fileUploader");

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      if (draft.mode) setMode(draft.mode as Mode);
      if (draft.pasteContent) setPasteContent(draft.pasteContent as string);
      if (draft.expiry) setExpiry(draft.expiry as number);
      if (draft.isPublic !== undefined) setIsPublic(draft.isPublic as boolean);
    }
  }, []);

  useEffect(() => {
    if (step === "input") {
      saveDraft({ mode, pasteContent, expiry, isPublic });
    }
  }, [mode, pasteContent, expiry, isPublic, step]);

  const hasContent =
    (mode === "file" && file !== null) ||
    (mode === "paste" && pasteContent.trim().length > 0);

  const handleShare = useCallback(async () => {
    if (!hasContent) return;

    setError(null);
    setStep("uploading");
    setUploadProgress(5);

    try {
      if (mode === "file" && file) {
        const uploadResult = await startUpload([file], {
          onUploadProgress: ({ progress }) => {
            setUploadProgress(Math.max(10, Math.min(progress, 88)));
          },
        });

        if (!uploadResult || uploadResult.length === 0) {
          throw new Error("Upload failed. Please check network and try again.");
        }

        setUploadProgress(90);

        const uploaded = uploadResult[0];
        let content = uploaded.ufsUrl;
        let encSalt: string | null = null;
        let encIv: string | null = null;
        let isEncrypted = false;

        setUploadedUrl(content);

        if (password) {
          const enc = await encrypt(content, password);
          content = enc.encrypted;
          encSalt = enc.salt;
          encIv = enc.iv;
          isEncrypted = true;
        }

        setUploadProgress(95);

        const res = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "file",
            content,
            password: password || undefined,
            encrypted: isEncrypted,
            encryption_salt: encSalt,
            encryption_iv: encIv,
            expiry,
            is_public: isPublic,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create share");
        setShareId(data.id);
        trackShareCreated("file", isEncrypted);
        toast.success("File shared successfully!");
        setUploadProgress(100);
        clearDraft();
        setTimeout(() => setStep("done"), 300);
      }

      if (mode === "paste" && pasteContent.trim()) {
        setUploadProgress(30);

        let content = pasteContent;
        let encSalt: string | null = null;
        let encIv: string | null = null;
        let isEncrypted = false;

        if (password) {
          const enc = await encrypt(content, password);
          content = enc.encrypted;
          encSalt = enc.salt;
          encIv = enc.iv;
          isEncrypted = true;
        }

        setUploadProgress(70);

        const res = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "paste",
            content,
            password: password || undefined,
            encrypted: isEncrypted,
            encryption_salt: encSalt,
            encryption_iv: encIv,
            expiry,
            is_public: isPublic,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create share");
        setShareId(data.id);
        trackShareCreated("paste", isEncrypted);
        toast.success("Paste shared successfully!");
        setUploadProgress(100);
        clearDraft();
        setTimeout(() => setStep("done"), 300);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
      setStep("input");
    }
  }, [hasContent, mode, file, pasteContent, password, expiry, isPublic, startUpload, toast]);

  const reset = () => {
    setStep("input");
    setShareId(null);
    setUploadedUrl(null);
    setUploadProgress(0);
    setFile(null);
    setPasteContent("");
    setPassword("");
    setError(null);
    clearDraft();
  };

  if (step === "done" && shareId) {
    return (
      <div className="space-y-6 mt-6 animate-in">
        <ShareResult shareId={shareId} />

        <div
          className="rounded-2xl border p-4 backdrop-blur-sm"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
            Preview
          </p>
          {mode === "file" && uploadedUrl && file && (
            <ViewFile
              url={uploadedUrl}
              fileName={file.name}
              fileSize={file.size}
              fileType={file.type}
            />
          )}
          {mode === "paste" && <ViewPaste content={pasteContent} />}
        </div>

        <button
          onClick={reset}
          className="w-full py-3 rounded-2xl text-sm font-semibold border transition-all duration-200 active:scale-98"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
            background: "var(--bg-card)",
          }}
        >
          Share another
        </button>
      </div>
    );
  }

  if (step === "uploading") {
    return (
      <div
        className="mt-8 rounded-2xl border p-6 backdrop-blur-sm"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <UploadProgressRing
          progress={uploadProgress}
          fileName={file?.name}
          fileSize={file?.size}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center justify-center">
        <div
          className="inline-flex rounded-full p-1 border shadow-sm backdrop-blur-sm"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <button
            onClick={() => {
              setMode("file");
              setFile(null);
              setError(null);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
            style={{
              background: mode === "file" ? "var(--accent)" : "transparent",
              color: mode === "file" ? "#ffffff" : "var(--text-secondary)",
            }}
          >
            <UploadIcon size={14} />
            File
          </button>
          <button
            onClick={() => {
              setMode("paste");
              setError(null);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
            style={{
              background: mode === "paste" ? "var(--accent)" : "transparent",
              color: mode === "paste" ? "#ffffff" : "var(--text-secondary)",
            }}
          >
            <PasteIcon size={14} />
            Paste
          </button>
        </div>
      </div>

      {mode === "file" ? (
        <UploadZone
          onFileSelect={setFile}
          selectedFile={file}
          onClear={() => setFile(null)}
          uploading={false}
        />
      ) : (
        <PasteEditor value={pasteContent} onChange={setPasteContent} />
      )}

      {hasContent && (
        <div className="space-y-3 animate-in">
          <ShareOptions
            expiry={expiry}
            onExpiryChange={setExpiry}
            password={password}
            onPasswordChange={setPassword}
            isPublic={isPublic}
            onPublicChange={setIsPublic}
          />

          {error && (
            <div
              className="p-2.5 rounded-xl text-xs text-center border"
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                borderColor: "var(--danger)",
                color: "var(--danger)",
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-98 shadow-sm"
            style={{ background: "var(--accent)", color: "#ffffff" }}
          >
            <CheckIcon size={14} />
            <span>{mode === "file" ? "Share File" : "Share Paste"}</span>
          </button>
        </div>
      )}

      {error && !hasContent && (
        <p className="text-xs text-center" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
