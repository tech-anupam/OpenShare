"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { LockIcon, EyeIcon, ClockIcon } from "@/components/icons";
import { MockAvatar } from "@/components/mock-avatar";

interface PublicShare {
  id: string;
  type: "file" | "paste";
  has_password: boolean;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  created_at: number;
  expires_at: number;
  views: number;
}

type SortOption = "newest" | "expiring" | "views" | "size";
type FilterOption = "all" | "file" | "paste" | "image" | "video";

const ITEMS_PER_PAGE = 8;

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function timeUntil(timestamp: number): string {
  const diff = timestamp - Date.now();
  if (diff <= 0) return "expired";
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return `${minutes}m left`;
  if (hours < 24) return `${hours}h left`;
  return `${days}d left`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getTypeBadge(share: PublicShare): { label: string; bg: string; text: string } {
  if (share.type === "paste") {
    return { label: "PASTE", bg: "rgba(6, 182, 212, 0.12)", text: "#06b6d4" };
  }

  const name = (share.file_name || "").toLowerCase();
  const mime = (share.file_type || "").toLowerCase();

  if (/\.(zip|tar|gz|rar|7z|bz2)$/i.test(name) || mime.includes("zip") || mime.includes("compressed")) {
    return { label: "ARCHIVE", bg: "rgba(245, 158, 11, 0.14)", text: "#f59e0b" };
  }
  if (mime.startsWith("image/") || /\.(png|jpg|jpeg|gif|svg|webp|bmp|ico)$/i.test(name)) {
    return { label: "IMAGE", bg: "rgba(16, 185, 129, 0.14)", text: "#10b981" };
  }
  if (mime.startsWith("video/") || /\.(mp4|webm|mov|mkv)$/i.test(name)) {
    return { label: "VIDEO", bg: "rgba(59, 130, 246, 0.14)", text: "#3b82f6" };
  }
  if (mime.startsWith("audio/") || /\.(mp3|wav|ogg|flac)$/i.test(name)) {
    return { label: "AUDIO", bg: "rgba(236, 72, 153, 0.14)", text: "#ec4899" };
  }
  if (name.endsWith(".pdf") || mime === "application/pdf") {
    return { label: "PDF", bg: "rgba(239, 68, 68, 0.14)", text: "#ef4444" };
  }
  if (/\.(md|markdown)$/i.test(name)) {
    return { label: "MD", bg: "rgba(139, 92, 246, 0.14)", text: "#8b5cf6" };
  }
  if (/\.(js|ts|tsx|jsx|py|rs|go|json|html|css|sql|sh)$/i.test(name)) {
    const ext = name.split(".").pop()?.toUpperCase() || "CODE";
    return { label: ext, bg: "rgba(99, 102, 241, 0.14)", text: "#6366f1" };
  }

  return { label: "FILE", bg: "var(--bg-elevated)", text: "var(--text-muted)" };
}

export default function ArchivesPage() {
  const [shares, setShares] = useState<PublicShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOption>("newest");
  const [filter, setFilter] = useState<FilterOption>("all");

  useEffect(() => {
    fetch("/api/shares/public")
      .then((r) => r.json())
      .then((data) => setShares(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const processedShares = useMemo(() => {
    const filtered = shares.filter((s) => {
      if (filter === "file") return s.type === "file";
      if (filter === "paste") return s.type === "paste";
      if (filter === "image") return s.file_type?.startsWith("image/");
      if (filter === "video") return s.file_type?.startsWith("video/");
      return true;
    });

    filtered.sort((a, b) => {
      if (sort === "expiring") return a.expires_at - b.expires_at;
      if (sort === "views") return b.views - a.views;
      if (sort === "size") return (b.file_size || 0) - (a.file_size || 0);
      return b.created_at - a.created_at;
    });

    return filtered;
  }, [shares, filter, sort]);

  const totalPages = Math.max(1, Math.ceil(processedShares.length / ITEMS_PER_PAGE));
  const currentShares = processedShares.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (f: FilterOption) => {
    setFilter(f);
    setPage(1);
  };

  const handleSortChange = (s: SortOption) => {
    setSort(s);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="mt-8 space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="h-16 rounded-2xl animate-pulse"
            style={{ background: "var(--bg-card)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b" style={{ borderColor: "var(--border)" }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Public Archives
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {processedShares.length} {processedShares.length === 1 ? "item" : "items"} available
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value as FilterOption)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border outline-none cursor-pointer"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="all">All Content</option>
            <option value="file">Files</option>
            <option value="paste">Pastes</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>

          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border outline-none cursor-pointer"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="newest">Newest</option>
            <option value="expiring">Expiring Soon</option>
            <option value="views">Most Viewed</option>
            <option value="size">Largest Size</option>
          </select>
        </div>
      </div>

      {currentShares.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16">
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            No matching shares found
          </p>
          {(filter !== "all" || sort !== "newest") && (
            <button
              onClick={() => {
                setFilter("all");
                setSort("newest");
                setPage(1);
              }}
              className="text-xs underline"
              style={{ color: "var(--accent)" }}
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {currentShares.map((share) => {
            const badge = getTypeBadge(share);
            const createdDate = new Date(share.created_at).toLocaleString();

            return (
              <Link
                key={share.id}
                href={`/${share.id}`}
                className="flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 active:scale-99 hover:border-blue-500"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                }}
              >
                <MockAvatar id={share.id} size={36} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {share.type === "file" && share.file_name
                        ? share.file_name
                        : share.type === "paste"
                        ? "Untitled paste"
                        : "File"}
                    </span>
                    {share.has_password && (
                      <LockIcon size={12} style={{ color: "var(--text-muted)" }} />
                    )}
                  </div>

                  <div
                    className="flex items-center gap-2.5 mt-0.5 text-xs flex-wrap"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span className="font-mono text-[11px] opacity-75">#{share.id}</span>
                    <span title={createdDate}>{timeAgo(share.created_at)}</span>
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--accent)" }}>
                      <ClockIcon size={11} />
                      {timeUntil(share.expires_at)}
                    </span>
                    {share.file_size && <span>{formatSize(share.file_size)}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div
                    className="flex items-center gap-1 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <EyeIcon size={12} />
                    <span>{share.views}</span>
                  </div>

                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase shrink-0"
                    style={{
                      background: badge.bg,
                      color: badge.text,
                    }}
                  >
                    {badge.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-30"
            style={{
              borderColor: "var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
            }}
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-7 h-7 rounded-lg text-xs font-semibold transition-colors"
                style={{
                  background: p === page ? "var(--accent)" : "transparent",
                  color: p === page ? "#ffffff" : "var(--text-secondary)",
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-30"
            style={{
              borderColor: "var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
