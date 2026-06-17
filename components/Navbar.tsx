"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bike, User, LogOut, Plus, Menu, X } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; email: string; isAdmin?: boolean } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(setUser);
  }, [pathname]);

  // Close mobile menu on navigation
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const navLinks = (
    <>
      <Link href="/" className="hover:text-green-100 text-sm">🛒 כיכר השוק</Link>
      <Link href="/forum" className="hover:text-green-100 text-sm">💬 שאל חבר</Link>
      <Link href="/search" className="hover:text-green-100 text-sm">🔍 חיפוש מתקדם</Link>
      <Link href="/favorites" className="hover:text-green-100 text-sm">⭐ מועדפים</Link>
      <Link href="/my-listings" className="hover:text-green-100 text-sm">📦 המודעות שלי</Link>
      <Link href="/wanted" className="hover:text-green-100 text-sm">🕯️ מחפש בנרות</Link>
    </>
  );

  return (
    <nav className="bg-green-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3" dir="ltr">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg sm:text-xl font-bold hover:text-green-100 flex-shrink-0">
          <Bike size={26} />
          <span dir="ltr">Bikeshook</span>
        </Link>

        {/* Username + logout next to logo */}
        {user && (
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/profile" className="flex items-center gap-1 text-green-100 hover:text-white text-sm min-w-0">
              <User size={14} className="flex-shrink-0" />
              <span className="truncate max-w-[80px] sm:max-w-none">{user.name}</span>
            </Link>
            <button onClick={logout} className="hover:text-white text-green-100 flex-shrink-0" title="התנתק">
              <LogOut size={15} />
            </button>
          </div>
        )}

        <div className="flex-1" />

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-3">
          {user?.isAdmin && (
            <Link href="/admin"
              className="flex items-center gap-1 bg-yellow-400 text-slate-900 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-yellow-300 shadow-sm border border-yellow-500">
              🛡️ ניהול
            </Link>
          )}
          {user ? (
            <>
              {navLinks}
              <Link href="/sell"
                className="flex items-center gap-1 bg-white text-green-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-50">
                <Plus size={15} /> רוצה למכור
              </Link>
            </>
          ) : (
            <Link href="/login" className="hover:text-green-100 text-sm">התחברות / הרשמה</Link>
          )}
        </div>

        {/* Mobile: sell button + hamburger */}
        {user ? (
          <div className="flex md:hidden items-center gap-2 flex-shrink-0">
            <Link href="/sell"
              className="flex items-center gap-1 bg-white text-green-600 px-2.5 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-50">
              <Plus size={15} /> מכור
            </Link>
            <button onClick={() => setMenuOpen((v) => !v)} className="p-1" aria-label="תפריט">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        ) : (
          <Link href="/login" className="md:hidden hover:text-green-100 text-sm flex-shrink-0">התחברות</Link>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {user && menuOpen && (
        <div className="md:hidden bg-green-700 border-t border-green-500" dir="rtl">
          <div className="flex flex-col px-4 py-2 gap-1">
            {user.isAdmin && (
              <Link href="/admin" className="py-2.5 border-b border-green-600 font-bold text-yellow-300">🛡️ ניהול</Link>
            )}
            <Link href="/" className="py-2.5 border-b border-green-600 hover:text-green-100">🛒 כיכר השוק</Link>
            <Link href="/forum" className="py-2.5 border-b border-green-600 hover:text-green-100">💬 שאל חבר</Link>
            <Link href="/search" className="py-2.5 border-b border-green-600 hover:text-green-100">🔍 חיפוש מתקדם</Link>
            <Link href="/favorites" className="py-2.5 border-b border-green-600 hover:text-green-100">⭐ מועדפים</Link>
            <Link href="/my-listings" className="py-2.5 border-b border-green-600 hover:text-green-100">📦 המודעות שלי</Link>
            <Link href="/wanted" className="py-2.5 hover:text-green-100">🕯️ מחפש בנרות</Link>
          </div>
        </div>
      )}

      {user && (
        <div className="bg-green-700 text-green-100 text-xs text-center py-1" dir="rtl">
          מחובר כ־<span className="font-semibold text-white">{user.email}</span>
        </div>
      )}
    </nav>
  );
}
