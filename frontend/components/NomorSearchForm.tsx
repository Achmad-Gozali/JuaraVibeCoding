'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { encodeSlug } from '@/lib/utils';

const BACKEND_URL = (() => {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!url) throw new Error('NEXT_PUBLIC_BACKEND_URL is not defined');
  return url;
})();

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

export default function NomorSearchForm() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const resetTurnstile = useCallback(() => {
    setTurnstileToken(null);
    setTurnstileKey((prev) => prev + 1);
  }, []);

  const handleSuccess = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleaned = query.replace(/\D/g, '');
    if (!cleaned || cleaned.length < 5) {
      setError('Masukkan nomor yang valid (minimal 5 digit).');
      return;
    }
    if (!turnstileToken) {
      setError('Selesaikan verifikasi keamanan terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/search/verify-turnstile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const data = (await res.json()) as { success: boolean; message?: string };

      if (!data.success) {
        setError(data.message ?? 'Verifikasi keamanan gagal. Coba lagi.');
        resetTurnstile();
        setLoading(false);
        return;
      }

      router.push(`/check/${encodeSlug(cleaned)}?type=phone`);
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
      resetTurnstile();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-lg space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            value={query}
            onChange={(e) => setQuery(e.target.value.replace(/\D/g, ''))}
            placeholder="Contoh: 081234567890"
            maxLength={15}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !turnstileToken}
          className="px-5 py-3 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cek'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}

      {TURNSTILE_SITE_KEY && (
        <Turnstile
          key={turnstileKey}
          siteKey={TURNSTILE_SITE_KEY}
          onSuccess={handleSuccess}
          onExpire={resetTurnstile}
          onError={resetTurnstile}
          options={{ theme: 'light', size: 'normal' }}
        />
      )}
    </form>
  );
}