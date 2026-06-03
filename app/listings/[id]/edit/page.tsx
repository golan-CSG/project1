"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function EditListingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "", description: "", price: "", category: "wheels",
    brand: "", condition: "good", location: "", phone: "", email: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/listings/${id}`).then((r) => r.json()),
      fetch("/api/me").then((r) => r.json()),
    ]).then(([listing, me]) => {
      if (!me || listing.userId !== me.id) { router.push("/"); return; }
      setForm({
        title: listing.title,
        description: listing.description,
        price: String(listing.price),
        category: listing.category,
        brand: listing.brand || "",
        condition: listing.condition,
        location: listing.location || "",
        phone: listing.phone || "",
        email: listing.email || "",
      });
      // Parse existing images
      let imgs: string[] = [];
      if (listing.images) {
        try { imgs = JSON.parse(listing.images); } catch { imgs = []; }
      } else if (listing.imageUrl) {
        imgs = [listing.imageUrl];
      }
      setImages(imgs);
      setLoading(false);
    });
  }, [id, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/listings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, images }),
    });

    if (!res.ok) {
      const text = await res.text();
      let msg = "שגיאה בשמירה";
      try { msg = JSON.parse(text).error || msg; } catch { /* empty */ }
      setError(msg);
      setSaving(false);
    } else {
      router.push(`/listings/${id}`);
    }
  }

  if (loading) return <div className="text-center text-slate-400 py-16">טוען...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">עריכת מודעה</h1>
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
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
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
              <input type="number" required min="0" step="1" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">מותג</label>
              <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">תיאור *</label>
            <textarea required rows={4} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-right" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">מיקום</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">טלפון נייד</label>
              <input type="tel" placeholder="05X-XXXXXXX" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">אימייל ליצירת קשר <span className="text-slate-400">(אופציונלי)</span></label>
            <input type="email" placeholder="example@email.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          {error && <p className="text-red-500 text-sm text-right">{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()}
              className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-lg font-semibold hover:bg-slate-50">
              ביטול
            </button>
            <button type="submit" disabled={saving || uploading}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
              {saving ? "שומר..." : "שמור שינויים"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
