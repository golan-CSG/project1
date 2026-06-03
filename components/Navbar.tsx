"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bike, User, LogOut, Plus } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(setUser);
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="bg-green-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between" dir="rtl">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold hover:text-green-100">
          <Bike size={28} />
          Bikeshook
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/" className="hover:text-green-100 text-sm hidden sm:block">עיון</Link>

          {user ? (
            <>
              <Link
                href="/sell"
                className="flex items-center gap-1 bg-white text-green-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-50"
              >
                <Plus size={15} /> מכור
              </Link>

              <Link href="/my-listings" className="flex items-center gap-2 bg-green-700 hover:bg-green-800 px-3 py-1.5 rounded-lg text-sm">
                <User size={15} />
                <span className="hidden sm:inline">{user.name}</span>
                <span className="sm:hidden">אני</span>
              </Link>

              <button
                onClick={logout}
                className="flex items-center gap-1 hover:text-green-100 text-sm"
                title="התנתק"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-green-100 text-sm">התחברות</Link>
              <Link href="/register" className="bg-white text-green-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-50">
                הרשמה
              </Link>
            </>
          )}
        </div>
      </div>

      {user && (
        <div className="bg-green-700 text-green-100 text-xs text-center py-1" dir="rtl">
          מחובר כ־<span className="font-semibold text-white">{user.email}</span>
        </div>
      )}
    </nav>
  );
}
