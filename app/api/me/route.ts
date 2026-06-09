import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json(null);
  return NextResponse.json({ id: session.id, name: session.name, email: session.email, isAdmin: session.isAdmin });
}
