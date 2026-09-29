"use client";

const PALETTES = [
  { bg: "#3b82f6", fg: "#ffffff", accent: "#93c5fd" },
  { bg: "#10b981", fg: "#ffffff", accent: "#a7f3d0" },
  { bg: "#8b5cf6", fg: "#ffffff", accent: "#ddd6fe" },
  { bg: "#f59e0b", fg: "#ffffff", accent: "#fde68a" },
  { bg: "#ec4899", fg: "#ffffff", accent: "#fbcfe8" },
  { bg: "#06b6d4", fg: "#ffffff", accent: "#a5f3fc" },
  { bg: "#6366f1", fg: "#ffffff", accent: "#c7d2fe" },
  { bg: "#14b8a6", fg: "#ffffff", accent: "#99f6e4" },
];

export function MockAvatar({ id, size = 36 }: { id: string; size?: number }) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTES.length;
  const p = PALETTES[index];

  const variant = Math.abs(hash >> 3) % 4;

  return (
    <div
      className="flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: p.bg,
      }}
    >
      <svg
        width={size * 0.7}
        height={size * 0.7}
        viewBox="0 0 24 24"
        fill="none"
      >
        {variant === 0 && (
          <>
            <rect x="5" y="5" width="6" height="6" rx="2" fill={p.fg} />
            <rect x="13" y="5" width="6" height="6" rx="2" fill={p.accent} />
            <rect x="5" y="13" width="14" height="6" rx="2" fill={p.fg} />
          </>
        )}
        {variant === 1 && (
          <>
            <circle cx="8" cy="9" r="3" fill={p.fg} />
            <circle cx="16" cy="9" r="3" fill={p.fg} />
            <rect x="7" y="15" width="10" height="3" rx="1.5" fill={p.accent} />
          </>
        )}
        {variant === 2 && (
          <>
            <rect x="4" y="6" width="16" height="12" rx="4" fill={p.fg} />
            <circle cx="9" cy="12" r="1.5" fill={p.bg} />
            <circle cx="15" cy="12" r="1.5" fill={p.bg} />
            <rect x="10.5" y="2" width="3" height="4" rx="1.5" fill={p.accent} />
          </>
        )}
        {variant === 3 && (
          <>
            <rect x="4" y="4" width="7" height="7" rx="2" fill={p.fg} />
            <rect x="13" y="13" width="7" height="7" rx="2" fill={p.fg} />
            <circle cx="16.5" cy="7.5" r="3.5" fill={p.accent} />
            <circle cx="7.5" cy="16.5" r="3.5" fill={p.accent} />
          </>
        )}
      </svg>
    </div>
  );
}
