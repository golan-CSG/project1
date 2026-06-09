"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AttachmentUploader from "@/components/AttachmentUploader";

interface Attachment { url: string; name: string; type: string; }

export default function NewQuestionPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/forum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, body,
        attachment: attachment?.url || null,
        attachType: attachment?.type || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error === "Not logged in" ? "יש להתחבר כדי לשאול שאלה" : data.error);
      setLoading(false);
    } else {
      router.push(`/forum/${data.id}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">💬 שאל שאלה</h1>
      <p className="text-slate-500 mb-6">שתף את הקהילה — אפשר לצרף תמונה או קובץ</p>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">כותרת *</label>
            <input type="text" required placeholder="לדוג׳: איך מכוונים דיריילר אחורי?"
              value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">פירוט השאלה *</label>
            <textarea required rows={5} placeholder="תאר את הבעיה או השאלה בפירוט..."
              value={body} onChange={(e) => setBody(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-right" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">צירוף קובץ</label>
            <AttachmentUploader
              attachment={attachment}
              onChange={setAttachment}
              uploading={uploading}
              onUploading={setUploading}
              onError={setError}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-right">{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()}
              className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-lg font-semibold hover:bg-slate-50">
              ביטול
            </button>
            <button type="submit" disabled={loading || uploading}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 text-lg">
              {loading ? "מפרסם..." : "פרסם שאלה"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
