"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CATEGORIES: Record<string, string> = {
  wheels: "גלגלים", brakes: "בלמים", drivetrain: "הנעה",
  handlebars: "כידון", saddle: "אוכף", frame: "שלדה",
  forks: "סטם ושלוחות", pedals: "פדלים", tires: "צמיגים", other: "אחר",
};

interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  createdAt: string;
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((me) => {
      if (!me) { router.push("/login"); return; }
      fetch(`/api/listings?userId=${me.id}`).then((r) => r.json()).then((data) => {
        setListings(data);
        setLoading(false);
      });
    });
  }, [router]);

  if (loading) return <div className="text-center text-slate-400 py-16">טוען...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href="/sell" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700">
          + מודעה חדשה
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">המודעות שלי</h1>
      </div>

      {listings.length === 0 ? (
        <div className="text-center text-slate-400 py-16">
          <p className="mb-2">אין לך מודעות עדיין.</p>
          <Link href="/sell" className="text-green-600 hover:underline">פרסם את המודעה הראשונה שלך</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <Link key={listing.id} href={`/listings/${listing.id}`}>
              <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow flex items-center justify-between">
                <p className="text-green-600 font-bold text-lg">₪{listing.price}</p>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">{listing.title}</p>
                  <div className="flex gap-2 mt-1 justify-end">
                    <span className="text-xs text-slate-400">{listing.condition}</span>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{CATEGORIES[listing.category] || listing.category}</span>
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
