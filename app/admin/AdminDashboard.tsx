// ============================================
// 📁 LOKASI: app/admin/AdminDashboard.tsx
// ✅ REDESIGN: Clean white minimal (Notion/Linear style)
//    - UI dipoles: spacing, typography, card design
//    - Fitur baru: detail bank/kerugian di expanded report
//    - Fitur baru: quick stats per bank
//    - Fitur baru: filter by bank & platform
//    - Chart lebih clean
// ============================================

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, XCircle, Clock, Eye, ExternalLink,
  Phone, Building2, ChevronDown, ChevronUp, Loader2,
  Search, Users, FileText, BarChart2, Download,
  AlertCircle, ShieldCheck, Shield, Wallet, Calendar,
  DollarSign, Globe, Filter, X, TrendingUp,
} from 'lucide-react';
import { updateReportStatus, updateUserRole } from './actions';
import { formatDateID } from '@/lib/utils';

interface Report {
  id: string;
  reporter_email: string;
  target_number: string;
  target_name: string | null;
  target_type: string;
  category: string;
  chronology: string;
  evidence_url: string | null;
  status: string;
  created_at: string;
  bank_name?: string | null;
  loss_amount?: number | null;
  incident_date?: string | null;
  platform?: string | null;
}

interface User {
  id: string;
  full_name: string | null;
  role: string;
  updated_at: string | null;
}

interface Stats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

type Tab = 'laporan' | 'statistik' | 'pengguna';
type StatusFilter = 'semua' | 'pending' | 'verified' | 'rejected';

function formatRupiah(num: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}

