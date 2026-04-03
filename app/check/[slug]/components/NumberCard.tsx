import { ExternalLink } from 'lucide-react';
import { formatNum } from '@/lib/utils';

function formatSosmed(acc: string): { label: string; isUrl: boolean; href: string } {
  const cleaned = acc.trim();
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return { label: cleaned, isUrl: true, href: cleaned };
  }
  const withoutAt = cleaned.replace(/^@+/, '');
  return { label: `@${withoutAt}`, isUrl: false, href: '' };
}

function truncateUrl(url: string, maxLen = 50): string {
  if (url.length <= maxLen) return url;
  return url.slice(0, maxLen) + '...';
}

interface ReportItem {
  target_name?: string | null;
  bank_name?: string | null;
  suspect_photo_url?: string | null;
  social_media_accounts?: string[] | null;
  link_url?: string | null;
  reported_to?: string[] | null;
}

interface Props {
  reports: ReportItem[];
  realNumber: string;
  config: {
    nameBadgeBg: string;
    nameBadgeText: string;
    nameBadgeBorder: string;
  };
}

export default function NumberCard({ reports, realNumber, config }: Props) {
  const allSocialAccounts: string[] = [];
  reports.forEach((r) => {
    if (Array.isArray(r.social_media_accounts)) {
      r.social_media_accounts.forEach((acc) => {
        if (acc && !allSocialAccounts.includes(acc)) allSocialAccounts.push(acc);
      });
    }
  });

  const allReportedTo: string[] = [];
  reports.forEach((r) => {
    if (Array.isArray(r.reported_to)) {
      r.reported_to.forEach((v) => {
        if (v && !allReportedTo.includes(v)) allReportedTo.push(v);
      });
    }
  });

  const reportedToLabel: Record<string, string> = {
    polisi: 'Polisi',
    ojk: 'OJK',
    platform: 'Platform terkait',
    belum: 'Belum lapor',
  };

  const suspectPhotoUrl = reports.find((r) => r.suspect_photo_url)?.suspect_photo_url ?? null;
  const targetName = reports[0]?.target_name ?? null;
  const bankName = reports[0]?.bank_name ?? null;
  const dangerLink = reports.find((r) => r.link_url)?.link_url ?? null;

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-2.5 font-medium px-0.5">
        Nomor terperiksa
      </p>
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-sm overflow-hidden">

        <div className="p-5 sm:p-6 flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <p
              className="text-[2rem] sm:text-5xl font-medium text-slate-900 tracking-tight break-all leading-none mb-4"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {formatNum(realNumber)}
            </p>
            <div className="flex flex-wrap gap-2">
              {targetName && (
                <span className={`text-[11px] px-3 py-1 rounded-full font-medium border ${config.nameBadgeBg} ${config.nameBadgeText} ${config.nameBadgeBorder}`}>
                  a.n. {targetName}
                </span>
              )}
              {bankName && (
                <span className="text-[11px] px-3 py-1 rounded-full font-medium border border-slate-200 bg-slate-50 text-slate-600">
                  {bankName}
                </span>
              )}
            </div>
            {reports.length > 0 && (
              <p className="text-[11px] text-slate-400 mt-3">Data dikumpulkan dari laporan komunitas</p>
            )}
          </div>
          {suspectPhotoUrl && (
            <div className="shrink-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">Foto penipu</p>
              <div className="relative">
                <img
                  src={suspectPhotoUrl}
                  alt="Foto profil penipu"
                  className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                />
                <span className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[8px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wide shadow-sm">
                  Penipu
                </span>
              </div>
            </div>
          )}
        </div>

        {allSocialAccounts.length > 0 && (
          <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.15em] mb-2.5 font-medium">
              Akun media sosial penipu
            </p>
            <div className="flex flex-wrap gap-2">
              {allSocialAccounts.map((acc, i) => {
                const fmt = formatSosmed(acc);
                return (
                  <span
                    key={i}
                    className="text-[11px] px-2.5 py-1 border border-slate-200 bg-white text-slate-700 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {fmt.isUrl ? (
                      <a
                        href={fmt.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                      >
                        {truncateUrl(fmt.label, 35)}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : fmt.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {dangerLink && (
          <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-red-50/30">
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.15em] mb-2.5 font-medium">
              Tautan berbahaya terdeteksi
            </p>
            <div className="flex items-center justify-between gap-3">
              {/* Tampilkan sebagai teks saja, bukan link — tidak bisa diklik */}
              <span
                className="text-[11px] text-red-700 bg-white border border-red-100 px-2.5 py-1.5 rounded-lg break-all shadow-sm select-all"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {truncateUrl(dangerLink, 60)}
              </span>
              <span className="text-[10px] font-semibold px-2.5 py-1.5 bg-red-600 text-white rounded-lg uppercase tracking-wider shrink-0 shadow-sm">
                High risk
              </span>
            </div>
          </div>
        )}

        {allReportedTo.length > 0 && (
          <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.15em] mb-2.5 font-medium">
              Sudah dilaporkan ke
            </p>
            <div className="flex flex-wrap gap-2">
              {allReportedTo.map((v) => (
                <span
                  key={v}
                  className={`text-[11px] px-3 py-1 rounded-full font-medium border ${
                    v === 'belum'
                      ? 'bg-white text-slate-500 border-slate-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {reportedToLabel[v] ?? v}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}