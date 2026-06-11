import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.wantedPost.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, whatsapp: true, avatar: true } },
      responses: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const post = await prisma.wantedPost.findUnique({ where: { id } });
  if (!post || post.userId !== session.id && !session.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, category, maxPrice, location, phone, email, attachment, attachType } = await req.json();
  if (!title || !description || !category) {
    return NextResponse.json({ error: "שדות חובה חסרים" }, { status: 400 });
  }

  const updated = await prisma.wantedPost.update({
    where: { id },
    data: {
      title, description, category,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      location, phone, email,
      attachment: attachment ?? null,
      attachType: attachType ?? null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const post = await prisma.wantedPost.findUnique({ where: { id } });
  if (!post || post.userId !== session.id && !session.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.wantedPost.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
