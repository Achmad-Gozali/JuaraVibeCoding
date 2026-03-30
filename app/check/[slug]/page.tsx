import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ShieldCheck, ArrowLeft,
  ExternalLink, PlusCircle, Globe,
  MessageSquare, DollarSign, Calendar, FileText, Users,
  AtSign, ShieldAlert,
} from 'lucide-react';
import { formatDateID, formatNum } from '@/lib/utils';
import ShareButtons from './ShareButtons';

export const revalidate = 60;

interface CheckPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CheckPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `cek nomor ${slug} - kawaltransaksi`,
    description: `hasil pengecekan nomor ${slug} di database laporan komunitas kawaltransaksi.`,
  };
}

// ── HELPER: format akun sosmed dengan benar (fix bug @ dobel)
function formatSosmed(acc: string): { label: string; isUrl: boolean; href: string } {
  const cleaned = acc.trim();
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return { label: cleaned, isUrl: true, href: cleaned };
  }
  const withoutAt = cleaned.replace(/^@+/, '');
  return { label: `@${withoutAt}`, isUrl: false, href: '' };
}

export default async function CheckPage({ params }: CheckPageProps) {
  const { slug } = await params;

  if (!slug || !/^[0-9a-zA-Z\-]+$/.test(slug) || slug.length > 20) {
    notFound();
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('target_number', slug)
    .order('created_at', { ascending: false });

  if (error) console.error('error fetching reports:', error);

  const reports = (data as any[]) ?? [];
  const verifiedReports = reports.filter((r) => r.status === 'verified');
  const pendingReports = reports.filter((r) => r.status === 'pending');
  const verifiedCount = verifiedReports.length;
  const totalLoss = reports.reduce((sum, r) => sum + (Number(r.loss_amount) || 0), 0);

  const allSocialAccounts: string[] = [];
  reports.forEach((r) => {
    if (Array.isArray(r.social_media_accounts)) {
      r.social_media_accounts.forEach((acc: string) => {
        if (acc && !allSocialAccounts.includes(acc)) allSocialAccounts.push(acc);
      });
    }
  });

  const suspectPhotoUrl = reports.find((r) => r.suspect_photo_url)?.suspect_photo_url ?? null;
  const hasOtherVictims = reports.some((r) => r.has_other_victims === 'yes');

  const allReportedTo: string[] = [];
  reports.forEach((r) => {
    if (Array.isArray(r.reported_to)) {
      r.reported_to.forEach((v: string) => {
        if (v && !allReportedTo.includes(v)) allReportedTo.push(v);
      });
    }
  });

  const reportedToLabel: Record<string, string> = {
    polisi: '🚔 Polisi',
    ojk: '🏦 OJK',
    platform: '📱 Platform terkait',
    belum: '❌ Belum lapor',
  };

  let status: 'safe' | 'warning' | 'danger' = 'safe';
  if (verifiedCount > 0) status = 'danger';
  else if (pendingReports.length > 0) status = 'warning';

  const statusConfig = {
    danger: {
      headerBg: 'bg-red-600',
      identityBorder: 'border-l-red-500',
      statusBadge: 'bg-red-100 text-red-700 border-red-200',
      reportBorder: 'border-l-red-400',
      verdict: 'TERINDIKASI PENIPUAN',
      verdictSub: `${verifiedCount} laporan telah diverifikasi oleh sistem & komunitas.`,
    },
    warning: {
      headerBg: 'bg-amber-500',
      identityBorder: 'border-l-amber-400',
      statusBadge: 'bg-amber-100 text-amber-700 border-amber-200',
      reportBorder: 'border-l-amber-400',
      verdict: 'DALAM INVESTIGASI',
      verdictSub: `${pendingReports.length} laporan masuk sedang diverifikasi moderator.`,
    },
    safe: {
      headerBg: 'bg-emerald-600',
      identityBorder: 'border-l-emerald-500',
      statusBadge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      reportBorder: 'border-l-emerald-400',
      verdict: 'TIDAK ADA LAPORAN',
      verdictSub: 'Nomor ini bersih di database kami. Tetap waspada.',
    },
  };

  const config = statusConfig[status];

  const shareText = status === 'danger'
    ? `⚠️ waspada! nomor ${formatNum(slug)} terindikasi penipu dengan ${verifiedCount} laporan terverifikasi. cek di kawaltransaksi:`
    : status === 'warning'
      ? `⚠️ nomor ${formatNum(slug)} sedang dalam proses verifikasi laporan penipuan. cek di kawaltransaksi:`
      : `✅ nomor ${formatNum(slug)} aman — belum ada laporan penipuan di kawaltransaksi:`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* ── TOP NAV ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/cek-nomor" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <span className="hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-widest">
            KawalTransaksi · Database Registry
          </span>
        </div>
      </div>

      {/* ── VERDICT HERO ── */}
      <div className={config.headerBg}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none text-white mb-2">
            {config.verdict}
          </h1>
          <p className="text-white/80 text-sm font-medium leading-relaxed mb-6 max-w-lg">
            {config.verdictSub}
          </p>
          {reports.length > 0 && (
            <div className="inline-flex items-center gap-4 sm:gap-6 bg-white/15 rounded-xl px-4 sm:px-5 py-3 border border-white/20">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-white leading-none">{reports.length}</p>
                <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mt-1">Laporan</p>
              </div>
              {verifiedCount > 0 && (<>
                <div className="w-px h-7 bg-white/25" />
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-black text-white leading-none">{verifiedCount}</p>
                  <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mt-1">Terbukti</p>
                </div>
              </>)}
              {totalLoss > 0 && (<>
                <div className="w-px h-7 bg-white/25" />
                <div className="text-center">
                  <p className="text-base sm:text-xl font-black text-white leading-none">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', notation: 'compact', maximumFractionDigits: 1 }).format(totalLoss)}
                  </p>
                  <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mt-1">Total Rugi</p>
                </div>
              </>)}
              {hasOtherVictims && (<>
                <div className="w-px h-7 bg-white/25" />
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-black text-white leading-none">⚠</p>
                  <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mt-1">Multi Korban</p>
                </div>
              </>)}
            </div>
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 pb-16 space-y-5">

        {/* ── IDENTITY CARD ── */}
        <div className={`bg-white rounded-2xl border border-slate-200 border-l-4 ${config.identityBorder} shadow-sm p-5`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nomor Terperiksa</p>
              <p className="text-3xl sm:text-4xl font-mono font-black text-slate-900 tracking-tight break-all">{formatNum(slug)}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${config.statusBadge}`}>
                  {reports[0]?.target_name ? `a.n. ${reports[0].target_name}` : 'pemilik tidak diketahui'}
                </span>
                {reports[0]?.bank_name && (
                  <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-blue-50 text-blue-700 border-blue-200">
                    {reports[0].bank_name}
                  </span>
                )}
              </div>
              <p className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mt-3">
                <Users className="w-3 h-3" />
                Data dikumpulkan dari laporan komunitas
              </p>
            </div>
            {suspectPhotoUrl && (
              <div className="shrink-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Foto Penipu</p>
                <div className="relative">
                  <img src={suspectPhotoUrl} alt="Foto profil penipu" className="w-20 h-20 object-cover rounded-xl border-2 border-red-200 shadow-sm" />
                  <span className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Penipu</span>
                </div>
              </div>
            )}
          </div>
          {allSocialAccounts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <AtSign className="w-3 h-3" /> Akun Media Sosial Penipu
              </p>
              <div className="flex flex-wrap gap-2">
                {allSocialAccounts.map((acc, i) => {
                  const fmt = formatSosmed(acc);
                  return (
                    <span key={i} className="px-3 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-700 border border-slate-200 font-mono">
                      {fmt.isUrl ? (
                        <a href={fmt.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                          {fmt.label} <ExternalLink className="w-2.5 h-2.5 inline" />
                        </a>
                      ) : fmt.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── URL BERBAHAYA ── */}
        {reports.some(r => r.link_url) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-red-600 text-white rounded-lg flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-red-900 uppercase tracking-tight mb-1">Tautan Berbahaya Terdeteksi</p>
                <p className="text-xs font-mono text-red-700 bg-white px-2 py-1 rounded border border-red-100 inline-block break-all">
                  {reports.find(r => r.link_url)?.link_url}
                </p>
              </div>
            </div>
            <span className="px-3 py-1.5 bg-red-700 text-white text-[10px] font-black uppercase rounded-lg tracking-widest shrink-0">HIGH RISK</span>
          </div>
        )}

        {/* ── SUDAH DILAPORKAN KE ── */}
        {allReportedTo.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Sudah Dilaporkan Ke
            </p>
            <div className="flex flex-wrap gap-2">
              {allReportedTo.map((v) => (
                <span key={v} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border ${v === 'belum' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {reportedToLabel[v] ?? v}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── MAIN GRID ── */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* ── LEFT: LAPORAN + APA YANG HARUS DILAKUKAN ── */}
          <div className="lg:col-span-2 space-y-3">

            {/* Riwayat laporan header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Riwayat Laporan
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{reports.length} entri</span>
            </div>

            {/* Daftar laporan */}
            {reports.length > 0 ? (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className={`bg-white border border-slate-200 border-l-4 ${config.reportBorder} rounded-xl overflow-hidden shadow-sm`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${report.status === 'verified' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {report.status === 'verified' ? '✓ Terverifikasi' : '◎ Pending'}
                        </span>
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{report.category}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                        <Calendar className="w-3 h-3" />{formatDateID(report.created_at)}
                      </div>
                    </div>
                    <div className="px-4 py-4">
                      <p className="text-sm text-slate-700 leading-relaxed font-medium italic">"{report.chronology}"</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
                      {report.platform && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase">
                          <MessageSquare className="w-3 h-3 text-blue-400" />{report.platform}
                        </div>
                      )}
                      {report.loss_amount && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-red-600 uppercase">
                          <DollarSign className="w-3 h-3" />
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(report.loss_amount))}
                        </div>
                      )}
                      {report.incident_date && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Kejadian: {new Date(report.incident_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                      {report.has_other_victims === 'yes' && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-orange-600 uppercase">
                          <Users className="w-3 h-3" />Ada korban lain
                        </div>
                      )}
                      {report.evidence_url && (
                        <a href={report.evidence_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest transition-colors ml-auto">
                          Lampiran <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {Array.isArray(report.social_media_accounts) && report.social_media_accounts.filter(Boolean).length > 0 && (
                      <div className="px-4 py-2.5 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest self-center mr-1">
                          <AtSign className="w-3 h-3 inline" /> Sosmed:
                        </span>
                        {report.social_media_accounts.filter(Boolean).map((acc: string, i: number) => {
                          const fmt = formatSosmed(acc);
                          return (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700 font-mono border border-slate-200">
                              {fmt.isUrl ? (
                                <a href={fmt.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                  {fmt.label} <ExternalLink className="w-2.5 h-2.5 inline" />
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
              <div className="bg-white border border-slate-200 rounded-xl p-14 text-center shadow-sm">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Database Clear</h3>
                <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">Tidak ditemukan riwayat laporan terkait nomor ini.</p>
              </div>
            )}

            {/* ── APA YANG HARUS KAMU LAKUKAN — di dalam kolom kiri, tepat di bawah laporan ── */}
            {status !== 'safe' && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
                    Apa Yang Harus Kamu Lakukan?
                  </h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {(status === 'danger' ? [
                    { step: '01', title: 'Jangan Transfer', desc: 'Batalkan segera rencana transfer ke nomor ini. Uang yang sudah ditransfer sangat sulit untuk dikembalikan.', color: 'text-red-600 bg-red-50 border-red-100' },
                    { step: '02', title: 'Simpan Semua Bukti', desc: 'Screenshot semua percakapan, nomor rekening, dan detail transaksi sebagai barang bukti.', color: 'text-amber-600 bg-amber-50 border-amber-100' },
                    { step: '03', title: 'Lapor ke Platform', desc: 'Laporkan akun penipu ke platform tempat kamu berkomunikasi (WhatsApp, Instagram, Shopee, dll).', color: 'text-blue-600 bg-blue-50 border-blue-100' },
                    { step: '04', title: 'Lapor ke KawalTransaksi', desc: 'Tambahkan laporanmu agar komunitas lain terlindungi dari penipu yang sama.', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                  ] : [
                    { step: '01', title: 'Tunda Transaksi', desc: 'Nomor ini sedang dalam investigasi. Tunda dulu transaksi sampai status jelas.', color: 'text-amber-600 bg-amber-50 border-amber-100' },
                    { step: '02', title: 'Minta Verifikasi Identitas', desc: 'Minta pihak lawan untuk membuktikan identitas asli sebelum melanjutkan transaksi.', color: 'text-blue-600 bg-blue-50 border-blue-100' },
                    { step: '03', title: 'Pantau Perkembangan', desc: 'Cek kembali halaman ini dalam beberapa hari. Moderator sedang memverifikasi laporan.', color: 'text-slate-600 bg-slate-50 border-slate-100' },
                  ]).map((item) => (
                    <div key={item.step} className="flex items-start gap-4 px-4 py-4">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md border shrink-0 mt-0.5 ${item.color}`}>
                        {item.step}
                      </span>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">{item.title}</p>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: SIDEBAR ── */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-900 rounded-xl p-5 text-white relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-sm font-black uppercase leading-tight mb-1 relative z-10">Punya Bukti Baru?</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed font-medium relative z-10">Satu laporan dari kamu bisa melindungi ribuan orang.</p>
              <Link href="/report" className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-[11px] rounded-lg transition-colors uppercase tracking-widest relative z-10 active:scale-95">
                <PlusCircle className="w-4 h-4" /> Buat Laporan
              </Link>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Sebarkan Peringatan</p>
              <ShareButtons slug={slug} shareText={shareText} />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[8px] font-black shrink-0">!</span>
                Tips Keamanan
              </h4>
              <ul className="space-y-3">
                {['Jangan pernah berikan kode OTP ke siapapun.', 'Gunakan rekening bersama / escrow resmi.', 'Verifikasi identitas sebelum transfer.'].map((tip, i) => (
                  <li key={i} className="flex gap-3 text-[11px] text-slate-600 font-semibold leading-relaxed">
                    <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}