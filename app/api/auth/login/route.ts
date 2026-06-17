import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = (body.email || "").trim().toLowerCase();
  const password = (body.password || "").trim();

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (!user) {
    return NextResponse.json({ error: "אימייל או סיסמה שגויים" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "אימייל או סיסמה שגויים" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("userId", user.id, { httpOnly: true, path: "/" });
  return response;
}
