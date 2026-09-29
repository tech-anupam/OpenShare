"use client";

import { EXPIRY_OPTIONS } from "@/lib/constants";
import { ClockIcon, LockIcon, GlobeIcon, EyeIcon, EyeOffIcon } from "@/components/icons";
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

  return (
    <div
      className="rounded-2xl border divide-y overflow-hidden shadow-sm backdrop-blur-md"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center w-6 h-6 rounded-lg shrink-0"
            style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
          >
            <ClockIcon size={13} />
          </div>
          <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
            Expiry
          </span>
        </div>

        <div
          className="inline-flex p-0.5 rounded-lg border gap-0.5"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--border)",
          }}
        >
          {EXPIRY_OPTIONS.map((opt) => {
            const active = expiry === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onExpiryChange(opt.value)}
                className="px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all duration-150"
                style={{
                  background: active ? "var(--accent)" : "transparent",
                  color: active ? "#ffffff" : "var(--text-muted)",
                  boxShadow: active ? "0 1px 3px rgba(0, 0, 0, 0.15)" : "none",
                }}
              >
                {opt.label.replace(" hours", "h").replace(" hour", "h").replace(" days", "d")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center px-3.5 py-2 gap-2">
        <div
          className="flex items-center justify-center w-6 h-6 rounded-lg shrink-0"
          style={{
            background: password ? "var(--accent)" : "var(--bg-elevated)",
            color: password ? "#ffffff" : "var(--text-muted)",
          }}
        >
          <LockIcon size={13} />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Password protect (optional)"
          className="flex-1 text-xs bg-transparent outline-none py-1 placeholder:text-[var(--text-muted)]"
          style={{ color: "var(--text-primary)" }}
        />
        {password.length > 0 && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 hover:opacity-75 transition-opacity"
            style={{ color: "var(--text-muted)" }}
          >
            {showPassword ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
          </button>
        )}
      </div>

      <div
        className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors select-none"
        onClick={() => onPublicChange(!isPublic)}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center w-6 h-6 rounded-lg shrink-0"
            style={{
              background: isPublic ? "rgba(6, 182, 212, 0.15)" : "var(--bg-elevated)",
              color: isPublic ? "#06b6d4" : "var(--text-muted)",
            }}
          >
            <GlobeIcon size={13} />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              Public Archives
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {isPublic ? "Visible in public explore list" : "Unlisted, direct link only"}
            </p>
          </div>
        </div>

        <div
          className="w-8 h-4 rounded-full relative transition-colors duration-200"
          style={{
            background: isPublic ? "var(--accent)" : "var(--bg-elevated)",
          }}
        >
          <div
            className="absolute top-0.5 w-3 h-3 rounded-full transition-transform duration-200"
            style={{
              background: "#ffffff",
              transform: isPublic ? "translateX(17px)" : "translateX(2px)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
