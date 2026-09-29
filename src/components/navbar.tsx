"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { StarsBadge } from "@/components/stars-badge";
import { UploadIcon, GlobeIcon, FeedbackIcon, HeartIcon } from "@/components/icons";

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const pill = (active: boolean) => ({
    background: active ? "var(--accent)" : "transparent",
    color: active ? "#ffffff" : "var(--text-secondary)",
  });

  return (
    <nav
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-xl shadow-sm"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
    >
      <Link
        href="/"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
        style={pill(isActive("/"))}
      >
        <UploadIcon size={14} />
        <span>Share</span>
      </Link>

      <Link
        href="/archives"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
        style={pill(isActive("/archives"))}
      >
        <GlobeIcon size={14} />
        <span className="hidden sm:inline">Archives</span>
      </Link>

      <Link
        href="/donate"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
        style={pill(isActive("/donate"))}
      >
        <HeartIcon size={14} />
        <span className="hidden sm:inline">Support</span>
      </Link>

      <div className="w-px h-4 mx-0.5" style={{ background: "var(--border)" }} />

      <Link
        href="/feedback"
        title="Send Feedback"
        className="flex items-center justify-center w-8 h-8 rounded-full text-xs transition-colors duration-200"
        style={{
          color: isActive("/feedback") ? "var(--accent)" : "var(--text-secondary)",
          background: isActive("/feedback") ? "var(--bg-elevated)" : "transparent",
        }}
      >
        <FeedbackIcon size={15} />
      </Link>

      <StarsBadge />

      <div className="w-px h-4 mx-0.5" style={{ background: "var(--border)" }} />

      <ThemeToggle />
    </nav>
  );
}
