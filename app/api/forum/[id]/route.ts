import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, avatar: true } },
      answers: {
        where: { parentId: null },
        include: {
          user: { select: { name: true, avatar: true } },
          replies: {
            include: { user: { select: { name: true, avatar: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(question);
}

// Remove the attachment from the question (owner only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const question = await prisma.question.findUnique({ where: { id } });
  if (!question || question.userId !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // Clear-attachment shortcut
  if (body.clearAttachment) {
    await prisma.question.update({
      where: { id },
      data: { attachment: null, attachType: null },
    });
    return NextResponse.json({ success: true });
  }

  // Full edit of the question
  if (body.title !== undefined || body.body !== undefined) {
    if (!body.title || !body.body) {
      return NextResponse.json({ error: "כותרת ותוכן הם שדות חובה" }, { status: 400 });
    }
    const updated = await prisma.question.update({
      where: { id },
      data: {
        title: body.title,
        body: body.body,
        attachment: body.attachment ?? null,
        attachType: body.attachType ?? null,
      },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const question = await prisma.question.findUnique({ where: { id } });
  if (!question || question.userId !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.question.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
