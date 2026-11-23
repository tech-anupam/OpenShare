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
const shareCache = new Map<string, Share>();

function ensureDir(): boolean {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

function sharePath(id: string): string {
  return path.join(DATA_DIR, `${id}.json`);
}

export async function createShare(share: Omit<Share, "views">): Promise<void> {
  if (!ensureDir()) throw new Error("Share storage is unavailable");

  const full: Share = { ...share, views: 0 };
  const target = sharePath(full.id);
  const temporary = `${target}.${process.pid}.tmp`;

  try {
    fs.writeFileSync(temporary, JSON.stringify(full), {
      encoding: "utf-8",
      mode: 0o600,
    });
    fs.renameSync(temporary, target);
    shareCache.set(full.id, full);
  } catch (error) {
    try {
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    } catch {}
    console.error("Failed to persist share:", error);
    throw new Error("Share storage is unavailable");
  }
}

export async function getShare(id: string): Promise<Share | null> {
  const cached = shareCache.get(id);
  if (cached) return cached;

  try {
    const fp = sharePath(id);
    if (!fs.existsSync(fp)) return null;
    const share = JSON.parse(fs.readFileSync(fp, "utf-8")) as Share;
    shareCache.set(id, share);
    return share;
  } catch {
    return null;
  }
}

export async function incrementViews(id: string): Promise<void> {
  const share = await getShare(id);
  if (!share) return;

  share.views += 1;
  try {
    const target = sharePath(id);
    const temporary = `${target}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(share), {
      encoding: "utf-8",
      mode: 0o600,
    });
    fs.renameSync(temporary, target);
    shareCache.set(id, share);
  } catch {}
}

export async function deleteShare(id: string): Promise<void> {
  shareCache.delete(id);
  try {
    const fp = sharePath(id);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  } catch {}
}

export async function deleteExpiredShares(): Promise<number> {
  if (!ensureDir()) return 0;

  const now = Date.now();
  let count = 0;
  try {
    for (const file of fs.readdirSync(DATA_DIR)) {
      if (!file.endsWith(".json")) continue;
      const fp = path.join(DATA_DIR, file);
      try {
        const share = JSON.parse(fs.readFileSync(fp, "utf-8")) as Share;
        if (share.expires_at <= now) {
          fs.unlinkSync(fp);
          shareCache.delete(share.id);
          count++;
        }
      } catch {}
    }
  } catch {}
  return count;
}

export async function getPublicShares(limit: number = 20): Promise<Share[]> {
  if (!ensureDir()) return [];

  const now = Date.now();
  const results: Share[] = [];
  try {
    for (const file of fs.readdirSync(DATA_DIR)) {
      if (!file.endsWith(".json")) continue;
      try {
        const share = JSON.parse(
          fs.readFileSync(path.join(DATA_DIR, file), "utf-8")
        ) as Share;
        if (share.is_public && share.expires_at > now) {
          results.push(share);
          shareCache.set(share.id, share);
        }
      } catch {}
    }
  } catch {
    return [];
  }

  return results
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, limit);
}