export default function AdminDashboard({
  stats, reports, users
}: {
  stats: Stats;
  reports: Report[];
  users: User[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>('laporan');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [bankFilter, setBankFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const router = useRouter();

  // Unique banks & platforms for filter
  const uniqueBanks = useMemo(() => {
    const banks = new Set(reports.map(r => r.bank_name).filter(Boolean) as string[]);
    return Array.from(banks).sort();
  }, [reports]);

  const uniquePlatforms = useMemo(() => {
    const platforms = new Set(reports.map(r => r.platform).filter(Boolean) as string[]);
    return Array.from(platforms).sort();
  }, [reports]);

  // Filter + search
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchStatus = statusFilter === 'semua' || r.status === statusFilter;
      const matchBank = !bankFilter || r.bank_name === bankFilter;
      const matchPlatform = !platformFilter || r.platform === platformFilter;
      const matchSearch = !searchQuery ||
        r.target_number.includes(searchQuery) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reporter_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.target_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.bank_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchBank && matchPlatform && matchSearch;
    });
  }, [reports, statusFilter, searchQuery, bankFilter, platformFilter]);

  const hasActiveFilters = bankFilter || platformFilter;

  // Total kerugian
  const totalLoss = useMemo(() => {
    return reports.reduce((sum, r) => sum + (r.loss_amount || 0), 0);
  }, [reports]);

  const handleAction = async (reportId: string, status: 'verified' | 'rejected' | 'pending') => {
    setLoadingId(reportId);
    try {
      await updateReportStatus(reportId, status);
      router.refresh();
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleBulkAction = async (status: 'verified' | 'rejected') => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all([...selectedIds].map(id => updateReportStatus(id, status)));
      setSelectedIds(new Set());
      router.refresh();
    } catch (err) {
      console.error('Bulk action error:', err);
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredReports.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredReports.map(r => r.id)));
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ['ID', 'Nomor', 'Nama', 'Tipe', 'Bank/E-Wallet', 'Kategori', 'Platform', 'Kerugian', 'Tanggal Kejadian', 'Status', 'Pelapor', 'Tanggal Lapor'],
      ...reports.map(r => [
        r.id, r.target_number, r.target_name ?? '', r.target_type,
        r.bank_name ?? '', r.category, r.platform ?? '',
        r.loss_amount ? String(r.loss_amount) : '', r.incident_date ?? '',
        r.status, r.reporter_email, r.created_at
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-kawaltransaksi-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Clock },
    verified: { label: 'Verified', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'bg-red-50 text-red-500 border-red-200', icon: XCircle },
  };

  // Stats per bank
  const bankStats = useMemo(() => {
    const map: Record<string, { count: number; loss: number }> = {};
    reports.forEach(r => {
      if (r.bank_name) {
        if (!map[r.bank_name]) map[r.bank_name] = { count: 0, loss: 0 };
        map[r.bank_name].count++;
        map[r.bank_name].loss += r.loss_amount || 0;
      }
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [reports]);

  // Stats per kategori
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach(r => { map[r.category] = (map[r.category] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [reports]);
  const maxCat = categoryStats[0]?.[1] || 1;

  // Stats per platform
  const platformStats = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach(r => { if (r.platform) map[r.platform] = (map[r.platform] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [reports]);
  const maxPlat = platformStats[0]?.[1] || 1;

  // Laporan per hari (7 hari terakhir)
  const dailyStats = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toISOString().split('T')[0]] = 0;
    }
    reports.forEach(r => {
      const day = r.created_at.split('T')[0];
      if (day in days) days[day]++;
    });
    return Object.entries(days);
  }, [reports]);
  const maxDaily = Math.max(...dailyStats.map(d => d[1]), 1);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">

      {/* ===== STATS ROW ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Laporan', value: stats.total, icon: FileText, color: 'text-zinc-900' },
          { label: 'Menunggu Review', value: stats.pending, icon: Clock, color: 'text-amber-500' },
          { label: 'Terverifikasi', value: stats.verified, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Ditolak', value: stats.rejected, icon: XCircle, color: 'text-red-500' },
          { label: 'Total Kerugian', value: totalLoss > 0 ? formatRupiah(totalLoss) : 'Rp 0', icon: DollarSign, color: 'text-zinc-900', isText: true },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-zinc-200/80 p-5 hover:border-zinc-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <s.icon className="w-4 h-4 text-zinc-400" />
              {s.label === 'Menunggu Review' && stats.pending > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </div>
            <p className={`text-2xl font-bold tracking-tight ${s.color}`}>
              {'isText' in s ? s.value : s.value}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Alert pending */}
      {stats.pending > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            <span className="font-semibold">{stats.pending}</span> laporan menunggu review
          </p>
        </div>
      )}

      {/* ===== TABS ===== */}
      <div className="flex gap-1 border-b border-zinc-200">
        {[
          { id: 'laporan', label: 'Laporan', icon: FileText, count: reports.length },
          { id: 'statistik', label: 'Statistik', icon: BarChart2 },
          { id: 'pengguna', label: 'Pengguna', icon: Users, count: users.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {'count' in tab && (
              <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-full font-semibold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ===== TAB: LAPORAN ===== */}
      {activeTab === 'laporan' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari nomor, nama, kategori, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400 transition-colors"
              />
            </div>

            {/* Filter dropdowns */}
            <div className="flex gap-2 flex-wrap">
              {uniqueBanks.length > 0 && (
                <div className="relative">
                  <select
                    value={bankFilter}
                    onChange={(e) => setBankFilter(e.target.value)}
                    className={`pl-3 pr-8 py-2.5 border rounded-lg text-sm font-medium appearance-none cursor-pointer transition-colors ${
                      bankFilter ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    <option value="">Bank / E-Wallet</option>
                    {uniqueBanks.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}

              {uniquePlatforms.length > 0 && (
                <div className="relative">
                  <select
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                    className={`pl-3 pr-8 py-2.5 border rounded-lg text-sm font-medium appearance-none cursor-pointer transition-colors ${
                      platformFilter ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    <option value="">Platform</option>
                    {uniquePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              )}

              {hasActiveFilters && (
                <button
                  onClick={() => { setBankFilter(''); setPlatformFilter(''); }}
                  className="flex items-center gap-1 px-3 py-2.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  <X className="w-3 h-3" /> Reset filter
                </button>
              )}

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-600 hover:border-zinc-300 transition-colors shrink-0"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Status filters */}
          <div className="flex gap-2">
            {(['semua', 'pending', 'verified', 'rejected'] as StatusFilter[]).map((f) => {
              const count = f === 'semua' ? reports.length : reports.filter(r => r.status === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                    statusFilter === f
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                  }`}
                >
                  {f} ({count})
                </button>
              );
            })}
          </div>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="bg-zinc-900 text-white rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm">{selectedIds.size} dipilih</span>
              <div className="flex gap-2">
                <button onClick={() => handleBulkAction('verified')} disabled={bulkLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50">
                  {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Approve
                </button>
                <button onClick={() => handleBulkAction('rejected')} disabled={bulkLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-400 transition-colors disabled:opacity-50">
                  {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />} Reject
                </button>
                <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white">
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Select all */}
          {filteredReports.length > 0 && (
            <label className="flex items-center gap-2 px-1 cursor-pointer">
              <input type="checkbox" checked={selectedIds.size === filteredReports.length && filteredReports.length > 0}
                onChange={selectAll} className="w-3.5 h-3.5 rounded cursor-pointer accent-zinc-900" />
              <span className="text-xs text-zinc-400">Pilih semua ({filteredReports.length})</span>
            </label>
          )}

          {/* Report list */}
          {filteredReports.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-16 text-center">
              <Search className="w-8 h-8 text-zinc-200 mx-auto mb-3" />
              <p className="text-sm text-zinc-400">Tidak ada laporan ditemukan.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredReports.map((report) => {
                const status = statusConfig[report.status as keyof typeof statusConfig] ?? statusConfig.pending;
                const StatusIcon = status.icon;
                const isExpanded = expandedId === report.id;
                const isLoading = loadingId === report.id;
                const isSelected = selectedIds.has(report.id);

                return (
                  <div key={report.id}
                    className={`bg-white border rounded-xl overflow-hidden transition-all ${
                      isSelected ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200 hover:border-zinc-300'
                    }`}>
                    <div className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(report.id)}
                          className="w-3.5 h-3.5 rounded cursor-pointer accent-zinc-900 shrink-0" />

                        <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
                          {report.target_type === 'phone'
                            ? <Phone className="w-3.5 h-3.5 text-zinc-500" />
                            : <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                          }
                        </div>

                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-zinc-900 text-sm font-mono">{report.target_number}</span>
                            {report.target_name && <span className="text-xs text-zinc-400">· {report.target_name}</span>}
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${status.color}`}>
                              <StatusIcon className="w-2.5 h-2.5" /> {status.label}
                            </span>
                            {report.bank_name && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-zinc-100 text-zinc-500 rounded font-medium">
                                {report.bank_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                            <span>{report.category}</span>
                            <span>·</span>
                            <span>{formatDateID(report.created_at)}</span>
                            {report.loss_amount && (
                              <><span>·</span><span className="text-red-500 font-medium">{formatRupiah(report.loss_amount)}</span></>
                            )}
                            {report.platform && (
                              <><span>·</span><span>{report.platform}</span></>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {report.status === 'pending' && (
                            <>
                              <button onClick={() => handleAction(report.id, 'verified')} disabled={isLoading}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50">
                                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                <span className="hidden sm:inline">Approve</span>
                              </button>
                              <button onClick={() => handleAction(report.id, 'rejected')} disabled={isLoading}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50">
                                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                                <span className="hidden sm:inline">Reject</span>
                              </button>
                            </>
                          )}
                          {report.status === 'verified' && (
                            <button onClick={() => handleAction(report.id, 'rejected')} disabled={isLoading}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-100 text-zinc-500 text-xs font-medium rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50">
                              <XCircle className="w-3 h-3" /><span className="hidden sm:inline">Reject</span>
                            </button>
                          )}
                          {report.status === 'rejected' && (
                            <button onClick={() => handleAction(report.id, 'verified')} disabled={isLoading}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-100 text-zinc-500 text-xs font-medium rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors disabled:opacity-50">
                              <CheckCircle2 className="w-3 h-3" /><span className="hidden sm:inline">Approve</span>
                            </button>
                          )}
                          <button onClick={() => setExpandedId(isExpanded ? null : report.id)}
                            className="w-7 h-7 bg-zinc-100 rounded-lg flex items-center justify-center hover:bg-zinc-200 transition-colors">
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-zinc-100 px-4 py-4 bg-zinc-50/50 space-y-4">
                        {/* Info grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="bg-white rounded-lg border border-zinc-100 p-3">
                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Pelapor</p>
                            <p className="text-sm font-medium text-zinc-700 truncate">{report.reporter_email}</p>
                          </div>
                          {report.bank_name && (
                            <div className="bg-white rounded-lg border border-zinc-100 p-3">
                              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Bank / E-Wallet</p>
                              <p className="text-sm font-medium text-zinc-700">{report.bank_name}</p>
                            </div>
                          )}
                          {report.loss_amount && (
                            <div className="bg-white rounded-lg border border-zinc-100 p-3">
                              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Kerugian</p>
                              <p className="text-sm font-semibold text-red-600">{formatRupiah(report.loss_amount)}</p>
                            </div>
                          )}
                          {report.incident_date && (
                            <div className="bg-white rounded-lg border border-zinc-100 p-3">
                              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Tanggal Kejadian</p>
                              <p className="text-sm font-medium text-zinc-700">{formatDateID(report.incident_date)}</p>
                            </div>
                          )}
                          {report.platform && (
                            <div className="bg-white rounded-lg border border-zinc-100 p-3">
                              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Platform</p>
                              <p className="text-sm font-medium text-zinc-700">{report.platform}</p>
                            </div>
                          )}
                        </div>

                        {/* Kronologi */}
                        <div>
                          <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-2">Kronologi</p>
                          <div className="bg-white border border-zinc-100 rounded-lg p-4">
                            <p className="text-sm text-zinc-600 leading-relaxed">{report.chronology}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          {report.evidence_url && (
                            <a href={report.evidence_url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                              <Eye className="w-3.5 h-3.5" /> Lihat Bukti <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <a href={`/check/${report.target_number}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-900 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" /> Halaman publik
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== TAB: STATISTIK ===== */}
      {activeTab === 'statistik' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Laporan per hari */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-6">Laporan 7 Hari Terakhir</h3>
              <div className="flex items-end gap-2 h-36">
                {dailyStats.map(([date, count]) => (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400 font-medium">{count}</span>
                    <div className="w-full bg-zinc-900 rounded-md transition-all hover:bg-zinc-700"
                      style={{ height: `${Math.max((count / maxDaily) * 100, 6)}%` }} />
                    <span className="text-[9px] text-zinc-400">
                      {new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kategori */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-6">Kategori Penipuan</h3>
              {categoryStats.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-8">Belum ada data</p>
              ) : (
                <div className="space-y-3">
                  {categoryStats.map(([cat, count]) => (
                    <div key={cat}>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-medium text-zinc-700">{cat}</span>
                        <span className="text-[11px] text-zinc-400">{count}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-900 rounded-full" style={{ width: `${(count / maxCat) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bank stats */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-6">Laporan per Bank / E-Wallet</h3>
              {bankStats.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-8">Belum ada data bank</p>
              ) : (
                <div className="space-y-3">
                  {bankStats.map(([bank, data]) => (
                    <div key={bank} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-zinc-100 rounded-md flex items-center justify-center">
                          <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{bank}</p>
                          <p className="text-[11px] text-zinc-400">{data.count} laporan</p>
                        </div>
                      </div>
                      {data.loss > 0 && (
                        <span className="text-xs font-medium text-red-500">{formatRupiah(data.loss)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Platform stats */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-6">Platform Transaksi</h3>
              {platformStats.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-8">Belum ada data platform</p>
              ) : (
                <div className="space-y-3">
                  {platformStats.map(([plat, count]) => (
                    <div key={plat}>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-medium text-zinc-700">{plat}</span>
                        <span className="text-[11px] text-zinc-400">{count}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-700 rounded-full" style={{ width: `${(count / maxPlat) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Rate cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Approval Rate', value: stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0, color: 'text-emerald-500' },
              { label: 'Rejection Rate', value: stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0, color: 'text-red-500' },
              { label: 'Pending Rate', value: stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0, color: 'text-amber-500' },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-zinc-200 rounded-xl p-5 text-center">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}%</p>
                <p className="text-[11px] text-zinc-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== TAB: PENGGUNA ===== */}
      {activeTab === 'pengguna' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-zinc-900">Semua Pengguna</h3>
            <span className="text-xs text-zinc-400">{users.length} total</span>
          </div>
          {users.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-16 text-center">
              <Users className="w-8 h-8 text-zinc-200 mx-auto mb-3" />
              <p className="text-sm text-zinc-400">Belum ada pengguna.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <UserRow key={user.id} user={user} onRefresh={() => router.refresh()} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===== USER ROW COMPONENT =====

function UserRow({ user, onRefresh }: { user: User; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleRoleChange = async (newRole: 'user' | 'admin' | 'moderator') => {
    setLoading(true);
    try {
      await updateUserRole(user.id, newRole);
      onRefresh();
    } catch (err) {
      console.error('Update role error:', err);
    } finally {
      setLoading(false);
    }
  };

  const roleConfig = {
    admin: { label: 'Admin', color: 'bg-red-50 text-red-600 border-red-200' },
    moderator: { label: 'Moderator', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    user: { label: 'User', color: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
  };

  const role = roleConfig[user.role as keyof typeof roleConfig] ?? roleConfig.user;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl px-4 py-3.5 flex items-center gap-3">
      <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center shrink-0">
        <span className="text-white text-xs font-semibold">
          {(user.full_name || 'U').charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-grow min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate">{user.full_name || 'Tanpa Nama'}</p>
        <p className="text-[11px] text-zinc-400">{user.updated_at ? formatDateID(user.updated_at) : '-'}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${role.color}`}>
          {role.label}
        </span>
        {user.role !== 'admin' && (
          <button onClick={() => handleRoleChange('admin')} disabled={loading}
            className="text-[11px] font-medium px-2.5 py-1 bg-zinc-100 text-zinc-500 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Jadikan Admin'}
          </button>
        )}
        {user.role === 'admin' && (
          <button onClick={() => handleRoleChange('user')} disabled={loading}
            className="text-[11px] font-medium px-2.5 py-1 bg-zinc-100 text-zinc-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Cabut Admin'}
          </button>
        )}
      </div>
    </div>
  );
}