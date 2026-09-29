import { NextRequest, NextResponse } from "next/server";
import { deleteExpiredShares } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (process.env.CRON_SECRET && authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = deleteExpiredShares();

  return NextResponse.json({
    deleted,
    timestamp: new Date().toISOString(),
  });
}
