"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { value: "bike", label: "אופני הרים" },
  { value: "wheels", label: "גלגלים" },
  { value: "brakes", label: "בלמים" },
  { value: "drivetrain", label: "הינע" },
  { value: "handlebars", label: "כידון" },
  { value: "saddle", label: "אוכף" },
  { value: "frame", label: "שלדה" },
  { value: "forks", label: "סטם" },
  { value: "pedals", label: "פדלים" },
  { value: "tires", label: "צמיגים" },
  { value: "fork", label: "מזלג" },
  { value: "roadbike", label: "אופני כביש" },
  { value: "other", label: "אחר" },
];

export default function NewWantedPage() {
  const [form, setForm] = useState({
    title: "", description: "", category: "wheels",
    maxPrice: "", location: "", phone: "", email: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/wanted", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error === "Not logged in" ? "יש להתחבר כדי לפרסם בקשה" : data.error);
      setLoading(false);
    } else {
      router.push("/wanted");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">🕯️ מחפש בנרות</h1>
      <p className="text-slate-500 mb-6">פרסם מה אתה מחפש ומוכרים יצרו איתך קשר</p>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <form onSubmit={submit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">מה אתה מחפש? *</label>
            <input type="text" required placeholder="לדוג׳: שימנו 105 מעביר אחורי"
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
              <label className="block text-sm font-medium text-slate-700 mb-1">תקציב מקסימלי (₪)</label>
              <input type="number" min="0" placeholder="אופציונלי"
                value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">פירוט *</label>
            <textarea required rows={3} placeholder="תאר בדיוק מה אתה מחפש — דגם, שנה, מצב, כמות..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-right" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">מיקום *</label>
              <input type="text" placeholder="לדוג׳: תל אביב" required
                value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">טלפון / וואטסאפ *</label>
              <input type="tel" placeholder="05X-XXXXXXX" required
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">אימייל ליצירת קשר <span className="text-slate-400">(אופציונלי)</span></label>
            <input type="email" placeholder="example@email.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          {error && <p className="text-red-500 text-sm text-right">{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()}
              className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-lg font-semibold hover:bg-slate-50">
              ביטול
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 text-lg">
              {loading ? "מפרסם..." : "פרסם בקשה"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
