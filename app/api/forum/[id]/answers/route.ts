import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { body, attachment, attachType, parentId } = await req.json();
  if (!body) return NextResponse.json({ error: "תוכן התשובה הוא שדה חובה" }, { status: 400 });

  const answer = await prisma.answer.create({
    data: { body, attachment, attachType, questionId: id, userId: session.id, parentId: parentId || null },
    include: { user: { select: { name: true, avatar: true } } },
  });

  return NextResponse.json(answer);
}
