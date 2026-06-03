"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "הכל" },
  { value: "wheels", label: "גלגלים" },
  { value: "brakes", label: "בלמים" },
  { value: "drivetrain", label: "הינע" },
  { value: "handlebars", label: "כידון" },
  { value: "saddle", label: "אוכף" },
  { value: "frame", label: "שלדה" },
  { value: "forks", label: "סטם" },
  { value: "pedals", label: "פדלים" },
  { value: "tires", label: "צמיגים" },
  { value: "other", label: "אחר" },
];

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
  user: { name: string; email: string; whatsapp?: string };
}

export default function WantedPage() {
  const [posts, setPosts] = useState<WantedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/wanted").then((r) => r.json()).then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const filtered = posts.filter((p) => {
    const matchCat = category === "all" || p.category === category;
    const matchSearch = !search || p.title.includes(search) || p.description.includes(search);
    return matchCat && matchSearch;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">🕯️ מחפש בנרות</h1>
          <p className="text-slate-500 mt-1">מחפשים חלק מסוים? פרסמו כאן ומוכרים יצרו איתכם קשר</p>
        </div>
        <Link href="/wanted/new"
          className="bg-green-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-green-700 text-sm">
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
                  <p className="font-semibold text-slate-800 text-lg">{post.title}</p>
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
                <div className="flex gap-3">
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
    </div>
  );
}
