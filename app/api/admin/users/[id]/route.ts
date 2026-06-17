import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

// Edit user fields and/or toggle admin status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  if (!session.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, email, whatsapp, isAdmin, password } = await req.json();

  // If email is being changed, ensure it's not taken by another user
  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "האימייל כבר בשימוש" }, { status: 400 });
    }
  }

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  if (whatsapp !== undefined) data.whatsapp = whatsapp;
  if (isAdmin !== undefined) data.isAdmin = isAdmin;
  if (password) {
    const pw = password.trim();
    if (pw.length < 4) {
      return NextResponse.json({ error: "הסיסמה חייבת להכיל לפחות 4 תווים" }, { status: 400 });
    }
    data.password = await bcrypt.hash(pw, 10);
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, whatsapp: true, isAdmin: true },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "שגיאה בעדכון המשתמש" }, { status: 500 });
  }
}

// Delete user and all their content
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  if (!session.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (id === session.id) return NextResponse.json({ error: "לא ניתן למחוק את עצמך" }, { status: 400 });

  // Remove dependent records first (sqlite has limited cascade)
  await prisma.favorite.deleteMany({ where: { userId: id } });
  await prisma.answer.deleteMany({ where: { userId: id } });
  await prisma.question.deleteMany({ where: { userId: id } });
  await prisma.wantedPost.deleteMany({ where: { userId: id } });
  const listings = await prisma.listing.findMany({ where: { userId: id }, select: { id: true } });
  for (const l of listings) {
    await prisma.favorite.deleteMany({ where: { listingId: l.id } });
  }
  await prisma.listing.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
