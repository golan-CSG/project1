"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Trash2, User, Package, MessageCircle, Search, Pencil, X } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  avatar?: string;
  isAdmin: boolean;
  createdAt: string;
  _count: { listings: number; questions: number };
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [me, setMe] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", whatsapp: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const router = useRouter();

  function load() {
    fetch("/api/admin/users").then((r) => {
      if (r.status === 401 || r.status === 403) { router.push("/"); return null; }
      return r.json();
    }).then((data) => {
      if (data) { setUsers(data); setLoading(false); }
    });
  }

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((u) => {
      if (!u || !u.isAdmin) { router.push("/"); return; }
      setMe(u);
      load();
    });
  }, [router]);

  async function toggleAdmin(id: string, current: boolean) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAdmin: !current }),
    });
    load();
  }

  function openEdit(u: AdminUser) {
    setEditing(u);
    setEditForm({ name: u.name, email: u.email, whatsapp: u.whatsapp || "", password: "" });
    setEditError("");
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setEditError("");
    const res = await fetch(`/api/admin/users/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
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

  async function deleteUser(id: string, name: string) {
    if (!confirm(`למחוק את ${name} וכל התוכן שלו? פעולה זו בלתי הפיכה.`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "שגיאה במחיקה");
      return;
    }
    load();
  }

  if (loading) return <div className="text-center text-slate-400 py-16">טוען...</div>;

  const filtered = users.filter((u) =>
    !search || u.name.includes(search) || u.email.includes(search)
  );

  const adminCount = users.filter((u) => u.isAdmin).length;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Shield size={26} className="text-green-600" />
        <h1 className="text-2xl font-bold text-slate-800">ניהול משתמשים</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <User size={22} className="mx-auto text-green-600 mb-1" />
          <p className="text-2xl font-bold text-slate-800">{users.length}</p>
          <p className="text-xs text-slate-500">משתמשים</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <Shield size={22} className="mx-auto text-blue-500 mb-1" />
          <p className="text-2xl font-bold text-slate-800">{adminCount}</p>
          <p className="text-xs text-slate-500">מנהלים</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <Package size={22} className="mx-auto text-amber-500 mb-1" />
          <p className="text-2xl font-bold text-slate-800">{users.reduce((s, u) => s + u._count.listings, 0)}</p>
          <p className="text-xs text-slate-500">מודעות</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute right-3 top-3 text-slate-400" />
        <input type="text" placeholder="חפש לפי שם או אימייל..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-right" />
      </div>

      {/* User list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.map((u, i) => (
          <div key={u.id} className={`flex items-center gap-4 p-4 ${i > 0 ? "border-t border-slate-100" : ""}`}>
            {/* Avatar */}
            {u.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                <User size={22} />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 text-right min-w-0">
              <div className="flex items-center justify-end gap-2">
                {u.isAdmin && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">מנהל</span>}
                <p className="font-semibold text-slate-800 truncate">{u.name}</p>
              </div>
              <p className="text-sm text-slate-500 truncate">{u.email}</p>
              <div className="flex items-center justify-end gap-3 mt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1"><MessageCircle size={11} /> {u._count.questions}</span>
                <span className="flex items-center gap-1"><Package size={11} /> {u._count.listings}</span>
                {u.whatsapp && <span>📱 {u.whatsapp}</span>}
                <span>{new Date(u.createdAt).toLocaleDateString("he-IL")}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => openEdit(u)}
                className="flex items-center gap-1 text-xs bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100">
                <Pencil size={13} /> ערוך
              </button>
              <button onClick={() => toggleAdmin(u.id, u.isAdmin)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${
                  u.isAdmin
                    ? "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                }`}>
                {u.isAdmin ? "הסר ניהול" : "הפוך למנהל"}
              </button>
              {u.id !== me?.id && (
                <button onClick={() => deleteUser(u.id, u.name)}
                  className="flex items-center gap-1 text-xs bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100">
                  <Trash2 size={13} /> מחק
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold text-slate-800">עריכת משתמש</h2>
            </div>
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">שם מלא *</label>
                <input type="text" required value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">אימייל *</label>
                <input type="email" required value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">טלפון נייד</label>
                <input type="tel" value={editForm.whatsapp}
                  onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                  placeholder="05X-XXXXXXX"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">איפוס סיסמה <span className="text-slate-400">(השאר ריק כדי לא לשנות)</span></label>
                <input type="text" value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="סיסמה חדשה למשתמש"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
                <p className="text-xs text-slate-400 mt-1">מסור את הסיסמה החדשה למשתמש</p>
              </div>
              {editError && <p className="text-red-500 text-sm text-right">{editError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditing(null)}
                  className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg font-semibold hover:bg-slate-50">
                  ביטול
                </button>
                <button type="submit" disabled={saving}
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
