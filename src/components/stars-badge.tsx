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
      title="Star us on GitHub"
      className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:opacity-80"
      style={{
        color: "var(--text-muted)",
      }}
    >
      <StarIcon
        size={13}
        style={{ color: "#f59e0b", fill: "#f59e0b" }}
      />
      <span>Star</span>
      {count !== null && (
        <span
          className="font-semibold tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      )}
    </a>
  );
}
