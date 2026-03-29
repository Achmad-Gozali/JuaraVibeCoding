// ============================================
// 📁 LOKASI: app/report/page.tsx
// ============================================

import ReportForm from '@/components/ReportForm';
import { createClient } from '@/lib/supabase-server';
import {
  ShieldAlert, Info, Scale, FileText, Clock, Shield, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default async function ReportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="max-w-2xl mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-5 sm:mb-6">
            <ShieldAlert className="w-3 h-3" />
            Formulir Laporan
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mb-3">
            Laporkan Penipuan
          </h1>
          <p className="text-zinc-500 text-base sm:text-lg leading-relaxed">
            Bantu lindungi komunitas dengan melaporkan nomor penipu. Setiap laporan akan diverifikasi oleh tim moderator.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-10">
          {/* Main Form Area */}
          <div className="lg:col-span-2 relative">
            <div className={`bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 sm:p-10 ${!user ? 'select-none' : ''}`}>
              {/* Blur overlay untuk non-logged in */}
              {!user && (
                <div className="absolute inset-0 z-10 rounded-2xl overflow-hidden">
                  {/* Blur layer */}
                  <div className="absolute inset-0 backdrop-blur-sm bg-white/60" />

                  {/* Prompt card */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl shadow-2xl shadow-zinc-200/80 border border-zinc-100 p-8 sm:p-10 w-full max-w-sm text-center">
                      <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-zinc-900/20">
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 mb-2 tracking-tight">
                        Login untuk Melapor
                      </h2>
                      <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                        Kamu perlu masuk atau daftar akun untuk mulai membuat laporan. Gratis dan cepat!
                      </p>

                      <div className="space-y-3">
                        <Link
                          href="/login?redirectTo=%2Freport"
                          className="flex items-center justify-center gap-2 w-full py-3.5 bg-zinc-900 text-white font-bold text-sm rounded-2xl hover:bg-black transition-all active:scale-95"
                        >
                          Masuk ke Akun
                        </Link>
                        <Link
                          href="/register"
                          className="flex items-center justify-center gap-2 w-full py-3.5 bg-zinc-50 text-zinc-700 font-bold text-sm rounded-2xl border border-zinc-200 hover:bg-zinc-100 transition-all active:scale-95"
                        >
                          Daftar Gratis
                        </Link>
                      </div>

                      <p className="text-[11px] text-zinc-400 mt-6 leading-relaxed">
                        Identitas pelapor dijaga kerahasiaannya dan tidak akan ditampilkan ke publik.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form preview / actual form */}
              {user ? (
                <ReportForm />
              ) : (
                // Preview form (blurred) — tidak functional
                <div className="space-y-8 pointer-events-none opacity-60">
                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-[0.15em]">Informasi Target</h3>
                    <p className="text-xs text-zinc-400">Data nomor atau rekening yang ingin dilaporkan.</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <div className="h-3 bg-zinc-200 rounded w-24" />
                      <div className="h-12 bg-zinc-100 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-zinc-200 rounded w-20" />
                      <div className="h-12 bg-zinc-100 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <div className="h-3 bg-zinc-200 rounded w-28" />
                      <div className="h-12 bg-zinc-100 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-zinc-200 rounded w-24" />
                      <div className="h-12 bg-zinc-100 rounded-xl" />
                    </div>
                  </div>
                  <div className="border-t border-zinc-100" />
                  <div className="space-y-2">
                    <div className="h-3 bg-zinc-200 rounded w-20" />
                    <div className="h-32 bg-zinc-100 rounded-xl" />
                  </div>
                  <div className="border-t border-zinc-100" />
                  <div className="space-y-2">
                    <div className="h-3 bg-zinc-200 rounded w-32" />
                    <div className="h-28 bg-zinc-100 rounded-2xl border-2 border-dashed border-zinc-200" />
                  </div>
                  <div className="h-12 bg-zinc-900/80 rounded-xl" />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-5">
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-6 shadow-sm">
              <h4 className="text-xs font-extrabold text-zinc-900 uppercase tracking-[0.15em] mb-4 sm:mb-5">Cara Kerja</h4>
              <div className="space-y-4 sm:space-y-5">
                {[
                  { icon: FileText, title: 'Isi Formulir', desc: 'Lengkapi data nomor target dan kronologi kejadian.' },
                  { icon: Clock, title: 'Proses Review', desc: 'Tim moderator akan memverifikasi laporan Anda dalam 1×24 jam.' },
                  { icon: ShieldAlert, title: 'Terpublikasi', desc: 'Laporan terverifikasi akan tampil di database publik.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 shrink-0 bg-zinc-900 rounded-lg flex items-center justify-center">
                      <item.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 mb-0.5">{item.title}</p>
                      <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kenapa lapor */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-6 shadow-sm">
              <h4 className="text-xs font-extrabold text-zinc-900 uppercase tracking-[0.15em] mb-4">Kenapa Harus Lapor?</h4>
              <div className="space-y-3">
                {[
                  'Mencegah orang lain menjadi korban yang sama',
                  'Membangun database penipu yang akurat',
                  'Kontribusi nyata untuk komunitas Indonesia',
                ].map((reason, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-500 leading-relaxed">{reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                  <Info className="w-3.5 h-3.5 text-white" />
                </div>
                <h4 className="text-xs font-extrabold uppercase tracking-[0.15em]">Fitur AI</h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Gunakan fitur <span className="text-white font-semibold">Analisis AI</span> untuk memindai keaslian bukti screenshot dan mendeteksi pola penipuan dari kronologi Anda secara otomatis.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-4 h-4 text-amber-600 shrink-0" />
                <h4 className="text-xs font-extrabold text-amber-800 uppercase tracking-[0.15em]">Peringatan Hukum</h4>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                Laporan palsu atau pencemaran nama baik dapat berakibat pemblokiran akun permanen dan konsekuensi hukum sesuai UU ITE yang berlaku.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}