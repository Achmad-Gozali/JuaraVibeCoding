'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import {
  LogOut, User as UserIcon, PlusCircle,
  Menu, X, BookOpen, LayoutDashboard, Phone, Building2, Home, Database
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useRef(createClient()).current;

  // Daftar Menu biar gampang di-map
  const menuItems = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/cek-nomor', label: 'Cek Nomor', icon: Phone },
    { href: '/cek-rekening', label: 'Cek Rekening', icon: Building2 },
    { href: '/report', label: 'Laporkan', icon: PlusCircle },
    { href: '/edukasi', label: 'Edukasi', icon: BookOpen }, // ✅ Edukasi aman
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  // Tutup menu mobile kalau pindah halaman
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-white sticky top-0 z-50 font-sans selection:bg-emerald-100 selection:text-emerald-900 shadow-sm border-b border-slate-200">
      
      {/* HEADER MAIN BAR */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3.5 group shrink-0">
            <div className="relative">
              <Image 
                src="/logo.png?v=2" 
                alt="Logo KawalTransaksi" 
                width={48} 
                height={48} 
                className="rounded-xl group-hover:rotate-6 transition-transform duration-300 shadow-sm"
                priority
              />
              <div className="absolute -inset-1 bg-emerald-500/15 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">
              Kawal<span className="text-emerald-600">Transaksi</span>
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden lg:flex items-center gap-1 bg-white p-1 rounded-xl">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                  isActive(item.href) 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' 
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive(item.href) ? 'text-emerald-600' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            ))}
          </div>

          {/* DESKTOP AUTH BUTTONS */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {isLoading ? (
              <div className="w-10 h-10 bg-slate-100 rounded-lg animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors uppercase tracking-widest border border-transparent hover:border-slate-100 hover:bg-slate-50">
                  <LayoutDashboard className="w-4 h-4 text-slate-400" /> DASHBOARD
                </Link>
                <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors uppercase tracking-widest">
                  <LogOut className="w-4 h-4" /> KELUAR
                </button>
              </div>
            ) : (
              <Link href="/login" className="px-6 py-3 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-all shadow-sm active:scale-95 uppercase tracking-widest">
                MASUK PORTAL
              </Link>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="lg:hidden p-3 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 border border-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* ✅ MOBILE MENU DROPDOWN - Di luar div Header, biar turun mulus ✅ */}
      <div 
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white ${
          isMenuOpen ? 'max-h-[800px] border-b border-slate-200 shadow-xl opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-6 py-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)} // Tutup menu pas di klik
              className={`flex items-center gap-3.5 px-5 py-4 rounded-xl text-sm font-bold transition-all border ${
                isActive(item.href) 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'text-slate-700 hover:bg-slate-50 border-transparent hover:border-slate-100'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="uppercase tracking-wide">{item.label}</span>
            </Link>
          ))}

          <div className="my-6 border-t border-slate-100" />

          {isLoading ? (
              <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
          ) : user ? (
            <div className="space-y-3">
              <div className="px-5 py-4 bg-slate-50 rounded-xl flex items-center gap-3.5 mb-5 border border-slate-100">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-emerald-400 text-sm font-black border border-slate-700 shrink-0">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Reporter Profile</p>
                  <p className="text-xs font-black text-slate-900 truncate">{user.email}</p>
                </div>
              </div>
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3.5 px-5 py-4 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                <LayoutDashboard className="w-5 h-5 text-slate-400" /> Dashboard Saya
              </Link>
              <button onClick={handleSignOut} className="w-full flex items-center gap-3.5 px-5 py-4 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all border border-transparent">
                <LogOut className="w-5 h-5" /> Keluar Akun
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Link href="/register" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center py-4 bg-white text-slate-900 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all border border-slate-200 uppercase tracking-widest shadow-sm">
                DAFTAR
              </Link>
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center py-4 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all shadow-md uppercase tracking-widest">
                MASUK
              </Link>
            </div>
          )}
          
          <div className="mt-10 mb-4 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
              <Database className="w-3 h-3" /> Community Registry
          </div>
        </div>
      </div>
    </nav>
  );
}