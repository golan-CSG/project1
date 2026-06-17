import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Bikeshook — שוק חלקי אופניים יד שנייה",
  description: "קנה ומכור חלקי אופניים משומשים",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1">{children}</main>
        <footer className="border-t border-slate-200 py-4 text-center text-sm text-slate-500">
          <div className="flex items-center justify-center gap-4">
            <Link href="/terms" className="hover:text-green-600 hover:underline">כללי השימוש באתר</Link>
            <span className="text-slate-300">|</span>
            <a href="mailto:golanmadar@gmail.com?subject=פנייה%20מאתר%20Bikeshook"
              className="hover:text-green-600 hover:underline">צור קשר עם מנהל האתר</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
