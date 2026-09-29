import { NextRequest, NextResponse } from "next/server";
import { getShare, incrementViews } from "@/lib/db";
import { verifyPassword } from "@/lib/crypto";
import { getDeliveryUrl } from "@/lib/cdn";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const share = getShare(id);

  if (!share) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (share.expires_at <= Date.now()) {
    return NextResponse.json({ error: "Expired" }, { status: 410 });
  }

  const meta = {
    id: share.id,
    type: share.type,
    has_password: Boolean(share.password_hash),
    encrypted: share.encrypted,
    is_public: share.is_public,
    file_name: share.file_name,
    file_size: share.file_size,
    file_type: share.file_type,
    created_at: share.created_at,
    expires_at: share.expires_at,
    views: share.views,
  };

  if (!share.password_hash) {
    incrementViews(id);

    let content = share.content;
    let cdn = null;
    if (share.type === "file" && !share.encrypted) {
      cdn = getDeliveryUrl(share.content, share.file_type);
    }

    return NextResponse.json({
      ...meta,
      content,
      cdn,
      encryption_salt: share.encryption_salt,
      encryption_iv: share.encryption_iv,
    });
  }

  return NextResponse.json(meta);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const share = getShare(id);

  if (!share) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (share.expires_at <= Date.now()) {
    return NextResponse.json({ error: "Expired" }, { status: 410 });
  }

  if (!share.password_hash) {
    return NextResponse.json({ error: "No password set" }, { status: 400 });
  }

  const body = await req.json();
  const { password } = body;

  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const valid = await verifyPassword(password, share.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Wrong password" }, { status: 403 });
  }

  incrementViews(id);

  return NextResponse.json({
    content: share.content,
    encryption_salt: share.encryption_salt,
    encryption_iv: share.encryption_iv,
  });
}
