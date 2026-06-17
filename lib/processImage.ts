// Client-side image processing: converts any browser-decodable image
// (including iPhone HEIC, which Safari can decode) to a resized JPEG.
// Fixes images that upload but won't display, and speeds up uploads.

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg|bmp|heic|heif)$/i;
const MAX_DIM = 1600;
const QUALITY = 0.85;

export async function processImage(file: File): Promise<File> {
  // Only attempt to process images; leave PDFs/other files untouched.
  const looksLikeImage = file.type.startsWith("image/") || IMAGE_EXT.test(file.name);
  if (!looksLikeImage) return file;
  // SVGs are already small/vector — don't rasterize them.
  if (file.type === "image/svg+xml" || /\.svg$/i.test(file.name)) return file;

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    if (width > MAX_DIM || height > MAX_DIM) {
      const scale = Math.min(MAX_DIM / width, MAX_DIM / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY)
    );
    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } catch {
    // If the browser can't decode it, fall back to the original file.
    return file;
  }
}
