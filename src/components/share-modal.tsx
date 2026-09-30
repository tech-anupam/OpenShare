"use client";

import { useEffect, useState } from "react";
import { EXPIRY_OPTIONS } from "@/lib/constants";
import {
  ClockIcon,
  LockIcon,
  GlobeIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldIcon,
  XIcon,
  OpenShareLogo,
  FileIcon,
  CodeIcon,
} from "@/components/icons";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: "file" | "paste";
  file?: File | null;
  pasteLength?: number;
  pasteLines?: number;
  expiry: number;
  onExpiryChange: (val: number) => void;
  password: string;
  onPasswordChange: (val: string) => void;
  isPublic: boolean;
  onPublicChange: (val: boolean) => void;
  isUploading?: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ShareModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  file,
  pasteLength = 0,
  pasteLines = 0,
  expiry,
  onExpiryChange,
  password,
  onPasswordChange,
  isPublic,
  onPublicChange,
  isUploading = false,
}: ShareModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [enablePassword, setEnablePassword] = useState(Boolean(password));

  useEffect(() => {
    setEnablePassword(Boolean(password));
  }, [password]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden bg-white dark:bg-[#0b101e] border-slate-200 dark:border-blue-500/25 transition-all animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 dark:border-blue-500/20 bg-slate-50/80 dark:bg-[#0e1629]">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShieldIcon size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Share Settings
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Configure security and lifetime
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Content Info Pill */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs">
            {type === "file" && file ? (
              <>
                <FileIcon size={14} className="text-blue-500 shrink-0" />
                <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                  {file.name}
                </span>
                <span className="text-slate-400 ml-auto shrink-0 text-[11px]">
                  {formatSize(file.size)}
                </span>
              </>
            ) : (
              <>
                <CodeIcon size={14} className="text-emerald-500 shrink-0" />
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  Text Paste
                </span>
                <span className="text-slate-400 ml-auto shrink-0 text-[11px]">
                  {pasteLines} lines · {pasteLength.toLocaleString()} chars
                </span>
              </>
            )}
          </div>
        </div>

        {/* Settings Body */}
        <div className="p-5 space-y-4">
          {/* Expiry setting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <ClockIcon size={13} className="text-blue-500" />
                Auto-expire
              </span>
              <span className="text-[11px] text-slate-400">
                Deleted automatically
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {EXPIRY_OPTIONS.map((opt) => {
                const active = expiry === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onExpiryChange(opt.value)}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all duration-150 ${
                      active
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {opt.label.replace(" hours", "h").replace(" hour", "h").replace(" days", "d")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Password Protection */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => {
                const next = !enablePassword;
                setEnablePassword(next);
                if (!next) onPasswordChange("");
              }}
            >
              <div className="flex items-center gap-2">
                <LockIcon
                  size={14}
                  className={enablePassword ? "text-amber-500" : "text-slate-400"}
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Password Protection
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {enablePassword ? "Require password to view" : "No password required"}
                  </span>
                </div>
              </div>

              {/* Toggle switch */}
              <div
                className={`w-9 h-5 rounded-full relative transition-colors duration-200 shrink-0 ${
                  enablePassword ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-800"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${
                    enablePassword ? "translate-x-[18px]" : "translate-x-[2px]"
                  }`}
                />
              </div>
            </div>

            {enablePassword && (
              <div className="pt-1 animate-in space-y-2">
                <div className="flex items-center rounded-xl border px-3 py-2 gap-2 border-slate-300 dark:border-blue-500/40 bg-slate-50 dark:bg-slate-900/60 focus-within:border-blue-600">
                  <LockIcon size={13} className="text-slate-400 shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    placeholder="Enter decryption password"
                    autoFocus
                    className="flex-1 text-xs bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                  {password.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                    </button>
                  )}
                </div>
                {password && (
                  <div className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <ShieldIcon size={11} />
                    <span>Client-side encrypted with AES-GCM</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Public Archives */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => onPublicChange(!isPublic)}
            >
              <div className="flex items-center gap-2">
                <GlobeIcon
                  size={14}
                  className={isPublic ? "text-cyan-500" : "text-slate-400"}
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Public Archives
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isPublic ? "Discoverable in archives" : "Unlisted, direct link only"}
                  </span>
                </div>
              </div>

              {/* Toggle switch */}
              <div
                className={`w-9 h-5 rounded-full relative transition-colors duration-200 shrink-0 ${
                  isPublic ? "bg-cyan-500" : "bg-slate-300 dark:bg-slate-800"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${
                    isPublic ? "translate-x-[18px]" : "translate-x-[2px]"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-200/80 dark:border-blue-500/20 bg-slate-50/80 dark:bg-[#0e1629]">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirm();
            }}
            disabled={isUploading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-md shadow-blue-500/25 transition-all"
          >
            <OpenShareLogo size={16} />
            <span>Confirm & Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
