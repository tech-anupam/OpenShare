"use client";

import { EXPIRY_OPTIONS } from "@/lib/constants";
import { ClockIcon, LockIcon, GlobeIcon, EyeIcon, EyeOffIcon, ShieldIcon, InfoIcon } from "@/components/icons";
import { useState } from "react";

interface ShareOptionsProps {
  expiry: number;
  onExpiryChange: (value: number) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  isPublic: boolean;
  onPublicChange: (value: boolean) => void;
}

export function ShareOptions({
  expiry,
  onExpiryChange,
  password,
  onPasswordChange,
  isPublic,
  onPublicChange,
}: ShareOptionsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(!!password);

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-2 px-1">
        <ShieldIcon size={14} style={{ color: "var(--text-muted)" }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Share Settings
        </span>
      </div>

      <div
        className="rounded-2xl border overflow-hidden shadow-sm"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
      >
        {/* Expiry */}
        <div className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center w-7 h-7 rounded-lg"
                style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--accent)" }}
              >
                <ClockIcon size={14} />
              </div>
              <div>
                <span className="text-xs font-semibold block" style={{ color: "var(--text-primary)" }}>
                  Auto-expire
                </span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  Content is deleted after this period
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {EXPIRY_OPTIONS.map((opt) => {
              const active = expiry === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onExpiryChange(opt.value)}
                  className="px-2 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                  style={{
                    background: active ? "var(--accent)" : "var(--bg-elevated)",
                    color: active ? "#ffffff" : "var(--text-muted)",
                    boxShadow: active ? "0 2px 8px rgba(59, 130, 246, 0.3)" : "none",
                  }}
                >
                  {opt.label.replace(" hours", "h").replace(" hour", "h").replace(" days", "d")}
                </button>
              );
            })}
          </div>
        </div>

        {/* Password protection */}
        <div className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => {
              if (showPasswordField && password) {
                onPasswordChange("");
              }
              setShowPasswordField(!showPasswordField);
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
                style={{
                  background: password ? "var(--accent)" : "rgba(245, 158, 11, 0.1)",
                  color: password ? "#ffffff" : "#f59e0b",
                }}
              >
                <LockIcon size={14} />
              </div>
              <div>
                <span className="text-xs font-semibold block" style={{ color: "var(--text-primary)" }}>
                  Password Protection
                </span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {password ? "Encrypted. Viewers need the password to access" : "Optional. Restrict who can view this"}
                </span>
              </div>
            </div>

            <div
              className="w-9 h-5 rounded-full relative transition-colors duration-200 shrink-0"
              style={{
                background: showPasswordField ? "var(--accent)" : "var(--bg-elevated)",
              }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200 shadow-sm"
                style={{
                  background: "#ffffff",
                  transform: showPasswordField ? "translateX(17px)" : "translateX(2px)",
                }}
              />
            </div>
          </div>

          {showPasswordField && (
            <div className="mt-3 animate-in">
              <div
                className="flex items-center rounded-xl border px-3 py-2.5 gap-2 transition-colors"
                style={{
                  borderColor: password ? "var(--accent)" : "var(--border)",
                  background: "var(--bg-elevated)",
                }}
              >
                <LockIcon size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  placeholder="Enter a secure password"
                  autoFocus
                  className="flex-1 text-xs bg-transparent outline-none placeholder:text-[var(--text-muted)]"
                  style={{ color: "var(--text-primary)" }}
                />
                {password.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPassword(!showPassword);
                    }}
                    className="p-1 hover:opacity-75 transition-opacity"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {showPassword ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                  </button>
                )}
              </div>
              {password && (
                <div className="flex items-center gap-1.5 mt-2 px-1">
                  <ShieldIcon size={10} style={{ color: "var(--success)" }} />
                  <span className="text-[10px] font-medium" style={{ color: "var(--success)" }}>
                    End-to-end encrypted
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Public toggle */}
        <div
          className="flex items-center justify-between px-4 py-3.5 cursor-pointer select-none transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
          onClick={() => onPublicChange(!isPublic)}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
              style={{
                background: isPublic ? "rgba(6, 182, 212, 0.12)" : "var(--bg-elevated)",
                color: isPublic ? "#06b6d4" : "var(--text-muted)",
              }}
            >
              <GlobeIcon size={14} />
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                Public Archives
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {isPublic ? "Visible in public explore" : "Unlisted. Only accessible via direct link"}
              </p>
            </div>
          </div>

          <div
            className="w-9 h-5 rounded-full relative transition-colors duration-200 shrink-0"
            style={{
              background: isPublic ? "#06b6d4" : "var(--bg-elevated)",
            }}
          >
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200 shadow-sm"
              style={{
                background: "#ffffff",
                transform: isPublic ? "translateX(17px)" : "translateX(2px)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
