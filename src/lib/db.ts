import fs from "fs";
import os from "os";
import path from "path";
import { Redis } from "@upstash/redis";

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

function getDirectory(): string {
  if (
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NODE_ENV === "production"
  ) {
    return path.join(os.tmpdir(), "openshare", "shares");
  }
  return path.join(process.cwd(), "data", "shares");
}

const DATA_DIR = getDirectory();

function ensureDir(): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return true;
  } catch {
    return false;
  }
}

function sharePath(id: string): string {
  return path.join(DATA_DIR, `${id}.json`);
}

function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) {
    try {
      return new Redis({ url, token });
    } catch {
      return null;
    }
  }
  return null;
}

export async function createShare(share: Omit<Share, "views">): Promise<void> {
  const full: Share = { ...share, views: 0 };
  const redis = getRedis();

  if (redis) {
    try {
      const ttlSeconds = Math.max(
        1,
        Math.floor((share.expires_at - Date.now()) / 1000)
      );
      await redis.set(`share:${share.id}`, JSON.stringify(full), {
        ex: ttlSeconds,
      });
      if (share.is_public) {
        await redis.zadd("public_shares", {
          score: share.created_at,
          member: share.id,
        });
      }
      return;
    } catch {}
  }

  ensureDir();
  try {
    fs.writeFileSync(sharePath(share.id), JSON.stringify(full), "utf-8");
  } catch {}
}

export async function getShare(id: string): Promise<Share | null> {
  const redis = getRedis();

  if (redis) {
    try {
      const data = await redis.get<Share | string>(`share:${id}`);
      if (!data) return null;
      if (typeof data === "string") {
        return JSON.parse(data) as Share;
      }
      return data as Share;
    } catch {}
  }

  const fp = sharePath(id);
  try {
    if (!fs.existsSync(fp)) return null;
    const raw = fs.readFileSync(fp, "utf-8");
    return JSON.parse(raw) as Share;
  } catch {
    return null;
  }
}

export async function incrementViews(id: string): Promise<void> {
  const redis = getRedis();

  if (redis) {
    try {
      const share = await getShare(id);
      if (share) {
        share.views += 1;
        const ttlSeconds = Math.max(
          1,
          Math.floor((share.expires_at - Date.now()) / 1000)
        );
        await redis.set(`share:${id}`, JSON.stringify(share), {
          ex: ttlSeconds,
        });
      }
      return;
    } catch {}
  }

  const share = await getShare(id);
  if (!share) return;
  share.views += 1;
  try {
    fs.writeFileSync(sharePath(id), JSON.stringify(share), "utf-8");
  } catch {}
}

export async function deleteShare(id: string): Promise<void> {
  const redis = getRedis();

  if (redis) {
    try {
      await redis.del(`share:${id}`);
      await redis.zrem("public_shares", id);
      return;
    } catch {}
  }

  const fp = sharePath(id);
  try {
    if (fs.existsSync(fp)) {
      fs.unlinkSync(fp);
    }
  } catch {}
}

export async function deleteExpiredShares(): Promise<number> {
  const redis = getRedis();

  if (redis) {
    try {
      const ids = await redis.zrange<string[]>("public_shares", 0, -1);
      const now = Date.now();
      let count = 0;
      if (ids && ids.length > 0) {
        for (const id of ids) {
          const item = await redis.get<Share>(`share:${id}`);
          if (!item || item.expires_at <= now) {
            await redis.zrem("public_shares", id);
            await redis.del(`share:${id}`);
            count++;
          }
        }
      }
      return count;
    } catch {}
  }

  ensureDir();
  const now = Date.now();
  let count = 0;
  try {
    if (!fs.existsSync(DATA_DIR)) return 0;
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
  } catch {
    return 0;
  }
  return count;
}

export async function getPublicShares(limit: number = 20): Promise<Share[]> {
  const redis = getRedis();

  if (redis) {
    try {
      const ids = await redis.zrange<string[]>("public_shares", 0, limit - 1, {
        rev: true,
      });
      if (!ids || ids.length === 0) return [];
      const now = Date.now();
      const shares: Share[] = [];
      for (const id of ids) {
        const item = await redis.get<Share | string>(`share:${id}`);
        const share =
          typeof item === "string" ? (JSON.parse(item) as Share) : item;
        if (share && share.is_public && share.expires_at > now) {
          shares.push(share);
        } else if (share && share.expires_at <= now) {
          await redis.zrem("public_shares", id);
          await redis.del(`share:${id}`);
        }
      }
      return shares;
    } catch {}
  }

  const ok = ensureDir();
  if (!ok) return [];
  const now = Date.now();
  const results: Share[] = [];
  try {
    if (!fs.existsSync(DATA_DIR)) return [];
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
  } catch {
    return [];
  }
  results.sort((a, b) => b.created_at - a.created_at);
  return results.slice(0, limit);
}
