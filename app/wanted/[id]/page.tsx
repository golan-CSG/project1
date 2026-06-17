"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, User, FileText, Download, Trash2 } from "lucide-react";
import AttachmentUploader from "@/components/AttachmentUploader";
import Linkify from "@/components/Linkify";
import { waLink } from "@/lib/waLink";

const CATEGORIES: Record<string, string> = {
  wheels: "גלגלים", brakes: "בלמים", drivetrain: "הינע", handlebars: "כידון",
  saddle: "אוכף", frame: "שלדה", forks: "סטם", fork: "מזלג", pedals: "פדלים",
  tires: "צמיגים", roadbike: "אופני כביש", bike: "אופני הרים", computers: "מחשבונים / שעונים", helmets: "קסדות", powermeter: "מד וואטים", other: "אחר",
};

interface Attachment { url: string; name: string; type: string; }

interface Response {
  id: string;
  body: string;
  attachment?: string;
  attachType?: string;
  createdAt: string;
  userId: string;
  user: { name: string; avatar?: string };
}

interface WantedPost {
  id: string;
  title: string;
  description: string;
  category: string;
  maxPrice?: number;
  location?: string;
  phone?: string;
  email?: string;
  attachment?: string;
  attachType?: string;
  createdAt: string;
  user: { name: string; email: string; whatsapp?: string };
  responses: Response[];
}

function AttachmentView({ url, type }: { url: string; type?: string }) {
  if (type === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img src={url} alt="צרופה" className="max-w-xs rounded-lg border border-slate-200 mt-2" />
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-2 mt-2 bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 text-sm">
      <FileText size={16} /> צפה בקובץ <Download size={14} />
    </a>
  );
}

export default function WantedPostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<WantedPost | null>(null);
  const [me, setMe] = useState<{ id: string; isAdmin?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function load() {
    fetch(`/api/wanted/${id}`).then((r) => r.json()).then(setPost);
  }

  useEffect(() => {
    Promise.all([
      fetch(`/api/wanted/${id}`).then((r) => r.json()),
      fetch("/api/me").then((r) => r.json()),
    ]).then(([p, meData]) => {
      setPost(p);
      setMe(meData);
      setLoading(false);
    });
  }, [id]);

  async function deleteResponse(responseId: string) {
    if (!confirm("למחוק את ההודעה?")) return;
    await fetch(`/api/wanted/response/${responseId}`, { method: "DELETE" });
    load();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/wanted/${id}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body,
        attachment: attachment?.url || null,
        attachType: attachment?.type || null,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error === "Not logged in" ? "יש להתחבר כדי להגיב" : data.error);
    } else {
      setBody("");
      setAttachment(null);
      load();
    }
  }

  if (loading) return <div className="text-center text-slate-400 py-16">טוען...</div>;
  if (!post || "error" in post) return <div className="text-center text-slate-400 py-16">הבקשה לא נמצאה.</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/wanted" className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowRight size={16} /> חזרה למחפש בנרות
      </Link>

      {/* Post */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6 text-right">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-800 flex-1">{post.title}</h1>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">{CATEGORIES[post.category] || post.category}</span>
            {post.maxPrice && <span className="text-sm text-green-600 font-semibold">עד ₪{post.maxPrice}</span>}
          </div>
        </div>
        <Linkify text={post.description} className="text-slate-600 mt-3" />
        {post.attachment && <AttachmentView url={post.attachment} type={post.attachType} />}
        <div className="flex items-center justify-end gap-3 mt-4 text-xs text-slate-400">
          {post.location && <span>📍 {post.location}</span>}
          <span>{post.user.name}</span>
          <span>{new Date(post.createdAt).toLocaleDateString("he-IL")}</span>
        </div>
        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
          {(post.phone || post.user.whatsapp) && (
            <a href={waLink(post.phone || post.user.whatsapp)}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm font-medium">
              💬 וואטסאפ
            </a>
          )}
          <a href={`mailto:${post.email || post.user.email}`}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 text-sm font-medium">
            ✉️ אימייל
          </a>
        </div>
      </div>

      {/* Responses */}
      <h2 className="text-lg font-bold text-slate-700 mb-3 text-right">{post.responses.length} תגובות</h2>
      <div className="space-y-3 mb-6">
        {post.responses.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <Linkify text={r.body} className="text-slate-700 text-right" />
            {r.attachment && <AttachmentView url={r.attachment} type={r.attachType} />}
            <div className="flex items-center justify-between gap-2 mt-3 text-xs text-slate-400">
              {(me?.id === r.userId || me?.isAdmin) ? (
                <button onClick={() => deleteResponse(r.id)}
                  className="flex items-center gap-1 text-red-500 hover:text-red-600 font-medium">
                  <Trash2 size={11} /> מחק
                </button>
              ) : <span />}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1"><User size={12} /> {r.user.name}</span>
                <span>{new Date(r.createdAt).toLocaleDateString("he-IL")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Response form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-semibold text-slate-700 mb-3 text-right">כתוב הודעה למפרסם</h3>
        <form onSubmit={submit} className="space-y-3">
          <textarea required rows={3} placeholder="יש לי את החלק הזה / הצעה..."
            value={body} onChange={(e) => setBody(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-right" />
          <AttachmentUploader
            attachment={attachment}
            onChange={setAttachment}
            uploading={uploading}
            onUploading={setUploading}
            onError={setError}
          />
          {error && <p className="text-red-500 text-sm text-right">{error}</p>}
          <button type="submit" disabled={submitting || uploading}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
            {submitting ? "שולח..." : "שלח הודעה"}
          </button>
        </form>
      </div>
    </div>
  );
}
