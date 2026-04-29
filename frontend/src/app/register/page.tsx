"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import axios from "axios";
import Link from "next/link";
import { Store, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0] as string[];
        setError(firstError[0]);
      } else {
        setError(err.response?.data?.message || "Gagal mendaftar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <div className="glass-panel w-full max-w-md p-8 border-white/60 shadow-2xl relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mt-10"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mb-10"></div>

        <div className="relative z-10 flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-500/30 mb-4">
            <Store size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight text-center">Buka Cabang Baru</h1>
          <p className="text-slate-500 font-medium text-center mt-2">Daftar untuk mengelola sistem kasir Anda sendiri secara gratis.</p>
        </div>

        {error && (
          <div className="relative z-10 bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-semibold text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nama Usaha / Cabang</label>
            <input
              type="text"
              required
              className="w-full p-4 rounded-xl border-2 border-slate-200/50 bg-white/80 focus:outline-none focus:border-blue-500 transition-all font-medium"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Warung Cabang Sudirman"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full p-4 rounded-xl border-2 border-slate-200/50 bg-white/80 focus:outline-none focus:border-blue-500 transition-all font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="budi@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password (Min. 6 Karakter)</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full p-4 rounded-xl border-2 border-slate-200/50 bg-white/80 focus:outline-none focus:border-blue-500 transition-all font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2 active:scale-95"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <UserPlus size={20} /> Buat Akun
              </>
            )}
          </button>
        </form>

        <div className="relative z-10 text-center mt-8 text-slate-500 font-medium">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
