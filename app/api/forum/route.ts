import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const questions = await prisma.question.findMany({
    include: {
      user: { select: { name: true, avatar: true } },
      _count: { select: { answers: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { title, body, attachment, attachType } = await req.json();

  if (!title || !body) {
    return NextResponse.json({ error: "כותרת ותוכן הם שדות חובה" }, { status: 400 });
  }

  const question = await prisma.question.create({
    data: { title, body, attachment, attachType, userId: session.id },
  });

  return NextResponse.json(question);
}
