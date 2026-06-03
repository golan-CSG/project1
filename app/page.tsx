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
  { value: "forks", label: "סטם ושלוחות" },
  { value: "pedals", label: "פדלים" },
  { value: "tires", label: "צמיגים" },
  { value: "other", label: "אחר" },
];

interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  brand?: string;
  location?: string;
  imageUrl?: string;
  sold: boolean;
  createdAt: string;
  user: { name: string };
}

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    if (maxPrice) params.set("maxPrice", maxPrice);

    setLoading(true);
    fetch(`/api/listings?${params}`).then((r) => r.json()).then((data) => {
      setListings(data);
      setLoading(false);
    });
  }, [search, category, maxPrice]);

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">כיכר השוק</h1>
        <p className="text-slate-500">קנה ומכור חלקי אופניים איכותיים יד שנייה</p>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute right-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="חפש חלקים, מותגים..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-right"
          />
        </div>
        <input
          type="number"
          placeholder="מחיר מקסימום ₪"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-36 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-right"
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === cat.value
                ? "bg-green-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-green-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <h2 className="text-xl font-bold text-slate-700 mb-4">פורסמו לאחרונה</h2>

      {loading ? (
        <div className="text-center text-slate-400 py-16">טוען...</div>
      ) : listings.length === 0 ? (
        <div className="text-center text-slate-400 py-16">
          <p className="text-lg mb-2">לא נמצאו מודעות</p>
          <Link href="/sell" className="text-green-600 hover:underline">היה הראשון למכור!</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <Link key={listing.id} href={`/listings/${listing.id}`}>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <div className="relative">
                  {listing.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={listing.imageUrl} alt={listing.title} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 bg-slate-100 flex items-center justify-center text-5xl">🚲</div>
                  )}
                  {listing.sold && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-sm font-bold px-4 py-1.5 rounded-full rotate-[-15deg] shadow-lg">נמכר ✓</span>
                    </div>
                  )}
                </div>
                <div className="p-3 text-right">
                  <p className="font-semibold text-slate-800 truncate">{listing.title}</p>
                  <p className="text-green-600 font-bold text-lg">₪{listing.price}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-400">{{ "like new": "כמו חדש", good: "טוב", fair: "סביר", "for parts": "לפירוק" }[listing.condition] || listing.condition}</span>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{CATEGORIES.find(c => c.value === listing.category)?.label || listing.category}</span>
                  </div>
                  {listing.location && <p className="text-xs text-slate-400 mt-1">📍 {listing.location}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
