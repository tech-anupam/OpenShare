"use client";

import { useTheme } from "@/hooks/use-theme";
import { SunIcon, MoonIcon } from "@/components/icons";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={(e) => toggle(e)}
      className="relative flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-200"
      style={{
        background: "var(--bg-elevated)",
        color: "var(--text-primary)",
      }}
      aria-label="Toggle theme"
    >
      <div
        className="transition-transform duration-300"
        style={{
          transform: theme === "dark" ? "rotate(0deg)" : "rotate(180deg)",
        }}
      >
        {theme === "dark" ? <MoonIcon size={16} /> : <SunIcon size={16} />}
      </div>
    </button>
  );
}
