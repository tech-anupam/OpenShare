import fs from "fs";
import path from "path";

export interface Share {
  id: string;
  type: "file" | "paste";
  content: string;
  password_hash: string | null;
  encrypted: boolean;
  encryption_salt: string | null;
  encryption_iv: string | null;
  expires_at: number;
  created_at: number;
  is_public: boolean;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  views: number;
}

const DATA_DIR = path.join(process.cwd(), "data", "shares");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function sharePath(id: string): string {
  return path.join(DATA_DIR, `${id}.json`);
}

export function createShare(share: Omit<Share, "views">): void {
  ensureDir();
  const full: Share = { ...share, views: 0 };
  fs.writeFileSync(sharePath(share.id), JSON.stringify(full), "utf-8");
}

export function getShare(id: string): Share | null {
  const fp = sharePath(id);
  if (!fs.existsSync(fp)) return null;
  try {
    const raw = fs.readFileSync(fp, "utf-8");
    return JSON.parse(raw) as Share;
  } catch {
    return null;
  }
}

export function incrementViews(id: string): void {
  const share = getShare(id);
  if (!share) return;
  share.views += 1;
  fs.writeFileSync(sharePath(id), JSON.stringify(share), "utf-8");
}

export function deleteShare(id: string): void {
  const fp = sharePath(id);
  if (fs.existsSync(fp)) {
    fs.unlinkSync(fp);
  }
}

export function deleteExpiredShares(): number {
  ensureDir();
  const now = Date.now();
  let count = 0;
  const files = fs.readdirSync(DATA_DIR);
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const fp = path.join(DATA_DIR, file);
    try {
      const raw = fs.readFileSync(fp, "utf-8");
      const share = JSON.parse(raw) as Share;
      if (share.expires_at <= now) {
        fs.unlinkSync(fp);
        count++;
      }
    } catch {
      continue;
    }
  }
  return count;
}

export function getPublicShares(limit: number = 20): Share[] {
  ensureDir();
  const now = Date.now();
  const results: Share[] = [];
  const files = fs.readdirSync(DATA_DIR);
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const fp = path.join(DATA_DIR, file);
    try {
      const raw = fs.readFileSync(fp, "utf-8");
      const share = JSON.parse(raw) as Share;
      if (share.is_public && share.expires_at > now) {
        results.push(share);
      }
    } catch {
      continue;
    }
  }
  results.sort((a, b) => b.created_at - a.created_at);
  return results.slice(0, limit);
}
