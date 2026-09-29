"use client";

import { useState, useEffect } from "react";
import { StarIcon } from "@/components/icons";
import { GITHUB_REPO, GITHUB_URL } from "@/lib/constants";

export function StarsBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch(`https://api.github.com/repos/${GITHUB_REPO}`)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.stargazers_count === "number") {
          setCount(data.stargazers_count);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noopener noreferrer"
      title="Star tech-anupam/OpenShare on GitHub"
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 hover:opacity-80"
      style={{
        color: "var(--text-secondary)",
        background: "var(--bg-elevated)",
      }}
    >
      <StarIcon size={13} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
      <span className="hidden md:inline">Star</span>
      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
        {count !== null ? count : "0"}
      </span>
    </a>
  );
}
