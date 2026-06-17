"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Calendar, Pencil, Check, X, Camera } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { processImage } from "@/lib/processImage";

interface Profile {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  avatar?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", whatsapp: "", avatar: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [listingCount, setListingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/profile").then((r) => {
      if (r.status === 401) { router.push("/login"); return null; }
      return r.json();
    }).then((data) => {
      if (!data) return;
      setProfile(data);
      setForm({ name: data.name, whatsapp: data.whatsapp || "", avatar: data.avatar || "" });
      fetch(`/api/listings?userId=${data.id}`).then(r => r.json()).then(listings => {
        setListingCount(listings.length);
      });
    });
  }, [router]);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    setUploading(true);
    try {
      const file = await processImage(rawFile);
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      setForm((f) => ({ ...f, avatar: blob.url }));
      // Save avatar immediately
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, avatar: blob.url }),
      }).then(r => r.json()).then(updated => {
        setProfile(updated);
        setForm({ name: updated.name, whatsapp: updated.whatsapp || "", avatar: updated.avatar || "" });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהעלאת תמונה");
    }
    setUploading(false);
  }

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "שגיאה בשמירה");
    } else {
      setProfile(data);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  if (!profile) return <div className="text-center text-slate-400 py-16">טוען...</div>;

  const joinDate = new Date(profile.createdAt).toLocaleDateString("he-IL", {
    year: "numeric", month: "long", day: "numeric",
  });

  const avatarSrc = form.avatar || profile.avatar;

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">הפרופיל שלי</h1>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header with avatar */}
        <div className="bg-green-600 px-6 py-8 text-center">
          <div className="relative w-24 h-24 mx-auto mb-3">
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarSrc} alt="תמונת פרופיל"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
            )}
            {/* Camera button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 left-0 bg-yellow-400 hover:bg-yellow-300 text-green-800 rounded-full p-1.5 shadow-md transition-colors"
              title="שנה תמונה"
            >
              {uploading ? (
                <span className="text-xs px-1">...</span>
              ) : (
                <Camera size={14} />
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>
          <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
          <p className="text-green-100 text-sm mt-1">{listingCount} מודעות פעילות</p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          {!editing ? (
            <>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-800 font-medium">{profile.name}</span>
                <div className="flex items-center gap-2 text-slate-400">
                  <User size={16} />
                  <span className="text-sm">שם</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-800">{profile.email}</span>
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail size={16} />
                  <span className="text-sm">אימייל</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <a href={`https://wa.me/${(profile.whatsapp || "").replace(/\D/g, "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-green-600 hover:underline">
                  {profile.whatsapp || "לא הוזן"}
                </a>
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone size={16} />
                  <span className="text-sm">טלפון נייד</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-slate-800">{joinDate}</span>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar size={16} />
                  <span className="text-sm">הצטרף</span>
                </div>
              </div>

              {success && (
                <div className="bg-green-50 text-green-700 text-sm text-center py-2 rounded-lg">
                  ✓ הפרופיל עודכן בהצלחה
                </div>
              )}

              <button onClick={() => setEditing(true)}
                className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-600 py-2.5 rounded-lg hover:bg-slate-50 font-medium">
                <Pencil size={16} /> ערוך פרופיל
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">שם מלא *</label>
                <input type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">אימייל</label>
                <input type="email" disabled value={profile.email}
                  className="w-full px-3 py-2 border border-slate-100 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed" />
                <p className="text-xs text-slate-400 mt-1">לא ניתן לשנות אימייל</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">טלפון נייד *</label>
                <input type="tel" required value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="05X-XXXXXXX"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
              </div>

              {error && <p className="text-red-500 text-sm text-right">{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => { setEditing(false); setError(""); }}
                  className="flex-1 flex items-center justify-center gap-2 border border-slate-200 text-slate-600 py-2.5 rounded-lg hover:bg-slate-50">
                  <X size={16} /> ביטול
                </button>
                <button onClick={save} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50">
                  <Check size={16} /> {saving ? "שומר..." : "שמור"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
