"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Plus, Pencil, Trash2, TrendingUp, Package, Wallet } from "lucide-react";

const CATEGORIES: Record<string, string> = {
  wheels: "גלגלים", bike: "אופני הרים", roadbike: "אופני כביש", brakes: "בלמים", drivetrain: "הינע",
  handlebars: "כידון", saddle: "אוכף", frame: "שלדה",
  forks: "סטם", fork: "מזלג", pedals: "פדלים", tires: "צמיגים", computers: "מחשבונים / שעונים", helmets: "קסדות", powermeter: "מד וואטים", other: "אחר",
};

const CONDITIONS: Record<string, string> = {
  "like new": "כמו חדש", good: "טוב", fair: "סביר", "for parts": "לפירוק",
};

interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  imageUrl?: string;
  images?: string;
  sold: boolean;
  createdAt: string;
  _count?: { favorites: number };
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<{ id: string; name: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((user) => {
      if (!user) { router.push("/login"); return; }
      setMe(user);
      fetch(`/api/listings?userId=${user.id}&withFavorites=true`)
        .then((r) => r.json())
        .then((data) => { setListings(data); setLoading(false); });
    });
  }, [router]);

  async function deleteListing(id: string) {
    if (!confirm("למחוק את המודעה?")) return;
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  if (loading) return <div className="text-center text-slate-400 py-16">טוען...</div>;

  const totalValue = listings.reduce((sum, l) => sum + l.price, 0);
  const totalFavorites = listings.reduce((sum, l) => sum + (l._count?.favorites || 0), 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/sell"
          className="flex items-center gap-1 sm:gap-2 bg-green-600 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-green-700 flex-shrink-0">
          <Plus size={14} /> מודעה חדשה
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">המודעות שלי</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <Package size={24} className="mx-auto text-green-600 mb-2" />
          <p className="text-2xl font-bold text-slate-800">{listings.length}</p>
          <p className="text-xs text-slate-500 mt-1">מודעות פעילות</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <Wallet size={24} className="mx-auto text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-slate-800">₪{totalValue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">שווי כולל</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <Star size={24} className="mx-auto text-yellow-500 mb-2" fill="currentColor" />
          <p className="text-2xl font-bold text-slate-800">{totalFavorites}</p>
          <p className="text-xs text-slate-500 mt-1">שמירות במועדפים</p>
        </div>
      </div>

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="text-center text-slate-400 py-16">
          <Package size={48} className="mx-auto mb-3 text-slate-200" />
          <p className="text-lg mb-2">אין לך מודעות עדיין</p>
          <Link href="/sell" className="text-green-600 hover:underline">פרסם את המודעה הראשונה שלך</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => {
            let firstImage = listing.imageUrl;
            if (listing.images) {
              try { firstImage = JSON.parse(listing.images)[0] || firstImage; } catch { /* empty */ }
            }
            const date = new Date(listing.createdAt).toLocaleDateString("he-IL");

            return (
              <div key={listing.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4 p-4">
                  {/* Image */}
                  <Link href={`/listings/${listing.id}`} className="flex-shrink-0 relative">
                    {firstImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={firstImage} alt={listing.title} loading="lazy" decoding="async" className="w-20 h-20 object-cover rounded-lg" />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-3xl">🚲</div>
                    )}
                    {listing.sold && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">נמכר</span>
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 text-right min-w-0">
                    <Link href={`/listings/${listing.id}`}>
                      <p className="font-semibold text-slate-800 truncate hover:text-green-600">{listing.title}</p>
                    </Link>
                    <div className="flex items-center justify-end gap-2 mt-1 flex-wrap">
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        {CATEGORIES[listing.category] || listing.category}
                      </span>
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                        {CONDITIONS[listing.condition] || listing.condition}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-2 text-xs text-slate-400">
                      {listing.location && <span>📍 {listing.location}</span>}
                      <span>📅 {date}</span>
                      <span className="flex items-center gap-1">
                        <Star size={12} fill="currentColor" className="text-yellow-400" />
                        {listing._count?.favorites || 0} שמירות
                      </span>
                    </div>
                  </div>

                  {/* Price + Actions */}
                  <div className="flex-shrink-0 text-left flex flex-col items-end gap-2">
                    <p className="text-green-600 font-bold text-xl">₪{listing.price}</p>
                    <div className="flex gap-2">
                      <Link href={`/listings/${listing.id}/edit`}
                        className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-100">
                        <Pencil size={13} /> ערוך
                      </Link>
                      <button onClick={() => deleteListing(listing.id)}
                        className="flex items-center gap-1 text-xs bg-red-50 text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-100">
                        <Trash2 size={13} /> מחק
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
