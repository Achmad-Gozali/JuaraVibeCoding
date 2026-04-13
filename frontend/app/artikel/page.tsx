import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Artikel Penipuan Mingguan - KawalTransaksi',
  description: 'Laporan dan analisis pola penipuan online terbaru di Indonesia, diperbarui setiap minggu dari data komunitas KawalTransaksi.',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatLoss(amount: number): string {
  if (!amount) return null as any;
  return new Intl.NumberFormat('id-ID', {
    notation: 'compact', maximumFractionDigits: 1,
    style: 'currency', currency: 'IDR',
  }).format(amount);
}

export default async function ArtikelPage() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, summary, total_reports, total_loss, top_category, published_at')
    .order('published_at', { ascending: false })
    .limit(20);

  return (
    <main className="bg-white min-h-screen font-sans">

      {/* Header */}
      <section className="bg-slate-50 px-4 pt-10 pb-8 sm:pt-14 sm:pb-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3">
            Diperbarui setiap minggu
          </p>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase mb-3 leading-tight">
            Artikel Penipuan Mingguan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
            Laporan otomatis berdasarkan pola penipuan yang masuk ke database KawalTransaksi setiap minggunya.
          </p>
        </div>
      </section>

      <svg viewBox="0 0 1440 50" preserveAspectRatio="none" className="w-full block bg-slate-50 -mb-1" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,50 C360,10 720,40 1080,15 C1260,2 1380,30 1440,50 Z" fill="#ffffff" />
      </svg>

      {/* List artikel */}
      <section className="px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {!articles || articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">
                Belum ada artikel
              </p>
              <p className="text-xs text-slate-400">
                Artikel pertama akan muncul otomatis minggu depan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {articles.map((article, i) => (
                <Link
                  key={article.id}
                  href={`/artikel/${article.slug}`}
                  className="group flex flex-col bg-white border border-slate-100 rounded-xl p-5 hover:border-emerald-200 hover:shadow-md transition-all duration-200"
                >
                  {/* Nomor + Tanggal */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {formatDate(article.published_at)}
                    </span>
                    <span className="text-xs font-black text-slate-100 group-hover:text-emerald-100 transition-colors tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors mb-2 leading-snug flex-1">
                    {article.title}
                  </h2>

                  {/* Summary */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
                    {article.summary}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(article.total_reports ?? 0) > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        {article.total_reports} laporan
                      </span>
                    )}
                    {(article.total_loss ?? 0) > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                        {formatLoss(article.total_loss!)}
                      </span>
                    )}
                    {article.top_category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                        {article.top_category}
                      </span>
                    )}
                  </div>

                  {/* Tombol */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 group-hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest transition-colors self-start">
                    Baca Artikel →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}