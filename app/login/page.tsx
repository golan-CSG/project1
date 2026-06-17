"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="bg-green-600 rounded-xl p-1.5"><Logo size={32} /></div>
          <h1 className="text-2xl font-bold text-slate-800">התחברות ל־Bikeshook</h1>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">אימייל</label>
            <input type="email" required autoCapitalize="none" autoCorrect="off" spellCheck={false}
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">סיסמה</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
            {loading ? "מתחבר..." : "התחברות"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          אין לך חשבון? <Link href="/register" className="text-green-600 hover:underline">הרשמה חינם</Link>
        </p>
      </div>
    </div>
  );
}
