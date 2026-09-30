import { NextRequest, NextResponse } from "next/server";
import { getShare } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const share = await getShare(id);

  if (!share || share.expires_at <= Date.now()) {
    return new NextResponse("Share not found or expired", { status: 404 });
  }

  if (share.type === "file" && share.content && !share.encrypted) {
    try {
      const fileRes = await fetch(share.content);
      if (!fileRes.ok || !fileRes.body) {
        return NextResponse.redirect(share.content);
      }

      const headers = new Headers();
      const rawFileName = share.file_name || `file_${id}`;
      // Clean ASCII filename fallback + RFC 5987 UTF-8 encoded filename
      const asciiFileName = rawFileName.replace(/[^\x20-\x7E]/g, "_");
      const utf8FileName = encodeURIComponent(rawFileName);

      headers.set(
        "Content-Disposition",
        `attachment; filename="${asciiFileName}"; filename*=UTF-8''${utf8FileName}`
      );
      headers.set("Content-Type", share.file_type || "application/octet-stream");
      if (share.file_size) {
        headers.set("Content-Length", String(share.file_size));
      }
      headers.set("Cache-Control", "public, max-age=3600");

      return new NextResponse(fileRes.body as unknown as ReadableStream, {
        status: 200,
        headers,
      });
    } catch {
      return NextResponse.redirect(share.content);
    }
  }

  return NextResponse.redirect(`/${id}`);
}
