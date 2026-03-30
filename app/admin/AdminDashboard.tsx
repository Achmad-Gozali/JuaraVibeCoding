'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle2, XCircle, Clock, Eye, ExternalLink,
  Phone, Building2, ChevronDown, ChevronUp, Loader2,
  Search, Users, FileText, DollarSign, X, TrendingUp, ChevronRight,
  AlertCircle, Download
} from 'lucide-react';
import { updateReportStatus, updateUserRole } from './actions';
import { formatDateID } from '@/lib/utils';

// ... (Interface Report, AdminUser, Stats tetap sama) ...
interface Report { id: string; reporter_email: string; target_number: string; target_name: string | null; target_type: string; category: string; chronology: string; evidence_url: string | null; status: string; created_at: string; bank_name?: string | null; loss_amount?: number | string | null; incident_date?: string | null; platform?: string | null; }
interface AdminUser { id: string; full_name: string | null; role: string; updated_at: string | null; }
interface Stats { total: number; pending: number; verified: number; rejected: number; }
type Tab = 'dashboard' | 'laporan' | 'statistik' | 'pengguna';
type StatusFilter = 'semua' | 'pending' | 'verified' | 'rejected';

function formatRupiah(num: number | string): string {
  const parsedNum = Number(num) || 0;
  if (parsedNum >= 1_000_000_000) return `Rp ${(parsedNum / 1_000_000_000).toFixed(1)}M`;
  if (parsedNum >= 1_000_000) return `Rp ${(parsedNum / 1_000_000).toFixed(1)}jt`;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(parsedNum);
}

