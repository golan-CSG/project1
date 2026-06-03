"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";

const CATEGORIES = [
  { value: "wheels", label: "גלגלים" },
  { value: "brakes", label: "בלמים" },
  { value: "drivetrain", label: "הנעה" },
  { value: "handlebars", label: "כידון" },
  { value: "saddle", label: "אוכף" },
  { value: "frame", label: "שלדה" },
  { value: "forks", label: "סטם ושלוחות" },
  { value: "pedals", label: "פדלים" },
  { value: "tires", label: "צמיגים" },
  { value: "other", label: "אחר" },
];

const CONDITIONS = [
  { value: "like new", label: "כמו חדש" },
  { value: "good", label: "טוב" },
  { value: "fair", label: "סביר" },
  { value: "for parts", label: "לפירוק" },
];

export default function SellPage() {
  const [form, setForm] = useState({
    title: "", description: "", price: "", category: "wheels",
    brand: "", condition: "good", location: "", phone: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, images }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error === "Not logged in" ? "יש להתחבר כדי לפרסם מודעה" : data.error);
      setLoading(false);
    } else {
      router.push(`/listings/${data.id}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">פרסום מודעה</h1>
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <form onSubmit={submit} className="space-y-5">

          <ImageUploader
            images={images}
            onChange={setImages}
            uploading={uploading}
            onUploading={setUploading}
            onError={setError}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">כותרת *</label>
            <input type="text" required placeholder="לדוג׳: שימנו 105 דיריילר אחורי"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">קטגוריה *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">מצב *</label>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right">
                {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">מחיר (₪) *</label>
              <input type="number" required min="0" step="1"
                value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">מותג</label>
              <input type="text" placeholder="שימנו, SRAM, קמפגנולו..."
                value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">תיאור *</label>
            <textarea required rows={4} placeholder="תאר את המצב, המפרט, למה אתה מוכר..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-right" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">מיקום</label>
              <input type="text" placeholder="לדוג׳: תל אביב"
                value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">טלפון נייד</label>
              <input type="tel" placeholder="05X-XXXXXXX"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-right">{error}</p>}

          <button type="submit" disabled={loading || uploading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 text-lg">
            {loading ? "מפרסם..." : "פרסם מודעה"}
          </button>
        </form>
      </div>
    </div>
  );
}
