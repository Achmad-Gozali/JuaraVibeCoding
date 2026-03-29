'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Loader2, ArrowRight } from 'lucide-react';
import { toSlug } from '@/lib/utils';

export default function NomorSearchForm() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    router.push(`/check/${toSlug(query)}`);
  };

  const examples = ['08123456789', '081234567890', '08571234567'];

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-blue-100/60 border border-zinc-200 p-1.5 focus-within:border-blue-300 transition-all">
        <div className="absolute left-4 pointer-events-none">
          <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-400" />
        </div>
        <input
          type="tel"
          value={query}
          onChange={(e) => setQuery(e.target.value.replace(/[^0-9\s\-+]/g, ''))}
          placeholder="Contoh: 08123456789"
          className="flex-grow pl-10 sm:pl-12 pr-3 py-3 sm:py-4 bg-transparent placeholder-zinc-400 focus:outline-none text-sm sm:text-base font-medium text-zinc-900"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-4 sm:px-6 py-2.5 sm:py-3.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all flex items-center gap-1.5 sm:gap-2 disabled:opacity-40 active:scale-95 shrink-0"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>Cek <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></>
          )}
        </button>
      </div>

      <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-2">
        <span className="text-[11px] text-zinc-400 font-medium self-center mr-1">Coba:</span>
        {examples.map((num) => (
          <button key={num} type="button" onClick={() => setQuery(num)}
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95"
          >
            {num}
          </button>
        ))}
      </div>
    </form>
  );
}