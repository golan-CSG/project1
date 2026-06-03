"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Mail, MessageCircle, Trash2, Pencil, ChevronLeft, ChevronRight } from "lucide-react";

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
  description: string;
  price: number;
  category: string;
  condition: string;
  brand?: string;
  location?: string;
  imageUrl?: string;
  images?: string;
  phone?: string;
  userId?: string;
  createdAt: string;
  user: { name: string; email: string; whatsapp?: string };
}

export default function ListingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [me, setMe] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch(`/api/listings/${id}`).then((r) => r.json()),
      fetch("/api/me").then((r) => r.json()),
    ]).then(([listingData, meData]) => {
      setListing(listingData);
      setMe(meData);
      setLoading(false);
    });
  }, [id]);

  async function deleteListing() {
    if (!confirm("למחוק את המודעה?")) return;
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    router.push("/");
  }

  if (loading) return <div className="text-center text-slate-400 py-16">טוען...</div>;
  if (!listing || "error" in listing) return <div className="text-center text-slate-400 py-16">המודעה לא נמצאה.</div>;

  const isOwner = me?.id === listing.userId;

  // Parse images
  let photos: string[] = [];
  if (listing.images) {
    try { photos = JSON.parse(listing.images); } catch { photos = []; }
  }
  if (photos.length === 0 && listing.imageUrl) photos = [listing.imageUrl];

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/" className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowRight size={16} /> חזרה למודעות
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

        {/* Image gallery */}
        {photos.length > 0 ? (
          <div className="relative bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[photoIndex]} alt={listing.title} className="w-full max-h-80 object-contain" />

            {photos.length > 1 && (
              <>
                <button onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow">
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                  {photos.map((_, i) => (
                    <button key={i} onClick={() => setPhotoIndex(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === photoIndex ? "bg-green-500" : "bg-white/70"}`} />
                  ))}
                </div>
              </>
            )}

            {/* Thumbnails */}
            {photos.length > 1 && (
              <div className="flex gap-2 p-3 border-t border-slate-100 overflow-x-auto">
                {photos.map((url, i) => (
                  <button key={i} onClick={() => setPhotoIndex(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === photoIndex ? "border-green-500" : "border-transparent"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-48 bg-slate-100 flex items-center justify-center text-6xl">🚲</div>
        )}

        <div className="p-6 text-right">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="text-3xl font-bold text-green-600 whitespace-nowrap">₪{listing.price}</div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{listing.title}</h1>
              <div className="flex gap-2 mt-2 flex-wrap justify-end">
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">{CATEGORIES[listing.category] || listing.category}</span>
                <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">{CONDITIONS[listing.condition] || listing.condition}</span>
                {listing.brand && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{listing.brand}</span>}
              </div>
            </div>
          </div>

          <p className="text-slate-600 mb-6 whitespace-pre-wrap">{listing.description}</p>
          {listing.location && <p className="text-slate-500 text-sm mb-6">📍 {listing.location}</p>}

          <div className="border-t border-slate-100 pt-5">
            <p className="text-sm font-semibold text-slate-700 mb-3">מוכר: {listing.user.name}</p>
            <div className="flex gap-3 flex-wrap">
              {isOwner && (
                <>
                  <Link href={`/listings/${listing.id}/edit`}
                    className="flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2.5 rounded-lg hover:bg-blue-100 text-sm font-medium">
                    <Pencil size={16} /> ערוך מודעה
                  </Link>
                  <button onClick={deleteListing}
                    className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-lg hover:bg-red-100 text-sm font-medium">
                    <Trash2 size={16} /> מחק מודעה
                  </button>
                </>
              )}
              {listing.phone && (
                <a href={`tel:${listing.phone}`}
                  className="flex items-center gap-2 bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-lg hover:bg-slate-200 text-sm font-medium">
                  📱 {listing.phone}
                </a>
              )}
              <a href={`mailto:${listing.user.email}`}
                className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-lg hover:bg-slate-700 text-sm font-medium">
                <Mail size={16} /> שלח אימייל
              </a>
              {listing.user.whatsapp && (
                <a href={`https://wa.me/${listing.user.whatsapp.replace(/\D/g, "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 text-sm font-medium">
                  <MessageCircle size={16} /> וואטסאפ
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
