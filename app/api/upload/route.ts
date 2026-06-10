import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSession } from "@/lib/auth";

// Client-side direct upload to Vercel Blob (bypasses the 4.5MB function limit).
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await getSession();
        if (!session) throw new Error("לא מחובר");
        return {
          addRandomSuffix: true,
          maximumSizeInBytes: 25 * 1024 * 1024, // 25MB
        };
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
