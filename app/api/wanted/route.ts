import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const posts = await prisma.wantedPost.findMany({
    include: { user: { select: { name: true, email: true, whatsapp: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { title, description, category, maxPrice, location, phone, email } = await req.json();

  if (!title || !description || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const post = await prisma.wantedPost.create({
    data: {
      title, description, category,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      location, phone, email,
      userId: session.id,
    },
  });

  return NextResponse.json(post);
}
