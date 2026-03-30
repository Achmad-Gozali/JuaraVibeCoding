import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import {
  Phone, ShieldCheck, CheckCircle2, ArrowUpRight,
  ShieldAlert, PlusCircle, MessageSquare, TrendingUp
} from 'lucide-react';
import type { Metadata } from 'next';
import NomorSearchForm from '@/components/NomorSearchForm';
import { formatDateID, maskNumber } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Cek Nomor HP - KawalTransaksi',
  description: 'Cek nomor HP atau WhatsApp terindikasi penipuan secara gratis.',
};

export const revalidate = 60;

export default async function CekNomorPage() {
  const supabase = await createClient();

  const [
    { data: rawReports },
    { count: totalPhone },
    { count: verifiedPhone },
  ] = await Promise.all([
    supabase
      .from('reports')
      .select('id, target_number, target_name, category, created_at, status')
      .eq('target_type', 'phone')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('target_type', 'phone'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('target_type', 'phone').eq('status', 'verified'),
  ]);

  const recentReports = rawReports ?? [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10 sm:pb-20 text-center font-sans">
      
      {/* SECTION 1: HERO - Enterprise Style */}
      <section className="relative pt-16 sm:pt-24 pb-14 sm:pb-20 overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[100px] -z-10" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-4 sm:mb-6 uppercase">
            Cek Nomor Telepon. <br />
            <span className="text-emerald-600 italic">Hindari Spammer.</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mb-8 sm:mb-12 max-w-xl mx-auto font-medium leading-relaxed">
            Identifikasi nomor WhatsApp atau telepon seluler yang mencurigakan sebelum Anda merespon pesan atau tawaran yang tidak dikenal.
          </p>
          <NomorSearchForm />
        </div>
      </section>

      {/* SECTION 2: BENTO STATS - Kotak Tegas */}
      <section className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-5 mb-16 sm:mb-20 text-left pt-12">
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 hidden sm:block">
            <TrendingUp className="w-40 h-40 text-slate-900" />
          </div>
          <div className="relative z-10">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 sm:mb-4">Statistik Keamanan</h3>
            <p className="text-xl sm:text-3xl font-black text-slate-900 leading-tight max-w-md">
              Membangun komunitas yang lebih <span className="text-emerald-600 underline decoration-emerald-200 decoration-4 underline-offset-4">aman dari ancaman siber.</span>
            </p>
          </div>
          <div className="flex gap-8 sm:gap-12 mt-10 relative z-10">
            <div>
              <p className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter">{totalPhone || 0}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Nomor Terdata</p>
            </div>
            <div className="w-px h-12 sm:h-16 bg-slate-200" />
            <div>
              <p className="text-3xl sm:text-5xl font-black text-red-600 tracking-tighter">{verifiedPhone || 0}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Terverifikasi Penipu</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 bg-emerald-600 rounded-2xl p-8 sm:p-10 text-white flex flex-col justify-between shadow-md">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 sm:mb-0 backdrop-blur-sm">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h4 className="text-lg sm:text-xl font-black mb-2 sm:mb-3 tracking-tight">Cakupan Laporan</h4>
            <p className="text-[11px] sm:text-xs text-emerald-50/90 leading-relaxed font-medium">
              Database mencakup laporan modus WhatsApp APK, kurir paket palsu, hingga penipuan berkedok undian berhadiah.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: RECENT REPORTS TABLE & MOBILE CARDS - Enterprise Style */}
      <section className="max-w-5xl mx-auto px-6 mb-16 sm:mb-20 text-left">
        <div className="flex items-end justify-between mb-6 px-1 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">Log Aktivitas Laporan</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Pembaruan 24 Jam Terakhir</p>
          </div>
          <Link href="/report" className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest flex items-center gap-1 transition-colors">
            Lihat Detail <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Desktop Table (Kotak Tajam) */}
        <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Identitas Target</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kategori Laporan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status Analisis</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentReports.map((report, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="text-sm font-black text-slate-900 font-mono tracking-wider">{maskNumber(report.target_number)}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">a.n. {report.target_name || 'Anonymous'}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{report.category}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${
                      report.status === 'verified' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link href={`/check/${report.target_number}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 shadow-sm transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (Kotak Tajam) */}
        <div className="md:hidden space-y-3">
          {recentReports.map((report, i) => (
            <Link key={i} href={`/check/${report.target_number}`} className="block bg-white border border-slate-200 rounded-xl p-5 shadow-sm active:bg-slate-50 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${
                   report.status === 'verified' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {report.status}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{formatDateID(report.created_at)}</span>
              </div>
              <p className="text-lg font-black text-slate-900 font-mono mb-2 tracking-tight">{maskNumber(report.target_number)}</p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{report.category}</p>
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 4: CTA - Kotak Elegan */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="bg-slate-900 rounded-2xl p-8 sm:p-16 text-center text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tighter mb-4 uppercase">Menerima Teror Pesan?</h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mb-8 font-medium leading-relaxed">
              Bantu identifikasi entitas yang mengganggu keamanan publik. Proses pelaporan dienkripsi dan dijamin kerahasiaannya.
            </p>
            <Link href="/report" className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all inline-flex items-center justify-center gap-2 uppercase tracking-widest shadow-md">
              <PlusCircle className="w-4 h-4" /> Entri Laporan Baru
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}