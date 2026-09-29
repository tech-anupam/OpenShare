const adjectives = [
  "Swift", "Silent", "Cosmic", "Neon", "Crimson",
  "Frozen", "Lunar", "Shadow", "Iron", "Crystal",
  "Amber", "Velvet", "Cobalt", "Phantom", "Rustic",
  "Ember", "Onyx", "Azure", "Ivory", "Scarlet",
  "Misty", "Hollow", "Vivid", "Feral", "Dusk",
];

const nouns = [
  "Fox", "Owl", "Wolf", "Hawk", "Bear",
  "Lynx", "Crow", "Moth", "Pike", "Wren",
  "Hare", "Vole", "Kite", "Newt", "Ibis",
  "Orca", "Lark", "Frog", "Crab", "Dove",
  "Mole", "Swan", "Wasp", "Yak", "Tern",
];

const colors = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#a855f7",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#06b6d4",
  "#84cc16", "#e11d48", "#0891b2", "#7c3aed", "#dc2626",
];

export function randomName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}`;
}

export function nameToColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function nameToInitials(name: string): string {
  const parts = name.match(/[A-Z]/g);
  if (parts && parts.length >= 2) {
    return parts[0] + parts[1];
  }
  return name.slice(0, 2).toUpperCase();
}
