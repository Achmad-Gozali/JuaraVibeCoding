'use client';

// ============================================
// 📁 LOKASI: app/admin/AdminReportTable.tsx
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, XCircle, Clock, Eye, ExternalLink,
  Phone, Building2, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { updateReportStatus } from './actions';
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
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  verified: { label: 'Verified', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
};

const filters = ['Semua', 'Pending', 'Verified', 'Rejected'];

export default function AdminReportTable({ reports }: { reports: Report[] }) {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const filtered = reports.filter((r) => {
    if (activeFilter === 'Semua') return true;
    return r.status === activeFilter.toLowerCase();
  });

  const handleAction = async (reportId: string, status: 'verified' | 'rejected') => {
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

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => {
          const count = f === 'Semua' ? reports.length : reports.filter(r => r.status === f.toLowerCase()).length;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === f
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-400'
              }`}
            >
              {f} <span className="ml-1 opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center">
          <p className="text-sm text-zinc-400">Tidak ada laporan dengan filter ini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => {
            const status = statusConfig[report.status as keyof typeof statusConfig] ?? statusConfig.pending;
            const StatusIcon = status.icon;
            const isExpanded = expandedId === report.id;
            const isLoading = loadingId === report.id;

            return (
              <div key={report.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-300 transition-all">
                {/* Row header */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Type icon */}
                    <div className="w-9 h-9 bg-zinc-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      {report.target_type === 'phone'
                        ? <Phone className="w-4 h-4 text-zinc-500" />
                        : <Building2 className="w-4 h-4 text-zinc-500" />
                      }
                    </div>

                    {/* Main info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-extrabold text-zinc-900 text-sm font-mono">{report.target_number}</span>
                        {report.target_name && <span className="text-xs text-zinc-400">· {report.target_name}</span>}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-[11px] text-zinc-400">
                        <span className="font-semibold text-zinc-600">{report.category}</span>
                        <span>·</span>
                        <span>{formatDateID(report.created_at)}</span>
                        <span>·</span>
                        <span className="truncate max-w-[150px]">{report.reporter_email}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(report.id, 'verified')}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                          >
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">Approve</span>
                          </button>
                          <button
                            onClick={() => handleAction(report.id, 'rejected')}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
                          >
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">Reject</span>
                          </button>
                        </>
                      )}
                      {report.status === 'verified' && (
                        <button
                          onClick={() => handleAction(report.id, 'rejected')}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Reject</span>
                        </button>
                      )}
                      {report.status === 'rejected' && (
                        <button
                          onClick={() => handleAction(report.id, 'verified')}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Approve</span>
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : report.id)}
                        className="w-8 h-8 bg-zinc-100 rounded-xl flex items-center justify-center hover:bg-zinc-200 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-zinc-100 px-4 sm:px-5 py-4 space-y-4 bg-zinc-50">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Kronologi</p>
                      <div className="bg-white border border-zinc-200 rounded-xl p-4">
                        <p className="text-sm text-zinc-600 leading-relaxed">{report.chronology}</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Info Pelapor</p>
                        <div className="bg-white border border-zinc-200 rounded-xl p-3">
                          <p className="text-sm font-medium text-zinc-700">{report.reporter_email}</p>
                        </div>
                      </div>

                      {report.evidence_url && (
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Bukti</p>
                          <div className="bg-white border border-zinc-200 rounded-xl p-3 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-zinc-400" />
                            <a
                              href={report.evidence_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              Lihat Bukti <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/check/${report.target_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Lihat halaman publik
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
  );
}