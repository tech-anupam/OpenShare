"use client";

import Link from "next/link";
import { FeedbackIcon } from "@/components/icons";

export function FeedbackButton() {
  return (
    <Link
      href="/feedback"
      className="flex items-center gap-1.5 px-2 py-1.5 text-xs transition-colors duration-200"
      style={{ color: "var(--text-secondary)" }}
    >
      <FeedbackIcon size={14} />
      <span className="hidden sm:inline">Feedback</span>
    </Link>
  );
}
