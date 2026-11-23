import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 512 * 1024 * 1024;

async function uploadToZeroXZero(file: File): Promise<string | null> {
  const body = new FormData();
  body.append("file", file);
  body.append("reqtype", "fileupload");
  body.append("secret", "");
  body.append("expires", "");

  try {
    const response = await fetch("https://0x0.st", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(120_000),
    });
    if (!response.ok) return null;
    const url = (await response.text()).trim();
    return /^https?:\/\//.test(url) ? url : null;
  } catch {
    return null;
  }
}

async function uploadToCatbox(file: File): Promise<string | null> {
  const body = new FormData();
  body.append("reqtype", "fileupload");
  body.append("fileToUpload", file);

  try {
    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(120_000),
    });
    if (!response.ok) return null;
    const url = (await response.text()).trim();
    return /^https?:\/\//.test(url) ? url : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }
    if (file.size <= 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Files must be 512 MB or smaller" },
        { status: 413 }
      );
    }

    const url = (await uploadToZeroXZero(file)) || (await uploadToCatbox(file));
    if (!url) {
      return NextResponse.json(
        { error: "No anonymous file provider is currently available" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { url, name: file.name, size: file.size, type: file.type },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Anonymous file upload failed:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
