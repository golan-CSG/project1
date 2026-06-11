import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ answerId: string }> }) {
  const { answerId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const answer = await prisma.answer.findUnique({ where: { id: answerId } });
  if (!answer || answer.userId !== session.id && !session.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clearAttachment } = await req.json();
  if (clearAttachment) {
    await prisma.answer.update({
      where: { id: answerId },
      data: { attachment: null, attachType: null },
    });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ answerId: string }> }) {
  const { answerId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const answer = await prisma.answer.findUnique({ where: { id: answerId } });
  if (!answer || (answer.userId !== session.id && !session.isAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Deleting a top-level answer also removes its replies (cascade on parentId)
  await prisma.answer.delete({ where: { id: answerId } });
  return NextResponse.json({ success: true });
}
