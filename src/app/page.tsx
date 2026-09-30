"use client";

import { useState, useCallback, useEffect } from "react";
import { UploadZone } from "@/components/upload-zone";
import { PasteEditor } from "@/components/paste-editor";
import { ShareModal } from "@/components/share-modal";
import { ShareResult } from "@/components/share-result";
import { ViewFile } from "@/components/view-file";
import { ViewPaste } from "@/components/view-paste";
import {
  UploadIcon,
  PasteIcon,
  CheckIcon,
  LoaderIcon,
  ZapIcon,
  OpenShareLogo,
} from "@/components/icons";
import { DEFAULT_EXPIRY } from "@/lib/constants";
import { useUploadThing } from "@/lib/uploadthing";
import { encrypt } from "@/lib/crypto";
import { trackShareCreated } from "@/lib/analytics";
import { useToast } from "@/components/toast";
import { useScrollReveal } from "@/hooks/use-gsap";

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

  const stripExt = (name: string) => {
    const dot = name.lastIndexOf(".");
    return dot > 0 ? name.substring(0, dot) : name;
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
            {stripExt(fileName)} {fileSize ? `(${formatSize(fileSize)})` : ""}
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
  const [bodyDragging, setBodyDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const heroRef = useScrollReveal<HTMLDivElement>();
  const uploadRef = useScrollReveal<HTMLDivElement>();
  const optionsRef = useScrollReveal<HTMLDivElement>();

  const toast = useToast();
  const { startUpload } = useUploadThing("fileUploader", {
    onUploadProgress: (p) => {
      setUploadProgress(Math.max(10, Math.min(p, 88)));
    },
  });

  // Restore draft
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      if (draft.mode) setMode(draft.mode as Mode);
      if (draft.pasteContent) setPasteContent(draft.pasteContent as string);
      if (draft.expiry) setExpiry(draft.expiry as number);
      if (draft.isPublic !== undefined) setIsPublic(draft.isPublic as boolean);
    }
  }, []);

  // Save draft
  useEffect(() => {
    if (step === "input") {
      saveDraft({ mode, pasteContent, expiry, isPublic });
    }
  }, [mode, pasteContent, expiry, isPublic, step]);

  // Global body drag & drop + paste detection
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer?.types.includes("Files")) {
        setBodyDragging(true);
        setMode("file");
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        setBodyDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setBodyDragging(false);
      const droppedFile = e.dataTransfer?.files[0];
      if (droppedFile && droppedFile.size <= 512 * 1024 * 1024) {
        setMode("file");
        setFile(droppedFile);
        toast.success(`File "${droppedFile.name}" ready to share!`);
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      // Skip if we're in a text input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
          const pastedFile = items[i].getAsFile();
          if (pastedFile && pastedFile.size <= 512 * 1024 * 1024) {
            e.preventDefault();
            setMode("file");
            setFile(pastedFile);
            toast.success(`Pasted file ready to share!`);
            return;
          }
        }
      }
    };

    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
      document.removeEventListener("paste", handlePaste);
    };
  }, [toast]);

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
        const uploadResult = await startUpload([file]);

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
          className="w-full py-3 rounded-2xl text-sm font-semibold border transition-all duration-200 active:scale-98 hover:shadow-md"
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
    <>
      {/* Global drag overlay */}
      {bodyDragging && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-sm pointer-events-none"
          style={{ background: "rgba(59, 130, 246, 0.08)" }}
        >
          <div
            className="flex flex-col items-center gap-4 p-10 rounded-3xl border-2 border-dashed animate-in"
            style={{
              borderColor: "var(--accent)",
              background: "color-mix(in srgb, var(--bg-card) 95%, transparent)",
            }}
          >
            <UploadIcon size={48} style={{ color: "var(--accent)" }} />
            <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Drop anywhere to upload
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6 mt-6">
        {/* Hero text */}
        <div ref={heroRef} className="text-center space-y-2 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Share anything, instantly
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Files, text, code. Encrypted and self-destructing.
          </p>
        </div>

        {/* Mac Window Modal / Studio */}
        <div ref={uploadRef} className="mac-window">
          {/* Mac Window Header / Titlebar */}
          <div className="flex items-center justify-between px-4 py-3 border-b select-none border-slate-200/80 dark:border-blue-500/20 bg-slate-50/90 dark:bg-[rgba(10,16,32,0.85)] transition-colors">
            {/* Traffic Light Dots */}
            <div className="flex items-center gap-2">
              <span className="mac-dot mac-dot-red" />
              <span className="mac-dot mac-dot-yellow" />
              <span className="mac-dot mac-dot-green" />
            </div>

            {/* Centered Segmented Tabs with persistence indicator */}
            <div className="inline-flex p-1 rounded-xl border gap-1 border-slate-200/80 bg-white dark:border-blue-500/25 dark:bg-[rgba(6,9,18,0.9)] shadow-sm transition-colors">
              <button
                type="button"
                onClick={() => {
                  setMode("file");
                  setError(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  mode === "file"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <UploadIcon size={13} />
                <span>File</span>
                {file && (
                  <span
                    className={`w-2 h-2 rounded-full ring-2 ${
                      mode === "file" ? "bg-white ring-white/30" : "bg-blue-600 ring-blue-500/20"
                    }`}
                    title={file.name}
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("paste");
                  setError(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  mode === "paste"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <PasteIcon size={13} />
                <span>Paste</span>
                {pasteContent.trim().length > 0 && (
                  <span
                    className={`w-2 h-2 rounded-full ring-2 ${
                      mode === "paste" ? "bg-white ring-white/30" : "bg-emerald-500 ring-emerald-500/20"
                    }`}
                  />
                )}
              </button>
            </div>

            {/* Spacer for symmetry with traffic lights */}
            <div className="w-12" />
          </div>

          {/* Window Body */}
          <div className="w-full">
            {mode === "file" ? (
              <div className="p-4 sm:p-6">
                <UploadZone
                  onFileSelect={setFile}
                  selectedFile={file}
                  onClear={() => setFile(null)}
                  uploading={false}
                  onShare={() => setIsModalOpen(true)}
                />
              </div>
            ) : (
              <PasteEditor
                value={pasteContent}
                onChange={setPasteContent}
                onShare={() => setIsModalOpen(true)}
              />
            )}
          </div>
        </div>

        {error && (
          <div
            className="p-3 rounded-xl text-xs text-center border animate-in"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              borderColor: "var(--danger)",
              color: "var(--danger)",
            }}
          >
            {error}
          </div>
        )}

        {/* Share Settings Modal */}
        <ShareModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleShare}
          type={mode}
          file={file}
          pasteLength={pasteContent.length}
          pasteLines={pasteContent.split("\n").length}
          expiry={expiry}
          onExpiryChange={setExpiry}
          password={password}
          onPasswordChange={setPassword}
          isPublic={isPublic}
          onPublicChange={setIsPublic}
          isUploading={uploadProgress > 0 && uploadProgress < 100}
        />
      </div>
    </>
  );
}
