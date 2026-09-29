import { NextRequest, NextResponse } from "next/server";
import { getShare } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const share = getShare(id);

  if (!share) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (share.expires_at <= Date.now()) {
    return new NextResponse("Share has expired", {
      status: 410,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (share.password_hash || share.encrypted) {
    return new NextResponse(
      "This share is encrypted or password-protected. Please unlock on the main view page.",
      {
        status: 401,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }
    );
  }

  if (share.type === "paste") {
    return new NextResponse(share.content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  if (share.type === "file") {
    const isTextFile =
      share.file_type?.startsWith("text/") ||
      /\.(md|markdown|txt|json|js|ts|tsx|jsx|css|html|py|rs|go|sh|yml|yaml|sql|env)$/i.test(
        share.file_name || ""
      );

    if (isTextFile) {
      try {
        const response = await fetch(share.content);
        const text = await response.text();
        return new NextResponse(text, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      } catch {
        return NextResponse.redirect(share.content);
      }
    }

    return NextResponse.redirect(share.content);
  }

  return new NextResponse("Invalid share type", { status: 400 });
}
