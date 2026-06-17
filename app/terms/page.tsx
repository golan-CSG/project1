"use client";
import { useEffect, useState } from "react";
import { FileText, Pencil, Check, X } from "lucide-react";
import Linkify from "@/components/Linkify";

export default function TermsPage() {
  const [value, setValue] = useState("");
  const [me, setMe] = useState<{ isAdmin?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/terms").then((r) => r.json()),
      fetch("/api/me").then((r) => r.json()),
    ]).then(([t, meData]) => {
      setValue(t.value || "");
      setMe(meData);
      setLoading(false);
    });
  }, []);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/terms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: draft }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setValue(data.value);
      setEditing(false);
    }
  }

  if (loading) return <div className="text-center text-slate-400 py-16">טוען...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        {me?.isAdmin && !editing && (
          <button onClick={() => { setDraft(value); setEditing(true); }}
            className="flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-200">
            <Pencil size={14} /> ערוך
          </button>
        )}
        <div className="flex items-center gap-2 mr-auto">
          <h1 className="text-2xl font-bold text-slate-800">כללי השימוש באתר</h1>
          <FileText size={24} className="text-green-600" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {editing ? (
          <div className="space-y-3">
            <textarea rows={18} value={draft} onChange={(e) => setDraft(e.target.value)}
              placeholder="כתוב כאן את כללי השימוש באתר..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-y text-right leading-relaxed" />
            <div className="flex gap-3">
              <button onClick={() => setEditing(false)}
                className="flex items-center gap-1 flex-1 justify-center border border-slate-200 text-slate-600 py-2.5 rounded-lg font-semibold hover:bg-slate-50">
                <X size={16} /> ביטול
              </button>
              <button onClick={save} disabled={saving}
                className="flex items-center gap-1 flex-1 justify-center bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
                <Check size={16} /> {saving ? "שומר..." : "שמור"}
              </button>
            </div>
          </div>
        ) : value ? (
          <Linkify text={value} className="text-slate-700 text-right leading-relaxed" />
        ) : (
          <p className="text-slate-400 text-center py-8">
            {me?.isAdmin ? "טרם הוגדרו כללי שימוש. לחץ \"ערוך\" כדי להוסיף." : "טרם הוגדרו כללי שימוש."}
          </p>
        )}
      </div>
    </div>
  );
}
