import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  if (!session.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, whatsapp: true, avatar: true,
      isAdmin: true, createdAt: true,
      _count: { select: { listings: true, questions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
