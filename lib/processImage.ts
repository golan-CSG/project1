// Client-side image processing: converts any browser-decodable image
// (including iPhone HEIC, which Safari can decode) to a resized JPEG.
// Fixes images that upload but won't display on other devices.

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg|bmp|heic|heif)$/i;
const MAX_DIM = 1600;
const QUALITY = 0.85;

// Decode via <img> + object URL (Safari can decode HEIC this way).
function decodeViaImg(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("decode failed")); };
    img.src = url;
  });
}

function drawToJpeg(
  source: CanvasImageSource,
  w: number,
  h: number,
  origName: string
): File | null {
  let width = w, height = h;
  if (width > MAX_DIM || height > MAX_DIM) {
    const scale = Math.min(MAX_DIM / width, MAX_DIM / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, width, height);
  const dataUrl = canvas.toDataURL("image/jpeg", QUALITY);
  const byteString = atob(dataUrl.split(",")[1]);
  const arr = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) arr[i] = byteString.charCodeAt(i);
  const baseName = origName.replace(/\.[^.]+$/, "") || "image";
  return new File([arr], `${baseName}.jpg`, { type: "image/jpeg" });
}

export async function processImage(file: File): Promise<File> {
  const looksLikeImage = file.type.startsWith("image/") || IMAGE_EXT.test(file.name);
  if (!looksLikeImage) return file;
  if (file.type === "image/svg+xml" || /\.svg$/i.test(file.name)) return file;

  // Path 1: createImageBitmap
  try {
    const bitmap = await createImageBitmap(file);
    const out = drawToJpeg(bitmap, bitmap.width, bitmap.height, file.name);
    bitmap.close?.();
    if (out) return out;
  } catch {
    /* fall through to img decode */
  }

  // Path 2: <img> element (works for HEIC on Safari)
  try {
    const img = await decodeViaImg(file);
    const out = drawToJpeg(img, img.naturalWidth, img.naturalHeight, file.name);
    if (out) return out;
  } catch {
    /* give up, upload original */
  }

  return file;
}
