import { NextResponse } from "next/server";
import { getPublicShares } from "@/lib/db";

export async function GET() {
  const shares = await getPublicShares(50);

  const safe = shares.map((s) => ({
    id: s.id,
    type: s.type,
    has_password: Boolean(s.password_hash),
    file_name: s.file_name,
    file_type: s.file_type,
    file_size: s.file_size,
    created_at: s.created_at,
    expires_at: s.expires_at,
    views: s.views,
  }));

  return NextResponse.json(safe);
}
