'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, ExternalLink, Clock, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

function cleanChronology(text: string): string {
  return text.replace(/^["'""]+|["'""]+$/g, '').trim();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

interface ReportItem {
  id: string;
  status: string;
  category: string;
  chronology: string;
  created_at: string;
  platform?: string | null;
  loss_amount?: number | string | null;
  incident_date?: string | null;
  has_other_victims?: string | null;
  evidence_url?: string | null;
  evidence_urls?: string[] | null;
  social_media_accounts?: string[] | null;
}

interface Props {
  reports: ReportItem[];
  hasWithdrawn?: boolean;
  hasLinkedReports?: boolean;
  linkedHasVerified?: boolean;
}

function getAllEvidenceUrls(reports: ReportItem[]): string[] {
  const urlSet = new Set<string>();
  reports.forEach((r) => {
    if (Array.isArray(r.evidence_urls) && r.evidence_urls.length > 0) {
      r.evidence_urls.forEach((url) => { if (url) urlSet.add(url); });
    } else if (r.evidence_url) {
      urlSet.add(r.evidence_url);
    }
  });
  return Array.from(urlSet);
}

// ── Evidence Gallery ──────────────────────────────────────────────────────────
function EvidenceGallery({ urls }: { urls: string[] }) {
  const [showAll, setShowAll] = useState(false);
  const PREVIEW_COUNT = 4;
  const displayUrls = showAll ? urls : urls.slice(0, PREVIEW_COUNT);
  const remaining = urls.length - PREVIEW_COUNT;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {displayUrls.map((url, i) => (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
            className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50 hover:border-slate-400 transition-all">
            <Image src={url} alt={`Bukti ${i + 1}`} fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy" unoptimized />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <ExternalLink className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute top-1.5 left-1.5 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">{i + 1}</div>
          </a>
        ))}
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <p className="text-[10px] text-slate-400">
          Klik foto untuk lihat ukuran penuh · {urls.length} foto bukti
        </p>
        {!showAll && remaining > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors shrink-0 ml-3"
          >
            Lihat semua {urls.length} foto
          </button>
        )}
        {showAll && urls.length > PREVIEW_COUNT && (
          <button
            onClick={() => setShowAll(false)}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors shrink-0 ml-3"
          >
            Sembunyikan
          </button>
        )}
      </div>
    </div>
  );
}

export default function ReportList({ reports, hasWithdrawn = false, hasLinkedReports = false, linkedHasVerified = false }: Props) {
  const allEvidenceUrls = getAllEvidenceUrls(reports);

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2.5 px-0.5 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-medium">Riwayat laporan</p>
          {reports.length > 0 && (
            <p className="text-[10px] text-slate-400">{reports.length} laporan dari {reports.length} korban berbeda</p>
          )}
        </div>

        {reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report, index) => {
              const isVerified = report.status === 'verified';
              return (
                <div key={report.id}
                  className={`bg-white rounded-lg border overflow-hidden ${
                    isVerified ? 'border-emerald-200' : 'border-slate-200'
                  }`}>
                  <div className={`flex items-center justify-between px-4 py-2.5 border-b ${
                    isVerified ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex items-center gap-2">
                      {isVerified
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        : <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                        isVerified ? 'text-emerald-700' : 'text-amber-600'
                      }`}>
                        Laporan #{index + 1} · {isVerified ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">
                      {formatDate(report.incident_date || report.created_at)}
                    </span>
                  </div>
                  <div className="px-4 py-4">
                    <p className="text-sm text-slate-600 leading-relaxed break-words"
                      style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>
                      &quot;{cleanChronology(report.chronology)}&quot;
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        ) : hasWithdrawn ? (
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-8 text-center">
            <Clock className="w-6 h-6 text-amber-400 mx-auto mb-2.5" />
            <p className="text-sm font-semibold text-amber-800 mb-1">Laporan sedang diperbarui</p>
            <p className="text-xs text-amber-600 max-w-xs mx-auto leading-relaxed">
              Pelapor sedang merevisi laporannya. Detail akan kembali muncul setelah disetujui moderator.
            </p>
          </div>

        ) : hasLinkedReports ? (
          <div className={`bg-white rounded-lg border overflow-hidden ${linkedHasVerified ? 'border-red-200' : 'border-amber-200'}`}>
            <div className="flex items-start gap-3 px-4 py-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${linkedHasVerified ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'}`}>
                <ShieldAlert className={`w-4 h-4 ${linkedHasVerified ? 'text-red-500' : 'text-amber-500'}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 mb-1">
                  Belum ada laporan langsung untuk nomor ini
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {linkedHasVerified
                    ? 'Nomor ini disebutkan dalam laporan yang sudah diverifikasi oleh tim moderator. Pelaku yang sama terbukti menggunakan beberapa nomor berbeda — lihat peringatan di atas.'
                    : 'Nomor ini belum pernah dilaporkan secara langsung. Namun berdasarkan laporan komunitas, nomor ini disebutkan sebagai salah satu nomor yang digunakan oleh pelaku yang sama.'}
                </p>
                <div className={`mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border ${
                  linkedHasVerified
                    ? 'text-red-700 bg-red-50 border-red-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}>
                  {linkedHasVerified ? 'Pelaku terbukti, tetap waspada' : '⚠ Tetap waspada dengan nomor ini'}
                </div>
              </div>
            </div>
          </div>

        ) : (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <ShieldCheck className="w-7 h-7 text-emerald-500 mx-auto mb-2.5" />
            <p className="text-sm font-semibold text-slate-900 mb-1">Database bersih</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Tidak ditemukan riwayat laporan terkait nomor ini.
            </p>
          </div>
        )}
      </div>

      {allEvidenceUrls.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-2.5 font-medium px-0.5">
            Bukti lampiran
          </p>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <EvidenceGallery urls={allEvidenceUrls} />
          </div>
        </div>
      )}
    </div>
  );
}