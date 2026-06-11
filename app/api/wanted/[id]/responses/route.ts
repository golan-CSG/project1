import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { body, attachment, attachType } = await req.json();
  if (!body) return NextResponse.json({ error: "תוכן ההודעה הוא שדה חובה" }, { status: 400 });

  const response = await prisma.wantedResponse.create({
    data: { body, attachment, attachType, wantedPostId: id, userId: session.id },
    include: { user: { select: { name: true, avatar: true } } },
  });

  return NextResponse.json(response);
}
