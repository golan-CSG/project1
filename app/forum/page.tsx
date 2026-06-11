"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Paperclip, Plus } from "lucide-react";

interface Question {
  id: string;
  title: string;
  body: string;
  attachment?: string;
  attachType?: string;
  createdAt: string;
  user: { name: string; avatar?: string };
  _count: { answers: number };
}

export default function ForumPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/forum").then((r) => r.json()).then((data) => {
      setQuestions(data);
      setLoading(false);
    });
  }, []);

  const filtered = questions.filter((q) =>
    !search || q.title.includes(search) || q.body.includes(search)
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href="/forum/new"
          className="flex items-center gap-1 sm:gap-2 bg-green-600 text-white px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg font-semibold hover:bg-green-700 text-xs sm:text-sm flex-shrink-0">
          <Plus size={14} /> שאל שאלה
        </Link>
        <div className="text-right">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">💬 שאל את המומחה</h1>
          <p className="text-slate-500 mt-1">שאלות ותשובות על תחזוקה, תיקונים והתאמות</p>
        </div>
      </div>

      <input type="text" placeholder="חפש שאלות..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-right mb-6" />

      {loading ? (
        <div className="text-center text-slate-400 py-16">טוען...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-slate-400 py-16">
          <MessageCircle size={48} className="mx-auto mb-3 text-slate-200" />
          <p className="text-lg mb-2">אין שאלות עדיין</p>
          <Link href="/forum/new" className="text-green-600 hover:underline">שאל את השאלה הראשונה!</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <Link key={q.id} href={`/forum/${q.id}`}>
              <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 flex-shrink-0 text-slate-400 text-sm">
                    <MessageCircle size={16} />
                    <span>{q._count.answers}</span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-semibold text-slate-800 text-lg">{q.title}</p>
                    <p className="text-slate-500 text-sm mt-1 line-clamp-2">{q.body}</p>
                    <div className="flex items-center justify-end gap-3 mt-2 text-xs text-slate-400">
                      {q.attachment && <span className="flex items-center gap-1"><Paperclip size={12} /> קובץ מצורף</span>}
                      <span>{q.user.name}</span>
                      <span>{new Date(q.createdAt).toLocaleDateString("he-IL")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
