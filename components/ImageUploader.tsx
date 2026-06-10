"use client";
import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { upload } from "@vercel/blob/client";

const MAX_IMAGES = 3;

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  uploading: boolean;
  onUploading: (v: boolean) => void;
  onError: (msg: string) => void;
}

export default function ImageUploader({ images, onChange, uploading, onUploading, onError }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - images.length;
    const toUpload = files.slice(0, remaining);

    onUploading(true);
    const uploaded: string[] = [];

    for (const file of toUpload) {
      try {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        uploaded.push(blob.url);
      } catch (err) {
        onError(err instanceof Error ? err.message : "שגיאה בהעלאת תמונה");
      }
    }

    onChange([...images, ...uploaded]);
    onUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        תמונות <span className="text-slate-400">({images.length}/{MAX_IMAGES})</span>
      </label>

      <div className="flex gap-3 flex-wrap">
        {images.map((url, i) => (
          <div key={i} className="relative w-28 h-28 rounded-xl overflow-hidden border border-slate-200 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`תמונה ${i + 1}`} className="w-full h-full object-cover" />
            {i === 0 && (
              <span className="absolute bottom-0 right-0 left-0 text-center text-[10px] bg-black/50 text-white py-0.5">
                ראשית
              </span>
            )}
            <button type="button" onClick={() => removeImage(i)}
              className="absolute top-1 left-1 bg-white text-slate-600 rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500">
              <X size={14} />
            </button>
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <button type="button" onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-28 h-28 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-green-400 hover:text-green-500 transition-colors disabled:opacity-50">
            {uploading ? (
              <span className="text-xs">מעלה...</span>
            ) : (
              <>
                <ImagePlus size={24} />
                <span className="text-xs text-center">הוסף תמונה</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <p className="text-xs text-slate-400 mt-1">התמונה הראשונה תופיע בכרטיסייה. ניתן להעלות עד {MAX_IMAGES} תמונות.</p>
    </div>
  );
}
