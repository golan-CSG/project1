import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const KEY = "terms";

export async function GET() {
  const content = await prisma.siteContent.findUnique({ where: { key: KEY } });
  return NextResponse.json({ value: content?.value || "" });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  if (!session.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { value } = await req.json();

  const content = await prisma.siteContent.upsert({
    where: { key: KEY },
    create: { key: KEY, value: value || "" },
    update: { value: value || "" },
  });

  return NextResponse.json({ value: content.value });
}
