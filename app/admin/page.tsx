// ============================================
// 📁 LOKASI: app/admin/page.tsx
// ============================================

import { createClient } from '@/lib/supabase-server';
import { formatDateID } from '@/lib/utils';
import {
  ShieldAlert, Clock, CheckCircle2, XCircle,
  FileText, Users, TrendingUp, Eye
} from 'lucide-react';
import AdminReportTable from './AdminReportTable';

export const revalidate = 0; // always fresh

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: totalReports },
    { count: pendingCount },
    { count: verifiedCount },
    { count: rejectedCount },
    { data: reports },
  ] = await Promise.all([
    supabase.from('reports').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
    supabase.rpc('get_reports_admin'),
  ]);

  const allReports = (reports as any[] | null) ?? [];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-zinc-900">Admin Dashboard</h1>
              <p className="text-xs text-zinc-400">KawalTransaksi — Moderasi Laporan</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-200">
            ADMIN
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Laporan', value: totalReports || 0, icon: FileText, color: 'text-zinc-900', bg: 'bg-zinc-100' },
            { label: 'Menunggu Review', value: pendingCount || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Terverifikasi', value: verifiedCount || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Ditolak', value: rejectedCount || 0, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-zinc-200 rounded-2xl p-5">
              <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl sm:text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-zinc-400 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Pending Alert */}
        {(pendingCount || 0) > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm font-semibold text-amber-800">
              Ada <span className="font-extrabold">{pendingCount}</span> laporan menunggu review. Segera tindaklanjuti dalam 1×24 jam.
            </p>
          </div>
        )}

        {/* Report Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">Semua Laporan</h2>
            <span className="text-xs text-zinc-400">{totalReports || 0} total</span>
          </div>
          <AdminReportTable reports={allReports} />
        </div>
      </div>
    </div>
  );
}