import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, ArrowLeft,
  ExternalLink, PlusCircle, Clock, CheckCircle2,
  XCircle, AlertCircle, Info, Database, Globe, 
  MessageSquare, DollarSign, Calendar
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

  let status: 'safe' | 'warning' | 'danger' = 'safe';
  if (verifiedCount > 0) status = 'danger';
  else if (pendingReports.length > 0) status = 'warning';

  // ✅ warna di-adjust ke level 100 biar lebih berasa warnanya (nggak pucat)
  const statusConfig = {
    danger: {
      borderColor: 'border-red-600',
      headerBg: 'bg-red-100', // lebih kontras dari red-50
      titleColor: 'text-red-900',
      descColor: 'text-red-800',
      icon: ShieldAlert,
      title: 'bahaya : terindikasi penipuan',
      desc: 'nomor ini telah divalidasi oleh sistem dan komunitas sebagai entitas berbahaya.',
    },
    warning: {
      borderColor: 'border-amber-500',
      headerBg: 'bg-amber-100', // lebih kontras dari amber-50
      titleColor: 'text-amber-900',
      descColor: 'text-amber-800',
      icon: AlertTriangle,
      title: 'investigasi : status pending',
      desc: 'terdapat laporan masuk yang sedang dalam tahap investigasi moderator. mohon waspada.',
    },
    safe: {
      borderColor: 'border-emerald-600',
      headerBg: 'bg-emerald-100', // lebih kontras dari emerald-50
      titleColor: 'text-emerald-900',
      descColor: 'text-emerald-800',
      icon: ShieldCheck,
      title: 'aman : belum ada laporan',
      desc: 'tidak ditemukan riwayat laporan penipuan untuk nomor ini di database kami.',
    },
  };

  const config = statusConfig[status];

  const shareText = status === 'danger'
    ? `⚠️ waspada! nomor ${formatNum(slug)} terindikasi penipu dengan ${verifiedCount} laporan terverifikasi. cek di kawaltransaksi:`
    : status === 'warning'
      ? `⚠️ nomor ${formatNum(slug)} sedang dalam proses verifikasi laporan penipuan. cek di kawaltransaksi:`
      : `✅ nomor ${formatNum(slug)} aman — belum ada laporan penipuan di kawaltransaksi:`;

  return (
    <div className="min-h-screen bg-slate-50 pb-16 font-sans text-slate-900">
      
      {/* top navigation bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/cek-nomor" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> kembali ke pencarian
          </Link>
          <div className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest select-none">
            <Database className="w-3 h-3" /> database registry
          </div>
        </div>
      </div>

      {/* ✅ header: icon & badge dihapus, warna disesuaikan */}
      <div className={`${config.headerBg} pt-20 pb-28 px-6 border-b border-slate-200/50`}>
        <div className="max-w-5xl mx-auto text-center">
          <h1 className={`text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase leading-none ${config.titleColor}`}>
            {config.title}
          </h1>
          <p className={`${config.descColor} text-sm md:text-base font-semibold max-w-2xl mx-auto leading-relaxed opacity-90`}>
            {config.desc}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-14">
        
        {/* identitas target card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl mb-8 overflow-hidden flex flex-col md:flex-row border-l-[6px] border-l-slate-900">
           <div className="p-8 flex-1 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">identitas terperiksa</p>
              <h2 className="text-4xl md:text-5xl font-mono font-black text-slate-900 tracking-tighter">
                {formatNum(slug)}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                  a.n. {reports[0]?.target_name || 'anonymous'}
                </span>
                {reports[0]?.bank_name && (
                  <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 shadow-sm">
                    {reports[0].bank_name}
                  </span>
                )}
              </div>
           </div>
           <div className="bg-slate-50/80 p-8 flex gap-10 items-center min-w-[340px] justify-center">
              <div className="text-center">
                 <p className="text-4xl font-black text-slate-900">{reports.length}</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">total entri</p>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="text-center">
                 <p className={`text-4xl font-black ${status === 'danger' ? 'text-red-600' : 'text-emerald-600'}`}>{verifiedCount}</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">verified</p>
              </div>
           </div>
        </div>

        {/* deteksi link url berbahaya */}
        {reports.some(r => r.link_url) && (
          <div className="bg-red-50 border-2 border-dashed border-red-200 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-red-900 uppercase tracking-tight">tautan berbahaya terdeteksi</h4>
                <p className="text-xs text-red-800 font-bold font-mono mt-2 break-all bg-white px-3 py-1.5 rounded-lg border border-red-100 inline-block shadow-sm">
                  {reports.find(r => r.link_url)?.link_url}
                </p>
              </div>
            </div>
            <div className="px-4 py-2 bg-red-900 text-white text-[10px] font-black uppercase rounded-md tracking-widest shrink-0 shadow-sm">
               high risk url
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            {/* log laporan list */}
            <div className="space-y-4">
               <div className="flex items-center justify-between px-2">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">log aktivitas komunitas</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{reports.length} records</span>
               </div>

               {reports.length > 0 ? (
                 <div className="space-y-4">
                   {reports.map((report) => (
                     <div key={report.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 transition-all shadow-sm group">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.15em] border ${
                              report.status === 'verified' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              {report.status}
                            </span>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{report.category}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Calendar className="w-3 h-3" /> {formatDateID(report.created_at)}
                          </div>
                        </div>

                        <div className="bg-slate-50/50 rounded-xl p-5 mb-5 border border-slate-100 text-sm text-slate-700 leading-relaxed italic font-medium">
                          "{report.chronology}"
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                          {report.platform && (
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">platform</p>
                               <p className="text-[11px] font-bold text-slate-900 uppercase flex items-center gap-1.5"><MessageSquare className="w-3 h-3 text-blue-500" /> {report.platform}</p>
                            </div>
                          )}
                          {report.loss_amount && (
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">kerugian</p>
                               <p className="text-[11px] font-black text-red-600 flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(report.loss_amount))}</p>
                            </div>
                          )}
                          <div className="flex items-end justify-end ml-auto">
                            {report.evidence_url && (
                              <a href={report.evidence_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 uppercase tracking-widest border-b-2 border-emerald-100 hover:border-emerald-500 transition-all">
                                lampiran <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="bg-white border border-slate-200 rounded-xl p-20 text-center shadow-sm">
                   <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                   <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">database clear</h3>
                   <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto mt-2">tidak ditemukan riwayat laporan terkait nomor ini dalam sistem kami.</p>
                 </div>
               )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* cta lapor */}
            <div className="bg-slate-900 rounded-xl p-8 text-white shadow-xl relative overflow-hidden group border border-slate-800">
               <div className="w-32 h-32 absolute -right-8 -top-8 bg-white/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
               <h3 className="text-xl font-black uppercase mb-3 relative z-10 leading-tight">punya bukti <br />baru?</h3>
               <p className="text-xs text-slate-400 mb-8 leading-relaxed font-medium relative z-10">satu laporan dari anda sangat berarti untuk keamanan ekosistem digital indonesia.</p>
               <Link href="/report" className="flex items-center justify-center gap-3 w-full py-4 bg-emerald-600 text-white font-black text-[11px] rounded-lg hover:bg-emerald-500 transition-all uppercase tracking-[0.2em] shadow-lg active:scale-95 relative z-10">
                 <PlusCircle className="w-4 h-4" /> buat laporan
               </Link>
            </div>

            {/* share widget */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-6">sebarkan peringatan</p>
               <ShareButtons slug={slug} shareText={shareText} />
            </div>

            {/* security protocol */}
            <div className="bg-white border border-slate-200 rounded-xl p-7 shadow-sm">
              <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6">
                <Info className="w-4 h-4 text-emerald-600" /> protokol keamanan
              </h4>
              <ul className="space-y-4">
                {[
                  'jangan berikan kode otentikasi (otp).',
                  'gunakan rekening bersama/escrow resmi.',
                  'verifikasi kredensial sebelum transaksi.',
                ].map((tip, i) => (
                  <li key={i} className="flex gap-4 text-[11px] text-slate-600 font-bold uppercase tracking-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="leading-relaxed">{tip}</span>
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