// ============================================
// 📁 LOKASI: app/cek-rekening/page.tsx
// ✅ ANIMATED: Page transitions + hover effects + micro-interactions
// ============================================

import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import {
  ArrowLeft, Building2, ShieldCheck, Clock, CheckCircle2, ArrowUpRight,
} from 'lucide-react';
import type { Metadata } from 'next';
import * as motion from 'motion/react-client';
import RekeningSearchForm from '@/components/RekeningSearchForm';
import { formatDateID, maskNumber } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Cek Rekening Bank - KawalTransaksi',
  description: 'Cek nomor rekening bank terindikasi penipuan secara gratis.',
};

export const revalidate = 60;

export default async function CekRekeningPage() {
  const supabase = await createClient();

  const [{ data: rawReports }, { count: totalRekening }, { count: verifiedRekening }] =
    await Promise.all([
      supabase.from('reports').select('id, target_number, target_name, category, created_at, status')
        .eq('target_type', 'bank_account').order('created_at', { ascending: false }).limit(6),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('target_type', 'bank_account'),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('target_type', 'bank_account').eq('status', 'verified'),
    ]);

  const reports = rawReports ?? [];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top Bar */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 text-sm font-medium transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            Kembali
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-white border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold uppercase tracking-widest mb-5 sm:mb-6">
              <Building2 className="w-3.5 h-3.5" /> Cek Rekening Bank
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight mb-3 sm:mb-4">
              Cek Rekening Bank<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">Sebelum Transfer.</span>
            </h1>
            <p className="text-zinc-500 text-sm sm:text-lg max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
              Masukkan nomor rekening bank yang ingin kamu verifikasi. Cegah penipuan transfer sebelum terlambat.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}>
            <RekeningSearchForm />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 sm:mt-10 flex justify-center gap-8 sm:gap-10">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-extrabold text-zinc-900">{totalRekening || 0}</p>
              <p className="text-[10px] sm:text-xs text-zinc-400 font-medium mt-1 uppercase tracking-wider">Rekening Dilaporkan</p>
            </div>
            <div className="w-px bg-zinc-200" />
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-extrabold text-red-600">{verifiedRekening || 0}</p>
              <p className="text-[10px] sm:text-xs text-zinc-400 font-medium mt-1 uppercase tracking-wider">Terverifikasi</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Reports */}
      {reports.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex items-center justify-between mb-5 sm:mb-6">
            <h2 className="text-xs sm:text-sm font-extrabold text-zinc-900 uppercase tracking-wider">Rekening Terbaru Dilaporkan</h2>
            <span className="text-xs text-zinc-400">{totalRekening || 0} total</span>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {reports.map((report, i) => (
              <motion.div key={report.id}
                initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -2 }}>
                <Link href={`/check/${report.target_number}`}
                  className="block bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 hover:shadow-md hover:border-zinc-300 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${report.status === 'verified' ? 'bg-red-50 text-red-600' : report.status === 'rejected' ? 'bg-zinc-100 text-zinc-400' : 'bg-amber-50 text-amber-600'}`}>
                      {report.status === 'verified' ? <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                        : report.status === 'pending' ? <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                        : 'Rejected'}
                    </span>
                    <span className="text-[11px] text-zinc-400">{formatDateID(report.created_at)}</span>
                  </div>
                  <p className="text-base sm:text-lg font-extrabold text-zinc-900 font-mono tracking-wide mb-0.5">{maskNumber(report.target_number)}</p>
                  {report.target_name && <p className="text-xs text-zinc-400 mb-3">a.n. {report.target_name}</p>}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                    <span className="text-[11px] text-zinc-400">{report.category}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {reports.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto px-4 py-10 sm:py-14 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 mb-2">Belum Ada Laporan Rekening</h3>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto">
            Database rekening masih bersih. Bantu komunitas dengan melaporkan rekening penipu.
          </p>
        </motion.div>
      )}

      {/* Tips */}
      <div className="max-w-5xl mx-auto px-4 pb-12 sm:pb-16">
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xs sm:text-sm font-extrabold text-emerald-900 uppercase tracking-wider">Tips Aman Transfer Bank</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              'Selalu cek nama pemilik rekening saat konfirmasi transfer. Jangan transfer jika nama tidak sesuai.',
              'Gunakan fitur rekening bersama (escrow) di marketplace untuk transaksi jual beli online.',
              'Jika rekening meminta transfer ke rekening pribadi bukan perusahaan, waspadai kemungkinan penipuan.',
            ].map((tip, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex gap-3">
                <div className="w-6 h-6 shrink-0 bg-emerald-100 rounded-md flex items-center justify-center">
                  <span className="text-[10px] font-bold text-emerald-600">{i + 1}</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">{tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}