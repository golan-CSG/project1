import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "לא נבחר קובץ" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const isImage = /^(jpg|jpeg|png|gif|webp|svg|bmp)$/.test(ext);

  let url: string;

  // Find a Blob token under any name (Vercel may prefix it)
  const blobTokenKey = Object.keys(process.env).find((k) => k.endsWith("BLOB_READ_WRITE_TOKEN"));
  const blobToken = blobTokenKey ? process.env[blobTokenKey] : undefined;

  try {
    // In production (Vercel) use Blob storage; locally write to public/uploads
    if (blobToken) {
      const blob = await put(`uploads/${fileName}`, file, {
        access: "public",
        token: blobToken,
      });
      url = blob.url;
    } else if (process.env.VERCEL) {
      return NextResponse.json(
        { error: "לא נמצא BLOB_READ_WRITE_TOKEN — חבר את ה-Blob store לפרויקט" },
        { status: 500 }
      );
    } else {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);
      await writeFile(filePath, buffer);
      url = `/uploads/${fileName}`;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `שגיאה בהעלאה: ${message}`, tokenKey: blobTokenKey || "none" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    url,
    name: file.name,
    type: isImage ? "image" : "file",
  });
}
