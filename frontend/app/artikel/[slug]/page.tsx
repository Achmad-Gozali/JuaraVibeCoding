import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('articles')
    .select('title, summary')
    .eq('slug', slug)
    .single();

  if (!data) return { title: 'Artikel tidak ditemukan - KawalTransaksi' };

  return {
    title: `${data.title} - KawalTransaksi`,
    description: data.summary,
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatLoss(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
  }).format(amount);
}

export default async function ArtikelDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!article) notFound();

  const { data: others } = await supabase
    .from('articles')
    .select('title, slug, published_at')
    .neq('slug', slug)
    .order('published_at', { ascending: false })
    .limit(3);

  return (
    <main className="bg-white min-h-screen font-sans">

      {/* Back */}
      <div className="px-4 pt-5 max-w-3xl mx-auto">
        <Link
          href="/artikel"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
        >
          ← Semua Artikel
        </Link>
      </div>

      {/* Header artikel */}
      <section className="px-4 pt-5 pb-8 max-w-3xl mx-auto">

        {/* Meta */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {formatDate(article.published_at)}
          </span>
          {(article.total_reports ?? 0) > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              {article.total_reports} laporan masuk
            </span>
          )}
          {(article.total_loss ?? 0) > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
              {formatLoss(article.total_loss!)} kerugian
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-slate-900 mb-5 leading-tight">
          {article.title}
        </h1>

        <div className="h-px bg-slate-100 mb-7" />

        {/* Konten artikel */}
        <div className="space-y-5">
          {article.content.split('\n\n').map((paragraph: string, i: number) => (
            <p key={i} className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl overflow-hidden border border-slate-200">
          <div className="bg-slate-900 px-6 py-7 sm:px-8 sm:py-8">
            {/* Label */}
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
              Verifikasi Sebelum Bertransaksi
            </p>

            {/* Headline */}
            <p className="text-lg sm:text-xl font-black text-white leading-snug mb-2">
              Jangan jadi korban berikutnya.
            </p>

            {/* Subtext */}
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6 max-w-md">
              Periksa nomor HP atau rekening bank sebelum melakukan transfer.
              Database kami dibangun dari laporan nyata komunitas — gratis, tanpa registrasi.
            </p>

            {/* Buttons — full width di mobile */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/cek-nomor"
                className="flex-1 sm:flex-none text-center px-5 py-3 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors uppercase tracking-widest"
              >
                Cek Nomor HP
              </Link>
              <Link
                href="/cek-rekening"
                className="flex-1 sm:flex-none text-center px-5 py-3 bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-colors uppercase tracking-widest"
              >
                Cek Rekening Bank
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* Artikel lainnya */}
      {others && others.length > 0 && (
        <section className="px-4 py-8 border-t border-slate-100">
          <div className="max-w-3xl mx-auto">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Artikel lainnya
            </p>
            <div className="divide-y divide-slate-100">
              {others.map((other) => (
                <Link
                  key={other.slug}
                  href={`/artikel/${other.slug}`}
                  className="flex items-center justify-between py-3.5 hover:text-emerald-600 transition-colors group"
                >
                  <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors leading-snug pr-4">
                    {other.title}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatDate(other.published_at)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}