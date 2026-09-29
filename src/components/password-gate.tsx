"use client";

import { useState } from "react";
import { LockIcon, EyeIcon, EyeOffIcon } from "@/components/icons";

interface PasswordGateProps {
  onSubmit: (password: string) => Promise<boolean>;
}

export function PasswordGate({ onSubmit }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError(false);

    const success = await onSubmit(password);
    if (!success) {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div
        className="w-full max-w-sm p-6 rounded-2xl border animate-in"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex flex-col items-center gap-3 mb-6">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full"
            style={{ background: "var(--bg-elevated)" }}
          >
            <LockIcon size={22} style={{ color: "var(--accent)" }} />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Protected content
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Enter the password to view this share
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div
            className="relative flex items-center rounded-xl border px-3 py-2.5"
            style={{
              borderColor: error ? "var(--danger)" : "var(--border)",
              background: "var(--bg-elevated)",
            }}
          >
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Password"
              autoFocus
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: "var(--text-primary)" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ color: "var(--text-muted)" }}
            >
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>

          {error && (
            <p className="text-xs" style={{ color: "var(--danger)" }}>
              Wrong password. Try again.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 disabled:opacity-50"
            style={{
              background: "var(--accent)",
              color: "#ffffff",
            }}
          >
            {loading ? "Verifying..." : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
}
