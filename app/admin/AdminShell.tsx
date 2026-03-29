// ============================================
// 📁 LOKASI: app/admin/AdminShell.tsx
// ✅ NEW: White sidebar + white top nav
//    - Collapsible sidebar (toggle)
//    - Logout button
//    - Global search
//    - User info di bawah sidebar
// ============================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import {
  LayoutDashboard, FileText, BarChart2, Users,
  Home, LogOut, ChevronLeft, ChevronRight,
  ShieldAlert, Search, X, Menu,
} from 'lucide-react';

interface AdminShellProps {
  email: string;
  children: React.ReactNode;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { id: 'laporan', label: 'Laporan', icon: FileText, href: '/admin?tab=laporan' },
  { id: 'statistik', label: 'Statistik', icon: BarChart2, href: '/admin?tab=statistik' },
  { id: 'pengguna', label: 'Pengguna', icon: Users, href: '/admin?tab=pengguna' },
];

export default function AdminShell({ email, children }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      router.push(`/admin?search=${encodeURIComponent(globalSearch.trim())}`);
      setGlobalSearch('');
    }
  };

  const initial = (email || 'A').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-50/80 flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-zinc-200/80 z-50 flex flex-col transition-all duration-200 ease-out
          ${collapsed ? 'w-[60px]' : 'w-[220px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-2.5 px-4 h-14 border-b border-zinc-100 shrink-0 ${collapsed ? 'justify-center px-0' : ''}`}>
          <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center shrink-0">
            <ShieldAlert className="w-3.5 h-3.5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="text-[13px] font-semibold text-zinc-900">Kawal</span>
              <span className="text-[13px] font-semibold text-red-500">Transaksi</span>
              <p className="text-[10px] text-zinc-400 -mt-0.5">Admin panel</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === '/admin'
              ? pathname === '/admin' && !item.id.includes('tab')
              : pathname === '/admin';
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${collapsed ? 'justify-center px-0 mx-1' : ''}
                  ${isActive
                    ? 'bg-zinc-100 text-zinc-900 font-medium'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                  }
                `}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-zinc-100">
            <Link
              href="/"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors ${collapsed ? 'justify-center px-0 mx-1' : ''}`}
              title={collapsed ? 'Kembali ke site' : undefined}
            >
              <Home className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Kembali ke site</span>}
            </Link>
          </div>
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-10 border-t border-zinc-100 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* User info + Logout */}
        <div className="border-t border-zinc-100 p-3 shrink-0">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-medium text-zinc-500">
                {initial}
              </div>
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-medium text-zinc-500 shrink-0">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-zinc-700 truncate">{email}</p>
                <p className="text-[10px] text-zinc-400">Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${collapsed ? 'lg:ml-[60px]' : 'lg:ml-[220px]'}`}>
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-zinc-200/80 flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Global search */}
          <form onSubmit={handleGlobalSearch} className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari laporan, pengguna..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400 focus:bg-white transition-colors"
              />
              {globalSearch && (
                <button
                  type="button"
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
            <span>{email}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}