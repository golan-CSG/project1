"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

const CATEGORIES: Record<string, string> = {
  wheels: "גלגלים", brakes: "בלמים", drivetrain: "הנעה",
  handlebars: "כידון", saddle: "אוכף", frame: "שלדה",
  forks: "סטם ושלוחות", pedals: "פדלים", tires: "צמיגים", other: "אחר",
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
  imageUrl?: string;
  images?: string;
  location?: string;
}

export default function FavoritesPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/favorites").then((r) => {
      if (r.status === 401) { router.push("/login"); return null; }
      return r.json();
    }).then((data) => {
      if (data) { setListings(data); setLoading(false); }
    });
  }, [router]);

  if (loading) return <div className="text-center text-slate-400 py-16">טוען...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Star size={24} className="text-yellow-500" fill="currentColor" />
        <h1 className="text-2xl font-bold text-slate-800">המועדפים שלי</h1>
      </div>

      {listings.length === 0 ? (
        <div className="text-center text-slate-400 py-16">
          <Star size={48} className="mx-auto mb-3 text-slate-200" />
          <p className="text-lg mb-2">אין מועדפים עדיין</p>
          <Link href="/" className="text-green-600 hover:underline">עבור לכיכר השוק ושמור מודעות</Link>
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
                  {firstImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={firstImage} alt={listing.title} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 bg-slate-100 flex items-center justify-center text-5xl">🚲</div>
                  )}
                  <div className="p-3 text-right">
                    <p className="font-semibold text-slate-800 truncate">{listing.title}</p>
                    <p className="text-green-600 font-bold text-lg">₪{listing.price}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-400">{CONDITIONS[listing.condition] || listing.condition}</span>
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        {CATEGORIES[listing.category] || listing.category}
                      </span>
                    </div>
                    {listing.location && <p className="text-xs text-slate-400 mt-1">📍 {listing.location}</p>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
