"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Trash2, FileText, Download, User, Reply, Pencil, X } from "lucide-react";
import AttachmentUploader from "@/components/AttachmentUploader";
import Linkify from "@/components/Linkify";

interface Attachment { url: string; name: string; type: string; }

interface Answer {
  id: string;
  body: string;
  attachment?: string;
  attachType?: string;
  createdAt: string;
  userId: string;
  user: { name: string; avatar?: string };
  replies?: Answer[];
}

interface Question {
  id: string;
  title: string;
  body: string;
  attachment?: string;
  attachType?: string;
  createdAt: string;
  userId: string;
  user: { name: string; avatar?: string };
  answers: Answer[];
}

function AttachmentView({ url, type, canDelete, onDelete }: { url: string; type?: string; canDelete?: boolean; onDelete?: () => void }) {
  return (
    <div className="mt-3 inline-flex flex-col items-start gap-1">
      {type === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img src={url} alt="צרופה" className="max-w-xs rounded-lg border border-slate-200" />
        </a>
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 text-sm">
          <FileText size={16} /> צפה בקובץ המצורף <Download size={14} />
        </a>
      )}
      {canDelete && (
        <button onClick={onDelete}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 mt-1">
          <Trash2 size={12} /> מחק קובץ מצורף
        </button>
      )}
    </div>
  );
}

