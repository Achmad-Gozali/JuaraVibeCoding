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

        {/* Stats badges */}
        {(article.top_category || article.top_platform || article.top_bank) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {article.top_category && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Modus: {article.top_category}
              </span>
            )}
            {article.top_platform && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Platform: {article.top_platform}
              </span>
            )}
            {article.top_bank && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                Bank: {article.top_bank}
              </span>
            )}
          </div>
        )}

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
        <div className="mt-10 p-5 sm:p-6 bg-slate-900 rounded-xl">
          <p className="text-sm sm:text-base font-bold text-white mb-1">
            Mau cek nomor sebelum transaksi?
          </p>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Lindungi diri kamu dari penipuan — gratis dan berbasis laporan komunitas.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/cek-nomor"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors uppercase tracking-widest"
            >
              Cek Nomor HP
            </Link>
            <Link
              href="/cek-rekening"
              className="px-4 py-2.5 border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white text-xs font-bold rounded-lg transition-colors uppercase tracking-widest"
            >
              Cek Rekening
            </Link>
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