import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, whatsapp: true, createdAt: true },
  });

  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { name, whatsapp } = await req.json();

  if (!name || !whatsapp) {
    return NextResponse.json({ error: "שם וטלפון הם שדות חובה" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.id },
    data: { name, whatsapp },
    select: { id: true, name: true, email: true, whatsapp: true, createdAt: true },
  });

  return NextResponse.json(updated);
}
