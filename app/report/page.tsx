import { createClient } from '@/lib/supabase-server';
import ReportForm from '@/components/ReportForm';
import { ShieldCheck, FileText, Lock, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import * as motion from 'motion/react-client';

export default async function ReportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ==========================================
  // STATE 1: JIKA USER SUDAH LOGIN (Langsung Form Premium)
  // ==========================================
  if (user) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
        <div className="max-w-5xl mx-auto px-6 pt-12 sm:pt-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center sm:text-left">
             <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900 uppercase mb-3">
               Entri Laporan <span className="text-emerald-600 italic">Baru.</span>
             </h1>
             <p className="text-sm text-slate-500 font-medium">Lengkapi formulir di bawah ini dengan data yang valid beserta bukti digital.</p>
          </motion.div>

          {/* Kotak Form Tegas */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <ReportForm />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STATE 2: JIKA BELUM LOGIN (Landing Page Enterprise)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-32 px-6 border-b border-slate-200 bg-white">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-[120px] -z-10" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-8 shadow-sm">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Pusat Laporan Komunitas
            </div>
          </motion.div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900 mb-8 uppercase">
            JANGAN DIAM. <br />
            <span className="text-emerald-600 italic">LAPORKAN</span> PENIPUNYA.
          </h1>
          
          <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto mb-10">
            Satu laporan tervalidasi dari Anda hari ini dapat mencegah ribuan orang kehilangan asetnya esok hari. Proses pelaporan dienkripsi dan anonim.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login?redirectTo=%2Freport" className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest">
              MULAI BUAT LAPORAN <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/cek-nomor" className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold text-sm hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm active:scale-95 uppercase tracking-widest">
              CEK DATABASE
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase mb-4">Protokol Pelaporan</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">3 Langkah sistematis menghentikan penipu</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', icon: Lock, title: 'Validasi Akses', desc: 'Sistem membutuhkan otentikasi login untuk memastikan laporan tidak dibuat oleh bot.' },
            { step: '02', icon: FileText, title: 'Entri Data', desc: 'Masukkan nomor rekening/HP target beserta screenshot bukti transaksi digital.' },
            { step: '03', icon: ShieldCheck, title: 'Verifikasi & Rilis', desc: 'Auditor kami akan meninjau dan merilis laporan Anda ke database publik.' }
          ].map((item, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 15 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="bg-white border border-slate-200 p-8 sm:p-10 rounded-2xl relative overflow-hidden group hover:border-emerald-300 hover:shadow-md transition-all"
             >
               <div className="text-6xl font-black text-slate-50 absolute -right-4 -top-4 group-hover:text-emerald-50 transition-colors z-0 select-none">
                 {item.step}
               </div>
               <div className="relative z-10">
                 <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center mb-6 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                   <item.icon className="w-5 h-5 text-emerald-600" />
                 </div>
                 <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-slate-900">{item.title}</h3>
                 <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
               </div>
             </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="pb-24 px-6 max-w-5xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 sm:p-20 text-center relative overflow-hidden shadow-xl">
           <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
           <div className="relative z-10">
             <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-white uppercase mb-4">Siap Berkontribusi?</h2>
             <p className="text-slate-400 mb-10 max-w-lg mx-auto font-medium text-sm leading-relaxed">Daftarkan akun Anda secara gratis sekarang dan mulailah melindungi ekosistem digital dari kejahatan siber.</p>
             <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register" className="px-8 py-4 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-500 transition-all uppercase tracking-widest shadow-md">
                  DAFTAR AKUN BARU
                </Link>
             </div>
           </div>
        </div>
      </section>

    </div>
  );
}