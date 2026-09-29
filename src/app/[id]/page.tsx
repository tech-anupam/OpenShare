"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { PasswordGate } from "@/components/password-gate";
import { ViewFile } from "@/components/view-file";
import { ViewPaste } from "@/components/view-paste";
import { ClockIcon, ShieldIcon } from "@/components/icons";
import { decrypt } from "@/lib/crypto";
import { useToast } from "@/components/toast";

interface CdnUrls {
  preview: string;
  download: string;
  thumbnail: string;
}

interface ShareMeta {
  id: string;
  type: "file" | "paste";
  has_password: boolean;
  encrypted: boolean;
  is_public: boolean;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  created_at: number;
  expires_at: number;
  views: number;
  content?: string;
  cdn?: CdnUrls | null;
  encryption_salt?: string;
  encryption_iv?: string;
}

function Skeleton() {
  return (
    <div className="space-y-4 mt-8">
      <div className="h-10 rounded-xl animate-pulse" style={{ background: "var(--bg-card)" }} />
      <div className="h-64 rounded-xl animate-pulse" style={{ background: "var(--bg-card)" }} />
      <div className="h-10 rounded-xl animate-pulse w-1/3 ml-auto" style={{ background: "var(--bg-card)" }} />
    </div>
  );
}

export default function ViewPage() {
  const params = useParams();
  const id = params.id as string;

  const [meta, setMeta] = useState<ShareMeta | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [cdnUrls, setCdnUrls] = useState<CdnUrls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/share/${id}`)
      .then((r) => {
        if (r.status === 404) throw new Error("not_found");
        if (r.status === 410) throw new Error("expired");
        return r.json();
      })
      .then((data) => {
        setMeta(data);
        if (data.cdn) setCdnUrls(data.cdn);
        if (data.content) {
          if (data.encrypted && data.encryption_salt && data.encryption_iv) {
            setContent(null);
          } else {
            setContent(data.content);
          }
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const toast = useToast();

  const handlePasswordSubmit = useCallback(
    async (password: string): Promise<boolean> => {
      const res = await fetch(`/api/share/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        toast.error("Incorrect password. Please try again.");
        return false;
      }

      const data = await res.json();

      if (meta?.encrypted && data.encryption_salt && data.encryption_iv) {
        try {
          const decrypted = await decrypt(
            data.content,
            password,
            data.encryption_salt,
            data.encryption_iv
          );
          setContent(decrypted);
          toast.success("Decrypted successfully!");
        } catch {
          toast.error("Failed to decrypt with this password.");
          return false;
        }
      } else {
        setContent(data.content);
        toast.success("Unlocked successfully!");
      }

      return true;
    },
    [id, meta, toast]
  );

  if (loading) return <Skeleton />;

  if (error === "not_found") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-[60vh]">
        <ShieldIcon size={32} style={{ color: "var(--text-muted)" }} />
        <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>
          Not found
        </p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          This share does not exist or has been removed.
        </p>
      </div>
    );
  }

  if (error === "expired") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-[60vh]">
        <ClockIcon size={32} style={{ color: "var(--text-muted)" }} />
        <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>
          Expired
        </p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          This share has passed its expiration time.
        </p>
      </div>
    );
  }

  if (!meta) return null;

  if (meta.has_password && !content) {
    return <PasswordGate onSubmit={handlePasswordSubmit} />;
  }

  if (!content && meta.encrypted) {
    return <PasswordGate onSubmit={handlePasswordSubmit} />;
  }

  const timeLeft = meta.expires_at - Date.now();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / 3600000));
  const minutesLeft = Math.max(0, Math.floor((timeLeft % 3600000) / 60000));

  const displayUrl = cdnUrls?.preview || content || "";
  const downloadUrl = cdnUrls?.download || content || "";

  return (
    <div className="space-y-4 mt-4 animate-in">
      <div
        className="flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
          color: "var(--text-muted)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <ClockIcon size={12} />
          <span>
            {hoursLeft > 0
              ? `${hoursLeft}h ${minutesLeft}m left`
              : `${minutesLeft}m left`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {cdnUrls && (
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ background: "var(--bg-elevated)", color: "var(--accent)" }}
            >
              CDN
            </span>
          )}
          <span>{meta.views} views</span>
        </div>
      </div>

      {meta.type === "file" && content && (
        <ViewFile
          url={displayUrl}
          downloadUrl={downloadUrl}
          fileName={meta.file_name || "file"}
          fileSize={meta.file_size}
          fileType={meta.file_type}
          shareId={id}
        />
      )}

      {meta.type === "paste" && content && <ViewPaste content={content} shareId={id} />}
    </div>
  );
}
