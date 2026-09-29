import { NextRequest, NextResponse } from "next/server";
import { createShare } from "@/lib/db";
import { createId } from "@/lib/id";
import { hashPassword } from "@/lib/crypto";
import { DEFAULT_EXPIRY } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      type,
      content,
      password,
      encrypted,
      encryption_salt,
      encryption_iv,
      expiry,
      is_public,
      file_name,
      file_size,
      file_type,
    } = body;

    if (!type || !content) {
      return NextResponse.json(
        { error: "type and content are required" },
        { status: 400 }
      );
    }

    if (type !== "file" && type !== "paste") {
      return NextResponse.json(
        { error: "type must be file or paste" },
        { status: 400 }
      );
    }

    const id = createId();
    const now = Date.now();
    const expiresAt = now + (expiry || DEFAULT_EXPIRY) * 1000;

    let passwordHash: string | null = null;
    if (password) {
      passwordHash = await hashPassword(password);
    }

    createShare({
      id,
      type,
      content,
      password_hash: passwordHash,
      encrypted: Boolean(encrypted),
      encryption_salt: encryption_salt || null,
      encryption_iv: encryption_iv || null,
      expires_at: expiresAt,
      created_at: now,
      is_public: is_public !== false,
      file_name: file_name || null,
      file_size: file_size || null,
      file_type: file_type || null,
    });

    return NextResponse.json({ id, expires_at: expiresAt });
  } catch {
    return NextResponse.json(
      { error: "Failed to create share" },
      { status: 500 }
    );
  }
}
