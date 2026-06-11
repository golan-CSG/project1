import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ responseId: string }> }) {
  const { responseId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const response = await prisma.wantedResponse.findUnique({ where: { id: responseId } });
  if (!response || (response.userId !== session.id && !session.isAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.wantedResponse.delete({ where: { id: responseId } });
  return NextResponse.json({ success: true });
}
