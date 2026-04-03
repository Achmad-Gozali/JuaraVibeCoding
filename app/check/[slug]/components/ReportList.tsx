import { ShieldCheck, ExternalLink } from 'lucide-react';
import { formatDateID } from '@/lib/utils';

function formatSosmed(acc: string): { label: string; isUrl: boolean; href: string } {
  const cleaned = acc.trim();
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return { label: cleaned, isUrl: true, href: cleaned };
  }
  const withoutAt = cleaned.replace(/^@+/, '');
  return { label: `@${withoutAt}`, isUrl: false, href: '' };
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
  social_media_accounts?: string[] | null;
}

interface Props {
  reports: ReportItem[];
}

export default function ReportList({ reports }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-medium">Riwayat laporan</p>
        {reports.length > 0 && (
          <span className="text-[10px] text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full font-medium">
            {reports.length} entri
          </span>
        )}
      </div>

      {reports.length > 0 ? (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                    report.status === 'verified'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {report.status === 'verified' ? 'Terverifikasi' : 'Pending'}
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium uppercase tracking-tight">
                    {report.category}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">{formatDateID(report.created_at)}</div>
              </div>

              <div className="px-4 py-4">
                <p className="text-sm text-slate-600 leading-relaxed italic">&quot;{report.chronology}&quot;</p>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 border-t border-slate-100 bg-slate-50/40">
                {report.platform && (
                  <div className="text-[10px] text-slate-500 uppercase">{report.platform}</div>
                )}
                {report.loss_amount && (
                  <div className="text-[10px] font-semibold text-red-600 uppercase">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0,
                    }).format(Number(report.loss_amount))}
                  </div>
                )}
                {report.incident_date && (
                  <div className="text-[10px] text-slate-400 uppercase">
                    Kejadian: {new Date(report.incident_date).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                )}
                {report.has_other_victims === 'yes' && (
                  <div className="text-[10px] font-semibold text-amber-600 uppercase">Ada korban lain</div>
                )}
                {report.evidence_url && (
                  <a
                    href={report.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] text-emerald-600 hover:text-emerald-700 uppercase tracking-wide transition-colors ml-auto font-medium"
                  >
                    Lampiran <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {Array.isArray(report.social_media_accounts) &&
                report.social_media_accounts.filter(Boolean).length > 0 && (
                  <div className="px-4 py-2.5 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest mr-1">Sosmed:</span>
                    {report.social_media_accounts.filter(Boolean).map((acc, i) => {
                      const fmt = formatSosmed(acc);
                      return (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-md"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          {fmt.isUrl ? (
                            <a
                              href={fmt.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {fmt.label.length > 40 ? fmt.label.slice(0, 40) + '...' : fmt.label}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : fmt.label}
                        </span>
                      );
                    })}
                  </div>
                )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200/80 shadow-sm p-14 text-center">
          <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-900 mb-1">Database bersih</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Tidak ditemukan riwayat laporan terkait nomor ini.
          </p>
        </div>
      )}
    </div>
  );
}