import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json([], { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.id },
    include: {
      listing: {
        include: { user: { select: { name: true, email: true, whatsapp: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites.map((f) => f.listing));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { listingId } = await req.json();

  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId: session.id, listingId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  } else {
    await prisma.favorite.create({ data: { userId: session.id, listingId } });
    return NextResponse.json({ favorited: true });
  }
}
