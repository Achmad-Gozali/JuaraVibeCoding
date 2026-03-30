import Link from 'next/link';
import {
  Search, ArrowRight, ShieldAlert, Lock, Eye, ArrowUpRight,
  Phone, Building2, ShieldCheck, Wallet, TrendingUp, Users,
  Zap, PlusCircle
} from 'lucide-react';
import * as motion from 'motion/react-client';
import { createClient } from '@/lib/supabase-server';
import { formatDateID, maskNumber } from '@/lib/utils';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { count: totalReports },
    { count: verifiedCount },
    { data: rawRecentReports },
  ] = await Promise.all([
    supabase.from('reports').select('*', { count: 'exact', head: true }),
    supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'verified'),
    supabase
      .from('reports')
      .select('id, target_number, target_name, target_type, category, created_at, status')
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  const recentReports = rawRecentReports ?? [];

  return (
    <main className="bg-slate-50 text-slate-900 overflow-hidden font-sans selection:bg-emerald-100">
      
      {/* section 1: hero */}
      <section className="relative pt-24 pb-28 border-b border-slate-200 bg-white overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[400px] bg-emerald-100/30 rounded-full blur-[120px] -z-10" />
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8 uppercase text-slate-900">
            transaksi <span className="text-emerald-600 italic underline decoration-emerald-200 decoration-8 underline-offset-8">aman</span>,<br />
            hati tenang.
          </h1>
          <div className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-10">
            verifikasi nomor identitas atau rekening bank dalam hitungan detik. gabung bersama komunitas untuk memberantas kejahatan siber.
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
            <Link href="/cek-nomor" className="group px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-md active:scale-95 uppercase tracking-widest">
              <Phone className="w-4 h-4 text-emerald-400 group-hover:text-white transition-colors" /> cek nomor hp
            </Link>
            <Link href="/cek-rekening" className="group px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm active:scale-95 uppercase tracking-widest">
              <Building2 className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" /> cek rekening
            </Link>
          </div>
        </div>
      </section>

      {/* section 2: bento dashboard */}
      <section className="max-w-6xl mx-auto px-6 pt-16 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform duration-700">
              <TrendingUp className="w-60 h-60 text-slate-900" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 text-left">statistik registry</h3>
                <p className="text-2xl sm:text-3xl font-black leading-tight max-w-md text-left text-slate-900">
                  kami mengawasi <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-4">setiap laporan</span> untuk keamanan anda.
                </p>
              </div>
              <div className="flex gap-10 mt-12 border-t border-slate-100 pt-8">
                <div className="text-left">
                  <p className="text-5xl font-black tracking-tighter text-slate-900">{totalReports || 0}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">total entri</p>
                </div>
                <div className="w-px h-16 bg-slate-200" />
                <div className="text-left">
                  <p className="text-5xl font-black text-red-600 tracking-tighter">{verifiedCount || 0}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">verified scam</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 space-y-5">
            <div className="bg-emerald-600 rounded-2xl p-8 text-white shadow-md h-[200px] flex flex-col justify-between group overflow-hidden relative border border-emerald-700">
               <ShieldCheck className="w-20 h-20 absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform" />
               <h4 className="text-lg font-black leading-tight text-left">verifikasi komunitas</h4>
               <p className="text-xs text-emerald-50/80 font-medium leading-relaxed text-left">laporan divalidasi secara transparan oleh sistem moderator untuk menjaga akurasi.</p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-8 text-white h-[200px] flex flex-col justify-between group shadow-md border border-slate-800">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                   <Lock className="w-5 h-5 text-emerald-400" />
                 </div>
                 <h4 className="text-lg font-black">enkripsi 24/7</h4>
               </div>
               <div className="text-left">
                 <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed">sistem keamanan berjalan tanpa henti memantau anomali transaksi digital.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* section 3: live feed activity */}
      <section className="max-w-6xl mx-auto px-6 mb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-slate-200 pb-4">
          <div className="text-left">
            <h2 className="text-2xl font-black tracking-tighter uppercase text-slate-900">log laporan terkini</h2>
          </div>
          {/* ✅ tombol entri laporan di kanan udah diapus mad jir */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentReports.map((report, i) => (
            <motion.div 
              key={report.id} 
              initial={{ opacity: 0, y: 10 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/check/${report.target_number}`} className="block bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
                <div className="flex justify-between items-start mb-5">
                  <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-widest ${
                    report.status === 'verified' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {report.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{formatDateID(report.created_at)}</span>
                </div>
                <div className="mb-5 text-left">
                  <p className="text-xl font-black font-mono tracking-tighter text-slate-900 group-hover:text-emerald-600 transition-colors">{maskNumber(report.target_number)}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">a.n. {report.target_name || 'anonymous'}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {report.target_type === 'bank_account' ? <Building2 className="w-3.5 h-3.5 text-slate-400" /> : <Phone className="w-3.5 h-3.5 text-slate-400" />}
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{report.category}</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* section 4: final cta */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 uppercase">berikan kontribusi anda.</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto mb-10 font-medium leading-relaxed">
              jangan biarkan pelaku mencari korban berikutnya. laporkan nomor mencurigakan sekarang untuk ekosistem digital yang lebih aman.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/report" className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-500 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest">
                <PlusCircle className="w-4 h-4" /> entri laporan baru
              </Link>
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-transparent border border-slate-700 text-white font-bold text-sm rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all uppercase tracking-widest">
                gabung komunitas
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}