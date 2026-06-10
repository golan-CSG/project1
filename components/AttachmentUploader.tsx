"use client";
import { useRef } from "react";
import { Paperclip, X, FileText } from "lucide-react";
import { upload } from "@vercel/blob/client";

function isImageFile(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return /^(jpg|jpeg|png|gif|webp|svg|bmp)$/.test(ext);
}

interface Attachment {
  url: string;
  name: string;
  type: string; // "image" | "file"
}

interface Props {
  attachment: Attachment | null;
  onChange: (a: Attachment | null) => void;
  uploading: boolean;
  onUploading: (v: boolean) => void;
  onError: (msg: string) => void;
}

export default function AttachmentUploader({ attachment, onChange, uploading, onUploading, onError }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    onUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      onChange({ url: blob.url, name: file.name, type: isImageFile(file.name) ? "image" : "file" });
    } catch (err) {
      onError(err instanceof Error ? err.message : "שגיאה בהעלאת הקובץ");
    }
    onUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div>
      {attachment ? (
        <div className="flex items-center gap-3 border border-slate-200 rounded-lg p-2">
          {attachment.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={attachment.url} alt={attachment.name} className="w-16 h-16 object-cover rounded" />
          ) : (
            <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center text-slate-400">
              <FileText size={28} />
            </div>
          )}
          <span className="flex-1 text-sm text-slate-600 truncate text-right">{attachment.name}</span>
          <button type="button" onClick={() => onChange(null)}
            className="text-slate-400 hover:text-red-500 p-1">
            <X size={18} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-green-400 hover:text-green-500 text-sm disabled:opacity-50">
          <Paperclip size={16} />
          {uploading ? "מעלה..." : "צרף תמונה או קובץ"}
        </button>
      )}
      <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
    </div>
  );
}
