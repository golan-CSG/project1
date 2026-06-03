import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ favorited: false });

  const fav = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId: session.id, listingId } },
  });

  return NextResponse.json({ favorited: !!fav });
}
