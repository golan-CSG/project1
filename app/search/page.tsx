"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";

const CATEGORIES = [
  { value: "", label: "כל הקטגוריות" },
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
  { value: "helmets", label: "קסדות" },
  { value: "other", label: "אחר" },
];

const CONDITIONS = [
  { value: "", label: "כל המצבים" },
  { value: "like new", label: "כמו חדש" },
  { value: "good", label: "טוב" },
  { value: "fair", label: "סביר" },
  { value: "for parts", label: "לפירוק" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "חדש ביותר" },
  { value: "oldest", label: "ישן ביותר" },
  { value: "price_asc", label: "מחיר: נמוך לגבוה" },
  { value: "price_desc", label: "מחיר: גבוה לנמוך" },
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
  images?: string;
  sold: boolean;
  createdAt: string;
  user: { name: string };
}

export default function SearchPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    condition: "",
    minPrice: "",
    maxPrice: "",
    location: "",
    brand: "",
    sort: "newest",
    soldFilter: "active", // active | sold | all
  });

  function updateFilter(key: string, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function resetFilters() {
    setFilters({ search: "", category: "", condition: "", minPrice: "", maxPrice: "", location: "", brand: "", sort: "newest", soldFilter: "active" });
    setListings([]);
    setSearched(false);
  }

  async function doSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);

    const res = await fetch(`/api/listings?${params}`);
    let data: Listing[] = await res.json();

    // Client-side filtering
    if (filters.condition) data = data.filter((l) => l.condition === filters.condition);
    if (filters.brand) data = data.filter((l) => l.brand?.toLowerCase().includes(filters.brand.toLowerCase()));
    if (filters.location) data = data.filter((l) => l.location?.includes(filters.location));
    if (filters.soldFilter === "active") data = data.filter((l) => !l.sold);
    if (filters.soldFilter === "sold") data = data.filter((l) => l.sold);

    // Sort
    data.sort((a, b) => {
      if (filters.sort === "price_asc") return a.price - b.price;
      if (filters.sort === "price_desc") return b.price - a.price;
      if (filters.sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setListings(data);
    setLoading(false);
  }

  const CATEGORIES_MAP: Record<string, string> = {
    wheels: "גלגלים", brakes: "בלמים", drivetrain: "הינע", handlebars: "כידון",
    saddle: "אוכף", frame: "שלדה", forks: "סטם", fork: "מזלג", pedals: "פדלים",
    tires: "צמיגים", roadbike: "אופני כביש", bike: "אופני הרים", computers: "מחשבונים / שעונים", helmets: "קסדות", other: "אחר",
  };

  const CONDITIONS_MAP: Record<string, string> = {
    "like new": "כמו חדש", good: "טוב", fair: "סביר", "for parts": "לפירוק",
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <SlidersHorizontal size={24} className="text-green-600" />
        <h1 className="text-2xl font-bold text-slate-800">חיפוש מתקדם</h1>
      </div>

      <form onSubmit={doSearch} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Free text search */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">חיפוש חופשי</label>
            <div className="relative">
              <Search size={16} className="absolute right-3 top-3 text-slate-400" />
              <input type="text" placeholder="שם חלק, מותג, תיאור..."
                value={filters.search} onChange={(e) => updateFilter("search", e.target.value)}
                className="w-full pr-9 pl-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">קטגוריה</label>
            <select value={filters.category} onChange={(e) => updateFilter("category", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">מצב</label>
            <select value={filters.condition} onChange={(e) => updateFilter("condition", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right">
              {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Min price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">מחיר מינימום (₪)</label>
            <input type="number" min="0" placeholder="0"
              value={filters.minPrice} onChange={(e) => updateFilter("minPrice", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
          </div>

          {/* Max price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">מחיר מקסימום (₪)</label>
            <input type="number" min="0" placeholder="ללא הגבלה"
              value={filters.maxPrice} onChange={(e) => updateFilter("maxPrice", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">מותג</label>
            <input type="text" placeholder="שימנו, SRAM, קמפגנולו..."
              value={filters.brand} onChange={(e) => updateFilter("brand", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">מיקום</label>
            <input type="text" placeholder="עיר, אזור..."
              value={filters.location} onChange={(e) => updateFilter("location", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right" />
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">מיון לפי</label>
            <select value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right">
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Sold filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">סטטוס מודעה</label>
            <select value={filters.soldFilter} onChange={(e) => updateFilter("soldFilter", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right">
              <option value="active">פעילות בלבד</option>
              <option value="sold">נמכרו בלבד</option>
              <option value="all">הכל</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-5">
          <button type="button" onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm">
            <X size={15} /> נקה הכל
          </button>
          <button type="submit"
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-semibold">
            <Search size={16} /> חפש
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="text-center text-slate-400 py-16">מחפש...</div>
      ) : searched && (
        <>
          <p className="text-sm text-slate-500 mb-4 text-right">נמצאו <span className="font-semibold text-slate-700">{listings.length}</span> תוצאות</p>
          {listings.length === 0 ? (
            <div className="text-center text-slate-400 py-16">
              <p className="text-lg mb-2">לא נמצאו תוצאות</p>
              <p className="text-sm">נסה לשנות את הפילטרים</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {listings.map((listing) => {
                let firstImage = listing.imageUrl;
                if (listing.images) {
                  try { firstImage = JSON.parse(listing.images)[0] || firstImage; } catch { /* empty */ }
                }
                return (
                  <Link key={listing.id} href={`/listings/${listing.id}`}>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                      <div className="relative">
                        {firstImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={firstImage} alt={listing.title} className="w-full h-40 object-cover" />
                        ) : (
                          <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-4xl">🚲</div>
                        )}
                        {listing.sold && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">נמכר ✓</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3 text-right">
                        <p className="font-semibold text-slate-800 truncate">{listing.title}</p>
                        <p className="text-green-600 font-bold text-lg">₪{listing.price}</p>
                        <div className="flex items-center justify-between mt-1 flex-wrap gap-1">
                          <span className="text-xs text-slate-400">{CONDITIONS_MAP[listing.condition] || listing.condition}</span>
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{CATEGORIES_MAP[listing.category] || listing.category}</span>
                        </div>
                        {listing.brand && <p className="text-xs text-blue-500 mt-0.5">{listing.brand}</p>}
                        {listing.location && <p className="text-xs text-slate-400 mt-0.5">📍 {listing.location}</p>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
