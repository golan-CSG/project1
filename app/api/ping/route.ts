import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Lightweight endpoint to keep the Neon database warm.
// Ping this every ~5 minutes from an external cron service.
export async function GET() {
  try {
    await prisma.user.count();
    return NextResponse.json({ ok: true, ts: Date.now() });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
