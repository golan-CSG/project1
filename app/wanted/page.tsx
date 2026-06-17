"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Pencil, Trash2, X } from "lucide-react";
import AttachmentUploader from "@/components/AttachmentUploader";

interface Attachment { url: string; name: string; type: string; }

const CATEGORIES = [
  { value: "all", label: "הכל" },
  { value: "wheels", label: "גלגלים" },
  { value: "brakes", label: "בלמים" },
  { value: "drivetrain", label: "הינע" },
  { value: "handlebars", label: "כידון" },
  { value: "saddle", label: "אוכף" },
  { value: "frame", label: "שלדה" },
  { value: "forks", label: "סטם" },
  { value: "fork", label: "מזלג" },
  { value: "pedals", label: "פדלים" },
  { value: "tires", label: "צמיגים" },
  { value: "roadbike", label: "אופני כביש" },
  { value: "bike", label: "אופני הרים" },
  { value: "computers", label: "מחשבונים / שעונים" },
  { value: "other", label: "אחר" },
];

const FORM_CATEGORIES = CATEGORIES.filter((c) => c.value !== "all");

interface WantedPost {
  id: string;
  title: string;
  description: string;
  category: string;
  maxPrice?: number;
  location?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  userId: string;
  attachment?: string;
  attachType?: string;
  user: { name: string; email: string; whatsapp?: string };
  _count?: { responses: number };
}

export default function WantedPage() {
  const [posts, setPosts] = useState<WantedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [me, setMe] = useState<{ id: string; isAdmin?: boolean } | null>(null);

  const [editing, setEditing] = useState<WantedPost | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", category: "wheels", maxPrice: "", location: "", phone: "", email: "" });
  const [editAttachment, setEditAttachment] = useState<Attachment | null>(null);
  const [editUploading, setEditUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  function load() {
    fetch("/api/wanted").then((r) => r.json()).then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
    fetch("/api/me").then((r) => r.json()).then(setMe);
  }, []);

  const filtered = posts.filter((p) => {
    const matchCat = category === "all" || p.category === category;
    const matchSearch = !search || p.title.includes(search) || p.description.includes(search);
    return matchCat && matchSearch;
  });

  function openEdit(p: WantedPost) {
    setEditing(p);
    setEditForm({
      title: p.title, description: p.description, category: p.category,
      maxPrice: p.maxPrice ? String(p.maxPrice) : "",
      location: p.location || "", phone: p.phone || "", email: p.email || "",
    });
    setEditAttachment(p.attachment ? { url: p.attachment, name: "צרופה", type: p.attachType || "image" } : null);
    setEditError("");
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setEditError("");
    const res = await fetch(`/api/wanted/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        attachment: editAttachment?.url || null,
        attachType: editAttachment?.type || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setEditError(data.error || "שגיאה בעדכון");
    } else {
      setEditing(null);
      load();
    }
  }

  async function deletePost(id: string) {
    if (!confirm("למחוק את הבקשה?")) return;
    await fetch(`/api/wanted/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">🕯️ מחפש בנרות</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">מחפשים חלק מסוים? פרסמו כאן ומוכרים יצרו איתכם קשר</p>
        </div>
        <Link href="/wanted/new"
          className="bg-green-600 text-white px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg font-semibold hover:bg-green-700 text-xs sm:text-sm flex-shrink-0">
          + פרסם בקשה
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute right-3 top-3 text-slate-400" />
        <input type="text" placeholder="חפש בקשות..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-right" />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => (
          <button key={cat.value} onClick={() => setCategory(cat.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === cat.value ? "bg-green-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-green-50"
            }`}>
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-16">טוען...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-slate-400 py-16">
          <p className="text-lg mb-2">אין בקשות עדיין</p>
          <Link href="/wanted/new" className="text-green-600 hover:underline">פרסם את הבקשה הראשונה!</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <div key={post.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="text-right flex-1">
                  <Link href={`/wanted/${post.id}`}>
                    <p className="font-semibold text-slate-800 text-lg hover:text-green-600">{post.title}</p>
                  </Link>
                  <p className="text-slate-500 text-sm mt-1">{post.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">
                    {CATEGORIES.find(c => c.value === post.category)?.label || post.category}
                  </span>
                  {post.maxPrice && (
                    <span className="text-xs text-green-600 font-semibold">עד ₪{post.maxPrice}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                <div className="flex gap-3 items-center">
                  {(post.phone || post.user.whatsapp) && (
                    <a href={`https://wa.me/${(post.phone || post.user.whatsapp || "").replace(/\D/g, "")}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-green-600 font-medium hover:underline">
                      💬 וואטסאפ
                    </a>
                  )}
                  <a href={`mailto:${post.email || post.user.email}`}
                    className="flex items-center gap-1 text-slate-600 font-medium hover:underline">
                    ✉️ אימייל
                  </a>
                  <Link href={`/wanted/${post.id}`}
                    className="flex items-center gap-1 text-slate-600 font-medium hover:underline">
                    💬 {post._count?.responses || 0} תגובות
                  </Link>
                  {(me?.id === post.userId || me?.isAdmin) && (
                    <>
                      <button onClick={() => openEdit(post)}
                        className="flex items-center gap-1 text-blue-600 font-medium hover:underline">
                        <Pencil size={12} /> ערוך
                      </button>
                      <button onClick={() => deletePost(post.id)}
                        className="flex items-center gap-1 text-red-500 font-medium hover:underline">
                        <Trash2 size={12} /> מחק
                      </button>
                    </>
                  )}
                </div>
                <div className="flex gap-3">
                  {post.location && <span>📍 {post.location}</span>}
                  <span>{post.user.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              <h2 className="text-xl font-bold text-slate-800">עריכת בקשה</h2>
            </div>
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">מה מחפשים? *</label>
                <input type="text" required value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">קטגוריה *</label>
                  <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right">
                    {FORM_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">תקציב מקסימלי (₪)</label>
                  <input type="number" min="0" value={editForm.maxPrice}
                    onChange={(e) => setEditForm({ ...editForm, maxPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">פירוט *</label>
                <textarea required rows={3} value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-right" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">מיקום</label>
                  <input type="text" value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">טלפון / וואטסאפ</label>
                  <input type="tel" value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">אימייל ליצירת קשר</label>
                <input type="email" value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">תמונה</label>
                <AttachmentUploader
                  attachment={editAttachment}
                  onChange={setEditAttachment}
                  uploading={editUploading}
                  onUploading={setEditUploading}
                  onError={setEditError}
                />
              </div>
              {editError && <p className="text-red-500 text-sm text-right">{editError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditing(null)}
                  className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg font-semibold hover:bg-slate-50">ביטול</button>
                <button type="submit" disabled={saving || editUploading}
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
                  {saving ? "שומר..." : "שמור"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
