"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store, LayoutDashboard, Receipt,
  PackageSearch, Utensils, LogOut,
  Settings, ChevronRight, ShieldCheck, Sun, Moon, Headset
} from 'lucide-react';
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";

const navItems = [
  { href: "/pos",       icon: Store,           label: "Kasir" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/expenses",  icon: Receipt,         label: "Pengeluaran" },
  { href: "/menu",      icon: Utensils,        label: "Kelola Menu" },
  { href: "/stock",     icon: PackageSearch,   label: "Stok" },
  { href: "/settings",  icon: Settings,        label: "Pengaturan" },
  { href: "https://wa.me/6285756365672?text=Halo%20kak,%20mau%20tanya/lapor", icon: Headset, label: "CS", external: true },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <>
      {/* ═══════════════════════════════════════════
          DESKTOP SIDEBAR (md and above, fixed left)
      ════════════════════════════════════════════ */}
      <aside className="hidden md:flex fixed top-4 left-4 bottom-4 w-56 z-50 flex-col glass-panel border-white/50 shadow-2xl rounded-2xl overflow-hidden">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-blue-500/30 shrink-0">
              <Store size={18} />
            </div>
            <span className="font-black text-lg tracking-tight text-slate-800 leading-none">
              Premium<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">POS</span>
            </span>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-yellow-400" />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-3 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label, external }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                target={external ? "_blank" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all group ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-600 hover:bg-white/70 hover:text-blue-600'
                }`}
              >
                <Icon size={17} className="shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={13} className="opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {user.role === 'admin' && (
          <div className="px-3 pb-2">
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                pathname === '/admin'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30'
                  : 'text-violet-600 hover:bg-violet-50 border border-violet-200/60'
              }`}
            >
              <ShieldCheck size={17} className="shrink-0" />
              <span className="flex-1">Developer Panel</span>
              {pathname === '/admin' && <ChevronRight size={13} className="opacity-50" />}
            </Link>
          </div>
        )}

        {/* User & Logout */}
        <div className="px-3 py-3 border-t border-white/30">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-700 text-sm truncate leading-tight">{user.name}</p>
              <p className="text-xs text-slate-400 truncate leading-tight">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50/80 transition-colors"
          >
            <LogOut size={15} /> Keluar
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════
          MOBILE TOP MINI HEADER (below md only)
      ════════════════════════════════════════════ */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-1.5 rounded-lg">
            <Store size={15} />
          </div>
          <span className="font-black text-base text-slate-800">
            Premium<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">POS</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 mr-1"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} className="text-yellow-400" />}
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          {user.role === 'admin' && (
            <Link href="/admin" className="p-1.5 text-violet-500 hover:bg-violet-50 rounded-lg transition-colors">
              <ShieldCheck size={17} />
            </Link>
          )}
          <button onClick={logout} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MOBILE BOTTOM TAB BAR (below md only)
      ════════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-2xl border-t border-slate-200/80 shadow-2xl">
        <div className="flex justify-around items-center px-1 pt-2 pb-3">
          {navItems.map(({ href, icon: Icon, label, external }) => {
            const active = pathname === href;
            const shortLabel = label === "Kelola Menu" ? "Menu" : label === "Pengeluaran" ? "Keluar" : label;
            return (
              <Link
                key={href}
                href={href}
                target={external ? "_blank" : undefined}
                className="flex flex-col items-center gap-1 flex-1 px-1"
              >
                <div className={`p-2 rounded-xl transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-400 hover:text-blue-500'
                }`}>
                  <Icon size={19} />
                </div>
                <span className={`text-[9px] font-bold leading-none ${
                  active ? 'text-blue-600' : 'text-slate-400'
                }`}>
                  {shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
