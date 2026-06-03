import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const userId = searchParams.get("userId");

  const listings = await prisma.listing.findMany({
    where: {
      ...(userId ? { userId } : {}),
      ...(category && category !== "all" ? { category } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { brand: { contains: search } },
        ],
      } : {}),
      ...(minPrice ? { price: { gte: parseFloat(minPrice) } } : {}),
      ...(maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {}),
    },
    include: { user: { select: { name: true, email: true, whatsapp: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(listings);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, price, category, brand, condition, location, phone, images } = body;

  if (!title || !description || !price || !category || !condition) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const imagesJson = JSON.stringify(images || []);
  const imageUrl = images?.[0] || null;

  const listing = await prisma.listing.create({
    data: {
      title, description,
      price: parseFloat(price),
      category, brand, condition, location, phone,
      imageUrl,
      images: imagesJson,
      userId: session.id,
    },
  });

  return NextResponse.json(listing);
}