function DashboardInner({ stats, reports, users }: { stats: Stats; reports: Report[]; users: AdminUser[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = (searchParams.get('tab') as Tab) || 'dashboard';

  // ✅ FIX TIMEZONE HARI INI (Gunakan Waktu Lokal Jakarta)
  const todayStr = new Date().toLocaleDateString('en-CA'); 
  const todayReports = useMemo(() => reports.filter(r => {
    return new Date(r.created_at).toLocaleDateString('en-CA') === todayStr;
  }), [reports, todayStr]);

  const todayVerified = useMemo(() => todayReports.filter(r => r.status === 'verified'), [todayReports]);
  const totalLoss = useMemo(() => reports.reduce((s, r) => s + (Number(r.loss_amount) || 0), 0), [reports]);

  // ✅ FIX GRAFIK: Gabungkan Bank & Nomor Telepon
  const bankStats = useMemo(() => {
    const map: Record<string, { count: number; loss: number }> = {};
    reports.forEach(r => { 
        const label = r.bank_name || (r.target_type === 'phone' ? 'Nomor Telepon' : 'Lainnya');
        if (!map[label]) map[label] = { count: 0, loss: 0 }; 
        map[label].count++; 
        map[label].loss += (Number(r.loss_amount) || 0); 
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [reports]);

  // ... (Sisa logika State & useMemo lainnya sama seperti kode lu) ...
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('semua');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [bankFilter, setBankFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const uniqueBanks = useMemo(() => Array.from(new Set(reports.map(r => r.bank_name).filter(Boolean) as string[])).sort(), [reports]);
  const uniquePlatforms = useMemo(() => Array.from(new Set(reports.map(r => r.platform).filter(Boolean) as string[])).sort(), [reports]);

  const dailyStats = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days[d.toLocaleDateString('en-CA')] = 0; }
    reports.forEach(r => { const d = new Date(r.created_at).toLocaleDateString('en-CA'); if (d in days) days[d]++; });
    return Object.entries(days);
  }, [reports]);
  const maxDaily = Math.max(...dailyStats.map(d => d[1]), 1);
  
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach(r => { map[r.category] = (map[r.category] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [reports]);
  const maxCat = categoryStats[0]?.[1] || 1;

  const platformStats = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach(r => { if (r.platform) map[r.platform] = (map[r.platform] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [reports]);
  const maxPlat = platformStats[0]?.[1] || 1;

  // ... (Sisa fungsi handleAction & Return JSX tetap sama dengan kode lu) ...
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchStatus = statusFilter === 'semua' || r.status === statusFilter;
      const matchBank = !bankFilter || r.bank_name === bankFilter;
      const matchPlatform = !platformFilter || r.platform === platformFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || r.target_number.includes(q) || r.category.toLowerCase().includes(q) ||
        r.reporter_email?.toLowerCase().includes(q) || r.target_name?.toLowerCase().includes(q) || r.bank_name?.toLowerCase().includes(q);
      return matchStatus && matchBank && matchPlatform && matchSearch;
    });
  }, [reports, statusFilter, searchQuery, bankFilter, platformFilter]);

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const q = userSearch.toLowerCase();
    return users.filter(u => u.full_name?.toLowerCase().includes(q) || u.id.toLowerCase().includes(q));
  }, [users, userSearch]);

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Clock },
    verified: { label: 'Verified', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'bg-red-50 text-red-500 border-red-200', icon: XCircle },
  };

  const handleAction = async (id: string, status: 'verified' | 'rejected' | 'pending') => {
    setLoadingId(id);
    try { await updateReportStatus(id, status); router.refresh(); } catch (err) { console.error(err); } finally { setLoadingId(null); }
  };
  
  const handleBulkAction = async (status: 'verified' | 'rejected') => {
    if (selectedIds.size === 0) return; setBulkLoading(true);
    try { await Promise.all([...selectedIds].map(id => updateReportStatus(id, status))); setSelectedIds(new Set()); router.refresh(); } catch (err) { console.error(err); } finally { setBulkLoading(false); }
  };
  
  const toggleSelect = (id: string) => { const n = new Set(selectedIds); n.has(id) ? n.delete(id) : n.add(id); setSelectedIds(n); };
  const selectAll = () => setSelectedIds(selectedIds.size === filteredReports.length ? new Set() : new Set(filteredReports.map(r => r.id)));
  
  const handleExportCSV = () => {
    const rows = [['ID','Nomor','Nama','Tipe','Bank','Kategori','Platform','Kerugian','Tgl Kejadian','Status','Pelapor','Tgl Lapor'],
      ...reports.map(r => [r.id,r.target_number,r.target_name??'',r.target_type,r.bank_name??'',r.category,r.platform??'',r.loss_amount?String(r.loss_amount):'',r.incident_date??'',r.status,r.reporter_email,r.created_at])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `laporan-${todayStr}.csv`; a.click();
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* (Copy JSX Render yang lu punya di sini, sudah aman) */}
      {/* ... Sesuai dengan kode render yang lu kirim sebelumnya ... */}
      
      {/* Bagian Statistik Card & Tab Rendering tetap sama */}
      {currentTab === 'dashboard' && (
        <div className="space-y-8">
          <div><h1 className="text-xl lg:text-2xl font-semibold text-zinc-900">Dashboard</h1><p className="text-sm text-zinc-400 mt-1">Overview semua laporan</p></div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Laporan', value: String(stats.total), color: 'text-zinc-900', icon: FileText },
              { label: 'Menunggu', value: String(stats.pending), color: 'text-amber-500', icon: Clock },
              { label: 'Terverifikasi', value: String(stats.verified), color: 'text-emerald-500', icon: CheckCircle2 },
              { label: 'Ditolak', value: String(stats.rejected), color: 'text-red-500', icon: XCircle },
              { label: 'Total Kerugian', value: totalLoss > 0 ? formatRupiah(totalLoss) : 'Rp 0', color: 'text-zinc-900', icon: DollarSign },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-zinc-200/80 p-5 lg:p-6">
                <s.icon className="w-5 h-5 text-zinc-300 mb-4" />
                <p className={`text-2xl lg:text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-zinc-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-zinc-200/80 p-5 lg:p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0"><TrendingUp className="w-6 h-6 text-blue-500" /></div>
              <div><p className="text-2xl lg:text-3xl font-bold text-zinc-900">{todayReports.length}</p><p className="text-xs text-zinc-400 mt-0.5">Laporan masuk hari ini</p></div>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200/80 p-5 lg:p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0"><CheckCircle2 className="w-6 h-6 text-emerald-500" /></div>
              <div><p className="text-2xl lg:text-3xl font-bold text-zinc-900">{todayVerified.length}</p><p className="text-xs text-zinc-400 mt-0.5">Verified hari ini</p></div>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white border border-zinc-200/80 rounded-xl p-5 lg:p-6">
              <h3 className="text-sm font-medium text-zinc-900 mb-6">7 hari terakhir</h3>
              <div className="flex items-end gap-3 h-36">
                {dailyStats.map(([date, count]) => (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[11px] text-zinc-400 font-medium">{count}</span>
                    <div className="w-full bg-zinc-900 rounded-md hover:bg-zinc-700 transition-colors" style={{ height: `${Math.max((count / maxDaily) * 100, 6)}%` }} />
                    <span className="text-[9px] text-zinc-400">{new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-zinc-200/80 rounded-xl p-5 lg:p-6">
              <h3 className="text-sm font-medium text-zinc-900 mb-4">Bank terbanyak dilaporkan</h3>
              <div className="space-y-3">
                {bankStats.slice(0, 5).map(([label, data]) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {label === 'Nomor Telepon' ? <Phone className="w-3.5 h-3.5 text-zinc-400" /> : <Building2 className="w-3.5 h-3.5 text-zinc-400" />}
                      <span className="text-sm text-zinc-700">{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-red-500">{formatRupiah(data.loss)}</span>
                      <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded">{data.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* (Lanjutkan Render Tab Laporan, Statistik, Pengguna dari kode asli lu) */}
      {/* ... */}
    </div>
  );
}

export default function AdminDashboard(props: { stats: Stats; reports: Report[]; users: AdminUser[] }) {
  return <Suspense fallback={<div className="p-8"><div className="h-8 w-32 bg-zinc-200 rounded animate-pulse" /></div>}><DashboardInner {...props} /></Suspense>;
}