export default function QuestionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [me, setMe] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [answerBody, setAnswerBody] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Edit-question state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editAttachment, setEditAttachment] = useState<Attachment | null>(null);
  const [editUploading, setEditUploading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Reply state (threaded)
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replyAttachment, setReplyAttachment] = useState<Attachment | null>(null);
  const [replyUploading, setReplyUploading] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState(false);

  function load() {
    fetch(`/api/forum/${id}`).then((r) => r.json()).then(setQuestion);
  }

  useEffect(() => {
    Promise.all([
      fetch(`/api/forum/${id}`).then((r) => r.json()),
      fetch("/api/me").then((r) => r.json()),
    ]).then(([q, meData]) => {
      setQuestion(q);
      setMe(meData);
      setLoading(false);
    });
  }, [id]);

  async function submitAnswer(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/forum/${id}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body: answerBody,
        attachment: attachment?.url || null,
        attachType: attachment?.type || null,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error === "Not logged in" ? "יש להתחבר כדי לענות" : data.error);
    } else {
      setAnswerBody("");
      setAttachment(null);
      load();
    }
  }

  async function submitReply(e: React.FormEvent, parentId: string) {
    e.preventDefault();
    setReplySubmitting(true);
    const res = await fetch(`/api/forum/${id}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body: replyBody,
        parentId,
        attachment: replyAttachment?.url || null,
        attachType: replyAttachment?.type || null,
      }),
    });
    setReplySubmitting(false);
    if (res.ok) {
      setReplyTo(null);
      setReplyBody("");
      setReplyAttachment(null);
      load();
    }
  }

  async function deleteQuestionAttachment() {
    if (!confirm("למחוק את הקובץ המצורף?")) return;
    await fetch(`/api/forum/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearAttachment: true }),
    });
    load();
  }

  async function deleteAnswerAttachment(answerId: string) {
    if (!confirm("למחוק את הקובץ המצורף?")) return;
    await fetch(`/api/forum/answer/${answerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearAttachment: true }),
    });
    load();
  }

  function startEdit() {
    if (!question) return;
    setEditTitle(question.title);
    setEditBody(question.body);
    setEditAttachment(question.attachment ? { url: question.attachment, name: "צרופה", type: question.attachType || "image" } : null);
    setEditing(true);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    setSavingEdit(true);
    const res = await fetch(`/api/forum/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        body: editBody,
        attachment: editAttachment?.url || null,
        attachType: editAttachment?.type || null,
      }),
    });
    setSavingEdit(false);
    if (res.ok) {
      setEditing(false);
      load();
    }
  }

  async function deleteQuestion() {
    if (!confirm("למחוק את השאלה?")) return;
    await fetch(`/api/forum/${id}`, { method: "DELETE" });
    router.push("/forum");
  }

  if (loading) return <div className="text-center text-slate-400 py-16">טוען...</div>;
  if (!question || "error" in question) return <div className="text-center text-slate-400 py-16">השאלה לא נמצאה.</div>;

  const isOwner = me?.id === question.userId;
  const totalAnswers = question.answers.reduce((s, a) => s + 1 + (a.replies?.length || 0), 0);

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/forum" className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowRight size={16} /> חזרה לפורום
      </Link>

      {/* Question */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
        {editing ? (
          <form onSubmit={saveEdit} className="space-y-3">
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              <h2 className="font-bold text-slate-700">עריכת שאלה</h2>
            </div>
            <input type="text" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right font-semibold" />
            <textarea required rows={4} value={editBody} onChange={(e) => setEditBody(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-right" />
            <AttachmentUploader
              attachment={editAttachment}
              onChange={setEditAttachment}
              uploading={editUploading}
              onUploading={setEditUploading}
              onError={() => {}}
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditing(false)}
                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg font-semibold hover:bg-slate-50">ביטול</button>
              <button type="submit" disabled={savingEdit || editUploading}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
                {savingEdit ? "שומר..." : "שמור"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 text-right">
              <h1 className="text-2xl font-bold text-slate-800">{question.title}</h1>
              <Linkify text={question.body} className="text-slate-600 mt-3" />
              {question.attachment && (
                <AttachmentView url={question.attachment} type={question.attachType}
                  canDelete={isOwner} onDelete={deleteQuestionAttachment} />
              )}
              <div className="flex items-center justify-end gap-3 mt-4 text-xs text-slate-400">
                <span>{question.user.name}</span>
                <span>{new Date(question.createdAt).toLocaleDateString("he-IL")}</span>
              </div>
            </div>
            {isOwner && (
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={startEdit} className="text-slate-400 hover:text-blue-500 p-1" title="ערוך">
                  <Pencil size={17} />
                </button>
                <button onClick={deleteQuestion} className="text-slate-400 hover:text-red-500 p-1" title="מחק">
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Answers */}
      <h2 className="text-lg font-bold text-slate-700 mb-3 text-right">
        {totalAnswers} תשובות
      </h2>

      <div className="space-y-3 mb-6">
        {question.answers.map((a, index) => (
          <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-4">
            {/* Top-level answer with number */}
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center">
                {index + 1}
              </span>
              <div className="flex-1">
                <Linkify text={a.body} className="text-slate-700 text-right" />
                {a.attachment && (
                  <AttachmentView url={a.attachment} type={a.attachType}
                    canDelete={me?.id === a.userId} onDelete={() => deleteAnswerAttachment(a.id)} />
                )}
                <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                  <button onClick={() => { setReplyTo(replyTo === a.id ? null : a.id); setReplyBody(""); setReplyAttachment(null); }}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium">
                    <Reply size={13} /> השב
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1"><User size={12} /> {a.user.name}</span>
                    <span>{new Date(a.createdAt).toLocaleDateString("he-IL")}</span>
                  </div>
                </div>

                {/* Nested replies */}
                {a.replies && a.replies.length > 0 && (
                  <div className="mt-3 space-y-2 border-r-2 border-slate-100 pr-3">
                    {a.replies.map((r, ri) => (
                      <div key={r.id} className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-xs text-slate-400 font-medium mt-0.5">
                            {index + 1}.{ri + 1}
                          </span>
                          <div className="flex-1">
                            <Linkify text={r.body} className="text-slate-700 text-right text-sm" />
                            {r.attachment && (
                              <AttachmentView url={r.attachment} type={r.attachType}
                                canDelete={me?.id === r.userId} onDelete={() => deleteAnswerAttachment(r.id)} />
                            )}
                            <div className="flex items-center justify-end gap-2 mt-2 text-xs text-slate-400">
                              <span className="flex items-center gap-1"><User size={11} /> {r.user.name}</span>
                              <span>{new Date(r.createdAt).toLocaleDateString("he-IL")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply form */}
                {replyTo === a.id && (
                  <form onSubmit={(e) => submitReply(e, a.id)} className="mt-3 space-y-2 bg-slate-50 rounded-lg p-3">
                    <textarea required rows={2} placeholder="כתוב תגובה..."
                      value={replyBody} onChange={(e) => setReplyBody(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-right text-sm" />
                    <AttachmentUploader
                      attachment={replyAttachment}
                      onChange={setReplyAttachment}
                      uploading={replyUploading}
                      onUploading={setReplyUploading}
                      onError={() => {}}
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setReplyTo(null)}
                        className="px-3 py-1.5 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100">
                        ביטול
                      </button>
                      <button type="submit" disabled={replySubmitting || replyUploading}
                        className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50">
                        {replySubmitting ? "שולח..." : "שלח תגובה"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Answer form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-semibold text-slate-700 mb-3 text-right">הוסף תשובה</h3>
        <form onSubmit={submitAnswer} className="space-y-3">
          <textarea required rows={3} placeholder="כתוב את תשובתך..."
            value={answerBody} onChange={(e) => setAnswerBody(e.target.value)}
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
            {submitting ? "שולח..." : "שלח תשובה"}
          </button>
        </form>
      </div>
    </div>
  );
}
